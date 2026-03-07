# Feature Spec — Opportunity Board Intelligence UX

## Purpose

Opportunity Board is the primary discovery interface of the platform.

Unlike traditional property listing grids, Opportunity Board presents **curated investment opportunities based on client profiles and intelligence scoring**.

The interface must emphasize:

- compatibility insights
- investment intelligence
- advisory context

---

# Core Concept

The Opportunity Board displays projects as **investment opportunity cards**.

Each card represents an asset evaluated by the system.

Project Intelligence
↓
Matching Engine
↓
Opportunity Card

---

# Opportunity Card Structure

Each card must contain the following elements.

## Project Identity

Basic information:

- project name
- developer
- location
- price range

---

## Fit Score

Displays compatibility between the project and the client.

Example:

Fit Score: 82%

Score should be visualized using a gauge or progress indicator.

---

## Investment Grade

Displays the investment quality of the project.

Example:

Investment Grade: A

Grades:

A — strong investment opportunity  
B — moderate opportunity  
C — speculative opportunity  
D — high risk

---

## Key Strengths

Short bullet points explaining the project's advantages.

Example:

- infrastructure growth area
- strong rental demand
- undervalued entry price

---

## Risk Indicators

Highlight potential risks.

Examples:

- high nearby supply
- early construction phase

Risk information must remain transparent.

---

# Interaction Model

Users can interact with opportunity cards.

Available actions:

Add to Workspace  
View Analysis  
Compare Project

---

# Add to Workspace

Users can add projects to the Decision Workspace.

Once added, the project becomes part of the decision analysis workflow.

---

# View Analysis

Opens the project analysis page.

This page includes:

- investment thesis
- project intelligence data
- matching score breakdown

---

# Compare Project

Allows users to select projects for side-by-side comparison.

Maximum comparison limit:

3 projects.

---

# UX Layout

Opportunity Board should use a **card grid layout** optimized for decision scanning.

Cards must prioritize:

- score visibility
- investment insight
- risk transparency

Avoid dense text.

---

# Design Principle

The Opportunity Board must always feel like an **investment intelligence dashboard**, not a property catalog.

Projects must appear as curated opportunities rather than listings.

---

# Integration

Opportunity Board integrates with the following modules:

Client Intelligence  
Matching Engine  
Project Intelligence  
Decision Workspace

---

# Success Criteria

The Opportunity Board should allow clients to:

- quickly understand which projects match their profile
- identify strong investment opportunities
- move projects into the decision workflow

The board should guide users toward **analysis and decision**, not browsing.
