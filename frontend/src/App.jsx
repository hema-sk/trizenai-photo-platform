import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEventDetail from "./pages/AdminEventDetail";
import TeamDashboard from "./pages/TeamDashboard";
import TeamEventDetail from "./pages/TeamEventDetail";
import GalleryUnlock from "./pages/GalleryUnlock";

function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin" : "/team"}
        replace
      />
    );
  }

  return children;
}

function Home() {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Navigate
      to={user.role === "ADMIN" ? "/admin" : "/team"}
      replace
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events/:eventId"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminEventDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team"
        element={
          <ProtectedRoute role="TEAM_MEMBER">
            <TeamDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team/events/:eventId"
        element={
          <ProtectedRoute role="TEAM_MEMBER">
            <TeamEventDetail />
          </ProtectedRoute>
        }
      />

      <Route path="/gallery" element={<GalleryUnlock />} />
      <Route path="/gallery/:slug" element={<GalleryUnlock />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}