// Data arrays
const desaList = [
  "SIDO MULYO",
  "CEMPEDAK",
  "BAYU",
  "BL. TALON",
  "BUKET",
  "COT MERBO",
  "COT RHEU",
  "LHOKJOK",
  "MEUNASAH DAYAH",
  "PULO BARAT",
  "MEUNASAH KUMBANG",
  "Panton Rayek 1",
  "KR. SEPENG",
  "BL. GURAH",
  "CEMECET",
  "KR. MANYANG",
  "SEUNEBOK DRIEN",
  "BL. ADO",
  "BL. ARA",
  "COT SEUTUI",
  "ALU RAMBE",
  "MULING MEUCAT",
  "KRESEK",
  "PULO RAYEUK",
  "LANGKUTA",
  "BL. RIEK",
  "FASKES LAIN",
  "BABAH LUENG",
  "GUHA ULHEU",
  "KR. SENONG",
  "MC. BAHAGIA",
  "MEUNASAH KULAM",
  "KD. KRUENG",
  "COT SEMIYONG",
  "PULO IBOH",
  "KEUDE BLANG ARA",
  "MEURIYA",
  "P. RAYEUK 2",
  "MULING MANYANG",
  "SAWEUK",
];

const pemeriksaanList = [
  "CHOLESTEROL",
  "KADAR GULA DARAH",
  "TBC",
  "SIPILIS",
  "HIV",
  "HBSAG",
  "WIDAL",
  "ASAM URAT",
  "DARAH RUTIN",
  "URINALISA",
  "GOLONGAN DARAH",
  "CAMPAK",
  "MALARIA",
  "TRIGLISERIDA",
  "DBD",
  "SGOT",
  "SGPT",
  "T.PROTEIN",
  "R.FAKTOR",
  "CREATININT",
  "UREA",
  "ALBUMIN",
  "BIL.DIRECT",
];

// Global variables
let currentChart = null;
let exportChart = null;
let currentBulan = "";
let currentTahun = "";
let currentDataType = "";
let currentChartType = "bar";
let storedData = { desa: {}, pemeriksaan: {} };
let appStats = { totalRecords: 0, chartsGenerated: 0 };
let currentLabels = [];
let currentData = [];

// Loading and initialization
function showLoadingScreen() {
  document.getElementById("loadingScreen").classList.remove("hidden");
  document.getElementById("mainApp").style.display = "none";
}

function hideLoadingScreen() {
  document.getElementById("loadingScreen").classList.add("hidden");
  document.getElementById("mainApp").style.display = "flex";
}

// Initialize app
function initializeApp() {
  loadStoredData();
  updateMainSummary();

  // Simulate loading time
  setTimeout(() => {
    hideLoadingScreen();
    showNotification("Aplikasi siap digunakan!", "success");
  }, 2000);
}

// Storage functions (using in-memory fallback)
function loadStoredData() {
  try {
    if (typeof Storage !== "undefined") {
      const data = localStorage.getItem("storedData");
      const stats = localStorage.getItem("appStats");
      if (data) storedData = JSON.parse(data);
      if (stats) appStats = JSON.parse(stats);
    }
  } catch (e) {
    console.warn("localStorage not available, using in-memory storage");
  }
}

function saveData() {
  try {
    if (typeof Storage !== "undefined") {
      localStorage.setItem("storedData", JSON.stringify(storedData));
      localStorage.setItem("appStats", JSON.stringify(appStats));
    }
  } catch (e) {
    console.warn("localStorage not available");
  }
}

// Mobile Navigation Functions
function toggleNavMenu() {
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');

  navMenu.classList.toggle('show');
  navToggle.classList.toggle('active');

  // Update toggle icon
  const icon = navToggle.querySelector('i');
  if (navMenu.classList.contains('show')) {
    icon.className = 'fas fa-times';
  } else {
    icon.className = 'fas fa-bars';
  }
}

function closeNavMenu() {
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');

  navMenu.classList.remove('show');
  navToggle.classList.remove('active');

  // Reset toggle icon
  const icon = navToggle.querySelector('i');
  icon.className = 'fas fa-bars';
}

