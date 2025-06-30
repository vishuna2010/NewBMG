# Project TODO List - Insurance Broker Platform

## I. Foundational Setup

*   [x] Suggest Tech Stack
*   [x] Outline Features and Functions
*   [x/~) Organize into Menu Structure (Initial structure defined, may need refinement as features are built)
*   [x] Backend Project Setup (Node.js/Express.js basic structure)
    *   [x] Scaffold Backend Directory Structure
    *   [x] Create Core Backend Files (index.js, db.js, env.js)
    *   [x] Create sample health check endpoint (`/api/v1/health`)
    *   [x] Create `package.json` for backend
*   [x] Frontend Project Setup (React basic structure)
    *   [x] Scaffold Frontend Directory Structure
    *   [x] Create Core Frontend Files (index.html, App.js, HomePage.js, Header.js)
    *   [x] Create `package.json` for frontend
*   [~] README files updates (Initial versions created, ongoing updates needed)

## II. Core System Modules - Backend & APIs

*   **Product Management:**
    *   [ ] Define Product Model (MongoDB Schema)
    *   [ ] API: Define/Configure Insurance Products (CRUD)
    *   [ ] API: Manage Product Details (coverage, premiums, terms, conditions, riders)
    *   [ ] API: Set up Underwriting Rules (basic structure)
    *   [ ] API: Manage Insurer/Carrier Information for Products
    *   [ ] API: Rate Table Management
    *   [~] Admin UI: Product Management page (`pages/admin/products/index.vue`) refactored for theme consistency.
    *   [~] Admin UI: Create/Edit Product pages (review for text color consistency).
*   **Quote Engine:**
    *   **Phase 1: Core Quote Generation & Storage**
        *   [ ] API: Allow product selection for quoting
        *   [ ] API: Support dynamic form data based on selected product (simplified)
        *   [ ] API: Implement mock premium calculation logic
        *   [ ] API: Save basic quote data (product, inputs, mock premium) to MongoDB
        *   [~] API: Implement Quote Status Management (accept/reject, ensure quotes are linked to `customerId`)
        *   [~] API: Verify/Implement dedicated endpoint for fetching single quote details (e.g., `GET /api/quotes/[quoteId]`)
        *   [ ] API: Future: Ensure only relevant client or authorized agent can change quote status (depends on Auth & Roles)
    *   **Phase 2: PDF Generation & S3 (Placeholder)**
        *   [x] Backend: Implement PDF quote document generation
        *   [~] UI: Admin/client access to generated PDF quotes (needs review)
        *   [ ] Integrate with S3 for storing PDF quotes
*   **Policy Issuance & Management:**
    *   [ ] API: Define Policy Mongoose Model & API Endpoints (CRUD)
    *   [ ] API: Implement "Convert Quote to Policy" functionality
        *   [ ] Create new Policy document from Quote details
    *   [x] API: Manage Policy Status - Phase 1: Activation
    *   [~] API & UI: Manage Policy Status - Phase 2: Implement 'cancelled' status
    *   [~] API & Conceptual Cron: Manage Policy Status - Phase 3: Implement 'expired' status logic (API for manual check)
    *   [ ] API: View/Search Policies
    *   [ ] API: Manage Policy Endorsements/Amendments (see also "NEW: Policy Issuance & Management Enhancements")
    *   [ ] API: Track Policy Lifecycle
    *   [ ] API: Automated renewal reminders and processing logic (see also "NEW: Policy Issuance & Management Enhancements")
    *   [ ] API: Document management for policy documents (general - see also S3 for specific docs)
*   **Claims Management:**
    *   [ ] API: Define Claim Model
    *   [ ] API: Log New Claim (FNOL)
    *   [ ] API: Track Claim Status (detailed statuses pending "NEW: Claims Management Enhancements")
    *   [ ] API: Assign Claims to adjusters/brokers
    *   [~] API: S3 integration for claim attachments (upload & linking - Backend saves files locally and serves them via a new API. Full S3 integration for claims pending.)
    *   [ ] API: Communication Log per Claim (see "NEW: Claims Management Enhancements")
    *   [ ] API: Generate Claim Reports (basic)
