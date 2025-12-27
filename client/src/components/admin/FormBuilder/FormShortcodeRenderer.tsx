import { useMemo } from "react";
import FormComponentRenderer from "./FormComponentRenderer";

interface FormShortcodeRendererProps {
  formName: string;
  theme?: "default" | "compact" | "minimal";
  layout?: "default" | "single-column" | "multi-column";
  className?: string;
}

/**
 * Component to render forms from shortcode
 * Usage: [form:buyer_form] or [form:buyer_form:theme=compact:layout=single-column]
 */
export default function FormShortcodeRenderer({
  formName,
  theme = "default",
  layout = "default",
  className = "",
}: FormShortcodeRendererProps) {
  return (
    <FormComponentRenderer
      formName={formName}
      theme={theme}
      layout={layout}
      className={className}
    />
  );
}

/**
 * Parse shortcode string and extract parameters
 * Example: [form:buyer_form:theme=compact:layout=single-column]
 */
export function parseFormShortcode(shortcode: string): {
  formName: string;
  theme?: "default" | "compact" | "minimal";
  layout?: "default" | "single-column" | "multi-column";
} | null {
  const match = shortcode.match(/\[form:([^:\]]+)(?::([^\]]+))?\]/);
  if (!match) return null;

  const formName = match[1];
  const params = match[2] || "";

  const result: {
    formName: string;
    theme?: "default" | "compact" | "minimal";
    layout?: "default" | "single-column" | "multi-column";
  } = { formName };

  // Parse parameters
  const paramPairs = params.split(":");
  for (const pair of paramPairs) {
    const [key, value] = pair.split("=");
    if (key === "theme" && ["default", "compact", "minimal"].includes(value)) {
      result.theme = value as "default" | "compact" | "minimal";
    }
    if (key === "layout" && ["default", "single-column", "multi-column"].includes(value)) {
      result.layout = value as "default" | "single-column" | "multi-column";
    }
  }

  return result;
}

/**
 * Replace shortcodes in HTML/text content with FormComponentRenderer
 */
export function renderShortcodesInContent(content: string): React.ReactNode[] {
  const shortcodeRegex = /\[form:([^:\]]+)(?::([^\]]+))?\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    // Add text before shortcode
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Parse and render shortcode
    const parsed = parseFormShortcode(match[0]);
    if (parsed) {
      parts.push(
        <FormShortcodeRenderer
          key={match.index}
          formName={parsed.formName}
          theme={parsed.theme}
          layout={parsed.layout}
        />
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts;
}


