# BaseMod HomeMatch — Product Specification v2
## Every Vacant Lot in Michigan, Displayed as a New Home
**Version:** 2.0 — February 2026
**Author:** Bennett / BaseModHomes
**Status:** Product Definition & Architecture
---
## EXECUTIVE SUMMARY
BaseMod HomeMatch is the new construction search engine for Michigan. It takes every vacant land listing on MLS and automatically displays it as a shoppable new home — complete with zoning-verified model fit, total delivered pricing, and professional renderings. No agent opts in. No builder publishes anything. BaseModHomes, as a licensed broker with full Spark API / FlexMLS access, generates the entire catalog automatically.
**The core insight:** BaseModHomes holds a Michigan broker license and full Spark API / FlexMLS access. Every vacant land listing on MLS is already visible to us as a cooperating broker. We don't need anyone's permission to pull those listings, analyze them against our zoning database and model library, and display the results as new home options. The MLS cooperation model means seller's agents listed the land specifically so cooperating brokers would bring buyers — that's exactly what we're doing.
**What this creates:** A search engine where buyer's agents (and buyers themselves) can browse thousands of "new home" listings that didn't exist five minutes ago. Each listing shows a BaseModHomes model rendered on a specific lot, with a total delivered price, zoning verification, and a "I'm Interested" button. Every deal that converts results in a BaseModHomes construction contract worth $65K–$102K in fees.
**Why it wins:** No one else can do this. You need four things simultaneously: a broker license (MLS access), a manufacturer relationship (locked construction pricing), a zoning database (model fit verification), and a technology platform (to automate the matching at scale). BaseModHomes has all four. No modular manufacturer has a broker license and zoning engine. No brokerage has locked construction pricing and a model library. The integration is the moat.
---
## PART 1: THE PRODUCT
### 1.1 — What HomeMatch Is
HomeMatch is a search interface at basemodhomes.com where anyone can browse vacant land listings displayed as new home listings. Every viable lot in Michigan shows which BaseModHomes models fit on it, what the total delivered price is (lot + home + site work), and whether the lot qualifies for land division into multiple homes.
There is no "publish" step. There is no agent opt-in. BaseModHomes generates every listing automatically by running every active vacant land listing on MLS through the model fit calculator and zoning verification engine. The catalog updates in real-time as new lots hit MLS and old ones go under contract.
### 1.2 — Why This Works Legally and Operationally
BaseModHomes is a licensed Michigan broker. The MLS cooperation framework means:
- Seller's agents list land on MLS with a cooperating broker commission offer
- BaseModHomes, as a cooperating broker, has full access to display and market these listings to potential buyers
- When a buyer's agent brings a buyer to purchase the land, the seller pays the buyer's agent commission per MLS terms
- BaseModHomes earns its revenue on the construction contract, not the land transaction
This is not scraping. This is not unauthorized use. This is exactly how MLS is designed to work — cooperating brokers help sell each other's listings.
### 1.3 — Who Uses It
**Primary: Buyer's Agents**
They have clients who want new homes but can't find inventory. They come to HomeMatch, search their market, find dozens of new construction options they didn't know existed, and show their clients. The agent earns their buyer's commission on the land purchase plus a referral fee on the construction contract from BaseModHomes. Zero friction. Zero cost. Pure upside.
**Secondary: Buyers Directly**
Buyers searching "new homes in [city] Michigan" find HomeMatch through SEO. They browse listings that look like any other home search. When they find one they want, they click "I'm Interested" and get connected to a BaseModHomes Certified Agent or the BaseModHomes team directly.
**Tertiary: Investors**
Investors see the land division analysis — lots that can be split into 2, 3, or 4 buildable parcels with full development economics. They use HomeMatch as a deal sourcing tool for small-scale development opportunities.
### 1.4 — What Users See
Every search result looks like a home listing, not a land listing:
- **Hero image:** Rendering of the best-fit BaseModHomes model (not a photo of dirt)
- **Price:** Total delivered price — lot + home + site work (not just the lot price)
- **Headline:** "New 3BR/2BA in Wyoming, MI — $289,000" (not "0.3 Acre Vacant Lot")
- **Details:** Beds, baths, square footage, lot size, estimated completion
- **Badge:** Green (3+ models fit) / Yellow (1-2 models fit)
- **Click-through:** Full lot analysis with zoning verification, all fitting models with pricing, land division potential, market comps
---
## PART 2: USER JOURNEYS
### 2.1 — Buyer's Agent Journey
**"Sarah" — Residential agent, Grand Rapids, has 3 frustrated buyer clients losing bidding wars**
1. Sarah hears about HomeMatch at a brokerage meeting or sees a LinkedIn ad
2. She visits basemodhomes.com and searches Grand Rapids
3. She sees 47 new home options she's never seen before — lots currently for sale, each showing a BaseModHomes model with total pricing
4. She clicks on a lot in Wyoming, MI: 80' frontage, R-1 zoning, Hawthorne CrossMod fits with margins, total delivered price $289,000
5. She texts her buyer the listing link: "Check out this brand new 3BR/2BA for $289K — no bidding war"
6. The buyer loves it. Sarah represents the buyer on the land purchase. BaseModHomes handles the construction contract, factory order, site prep, and mortgage origination
7. Sarah earns 3% buyer's commission on the $45K lot ($1,350) PLUS a 3% referral fee on the $200K home from BaseModHomes ($6,000) = $7,350 total
Sarah never had to understand zoning. Never had to call a builder. Never had to explain modular construction in detail. She searched, she shared, she closed.
### 2.2 — Buyer Journey
**"Marcus & Tanya" — First-time buyers, Ypsilanti, $300K budget, losing bidding wars**
1. Marcus googles "new construction homes Ypsilanti Michigan under 300K"
2. HomeMatch appears in results (SEO-optimized)
3. He sees a grid of new home options in his price range — photos, prices, locations
4. He clicks on one: 3BR/2BA, $279,000, estimated move-in 90 days
5. He sees the floor plan, interior renderings, neighborhood info, school ratings
6. He clicks "I'm Interested" and enters his info
7. BaseModHomes connects him with a Certified Agent in the area (or handles directly)
8. Marcus and Tanya buy the lot and sign a construction contract
They never thought about "buying land." They found a home they wanted at a price they could afford.
### 2.3 — Investor Journey
**"Dave" — Small-scale investor, Metro Detroit, owns 4 rentals**
1. Dave browses HomeMatch with the "Investment Opportunities" filter enabled
2. He sees a 150' frontage lot that flags as "Land Division: 2 additional lots possible"
3. He clicks through and sees: total acquisition cost $85K, after division yields 3 lots, 3 Belmont models, total build cost $XXX,XXX, total completed value $XXX,XXX based on comps, estimated ROI XX%
4. He contacts BaseModHomes as a development partner
---
## PART 3: FEATURE SPECIFICATION — SEARCH ENGINE
### 3.1 — Search Interface
The primary experience is a search page on basemodhomes.com. Public access — no login required to browse.
**Search Methods:**
- Map-based: Interactive map of Michigan. Lots displayed as colored pins (green = 3+ models fit, yellow = 1-2 models, gray = zoning data pending)
- Location search: Address, zip code, city, county
- MLS number: Paste a listing number directly
- Filters:
  - Total delivered price range (lot + home + site work)
  - Lot price range
  - Bedrooms / bathrooms (filters by which models fit)
  - Specific model ("Show only lots where the Hawthorne fits")
  - Municipality / township / city
  - Land division potential (1 lot / 2+ lots / 3+ lots)
  - Lot size
  - Days on market
  - Investment opportunities toggle
