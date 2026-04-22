import React, { useState, useEffect } from "react";
import AddButton from "../components/common/AddBtn";
import PencilImg from "../assets/Design_img/source/pencil.png";
import PlanCard, { type PlanData } from "../components/common/PlanCard";
import WeatherDateRangePicker from "../components/DatePicker/WeatherDateRangePicker";
import toast from "react-hot-toast";

const cityCoordinates = [
  { name: "서울", lat: 37.5665, lon: 126.978 },
  { name: "제주", lat: 33.4996, lon: 126.5312 },
  { name: "부산", lat: 35.1796, lon: 129.0756 },
  { name: "강릉", lat: 37.7519, lon: 128.8761 },
  { name: "여수", lat: 34.7604, lon: 127.6622 },
  { name: "인천", lat: 37.4563, lon: 126.7052 },
];

interface PlanProps {
  imageSrc?: string;
  plans: PlanData[];
  onAddPlan: (roomName: string, startDate: string, endDate: string) => void;
  onToggleFavorite: (id: number | string) => void;
  onRename: (id: number | string, newTitle: string) => void;
  onDelete: (id: number | string) => void;
  onCopyLink: (id: number | string) => void;
}

const Plan: React.FC<PlanProps> = ({
  imageSrc,
  plans,
  onAddPlan,
  onToggleFavorite,
  onRename,
  onDelete,
  onCopyLink,
}) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [detectedCity, setDetectedCity] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setRoomName("");
    setStartDate("");
    setEndDate("");
    setDetectedCity(null);
  };

  useEffect(() => {
    const foundCity = cityCoordinates.find((city) =>
      roomName.includes(city.name),
    );
    if (foundCity) {
      setDetectedCity({ lat: foundCity.lat, lon: foundCity.lon });
    } else {
      setDetectedCity(null);
    }
  }, [roomName]);

  const handleConfirm = () => {
    if (!roomName.trim()) {
      toast.error("방 이름을 입력해 주세요.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("여행 기간을 선택해 주세요.");
      return;
    }
    if (startDate > endDate) {
      toast.error("종료일이 시작일보다 빠를 수 없습니다.");
      return;
    }

    onAddPlan(roomName, startDate, endDate);
    handleCloseModal();
  };

  return (
    <div className="w-full h-full relative pt-[60px] pl-[40px] flex flex-col items-start overflow-hidden">
      <div className="flex flex-col items-start gap-2 self-stretch z-10 mb-[75px]">
        <h1 className="text-title1 text-gray-900">Schedule Archive</h1>
        <p className="text-h6 text-gray-500 leading-[30px] tracking-[-0.4px]">
          여행.zip에서 여행 계획을 세워보세요
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center self-center justify-center w-full h-full pb-[200px]">
          <div className="relative flex justify-center items-center w-[696px] h-[696px] shrink-0">
            {imageSrc && (
              <img
                src={imageSrc}
                className="w-full h-full object-cover opacity-50"
                alt="empty background"
              />
            )}
            <div className="absolute z-10 text-title2 text-center pointer-events-none">
              <span className="text-black">아직 세워둔 여행 계획이 </span>
              <span className="text-error-default">없습니다.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full overflow-y-auto pr-10 pb-40 scrollbar-hide">
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,376px)] justify-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                data={plan}
                onToggleFavorite={onToggleFavorite}
                onRename={onRename}
                onDelete={onDelete}
                onCopyLink={onCopyLink}
              />
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-[60px] right-[60px] z-20">
        <AddButton onClick={() => setCreateModalOpen(true)} />
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-[480px] w-full flex flex-col gap-6 transform transition-all">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="relative inline-flex items-center justify-center min-h-[56px]">
                <div className="absolute left-full mr-4 w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                  <img
                    src={PencilImg}
                    alt="pencil"
                    className="w-8 h-8 opacity-80"
                  />
                </div>
                <h3 className="text-[22px] font-extrabold text-gray-800 whitespace-nowrap">
                  새로운 여행 시작하기
                </h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                방 이름과 여행 기간을 설정해 주세요.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">
                  여행 이름 (방 이름)
                </label>
                <input
                  type="text"
                  placeholder="예: jeju 3days"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-body3"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-gray-700 pl-1">
                  여행 기간
                </label>
                <WeatherDateRangePicker
                  detectedCity={detectedCity}
                  onDateChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={!roomName.trim() || !startDate || !endDate}
                className="flex-1 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                방 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plan;
