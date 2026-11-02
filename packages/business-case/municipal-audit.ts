import type { ProjectData } from "../core/schema.js";
import { MUNICIPAL_KINDS } from "./municipal-schema.js";
export function municipalAudit(p: ProjectData) {
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
      returnTo: "municipal-planning",
    });
  const beats =
    p.planning?.story.filter((s) =>
      (MUNICIPAL_KINDS as readonly string[]).includes(s.visualPlan?.kind || ""),
    ) || [];
  const m = p.businessCase?.municipalCase;
  if (beats.length && !m)
    add(
      "missing-municipal-case",
      "천안시 도입 판단을 위한 사업안이 필요합니다.",
      "municipalCase",
    );
  if (!m) return issues;
  const claims = new Set(p.claims.map((c) => c.id)),
    metrics = new Set(p.businessCase!.metrics.map((m) => m.id));
  if (m.claimIds.some((id) => !claims.has(id)))
    add(
      "unknown-municipal-evidence",
      "사업 근거가 없습니다.",
      "municipalCase.claimIds",
    );
  for (const r of [...m.benefits, ...m.evaluation])
    if (r.metricIds.some((id) => !metrics.has(id)))
      add(
        "unknown-municipal-metric",
        "기대효과의 측정 지표가 없습니다.",
        "municipalCase.metrics",
      );
  const schedule = p.planning?.story.find(
    (s) => s.visualPlan?.kind === "assured-timeline",
  )?.visualPlan?.schedule;
  if (schedule && m.pilot.totalMonths !== schedule.slots)
    add(
      "divergent-pilot-duration",
      "실증 기간과 일정표가 일치하지 않습니다.",
      "municipalCase.pilot.totalMonths",
    );
  if (
    m.pilot.price !== null &&
    p.businessCase?.productStrategy?.budgetRevision.status ===
      "new-total-not-quoted"
  )
    add(
      "unquoted-municipal-price",
      "견적 전 사업비는 미확정이어야 합니다.",
      "municipalCase.pilot.price",
    );
  return issues;
}
