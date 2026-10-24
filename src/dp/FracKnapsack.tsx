// Fractional Knapsack (Greedy) Interactive Component
// ---------------------------------------------------
// Allows user to input items (weight, value) and knapsack capacity.
// Visualizes items sorted by value‑to‑weight ratio, shows selection
// process, and displays total value and remaining capacity.

import React, { useState } from "react";
import { AlgoPage } from "../components/AlgoPage/AlgoPage";

interface Item {
  weight: number;
  value: number;
}

function ratio(item: Item): number {
  return item.value / item.weight;
}

export const FractionalKnapsack: React.FC = () => {
  const [capacity, setCapacity] = useState(0);
  const [items, setItems] = useState<string>("\n1,60\n2,100\n3,120"); // weight,value per line
  const [solution, setSolution] = useState<string>("");

  const parseItems = (): Item[] => {
    return items
      .trim()
      .split(/\n/)
      .map((line) => line.split(",").map((x) => Number(x.trim())))
      .filter((pair) => pair.length === 2 && !pair.some(isNaN))
      .map(([w, v]) => ({ weight: w, value: v }));
  };

  const runAlgorithm = () => {
    const itemList = parseItems();
    const sorted = [...itemList].sort((a, b) => ratio(b) - ratio(a));
    let remaining = capacity;
    let totalValue = 0;
    const steps: string[] = [];
    for (const it of sorted) {
      if (remaining <= 0) break;
      if (it.weight <= remaining) {
        remaining -= it.weight;
        totalValue += it.value;
        steps.push(`Take whole item (w=${it.weight}, v=${it.value})`);
      } else {
        const fraction = remaining / it.weight;
        totalValue += it.value * fraction;
        steps.push(
          `Take ${fraction.toFixed(2)} of item (w=${it.weight}, v=${it.value})`
        );
        remaining = 0;
      }
    }
    setSolution(
      `Capacity: ${capacity}\nSorted items by ratio: ${sorted
        .map((i) => `${i.weight}/${i.value} (${ratio(i).toFixed(2)})`)
        .join(", ")}\nSteps:\n${steps.join("\n")}\nTotal value = ${totalValue.toFixed(2)}`
    );
  };

  return (
    <AlgoPage
      title="Fractional Knapsack (Greedy)"
      description="Select items to maximize total value, allowing fractional parts of items."
    >
      <div>
        <label>Capacity:&nbsp;</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Items (weight,value per line):</label>
        <br />
        <textarea
          rows={6}
          cols={30}
          value={items}
          onChange={(e) => setItems(e.target.value)}
        />
      </div>
      <button onClick={runAlgorithm} style={{ marginTop: 8 }}>
        Run Greedy
      </button>
      <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 8 }}>
{solution}
      </pre>
    </AlgoPage>
  );
};
