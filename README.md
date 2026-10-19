# PowerGuard — Embedded Power & Equipment Health Monitor

PowerGuard is my final-year B.Tech ECE portfolio project for exploring how embedded software can flag electrical and temperature readings that fall outside a set of limits. The repository combines a small C example, a Python CSV analyzer, tests, and a web dashboard that can also be installed as a Progressive Web App (PWA).

**Current status:** software prototype using synthetic sample readings. It is not connected to live sensors and has not been validated on physical equipment.

## Try the dashboard

After GitHub Pages deployment completes, the dashboard will be available at:

https://ngaurav951.github.io/powerguard-embedded-monitor/

The web app lets you review the sample readings, filter normal/alert records, inspect the voltage trend, and export the visible records to CSV. It works without a third-party charting library. On supported browsers, you can install it from the browser menu as an app and reopen the cached demo offline.

All dashboard readings are sample data. The app does not claim live monitoring or connect to a microcontroller.

## What is implemented

- Python reads and validates CSV readings for voltage, current, and temperature.
- Threshold rules flag under-voltage, over-voltage, high current, and high temperature.
- Apparent power is calculated as voltage multiplied by current and shown in VA.
- A C example demonstrates the same basic threshold checks using an in-code sample array.
- Unit tests cover normal readings, alert boundaries, invalid values, and the sample file.
- GitHub Actions runs the existing test/build checks and deploys the static dashboard to GitHub Pages after a successful push to the main branch.
- The responsive PWA dashboard displays the bundled synthetic sample dataset, supports searching/filtering, and exports filtered records.

## Repository layout

~~~text
.
├── .github/workflows/
│   ├── ci.yml                 # Python tests and C/Python demo checks
│   └── pages.yml              # GitHub Pages deployment
├── data/sample_readings.csv   # Synthetic input records for the Python demo
├── docs/
│   ├── architecture.md        # Signal path, design choices, and limitations
│   └── test-plan.md           # Test scenarios and validation notes
├── firmware/power_monitor.c   # Embedded-C threshold logic example
├── site/                      # Website and installable PWA dashboard
├── tests/
│   ├── test_powerguard.py
│   └── test_site.py
└── powerguard.py               # CSV validation and terminal report
~~~

## Run the Python analyzer

Requires Python 3.10 or newer. It uses the Python standard library only.

Windows PowerShell:

~~~powershell
py powerguard.py --input data/sample_readings.csv
py -m unittest discover -s tests -v
~~~

Linux/macOS:

~~~bash
python3 powerguard.py --input data/sample_readings.csv
python3 -m unittest discover -s tests -v
~~~

The terminal report lists each reading, the calculated VA value, its status, and any threshold flags.

## Compile the embedded-C example

With GCC installed:

~~~bash
gcc -std=c99 -Wall -Wextra -pedantic firmware/power_monitor.c -o power_monitor
~~~

Run it on Windows PowerShell with:

~~~powershell
.\power_monitor.exe
~~~

Or on Linux/macOS with:

~~~bash
./power_monitor
~~~

The C program uses a small in-code array that stands in for sensor/ADC output. It is a portable logic demonstration, not firmware ready to flash to a specific board.

## Run the website locally

From the repository root, start Python’s simple local web server:

~~~powershell
py -m http.server 8000 --directory site
~~~

Then open http://localhost:8000 in a browser. On macOS/Linux, use:

~~~bash
python3 -m http.server 8000 --directory site
~~~

A web server is needed for the CSV fetch and service worker; opening the HTML file directly with a file URL will not exercise those features.

## Example threshold rules

| Measurement | Demo rule |
|---|---:|
| Voltage | Below 207 V → under-voltage flag |
| Voltage | Above 253 V → over-voltage flag |
| Current | Above 1.50 A → high-current flag |
| Temperature | 60 °C or higher → high-temperature flag |

These values are illustrative software thresholds, not certified safety limits. They must not be used to protect real equipment.

## Engineering notes and limitations

- The included CSV rows and the dashboard dataset are synthetic examples.
- No physical sensor, ADC, calibration procedure, target board, or reference instrument has been tested as part of this repository.
- Voltage × current is shown as apparent power in volt-amperes (VA), not real AC power in watts. Measuring real power requires power-factor information or synchronized voltage/current waveform measurements.
- The thresholds are fixed examples in the prototype. A practical device would need equipment-specific limits, appropriate sensor conditioning, isolation, fault handling, and safety review.
- Never connect a microcontroller or breadboard directly to mains voltage. Any physical AC measurement needs correctly rated isolated sensing hardware and qualified supervision.

## What I want to improve next

1. Select a target microcontroller and document its actual ADC/peripheral interface.
2. Add an input-driver layer and test it with low-voltage signals using a safe setup.
3. Measure filtering behaviour and record response time and error against a reference instrument.
4. Add serial telemetry only after the sensor and firmware interfaces are defined.

I have kept those items as future work rather than presenting them as completed features.

## Author

**Nikhil Gaurav** · B.Tech Electronics and Communication Engineering  
GitHub: https://github.com/NGAURAV951

This is an independent learning project and is not affiliated with or endorsed by any employer or equipment manufacturer.
