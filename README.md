# Hyrox Race Insights

<img align="right" width="128" height="auto"  src="./.github/docs/icon.png" alt="Icon">

A terminal-based analytics tool that visualizes your Hyrox race data, highlights strengths and weaknesses, and provides actionable insights to help you improve your time.

Special thank you to all the past and present [GitHub Sponsors](https://github.com/sponsors/JamesIves) 💖.

<!-- sponsors --><a href="https://github.com/Chooksta69"><img src="https:&#x2F;&#x2F;github.com&#x2F;Chooksta69.png" width="25px" alt="Chooksta69" /></a>&nbsp;&nbsp;<a href="https://github.com/MattWillFlood"><img src="https:&#x2F;&#x2F;github.com&#x2F;MattWillFlood.png" width="25px" alt="MattWillFlood" /></a>&nbsp;&nbsp;<a href="https://github.com/jonathan-milan-pollock"><img src="https:&#x2F;&#x2F;github.com&#x2F;jonathan-milan-pollock.png" width="25px" alt="jonathan-milan-pollock" /></a>&nbsp;&nbsp;<a href="https://github.com/raoulvdberge"><img src="https:&#x2F;&#x2F;github.com&#x2F;raoulvdberge.png" width="25px" alt="raoulvdberge" /></a>&nbsp;&nbsp;<a href="https://github.com/robjtede"><img src="https:&#x2F;&#x2F;github.com&#x2F;robjtede.png" width="25px" alt="robjtede" /></a>&nbsp;&nbsp;<a href="https://github.com/hadley"><img src="https:&#x2F;&#x2F;github.com&#x2F;hadley.png" width="25px" alt="hadley" /></a>&nbsp;&nbsp;<a href="https://github.com/kevinchalet"><img src="https:&#x2F;&#x2F;github.com&#x2F;kevinchalet.png" width="25px" alt="kevinchalet" /></a>&nbsp;&nbsp;<a href="https://github.com/Yousazoe"><img src="https:&#x2F;&#x2F;github.com&#x2F;Yousazoe.png" width="25px" alt="Yousazoe" /></a>&nbsp;&nbsp;<a href="https://github.com/github"><img src="https:&#x2F;&#x2F;github.com&#x2F;github.png" width="25px" alt="github" /></a>&nbsp;&nbsp;<a href="https://github.com/annegentle"><img src="https:&#x2F;&#x2F;github.com&#x2F;annegentle.png" width="25px" alt="annegentle" /></a>&nbsp;&nbsp;<a href="https://github.com/planetoftheweb"><img src="https:&#x2F;&#x2F;github.com&#x2F;planetoftheweb.png" width="25px" alt="planetoftheweb" /></a>&nbsp;&nbsp;<a href="https://github.com/melton1968"><img src="https:&#x2F;&#x2F;github.com&#x2F;melton1968.png" width="25px" alt="melton1968" /></a>&nbsp;&nbsp;<a href="https://github.com/szepeviktor"><img src="https:&#x2F;&#x2F;github.com&#x2F;szepeviktor.png" width="25px" alt="szepeviktor" /></a>&nbsp;&nbsp;<a href="https://github.com/sckott"><img src="https:&#x2F;&#x2F;github.com&#x2F;sckott.png" width="25px" alt="sckott" /></a>&nbsp;&nbsp;<a href="https://github.com/provinzkraut"><img src="https:&#x2F;&#x2F;github.com&#x2F;provinzkraut.png" width="25px" alt="provinzkraut" /></a>&nbsp;&nbsp;<a href="https://github.com/electrovir"><img src="https:&#x2F;&#x2F;github.com&#x2F;electrovir.png" width="25px" alt="electrovir" /></a>&nbsp;&nbsp;<a href="https://github.com/Griefed"><img src="https:&#x2F;&#x2F;github.com&#x2F;Griefed.png" width="25px" alt="Griefed" /></a>&nbsp;&nbsp;<a href="https://github.com/MontezumaIves"><img src="https:&#x2F;&#x2F;github.com&#x2F;MontezumaIves.png" width="25px" alt="MontezumaIves" /></a>&nbsp;&nbsp;<a href="https://github.com/tonjohn"><img src="https:&#x2F;&#x2F;github.com&#x2F;tonjohn.png" width="25px" alt="tonjohn" /></a>&nbsp;&nbsp;<a href="https://github.com/wylie"><img src="https:&#x2F;&#x2F;github.com&#x2F;wylie.png" width="25px" alt="wylie" /></a>&nbsp;&nbsp;<a href="https://github.com/pylapp"><img src="https:&#x2F;&#x2F;github.com&#x2F;pylapp.png" width="25px" alt="pylapp" /></a>&nbsp;&nbsp;<a href="https://github.com/Zhenglei-BCS"><img src="https:&#x2F;&#x2F;github.com&#x2F;Zhenglei-BCS.png" width="25px" alt="Zhenglei-BCS" /></a>&nbsp;&nbsp;<a href="https://github.com/leoxeno"><img src="https:&#x2F;&#x2F;github.com&#x2F;leoxeno.png" width="25px" alt="leoxeno" /></a>&nbsp;&nbsp;<a href="https://github.com/DanielYang59"><img src="https:&#x2F;&#x2F;github.com&#x2F;DanielYang59.png" width="25px" alt="DanielYang59" /></a>&nbsp;&nbsp;<a href="https://github.com/"><img src="https:&#x2F;&#x2F;raw.githubusercontent.com&#x2F;JamesIves&#x2F;github-sponsors-readme-action&#x2F;dev&#x2F;.github&#x2F;assets&#x2F;placeholder.png" width="25px" alt="" /></a>&nbsp;&nbsp;<a href="https://github.com/"><img src="https:&#x2F;&#x2F;raw.githubusercontent.com&#x2F;JamesIves&#x2F;github-sponsors-readme-action&#x2F;dev&#x2F;.github&#x2F;assets&#x2F;placeholder.png" width="25px" alt="" /></a>&nbsp;&nbsp;<a href="https://github.com/"><img src="https:&#x2F;&#x2F;raw.githubusercontent.com&#x2F;JamesIves&#x2F;github-sponsors-readme-action&#x2F;dev&#x2F;.github&#x2F;assets&#x2F;placeholder.png" width="25px" alt="" /></a>&nbsp;&nbsp;<!-- sponsors -->

## Getting Started 🚀

Requires [Python 3.12+](https://www.python.org/). Install dependencies and run the tool:

```bash
pip install -e .
python app.py
```

### Configuration

Configure the tool using environment variables. All variables are optional and fall back to sensible defaults.

| Variable         | Description                                                                                                                                                  | Default       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| `HYROX_SEASON`   | Race season number                                                                                                                                           | `8`           |
| `HYROX_LOCATION` | Race location. Multi-word locations should be hyphenated (e.g. `Washington-DC`)                                                                              | `Stockholm`   |
| `HYROX_GENDER`   | Athlete gender (`male`, `female`, or `mixed` for doubles)                                                                                                    | `male`        |
| `HYROX_DIVISION` | Race division (`open`, `pro`, `doubles`, `pro_doubles`)                                                                                                      | `open`        |
| `HYROX_ATHLETE`  | Athlete name as it appears on the [Hyrox results board](https://results.hyrox.com), typically `Last, First` format. For doubles use `First Last, First Last` | `Smith, John` |

**Example:**

```bash
HYROX_SEASON=8 HYROX_LOCATION=Washington-DC HYROX_ATHLETE="Smith, John" python app.py
```

**Doubles example:**

```bash
HYROX_GENDER=mixed HYROX_DIVISION=doubles HYROX_ATHLETE="John Smith, Jane Doe" python app.py
```

## Heart Rate Analysis 🫀

You can optionally include heart rate data to get per-event HR breakdowns and spike analysis. Place a file called `heart_rate.csv` in the project root before running the tool.

### CSV Format

The CSV must contain the following columns:

| Column            | Description                        |
| ----------------- | ---------------------------------- |
| `Avg (count/min)` | Average heart rate for that minute |
| `Max (count/min)` | Maximum heart rate for that minute |

Each row represents one minute of data. The tool maps rows to race events based on your cumulative event times, so the data should start from the beginning of your race.

**Example `heart_rate.csv`:**

```csv
Date/Time,Min (count/min),Max (count/min),Avg (count/min)
2026-03-08 12:19:58,117,162,143.03
2026-03-08 12:20:58,155,162,158.54
2026-03-08 12:21:58,152,157,155.29
```

> [!TIP]
> You can export this format from Apple Health by exporting heart rate data during your race window. Only the `Avg (count/min)` and `Max (count/min)` columns are required — extra columns are ignored.
