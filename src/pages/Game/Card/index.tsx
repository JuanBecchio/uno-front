import React from "react";
import "./style.scss";

type CardProps = {
  value: string;
  color: "red" | "green" | "blue" | "yellow" | "black";
  visible?: boolean;
  style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ value, color = "black", style }) => {
  return (
    <div
      className="component"
      style={{
        color: `var(--${color})`,
        ...style,
      }}
    >
      <div className="card back">
        <div className="center"></div>
      </div>
      <div className="card front">
        <p className="top">{value}</p>
        <div className="center">
          <p className="center">{value}</p>
        </div>
        <p className="bottom">{value}</p>
      </div>
    </div>
  );
};

export default Card;
