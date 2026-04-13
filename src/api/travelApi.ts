import client, { IS_MOCK } from "./client";
import { MOCK_DATA } from "./mockData";

// 백엔드로 보낼 요청 데이터 타입
export interface GeneratePlanRequest {
  roomId: string;
  // 나중에 카테고리 선택 기능이 들어가면 아래 주석을 푸시면 됩니다.
  // selections?: string[];
}

export const travelApi = {
  /**
   * 4-1) 여행계획 생성 (JSON 반환 + DB 저장)
   * Method: POST
   * URL: /travel
   */
  generatePlan: (data: GeneratePlanRequest) => {
    if (IS_MOCK) {
      console.log(
        `🚀 [Mock API] AI 여행 계획 생성 요청 (방 ID: ${data.roomId})`,
      );

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_DATA.travelPlan); // MOCK_DATA에 만들어둔 가짜 데이터 반환
        }, 1500);
      });
    }

    // 진짜 백엔드 API 호출 (client에 기본 URL이 설정되어 있다면 /travel 만 쓰면 됩니다)
    return client.post("/travel", data);
  },
};
