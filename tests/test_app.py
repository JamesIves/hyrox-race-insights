"""Tests for HyroxRaceInsights."""

import os
import json
from unittest.mock import patch, MagicMock

import pandas as pd
import pytest

from app import HyroxRaceInsights, COUNTRY_FLAGS


# --- Fixtures ---


SAMPLE_RECORDS = [
    {
        "name": "Smith, John",
        "nationality": "USA",
        "age_group": "25-29",
        "total_time": 80.0,
        "run1_time": 5.0,
        "skiErg_time": 4.0,
        "run2_time": 5.0,
        "sledPush_time": 3.0,
        "run3_time": 5.0,
        "sledPull_time": 4.0,
        "run4_time": 5.0,
        "burpeeBroadJump_time": 4.0,
        "run5_time": 5.0,
        "rowErg_time": 5.0,
        "run6_time": 5.0,
        "farmersCarry_time": 3.0,
        "run7_time": 5.0,
        "sandbagLunges_time": 4.0,
        "run8_time": 5.0,
        "wallBalls_time": 4.0,
        "roxzone_time": 4.0,
    },
    {
        "name": "Doe, Jane",
        "nationality": "GBR",
        "age_group": "30-34",
        "total_time": 90.0,
        "run1_time": 6.0,
        "skiErg_time": 5.0,
        "run2_time": 6.0,
        "sledPush_time": 4.0,
        "run3_time": 6.0,
        "sledPull_time": 5.0,
        "run4_time": 6.0,
        "burpeeBroadJump_time": 5.0,
        "run5_time": 6.0,
        "rowErg_time": 6.0,
        "run6_time": 6.0,
        "farmersCarry_time": 4.0,
        "run7_time": 6.0,
        "sandbagLunges_time": 5.0,
        "run8_time": 6.0,
        "wallBalls_time": 5.0,
        "roxzone_time": 5.0,
    },
    {
        "name": "Müller, Hans",
        "nationality": "GER",
        "age_group": "25-29",
        "total_time": 70.0,
        "run1_time": 4.0,
        "skiErg_time": 3.0,
        "run2_time": 4.0,
        "sledPush_time": 2.0,
        "run3_time": 4.0,
        "sledPull_time": 3.0,
        "run4_time": 4.0,
        "burpeeBroadJump_time": 3.0,
        "run5_time": 4.0,
        "rowErg_time": 4.0,
        "run6_time": 4.0,
        "farmersCarry_time": 2.0,
        "run7_time": 4.0,
        "sandbagLunges_time": 3.0,
        "run8_time": 4.0,
        "wallBalls_time": 3.0,
        "roxzone_time": 3.0,
    },
]


@pytest.fixture
def analyzer():
    """Create analyzer with sample data pre-loaded (no API call)."""
    race_analyzer = HyroxRaceInsights(
        season=8,
        location="TestLocation",
        gender="male",
        division="open",
        athlete_name="Smith, John",
    )
    race_analyzer.race_records = list(SAMPLE_RECORDS)
    race_analyzer._find_athlete()
    race_analyzer._calculate_averages()
    return race_analyzer


@pytest.fixture
def analyzer_no_athlete():
    """Create analyzer where athlete is not found."""
    race_analyzer = HyroxRaceInsights(
        season=8,
        location="TestLocation",
        gender="male",
        division="open",
        athlete_name="Nobody, None",
    )
    race_analyzer.race_records = list(SAMPLE_RECORDS)
    race_analyzer._find_athlete()
    race_analyzer._calculate_averages()
    return race_analyzer


# --- Constructor / init tests ---


