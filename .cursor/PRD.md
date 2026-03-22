# PRD — NGO Teaching Volunteer Matching Platform

## Document Information
- **Product Name:** NGO Teaching Volunteer Matching Platform
- **Author:** Harsha
- **Date:** March 22, 2026
- **Version:** v1.0 Draft
- **Status:** Draft

---

## 1. Executive Summary
The NGO Teaching Volunteer Matching Platform connects NGOs serving children with individual volunteers who can teach relevant subjects. NGOs can create profiles and post teaching-related needs, including subject requirements, age groups, teaching mode, and schedule preferences. Individual volunteers can create profiles that describe the subjects they can teach, prior teaching experience, preferred mode of teaching, and availability.

The platform’s core value is to simplify and structure the matching process between educational needs from NGOs and the skills of volunteers. Instead of relying on informal networks, manual outreach, or unstructured volunteer coordination, the platform creates a clear system where opportunities can be listed, matched, reviewed, and accepted.

The first version of the product should focus on enabling the end-to-end workflow: NGO onboarding, volunteer onboarding, listing creation, volunteer discovery of relevant listings, application submission, and NGO review/acceptance.

---

## 2. Background and Problem Statement
Many NGOs working with children require volunteer support for teaching subjects such as mathematics, science, English, spoken language, basic computer skills, and foundational learning. However, discovering and onboarding suitable volunteers is often difficult.

At the same time, many individuals are willing to contribute time and skills but do not know:
- which NGOs need support,
- whether they qualify for a specific opportunity,
- how to apply in a structured way,
- or what happens after they express interest.

This leads to several problems:
- NGOs spend significant effort manually finding volunteers
- volunteers cannot easily discover aligned opportunities
- matching is inconsistent and subjective
- there is no structured review pipeline
- children lose access to potentially valuable educational support

The platform aims to solve this problem by standardizing how needs and profiles are represented, and by creating a structured matching and review workflow.

---

## 3. Vision
Create a trusted platform that helps NGOs quickly find relevant teaching volunteers for children, while giving volunteers a simple and transparent way to discover and apply to meaningful teaching opportunities.

---

## 4. Product Goals

### 4.1 Business Goals
- Build a trusted two-sided platform for NGOs and volunteer teachers
- Increase the number of successful volunteer placements
- Reduce the manual coordination burden on NGOs
- Create a scalable foundation for future growth across geographies and educational needs

### 4.2 User Goals

#### NGO Goals
- Create and publish teaching requirements quickly
- Receive relevant volunteer applications
- Review volunteer profiles efficiently
- Accept suitable volunteers confidently

#### Volunteer Goals
- Create a profile that highlights teaching skills and preferences
- Discover NGO opportunities that are relevant
- Apply easily
- Track application status transparently

### 4.3 Product Goals
- Standardize teaching opportunity listings
- Standardize volunteer teaching profiles
- Implement rules-based matching in v1
- Support an end-to-end application and review workflow

---

## 5. Non-Goals (V1 Exclusions)
The following are explicitly out of scope for version 1:
- In-app chat or messaging
- Interview scheduling workflows
- Volunteer background verification system
- Video teaching or classroom tools
- Payments, stipends, or reimbursement flows
- Multi-language support
- Native mobile applications
- AI-driven ranking or advanced recommendation engine
- Detailed impact reporting or learning outcomes tracking

---

## 6. Target Users and Personas

### 6.1 Persona 1: NGO Coordinator
A program manager, volunteer coordinator, or operations lead at an NGO who needs volunteers to teach children.

**Needs**
- Post clear teaching requirements
- Find volunteers with relevant subject knowledge and availability
- Review volunteers in a structured way
- Fill opportunities quickly

**Pain Points**
- Volunteer sourcing is time-consuming
- Many applicants may not be a fit
- Tracking outreach and applications is manual

### 6.2 Persona 2: Individual Volunteer
A student, working professional, teacher, or skilled individual who wants to teach children through NGOs.

**Needs**
- Showcase the subjects they can teach
- Indicate location and availability
- Discover opportunities where they are relevant
- Apply without unnecessary friction

**Pain Points**
- Hard to discover opportunities
- Unclear fit or eligibility
- No transparent application process

### 6.3 Persona 3: Platform Admin
An internal administrator or moderator responsible for platform quality, trust, and onboarding.

**Needs**
- Approve legitimate NGOs
- Monitor listings and profiles
- Remove bad or incomplete entries
- Maintain platform credibility

**Pain Points**
- Risk of poor-quality listings
- Need for trust and moderation
- Managing incomplete or invalid data

---

## 7. User Stories

### 7.1 NGO User Stories
- As an NGO, I want to create an organization profile so volunteers understand who we are.
- As an NGO, I want to post a teaching need with required subjects, mode, and schedule so suitable volunteers can apply.
- As an NGO, I want to review volunteer applications so I can evaluate candidates.
- As an NGO, I want to accept or reject volunteers so I can manage selection.