**Data Source:** Every active vacant land listing in target municipalities from Spark API / FlexMLS. Updated daily or more frequently.
**Default display framing:** Results show as HOME listings. Lead image is a model rendering. Price is total delivered. Headline reads like a home listing. This is not a land search with builder info attached — it's a new home search.
### 3.2 — Lot Detail Page
When a user clicks on a listing:
**Section A — The Home**
- Model rendering (hero image)
- Model name, specs (beds/baths/sqft), floor plan
- Interior renderings (kitchen, living, bedrooms, bathrooms)
- Total delivered price (prominent)
- If multiple models fit: tab or card for each model with its pricing
- Estimated construction timeline
**Section B — The Location**
- Map with lot highlighted
- Neighborhood info: schools, shopping, restaurants, parks
- Commute times to major employment centers
- Satellite/aerial view of the lot
**Section C — Zoning Verification**
- Zoning district and municipality
- Dimensional requirements table:
| Requirement | Municipality Standard | This Lot | Status |
|---|---|---|---|
| Min lot width | 66 ft | 80 ft | ✅ Compliant |
| Min lot depth | 120 ft | 165 ft | ✅ Compliant |
| Front setback | 25 ft | — | Applied |
| Side setback | 5 ft each | — | Applied |
| Rear setback | 30 ft | — | Applied |
| Max coverage | 35% | — | ✅ Model compliant |
- Confidence indicator: 🟢 Verified / 🟡 AI-Parsed / 🔴 Needs Verification
- Subsection 6 / PA 58 status for this municipality
**Section D — Pricing Breakdown**
| Component | Amount |
|---|---|
| Lot (current asking price) | $45,000 |
| Home (Hawthorne CrossMod) | $XXX,XXX |
| Site Work (estimated) | $XX,XXX |
| **Total Delivered** | **$289,000** |
| Estimated Monthly Payment | $X,XXX/mo |
- Site work shown as range if precise estimate unavailable
- Comp validation: "This home is priced 12% below average new construction in this area"
- Financing CTA: "Get Pre-Approved" routes to BaseModHomes mortgage team
**Section E — Land Division (if applicable)**
- Can this lot be divided? How many resulting lots?
- For each resulting lot: which models fit?
- Full development economics: total cost, total value, margin, ROI
- Flagged as "Investment Opportunity"
**Section F — Market Comps**
- Recent new construction sales matching model specs in the area
- Price/sqft analysis, days on market, absorption rate
- Trend indicator: prices rising/flat/declining
**Section G — Action Bar**
- "I'm Interested — Connect Me With an Agent"
- "Get Pre-Approved for Financing"
- "Share This Home" (generates shareable link)
- "Download Summary" (one-page PDF)
- "Ask a Question"
### 3.3 — The Shareable Listing Link
Every lot+model combination gets a permanent URL:
`basemodhomes.com/homes/[unique-id]`
This page is designed to look exactly like a Zillow or Redfin listing:
- Hero image gallery (model renderings + floor plan)
- Price, beds/baths/sqft in standard format
- Listing description (auto-generated, MLS-style)
- Location map with neighborhood data
- "Contact Agent" or "I'm Interested" CTA
- Financing estimate
This is what agents text to their clients. This is what shows up in Google search results. This is what gets shared on social media. It must look and feel like a normal home listing.
### 3.4 — Disclaimers and Legal
Every listing page includes:
- "Renderings are representative of the [Model Name] by BaseModHomes. Final home appearance may vary."
- "Zoning information provided as reference. Verify with local municipality before purchase."
- "Total delivered price is estimated. Final pricing confirmed after site evaluation by BaseModHomes."
- "Lot listing data provided via MLS. Contact listing agent for current availability."
- Fair housing notice
---
## PART 4: THE CERTIFICATION PROGRAM
### 4.1 — BaseMod Certified Agent
This is not a software feature — it's a marketing and enablement program that creates an educated sales force for BaseModHomes without putting anyone on payroll.
**What it is:** A free, 30-minute online training that teaches buyer's agents how modular home purchases work. Agents who complete it get:
- "BaseMod Certified Agent" badge for their marketing materials
- Listed in the "Find a Certified Agent" directory on basemodhomes.com
- Priority routing when buyers click "I'm Interested" in their market area
- Direct line to BaseModHomes team for deal support
- Access to BaseModHomes marketing materials (social templates, email templates, listing presentations)
**Training covers:**
- How modular construction works (factory-built, not "manufactured/trailer")
- The buyer timeline: land purchase → construction contract → factory build → delivery → set → finish → move-in
- Financing: construction-to-permanent loans, how BaseModHomes' mortgage team supports the buyer
- The agent's role vs. BaseModHomes' role (agent handles land purchase, BMH handles everything construction)
- Common buyer objections and how to address them
- Using HomeMatch to find and share listings
**Why agents do it:**
- Free certification that differentiates them from every other agent in their market
- Gets them priority access to deals in their area
- Makes them the expert on new construction in their office
- Takes 30 minutes and immediately expands their sellable inventory
### 4.2 — Agent Directory
basemodhomes.com/agents — a searchable directory of Certified Agents by market area. When buyers click "I'm Interested" on a listing, they get matched to a Certified Agent in that area. If no Certified Agent exists for that area, the lead goes to the BaseModHomes team.
This creates a network effect: the more deals that close through Certified Agents, the more agents want the certification, the more coverage HomeMatch has, the more buyers convert.
---
## PART 5: THE ZONING ENGINE
### 5.1 — Core Function
The zoning engine takes a parcel address, looks up the applicable zoning district and dimensional requirements, and determines which BaseModHomes models physically fit on the lot within setback constraints.
This is the Municipal Intelligence Engine (Pillar 1 from the master strategy) productized as a real-time API.
### 5.2 — Data Requirements Per Municipality
1. Zoning district map — which district applies to which parcels
2. Dimensional requirements per district (structured table):
   - Minimum lot width, depth, area
   - Front, side, rear setbacks
   - Maximum lot coverage, building height
   - Maximum dwelling units per lot
