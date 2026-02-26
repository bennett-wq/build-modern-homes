# BaseModHomes — Notion Workspace Architecture
## Complete Setup Guide
**Created:** February 26, 2026
**Purpose:** This document defines the entire Notion workspace structure for BaseModHomes.

---
## WORKSPACE STRUCTURE (Top-Level Sidebar)
```
📁 BaseModHomes
├── 🏠 Company Hub
│   ├── Team Directory
│   ├── Entity Structure
│   ├── Investor Relations
│   └── Key Contacts
├── 🔧 HomeMatch Platform
│   ├── Product Specification
│   ├── Agent Pitch Deck
│   ├── MVP Build Tracker
│   ├── Agent Pipeline
│   ├── Municipality Coverage Tracker
│   └── Feature Roadmap
├── 🤖 AI Strategy & Operations
│   ├── Master Strategy (7 Pillars)
│   ├── Phase Tracker
│   ├── Skills Library
│   ├── MCP Connectors
│   ├── Local Model Deployment
│   └── Daily Operations Cadence
├── 🏗️ Active Projects
│   ├── Ypsilanti MI (12 acres / R-4)
│   ├── Grand Haven MI (Clark Farm / 30 lots)
│   ├── Carrabelle FL
│   └── Project Template
├── 📊 Deal Pipeline (Database)
├── 🏘️ Home Models (Database)
├── 🏛️ Municipal Intelligence (Database)
├── 📈 Marketing & Growth
├── 💰 Finance & Investors
├── ⚖️ Legal & Licensing
├── 📋 Meeting Notes
└── 📚 Resources & Reference
```

## KEY TEAM
| Role | Name | Focus Area |
|------|------|-----------|
| CEO | Bennett Washabaugh | Strategy, Operations, AI |
| COO / Construction | Joe Sugiyama | Construction Management |
| Executive Chair / Mortgage | Joe Perry | Mortgage Brokerage |
| CTO / Platform | Evan Sangaline | Technology, Dashboard |
| General Counsel | Jackson Troin | Legal, Licensing |

## ENTITY STRUCTURE
```
HoldCo (Delaware C-Corp) — owns 51% of each OpCo
├── OpCo 1: Construction Management
├── OpCo 2: Mortgage Brokerage
├── OpCo 3: Dealer / Brokerage Services
├── OpCo 4: Platform Technology
└── DevCo (separate entity)
    └── Project-specific SPVs
```

## KEY DATABASES
- **Deal Pipeline:** Lead → Screening → Analysis → Due Diligence → Under Contract → Closed
- **Home Models:** 7 models with dimensions, pricing, manufacturer data
- **Municipal Intelligence:** Zoning data per municipality with confidence scoring
- **Meeting Notes:** All meetings linked to deals and projects

*Full workspace architecture preserved in project repository for reference.*
