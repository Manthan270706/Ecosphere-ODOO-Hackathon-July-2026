# EcoSphere 🌍
### Smart ESG Intelligence for Modern Organizations

EcoSphere is a full-stack ESG management platform built for the **ODOO 2026 Hackathon**. It helps organizations measure, manage, and improve their **Environmental, Social, and Governance** performance through a unified digital workspace.

Instead of handling sustainability, CSR, compliance, and departmental accountability through disconnected spreadsheets and manual reports, EcoSphere centralizes everything into one modern web platform.

---
## Developers:
1) Manthan Sali
2) Palash Sahuji
3) Aditya Rana
4) Shreyas Patil
---
## ✨ Vision

EcoSphere transforms ESG from a reporting burden into a **living operational system**.

With EcoSphere, organizations can:

- Track emissions with real environmental calculations
- Manage CSR activities and employee participation
- Run governance processes like audits and compliance reviews
- Organize departments and categories as shared master data
- Build a reliable foundation for ESG scoring, reporting, and executive dashboards

---

## 🚀 Core Value Proposition

Traditional ESG operations are fragmented.

EcoSphere solves this by combining:

- **Environmental intelligence** for emissions and goals
- **Social engagement** for CSR participation and impact
- **Governance control** for policy, audit, and compliance management
- **Centralized data architecture** for organization-wide ESG visibility

---

## 🧩 Modules

### 1. Environmental Module
Manage sustainability operations and emission-related records.

**Key capabilities**
- Emission Factor management
- Carbon Transaction logging
- Automatic CO2 calculation
- Environmental Goal tracking
- Product ESG Profile management

**Examples**
- Log diesel fuel usage and auto-calculate CO2
- Track target vs actual emissions by department
- Attach lifecycle notes to product sustainability records

---

### 2. Social Module
Coordinate CSR programs and employee participation.

**Key capabilities**
- CSR Activity creation
- Category-based social activity classification
- Employee Participation workflow
- Evidence-based approvals
- Department-linked engagement tracking

**Examples**
- Launch a tree plantation drive
- Let employees join the initiative
- Review proof submission and approve participation

---

### 3. Governance Module
Create structure, accountability, and compliance visibility.

**Key capabilities**
- ESG Policy management
- Policy acknowledgement tracking
- Audit creation and review
- Compliance Issue management
- Ownership and due-date enforcement

**Examples**
- Publish a workplace ethics policy
- Track employee acknowledgement
- Record audit findings and create follow-up compliance issues

---

### 4. Settings Module
Provide the organizational backbone of the platform.

**Key capabilities**
- Department management
- Category management
- Shared master data for all modules
- Role-aware organizational structure

**Examples**
- Add Logistics, HR, Manufacturing, and Finance departments
- Classify categories for CSR activities and challenges

---

### 5. Dashboard, Reports, and Scoring
Convert raw ESG records into leadership-ready visibility.

**Key capabilities**
- Department-wise ESG score architecture
- Weighted scoring model
- Report-ready structured data
- Executive dashboard foundation

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    U[User Browser] --> FE[Next.js Frontend]
    FE --> MW[Auth Middleware]
    MW --> API[API Route Handlers]
    API --> PR[Prisma Client]
    PR --> DB[(PostgreSQL)]

    API --> ENV[Environmental Module]
    API --> SOC[Social Module]
    API --> GOV[Governance Module]
    API --> SET[Settings Module]

    ENV --> DB
    SOC --> DB
    GOV --> DB
    SET --> DB
```

### Architecture Notes
- **Frontend:** Next.js App Router + TypeScript + Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **Authentication:** JWT via httpOnly cookies
- **Password Hashing:** bcryptjs
- **Token Verification:** jose

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | JWT + jose |
| Security | bcryptjs |
| Runtime Tools | dotenv, tsx |
| DB Driver | pg, @prisma/adapter-pg |

---

## 🔐 Authentication Flow

```mermaid
flowchart TD
    A[User visits Signup] --> B[Submit name, email, password, department]
    B --> C[API hashes password]
    C --> D[Employee record created]
    D --> E[User visits Login]
    E --> F[API verifies password]
    F --> G[JWT signed and stored as httpOnly cookie]
    G --> H[Middleware checks token on protected routes]
    H --> I[Access granted to dashboard]
    H --> J[Token invalid or missing]
    J --> K[Redirect to login]