### 7.2 Volunteer User Stories
- As a volunteer, I want to create a profile with the subjects I can teach so I can be matched with suitable NGOs.
- As a volunteer, I want to specify my preferred mode, location, and availability so I only see relevant opportunities.
- As a volunteer, I want to browse and apply to eligible NGO opportunities.
- As a volunteer, I want to track the status of my applications.

### 7.3 Admin User Stories
- As an admin, I want to approve NGO accounts before they go live.
- As an admin, I want to manage suspicious or incomplete listings and accounts.

---

## 8. Scope

### 8.1 In Scope for MVP
- Role-based signup/login
- NGO profile creation and editing
- Volunteer profile creation and editing
- Teaching need listing creation and management
- Opportunity browsing and filtering
- Rules-based matching/eligibility view
- Volunteer application submission
- NGO application review workflow
- Application statuses
- Basic dashboards
- Admin NGO approval flow

### 8.2 Out of Scope for MVP
- Messaging
- Interview scheduling
- Verification
- Reviews and ratings
- Real-time notifications beyond basic status visibility
- Group/class management after acceptance

---

## 9. Functional Requirements

### 9.1 Authentication and Role Management
The system shall allow users to sign up and log in as either:
- NGO
- Volunteer
- Admin

**Requirements**
- A user must choose a role at signup
- Role-based permissions must restrict access appropriately
- NGOs should only access NGO workflows
- Volunteers should only access volunteer workflows
- Admins should access moderation and approval functions
- Password reset must be supported

### 9.2 NGO Profile Management
The system shall allow NGOs to create and edit organization profiles.

**Required Fields**
- NGO name
- Description / mission
- Location
- Age groups served
- Contact person name
- Contact email
- Contact phone
- Website or social link (optional)

**Requirements**
- NGO profile must be completed before posting teaching needs
- NGO profile should show profile completeness
- NGO profile status may remain pending approval until admin review

### 9.3 Teaching Need Listing Management
The system shall allow NGOs to create and manage teaching opportunity listings.

**Required Fields**
- Listing title
- Subject(s) needed
- Age group / class level
- Teaching mode: online / offline / hybrid
- Location
- Time commitment
- Frequency
- Language preference
- Minimum qualifications or preferences
- Description of the need
- Number of volunteers needed
- Application deadline
- Listing status: draft / open / closed

**Requirements**
- Only approved NGOs can publish open listings
- NGOs may edit or close listings
- Closed listings should not appear in volunteer discovery
- NGOs should be able to view application counts per listing

### 9.4 Volunteer Profile Management
The system shall allow volunteers to create and edit teaching profiles.

**Required Fields**
- Full name
- Short bio
- Location
- Education background
- Subjects they can teach
- Age groups / class levels they are comfortable teaching
- Languages spoken
- Preferred teaching mode
- Availability
- Prior teaching or volunteering experience
- Resume/supporting document (optional)

**Requirements**
- Volunteer profile should support profile completeness
- Volunteers must complete required fields before applying
- Volunteer profile should be reused across applications

### 9.5 Matching / Eligibility Logic
The system shall show volunteers NGO opportunities that match their profile.

**Matching Inputs**
- Subject overlap
- Location compatibility
- Teaching mode compatibility
- Age group / class compatibility
- Availability overlap
- Qualification requirements, if specified

**Requirements**
- Matching in v1 should be deterministic and rules-based
- The system should label opportunities as:
  - good match
  - partial match
  - not eligible
- Volunteers should only be allowed to apply where minimum mandatory requirements are met
- NGOs do not need an advanced ranking engine in v1

### 9.6 Opportunity Discovery
The system shall allow volunteers to browse and discover NGO teaching opportunities.

**Filters**
- Subject
- Location
- Teaching mode
- Age group / class level
- Time commitment
- Language
- Open status

**Requirements**
- Volunteers should see listing details before applying
- Discovery should prioritize good match opportunities
- Volunteers should be able to browse even beyond recommended results, where allowed

### 9.7 Application Workflow
The system shall allow volunteers to apply to teaching needs.

**Requirements**
- Volunteers can apply to open listings
- Each application references the volunteer’s latest profile
- A volunteer should not be able to apply twice to the same listing
- Each application must have a status

**Application Statuses**
- Pending
- Under Review
- Accepted
- Rejected
- Withdrawn (optional but useful for v1.1)

### 9.8 NGO Review Workflow
The system shall allow NGOs to review applications received for their listings.

**Requirements**
- NGOs can view all applicants per listing
- NGOs can inspect volunteer profile details
- NGOs can mark applications as under review
- NGOs can accept or reject applicants
- NGOs may add internal notes
- Volunteer must see final status in their dashboard