*   **Client (Customer) Management (CRM):**
    *   [ ] API: Define Customer Model (MongoDB Schema)
    *   [ ] API: Client Registration (Phase 1: Basic Registration)
    *   [~] API: Client Login & Session Management (Phase 2 - Covered by general user login)
    *   [ ] API: Create Customer
    *   [ ] API: View Customer Details
    *   [ ] API: Update Customer (e.g., profile updates from portal)
    *   [ ] API: Delete Customer
    *   [ ] API: List/Search Customers
    *   [ ] API: Customer Segmentation/Grouping logic
    *   [ ] API: Communication logs (emails, calls, notes) - (see also "Integrations & Communications")
    *   [ ] API: Task management related to customers
    *   [ ] API: Phase 4: KYC verification (S3 upload, admin verification) - (see also "NEW: Client Module Enhancements")
*   **Agent Management:**
    *   [ ] API: Define Agent User Model (extends base User model or separate)
    *   [x] API: Phase 1a: Admin API for agent creation
    *   [~] API: Agent Login & Session Management (Phase 2 - Covered by general user login with 'agent' role)
*   **User Management (General - Staff/Brokers/Admins):**
    *   [ ] Define User Model (Admin/Broker roles, base for Agent/Client)
    *   [x] API: Phase 1a: Basic Login API
    *   [~] API: Phase 1b: Implement JWT generation on login & cookie-based session
    *   [~] API: Phase 1c: Implement API route protection middleware (check JWT & role)
    *   [~] API: Phase 1e: Implement Logout functionality (clear session/cookie)
    *   [ ] API: Create Staff/Broker Accounts (distinct from agent creation if needed)
    *   [ ] API: View/Edit/Deactivate Staff/Broker Accounts
    *   [ ] API: Audit trails for user actions (see "Operations & Management")
*   **Settings & Configuration (Backend APIs):**
    *   [x] API: Implement system settings (Phase 1: Backend Model & APIs)
    *   [x] API: Implement Email settings (Backend functional)
    *   [x] API: Implement roles (Backend CRUD functional)
    *   [x] API: Implement tax bracket (Now Tax Classes; Backend CRUD functional)
    *   [~] API: Implement Compliance Checks / Develop Regulatory Reporting (APIs connected to Admin UI)
    *   [x] API: Manage Third-Party API Integrations (CRUD including Update)
    *   [~] API: Implement eSignature integration (Admin UI for request/status exists, backend part may need work)
*   **Integrations & Communications (Backend APIs):**
    *   [~] API: Implement Notifications (Backend Stub)
    *   [~] API: Implement Communication Module (Backend Stub)
    *   [~] API: Implement Payment Gateway Logic (Conceptual Design & Backend Stub)
*   **Operations & Management (Backend APIs):**
    *   [~] API: Implement Reporting & Dashboard (Admin dashboard summary API exists. Sales Report tabs use real policy data. More reports pending.)
    *   [ ] API: Implement Document Management (linking, metadata - core file handling separate)
    *   [x] API: Implement Audit Logging (Backend, Admin API)
    *   [ ] API: Implement marketing features (e.g., campaign tracking hooks)
    *   [ ] API: Implement Commission Hub (calculation, tracking for agents)
    *   [~] API: Implement Invoicing
        *   [x] API: Define Invoice Model & API (Backend Implemented)
        *   [~] API: Generate Invoice from Policy details (Backend Stub Implemented)
        *   [~] API: Track Invoice status (paid, unpaid, overdue) (Supported by API, auto-check conceptual)

## III. Customer Portal Features (Frontend - Vue.js based on provided paths)

*   **Dashboard (`pages/account/index.vue`):**
    *   [x] UI: Overview of active policies (summary card)
    *   [x] UI: Open Claims (summary card)
    *   [x] UI: Unread Notifications (summary card - API optimized)
    *   [x] UI: Next Renewal (summary card)
    *   [x] UI: Quick Action buttons
    *   [ ] UI: Pending actions (general, if not covered by cards)