```

---

## 🌱 Environmental Workflow

```mermaid
flowchart TD
    A[Admin creates Emission Factor] --> B[Factor stored with CO2 value per unit]
    C[User logs Carbon Transaction] --> D[Select Department and Emission Factor]
    D --> E[Enter Quantity]
    E --> F{Auto emission calculation enabled?}
    F -->|Yes| G[CO2 = Quantity × Factor Value]
    F -->|No| H[CO2 recorded manually]
    G --> I[Transaction saved]
    H --> I
    I --> J[Environmental Goal progress evaluated]
    J --> K{Current CO2 vs Target}
    K -->|Met| L[Goal marked Completed]
    K -->|Near target| M[Goal marked On Track]
    K -->|Past deadline| N[Goal marked Missed]
```

### Environmental Data Journey
1. Create emission factors
2. Log carbon transactions
3. Automatically calculate emissions
4. Compare against environmental goals
5. Monitor progress by department

---

## 🤝 Social Workflow

```mermaid
flowchart TD
    A[Admin creates CSR Activity] --> B[Set category, department, and evidence rule]
    B --> C[Employee browses activity]
    C --> D[Employee joins activity]
    D --> E[Participation record created as Pending]
    E --> F{Evidence required?}
    F -->|Yes| G[Upload proof URL]
    F -->|No| H[Submit directly]
    G --> H
    H --> I[Manager reviews participation]
    I --> J{Decision}
    J -->|Approve| K[Points awarded and XP updated]
    J -->|Reject| L[Marked as Rejected]
```

### Social Data Journey
1. Define CSR initiative
2. Link it to department and category
3. Let employees participate
4. Collect evidence if required
5. Approve and reward meaningful engagement

---

## 🏛️ Governance Workflow

```mermaid
flowchart TD
    A[Admin publishes ESG Policy] --> B[Employees acknowledge policy]
    C[Auditor creates Audit] --> D[Audit findings recorded]
    D --> E[Audit marked Completed or Under Review]
    E --> F[Compliance Issue raised if needed]
    F --> G[Assign severity, owner, and due date]
    G --> H{Status check}
    H -->|Open and overdue| I[Flagged as Overdue]
    H -->|Resolved| J[Issue closed]
```

### Governance Data Journey
1. Publish policies
2. Track acknowledgement
3. Run audits
4. Raise compliance issues
5. Enforce ownership and deadlines

---

## 📊 ESG Scoring Workflow

```mermaid
flowchart TD
    A[Environmental Data] --> D[Environmental Score]
    B[Social Data] --> E[Social Score]
    C[Governance Data] --> F[Governance Score]

    D --> G[Apply Environmental Weight]
    E --> H[Apply Social Weight]
    F --> I[Apply Governance Weight]

    G --> J[Total ESG Score]
    H --> J
    I --> J

    J --> K[Store Department Score]
    K --> L[Display on Dashboard and Reports]
```

### Scoring Formula

The ESG scoring layer is designed around weighted scoring:

\[
\text{Total ESG Score} =
(\text{Environmental Score} \times \text{Env Weight}) +
(\text{Social Score} \times \text{Social Weight}) +
(\text{Governance Score} \times \text{Governance Weight})
\]

This allows organizations to adapt scoring logic to their operational priorities.

---

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : has
    DEPARTMENT ||--o{ ENVIRONMENTAL_GOAL : owns
    DEPARTMENT ||--o{ CARBON_TRANSACTION : logs
    DEPARTMENT ||--o{ CSR_ACTIVITY : runs
    DEPARTMENT ||--o{ AUDIT : undergoes
    DEPARTMENT ||--o{ COMPLIANCE_ISSUE : has
    DEPARTMENT ||--o{ DEPARTMENT_SCORE : scored

    EMISSION_FACTOR ||--o{ CARBON_TRANSACTION : used_in
    EMISSION_FACTOR ||--o{ PRODUCT_ESG_PROFILE : referenced_by

    CSR_ACTIVITY ||--o{ EMPLOYEE_PARTICIPATION : has
    EMPLOYEE ||--o{ EMPLOYEE_PARTICIPATION : joins

    ESG_POLICY ||--o{ POLICY_ACKNOWLEDGEMENT : acknowledged_by
    EMPLOYEE ||--o{ POLICY_ACKNOWLEDGEMENT : acknowledges

    AUDIT ||--o{ COMPLIANCE_ISSUE : may_generate
    EMPLOYEE ||--o{ COMPLIANCE_ISSUE : owns

    CATEGORY ||--o{ CSR_ACTIVITY : classifies
```

