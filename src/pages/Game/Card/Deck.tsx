import React from "react";
import "./style.scss";

type DeckProps = {
  cards?: JSX.Element[];
  text?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  cardsContainerRef?: React.LegacyRef<HTMLDivElement>;
};

const Deck: React.FC<DeckProps> = ({
  cards,
  text,
  style,
  onClick,
  cardsContainerRef,
}) => {
  return (
    <button className="deck-component" style={style} onClick={onClick}>
      <div className="cards-parent" ref={cardsContainerRef}>
        {cards}
      </div>
      <div className="card">
        <div className="center">
          <p>{text}</p>
        </div>
      </div>
    </button>
  );
};

export default Deck;
