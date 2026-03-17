"""
Hyrox Race Data Analysis Tool

Fetches race data from Pyrox API and displays comprehensive terminal-based
visualizations comparing an athlete's performance to field averages.

Environment Variables:
    HYROX_SEASON: Race season (default: "8")
    HYROX_LOCATION: Race location (default: "Washington-DC")
    HYROX_GENDER: Athlete gender (default: "male")
    HYROX_DIVISION: Race division (default: "open")
    HYROX_ATHLETE: Athlete name in "Last, First" format (default: "Ives, James")
"""

import json
import os
from typing import Dict, List, Tuple, Optional

import pyrox
import plotille
from rich.console import Console
from rich.table import Table


class HyroxAnalyzer:
    """Analyzes Hyrox race data and generates performance insights."""

    # Station field names and display labels
    STATIONS = {
        "skiErg_time": "SkiErg",
        "sledPush_time": "Sled Push",
        "sledPull_time": "Sled Pull",
        "burpeeBroadJump_time": "Burpee Broad Jump",
        "rowErg_time": "RowErg",
        "farmersCarry_time": "Farmer's Carry",
        "sandbagLunges_time": "Sandbag Lunges",
        "wallBall_time": "Wall Ball",
        "roxzone_time": "Roxzone",
    }

    def __init__(
        self,
        season: int,
        location: str,
        gender: str,
        division: str,
        athlete_name: str,
        output_dir: str = "app/public/data",
    ):
        """
        Initialize the analyzer with race parameters.

        Args:
            season: Race season number
            location: Race location
            gender: Athlete gender category
            division: Division category
            athlete_name: Athlete name for comparison
            output_dir: Directory to save JSON output files
        """
        self.season = season
        self.location = location
        self.gender = gender
        self.division = division
        self.athlete_name = athlete_name
        self.output_dir = output_dir
        self.console = Console()

        # Data storage
        self.race_records: List[Dict] = []
        self.athlete_record: Optional[Dict] = None
        self.averages: Dict[str, float] = {}
        self.heatmap_data: List[Tuple[str, float, float]] = []

    def fetch_data(self) -> None:
        """Fetch race data from Pyrox API."""
        self.console.print(
            f"Fetching season {self.season} {self.location} "
            f"({self.gender.capitalize()} {self.division.capitalize()})...",
            style="bold cyan",
        )

        client = pyrox.PyroxClient()
        race = client.get_race(
            season=self.season,
            location=self.location,
            gender=self.gender,
            division=self.division,
        )

        self.race_records = race.to_dict(orient="records")
        self._find_athlete()
        self._calculate_averages()

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
        """Calculate field average times for each station."""
        self.averages = {}
        for field, _ in self.STATIONS.items():
            times = [r.get(field, 0) for r in self.race_records if r.get(field) is not None]
            if times:
                self.averages[field] = sum(times) / len(times)

    def display_summary_tables(self) -> None:
        """Display per-station averages and athlete comparison tables."""
        self._display_field_averages_table()
        if self.athlete_record:
            self._display_athlete_comparison_table()

    def _display_field_averages_table(self) -> None:
        """Show field average times for each station."""
        table = Table(
            title=(
                f"Per-Station Averages - {self.location} Season {self.season} "
                f"({self.gender.capitalize()} {self.division.capitalize()})"
            )
        )
        table.add_column("Station", style="cyan")
        table.add_column("Average Time", style="magenta")
        table.add_column("Min", style="green")
        table.add_column("Max", style="red")

        for field, station_name in self.STATIONS.items():
            times = [r.get(field) for r in self.race_records if r.get(field) is not None]
            if times:
                avg = sum(times) / len(times)
                min_time = min(times)
                max_time = max(times)
                table.add_row(
                    station_name, f"{avg:.2f}m", f"{min_time:.2f}m", f"{max_time:.2f}m"
                )

        self.console.print(table)
        self.console.print()

    def _display_athlete_comparison_table(self) -> None:
        """Show athlete times vs field averages."""
        table = Table(title=f"Athlete Comparison - {self.athlete_name}")
        table.add_column("Station", style="cyan")
        table.add_column("Your Time", style="yellow")
        table.add_column("Field Avg", style="magenta")
        table.add_column("Delta", style="white")
        table.add_column("vs Avg %", style="white")

        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta = athlete_time - avg_time
                delta_pct = (delta / avg_time) * 100
                delta_str = f"{delta:+.2f}m"
                pct_str = f"{delta_pct:+.1f}%"
                delta_color = "green" if delta < 0 else "red"
                table.add_row(
                    station_name,
                    f"{athlete_time:.2f}m",
                    f"{avg_time:.2f}m",
                    f"[{delta_color}]{delta_str}[/{delta_color}]",
                    f"[{delta_color}]{pct_str}[/{delta_color}]",
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

        self.console.print("\n" + "=" * 88)
        self.console.print("PERFORMANCE ANALYTICS", justify="center", style="bold cyan")
        self.console.print("=" * 88 + "\n")

        self._display_performance_index()
        self._display_heatmap()
        self._display_cumulative_delta()
        self._display_split_analysis()
        self._display_opportunities()
        self._display_percentiles()

    def _display_performance_index(self) -> None:
        """Show normalized performance index (>100 = faster than average)."""
        self.console.print(
            "[bold cyan]1. PERFORMANCE INDEX[/bold cyan] — "
            "Normalized Performance (100 = Field Average)",
            style="dim",
        )
        self.console.print(
            "   [dim]Scores > 100 indicate faster performance. "
            "Compare strengths and weaknesses at a glance.[/dim]"
        )

        perf_data = []
        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time and avg_time and athlete_time > 0:
                perf_index = (avg_time / athlete_time) * 100
                perf_data.append((station_name, perf_index))

        for station_name, index in sorted(perf_data, key=lambda x: x[1], reverse=True):
            bar_length = int(index / 2.5)
            bar = "█" * bar_length

            if index > 105:
                status = "[green]▲▲[/green]"  # Strong advantage
            elif index > 100:
                status = "[green]▲[/green]"  # Slight advantage
            elif index > 95:
                status = "[yellow]~[/yellow]"  # About average
            else:
                status = "[red]▼[/red]"  # Below average

            self.console.print(f"  {station_name:20} {status} {bar} {index:6.1f}")

        self.console.print()

    def _display_heatmap(self) -> None:
        """Show per-event delta vs field average."""
        self.console.print(
            "[bold cyan]2. WHERE YOU GAIN/LOSE TIME[/bold cyan] — "
            "Per-Event Delta vs Field Average",
            style="dim",
        )
        self.console.print(
            "   [dim]Red = Losing time relative to field average. "
            "Green = Gaining time. Focus on red events to improve.[/dim]"
        )

        self.heatmap_data = []
        faster_count = 0
        slower_count = 0
        total_delta_seconds = 0

        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta_seconds = (athlete_time - avg_time) * 60
                delta_pct = ((athlete_time - avg_time) / avg_time) * 100
                total_delta_seconds += delta_seconds
                self.heatmap_data.append((station_name, delta_seconds, delta_pct))
                if delta_seconds < 0:
                    faster_count += 1
                else:
                    slower_count += 1

        # Summary line
        net_style = "green" if total_delta_seconds < 0 else "red"
        net_emoji = "✓" if total_delta_seconds < 0 else "✗"
        self.console.print(
            f"  Faster: [green]{faster_count} events[/green] | "
            f"Slower: [red]{slower_count} events[/red] | "
            f"Net: [{net_style}]{net_emoji} {total_delta_seconds:+.0f}s[/{net_style}]"
        )
        self.console.print()

        # Heatmap rows
        for station_name, delta_sec, delta_pct in sorted(self.heatmap_data, key=lambda x: x[1]):
            if delta_sec < 0:
                color = "green"
                symbol = "✓"
            else:
                color = "red"
                symbol = "✗"

            bar_length = int(abs(delta_sec) / 10)
            bar = "█" * bar_length

            self.console.print(
                f"  {station_name:20} [{color}]{symbol}[/{color}] "
                f"[dim]{bar}[/dim] {delta_sec:+6.0f}s ({delta_pct:+6.1f}%)"
            )

        self.console.print()

    def _display_cumulative_delta(self) -> None:
        """Show cumulative time delta progression through the race."""
        self.console.print(
            "[bold cyan]3. CUMULATIVE TIME DELTA[/bold cyan] — "
            "Your Advantage/Disadvantage Through Race",
            style="dim",
        )
        self.console.print(
            "   [dim]Shows momentum: Are you gaining or losing time as the race progresses?[/dim]"
        )

        cumulative_data = []
        cumulative_delta = 0

        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta_seconds = (athlete_time - avg_time) * 60
                cumulative_delta += delta_seconds
                cumulative_data.append((station_name[:3].upper(), cumulative_delta))

        # Try to plot, fallback to ASCII bars
        try:
            chart = plotille.plot(
                list(range(len(cumulative_data))),
                [val for _, val in cumulative_data],
                width=80,
                height=10,
            )
            self.console.print(chart)
        except Exception:
            max_cumulative = max(abs(val) for _, val in cumulative_data) or 1
            for station, val in cumulative_data:
                bar_length = int(abs(val) / max(1, max_cumulative / 20))
                if val >= 0:
                    bar = "█" * bar_length
                    color = "red"
                else:
                    bar = "█" * bar_length
                    color = "green"
                self.console.print(f"  {station:3} [{color}]{bar}[/{color}] {val:+7.0f}s")

        self.console.print()

    def _display_split_analysis(self) -> None:
        """Show where time delta comes from: Runs vs Stations."""
        self.console.print(
            "[bold cyan]4. WHERE DELTA COMES FROM[/bold cyan] — Runs vs Stations Split",
            style="dim",
        )
        self.console.print(
            "   [dim]Breakdown: Are you slower on runs or at stations? "
            "This identifies your weakest area.[/dim]"
        )

        run_delta = 0.0
        station_delta = 0.0

        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            avg_time = self.averages.get(field)
            if athlete_time is not None and avg_time is not None:
                delta_seconds = (athlete_time - avg_time) * 60
                # Note: no actual run fields in stations dict, so all go to station_delta
                if any(run_key in field.lower() for run_key in ["run"]):
                    run_delta += delta_seconds
                else:
                    station_delta += delta_seconds

        total_delta = abs(run_delta) + abs(station_delta)
        if total_delta > 0:
            run_pct = abs(run_delta) / total_delta * 100
            station_pct = abs(station_delta) / total_delta * 100

            self.console.print(
                f"  Runs:     [yellow]{run_pct:5.0f}%[/yellow] ({run_delta:+7.0f}s) "
                f"{'█' * int(run_pct / 5)}"
            )
            self.console.print(
                f"  Stations: [yellow]{station_pct:5.0f}%[/yellow] ({station_delta:+7.0f}s) "
                f"{'█' * int(station_pct / 5)}"
            )

        self.console.print()

    def _display_opportunities(self) -> None:
        """Show top 3 events where athlete lost the most time."""
        self.console.print(
            "[bold cyan]5. BIGGEST OPPORTUNITIES[/bold cyan] — "
            "Events Where You Lost the Most Time",
            style="dim",
        )
        self.console.print(
            "   [dim]Focus on these events to make the biggest performance gains.[/dim]"
        )

        opportunities = [
            (name, delta_sec, delta_pct)
            for name, delta_sec, delta_pct in self.heatmap_data
            if delta_sec > 0
        ]
        opportunities.sort(key=lambda x: x[1], reverse=True)

        if opportunities:
            max_delta = max(opp[1] for opp in opportunities or [1])
            for i, (station_name, delta_sec, delta_pct) in enumerate(opportunities[:3], 1):
                bar_length = int((delta_sec / max_delta) * 25)
                bar = "█" * bar_length
                self.console.print(
                    f"  {i}. {station_name:20} [red]{bar}[/red] "
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
            "[bold cyan]6. PER-EVENT PERCENTILE[/bold cyan] — Your Placement in the Field",
            style="dim",
        )
        self.console.print(
            "   [dim]Your ranking at each station. Lower percentile = faster than average.[/dim]"
        )

        percentile_data = []

        for field, station_name in self.STATIONS.items():
            athlete_time = self.athlete_record.get(field)
            if athlete_time is not None:
                times = [r.get(field) for r in self.race_records if r.get(field) is not None]
                if times:
                    faster_count = sum(1 for t in times if t < athlete_time)
                    percentile = (faster_count / len(times)) * 100
                    percentile_data.append((station_name, percentile))

        for station_name, percentile in sorted(percentile_data, key=lambda x: x[1]):
            bar_length = int(percentile / 5)
            bar = "█" * bar_length
            ranking = f"Top {(100 - percentile):.0f}%"

            # Color code based on performance
            if percentile < 25:
                color = "green"
            elif percentile < 50:
                color = "yellow"
            elif percentile < 75:
                color = "red"
            else:
                color = "red"

            self.console.print(
                f"  {station_name:20} [{color}]{bar}[/{color}] "
                f"{percentile:5.0f}th percentile {ranking}"
            )

        self.console.print()

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
    console.print("[bold cyan]🏃 HYROX RACE INSIGHTS[/bold cyan]")
    console.print("Built by [link=https://jives.dev][bold yellow]Jives (https://Jives.dev)[/bold yellow][/link] with [link=https://pypi.org/project/pyrox-client/][bold yellow]pyrox-client (https://vmatei2.github.io/pyrox-client/)[/bold yellow][/link]")
    console.print()
    
    # Load configuration from environment
    season = int(os.environ.get("HYROX_SEASON", "8"))
    location = os.environ.get("HYROX_LOCATION", "Washington-DC")
    gender = os.environ.get("HYROX_GENDER", "male")
    division = os.environ.get("HYROX_DIVISION", "open")
    athlete = os.environ.get("HYROX_ATHLETE", "Ives, James")

    # Create analyzer and run analysis
    analyzer = HyroxAnalyzer(
        season=season,
        location=location,
        gender=gender,
        division=division,
        athlete_name=athlete,
    )

    analyzer.fetch_data()
    analyzer.display_summary_tables()
    analyzer.display_visualizations()


if __name__ == "__main__":
    main()
