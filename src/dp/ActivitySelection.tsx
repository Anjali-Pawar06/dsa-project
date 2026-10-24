// Activity Selection (Greedy) Interactive Component
// ---------------------------------------------------
// Users input a list of activities with start and finish times.
// The algorithm sorts by finish time and selects the maximum set of
// non‑overlapping activities. Visualization shows the sorted list and
// the chosen activities.

import React, { useState } from "react";
import { AlgoPage } from "../components/AlgoPage/AlgoPage";

type Activity = { start: number; finish: number };

export const ActivitySelection: React.FC = () => {
  const [activitiesText, setActivitiesText] = useState<string>("\n1,4\n3,5\n0,6\n5,7\n3,9\n5,9\n6,10\n8,11\n8,12\n2,14");
  const [selected, setSelected] = useState<Activity[]>([]);
  const [sorted, setSorted] = useState<Activity[]>([]);

  const parse = (): Activity[] => {
    return activitiesText
      .trim()
      .split(/\n/)
      .map((line) => line.split(",").map((x) => Number(x.trim())))
      .filter((pair) => pair.length === 2 && !pair.some(isNaN))
      .map(([s, f]) => ({ start: s, finish: f }));
  };

  const run = () => {
    const acts = parse();
    const sortedActs = [...acts].sort((a, b) => a.finish - b.finish);
    const chosen: Activity[] = [];
    let lastFinish = -Infinity;
    for (const act of sortedActs) {
      if (act.start >= lastFinish) {
        chosen.push(act);
        lastFinish = act.finish;
      }
    }
    setSorted(sortedActs);
    setSelected(chosen);
  };

  const renderList = (list: Activity[]) => (
    <ul>
      {list.map((a, i) => (
        <li key={i}>
          Activity {i + 1}: ({a.start}, {a.finish})
        </li>
      ))}
    </ul>
  );

  return (
    <AlgoPage
      title="Activity Selection (Greedy)"
      description="Select the maximum number of non‑overlapping activities using the classic greedy algorithm (sort by finish time)."
    >
      <div>
        <label>Activities (start,finish per line):</label>
        <br />
        <textarea
          rows={8}
          cols={30}
          value={activitiesText}
          onChange={(e) => setActivitiesText(e.target.value)}
        />
      </div>
      <button onClick={run} style={{ marginTop: 8 }}>
        Run Greedy
      </button>
      {sorted.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Sorted Activities by Finish Time:</strong>
          {renderList(sorted)}
        </div>
      )}
      {selected.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Selected Activities:</strong>
          {renderList(selected)}
        </div>
      )}
    </AlgoPage>
  );
};
