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

export default function Home() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | number>("");
  const userLoginId = localStorage.getItem("loginId") || "글미";

  /**
   * 1. 방 목록 조회 및 데이터 매핑
   * 백엔드 명세(roomId, members, isFavorite 등)를 프론트 UI 규격으로 변환합니다.
   */
  const fetchMyRooms = () => {
    roomApi
      .getMyRooms()
      .then((res: any) => {
        console.log("📦 서버 원본 데이터:", res.data.rooms);

        const mapped = res.data.rooms.map((r: any) => {
          // 서버 응답이 isFavorite 또는 favorite인지 체크
          const isFav = r.isFavorite === true || r.favorite === true;

          // 날짜 가공 (ISO -> YYYY.MM.DD)
          const formattedDate = r.lastActiveAt
            ? new Date(r.lastActiveAt)
                .toLocaleDateString("ko-KR")
                .replace(/\./g, "")
                .trim()
                .replace(/\s/g, ".")
            : "최근";

          return {
            id: r.roomId,
            // 💡 만약 서버에 별도의 title 필드가 없다면
            // roomId에서 'room-아이디-시간' 뒤의 한글을 추출하거나 roomId 자체를 보여줍니다.
            title: r.roomId.split("-")[0] || r.roomId,
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
   * 2. 방 생성 로직 (정석)
   * - uniqueRoomId: 아고라 접속을 위해 영문/숫자/대시(-)로만 구성
   */
  const handleAddPlan = async () => {
    try {
      const timestamp = Date.now();
      // 🌟 아고라 에러 방지를 위한 영문 기반 ID (room-유저ID-타임스탬프)
      const uniqueRoomId = `room-${userLoginId}-${timestamp}`;
      // 화면에 임시로 보여줄 한글 이름
      const displayTitle = `새 여행 ${plans.length + 1}`;

      console.log("🚀 방 생성 요청:", uniqueRoomId);

      const res = await roomApi.createRoom({
        roomId: uniqueRoomId, // 서버 DB의 PK이자 아고라 채널명으로 사용됨
      });

      const { roomId } = res.data;

      // 새 카드 객체 생성
      const newPlan: PlanData = {
        id: roomId,
        image:
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        title: displayTitle,
        lastModified: new Date()
          .toLocaleDateString("ko-KR")
          .replace(/\./g, "")
          .trim()
          .replace(/\s/g, "."),
        isFavorite: false,
        participants: [
          `https://ui-avatars.com/api/?name=${userLoginId}&background=random&color=fff`,
        ],
      };

      setPlans((prev) => [newPlan, ...prev]);
      alert("여행 계획이 생성되었습니다!");
    } catch (err: any) {
      console.error("방 생성 실패:", err);
      const status = err.response?.status;
      if (status === 409) {
        alert("이미 존재하는 방 ID입니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert(`방 생성 실패 (${status || "네트워크 오류"})`);
      }
    }
  };

  /**
   * 3. 방 삭제 로직
   */
  const handleDeleteRoom = async (id?: number | string) => {
    const targetId = id || currentRoomId;
    if (!targetId) return alert("삭제할 대상을 선택해주세요.");

    try {
      await roomApi.deleteRoom(targetId);
      setPlans((prev) => prev.filter((p) => String(p.id) !== String(targetId)));
      if (String(currentRoomId) === String(targetId)) setCurrentRoomId("");
      alert("삭제되었습니다.");
    } catch (err: any) {
      alert(
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
    // UI 먼저 변경
    setPlans((prev) =>
      prev.map((p) =>
        String(p.id) === String(id) ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );

    try {
      await roomApi.toggleFavorite(id);
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
      alert("즐겨찾기 변경에 실패했습니다.");
      fetchMyRooms(); // 실패 시 원복을 위해 서버 데이터 다시 호출
    }
  };

  /**
   * 5. 방 이름 변경
   */
  const handleRenamePlan = async (id: number | string, newTitle: string) => {
    try {
      // roomApi.renameRoom이 구현되어 있다면 호출
      // await roomApi.renameRoom(id, newTitle);

      setPlans((prev) =>
        prev.map((p) =>
          String(p.id) === String(id) ? { ...p, title: newTitle } : p,
        ),
      );
    } catch (err) {
      console.error("이름 변경 실패:", err);
      alert("이름 변경에 실패했습니다.");
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
            alert("초대 링크가 복사되었습니다!");
          }}
        />
      </main>
    </div>
  );
}
