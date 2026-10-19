(function () {
  "use strict";

  const LIMITS = { voltageMin: 207, voltageMax: 253, currentMax: 1.5, temperatureMax: 60 };
  const state = { readings: [], filter: "all", query: "" };
  let installPrompt = null;
  let toastTimer = null;
  const byId = (id) => document.getElementById(id);
  const fmt = (value, places) => Number(value).toFixed(places);
  const escapeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error("The sample file has no reading rows.");
    const headers = lines[0].split(",").map((item) => item.trim());
    const required = ["reading_id", "timestamp", "voltage_v", "current_a", "temperature_c"];
    if (required.some((name) => !headers.includes(name))) throw new Error("The sample CSV is missing a required column.");
    return lines.slice(1).filter((line) => line.trim()).map((line, index) => {
      const cells = line.split(",");
      const raw = {};
      headers.forEach((header, cellIndex) => { raw[header] = (cells[cellIndex] || "").trim(); });
      const voltage = Number(raw.voltage_v);
      const current = Number(raw.current_a);
      const temperature = Number(raw.temperature_c);
      if (!raw.reading_id || !raw.timestamp || ![voltage, current, temperature].every(Number.isFinite) || voltage < 0 || current < 0) {
        throw new Error("Invalid measurement on sample CSV row " + (index + 2) + ".");
      }
      const alerts = [];
      if (voltage < LIMITS.voltageMin) alerts.push("UNDER_VOLTAGE");
      if (voltage > LIMITS.voltageMax) alerts.push("OVER_VOLTAGE");
      if (current > LIMITS.currentMax) alerts.push("HIGH_CURRENT");
      if (temperature >= LIMITS.temperatureMax) alerts.push("HIGH_TEMPERATURE");
      return { id: raw.reading_id, timestamp: raw.timestamp, voltage, current, temperature,
        apparentPower: voltage * current, alerts, status: alerts.length ? "ALERT" : "NORMAL" };
    });
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function setError(message) {
    byId("datasetStatus").textContent = "Dataset could not be loaded";
    byId("readingsBody").innerHTML = '<tr><td colspan="7" class="loading-state">' + escapeText(message) + '</td></tr>';
    byId("chartWrap").innerHTML = '<div class="loading-state">' + escapeText(message) + '</div>';
    showToast(message);
  }

  function renderMetrics() {
    const rows = state.readings;
    const alerts = rows.filter((row) => row.status === "ALERT").length;
    const mean = rows.reduce((sum, row) => sum + row.voltage, 0) / (rows.length || 1);
    byId("totalCount").textContent = String(rows.length);
    byId("alertCount").textContent = String(alerts);
    byId("normalCount").textContent = String(rows.length - alerts);
    byId("meanVoltage").textContent = fmt(mean, 1) + " V";
    const counts = { UNDER_VOLTAGE: 0, OVER_VOLTAGE: 0, HIGH_CURRENT: 0, HIGH_TEMPERATURE: 0 };
    rows.forEach((row) => row.alerts.forEach((flag) => { counts[flag] += 1; }));
    byId("underVoltageCount").textContent = counts.UNDER_VOLTAGE;
    byId("overVoltageCount").textContent = counts.OVER_VOLTAGE;
    byId("highCurrentCount").textContent = counts.HIGH_CURRENT;
    byId("highTemperatureCount").textContent = counts.HIGH_TEMPERATURE;
    byId("datasetStatus").textContent = rows.length + " synthetic records · bundled CSV";
  }

  function renderChart() {
    const rows = state.readings;
    if (!rows.length) return;
    const width = 760, height = 236, left = 43, right = 12, top = 15, bottom = 33;
    const plotWidth = width - left - right, plotHeight = height - top - bottom, minY = 190, maxY = 265;
    const xAt = (i) => left + (rows.length === 1 ? plotWidth / 2 : i * plotWidth / (rows.length - 1));
    const yAt = (value) => top + ((maxY - value) / (maxY - minY)) * plotHeight;
    let svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Voltage for each synthetic reading. Dashed lines show example limits at 207 and 253 volts.">';
    [200, 220, 240, 260].forEach((tick) => {
      const y = yAt(tick);
      svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (width-right) + '" y2="' + y + '" stroke="rgba(171,197,220,.10)"/>';
      svg += '<text x="' + (left-9) + '" y="' + (y+4) + '" text-anchor="end">' + tick + '</text>';
    });
    [LIMITS.voltageMin, LIMITS.voltageMax].forEach((limit) => {
      const y = yAt(limit);
      svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (width-right) + '" y2="' + y + '" stroke="#f27c8b" stroke-width="1.2" stroke-dasharray="5 5"/>';
    });
    const points = rows.map((row, i) => ({ x: xAt(i), y: yAt(row.voltage), row }));
    const line = points.map((point, i) => (i ? "L " : "M ") + point.x.toFixed(1) + " " + point.y.toFixed(1)).join(" ");
    const area = line + " L " + points[points.length-1].x + " " + (height-bottom) + " L " + points[0].x + " " + (height-bottom) + " Z";
    svg += '<path d="' + area + '" fill="rgba(85,223,197,.07)"/><path d="' + line + '" fill="none" stroke="#55dfc5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    points.forEach((point) => {
      const flagged = point.row.voltage < LIMITS.voltageMin || point.row.voltage > LIMITS.voltageMax;
      svg += '<circle cx="' + point.x.toFixed(1) + '" cy="' + point.y.toFixed(1) + '" r="4" fill="#111f31" stroke="' + (flagged ? "#f27c8b" : "#55dfc5") + '" stroke-width="2"><title>' + escapeText(point.row.id) + ': ' + fmt(point.row.voltage, 1) + ' V</title></circle>';
    });
    const labelStep = Math.max(1, Math.ceil(rows.length/5));
    points.forEach((point, index) => {
      if (index % labelStep === 0 || index === points.length-1) {
        svg += '<text x="' + point.x.toFixed(1) + '" y="' + (height-10) + '" text-anchor="middle">' + escapeText(point.row.id) + '</text>';
      }
    });
    svg += '<text x="' + (width-right) + '" y="' + (yAt(253)-6) + '" text-anchor="end">253 V</text><text x="' + (width-right) + '" y="' + (yAt(207)+13) + '" text-anchor="end">207 V</text></svg>';
    byId("chartWrap").innerHTML = svg;
  }

  function visibleRows() {
    const query = state.query.toLowerCase().trim();
    return state.readings.filter((row) => {
      if (state.filter === "alert" && row.status !== "ALERT") return false;
      if (state.filter === "normal" && row.status !== "NORMAL") return false;
      return !query || [row.id, row.timestamp, row.status].concat(row.alerts).join(" ").toLowerCase().includes(query);
    });
  }

  function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function renderTable() {
    const rows = visibleRows();
    const body = byId("readingsBody");
    body.replaceChildren();
    if (!rows.length) {
      const tr = document.createElement("tr");
      const td = addCell(tr, "No readings match this search.");
      td.colSpan = 7; td.className = "loading-state";
      body.appendChild(tr);
    }
    rows.forEach((reading) => {
      const tr = document.createElement("tr");
      addCell(tr, reading.id);
      addCell(tr, reading.timestamp.replace("T", " "));
      const voltage = addCell(tr, fmt(reading.voltage, 1) + " V");
      const current = addCell(tr, fmt(reading.current, 2) + " A");
      const temperature = addCell(tr, fmt(reading.temperature, 1) + " °C");
      addCell(tr, fmt(reading.apparentPower, 1) + " VA");
      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "reading-status " + (reading.status === "ALERT" ? "status-alert" : "status-normal");
      badge.textContent = reading.status;
      statusCell.appendChild(badge);
      if (reading.alerts.length) {
        const detail = document.createElement("small");
        detail.className = "alert-detail";
        detail.textContent = reading.alerts.join(", ");
        statusCell.appendChild(detail);
      }
      tr.appendChild(statusCell);
      if (reading.voltage < LIMITS.voltageMin || reading.voltage > LIMITS.voltageMax) voltage.style.color = "#f27c8b";
      if (reading.current > LIMITS.currentMax) current.style.color = "#f27c8b";
      if (reading.temperature >= LIMITS.temperatureMax) temperature.style.color = "#f27c8b";
      body.appendChild(tr);
    });
    byId("rowCount").textContent = rows.length + (rows.length === 1 ? " record" : " records");
    byId("tableHint").textContent = "Synthetic sample data";
    byId("exportButton").disabled = rows.length === 0;
  }

  function exportCsv() {
    const rows = visibleRows();
    if (!rows.length) return;
    const lines = [["reading_id","timestamp","voltage_v","current_a","temperature_c","apparent_power_va","status","alerts"].join(",")];
    rows.forEach((row) => {
      const values = [row.id, row.timestamp, fmt(row.voltage,1), fmt(row.current,2), fmt(row.temperature,1), fmt(row.apparentPower,1), row.status, row.alerts.join("|")];
      lines.push(values.map((value) => '"' + String(value).replace(/"/g, '""') + '"').join(","));
    });
    const url = URL.createObjectURL(new Blob([lines.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "powerguard-readings.csv";
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    showToast("CSV exported for " + rows.length + (rows.length === 1 ? " record." : " records."));
  }

  function bindControls() {
    byId("searchInput").disabled = false;
    byId("statusFilter").disabled = false;
    byId("searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderTable(); });
    byId("statusFilter").addEventListener("change", (event) => { state.filter = event.target.value; renderTable(); });
    byId("exportButton").addEventListener("click", exportCsv);
    byId("installButton").addEventListener("click", async () => {
      if (!installPrompt) {
        showToast("Use your browser menu and choose Install app or Add to Home Screen where supported.");
        return;
      }
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      installPrompt = null;
      byId("installButton").hidden = true;
      if (choice && choice.outcome === "accepted") showToast("Install request accepted by your browser.");
    });
  }

  async function start() {
    try {
      const response = await fetch("./data/sample_readings.csv");
      if (!response.ok) throw new Error("Could not load sample CSV (HTTP " + response.status + ").");
      state.readings = parseCsv(await response.text());
      renderMetrics(); renderChart(); renderTable(); bindControls();
      if ("serviceWorker" in navigator && location.protocol !== "file:") {
        navigator.serviceWorker.register("./sw.js").catch(() => showToast("Offline caching is unavailable in this browser session."));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load the sample data.";
      byId("datasetStatus").textContent = "Dataset could not be loaded";
      byId("readingsBody").innerHTML = '<tr><td colspan="7" class="loading-state">' + escapeText(message) + '</td></tr>';
      byId("chartWrap").innerHTML = '<div class="loading-state">' + escapeText(message) + '</div>';
      showToast(message);
    }
  }

  function showToast(message) {
    const toast = byId("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    byId("installButton").hidden = false;
  });
  window.addEventListener("appinstalled", () => { byId("installButton").hidden = true; showToast("PowerGuard was installed."); });
  document.querySelectorAll(".main-nav .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".main-nav .nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });
  start();
}());