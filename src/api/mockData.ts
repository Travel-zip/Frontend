// api/mockData.ts
export const MOCK_DATA = {
  auth: {
    login: {
      data: {
        accessToken: "mock-jwt-token-abc-123",
        user: { loginId: "TravelZip_Tester", email: "test@example.com" },
      },
    },
    success: { data: { message: "성공적으로 처리되었습니다." } },
  },
  rooms: {
    data: {
      rooms: [
        {
          id: 1,
          roomId: "seoul-123",
          title: "서울 맛집 정복기",
          lastModified: "2026.04.11",
          isFavorite: true,
          participants: [],
        },
        {
          id: 2,
          roomId: "jeju-456",
          title: "제주도 힐링 여행",
          lastModified: "2026.04.10",
          isFavorite: false,
          participants: [],
        },
      ],
    },
  },
  search: {
    data: [
      {
        contentid: "101",
        title: "가짜 서울역 맛집",
        mapy: 37.5563,
        mapx: 126.9707,
        address: "서울시 중구",
      },
      {
        contentid: "102",
        title: "가짜 남산타워 돈까스",
        mapy: 37.5511,
        mapx: 126.9882,
        address: "서울시 용산구",
      },
    ],
  },
  travelPlan: {
    data: {
      roomId: "test-room",
      updatedAt: "2026-04-12T13:20:00+09:00",
      items: [
        {
          month: 4,
          day: 20,
          hour: 10,
          minute: 30,
          place: "만장굴",
          lat: 33.528,
          lng: 126.771,
          imageUrl:
            "http://tong.visitkorea.or.kr/cms/resource/20/3308520_image2_1.jpg",
          memo: "오전에는 동굴 코스를 천천히 둘러보고 사진 많이 찍기",
        },
        {
          month: 4,
          day: 20,
          hour: 12,
          minute: 30,
          place: "고기국수집",
          lat: 33.4512,
          lng: 126.571,
          imageUrl: "",
          memo: "대표 메뉴로 점심 해결하고 흑돼지 수육 추가 필수!",
        },
        {
          month: 4,
          day: 20,
          hour: 16,
          minute: 0,
          place: "섭지코지",
          lat: 33.4242,
          lng: 126.9298,
          imageUrl: "",
          memo: "해안가 산책하며 풍경 감상",
        },
        {
          month: 4,
          day: 21,
          hour: 14,
          minute: 0,
          place: "신라호텔",
          lat: 33.2475,
          lng: 126.4082,
          imageUrl: "",
          memo: "체크인 후 짐 풀고 수영장 이용하기",
        },
      ],
    },
  },
};
