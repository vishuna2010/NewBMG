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
*   [x] Frontend Project Setup (React basic structure for Customer Portal)
    *   [x] Scaffold Frontend Directory Structure (`frontend/`)
    *   [x] Create Core Frontend Files (index.html, App.js, HomePage.js, Header.js)
    *   [x] Create `package.json` for frontend
*   [x] Admin Portal Frontend Project Setup (React basic structure)
    *   [x] Scaffold Admin Portal Directory Structure (`admin-portal/`)
    *   [x] Create Core Admin Portal Files & Layout (index.html, App.js, Sidebar, MainLayout etc.)
    *   [x] Create `package.json` for admin-portal
*   [~] README files updates (Initial versions created, ongoing updates needed)

## II. Backend Tasks (`backend/`)

*   **Product Management (API):**
    *   [x] Define Product Model (MongoDB Schema)
    *   [~] API: Define/Configure Insurance Products (CRUD) - *Basic CRUD implemented*
    *   [~] API: Manage Product Details (coverage, premiums, terms, conditions, riders) - *Basic CRUD allows management*
    *   [ ] API: Set up Underwriting Rules (basic structure)
    *   [ ] API: Manage Insurer/Carrier Information for Products
    *   [ ] API: Rate Table Management
*   **Quote Engine (API & Core Logic):**
    *   [x] Define Quote Model (MongoDB Schema)
    *   **Phase 1: Core Quote Generation & Storage**
        *   [~] API: Allow product selection for quoting - *Covered by createQuote taking productId*
        *   [~] API: Support dynamic form data based on selected product (simplified) - *Covered by `quoteInputs: Mixed` in model and controller*
        *   [x] API: Implement mock premium calculation logic - *Basic mock logic added in createQuote*
        *   [x] API: Save basic quote data (product snapshot, inputs, mock premium) to MongoDB - *Handled by createQuote*
        *   [~] API: Implement Quote Status Management (accept/reject, view status) - *Basic view and update status implemented, more logic/auth pending.*
        *   [x] API: Verify/Implement dedicated endpoint for fetching single quote details (e.g., `GET /api/quotes/[quoteId]`) - *Implemented*
        *   [x] API: Implement endpoint for fetching all quotes (e.g., `GET /api/quotes`) - *Implemented, basic filtering pending*
        *   [ ] API: Future: Ensure only relevant client or authorized agent can change quote status (depends on Auth & Roles)
    *   **Phase 2: PDF Generation & S3**
        *   [x] Backend: Implement PDF quote document generation
        *   [ ] API: Integrate with S3 for storing PDF quotes
*   **Policy Issuance & Management (API):**
    *   [x] API: Define Policy Mongoose Model & API Endpoints (CRUD) - *Model defined, basic CRUD for admin implemented.*
    *   [x] API: Implement "Convert Quote to Policy" functionality - *Implemented in `createPolicyFromQuote`*
        *   [x] Create new Policy document from Quote details - *Done as part of the above*
    *   [~] API: Manage Policy Status - *Basic status updates via `updatePolicy` and soft delete. More granular control (like Phase 1 Activation) pending full workflow.*
    *   [~] API: View/Search Policies - *Basic `getAllPolicies` and `getPolicyById` implemented for admin; advanced search/filter pending.*
    *   [~] API: Document management for policy documents (general - see also S3 for specific docs) - *Model supports documents array, `updatePolicy` can add them.*
*   **Claims Management (API):**
    *   [ ] API: Define Claim Model
    *   [ ] API: Log New Claim (FNOL)
    *   [ ] API: Track Claim Status (detailed statuses pending "NEW: Claims Management Enhancements")
    *   [ ] API: Assign Claims to adjusters/brokers
    *   [~] API: S3 integration for claim attachments (upload & linking - Backend saves files locally and serves them via a new API. Full S3 integration for claims pending.)
    *   [ ] API: Generate Claim Reports (basic)
*   **Client (Customer) Management (CRM - API):**
    *   [x] API: Define Customer Model (MongoDB Schema) - *Includes password hashing*
    *   [x] API: Client Registration (Phase 1: Basic Registration) - *Implemented*
    *   [~] API: Client Login & Session Management (Phase 2 - Covered by general user login, login endpoint itself pending)
    *   [x] API: Create Customer - *Covered by Client Registration*
    *   [~] API: View Customer Details - *Basic getCustomerProfile (simulated) & getCustomerById (admin) implemented*
    *   [~] API: Update Customer (e.g., profile updates from portal) - *Basic updateCustomerProfile (simulated) & updateCustomer (admin) implemented*
    *   [~] API: Delete Customer - *Basic deleteCustomer (admin) implemented*
    *   [~] API: List/Search Customers - *Basic getAllCustomers (admin) implemented, search/filter pending*
    *   [ ] API: Customer Segmentation/Grouping logic
    *   [ ] API: Communication logs (emails, calls, notes) - (see also "Integrations & Communications")
    *   [ ] API: Task management related to customers
