import unittest
from pathlib import Path

from powerguard import analyze_reading, load_readings


def make_row(**changes):
    row = {
        "reading_id": "TEST01",
        "timestamp": "2026-10-01T09:00:00",
        "voltage_v": "230.0",
        "current_a": "0.5",
        "temperature_c": "35.0",
    }
    row.update({key: str(value) for key, value in changes.items()})
    return row


class AnalyzeReadingTests(unittest.TestCase):
    def test_normal_reading(self):
        result = analyze_reading(make_row())
        self.assertEqual(result["status"], "NORMAL")
        self.assertEqual(result["alerts"], [])
        self.assertAlmostEqual(result["apparent_power_va"], 115.0)

    def test_under_voltage(self):
        self.assertIn("UNDER_VOLTAGE", analyze_reading(make_row(voltage_v=200))["alerts"])

    def test_over_voltage(self):
        self.assertIn("OVER_VOLTAGE", analyze_reading(make_row(voltage_v=254))["alerts"])

    def test_high_current(self):
        self.assertIn("HIGH_CURRENT", analyze_reading(make_row(current_a=1.6))["alerts"])

    def test_high_temperature_boundary(self):
        self.assertIn("HIGH_TEMPERATURE", analyze_reading(make_row(temperature_c=60))["alerts"])

    def test_multiple_faults(self):
        result = analyze_reading(make_row(voltage_v=200, current_a=2, temperature_c=70))
        self.assertEqual(result["status"], "ALERT")
        self.assertEqual(len(result["alerts"]), 3)

    def test_non_numeric_input(self):
        with self.assertRaises(ValueError):
            analyze_reading(make_row(voltage_v="unknown"))

    def test_non_finite_input(self):
        with self.assertRaises(ValueError):
            analyze_reading(make_row(current_a="inf"))

    def test_negative_current(self):
        with self.assertRaises(ValueError):
            analyze_reading(make_row(current_a=-0.1))

    def test_sample_csv_has_ten_rows(self):
        data_file = Path(__file__).resolve().parents[1] / "data" / "sample_readings.csv"
        self.assertEqual(len(load_readings(data_file)), 10)


if __name__ == "__main__":
    unittest.main()
