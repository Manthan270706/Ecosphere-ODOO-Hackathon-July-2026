# Testing Guide — Governance & Gamification Modules

> Base URL: `http://localhost:3000` | All passwords: `password123`

---

## Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ecosphere.com` | `password123` |
| ESG Manager | `esgmanager@ecosphere.com` | `password123` |
| Department Head | `depthead@ecosphere.com` | `password123` |
| Compliance Officer | `compliance@ecosphere.com` | `password123` |
| Employee | `employee@ecosphere.com` | `password123` |

---

## ⚖️ GOVERNANCE MODULE

---

### 1. Policies

#### ✅ View policies (any logged-in user)
1. Login as `employee@ecosphere.com`
2. Go to `/governance/policies`
3. **Expected:** Policy list loads successfully

#### ✅ Create policy (manager only)
1. Login as `compliance@ecosphere.com`
2. Go to `/governance/policies`
3. Click **+ New Policy**
4. Fill in:
   - Title: `Environmental Safety Policy`
   - Content: `All departments must reduce emissions by 20%`
   - Version: `1.0`
5. Click **Publish Policy**
6. **Expected:** New policy appears at the top of the list

#### ❌ Create policy blocked for employee
1. Login as `employee@ecosphere.com`
2. Go to `/governance/policies` → click **+ New Policy**
3. **Expected:** Red error — `403 Forbidden: insufficient role`

#### ✅ Acknowledge a policy
1. Login as `employee@ecosphere.com`
2. Go to `/governance/policies`
3. **Expected:** Each policy row has an **Acknowledge** button and a `Pending` badge
4. Click **Acknowledge** on any policy
5. **Expected:** Badge changes to green `✓ Acknowledged`, button disappears

---

### 2. Policy Acknowledgements

#### ✅ View acknowledgement records
1. Login as `esgmanager@ecosphere.com`
2. Go to `/governance/acknowledgements`
3. **Expected:** Table shows all employees and which policies they acknowledged

---

### 3. Audits

#### ✅ View audits (any logged-in user)
1. Login as `employee@ecosphere.com`
2. Go to `/governance/audits`
3. **Expected:** Audit list loads (NOT redirected to dashboard)

#### ✅ Create audit (manager only)
1. Login as `esgmanager@ecosphere.com`
2. Go to `/governance/audits`
3. Click **+ New Audit**
4. Fill in:
   - Title: `Q2 Manufacturing Audit`
   - Department: `Manufacturing`
   - Auditor: pick any employee
   - Date: today's date
   - Findings: `Minor emission discrepancies found`
   - Status: `under_review`
5. Click **Save**
6. **Expected:** Audit appears with badge `under_review`

#### ✅ Edit audit — mark as completed
1. Click **Edit** on the audit you just created
2. Change Status to `completed`
3. **Expected:** Badge turns green / shows `completed`

#### ❌ Create audit blocked for employee
1. Login as `employee@ecosphere.com`
2. Try to create an audit
3. **Expected:** `403 Forbidden` error

---

### 4. Compliance Issues

#### ✅ Create compliance issue
1. Login as `compliance@ecosphere.com`
2. Go to `/governance/compliance-issues`
3. Click **+ New Issue**
4. Fill in:
   - Department: `Logistics`
   - Severity: `high`
   - Description: `Missing waste disposal documentation`
   - Owner: pick any employee
   - Due Date: **tomorrow's date**
   - Status: `open`
5. **Expected:** Issue appears with status `open`

#### ✅ Overdue flag test (business rule)
1. Create another issue with Due Date set to **yesterday**
2. **Expected:** Issue shows a red **Overdue** flag automatically

#### ✅ Resolve an issue
1. Click **Edit** on any open issue
2. Change Status to `resolved`
3. **Expected:** Issue moves to resolved / overdue flag disappears

#### ❌ Create issue blocked for employee
1. Login as `employee@ecosphere.com`
2. Try to create a compliance issue
3. **Expected:** `403 Forbidden` error

---

---

## 🏆 GAMIFICATION MODULE

---

### 1. Challenges

#### ✅ View challenges (any logged-in user)
1. Login as `employee@ecosphere.com`
2. Go to `/gamification/challenges`
3. **Expected:** Challenge cards load (or empty state with trophy icon)

#### ✅ Create challenge (manager only)
1. Login as `depthead@ecosphere.com`
2. Go to `/gamification/challenges`
3. Click **+ New Challenge**
4. Fill in:
   - Title: `Reduce Printing by 50%`
   - Description: `Track and reduce paper usage`
   - XP Points: `150`
   - Difficulty: `Medium`
   - Deadline: any future date