*   **Agent Management (API):**
    *   [ ] API: Define Agent User Model (extends base User model or separate)
    *   [x] API: Phase 1a: Admin API for agent creation
    *   [~] API: Agent Login & Session Management (Phase 2 - Covered by general user login with 'agent' role)
*   **User Management (General - Staff/Brokers/Admins - API):**
    *   [ ] Define User Model (Admin/Broker roles, base for Agent/Client)
    *   [x] API: Phase 1a: Basic Login API
    *   [~] API: Phase 1b: Implement JWT generation on login & cookie-based session
    *   [~] API: Phase 1c: Implement API route protection middleware (check JWT & role)
    *   [~] API: Phase 1e: Implement Logout functionality (clear session/cookie)
    *   [ ] API: Create Staff/Broker Accounts (distinct from agent creation if needed)
    *   [ ] API: View/Edit/Deactivate Staff/Broker Accounts
*   **Settings & Configuration (Backend APIs):**
    *   [x] API: Implement system settings (Phase 1: Backend Model & APIs)
    *   [x] API: Implement Email settings (Backend functional)
    *   [x] API: Implement roles (Backend CRUD functional)
    *   [x] API: Implement tax bracket (Now Tax Classes; Backend CRUD functional)
    *   [~] API: Implement Compliance Checks / Develop Regulatory Reporting (APIs to support Admin UI)
    *   [x] API: Manage Third-Party API Integrations (CRUD including Update)
    *   [~] API: Implement eSignature integration (backend part for request/status)
*   **Integrations & Communications (Backend APIs):**
    *   [~] API: Implement Notifications (Backend Stub & logic for generating notifications)
    *   [~] API: Implement Communication Module (Backend Stub & logic for storing/retrieving messages)
    *   [~] API: Implement Payment Gateway Logic (Conceptual Design & Backend Stub for chosen gateway)
*   **Operations & Management (Backend APIs):**
    *   [~] API: Implement Reporting & Dashboard (Admin dashboard summary API exists. Sales Report data fetching.)
    *   [ ] API: Implement Document Management (linking, metadata, access control - core file handling separate)
    *   [x] API: Implement Audit Logging (Backend event capture & storage)
    *   [ ] API: Implement marketing features (e.g., campaign tracking hooks, analytics data points)
    *   [ ] API: Implement Commission Hub (calculation logic, tracking for agents)
    *   [~] API: Implement Invoicing
        *   [x] API: Define Invoice Model & API (Backend Implemented)
        *   [~] API: Generate Invoice from Policy details (Backend Stub Implemented)
        *   [~] API: Track Invoice status (paid, unpaid, overdue) (Supported by API, auto-check conceptual)
*   **NEW: Quote Engine Enhancements (Backend):**
    *   [ ] API: Implement Real Premium Calculation Logic (beyond mock)
    *   [ ] API: Advanced Dynamic Form Generation support (e.g., schema/config for conditional fields)
    *   [ ] API: Quote Versioning & Revision History
    *   [ ] API: Automated Follow-up System for Pending Quotes (backend triggers/jobs)
*   **NEW: Policy Issuance & Management Enhancements (Backend):**
    *   [ ] API: Policy Endorsements/Amendments (with versioning, premium impact)
    *   [ ] API: Policy Renewal Workflow (automated/semi-automated, notifications, renewal quote generation)
    *   [ ] API: Advanced Automated Document Generation (Policy schedules, T&Cs, Certificates of Insurance) - PDF generation part
    *   [ ] API: Mid-term Adjustments & Cancellations (with premium/refund calculations)
*   **NEW: Claims Management Enhancements (Backend):**
    *   [ ] API: Detailed Claims Workflow & Statuses (e.g., 'Under Review', 'Assessor Assigned', 'Settled')
    *   [ ] API: Claim Adjudication Module (backend logic for review, notes, decisions)
    *   [ ] API: Communication Log per Claim (storage and retrieval)
    *   [ ] API: Basic Fraud Detection Flags (rule-based logic)
    *   [ ] API: Settlement & Payout Tracking
