/**
 * Extracts parameters from prompt content using {{parameter}} syntax
 */
export function extractParametersFromContent(content: string): string[] {
  const paramRegex = /{{([^{}]+)}}/g;
  const matches = Array.from(content.matchAll(paramRegex));
  const parameters = new Set<string>();

  for (const match of matches) {
    if (match[1]) {
      parameters.add(match[1].trim());
    }
  }

  return Array.from(parameters);
}
