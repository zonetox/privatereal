# System Context  
Real Estate Decision Intelligence Platform

---

# 1. Purpose

This document defines the **system context and development rules** for this repository.

The goal is to ensure that all development activities remain aligned with the official system architecture defined in the `/docs` directory.

This file acts as the **System Source of Truth** for AI assistants, developers, and technical contributors.

Before implementing any feature, the system architecture documentation must be reviewed.

---

# 2. System Identity

This system is a:

**Real Estate Decision Intelligence Platform**

The platform is designed to assist clients and advisors in making informed real estate investment decisions.

The system focuses on:

- decision support
- compatibility analysis
- investment insights
- lifecycle tracking

This system is **not a property listing marketplace**.

---

# 3. What This System Is NOT

The platform must never evolve into:

- a real estate listing portal
- a property marketplace
- a property advertisement board
- a simple project catalog

Unlike traditional property platforms, this system prioritizes:

- client profile intelligence
- advisor-driven insights
- investment analysis
- decision workflow support

---

# 4. Architecture Source of Truth

The complete architecture of this system is defined in the `/docs` directory.

All implementation must follow these documents.

Architecture phases:


/docs/architecture

phase-01-system-blueprint.md
phase-02-data-architecture.md
phase-03-ux-architecture.md
phase-04-matching-engine.md
phase-05-lifecycle-management.md
phase-x-advanced-intelligence.md


Additional system governance documents:


/docs/system-principles.md
/docs/roadmap/system-gap-analysis.md
/docs/roadmap/completion-roadmap.md
/docs/audit/audit-framework.md
/docs/audit/audit-checklist.md


Appendix documentation:


/docs/appendix/glossary.md
/docs/appendix/domain-model.md


These documents collectively define the **official architecture blueprint**.

---

# 5. Core System Modules

All development must respect the modular architecture.

Core modules include:

Client Intelligence  
Project Intelligence  
Matching Engine  
Decision Workspace  
Lifecycle Management  
Advisor Intelligence

Each module has defined responsibilities and boundaries.

---

# 6. Development Principles

All contributors must follow these development principles.

### Architecture First

Features must align with the architecture documentation before implementation.

---

### Profile-Driven Experience

Project discovery must always be driven by **client profiles and compatibility scoring**.

The system must not display projects as generic listings.

---

### Insight Over Data

The platform should prioritize:

- analysis
- scoring
- insights

rather than raw data display.

---

### Advisor-Assisted Decisions

The platform is designed to support advisory workflows.

Advisors remain central to the decision-making process.

---

# 7. Implementation Rules

When implementing new features:

1. Read `/docs/architecture` before writing code.
2. Verify that the feature aligns with the defined modules.
3. Follow the development priority defined in `/docs/roadmap/completion-roadmap.md`.
4. Do not introduce functionality that contradicts the advisory-first model.

If a feature conflicts with the architecture, it must be reviewed before implementation.

---

# 8. Current Development Priority

The current implementation priority is defined in:


/docs/roadmap/completion-roadmap.md


Priority 1 modules:

- Decision Workspace
- Project Comparison
- Lifecycle Stage Model

These modules must be implemented before introducing advanced intelligence features.

---

# 9. Use of AI Assistants

AI assistants such as Antigravity or Cursor must follow these rules:

- always read `/docs/system-context.md` first
- reference architecture documents before implementing features
- avoid introducing architectural deviations
- respect module boundaries

AI must treat the `/docs` directory as the **authoritative system architecture**.

---

# 10. Architecture Governance

Any architectural changes must be reflected in the `/docs` directory before being implemented in code.

This ensures that:

- architecture remains consistent
- audits remain possible
- the system avoids uncontrolled feature drift

---

# 11. Long-Term Vision

The platform aims to evolve into a **Decision Intelligence Platform for Real Estate Investments**.

Future capabilities may include:

- advanced scoring models
- market intelligence engines
- advisor insight engines

These enhancements will be implemented through the **Advanced Intelligence phase** while maintaining the core architecture.