---

## 🧱 Main Database Entities

### Shared Master Data
- **Employee**
- **Department**
- **Category**

### Environmental
- **EmissionFactor**
- **CarbonTransaction**
- **EnvironmentalGoal**
- **ProductESGProfile**

### Social
- **CSRActivity**
- **EmployeeParticipation**

### Governance
- **ESGPolicy**
- **PolicyAcknowledgement**
- **Audit**
- **ComplianceIssue**

### Scoring and Platform Layer
- **DepartmentScore**
- **ESGConfiguration**
- **Notification**

---

## 📁 Project Structure

```text
app/
  api/
    auth/
    environmental/
    governance/
    settings/
    social/
  dashboard/
  environmental/
  governance/
  login/
  reports/
  settings/
  signup/
  social/

components/
  layout/

lib/
  auth.ts
  prisma.ts
  notifications.ts

prisma/
  schema.prisma
  seed.ts
  prisma.config.ts
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 20+
- npm
- Docker Desktop
- Git

### 1. Clone the repository
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd ecosphere
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
**PowerShell**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux**
```bash
cp .env.example .env
```

Example:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecosphere"
JWT_SECRET="change-this-to-a-long-random-secret"
```

### 4. Start PostgreSQL
```bash
docker run --name ecosphere-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecosphere -p 5432:5432 -d postgres:16
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Run migrations
```bash
npx prisma migrate dev
```

### 7. Seed initial data
```bash
npx tsx prisma/seed.ts
```

### 8. Start development server
```bash
npm run dev
```

Open:
- `http://localhost:3000/signup`
- `http://localhost:3000/login`
- `http://localhost:3000/dashboard`

---

## ⚠️ Prisma 7 Note

This project uses **Prisma 7**, which reads database configuration from `prisma.config.ts`.

Do **not** reintroduce:

```prisma
url = env("DATABASE_URL")
```

inside `schema.prisma` if the Prisma 7 config is already set up.

---

## 🧭 Main Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Executive overview |
| `/environmental` | Environmental module home |
| `/environmental/emission-factors` | Emission factor management |
| `/environmental/goals` | Environmental goal tracking |
| `/environmental/carbon-transactions` | Carbon transaction logging |
| `/environmental/product-profiles` | Product ESG profiles |
| `/social` | Social module home |
| `/governance` | Governance module home |
| `/settings` | Settings module home |
| `/settings/departments` | Department management |
| `/settings/categories` | Category management |
| `/reports` | Reporting module |
| `/login` | Login page |
| `/signup` | Signup page |

---

## 🎬 Recommended Demo Flow

For a hackathon demo video, this order works best:

1. **Start with the Dashboard**  
   Show the platform entry point and explain EcoSphere's mission.

2. **Open Settings**  
   Add departments and categories to show the platform foundation.

3. **Go to Environmental**  
   Create an emission factor, log a carbon transaction, and show automatic CO2 calculation.

4. **Show Environmental Goals**  
   Demonstrate target tracking and status updates.

5. **Open Social**  
   Create a CSR activity, join as an employee, and explain approval workflow.

6. **Open Governance**  
   Show policies, audits, and compliance issue ownership.

7. **Return to ESG vision**  
   Explain how all data eventually feeds scoring, dashboards, and reporting.

---

## 👥 Team Workflow

### Feature Branch Workflow
```bash
git checkout main
git pull origin main
git checkout -b feature/<module-name>
git add .
git commit -m "feat: implement <module-name>"
git push -u origin feature/<module-name>
```

### Direct Main Workflow
```bash
git checkout main
git pull origin main
git add .
git commit -m "feat: update project"
git push origin main
```

---

## 💡 Engineering Highlights

- Modular full-stack architecture
- Shared layout and sidebar system
- Department-based ownership model
- Auto-calculated environmental records
- Status-driven business workflows
- Middleware-based route protection
- Expandable ESG scoring design
- Clean Prisma + PostgreSQL backend structure

---

## 🌍 Why EcoSphere Matters

EcoSphere is more than a dashboard.

It is a digital operating layer for ESG accountability — one that helps organizations move from isolated data entry to coordinated sustainability action.

By combining **measurement**, **participation**, **governance**, and **visibility**, EcoSphere creates a foundation for smarter ESG operations at scale.

---

## 📜 License

Built for the **ODOO 2026 Hackathon**.