// Page navigation
function showPage(pageId, navLink) {
  // Hide all pages
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  // Show the target page
  document.getElementById(pageId).classList.add("active");

  // Update active state in navigation
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  if (navLink) {
    navLink.classList.add("active");
  }

  // Close mobile menu after navigation
  closeNavMenu();

  if (pageId === "main-page") updateMainSummary();
  else if (pageId === "generate-page") updateGeneratePage();
}

// Search functionality
function searchTable(type) {
  const input = document.getElementById(`search-${type}`);
  const filter = input.value.toUpperCase();
  const rows = document.querySelectorAll(`#${type}-table-body tr`);

  let visible = 0;
  rows.forEach((row) => {
    const text = row.cells[0].textContent.toUpperCase();
    const show = text.includes(filter);
    row.style.display = show ? "" : "none";
    if (show) visible++;
  });

  if (filter) showNotification(`${visible} hasil ditemukan`, "info");
}

// Table functions
function fillDesaTable() {
  const tbody = document.getElementById("desa-table-body");
  const bulanTahun = `${currentBulan}-${currentTahun}`;
  const existingData = storedData.desa[bulanTahun] || {};

  tbody.innerHTML = "";
  desaList.forEach((desa) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td><strong>${desa}</strong></td>
            <td><input type="number" class="form-control form-control-sm" name="${desa}" value="${
      existingData[desa] || "0"
    }" min="0" oninput="updateDesaSummary()"></td>
            <td><span class="badge ${
              (existingData[desa] || 0) > 0 ? "bg-success" : "bg-secondary"
            }">${
      (existingData[desa] || 0) > 0 ? "Terisi" : "Kosong"
    }</span></td>
        `;
  });

  updateDesaSummary();
  document.getElementById("desaSummary").classList.remove("d-none");
}

function fillPemeriksaanTable() {
  const tbody = document.getElementById("pemeriksaan-table-body");
  const bulanTahun = `${currentBulan}-${currentTahun}`;
  const existingData = storedData.pemeriksaan[bulanTahun] || {};

  tbody.innerHTML = "";
  pemeriksaanList.forEach((item) => {
    const row = tbody.insertRow();
    row.innerHTML = `
            <td><strong>${item}</strong></td>
            <td><input type="number" class="form-control form-control-sm" name="${item}" value="${
      existingData[item] || "0"
    }" min="0" oninput="updatePemeriksaanSummary()"></td>
            <td><span class="badge ${
              (existingData[item] || 0) > 0 ? "bg-success" : "bg-secondary"
            }">${
      (existingData[item] || 0) > 0 ? "Terisi" : "Kosong"
    }</span></td>
        `;
  });

  updatePemeriksaanSummary();
  document.getElementById("pemeriksaanSummary").classList.remove("d-none");
}

// Summary updates
function updateDesaSummary() {
  const inputs = document.querySelectorAll("#desa-table-body input");
  let total = 0,
    filled = 0;

  inputs.forEach((input) => {
    const value = parseInt(input.value) || 0;
    total += value;
    if (value > 0) filled++;

    const badge = input.closest("tr").querySelector(".badge");
    badge.className = `badge ${value > 0 ? "bg-success" : "bg-secondary"}`;
    badge.textContent = value > 0 ? "Terisi" : "Kosong";
  });

  document.getElementById("totalDesaCount").textContent = desaList.length;
  document.getElementById("filledDesaCount").textContent = filled;
  document.getElementById("totalDesaValue").textContent =
    total.toLocaleString();
  document.getElementById("desaProgress").style.width = `${
    (filled / desaList.length) * 100
  }%`;
}

function updatePemeriksaanSummary() {
  const inputs = document.querySelectorAll("#pemeriksaan-table-body input");
  let total = 0,
    filled = 0;

  inputs.forEach((input) => {
    const value = parseInt(input.value) || 0;
    total += value;
    if (value > 0) filled++;

    const badge = input.closest("tr").querySelector(".badge");
    badge.className = `badge ${value > 0 ? "bg-success" : "bg-secondary"}`;
    badge.textContent = value > 0 ? "Terisi" : "Kosong";
  });

  document.getElementById("totalPemeriksaanCount").textContent =
    pemeriksaanList.length;
  document.getElementById("filledPemeriksaanCount").textContent = filled;
  document.getElementById("totalPemeriksaanValue").textContent =
    total.toLocaleString();
  document.getElementById("pemeriksaanProgress").style.width = `${
    (filled / pemeriksaanList.length) * 100
  }%`;
}

function updateMainSummary() {
  const desaCount = Object.keys(storedData.desa).length;
  const labCount = Object.keys(storedData.pemeriksaan).length;
  const totalMonths = new Set([
    ...Object.keys(storedData.desa),
    ...Object.keys(storedData.pemeriksaan),
  ]).size;

  document.getElementById("totalDesaData").textContent = desaCount;
  document.getElementById("totalPemeriksaanData").textContent = labCount;
  document.getElementById("totalMonths").textContent = totalMonths;
}

function updateGeneratePage() {
  document.getElementById("availableDesaMonths").textContent = Object.keys(
    storedData.desa
  ).length;
  document.getElementById("availablePemeriksaanMonths").textContent =
    Object.keys(storedData.pemeriksaan).length;
  document.getElementById("totalCharts").textContent = appStats.chartsGenerated;
}

// Auto-fill functions
function autoFillDesa() {
  const inputs = document.querySelectorAll("#desa-table-body input");
  if (inputs.length === 0) {
    showNotification("Data desa belum dimuat!", "error");
    return;
  }

  inputs.forEach((input) => {
    input.value = Math.floor(Math.random() * 100) + 1;
  });
  updateDesaSummary();
  showNotification("Sample data desa berhasil di-generate!", "success");
}

function autoFillPemeriksaan() {
  const inputs = document.querySelectorAll("#pemeriksaan-table-body input");
  if (inputs.length === 0) {
    showNotification("Data lab belum dimuat!", "error");
    return;
  }

  inputs.forEach((input) => {
    input.value = Math.floor(Math.random() * 200) + 1;
  });
  updatePemeriksaanSummary();
  showNotification("Sample data lab berhasil di-generate!", "success");
}

// Clear functions
function clearDesaForm() {
  const inputs = document.querySelectorAll("#desa-table-body input");
  if (inputs.length === 0) {
    showNotification("Data desa belum dimuat!", "error");
    return;
  }

  inputs.forEach((input) => (input.value = "0"));
  updateDesaSummary();
  showNotification("Form desa di-reset!", "info");
}

function clearPemeriksaanForm() {
  const inputs = document.querySelectorAll("#pemeriksaan-table-body input");
  if (inputs.length === 0) {
    showNotification("Data lab belum dimuat!", "error");
    return;
  }

  inputs.forEach((input) => (input.value = "0"));
  updatePemeriksaanSummary();
  showNotification("Form lab di-reset!", "info");
}

// Chart functions
function updateAvailableMonths() {
  const dataType = document.getElementById("dataType").value;
  const select = document.getElementById("generateBulan");

  select.innerHTML = '<option value="">-- Pilih Bulan --</option>';

  if (!dataType) return;

  const months = new Set();
  Object.keys(storedData[dataType]).forEach((key) => {
    months.add(key.split("-")[0]);
  });

  const monthNames = [
    "",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  Array.from(months)
    .sort()
    .forEach((month) => {
      const option = document.createElement("option");
      option.value = month;
      option.textContent = monthNames[parseInt(month)];
      select.appendChild(option);
    });
}

function getNamaBulan(bulan) {
  const names = [
    "",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return names[parseInt(bulan)];
}

function getChartConfig(
  labels,
  data,
  type,
  bulan,
  tahun,
  chartType,
  isExport = false
) {
  const title =
    type === "desa"
      ? `DATA JUMLAH PEMERIKSAAN LABORATORIUM PERDESA\nBULAN ${getNamaBulan(
          bulan
        ).toUpperCase()} ${tahun}`
      : `DATA PEMERIKSAAN LABORATORIUM\nBULAN ${getNamaBulan(
          bulan
        ).toUpperCase()} ${tahun}`;

  const maxValue = Math.max(...data);
  const singleColor = "#4A90E2";
  const borderColor = "#357ABD";

  return {
    type: chartType,
    data: {
      labels: labels,
      datasets: [
        {
          label: "Jumlah",
          data: data,
          backgroundColor:
            chartType === "pie" || chartType === "doughnut"
              ? generateColors(data.length).bg
              : singleColor,
          borderColor:
            chartType === "pie" || chartType === "doughnut"
              ? generateColors(data.length).border
              : borderColor,
          borderWidth: 1,
          barThickness: "flex",
          maxBarThickness: isExport ? 50 : 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: isExport ? 1.5 : undefined,
      layout: {
        padding: {
          top: isExport ? 50 : 20,
          bottom: isExport ? 120 : 80,
          left: isExport ? 80 : 40,
          right: isExport ? 60 : 40,
        },
      },
      plugins: {
        title: {
          display: true,
          text: title.split("\n"),
          font: {
            size: isExport ? 20 : 16,
            weight: "600",
            family: "Arial, sans-serif",
          },
          color: "#000",
          padding: {
            top: 10,
            bottom: isExport ? 30 : 20,
          },
        },
        legend: {
          display: chartType === "pie" || chartType === "doughnut",
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: isExport ? 12 : 10,
            },
          },
        },
        datalabels: {
          display: true,
          color: "#000",
          font: {
            weight: "600",
            size: isExport ? 14 : 11,
            family: "Arial, sans-serif",
          },
          anchor:
            chartType === "pie" || chartType === "doughnut" ? "center" : "end",
          align:
            chartType === "pie" || chartType === "doughnut" ? "center" : "top",
          offset: chartType === "pie" || chartType === "doughnut" ? 0 : 4,
          formatter: function (value, context) {
            if (chartType === "pie" || chartType === "doughnut") {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value}\n(${percentage}%)`;
            }
            return value.toString();
          },
        },
      },
      scales: ["bar", "line"].includes(chartType)
        ? {
            y: {
              beginAtZero: true,
              max: Math.ceil(maxValue * 1.15),
              ticks: {
                stepSize: Math.ceil(maxValue / 10),
                font: {
                  size: isExport ? 14 : 11,
                  weight: "500",
                  family: "Arial, sans-serif",
                },
                color: "#000",
                callback: function (value) {
                  return value.toString();
                },
              },
              grid: {
                color: "#E0E0E0",
                lineWidth: 1,
                drawBorder: true,
                borderColor: "#000",
                borderWidth: 2,
              },
              border: {
                color: "#000",
                width: 2,
              },
            },
            x: {
              ticks: {
                maxRotation: 90,
                minRotation: 45,
                font: {
                  size: isExport ? 12 : 10,
                  weight: "500",
                  family: "Arial, sans-serif",
                },
                color: "#000",
              },
              grid: {
                display: false,
              },
              border: {
                color: "#000",
                width: 2,
              },
            },
          }
        : {},
      elements: {
        bar: {
          borderSkipped: false,
          borderRadius: 0,
        },
      },
      animation: {
        duration: isExport ? 0 : 1000,
        easing: "easeOutQuart",
      },
    },
  };
}

