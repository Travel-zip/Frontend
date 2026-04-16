import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";
import type { CreateRoomRequest, Room, FavoriteResponse } from "../types/api";

// 현재 Mock 데이터의 즐겨찾기 상태를 메모리에 저장
let mockFavoriteStatus: Record<string, boolean> = {};

// 초기 데이터 세팅 (MOCK_DATA에 있는 방들의 기본 상태를 저장)
MOCK_DATA.rooms.data.rooms.forEach((room: any) => {
  mockFavoriteStatus[room.roomId] = room.isFavorite;
});

export const roomApi = {
  // 방 목록 조회
  getMyRooms: () => {
    if (IS_MOCK) {
      //현재 메모리에 저장된 즐겨찾기 상태를 반영해서 내보냅니다.
      const updatedRooms = MOCK_DATA.rooms.data.rooms.map((room: any) => ({
        ...room,
        isFavorite: mockFavoriteStatus[room.roomId] ?? room.isFavorite,
      }));
      return Promise.resolve({ data: { rooms: updatedRooms } } as any);
    }
    return client.get<{ rooms: Room[] }>("/api/rooms/my");
  },

  // 즐겨찾기 토글
  toggleFavorite: (roomId: string | number) => {
    const rId = roomId.toString();

    if (IS_MOCK) {
      // 현재 상태를 가져와서 반대로 뒤집습니다. (true -> false, false -> true)
      const currentStatus = mockFavoriteStatus[rId] ?? false;
      const nextStatus = !currentStatus;

      // 가짜 DB(메모리)에 저장합니다.
      mockFavoriteStatus[rId] = nextStatus;

      console.log(
        `🚀 [Mock API] 방 ${rId}의 즐겨찾기 상태 변경: ${nextStatus}`,
      );

      // 백엔드와 똑같은 형식으로 응답합니다.
      return Promise.resolve({
        data: {
          roomId: rId,
          isFavorite: nextStatus,
        },
      });
    }

    return client.post<FavoriteResponse>(`/api/rooms/${rId}/favorite`);
  },

  // 방 생성
  // roomApi.ts 내부
  createRoom: (data: CreateRoomRequest) => {
    if (IS_MOCK) {
      // 이제 data.roomId에 상준님이 입력한 "새 여행 #" 문자열이 들어옵니다.
      const newId = data.roomId || `new-room-${Date.now()}`;
      mockFavoriteStatus[newId] = false;
      return Promise.resolve({ data: { roomId: newId } });
    }
    return client.post("/api/rooms", data);
  },

  // 방 삭제
  deleteRoom: (roomId: string | number) => {
    const rId = roomId.toString();
    if (IS_MOCK) {
      delete mockFavoriteStatus[rId]; // 메모리에서도 삭제
      console.log(`🚀 [Mock API] 방 ${rId} 삭제 완료`);
      return Promise.resolve({ data: { message: "삭제 성공" } });
    }
    return client.delete(`/api/rooms/${rId}`);
  },

  joinRoom: (roomId: string) => {
    return client.post(`/api/rooms/${roomId}/join`);
  },

  // 🌟 아고라 토큰 가져오기 (수정됨)
  getAgoraToken: (roomId: string, userId: string) => {
    if (IS_MOCK) {
      return Promise.resolve({
        data: { token: "MOCK_TOKEN_HERE" },
      });
    }
    // 지호님이 만든 주소: /api/agora/token?roomId=...&userId=...
    // axios의 params 설정을 쓰면 자동으로 뒤에 ?roomId=... 가 붙습니다.
    return client.get(`/api/agora/token`, {
      params: {
        roomId: roomId,
        userId: userId,
      },
    });
  },

  renameRoom: (roomId: string | number, newTitle: string) => {
    // 백엔드 API 주소에 맞춰서 수정 (예: PATCH /api/rooms/123)
    return client.patch(`/api/rooms/${roomId}`, {
      title: newTitle, // 백엔드가 요구하는 변수명으로 맞추기
    });
  },
};