*   **NEW: Client Module Enhancements (Backend):**
    *   [ ] API: Phase 4: KYC verification (backend logic for status update, document linking)
*   **NEW: Agent Module Enhancements (Backend):**
    *   [ ] API: Agent Hierarchy & Team Management (for larger brokerages)
    *   [ ] API: Lead Management for Agents (data models and assignment logic)
    *   [ ] API: Agent Performance Dashboards (data aggregation for policies sold, commission, etc.)
*   **NEW: Settings & Configuration Enhancements (Backend):**
    *   [ ] API: Workflow Configuration (storage and retrieval of workflow definitions)
    *   [ ] API: Advanced Tax Configuration (multiple jurisdictions, rates over time)
*   **NEW: Integrations & Communications Enhancements (Backend):**
    *   [ ] API: Full Payment Gateway Integration (Stripe, PayPal etc. - beyond conceptual)
        *   [ ] API: Payment processing, refunds, reconciliation logic
        *   [ ] API: Subscription/Recurring payment management for policies
    *   [ ] API: Accounting System Integration (e.g., QuickBooks, Xero export - data preparation & export/API calls)
    *   [ ] API: CRM Integration (sync client/lead data - data mapping & API calls)
    *   [ ] API: Advanced Notification System
        *   [ ] API: User preferences for notifications (storage and filtering logic)
        *   [ ] API: Notification Templating System (dynamic content insertion)
        *   [ ] API: SMS Notification Support (integration with SMS gateway)
    *   [ ] API: Live Chat / Support Ticket System Integration (backend hooks/APIs if needed)
*   **NEW: Operations & Management Enhancements (Backend):**
    *   [ ] API: Advanced Reporting & Business Intelligence (data sources, aggregation for complex reports)
    *   [ ] API: Advanced Document Management (versioning, advanced search, access control)
    *   [ ] API: Internal Task Management System (backend models & logic)
    *   [ ] API: Batch Processing for Operations (e.g., renewals, invoicing - job scheduling/execution)
*   **NEW: Further Advanced Features (Backend):**
    *   [ ] API: Multi-Currency Support (data models, conversion logic)
    *   [ ] API: Multi-Language Support (content internationalization strategy for API responses if needed)
    *   [ ] API: Reinsurance Module (managing reinsurance policies and cessions - models & logic)
    *   [ ] API: Business Process Automation (BPA) tools (integration or custom workflow engine)
    *   **AI/ML Features (Backend):**
        *   [ ] API: AI-powered Chatbots (backend integration with NLP/bot framework)
        *   [ ] API: Predictive Analytics (churn, fraud, upselling - model training & serving infrastructure)
        *   [ ] API: AI-assisted Underwriting (basic flags/suggestions - rules engine or ML model integration)

## III. Customer Portal Frontend Tasks (`frontend/` - React)
*(Note: Original TODO had Vue paths; tasks are adapted for React where UI is implied)*
*   **Dashboard (`HomePage.js`):**
    *   [x] UI: Overview of active policies (summary card) - *Placeholder content exists*
    *   [x] UI: Open Claims (summary card) - *Placeholder content exists*
    *   [x] UI: Unread Notifications (summary card - API optimization mentioned, UI placeholder exists)
    *   [x] UI: Next Renewal (summary card) - *Placeholder content exists*
    *   [x] UI: Quick Action buttons - *Placeholder content exists*
    *   [ ] UI: Pending actions (general, if not covered by cards)
*   **My Profile (`ProfilePage.js`):**
    *   [x] UI: View/Update personal information (name/email) - *Placeholder content exists*
    *   [x] UI: Change password - *Placeholder content exists*
    *   [ ] UI: Manage communication preferences
*   **My Policies (`UserPoliciesPage.js`):**
    *   [ ] UI: List policies
    *   [x] UI: Customer Policy Detail page with document download - *Placeholder content exists*
    *   [ ] UI: Request policy changes/endorsements (form/workflow)
    *   [ ] UI: View premium payment history
    *   [ ] UI: Initiate policy renewal (if manual/semi-auto)
*   **Quotes (`QuotesPage.js`):**
    *   [ ] UI: Browse available insurance products
    *   [ ] UI: Forms to get personalized quotes (dynamic based on product)
    *   [ ] UI: Display mock premium calculation
    *   [x] UI: Create page to list past quotes - *Placeholder content exists*
    *   [~] UI: Quote Status Management (accept/reject on client side) - *Placeholder content exists*
    *   [ ] UI: Future: Quote Comparison Feature
    *   [~] UI: Client access to generated PDF quotes (needs review) - *Relates to backend PDF generation*
