// Left-Child / Right-Sibling conversion utilities
// -------------------------------------------------
// This module defines generic tree node types and a conversion routine
// that maps a general (n-ary) tree to its binary left‑child/right‑sibling (LC‑RS)
// representation. The implementation is pure TypeScript and can be used
// both on the server side and inside React components.

/** General tree node (n‑ary) */
export interface GTreeNode<T> {
  data: T;
  firstChild: GTreeNode<T> | null; // leftmost child
  nextSibling: GTreeNode<T> | null; // next sibling to the right
}

/** Binary tree node used for the LC‑RS representation */
export interface BinaryTreeNode<T> {
  data: T;
  left: BinaryTreeNode<T> | null;   // left child = first child in original tree
  right: BinaryTreeNode<T> | null;  // right child = next sibling in original tree
}

/**
 * Convert a general tree rooted at `root` into its LC‑RS binary form.
 * The conversion is performed recursively: the left pointer of the binary node
 * points to the conversion of the original node's `firstChild`; the right pointer
 * points to the conversion of the original node's `nextSibling`.
 */
export function convertToLCRS<T>(root: GTreeNode<T> | null): BinaryTreeNode<T> | null {
  if (!root) return null;
  const binNode: BinaryTreeNode<T> = {
    data: root.data,
    left: convertToLCRS(root.firstChild),
    right: convertToLCRS(root.nextSibling),
  };
  return binNode;
}

/** Utility to create a simple general tree for testing/demo purposes. */
export function makeDemoTree(): GTreeNode<string> {
  // Example tree:
  //        A
  //      / | \
  //     B  C  D
  //    / \    |
  //   E   F   G
  const nodeE: GTreeNode<string> = { data: "E", firstChild: null, nextSibling: null };
  const nodeF: GTreeNode<string> = { data: "F", firstChild: null, nextSibling: null };
  const nodeB: GTreeNode<string> = { data: "B", firstChild: nodeE, nextSibling: null };
  nodeE.nextSibling = nodeF; // E -> F
  const nodeC: GTreeNode<string> = { data: "C", firstChild: null, nextSibling: null };
  const nodeG: GTreeNode<string> = { data: "G", firstChild: null, nextSibling: null };
  const nodeD: GTreeNode<string> = { data: "D", firstChild: nodeG, nextSibling: null };
  nodeC.nextSibling = nodeD; // C -> D
  nodeB.nextSibling = nodeC; // B -> C
  const root: GTreeNode<string> = { data: "A", firstChild: nodeB, nextSibling: null };
  return root;
}

/** Simple inorder‑like traversal for the binary LC‑RS representation.
 *  Returns an array of node data in the order visited.
 */
export function lcRsInorder<T>(node: BinaryTreeNode<T> | null, out: T[] = []): T[] {
  if (!node) return out;
  lcRsInorder(node.left, out);
  out.push(node.data);
  lcRsInorder(node.right, out);
  return out;
}

// Exporting demo helpers for the UI layer.
export const demo = {
  tree: makeDemoTree(),
  convert: convertToLCRS,
  inorder: lcRsInorder,
};
