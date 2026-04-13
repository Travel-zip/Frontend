/**
 * 방(Room) 관련 타입
 */
export type Member = {
  loginId: string;
  role: "HOST" | "MEMBER";
};

export type Room = {
  roomId: string;
  hostLoginId: string | null;
  myRole: "HOST" | "MEMBER";
  joinedAt: string;
  lastActiveAt: string | null;
  isFavorite: boolean;
  members: Member[];
};

export interface CreateRoomRequest {
  roomId: string;
}

export type FavoriteResponse = {
  roomId: string;
  isFavorite: boolean;
};

/**
 * 검색(Search) 관련 타입
 */
export type SearchParams = {
  category?: string; // "attraction", "food" 등 또는 contentTypeId
  keyword: string;
  lat: number;
  lng: number;
  radius: number; // 50~2500
  roomId?: string;
};

export type SearchPlace = {
  title: string;
  addr1: string;
  mapx: number;
  mapy: number;
  firstimage: string;
  contentid: string;
  contenttypeid: string;
  dist: number;
  overview: string;
};

export type NearbyParams = {
  lat: number;
  lng: number;
  radius: number;
  categories: string; // csv 형태 (예: "attraction,food")
  roomId?: string;
};

export type NearbyPlace = {
  title: string;
  lat: number;
  lng: number;
  category: string;
  contentId: string;
};
