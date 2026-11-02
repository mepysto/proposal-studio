import { z } from "zod";
export const GeographicAsset = z.object({
  id: z.string(),
  path: z.string(),
  projection: z.literal("EPSG:3857"),
  bounds: z.object({
    west: z.number(),
    south: z.number(),
    east: z.number(),
    north: z.number(),
  }),
  width: z.number().positive(),
  height: z.number().positive(),
  attribution: z.string().min(8),
  sourceClaimIds: z.array(z.string()).min(1),
  dataSha256: z.string(),
  disclosure: z.string(),
});
export const MapMarker = z.object({
  id: z.string(),
  label: z.string(),
  lon: z.number().min(-180).max(180),
  lat: z.number().min(-85).max(85),
  precision: z.enum(["locality-reference", "reference-poi", "surveyed-site"]),
  basis: z.string().min(8),
  sourceClaimIds: z.array(z.string()).min(1),
});
export const QuantitativeDataset = z.object({
  id: z.string(),
  title: z.string(),
  population: z.string().min(8),
  unit: z.string(),
  status: z.enum([
    "reported-observation",
    "planning-assumption",
    "derived-assumption",
  ]),
  period: z.string(),
  sourceClaimIds: z.array(z.string()).min(1),
  limitation: z.string().min(10),
  rows: z
    .array(
      z.object({
        category: z.string(),
        series: z.string(),
        value: z.number().finite(),
      }),
    )
    .min(2),
  disjointSeries: z.boolean(),
});
export const CausalChain = z.object({
  id: z.string(),
  cause: z.string().min(4),
  intervention: z.string().min(4),
  response: z.string().min(4),
  result: z.string().min(4),
  mechanismIds: z.array(z.string()).min(1),
  interventionIds: z.array(z.string()).default([]),
  alternativeIds: z.array(z.string()).default([]),
  metricIds: z.array(z.string()).min(1),
  evidenceIds: z.array(z.string()).min(1),
  resultStatus: z.literal("hypothesis"),
});