function createChart(labels, data, type, bulan, tahun, chartType) {
  // Store current data for export
  currentLabels = labels;
  currentData = data;

  const title =
    type === "desa"
      ? `DATA JUMLAH PEMERIKSAAN LABORATORIUM PERDESA BULAN ${getNamaBulan(
          bulan
        ).toUpperCase()} ${tahun}`
      : `DATA PEMERIKSAAN LABORATORIUM BULAN ${getNamaBulan(
          bulan
        ).toUpperCase()} ${tahun}`;

  document.getElementById("grafik-info").textContent = title;

  const maxValue = Math.max(...data);
  const average = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  document.getElementById("chartDataPoints").textContent = data.length;
  document.getElementById("chartMaxValue").textContent =
    maxValue.toLocaleString();
  document.getElementById("chartAverage").textContent =
    average.toLocaleString();

  // Only create export chart (no preview)
  createExportChart(labels, data, type, bulan, tahun, chartType);

  appStats.chartsGenerated++;
  saveData();
}

function createExportChart(labels, data, type, bulan, tahun, chartType) {
  const exportCanvas = document.getElementById("exportChart");
  if (!exportCanvas) {
    console.error("Export canvas not found");
    return;
  }

  exportCanvas.width = 1200;
  exportCanvas.height = 800;

  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) {
    console.error("Could not get export canvas context");
    return;
  }

  if (exportChart) {
    exportChart.destroy();
  }

  exportChart = new Chart(
    exportCtx,
    getChartConfig(labels, data, type, bulan, tahun, chartType, true)
  );
}

