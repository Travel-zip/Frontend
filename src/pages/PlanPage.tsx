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

// 기존 이미지 임포트
import exitIcon from "../assets/icons/exit_to_app.svg";

/** =========================================================================
 * [아이콘 정의 영역]
 * ========================================================================= */
const AGORA_APP_ID = "882e4424401f46b1af80749bc88d5edb";
const AGORA_TOKEN =
  "007eJxTYMj0OX7heNzRtM1WEqGcWZPDl6/c4bhwti5fBYNg5YI1dh8VGCwsjFJNTIxMTAwM00zMkgwT0ywMzE0sk5ItLFJMU1OSzGLuZTYEMjK8OredmZEBAkF8CYai/Pxc3crSrMw8XUNzc1NLIDA2MLI0YWAAALinJHU=";
const ROOM_ID = "jeju-trip-2025";

const rawAddSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 10V30M10 20H30" stroke="#1C1B1F" stroke-width="3" stroke-linecap="round"/></svg>`;
const ADD_PLACE_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawAddSvg)}`;
const rawRefreshSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_60" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_60)"><path d="M14.4747 34.7177C12.7567 33.9741 11.2588 32.9634 9.981 31.6856C8.70322 30.4078 7.69252 28.9099 6.94891 27.1919C6.2053 25.4741 5.8335 23.6323 5.8335 21.6664H8.3335C8.3335 24.9164 9.46544 27.6734 11.7293 29.9373C13.9932 32.2012 16.7502 33.3331 20.0002 33.3331C23.2502 33.3331 26.0071 32.2012 28.271 29.9373C30.5349 27.6734 31.6668 24.9164 31.6668 21.6664C31.6668 18.4164 30.5349 15.6595 28.271 13.3956C26.0071 11.1317 23.2502 9.99978 20.0002 9.99978H19.5577L22.2052 12.6473L20.4489 14.4548L14.7439 8.73395L20.481 3.0127L22.2372 4.8202L19.5577 7.49978H20.0002C21.966 7.49978 23.8078 7.87159 25.5256 8.6152C27.2436 9.35881 28.7416 10.3695 30.0193 11.6473C31.2971 12.9251 32.3078 14.423 33.0514 16.141C33.795 17.8588 34.1668 19.7006 34.1668 21.6664C34.1668 23.6323 33.795 25.4741 33.0514 27.1919C32.3078 28.9099 31.2971 30.4078 30.0193 31.6856C28.7416 32.9634 27.2436 33.9741 25.5256 34.7177C23.8078 35.4613 21.966 35.8331 20.0002 35.8331C18.0343 35.8331 16.1925 35.4613 14.4747 34.7177Z" fill="#FEFEFE"/></g></svg>`;
const REFRESH_PLAN_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawRefreshSvg)}`;
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

export default function PlanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentRoomId = searchParams.get("roomId") || ROOM_ID;

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

  // --- [States] ---
  const [keyword, setKeyword] = useState("");
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [isChatActive, setIsChatActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);

  const myLoginId = localStorage.getItem("loginId") || "나";
  const [participants, setParticipants] = useState<any[]>([
    { id: myLoginId, name: myLoginId, isMuted: true },
  ]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [planData, setPlanData] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearchUI, setShowSearchUI] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 🌟 핵심 추가: 사용자가 수동으로 추가하거나 말해서 찾은 장소 보관함
  const [addedPlaces, setAddedPlaces] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      // 🌟 방금 전까지 모아둔 장소들을 AI에게 통째로 전달합니다!
      const requestData = {
        roomId: currentRoomId,
        selectedPlaceName: addedPlaces.join(", "), // 여기에 강제로 때려 넣습니다.
        selectedRestaurantName: "",
        selectedStayName: "",
      };

      const res: any = await travelApi.generatePlan(requestData as any);

      if (res && res.data && res.data.items) {
        setPlanData(res.data.items);
      } else if (res && res.items) {
        setPlanData(res.items);
      } else {
        throw new Error("데이터 구조 불일치");
      }

      // ✅ AI 일정이 성공적으로 만들어지면 보관함 비우기 (중복 반영 방지)
      setAddedPlaces([]);
    } catch (err: unknown) {
      console.error("AI 일정 생성 실패:", err);
      alert("AI 일정 생성 실패! 통신 상태를 확인하세요.");
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [currentRoomId]);

  /** 1. WebSocket 연결 */
  useEffect(() => {
    const socket = new WebSocket(
      `wss://tavelzip.p-e.kr/ws/voice?roomId=${currentRoomId}`,
    );
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "CHAT") {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === "PLACES") {
        if (data.places && data.places.length > 0) {
          showToast(`📍 AI가 장소를 인식했어요: ${data.places.join(", ")}`);

          // 🌟 1. AI 일정 갱신을 위해 보관함에 이름 저장
          setAddedPlaces((prev) => [...prev, ...data.places]);

          // 🌟 2. 화면(PlanData)에 즉시 임시로 띄워주기
          const aiItems = data.places.map((placeName: string) => ({
            month: 4,
            day: 22,
            hour: 12,
            minute: 0,
            place: placeName,
            memo: "🗣️ 대화로 인식된 장소 (다시 조율을 누르면 일정에 완벽 반영됩니다)",
            lat: mapInstance.current?.getCenter().getLat() || 33.450701,
            lng: mapInstance.current?.getCenter().getLng() || 126.570667,
          }));

          // 중복 방지 후 화면에 추가
          setPlanData((prev) => {
            const existing = prev.map((p) => p.place);
            const newItems = aiItems.filter(
              (i: any) => !existing.includes(i.place),
            );
            return [...prev, ...newItems];
          });
        }
      }
    };

    return () => socket.close();
  }, [currentRoomId]);

  /** 2. Web Speech API */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
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
                  roomId: currentRoomId,
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
    }
  }, [currentRoomId, myLoginId, isMicActive]);

  /** 3. Agora 초기화 */
  useEffect(() => {
    // 기존 Agora 로직과 동일
    const initAgora = async () => {
      try {
        agoraClient.current = AgoraRTC.createClient({
          mode: "rtc",
          codec: "vp8",
        });
        agoraClient.current.on("user-published", async (user, mediaType) => {
          if (mediaType === "audio") {
            await agoraClient.current?.subscribe(user, mediaType);
            user.audioTrack?.play();
          }
        });
        await agoraClient.current.join(
          AGORA_APP_ID,
          currentRoomId,
          AGORA_TOKEN,
          myLoginId,
        );
        const existingUsers = agoraClient.current.remoteUsers;
        if (existingUsers.length > 0) {
          setParticipants((prev) => {
            const newParticipants = [...prev];
            existingUsers.forEach((user) => {
              // 중복 추가 방지
              if (!newParticipants.find((p) => p.id === user.uid)) {
                newParticipants.push({
                  id: user.uid,
                  name: `User ${user.uid}`,
                  isMuted: true, // 처음엔 소리가 구독 안 됐으니 true로 세팅
                });
              }
            });
            return newParticipants;
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    initAgora();
    return () => {
      localAudioTrack.current?.stop();
      localAudioTrack.current?.close();
      agoraClient.current?.leave();
    };
  }, [currentRoomId, myLoginId]);

  /** 장소 직접 추가 로직 */
  useEffect(() => {
    (window as any).addPlaceToTrip = (placeId: string) => {
      const place = allFoundPlacesRef.current.find(
        (p) => String(p.contentid || p.contentId) === String(placeId),
      );
      if (place) {
        // 🌟 1. AI 일정 갱신을 위해 보관함에 이름 저장
        setAddedPlaces((prev) => [...prev, place.title]);

        // 🌟 2. 화면(PlanData)에 즉시 띄워주기
        setPlanData((prev) => [
          ...prev,
          {
            month: 4,
            day: 22,
            hour: 12,
            minute: 0,
            place: place.title,
            memo: "✅ 직접 추가한 장소 (다시 조율을 누르면 일정에 완벽 반영됩니다)",
            lat: place.mapy || place.lat,
            lng: place.mapx || place.lng,
          },
        ]);
        alert(
          `'${place.title}'이(가) 리스트에 추가되었습니다!\n우측 하단의 [다시 조율] 버튼을 누르시면 AI가 완벽한 동선으로 짜줍니다.`,
        );
        setShowSearchUI(false);
      }
    };
  }, []);

  /** 지도 초기화 및 그리기 로직 (생략 방지) */
  useEffect(() => {
    const { kakao } = window as any;
    if (!kakao) return;
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
    });
  }, []);

  useEffect(() => {
    const { kakao } = window as any;
    if (!kakao || !mapInstance.current || planData.length === 0) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylineInstances.current.forEach((p) => p.setMap(null));
    polylineInstances.current = [];

    const bounds = new kakao.maps.LatLngBounds();
    const days = Array.from(
      new Set(planData.map((p) => `${p.month}/${p.day}`)),
    );

    let targetPlans = planData;
    if (selectedDay !== null) {
      const targetDate = days[selectedDay - 1];
      targetPlans = planData.filter(
        (p) => `${p.month}/${p.day}` === targetDate,
      );
    }

    targetPlans.forEach((item, idx) => {
      const pos = new kakao.maps.LatLng(item.lat, item.lng);
      bounds.extend(pos);
      const marker = new kakao.maps.Marker({
        position: pos,
        map: mapInstance.current,
        title: item.place,
      });
      markersRef.current.push(marker);
      kakao.maps.event.addListener(marker, "click", () => {
        const prefix = selectedDay === null ? "" : `<b>${idx + 1}.</b> `;
        const content = `<div style="padding:15px; font-size:14px;">${prefix}<b>${item.place}</b><br/><span style="color:#666; font-size:12px;">${item.memo}</span></div>`;
        infoWindowInstance.current.setContent(content);
        infoWindowInstance.current.open(mapInstance.current, marker);
      });
    });

    days.forEach((dateString, dayIndex) => {
      if (selectedDay !== null && selectedDay !== dayIndex + 1) return;
      const dayItems = planData.filter(
        (p) => `${p.month}/${p.day}` === dateString,
      );
      if (dayItems.length === 0) return;
      const linePath = dayItems.map(
        (item) => new kakao.maps.LatLng(item.lat, item.lng),
      );
      const strokeColor =
        selectedDay === null
          ? DAY_COLORS[dayIndex % DAY_COLORS.length]
          : "#1A40FF";
      const polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: strokeColor,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polyline.setMap(mapInstance.current);
      polylineInstances.current.push(polyline);
    });

    mapInstance.current.setBounds(bounds);
  }, [selectedDay, planData, isLoading]);

  const handleUpdatePlan = () => {
    showToast("🔄 추가된 장소들을 바탕으로 일정을 완벽하게 다시 짭니다...");
    fetchPlan(); // 🌟 여기서 모아둔 장소들을 쏴줍니다!
  };

  const handleMicToggle = async () => {
    if (!recognitionRef.current || !agoraClient.current) return;
    try {
      if (!isMicActive) {
        const track = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrack.current = track;
        await agoraClient.current.publish(track);
        recognitionRef.current.start();
        setIsMicActive(true);
      } else {
        if (localAudioTrack.current) {
          await agoraClient.current.unpublish(localAudioTrack.current);
          localAudioTrack.current.stop();
          localAudioTrack.current.close();
        }
        recognitionRef.current.stop();
        setIsMicActive(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayMarkersSearch = (places: any[]) => {
    const { kakao } = window as any;
    clustererInstance.current.clear();
    const bounds = new kakao.maps.LatLngBounds();
    allFoundPlacesRef.current = [...allFoundPlacesRef.current, ...places];
    places.forEach((place) => {
      const id = place.contentid || place.contentId;
      const pos = new kakao.maps.LatLng(
        place.mapy || place.lat,
        place.mapx || place.lng,
      );
      bounds.extend(pos);
      const marker = new kakao.maps.Marker({ position: pos });
      kakao.maps.event.addListener(marker, "click", () => {
        const content = `<div style="padding:15px; min-width:180px;"><h4 style="margin:0 0 5px 0; font-size:14px;">${place.title}</h4><button onclick="window.addPlaceToTrip('${id}')" style="background:#4967fe; color:white; border:none; padding:8px; border-radius:6px; width:100%; cursor:pointer;">장소 추가하기</button></div>`;
        infoWindowInstance.current.setContent(content);
        infoWindowInstance.current.open(mapInstance.current, marker);
      });
      clustererInstance.current.addMarker(marker);
    });
    mapInstance.current.setBounds(bounds);
  };

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
          const targetLat = Number(data[0].y);
          const targetLng = Number(data[0].x);

          try {
            const res = await searchApi.searchPlaces({
              category:
                selectedCat.id === "all" ? undefined : String(selectedCat.id),
              keyword: String(keyword.trim()),
              lat: Number(targetLat.toFixed(6)),
              lng: Number(targetLng.toFixed(6)),
              radius: Math.floor(2000),
              roomId: String(currentRoomId),
            });

            if (!res.data || res.data.length === 0) {
              alert("주변에 검색 결과가 없습니다.");
              return;
            }
            setSearchResults(res.data);
            displayMarkersSearch(res.data);
            setIsCatOpen(false);
            mapInstance.current.panTo(
              new kakao.maps.LatLng(targetLat, targetLng),
            );
          } catch (error) {
            console.error("검색 실패:", error);
          }
        } else {
          alert("카카오 지도에서 해당 키워드를 찾을 수 없습니다.");
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
        radius: Math.floor(2000),
        categories: cat,
        roomId: String(currentRoomId),
      } as any);

      setSearchResults(res.data);
      displayMarkersSearch(res.data);
    } catch (error) {
      console.error("주변 검색 실패:", error);
      alert("주변 장소를 불러오지 못했습니다.");
    }
  };

  const planActions: SidebarAction[] = [
    {
      label: showSearchUI ? "검색창 닫기" : "장소 추가",
      icon: ADD_PLACE_ICON,
      onClick: () => setShowSearchUI((prev) => !prev),
    },
    { label: "나가기", icon: exitIcon, onClick: () => navigate("/") },
  ];

  return (
    <div className="flex w-full h-screen bg-white font-pretendard overflow-hidden relative">
      {toastMsg && (
        <div className="absolute top-[40px] left-[55%] -translate-x-1/2 z-[9999] bg-gray-800/90 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-fadeIn">
          {toastMsg}
        </div>
      )}

      <Sidebar
        mode="plan"
        planData={planData}
        selectedDay={selectedDay}
        bottomActions={planActions}
        onDaySelect={(day) =>
          setSelectedDay((prev) => (prev === day ? null : day))
        }
        listTitle="AI 추천 일정"
      />

      <div className="flex-1 relative bg-gray-50">
        {/* 상단 참가자 리스트 */}
        <div className="absolute top-[80px] right-[40px] z-[100] flex gap-4">
          {participants.map((p) => {
            const isMe = String(p.id) === String(myLoginId);
            return (
              <div
                key={p.id}
                className="relative group flex flex-col items-center gap-2"
              >
                <div
                  className={`w-16 h-16 rounded-full border-2 shadow-lg bg-gray-300 flex items-center justify-center overflow-hidden relative transition-all ${isMe ? "border-primary-600 ring-4 ring-primary-100" : "border-white"}`}
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
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm ${isMe ? "bg-primary-600 text-white" : "bg-white/80 text-gray-600"}`}
                >
                  {p.name} {isMe && " (나)"}
                </div>
              </div>
            );
          })}
        </div>

        {!isLoading && !showSearchUI && (
          <div
            onClick={() => setSelectedDay(null)}
            className="absolute bottom-[140px] left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur px-8 py-3 rounded-full shadow-lg border border-primary-200 cursor-pointer animate-fadeIn hover:scale-105 transition-transform"
          >
            <span className="text-primary-600 font-extrabold text-h4 mr-2">
              {selectedDay === null ? "전체 일정" : `${selectedDay}일차`}
            </span>
            <span className="text-gray-700 font-medium">경로 보기 중</span>
          </div>
        )}

        {showSearchUI && (
          <div className="animate-fadeIn">
            {/* 🌟 3. 카테고리 전체를 예쁜 검색 버튼으로 쫙 깔아줍니다! */}
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
                    className="mr-2 bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center"
                  >
                    🔍
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 채팅창 렌더링 영역 */}
        {isChatActive && (
          <div className="absolute bottom-[140px] right-[40px] w-[360px] h-[480px] bg-white/95 backdrop-blur shadow-2xl rounded-[24px] z-[300] flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-5 bg-primary-600 text-white font-bold flex justify-between items-center shadow-md">
              <span>실시간 채팅 & STT</span>
              {isMicActive && (
                <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" />
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {messages.map((msg, i) => {
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
              AI가 여행 코스를 짜고 있습니다...
            </h2>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />
      </div>

      <div className="absolute bottom-[40px] right-[40px] z-[200] flex items-center gap-4">
        {/* 🌟 다시 조율 버튼 */}
        <button
          onClick={handleUpdatePlan}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all bg-primary-500 hover:bg-primary-600 group relative"
        >
          <img
            src={REFRESH_PLAN_ICON}
            alt="refresh"
            className="w-10 h-10 group-hover:rotate-180 transition-transform duration-500"
          />
          {addedPlaces.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce">
              {addedPlaces.length}
            </span>
          )}
        </button>
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
