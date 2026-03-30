import client from "./client";
import type {
  EmailSendRequest,
  EmailVerifyRequest,
  SignupRequest,
  LoginRequest,
  LoginResponse,
} from "../types/auth";
import type { AxiosResponse } from "axios";

export const authApi = {
  // 1. 이메일 인증코드 발송
  sendCode: (data: EmailSendRequest) =>
    client.post("/api/auth/email/send-code", data),

  // 2. 이메일 인증코드 확인
  verifyCode: (data: EmailVerifyRequest) =>
    client.post("/api/auth/email/verify-code", data),

  // 3. 회원가입
  signup: (data: SignupRequest) => client.post("/api/auth/signup", data),

  // 4. 로그인 (응답 타입 적용)
  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    client.post("/api/auth/login", data),

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginId");
  },
};
