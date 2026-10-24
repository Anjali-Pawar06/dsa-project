# AlgoArena

An interactive algorithm workbench built with React and Vite. Configure an algorithm's input, watch its execution step by step, and connect the visualization to pseudocode and complexity analysis.

```bash
npm install
npm run dev
```

Algorithm logic and sample inputs live in `src/algos.js` (+ `src/legacy.js`, the sort/search trace generators); the UI lives in `src/main.jsx` and `src/style.css`.

## Learning workflow
- Choose an algorithm from a learning track and inspect its time and space complexity.
- Enter custom data or load a built-in example.
- Play, pause, restart, step, seek, or adjust playback speed.
- Read the pseudocode at any time, then compare measured operations and final output with theoretical complexity.
- Follow responsive visualizations for arrays, graphs, dynamic-programming tables, N-Queens, and subset-sum decisions.
- Explore Sum of Subsets with positive whole-number inputs (up to 12 values); the backtracking trace shows include/exclude decisions and pruned branches.

## Implemented
Insertion/Quick/Merge Sort, Linear/Binary Search, BFS, DFS, Kruskal, Prim, Fractional Knapsack, 0/1 Knapsack (DP table), Activity Selection, Job Sequencing, N-Queens, Sum of Subsets.

## Not yet implemented
Algorithm analysis/asymptotics, P/NP concepts, tree traversals, BST/AVL/B-tree/B+ tree, heaps/heap sort, threaded & expression trees, symbol tables, binomial coefficients, OBST, matrix chain, graph coloring, branch & bound (FIFO/LIFO/LC), TSP, B&B knapsack.
