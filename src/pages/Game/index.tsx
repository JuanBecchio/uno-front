import React from "react";

import Card from "./Card";
import Deck from "./Card/Deck";
import ReverseIcon from "src/assets/icons/ReverseIcon";

import useGame from "./useGame";

import "./style.scss";

const canPlay = true;

const Game: React.FC = () => {
  const {
    started,
    localPlayer,
    otherPlayers,
    deckCards,
    dumpRef,
    deckRef,
    localPlayerHandRef,
    handleDeckClick,
    PlayedCard,
  } = useGame();

  return (
    <div className="game-container">
      {started && <ReverseIcon className="reverse-icon" />}
      <div className="other-players">
        {otherPlayers.map((player, index) => (
          <div
            className={`player${player.isPlaying ? " turn" : ""}`}
            key={player.userName + index}
          >
            <div className="hand" ref={(r) => (player.handDiv = r)}>
              {player.cards.map((card) => (
                <Card
                  value={card.value}
                  color={card.color as "black"}
                  key={card.color + card.value + card.index + index}
                />
              ))}
            </div>
            <p>{player.userName}</p>
          </div>
        ))}
      </div>
      <div className="deck">
        <Deck
          cards={deckCards}
          style={{ pointerEvents: canPlay ? "auto" : "none" }}
          onClick={handleDeckClick}
          cardsContainerRef={deckRef}
        />
        <div ref={dumpRef} className="dump" />
      </div>

      <div className="local-player">
        <label>{localPlayer?.userName} (Yo)</label>
        <div className="player-hand" ref={localPlayerHandRef}>
          {localPlayer?.cards.map((card, index) => (
            <button
              id={`player-button-${index}`}
              onClick={() => PlayedCard(0, card)}
              className={`card-button${
                ""
                // localPlayer.isPlaying ? "" : " disabled"
              }`}
              key={card.color + card.value + card.index}
              // disabled={!localPlayer.isPlaying}
            >
              <Card
                value={card.value}
                color={card.color as "black"}
                style={{
                  transform: `translateZ(${index}px) rotateX(-5deg)`,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