5. Click **Create Challenge**
6. **Expected:** Challenge card appears in the grid

#### ❌ Create challenge blocked for employee
1. Login as `employee@ecosphere.com`
2. Click **+ New Challenge**
3. **Expected:** `403 Forbidden` — "only managers can create challenges"

#### ✅ Join a challenge (any logged-in user)
1. Login as `employee@ecosphere.com`
2. Go to `/gamification/challenges`
3. Click **Join Challenge** on any active card
4. **Expected:** Alert — "Joined challenge successfully!"

---

### 2. Challenge Participation (Approval Queue)

#### ✅ View all participations
1. Login as `esgmanager@ecosphere.com`
2. Go to `/gamification/participation`
3. **Expected:** Table shows all employees who joined challenges with status `pending`

#### ✅ Approve a participation (XP award + badge check)
1. Login as `esgmanager@ecosphere.com`
2. Go to `/gamification/participation`
3. Click **Approve** on the employee participation from the step above
4. **Expected:**
   - Status changes to `approved`
   - Employee's XP increases (check Leaderboard)
   - If badge threshold met, badge is auto-awarded

#### ✅ Reject a participation
1. Click **Reject** on another pending entry
2. **Expected:** Status changes to `rejected`

#### ❌ Approve blocked for employee
1. Login as `employee@ecosphere.com`
2. Try to approve via a direct `PUT` to `/api/gamification/participation/{id}`
3. **Expected:** `403 Forbidden`

#### ✅ Evidence required business rule
1. Create a challenge with **Evidence Required = true** (as a manager)
2. Have an employee join it
3. Try to approve it WITHOUT a proof URL
4. **Expected:** Error — `"Proof is required to approve this challenge."`

---

### 3. Badges

#### ✅ View badge gallery
1. Login as `employee@ecosphere.com`
2. Go to `/gamification/badges`
3. **Expected:** Badge gallery loads with all available badges

#### ✅ Auto-award badge check
1. After approving a participation (step above), go to `/gamification/badges`
2. **Expected:** If XP threshold or challenge count was met, a badge shows as earned

---

### 4. Rewards

#### ✅ View reward catalog
1. Login as `employee@ecosphere.com`
2. Go to `/gamification/rewards`
3. **Expected:** Reward cards load with stock levels (green = in stock, red = out of stock)

#### ✅ Redeem a reward
1. Make sure you have enough XP (approve a participation first to get XP)
2. Click **Redeem** on an in-stock reward
3. **Expected:**
   - Success message
   - Stock count decreases by 1
   - Your XP decreases by the reward's cost

#### ❌ Redeem blocked — insufficient XP
1. Login as a fresh `employee@ecosphere.com` (0 XP)
2. Try to redeem a reward
3. **Expected:** Error — `"Insufficient XP"`

#### ❌ Redeem blocked — out of stock
1. Redeem a reward until stock = 0
2. Try to redeem again
3. **Expected:** Button disabled or error — `"Out of stock"`

---

### 5. Leaderboard

#### ✅ Verify XP rankings
1. Login as any user
2. Go to `/gamification/leaderboard`
3. **Expected:** Employees ranked top-to-bottom by XP, with department shown

#### ✅ Verify XP updates after approval
1. Note an employee's XP on the leaderboard
2. Approve their challenge participation (as a manager)
3. Refresh `/gamification/leaderboard`
4. **Expected:** That employee's XP has increased by the challenge's XP value

---

## 🔁 Full Governance + Gamification Flow (2-minute demo)

| Step | User | Action |
|------|------|--------|
| 1 | `compliance@ecosphere.com` | Create a **Policy** at `/governance/policies` |
| 2 | `depthead@ecosphere.com` | Create a **Challenge** (200 XP) at `/gamification/challenges` |
| 3 | `employee@ecosphere.com` | Acknowledge the **Policy** |
| 4 | `employee@ecosphere.com` | Join the **Challenge** |
| 5 | `esgmanager@ecosphere.com` | **Approve** the participation at `/gamification/participation` |
| 6 | `employee@ecosphere.com` | Check **Leaderboard** → see 200 XP |
| 7 | `employee@ecosphere.com` | Check **Badges** → see auto-awarded badge |
| 8 | `employee@ecosphere.com` | **Redeem a Reward** at `/gamification/rewards` |
