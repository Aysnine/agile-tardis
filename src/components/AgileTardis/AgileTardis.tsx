import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Id, RawEventBase, RawPrincipleBase, Timestamp } from "./types";

interface Props {
  timeRange: [Timestamp, Timestamp];
  events: Array<RawEventBase>;
  principles: Array<RawPrincipleBase>;
}

const AgileTardis: React.FC<Props> = ({ timeRange, events, principles }) => {
  const [currentTime, setCurrentTime] = useState(timeRange[0]);

  const [computedPrinciples, setComputedPrinciples] = useState<
    ComputedPrinciple[]
  >([]);

  const sortedEvents = useMemo(
    () => events.sort((a, b) => a.timestamp - b.timestamp),
    [events]
  );

  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(2 * 24 * 60 * 60); // 1s = 2d

  useEffect(() => {
    if (!autoplay) return;

    const fps = 60;

    const [, end] = timeRange;

    const timer = setInterval(() => {
      const nextTime = currentTime + (speed * 1000) / 60;
      if (nextTime > end) {
        setCurrentTime(end);
        setAutoplay(false);
      } else {
        setCurrentTime(nextTime);
      }
    }, 1000 / fps);

    return () => {
      clearInterval(timer);
    };
  }, [autoplay, currentTime, speed, timeRange]);

  useEffect(() => {
    const passedEvents = sortedEvents.filter((i) => i.timestamp <= currentTime);

    setComputedPrinciples(() => {
      // TODO improve performance by smart migration

      const c: ComputedPrinciple[] = principles.map((i) => ({
        id: i.id,
        raw: i,
        visible: i.trait.type === "place",
        joinMe: [],
        place: null,
      }));

      passedEvents.forEach((e) => {
        const type = e.trait.type;
        if (type === "card-born") {
          const card = find(e, e.trait.which);
          const place = find(e, e.trait.where);
          if (
            !card ||
            !place ||
            !checkType(e, card, "card") ||
            !checkType(e, place, "place")
          )
            return;

          card.visible = true;
          card.place = place.id;
        } else if (type === "card-info-change") {
          // TODO
        } else if (type === "card-move") {
          const card = find(e, e.trait.which);
          const toPlace = find(e, e.trait.to);
          if (
            !card ||
            !toPlace ||
            !checkType(e, card, "card") ||
            !checkType(e, toPlace, "place")
          )
            return;

          card.visible = true;
          card.place = toPlace.id;
        } else {
          unrecognized(e);
        }
      });

      function find(event: RawEventBase, targetId: Id) {
        const target = c.find((t) => t.id === targetId);
        if (!target) {
          console.warn(
            `Dirty event [${event.id}]. Can't find card principle [${targetId}].`,
            {
              event,
            }
          );
        }
        return target;
      }

      function checkType(
        event: RawEventBase,
        target: ComputedPrinciple,
        type: RawPrincipleBase["trait"]["type"]
      ) {
        const isRightType = target.raw.trait.type === type;
        if (!isRightType) {
          console.warn(
            `Dirty event [${event.id}]. Principle [${target}] is not expect type [${type}].`,
            {
              event,
              target,
            }
          );
        }
        return isRightType;
      }

      function unrecognized(event: RawEventBase) {
        console.warn(
          `Dirty event [${event.id}]. Unrecognized type [${event.trait.type}].`,
          {
            event,
          }
        );
      }

      return c;
    });
  }, [sortedEvents, currentTime, principles]);

  return (
    <div>
      <div
        style={{
          margin: 10,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {computedPrinciples
          .filter((i) => i.raw.trait.type === "place")
          .sort((a, b) => {
            if (a.raw.trait.type === "place" && b.raw.trait.type === "place") {
              return a.raw.trait.order - b.raw.trait.order;
            }
            return 0;
          })
          .map((i) => {
            const { visible } = i;
            const { id, name, trait } = i.raw;
            const { type } = trait;

            if (!visible) return null;

            if (type === "place") {
              const currentCardCount = computedPrinciples.filter(
                (t) => t.raw.trait.type === "card" && t.place === i.id
              ).length;

              return (
                <div
                  key={id}
                  style={{
                    display: "inline-block",
                    margin: "10px 0",
                    marginRight: -1,
                    borderRight: "1px solid gray",
                    borderLeft: "1px solid gray",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      fontWeight: "bolder",
                    }}
                  >
                    Place: {name}
                  </div>
                  <div
                    style={{
                      padding: "10px",
                    }}
                  >
                    Card(
                    {currentCardCount})
                  </div>
                  <div
                    id={"place-container-" + id}
                    style={{
                      position: "relative",
                      padding: "10px",
                      minWidth: "400px",
                      minHeight: "calc(100vh - 450px)",
                    }}
                  ></div>
                </div>
              );
            }
            return null;
          })}
        {computedPrinciples
          .filter((i) => i.raw.trait.type !== "place")
          .map((i) => {
            const { visible } = i;
            const { id, trait } = i.raw;
            const { type } = trait;

            if (!visible) return null;

            if (type === "card") {
              if (!i.place) return null;
              const container = document.getElementById(
                "place-container-" + i.place
              );
              if (!container) return null;

              const selfInPlaceIndex = computedPrinciples
                .filter(
                  (t) => t.raw.trait.type === "card" && t.place === i.place
                )
                .findIndex((t) => t.id === i.id);

              return createPortal(
                <div
                  style={{
                    position: "absolute",
                    color: "white",
                    background: "#e26a7caa",
                    top: selfInPlaceIndex * (30 + 10) + 10,
                    transition: "top .28s",
                    width: 60,
                    height: 30,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      overflow: "hidden",
                      fontWeight: 'bolder',
                      textOverflow: "ellipsis",
                    }}
                  >
                    {i.raw.name}
                  </span>
                </div>,
                container,
                id
              );
            }

            return (
              <div
                key={id}
                style={{ margin: "10px 0", backgroundColor: "pink" }}
              >
                Can't render the principle [{id}] that type [{type}]
              </div>
            );
          })}
      </div>
      <div
        style={{ display: "flex", margin: "20px", justifyContent: "center" }}
      >
        <div>Current Time: {new Date(currentTime).toLocaleString()}</div>
      </div>
      <div
        style={{ display: "flex", margin: "20px", justifyContent: "center" }}
      >
        <button
          onClick={() => {
            if (currentTime === timeRange[1]) {
              setCurrentTime(timeRange[0]);
            }
            setAutoplay((v) => !v);
          }}
        >
          {autoplay ? "STOP" : "PLAY"}
        </button>
        <span>&nbsp;</span>
        <select
          value={speed}
          onChange={(e) => {
            setSpeed(Number(e.target.value));
          }}
        >
          <option value={1}>Real Time</option>
          <option value={8 * 60 * 60}>8H/S</option>
          <option value={12 * 60 * 60}>12H/S</option>
          <option value={24 * 60 * 60}>24H/S</option>
          <option value={2 * 24 * 60 * 60}>2D/S</option>
          <option value={7 * 24 * 60 * 60}>7D/S</option>
        </select>
      </div>

      <div style={{ display: "flex", margin: "20px" }}>
        <div>{new Date(timeRange[0]).toLocaleString()}</div>
        <input
          type="range"
          value={currentTime}
          min={timeRange[0]}
          max={timeRange[1]}
          onChange={(e) => {
            setCurrentTime(timeRange[0]);
            setAutoplay(false);
            setCurrentTime(Number(e.target.value));
          }}
          style={{ display: "block", width: "100%", flex: 1 }}
        />
        <div>{new Date(timeRange[1]).toLocaleString()}</div>
      </div>
    </div>
  );
};

interface ComputedPrinciple {
  id: RawPrincipleBase["id"];
  raw: RawPrincipleBase;
  visible: boolean;
  joinMe: Array<Id>;
  place: Id | null;
}

export default AgileTardis;