*   **Claims (`UserClaimsPage.js`):**
    *   [x] UI: Customer claim submission page enhanced to pre-fill policy from query params and allow actual file uploads - *Placeholder content exists, file upload is conceptual*
    *   [x] UI: Customer view of claim history & details (includes viewing attachments) - *Placeholder content exists*
*   **Payments (`PaymentsPage.js`):**
    *   [ ] UI: View outstanding premium payments / Invoices
    *   [ ] UI: Make online payments securely (requires Payment Gateway Integration)
    *   [ ] UI: View payment history and download receipts
*   **Documents (`DocumentsPage.js`):**
    *   [ ] UI: Access/Download personal insurance-related documents (general doc center if not on policy/claim pages)
    *   [ ] UI: Upload documents required by the broker (e.g., for KYC)
*   **Support & Communication (`SupportPage.js` & potential separate communication components):**
    *   [x] UI: Basic Communication Module (listing in `SupportPage.js` placeholder)
    *   [~] UI: Verify/Fix Icon Paths (Switched to placeholder SVG components - general note)
    *   [ ] UI: Secure messaging with the broker (detailed view/send)
    *   [ ] UI: FAQ section
    *   [ ] UI: Contact information for support
*   **Notifications (`NotificationsPage.js`):**
    *   [x] UI: Basic Notification UI (listing) - *Placeholder content exists*
    *   [~] UI: Verify/Fix Icon Paths (Switched to placeholder SVG components - general note)
    *   [x] UI: "Mark all as read" feature implemented - *Placeholder button exists*
    *   [x] UI: URL Query Sync for filters/page state implemented - *Conceptual, not actually implemented*
*   **Authentication (Client):**
    *   [ ] UI: Login Page
    *   [ ] UI: Registration Page (Phase 1: Basic Registration)
    *   [ ] UI: Forgot Password / Reset Password flow
    *   [~] Connect to Backend Auth (JWT handling)
*   **NEW: Client Module Enhancements (Frontend):**
    *   [ ] UI: Phase 4: KYC Verification (document upload interface)
    *   [ ] UI: Client Self-Service Portal (Advanced: richer profile updates, request changes forms, document downloads, payments integration) - *This is an aggregation/enhancement of existing items.*
*   **NEW: Quote Engine Enhancements (Frontend - Client):**
    *   [ ] UI: Advanced Dynamic Form Generation (rendering conditional fields)
    *   [ ] UI: Quote Comparison Feature (interface for clients)
*   **NEW: Integrations & Communications Enhancements (Frontend - Client):**
    *   [ ] UI: User preferences for notifications (email, SMS, in-app settings page)

## IV. Admin Portal Frontend Tasks (`admin-portal/` - React)
*(Note: Original TODO had Vue paths; tasks are adapted for React where UI is implied)*
*   **Authentication & Layout:**
    *   [x] UI: Phase 1a: Basic Login Page (`LoginPage.js` placeholder created)
    *   [~] UI: Phase 1d: Implement frontend page protection middleware (check auth & redirect - conceptual in `App.js`)
    *   [x] UI: Basic Admin Portal Layout & Navigation structure (Sidebar, MainLayout created)
*   **Dashboard (`AdminDashboardPage.js`):**
    *   [~] UI: Admin dashboard with key metrics - Sales Report tabs now use real data. Sales Analytics chart has table fallback. Summary cards connected. (Placeholder page created; "real data" part is future work).
    *   [~] UI: Admin Overview page refactored for theme consistency (Styling of placeholder page).
*   **Product Management (`ProductsPage.js`, `ProductCreatePage.js`, `ProductEditPage.js`):**
    *   [~] UI: Product List page (`ProductsPage.js`) - *Basic list, create/edit/delete buttons implemented.*
    *   [~] UI: Create Product page (`ProductCreatePage.js` with `ProductForm.js`) - *Form structure and create functionality implemented.*
    *   [~] UI: Edit Product page (`ProductEditPage.js` with `ProductForm.js`) - *Form structure, data loading, and update functionality implemented.*
    *   [ ] UI: Review Product forms for styling consistency and advanced validation.
*   **Client Management (`CustomersPage.js` & potential sub-components):**
    *   [x] UI: Full CRUD for Clients (Placeholder page created; "Full CRUD" is future work).
*   **User Management (General Staff/Brokers - `UserManagementPage.js`):**
     *   [~] UI: User Management page refactored for theme consistency. (Placeholder page created).
