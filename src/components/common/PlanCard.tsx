import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface PlanData {
  id: number | string;
  title: string;
  lastModified: string;
  isFavorite: boolean;
  participants: string[];
  image: string;
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

  // 🌟 지도를 담을 빈 박스(div)를 가리키는 변수
  const mapRef = useRef<HTMLDivElement>(null);

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

  // 🌟 카카오 정적 지도(StaticMap) 생성 로직! (401 에러 원천 차단)
  useEffect(() => {
    // 좌표가 있을 때만 지도를 그립니다.
    if (data.lat && data.lng) {
      const initStaticMap = () => {
        const { kakao } = window as any;
        // 카카오맵 스크립트가 아직 안 불러와졌으면 0.1초 뒤에 다시 시도
        if (!kakao || !kakao.maps) {
          setTimeout(initStaticMap, 100);
          return;
        }

        kakao.maps.load(() => {
          if (!mapRef.current) return;
          // 이전에 그려진 지도가 있다면 깨끗하게 지웁니다
          mapRef.current.innerHTML = "";

          const options = {
            center: new kakao.maps.LatLng(data.lat, data.lng),
            level: 5,
            marker: {
              position: new kakao.maps.LatLng(data.lat, data.lng),
            },
          };
          // 카카오가 제공하는 정적 지도 컴포넌트를 mapRef 박스 안에 쏙 넣습니다!
          new kakao.maps.StaticMap(mapRef.current, options);
        });
      };
      initStaticMap();
    }
  }, [data.lat, data.lng]);

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col w-[376px] h-[340px] shrink-0 rounded-[10px] border border-[#BCBCCE] bg-[#FEFEFE] overflow-hidden shadow-sm hover:shadow-md transition-all relative cursor-pointer"
    >
      {/* 1. 상단 이미지 영역 */}
      <div className="relative h-[240px] w-full bg-gray-100 overflow-hidden">
        {/* 🌟 좌표가 있으면 카카오맵을, 없으면 기본 이미지를 띄워줍니다! */}
        {data.lat && data.lng ? (
          <>
            {/* pointer-events-none: 사용자가 썸네일 지도를 드래그하는 걸 방지합니다 */}
            <div ref={mapRef} className="w-full h-full pointer-events-none" />
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          </>
        ) : (
          <div
            className="w-full h-full bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${data.image})` }}
          />
        )}

        {/* 즐겨찾기 별 */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 버튼 누를 때 카드 클릭 방지
            onToggleFavorite(data.id);
          }}
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-primary-100 rounded-full shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <mask
              id={`mask_star_${data.id}`}
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="24"
              height="24"
            >
              <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask={`url(#mask_star_${data.id})`}>
              <path
                d="M8.125 7.09225L10.7328 3.62125C10.8918 3.40742 11.0805 3.25042 11.299 3.15025C11.5177 3.05008 11.7513 3 12 3C12.2487 3 12.4823 3.05008 12.701 3.15025C12.9195 3.25042 13.1083 3.40742 13.2673 3.62125L15.875 7.09225L19.8943 8.4595C20.2506 8.58017 20.5249 8.78217 20.7173 9.0655C20.9096 9.349 21.0058 9.66217 21.0058 10.005C21.0058 10.1632 20.9826 10.3202 20.9363 10.4762C20.8899 10.6324 20.8138 10.782 20.7078 10.925L18.073 14.498L18.173 18.3288C18.1897 18.7986 18.0343 19.1946 17.7068 19.5168C17.3793 19.8389 16.9982 20 16.5635 20C16.5687 20 16.4173 19.9814 16.1095 19.9443L12 18.7327L7.8905 19.9443C7.80717 19.9776 7.72675 19.9952 7.64925 19.997C7.57192 19.999 7.501 20 7.4365 20C6.993 20 6.60967 19.8389 6.2865 19.5168C5.9635 19.1946 5.81033 18.7986 5.827 18.3288L5.927 14.473L3.298 10.925C3.192 10.7807 3.11583 10.6298 3.0695 10.4723C3.02317 10.3149 3 10.1575 3 10C3 9.6625 3.09883 9.34858 3.2965 9.05825C3.49433 8.76792 3.7705 8.562 4.125 8.4405L8.125 7.09225Z"
                fill={
                  data.isFavorite
                    ? "var(--color-primary-800)"
                    : "var(--color-primary-100)"
                }
                stroke="var(--color-primary-800)"
                strokeWidth="1.2"
              />
            </g>
          </svg>
        </button>

        {/* 더보기 버튼 & 서랍 */}
        <div className="absolute right-4 bottom-4 flex flex-col items-center gap-1 z-[20]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMoreActive(!isMoreActive);
            }}
            className={`w-10 h-10 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${isMoreActive ? "bg-primary-500 rounded-[20px] -translate-y-[96px]" : "bg-primary-100 rounded-full hover:bg-white"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="27"
              height="27"
              viewBox="0 0 27 27"
              fill="none"
            >
              <mask
                id="mask_more"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="27"
                height="27"
              >
                <rect width="26.6667" height="26.6667" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask_more)">
                <path
                  d="M6.92253 14.9998C6.46419 14.9998 6.07188 14.8366 5.74558 14.5101C5.4191 14.1838 5.25586 13.7915 5.25586 13.3332C5.25586 12.8748 5.4191 12.4825 5.74558 12.1562C6.07188 11.8297 6.46419 11.6665 6.92253 11.6665C7.38086 11.6665 7.77327 11.8297 8.09975 12.1562C8.42604 12.4825 8.58919 12.8748 8.58919 13.3332C8.58919 13.7915 8.42604 14.1838 8.09975 14.5101C7.77327 14.8366 7.38086 14.9998 6.92253 14.9998ZM13.3328 14.9998C12.8745 14.9998 12.4822 14.8366 12.1559 14.5101C11.8294 14.1838 11.6661 13.7915 11.6661 13.3332C11.6661 12.8748 11.8294 12.4825 12.1559 12.1562C12.4822 11.8297 12.8745 11.6665 13.3328 11.6665C13.7911 11.6665 14.1835 11.8297 14.5097 12.1562C14.8362 12.4825 14.9995 12.8748 14.9995 13.3332C14.9995 13.7915 14.8362 14.1838 14.5097 14.5101C14.1835 14.8366 13.7911 14.9998 13.3328 14.9998ZM19.7431 14.9998C19.2847 14.9998 18.8923 14.8366 18.5659 14.5101C18.2396 14.1838 18.0764 13.7915 18.0764 13.3332C18.0764 12.8748 18.2396 12.4825 18.5659 12.1562C18.8923 11.8297 19.2847 11.6665 19.7431 11.6665C20.2014 11.6665 20.5937 11.8297 20.92 12.1562C21.2465 12.4825 21.4097 12.8748 21.4097 13.3332C21.4097 13.7915 21.2465 14.1838 20.92 14.5101C20.5937 14.8366 20.2014 14.9998 19.7431 14.9998Z"
                  fill={isMoreActive ? "#FFFFFF" : "#1A40FF"}
                />
              </g>
            </svg>
          </button>
          <div
            className={`absolute bottom-0 w-[76px] h-[92px] flex flex-col items-center justify-around py-1 transition-all duration-300 border border-[#8CA2FF] rounded-[8px] bg-[#FEFEFE] shadow-lg ${isMoreActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setIsMoreActive(false);
              }}
              className="text-[10px] font-bold text-gray-700 hover:text-primary-600"
            >
              이름 변경
            </button>
            <div className="w-[60px] h-[1px] bg-[#8CA2FF]/30" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink?.(data.id);
                setIsMoreActive(false);
              }}
              className="text-[10px] font-bold text-gray-700 hover:text-primary-600"
            >
              링크 복사
            </button>
            <div className="w-[60px] h-[1px] bg-[#8CA2FF]/30" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(data.id);
                setIsMoreActive(false);
              }}
              className="text-[10px] font-bold text-error-default"
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>

      {/* 2. 하단 정보 영역 */}
      <div className="flex flex-col h-[100px] p-[10px_20px] gap-[10px] w-full bg-white relative z-10">
        <div className="flex justify-between items-center w-full">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={handleKeyDown}
              className="text-[18px] font-bold text-gray-900 border-b-2 border-primary-500 outline-none flex-1 mr-2 bg-primary-50 px-1 rounded-sm"
            />
          ) : (
            <h3 className="text-[18px] font-bold text-gray-900 truncate flex-1 mr-2">
              {data.title}
            </h3>
          )}
          <button className="h-[30px] px-3 bg-[#E5EAFF] text-[#1A40FF] text-[12px] font-medium rounded-full shrink-0">
            {data.country || "나라입력"}
          </button>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center">
            <div className="flex -space-x-[18px]">
              {(data.participants || []).slice(0, 6).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="w-[32px] h-[32px] rounded-full border border-white bg-gray-200 object-cover shrink-0"
                  alt="avatar"
                />
              ))}
            </div>
            {(data.participants || []).length > 6 && (
              <span className="ml-3 text-[14px] text-gray-400 font-medium">
                +{(data.participants || []).length - 6}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
            <span>마지막 수정</span>
            <span className="font-medium">{data.lastModified}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
