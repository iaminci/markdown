import type { Root, Code } from "mdast";

/**
 * Remark plugin: Ensure fenced code blocks without a language get lang="text"
 * so they render as block code (not inline) in react-markdown.
 * Single-line fenced blocks like ```\nchmod 400 k8s.pem\n``` otherwise
 * get no language class and no newline, causing incorrect inline rendering.
 */
export function remarkCodeBlockLang() {
  return (tree: Root) => {
    for (const node of tree.children) {
      if (node.type === "code") {
        const code = node as Code;
        if (!code.lang || code.lang === "") {
          code.lang = "text";
        }
      }
    }
  };
}
