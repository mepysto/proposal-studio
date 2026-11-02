import type { ProjectData } from "../core/schema.js";
import { PRODUCT_KINDS } from "./product-schema.js";
export function productAudit(p: ProjectData) {
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
      returnTo: "product-business-planning",
    });
  const beats =
      p.planning?.story.filter((s) =>
        PRODUCT_KINDS.includes(s.visualPlan?.kind || ""),
      ) || [],
    m = p.businessCase?.productStrategy;
  if (beats.length && !m)
    add(
      "missing-product-strategy",
      "제품 기능·반복 활용 계약이 없습니다.",
      "productStrategy",
    );
  if (!m) return issues;
  if(m.driverScreen?.objectBoxes.some(o=>o.x+o.w>1||o.y+o.h>1))add("object-box-outside-source","객체 표시가 원본 영상 범위를 벗어납니다.","product.driverScreen.objectBoxes");
  const claims = new Set(p.claims.map((c) => c.id)),
    metrics = new Set(p.businessCase!.metrics.map((m) => m.id));
  if (m.claimIds.some((id) => !claims.has(id)))
    add(
      "unknown-product-evidence",
      "기능·재사용 근거가 없습니다.",
      "product.claimIds",
    );
  for (const s of beats)
    if (m.claimIds.some((id) => !s.proofClaimIds.includes(id)))
      add(
        "unlinked-product-page",
        "제품·운영 근거와 장표를 연결하세요.",
        `story.${s.id}`,
      );
  for (const module of m.modules)
    if (module.metricIds.some((id) => !metrics.has(id)))
      add(
        "unmeasured-product-module",
        "제품 기능에 측정 지표가 없습니다.",
        `product.modules.${module.id}`,
      );
  const required = ["detected", "not-detected", "unavailable"];
  if (
    required.some((id) => !m.displayStates.some((s) => s.id === id)) ||
    new Set(m.displayStates.map((s) => s.id)).size !== 3
  )
    add(
      "incomplete-display-states",
      "감지·미검출·확인불가를 모두 구분해야 합니다.",
      "product.displayStates",
    );
  const life = m.lifecycle.map((s) => s.id);
  if (
    new Set(life).size !== life.length ||
    ["recover", "inspect", "store", "redeploy"].some((id) => !life.includes(id))
  )
    add(
      "incomplete-reuse-cycle",
      "회수·점검·보관·재설치 경로가 불완전합니다.",
      "product.lifecycle",
    );
  if (
    ["recover", "inspect", "storage"].some(
      (id) => !m.costLines.some((c) => c.id === id),
    )
  )
    add(
      "missing-repeat-cost",
      "회수·점검·보관 비용을 빠뜨릴 수 없습니다.",
      "product.costLines",
    );
  if (m.costLines.some((c) => c.amount !== null))
    add(
      "unquoted-expanded-price",
      "확장안은 견적 전 상태입니다. 확정 자료 없이 금액을 넣을 수 없습니다.",
      "product.costLines",
    );
  return issues;
}
