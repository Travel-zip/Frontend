/**
 * 유저 기본 정보 (회원 관리)
 */
export type UserProfile = {
  loginId: string;
  email: string;
  nickname?: string;
  profileImage?: string;
};

/**
 *이메일 인증코드 발송 요청
 */
export type EmailSendRequest = {
  email: string;
};

/**
 *이메일 인증코드 확인 요청
 */
export type EmailVerifyRequest = {
  email: string;
  code: string; // 6자리 숫자 형태의 문자열
};

/**
 *회원가입 요청
 */
export type SignupRequest = {
  loginId: string;
  password: string;
  email: string;
};

/**
 *로그인 요청
 */
export type LoginRequest = {
  loginId: string;
  password: string;
};

/**
 * 로그인 성공 응답
 */
export type LoginResponse = {
  accessToken: string;
};
