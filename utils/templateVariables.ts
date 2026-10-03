import type { TemplateFillValues } from '../types';

export function extractVariables(content: string): string[] {
  const names = [...content.matchAll(/\{([^{}]+)\}/g)].map(match => match[1].trim());
  return [...new Set(names.filter(Boolean))];
}

export function renderTemplate(content: string, values: TemplateFillValues): string {
  return content.replace(/\{([^{}]+)\}/g, (placeholder, key: string) => {
    const name = key.trim();
    return Object.prototype.hasOwnProperty.call(values, name)
      ? values[name]
      : placeholder;
  });
}
