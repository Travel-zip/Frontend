import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 🌟 1. 토스트 임포트 추가!

import Home from "./pages/Home";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import JoinPage from "./pages/JoinPage";
import TripWorkspace from "./pages/TripWorkspace";

export default function App() {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  return (
    <>
      {" "}
      {/* 🌟 2. 요렇게 빈 껍데기로 전체를 감싸줍니다 */}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Home /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/map"
          element={
            isAuthenticated ? (
              <TripWorkspace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/join/:roomId" element={<JoinPage />} />

        {/* ⚠️ 잘못된 주소로 들어오면 무조건 홈으로 보냅니다 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* 🌟 3. Routes 바로 밑에 토스트 기계 설치! (페이지가 넘어가도 알림이 유지됨) */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#333",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "12px 24px",
          },
        }}
      />
    </>
  );
}
