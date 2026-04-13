import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import PlanPage from "./pages/PlanPage";
import JoinPage from "./pages/JoinPage";
// import EmailSendPage from "./pages/Emailsendpage";
// import EmailVerifyPage from "./pages/Emailverifypage";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/map"
        element={
          isAuthenticated ? <MapPage /> : <Navigate to="/login" replace />
        }
      />
      <Route path="/plan" element={<PlanPage />} />
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />

      <Route path="/signup" element={<SignupPage />} />
      <Route path="/join/:roomId" element={<JoinPage />} />

      {/* ⚠️ 이 와일드카드 경로( Navigate to="/" )보다 위에 있어야 합니다! */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
