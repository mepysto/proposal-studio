import type { ProjectData, SlideData } from "../core/schema.js";
import { compileStoryboard } from "../planning/index.js";
import type { Material } from "../content/index.js";
export function plan(p: ProjectData, materials: Material[]): SlideData[] {
  if (p.planning) return compileStoryboard(p);
  if (p.slides.length) return p.slides;
  const text = materials
    .filter((m) => m.role === "content")
    .map((m) => m.text)
    .join("\n");
  if (!text.trim())
    throw Error("At least one non-empty content material is required");
  const excerpt = (s: string, n: number) =>
    s.length > n ? s.slice(0, n - 1) + "…" : s;
  const clean = (s: string) =>
    s
      .replace(/[*`>#]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();
  const sections = text
    .replace(/^---[\s\S]*?---\s*/, "")
    .split(/^#{1,2}\s+/m)
    .filter((s) => s.trim())
    .slice(0, p.mode === "quick" ? 4 : 12);
  const slides: SlideData[] = [
    {
      id: "cover",
      layout: "hero",
      title: p.title,
      message: `${p.audience} 대상 제안 · ${p.proposalType}`,
      items: [],
      claimIds: [],
      footnote: "사용자 자료 기반 초안 · 외부 사실 검증 미실행",
    },
  ];
  const layouts = [
    "editorial",
    "problem-solution",
    "architecture",
    "process",
    "timeline",
  ] as const;
  sections.forEach((section, i) => {
    const [heading, ...body] = section.split("\n");
    const lines = body
      .map(clean)
      .filter((l) => l && !/^\|/.test(l) && !/^https?:/.test(l));
    const message = excerpt(lines.shift() || "원본 자료의 상세 내용 확인", 100);
    const layout = layouts[i % layouts.length];
    slides.push({
      id: `section-${i + 1}`,
      layout,
      title: excerpt(clean(heading), 48) || `제안 ${i + 1}`,
      message,
      items: lines
        .slice(0, layout === "problem-solution" ? 2 : 3)
        .map((line, j) => ({ label: `${j + 1}`, detail: excerpt(line, 32) })),
      claimIds: [],
      footnote:
        "사용자 제공 자료의 발췌 · 문맥·수치·출처는 원문 및 사용자 확인 필요",
    });
  });
  return slides;
}
