import React, { useRef, useState, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StudentChart({ students }) {
  const chartRef = useRef(null);
  const [sortMode, setSortMode] = useState("name"); // name | percentage

  // -----------------------------
  // 🔢 SORTING (Animated)
  // -----------------------------
  const sortedStudents = useMemo(() => {
    const arr = [...students];
    if (sortMode === "percentage") {
      return arr.sort((a, b) => b.percentage - a.percentage);
    }
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, sortMode]);

  // -----------------------------
  // 🥇 FIND TOPPER
  // -----------------------------
  const topper = sortedStudents.reduce((max, s) =>
    s.percentage > max.percentage ? s : max,
    sortedStudents[0] || {}
  );

  // -----------------------------
  // 📘 SUBJECT LIST
  // -----------------------------
  const subjects = sortedStudents.length
    ? Object.keys(sortedStudents[0].marks)
    : [];

  // -----------------------------
  // 📊 CHART DATA
  // -----------------------------
  const chartData = {
    labels: sortedStudents.map((s) => s.name),
    datasets: subjects.map((subj, i) => ({
      label: subj,
      data: sortedStudents.map((s) => s.marks[subj] || 0),
      backgroundColor: `hsl(${(i * 60) % 360},70%,55%)`,
      borderRadius: 6,
    })),
  };

  // -----------------------------
  // ⚙️ CHART OPTIONS
  // -----------------------------
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        backgroundColor: "#1e1e1e",
        titleColor: "#fff",
        bodyColor: "#eee",
        borderWidth: 1,
        borderColor: "#444",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "#eee" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // -----------------------------
  // ✨ SUBJECT AVERAGE CALCULATION
  // -----------------------------
  const subjectAverages = subjects.map((subj) => {
    const avg =
      sortedStudents.reduce((sum, s) => sum + (s.marks[subj] || 0), 0) /
      sortedStudents.length;
    return { subj, avg: avg.toFixed(1) };
  });

  // -----------------------------
  // 📸 EXPORT AS PNG
  // -----------------------------
  const exportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = chartRef.current.canvas;

    const img = await html2canvas(canvas, { scale: 2 });
    const link = document.createElement("a");
    link.download = "student-performance.png";
    link.href = img.toDataURL();
    link.click();
  };

  return (
    <div className="chart-container">

      {/* Header */}
      <div className="chart-header">
        <h2>📊 Student Performance Overview</h2>

        <div className="chart-actions">
          {/* Sorting Toggle */}
          <button
            className="btn-outline"
            onClick={() =>
              setSortMode(sortMode === "name" ? "percentage" : "name")
            }
          >
            🔀 Sort by {sortMode === "name" ? "Percentage" : "Name"}
          </button>

          {/* Export Button */}
          <button className="btn" onClick={exportPNG}>
            📸 Export PNG
          </button>
        </div>
      </div>

      {/* Topper Badge */}
      {topper?.name && (
        <div className="topper-box">
          🏆 <strong>{topper.name}</strong> is the topper ({topper.percentage}%)
        </div>
      )}

      <div className="chart-wrapper">
        {/* Bar Chart */}
        <div className="bar-chart">
          <Bar ref={chartRef} data={chartData} options={chartOptions} />
        </div>

        {/* Subject-wise averages */}
        <div className="avg-list">
          <h4>📘 Subject Averages</h4>
          {subjectAverages.map((s, i) => (
            <p key={i}>
              <span className="avg-label">{s.subj}:</span>{" "}
              <strong>{s.avg}</strong>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
