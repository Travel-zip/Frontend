import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import JoinPage from "./pages/JoinPage";

// 🌟 새로 만든 완벽한 통합 페이지 하나만 임포트합니다!
import TripWorkspace from "./pages/TripWorkspace";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />

      {/* 🌟 기존의 /map 과 /plan 라우트를 지우고, 이 하나로 통합합니다! */}
      {/* 주소는 그대로 /map 을 써서 다른 페이지에서 수정할 필요 없게 만듭니다. */}
      <Route
        path="/map"
        element={
          isAuthenticated ? <TripWorkspace /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />

      <Route path="/signup" element={<SignupPage />} />
      <Route path="/join/:roomId" element={<JoinPage />} />

      {/* ⚠️ 잘못된 주소로 들어오면 무조건 홈으로 보냅니다 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
