import React from "react";

interface AddButtonProps {
  onClick?: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center
        w-20 h-20 rounded-[40px] /* 버튼 전체 크기: 80px */
        bg-primary-500 hover:bg-primary-700
        transition-colors duration-300 cursor-pointer shadow-lg
      "
      aria-label="일정 추가"
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10"
      >
        <mask
          id="mask0_227_276"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="40"
          height="40"
        >
          <rect width="40" height="40" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_227_276)">
          <path
            d="M18.3333 35V21.6667H5V18.3333H18.3333V5H21.6667V18.3333H35V21.6667H21.6667V35H18.3333Z"
            fill="#FEFEFE"
          />
        </g>
      </svg>
    </button>
  );
};

export default AddButton;
