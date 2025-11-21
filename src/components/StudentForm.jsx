import { useState, useEffect } from "react";
import { totalsFromMarks } from "../utils/calc";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function StudentForm({ initial, onCancel, onSave, students = [] }) {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState(initial?.name || "");
  const [rollNo, setRollNo] = useState(initial?.rollNo || "");
  const [marks, setMarks] = useState({});

  // 🔁 Load subjects from Firestore (NO FALLBACK)
  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => d.data().name);
      setSubjects(list);

      // Ensure marks keys match subjects
      setMarks((prev) => {
        const updated = {};
        list.forEach((subj) => {
          updated[subj] = prev[subj] ?? "";
        });
        return updated;
      });
    });

    return () => unsub();
  }, []);

  // 🔁 Handle editing mode
  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setRollNo(initial.rollNo || "");

      // ensure marks only contains existing subjects
      setMarks((prev) => {
        const updated = {};
        subjects.forEach((s) => {
          updated[s] = initial.marks?.[s] ?? "";
        });
        return updated;
      });
    }
  }, [initial, subjects]);

  // 📝 Handle typing marks
  const handleChange = (subject, value) => {
    if (value === "" || (Number(value) <= 100 && value.length <= 3)) {
      setMarks((m) => ({ ...m, [subject]: value }));
    }
  };

  // 🧮 Total + Percentage
  const calculatedMarks = Object.fromEntries(
    Object.entries(marks).map(([subj, val]) => [subj, Number(val) || 0])
  );

  const { total, percentage } = totalsFromMarks(calculatedMarks);

  // 💾 Save student
  const submit = (e) => {
    e.preventDefault();

    // Prevent duplicate name or roll number
    const duplicate = students.find(
      (s) =>
        !initial &&
        (s.rollNo.toLowerCase() === rollNo.toLowerCase() ||
         s.name.toLowerCase() === name.toLowerCase())
    );

    if (duplicate) {
      alert("⚠️ Student with this name or roll number already exists!");
      return;
    }

    onSave({
      name,
      rollNo,
      marks: calculatedMarks,
      total,
      percentage,
    });

    setName("");
    setRollNo("");
    setMarks({});
  };

  return (
    <form onSubmit={submit} className="form-container">
      {/* Student Info */}
      <div className="form-row">
        <input
          className="input-field"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="input-field"
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />
      </div>

      {/* SUBJECT MARKS */}
      <div className="marks-grid">
        {subjects.length === 0 ? (
          <p style={{ color: "#777" }}>No subjects found. Add subjects first.</p>
        ) : (
          subjects.map((subject) => (
            <div key={subject} className="marks-item">
              <label className="marks-label">{subject}</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-field"
                value={marks[subject] ?? ""}
                onChange={(e) => handleChange(subject, e.target.value)}
                onFocus={(e) => e.target.select()}
              />
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="form-totals">
        <p>Total: <span>{total}</span></p>
        <p>Percentage: <span>{percentage}%</span></p>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancel
        </button>
        <button type="submit" className="btn">
          Save
        </button>
      </div>
    </form>
  );
}
