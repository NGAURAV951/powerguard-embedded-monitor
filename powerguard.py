"""PowerGuard: simulation-first power and equipment health analyzer."""
from __future__ import annotations

import argparse
import csv
import math
import sys
from pathlib import Path
from typing import Any

VOLTAGE_MIN_V = 207.0
VOLTAGE_MAX_V = 253.0
CURRENT_MAX_A = 1.50
TEMPERATURE_MAX_C = 60.0
REQUIRED_FIELDS = ("reading_id", "timestamp", "voltage_v", "current_a", "temperature_c")


def analyze_reading(row: dict[str, Any]) -> dict[str, Any]:
    """Validate one row and return calculated values plus fault flags."""
    missing = [field for field in REQUIRED_FIELDS if field not in row or row[field] in (None, "")]
    if missing:
        raise ValueError(f"missing required field(s): {', '.join(missing)}")
    try:
        voltage = float(row["voltage_v"])
        current = float(row["current_a"])
        temperature = float(row["temperature_c"])
    except (TypeError, ValueError) as exc:
        raise ValueError("voltage_v, current_a and temperature_c must be numbers") from exc

    if not all(math.isfinite(value) for value in (voltage, current, temperature)):
        raise ValueError("measurements must be finite numbers")
    if voltage < 0 or current < 0:
        raise ValueError("voltage_v and current_a cannot be negative")

    alerts: list[str] = []
    if voltage < VOLTAGE_MIN_V:
        alerts.append("UNDER_VOLTAGE")
    if voltage > VOLTAGE_MAX_V:
        alerts.append("OVER_VOLTAGE")
    if current > CURRENT_MAX_A:
        alerts.append("HIGH_CURRENT")
    if temperature >= TEMPERATURE_MAX_C:
        alerts.append("HIGH_TEMPERATURE")

    return {
        "reading_id": str(row["reading_id"]).strip(),
        "timestamp": str(row["timestamp"]).strip(),
        "voltage_v": voltage,
        "current_a": current,
        "temperature_c": temperature,
        # Voltage × current is apparent power, not measured real AC power.
        "apparent_power_va": voltage * current,
        "status": "ALERT" if alerts else "NORMAL",
        "alerts": alerts,
    }


def load_readings(path: Path) -> list[dict[str, Any]]:
    """Load and validate records from a UTF-8 CSV file."""
    with path.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("CSV is empty or has no header row")
        missing = [field for field in REQUIRED_FIELDS if field not in reader.fieldnames]
        if missing:
            raise ValueError(f"CSV is missing column(s): {', '.join(missing)}")
        results = []
        for line_number, row in enumerate(reader, start=2):
            try:
                results.append(analyze_reading(row))
            except ValueError as exc:
                raise ValueError(f"CSV line {line_number}: {exc}") from exc
        return results


def print_report(results: list[dict[str, Any]]) -> None:
    """Print a compact, human-readable terminal report."""
    print("PowerGuard — Embedded Power & Equipment Health Monitor")
    print("-" * 82)
    print(f"{'ID':<8} {'Voltage':>9} {'Current':>9} {'Temp':>8} {'VA*':>9}  Status / alerts")
    print("-" * 82)
    for item in results:
        detail = ", ".join(item["alerts"]) if item["alerts"] else "—"
        print(
            f"{item['reading_id']:<8} {item['voltage_v']:>8.1f}V "
            f"{item['current_a']:>8.2f}A {item['temperature_c']:>7.1f}C "
            f"{item['apparent_power_va']:>8.1f}  {item['status']}: {detail}"
        )
    alert_count = sum(item["status"] == "ALERT" for item in results)
    print("-" * 82)
    print(f"Readings: {len(results)} | Alerts: {alert_count} | Normal: {len(results) - alert_count}")
    print("* VA is apparent power (voltage × current), not measured real power in watts.")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Analyze PowerGuard CSV sample readings.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("data/sample_readings.csv"),
        help="CSV path (default: data/sample_readings.csv)",
    )
    args = parser.parse_args(argv)
    try:
        results = load_readings(args.input)
        if not results:
            print(f"No readings found in {args.input}.")
            return 0
        print_report(results)
    except (OSError, ValueError) as exc:
        print(f"PowerGuard error: {exc}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
