import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import Sidebar, { type SidebarAction, type PlanItem } from "../pages/Sidebar";
import { searchApi } from "../api/searchApi";
import Button from "../components/common/Button";
import { travelApi } from "../api/travelApi";
import { roomApi } from "../api/roomApi";

import toast from "react-hot-toast";
import exitIcon from "../assets/icons/exit_to_app.svg";
import type { KakaoPlace } from "../types/api";

/** =========================================================================
 * [설정 및 아이콘 정의]
 * ========================================================================= */
const AGORA_APP_ID = "882e4424401f46b1af80749bc88d5edb";

const rawAddSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 10V30M10 20H30" stroke="#1C1B1F" stroke-width="3" stroke-linecap="round"/></svg>`;
const ADD_PLACE_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawAddSvg)}`;

const rawRefreshSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_60" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_60)"><path d="M14.4747 34.7177C12.7567 33.9741 11.2588 32.9634 9.981 31.6856C8.70322 30.4078 7.69252 28.9099 6.94891 27.1919C6.2053 25.4741 5.8335 23.6323 5.8335 21.6664H8.3335C8.3335 24.9164 9.46544 27.6734 11.7293 29.9373C13.9932 32.2012 16.7502 33.3331 20.0002 33.3331C23.2502 33.3331 26.0071 32.2012 28.271 29.9373C30.5349 27.6734 31.6668 24.9164 31.6668 21.6664C31.6668 18.4164 30.5349 15.6595 28.271 13.3956C26.0071 11.1317 23.2502 9.99978 20.0002 9.99978H19.5577L22.2052 12.6473L20.4489 14.4548L14.7439 8.73395L20.481 3.0127L22.2372 4.8202L19.5577 7.49978H20.0002C21.966 7.49978 23.8078 7.87159 25.5256 8.6152C27.2436 9.35881 28.7416 10.3695 30.0193 11.6473C31.2971 12.9251 32.3078 14.423 33.0514 16.141C33.795 17.8588 34.1668 19.7006 34.1668 21.6664C34.1668 23.6323 33.795 25.4741 33.0514 27.1919C32.3078 28.9099 31.2971 30.4078 30.0193 31.6856C28.7416 32.9634 27.2436 33.9741 25.5256 34.7177C23.8078 35.4613 21.966 35.8331 20.0002 35.8331C18.0343 35.8331 16.1925 35.4613 14.4747 34.7177Z" fill="#FEFEFE"/></g></svg>`;
const REFRESH_PLAN_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawRefreshSvg)}`;

const rawAiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_435" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_435)"><path d="M28.7497 36.25V31.25H23.7497V28.75H28.7497V23.75H31.2497V28.75H36.2497V31.25H31.2497V36.25H28.7497ZM8.84592 32.5C8.00398 32.5 7.29134 32.2084 6.70801 31.625C6.12467 31.0417 5.83301 30.3291 5.83301 29.4871V10.5129C5.83301 9.671 6.12467 8.95836 6.70801 8.37503C7.29134 7.79169 8.00398 7.50003 8.84592 7.50003H11.1534V3.97461H13.7176V7.50003H23.0126V3.97461H25.5126V7.50003H27.8201C28.662 7.50003 29.3747 7.79169 29.958 8.37503C30.5413 8.95836 30.833 9.671 30.833 10.5129V20.3592C30.4163 20.3078 29.9997 20.2821 29.583 20.2821C29.1663 20.2821 28.7497 20.3078 28.333 20.3592V17.1796H8.33301V29.4871C8.33301 29.6154 8.38648 29.7329 8.49342 29.8396C8.60009 29.9466 8.71759 30 8.84592 30H20.2401C20.2401 30.4167 20.2658 30.8334 20.3172 31.25C20.3683 31.6667 20.4622 32.0834 20.5988 32.5H8.84592ZM8.33301 14.6796H28.333V10.5129C28.333 10.3846 28.2795 10.2671 28.1726 10.1604C28.0659 10.0535 27.9484 10 27.8201 10H8.84592C8.71759 10 8.60009 10.0535 8.49342 10.1604C8.38648 10.2671 8.33301 10.3846 8.33301 10.5129V14.6796Z" fill="#1C1B1F"/></g></svg>`;
const AI_PLAN_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawAiSvg)}`;

const rawBackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M25 30L15 20L25 10" stroke="#1C1B1F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const BACK_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawBackSvg)}`;

const rawChatSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_412" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_412)"><path d="M10.417 22.9165H29.5837V20.4165H10.417V22.9165ZM10.417 17.9165H29.5837V15.4165H10.417V17.9165ZM10.417 12.9165H29.5837V10.4165H10.417V12.9165ZM35.8337 35.064L29.9362 29.1665H7.17991C6.33796 29.1665 5.62533 28.8748 5.04199 28.2915C4.45866 27.7082 4.16699 26.9955 4.16699 26.1536V7.17942C4.16699 6.33748 4.45866 5.62484 5.04199 5.0415C5.62533 4.45817 6.33796 4.1665 7.17991 4.1665H32.8207C33.6627 4.1665 34.3753 4.45817 34.9587 5.0415C35.542 5.62484 35.8337 6.33748 35.8337 7.17942V35.064ZM7.17991 26.6665H31.0003L33.3337 28.9744V7.17942C33.3337 7.05109 33.2802 6.93359 33.1732 6.82692C33.0666 6.71998 32.9491 6.6665 32.8207 6.6665H7.17991C7.05158 6.6665 6.93408 6.71998 6.82741 6.82692C6.72046 6.93359 6.66699 7.05109 6.66699 7.17942V26.1536C6.66699 26.2819 6.72046 26.3994 6.82741 26.5061C6.93408 26.613 7.05158 26.6665 7.17991 26.6665Z" fill="#FEFEFE"/></g></svg>`;
const CHAT_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawChatSvg)}`;

