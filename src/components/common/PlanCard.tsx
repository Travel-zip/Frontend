import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import Trash from "../../assets/Design_img/source/trash.png";

export interface PlanData {
  id: number | string;
  title: string;
  lastModified: string;
  isFavorite: boolean;
  participants: string[];
  image: string; // 🌟 기존 이미지 경로는 무시하고 랜덤 이미지를 쓸 겁니다.
  country?: string;
  startDate?: string;
  endDate?: string;
  // 🌟 지도를 띄우기 위한 좌표
  lat?: number;
  lng?: number;
}

interface PlanCardProps {
  data: PlanData;
  onToggleFavorite: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
  onRename?: (id: number | string, newTitle: string) => void;
  onCopyLink?: (id: number | string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  data,
  onToggleFavorite,
  onDelete,
  onRename,
  onCopyLink,
}) => {
  const navigate = useNavigate();
  const [isMoreActive, setIsMoreActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 🌟 지도를 담을 빈 박스(div)를 가리키는 변수
  const mapRef = useRef<HTMLDivElement>(null);

  const randomTravelImage = useMemo(() => {
    // Unsplash 대신 절대 안 터지는 Picsum 서버 사용!
    // seed 뒤에 data.id를 넣어서 방마다 고유한 예쁜 사진이 고정되게 만듭니다.
    return `https://picsum.photos/seed/${data.id}/400/300`;
  }, [data.id]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleUpdateTitle = () => {
    if (editValue.trim() !== "" && editValue !== data.title) {
      onRename?.(data.id, editValue);
    } else {
      setEditValue(data.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUpdateTitle();
    if (e.key === "Escape") {
      setEditValue(data.title);
      setIsEditing(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || isEditing) return;

    let targetUrl = `/map?roomId=${data.id}`;
    if (data.startDate && data.endDate) {
      targetUrl += `&start=${data.startDate}&end=${data.endDate}`;
    }
    navigate(targetUrl);
  };

  // 🌟 카카오 정적 지도(StaticMap) 생성 로직
  useEffect(() => {
    if (data.lat && data.lng) {
      const initStaticMap = () => {
        const { kakao } = window as any;
        if (!kakao || !kakao.maps) {
          setTimeout(initStaticMap, 100);
          return;
        }

        kakao.maps.load(() => {
          if (!mapRef.current) return;
          mapRef.current.innerHTML = "";

          const options = {
            center: new kakao.maps.LatLng(data.lat, data.lng),
            level: 5,
            marker: {
              position: new kakao.maps.LatLng(data.lat, data.lng),
            },
          };
          new kakao.maps.StaticMap(mapRef.current, options);
        });
      };
      initStaticMap();
    }
  }, [data.lat, data.lng]);

  return (
    <>
      <div
        onClick={handleCardClick}
        // 🌟 토스 스타일 핵심: 큰 라운드, 부드러운 그림자, 호버 시 살짝 위로 둥실!
        className="flex flex-col w-[360px] shrink-0 rounded-[28px] bg-white border border-gray-100/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 relative cursor-pointer group"
      >
        {/* 1. 상단 이미지/지도 영역 */}
        <div className="relative h-[200px] w-full bg-gray-100 overflow-hidden">
          {data.lat && data.lng ? (
            <>
              <div
                ref={mapRef}
                className="w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            </>
          ) : (
            <img
              src={randomTravelImage}
              alt={data.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              // 이미지 불러오기 전까지 보여줄 더미 색상
              style={{ backgroundColor: "#F3F4F6" }}
            />
          )}

          {/* 🌟 그라데이션 오버레이 (이미지 위에 글씨나 버튼이 잘 보이게) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent pointer-events-none" />

          {/* 즐겨찾기 버튼 (Top-Left, 유리창 효과 적용) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(data.id);
            }}
            className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-md rounded-full shadow-sm cursor-pointer transition-all hover:bg-white hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M8.125 7.09225L10.7328 3.62125C10.8918 3.40742 11.0805 3.25042 11.299 3.15025C11.5177 3.05008 11.7513 3 12 3C12.2487 3 12.4823 3.05008 12.701 3.15025C12.9195 3.25042 13.1083 3.40742 13.2673 3.62125L15.875 7.09225L19.8943 8.4595C20.2506 8.58017 20.5249 8.78217 20.7173 9.0655C20.9096 9.349 21.0058 9.66217 21.0058 10.005C21.0058 10.1632 20.9826 10.3202 20.9363 10.4762C20.8899 10.6324 20.8138 10.782 20.7173 10.925L18.073 14.498L18.173 18.3288C18.1897 18.7986 18.0343 19.1946 17.7068 19.5168C17.3793 19.8389 16.9982 20 16.5635 20C16.5687 20 16.4173 19.9814 16.1095 19.9443L12 18.7327L7.8905 19.9443C7.80717 19.9776 7.72675 19.9952 7.64925 19.997C7.57192 19.999 7.501 20 7.4365 20C6.993 20 6.60967 19.8389 6.2865 19.5168C5.9635 19.1946 5.81033 18.7986 5.827 18.3288L5.927 14.473L3.298 10.925C3.192 10.7807 3.11583 10.6298 3.0695 10.4723C3.02317 10.3149 3 10.1575 3 10C3 9.6625 3.09883 9.34858 3.2965 9.05825C3.49433 8.76792 3.7705 8.562 4.125 8.4405L8.125 7.09225Z"
                fill={data.isFavorite ? "#1A40FF" : "rgba(255, 255, 255, 0.4)"}
                stroke={data.isFavorite ? "#1A40FF" : "#FFFFFF"}
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* 더보기 버튼 & 서랍 (Top-Right, 유리창 효과 적용) */}
          <div className="absolute top-4 right-4 z-[20]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMoreActive(!isMoreActive);
              }}
              className={`w-10 h-10 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-full ${
                isMoreActive
                  ? "bg-white text-gray-900 shadow-md"
                  : "bg-white/70 backdrop-blur-md text-gray-600 hover:bg-white shadow-sm"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>

            {/* 🌟 둥글고 예쁜 드롭다운 메뉴 */}
            <div
              className={`absolute right-0 top-12 w-[120px] p-2 flex flex-col gap-1 transition-all duration-200 origin-top-right border border-gray-100 rounded-[16px] bg-white shadow-xl ${
                isMoreActive
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setIsMoreActive(false);
                }}
                className="w-full text-left px-3 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                이름 변경
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyLink?.(data.id);
                  setIsMoreActive(false);
                }}
                className="w-full text-left px-3 py-2 text-[13px] font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                링크 복사
              </button>
              <div className="w-full h-[1px] bg-gray-100 my-0.5" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // onDelete?.(data.id); 👈 기존의 이 줄을 지우고
                  setIsDeleteModalOpen(true); // 🌟 모달을 켭니다!
                  setIsMoreActive(false);
                }}
                className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>

        {/* 2. 하단 정보 영역 (여백을 넉넉하게, 텍스트는 굵고 선명하게) */}
        <div className="flex flex-col p-5 gap-4 w-full bg-white relative z-10">
          <div className="flex justify-between items-center w-full gap-3">
            {isEditing ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={handleKeyDown}
                className="text-[20px] font-extrabold tracking-tight text-gray-900 border-b-2 border-primary-500 outline-none flex-1 bg-primary-50 px-2 py-1 rounded-md"
              />
            ) : (
              <h3 className="text-[20px] font-extrabold tracking-tight text-gray-900 truncate flex-1">
                {data.title}
              </h3>
            )}
            <div className="px-3 py-1.5 bg-blue-50 text-primary-600 text-[13px] font-bold rounded-lg shrink-0 tracking-tight">
              {data.country || "나라입력"}
            </div>
          </div>

          <div className="flex justify-between items-end w-full mt-1">
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] text-gray-400 font-semibold tracking-tight">
                함께하는 멤버
              </span>
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {(data.participants || []).slice(0, 5).map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="w-[30px] h-[30px] rounded-full border-2 border-white bg-gray-100 object-cover shrink-0 shadow-sm"
                      alt="avatar"
                    />
                  ))}
                </div>
                {(data.participants || []).length > 5 && (
                  <div className="ml-2 w-[30px] h-[30px] rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[11px] font-bold text-gray-500 shadow-sm">
                    +{(data.participants || []).length - 5}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-gray-400 font-semibold tracking-tight">
                마지막 수정
              </span>
              <span className="text-[13px] text-gray-500 font-bold tracking-tight">
                {data.lastModified}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* 👇 🌟 신규 추가! 삭제 확인 모달 👇 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          onDelete?.(data.id); // 여기서 진짜 삭제!
          setIsDeleteModalOpen(false);
        }}
        title="일정을 삭제하시겠어요?"
        imageSrc={Trash}
      />
    </>
  );
};

export default PlanCard;