class TestInit:
    def test_default_heart_rate_file(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Smith, John")
        assert analyzer.heart_rate_file == "heart_rate.csv"

    def test_custom_heart_rate_file(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Smith, John", heart_rate_file="custom.csv")
        assert analyzer.heart_rate_file == "custom.csv"

    def test_optional_params_default_none(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Smith, John")
        assert analyzer.year is None
        assert analyzer.age_group is None
        assert analyzer.total_time is None

    def test_optional_params_set(self):
        analyzer = HyroxRaceInsights(
            1, "TestLocation", "male", "open", "Smith, John",
            year=2026, age_group="30-34", total_time=(60.0, 90.0),
        )
        assert analyzer.year == 2026
        assert analyzer.age_group == "30-34"
        assert analyzer.total_time == (60.0, 90.0)


# --- Athlete lookup ---


class TestFindAthlete:
    def test_finds_athlete(self, analyzer):
        assert analyzer.athlete_record is not None
        assert analyzer.athlete_record["name"] == "Smith, John"

    def test_case_insensitive(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "smith, john")
        analyzer.race_records = list(SAMPLE_RECORDS)
        analyzer._find_athlete()
        assert analyzer.athlete_record is not None

    def test_athlete_not_found(self, analyzer_no_athlete):
        assert analyzer_no_athlete.athlete_record is None


# --- Averages ---


class TestCalculateAverages:
    def test_averages_computed(self, analyzer):
        assert "run1_time" in analyzer.averages
        # (5 + 6 + 4) / 3 = 5.0
        assert analyzer.averages["run1_time"] == pytest.approx(5.0)

    def test_all_events_have_averages(self, analyzer):
        for field in HyroxRaceInsights.ALL_EVENTS:
            assert field in analyzer.averages


# --- Age group filtering ---


class TestAgeGroupFilter:
    def test_filters_by_age_group(self):
        analyzer = HyroxRaceInsights(
            1, "TestLocation", "male", "open", "Smith, John", age_group="25-29",
        )
        analyzer.race_records = list(SAMPLE_RECORDS)
        # Simulate age group filtering as done in fetch_data
        analyzer.race_records = [
            record for record in analyzer.race_records
            if str(record.get("age_group", "")).lower() == analyzer.age_group.lower()
        ]
        analyzer._find_athlete()
        analyzer._calculate_averages()
        # Doe, Jane (30-34) should be excluded
        assert len(analyzer.race_records) == 2
        assert all(record["age_group"] == "25-29" for record in analyzer.race_records)

    def test_no_filter_returns_all(self, analyzer):
        assert len(analyzer.race_records) == 3


# --- Display name with flags ---


class TestAthleteDisplayName:
    def test_single_athlete_with_flag(self, analyzer):
        display_name = analyzer._get_athlete_display_name()
        assert "🇺🇸" in display_name
        assert "Smith, John" in display_name

    def test_no_athlete_record(self, analyzer_no_athlete):
        display_name = analyzer_no_athlete._get_athlete_display_name()
        assert display_name == "Nobody, None"

    def test_doubles_two_flags(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "mixed", "doubles", "Jane Doe, John Smith")
        analyzer.athlete_record = {"nationality": "USA, GBR", "name": "Jane Doe, John Smith"}
        display_name = analyzer._get_athlete_display_name()
        assert "🇺🇸" in display_name
        assert "🇬🇧" in display_name
        assert "Jane Doe" in display_name
        assert "John Smith" in display_name

    def test_unknown_nationality(self):
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Test, Athlete")
        analyzer.athlete_record = {"nationality": "ZZZ", "name": "Test, Athlete"}
        display_name = analyzer._get_athlete_display_name()
        # No flag but name should be present
        assert "Test" in display_name
        assert "Athlete" in display_name


# --- Static / helper methods ---


class TestHelperMethods:
    def test_delta_color_negative(self):
        assert HyroxRaceInsights._delta_color(-5.0) == "green"

    def test_delta_color_zero(self):
        assert HyroxRaceInsights._delta_color(0.0) == "green"

    def test_delta_color_positive(self):
        assert HyroxRaceInsights._delta_color(5.0) == "red"

    def test_make_bar_length(self):
        assert len(HyroxRaceInsights._make_bar(5.0)) == 5

    def test_make_bar_zero(self):
        assert HyroxRaceInsights._make_bar(0.0) == ""

    def test_make_bar_negative(self):
        assert HyroxRaceInsights._make_bar(-3.0) == ""

    def test_perf_status_strong(self, analyzer):
        result = analyzer._perf_status(110)
        assert "▲▲" in result

    def test_perf_status_slight(self, analyzer):
        result = analyzer._perf_status(102)
        assert "▲" in result
        assert "▲▲" not in result

    def test_perf_status_average(self, analyzer):
        result = analyzer._perf_status(97)
        assert "~" in result

    def test_perf_status_below(self, analyzer):
        result = analyzer._perf_status(90)
        assert "▼" in result

    def test_percentile_color_excellent(self, analyzer):
        assert analyzer._percentile_color(10) == "green"

    def test_percentile_color_good(self, analyzer):
        assert analyzer._percentile_color(40) == "yellow"

    def test_percentile_color_poor(self, analyzer):
        assert analyzer._percentile_color(80) == "red"

    def test_percentile_label_top(self):
        assert HyroxRaceInsights._percentile_label(20) == "Top 20%"

    def test_percentile_label_bottom(self):
        assert HyroxRaceInsights._percentile_label(80) == "Bottom 20%"


# --- Percentile calculation ---


class TestPercentile:
    def test_percentile_fastest(self):
        """Fastest athlete should have ~0th percentile."""
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Müller, Hans")
        analyzer.race_records = list(SAMPLE_RECORDS)
        analyzer._find_athlete()
        percentile = analyzer._calculate_percentile("run1_time")
        assert percentile == pytest.approx(0.0)

    def test_percentile_slowest(self):
        """Slowest athlete should have highest percentile."""
        analyzer = HyroxRaceInsights(1, "TestLocation", "male", "open", "Doe, Jane")
        analyzer.race_records = list(SAMPLE_RECORDS)
        analyzer._find_athlete()
        percentile = analyzer._calculate_percentile("run1_time")
        assert percentile == pytest.approx(200 / 3)  # 2 out of 3 faster

    def test_percentile_missing_field(self, analyzer):
        assert analyzer._calculate_percentile("nonexistent_field") is None


# --- Event deltas ---


class TestEventDeltas:
    def test_computes_deltas(self, analyzer):
        deltas = analyzer._compute_event_deltas()
        assert len(deltas) > 0
        for event_name, delta_seconds, delta_percent in deltas:
            assert isinstance(event_name, str)
            assert isinstance(delta_seconds, float)
            assert isinstance(delta_percent, float)

    def test_delta_direction(self, analyzer):
        """Smith, John has run1=5.0, avg=5.0 → delta should be 0."""
        deltas = analyzer._compute_event_deltas()
        run1_delta = next(delta for delta in deltas if delta[0] == "Run 1")
        assert run1_delta[1] == pytest.approx(0.0)
        assert run1_delta[2] == pytest.approx(0.0)


# --- Heart rate loading ---


class TestHeartRateLoading:
    def test_load_nonexistent_file(self):
        analyzer = HyroxRaceInsights(
            1, "TestLocation", "male", "open", "Smith, John",
            heart_rate_file="nonexistent_hr.csv",
        )
        analyzer.race_records = []
        analyzer._load_heart_rate_data()
        assert analyzer.heart_rate_data is None

    def test_load_valid_csv(self, tmp_path, analyzer):
        heart_rate_csv = tmp_path / "heart_rate.csv"
        heart_rate_csv.write_text(
            "Avg (count/min),Max (count/min)\n"
            + "\n".join(f"{150+i},{160+i}" for i in range(100))
        )
        analyzer.heart_rate_file = str(heart_rate_csv)
        analyzer._load_heart_rate_data()
        assert analyzer.heart_rate_data is not None
        assert len(analyzer._hr_avg_values) > 0

    def test_load_csv_missing_columns(self, tmp_path):
        heart_rate_csv = tmp_path / "heart_rate.csv"
        heart_rate_csv.write_text("SomeColumn\n100\n200\n")
        analyzer = HyroxRaceInsights(
            1, "TestLocation", "male", "open", "Smith, John",
            heart_rate_file=str(heart_rate_csv),
        )
        analyzer.race_records = []
        analyzer._load_heart_rate_data()
        assert analyzer.heart_rate_data is None


# --- Heart rate per event ---


class TestHeartRatePerEvent:
    def test_hr_per_event_mapping(self, analyzer):
        # Create enough HR data to cover event times
        average_heart_rates = [float(150 + i % 10) for i in range(100)]
        max_heart_rates = [float(160 + i % 10) for i in range(100)]
        results = analyzer._hr_per_event(average_heart_rates, max_heart_rates)
        assert len(results) > 0
        for event_name, average_hr, peak_hr in results:
            assert average_hr > 0
            assert peak_hr >= average_hr

    def test_hr_per_event_no_athlete(self, analyzer_no_athlete):
        results = analyzer_no_athlete._hr_per_event([150.0], [160.0])
        assert results == []


# --- Save data ---


class TestSaveData:
    def test_save_creates_files(self, analyzer, tmp_path):
        analyzer.output_dir = str(tmp_path / "output")
        analyzer.save_data()
        assert (tmp_path / "output" / "race.json").exists()
        assert (tmp_path / "output" / "config.json").exists()

    def test_saved_config_content(self, analyzer, tmp_path):
        analyzer.output_dir = str(tmp_path / "output")
        analyzer.save_data()
        with open(tmp_path / "output" / "config.json") as config_file:
            config = json.load(config_file)
        assert config["athlete"] == "Smith, John"
        assert config["season"] == 8
        assert config["gender"] == "male"
        assert config["division"] == "open"

    def test_saved_race_records(self, analyzer, tmp_path):
        analyzer.output_dir = str(tmp_path / "output")
        analyzer.save_data()
        with open(tmp_path / "output" / "race.json") as race_file:
            records = json.load(race_file)
        assert len(records) == 3


# --- Country flags ---


class TestCountryFlags:
    def test_common_countries_present(self):
        for code in ("USA", "GBR", "GER", "FRA", "AUS", "CAN", "JPN", "BRA", "MEX"):
            assert code in COUNTRY_FLAGS
            assert len(COUNTRY_FLAGS[code]) > 0

    def test_flags_are_emoji(self):
        for code, flag in COUNTRY_FLAGS.items():
            # Flag emojis are made of regional indicator symbols (U+1F1E6..U+1F1FF)
            assert all(0x1F1E6 <= ord(c) <= 0x1F1FF for c in flag), (
                f"Flag for {code} contains non-flag characters"
            )


# --- main() env var parsing ---


class TestMainEnvVars:
    @patch("app.HyroxRaceInsights")
    def test_default_env_vars(self, mock_cls):
        mock_instance = MagicMock()
        mock_cls.return_value = mock_instance

        env = {}
        with patch.dict(os.environ, env, clear=True):
            from app import main
            main()

        mock_cls.assert_called_once()
        call_kwargs = mock_cls.call_args
        assert call_kwargs.kwargs["season"] == 8
        assert call_kwargs.kwargs["location"] == "Stockholm"
        assert call_kwargs.kwargs["gender"] == "male"
        assert call_kwargs.kwargs["division"] == "open"
        assert call_kwargs.kwargs["athlete_name"] == "Smith, John"
        assert call_kwargs.kwargs["heart_rate_file"] == "heart_rate.csv"
        assert call_kwargs.kwargs["year"] is None
        assert call_kwargs.kwargs["age_group"] is None
        assert call_kwargs.kwargs["total_time"] is None

    @patch("app.HyroxRaceInsights")
    def test_custom_env_vars(self, mock_cls):
        mock_instance = MagicMock()
        mock_cls.return_value = mock_instance

        env = {
            "HYROX_SEASON": "7",
            "HYROX_LOCATION": "Berlin",
            "HYROX_GENDER": "female",
            "HYROX_DIVISION": "pro",
            "HYROX_ATHLETE": "Ives, James",
            "HYROX_HEART_RATE_FILE": "my_hr.csv",
            "HYROX_AGE_GROUP": "30-34",
            "HYROX_YEAR": "2025",
            "HYROX_TOTAL_TIME": "60,90",
        }
        with patch.dict(os.environ, env, clear=True):
            from app import main
            main()

        call_kwargs = mock_cls.call_args
        assert call_kwargs.kwargs["season"] == 7
        assert call_kwargs.kwargs["location"] == "Berlin"
        assert call_kwargs.kwargs["gender"] == "female"
        assert call_kwargs.kwargs["division"] == "pro"
        assert call_kwargs.kwargs["athlete_name"] == "Ives, James"
        assert call_kwargs.kwargs["heart_rate_file"] == "my_hr.csv"
        assert call_kwargs.kwargs["age_group"] == "30-34"
        assert call_kwargs.kwargs["year"] == 2025
        assert call_kwargs.kwargs["total_time"] == (60.0, 90.0)

    @patch("app.HyroxRaceInsights")
    def test_single_total_time(self, mock_cls):
        mock_instance = MagicMock()
        mock_cls.return_value = mock_instance

        with patch.dict(os.environ, {"HYROX_TOTAL_TIME": "90"}, clear=False):
            from app import main
            main()

        call_kwargs = mock_cls.call_args
        assert call_kwargs.kwargs["total_time"] == 90.0