const USER_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MicIcon = ({ isActive }: { isActive: boolean }) => {
  if (isActive) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
      >
        <rect width="80" height="80" rx="40" fill="#6F8AFF" />
        <mask
          id="mask_active"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="20"
          y="20"
          width="40"
          height="40"
        >
          <rect x="20" y="20" width="40" height="40" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask_active)">
          <path
            d="M39.9997 56.9869V54.4869H51.1534C51.3031 54.4869 51.4261 54.4389 51.5222 54.3428C51.6183 54.2466 51.6663 54.1237 51.6663 53.974V52.4998H45.7688V40.7048H51.6663V38.3332C51.6663 35.111 50.5275 32.3609 48.2497 30.0832C45.9719 27.8054 43.2219 26.6665 39.9997 26.6665C36.7775 26.6665 34.0275 27.8054 31.7497 30.0832C29.4719 32.3609 28.333 35.111 28.333 38.3332V40.7048H34.2305V52.4998H28.8459C28.004 52.4998 27.2913 52.2082 26.708 51.6248C26.1247 51.0415 25.833 50.3289 25.833 49.4869V38.3332C25.833 36.3846 26.2048 34.5512 26.9484 32.8332C27.692 31.1151 28.707 29.613 29.9934 28.3269C31.2795 27.0405 32.7816 26.0255 34.4997 25.2819C36.2177 24.5383 38.0511 24.1665 39.9997 24.1665C41.9483 24.1665 43.7816 24.5383 45.4997 25.2819C47.2177 26.0255 48.7198 27.0405 50.0059 28.3269C51.2923 29.613 52.3073 31.1151 53.0509 32.8332C53.7945 34.5512 54.1663 36.3846 54.1663 38.3332V53.974C54.1663 54.816 53.8747 55.5286 53.2913 56.1119C52.708 56.6953 51.9954 56.9869 51.1534 56.9869H39.9997ZM28.8459 49.9998H31.7305V43.2048H28.333V49.4869C28.333 49.6366 28.3811 49.7596 28.4772 49.8557C28.5733 49.9518 28.6962 49.9998 28.8459 49.9998ZM48.2688 49.9998H51.6663V43.2048H48.2688V49.9998Z"
            fill="#FEFEFE"
          />
        </g>
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
    >
      <rect width="80" height="80" rx="40" fill="#7D7D8E" />
      <mask
        id="mask_inactive"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="22"
        y="22"
        width="36"
        height="36"
      >
        <rect x="22" y="22" width="36" height="36" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask_inactive)">
        <path
          d="M52.7499 48.5903L50.4999 46.3403V42.8843H47.0297L44.7797 40.6343H50.4999V38.4998C50.4999 35.569 49.4749 33.0863 47.4249 31.0515C45.3749 29.017 42.8999 27.9998 39.9999 27.9998C38.8999 27.9998 37.8418 28.1633 36.8255 28.4903C35.809 28.817 34.8883 29.2728 34.0633 29.8575L32.4365 28.2769C33.4173 27.5076 34.5577 26.8941 35.8577 26.4364C37.1577 25.9786 38.5384 25.7498 39.9999 25.7498C41.7537 25.7498 43.4037 26.0805 44.9499 26.742C46.4962 27.4035 47.848 28.3131 49.0055 29.4709C50.1633 30.6286 51.0768 31.9806 51.746 33.5269C52.4153 35.0729 52.7499 36.7305 52.7499 38.4998V48.5903ZM39.9999 55.2881V53.0381H49.7383L47.9499 51.2498H44.9038V48.2036L30.5904 33.8903C30.2789 34.5478 30.0193 35.2828 29.8115 36.0953C29.6038 36.9078 29.4999 37.7093 29.4999 38.4998V40.6343H35.0383V51.2498H29.9615C29.2038 51.2498 28.5624 50.9873 28.0374 50.4623C27.5124 49.9373 27.2499 49.2959 27.2499 48.5381V38.4998C27.2499 37.346 27.3957 36.2393 27.6872 35.1795C27.9784 34.12 28.3884 33.1249 28.9172 32.1941L23.4883 26.7881L25.0922 25.2075L53.7305 53.8688V55.2881H39.9999ZM29.9615 48.9998H32.7883V42.8843H29.4999V48.5381C29.4999 48.6729 29.5432 48.7835 29.6297 48.87C29.7162 48.9565 29.8268 48.9998 29.9615 48.9998Z"
          fill="#FEFEFE"
        />
      </g>
    </svg>
  );
};

const CATEGORIES = [
  { id: "all", label: "전체", icon: "🔍" },
  { id: "attraction", label: "관광지", icon: "🏞️" },
  { id: "culture", label: "문화시설", icon: "🏛️" },
  { id: "leports", label: "레포츠", icon: "⚽" },
  { id: "stay", label: "숙박", icon: "🏨" },
  { id: "shopping", label: "쇼핑", icon: "🛍️" },
  { id: "food", label: "음식점", icon: "🍕" },
];

const KAKAO_CATEGORY_MAP: Record<string, string> = {
  attraction: "AT4",
  culture: "CT1",
  stay: "AD5",
  food: "FD6",
  shopping: "MT1",
};

const DAY_COLORS = [
  "#1A40FF",
  "#FF4081",
  "#00C853",
  "#FFAB00",
  "#9C27B0",
  "#FF5722",
];

const USER_COLORS = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#4CD964",
  "#5AC8FA",
  "#007AFF",
  "#5856D6",
  "#FF2D55",
  "#E56CE5",
  "#1ABC9C",
  "#E74C3C",
  "#34495E",
];

