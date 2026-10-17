# PowerGuard — Embedded Power & Equipment Health Monitor

A student-built ECE portfolio project demonstrating embedded C, sensor-data handling, threshold-based fault detection, Python analysis, unit tests, and continuous integration.

> **Status:** simulation-first prototype. All supplied CSV readings are synthetic. No physical sensors, calibrated instruments, or industrial deployment have been tested.

## What it does

- Reads voltage, current, and temperature measurements from CSV.
- Calculates apparent power as voltage × current, reported in VA.
- Flags under-voltage, over-voltage, high current, and high temperature.
- Provides a portable embedded-C example using the same basic rules.
- Includes repeatable unit tests and a GitHub Actions workflow.

## Repository structure

```text
powerguard/
├── README.md
├── powerguard.py
├── data/sample_readings.csv
├── firmware/power_monitor.c
├── tests/test_powerguard.py
├── docs/architecture.md
├── docs/test-plan.md
├── .github/workflows/ci.yml
└── .gitignore
```

## Run the Python demo

Requires Python 3.10+; no third-party packages are needed.

Windows PowerShell:

```powershell
py powerguard.py --input data/sample_readings.csv
py -m unittest discover -s tests -v
```

Linux/macOS:

```bash
python3 powerguard.py --input data/sample_readings.csv
python3 -m unittest discover -s tests -v
```

## Compile and run the C demo

With GCC installed:

```bash
gcc -std=c99 -Wall -Wextra -pedantic firmware/power_monitor.c -o power_monitor
```

PowerShell:

```powershell
.\power_monitor.exe
```

Linux/macOS:

```bash
./power_monitor
```

The C program uses an in-code sample array standing in for sensor-driver output, so a microcontroller SDK is not required for this demo.

## Example thresholds

| Signal | Demo rule |
|---|---:|
| Voltage | Below 207 V → under-voltage alert |
| Voltage | Above 253 V → over-voltage alert |
| Current | Above 1.50 A → high-current alert |
| Temperature | 60 °C or higher → high-temperature alert |

These are illustrative software thresholds only. They are not certified safety limits and must not be used to protect real equipment without appropriate engineering review.

## ECE concepts demonstrated

- Sensor / ADC data path concepts
- Embedded C decision logic
- Python data handling and validation
- I²C/embedded-systems concepts can be considered future extensions, not current implementation
- Fault flags, test cases, and CI
- Unit-aware reporting: voltage (V), current (A), temperature (°C), apparent power (VA)

## Important engineering notes

- Voltage × current is apparent power in VA for this demo; it is **not** a measurement of real AC power in watts. Real power requires suitable power-factor measurement or synchronized voltage/current waveform sampling.
- All values in `data/sample_readings.csv` are synthetic example readings.
- Do not claim physical accuracy or hardware validation until you build, measure, and document a real prototype.
- Never connect a microcontroller or breadboard directly to mains voltage. Real AC measurements require suitably rated, isolated sensing equipment, protection, and qualified supervision.

## Employer relevance

- **Texas Instruments:** embedded C, sensor/ADC data paths, fault logic, and validation.
- **BEL:** deterministic monitoring, telemetry-style data, fault flags, and test evidence.
- **Reliance Industries:** a starting point for equipment-condition and electrical-parameter monitoring.

These are learning connections only. This independent student project is not affiliated with or endorsed by those companies.

## Interview preparation

Be ready to explain the threshold rules, input validation, why power is reported in VA, the difference between the C demo and Python analyzer, and which elements remain simulated.

See [architecture notes](docs/architecture.md) and [test plan](docs/test-plan.md).