function generateColors(count) {
  const baseColors = [
    "rgba(102, 126, 234, 0.8)",
    "rgba(247, 147, 26, 0.8)",
    "rgba(76, 201, 240, 0.8)",
    "rgba(255, 107, 107, 0.8)",
    "rgba(67, 233, 123, 0.8)",
    "rgba(156, 136, 255, 0.8)",
    "rgba(255, 159, 67, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
  ];

  const bg = [],
    border = [];
  for (let i = 0; i < count; i++) {
    const color = baseColors[i % baseColors.length];
    bg.push(color);
    border.push(color.replace("0.8", "1"));
  }

  return { bg, border };
}

// Excel export
function saveAsExcel(data, type, bulan, tahun) {
  const ws = XLSX.utils.json_to_sheet(
    Object.keys(data).map((key) => ({
      [type === "desa" ? "Nama Desa" : "Jenis Pemeriksaan"]: key,
      Jumlah: data[key],
    }))
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, `data_${type}_${tahun}_${bulan}.xlsx`);
}

// Notification system
function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type} show`;
  notification.innerHTML = `<i class="fas fa-${
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "exclamation-triangle"
      : "info-circle"
  }"></i> ${message}`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Event listeners
document
  .getElementById("selectDateDesaForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    currentBulan = document.getElementById("desaBulan").value;
    currentTahun = document.getElementById("desaTahun").value;

    if (!currentBulan) {
      showNotification("Pilih bulan terlebih dahulu!", "error");
      return;
    }

    document.getElementById("current-bulan-desa").textContent =
      getNamaBulan(currentBulan);
    document.getElementById("current-tahun-desa").textContent = currentTahun;

    fillDesaTable();
    showPage(
      "input-desa-page",
      document.getElementById("nav-select-date-desa-page")
    );
  });

