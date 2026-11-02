/** Provider-neutral contracts. No external API is called by the offline MVP. */
export interface ModelResult<T> {
  data: T;
  provider: string;
  model: string;
  version: string;
  usedExternalAPI: boolean;
  timestamp: string;
}
export interface LanguageProvider {
  complete<T>(
    role: string,
    input: unknown,
    schema: unknown,
  ): Promise<ModelResult<T>>;
}
export interface ResearchProvider {
  search(
    query: string,
  ): Promise<
    { title: string; url: string; excerpt: string; retrievedAt: string }[]
  >;
}
export interface ImageProvider {
  generate(
    brief: unknown,
  ): Promise<{ path: string; model: string; generatedAt: string }>;
}
export const agentRoles = [
  "Research Analyst",
  "Business Strategist",
  "Technical Architect",
  "Proposal Story Director",
  "Visual Art Director",
  "Critical Reviewer",
] as const;
