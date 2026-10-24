// Binary Tree Playground
// -------------------------
// Provides an interactive UI for building a binary tree either via
// array (sequential) representation or linked-node representation.
// The component re‑uses the common AlgoPage layout defined in the
// roadmap. Users can insert nodes, delete nodes, and toggle the
// display mode.

import React, { useState } from "react";
import { AlgoPage } from "../components/AlgoPage/AlgoPage";

/** Linked‑node binary tree node */
export interface BinNode<T> {
  data: T;
  left: BinNode<T> | null;
  right: BinNode<T> | null;
}

/** Convert an array representation (1‑based indexing) to a linked tree */
export function arrayToTree<T>(arr: (T | null)[]): BinNode<T> | null {
  if (arr.length === 0) return null;
  const nodes: (BinNode<T> | null)[] = arr.map((val) =>
    val !== null ? { data: val, left: null, right: null } : null
  );
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;
    const leftIdx = 2 * i + 1; // zero‑based array
    const rightIdx = 2 * i + 2;
    if (leftIdx < nodes.length) node.left = nodes[leftIdx];
    if (rightIdx < nodes.length) node.right = nodes[rightIdx];
  }
  return nodes[0] ?? null;
}

/** Serialize a linked tree back to an array (level order, null placeholders) */
export function treeToArray<T>(root: BinNode<T> | null): (T | null)[] {
  if (!root) return [];
  const result: (T | null)[] = [];
  const queue: (BinNode<T> | null)[] = [root];
  while (queue.length) {
    const node = queue.shift()!;
    if (node) {
      result.push(node.data);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }
  // Trim trailing nulls for a cleaner view
  while (result.length && result[result.length - 1] === null) result.pop();
  return result;
}

// Simple visualizer – for brevity we render the array view and a minimal
// tree diagram using Unicode characters.
function renderTree<T>(node: BinNode<T> | null, depth = 0): JSX.Element {
  if (!node) return <></>;
  return (
    <div style={{ marginLeft: depth * 20 }}>
      <span>{node.data}</span>
      {renderTree(node.left, depth + 1)}
      {renderTree(node.right, depth + 1)}
    </div>
  );
}

export const BinaryPlayground: React.FC = () => {
  const [arrayRep, setArrayRep] = useState<string>("[""A", "B", "C", null, "D"]");
  const [linkedRoot, setLinkedRoot] = useState<BinNode<string> | null>(null);
  const [mode, setMode] = useState<"array" | "linked">("array");

  const handleBuild = () => {
    try {
      const parsed: (string | null)[] = JSON.parse(arrayRep);
      setLinkedRoot(arrayToTree(parsed));
    } catch (e) {
      alert("Invalid JSON array");
    }
  };

  return (
    <AlgoPage
      title="Binary Tree Playground (Unit II)"
      description="Interactively build a binary tree using either an array (sequential) representation or a linked‑node representation."
    >
      <div style={{ marginBottom: 12 }}>
        <label>Array representation (JSON): </label>
        <input
          type="text"
          value={arrayRep}
          onChange={(e) => setArrayRep(e.target.value)}
          style={{ width: "80%" }}
        />
        <button onClick={handleBuild}>Build Linked Tree</button>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
          style={{ marginLeft: 8 }}
        >
          <option value="array">Array View</option>
          <option value="linked">Linked View</option>
        </select>
      </div>
      {mode === "array" ? (
        <pre>{JSON.stringify(treeToArray(linkedRoot), null, 2)}</pre>
      ) : (
        <div>{renderTree(linkedRoot)}</div>
      )}
    </AlgoPage>
  );
};