3. Subsection 6 / PA 58 adoption status and parameters
4. Special overlay districts (floodplain, historic, PUD)
### 5.3 — Model Fit Calculation
```
1. Get parcel dimensions from Regrid (frontage, depth, area)
2. Get zoning requirements for parcel's district
3. Calculate buildable envelope:
   - Width = Frontage - (side setback × 2)
   - Depth = Lot depth - front setback - rear setback
4. For each BaseModHomes model:
   - Does model width fit within buildable width? (2ft clearance buffer)
   - Does model depth fit within buildable depth?
   - Does footprint stay within max lot coverage?
   - Does height comply with max height?
5. Output: models that fit (green), almost fit (yellow), don't fit (red with reason)
```
### 5.4 — Land Division Calculator
```
1. Get total parcel frontage
2. Get minimum lot width for zoning district
3. Max possible lots = floor(Total Frontage ÷ Min Lot Width)
4. Check each resulting lot meets minimum area
5. Deduct frontage for access easement if interior lots needed
6. For each resulting lot: run model fit calculation
7. Output: lot count, dimensions, model assignments, development economics
```
### 5.5 — Confidence Framework
- 🟢 **Verified:** Manually confirmed by BaseModHomes team or legal, within 90 days
- 🟡 **AI-Parsed:** Extracted by AI from ordinance documents, passed quality checks, not manually verified
- 🔴 **Incomplete:** Data partially available, manual verification recommended
- ⬜ **Not Available:** Municipality not in database yet
### 5.6 — Coverage Rollout
**Phase 1 (Launch):** 15-20 municipalities — BaseModHomes active markets plus highest vacant land listing volume
**Phase 2 (Month 2-3):** Top 100 municipalities by listing volume across SE Michigan, West Michigan, Greater Lansing
**Phase 3 (Month 4-6):** Full Michigan coverage
**Demand-driven prioritization:** Log every search in a municipality where zoning data isn't available. Prioritize additions based on search volume. The users tell you where to expand.
---
## PART 6: PRICING ENGINE
### 6.1 — Total Delivered Price
```
TOTAL = Lot Price + Home Price + Site Work Estimate
```
- **Lot Price:** From MLS listing (asking price, negotiable)
- **Home Price:** Fixed per model from BaseModHomes cost library. LOCKED. Not estimated. Includes factory construction, transport, set, stitch, and BaseModHomes fee stack.
- **Site Work Estimate:** Variable. Foundation, utilities, driveway, grading, permits, engineering. Displayed as range until site evaluation:
  - Standard lot (flat, utilities at street): $XX,XXX
  - Moderate site prep: $XX,XXX
  - Complex site: $XX,XXX
