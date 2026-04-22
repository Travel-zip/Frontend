import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar, { type SidebarAction } from "../pages/Sidebar";
import Plan from "./Plan";
import Career from "../assets/Design_img/source/career.png";
import { type PlanData } from "../components/common/PlanCard";
import { authApi } from "../api/authApi";
import { roomApi } from "../api/roomApi";

import deleteIcon from "../assets/icons/delete.svg";
import exitIcon from "../assets/icons/exit_to_app.svg";
import TrashImg from "../assets/Design_img/source/trash.png";
import OutImg from "../assets/Design_img/source/out.png";
import { toast } from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | number>("");
  const userLoginId = localStorage.getItem("loginId") || "글미";

  const fetchMyRooms = () => {
    roomApi
      .getMyRooms()
      .then((res: any) => {
        // 백엔드 데이터 안전하게 뽑기
        const roomList = Array.isArray(res.data?.rooms)
          ? res.data.rooms
          : Array.isArray(res.data)
            ? res.data
            : [];

        const mapped = roomList.map((r: any) => {
          const isFav = r.isFavorite === true || r.favorite === true;
          const formattedDate = r.lastActiveAt
            ? new Date(r.lastActiveAt)
                .toLocaleDateString("ko-KR")
                .replace(/\./g, "")
                .trim()
                .replace(/\s/g, ".")
            : "최근";

          // 🌟 진짜 방 이름(title) 살리기!
          let displayTitle = r.title;
          if (!displayTitle) {
            try {
              displayTitle = decodeURIComponent(r.roomId).split("-")[0];
            } catch (e) {
              displayTitle = r.roomId;
            }
          }

          return {
            id: r.roomId,
            title: displayTitle || "여행",
            lastModified: formattedDate,
            isFavorite: isFav,
            participants:
              r.members?.map(
                (m: any) =>
                  `https://ui-avatars.com/api/?name=${m.loginId}&background=random&color=fff`,
              ) || [],
            image:
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
            country: "한국",
            startDate: r.startDate,
            endDate: r.endDate,
          };
        });

        setPlans(mapped);
      })
      .catch((err) => {
        console.error("❌ 방 목록 불러오기 실패:", err);
      });
  };

  useEffect(() => {
    fetchMyRooms();
  }, []);

  /**
   * 🌟 2. 방 생성 로직 (진짜 완벽한 정공법)
   */
  const handleAddPlan = async (
    roomName: string,
    startDate: string,
    endDate: string,
  ) => {
    try {
      const timestamp = Date.now();

      // 🚨 1. 아고라와 백엔드 ID 에러를 막기 위한 완벽한 영어 변환기!
      // 한글 치면 튕기니까, 영어나 숫자만 남기고 다 지움.
      // 만약 "제주도" 쳐서 다 지워지면 기본값 "room"으로 세팅.
      let pureEnglish = roomName.replace(/[^a-zA-Z0-9]/g, "");
      if (!pureEnglish) pureEnglish = "room";
      const safeRoomId = `${pureEnglish}-${timestamp}`;

      // 🚨 2. 백엔드에 진짜 정직하게 보내기 (title 부활!!! 이게 없어서 저장이 안됐던 겁니다!!!)
      const res = await roomApi.createRoom({
        roomId: safeRoomId,
        title: roomName, // 👈 상준님 백엔드가 간절히 원하던 진짜 방 이름!
      });

      // 3. 카드 정상 생성!
      const newPlan: PlanData = {
        id: safeRoomId,
        image:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        title: roomName,
        lastModified: "방금 전",
        isFavorite: false,
        participants: [
          `https://ui-avatars.com/api/?name=${userLoginId}&background=random&color=fff`,
        ],
        startDate: startDate,
        endDate: endDate,
      };

      setPlans((prev) => [newPlan, ...prev]);
      toast.success("방이 생성되었습니다!");

      const destination = roomName.split(" ")[0];

      // 4. 에러 없이 무사히 통과했으니 당당하게 지도로 이동!
      navigate(
        `/map?roomId=${safeRoomId}&start=${startDate}&end=${endDate}&title=${encodeURIComponent(destination)}`,
      );
    } catch (err: any) {
      console.error("방 생성 실패 (백엔드 에러):", err);
      toast.error(err.response?.data?.message || "방 생성에 실패했습니다.");
    }
  };

  /**
   * 3. 방 삭제 로직
   */
  const handleDeleteRoom = async (id?: number | string) => {
    const targetId = id || currentRoomId;
    if (!targetId) return toast.error("삭제할 대상을 선택해주세요.");

    try {
      await roomApi.deleteRoom(targetId);
      setPlans((prev) => prev.filter((p) => String(p.id) !== String(targetId)));
      if (String(currentRoomId) === String(targetId)) setCurrentRoomId("");
      toast.success("삭제되었습니다.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.code === "FORBIDDEN"
          ? "방장만 삭제 가능합니다."
          : "삭제 실패",
      );
    }
  };

  /**
   * 4. 즐겨찾기 토글 (낙관적 업데이트)
   */
  const handleToggleFavorite = async (id: number | string) => {
    setPlans((prev) =>
      prev.map((p) =>
        String(p.id) === String(id) ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );

    try {
      await roomApi.toggleFavorite(id);
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
      toast.error("즐겨찾기 변경에 실패했습니다.");
      fetchMyRooms();
    }
  };

  /**
   * 5. 방 이름 변경
   */
  const handleRenamePlan = async (id: number | string, newTitle: string) => {
    try {
      setPlans((prev) =>
        prev.map((p) =>
          String(p.id) === String(id) ? { ...p, title: newTitle } : p,
        ),
      );
    } catch (err) {
      console.error("이름 변경 실패:", err);
      toast.error("이름 변경에 실패했습니다.");
    }
  };

  const homeActions: SidebarAction[] = [
    {
      label: "휴지통",
      icon: deleteIcon,
      onClick: () => handleDeleteRoom(),
      modalTitle: "일정을 삭제하시겠어요?",
      modalImage: TrashImg,
      hoverColorClass: "group-hover:text-error-default",
    },
    {
      label: "로그아웃",
      icon: exitIcon,
      onClick: () => {
        authApi.logout();
        navigate("/login");
      },
      modalTitle: "로그아웃 하시겠어요?",
      modalImage: OutImg,
      hoverColorClass: "group-hover:text-error-default",
    },
  ];

  return (
    <div className="flex w-screen h-screen bg-gray-50 overflow-hidden font-pretendard">
      <Sidebar
        rooms={plans.filter((p) => p.isFavorite)}
        currentRoomId={String(currentRoomId)}
        onRoomSelect={(id) => setCurrentRoomId(id)}
        userName={userLoginId}
        bottomActions={homeActions}
        listTitle="즐겨 찾기"
        iconType="star"
      />
      <main className="flex-1 h-full overflow-hidden">
        <Plan
          imageSrc={Career}
          plans={plans}
          onAddPlan={handleAddPlan}
          onToggleFavorite={handleToggleFavorite}
          onRename={handleRenamePlan}
          onDelete={handleDeleteRoom}
          onCopyLink={(id) => {
            const inviteLink = `${window.location.origin}/join/${id}`;
            navigator.clipboard.writeText(inviteLink);
            toast.success("초대 링크가 복사되었습니다!");
          }}
        />
      </main>
    </div>
  );
}
