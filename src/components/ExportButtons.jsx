import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

export default function ExportButtons({ data }) {
  // ✅ Export PDF
  const exportPDF = async () => {
    const el = document.getElementById("marksheet");
    if (!el) {
      alert("Table not found. Make sure the table has id='marksheet'.");
      return;
    }

    try {
      // 🖼️ Render the DOM section to canvas (safe, plain CSS colors)
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 🧾 Add custom header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Student Marksheet — Webworks by Arnav", 14, 15);
      pdf.setFontSize(11);
      pdf.setTextColor(100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

      // 🖼️ Add captured image
      const yOffset = 28;
      let heightLeft = imgHeight;
      let position = yOffset;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + yOffset;
        pdf.addPage();
        pdf.text("Student Marksheet — Webworks by Arnav", 14, 15);
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`students-${new Date().toISOString().split("T")[0]}.pdf`);
      console.log("✅ PDF exported successfully");
    } catch (err) {
      console.error("❌ PDF export failed:", err);
      alert("PDF export failed — check console for details.");
    }
  };

  // ✅ Export Excel
  const exportExcel = () => {
    try {
      const rows = data.map((s) => ({
        RollNo: s.rollNo,
        Name: s.name,
        Math: s.marks?.Math ?? 0,
        Science: s.marks?.Science ?? 0,
        English: s.marks?.English ?? 0,
        Total: s.total,
        Percentage: s.percentage,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(
        wb,
        `students-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      console.log("✅ Excel exported successfully");
    } catch (err) {
      console.error("❌ Excel export failed:", err);
      alert("Excel export failed — check console for details.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }} className="export-buttons">
      <button onClick={exportPDF} className="btn-outline">
        Export PDF
      </button>
      <button onClick={exportExcel} className="btn-outline">
        Export Excel
      </button>
    </div>
  );
}
