# HomeMatch Build — Session Roadmap & Deployment Guide

## FULL BUILD ROADMAP (5 Sessions Total)
| Session | Deliverables | Tool | Duration |
|---|---|---|---|
| **Session 1** | Architecture doc + Tab 3 prototype w/ mock data | Cowork | ~45-60 min |
| **Session 2** | Connect Tab 3 to live Spark API + Regrid data. Build model fit calculator + zoning engine. | Claude Code → Cowork | ~45 min |
| **Session 3** | Tab 1 — HomeMatch public search. Listing page generator. Map view. | Cowork + Code | ~60 min |
| **Session 4** | Tab 1 refinement. Shareable listing pages (SEO-indexable). Lead capture. | Code → Cowork | ~45 min |
| **Session 5** | Tab 2 — Buyer Browse curation. Analytics dashboard. Polish pass. | Cowork | ~30 min |

### Why This Sequence:
- **Tab 3 first:** Immediate internal value. Battle-tests every engine component. Zero public exposure risk.
- **Tab 1 second:** The public-facing product. All shared components proven from Tab 3.
- **Tab 2 last:** A curated view on top of Tab 1. Simplest build because all components exist.

## KEY ARCHITECTURE DECISIONS
1. **Data refresh cadence** — Spark API listing data sync frequency
2. **Model fit pre-calculation** — Batch pre-calc with results cached in `model_fits` table
3. **Zoning data entry** — NLP parsing → human verification workflow (manual + AI hybrid)
4. **Auth for Tab 3** — Internal-only access enforcement
5. **Shareable listing URLs** — Permanent, clean URLs for SEO: `basemodhomes.com/homes/[listing-id]`

## AFTER SESSION 1: REVIEW CHECKLIST
- [ ] Database schema covers every data point from Product Spec v2
- [ ] Model dimensions in model library match reality
- [ ] Municipality list for Phase 1 launch is correct (15-20)
- [ ] API routes cover every user action
- [ ] Component tree is complete
- [ ] Design system colors match BaseModHomes brand
- [ ] Tab 3 prototype mock data is realistic and useful