### 6.2 — Comp Validation
Each listing shows new construction comps to validate pricing:
- Recent sales matching model specs within defined radius
- Price/sqft comparison
- "This home is priced X% below/at/above average new construction in this area"
- This is a sales tool — modular's cost advantage becomes visible
### 6.3 — Financing
- Estimated monthly payment displayed prominently
- Default: 30-year fixed, 20% down, current market rate
- Adjustable by user
- "Get Pre-Approved" routes to BaseModHomes mortgage brokerage
---
## PART 7: BUSINESS MODEL
### 7.1 — Revenue
HomeMatch is free. No subscriptions. No per-listing fees. Revenue comes from construction contracts:
| Revenue Stream | Per Home |
|---|---|
| Dealer / Brokerage Fee (10-15%) | $XX,XXX |
| Construction Management Fee (5%) | $XX,XXX |
| Mortgage Origination | $X,XXX–$XX,XXX |
| **Total Fee Stack** | **$65,000–$102,000** |
Platform operating cost is essentially fixed (hosting, data feeds, team time). Every deal that converts drops almost entirely to margin.
### 7.2 — Agent Economics (Their Incentive)
- 3% buyer's agent commission on land purchase (paid by seller per MLS cooperation) — typically $1,000–$3,000
- 3% referral fee on home construction from BaseModHomes (paid at bank funding) — typically $5,000–$8,000
- **Total agent earning: $6,000–$11,000 per deal**
- Comparable to commission on selling an existing home at the same price point
- But with NO bidding wars, NO competing offers, NO inspection issues, NO negotiation stress
### 7.3 — Conversion Funnel (Year 1)
| Stage | Year 1 Target |
|---|---|
| Monthly site visitors | 5,000–15,000 |
| Lot detail page views/month | 1,000–3,000 |
| "I'm Interested" inquiries/month | 50–150 |
| Qualified consultations/month | 20–50 |
| Deals closed/month | 2–5 |
| Annual revenue | $1.5M–$6.1M |
Even 2 deals/month × $65K = $1.56M annual fee stack revenue from a free platform.
---
## PART 8: THE THREE-TAB ARCHITECTURE
HomeMatch is Tab 1 of a three-tab platform sharing the same data layer.
### Tab 1 — HomeMatch (Public)
Everything described above. Every active vacant land listing displayed as a new home. Public access. Buyer's agents and buyers browse freely.
### Tab 2 — Buyer Browse (Public)
A curated subset. Instead of raw lot-to-model matches, this shows the highest-confidence, most attractive listings in a Zillow-style grid. Think of Tab 1 as the search engine and Tab 2 as the "featured homes" showcase. Lower barrier to entry for casual buyers.
### Tab 3 — Acquisition Intelligence (Internal Only)
The strategic weapon. Same engine, but pointed at expired and withdrawn listings from the last 3 years. Scored for acquisition opportunity based on seller motivation, lot viability, margin potential, and market strength. BaseModHomes admin access only. This is the proprietary deal sourcing tool.
**Shared infrastructure across all tabs:**
- Spark API listing data (active for Tab 1-2, historical for Tab 3)
- Regrid parcel data
- Zoning database and model fit calculator
- Comp engine
- Map rendering
**Build sequence:** Tab 3 first (immediate internal value, battle-tests the zoning engine), Tab 1 second (public HomeMatch launch), Tab 2 last (only useful once Tab 1 generates enough attractive listings).
---
## PART 9: DATA INTELLIGENCE & FLYWHEEL
### 9.1 — What Usage Data Reveals
| User Action | Intelligence Generated |
|---|---|
| Searches in a zip code | Demand signal: buyers want inventory here |
| Views a specific lot | Lot viability signal: real interest exists |
| Shares a listing link | Active intent: agent thinks this is sellable |
| Clicks "I'm Interested" | Qualified demand: buyer wants this price/location |
| Deal closes | Validated: this market, price, model works |
### 9.2 — How Intelligence Feeds Strategy
- **Land acquisition:** If a lot gets 50 page views in a week, consider acquiring it directly (Model B from earlier discussion)
- **Model development:** If 70% of matches are Hawthorne and 5% are Aspen, that's product demand data
- **Pricing:** If buyer inquiries cluster under $300K, optimize land acquisition for lots where total delivered price hits that range
- **Municipality prioritization:** Search volume in uncovered municipalities tells you where to build zoning data next
- **Competitive intelligence:** Track which agents are most active — they're your best Certification candidates
### 9.3 — The Compounding Advantage
Every dimension improves with scale:
- More zoning data → more municipalities covered → more listings → more traffic
- More traffic → more demand signals → smarter land acquisition → more inventory
- More deals closed → more actual cost data → more accurate pricing → more buyer trust
- More Certified Agents → more market coverage → more deals → more agents want certification
A competitor starting in Year 2 faces: no zoning database, no agent network, no demand data, no comp history. They can buy the same tools, but they can't buy the compounded intelligence.
---
## PART 10: GO-TO-MARKET
### 10.1 — Launch Sequence
**Pre-Launch (Month 1-2):**
- Build zoning database for 15-20 priority municipalities
- Build model fit calculator and pricing engine on existing dashboard.basemodhomes.com/search infrastructure
- Create certification training module (can be simple video + quiz)
- Identify 10-15 champion agents for beta feedback
- Photograph/render first delivered homes (Feb 2026 deliveries)
**Soft Launch (Month 3):**
- Open basemodhomes.com/homes to public
- Champion agents testing and providing feedback
- First certification cohort (10-15 agents)
- Goal: 100 site visitors/day, first "I'm Interested" inquiries
**Growth (Month 4-8):**
- MLS board presentations (West MI, SE MI, Lansing)
- Brokerage lunch-and-learns at KW, RE/MAX, Century 21 offices
- SEO: neighborhood-specific pages for every covered municipality
- LinkedIn/Facebook ads targeting MI licensed agents
- Agent success story content as deals close
- Expand to 50+ municipalities based on demand data
**Scale (Month 9-12):**
- Statewide Michigan coverage
- Michigan Association of REALTORS partnership discussions
- IL and FL expansion planning (same platform, different data feeds)
### 10.2 — The "Aha Moment"
An agent searches their own market, sees lots they've driven past for months, and realizes "wait — these are $280K homes that nobody is selling yet?" The entire onboarding experience should deliver this moment within 60 seconds of first visit. No login. No signup. Just search and see.
### 10.3 — SEO as Distribution
Every lot+model combination generates a unique, indexable page:
- "New 3BR Home in Wyoming MI $289,000"
- "New Construction Ypsilanti Township Under $300K"
- "Brand New Home Grand Haven Michigan"
This creates thousands of long-tail SEO pages targeting exactly the searches buyers make. HomeMatch becomes the answer to "new homes in [Michigan city]" for every covered market.
---
## PART 11: INTEGRATION WITH MASTER STRATEGY
| Master Strategy Pillar | How HomeMatch Accelerates It |
|---|---|
| Municipal Intelligence | HomeMatch REQUIRES the zoning database. Building it IS building Pillar 1. |
| Land Acquisition Pipeline | User demand data shows exactly where to acquire. Some high-demand lots should be acquired directly. |
| Test Fit & Proforma | The model fit calculator and pricing engine ARE the test fit and proforma engine, consumer-facing. |
| Deal Flow | HomeMatch IS a deal flow channel. Every "I'm Interested" is a qualified lead. |
| Incentive Automation | Future: "This home qualifies for $10,000 MSHDA down payment assistance" |
| Digital Marketing | HomeMatch IS the marketing strategy. Thousands of SEO pages. Every agent sharing links = distribution. |
| Multi-State Replication | Same platform, different MLS feeds and zoning data. IL and FL expansion is a data swap, not a rebuild. |
---
## PART 12: MVP — WHAT TO BUILD FIRST
### 12.1 — MVP Scope
The smallest version an agent would actually use:
**Include:**
- Public search on basemodhomes.com (no login required)
- Vacant land search in 15-20 priority municipalities
- Lot detail with Regrid parcel dimensions
- Zoning verification (dimensional requirements table)
- Model fit results (which models fit, with visual badge)
- Total delivered price (lot + home + site work estimate)
- Shareable listing page per lot+model combination
- "I'm Interested" lead capture
- Basic analytics (page views, inquiries)
**Exclude (build later):**
- Certification program (launch after first deals close)
- Investor view / land division calculator
- Interactive lot diagram with setback visualization
- Comp data integration on listing pages
- Buyer browse tab (Tab 2)
- Advanced filtering
- Agent directory
### 12.2 — Build Estimate
| Component | Effort | Notes |
|---|---|---|
| Zoning database (15 municipalities) | 2-3 weeks | NLP parsing + manual verification |
| Model fit calculator | 1 week | Geometry logic against model library |
| Pricing engine | 1 week | Uses locked BaseModHomes costs |
| Listing page generator | 2 weeks | Template + model renderings |
| Search UI enhancements | 1-2 weeks | Extend existing /search |
| Lead capture + routing | 1 week | Form + email/CRM integration |
| Testing + refinement | 1-2 weeks | Champion agent feedback |
| **Total MVP** | **~8-12 weeks** | **Builds on existing dashboard** |
### 12.3 — Critical Path: Model Data and Renderings
**Model dimensions** (width × depth × height) for all 7 models — REQUIRED. The model fit calculator cannot function without precise footprints.
**Model renderings and photos:**
- 2-3 exterior renderings per model
- 6-8 interior photos/renderings per model
- 1 floor plan per model
- First delivered homes (Feb 2026) provide real photography opportunity
---
## PART 13: RISK FACTORS
| Risk | Severity | Mitigation |
|---|---|---|
| Zoning data inaccuracy | HIGH | Confidence scoring. Disclaimers. Manual verification for deals approaching contract. |
| Agent adoption | MEDIUM | No adoption needed. Platform works without agents. Agents come because it has value, not because we recruited them. |
| "Modular = trailer" stigma | MEDIUM | High-quality renderings. Model home tours. CrossMod homes are visually indistinguishable from site-built. |
| Site work estimate inaccuracy | MEDIUM | Show as range. Caveat that final pricing requires site evaluation. Refine with actual project data over time. |
| Competitor replication | LOW | Requires broker license + manufacturer relationship + zoning database + platform. Multi-year head start. |
| MLS/REALTOR pushback | LOW | We're using MLS exactly as designed. Agents benefit directly. |
---
## PART 14: SUCCESS METRICS
### North Star: Homes sold per month through HomeMatch inquiries
| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Monthly site visitors | 1,000 | 5,000 | 15,000 |
| Lot detail views/month | 200 | 1,000 | 3,000 |
| "I'm Interested" inquiries/month | 10 | 50 | 150 |
| Certified Agents | 15 | 75 | 250 |
| Deals closed/month | 1 | 3 | 5+ |
| Municipalities covered | 20 | 75 | 200+ |
---
## PART 15: COMPETITIVE LANDSCAPE
Nobody else combines MLS vacant land listings + parcel-level zoning verification + specific manufacturer model matching + locked total pricing + auto-generated listing pages at scale.
- **Zillow/Redfin New Construction:** Lists homes already being built. Does not match lots to homes.
- **Builder websites (Clayton, etc.):** Catalogs. No MLS integration, no zoning verification.
- **Land.com/LandWatch:** Lists land. Zero buildability analysis.
- **Buildable.com:** Closest concept but generic, nationwide, not integrated with a specific manufacturer's locked pricing.
The integration is the product. The broker license + manufacturer relationship + zoning engine + platform = an advantage no single competitor type can replicate.
---
*This specification supersedes v1.0. The core change: BaseModHomes generates all listings automatically as a licensed broker. No agent opt-in required. No virtual listing builder workflow. The platform IS the catalog.*
