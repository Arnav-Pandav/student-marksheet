import React, { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SubjectAverageChart({ students }) {
  const chartRef = useRef(null);

  // Get subject list dynamically
  const subjects = students.length
    ? Object.keys(students[0].marks)
    : [];

  // Calculate subject averages
  const averages = useMemo(() => {
    return subjects.map((subj) => {
      const sum = students.reduce((acc, s) => acc + (s.marks[subj] || 0), 0);
      const avg = students.length === 0 ? 0 : sum / students.length;
      return { subject: subj, avg: avg.toFixed(1) };
    });
  }, [students, subjects]);

  // Gradient Colors
  const gradientColors = [
    "#4A6CF7",
    "#00C49A",
    "#FFB84C",
    "#FF6A89",
    "#845EF7",
    "#17A2B8",
    "#FF8F00",
  ];

  // Chart Data
  const chartData = {
    labels: averages.map((a) => a.subject),
    datasets: [
      {
        data: averages.map((a) => a.avg),
        backgroundColor: averages.map(
          (_, i) => gradientColors[i % gradientColors.length]
        ),
        hoverOffset: 15,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 14, family: "Poppins" },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: "#1e1e1e",
        titleColor: "#fff",
        bodyColor: "#eee",
        padding: 10,
        borderColor: "#444",
        borderWidth: 1,
      },
    },
    cutout: "65%", // donut thickness
  };

  // Export PNG
  const exportPNG = async () => {
    if (!chartRef.current) return;
    const canvas = chartRef.current.canvas;

    const img = await html2canvas(canvas, { scale: 2 });
    const link = document.createElement("a");
    link.download = "subject-averages.png";
    link.href = img.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="chart-container"
      style={{
        marginTop: "30px",
        background: "white",
        padding: "25px",
        borderRadius: "14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* Heading + Export Button */}
      <div className="chart-header">
        <h2>📘 Average Marks By Subject</h2>

        <button onClick={exportPNG} className="btn">
          📸 Export PNG
        </button>
      </div>

      {/* Donut Chart */}
      <div style={{ width: "100%", height: "330px", marginTop: "10px" }}>
        <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* Center Text */}
      <div
        style={{
          textAlign: "center",
          marginTop: "15px",
          color: "#444",
          fontSize: "15px",
        }}
      >
        Overall Average Score:{" "}
        <strong>
          {(
            averages.reduce((sum, a) => sum + Number(a.avg), 0) /
            (averages.length || 1)
          ).toFixed(1)}
          %
        </strong>
      </div>
    </div>
  );
}
