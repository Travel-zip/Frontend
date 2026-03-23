import client from "./client";
// ✅ verbatimModuleSyntax 대응: 'type' 키워드 필수
import type {
  EmailSendRequest,
  EmailVerifyRequest,
  SignupRequest,
  LoginRequest,
  LoginResponse,
} from "../types/auth";

/**
 * 회원 관리 및 인증 API (RESTful)
 */
export const authApi = {
  // 1-1) 이메일 인증코드 발송
  // 회원가입 전 사용자의 이메일로 6자리 코드를 보냄
  sendEmailCode: (data: EmailSendRequest) => {
    return client.post("/api/auth/email/send-code", data);
  },

  // 1-2) 이메일 인증코드 확인
  // 사용자가 입력한 코드를 검증하고 인증 상태를 저장함
  verifyEmailCode: (data: EmailVerifyRequest) => {
    return client.post("/api/auth/email/verify-code", data);
  },

  // 1-3) 회원가입
  // 이메일 인증이 완료된 사용자 정보를 서버에 등록함
  signup: (data: SignupRequest) => {
    return client.post("/api/auth/signup", data);
  },

  // 1-4) 로그인
  // 아이디와 비밀번호를 검증하고 JWT(accessToken)를 발급받음
  login: (data: LoginRequest) => {
    return client.post<LoginResponse>("/api/auth/login", data);
  },

  // 로그아웃 (클라이언트 측 처리)
  logout: () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  },
};
