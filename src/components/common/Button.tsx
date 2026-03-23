import React from "react";

type ButtonVariant = "solid" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  customSize?: string;
  textClassName?: string;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "solid",
  customSize = "",
  textClassName = "text-h2",
  className = "",
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    solid: "bg-primary-600 text-white border-primary-600",
    outline: "bg-gray-50 text-primary-600 border-primary-600",
  };

  return (
    <button
      className={`
        flex justify-center items-center gap-[10px] rounded-[10px] border 
        transition-all active:scale-[0.98] cursor-pointer font-bold
        ${customSize ? customSize : "w-[280px] py-4 px-10 flex-col items-start"} 
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      <span className={`${textClassName} leading-none whitespace-nowrap`}>
        {label}
      </span>
    </button>
  );
};

export default Button;
