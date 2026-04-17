import React, { useState, useEffect, useMemo } from "react";
import profileImg from "../assets/icons/profile.svg";
import Modal from "../components/common/Modal";
import { type SearchPlace } from "../types/api";

// 🌟 지도와 동일한 테마 색상 배열 추가!
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

  const LocationPinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <mask
        id="mask_pin"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask_pin)">
        <path
          d="M12.0031 11.7308C12.4482 11.7308 12.8282 11.5723 13.1428 11.2552C13.4577 10.9383 13.6151 10.5572 13.6151 10.112C13.6151 9.66683 13.4565 9.28683 13.1393 8.972C12.8223 8.65733 12.4412 8.5 11.9961 8.5C11.5509 8.5 11.171 8.6585 10.8563 8.9755C10.5415 9.2925 10.3841 9.67358 10.3841 10.1188C10.3841 10.5639 10.5427 10.9439 10.8598 11.2587C11.1768 11.5734 11.5579 11.7308 12.0031 11.7308ZM11.9996 21.0193C9.64957 18.9411 7.8794 17.0029 6.68907 15.2048C5.49857 13.4067 4.90332 11.7706 4.90332 10.2962C4.90332 8.18075 5.59215 6.43583 6.96982 5.0615C8.34732 3.68717 10.0239 3 11.9996 3C13.9752 3 15.6518 3.68717 17.0293 5.0615C18.407 6.43583 19.0958 8.18075 19.0958 10.2962C19.0958 11.7706 18.5006 13.4067 17.3101 15.2048C16.1197 17.0029 14.3496 18.9411 11.9996 21.0193Z"
          fill="#1A40FF"
        />
      </g>
    </svg>
  );

  const StarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <mask
        id="mask_star"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask_star)">
        <path
          d="M8.125 7.09225L10.7328 3.62125C10.8918 3.40742 11.0805 3.25042 11.299 3.15025C11.5177 3.05008 11.7513 3 12 3C12.2487 3 12.4823 3.05008 12.701 3.15025C12.9195 3.25042 13.1083 3.40742 13.2673 3.62125L15.875 7.09225L19.8943 8.4595C20.2506 8.58017 20.5249 8.78217 20.7173 9.0655C20.9096 9.349 21.0058 9.66217 21.0058 10.005C21.0058 10.1632 20.9826 10.3202 20.9363 10.4762C20.8899 10.6324 20.8138 10.782 20.7078 10.925L18.073 14.498L18.173 18.3288C18.1897 18.7986 18.0343 19.1946 17.7068 19.5168C17.3793 19.8389 16.9982 20 16.5635 20C16.5687 20 16.4173 19.9814 16.1095 19.9443L12 18.7327L7.8905 19.9443C7.80717 19.9776 7.72675 19.9952 7.64925 19.997C7.57192 19.999 7.501 20 7.4365 20C6.993 20 6.60967 19.8389 6.2865 19.5168C5.9635 19.1946 5.81033 18.7986 5.827 18.3288L5.927 14.473L3.298 10.925C3.192 10.7807 3.11583 10.6298 3.0695 10.4723C3.02317 10.3149 3 10.1575 3 10C3 9.6625 3.09883 9.34858 3.2965 9.05825C3.49433 8.76792 3.7705 8.562 4.125 8.4405L8.125 7.09225Z"
          fill="#1A40FF"
        />
      </g>
    </svg>
  );

  const DayIcon = ({ color = "#7D7D8E" }: { color?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
    >
      <mask
        id="mask0_439_296"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="28"
        height="28"
      >
        <rect width="28" height="28" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_439_296)">
        <path
          d="M16.8268 24.297C16.4829 23.9521 16.3109 23.5333 16.3109 23.0405C16.3109 22.5478 16.4833 22.1295 16.8283 21.7855C17.173 21.4415 17.5918 21.2695 18.0845 21.2695C18.5772 21.2695 18.9957 21.442 19.3398 21.7869C19.6838 22.1319 19.8558 22.5506 19.8558 23.0432C19.8558 23.5359 19.6833 23.9543 19.3384 24.2985C18.9934 24.6425 18.5746 24.8145 18.0819 24.8145C17.5892 24.8145 17.1708 24.642 16.8268 24.297ZM9.69238 23.917C9.11235 23.917 8.61584 23.7105 8.20284 23.2975C7.78984 22.8845 7.58334 22.388 7.58334 21.808V10.8594C7.58334 10.2793 7.78984 9.78282 8.20284 9.36982C8.61584 8.95682 9.11235 8.75033 9.69238 8.75033H10.7917V23.917H9.69238ZM12.1826 23.917V8.75033H16.3333V4.66699H15.9743C15.4971 4.66699 15.0862 4.49462 14.7414 4.14987C14.3967 3.80512 14.2243 3.39416 14.2243 2.91699H18.0833V19.8786C17.2008 19.8786 16.4529 20.1861 15.8398 20.8011C15.2266 21.4163 14.9199 22.1633 14.9199 23.042C14.9199 23.201 14.9289 23.3492 14.9468 23.4865C14.9646 23.624 15.0013 23.7675 15.0567 23.917H12.1826Z"
          fill={color}
        />
      </g>
    </svg>
  );

  return (
    <nav
      className={`flex flex-col items-center py-[60px] bg-primary-100 border-r border-gray-200 transition-all duration-300 h-screen overflow-hidden shrink-0 ${isExpanded ? "w-[320px]" : "w-[180px]"}`}
    >
      <div className="w-full flex justify-center px-4 shrink-0">
        <div
          className={`flex items-start transition-all duration-300 justify-center ${isExpanded ? "gap-[25px]" : "gap-[5px]"}`}
        >
          <div className="flex flex-col items-start gap-5">
            <img
              src={profileImg}
              className="w-20 h-20 rounded-full object-cover shadow-sm"
              alt="profile"
            />
            {isExpanded && (
              <div className="animate-fadeIn flex flex-col gap-[5px]">
                <span className="text-h3 text-gray-800">환영합니다!</span>
                <div className="flex items-center gap-2">
                  <span className="text-title2 text-primary-600 font-bold">
                    {displayUserName}
                  </span>
                  <span className="text-h2 text-gray-800">님</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-7 text-gray-800 hover:text-primary-600 transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 60 60"
              fill="none"
              className={`transition-transform duration-300 ${!isExpanded && "rotate-180"}`}
            >
              <mask
                id="m1"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="60"
                height="60"
              >
                <rect width="60" height="60" fill="#D9D9D9" />
              </mask>
              <g mask="url(#m1)">
                <path
                  d="M34.861 30.0001L46.3223 18.5001L43.6879 15.8657L29.5535 30.0001L43.6879 44.1345L46.3223 41.5001L34.861 30.0001ZM18.986 30.0001L30.4473 18.5001L27.8129 15.8657L13.6785 30.0001L27.8129 44.1345L30.4473 41.5001L18.986 30.0001Z"
                  fill="currentColor"
                />
              </g>
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="w-[200px] my-[30px] h-px bg-primary-200" />
      )}

      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col items-center pt-5">
        {isExpanded && (
          <div className="flex flex-col items-start gap-4 w-[240px] mb-5 animate-fadeIn">
            <span className="text-body3 text-gray-500 font-medium px-2">
              {mode === "plan" ? "AI 추천 일정" : listTitle}
            </span>

            {mode === "list" && (
              <div className="flex flex-col gap-3 w-full pb-10">
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
                      className={`flex items-center justify-between group cursor-pointer w-full p-2 rounded-lg transition-all ${isSelected ? "bg-primary-200 font-bold" : "hover:bg-primary-50"}`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {iconType === "pin" && (
                          <div className="shrink-0">
                            <LocationPinIcon />
                          </div>
                        )}
                        {iconType === "star" && (
                          <div className="shrink-0">
                            <StarIcon />
                          </div>
                        )}
                        <span className="text-h6 leading-[30px] truncate group-hover:text-primary-600">
                          {room.title || room.roomId}
                        </span>
                      </div>
                      {onRemovePlace && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemovePlace(roomId);
                          }}
                          className="text-gray-400 hover:text-red-500 shrink-0 px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {mode === "plan" && (
              <div className="flex flex-col gap-8 w-full pb-10">
                {groupedPlans.map((group) => {
                  const isSelected = selectedDay === group.dayNum;
                  // 🌟 해당 일차에 맞는 테마 색상 추출!
                  const themeColor =
                    DAY_COLORS[(group.dayNum - 1) % DAY_COLORS.length];

                  return (
                    <div key={group.dayNum} className="flex flex-col gap-4">
                      {/* 🌟 N일차 헤더: 선택 시 동기화된 테마 색상으로 배경 변경 */}
                      <div
                        onClick={() => onDaySelect?.(group.dayNum)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all ${isSelected ? "text-white shadow-lg" : "hover:bg-white text-gray-800"}`}
                        style={{
                          backgroundColor: isSelected
                            ? themeColor
                            : "transparent",
                        }}
                      >
                        {/* 🌟 캐리어 아이콘: 선택 시 흰색, 비선택 시 테마 색상 */}
                        <DayIcon color={isSelected ? "white" : themeColor} />
                        <span className="text-h5 font-bold">
                          {group.dayNum}일차
                        </span>
                      </div>

                      {/* 🌟 왼쪽 타임라인 선: 테마 색상 적용 */}
                      <div
                        className="flex flex-col gap-3 pl-6 border-l-2 ml-6"
                        style={{ borderColor: themeColor }}
                      >
                        {group.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="relative flex flex-col gap-1 pb-4"
                          >
                            {/* 🌟 아이템 왼쪽의 동그란 점(마커): 테마 색상 적용 */}
                            <div
                              className="absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-white"
                              style={{ backgroundColor: themeColor }}
                            />
                            <span className="text-body3 font-bold text-gray-800">
                              {item.place}
                            </span>
                            <span className="text-caption text-gray-500 leading-tight">
                              {item.memo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 w-full pb-10 shrink-0">
        {bottomActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className="flex items-center justify-center gap-5 w-full group"
          >
            <img
              src={action.icon}
              className="w-10 h-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
              alt={action.label}
            />
            {isExpanded && (
              <span
                className={`text-h2 text-gray-800 animate-fadeIn ${action.hoverColorClass || "group-hover:text-primary-600"}`}
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
