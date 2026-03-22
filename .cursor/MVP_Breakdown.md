# MVP Breakdown — NGO Teaching Volunteer Matching Platform

## Priority Definitions
- **P0** = required for launch
- **P1** = important but can come after core flow is working
- **P2** = post-MVP

---

## Epic 1: Authentication and Role Setup

### Feature 1.1: User Signup
- **Priority:** P0
- **Users:** NGO, Volunteer

**Description**
Allow users to register with role selection.

**Requirements**
- Signup form supports NGO and Volunteer roles
- Email and password required
- User role stored at account creation
- Duplicate emails not allowed

**Acceptance Criteria**
- User can create an account successfully
- User must choose a role
- User sees the correct dashboard after signup/login
- Duplicate email registration is blocked

### Feature 1.2: Login and Logout
- **Priority:** P0

**Acceptance Criteria**
- Registered user can log in with valid credentials
- Invalid credentials show an error
- User can log out successfully

### Feature 1.3: Password Reset
- **Priority:** P1

**Acceptance Criteria**
- User can request password reset
- User receives reset instructions
- User can set a new password successfully

---

## Epic 2: NGO Onboarding and Profile

### Feature 2.1: NGO Profile Creation
- **Priority:** P0
- **User:** NGO

**Requirements**
- NGO can add organization details
- Required fields validated
- Profile can be edited later

**Acceptance Criteria**
- NGO can save profile with all required fields
- Missing required fields block completion
- Saved profile appears in dashboard

### Feature 2.2: NGO Approval Workflow
- **Priority:** P1
- **User:** Admin

**Requirements**
- NGO profile stays pending until approved
- Admin can approve or reject NGO

**Acceptance Criteria**
- Pending NGO cannot publish open listings
- Admin can change NGO status to approved/rejected
- Approved NGO can create/publish listings

---

## Epic 3: Volunteer Onboarding and Profile

### Feature 3.1: Volunteer Profile Creation
- **Priority:** P0
- **User:** Volunteer

**Requirements**
- Volunteer can enter teaching-related details
- Profile includes subjects, availability, teaching mode, and age-group comfort

**Acceptance Criteria**
- Volunteer can save profile with required fields
- Incomplete required profile blocks application
- Volunteer can edit profile later

### Feature 3.2: Profile Completeness Indicator
- **Priority:** P1
- **User:** Volunteer, NGO

**Acceptance Criteria**
- System displays profile completeness percentage or status
- Missing required sections are clearly indicated

---

## Epic 4: Teaching Need Listings

### Feature 4.1: Create Teaching Need Listing
- **Priority:** P0
- **User:** NGO

**Requirements**
- NGO can create listing with structured fields
- Listing status can be draft/open/closed

**Acceptance Criteria**
- NGO can save draft listing
- NGO can publish listing when required fields are complete
- Open listing becomes visible in volunteer discovery
- Closed listing no longer appears in discovery

### Feature 4.2: Edit / Close Listing
- **Priority:** P0
- **User:** NGO

**Acceptance Criteria**
- NGO can edit an existing listing
- NGO can close an open listing
- Closed listings are removed from active browse results

---

## Epic 5: Matching and Discovery

### Feature 5.1: Rules-Based Matching
- **Priority:** P0
- **User:** Volunteer

**Requirements**
- System compares volunteer profile to listings
- Matching based on subject, mode, location, age group, availability

**Acceptance Criteria**
- Relevant listings are shown as matches
- Non-matching listings are not marked as eligible
- Matching logic is consistent and deterministic

### Feature 5.2: Browse and Filter Opportunities
- **Priority:** P0
- **User:** Volunteer

**Requirements**
- Volunteer can browse open listings
- Filters available for subject, location, mode, age group, and language

**Acceptance Criteria**
- Volunteer can view all open listings
- Filters narrow results correctly
- Listing detail page shows enough info to decide whether to apply

---

## Epic 6: Applications

### Feature 6.1: Apply to Listing
- **Priority:** P0
- **User:** Volunteer

**Requirements**
- Volunteer can apply only once per listing
- Application uses latest volunteer profile snapshot or current profile reference

**Acceptance Criteria**
- Volunteer can click apply on eligible listing
- Application status is created as `Pending`
- Duplicate application to same listing is blocked
- Applied listing appears in volunteer dashboard

### Feature 6.2: Track Application Status
- **Priority:** P0
- **User:** Volunteer

**Acceptance Criteria**
- Volunteer can see all submitted applications
- Each application shows current status
- Status updates reflect NGO actions

---

## Epic 7: NGO Review Workflow

### Feature 7.1: View Applicants
- **Priority:** P0
- **User:** NGO

**Requirements**
- NGO can see applicants by listing
- NGO can open volunteer profile details

**Acceptance Criteria**
- NGO can see all applicants for a listing
- NGO can inspect volunteer profile
- Applicant list updates as new applications come in

### Feature 7.2: Accept / Reject Application
- **Priority:** P0
- **User:** NGO

**Requirements**
- NGO can set application status
- Status must be visible to volunteer

**Acceptance Criteria**
- NGO can mark application as under review
- NGO can accept application
- NGO can reject application
- Volunteer sees updated final status in dashboard

### Feature 7.3: Internal NGO Notes
- **Priority:** P1
- **User:** NGO

**Acceptance Criteria**
- NGO can add internal notes to an application
- Notes are visible only to NGO/admin, not volunteer

---

## Epic 8: Dashboards

### Feature 8.1: NGO Dashboard
- **Priority:** P0

**Acceptance Criteria**
- NGO dashboard shows profile status
- NGO dashboard shows active listings
- NGO dashboard shows application counts
- NGO dashboard links to applicant review

### Feature 8.2: Volunteer Dashboard
- **Priority:** P0

**Acceptance Criteria**
- Volunteer dashboard shows profile status
- Volunteer dashboard shows recommended opportunities
- Volunteer dashboard shows submitted applications and statuses

### Feature 8.3: Admin Dashboard
- **Priority:** P1

**Acceptance Criteria**
- Admin can view pending NGO approvals
- Admin can review NGO details
- Admin can approve/reject NGOs

---

## Epic 9: Admin Moderation

### Feature 9.1: NGO Approval Queue
- **Priority:** P1

**Acceptance Criteria**
- Admin sees list of pending NGOs
- Admin can review core NGO information
- Admin can approve or reject an NGO

### Feature 9.2: Disable Suspicious Accounts/Listings
- **Priority:** P1

**Acceptance Criteria**
- Admin can disable an NGO account
- Admin can close/remove invalid listings
- Disabled content is hidden from users

---

## MVP Release Recommendation

### Launch with P0 only
For the first working release, prioritize only:
- Signup/login
- Role-based access
- NGO profile
- Volunteer profile
- Listing creation
- Matching/discovery
- Apply flow
- NGO review flow
- Basic dashboards

### Add after core flow stabilizes
- NGO approval workflow
- Profile completeness
- Internal notes
- Password reset
- Admin moderation improvements

---

## Suggested Build Order for Cursor

### Phase 1: Foundation
1. Auth + role model
2. Database schema
3. NGO profile flow
4. Volunteer profile flow

### Phase 2: Core Marketplace
5. Listing creation/edit/close
6. Browse and filter listings
7. Matching logic
8. Apply flow

### Phase 3: Review and Status
9. NGO applicant review
10. Accept/reject flow
11. Volunteer dashboard
12. NGO dashboard

### Phase 4: Admin
13. NGO approval queue
14. Basic moderation