*   **My Profile (`pages/account/profile.vue`):**
    *   [x] UI: View/Update personal information (name/email)
    *   [x] UI: Change password
    *   [ ] UI: Manage communication preferences
*   **My Policies:**
    *   [ ] UI: List policies (e.g., `pages/account/policies/index.vue`)
    *   [x] UI: Customer Policy Detail page (`pages/account/policies/[id].vue`) with document download.
    *   [ ] UI: Request policy changes/endorsements (form/workflow)
    *   [ ] UI: View premium payment history
    *   [ ] UI: Initiate policy renewal (if manual/semi-auto)
*   **Quotes (`pages/quotes/index.vue`):**
    *   [ ] UI: Browse available insurance products
    *   [ ] UI: Forms to get personalized quotes (dynamic based on product)
    *   [ ] UI: Display mock premium calculation
    *   [x] UI: Create page to list past quotes
    *   [~] UI: Quote Status Management (accept/reject on client side)
    *   [ ] UI: Future: Quote Comparison Feature
*   **Claims:**
    *   [x] UI: Customer claim submission page (`pages/claims/new.vue`) enhanced to pre-fill policy from query params and allow actual file uploads.
    *   [x] UI: Customer view of claim history & details (`pages/account/claims/` and `[id].vue`, includes viewing attachments).
*   **Payments:**
    *   [ ] UI: View outstanding premium payments / Invoices
    *   [ ] UI: Make online payments securely (requires Payment Gateway Integration)
    *   [ ] UI: View payment history and download receipts
*   **Documents:**
    *   [ ] UI: Access/Download personal insurance-related documents (general doc center if not on policy/claim pages)
    *   [ ] UI: Upload documents required by the broker (e.g., for KYC)
*   **Support & Communication (`pages/account/communications.vue`):**
    *   [x] UI: Basic Communication Module (listing)
    *   [~] UI: Verify/Fix Icon Paths (Switched to placeholder SVG components)
    *   [ ] UI: Secure messaging with the broker (detailed view/send)
    *   [ ] UI: FAQ section
    *   [ ] UI: Contact information for support
*   **Notifications (`pages/account/notifications.vue`):**
    *   [x] UI: Basic Notification UI (listing)
    *   [~] UI: Verify/Fix Icon Paths (Switched to placeholder SVG components)
    *   [x] UI: "Mark all as read" feature implemented.
    *   [x] UI: URL Query Sync for filters/page state implemented.
*   **Authentication (Client):**
    *   [ ] UI: Login Page
    *   [ ] UI: Registration Page (Phase 1: Basic Registration)
    *   [ ] UI: Forgot Password / Reset Password flow
    *   [~] Connect to Backend Auth (JWT handling)

## IV. Agent Portal Features (Frontend - Vue.js based on provided paths)
*   [~] UI: Agent Login & Session Management (Phase 2 - Covered by general user login with 'agent' role)
*   [~] UI: Agent-specific dashboard/portal features (Initial dashboard implemented, `pages/agent/dashboard.vue`)
*   [ ] UI: Lead Management for Agents
*   [ ] UI: Agent Performance Dashboards (policies sold, commission, conversion rates)
*   [ ] UI: Agent Onboarding/Training Material Access

## V. Admin Portal Features (Frontend - Vue.js based on provided paths)
*   **Authentication & Layout:**
    *   [x] UI: Phase 1a: Basic Login Page
    *   [~] UI: Phase 1d: Implement frontend page protection middleware (check auth & redirect)
    *   [x] UI: Basic Admin Portal Layout & Navigation structure (Sidebar refactored, Header includes user dropdown with profile/logout).
*   **Dashboard (`pages/admin/index.vue`):**
    *   [~] UI: Admin dashboard with key metrics - Sales Report tabs now use real data. Sales Analytics chart has table fallback. Summary cards connected. (Admin Overview page refactored for theme consistency).
