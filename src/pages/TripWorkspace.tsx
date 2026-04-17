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

import exitIcon from "../assets/icons/exit_to_app.svg";

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
  { id: "festival", label: "축제", icon: "🎉" },
  { id: "leports", label: "레포츠", icon: "⚽" },
  { id: "stay", label: "숙박", icon: "🏨" },
  { id: "shopping", label: "쇼핑", icon: "🛍️" },
  { id: "food", label: "음식점", icon: "🍕" },
];
const DAY_COLORS = [
  "#1A40FF",
  "#FF4081",
  "#00C853",
  "#FFAB00",
  "#9C27B0",
  "#FF5722",
];

export default function TripWorkspace() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentRoomId = searchParams.get("roomId");

  useEffect(() => {
    if (!currentRoomId) {
      alert("유효하지 않은 초대 링크입니다. 정상적인 링크로 접속해주세요!");
      navigate("/");
    }
  }, [currentRoomId, navigate]);

  const safeRoomId = currentRoomId as string;

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
  const [toastMsg, setToastMsg] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const lastSentTime = useRef(0); // 전송 빈도 조절용
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
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const allFoundPlacesRef = useRef<any[]>([]);
  const cursorOverlaysRef = useRef<{ [uid: string]: any }>({});

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  /** 장소 추가 함수 */
  useEffect(() => {
    (window as any).addPlaceToTrip = (placeId: string) => {
      const place = allFoundPlacesRef.current.find((p) => {
        const safeId = String(
          p.id || p.placeId || p.contentid || p.contentId || p.title,
        );
        return safeId === String(placeId);
      });

      if (place) {
        setSelectedPlaces((prev) => {
          const isDuplicate = prev.some((p) => {
            const pId = String(
              p.id || p.placeId || p.contentid || p.contentId || p.title,
            );
            return pId === String(placeId);
          });
          if (isDuplicate) return prev;
          return [...prev, place];
        });
        showToast(`✅ '${place.title}'이(가) 리스트에 추가되었습니다!`);
      }
    };
  }, []);

  /** 🌟 방 진입 시 일정 불러오기 (원복된 엄격한 파서) */
  const loadExistingPlan = async () => {
    try {
      const res: any = await travelApi.getLatestPlan(safeRoomId);

      if (res.data && res.data.items && res.data.items.length > 0) {
        setPlanData(res.data.items);
        setViewMode("plan");
        console.log("✅ 저장된 일정을 성공적으로 불러왔습니다!");
      } else if (res && res.items && res.items.length > 0) {
        setPlanData(res.items);
        setViewMode("plan");
        console.log("✅ 저장된 일정을 성공적으로 불러왔습니다!");
      } else {
        console.log("아직 저장된 일정이 없습니다.");
      }
    } catch (err: any) {
      console.log("아직 일정이 없거나 방이 처음 생성되었습니다.");
    }
  };
  //남들에게 내 상태를 알리는 함수
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

  /**AI 일정 생성 (날아감 방지 + 엄격한 파서 + 웹소켓 통째로 전송) */
  const generateNewPlan = async () => {
    //누군가 이미 만들고 있다면 튕겨내기 (이중 방어)
    if (lockedBy) {
      showToast(`현재 User ${lockedBy}님이 일정을 생성 중입니다 ⏳`);
      return;
    }
    const existingPlaces = planData.map((p) => p.place);
    const newPlaces = selectedPlaces.map((p) => p.title);
    const allPlacesToGenerate = Array.from(
      new Set([...existingPlaces, ...newPlaces]),
    );

    if (allPlacesToGenerate.length === 0) {
      alert("선택된 장소가 없습니다. 먼저 장소를 추가해주세요!");
      return;
    }

    setIsLoading(true);
    broadcastLock(true);
    try {
      const requestData = {
        roomId: safeRoomId,
        selectedPlaceName: allPlacesToGenerate.join(", "),
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

      // 1. 내 화면 즉시 갱신
      setPlanData(newPlanItems);
      setViewMode("plan");
      setShowSearchUI(false);
      setSelectedPlaces([]);
      console.log("🔥 [발송 직전 웹소켓 상태 확인] ws.current:", ws.current);
      console.log(
        "🔥 [상태 코드] readyState:",
        ws.current?.readyState,
        "(1이어야 정상 OPEN 상태입니다)",
      );

      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            roomId: safeRoomId,
            sender: myLoginId,
            text: "[[PLAN_UPDATED]]",
          }),
        );
        console.log("✅ 웹소켓 전송 완료!");
      } else {
        console.error(
          "🚨 앗! 웹소켓 연결이 끊어져서 신호를 보낼 수 없습니다. 현재 상태:",
          ws.current?.readyState,
        );
      }

      // 2. 다른 사람들에게 신호 보내기 (데이터 대신 Trigger 역할만)
    } catch (err: unknown) {
      console.error("AI 일정 생성 실패:", err);
      alert("일정 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
      broadcastLock(false);
    }
  };
  useEffect(() => {
    if (safeRoomId) loadExistingPlan();
  }, [safeRoomId]);

  /** WebSocket 연결 */
  useEffect(() => {
    if (!safeRoomId) return;
    const socket = new WebSocket(
      `wss://tavelzip.p-e.kr/ws/voice?roomId=${safeRoomId}`,
    );
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("🔥 [웹소켓 수신 전체 데이터]", data);
      console.log(`내 아이디: [${myLoginId}], 보낸사람: [${data.sender}]`);

      // 1. 서버가 CHAT으로 보낸 경우
      if (data.type === "CHAT") {
        // 🌟 우리가 약속한 비밀 암호가 들어왔을 때
        if (data.text === "[[PLAN_UPDATED]]") {
          // 내가 누른 게 아닐 때만 갱신 (메아리 방지)
          if (data.sender !== myLoginId) {
            setViewMode("plan");
            setShowSearchUI(false);
            showToast(
              "🚀 누군가 일정을 생성(갱신)했습니다! 다 함께 이동합니다.",
            );
            loadExistingPlan(); // 백엔드 DB에서 최신 일정 불러오기
          }
        }
        // 🌟 일반 텍스트 채팅이거나 SYSTEM 메시지일 때
        else {
          setMessages((prev) => [...prev, data]);
        }
      }
      // 2. 서버가 PLACES로 보낸 경우 (AI 장소 추출)
      else if (data.type === "PLACES") {
        if (data.places && data.places.length > 0) {
          showToast(`📍 AI가 장소를 인식했어요: ${data.places.join(", ")}`);
          const aiPlaces = data.places.map(
            (placeName: string, index: number) => ({
              id: `ai-place-${Date.now()}-${index}`,
              title: placeName,
              mapx: mapInstance.current?.getCenter().getLng() || 126.570667,
              mapy: mapInstance.current?.getCenter().getLat() || 33.450701,
            }),
          );

          setSelectedPlaces((prev) => {
            const existing = prev.map((p) => p.title);
            const newPlaces = aiPlaces.filter(
              (np: any) => !existing.includes(np.title),
            );
            return [...prev, ...newPlaces];
          });
        }
      }

      // 🚨 기존에 있던 CHANGE_MODE 부분은 백엔드가 보내주지 않으므로 완전히 삭제했습니다.
    };

    return () => socket.close();
  }, [safeRoomId, myLoginId]);

  /** Web Speech API */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && isMicActive) {
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

      recognition.onend = () => {
        if (isMicActive) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else if (!isMicActive && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [safeRoomId, myLoginId, isMicActive]);

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

        // 🌟 유저가 나갔을 때, 혹시 그 사람이 락을 걸고 나갔다면 풀어주기 (안전장치)
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

        //볼륨 데이터를 받아서 말하는 사람 걸러내기
        agoraClient.current.on("volume-indicator", (volumes) => {
          //(디버깅용)
          // 상대방 컴퓨터에 내 목소리가 레벨 몇(level)으로 도착하는지 숫자로 볼 수 있습니다
          // console.log("🎤 수신된 볼륨 데이터:", volumes);

          const activeSpeakers = volumes
            // 상대방의 미세한 소리 수신 데이터 캐치
            .filter((vol) => vol.level > 20)
            .map((vol) => {
              // 본인의 uid는 0이나 빈 문자열로 올 수 있으므로 예외 처리
              if (vol.uid === 0 || vol.uid === "") return String(myLoginId);
              return String(vol.uid);
            });

          setSpeakingUsers(activeSpeakers);
        });
        //Web SDK에서는 createDataStream 과정이 필요 없으므로 위의 블록은 깔끔하게 삭제했습니다.

        (agoraClient.current as any).on(
          "stream-message",
          (uid: string, payload: Uint8Array) => {
            try {
              const decoder = new TextDecoder();
              const data = JSON.parse(decoder.decode(payload));

              if (data.type === "MOUSE_MOVE" && mapInstance.current) {
                const { kakao } = window as any;
                const pos = new kakao.maps.LatLng(data.lat, data.lng);

                // 1. 해당 유저의 커서 오버레이가 아직 없다면 새로 생성
                if (!cursorOverlaysRef.current[uid]) {
                  const content = document.createElement("div");
                  content.innerHTML = `
                    <div style="position: absolute; pointer-events: none; z-index: 50; display: flex; flex-direction: column; items-center; transform: translate(-50%, -50%);">
                      <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                        <path d="M5.65376 2.00018L21.4397 18.2323C22.6865 19.5142 21.778 21.6565 19.9678 21.6565H13.6828C13.1678 21.6565 12.6781 21.8797 12.3364 22.2694L7.5447 27.7323C6.31475 29.1342 3.99951 28.2618 3.99951 26.4014V3.90483C3.99951 2.02298 6.32623 1.11584 7.56459 2.47648L5.65376 2.00018Z" fill="#FF4081" stroke="white" stroke-width="2" />
                      </svg>
                      <div style="background-color: #FF4081; color: white; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; margin-top: 4px;">
                        User ${uid}
                      </div>
                    </div>
                  `;

                  const customOverlay = new kakao.maps.CustomOverlay({
                    position: pos,
                    content: content,
                    map: mapInstance.current, // 지도에 부착!
                  });
                  cursorOverlaysRef.current[uid] = customOverlay;
                }
                // 2. 이미 있다면 위치만 부드럽게 갱신
                else {
                  cursorOverlaysRef.current[uid].setPosition(pos);
                }
              }
              // 👇 이 부분 추가! (락 신호를 받았을 때)
              else if (data.type === "LOCK_PLAN") {
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
      localAudioTrack.current?.stop();
      localAudioTrack.current?.close();
      agoraClient.current?.leave();
    };
  }, [safeRoomId, myLoginId]);

  const handleMicToggle = async () => {
    if (!agoraClient.current) return;
    try {
      if (!isMicActive) {
        const track = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrack.current = track;
        await agoraClient.current.publish(track);
        setIsMicActive(true);
        setParticipants((prev) =>
          prev.map((p) => (p.id === myLoginId ? { ...p, isMuted: false } : p)),
        );
      } else {
        if (localAudioTrack.current) {
          await agoraClient.current.unpublish(localAudioTrack.current);
          localAudioTrack.current.stop();
          localAudioTrack.current.close();
        }
        setIsMicActive(false);
        setParticipants((prev) =>
          prev.map((p) => (p.id === myLoginId ? { ...p, isMuted: true } : p)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

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

        // 🌟 지도가 로드된 직후, 카카오 지도 마우스 이벤트 리스너 등록!
        kakao.maps.event.addListener(
          mapInstance.current,
          "mousemove",
          function (mouseEvent: any) {
            if (!agoraClient.current) return;

            const now = Date.now();
            if (now - lastSentTime.current > 80) {
              // 80ms 쓰로틀링 유지
              const latlng = mouseEvent.latLng; // 화면 %가 아닌 실제 위도/경도!

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
      });
    };

    initMap();
  }, []);

  const handleProfileClick = (targetUid: string) => {
    // 1. 내 프로필을 눌렀을 때는 무시
    if (String(targetUid) === String(myLoginId)) {
      showToast("이것은 내 프로필입니다.");
      return;
    }

    // 2. 상대방의 커서 오버레이 객체가 있는지 확인
    const overlay = cursorOverlaysRef.current[targetUid];
    if (overlay && mapInstance.current) {
      // 3. 오버레이에서 현재 위도/경도 좌표를 뽑아내서 그곳으로 지도 이동!
      const pos = overlay.getPosition();
      mapInstance.current.panTo(pos);
      showToast(`🚀 User ${targetUid}님의 위치로 이동했습니다!`);
    } else {
      showToast(
        `User ${targetUid}님의 현재 마우스 위치를 아직 알 수 없습니다.`,
      );
    }
  };

  /** 지도 렌더링 (이미지 포함) */
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

    // ==========================================
    // 1. AI 일정 렌더링 (번호가 적힌 예쁜 커스텀 핀)
    // ==========================================
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

        // 해당 일정의 요일 인덱스를 구해서 선(Polyline) 색상과 깔맞춤합니다!
        const dayIndex = days.indexOf(`${item.month}/${item.day}`);
        const pinColor =
          selectedDay === null || viewMode === "map" || showSearchUI
            ? DAY_COLORS[dayIndex % DAY_COLORS.length]
            : "#1A40FF";

        // 🌟 촌스러운 기본 마커 대신 예쁜 HTML/CSS 커스텀 마커 생성
        const content = document.createElement("div");
        content.innerHTML = `
          <div style="position:relative; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; transform:translateY(-10px);">
            <div style="background-color:${pinColor}; width:32px; height:32px; border-radius:50%; display:flex; justify-content:center; align-items:center; border:2.5px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.3); z-index:2; position:relative;">
              <span style="color:white; font-weight:900; font-size:14px; font-family:sans-serif;">${idx + 1}</span>
            </div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid ${pinColor}; margin-top:-2px; z-index:1; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
          </div>
        `;

        // 카카오 CustomOverlay로 지도에 부착
        const customMarker = new kakao.maps.CustomOverlay({
          position: pos,
          content: content,
          map: mapInstance.current,
          yAnchor: 1, // 마커의 꼬리 부분이 정확히 좌표에 닿도록 설정
          zIndex: 10,
        });

        markersRef.current.push(customMarker);

        // 마커 클릭 시 InfoWindow 열기
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

          // CustomOverlay는 이 방식으로 인포윈도우를 띄워야 합니다.
          infoWindowInstance.current.setContent(contentHtml);
          infoWindowInstance.current.setPosition(pos);
          infoWindowInstance.current.setMap(mapInstance.current);
        };
      });

      // 선(Polyline) 그리기 로직 (기존과 동일)
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
              : "#1A40FF",
          strokeOpacity: viewMode === "map" || showSearchUI ? 0.3 : 0.8,
          strokeStyle: "solid",
        });
        polyline.setMap(mapInstance.current);
        polylineInstances.current.push(polyline);
      });
    }

    // ==========================================
    // 2. 검색 결과 렌더링 (세련된 기본 핀으로 교체)
    // ==========================================
    if ((viewMode === "map" || showSearchUI) && searchResults.length > 0) {
      const newPlaces = searchResults.filter(
        (p) =>
          !allFoundPlacesRef.current.some(
            (existing) => existing.title === p.title,
          ),
      );
      allFoundPlacesRef.current = [...allFoundPlacesRef.current, ...newPlaces];

      // 🌟 검색 마커용 커스텀 SVG 아이콘 (클러스터링 호환용)
      const searchMarkerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="38" viewBox="0 0 36 42"><path d="M18 0C8.059 0 0 8.059 0 18c0 10.5 18 24 18 24s18-13.5 18-24C36 8.059 27.941 0 18 0zm0 25c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z" fill="#4967fe" stroke="white" stroke-width="2.5"/><circle cx="18" cy="18" r="4" fill="white"/></svg>`;
      const searchMarkerImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(searchMarkerSvg)}`;
      const imageSize = new kakao.maps.Size(32, 38);
      const markerImage = new kakao.maps.MarkerImage(
        searchMarkerImageSrc,
        imageSize,
        {
          offset: new kakao.maps.Point(16, 38),
        },
      );

      searchResults.forEach((place) => {
        const safeId =
          place.id ||
          place.placeId ||
          place.contentid ||
          place.contentId ||
          place.title;
        const pos = new kakao.maps.LatLng(
          place.mapy || place.lat,
          place.mapx || place.lng,
        );
        bounds.extend(pos);
        hasBounds = true;

        const marker = new kakao.maps.Marker({
          position: pos,
          image: markerImage, // 🌟 여기서 커스텀 이미지를 적용!
        });

        kakao.maps.event.addListener(marker, "click", () => {
          const content = `<div style="padding:15px; min-width:180px;">
            <h4 style="margin:0 0 5px 0; font-size:14px; font-weight:bold; color:#1f2937;">${place.title}</h4>
            <button onclick="window.addPlaceToTrip('${safeId}')" style="background:#4967fe; color:white; border:none; padding:10px; border-radius:8px; width:100%; cursor:pointer; font-weight:bold; margin-top:8px; transition:0.2s;">장소 추가하기</button>
          </div>`;
          infoWindowInstance.current.setContent(content);
          infoWindowInstance.current.open(mapInstance.current, marker);
        });
        clustererInstance.current.addMarker(marker);
      });
    }

    if (hasBounds) {
      mapInstance.current.setBounds(bounds);
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

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!mapInstance.current || !keyword.trim()) return;

    const { kakao } = window as any;
    const ps = new kakao.maps.services.Places();
    const center = mapInstance.current.getCenter();

    const searchOptions = {
      location: center,
      radius: 5000,
      sort: kakao.maps.services.SortBy.ACCURACY,
    };

    ps.keywordSearch(
      keyword.trim(),
      async (data: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const searchLat = Number(data[0].y);
          const searchLng = Number(data[0].x);

          try {
            const res = await searchApi.searchPlaces({
              category:
                selectedCat.id === "all" ? undefined : String(selectedCat.id),
              keyword: String(keyword.trim()),
              lat: Number(searchLat.toFixed(6)),
              lng: Number(searchLng.toFixed(6)),
              radius: 2000,
              roomId: safeRoomId,
            });

            if (!res.data || res.data.length === 0) {
              alert(`'${keyword}'에 대한 여행지 데이터가 없습니다.`);
              return;
            }

            setSearchResults(res.data);
            setIsCatOpen(false);
            mapInstance.current.panTo(
              new kakao.maps.LatLng(searchLat, searchLng),
            );
          } catch (error) {
            console.error("검색 실패:", error);
          }
        } else {
          alert("카카오 지도에서 위치를 찾을 수 없습니다.");
        }
      },
      searchOptions,
    );
  };

  const handleNearbySearch = async (cat: string) => {
    if (!mapInstance.current) return;
    const center = mapInstance.current.getCenter();

    try {
      const res = await searchApi.getNearbyPlaces({
        lat: Number(center.getLat().toFixed(6)),
        lng: Number(center.getLng().toFixed(6)),
        radius: 2000,
        categories: cat,
        roomId: safeRoomId,
      } as any);

      if (!res.data || res.data.length === 0) {
        alert("주변에 해당 장소가 없습니다.");
        return;
      }
      setSearchResults(res.data);
    } catch (error) {
      console.error("주변 검색 실패:", error);
      alert("주변 장소를 불러오지 못했습니다.");
    }
  };

  return (
    <div className="flex w-full h-screen bg-white font-pretendard overflow-hidden relative">
      {/* 🌟 다른 사람들의 실시간 마우스 커서 */}
      {/* 👇 1. 여기에 예쁜 경고 모달을 추가합니다 👇 */}
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
                  setIsConfirmModalOpen(false); // 모달 닫기
                  generateNewPlan(); // 🚀 실제 일정 생성 함수 실행!
                }}
                className="flex-1 py-3.5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30"
              >
                생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 여기서부터 복사해서 덮어씌워 주세요 👇 */}
      {viewMode === "map" ? (
        <Sidebar
          rooms={selectedPlaces}
          listTitle="우리가 모은 장소"
          bottomActions={[
            {
              // 🌟 1. "AI 일정 생성" 버튼 (map 모드)
              label: lockedBy ? "다른 유저가 조율 중..." : "AI 일정 생성",
              icon: AI_PLAN_ICON,
              onClick: () => {
                if (lockedBy)
                  return showToast(
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
          onDaySelect={(day) =>
            setSelectedDay((prev) => (prev === day ? null : day))
          }
          listTitle="AI 추천 일정"
          bottomActions={[
            {
              // 🌟 2. 잃어버렸던 "장소 더 찾기" 버튼 부활! (plan 모드)
              label: showSearchUI ? "검색 닫기" : "장소 더 찾기",
              icon: ADD_PLACE_ICON,
              onClick: () => {
                setShowSearchUI(!showSearchUI);
                if (showSearchUI) setSearchResults([]); // 닫을 때 검색 결과 초기화
              },
            },
            {
              // 🌟 3. "다시 조율" 버튼 (plan 모드)
              label: lockedBy ? "다른 유저가 조율 중..." : "다시 조율",
              icon: REFRESH_PLAN_ICON,
              onClick: () => {
                if (lockedBy)
                  return showToast(
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

            //이 유저가 현재 말하고 있는지 확인
            const isSpeaking = speakingUsers.includes(String(p.id));
            return (
              <div
                key={p.id}
                onClick={() => handleProfileClick(p.id)}
                className={`relative group flex flex-col items-center gap-2 transition-transform ${isMe ? "" : "cursor-pointer hover:scale-110"}`}
              >
                <div
                  // 🌟 말하고 있을 때(isSpeaking) 디스코드처럼 초록색 테두리와 펄스(pulse) 애니메이션 부여!
                  className={`w-16 h-16 rounded-full border-2 bg-gray-300 flex items-center justify-center overflow-hidden relative transition-all ${
                    isSpeaking
                      ? "border-green-400 ring-4 ring-green-400/40 shadow-[0_0_15px_rgba(74,222,128,0.6)] scale-105"
                      : isMe
                        ? "border-primary-600 ring-4 ring-primary-100 shadow-lg"
                        : "border-white hover:border-primary-400 shadow-lg"
                  }`}
                >
                  {USER_ICON}
                  {p.isMuted && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="scale-50 opacity-80">
                        <MicIcon isActive={false} />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm ${isMe ? "bg-primary-600 text-white" : "bg-white/80 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-700"}`}
                >
                  {p.name} {isMe && " (나)"}
                </div>
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
              {selectedDay === null ? "전체 일정" : `${selectedDay}일차`}
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

        {isLoading && (
          <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-h3 font-bold text-gray-800">
              AI가 완벽한 동선을 짜고 있습니다...
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
