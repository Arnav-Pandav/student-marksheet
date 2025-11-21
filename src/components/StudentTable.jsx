import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function StudentTable({ students, onEdit, onDelete }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setSubjects(snap.docs.map((d) => d.data().name));
    });
    return () => unsub();
  }, []);

  return (
    <div className="table-wrapper" id="marksheet">
      <table className="student-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>

            {subjects.map((subj) => (
              <th key={subj}>{subj}</th>
            ))}

            <th>Total</th>
            <th>Percentage</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.id} className={s.deleting ? "row-deleting" : ""}>
              <td>{s.rollNo}</td>
              <td>{s.name}</td>

              {subjects.map((subj) => (
                <td key={subj}>{s.marks?.[subj] ?? "-"}</td>
              ))}

              <td>{s.total}</td>
              <td>{s.percentage}%</td>

              <td className="actions-cell">
                <button className="btn-outline" onClick={() => onEdit(s)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => onDelete(s)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
              <td colSpan={subjects.length + 4} className="no-data">
                No students yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