*   **Product Management (`pages/admin/products/`):**
    *   [~] UI: Product List page (`index.vue`) refactored for theme consistency.
    *   [~] UI: Create/Edit Product pages (review for text color consistency).
*   **Client Management (`pages/admin/clients/`):**
    *   [x] UI: Full CRUD for Clients.
*   **User Management (`pages/admin/users.vue`):**
     *   [~] UI: User Management page refactored for theme consistency. (Assumed this means general user listing, distinct from specific client/agent CRUD).
*   **Agent Management (`pages/admin/agents/`):**
    *   [x] UI: Phase 1b: Admin UI for Agent Creation & Management (Full CRUD).
    *   [~] UI: List page (`pages/admin/agents.vue`) refactored for theme consistency.
*   **Claims Workflow Management (`pages/admin/claims/`):**
    *   [~] UI: Status updates, etc., including viewing attachments.
*   **Quote Management:**
    *   [~] UI: Admin UI for comprehensive quote management (may need review/enhancement from client-side version)
*   **Policy Management:**
    *   [x] UI: Admin UI for Policy List, View, Create, Edit implemented.
*   **Settings & Configuration (`pages/admin/settings/`):**
    *   [x] UI: System Settings Management (`pages/admin/settings/index.vue` functional)
    *   [x] UI: Email settings (Admin UI functional and verified, styling standardized)
    *   [x] UI: Roles (Admin UI for CRUD, including delete, functional and verified)
    *   [x] UI: Tax bracket (Now Tax Classes; Admin UI for CRUD functional)
    *   [~] UI: Compliance Checks / Develop Regulatory Reporting (Admin UI pages created, connected to APIs)
    *   [x] UI: Manage Third-Party API Integrations (`pages/admin/settings/integrations.vue` - CRUD including Update)
    *   [~] UI: Implement eSignature integration (Admin UI for request/status exists)
*   **Operations & Management:**
    *   [~] UI: Implement Reporting & Dashboard (Sales Report tabs use real policy data. More reports pending.)
    *   [~] UI: Implement Document Management (Admin UI for mock document management exists)
    *   [~] UI: Implement Audit Logging (Basic Admin UI Implemented. `pages/admin/audit-logs/index.vue` refactored for theme consistency.)
    *   [ ] UI: Implement marketing features
    *   [ ] UI: Implement Commission Hub
    *   [~] UI: Implement Invoicing (Basic Client List UI Implemented - likely for viewing invoices per client)

## VI. NEW: Quote Engine Enhancements
*   [ ] Implement Real Premium Calculation Logic (beyond mock)
*   [ ] Advanced Dynamic Form Generation (e.g., conditional fields based on product config)
*   [ ] Quote Versioning & Revision History
*   [ ] Quote Comparison Feature (for clients/agents)
*   [ ] Automated Follow-up System for Pending Quotes

## VII. NEW: Policy Issuance & Management Enhancements
*   [ ] Policy Endorsements/Amendments (with versioning, premium impact)
*   [ ] Policy Renewal Workflow (automated/semi-automated, notifications, renewal quote generation)
*   [ ] Advanced Automated Document Generation (Policy schedules, T&Cs, Certificates of Insurance)
*   [ ] Mid-term Adjustments & Cancellations (with premium/refund calculations)

## VIII. NEW: Claims Management Enhancements
*   [ ] Detailed Claims Workflow & Statuses (e.g., 'Under Review', 'Assessor Assigned', 'Settled')
*   [ ] Claim Adjudication Module (for admin/adjusters: review, notes, decisions)
*   [ ] Communication Log per Claim
*   [ ] Basic Fraud Detection Flags (rule-based)
*   [ ] Settlement & Payout Tracking

## IX. NEW: Client Module Enhancements
*   [ ] Phase 4: KYC Verification (Detailed Admin UI for review/approval)
*   [ ] Client Self-Service Portal (Advanced: profile updates, request changes, document downloads, payments - this is an aggregation of existing items but implies more depth)