document
  .getElementById("selectDatePemeriksaanForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    currentBulan = document.getElementById("pemeriksaanBulan").value;
    currentTahun = document.getElementById("pemeriksaanTahun").value;

    if (!currentBulan) {
      showNotification("Pilih bulan terlebih dahulu!", "error");
      return;
    }

    document.getElementById("current-bulan-pemeriksaan").textContent =
      getNamaBulan(currentBulan);
    document.getElementById("current-tahun-pemeriksaan").textContent =
      currentTahun;

    fillPemeriksaanTable();
    showPage(
      "input-pemeriksaan-page",
      document.getElementById("nav-select-date-pemeriksaan-page")
    );
  });

document.getElementById("desaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {};
  let hasData = false;

  for (const [key, value] of formData.entries()) {
    const numValue = parseInt(value) || 0;
    data[key] = numValue;
    if (numValue > 0) hasData = true;
  }

  if (!hasData) {
    showNotification("Masukkan minimal satu data!", "error");
    return;
  }

  const bulanTahun = `${currentBulan}-${currentTahun}`;
  storedData.desa[bulanTahun] = data;
  appStats.totalRecords++;
  saveData();

  try {
    saveAsExcel(data, "desa", currentBulan, currentTahun);
    showNotification("Data desa berhasil disimpan dan di-export!", "success");
  } catch (error) {
    console.error("Error exporting Excel:", error);
    showNotification("Data desa berhasil disimpan, tetapi gagal export Excel!", "warning");
  }

  showPage("main-page", document.getElementById("nav-main-page"));
});

