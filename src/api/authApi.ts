import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";
import type {
  EmailSendRequest,
  EmailVerifyRequest,
  SignupRequest,
  LoginRequest,
  LoginResponse,
} from "../types/auth";
import type { AxiosResponse } from "axios";

export const authApi = {
  sendCode: (data: EmailSendRequest) =>
    IS_MOCK
      ? Promise.resolve(MOCK_DATA.auth.success)
      : client.post("/api/auth/email/send-code", data),

  verifyCode: (data: EmailVerifyRequest) =>
    IS_MOCK
      ? Promise.resolve(MOCK_DATA.auth.success)
      : client.post("/api/auth/email/verify-code", data),

  signup: (data: SignupRequest) =>
    IS_MOCK
      ? Promise.resolve(MOCK_DATA.auth.success)
      : client.post("/api/auth/signup", data),

  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
    if (IS_MOCK) {
      console.log("🚀 [Mock Mode] 로그인 시도:", data);
      return Promise.resolve(MOCK_DATA.auth.login as any);
    }
    return client.post("/api/auth/login", data);
  },

  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },
};
