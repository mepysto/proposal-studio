import type { ProjectData } from "../core/schema.js";
import { DECISION_VISUAL_KINDS } from "./delivery-schema.js";
export function deliveryAudit(p: ProjectData) {
  const issues: {
    severity: "error";
    code: string;
    message: string;
    path: string;
    returnTo: string;
  }[] = [];
  const add = (code: string, message: string, path: string) =>
    issues.push({
      severity: "error",
      code,
      message,
      path,
      returnTo: "delivery-planning",
    });
  const beats =
    p.planning?.story.filter((s) =>
      DECISION_VISUAL_KINDS.includes(s.visualPlan?.kind || ""),
    ) || [];
  const a = p.businessCase?.deliveryAssurance;
  if (beats.length && !a)
    add(
      "missing-delivery-assurance",
      "의사결정 장표의 실행 조건이 없습니다.",
      "businessCase.deliveryAssurance",
    );
  if (!a) return issues;
  const claims = new Set(p.claims.map((c) => c.id)),
    actors = new Set(a.actors.map((x) => x.id));
  if (actors.size !== a.actors.length)
    add(
      "duplicate-delivery-actor",
      "실행 주체 ID가 중복됩니다.",
      "delivery.actors",
    );
  if (a.claimIds.some((id) => !claims.has(id)))
    add(
      "unknown-delivery-evidence",
      "실행 조건의 근거 주장이 없습니다.",
      "delivery.claimIds",
    );
  for (const s of beats)
    if (a.claimIds.some((id) => !s.proofClaimIds.includes(id)))
      add(
        "unlinked-delivery-evidence",
        "실행 조건을 장표 근거와 연결하세요.",
        `story.${s.id}`,
      );
  const timeline = beats.find(
    (s) => s.visualPlan?.kind === "assured-timeline",
  )?.visualPlan;
  if (timeline) {
    const ids = a.stageGates.map((g) => g.nodeId);
    if (
      new Set(ids).size !== ids.length ||
      ids.some((id) => !timeline.nodes.some((n) => n.id === id)) ||
      timeline.nodes.some((n) => !ids.includes(n.id))
    )
      add(
        "unlinked-stage-gate",
        "단계별 산출물이 일정의 실제 단계와 일치하지 않습니다.",
        "delivery.stageGates",
      );
    if (!timeline.schedule)
      add(
        "missing-delivery-schedule",
        "기간에 연결된 일정이 필요합니다.",
        "delivery.stageGates",
      );
  }
  for (const r of a.responsibilityRows)
    if (
      !actors.has(r.ownerId) ||
      r.contributorIds.some((id) => !actors.has(id))
    )
      add(
        "unknown-responsibility-actor",
        "역할표에 없는 주체가 참조됩니다.",
        "delivery.responsibilityRows",
      );
  for (const f of a.fallbacks)
    if (!actors.has(f.ownerId))
      add(
        "unknown-fallback-owner",
        "장애 대응 담당자가 없습니다.",
        `delivery.fallbacks.${f.id}`,
      );
  return issues;
}
