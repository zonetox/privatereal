# Build Control Protocol  
Real Estate Decision Intelligence Platform

---

# 1. Purpose

This document defines the development control rules for implementing features in this repository.

The goal is to prevent:

- architectural drift
- duplicated logic
- uncontrolled feature expansion
- deviation from the advisory-first design

This protocol must be followed by all developers and AI assistants.

---

# 2. Architecture Source of Truth

All development must follow the system architecture defined in:

/docs

Specifically:

/docs/system-context.md  
/docs/system-principles.md  
/docs/architecture/*  
/docs/roadmap/*  
/docs/specs/*

Before implementing any feature, these documents must be reviewed.

---

# 3. Feature Implementation Workflow

Every feature must follow the same workflow.

Step 1 — Read architecture documentation

Step 2 — Read the feature specification in `/docs/specs`

Step 3 — Implement the feature

Step 4 — Verify that the implementation respects module boundaries

Step 5 — Test integration with existing modules

---

# 4. Module Boundaries

The platform is composed of the following modules:

Client Intelligence  
Project Intelligence  
Matching Engine  
Decision Workspace  
Lifecycle Management  
Advisor Intelligence

Each module has its own responsibility.

Code must not mix responsibilities across modules.

---

# 5. Forbidden Development Patterns

The following patterns are prohibited:

Creating a generic project listing interface.

Duplicating matching logic outside the Matching Engine.

Embedding business logic directly in UI components.

Storing inconsistent or duplicate data across modules.

---

# 6. Architecture Integrity Rules

All scoring logic must remain inside the Matching Engine.

Project intelligence data must originate from the Project Intelligence module.

Client profile logic must remain inside Client Intelligence.

Decision analysis must occur inside Decision Workspace.

Lifecycle tracking must remain inside Lifecycle Management.

---

# 7. Change Management

If a developer or AI assistant proposes a change that affects architecture:

1. Update the architecture documentation first.
2. Review the change.
3. Implement the change after approval.

Code changes must not redefine architecture implicitly.

---

# 8. AI Assistant Rules

AI assistants such as Antigravity or Cursor must follow these rules:

Always read `/docs/system-context.md` first.

Never implement features that contradict the advisory-first model.

Follow feature specifications inside `/docs/specs`.

Respect module boundaries.

If uncertain about a feature, request clarification before coding.

---

# 9. Commit Discipline

Each commit must follow a clear scope.

Recommended commit structure:

feature: implement decision workspace  
feature: add project comparison  
feature: lifecycle stage model

Large architectural changes must not be combined with feature commits.

---

# 10. Long-Term Stability

The goal of this protocol is to ensure that the system remains:

- modular
- scalable
- architecture-driven

By following this protocol, the platform can scale without accumulating technical debt.
