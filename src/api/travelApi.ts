import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";

// 백엔드로 보낼 요청 데이터 타입
export interface GeneratePlanRequest {
  roomId: string;
  // 나중에 카테고리 선택 기능이 들어가면 아래 주석을 푸시면 됩니다.
  // selections?: string[];
}

export const travelApi = {
  // 1. 기존: 여행 계획 생성 (POST /travel)
  generatePlan: (data: GeneratePlanRequest) => {
    if (IS_MOCK) {
      console.log(
        `🚀 [Mock API] AI 여행 계획 생성 요청 (방 ID: ${data.roomId})`,
      );
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_DATA.travelPlan);
        }, 1500);
      });
    }
    return client.post("/travel", data);
  },

  // 🌟 2. 신규: 방에 들어왔을 때 가장 최근에 짰던 일정 불러오기 (GET)
  // 지호님이 알려주신 정확한 주소를 사용합니다!
  getLatestPlan: (roomId: string) => {
    if (IS_MOCK) {
      console.log(`🚀 [Mock API] ${roomId} 방의 최신 일정 불러오기`);
      return Promise.resolve(MOCK_DATA.travelPlan); // 임시로 목데이터 반환
    }
    // 진짜 백엔드 호출!
    return client.get(`/api/rooms/${roomId}/travel-plan/latest`);
  },
};
