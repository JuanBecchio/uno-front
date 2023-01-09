import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebSocketContext } from "src/contexts/WebSocketContext";
import { Send } from "src/helpers/functions";

import { useModalsContext } from "src/contexts/ModalsContext";
import ChangeNameModal from "src/components/Modals/ChangeNameModal";
import Card from "./Card";

type CardType = {
  value: string;
  color: string;
  index: number;
};

type PlayerType = {
  id: string;
  userName: string;
  cards: CardType[];
  isPlaying: boolean;
  handDiv: HTMLDivElement | null;
};

const started = false;

const useGame = () => {
  const navigate = useNavigate();
  const { showModal } = useModalsContext();

  const { roomId } = useParams();
  const { ws, connected } = useWebSocketContext();

  const isJoined = useRef<boolean>(false);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const dumpRef = useRef<HTMLDivElement | null>(null);
  const localPlayerHandRef = useRef<HTMLDivElement | null>(null);

  const [deckCards, setDeckCards] = useState<JSX.Element[]>([]);
  const [otherPlayers, setOtherPlayers] = useState<PlayerType[]>([]);
  const [localPlayer, setLocalPlayer] = useState<PlayerType | undefined>();

  useEffect(() => {
    if (!connected || !roomId) return;
    const timeout = setTimeout(() => {
      ws.send(JSON.stringify({ type: "JoinedRoom", code: roomId }));
      isJoined.current = true;
      if (!ws.userName)
        showModal<string>(ChangeNameModal, false).then((userName) =>
          Send(ws)({ type: "UpdateUserName", userName })
        );
    }, 100);
    return () => {
      if (isJoined.current) Send(ws)({ type: "LeaveRoom" });
      clearTimeout(timeout);
    };
  }, [connected, roomId]);

  useEffect(() => {
    if (!connected) return;
    ws.addEventListener("message", OnMessage);
    ws.addEventListener("close", () => navigate("/"));
    return () => {
      ws.removeEventListener("message", OnMessage);
      ws.removeEventListener("close", () => null);
    };
  }, [otherPlayers, connected]);

  const OnMessage = useCallback(
    (e: MessageEvent<any>) => {
      const msg = JSON.parse(e.data);

      switch (msg.type) {
        case "RoomInfo":
          SetPlayers(msg.info.users);
          console.log("Joined Room:", msg.info.id);
          break;
        case "RoomError":
          navigate("/");
          break;
        case "AddCard":
          AddCardToPlayer(otherPlayers.find((p) => p.id === msg.userId));
          break;

        case "GetCard":
          AddCardToLocalPlayer(localPlayer, msg.card);
          break;
        default:
          console.log(msg);
          break;
      }
    },
    [otherPlayers]
  );

  const SetPlayers = useCallback((allPlayers: PlayerType[]) => {
    const local = allPlayers.find((p) => p.id === ws.id);

    if (!local || !localPlayerHandRef.current) return;

    local.handDiv = localPlayerHandRef.current;

    const players = [...allPlayers];
    const spliceResult = players.splice(players.indexOf(local));
    const others = [...spliceResult.slice(1), ...players];
    setLocalPlayer(local);
    setOtherPlayers([...others]);
  }, []);

  const moveCardTo = (
    card: EventTarget & (HTMLButtonElement | HTMLDivElement),
    target: (EventTarget & (HTMLButtonElement | HTMLDivElement)) | null
  ) => {
    if (!card || !target) return;

    let button: HTMLButtonElement | null = null;
    if (card.id.includes("button")) {
      button = card as HTMLButtonElement;
      const _card = card.children[0] as HTMLDivElement;
      card = _card;
    }

    const originalPos = CumulativeOffset(card);
    const targetPos = CumulativeOffset(target);

    target.appendChild(card);

    card.style.position = `absolute`;
    card.style.transition = `all ${600}ms ease`;
    card.style.left = `${originalPos.left - targetPos.left}px`;
    card.style.top = `${originalPos.top - targetPos.top}px`;
    card.style.transform = !button
      ? `rotateX(-30deg) rotateY(180deg)`
      : "rotate(-30deg)";

    setTimeout(() => {
      if (button) button.remove();
      card.style.left = `0px`;
      card.style.top = `0px`;
      card.style.transform = `rotateZ(${Math.random() * 180}deg) translateZ(${
        target.childNodes.length
      }px)`;
      if ((target.children.length || 0) > 5) {
        const firstChild = target.children[0] as HTMLDivElement;
        if (!firstChild) return;
        firstChild.style.transform = "scale(0.1)";
        setTimeout(() => {
          firstChild.remove();
        }, 600);
      }
    }, 10);
  };

  const AddCardToPlayer = (player: PlayerType | undefined) => {
    if (!deckRef.current || !player) return;

    setDeckCards((prev) => [
      ...prev,
      <Card value="" color="black" key={prev.length + "deck-card"} />,
    ]);
    setTimeout(() => {
      moveFromDeckToPlayer(
        deckRef.current!.children[0] as HTMLDivElement,
        player.handDiv,
        () => setOtherPlayers([...otherPlayers]),
        false,
        { transitionDuration: 200, transitionTimingFunction: "ease-in" }
      );
      player.cards.push({
        value: player.id,
        color: "black",
        index: player.cards.length + 1,
      });
    }, 10);
  };

  const AddCardToLocalPlayer = (
    localPlayer: PlayerType | undefined,
    card: CardType
  ) => {
    if (!deckRef.current || !localPlayer) return;

    setDeckCards((prev) => [
      ...prev,
      <Card
        value={card.value}
        color={card.color as "black"}
        key={prev.length + "deck-card"}
      />,
    ]);
    setTimeout(() => {
      moveFromDeckToPlayer(
        deckRef.current!.children[0] as HTMLDivElement,
        localPlayer.handDiv,
        () => setLocalPlayer({ ...localPlayer }),
        true,
        { transitionDuration: 400, transitionTimingFunction: "ease-in-out" }
      );
      localPlayer.cards.push(card);
    }, 10);
  };

  const moveFromDeckToPlayer = (
    cardElement: EventTarget & (HTMLButtonElement | HTMLDivElement),
    target: (EventTarget & (HTMLButtonElement | HTMLDivElement)) | null,
    onFinish?: () => void,
    local?: boolean,
    config?: {
      transitionDuration?: number;
      transitionTimingFunction?: string;
      initialTransform?: string;
    }
  ) => {
    if (!cardElement || !target) return;

    let button: HTMLButtonElement | null = null;

    const originalPos = CumulativeOffset(cardElement);
    const targetPos = CumulativeOffset(target);

    target.appendChild(cardElement);

    cardElement.style.position = `absolute`;
    cardElement.style.transition = `all ${
      config?.transitionDuration || 600
    }ms ${config?.transitionTimingFunction || "ease"}`;
    cardElement.style.left = `${originalPos.left - targetPos.left}px`;
    cardElement.style.top = `${originalPos.top - targetPos.top}px`;
    cardElement.style.transform = config?.initialTransform || `rotateY(180deg)`;

    setTimeout(() => {
      if (button) button.remove();
      cardElement.style.left = `${
        Number(getComputedStyle(target).width.split("px")[0]) / 2 +
          (Number(
            getComputedStyle(target.children[0].children[0]).width.split(
              "px"
            )[0]
          ) /
            2) *
            target.children.length -
          Number(getComputedStyle(target.children[0]).width.split("px")[0]) || 0
      }px`;
      cardElement.style.top = `0px`;
      cardElement.style.transform = !local
        ? `rotateX(-30deg) rotateY(180deg)`
        : "rotateX(5deg)";
      setTimeout(() => {
        cardElement.remove();
        onFinish?.();
      }, config?.transitionDuration || 600);
    }, 10);
  };

  const PlayedCard = (index: number, card: CardType) => {
    const player = localPlayer; //NOOOO
    if (!player?.handDiv || !dumpRef.current) return;

    const htmlCard = player.handDiv.children[player.cards.indexOf(card)];

    moveCardTo(htmlCard as HTMLDivElement, dumpRef.current);
  };

  const handleDeckClick = () => {
    Send(ws)({ type: "GrabCardFromDeck" });
  };

  return {
    started,
    localPlayer,
    otherPlayers,
    deckCards,
    dumpRef,
    deckRef,
    localPlayerHandRef,
    PlayedCard,
    handleDeckClick,
  };
};

export default useGame;

const CumulativeOffset = (
  element: EventTarget & (HTMLDivElement | HTMLButtonElement),
  offset?: { top?: number; left?: number }
) => {
  let top = 0,
    left = 0;
  do {
    top += element?.offsetTop || 0;
    left += element?.offsetLeft || 0;
    element = element?.offsetParent as HTMLDivElement;
  } while (element);

  return {
    top: top + (offset?.top || 0),
    left: left + (offset?.left || 0),
  };
};
