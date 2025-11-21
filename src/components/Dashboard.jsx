import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

import StudentForm from "../components/StudentForm.jsx";
import StudentTable from "../components/StudentTable.jsx";
import ExportButtons from "../components/ExportButtons.jsx";
import SubjectManager from "../components/SubjectManager.jsx";
import StudentChart from "../components/StudentChart.jsx";
import SubjectAverageChart from "../components/SubjectAverageChart.jsx";
import useAuth from "../hooks/useAuth";
import { toast } from "react-toastify";


export default function Dashboard() {

//  SUCCESS SOUND FUNCTION RIGHT HERE//

   const playSuccessSound = () => {
    const audio = new Audio("/sounds/success.mp3");
    audio.volume = 0.5;
    audio.play().catch(() =>{});
  };

//  DELETE SOUND FUNCTION RIGHT HERE//

const playDeleteSound = () => {
  const audio = new Audio("/sounds/delete.mp3");
  audio.volume = 0.4; // soft
  audio.play().catch(() => {});
};


  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // search + sort state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rollNo"); // rollNo | name | total | percentage
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  const colRef = useMemo(() => collection(db, "students"), []);

  // 🔁 Real-time Firestore listener (fetch everything, then we'll sort locally)
  useEffect(() => {
    const q = query(colRef);
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Default sort by rollNo (numeric)
      list.sort((a, b) => (parseInt(a.rollNo, 10) || 0) - (parseInt(b.rollNo, 10) || 0));
      setStudents(list);
    });
    return () => unsub();
  }, [colRef]);

  // 💾 Add or Update student
  const handleSave = async (payload) => {
    if (!user) return;

    if (editing?.id) {
      await setDoc(
        doc(db, "students", editing.id),
        {
          ...payload,
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
        },
        { merge: true }
      );
      toast.info("✅ Student updated successfully!");
    } else {
      await addDoc(colRef, {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      toast.success("🎉 New student added successfully!");
    }
    playSuccessSound();
    setEditing(null);
    setModalOpen(false);
  };

  // ❌ Delete student
  const handleDelete = async (s) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    await deleteDoc(doc(db, "students", s.id));
    playDeleteSound();
    toast.warn(`🗑️ ${s.name} has been deleted.`);
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    toast.success("👋 Logged out successfully!");
    window.location.href = "/login";
  };

  // 🔍 Filter first…
  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.rollNo || "").toString().toLowerCase().includes(q)
    );
  });

  // …then sort
  const filteredStudents = [...filtered].sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "rollNo") {
      const ra = parseInt(a.rollNo, 10) || 0;
      const rb = parseInt(b.rollNo, 10) || 0;
      return (ra - rb) * order;
    }
    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "") * order;
    }
    if (sortBy === "total") {
      return ((a.total || 0) - (b.total || 0)) * order;
    }
    if (sortBy === "percentage") {
      return ((a.percentage || 0) - (b.percentage || 0)) * order;
    }
    return 0;
  });

  return (
    <div className="container">
      {/* Top header */}
      <header>
        <h1>Student Marksheet</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button onClick={() => setModalOpen(true)} className="btn">+ Add Student</button>
          {/* Export respects current filter + sort */}
          <ExportButtons data={filteredStudents} />
          <button onClick={logout} className="btn-outline">Logout</button>
        </div>
      </header>

      {/* Search + Sort controls */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search by name or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        <label>Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}
        >
          <option value="rollNo">Roll No</option>
          <option value="name">Name</option>
          <option value="total">Total</option>
          <option value="percentage">Percentage</option>
        </select>

        <button
          onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
          className="btn-outline"
        >
          {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
        </button>
      </div>

      {/* Marksheet header look */}
      <div className="marksheet-header">
        <h2>Webworks Institute of Technology</h2>
        <p>Student Academic Record</p>
        <p style={{ fontSize: "13px", color: "#777" }}>
          Generated on: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Marksheet table */}
      <div id="marksheet" className="section">
        <StudentTable
          students={filteredStudents}
          onEdit={(s) => {
            setEditing(s);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      </div>

      {/* Signature footer */}
      <div className="marksheet-footer">
        <p>Authorized Signature: ____________________</p>
      </div>

      {/* Subject manager */}
      <SubjectManager />

      {/* Student Performance Chart */}
      <div className="chart-full">
        <StudentChart students={filteredStudents} />
      </div>

      {/* Average Marks Chart */}
      <div className="chart-full">
        <SubjectAverageChart students={filteredStudents} />
      </div>


      {/* Modal for add/edit */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? "Edit Student" : "Add Student"}</h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="btn-outline"
                style={{ padding: "4px 10px" }}
              >
                ✕
              </button>
            </div>

            <StudentForm
              initial={editing}
              students={students} // for duplicate checks
              onCancel={() => {
                setModalOpen(false);
                setEditing(null);
              }}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
