import React from "react";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  imageSrc?: string;
  confirmText?: string;
  cancelText?: string;
  titleClassName?: string;
  confirmTextClassName?: string;
  cancelTextClassName?: string;
  //사이즈 조절을 위한 Props 추가
  width?: string; //"w-[680px]"
  padding?: string; //"py-[60px] px-[105px]"
  className?: string; // 추가적인 커스텀
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  imageSrc,
  confirmText = "네",
  cancelText = "아니오",
  titleClassName = "text-title1",
  confirmTextClassName,
  cancelTextClassName,
  width = "w-[680px]",
  padding = "py-[60px] px-[105px]",
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn">
      <div
        className={`
          flex flex-col items-center gap-[10px] bg-gray-50 rounded-[20px] 
          shadow-[0_0_20px_0_rgba(188,188,206,0.60)]
          ${width} 
          ${padding} 
          ${className}
        `}
      >
        {imageSrc && (
          <div className="w-full flex justify-center mb-5">
            <img
              src={imageSrc}
              alt="Modal Visual"
              className="w-[160px] h-auto object-contain"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 w-full text-center items-center">
          <h2 className={`${titleClassName} text-black`}>{title}</h2>
          {description && (
            <p className="text-body2 text-gray-500">{description}</p>
          )}
        </div>

        <div className="flex gap-[40px] mt-10 w-full justify-center">
          <Button
            label={confirmText}
            variant="solid"
            onClick={onConfirm}
            customSize="w-[220px] py-[19px] px-[94px]"
            textClassName={confirmTextClassName}
          />
          <Button
            label={cancelText}
            variant="outline"
            onClick={onClose}
            customSize="w-[220px] py-[19px] px-[94px]"
            textClassName={cancelTextClassName}
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;
