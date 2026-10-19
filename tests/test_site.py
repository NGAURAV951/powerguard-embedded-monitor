import csv
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"


class StaticDashboardTests(unittest.TestCase):
    def test_required_assets_exist(self):
        for relative_path in (
            "index.html", "styles.css", "app.js", "manifest.webmanifest",
            "sw.js", "icon.svg", "data/sample_readings.csv",
        ):
            with self.subTest(path=relative_path):
                self.assertTrue((SITE / relative_path).is_file())

    def test_manifest_is_valid_and_has_relative_scope(self):
        manifest = json.loads((SITE / "manifest.webmanifest").read_text(encoding="utf-8"))
        self.assertEqual(manifest["name"], "PowerGuard Embedded Monitor")
        self.assertEqual(manifest["start_url"], "./")
        self.assertEqual(manifest["scope"], "./")
        self.assertTrue(manifest["icons"])

    def test_web_csv_matches_python_demo_dataset(self):
        web_csv = (SITE / "data" / "sample_readings.csv").read_text(encoding="utf-8").strip()
        source_csv = (ROOT / "data" / "sample_readings.csv").read_text(encoding="utf-8").strip()
        self.assertEqual(web_csv, source_csv)

    def test_sample_dataset_has_ten_records_and_expected_fields(self):
        with (SITE / "data" / "sample_readings.csv").open(newline="", encoding="utf-8") as handle:
            reader = csv.DictReader(handle)
            self.assertEqual(reader.fieldnames, ["reading_id", "timestamp", "voltage_v", "current_a", "temperature_c"])
            rows = list(reader)
        self.assertEqual(len(rows), 10)
        self.assertEqual(rows[0]["reading_id"], "PG001")

    def test_html_references_local_app_and_marks_demo_data(self):
        html = (SITE / "index.html").read_text(encoding="utf-8")
        for expected in ('href="./styles.css"', 'src="./app.js"', 'href="./manifest.webmanifest"',
                         "No live device connected", "Synthetic data"):
            with self.subTest(expected=expected):
                self.assertIn(expected, html)

    def test_service_worker_precaches_shell_and_csv(self):
        worker = (SITE / "sw.js").read_text(encoding="utf-8")
        for asset in ('"./index.html"', '"./app.js"', '"./data/sample_readings.csv"'):
            with self.subTest(asset=asset):
                self.assertIn(asset, worker)


if __name__ == "__main__":
    unittest.main()
