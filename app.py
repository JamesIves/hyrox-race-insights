"""
Hyrox Race Insights ✨

Fetches Hyrox race data and displays comprehensive terminal-based
visualizations comparing an athlete's performance to field averages.

Built by Jives (https://Jives.dev) with pyrox-client (https://vmatei2.github.io/pyrox-client/) 

Environment Variables:
    HYROX_SEASON: Race season (default: "8")
    HYROX_LOCATION: Race location, locations with two words should be hyphenated (default: "Stockholm")
    HYROX_YEAR: Race year, useful when a location hosted races across multiple years in a season (default: None)
    HYROX_GENDER: Athlete gender (default: "male")
    HYROX_DIVISION: Race division (default: "open")
    HYROX_ATHLETE: Athlete name as it appears on the Hyrox results board, typically "Last, First" format. Can also be "First Last, First Last" for doubles (default: "Smith, John")
    HYROX_AGE_GROUP: Filter results to a specific age group e.g. "25-29", "30-34" (default: None – all age groups)
    HYROX_TOTAL_TIME: Filter athletes by total race time in minutes. Single value for max, or "min,max" for a range e.g. "60,90" (default: None)
    HYROX_HEART_RATE_FILE: Path to the heart rate CSV file (default: "heart_rate.csv")
"""

import json
import os
from typing import Optional

import pandas as pd
import pyrox
from rich.console import Console
from rich.table import Table

