import { useState } from "react";
import { useNavigate } from "react-router-dom"; // navigate 추가
import Button from "../../components/common/Button";
import { authApi } from "../../api/authApi";

export default function SignupPage() {
  const navigate = useNavigate();

  // 폼 입력 상태
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCode] = useState(""); // 인증번호 입력 상태 추가
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // UI 흐름 제어 상태
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 발송 여부
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부

  // 비밀번호 일치 여부 확인
  const isPasswordMatch = password === passwordConfirm && password !== "";

  // 1️⃣ 인증번호 발송
  const handleSendCode = async () => {
    if (!email) {
      alert("이메일을 먼저 입력해주세요.");
      return;
    }

    try {
      await authApi.sendCode({ email });
      setIsCodeSent(true);
      alert("인증번호가 발송되었습니다. 이메일을 확인해주세요!");
    } catch (err: any) {
      alert(err.response?.data?.message || "인증번호 발송에 실패했습니다.");
    }
  };

  // 2️⃣ 인증번호 확인
  const handleVerifyCode = async () => {
    if (!authCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    try {
      await authApi.verifyCode({ email, code: authCode });
      setIsEmailVerified(true);
      alert("이메일 인증이 완료되었습니다!");
    } catch (err: any) {
      alert(
        err.response?.data?.message || "인증번호가 틀렸거나 만료되었습니다.",
      );
    }
  };

  // 3️⃣ 최종 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      alert("이메일 인증을 먼저 완료해주세요!");
      return;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await authApi.signup({
        loginId,
        password,
        email,
      });

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/login"); // 성공 시 로그인 페이지로 이동
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "회원가입 실패했습니다. 입력 정보를 확인하세요.";
      alert(errorMsg);
    }
  };

  // 공통 스타일
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
          이메일 인증이 완료되어야 가입할 수 있어요.
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

        {/* 이메일 입력 및 인증 영역 */}
        <div className="flex flex-col gap-2">
          <label className={labelStyle}>이메일</label>
          <div className="flex gap-2">
            <input
              type="email"
              className={inputStyle}
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // 이메일이 바뀌면 인증 초기화
                setIsCodeSent(false);
                setIsEmailVerified(false);
              }}
              disabled={isEmailVerified} // 인증 완료되면 수정 불가
              required
            />
            <Button
              type="button"
              label={isCodeSent ? "재전송" : "인증받기"}
              variant={isEmailVerified ? "outline" : "solid"}
              customSize="w-[100px]"
              textClassName="text-body4"
              onClick={handleSendCode}
              disabled={isEmailVerified} // 인증 완료되면 비활성화
            />
          </div>
        </div>

        {/* 인증번호 입력 (인증번호를 발송했을 때만) */}
        {isCodeSent && !isEmailVerified && (
          <div className="flex flex-col gap-2 animate-fadeIn">
            <label className={labelStyle}>인증번호 6자리</label>
            <div className="flex gap-2">
              <input
                type="text"
                className={inputStyle}
                placeholder="인증번호를 입력해주세요"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                maxLength={6}
              />
              <Button
                type="button"
                label="확인"
                variant="solid"
                customSize="w-[100px]"
                textClassName="text-body4"
                onClick={handleVerifyCode}
              />
            </div>
          </div>
        )}

        {/* 비밀번호 입력 */}
        <div className="flex flex-col gap-2 mt-4">
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

        {/* 하단 버튼 영역 */}
        <div className="mt-8 flex flex-col gap-4">
          <Button
            label="회원가입 완료"
            variant="solid"
            type="submit"
            customSize="w-full py-5"
            textClassName="text-body1"
            // 이메일 인증이 안됐거나, 비밀번호가 안 맞으면 버튼 비활성화
            disabled={!isEmailVerified || !isPasswordMatch || password === ""}
          />
          <Button
            label="로그인으로 돌아가기"
            variant="outline"
            type="button"
            onClick={() => navigate("/login")}
            customSize="w-full py-5"
            textClassName="text-body1"
            className="border-primary-100"
          />
        </div>
      </form>
    </div>
  );
}
