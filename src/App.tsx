import AgileTardis from "./components/AgileTardis/AgileTardis";
import { ts, uuid } from "./utils";

function App() {
  return (
    <div style={{ userSelect: "none" }}>
      <Slogan />
      <AgileTardis
        timeRange={[ts("2022-05-01"), ts("2022-06-01")]}
        principles={[
          { id: "todo", name: "Todo", trait: { type: "place", order: 100 } },
          { id: "doing", name: "Doing", trait: { type: "place", order: 200 } },
          { id: "done", name: "Done", trait: { type: "place", order: 300 } },
          { id: "story01", name: "#1 📘", trait: { type: "card" } },
          { id: "story02", name: "#2 📘", trait: { type: "card" } },
          { id: "bug01", name: "#3 🐞", trait: { type: "card" } },
          { id: "p1", name: "P1", trait: { type: "people" } },
          { id: "p2", name: "P2", trait: { type: "people" } },
          { id: "p3", name: "P3", trait: { type: "people" } },
          { id: "p4", name: "P4", trait: { type: "people" } },
          { id: "p5", name: "P5", trait: { type: "people" } },
        ]}
        events={[
          {
            id: uuid(),
            timestamp: ts("2022-05-02"),
            trait: {
              type: "card-born",
              which: "story01",
              where: "todo",
              by: "P1",
            },
          },
          {
            id: uuid(),
            timestamp: ts("2022-05-06"),
            trait: {
              type: "card-move",
              which: "story02",
              to: "doing",
              by: "P1",
            },
          },
          {
            id: uuid(),
            timestamp: ts("2022-05-05"),
            trait: {
              type: "card-born",
              which: "bug01",
              where: "todo",
              by: "P1",
            },
          },
          {
            id: uuid(),
            timestamp: ts("2022-05-10"),
            trait: {
              type: "card-move",
              which: "story02",
              to: "done",
              by: "P2",
            },
          },
        ]}
      />
    </div>
  );
}

function Slogan() {
  return (
    <h1
      style={{ textAlign: "center", fontWeight: "300", marginBottom: "100px" }}
    >
      <span style={{ color: "#163c4d" }}>Agile</span>
      <span style={{ color: "#e26a7c" }}>Tardis</span>
    </h1>
  );
}

export default App;