# ISO 3166-1 alpha-3 country code to flag emoji mapping
COUNTRY_FLAGS: dict[str, str] = {
    "AFG": "🇦🇫", "ALB": "🇦🇱", "ALG": "🇩🇿", "AND": "🇦🇩", "ANG": "🇦🇴",
    "ANT": "🇦🇬", "ARG": "🇦🇷", "ARM": "🇦🇲", "AUS": "🇦🇺", "AUT": "🇦🇹",
    "AZE": "🇦🇿", "BAH": "🇧🇸", "BAN": "🇧🇩", "BAR": "🇧🇧", "BDI": "🇧🇮",
    "BEL": "🇧🇪", "BEN": "🇧🇯", "BER": "🇧🇲", "BHU": "🇧🇹", "BIH": "🇧🇦",
    "BLR": "🇧🇾", "BOL": "🇧🇴", "BOT": "🇧🇼", "BRA": "🇧🇷", "BRN": "🇧🇭",
    "BRU": "🇧🇳", "BUL": "🇧🇬", "BUR": "🇧🇫", "CAM": "🇰🇭", "CAN": "🇨🇦",
    "CAY": "🇰🇾", "CGO": "🇨🇬", "CHA": "🇹🇩", "CHI": "🇨🇱", "CHN": "🇨🇳",
    "CIV": "🇨🇮", "CMR": "🇨🇲", "COD": "🇨🇩", "COL": "🇨🇴", "COM": "🇰🇲",
    "CPV": "🇨🇻", "CRC": "🇨🇷", "CRO": "🇭🇷", "CUB": "🇨🇺", "CYP": "🇨🇾",
    "CZE": "🇨🇿", "DEN": "🇩🇰", "DJI": "🇩🇯", "DMA": "🇩🇲", "DOM": "🇩🇴",
    "ECU": "🇪🇨", "EGY": "🇪🇬", "ERI": "🇪🇷", "ESA": "🇸🇻", "ESP": "🇪🇸",
    "EST": "🇪🇪", "ETH": "🇪🇹", "FIJ": "🇫🇯", "FIN": "🇫🇮", "FRA": "🇫🇷",
    "GAB": "🇬🇦", "GAM": "🇬🇲", "GBR": "🇬🇧", "GEO": "🇬🇪", "GER": "🇩🇪",
    "GHA": "🇬🇭", "GRE": "🇬🇷", "GRN": "🇬🇩", "GUA": "🇬🇹", "GUI": "🇬🇳",
    "GUM": "🇬🇺", "GUY": "🇬🇾", "HAI": "🇭🇹", "HKG": "🇭🇰", "HON": "🇭🇳",
    "HUN": "🇭🇺", "INA": "🇮🇩", "IND": "🇮🇳", "IRI": "🇮🇷", "IRL": "🇮🇪",
    "IRQ": "🇮🇶", "ISL": "🇮🇸", "ISR": "🇮🇱", "ISV": "🇻🇮", "ITA": "🇮🇹",
    "JAM": "🇯🇲", "JOR": "🇯🇴", "JPN": "🇯🇵", "KAZ": "🇰🇿", "KEN": "🇰🇪",
    "KGZ": "🇰🇬", "KOR": "🇰🇷", "KOS": "🇽🇰", "KSA": "🇸🇦", "KUW": "🇰🇼",
    "LAO": "🇱🇦", "LAT": "🇱🇻", "LBA": "🇱🇾", "LBN": "🇱🇧", "LBR": "🇱🇷",
    "LCA": "🇱🇨", "LES": "🇱🇸", "LIE": "🇱🇮", "LTU": "🇱🇹", "LUX": "🇱🇺",
    "MAD": "🇲🇬", "MAR": "🇲🇦", "MAS": "🇲🇾", "MAW": "🇲🇼", "MDA": "🇲🇩",
    "MDV": "🇲🇻", "MEX": "🇲🇽", "MGL": "🇲🇳", "MKD": "🇲🇰", "MLI": "🇲🇱",
    "MLT": "🇲🇹", "MNE": "🇲🇪", "MON": "🇲🇨", "MOZ": "🇲🇿", "MRI": "🇲🇺",
    "MTN": "🇲🇷", "MYA": "🇲🇲", "NAM": "🇳🇦", "NCA": "🇳🇮", "NED": "🇳🇱",
    "NEP": "🇳🇵", "NGR": "🇳🇬", "NIG": "🇳🇪", "NOR": "🇳🇴", "NZL": "🇳🇿",
    "OMA": "🇴🇲", "PAK": "🇵🇰", "PAN": "🇵🇦", "PAR": "🇵🇾", "PER": "🇵🇪",
    "PHI": "🇵🇭", "PLE": "🇵🇸", "PLW": "🇵🇼", "PNG": "🇵🇬", "POL": "🇵🇱",
    "POR": "🇵🇹", "PRK": "🇰🇵", "PUR": "🇵🇷", "QAT": "🇶🇦", "ROU": "🇷🇴",
    "RSA": "🇿🇦", "RUS": "🇷🇺", "RWA": "🇷🇼", "SAM": "🇼🇸", "SEN": "🇸🇳",
    "SIN": "🇸🇬", "SKN": "🇰🇳", "SLE": "🇸🇱", "SLO": "🇸🇮", "SMR": "🇸🇲",
    "SOL": "🇸🇧", "SOM": "🇸🇴", "SRB": "🇷🇸", "SRI": "🇱🇰", "STP": "🇸🇹",
    "SUD": "🇸🇩", "SUI": "🇨🇭", "SUR": "🇸🇷", "SVK": "🇸🇰", "SWE": "🇸🇪",
    "SWZ": "🇸🇿", "SYR": "🇸🇾", "TAN": "🇹🇿", "TGA": "🇹🇴", "THA": "🇹🇭",
    "TJK": "🇹🇯", "TKM": "🇹🇲", "TLS": "🇹🇱", "TOG": "🇹🇬", "TPE": "🇹🇼",
    "TTO": "🇹🇹", "TUN": "🇹🇳", "TUR": "🇹🇷", "TUV": "🇹🇻", "UAE": "🇦🇪",
    "UGA": "🇺🇬", "UKR": "🇺🇦", "URU": "🇺🇾", "USA": "🇺🇸", "UZB": "🇺🇿",
    "VAN": "🇻🇺", "VEN": "🇻🇪", "VIE": "🇻🇳", "YEM": "🇾🇪", "ZAM": "🇿🇲",
    "ZIM": "🇿🇼",
}


