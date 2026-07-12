# Findings: Keeelai Platform — Flutter App Architecture Research

**Session Started:** 2026-07-12  
**Status:** Understanding Lock Confirmed — Moving to Design

---

## Existing Platform (keeelai-platform — Next.js)

### Tech Stack
- **Framework:** Next.js (App Router)
- **Auth & DB:** Supabase (Auth + PostgreSQL)
- **Payments:** Stripe (pricing $4.99–$49.99 range)
- **UI:** shadcn/ui + Tailwind CSS + TypeScript
- **Deployment:** Vercel (assumed)

### Database Tables Identified (from API & SQL files)
| Table | Purpose |
|-------|---------|
| `profiles` | User accounts, roles (super_admin, school_admin, student?) |
| `notes` | Lessons / simulation content (has `is_demo`, `title`, `description`) |
| `school_licenses` | School seat-based licensing (admin_profile_id, total_seats, expires_at) |
| `transactions` | Payment records |
| `coupon_rules` | Discount / coupon system |

### User Roles Identified
1. **super_admin** — Can create school admins, allocate licenses
2. **school_admin** — Manages school's seat licenses and students
3. **student/individual** — Consumes content via web subscription or school seat

### Content Delivery
- Content = `notes` table entries (simulations/lessons)
- Demo content: `is_demo = true` — publicly accessible
- Premium content: behind web subscription or school seat license
- **Delivery mechanism:** `/webview/notes/[id]` — browser-based WebView player
- Simulations are interactive (sliders, variables, real-time graphs)
- Smartboard & iPad optimized

### API Routes Found
- `/api/super/admins` — Create school admin accounts
- `/api/school/redeem` — Redeem school seat licenses
- `/api/payments/*` — Payment processing
- `/api/admin/*` — Admin panel operations
- `/api/notes/*` — Content operations

### Web Subscription Model
- Monthly / bi-annual / annual individual plans
- School license model (seat-based, duration-based)
- `web_subscription_active` flag on profiles

### Webview Route
- `/webview/notes/[id]` — This is the key content player page
- This page likely renders an interactive HTML5/JS simulation

---

## Flutter App — User Clarifications (Confirmed)

### Flutter App Scope (CONFIRMED)
- **Role:** Content Player + Profile/Subscription viewer ONLY
- **Users:** Students (& parents) on mobile/tablet
- **Admin features:** NONE in Flutter — web-only
- **Subscription actions:** View status + deep link / navigate to website to purchase/renew
- **Simulations:** WebView-embedded (HTML5 JS sims from existing platform)

### Content Taxonomy (NEW — to be built)
- **Hierarchy:** Board → Class → Subject → Content (notes)
- **Management:** super_admin only via web panel
- **Flexibility:** A single `note` can belong to multiple boards/classes/subjects (many-to-many)
- **Taxonomy entities:** Board, Class, Subject — all created/managed by super_admin

### New DB Tables Discovered
| Table | Purpose |
|-------|--------|
| `school_memberships` | Maps students to school licenses (seat tracking) |
| `school_codes` | Access codes tied to a license (max_uses enforcement) |
| `profiles` | Roles: super_admin, school_admin, user |

### Content Access Logic (Flutter)
- Demo content (`is_demo=true`) → freely accessible, no auth needed
- Premium content → requires active subscription OR valid school membership
- Subscription check: `profiles.web_subscription_active` OR active `school_memberships` record

