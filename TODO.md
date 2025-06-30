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

## II. Backend Features (Broker/Admin Portal)

*   **Dashboard & Analytics:**
    *   [ ] Overview of key metrics
    *   [ ] Sales performance reports
    *   [ ] Customer demographics and insights
    *   [ ] Claim analysis
    *   [ ] Commission tracking and reports
*   **Customer Management (CRM):**
    *   [ ] Define Customer Model (MongoDB Schema)
    *   [ ] API: Create Customer
    *   [ ] API: View Customer Details
    *   [ ] API: Update Customer
    *   [ ] API: Delete Customer
    *   [ ] API: List/Search Customers
    *   [ ] Customer Segmentation/Grouping logic
    *   [ ] Communication logs (emails, calls, notes)
    *   [ ] Task management related to customers
*   **Policy Management:**
    *   [ ] Define Policy Model
    *   [ ] API: Create New Quote/Proposal
    *   [ ] API: Issue New Policy
    *   [ ] API: View/Search Policies
    *   [ ] API: Manage Policy Endorsements/Amendments
    *   [ ] API: Track Policy Lifecycle
    *   [ ] Automated renewal reminders and processing logic
    *   [ ] Document management for policy documents
*   **Insurance Product Management:**
    *   [ ] Define Product Model
    *   [ ] API: Define/Configure Insurance Products
    *   [ ] API: Manage Product Details
    *   [ ] API: Set up Underwriting Rules (basic structure)
    *   [ ] API: Manage Insurer/Carrier Information for Products
    *   [ ] API: Rate Table Management
*   **Claims Management:**
    *   [ ] Define Claim Model
    *   [ ] API: Log New Claim (FNOL)
    *   [ ] API: Track Claim Status
    *   [ ] API: Assign Claims
    *   [ ] API: Upload/Manage Claim Documents
    *   [ ] API: Communication Log for Claims
    *   [ ] API: Generate Claim Reports (basic)
*   **Billing & Payments:**
    *   [ ] Define Invoice/Payment Models
    *   [ ] API: Generate Invoices
    *   [ ] API: Track Payment Status
    *   [ ] Payment Gateway Integration (Stripe, PayPal, etc.) - Research and implement chosen gateway
    *   [ ] API: Manage Commission Calculations
    *   [ ] API: Reconciliation of Payments
*   **User Management (for Staff/Brokers):**
    *   [ ] Define User Model (Admin/Broker roles)
    *   [~] Authentication (JWT setup - basic structure exists, needs full implementation for login/registration)
    *   [ ] Authorization (Role-Based Access Control - RBAC)
    *   [ ] API: Create Staff/Broker Accounts
    *   [ ] API: View/Edit/Deactivate Staff/Broker Accounts
    *   [ ] Audit trails for user actions
*   **Insurer/Carrier Management:**
    *   [ ] Define Insurer/Carrier Model
    *   [ ] API: Maintain Database of Insurance Carriers
    *   [ ] API: Store Carrier Details & Product Offerings
*   **Reporting & Business Intelligence:**
    *   [ ] Design Reporting Module Structure
    *   [ ] API: Basic Sales Reports
    *   [ ] API: Basic Customer Reports
    *   [ ] Data export capabilities
*   **Communication & Notifications:**
    *   [ ] Setup Email Service (e.g., SendGrid, Nodemailer)
    *   [ ] API: Send Automated Email/SMS Notifications (define triggers)
    *   [ ] Template management for communications
*   **Document Management System (General):**
    *   [ ] Strategy for file uploads (e.g., S3, local storage)
    *   [ ] API: Upload/Download/Delete documents associated with customers, policies, claims
    *   [ ] Versioning and access control for documents
*   **Settings & Configuration:**
    *   [ ] API: Manage System Settings (branding, currency, etc.)
    *   [ ] API: Manage Integration Settings

## III. Customer Portal Features (Frontend)

*   **Dashboard:**
    *   [ ] UI: Overview of active policies
    *   [ ] UI: Pending actions
    *   [ ] UI: Recent claim statuses
*   **My Profile:**
    *   [ ] UI: View/Update personal information
    *   [ ] UI: Manage communication preferences
    *   [ ] UI: Change password and security settings
*   **My Policies:**
    *   [ ] UI: View detailed policy information
    *   [ ] UI: Download policy documents
    *   [ ] UI: Request policy changes/endorsements
    *   [ ] UI: View premium payment history
    *   [ ] UI: Initiate policy renewal
*   **Get a Quote / New Insurance:**
    *   [ ] UI: Browse available insurance products
    *   [ ] UI: Forms to get personalized quotes
    *   [ ] UI: Compare quotes
    *   [ ] UI: Purchase new policies online (if enabled)
*   **Claims:**
    *   [ ] UI: Submit a new claim (FNOL) online
    *   [ ] UI: Upload supporting documents/photos for claims
    *   [ ] UI: Track status of submitted claims
    *   [ ] UI: View claim history
*   **Payments:**
    *   [ ] UI: View outstanding premium payments
    *   [ ] UI: Make online payments securely
    *   [ ] UI: View payment history and download receipts
*   **Documents:**
    *   [ ] UI: Access/Download personal insurance-related documents
    *   [ ] UI: Upload documents required by the broker
*   **Support & Communication:**
    *   [ ] UI: Secure messaging with the broker
    *   [ ] UI: FAQ section
    *   [ ] UI: Contact information for support
*   **Notifications:**
    *   [ ] UI: View notifications (policies, claims, payments)
*   **Authentication:**
    *   [ ] UI: Login Page
    *   [ ] UI: Registration Page (if applicable)
    *   [ ] UI: Forgot Password / Reset Password flow
    *   [~] Connect to Backend Auth (JWT handling - basic structure needs connection)

## IV. General / Cross-Cutting Concerns

*   [ ] Comprehensive Error Handling (Backend & Frontend)
*   [ ] Input Validation (Backend & Frontend)
*   [ ] Security Hardening (SQL Injection, XSS, CSRF prevention, etc.)
*   [ ] Logging (Backend - more detailed)
*   [ ] Unit Tests (Backend & Frontend for key modules)
*   [ ] Integration Tests
*   [ ] E2E Tests (e.g., Cypress, Playwright)
*   [ ] CI/CD Pipeline Setup
*   [ ] API Documentation (e.g., Swagger/OpenAPI for backend)
*   [ ] Thorough testing of all features on various devices/browsers.
*   [ ] Accessibility (a11y) considerations for frontend.
*   [ ] Performance Optimization.
*   [~] README files updates (this task)

**Legend:**
*   `[ ]` - Not started
*   `[~]` - In progress / Needs further action / Partially complete
*   `[x]` - Completed
