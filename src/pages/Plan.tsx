import React, { useState } from "react";
import Modal from "../components/common/Modal";
import AddButton from "../components/common/AddBtn";
import PencilImg from "../assets/Design_img/source/pencil.png";
import PlanCard, { type PlanData } from "../components/common/PlanCard";

interface PlanProps {
  imageSrc?: string;
  plans: PlanData[];
  onAddPlan: () => void;
  onToggleFavorite: (id: number | string) => void; //id 타입 대응 (number | string)
  // Home에서 내려주는 새로운 기능들을 인터페이스에 추가
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

  return (
    <div className="w-full h-full relative pt-[60px] pl-[40px] flex flex-col items-start overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="flex flex-col items-start gap-2 self-stretch z-10 mb-[75px]">
        <h1 className="text-title1 text-gray-900">Schedule Archive</h1>
        <p className="text-h6 text-gray-500 leading-[30px] tracking-[-0.4px]">
          여행.zip에서 여행 계획을 세워보세요!
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      {plans.length === 0 ? (
        <div className="flex flex-col items-center self-center justify-center animate-fadeIn w-full h-full pb-[200px]">
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
          <div
            className="
            grid gap-4 animate-fadeIn
            grid-cols-[repeat(auto-fill,376px)] 
            justify-start
          "
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                data={plan}
                onToggleFavorite={onToggleFavorite}
                // PlanCard가 필요한 새로운 props들도 전달
                onRename={onRename}
                onDelete={onDelete}
                onCopyLink={onCopyLink}
              />
            ))}
          </div>
        </div>
      )}

      {/* 우측 하단 고정 추가 버튼 */}
      <div className="absolute bottom-[60px] right-[60px] z-20">
        <AddButton onClick={() => setCreateModalOpen(true)} />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onConfirm={() => {
          onAddPlan();
          setCreateModalOpen(false);
        }}
        title="일정을 생성하시겠어요?"
        imageSrc={PencilImg}
        confirmTextClassName="text-body3"
        cancelTextClassName="text-body3"
      />
    </div>
  );
};

export default Plan;
