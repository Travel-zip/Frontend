import client from "./client";
import type { CreateRoomRequest, Room, FavoriteResponse } from "../types/api";

export const roomApi = {
  // 2-1) 방 생성
  createRoom: (data: CreateRoomRequest) => {
    return client.post("/api/rooms", data);
  },

  // 2-3) 방 참가 (초대 링크 등을 통해 접속 시)
  joinRoom: (roomId: string) => {
    return client.post(`/api/rooms/${roomId}/join`);
  },

  // 2-4) 내가 속한 방 리스트 조회 (Schedule Archive)
  getMyRooms: () => {
    return client.get<{ rooms: Room[] }>("/api/rooms/my");
  },

  // 2-5) 방 즐겨찾기 토글 (별표 On/Off)
  // 응답으로 오는 isFavorite 값을 통해 UI를 즉시 갱신함
  toggleFavorite: (roomId: string) => {
    return client.post<FavoriteResponse>(`/api/rooms/${roomId}/favorite`);
  },
};
