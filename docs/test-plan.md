# Test Plan

## Python unit tests

Run:

```bash
python -m unittest discover -s tests -v
```

| Scenario | Input | Expected behavior |
|---|---|---|
| Normal | 230 V, 0.5 A, 35 °C | NORMAL |
| Under-voltage | 200 V | UNDER_VOLTAGE |
| Over-voltage | 254 V | OVER_VOLTAGE |
| High current | 1.6 A | HIGH_CURRENT |
| High temperature | 60 °C | HIGH_TEMPERATURE |
| Multiple faults | 200 V, 2 A, 70 °C | Three fault flags |
| Invalid number | Text in a measurement | ValueError |
| Non-finite input | Infinity | ValueError |
| Negative current | -0.1 A | ValueError |
| Sample CSV load | Included CSV | Ten parsed records |

## C compile check

```bash
gcc -std=c99 -Wall -Wextra -pedantic firmware/power_monitor.c -o power_monitor
```

Run the executable and inspect the printed status rows.

## Record your results

- Date:
- Operating system:
- Python version:
- Unit-test result:
- GCC version:
- Compiler warnings:
- Bug found and fix made:

The GitHub Actions workflow repeats the Python tests, compiles/runs the C demo, and executes the Python CSV demonstration. Do not claim a local check passed until you run it.

## Hardware validation

Not performed yet. The supplied values are synthetic. Before claiming physical accuracy, record the sensor model, calibration method, safe test setup, reference instrument, number of readings, measurement error, and safety review.
