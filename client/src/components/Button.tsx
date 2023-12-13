import React from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";
import Spinner from "./Spinner";

interface ButtonProps {
  loading?: boolean;
  className?: ClassNameValue;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
}

export default function Button({
  loading,
  className,
  onClick,
  type,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={twMerge(
        "flex flex-row items-center justify-center rounded-md px-4 py-2 shadow-lg outline-none transform transition-transform bg-[#c7c4bd] hover:opacity-90 focus:ring-2 active:scale-95",
        className
      )}
    >
      {loading && <Spinner />}
      <div className="flex flex-row space-x-1">{children}</div>
    </button>
  );
}
