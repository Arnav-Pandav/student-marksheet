import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function SubjectManager() {
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);

  // 🔄 Real-time fetch
  useEffect(() => {
    const q = collection(db, "subjects");
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setSubjects(list);
    });

    return () => unsubscribe();
  }, []);

  // ➕ Add subject
  const handleAdd = async () => {
    const name = subjectName.trim();

    if (!name) return toast.error("Please enter a subject");

    // Prevent duplicates
    const exists = subjects.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return toast.warning("Subject already exists");

    await addDoc(collection(db, "subjects"), {
      name,
      createdAt: serverTimestamp(),
    });

    toast.success("Subject added");
    setSubjectName("");
  };

  // ❌ Delete subject
  const handleDelete = async (id) => {
    if (!confirm("Delete this subject?")) return;
    await deleteDoc(doc(db, "subjects", id));
    toast.info("Subject deleted");
  };

  return (
    <div className="subject-card animate-fadeIn">
      <h2 className="subject-title">Manage Subjects</h2>

      {/* Input row */}
      <div className="subject-input-row">
        <input
          className="subject-input"
          placeholder="Enter subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />

        <button className="subject-btn" onClick={handleAdd}>
          + Add
        </button>
      </div>

      {/* Subjects List */}
      <div className="subject-list">
        {subjects.length === 0 && (
          <p className="subject-empty">No subjects added yet.</p>
        )}

        {subjects.map((subj) => (
          <div key={subj.id} className="subject-item">
            <span>{subj.name}</span>
            <button
              className="subject-delete"
              onClick={() => handleDelete(subj.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
