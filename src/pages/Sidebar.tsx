import React, { useState } from "react";
import profileImg from "../assets/icons/profile.svg";
import TrashImg from "../assets/Design_img/source/trash.png";
import OutImg from "../assets/Design_img/source/out.png";
import Modal from "../components/common/Modal";
import deleteIcon from "../assets/icons/delete.svg";
import exitIcon from "../assets/icons/exit_to_app.svg";
import { type Room, type SearchPlace } from "../types/api";

interface SidebarProps {
  rooms: any[];
  currentRoomId?: string;
  onRoomSelect?: (id: string) => void;
  selectedPlaces?: SearchPlace[];
  onRemovePlace?: (contentid: string) => void;
  userName?: string;
  onCreatePlan: () => void;
  onExit: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  currentRoomId = "",
  onRoomSelect = () => {},
  selectedPlaces = [],
  onRemovePlace = () => {},
  userName = "글미",
  onCreatePlan,
  onExit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isExitOpen, setExitOpen] = useState(false);

  return (
    <nav
      className={`flex flex-col items-center py-[60px] bg-primary-100 border-r border-gray-200 transition-all duration-300 h-screen overflow-hidden shrink-0 ${isExpanded ? "w-[320px]" : "w-[180px]"}`}
    >
      {/* 상단 프로필 & 토글 버튼 (Y좌표 mt-7 고정) */}
      <div className="w-full flex justify-center px-4 shrink-0">
        <div
          className={`flex items-start transition-all duration-300 justify-center ${isExpanded ? "gap-[25px]" : "gap-[5px]"}`}
        >
          <div className="flex flex-col items-start gap-5">
            <img
              src={profileImg}
              className="w-20 h-20 rounded-full object-cover shadow-sm"
            />
            {isExpanded && (
              <div className="animate-fadeIn flex flex-col gap-[5px]">
                <span className="text-h3 text-gray-800">환영합니다!</span>
                <div className="flex items-center gap-2">
                  <span className="text-title2 text-primary-600 font-bold">
                    {userName}
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

      {/* 중단: 선택된 장소 & 내 여행 목록 (스크롤 가능) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col items-center pt-5">
        {isExpanded && (
          <div className="flex flex-col items-start gap-4 w-[200px] mb-5 animate-fadeIn">
            <span className="text-body3 text-gray-500 font-medium">
              내 여행 목록
            </span>
            <div className="flex flex-col gap-3 w-full pb-10">
              {rooms.map((room) => (
                <div
                  key={room.roomId || room.id}
                  onClick={() => onRoomSelect(room.roomId || room.id)}
                  className={`flex items-center gap-2 group cursor-pointer w-full p-1 rounded-lg transition-all ${currentRoomId === (room.roomId || room.id) ? "bg-primary-200 font-bold" : ""}`}
                >
                  <span className="text-h6 leading-[30px] truncate w-full group-hover:text-primary-600">
                    {room.roomId || room.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단 메뉴: Y좌표 고정 + X좌표 중앙 정렬 */}
      <div className="flex flex-col gap-6 w-full pb-10 shrink-0">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-5 w-full group"
        >
          <img
            src={deleteIcon}
            className="w-10 h-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
            alt="create"
          />
          {isExpanded && (
            <span className="text-h2 text-gray-800 group-hover:text-primary-600 animate-fadeIn">
              일정 생성
            </span>
          )}
        </button>

        <button
          onClick={() => setExitOpen(true)}
          className="flex items-center justify-center gap-5 w-full group"
        >
          <img
            src={exitIcon}
            className="w-10 h-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all"
            alt="exit"
          />
          {isExpanded && (
            <span className="text-h2 text-gray-800 group-hover:text-error-default animate-fadeIn">
              나가기
            </span>
          )}
        </button>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={() => {
          setCreateOpen(false);
          onCreatePlan();
        }}
        title="새로운 일정을 생성할까요?"
        imageSrc={TrashImg}
      />
      <Modal
        isOpen={isExitOpen}
        onClose={() => setExitOpen(false)}
        onConfirm={() => {
          setExitOpen(false);
          onExit();
        }}
        title="목록으로 돌아가시겠어요?"
        imageSrc={OutImg}
      />
    </nav>
  );
};

export default Sidebar;