## X. NEW: Agent Module Enhancements
*   [ ] Agent Hierarchy & Team Management (for larger brokerages)
*   [ ] Lead Management for Agents
*   [ ] Agent Performance Dashboards (policies sold, commission, conversion rates)
*   [ ] Agent Onboarding/Training Material Access

## XI. NEW: Admin Portal / Dashboard Enhancements
*   [ ] Advanced User Management (impersonation, detailed activity logs)
*   [ ] Customizable Admin Dashboard Widgets
*   [ ] Drill-Down Capabilities from Dashboard Stats
*   [ ] Advanced Product Configuration UI (rules, rating factors, versioning)

## XII. NEW: Settings & Configuration Enhancements
*   [ ] Workflow Configuration UI (for claims, policy issuance etc.)
*   [ ] Basic Branding/Theming Options for Client Portal
*   [ ] Advanced Tax Configuration (multiple jurisdictions, rates over time)
*   [ ] Advanced Integration Management (status, logs, config options)

## XIII. NEW: Integrations & Communications Enhancements
*   [ ] Full Payment Gateway Integration (Stripe, PayPal etc. - beyond conceptual)
    *   [ ] Payment processing, refunds, reconciliation
    *   [ ] Subscription/Recurring payment management for policies
*   [ ] Accounting System Integration (e.g., QuickBooks, Xero export)
*   [ ] CRM Integration (sync client/lead data)
*   [ ] Advanced Notification System
    *   [ ] User preferences for notifications (email, SMS, in-app)
    *   [ ] Notification Templating System
    *   [ ] SMS Notification Support
*   [ ] Live Chat / Support Ticket System Integration

## XIV. NEW: Operations & Management Enhancements
*   [ ] Advanced Reporting & Business Intelligence
    *   [ ] Comprehensive suite of pre-defined reports (sales, claims, commissions)
    *   [ ] Report Builder for Custom Reports
    *   [ ] Data Export (CSV, Excel, PDF)
*   [ ] Advanced Document Management (versioning, advanced search, access control)
*   [ ] Internal Task Management System (for broker staff)
*   [ ] Batch Processing for Operations (e.g., renewals, invoicing)

## XV. NEW: Further Advanced Features
*   [ ] Multi-Currency Support
*   [ ] Multi-Language Support
*   [ ] Reinsurance Module (managing reinsurance policies and cessions)
*   [ ] Business Process Automation (BPA) tools
*   **AI/ML Features**
    *   [ ] AI-powered Chatbots
    *   [ ] Predictive Analytics (churn, fraud, upselling)
    *   [ ] AI-assisted Underwriting (basic flags/suggestions)

## XVI. Technical & Non-Functional Requirements (Replaces/Merges with "General / Cross-Cutting Concerns")

*   [ ] Comprehensive Testing Strategy
    *   [ ] Unit Tests (Backend & Frontend for key modules)
    *   [ ] Integration Tests
    *   [ ] E2E Tests (e.g., Cypress, Playwright)
*   [ ] Performance Optimization & Scalability Planning
*   [ ] Database Backup & Disaster Recovery Strategy
*   [ ] Mobile Responsiveness & PWA capabilities for client/agent portals
*   [ ] Comprehensive Error Handling (Backend & Frontend)
*   [ ] Input Validation (Backend & Frontend)
*   [ ] Security Hardening (SQL Injection, XSS, CSRF prevention, etc.)
*   [ ] Logging (Backend - more detailed, structured)
*   [ ] API Documentation (e.g., Swagger/OpenAPI for backend - auto-generation if possible)
*   [ ] Thorough testing of all features on various devices/browsers.
*   [ ] Accessibility (a11y) considerations for frontend.
*   [ ] CI/CD Pipeline Setup

**Legend:**
*   `[ ]` - Not started
*   `[~]` - In progress / Needs further action / Partially complete / Conceptual
*   `[x]` - Completed
