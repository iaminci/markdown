import type { Root, Paragraph, Code } from "mdast";

const TREE_PATTERNS = /(├──|└──|│\s|├\s|└\s)/;

/**
 * Remark plugin: Convert paragraphs that look like ASCII tree structures
 * into fenced code blocks so they render with proper monospace and line breaks.
 * Uses raw source to preserve newlines (markdown collapses them in paragraphs).
 */
export function remarkTreeStructure() {
  return (tree: Root, file?: unknown) => {
    const vfile = file as { value?: string | Uint8Array } | undefined;
    const source = typeof vfile?.value === "string" ? vfile.value : "";
    const nodes = tree.children;
    const newChildren: Root["children"] = [];
    let i = 0;

    while (i < nodes.length) {
      const node = nodes[i];

      if (node.type === "paragraph") {
        const para = node as Paragraph;
        const parsedText = getParagraphText(para);

        if (parsedText && TREE_PATTERNS.test(parsedText)) {
          const rawText = getRawSource(para, source);
          const codeNode: Code = {
            type: "code",
            lang: "text",
            value: rawText ?? parsedText,
            meta: null,
            position: para.position,
          };
          newChildren.push(codeNode);
          i++;
          continue;
        }

        // Check for consecutive paragraphs that form a tree
        const treeParagraphs: Paragraph[] = [para];
        let j = i + 1;
        while (j < nodes.length && nodes[j].type === "paragraph") {
          const nextPara = nodes[j] as Paragraph;
          const nextText = getParagraphText(nextPara);
          if (nextText && TREE_PATTERNS.test(nextText)) {
            treeParagraphs.push(nextPara);
            j++;
          } else {
            break;
          }
        }

        if (treeParagraphs.length > 1) {
          const first = treeParagraphs[0];
          const last = treeParagraphs[treeParagraphs.length - 1];
          const rawText = getRawSourceRange(first, last, source);
          const combined = rawText ?? treeParagraphs.map((p) => getParagraphText(p)).join("\n");
          const codeNode: Code = {
            type: "code",
            lang: "text",
            value: combined,
            meta: null,
            position: first.position,
          };
          newChildren.push(codeNode);
          i = j;
          continue;
        }
      }

      newChildren.push(node);
      i++;
    }

    tree.children = newChildren;
  };
}

function getParagraphText(para: Paragraph): string {
  return para.children
    .map((c) => (c.type === "text" ? (c as { value: string }).value : ""))
    .join("");
}

function getRawSource(node: { position?: { start?: { offset?: number }; end?: { offset?: number } } }, source: string): string | null {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;
  if (start != null && end != null) {
    return source.slice(start, end);
  }
  return null;
}

function getRawSourceRange(
  first: { position?: { start?: { offset?: number } } },
  last: { position?: { end?: { offset?: number } } },
  source: string
): string | null {
  const start = first.position?.start?.offset;
  const end = last.position?.end?.offset;
  if (start != null && end != null) {
    return source.slice(start, end);
  }
  return null;
}
