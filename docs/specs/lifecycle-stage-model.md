# Feature Spec — Lifecycle Stage Model

## Purpose

Lifecycle Stage Model tracks the investment journey of a client from exploration to asset ownership.

---

## Lifecycle Stages

The default lifecycle stages include:

1. exploring
2. site_visit
3. reservation
4. deposit
5. spa_signing
6. payment

---

## Lifecycle Tracking

Each lifecycle record links:

client_profile_id  
project_id  
stage

---

## Timeline Visualization

Clients should see a clear timeline of their investment progress.

Example timeline:

Exploring  
↓  
Site Visit  
↓  
Reservation  
↓  
Deposit  
↓  
SPA Signing  
↓  
Payment

---

## Advisor Interaction

Advisors can update lifecycle stages based on real world progress.

---

## Data Storage

Lifecycle information is stored in:

client_project_lifecycle

Related tables:

payment_schedule  
payment_tracking