### 9.9 Dashboards

**NGO Dashboard Requirements**
- profile completeness
- approval status
- active listings
- draft listings
- open application counts
- accepted volunteers

**Volunteer Dashboard Requirements**
- profile completeness
- recommended opportunities
- submitted applications
- application statuses

**Admin Dashboard Requirements**
- pending NGO approvals
- flagged/incomplete listings
- platform activity summary

### 9.10 Admin Controls
The system shall allow admins to moderate NGO access and maintain platform quality.

**Requirements**
- Admin can review and approve or reject NGO accounts
- Admin can disable suspicious accounts
- Admin can close invalid listings
- Admin can view high-level activity metrics

---

## 10. User Flows

### 10.1 NGO User Flow
1. NGO signs up
2. NGO completes organization profile
3. Admin reviews and approves NGO
4. NGO creates teaching need listing
5. Volunteer discovers listing and applies
6. NGO reviews application
7. NGO accepts or rejects volunteer

### 10.2 Volunteer User Flow
1. Volunteer signs up
2. Volunteer completes teaching profile
3. Platform shows matching opportunities
4. Volunteer browses and applies
5. NGO reviews volunteer profile
6. Volunteer tracks application status

### 10.3 Admin Flow
1. Admin reviews NGO applications
2. Admin approves/rejects NGO accounts
3. Admin monitors listings and platform quality

---

## 11. Data Model (High-Level Entities)

### NGO
- id
- name
- description
- location
- age_groups_served
- contact_info
- approval_status
- created_at
- updated_at

### Volunteer
- id
- name
- bio
- location
- education
- subjects
- age_groups
- languages
- preferred_mode
- availability
- experience
- created_at
- updated_at

### TeachingNeed
- id
- ngo_id
- title
- subjects_required
- age_group
- mode
- location
- time_commitment
- frequency
- language_preference
- qualifications
- description
- volunteers_needed
- application_deadline
- status

### Application
- id
- teaching_need_id
- volunteer_id
- status
- internal_notes
- applied_at
- reviewed_at

### AdminApproval
- id
- ngo_id
- status
- reviewer_id
- notes
- reviewed_at

---

## 12. Success Metrics

### 12.1 Primary Metrics
- Number of approved NGOs
- Number of completed volunteer profiles
- Number of teaching need listings created
- Number of applications submitted
- Number of accepted applications
- Number of successful volunteer placements

### 12.2 Secondary Metrics
- NGO profile completion rate
- Volunteer profile completion rate
- Listing-to-application conversion rate
- Application-to-acceptance conversion rate
- Average time to first application
- Average time from application to decision

---

## 13. Risks and Challenges
- NGOs may post unclear or incomplete requirements
- Volunteers may not complete detailed profiles
- Simple matching rules may fail for nuanced cases
- Trust and verification needs may arise quickly
- NGOs may not act promptly on applications
- Too many required fields may hurt onboarding conversion

---

## 14. Assumptions
- NGOs will maintain updated opportunity listings
- Volunteers are willing to provide detailed teaching information
- Rules-based matching is sufficient for the initial release
- Admin moderation can support trust early on
- One account maps to one primary role in v1

---

## 15. Open Questions
- Should volunteers be able to apply to NGOs generally, or only to listings?
- Should NGOs be able to proactively invite volunteers?
- What minimum qualifications should block applications?
- Should partial matches be visible or hidden?
- Should one volunteer be able to hold multiple active acceptances?
- Should NGO approval be manual for all accounts or only selected ones?
- Should application deadlines be mandatory?

---

## 16. Future Enhancements
- In-app chat and messaging
- Interview scheduling
- Background verification and document checks
- Ratings and reviews for NGOs and volunteers
- Calendar integration
- Notifications and reminders
- Volunteer onboarding resources
- Multi-language support
- Mobile applications
- AI-based match ranking
- Analytics on teaching engagement and outcomes

---

## 17. MVP Definition
The MVP must support the following complete workflow:
- NGO can create account and profile
- Admin can approve NGO
- NGO can create teaching need listing
- Volunteer can create account and profile
- Platform can determine relevant opportunities based on simple matching rules
- Volunteer can apply
- NGO can review and accept/reject
- Volunteer can see status

If these workflows are complete and reliable, the MVP is successful.

---

## 18. Product Principles
- Keep the experience simple and low-friction
- Prioritize trust and clarity over complexity
- Use structured data for strong matching
- Avoid overengineering in v1
- Ensure both sides always know what happens next

---

## 19. Notes for Cursor / Engineering
When implementing this product:
- Start with core role-based auth and profile setup
- Build the minimum end-to-end flow before adding polish
- Prefer simple rules-based matching logic over complex ranking
- Keep listing and profile schemas explicit and structured
- Design for dashboard clarity rather than feature depth
- Avoid building messaging, scheduling, or verification in MVP