class HyroxRaceInsights:
    """Analyses Hyrox race data and generates performance insights."""

    # --- Display constants ---
    PERF_STRONG_THRESHOLD = 105
    PERF_SLIGHT_THRESHOLD = 100
    PERF_AVERAGE_THRESHOLD = 95
    PERF_BAR_SCALE = 2.5

    PERCENTILE_EXCELLENT = 25
    PERCENTILE_GOOD = 50
    PERCENTILE_FAIR = 75
    PERCENTILE_BAR_SCALE = 5

    HEATMAP_BAR_SCALE = 10
    MOMENTUM_BAR_WIDTH = 25
    HR_BAR_WIDTH = 30
    OPPORTUNITY_BAR_WIDTH = 25
    SPLIT_BAR_SCALE = 5

    TOP_N_OPPORTUNITIES = 3
    TOP_N_SPIKES = 3

    HR_REQUIRED_COLUMNS = ("Avg (count/min)", "Max (count/min)")

    # All events in race order (Run, Station, Run, Station, ...)
    ALL_EVENTS: dict[str, str] = {
        "run1_time": "Run 1",
        "skiErg_time": "SkiErg",
        "run2_time": "Run 2",
        "sledPush_time": "Sled Push",
        "run3_time": "Run 3",
        "sledPull_time": "Sled Pull",
        "run4_time": "Run 4",
        "burpeeBroadJump_time": "Burpee Broad Jump",
        "run5_time": "Run 5",
        "rowErg_time": "RowErg",
        "run6_time": "Run 6",
        "farmersCarry_time": "Farmer's Carry",
        "run7_time": "Run 7",
        "sandbagLunges_time": "Sandbag Lunges",
        "run8_time": "Run 8",
        "wallBalls_time": "Wall Balls",
        "roxzone_time": "Roxzone",
    }

    # Derived subsets
    RUN_FIELDS: set[str] = {key for key in ALL_EVENTS if key.startswith("run")}

    def __init__(
        self,
        season: int,
        location: str,
        gender: str,
        division: str,
        athlete_name: str,
        output_dir: str = "data",
        year: Optional[int] = None,
        age_group: Optional[str] = None,
        total_time: Optional[float | tuple[float | None, float | None]] = None,
        heart_rate_file: str = "heart_rate.csv",
    ):
        """
        Initialize the Analyser with race parameters.

        Args:
            season: Race season number
            location: Race location
            gender: Athlete gender category
            division: Division category
            athlete_name: Athlete name for comparison
            output_dir: Directory to save JSON output files
            year: Optional race year filter
            age_group: Optional age group filter (e.g. "25-29")
            total_time: Optional total time filter (max minutes, or (min, max) tuple)
            heart_rate_file: Path to heart rate CSV file
        """
        self.season = season
        self.location = location
        self.gender = gender
        self.division = division
        self.athlete_name = athlete_name
        self.output_dir = output_dir
        self.year = year
        self.age_group = age_group
        self.total_time = total_time
        self.heart_rate_file = heart_rate_file
        self.console = Console()

        # Data storage
        self.race_records: list[dict[str, object]] = []
        self.athlete_record: Optional[dict[str, object]] = None
        self.averages: dict[str, float] = {}
        self.heatmap_data: list[tuple[str, float, float]] = []
        self.heart_rate_data: Optional[pd.DataFrame] = None
        self.total_race_time: float = 0.0
        self._hr_avg_values: list[float] = []
        self._hr_max_values: list[float] = []

    def fetch_data(self) -> None:
        """Fetch race data from Pyrox API."""
        fetch_label = f"Fetching Season {self.season}"
        if self.year is not None:
            fetch_label += f" ({self.year})"
        fetch_label += f" {self.location} ({self.gender.capitalize()} {self.division.capitalize()})"
        if self.age_group:
            fetch_label += f" [Age Group: {self.age_group}]"
        if self.total_time is not None:
            if isinstance(self.total_time, tuple):
                min_time, max_time = self.total_time
                if min_time is not None and max_time is not None:
                    fetch_label += f" [Time: {min_time:.0f}-{max_time:.0f}m]"
                elif min_time is not None:
                    fetch_label += f" [Time: ≥{min_time:.0f}m]"
                elif max_time is not None:
                    fetch_label += f" [Time: ≤{max_time:.0f}m]"
            else:
                fetch_label += f" [Time: ≤{self.total_time:.0f}m]"
        fetch_label += "..."

        self.console.print(fetch_label, style="bold cyan")
        self.console.print()

        client = pyrox.PyroxClient()
        race_params: dict[str, object] = {
            "season": self.season,
            "location": self.location,
            "gender": self.gender,
            "division": self.division,
        }
        if self.year is not None:
            race_params["year"] = self.year
        if self.total_time is not None:
            race_params["total_time"] = self.total_time

        race = client.get_race(**race_params)

        self.race_records = race.to_dict(orient="records")

        if self.age_group:
            self.race_records = [
                record for record in self.race_records
                if str(record.get("age_group", "")).lower() == self.age_group.lower()
            ]

        self._find_athlete()
        self._calculate_averages()
        self._load_heart_rate_data()

    def _find_athlete(self) -> None:
        """Locate athlete record in race data."""
        for record in self.race_records:
            if str(record.get("name", "")).lower() == self.athlete_name.lower():
                self.athlete_record = record
                break

        if not self.athlete_record:
            self.console.print(
                f"[yellow]WARNING:[/yellow] Athlete '{self.athlete_name}' not found "
                "in race data.",
                style="bold",
            )

    def _calculate_averages(self) -> None:
        """Calculate field average times for each event."""
        # Build {field: average_time} for every event that has at least one recorded time.
        # The walrus operator (:=) assigns the filtered list to `times` and checks it's non-empty.
        self.averages = {
            field: sum(times) / len(times)
            for field in self.ALL_EVENTS
            if (times := [record[field] for record in self.race_records if record.get(field) is not None])
        }

    def _load_heart_rate_data(self) -> None:
        """Load heart rate data from CSV if it exists."""
        heart_rate_file = self.heart_rate_file
        if not os.path.exists(heart_rate_file):
            return

        try:
            heart_rate_df = pd.read_csv(heart_rate_file)
        except (pd.errors.ParserError, pd.errors.EmptyDataError, OSError) as error:
            self.console.print(
                f"[yellow]Warning:[/yellow] Could not read heart rate CSV: {error}",
                style="dim",
            )
            return

        missing_columns = [column for column in self.HR_REQUIRED_COLUMNS if column not in heart_rate_df.columns]
        if missing_columns:
            self.console.print(
                f"[yellow]Warning:[/yellow] Heart rate CSV missing columns: {', '.join(missing_columns)}",
                style="dim",
            )
            return

        self.heart_rate_data = heart_rate_df

        if self.athlete_record and "total_time" in self.athlete_record:
            self.total_race_time = self.athlete_record["total_time"]

        self._parse_heart_rate_columns()

    def _parse_heart_rate_columns(self) -> None:
        """Parse and trim heart rate columns to race duration."""
        if self.heart_rate_data is None:
            return

        for column, target in [
            ("Avg (count/min)", "_hr_avg_values"),
            ("Max (count/min)", "_hr_max_values"),
        ]:
            values = pd.to_numeric(
                self.heart_rate_data[column], errors="coerce"
            ).dropna().tolist()
            if self.total_race_time > 0:
                values = values[: int(self.total_race_time) + 1]
            setattr(self, target, values)

    def display_summary_tables(self) -> None:
        """Display per-station averages and athlete comparison tables."""
        self._display_field_averages_table()
        if self.athlete_record:
            self._display_athlete_comparison_table()

    def _display_field_averages_table(self) -> None:
        """Show field average times for each event."""
        table = Table(
            title=(
                f"Per-Event Averages - {self.location} Season {self.season} "
                f"({self.gender.capitalize()} {self.division.capitalize()})"
            )
        )
        table.add_column("Event", style="cyan")
        table.add_column("Average Time", style="magenta")
        table.add_column("Min", style="green")
        table.add_column("Max", style="red")

        for field, event_name in self.ALL_EVENTS.items():
            times = [record[field] for record in self.race_records if record.get(field) is not None]
            if times:
                table.add_row(
                    event_name,
                    f"{sum(times) / len(times):.2f}m",
                    f"{min(times):.2f}m",
                    f"{max(times):.2f}m",
                )

        self.console.print(table)
        self.console.print()

    def _get_athlete_display_name(self) -> str:
        """Return athlete name with nationality flag(s) if available.

        Supports doubles where nationality is comma-separated (e.g. "USA, GBR")
        and names are comma-separated (e.g. "Jane Doe, John Smith").
        """
        if self.athlete_record:
            nationalities = [
                n.strip().upper()
                for n in str(self.athlete_record.get("nationality", "")).split(",")
                if n.strip()
            ]
            names = [n.strip() for n in self.athlete_name.split(",") if n.strip()]
            parts = []
            for i, name in enumerate(names):
                flag = COUNTRY_FLAGS.get(nationalities[i], "") if i < len(nationalities) else ""
                parts.append(f"{flag} {name}" if flag else name)
            return ", ".join(parts)
        return self.athlete_name

    def _display_athlete_comparison_table(self) -> None:
        """Show athlete times vs field averages."""
        table = Table(title=f"Athlete Comparison - {self._get_athlete_display_name()}")
        table.add_column("Event", style="cyan")
        table.add_column("Your Time", style="yellow")
        table.add_column("Field Avg", style="magenta")
        table.add_column("Delta", style="white")
        table.add_column("vs Avg %", style="white")

        for field, event_name in self.ALL_EVENTS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta = athlete_time - avg_time
                delta_pct = (delta / avg_time) * 100
                color = self._delta_color(delta)
                table.add_row(
                    event_name,
                    f"{athlete_time:.2f}m",
                    f"{avg_time:.2f}m",
                    f"[{color}]{delta:+.2f}m[/{color}]",
                    f"[{color}]{delta_pct:+.1f}%[/{color}]",
                )

        self.console.print(table)
        self.console.print()

    def display_visualizations(self) -> None:
        """Generate and display all analytics visualizations."""
        if not self.athlete_record:
            self.console.print(
                "[red]Cannot display visualizations - athlete not found.[/red]"
            )
            return

        self.console.print()
        self.console.print("[bold magenta]━━━ PERFORMANCE ANALYTICS ━━━[/bold magenta]")
        self.console.print()

        self._display_performance_index()
        self._display_heatmap()
        self._display_cumulative_delta()
        self._display_split_analysis()
        self._display_opportunities()
        self._display_percentiles()
        if self.heart_rate_data is not None:
            self._display_heart_rate_analytics()

    def _display_performance_index(self) -> None:
        """Show normalized performance index (>100 = faster than average)."""
        self.console.print(
            "[bold yellow]1. PERFORMANCE INDEX[/bold yellow] — "
            "Normalized Performance (100 = Field Average)",
        )
        self.console.print(
            "   [dim]Scores > 100 indicate faster performance. "
            "Compare strengths and weaknesses at a glance.[/dim]"
        )
        self.console.print()

        # For each event, compute: (field_avg / athlete_time) * 100
        # A score > 100 means the athlete was faster than the field average.
        perf_data = [
            (name, (avg_time / athlete_time) * 100)
            for field, name in self.ALL_EVENTS.items()
            if (athlete_time := self.athlete_record.get(field))
            and (avg_time := self.averages.get(field))
            and athlete_time > 0
        ]

        # Display strongest events first (highest index = fastest relative to field)
        for event_name, index in sorted(perf_data, key=lambda x: x[1], reverse=True):
            bar = self._make_bar(index / self.PERF_BAR_SCALE)
            status = self._perf_status(index)
            self.console.print(f"  {event_name:20} {status} {bar} {index:6.1f}")

        self.console.print()

    def _display_heatmap(self) -> None:
        """Show per-event delta vs field average."""
        self.console.print(
            "[bold yellow]2. WHERE YOU GAIN/LOSE TIME[/bold yellow] — "
            "Per-Event Delta vs Field Average",
        )
        self.console.print(
            "   [dim]Red = Losing time relative to field average. "
            "Green = Gaining time. Focus on red events to improve.[/dim]"
        )
        self.console.print()

        # Each entry is (event_name, delta_seconds, delta_percent)
        self.heatmap_data = self._compute_event_deltas()
        faster = sum(1 for _, delta, _ in self.heatmap_data if delta < 0)
        slower = len(self.heatmap_data) - faster
        total_delta = sum(delta for _, delta, _ in self.heatmap_data)

        # Summary line
        color = self._delta_color(total_delta)
        symbol = "✓" if total_delta < 0 else "✗"
        self.console.print(
            f"  Faster: [green]{faster} events[/green] | "
            f"Slower: [red]{slower} events[/red] | "
            f"Net: [{color}]{symbol} {total_delta:+.0f}s[/{color}]"
        )
        self.console.print()

        # Heatmap rows sorted by delta (biggest time savings first)
        for event_name, delta_sec, delta_pct in sorted(self.heatmap_data, key=lambda x: x[1]):
            color = self._delta_color(delta_sec)
            symbol = "✓" if delta_sec < 0 else "✗"
            bar = self._make_bar(abs(delta_sec) / self.HEATMAP_BAR_SCALE)

            self.console.print(
                f"  {event_name:20} [{color}]{symbol}[/{color}] "
                f"[dim]{bar}[/dim] {delta_sec:+6.0f}s ({delta_pct:+6.1f}%)"
            )

        self.console.print()

    def _display_cumulative_delta(self) -> None:
        """Show cumulative time delta progression through the race."""
        self.console.print(
            "[bold yellow]3. RACE MOMENTUM[/bold yellow] — "
            "Running Total: Ahead or Behind the Field",
        )
        self.console.print(
            "   [dim]Each row shows how that event shifted your gap vs the field, "
            "and your running total. Green = ahead, Red = behind.[/dim]"
        )
        self.console.print()

        cumulative_data: list[tuple[str, float, float]] = []
        running = 0.0

        for field, event_name in self.ALL_EVENTS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta = (athlete_time - avg_time) * 60
                running += delta
                cumulative_data.append((event_name, delta, running))

        if not cumulative_data:
            return

        # Largest absolute running total, used to scale bar widths (fallback to 1 to avoid division by zero)
        max_abs = max(abs(total) for _, _, total in cumulative_data) or 1

        for event_name, event_delta, running_total in cumulative_data:
            bar_length = int((abs(running_total) / max_abs) * self.MOMENTUM_BAR_WIDTH)
            color = self._delta_color(running_total)
            bar = "█" * max(bar_length, 1)

            shift_color = self._delta_color(event_delta)
            shift_str = f"[{shift_color}]{event_delta:+.0f}s[/{shift_color}]"

            total_label = "ahead" if running_total < 0 else "behind"
            total_str = f"[{color}]{abs(running_total):.0f}s {total_label}[/{color}]"

            self.console.print(
                f"  {event_name:20} [{color}]{bar}[/{color}] "
                f"{shift_str:>20}  →  {total_str}"
            )

        self.console.print()

    def _display_split_analysis(self) -> None:
        """Show where time delta comes from: Runs vs Stations."""
        self.console.print(
            "[bold yellow]4. WHERE DELTA COMES FROM[/bold yellow] — Runs vs Stations Split",
        )
        self.console.print(
            "   [dim]Breakdown: Are you slower on runs or at stations? "
            "This identifies your weakest area.[/dim]"
        )
        self.console.print()

        run_delta = 0.0
        station_delta = 0.0

        for field, event_name in self.ALL_EVENTS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta_seconds = (athlete_time - avg_time) * 60
                if field in self.RUN_FIELDS:
                    run_delta += delta_seconds
                else:
                    station_delta += delta_seconds

        total_delta = abs(run_delta) + abs(station_delta)

        if total_delta > 0:
            run_pct = abs(run_delta) / total_delta * 100
            station_pct = abs(station_delta) / total_delta * 100

            self.console.print(
                f"  Runs:     [yellow]{run_pct:5.0f}%[/yellow] ({run_delta:+7.0f}s) "
                f"{self._make_bar(run_pct / self.SPLIT_BAR_SCALE)}"
            )
            self.console.print(
                f"  Stations: [yellow]{station_pct:5.0f}%[/yellow] ({station_delta:+7.0f}s) "
                f"{self._make_bar(station_pct / self.SPLIT_BAR_SCALE)}"
            )

        self.console.print()

    def _display_opportunities(self) -> None:
        """Show top 3 events where athlete lost the most time."""
        self.console.print(
            "[bold yellow]5. BIGGEST OPPORTUNITIES[/bold yellow] — "
            "Events Where You Lost the Most Time",
        )
        self.console.print(
            "   [dim]Focus on these events to make the biggest performance gains.[/dim]"
        )
        self.console.print()

        # Filter to events where the athlete was slower, sorted by biggest time loss first
        opportunities = sorted(
            [(name, delta, pct) for name, delta, pct in self.heatmap_data if delta > 0],
            key=lambda x: x[1],
            reverse=True,
        )

        if opportunities:
            max_delta = opportunities[0][1]
            for i, (event_name, delta_sec, delta_pct) in enumerate(
                opportunities[: self.TOP_N_OPPORTUNITIES], 1
            ):
                bar = self._make_bar(
                    (delta_sec / max_delta) * self.OPPORTUNITY_BAR_WIDTH
                )
                self.console.print(
                    f"  {i}. {event_name:20} [red]{bar}[/red] "
                    f"[red bold]+{delta_sec:.0f}s[/red bold] ({delta_pct:+.1f}%)"
                )
        else:
            self.console.print(
                "  [green bold]✓ No positive gaps found — great pacing across events![/green bold]"
            )

        self.console.print()

    def _display_percentiles(self) -> None:
        """Show athlete's percentile ranking for each station."""
        self.console.print(
            "[bold yellow]6. PER-EVENT PERCENTILE[/bold yellow] — Your Placement in the Field",
        )
        self.console.print(
            "   [dim]Your ranking at each station. Lower percentile = faster than average.[/dim]"
        )
        self.console.print()

        # Build (event_name, percentile) pairs, skipping events without data
        percentile_data = [
            (name, self._calculate_percentile(field))
            for field, name in self.ALL_EVENTS.items()
            if self.athlete_record.get(field) is not None
            and self._calculate_percentile(field) is not None
        ]

        # Show best percentiles (fastest relative to field) first
        for event_name, percentile in sorted(percentile_data, key=lambda x: x[1]):
            bar = self._make_bar(percentile / self.PERCENTILE_BAR_SCALE)
            color = self._percentile_color(percentile)
            ranking = self._percentile_label(percentile)

            self.console.print(
                f"  {event_name:20} [{color}]{bar}[/{color}] "
                f"{percentile:5.0f}th percentile ({ranking})"
            )

        self.console.print()

    def _display_heart_rate_analytics(self) -> None:
        """Display heart rate analytics if available."""
        self.console.print()
        self.console.print("[bold magenta]━━━ HEART RATE ANALYTICS ━━━[/bold magenta]")
        self.console.print()

        self._display_heart_rate_per_station()
        self._display_heart_rate_spikes()

    def _display_heart_rate_per_station(self) -> None:
        """Show average heart rate per event."""
        if not self._hr_avg_values:
            return

        self.console.print(
            "[bold yellow]1. HEART RATE BY STATION[/bold yellow] — Average HR During Each Event",
        )
        self.console.print(
            "   [dim]Understanding intensity: Higher HR = more intense effort.[/dim]"
        )
        self.console.print()

        event_hr_data = self._hr_per_event(self._hr_avg_values, self._hr_max_values)

        if event_hr_data:
            # Scale bars relative to the highest average heart rate across events
            max_avg_hr = max(heart_rate for _, heart_rate, _ in event_hr_data)

            # Display highest average HR events first
            for event_name, avg_hr, max_hr in sorted(
                event_hr_data, key=lambda x: x[1], reverse=True
            ):
                bar = self._make_bar(
                    (avg_hr / max_avg_hr) * self.HR_BAR_WIDTH
                )
                self.console.print(
                    f"  {event_name:20} {bar} [yellow]Avg: {avg_hr:.0f}[/yellow] bpm "
                    f"[red](peak: {max_hr:.0f})[/red]"
                )

        self.console.print()

    def _display_heart_rate_spikes(self) -> None:
        """Show where heart rate spiked the most."""
        if not self._hr_max_values:
            return

        self.console.print(
            "[bold yellow]2. HEART RATE SPIKES[/bold yellow] — Peak Exertion Moments",
        )
        self.console.print(
            "   [dim]Identify which events caused the most intense cardiovascular effort.[/dim]"
        )
        self.console.print()

        spike_data = self._hr_per_event(self._hr_avg_values, self._hr_max_values)

        if spike_data:
            # Sort by peak HR (third tuple element) and take the top N
            top_spikes = sorted(
                spike_data, key=lambda x: x[2], reverse=True
            )[: self.TOP_N_SPIKES]

            # Scale bars relative to the highest average HR across all events
            max_peak_hr = max(heart_rate for _, heart_rate, _ in spike_data)

            for i, (event_name, _, peak_hr) in enumerate(top_spikes, 1):
                bar = self._make_bar(
                    (peak_hr / max_peak_hr) * self.HR_BAR_WIDTH
                )
                self.console.print(
                    f"  {i}. [red bold]{event_name:20}[/red bold] [red]{bar}[/red] "
                    f"[red bold]Peak: {peak_hr:.0f}[/red bold] bpm"
                )

        self.console.print()

    # --- Helper methods ---

    @staticmethod
    def _delta_color(value: float) -> str:
        """Return 'green' for negative/zero deltas, 'red' for positive."""
        return "green" if value <= 0 else "red"

    @staticmethod
    def _make_bar(length: float) -> str:
        """Generate a block-character bar of the given length."""
        return "█" * max(int(length), 0)

    def _perf_status(self, index: float) -> str:
        """Return a Rich-formatted status icon for a performance index score."""
        if index > self.PERF_STRONG_THRESHOLD:
            return "[green]▲▲[/green]"
        if index > self.PERF_SLIGHT_THRESHOLD:
            return "[green]▲[/green]"
        if index > self.PERF_AVERAGE_THRESHOLD:
            return "[yellow]~[/yellow]"
        return "[red]▼[/red]"

    def _percentile_color(self, percentile: float) -> str:
        """Return a color string for a percentile value."""
        if percentile < self.PERCENTILE_EXCELLENT:
            return "green"
        if percentile < self.PERCENTILE_GOOD:
            return "yellow"
        return "red"

    @staticmethod
    def _percentile_label(percentile: float) -> str:
        """Return a human-readable ranking label."""
        if percentile <= 50:
            return f"Top {percentile:.0f}%"
        return f"Bottom {100 - percentile:.0f}%"

    def _calculate_percentile(self, field: str) -> Optional[float]:
        """Calculate the athlete's percentile for a single event field."""
        athlete_time = self.athlete_record.get(field)
        if athlete_time is None:
            return None
        times = [record[field] for record in self.race_records if record.get(field) is not None]
        if not times:
            return None
        # Count how many athletes were faster → convert to a 0–100 percentile
        faster_count = sum(1 for time in times if time < athlete_time)
        return (faster_count / len(times)) * 100

    def _compute_event_deltas(self) -> list[tuple[str, float, float]]:
        """Compute per-event delta (seconds) and delta percentage vs field average."""
        deltas: list[tuple[str, float, float]] = []
        for field, event_name in self.ALL_EVENTS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta_sec = (athlete_time - avg_time) * 60
                delta_pct = ((athlete_time - avg_time) / avg_time) * 100
                deltas.append((event_name, delta_sec, delta_pct))
        return deltas

    def _hr_per_event(
        self, avg_values: list[float], max_values: list[float]
    ) -> list[tuple[str, float, float]]:
        """Map heart rate data to events based on cumulative time."""
        results: list[tuple[str, float, float]] = []
        cumulative_time = 0

        if not self.athlete_record:
            return results

        for field, event_name in self.ALL_EVENTS.items():
            event_time = self.athlete_record.get(field)
            if event_time is None:
                continue

            start_idx = int(cumulative_time)
            end_idx = int(cumulative_time + event_time)
            cumulative_time += event_time

            if start_idx >= len(avg_values) or end_idx > len(avg_values):
                continue

            event_avgs = avg_values[start_idx:end_idx]
            event_maxs = max_values[start_idx:end_idx]
            if event_avgs:
                avg_hr = sum(event_avgs) / len(event_avgs)
                peak_hr = max(event_maxs) if event_maxs else avg_hr
                results.append((event_name, avg_hr, peak_hr))

        return results

    def save_data(self) -> None:
        """Save race data and config to JSON files."""
        os.makedirs(self.output_dir, exist_ok=True)

        # Save race records
        with open(os.path.join(self.output_dir, "race.json"), "w", encoding="utf-8") as f:
            json.dump(self.race_records, f, indent=2)

        # Save config
        config = {
            "athlete": self.athlete_name,
            "season": self.season,
            "location": self.location,
            "gender": self.gender,
            "division": self.division,
        }
        with open(os.path.join(self.output_dir, "config.json"), "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2)

        self.console.print(
            f"[green]✓[/green] Saved {len(self.race_records)} athlete records to JSON",
            style="dim",
        )


def main() -> None:
    """Main entry point."""
    console = Console()
    
    # Display credits
    console.print()
    console.print("[bold yellow]━━━ 🏃✨ HYROX RACE INSIGHTS ━━━[/bold yellow]")
    console.print("Built by [link=https://jives.dev][bold cyan]Jives (https://Jives.dev)[/bold cyan][/link] with [link=https://pypi.org/project/pyrox-client/][bold cyan]pyrox-client (https://vmatei2.github.io/pyrox-client/)[/bold cyan][/link]")
    console.print()
    
    # Load configuration from environment
    season = int(os.environ.get("HYROX_SEASON", "8"))
    location = os.environ.get("HYROX_LOCATION", "Stockholm")
    gender = os.environ.get("HYROX_GENDER", "male")
    division = os.environ.get("HYROX_DIVISION", "open")
    athlete = os.environ.get("HYROX_ATHLETE", "Smith, John")
    heart_rate_file = os.environ.get("HYROX_HEART_RATE_FILE", "heart_rate.csv")
    age_group = os.environ.get("HYROX_AGE_GROUP")

    year: Optional[int] = None
    year_env = os.environ.get("HYROX_YEAR")
    if year_env:
        year = int(year_env)

    total_time: Optional[float | tuple[float | None, float | None]] = None
    total_time_env = os.environ.get("HYROX_TOTAL_TIME")
    if total_time_env:
        time_parts = total_time_env.split(",")
        if len(time_parts) == 1:
            total_time = float(time_parts[0])
        elif len(time_parts) == 2:
            min_time = float(time_parts[0]) if time_parts[0].strip() else None
            max_time = float(time_parts[1]) if time_parts[1].strip() else None
            total_time = (min_time, max_time)

    # Create Analyser and run analysis
    Analyser = HyroxRaceInsights(
        season=season,
        location=location,
        gender=gender,
        division=division,
        athlete_name=athlete,
        year=year,
        age_group=age_group,
        total_time=total_time,
        heart_rate_file=heart_rate_file,
    )

    Analyser.fetch_data()
    Analyser.display_summary_tables()
    Analyser.display_visualizations()
    Analyser.save_data()


if __name__ == "__main__":
    main()
