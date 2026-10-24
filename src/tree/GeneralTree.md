# General Tree Fundamentals (Unit II)

## Terminology
- **Root** – the topmost node of the tree.
- **Parent** – a node that has one or more children.
- **Child** – a node directly descended from a parent.
- **Sibling** – nodes that share the same parent.
- **Leaf** – a node with no children.
- **Degree** – number of children of a node.
- **Depth** – number of edges from the root to a given node.
- **Height** – maximum depth among all leaves.
- **Level** – set of nodes with the same depth.
- **Subtree** – a node together with all its descendants.
- **Forest** – a collection of disjoint trees.

## General‑Tree Representations
### 1. Sequential (Array) Representation
- Store nodes in an array where each entry contains the node’s data and an index of its first child.
- Children are linked via a *next‑sibling* index.

### 2. Linked (Node) Representation
```ts
interface GTreeNode<T> {
  data: T;
  firstChild: GTreeNode<T> | null;
  nextSibling: GTreeNode<T> | null;
}
```
- Each node points to its first child and its next sibling, allowing an arbitrary number of children.

### 3. Left‑Child / Right‑Sibling (LC‑RS) Binary Tree Conversion
The LC‑RS representation maps a general tree to a binary tree where:
- **left child** → the node’s first (leftmost) child.
- **right child** → the node’s next sibling.

This conversion enables reuse of binary‑tree algorithms (traversals, balancing, etc.) while preserving the original structure.

---

### Example
Consider the general tree:
```
        A
      / | \
     B  C  D
    / \    |
   E   F   G
```
- In LC‑RS binary form, `A`’s left child is `B`; `B`’s right child is `C`; `C`’s right child is `D`, and so on.

---

### References
- Cormen et al., *Introduction to Algorithms*, Chapter 12.
- Goodrich & Tamassia, *Data Structures & Algorithms in Java*, Section 12.2.
