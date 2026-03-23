import { useState } from "react";
import Button from "../../components/common/Button";
import { authApi } from "../../api/authApi";

export default function SignupPage() {
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState(""); // userName 대신 email 추가
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 비밀번호 일치 여부 확인
  const isPasswordMatch = password === passwordConfirm && password !== "";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // ✅ 1. API 호출 (명세서 규격: loginId, password, email)
      await authApi.signup({
        loginId,
        password,
        email,
      });

      // 2. 성공 시 처리
      alert("회원가입 성공! 로그인 페이지로 이동함.");
      window.location.href = "/login";
    } catch (err: any) {
      // 에러 처리 (중복 아이디, 중복 이메일 등)
      const errorMsg =
        err.response?.data?.message ||
        "회원가입 실패했습니다. 입력 정보를 확인하세요.";
      alert(errorMsg);
    }
  };

  const inputStyle =
    "w-full p-4 rounded-[10px] border-2 border-gray-200 bg-gray-50 outline-none focus:border-primary-600 transition-all placeholder:text-gray-300 text-body3";

  const labelStyle = "text-body4 text-gray-600 ml-1 font-semibold";

  return (
    <div className="min-h-screen bg-white flex flex-col p-8 pt-20 max-w-[480px] mx-auto overflow-y-auto">
      <div className="mb-14">
        <h1 className="text-title1 text-gray-900 leading-tight">
          거의 다 됐어요!
          <br />
          정보를 입력해볼까요?
        </h1>
        <p className="text-body2 text-gray-400 mt-4 font-medium">
          이메일 인증이 완료된 주소를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-6 pb-10">
        {/* 아이디 입력 */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>아이디</label>
          <input
            type="text"
            className={inputStyle}
            placeholder="아이디를 입력해주세요"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
        </div>

        {/* 이메일 입력 (명세서 반영) */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>이메일</label>
          <input
            type="email"
            className={inputStyle}
            placeholder="인증받은 이메일을 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>비밀번호</label>
          <input
            type="password"
            className={inputStyle}
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>비밀번호 확인</label>
          <input
            type="password"
            className={`${inputStyle} ${
              passwordConfirm && !isPasswordMatch ? "border-error-default" : ""
            }`}
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          {passwordConfirm && !isPasswordMatch && (
            <span className="text-caption text-error-default ml-1 mt-1">
              비밀번호가 일치하지 않음!
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <Button
            label="회원가입 완료"
            variant="solid"
            type="submit"
            customSize="w-full py-5"
            textClassName="text-body1"
            disabled={!isPasswordMatch && passwordConfirm !== ""}
          />
          <Button
            label="로그인으로 돌아가기"
            variant="outline"
            type="button"
            onClick={() => (window.location.href = "/login")}
            customSize="w-full py-5"
            textClassName="text-body1"
            className="border-primary-100"
          />
        </div>
      </form>
    </div>
  );
}
