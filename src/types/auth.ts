export interface UserInfo {
  userId: number | null;
  loginId: string;
  email: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

export interface EmailSendRequest {
  email: string;
}

export interface EmailVerifyRequest {
  email: string;
  code: string;
}

export interface SignupRequest {
  loginId: string;
  password: string;
  email: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}
