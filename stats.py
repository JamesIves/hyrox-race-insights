import json
import os
import sys

import pyrox

client = pyrox.PyroxClient()

DATA_DIR = os.path.join("app", "public", "data")
os.makedirs(DATA_DIR, exist_ok=True)

season = os.environ.get("HYROX_SEASON", "8")
location = os.environ.get("HYROX_LOCATION", "New-York")
gender = os.environ.get("HYROX_GENDER", "male")
division = os.environ.get("HYROX_DIVISION", "open")
athlete = os.environ.get("HYROX_ATHLETE", "Smith, John")

print(f"Fetching season {season} {location} ({gender.capitalize()} {division.capitalize()})...")
race = client.get_race(
    season=int(season),
    location=location,
    gender=gender,
    division=division,
)

race_records = race.to_dict(orient='records')

athlete_found = any(
    str(r.get("name", "")).lower() == athlete.lower() for r in race_records
)
if not athlete_found:
    print(f"WARNING: Athlete '{athlete}' not found in race data.", file=sys.stderr)

with open(os.path.join(DATA_DIR, "race.json"), 'w', encoding='utf-8') as f:
    json.dump(race_records, f, indent=2)

config = {
    "athlete": athlete,
    "season": int(season),
    "location": location,
    "gender": gender,
    "division": division,
}
with open(os.path.join(DATA_DIR, "config.json"), 'w', encoding='utf-8') as f:
    json.dump(config, f, indent=2)

print(f"Done. Wrote {len(race_records)} athlete(s) to race.json")