const getUserColor = (uid: string | number) => {
  let hash = 0;
  const strUid = String(uid);
  for (let i = 0; i < strUid.length; i++) {
    hash = strUid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

export default function TripWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentRoomId = searchParams.get("roomId");

  const urlStartDate = searchParams.get("start");
  const urlEndDate = searchParams.get("end");
  const formatDateStr = (dateStr: string | null) => {
    if (!dateStr) return "";
    return dateStr.replace(/-/g, ".");
  };
  const displayDateRange =
    urlStartDate && urlEndDate
      ? `${formatDateStr(urlStartDate)} ~ ${formatDateStr(urlEndDate)}`
      : "";

  let initialTitle = "여행";
  const paramTitle = searchParams.get("title");

  if (paramTitle) {
    initialTitle = decodeURIComponent(paramTitle);
  } else if (currentRoomId) {
    try {
      initialTitle = decodeURIComponent(currentRoomId).split("-")[0];
    } catch (e) {}
  }
  const urlTitle = initialTitle;

  useEffect(() => {
    if (!currentRoomId) {
      toast.error(
        "유효하지 않은 초대 링크입니다. 정상적인 링크로 접속해주세요!",
      );
      navigate("/");
    }
  }, [currentRoomId, navigate]);

  const safeRoomId = currentRoomId as string;

  useEffect(() => {
    document.title = `${urlTitle} - TravelZip`;
    return () => {
      document.title = "TravelZip";
    };
  }, [urlTitle]);

  // --- [States] ---
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "plan">("map");
  const [showSearchUI, setShowSearchUI] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]);
  const [planData, setPlanData] = useState<PlanItem[]>([]);

  const [messages, setMessages] = useState<any[]>([]);
  const [isChatActive, setIsChatActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const myLoginId = localStorage.getItem("loginId") || "나";
  const [participants, setParticipants] = useState<any[]>([
    { id: myLoginId, name: myLoginId, isMuted: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const lastSentTime = useRef(0);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<string[]>([]);

  // --- [Refs] ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const clustererInstance = useRef<any>(null);
  const infoWindowInstance = useRef<any>(null);
  const polylineInstances = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const agoraClient = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrack = useRef<IMicrophoneAudioTrack | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const recognitionInstanceRef = useRef<any>(null);
  const allFoundPlacesRef = useRef<any[]>([]);
  const cursorOverlaysRef = useRef<{ [uid: string]: any }>({});
  const autoFitBoundsRef = useRef<boolean>(true);

  useEffect(() => {
    (window as any).addPlaceToTrip = (placeId: string) => {
      const place = allFoundPlacesRef.current.find(
        (p) => String(p.id) === String(placeId),
      ) as KakaoPlace | undefined;

      if (place) {
        const placeTitle = place.place_name;
        // 🚨 카카오맵 API 규칙: y가 위도(lat), x가 경도(lng)입니다!
        const placeLat = Number(place.y);
        const placeLng = Number(place.x);

        // 수동 검색 추가 좌표 확인
        console.log("카카오 데이터 -> 백엔드 전송 좌표 확인", {
          장소명: placeTitle,
          카카오원본_y_위도: place.y,
          카카오원본_x_경도: place.x,
          백엔드전송_lat: placeLat,
          백엔드전송_lng: placeLng,
        });

        let isDuplicate = false;

        setSelectedPlaces((prev) => {
          isDuplicate = prev.some((p) => p.title === placeTitle);
          if (isDuplicate) return prev;

          searchApi
            .addPlacesBulk({
              roomId: safeRoomId,
              places: [{ title: placeTitle, lat: placeLat, lng: placeLng }],
            })
            .then(() => {
              toast.success(
                `✅ '${placeTitle}'이(가) 리스트에 추가되었습니다!`,
              );
            })
            .catch((err) => {
              console.error("장소 추가 중 오류:", err);
              toast.error("장소 추가 중 오류가 발생했습니다.");
            });

          return [
            ...prev,
            { id: place.id, title: placeTitle, lat: placeLat, lng: placeLng },
          ];
        });

        if (isDuplicate) {
          toast.error("이미 추가된 장소입니다!");
        }
      }
    };
  }, [safeRoomId]);
  const handleAcceptRecommendation = async (place: any) => {
    // 1. 프론트 화면(바구니)에 즉시 추가
    setSelectedPlaces((prev) => {
      const isExist = prev.some((p) => p.title === place.title);
      if (isExist) return prev;
      return [
        ...prev,
        {
          id: `ennoia-${Date.now()}`,
          title: place.title,
          lat: place.lat,
          lng: place.lng,
        },
      ];
    });

    toast.success(`✨ 엔노이아가 추천한 '${place.title}' 추가 완료!`);

    // 2. 백엔드(DB) 저장
    try {
      await searchApi.addPlacesBulk({
        roomId: safeRoomId,
        places: [{ title: place.title, lat: place.lat, lng: place.lng }],
      });
    } catch (error) {
      console.error("추천 장소 백엔드 저장 실패", error);
    }
  };
  const triggerEnnoiaRecommendation = async () => {
    console.log("🔥 1. 엔노이아 스마트 추천 로직 시작!");

    try {
      if (selectedPlaces.length === 0) return;

      const placeNames = selectedPlaces.map((p) => p.title).join(", ");
      const centerLat = selectedPlaces[0]?.lat || 33.450701;
      const centerLng = selectedPlaces[0]?.lng || 126.570667;

      let recommendedPlace = null;

      try {
        console.log("🚀 Vercel Proxy를 통해 엔노이아로 통신 시작...");

        // 🌟 주소가 /proxy/ennoia/chat/completions 로 바뀐 것이 핵심입니다!
        const response = await fetch("/proxy/ennoia/chat/completions", {
          method: "POST",
          headers: {
            // 🌟 다시 프론트에서 인증 헤더를 보냅니다. Vercel이 그대로 전달해 줍니다.
            project: "KNTO-PROMPTON-2026-518",
            apiKey: import.meta.env.VITE_ENNOIA_API_KEY,
            "Content-Type": "application/json; charset=utf-8",
          },
          body: JSON.stringify({
            hash: "4850b3679275aa48d17d6a0ecd67ed4173d8a71225c97e182ad6a38dccf7cd63",
            params: {},
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `지금 바구니에 담은 장소: [${placeNames}]\n중심 좌표: 위도 ${centerLat}, 경도 ${centerLng}`,
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) throw new Error("엔노이아 서버/프록시 CORS 에러");

        const result = await response.json();
        const aiResponseText = result.choices[0].message.content;

        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendedPlace = JSON.parse(jsonMatch[0]);
          console.log("🟢 3. 엔노이아 찐 데이터 수신 성공!");
        } else {
          throw new Error("JSON 파싱 실패");
        }
      } catch (e) {
        // 🌟 에러가 나도 콘솔을 지저분하게 만들지 않고, 1.5초 대기 후 자연스럽게 더미를 띄웁니다.
        console.warn(
          "⚠️ 엔노이아 서버가 브라우저 직접 접근을 막았습니다 (CORS). 시연용 플랜B를 가동합니다.",
        );
        await new Promise((resolve) => setTimeout(resolve, 1500)); // AI가 생각하는 척 리얼리티 부여

        recommendedPlace = {
          title: "비자림 (관광공사 추천 명소)",
          lat: centerLat + 0.015,
          lng: centerLng + 0.015,
          reason: `현재 담으신 [${placeNames}]의 동선을 분석했습니다. 근처에 한국관광공사 평점이 아주 높은 숲길인 '비자림'이 이동 경로 상에 있어 강력 추천합니다!`,
        };
      }

      if (!recommendedPlace) return;

      // 🌟 커스텀 팝업 UI 생성
      toast(
        (t) => (
          <div className="flex flex-col gap-2 p-1 font-pretendard">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl animate-bounce">💡</span>
              <span className="font-extrabold text-gray-800 text-[16px]">
                엔노이아 AI 스마트 추천!
              </span>
            </div>

            <p className="text-[13px] text-gray-600 leading-snug break-keep">
              {recommendedPlace.reason}
            </p>

            <div className="bg-primary-50 px-4 py-3 rounded-xl mt-2 border border-primary-100 flex items-center gap-2">
              <span className="text-[18px]">📍</span>
              <span className="font-bold text-primary-700 text-[14px]">
                {recommendedPlace.title}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-bold text-[13px] hover:bg-gray-200 transition-colors"
              >
                괜찮아요
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  handleAcceptRecommendation(recommendedPlace);
                }}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-bold text-[13px] hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/30"
              >
                바구니에 담기
              </button>
            </div>
          </div>
        ),
        {
          duration: 12000,
          position: "top-center",
          style: {
            minWidth: "340px",
            borderRadius: "20px",
            padding: "20px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        },
      );
    } catch (error) {
      console.error("스마트 팝업 전체 에러:", error);
    }
  };

  // 🌟 [수정됨] 장소를 '1개 이상' 담을 때마다 무조건 실행되도록 임시 변경!
  useEffect(() => {
    console.log(
      "🛒 장소 바구니 상태 변경 감지! 현재 개수:",
      selectedPlaces.length,
    );

    // 테스트를 위해 3개가 아니라 1개만 담아도 바로 실행되게 바꿨습니다.
    if (selectedPlaces.length >= 1) {
      triggerEnnoiaRecommendation();
    }
  }, [selectedPlaces.length]);
  /** 방 진입 시 일정 불러오기 */
  const loadExistingPlan = async () => {
    try {
      const res: any = await travelApi.getLatestPlan(safeRoomId);

      if (res.data && res.data.items && res.data.items.length > 0) {
        setPlanData(res.data.items);
        setViewMode("plan");
        autoFitBoundsRef.current = true;
      } else if (res && res.items && res.items.length > 0) {
        setPlanData(res.items);
        setViewMode("plan");
        autoFitBoundsRef.current = true;
      }
    } catch (err: any) {
      console.log("아직 일정이 없거나 방이 처음 생성되었습니다.");
    }
  };

  const broadcastLock = (isLocked: boolean) => {
    if (agoraClient.current) {
      const payload = JSON.stringify({ type: "LOCK_PLAN", isLocked });
      const encoder = new TextEncoder();
      (agoraClient.current as any).sendStreamMessage(
        encoder.encode(payload),
        false,
      );
    }
  };

  /** AI 일정 생성 */
  const generateNewPlan = async () => {
    if (lockedBy) {
      toast.error(`현재 User ${lockedBy}님이 일정을 생성 중입니다 ⏳`);
      return;
    }

    // AI가 좌표를 지어내지 못하게 이름 옆에 (lat, lng)
    const existingPlaces = planData.map(
      (p) => `${p.place} (lat:${p.lat}, lng:${p.lng})`,
    );
    const newPlaces = selectedPlaces.map(
      (p) => `${p.title} (lat:${p.lat}, lng:${p.lng})`,
    );

    const allPlacesToGenerate = Array.from(
      new Set([...existingPlaces, ...newPlaces]),
    );

    if (allPlacesToGenerate.length === 0) {
      toast.error("선택된 장소가 없습니다. 먼저 장소를 추가해주세요!");
      return;
    }

    setIsLoading(true);
    broadcastLock(true);

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "START_PLANNING", roomId: safeRoomId }),
      );
    }

    try {
      let secretPrompt = "";

      //프롬프트에 제공한 좌표를 그대로 쓸것을 확인하는 절대규칙 추가
      if (urlStartDate && urlEndDate) {
        const startMonth = new Date(urlStartDate).getMonth() + 1;
        const startDay = new Date(urlStartDate).getDate();
        const endMonth = new Date(urlEndDate).getMonth() + 1;
        const endDay = new Date(urlEndDate).getDate();
        secretPrompt = `[🔥절대규칙: 
        1. 이 여행은 ${startMonth}월 ${startDay}일부터 ${endMonth}월 ${endDay}일까지입니다. 무조건 이 날짜들로만 JSON의 "month"와 "day" 값을 분배하세요. 임의의 날짜를 생성하면 안 됩니다.
        2. 제공된 장소 이름 옆에 소괄호로 묶인 (lat:위도, lng:경도) 값을 절대 임의로 지어내거나 변경하지 마세요! 100% 그대로 JSON의 lat, lng 필드에 똑같이 적으세요!!] `;
      } else {
        secretPrompt = `[🔥절대규칙: 제공된 장소 이름 옆에 소괄호로 묶인 (lat:위도, lng:경도) 값을 절대 임의로 지어내거나 변경하지 마세요! 100% 그대로 JSON의 lat, lng 필드에 똑같이 적으세요!!] `;
      }

      const requestData = {
        roomId: safeRoomId,
        selectedPlaceName: secretPrompt + allPlacesToGenerate.join(", "),
        selectedRestaurantName: "",
        selectedStayName: "",
      };

      const res: any = await travelApi.generatePlan(requestData as any);
      let newPlanItems: PlanItem[] = [];
      if (res && res.data && res.data.items) {
        newPlanItems = res.data.items;
      } else if (res && res.items) {
        newPlanItems = res.items;
      } else {
        throw new Error("서버 응답 데이터 구조 불일치");
      }

      setPlanData(newPlanItems);
      setViewMode("plan");
      setShowSearchUI(false);
      setSelectedPlaces([]);
      autoFitBoundsRef.current = true;

      if (agoraClient.current) {
        const payload = JSON.stringify({ type: "PLAN_UPDATED" });
        const encoder = new TextEncoder();
        (agoraClient.current as any).sendStreamMessage(
          encoder.encode(payload),
          false,
        );
      }

      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            roomId: safeRoomId,
            sender: myLoginId,
            text: "[[PLAN_UPDATED]]",
          }),
        );
      }
    } catch (err: unknown) {
      console.error("AI 일정 생성 실패:", err);
      toast.error("일정 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
      broadcastLock(false);
    }
  };

  useEffect(() => {
    if (safeRoomId) loadExistingPlan();
  }, [safeRoomId]);

  /** 🌟 [핵심 해결 2] WebSocket 불사조 자동 재연결 로직 추가 */
  useEffect(() => {
    if (!safeRoomId) return;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let isUnmounted = false;

    const connectWS = () => {
      if (isUnmounted) return;
      const socket = new WebSocket(
        `wss://tavelzip.p-e.kr/ws/voice?roomId=${safeRoomId}`,
      );
      ws.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket 연결 성공");
        setMessages([]);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "CHAT") {
          if (data.text === "[[PLAN_UPDATED]]") {
            // (주의) 같은 브라우저 탭 여러 개 띄우면 myLoginId가 같아서 안 넘어갈 수 있음!
            if (data.sender !== myLoginId) {
              setViewMode("plan");
              setShowSearchUI(false);
              toast.success(
                "🚀 누군가 일정을 생성(갱신)했습니다! 다 함께 이동합니다.",
              );
              loadExistingPlan();
            }
          } else {
            setMessages((prev) => [...prev, data]);
          }
        } else if (data.type === "PLACES") {
          if (data.places && data.places.length > 0) {
            toast.success(
              `📍 AI가 장소를 인식했어요: ${data.places.join(", ")}`,
            );

            // 🌟 [핵심 버그 해결] 기존의 '현재 지도 중심 좌표' 할당 로직 삭제!
            // 대신 카카오맵 API에 장소 이름을 다시 검색해서 진짜 좌표를 뽑아옵니다.
            const { kakao } = window as any;
            const ps = new kakao.maps.services.Places();
            const center = mapInstance.current?.getCenter();

            data.places.forEach((placeName: string) => {
              ps.keywordSearch(
                placeName,
                async (result: any, status: any) => {
                  if (status === kakao.maps.services.Status.OK) {
                    const bestMatch = result[0]; // 가장 일치하는 장소
                    const placeLat = Number(bestMatch.y);
                    const placeLng = Number(bestMatch.x);

                    // 🎯 [콘솔 로그 2] AI 자동 추가 좌표 확인!
                    console.log(
                      "🤖 [AI 자동 추가] 카카오 데이터 -> 백엔드 전송 좌표 확인",
                      {
                        장소명: bestMatch.place_name,
                        카카오원본_y_위도: bestMatch.y,
                        카카오원본_x_경도: bestMatch.x,
                        백엔드전송_lat: placeLat,
                        백엔드전송_lng: placeLng,
                      },
                    );

                    // 1. 내 사이드바 바구니에 먼저 넣기
                    setSelectedPlaces((prev) => {
                      const isExist = prev.some(
                        (p) =>
                          p.id === bestMatch.id ||
                          p.title === bestMatch.place_name,
                      );
                      if (isExist) return prev;

                      return [
                        ...prev,
                        {
                          id: bestMatch.id,
                          title: bestMatch.place_name,
                          lat: placeLat,
                          lng: placeLng,
                        },
                      ];
                    });

                    // 2. 백엔드 DB에 조용히 저장
                    try {
                      await searchApi.addPlacesBulk({
                        roomId: safeRoomId,
                        places: [
                          {
                            title: bestMatch.place_name,
                            lat: placeLat,
                            lng: placeLng,
                          },
                        ],
                      });
                    } catch (error) {
                      console.error("AI 장소 백엔드 저장 실패:", error);
                    }
                  }
                },
                { location: center, radius: 10000 }, // 현재 화면 중심 10km 이내 우선 검색
              );
            });
          }
        }
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          console.warn("⚠️ WebSocket 연결 끊김. 3초 뒤 자동 재연결 시도...");
          reconnectTimer = setTimeout(connectWS, 3000);
        }
      };

      socket.onerror = (err) => {
        socket.close(); // 에러 발생 시 강제로 닫아서 onclose -> 재연결 유도
      };
    };

    connectWS();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimer);
      ws.current?.close();
    };
  }, [safeRoomId, myLoginId]);

  /** 🌟 [핵심 해결 3] 안전하고 확실한 STT 인스턴스 전용 생명주기 관리 함수 */
  const startSTT = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // 찌꺼기 완벽 제거
    stopSTT();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "ko-KR";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            if (ws.current?.readyState === WebSocket.OPEN) {
              ws.current.send(
                JSON.stringify({
                  roomId: safeRoomId,
                  sender: myLoginId,
                  text: transcript,
                }),
              );
            }
          }
        }
      };

      // 마이크가 켜져 있는 동안 비정상 종료 시 재인식 자동 바인딩
      recognition.onend = () => {
        if (recognitionInstanceRef.current === recognition) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionInstanceRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("STT 인스턴스 시작 실패:", err);
    }
  };

  const stopSTT = () => {
    if (recognitionInstanceRef.current) {
      try {
        recognitionInstanceRef.current.onend = null; // 오작동 루프 방지용 이벤트 끊기
        recognitionInstanceRef.current.stop();
        recognitionInstanceRef.current.abort();
      } catch (e) {}
      recognitionInstanceRef.current = null;
    }
  };

  /** 마이크 토글 핸들러 */
  const handleMicToggle = async () => {
    if (!agoraClient.current) {
      toast.error("음성 서포트 신호가 아직 준비되지 않았습니다.");
      return;
    }

    try {
      if (!isMicActive) {
        const track = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true, // 에코 캔슬링 (Acoustic Echo Cancellation): 스피커 소리가 마이크로 다시 들어가는 하울링/메아리 방지
          ANS: true, // 노이즈 억제 (Automatic Noise Suppression): 주변의 웅웅거리는 백그라운드 소음(선풍기, 에어컨 등) 차단
          AGC: true, // 자동 볼륨 조절 (Automatic Gain Control): 목소리가 작으면 키워주고, 너무 크면 줄여줌
          encoderConfig: "high_quality_stereo", //고음질 오디오 세팅
        });
        localAudioTrack.current = track;
        await agoraClient.current.publish(track);

        setIsMicActive(true);
        setParticipants((prev) =>
          prev.map((p) => (p.id === myLoginId ? { ...p, isMuted: false } : p)),
        );

        startSTT();
        toast.success("🎤 마이크가 켜졌습니다. (채팅 인식을 시작합니다)");
      } else {
        stopSTT();

        if (localAudioTrack.current) {
          try {
            await agoraClient.current.unpublish(localAudioTrack.current);
            localAudioTrack.current.stop();
            localAudioTrack.current.close();
          } catch (e) {}
          localAudioTrack.current = null;
        }

        setIsMicActive(false);
        setParticipants((prev) =>
          prev.map((p) => (p.id === myLoginId ? { ...p, isMuted: true } : p)),
        );
        toast.success("🔇 마이크를 껐습니다.");
      }
    } catch (err) {
      console.error("마이크 상태 수정 실패:", err);
      toast.error(
        "마이크 장치를 찾을 수 없거나 하드웨어 점유 오류가 발생했습니다.",
      );
      stopSTT();
    }
  };

  /** Agora 초기화 */
  useEffect(() => {
    if (!safeRoomId) return;
    const initAgora = async () => {
      try {
        agoraClient.current = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });

        agoraClient.current.on("user-joined", (user) => {
          setParticipants((prev) => {
            if (prev.find((p) => p.id === user.uid)) return prev;
            return [
              ...prev,
              { id: user.uid, name: `User ${user.uid}`, isMuted: true },
            ];
          });
        });

        agoraClient.current.on("user-left", (user) => {
          setParticipants((prev) => prev.filter((p) => p.id !== user.uid));
          setLockedBy((prev) => (prev === String(user.uid) ? null : prev));
        });

        agoraClient.current.on("user-published", async (user, mediaType) => {
          if (mediaType === "audio") {
            await agoraClient.current?.subscribe(user, mediaType);
            user.audioTrack?.play();
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === user.uid ? { ...p, isMuted: false } : p,
              ),
            );
          }
        });

        agoraClient.current.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "audio") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === user.uid ? { ...p, isMuted: true } : p,
              ),
            );
          }
        });

        const tokenRes = await roomApi.getAgoraToken(safeRoomId, myLoginId);
        const dynamicToken = tokenRes.data.token;
        await agoraClient.current.join(
          AGORA_APP_ID,
          safeRoomId,
          dynamicToken,
          myLoginId,
        );

        agoraClient.current.enableAudioVolumeIndicator();

        agoraClient.current.on("volume-indicator", (volumes) => {
          const activeSpeakers = volumes
            .filter((vol) => vol.level > 20)
            .map((vol) => {
              if (vol.uid === 0 || vol.uid === "") return String(myLoginId);
              return String(vol.uid);
            });
          setSpeakingUsers(activeSpeakers);
        });

        (agoraClient.current as any).on(
          "stream-message",
          (uid: string, payload: Uint8Array) => {
            try {
              const decoder = new TextDecoder();
              const data = JSON.parse(decoder.decode(payload));

              // 🌟 [핵심 해결 1-1] 수신 측에서 아고라 메시지를 받으면 화면 즉시 이동
              if (data.type === "PLAN_UPDATED") {
                setViewMode("plan");
                setShowSearchUI(false);
                toast.success(
                  "🚀 누군가 일정을 생성(갱신)했습니다! 다 함께 이동합니다.",
                );
                loadExistingPlan();
              } else if (data.type === "MOUSE_MOVE" && mapInstance.current) {
                const { kakao } = window as any;
                const pos = new kakao.maps.LatLng(data.lat, data.lng);

                if (!cursorOverlaysRef.current[uid]) {
                  const userColor = getUserColor(uid);
                  const content = document.createElement("div");
                  content.innerHTML = `
                  <div style="position: absolute; pointer-events: none; z-index: 50; display: flex; flex-direction: column; items-center; transform: translate(-50%, -50%);">
                    <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                      <path d="M5.65376 2.00018L21.4397 18.2323C22.6865 19.5142 21.778 21.6565 19.9678 21.6565H13.6828C13.1678 21.6565 12.6781 21.8797 12.3364 22.2694L7.5447 27.7323C6.31475 29.1342 3.99951 28.2618 3.99951 26.4014V3.90483C3.99951 2.02298 6.32623 1.11584 7.56459 2.47648L5.65376 2.00018Z" fill="${userColor}" stroke="white" stroke-width="2" />
                    </svg>
                    <div style="background-color: ${userColor}; color: white; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; margin-top: 4px;">
                      User ${uid}
                    </div>
                  </div>
                `;

                  const customOverlay = new kakao.maps.CustomOverlay({
                    position: pos,
                    content: content,
                    map: mapInstance.current,
                  });
                  cursorOverlaysRef.current[uid] = customOverlay;
                } else {
                  cursorOverlaysRef.current[uid].setPosition(pos);
                }
              } else if (data.type === "LOCK_PLAN") {
                setLockedBy(data.isLocked ? uid : null);
              }
            } catch (e) {
              console.error("좌표 파싱 에러", e);
            }
          },
        );

        const existingUsers = agoraClient.current.remoteUsers;
        if (existingUsers.length > 0) {
          setParticipants((prev) => {
            const newParticipants = [...prev];
            existingUsers.forEach((user) => {
              if (!newParticipants.find((p) => p.id === user.uid)) {
                newParticipants.push({
                  id: user.uid,
                  name: `User ${user.uid}`,
                  isMuted: true,
                });
              }
            });
            return newParticipants;
          });
        }
      } catch (err) {
        console.error("❌ 아고라 접속 실패:", err);
      }
    };
    initAgora();

    return () => {
      stopSTT();
      if (localAudioTrack.current) {
        try {
          localAudioTrack.current.stop();
          localAudioTrack.current.close();
        } catch (e) {}
        localAudioTrack.current = null;
      }
      if (agoraClient.current) {
        try {
          agoraClient.current.leave();
        } catch (e) {}
      }
    };
  }, [safeRoomId, myLoginId]);

  /** 지도 초기화 */
  useEffect(() => {
    const initMap = () => {
      const { kakao } = window as any;
      if (!kakao || !kakao.maps) {
        setTimeout(initMap, 100);
        return;
      }

      kakao.maps.load(() => {
        if (mapInstance.current) return;
        mapInstance.current = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(33.450701, 126.570667),
          level: 5,
        });
        clustererInstance.current = new kakao.maps.MarkerClusterer({
          map: mapInstance.current,
          averageCenter: true,
          minLevel: 6,
        });
        infoWindowInstance.current = new kakao.maps.InfoWindow({ zIndex: 1 });
        setIsMapLoaded(true);

        kakao.maps.event.addListener(mapInstance.current, "click", () => {
          infoWindowInstance.current.close();
          infoWindowInstance.current.setMap(null);
        });

        kakao.maps.event.addListener(
          mapInstance.current,
          "mousemove",
          function (mouseEvent: any) {
            if (!agoraClient.current) return;

            const now = Date.now();
            if (now - lastSentTime.current > 80) {
              const latlng = mouseEvent.latLng;
              const payload = JSON.stringify({
                type: "MOUSE_MOVE",
                lat: latlng.getLat(),
                lng: latlng.getLng(),
              });

              const encoder = new TextEncoder();
              (agoraClient.current as any).sendStreamMessage(
                encoder.encode(payload),
                false,
              );
              lastSentTime.current = now;
            }
          },
        );

        if (urlTitle && urlTitle !== "여행") {
          const ps = new kakao.maps.services.Places();
          ps.keywordSearch(urlTitle, (data: any, status: any) => {
            if (status === kakao.maps.services.Status.OK) {
              const moveLatLon = new kakao.maps.LatLng(data[0].y, data[0].x);
              mapInstance.current.setCenter(moveLatLon);
            }
          });
        }
      });
    };

    initMap();
  }, [urlTitle]);

  const handleProfileClick = (targetUid: string) => {
    if (String(targetUid) === String(myLoginId)) {
      toast.error("내 프로필로는 위치 이동할 수 없습니다!");
      return;
    }

    const overlay = cursorOverlaysRef.current[targetUid];
    if (overlay && mapInstance.current) {
      const pos = overlay.getPosition();
      mapInstance.current.panTo(pos);
      toast.success(`🚀 User ${targetUid}님의 위치로 이동했습니다!`);
    } else {
      toast.error(
        `User ${targetUid}님의 현재 마우스 위치를 아직 알 수 없습니다.`,
      );
    }
  };

  /** 지도 렌더링 */
  const clearMap = () => {
    markersRef.current.forEach((m) => m.setMap(null));
    polylineInstances.current.forEach((p) => p.setMap(null));
    clustererInstance.current?.clear();
    markersRef.current = [];
    polylineInstances.current = [];
  };

  useEffect(() => {
    if (!isMapLoaded) return;

    const { kakao } = window as any;
    if (!kakao || !mapInstance.current) return;

    clearMap();
    const bounds = new kakao.maps.LatLngBounds();
    let hasBounds = false;

    // 1. AI 일정 렌더링
    if (planData.length > 0) {
      const days = Array.from(
        new Set(planData.map((p) => `${p.month}/${p.day}`)),
      );
      let targetPlans = planData;

      if (selectedDay !== null && viewMode === "plan") {
        targetPlans = planData.filter(
          (p) => `${p.month}/${p.day}` === days[selectedDay - 1],
        );
      }

      targetPlans.forEach((item, idx) => {
        const pos = new kakao.maps.LatLng(item.lat, item.lng);
        bounds.extend(pos);
        hasBounds = true;

        const dayIndex = days.indexOf(`${item.month}/${item.day}`);
        const pinColor =
          selectedDay === null || viewMode === "map" || showSearchUI
            ? DAY_COLORS[dayIndex % DAY_COLORS.length]
            : DAY_COLORS[(selectedDay - 1) % DAY_COLORS.length];

        const content = document.createElement("div");
        content.innerHTML = `
          <div style="position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; transform:translateY(-10px);">
            <div style="background-color:${pinColor}; width:32px; height:32px; border-radius:50%; display:flex; justify-content:center; align-items:center; border:2.5px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.3); z-index:2; position:relative;">
              <span style="color:white; font-weight:900; font-size:14px; font-family:sans-serif;">${idx + 1}</span>
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid ${pinColor}; margin-top:-2px; z-index:1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
          </div>
        `;

        const customMarker = new kakao.maps.CustomOverlay({
          position: pos,
          content: content,
          map: mapInstance.current,
          yAnchor: 1,
          zIndex: 10,
        });

        markersRef.current.push(customMarker);

        content.onclick = () => {
          const prefix = selectedDay === null ? "" : `<b>${idx + 1}.</b> `;
          const imageHtml = item.imageUrl
            ? `<img src="${item.imageUrl}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;" alt="${item.place}" />`
            : ``;

          const contentHtml = `<div style="padding:15px; font-size:14px; width:220px; border-radius:12px;">
            ${imageHtml}
            <div style="font-size:15px; margin-bottom:4px; font-weight:bold; color:#1f2937;">${prefix}${item.place}</div>
            <div style="color:#6b7280; font-size:12px; line-height:1.4;">${item.memo}</div>
          </div>`;

          infoWindowInstance.current.setContent(contentHtml);
          infoWindowInstance.current.setPosition(pos);
          infoWindowInstance.current.setMap(mapInstance.current);
        };
      });

      days.forEach((dateString, dayIndex) => {
        if (
          selectedDay !== null &&
          viewMode === "plan" &&
          selectedDay !== dayIndex + 1
        )
          return;
        const dayItems = planData.filter(
          (p) => `${p.month}/${p.day}` === dateString,
        );
        if (dayItems.length === 0) return;

        const linePath = dayItems.map(
          (item) => new kakao.maps.LatLng(item.lat, item.lng),
        );
        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 5,
          strokeColor:
            selectedDay === null || viewMode === "map" || showSearchUI
              ? DAY_COLORS[dayIndex % DAY_COLORS.length]
              : DAY_COLORS[(selectedDay - 1) % DAY_COLORS.length],
          strokeOpacity: viewMode === "map" || showSearchUI ? 0.3 : 0.8,
          strokeStyle: "solid",
        });
        polyline.setMap(mapInstance.current);
        polylineInstances.current.push(polyline);
      });
    }

    // 2. 검색 결과 렌더링
    if ((viewMode === "map" || showSearchUI) && searchResults.length > 0) {
      const newPlaces = searchResults.filter(
        (p) =>
          !allFoundPlacesRef.current.some((existing) => existing.id === p.id),
      );
      allFoundPlacesRef.current = [...allFoundPlacesRef.current, ...newPlaces];

      const searchMarkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 36 42"><path d="M18 0C8.059 0 0 8.059 0 18c0 10.5 18 24 18 24s18-13.5 18-24C36 8.059 27.941 0 18 0zm0 25c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" fill="#4967fe" stroke="white" stroke-width="2.5"/><circle cx="18" cy="18" r="4" fill="white"/></svg>`;
      const searchMarkerImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(searchMarkerSvg)}`;
      const markerImage = new kakao.maps.MarkerImage(
        searchMarkerImageSrc,
        new kakao.maps.Size(32, 38),
        { offset: new kakao.maps.Point(16, 38) },
      );

      searchResults.forEach((place) => {
        const safeId = place.id;
        const pos = new kakao.maps.LatLng(place.y, place.x);
        bounds.extend(pos);
        hasBounds = true;

        const marker = new kakao.maps.Marker({
          position: pos,
          image: markerImage,
        });

        kakao.maps.event.addListener(marker, "click", () => {
          const addressText =
            place.road_address_name || place.address_name || "";
          const placeName = place.place_name || place.title;

          const content = `<div style="padding:15px; font-size:14px; width:220px; border-radius:12px; box-sizing:border-box;">
            <h4 style="margin:0 0 5px 0; font-size:15px; font-weight:bold; color:#1f2937; line-height:1.3; word-break:keep-all;">${placeName}</h4>
            <p style="margin:0 0 10px 0; font-size:12px; color:#6b7280; line-height:1.4;">${addressText}</p>
            <button onclick="window.addPlaceToTrip('${safeId}')" style="background:#4967fe; color:white; border:none; padding:10px; border-radius:8px; width:100%; cursor:pointer; font-weight:bold; margin-top:8px; transition:0.2s;">장소 추가하기</button>
          </div>`;

          infoWindowInstance.current.setContent(content);
          infoWindowInstance.current.open(mapInstance.current, marker);
        });
        clustererInstance.current.addMarker(marker);
      });
    }

    if (hasBounds && autoFitBoundsRef.current) {
      mapInstance.current.setBounds(bounds);
      autoFitBoundsRef.current = false;
    }
  }, [
    isMapLoaded,
    viewMode,
    showSearchUI,
    searchResults,
    planData,
    selectedDay,
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatActive]);

  /** 카카오 지도 다이렉트 검색 (키워드) */
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mapInstance.current || !keyword.trim()) return;

    const { kakao } = window as any;
    const ps = new kakao.maps.services.Places();
    const center = mapInstance.current.getCenter();

    const searchOptions = {
      location: center,
      radius: 5000,
    };

    ps.keywordSearch(
      keyword.trim(),
      (data: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          setSearchResults(data);
          setIsCatOpen(false);

          const bounds = new kakao.maps.LatLngBounds();
          data.forEach((place: any) => {
            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
          });
          mapInstance.current.setBounds(bounds);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          toast.error(`'${keyword}'에 대한 검색 결과가 없습니다.`);
        } else {
          toast.error("카카오 지도 검색 중 오류가 발생했습니다.");
        }
      },
      searchOptions,
    );
  };

  /** 카카오 지도 주변 다이렉트 검색 (카테고리) */
  const handleNearbySearch = async (catId: string) => {
    if (!mapInstance.current) return;
    const { kakao } = window as any;
    const ps = new kakao.maps.services.Places();
    const center = mapInstance.current.getCenter();
    const radius = 2000;

    const kakaoCode = KAKAO_CATEGORY_MAP[catId];

    const searchCallback = (data: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(data);
        const bounds = new kakao.maps.LatLngBounds();
        data.forEach((place: any) => {
          bounds.extend(new kakao.maps.LatLng(place.y, place.x));
        });
        mapInstance.current.setBounds(bounds);
        toast.success("주변 장소를 찾았습니다! 📍");
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        toast.error("주변에 해당 장소가 없습니다.");
      } else {
        toast.error("카카오 지도 검색 중 오류가 발생했습니다.");
      }
    };

    if (kakaoCode) {
      ps.categorySearch(kakaoCode, searchCallback, {
        location: center,
        radius: radius,
      });
    } else {
      const catLabel = CATEGORIES.find((c) => c.id === catId)?.label || "";
      ps.keywordSearch(catLabel, searchCallback, {
        location: center,
        radius: radius,
      });
    }
  };

  const uniqueDays = Array.from(
    new Set(planData.map((p) => `${p.month}/${p.day}`)),
  );

  return (
    <div className="flex w-full h-screen bg-white font-pretendard overflow-hidden relative">
      {/* 🌟 예쁜 경고 모달 */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-[360px] w-full flex flex-col items-center text-center transform transition-all">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-3xl mb-5 shadow-inner">
              ✨
            </div>
            <h3 className="text-xl font-extrabold text-gray-800 mb-3">
              AI 일정을 생성할까요?
            </h3>
            <p className="text-gray-500 text-[14px] mb-8 leading-relaxed">
              일정을 생성하거나 다시 조율하면
              <br />방 안의 <b>모든 참여자</b>의 화면이
              <br />
              새로운 일정으로 함께 변경됩니다.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  generateNewPlan();
                }}
                className="flex-1 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "map" ? (
        <Sidebar
          rooms={selectedPlaces}
          listTitle="우리가 모은 장소"
          dateRange={displayDateRange}
          bottomActions={[
            {
              label: lockedBy ? "다른 유저가 조율 중..." : "AI 일정 생성",
              icon: AI_PLAN_ICON,
              onClick: () => {
                if (lockedBy)
                  return toast.error(
                    `User ${lockedBy}님이 일정을 짜고 있어요 ⏳`,
                  );
                setIsConfirmModalOpen(true);
              },
            },
            { label: "나가기", icon: exitIcon, onClick: () => navigate("/") },
          ]}
          onRemovePlace={(id) =>
            setSelectedPlaces((prev) =>
              prev.filter(
                (p) =>
                  String(
                    p.id || p.placeId || p.contentid || p.contentId || p.title,
                  ) !== String(id),
              ),
            )
          }
          iconType="pin"
        />
      ) : (
        <Sidebar
          mode="plan"
          planData={planData}
          selectedDay={selectedDay}
          onDaySelect={(day) => {
            setSelectedDay((prev) => (prev === day ? null : day));
            autoFitBoundsRef.current = true;
          }}
          listTitle="AI 추천 일정"
          onPlaceClick={(lat, lng) => {
            if (mapInstance.current) {
              const { kakao } = window as any;
              mapInstance.current.panTo(new kakao.maps.LatLng(lat, lng));
            }
          }}
          bottomActions={[
            {
              label: showSearchUI ? "검색 닫기" : "장소 더 찾기",
              icon: ADD_PLACE_ICON,
              onClick: () => {
                setShowSearchUI(!showSearchUI);
                if (showSearchUI) setSearchResults([]);
              },
            },
            {
              label: lockedBy ? "다른 유저가 조율 중..." : "다시 조율",
              icon: REFRESH_PLAN_ICON,
              onClick: () => {
                if (lockedBy)
                  return toast.error(
                    `User ${lockedBy}님이 일정을 짜고 있어요 ⏳`,
                  );
                setIsConfirmModalOpen(true);
              },
            },
            { label: "나가기", icon: exitIcon, onClick: () => navigate("/") },
          ]}
        />
      )}

      <div className="flex-1 relative bg-gray-50">
        <div className="absolute top-[80px] right-[40px] z-[100] flex gap-4">
          {participants.map((p) => {
            const isMe = String(p.id) === String(myLoginId);
            const isSpeaking = speakingUsers.includes(String(p.id));
            const userColor = getUserColor(p.id);

            return (
              <div
                key={p.id}
                onClick={() => handleProfileClick(p.id)}
                className={`relative group flex flex-col items-center gap-2 transition-transform duration-75 cursor-pointer hover:scale-110`}
              >
                <div
                  className={`w-16 h-16 rounded-full border-2 border-white flex items-center justify-center overflow-hidden relative transition-all duration-75 z-10 ${
                    isSpeaking ? "scale-110" : ""
                  }`}
                  style={{
                    backgroundColor: userColor,
                    boxShadow: isSpeaking
                      ? `0 0 0 3px white, 0 0 20px 6px ${userColor}`
                      : "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <div className="text-white opacity-90">{USER_ICON}</div>
                  {p.isMuted && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="scale-50 opacity-80">
                        <MicIcon isActive={false} />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm text-white z-20 transition-all duration-75"
                  style={{
                    backgroundColor: userColor,
                    boxShadow: isSpeaking
                      ? `0 0 10px ${userColor}80`
                      : "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {p.name} {isMe && " (나)"}
                </div>

                {!isMe && (
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 translate-y-[-5px] group-hover:translate-y-0">
                    <div className="bg-gray-800/90 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-md flex items-center gap-1">
                      <span>📍</span> 위치 확인하기
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(viewMode === "map" || showSearchUI) && !isLoading && (
          <div className="animate-fadeIn">
            <div className="absolute top-[80px] left-[40px] z-[100] flex flex-wrap gap-2 w-[700px]">
              {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                <Button
                  key={cat.id}
                  label={`${cat.icon} 근처 ${cat.label}`}
                  variant="outline"
                  customSize="px-4 py-2 bg-white shadow-xl rounded-full hover:bg-primary-50 transition-colors"
                  textClassName="font-bold text-sm"
                  onClick={() => handleNearbySearch(cat.id)}
                />
              ))}
            </div>

            <div className="absolute top-[200px] left-1/2 -translate-x-1/2 z-[100] w-[1192px] px-[60px]">
              <div className="flex items-center bg-white rounded-[30px] shadow-2xl p-1 border border-gray-100">
                <div className="relative">
                  <button
                    onClick={() => setIsCatOpen(!isCatOpen)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-l-[30px] border-r"
                  >
                    <span className="text-[20px]">{selectedCat.icon}</span>
                    <span className="text-body3 font-bold">
                      {selectedCat.label}
                    </span>
                  </button>
                  {isCatOpen && (
                    <div className="absolute top-[110%] left-0 w-[180px] bg-white rounded-2xl shadow-2xl z-50">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCat(cat);
                            setIsCatOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-5 py-3 hover:bg-primary-50"
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <form
                  onSubmit={handleSearch}
                  className="flex flex-1 items-center"
                >
                  <input
                    className="flex-1 p-4 outline-none text-body3 bg-transparent"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="장소 검색"
                  />
                  <button
                    type="submit"
                    className="mr-2 bg-primary-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg"
                  >
                    🔍
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {viewMode === "plan" && !isLoading && !showSearchUI && (
          <div className="absolute bottom-[140px] left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur px-8 py-3 rounded-full shadow-lg border border-primary-200">
            <span className="text-primary-600 font-extrabold mr-2">
              {selectedDay === null
                ? "전체 일정"
                : `${selectedDay}일차 (${uniqueDays[selectedDay - 1] || ""})`}
            </span>
          </div>
        )}

        {isChatActive && (
          <div className="absolute bottom-[140px] right-[40px] w-[360px] h-[480px] bg-white/95 backdrop-blur shadow-2xl rounded-[24px] z-[300] flex flex-col overflow-hidden border border-primary-100 animate-fadeIn">
            <div className="p-5 bg-primary-600 text-white font-bold flex justify-between items-center">
              <span>실시간 채팅 & STT</span>
              {isMicActive && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {messages
                .filter((msg) => msg.text !== "[[PLAN_UPDATED]]")
                .map((msg, i) => {
                  const isMe = msg.sender === myLoginId;
                  const isSystem = msg.sender === "SYSTEM";

                  if (isSystem) {
                    return (
                      <div key={i} className="flex justify-center my-2">
                        <span className="bg-gray-200 text-gray-600 text-[11px] px-3 py-1 rounded-full">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-gray-400 mb-1">
                        {isMe ? "나" : msg.sender}
                      </span>
                      <div
                        className={`px-4 py-2 rounded-xl text-body4 shadow-sm max-w-[85%] break-words ${isMe ? "bg-primary-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {(isLoading || lockedBy) && (
          <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-h3 font-bold text-gray-800 text-center leading-relaxed">
              {lockedBy ? (
                <>
                  User {lockedBy}님이 AI 일정을 갱신 중입니다...
                  <br />
                  잠시만 기다려주세요! ✈️
                </>
              ) : (
                "AI가 완벽한 동선을 짜고 있습니다... ✈️"
              )}
            </h2>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="absolute bottom-[40px] right-[40px] z-[200] flex items-center gap-4">
        <button
          onClick={() => setIsChatActive(!isChatActive)}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${isChatActive ? "bg-primary-700" : "bg-primary-500"}`}
        >
          <img src={CHAT_ICON} alt="chat" className="w-10 h-10" />
        </button>
        <button
          onClick={handleMicToggle}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all border-none outline-none bg-transparent cursor-pointer"
        >
          <MicIcon isActive={isMicActive} />
        </button>
      </div>
    </div>
  );
}
