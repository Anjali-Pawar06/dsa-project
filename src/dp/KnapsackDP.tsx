// 0/1 Knapsack (Dynamic Programming) Interactive Component
// -------------------------------------------------------
// Users input items (weight, value) and knapsack capacity.
// The component builds the DP table, shows it in a grid, and highlights the
// decision path to reconstruct the optimal set of items.

import React, { useState } from "react";
import { AlgoPage } from "../components/AlgoPage/AlgoPage";

interface Item {
  weight: number;
  value: number;
}

export const KnapsackDP: React.FC = () => {
  const [capacity, setCapacity] = useState(0);
  const [itemsText, setItemsText] = useState<string>("\n1,60\n2,100\n3,120"); // weight,value per line
  const [table, setTable] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const parseItems = (): Item[] => {
    return itemsText
      .trim()
      .split(/\n/)
      .map((line) => line.split(",").map((x) => Number(x.trim())))
      .filter((pair) => pair.length === 2 && !pair.some(isNaN))
      .map(([w, v]) => ({ weight: w, value: v }));
  };

  const runDP = () => {
    const items = parseItems();
    const n = items.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () =>
      Array(capacity + 1).fill(0)
    );
    for (let i = 1; i <= n; i++) {
      const { weight, value } = items[i - 1];
      for (let w = 0; w <= capacity; w++) {
        if (weight > w) dp[i][w] = dp[i - 1][w];
        else dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
      }
    }
    // Reconstruct selected items
    const chosen: number[] = [];
    let w = capacity;
    for (let i = n; i > 0; i--) {
      if (dp[i][w] !== dp[i - 1][w]) {
        chosen.push(i - 1); // store index of item
        w -= items[i - 1].weight;
      }
    }
    setTable(dp);
    setSelected(chosen.reverse());
    setTotalValue(dp[n][capacity]);
  };

  const renderTable = () => {
    if (table.length === 0) return null;
    const items = parseItems();
    return (
      <table style={{ borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 4 }}>i \ w</th>
            {Array.from({ length: capacity + 1 }, (_, w) => (
              <th key={w} style={{ border: "1px solid #ccc", padding: 4 }}>
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #ccc", padding: 4, fontWeight: "bold" }}>
                {i}
                {i > 0 ? ` (${items[i - 1].weight},${items[i - 1].value})` : ""}
              </td>
              {row.map((val, j) => (
                <td
                  key={j}
                  style={{
                    border: "1px solid #ccc",
                    padding: 4,
                    background:
                      selected.includes(i - 1) && j === capacity ? "#d0f0c0" : "inherit",
                  }}
                >
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <AlgoPage
      title="0/1 Knapsack (Dynamic Programming)"
      description="Find the maximum total value that fits within the knapsack capacity using DP."
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
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
        />
      </div>
      <button onClick={runDP} style={{ marginTop: 8 }}>
        Run DP
      </button>
      {renderTable()}
      {totalValue > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Total value:</strong> {totalValue}<br />
          <strong>Chosen items (index):</strong> {selected.join(", ")}
        </div>
      )}
    </AlgoPage>
  );
};
