import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";



export default function App() {
return (
<div className="min-h-screen">
<Routes>
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route
path="/dashboard"
element={
<PrivateRoute>
<Dashboard />
</PrivateRoute>
}
/>
<Route path="*" element={<div className="p-6">404 — <Link className="text-blue-600" to="/dashboard">Go Home</Link></div>} />
</Routes>
</div>
);
}