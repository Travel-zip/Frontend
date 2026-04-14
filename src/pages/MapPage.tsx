import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgoraRTC, {
  type IAgoraRTCClient,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import Sidebar, { type SidebarAction } from "../pages/Sidebar";
import { searchApi } from "../api/searchApi";
import Button from "../components/common/Button";

// 기존 이미지 임포트
import exitIcon from "../assets/icons/exit_to_app.svg";

/** =========================================================================
 * [설정 및 컴포넌트 정의]
 * ========================================================================= */
const AGORA_APP_ID = "882e4424401f46b1af80749bc88d5edb";
const AGORA_TOKEN =
  "007eJxTYMj0OX7heNzRtM1WEqGcWZPDl6/c4bhwti5fBYNg5YI1dh8VGCwsjFJNTIxMTAwM00zMkgwT0ywMzE0sk5ItLFJMU1OSzGLuZTYEMjK8OredmZEBAkF8CYai/Pxc3crSrMw8XUNzc1NLIDA2MLI0YWAAALinJHU=";
const ROOM_ID = "jeju-trip-2025";

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

const rawAiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_435" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_435)"><path d="M28.7497 36.25V31.25H23.7497V28.75H28.7497V23.75H31.2497V28.75H36.2497V31.25H31.2497V36.25H28.7497ZM8.84592 32.5C8.00398 32.5 7.29134 32.2084 6.70801 31.625C6.12467 31.0417 5.83301 30.3291 5.83301 29.4871V10.5129C5.83301 9.671 6.12467 8.95836 6.70801 8.37503C7.29134 7.79169 8.00398 7.50003 8.84592 7.50003H11.1534V3.97461H13.7176V7.50003H23.0126V3.97461H25.5126V7.50003H27.8201C28.662 7.50003 29.3747 7.79169 29.958 8.37503C30.5413 8.95836 30.833 9.671 30.833 10.5129V20.3592C30.4163 20.3078 29.9997 20.2821 29.583 20.2821C29.1663 20.2821 28.7497 20.3078 28.333 20.3592V17.1796H8.33301V29.4871C8.33301 29.6154 8.38648 29.7329 8.49342 29.8396C8.60009 29.9466 8.71759 30 8.84592 30H20.2401C20.2401 30.4167 20.2658 30.8334 20.3172 31.25C20.3683 31.6667 20.4622 32.0834 20.5988 32.5H8.84592ZM8.33301 14.6796H28.333V10.5129C28.333 10.3846 28.2795 10.2671 28.1726 10.1604C28.0659 10.0535 27.9484 10 27.8201 10H8.84592C8.71759 10 8.60009 10.0535 8.49342 10.1604C8.38648 10.2671 8.33301 10.3846 8.33301 10.5129V14.6796Z" fill="#1C1B1F"/></g></svg>`;
const AI_PLAN_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawAiSvg)}`;
const rawChatSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><mask id="mask0_439_412" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40"><rect width="40" height="40" fill="#D9D9D9"/></mask><g mask="url(#mask0_439_412)"><path d="M10.417 22.9165H29.5837V20.4165H10.417V22.9165ZM10.417 17.9165H29.5837V15.4165H10.417V17.9165ZM10.417 12.9165H29.5837V10.4165H10.417V12.9165ZM35.8337 35.064L29.9362 29.1665H7.17991C6.33796 29.1665 5.62533 28.8748 5.04199 28.2915C4.45866 27.7082 4.16699 26.9955 4.16699 26.1536V7.17942C4.16699 6.33748 4.45866 5.62484 5.04199 5.0415C5.62533 4.45817 6.33796 4.1665 7.17991 4.1665H32.8207C33.6627 4.1665 34.3753 4.45817 34.9587 5.0415C35.542 5.62484 35.8337 6.33748 35.8337 7.17942V35.064ZM7.17991 26.6665H31.0003L33.3337 28.9744V7.17942C33.3337 7.05109 33.2802 6.93359 33.1732 6.82692C33.0666 6.71998 32.9491 6.6665 32.8207 6.6665H7.17991C7.05158 6.6665 6.93408 6.71998 6.82741 6.82692C6.72046 6.93359 6.66699 7.05109 6.66699 7.17942V26.1536C6.66699 26.2819 6.72046 26.3994 6.82741 26.5061C6.93408 26.613 7.05158 26.6665 7.17991 26.6665Z" fill="#FEFEFE"/></g></svg>`;
const CHAT_ICON = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawChatSvg)}`;

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

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentRoomId = searchParams.get("roomId") || ROOM_ID;

  // --- [Refs] ---
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const clustererInstance = useRef<any>(null);
  const infoWindowInstance = useRef<any>(null);
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
  const [selectedPlaces, setSelectedPlaces] = useState<any[]>([]); // 🌟 장소 보관함
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const myLoginId = localStorage.getItem("loginId") || "나";
  const [participants, setParticipants] = useState<any[]>([
    { id: myLoginId, name: myLoginId, isMuted: true },
  ]);
  const [isChatActive, setIsChatActive] = useState(true);
  const [isMicActive, setIsMicActive] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  /** 채팅 스크롤 하단 이동 */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatActive]);

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

          // 🌟 핵심 1: 마이크로 말한 장소를 selectedPlaces에 즉시 자동 추가!
          const aiPlaces = data.places.map(
            (placeName: string, index: number) => ({
              contentid: `ai-place-${Date.now()}-${index}`,
              contentId: `ai-place-${Date.now()}-${index}`,
              title: placeName,
              mapx: mapInstance.current?.getCenter().getLng() || 126.570667,
              mapy: mapInstance.current?.getCenter().getLat() || 33.450701,
            }),
          );

          setSelectedPlaces((prev) => {
            const existingTitles = prev.map((p) => p.title);
            const newPlaces = aiPlaces.filter(
              (np: any) => !existingTitles.includes(np.title),
            );
            return [...prev, ...newPlaces];
          });
        } else if (data.type === "NAVIGATE_PLAN") {
          showToast(
            "누군가 AI 일정을 생성했습니다! 결과 화면으로 이동합니다 🚀",
          );
          navigate(`/plan?roomId=${currentRoomId}`);
        }
      }
    };
    return () => socket.close();
  }, [currentRoomId]);

  /** 2. Web Speech API (내 말을 서버로 전송) */
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

        await agoraClient.current.join(
          AGORA_APP_ID,
          currentRoomId,
          AGORA_TOKEN,
          myLoginId,
        );

        // 🌟 응급처치: 기존에 방에 있던 사람 불러오기
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
  }, [currentRoomId, myLoginId]);

  /** 🌟 핵심 2: 장소 수동 추가 로직 (검색해서 클릭 시 리스트에 추가) */
  useEffect(() => {
    (window as any).addPlaceToTrip = (placeId: string) => {
      const place = allFoundPlacesRef.current.find(
        (p) => String(p.contentid || p.contentId) === String(placeId),
      );
      if (place) {
        setSelectedPlaces((prev) => {
          if (
            prev.some(
              (p) => String(p.contentid || p.contentId) === String(placeId),
            )
          ) {
            return prev;
          }
          return [...prev, place];
        });
        showToast(`✅ '${place.title}'이(가) 추가되었습니다!`);
      }
    };
  }, []);

  const handleMicToggle = async () => {
    if (!recognitionRef.current || !agoraClient.current) return;
    try {
      if (!isMicActive) {
        const track = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrack.current = track;
        await agoraClient.current.publish(track);
        recognitionRef.current.start();
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
        recognitionRef.current.stop();
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
    const { kakao } = window as any;
    if (!kakao) return;
    kakao.maps.load(() => {
      if (mapInstance.current) return;
      mapInstance.current = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(37.5563, 126.9707),
        level: 3,
      });
      clustererInstance.current = new kakao.maps.MarkerClusterer({
        map: mapInstance.current,
        averageCenter: true,
        minLevel: 6,
      });
      infoWindowInstance.current = new kakao.maps.InfoWindow({ zIndex: 1 });
    });
  }, []);

  const displayMarkers = (places: any[]) => {
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
              roomId: String(currentRoomId),
            });

            if (!res.data || res.data.length === 0) {
              alert(`'${keyword}'에 대한 여행지 데이터가 없습니다.`);
              return;
            }

            setSearchResults(res.data);
            displayMarkers(res.data);
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
        roomId: String(currentRoomId),
      } as any);

      if (!res.data || res.data.length === 0) {
        alert("주변에 해당 장소가 없습니다.");
        return;
      }
      setSearchResults(res.data);
      displayMarkers(res.data);
    } catch (error) {
      console.error("주변 검색 실패:", error);
      alert("주변 장소를 불러오지 못했습니다.");
    }
  };

  const handleGeneratePlan = () => {
    // 1. 서버(웹소켓)로 "다 같이 넘어가자!" 신호 전송
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          type: "NAVIGATE_PLAN",
          roomId: currentRoomId,
          sender: myLoginId,
          text: "system_navigate",
        }),
      );
    }
    // 2. 나 자신도 넘어감
    navigate(`/plan?roomId=${currentRoomId}`);
  };

  return (
    <div className="flex w-full h-screen bg-white font-pretendard overflow-hidden relative">
      {toastMsg && (
        <div className="absolute top-[40px] left-[55%] -translate-x-1/2 z-[9999] bg-gray-800/90 text-white px-6 py-3 rounded-full shadow-2xl font-medium flex items-center gap-2 animate-fadeIn transition-opacity">
          {toastMsg}
        </div>
      )}

      {/* 사이드바 */}
      <Sidebar
        rooms={selectedPlaces}
        listTitle="장소 리스트"
        bottomActions={[
          {
            label: "AI 일정 생성",
            icon: AI_PLAN_ICON,
            // 🌟 추가된 장소 데이터들을 localStorage를 통해 PlanPage로 넘겨줄 수도 있지만,
            // 백엔드가 이미 검색 기록(TourPlaceEntity)을 갖고 있으므로 그냥 넘어갑니다!
            onClick: handleGeneratePlan,
          },
          { label: "나가기", icon: exitIcon, onClick: () => navigate("/") },
        ]}
        onRemovePlace={(id) =>
          setSelectedPlaces((prev) =>
            prev.filter(
              (p) => String(p.contentid || p.contentId) !== String(id),
            ),
          )
        }
        iconType="pin"
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

        {/* 🌟 3. 핵심 3: 전체 카테고리 버튼 추가! */}
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

        {/* 검색창 */}
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
            <form onSubmit={handleSearch} className="flex flex-1 items-center">
              <input
                className="flex-1 p-4 outline-none text-body3 bg-transparent"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="장소 검색"
              />
              <button
                type="submit"
                className="mr-2 bg-primary-600 text-white w-12 h-12 rounded-full shadow-lg"
              >
                🔍
              </button>
            </form>
          </div>
        </div>

        {/* 채팅창 렌더링 영역 */}
        {isChatActive && (
          <div className="absolute bottom-[140px] right-[40px] w-[360px] h-[480px] bg-white/95 backdrop-blur shadow-2xl rounded-[24px] z-[300] flex flex-col overflow-hidden border border-primary-100 animate-fadeIn">
            <div className="p-5 bg-primary-600 text-white font-bold flex justify-between items-center">
              <span>실시간 채팅 & STT</span>
              {isMicActive && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
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
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all"
        >
          <MicIcon isActive={isMicActive} />
        </button>
      </div>
    </div>
  );
}
