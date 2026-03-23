import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { authApi } from "../../api/authApi";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ loginId, password });

      // ✅ 토큰과 로그인 아이디를 함께 저장
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("loginId", loginId);

      alert("반갑습니다, " + loginId + "님!");
      navigate("/");
      window.location.reload(); // 인증 상태 갱신
    } catch (err: any) {
      alert(err.response?.data?.message || "로그인 정보를 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 pt-32 max-w-[480px] mx-auto">
      <div className="mb-14 text-title1 text-gray-900 leading-tight">
        여행의 시작,
        <br />
        로그인부터 해볼까요?
      </div>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <input
          className="w-full p-4 rounded-[10px] border-2 border-gray-200 bg-gray-50 outline-none focus:border-primary-600 text-body3"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-4 rounded-[10px] border-2 border-gray-200 bg-gray-50 outline-none focus:border-primary-600 text-body3"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="mt-12 flex flex-col gap-4">
          <Button
            label="로그인"
            variant="solid"
            type="submit"
            customSize="w-full py-5"
            textClassName="text-body1"
          />
          <Button
            label="회원가입"
            variant="outline"
            type="button"
            onClick={() => navigate("/signup")}
            customSize="w-full py-5"
            textClassName="text-body1"
          />
        </div>
      </form>
    </div>
  );
}