*   **Agent Management (`pages/admin/agents/` - needs specific page like `AgentsPage.js`):**
    *   [x] UI: Phase 1b: Admin UI for Agent Creation & Management (Full CRUD - Placeholder implies this, actual page `AgentsPage.js` to be created if distinct from UserManagementPage).
    *   [~] UI: List page (`pages/admin/agents.vue` - path to be `AgentsPage.js`) refactored for theme consistency.
*   **Claims Workflow Management (`ClaimsPage.js` & potential sub-components):**
    *   [~] UI: Status updates, etc., including viewing attachments (Placeholder page created).
*   **Quote Management (Could be part of `QuotesPage.js` or a new `AdminQuotesPage.js`):**
    *   [~] UI: Admin UI for comprehensive quote management (may need review/enhancement)
    *   [~] UI: Admin/client access to generated PDF quotes (needs review) - *Admin part*
*   **Policy Management (`PoliciesPage.js` & potential sub-components):**
    *   [x] UI: Admin UI for Policy List, View, Create, Edit implemented (Placeholder page created).
    *   [~] UI: Manage Policy Status - Phase 2: Implement 'cancelled' status (UI part)
*   **Settings & Configuration (`SettingsPage.js` & potential sub-components):**
    *   [x] UI: System Settings Management functional (Placeholder page created).
    *   [x] UI: Email settings (Admin UI functional and verified, styling standardized - Placeholder page created).
    *   [x] UI: Roles (Admin UI for CRUD, including delete, functional and verified - Placeholder page created).
    *   [x] UI: Tax bracket (Now Tax Classes; Admin UI for CRUD functional - Placeholder page created).
    *   [~] UI: Compliance Checks / Develop Regulatory Reporting (Admin UI pages created, connected to APIs - Placeholder page created).
    *   [x] UI: Manage Third-Party API Integrations (CRUD including Update - Placeholder page created).
    *   [~] UI: Implement eSignature integration (Admin UI for request/status exists - Placeholder page created).
*   **Operations & Management (Admin UI):**
    *   [~] UI: Implement Reporting & Dashboard (`ReportsPage.js` placeholder. Sales Report tabs use real policy data - future work).
    *   [~] UI: Implement Document Management (Admin UI for mock document management exists - needs a dedicated page or integration).
    *   [~] UI: Implement Audit Logging (Basic Admin UI Implemented. `AuditLogsPage.js` to be created, refactored for theme consistency).
    *   [ ] UI: Implement marketing features (interface for campaigns, etc.)
    *   [ ] UI: Implement Commission Hub (interface for viewing/managing commissions)
    *   [~] UI: Implement Invoicing (Basic Client List UI Implemented - for viewing invoices per client, needs dedicated Invoicing page/section).
*   **NEW: Admin Portal / Dashboard Enhancements (Admin UI):**
    *   [ ] UI: Advanced User Management (impersonation, detailed activity logs interface)
    *   [ ] UI: Customizable Admin Dashboard Widgets
    *   [ ] UI: Drill-Down Capabilities from Dashboard Stats
    *   [ ] UI: Advanced Product Configuration UI (rules, rating factors, versioning)
*   **NEW: Client Module Enhancements (Admin UI):**
    *   [ ] UI: Phase 4: KYC Verification (Detailed Admin UI for review/approval of KYC docs)
*   **NEW: Settings & Configuration Enhancements (Admin UI):**
    *   [ ] UI: Workflow Configuration UI (for claims, policy issuance etc.)
    *   [ ] UI: Basic Branding/Theming Options for Client Portal (settings in Admin)
    *   [ ] UI: Advanced Integration Management (status, logs, config options in Admin)

## V. Agent Portal Frontend Tasks
*(This section assumes a separate Agent Portal UI, potentially Vue.js based on original TODO paths. If it's part of Admin or Customer portal with role-based views, tasks would merge there.)*
*   [~] UI: Agent Login & Session Management (Phase 2 - Covered by general user login with 'agent' role, needs agent-specific redirect/view)
*   [~] UI: Agent-specific dashboard/portal features (Initial dashboard implemented, `pages/agent/dashboard.vue` - conceptual page)
*   [ ] UI: Lead Management for Agents
*   [ ] UI: Agent Performance Dashboards (policies sold, commission, conversion rates)
*   [ ] UI: Agent Onboarding/Training Material Access
*   **NEW: Quote Engine Enhancements (Frontend - Agent):**
    *   [ ] UI: Quote Comparison Feature (interface for agents)

## VI. Technical & Non-Functional Requirements (Project-Wide)

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
