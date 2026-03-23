/**
 * 방 멤버 정보
 */
export type Member = {
  loginId: string;
  role: "HOST" | "MEMBER";
};

/**
 *방 상세 정보 (리스트 및 아카이브용)
 */
export type Room = {
  roomId: string;
  hostLoginId: string | null;
  myRole: "HOST" | "MEMBER";
  joinedAt: string; // ISO 8601 날짜 문자열
  lastActiveAt: string | null;
  isFavorite: boolean; // 즐겨찾기 상태 (별표 표시용)
  members: Member[];
};

/**
 *방 생성 요청
 */
export type CreateRoomRequest = {
  roomId: string;
};

/**
 *즐겨찾기 토글 응답
 */
export type FavoriteResponse = {
  roomId: string;
  isFavorite: boolean;
};
