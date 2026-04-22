import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ loginId, password });
      const { accessToken, user } = res.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("loginId", user.loginId);

      // 🌟 success 달아주기 & reload 지우기!
      toast.success(`반갑습니다, ${user.loginId}님!`);
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      // window.location.reload(); 👈 삭제!!!
    } catch (err: any) {
      // 🌟 error 달아주기!
      toast.error(err.response?.data?.message || "로그인 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 pt-32 max-w-[480px] mx-auto">
      <h1 className="text-title1 mb-14">
        여행의 시작,
        <br />
        로그인부터!
      </h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <input
          className="w-full p-4 rounded-[10px] border-2 border-gray-200"
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-4 rounded-[10px] border-2 border-gray-200"
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
          />
          <Button
            label="회원가입"
            variant="outline"
            type="button"
            onClick={() => navigate("/signup")}
            customSize="w-full py-5"
          />
        </div>
      </form>
    </div>
  );
}
