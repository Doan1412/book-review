import React, { useState } from "react";
import { FaRegStar, FaStar, FaStarHalf } from "react-icons/fa";

interface RatingProps {
  className?: string;
  count: number;
  value: number;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  edit?: boolean;
  isHalf?: boolean;
  onChange?: (value: number) => void;
  emptyIcon?: React.ReactElement;
  halfIcon?: React.ReactElement;
  fullIcon?: React.ReactElement;
}

const FullStar = () => {
  return <FaStar size={20} color="gold" />;
};

const HalfStar = () => {
  return <FaStarHalf size={20} color="gold" />;
};

const EmptyStar = () => {
  return <FaRegStar size={20} color="gold" />;
};

const Rating: React.FC<RatingProps> = ({
  className,
  count,
  value,
  edit = false,
  isHalf = true,
  onChange,
  emptyIcon = <EmptyStar />,
  halfIcon = <HalfStar />,
  fullIcon = <FullStar />,
}) => {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);
  const handleMouseMove = (index: number) => {
    if (!edit) return;
    setHoverValue(index);
  };
  const handleMouseLeave = () => {
    if (!edit) return;
    setHoverValue(undefined);
  };
  const handleClick = (index: number) => {
    if (!edit) return;
    if (onChange) onChange(index + 1);
  };

  const stars = [];
  for (let i = 0; i < count; i++) {
    let star: React.ReactElement;
    if (isHalf && value - i > 0 && value - i < 1) star = halfIcon;
    else if (i < value) star = fullIcon;
    else star = emptyIcon;

    if (hoverValue !== undefined && i <= hoverValue) star = fullIcon;

    stars.push(
      <div
        key={i}
        style={{ cursor: "pointer" }}
        onMouseMove={() => handleMouseMove(i)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(i)}
      >
        {React.cloneElement(star, {
          color: i <= Number(hoverValue),
        })}
      </div>
    );
  }

  return <div className={`${className} flex flex-row space-x-1`}>{stars}</div>;
};

export default Rating;
