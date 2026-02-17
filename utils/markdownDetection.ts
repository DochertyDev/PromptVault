/**
 * Utility to detect if content contains markdown syntax
 */

export function hasMarkdownSyntax(content: string): boolean {
  if (!content || !content.trim()) {
    return false;
  }

  // Patterns to check for markdown syntax
  const patterns = [
    /^#+\s+/m,                          // Headers: # ## ###
    /\*\*[^\*]+\*\*/,                   // Bold: **text**
    /__[^_]+__/,                        // Bold: __text__
    /\*[^\*\n]+\*/,                     // Italic: *text*
    /_[^_\n]+_/,                        // Italic: _text_
    /```[\s\S]*?```/,                   // Code blocks: triple backticks
    /`[^`]+`/,                          // Inline code: single backticks
    /\[[^\]]+\]\([^\)]+\)/,             // Links: [text](url)
    /^[\-\*]\s+/m,                      // Unordered lists: - or *
    /^[\d]+\.\s+/m,                     // Ordered lists: 1.
    /^>\s+/m,                           // Blockquotes: >
    /~~[^~]+~~/,                        // Strikethrough: ~~text~~
    /\|[^\|]+\|[^\|]*\|/m,              // Tables: pipes with content
    /^(?:\-{3,}|\*{3,}|_{3,})$/m,      // Horizontal rules
  ];

  // Check if any pattern matches
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Cache for markdown detection results to improve performance
 */
const detectionCache = new Map<string, boolean>();

export function hasMarkdownSyntaxCached(content: string): boolean {
  if (detectionCache.has(content)) {
    return detectionCache.get(content)!;
  }

  const result = hasMarkdownSyntax(content);
  detectionCache.set(content, result);

  // Limit cache size to prevent memory issues
  if (detectionCache.size > 1000) {
    const firstKey = detectionCache.keys().next().value;
    detectionCache.delete(firstKey);
  }

  return result;
}
