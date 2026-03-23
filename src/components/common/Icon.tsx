import React from "react";

type Props = React.SVGProps<SVGSVGElement> & {
  name: "trash" | "logout" | "plus";
};

export function Icon({ name, className, ...props }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...props,
  };

  if (name === "trash") {
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...common}>
        <path d="M10 17l-1 0a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4h1" />
        <path d="M15 12H7" />
        <path d="M15 12l-2-2" />
        <path d="M15 12l-2 2" />
        <path d="M13 7h2a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-2" />
      </svg>
    );
  }

  // plus
  return (
    <svg {...common}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}
