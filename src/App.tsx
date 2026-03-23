import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

export default function App() {
  // 토근 존재 여부로 로그인 체크
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return (
    <Routes>
      {/* 1. 홈: 로그인 시 진입, 아니면 로그인창으로 */}
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />}
      />

      {/* 2. 지도: 로그인 시 진입 */}
      <Route
        path="/map"
        element={
          isAuthenticated ? <MapPage /> : <Navigate to="/login" replace />
        }
      />

      {/* 3. 로그인/회원가입: 로그인 상태면 홈으로 튕겨냄 */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route path="/signup" element={<SignupPage />} />

      {/* 4. 기타 경로는 홈으로 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