document
  .getElementById("pemeriksaanForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {};
    let hasData = false;

    for (const [key, value] of formData.entries()) {
      const numValue = parseInt(value) || 0;
      data[key] = numValue;
      if (numValue > 0) hasData = true;
    }

    if (!hasData) {
      showNotification("Masukkan minimal satu data!", "error");
      return;
    }

    const bulanTahun = `${currentBulan}-${currentTahun}`;
    storedData.pemeriksaan[bulanTahun] = data;
    appStats.totalRecords++;
    saveData();

    try {
      saveAsExcel(data, "pemeriksaan", currentBulan, currentTahun);
      showNotification("Data lab berhasil disimpan dan di-export!", "success");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      showNotification("Data lab berhasil disimpan, tetapi gagal export Excel!", "warning");
    }

    showPage("main-page", document.getElementById("nav-main-page"));
  });

document
  .getElementById("generateForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    currentDataType = document.getElementById("dataType").value;
    currentBulan = document.getElementById("generateBulan").value;
    currentTahun = document.getElementById("generateTahun").value;
    currentChartType = document.getElementById("chartType").value;

    if (!currentDataType || !currentBulan || !currentChartType) {
      showNotification("Lengkapi semua field!", "error");
      return;
    }

    const bulanTahun = `${currentBulan}-${currentTahun}`;
    const data = storedData[currentDataType][bulanTahun];

    if (!data) {
      showNotification("Data tidak ditemukan!", "error");
      return;
    }

    const filteredData = Object.entries(data)
      .filter(([key, value]) => value > 0)
      .sort((a, b) => b[1] - a[1]);

    if (filteredData.length === 0) {
      showNotification("Tidak ada data valid!", "error");
      return;
    }

    const labels = filteredData.map((item) => item[0]);
    const values = filteredData.map((item) => item[1]);

    createChart(
      labels,
      values,
      currentDataType,
      currentBulan,
      currentTahun,
      currentChartType
    );
    showPage("grafik-page", document.getElementById("nav-generate-page"));

    showNotification("Chart berhasil dibuat!", "success");
  });

document.getElementById("downloadBtn").addEventListener("click", function () {
  if (exportChart) {
    const exportCanvas = document.getElementById("exportChart");

    if (!exportCanvas) {
      showNotification("Chart belum dibuat!", "error");
      return;
    }

    // Create a temporary canvas with white background
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = exportCanvas.width;
    tempCanvas.height = exportCanvas.height;

    // Fill with white background
    tempCtx.fillStyle = "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the export chart on top
    tempCtx.drawImage(exportCanvas, 0, 0);

    // Download the temp canvas
    const link = document.createElement("a");
    link.download = `chart_${currentDataType}_${currentTahun}_${currentBulan}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
    showNotification("Chart berhasil didownload!", "success");
  } else {
    showNotification(
      "Chart belum dibuat! Generate chart terlebih dahulu.",
      "error"
    );
  }
});

document
  .getElementById("downloadExcelBtn")
  .addEventListener("click", function () {
    const bulanTahun = `${currentBulan}-${currentTahun}`;
    const data = storedData[currentDataType][bulanTahun];
    if (data) {
      saveAsExcel(data, currentDataType, currentBulan, currentTahun);
      showNotification("Excel berhasil didownload!", "success");
    } else {
      showNotification("Data tidak tersedia!", "error");
    }
  });

// Initialize app on page load
document.addEventListener("DOMContentLoaded", function () {
  // Show loading screen first
  showLoadingScreen();

  // Register Chart.js plugin
  if (typeof Chart !== "undefined" && typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
    console.log("Chart.js and DataLabels plugin loaded successfully");
  } else {
    console.error("Chart.js or DataLabels plugin not loaded");
  }

  // Add mobile navigation toggle event listener
  const navToggle = document.getElementById('navToggle');
  if (navToggle) {
    navToggle.addEventListener('click', toggleNavMenu);
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');

    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      closeNavMenu();
    }
  });

  // Initialize app after a delay
  setTimeout(() => {
    initializeApp();
  }, 500);
});
