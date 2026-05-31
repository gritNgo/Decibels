# Decibels ── Real-World E-Commerce Engineering Transformation

[![Frontend Deployment](https://github.com/gritNgo/Decibels/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/gritNgo/Decibels/actions)
[![API CI/CD Build](https://github.com/gritNgo/Decibels/actions/workflows/api-ci-cd.yml/badge.svg)](https://github.com/gritNgo/Decibels/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Decibels is a production-grade musical instruments e-commerce platform that serves as an architectural case study in migrating a legacy enterprise monolith into a modern, decoupled cloud-native ecosystem.

Originally built as a .NET Core MVC monolith, this project outlines a targeted **Shadow Sprint** execution—decoupling the application into a high-performance **.NET 8 Web API** backend and an optimized **React / TypeScript** single-page application frontend, running entirely containerized via Docker on Azure infrastructure.

- **Production URL:** [https://lively-pond-00d432003.7.azurestaticapps.net](https://lively-pond-00d432003.7.azurestaticapps.net)
- **Test Purchase Credential (Stripe Sandbox):** Card `4242 4242 4242 4242` | Any future expiry | Any 3-digit CVC.

---

## 🎯 Strategic Scope & Execution Discipline (Time-Box Constraints)

This repository is **not** designed to be a feature-bloated, fully-fledged e-commerce product. Instead, it is a focused, high-velocity case study in **architectural migration and cloud-native decoupling** executed within an absolute **7-day time-box**.

To hit the production deployment gate without sacrificing engineering quality, a strict scoping framework was applied to eliminate boilerplate, repetitive tasks in favor of high-risk architectural challenges:

* **What Was De-scoped:** Standard, repetitive features such as Category CRUD tables, user registration flows, password reset loops, and exhaustive test coverage across low-risk components were intentionally left out. 
* **What Was Prioritized:** Designing a stateless JWT identity system, migrating the database layer cleanly, establishing a containerized Azure orchestration topology, setting up automated federated CI/CD pipelines, and writing targeted contract tests to protect core system boundaries.

> **Engineering Principle:** In production environments, shipping velocity requires trade-offs. This project demonstrates the execution discipline required to identify, isolate, and deliver the critical path of an enterprise refactor while maintaining absolute system stability under tight business constraints.

---

## 🏛️ Architectural Evolution: Monolith to Decoupled SPA

The primary goal of this engineering phase was to eliminate tight coupling, reduce deployment friction, and establish modern boundaries without disrupting the existing relational data model.

```text
  [ Legacy .NET MVC Monolith ]
                │
                ▼ (Architectural Refactor & Decoupling)
                │
    ┌───────────┴─────────────────────────────┐
    ▼                                         ▼
[ React + TypeScript SPA ]            [ .NET 8 Web API (REST) ]
├── Mantine UI Components             ├── Clean Architecture / UoW
└── Vite Build Engine                 └── EF Core / SQL Server 2022
    │                                         │
    ▼ (CI/CD via GitHub Actions)              ▼ (CI/CD via GitHub Actions)
[ Azure Static Web Apps ]             [ Azure Container Apps (Docker) ]
                                              │
                                              ▼ (Cloud Data Tier)
                                              ├── Azure SQL Database
                                              └── Azure Blob Storage
```

### Legacy Baseline (Preserved History)

- **Backend:** ASP.NET Core MVC Monolith utilizing server-side HTML rendering.
- **Frontend UI:** Bootstrap v5 with jQuery, DataTables, and heavy inline script manipulation.
- **Hosting:** Standard Azure App Services with deployment slots.

### Modern Target State (Current Production)

- **Backend API:** Hexagonal/N-Tier .NET 8 Web API enforcing strict separation of concerns via Repository and Unit of Work patterns.
- **Frontend SPA:** React 18 with TypeScript compiled via Vite, using Mantine UI for lightweight, highly accessible UI components and custom dark-mode aesthetics.
- **Containerization:** API execution isolated inside Docker containers running Linux Alpine bases for minimal image footprinting.
- **Cloud Native Infrastructure:** Migrated hosting to **Azure Container Apps (ACA)** for container orchestration and **Azure Static Web Apps (SWA)** for optimized global SPA edge routing.

---

## 🛠️ Tech Stack & Production System Components

### 🖥️ Frontend Single-Page Application

- **Core Engine:** React 18 (TypeScript) with Vite for sub-second hot module reloading (HMR).
- **Component Framework:** Mantine UI (`@mantine/core`, `@mantine/hooks`) optimizing component load metrics.
- **State & Routing:** React Router DOM (v6 layout-outlet isolation models) alongside decoupled Context Providers (`AuthContext`, `CartContext`) handling global reactive telemetry signals.
- **Vector Mechanics:** Tabler Icons for consistent, performant visual cues.

### ⚙️ Backend Web API Services

- **Runtime Environment:** .NET 8 (ASP.NET Core Web API).
- **Identity & Protection:** ASP.NET Core Identity with role-based JWT bearer token validation models mapping granular user tiers (`Customer`, `Admin`).
- **Data Access Layer:** Entity Framework Core (Code-First) targeting SQL Server 2022 syntax profiles.
- **Seeding Logic:** Defensive database initialization guarded via conditional validation checkpoints (`!_db.Products.Any()`) to guarantee telemetry persistence over independent code recycling iterations.

### ☁️ Cloud Infrastructure & DevSecOps

- **Compute Orchestration:** Azure Container Apps (ACA) pinned to a 1-replica minimum threshold to mitigate .NET JIT compiler overhead and runtime warmup penalties.
- **Static Assets Engine:** Azure Static Web Apps (SWA) managing client distribution.
- **Relational Storage:** Azure SQL Database running independent cloud-isolated schemas.
- **Object Storage Array:** Azure Blob Storage (`stdecibelsprod`) for hot-tier persistence of product images.
- **Security & Pipeline Identity:** Federated Azure Workload Identities connecting GitHub Actions runners to Azure ARM APIs via ephemeral OIDC tokens—eliminating raw production passwords inside repository secrets.
- **Continuous Deployment Architecture:** The CI/CD pipeline enforces an automated, single-environment deployment model. Backed by strict NUnit and xUnit automated test gates that block faulty builds, this design eliminates unnecessary pre-production infrastructure overhead while guaranteeing maximum deployment velocity under a highly disciplined, time-boxed sprint.

---

## 🧪 Testing Strategy Under Constraints

Faced with extreme time compression during the decoupling sprint, a standard full-app regression suite was de-scoped in favor of disciplined execution at the system boundaries.

- **Automated Pipeline Quality Gates:** Both **NUnit** unit tests and **xUnit** integration suites are completely automated within the GitHub Actions CI/CD workflows, executing silently on every code push to block broken builds from entering the production environments.
- **Targeted Contract Testing:** Focused strictly on structural validation of core REST API boundaries using **NUnit** (with Moq and FluentAssertions) and **xUnit** integration suites utilizing **Testcontainers.MsSql** to drive live database validation.
- **Mechanics Demonstrated:** Validated API routing contracts, model validation handlers, multipart form file asset mutations, empty cart validation guards, and accurate execution of HTTP status codes, ensuring API integrations are protected against downstream frontend mutations..

---

## 💎 Core Features

- **Unified Navigation Matrix:** Responsive header containing adaptive role-based isolation utilities (hiding administrative links on mobile viewports using Mantine's responsive primitives to avoid layout squishing).
- **State-Driven E-Commerce Pipeline:** Asynchronous multi-item shopping cart processing engine syncing live items through a global react state context provider.
- **Recruiter Sandbox Bypass:** Built-in one-click authentication bypass pathways on the login view for pre-seeded Customer and Admin entities to eliminate onboarding friction for technical reviewers.
- **Secure Payment Settlement:** Fully integrated Stripe sandbox payment gateways driving structured customer checkout flows and complete EF Core record state transitions to `Approved`.
- **Blob Data Synchronization:** Multipart form-data image uploads communicating directly with Azure Blob Storage arrays via connection strings securely mapped to Azure Container App environment secrets.

---

## 📈 Engineering Transformation Log (Sprint Timeline)

> **Sprint Duration:** May 24, 2026 – May 30, 2026 (7 Days)

This project’s Git history reflects a high-velocity case study of engineering transformation. The chronological progression of the refactor highlights clear-room architectural execution:

1. **Monorepo Scaffolding & API Decoupling:** Restricted repository layout to a monorepo pattern, migrating Category, Company, Order, and Cart controllers to explicit RESTful `ControllerBase` structures.
2. **Infrastructure & Pipeline Setup:** Established optimized multi-stage production Dockerfiles, switched Azure authentication to secure service principal credentials, and isolated multi-environment configurations (`.env.production`).
3. **Stateless Authentication Engine:** Implemented a backend JWT authentication pipeline with signed cryptographic claims, removing legacy Razor identity code-behinds, and integrated a type-safe Mantine UI `LoginView`.
4. **Structured Enterprise Telemetry:** Replaced plain-text logging providers with Serilog JSON telemetry streams directed to `stdout` for cloud-native log aggregation.
5. **Frontend Core Mesh:** Initialized Vite React/TS workspace, implemented a master responsive layout via Mantine's `AppShell`, and hooked up public catalog grids with dynamic `AbortController` cleanup handling.
6. **State Synchronization & Checkout:** Wired global reactive context badges (`CartContext`) to map quantity increments, synchronized state dispatches with EF Core backend boundaries, and implemented Stripe checkout sandbox redirection loops.
7. **Idempotence & Real-Time Tooling:** Refactored `DbInitializer` to be fully idempotent with isolated demo targets protected against connection resets. Built a real-time local file binary preview window directly into the product management inventory forms.
8. **Responsive Alignment & Universal Role Access:** Developed a cross-device symmetric footer component, resolved layout typing bugs, and eliminated administrative short-circuit blocks within the `CartContext` to allow universal cart preview capabilities for all authenticated evaluation profiles.

---

## 🚀 Local Engineering Setup

### Prerequisites

- .NET 8 SDK
- Node.js (v18+)
- Docker Desktop
- SQL Server Express or SSMS

### 1. Backend API Setup

```bash
cd backend/Decibels.API
dotnet restore
# Update AppSettings with local database strings if necessary
dotnet run
2. Frontend React Setup
Bash
cd frontend
npm install
# Configure your local .env tracking file pointing to localhost API
npm run dev
3. Production Compilation Verification
Simulate production environment constraints by compiling locally before committing code to the cloud:

Bash
cd frontend
npm run build
📜 Repository Metrics & History Insight
This repository functions deliberately as a high-velocity case study of engineering transformation. The commit logging and branch topologies are structured to explicitly display clean-room refactoring paradigms, defensive code migrations, and architectural discipline under real-world timeline constraints.

Developed by Fiorenso Wattalage Fernando.
