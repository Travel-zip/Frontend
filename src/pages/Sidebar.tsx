import React, { useState, useEffect, useMemo } from "react";
import Modal from "../components/common/Modal";
import { type SearchPlace } from "../types/api";

// 🌟 지도와 동일한 테마 색상 배열
const DAY_COLORS = [
  "#1A40FF",
  "#FF4081",
  "#00C853",
  "#FFAB00",
  "#9C27B0",
  "#FF5722",
];

// 하단 액션 버튼을 위한 타입 정의
export interface SidebarAction {
  label: string;
  icon: string;
  onClick: () => void;
  hoverColorClass?: string;
  modalTitle?: string;
  modalImage?: string;
  listTitle?: string;
}

// AI 일정 데이터 타입
export interface PlanItem {
  month: number;
  day: number;
  hour: number;
  minute: number;
  place: string;
  memo: string;
  lat: number;
  lng: number;
  imageUrl?: string;
}

export interface SidebarProps {
  rooms?: any[];
  planData?: PlanItem[];
  currentRoomId?: string;
  onRoomSelect?: (id: string) => void;
  selectedPlaces?: SearchPlace[];
  onRemovePlace?: (contentid: string) => void;
  userName?: string;
  bottomActions: SidebarAction[];
  listTitle?: string;
  iconType?: "pin" | "star" | "none";
  mode?: "list" | "plan";
  selectedDay?: number | null;
  onDaySelect?: (dayNum: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms = [],
  planData = [],
  currentRoomId = "",
  onRoomSelect = () => {},
  selectedPlaces = [],
  onRemovePlace = () => {},
  userName: propUserName,
  bottomActions,
  listTitle = "즐겨찾기",
  iconType = "pin",
  mode = "list",
  selectedDay = null,
  onDaySelect = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(mode === "plan" ? true : false);
  const [activeAction, setActiveAction] = useState<SidebarAction | null>(null);
  const [displayUserName, setDisplayUserName] = useState("글미");

  useEffect(() => {
    const storedName = localStorage.getItem("loginId");
    if (propUserName) {
      setDisplayUserName(propUserName);
    } else if (storedName) {
      setDisplayUserName(storedName);
    }
  }, [propUserName]);

  const groupedPlans = useMemo(() => {
    if (mode !== "plan" || !planData) return [];
    const groups: Record<string, PlanItem[]> = {};
    planData.forEach((item) => {
      const dateKey = `${item.month}/${item.day}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.keys(groups).map((key, idx) => ({
      dayNum: idx + 1,
      date: key,
      items: groups[key].sort(
        (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
      ),
    }));
  }, [planData, mode]);

  const handleActionClick = (action: SidebarAction) => {
    if (action.modalTitle) {
      setActiveAction(action);
    } else {
      action.onClick();
    }
  };

  // 🌟 토스 스타일을 위해 currentColor를 사용하여 색상 동기화
  const LocationPinIcon = ({ className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12.0031 11.7308C12.4482 11.7308 12.8282 11.5723 13.1428 11.2552C13.4577 10.9383 13.6151 10.5572 13.6151 10.112C13.6151 9.66683 13.4565 9.28683 13.1393 8.972C12.8223 8.65733 12.4412 8.5 11.9961 8.5C11.5509 8.5 11.171 8.6585 10.8563 8.9755C10.5415 9.2925 10.3841 9.67358 10.3841 10.1188C10.3841 10.5639 10.5427 10.9439 10.8598 11.2587C11.1768 11.5734 11.5579 11.7308 12.0031 11.7308ZM11.9996 21.0193C9.64957 18.9411 7.8794 17.0029 6.68907 15.2048C5.49857 13.4067 4.90332 11.7706 4.90332 10.2962C4.90332 8.18075 5.59215 6.43583 6.96982 5.0615C8.34732 3.68717 10.0239 3 11.9996 3C13.9752 3 15.6518 3.68717 17.0293 5.0615C18.407 6.43583 19.0958 8.18075 19.0958 10.2962C19.0958 11.7706 18.5006 13.4067 17.3101 15.2048C16.1197 17.0029 14.3496 18.9411 11.9996 21.0193Z"
        fill="currentColor"
      />
    </svg>
  );

  const StarIcon = ({ className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M8.125 7.09225L10.7328 3.62125C10.8918 3.40742 11.0805 3.25042 11.299 3.15025C11.5177 3.05008 11.7513 3 12 3C12.2487 3 12.4823 3.05008 12.701 3.15025C12.9195 3.25042 13.1083 3.40742 13.2673 3.62125L15.875 7.09225L19.8943 8.4595C20.2506 8.58017 20.5249 8.78217 20.7173 9.0655C20.9096 9.349 21.0058 9.66217 21.0058 10.005C21.0058 10.1632 20.9826 10.3202 20.9363 10.4762C20.8899 10.6324 20.8138 10.782 20.7078 10.925L18.073 14.498L18.173 18.3288C18.1897 18.7986 18.0343 19.1946 17.7068 19.5168C17.3793 19.8389 16.9982 20 16.5635 20C16.5687 20 16.4173 19.9814 16.1095 19.9443L12 18.7327L7.8905 19.9443C7.80717 19.9776 7.72675 19.9952 7.64925 19.997C7.57192 19.999 7.501 20 7.4365 20C6.993 20 6.60967 19.8389 6.2865 19.5168C5.9635 19.1946 5.81033 18.7986 5.827 18.3288L5.927 14.473L3.298 10.925C3.192 10.7807 3.11583 10.6298 3.0695 10.4723C3.02317 10.3149 3 10.1575 3 10C3 9.6625 3.09883 9.34858 3.2965 9.05825C3.49433 8.76792 3.7705 8.562 4.125 8.4405L8.125 7.09225Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <nav
      className={`flex flex-col border-r border-[#8CA2FF]/30 shadow-[4px_0_24px_rgba(26,64,255,0.05)] transition-all duration-300 ease-in-out h-screen overflow-hidden shrink-0 ${
        isExpanded ? "w-[320px]" : "w-[88px]"
      }`}
      // 🌟 바로 여기에 상준님의 시그니처 색상을 인라인으로 꽂아 넣었습니다!
      style={{ backgroundColor: "var(--Primary-100, #E5EAFF)" }}
    >
      {/* 🌟 헤더 영역 (프로필 제거, 토스 스타일 인사말) */}
      <div
        className={`w-full flex ${
          isExpanded
            ? "justify-between px-7 pt-12 pb-8"
            : "justify-center pt-12 pb-8"
        } items-start shrink-0 transition-all`}
      >
        {isExpanded && (
          <div className="flex flex-col gap-1.5 animate-fadeIn">
            {/* 배경이 연파랑이라서 텍스트 색을 살짝 더 진하게 맞췄습니다 */}
            <span className="text-[14px] text-primary-600 font-bold tracking-tight">
              안녕하세요,
            </span>
            <div className="flex items-center gap-1 text-gray-900 tracking-tight">
              <span className="text-h3 font-extrabold">{displayUserName}</span>
              <span className="text-h4 font-bold">님</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          // 닫기 버튼 호버 색상도 배경색에 맞게 푸른빛으로 변경
          className={`text-primary-500 hover:text-primary-800 transition-colors p-2 rounded-full hover:bg-primary-200/50 ${
            !isExpanded && "mt-1"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${
              !isExpanded && "rotate-180"
            }`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* 🌟 메인 컨텐츠 영역 */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col pt-2">
        {/* 리스트 제목 */}
        {isExpanded && (
          <div className="px-7 mb-3 animate-fadeIn">
            <span className="text-[13px] text-gray-400 font-bold tracking-tight">
              {mode === "plan" ? "AI 추천 일정" : listTitle}
            </span>
          </div>
        )}

        {/* 🌟 모드 1: 방 목록 (List) */}
        {mode === "list" && (
          <div className="flex flex-col gap-1 w-full px-3 pb-6">
            {rooms.map((room) => {
              const roomId = String(
                room.roomId ||
                  room.id ||
                  room.contentid ||
                  room.contentId ||
                  "",
              );
              const isSelected = String(currentRoomId) === roomId;
              return (
                <div
                  key={roomId}
                  onClick={() => onRoomSelect(roomId)}
                  className={`flex items-center justify-between group cursor-pointer w-full transition-all duration-200 ${
                    isExpanded
                      ? "px-4 py-3.5 rounded-[16px]"
                      : "justify-center w-12 h-12 mx-auto rounded-[14px]"
                  } ${
                    isSelected
                      ? "bg-blue-50 text-primary-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div
                      className={`shrink-0 transition-colors ${
                        isSelected
                          ? "text-primary-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    >
                      {iconType === "pin" && <LocationPinIcon />}
                      {iconType === "star" && <StarIcon />}
                    </div>
                    {isExpanded && (
                      <span
                        className={`text-[15px] tracking-tight truncate ${
                          isSelected ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {room.title || room.roomId}
                      </span>
                    )}
                  </div>
                  {isExpanded && onRemovePlace && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePlace(roomId);
                      }}
                      className="text-gray-300 hover:text-red-500 shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 🌟 모드 2: 일정 타임라인 (Plan) */}
        {mode === "plan" && isExpanded && (
          <div className="flex flex-col gap-8 w-full px-7 pb-10 animate-fadeIn">
            {groupedPlans.map((group) => {
              const isSelected = selectedDay === group.dayNum;
              const themeColor =
                DAY_COLORS[(group.dayNum - 1) % DAY_COLORS.length];

              return (
                <div key={group.dayNum} className="flex flex-col">
                  {/* 🌟 토스 스타일 '알약' 배지 헤더 */}
                  <div
                    onClick={() => onDaySelect?.(group.dayNum)}
                    className={`inline-flex items-center justify-center self-start px-4 py-2 rounded-full cursor-pointer transition-all duration-200 mb-5 ${
                      isSelected
                        ? "text-white shadow-md shadow-[themeColor]/30 scale-105"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    style={{ backgroundColor: isSelected ? themeColor : "" }}
                  >
                    <span className="text-[14px] font-bold tracking-tight">
                      {group.dayNum}일차
                    </span>
                  </div>

                  {/* 🌟 매우 깔끔해진 세로 타임라인 선 */}
                  <div className="flex flex-col gap-6 pl-4 ml-2 border-l-2 border-gray-100 relative">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="relative flex flex-col gap-1">
                        {/* 타임라인 원형 포인트 */}
                        <div
                          className="absolute -left-[22px] top-1.5 w-[11px] h-[11px] rounded-full border-[2.5px] border-white shadow-sm"
                          style={{
                            backgroundColor: isSelected
                              ? themeColor
                              : "#D1D5DB",
                          }}
                        />
                        <span
                          className={`text-[15px] font-bold tracking-tight ${isSelected ? "text-gray-900" : "text-gray-600"}`}
                        >
                          {item.place}
                        </span>
                        {item.memo && (
                          <span className="text-[13px] text-gray-400 font-medium leading-snug">
                            {item.memo}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🌟 하단 메뉴 영역 (그레이스케일 호버 효과) */}

      <div className="flex flex-col w-full px-4 pb-8 pt-4 border-t border-primary-200/50 shrink-0 bg-transparent">
        {bottomActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={`flex items-center group transition-colors duration-200 ${
              isExpanded
                ? "px-4 py-3.5 rounded-[14px] hover:bg-gray-50 gap-4 w-full"
                : "justify-center w-12 h-12 mx-auto rounded-full hover:bg-gray-50 mb-1"
            }`}
          >
            {/* SVG 이미지들에 그레이스케일 적용하여 톤앤매너 맞춤 */}
            <img
              src={action.icon}
              className={`w-[22px] h-[22px] transition-all duration-200 ${
                action.hoverColorClass?.includes("error")
                  ? "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                  : "opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
              }`}
              alt={action.label}
            />
            {isExpanded && (
              <span
                className={`text-[15px] font-bold tracking-tight transition-colors duration-200 ${
                  action.hoverColorClass?.includes("error")
                    ? "text-gray-500 group-hover:text-red-500"
                    : "text-gray-500 group-hover:text-gray-900"
                }`}
              >
                {action.label}
              </span>
            )}
          </button>
        ))}
      </div>

      <Modal
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        onConfirm={() => {
          activeAction?.onClick();
          setActiveAction(null);
        }}
        title={activeAction?.modalTitle || ""}
        imageSrc={activeAction?.modalImage}
      />
    </nav>
  );
};

export default Sidebar;
