# CarBroker Ethiopia - Software Requirements Specification (SRS)

**Version:** 1.0  
**Status:** FINAL  
**Date:** June 2024  
**Document Type:** IEEE 830-2009 Compliant  
**Platform:** Multi-tenant Web & Mobile Application  

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **CarBroker**, a digital marketplace platform that connects car brokers with buyers for the sale of used vehicles in Ethiopia. This document serves as a contract between stakeholders and the development team, detailing what the system must do.

### 1.2 Scope

**In Scope:**
- Multi-sided marketplace connecting brokers, sellers, and buyers
- Broker management and verification system
- Car listing management with image uploads
- Buyer search and filtering functionality
- Direct messaging system between brokers and buyers
- Commission calculation and payment processing
- Admin dashboard for platform moderation
- Mobile-responsive web interface
- Integration with Ethiopian payment gateways (Telebirr, Chapa)
- Analytics and reporting dashboard

**Out of Scope:**
- Vehicle financing (separate partnership)
- Vehicle inspection services (Phase 2)
- Insurance products (Phase 2)
- Mobile native apps (Phase 2)
- Vehicle registry integration (Phase 2)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| **Broker** | Registered user who lists vehicles for sale on behalf of sellers |
| **Buyer** | User who searches for and inquires about vehicles |
| **Seller** | Individual vehicle owner (may or may not be on platform) |
| **Admin** | Platform administrator with moderation and reporting capabilities |
| **Commission** | Percentage fee taken by platform from successful sale |
| **Listing** | A vehicle advertisement created by a broker |
| **Inquiry** | A buyer's request for more information about a listing |
| **MRR** | Monthly Recurring Revenue |
| **KYC** | Know Your Customer verification |
| **API** | Application Programming Interface |
| **MVP** | Minimum Viable Product |
| **ETB** | Ethiopian Birr (currency) |

### 1.4 References

- IEEE Std 1016-2009: Standard for Information and Documentation—Software Design Descriptions
- ISO/IEC/IEEE 42010:2011: Systems and software engineering — Architecture description
- Payment Gateway Documentation: Telebirr API v2.0, Chapa API v1.0
- REST API Best Practices (OpenAPI 3.0 specification)

---

## 2. Overall Description

### 2.1 Product Perspective

CarBroker is a standalone web-based SaaS platform with future mobile extensions. It operates as a multi-tenant marketplace with three primary user groups:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Brokers   │         │   Platform   │         │   Buyers    │
│  (Sellers)  ├────────►│  (CarBroker) │◄────────┤  (Buyers)   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ├── Admin Dashboard
                              ├── Payment Processing
                              ├── Analytics/Reporting
                              └── Moderation
```

### 2.2 Product Functions

1. **Broker Management**
   - Registration and KYC verification
   - Profile management and verification badge
   - Commission tracking and payout management

2. **Car Listing Management**
   - Create, edit, delete listings
   - Image uploads and management
   - Vehicle specifications and details
   - Price management
   - Listing status (active, sold, inactive)

3. **Buyer Engagement**
   - Advanced search and filtering
   - Car detail viewing
   - Inquiry/messaging system
   - Saved listings (wishlist)
   - Broker contact information

4. **Communication**
   - In-platform messaging
   - WhatsApp integration
   - Email notifications
   - Inquiry tracking

5. **Commerce**
   - Commission calculation
   - Payment processing
   - Payout management
   - Sales tracking

6. **Platform Moderation**
   - Listing approval workflow
   - Broker verification and suspension
   - Dispute resolution
   - Fraud detection

### 2.3 User Characteristics

| User Type | Technical Level | Primary Goals | Volume |
|-----------|-----------------|---------------|--------|
| **Broker** | Medium | List vehicles, track sales, earn commissions | 50-100 (MVP) |
| **Buyer** | Low-Medium | Find vehicles, compare prices, contact brokers | 500-1000/month |
| **Admin** | High | Monitor platform, moderate content, manage payouts | 2-3 |
| **Support Staff** | Medium | Handle disputes, respond to inquiries | 1-2 |

### 2.4 Operating Environment

**Target Deployment:**
- **Cloud Provider:** AWS, DigitalOcean, or local server (TBD)
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS Safari, Android Chrome (responsive design)
- **Internet:** Minimum 512 kbps connection

**Regional Context:**
- **Primary Market:** Addis Ababa, Ethiopia
- **Languages:** Amharic (primary), English (secondary)
- **Currency:** Ethiopian Birr (ETB)
- **Time Zone:** EAT (UTC+3)
- **Payment Methods:** Telebirr, Chapa, Bank transfer

### 2.5 Design and Implementation Constraints

- **Architecture:** Multi-tenant with role-based access control (RBAC)
- **Database:** PostgreSQL with row-level security
- **API:** RESTful architecture with JSON payloads
- **Frontend:** Responsive React-based single-page application
- **Scalability:** Stateless backend, horizontal scaling ready
- **Compliance:** GDPR-compliant (data privacy), Payment Card Industry (PCI) ready
- **Hosting:** Cloud-based with automatic backups and disaster recovery

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Registration & Authentication

**FR-1.1: Broker Registration**
- **Actor:** Prospective Broker
- **Precondition:** User has valid phone number and email
- **Flow:**
  1. User accesses registration form
  2. Enters name, phone number, email, business name
  3. Creates password (minimum 8 characters, mixed case + numbers)
  4. Submits for verification
  5. Receives OTP on phone
  6. Enters OTP to confirm registration
  7. Broker account created with "Unverified" status
- **Postcondition:** Broker account active, verification badge pending
- **Acceptance Criteria:**
  - Phone number is unique and valid Ethiopian number
  - Email is unique and valid format
  - Password meets complexity requirements
  - OTP verified within 10 minutes
  - Broker profile created in database

**FR-1.2: Buyer Registration (Optional)**
- **Actor:** Prospective Buyer
- **Flow:**
  1. User enters email/phone
  2. Receives verification code
  3. Sets password
  4. Completes basic profile (name, location)
- **Postcondition:** Buyer account created with "Active" status
- **Acceptance Criteria:**
  - Registration completes in <2 minutes
  - No KYC required for buyers
  - Email or phone verified

**FR-1.3: Broker KYC Verification**
- **Actor:** Admin, Broker
- **Prerequisites:** Broker registered but unverified
- **Flow:**
  1. Broker uploads government ID (passport, driver's license, national ID)
  2. Uploads business registration document (if applicable)
  3. Provides phone contact reference
  4. Admin reviews documents (manual process for MVP)
  5. Admin approves or rejects with reason
  6. Broker notified via email/SMS
- **Postcondition:** Broker account either "Verified" or "Rejected"
- **Acceptance Criteria:**
  - Document images are clear and readable
  - Identity information matches registration
  - Verification completes within 24-48 hours
  - Rejection reason provided if denied

**FR-1.4: Login/Logout**
- **Actor:** Broker, Buyer, Admin
- **Flow:**
  1. User enters email/phone and password
  2. System validates credentials against database
  3. Issues JWT token (valid for 7 days)
  4. Redirects to dashboard
- **Logout:**
  1. User clicks logout
  2. JWT token invalidated
  3. Session cleared
- **Acceptance Criteria:**
  - Login succeeds with correct credentials
  - Login fails with incorrect password (max 5 attempts, 15-min lockout)
  - JWT tokens securely stored in httpOnly cookies
  - Logout clears all session data

**FR-1.5: Password Reset**
- **Actor:** Registered User
- **Flow:**
  1. User clicks "Forgot Password"
  2. Enters email/phone
  3. Receives reset link via email or OTP via SMS
  4. Clicks link or enters OTP
  5. Sets new password
  6. Directed to login
- **Acceptance Criteria:**
  - Reset link valid for 30 minutes
  - OTP valid for 10 minutes
  - New password must meet complexity requirements

---

#### 3.1.2 Broker Profile Management

**FR-2.1: Broker Profile Setup**
- **Actor:** Broker
- **Flow:**
  1. Broker accesses "My Profile" section
  2. Completes/edits fields:
     - Business name
     - Contact phone (primary & secondary)
     - Email
     - WhatsApp number
     - Location/address
     - Business description (optional)
     - Profile photo
  3. Saves profile
- **Postcondition:** Broker profile updated
- **Acceptance Criteria:**
  - All required fields validated
  - Phone numbers tested for validity
  - Profile photo uploaded (max 5MB, JPEG/PNG)
  - Changes saved to database within 2 seconds

**FR-2.2: Broker Verification Badge**
- **Actor:** System
- **Flow:**
  1. System checks broker's KYC status, listing count, and sales rating
  2. Displays verification badge on profile
  3. Badge shows: "Verified ✓" (if approved) or "Unverified" (if pending/rejected)
- **Acceptance Criteria:**
  - Badge visible on broker profile to buyers
  - Badge prominent in search/listing results
  - "Verified" badge granted only after KYC approval
  - Buyers can click badge to see verification details

**FR-2.3: Broker Commission Tracking**
- **Actor:** Broker
- **Flow:**
  1. Broker accesses "Earnings" dashboard
  2. Views:
     - Total sales this month
     - Commission rate (8-12%)
     - Pending commission (unsold/incomplete)
     - Paid commission (settled)
     - Payout history
  3. Can request payout (if balance > 500 ETB)
- **Postcondition:** Payout request created
- **Acceptance Criteria:**
  - Commission calculation correct (10% by default)
  - Real-time balance updates
  - Payout history searchable by date
  - Export commission report as CSV

---

#### 3.1.3 Car Listing Management

**FR-3.1: Create Listing**
- **Actor:** Broker
- **Flow:**
  1. Broker clicks "Add New Listing"
  2. Fills form with vehicle details:
     - **Basic Info:**
       - Make (dropdown: Toyota, Honda, etc.)
       - Model (dropdown, filtered by make)
       - Year (dropdown: current year - 30 years)
       - Body Type (Sedan, SUV, Truck, Minibus, etc.)
       - Transmission (Manual, Automatic)
       - Fuel Type (Petrol, Diesel, Hybrid, Electric)
       - Mileage (in kilometers)
     - **Pricing:**
       - Price (in ETB)
       - Currency display (ETB or USD)
     - **Condition:**
       - Vehicle Condition (Excellent, Good, Fair, Poor)
       - Service History (Yes/No)
       - Accident History (Yes/No/Unknown)
     - **Features:**
       - Air Conditioning (Yes/No)
       - Power Steering (Yes/No)
       - Central Locking (Yes/No)
       - Alloy Wheels (Yes/No)
       - Sunroof (Yes/No)
       - Custom features (text field)
     - **Location:** Subcity or district in Addis
     - **Description:** Free text (max 500 characters)
     - **Images:** Upload 5-10 photos
  3. Previews listing
  4. Submits for publication
- **Postcondition:** Listing created with "Pending Approval" status
- **Acceptance Criteria:**
  - All required fields validated
  - Images compressed and validated (JPEG/PNG, <5MB each)
  - Price is numeric and > 0
  - Listing preview matches submitted data
  - Confirmation email sent to broker

**FR-3.2: Edit Listing**
- **Actor:** Broker
- **Flow:**
  1. Broker views "My Listings"
  2. Clicks "Edit" on a listing
  3. Modifies fields (same as FR-3.1)
  4. Saves changes
- **Postcondition:** Listing updated
- **Acceptance Criteria:**
  - Only broker who created listing can edit
  - Changes saved within 2 seconds
  - Listing status does not change (remains "Active" if was active)
  - Confirmation notification sent

**FR-3.3: Delete Listing**
- **Actor:** Broker
- **Flow:**
  1. Broker clicks "Delete" on listing
  2. System shows confirmation dialog: "This will remove the listing permanently"
  3. Broker confirms
  4. Listing marked as "Deleted" (soft delete)
- **Postcondition:** Listing no longer visible to buyers
- **Acceptance Criteria:**
  - Soft delete (preserved in database for audit)
  - Confirmation required before deletion
  - Deleted listings not searchable by buyers

**FR-3.4: Mark Listing as Sold**
- **Actor:** Broker
- **Flow:**
  1. Broker clicks "Mark as Sold" on listing
  2. Optionally enters buyer contact info
  3. System records sale date
  4. Listing status changed to "Sold"
  5. Commission calculated and added to broker's balance
- **Postcondition:** Listing status = "Sold", commission pending payout
- **Acceptance Criteria:**
  - Only broker can mark own listing as sold
  - Commission calculated immediately (10% of price)
  - Buyer can no longer send inquiries to sold listing
  - Admin can see sale for reporting

**FR-3.5: Image Management**
- **Actor:** Broker
- **Flow:**
  1. Broker uploads images during listing creation
  2. Images stored in cloud storage (AWS S3 or similar)
  3. Broker can reorder images (drag & drop)
  4. First image becomes listing thumbnail
  5. All images auto-compressed for web viewing
- **Postcondition:** Images stored and indexed with listing
- **Acceptance Criteria:**
  - Image upload <10 seconds per image
  - Auto-compression to max 1920x1440 resolution
  - Minimum 5 images required
  - Maximum 10 images per listing
  - Images serve from CDN with <500ms load time

---

#### 3.1.4 Car Search & Discovery

**FR-4.1: Advanced Search**
- **Actor:** Buyer
- **Flow:**
  1. Buyer lands on homepage/search page
  2. Sees search form with filters:
     - **Text Search:** Make, model, keyword (searches listing titles & descriptions)
     - **Price Range:** Min and Max price (ETB)
     - **Year Range:** Min and Max year
     - **Make/Model:** Dropdowns
     - **Body Type:** Checkboxes
     - **Transmission:** Automatic, Manual, All
     - **Fuel Type:** Petrol, Diesel, Hybrid, Electric
     - **Mileage Range:** Min and Max km
     - **Location:** Subcity/district (multi-select)
     - **Condition:** Excellent, Good, Fair, Poor (checkboxes)
     - **Features:** Air Conditioning, Power Steering, etc. (checkboxes)
  3. Clicks "Search" or filters update results in real-time
  4. Results displayed as list with:
     - Thumbnail image
     - Vehicle make/model/year
     - Price (in ETB)
     - Mileage
     - Condition
     - Location
     - Broker name & verification badge
  5. Results paginated (10 per page, can adjust)
- **Postcondition:** Search results displayed
- **Acceptance Criteria:**
  - Search returns results matching ALL applied filters
  - Results sorted by date (newest first) by default
  - Alternative sorts available: Price (low-high, high-low), Mileage (low-high), Date Listed
  - Search completes <1 second
  - No results page shows helpful message with suggestions

**FR-4.2: Listing Detail Page**
- **Actor:** Buyer
- **Flow:**
  1. Buyer clicks on listing from search results
  2. Detailed page loads with:
     - **Image Gallery:** Carousel of all images
     - **Vehicle Info:** Make, model, year, mileage, body type, transmission, fuel
     - **Price Display:** Both ETB and USD (auto-converted)
     - **Condition:** Excellent/Good/Fair/Poor with description
     - **Features List:** Air conditioning, power steering, etc.
     - **Description:** Broker's custom description
     - **Location:** Map marker + address
     - **Broker Info:** Name, verification badge, contact options (Phone, WhatsApp, Email)
     - **Action Buttons:** "Inquire Now", "Save to Favorites", "Share"
     - **Similar Listings:** 3-4 similar vehicles from other brokers
  3. Buyer can view broker reviews/ratings (if available)
- **Postcondition:** Listing detail view
- **Acceptance Criteria:**
  - Page loads in <2 seconds
  - Images load with lazy loading
  - All details visible on mobile (responsive)
  - Map displays correct location
  - Contact information clickable (tel:, WhatsApp, mailto:)

**FR-4.3: Wishlist/Favorites**
- **Actor:** Buyer (logged in)
- **Flow:**
  1. Buyer clicks "Save to Favorites" heart icon on listing
  2. Listing added to buyer's wishlist
  3. Buyer can access "My Favorites" from profile/nav
  4. Can remove items from wishlist
  5. Can export/share wishlist (email)
- **Postcondition:** Listing saved to buyer's account
- **Acceptance Criteria:**
  - Wishlist persists across sessions
  - Heart icon reflects saved status
  - Wishlist searchable/filterable
  - Can share wishlist as email link
  - Wishlist has max 50 items (soft limit)

---

#### 3.1.5 Buyer-Broker Communication

**FR-5.1: Inquiry/Messaging System**
- **Actor:** Buyer, Broker
- **Flow:**
  1. Buyer clicks "Inquire Now" on listing
  2. Modal/form appears with fields:
     - **Buyer Info** (auto-populated if logged in):
       - Name
       - Phone
       - Email
       - Message (optional template: "Hi, I'm interested in this vehicle. Can you provide more information?")
  3. Buyer submits inquiry
  4. System creates inquiry record
  5. Broker receives notification (SMS, email, in-app)
  6. Broker can respond through in-app messaging interface
  7. Buyer receives notification of response
  8. Multi-turn conversation continues in-app
- **Postcondition:** Conversation thread created, both parties notified
- **Acceptance Criteria:**
  - Inquiry submitted <1 second
  - Broker notified within 5 minutes
  - Messages encrypted (TLS in transit, encrypted at rest)
  - Conversation history searchable
  - Messages can include links & emojis
  - Buyer/broker can delete messages (soft delete for audit)

**FR-5.2: Broker Direct Contacts**
- **Actor:** Buyer (logged in or anonymous)
- **Flow:**
  1. Buyer sees broker contact info on listing detail:
     - Phone button (click to call)
     - WhatsApp button (click to WhatsApp)
     - Email button (click to email)
  2. If buyer clicks WhatsApp:
     - Redirects to WhatsApp with pre-filled message
     - Message: "Hi [Broker Name], I'm interested in your [Year Make Model] listing on CarBroker"
  3. If buyer clicks Email:
     - Opens email client with broker email pre-filled
     - Subject: "Inquiry about [Vehicle] on CarBroker"
- **Postcondition:** Buyer redirected to communication channel
- **Acceptance Criteria:**
  - WhatsApp button works on mobile & web
  - Email pre-fills correctly
  - Phone number formatted correctly
  - Links trackable for analytics

**FR-5.3: Message Notifications**
- **Actor:** System, Broker, Buyer
- **Flow:**
  1. When message received:
     - System sends SMS notification (if opted in)
     - System sends email notification (if opted in)
     - System updates in-app notification badge
  2. Recipient can disable notifications per listing or globally
- **Postcondition:** Recipient notified
- **Acceptance Criteria:**
  - SMS sent within 30 seconds
  - Email sent within 1 minute
  - In-app notification real-time (WebSocket or polling)
  - Notification preferences accessible in settings

---

#### 3.1.6 Payment & Commission Management

**FR-6.1: Commission Calculation**
- **Actor:** System
- **Flow:**
  1. When broker marks listing as "Sold":
     - System retrieves listing price
     - Calculates commission: Price × Commission Rate (8-12%)
     - Default rate: 10%
     - Stores commission in broker's "Pending Payout" account
  2. Commission displayed in broker's earnings dashboard
- **Postcondition:** Commission calculated and recorded
- **Acceptance Criteria:**
  - Commission calculation correct (verified by audit log)
  - Commission persists in database
  - Broker can see breakdown (sales price, commission %, amount)
  - Commission applies only after sale confirmed

**FR-6.2: Payout Request**
- **Actor:** Broker
- **Flow:**
  1. Broker accesses "My Earnings" dashboard
  2. Views pending commission balance
  3. If balance >= 500 ETB, "Request Payout" button enabled
  4. Broker clicks button, enters:
     - **Bank Account Number**
     - **Bank Name** (dropdown)
     - **Account Holder Name**
     - **Payout Amount** (up to available balance)
  5. Submits payout request
  6. Request marked as "Pending Approval"
  7. Admin receives notification
- **Postcondition:** Payout request created
- **Acceptance Criteria:**
  - Minimum payout: 500 ETB
  - Bank details validated (account number format)
  - Request submitted <1 second
  - Broker receives email confirmation
  - Request tracked in admin dashboard

**FR-6.3: Payout Processing**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Payouts" section
  2. Views pending payout requests, sorted by date
  3. For each request, can:
     - Verify broker identity
     - Check bank account validity
     - Click "Approve" or "Reject"
  4. Approved payouts:
     - Processed via bank transfer (manual or API integration)
     - Status changed to "Processing"
     - Broker notified
  5. After transfer confirmed:
     - Status changed to "Completed"
     - Payout date recorded
     - Broker receives confirmation SMS/email
- **Postcondition:** Payout completed
- **Acceptance Criteria:**
  - Payout processed within 2-3 business days
  - Bank transfer receipt recorded
  - Payout history maintained for audit
  - Broker can view payout status in dashboard
  - Minimum payout: 500 ETB
  - Maximum payout frequency: unlimited (but practical limits)

**FR-6.4: Payment Gateway Integration (Telebirr)**
- **Actor:** System, Broker (optional, future feature)
- **Flow:**
  1. Integration with Telebirr API for direct payouts
  2. Broker can opt to receive payouts to Telebirr account
  3. Faster processing (same-day or next-day)
  4. Auto-transfer via Telebirr API
- **Postcondition:** Payout processed via Telebirr
- **Acceptance Criteria:**
  - Telebirr account linked to broker profile
  - Payout transferred within 24 hours
  - Broker receives SMS confirmation from Telebirr
  - Error handling for failed transfers

---

#### 3.1.7 Admin Dashboard

**FR-7.1: Listing Moderation**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Listings" section
  2. Views queue of pending listings:
     - Listing title, make/model, price
     - Broker name
     - Date submitted
  3. For each listing, can:
     - View full details & images
     - Click "Approve" to publish
     - Click "Reject" with reason (spam, inappropriate, incomplete info, etc.)
  4. Rejected listings:
     - Status = "Rejected"
     - Broker notified via email with reason
     - Broker can edit and resubmit
  5. Approved listings:
     - Status = "Active"
     - Visible to buyers in search
     - Broker notified
- **Postcondition:** Listing moderated
- **Acceptance Criteria:**
  - Moderation completes within 2 hours (SLA)
  - Rejection reason provided
  - Broker can view feedback
  - Active listings show "Approved" badge in admin view

**FR-7.2: Broker Verification Review**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Broker Verification" queue
  2. Views pending KYC applications:
     - Broker name, phone, email
     - ID document image
     - Business registration (if applicable)
     - Date submitted
  3. For each application:
     - Reviews documents
     - Checks document validity (not expired, matches registration)
     - Clicks "Approve" or "Reject"
  4. Approved brokers:
     - Status = "Verified"
     - Verification badge enabled
     - Broker notified
  5. Rejected brokers:
     - Status = "Rejected"
     - Reason provided
     - Broker can resubmit with corrections
- **Postcondition:** Broker verification decision made
- **Acceptance Criteria:**
  - Review completed within 24-48 hours
  - Document images clear and readable
  - Decision recorded with timestamp
  - Broker notified within 1 hour of decision
  - Resubmission allowed after rejection

**FR-7.3: Platform Analytics Dashboard**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Analytics" section
  2. Sees dashboard with:
     - **KPIs:**
       - Total brokers (active, verified, unverified)
       - Total listings (active, pending, sold, rejected)
       - Total monthly sales (count and value)
       - Monthly revenue (commissions collected)
       - Average commission value
     - **Charts:**
       - Sales trend (line chart, last 12 months)
       - Broker growth (line chart)
       - Top 10 brokers by sales
       - Listings by category (pie chart)
       - Listings by location (bar chart)
     - **Date Filter:** Select date range for metrics
  3. Can export report as PDF or CSV
- **Postcondition:** Analytics report displayed
- **Acceptance Criteria:**
  - Dashboard loads in <3 seconds
  - All metrics accurate and auto-updated
  - Charts interactive (hover for values)
  - Date filter works correctly
  - Export includes all displayed data
  - Performance: can handle up to 1 year of data

**FR-7.4: User Management**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Users" section
  2. Can:
     - Search brokers by name, email, phone
     - View broker profile and listing history
     - View broker commission/payout history
     - Suspend/unsuspend broker account (if violations)
     - View buyer search history (anonymized)
  3. Suspension:
     - Suspended broker cannot login
     - Existing listings hidden from search
     - Broker notified of suspension reason
- **Postcondition:** User action taken
- **Acceptance Criteria:**
  - Suspension takes effect immediately
  - Broker notified via email & SMS
  - Suspension reason logged
  - Broker can request appeal/unsuspension

**FR-7.5: Dispute Resolution**
- **Actor:** Admin
- **Flow:**
  1. Admin accesses "Disputes" section
  2. Views complaints from brokers/buyers:
     - Complainant, respondent, issue type
     - Description and evidence
     - Date submitted
  3. For each dispute:
     - Investigates both parties' claims
     - Requests additional information if needed
     - Makes decision: uphold complaint, dismiss, or partial resolution
     - Records decision and communicates to parties
  4. Possible outcomes:
     - Refund commission to broker (if listing fraudulent)
     - Suspend broker account (if repeated violations)
     - Ban buyer (if false claims)
- **Postcondition:** Dispute resolved
- **Acceptance Criteria:**
  - Disputes reviewed within 5 business days
  - Both parties notified of decision
  - Decision logged for audit
  - Appeal process available

---

#### 3.1.8 Reporting & Data Export

**FR-8.1: Broker Sales Report**
- **Actor:** Broker
- **Flow:**
  1. Broker clicks "Reports" in dashboard
  2. Selects date range (month, quarter, custom)
  3. Report generated showing:
     - Listings created in period
     - Listings sold in period
     - Total sales value
     - Total commissions earned
     - Commissions paid out
     - Pending commission balance
  4. Can export as PDF or CSV
- **Postcondition:** Report generated
- **Acceptance Criteria:**
  - Report data accurate (verified against database)
  - PDF/CSV includes all data
  - Formatting professional and readable
  - Export completes <5 seconds

**FR-8.2: Buyer Search History Export**
- **Actor:** Buyer (if privacy-enabled)
- **Flow:**
  1. Buyer accesses "My Data" section
  2. Can download:
     - Search history (queries, filters, results)
     - Saved listings (wishlist)
     - Inquiry messages and responses
  3. Data provided as CSV or JSON
- **Postcondition:** Data exported
- **Acceptance Criteria:**
  - GDPR-compliant (data portability)
  - All personal data included
  - Format readable and complete
  - Export includes timestamps

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

**NF-1.1: Response Time**
- Page load time: <2 seconds (90th percentile)
- API response time: <500ms (95th percentile)
- Search queries: <1 second
- Image loading: <10 seconds per page (lazy load)
- Listing creation form: <3 seconds to submit

**NF-1.2: Throughput**
- Support concurrent users: 100 (MVP), scalable to 1000+
- Database: Support 1000 queries/second
- API: Support 100 requests/second
- Image uploads: 10 simultaneous uploads

**NF-1.3: Scalability**
- Horizontal scaling: Add more servers without downtime
- Database: Partitionable (sharding ready)
- Static assets: CDN distribution
- Caching: Redis for frequently accessed data

---

#### 3.2.2 Reliability & Availability

**NF-2.1: Uptime**
- Target: 99.5% availability (< 3.6 hours downtime/month)
- Planned maintenance window: Sundays 2-4 AM (minimum impact)
- Maximum unplanned downtime incident: 30 minutes recovery time

**NF-2.2: Data Backup**
- Daily automated backups (full backup)
- Point-in-time recovery: 30 days minimum
- Backup stored in geographically distributed location
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): < 1 hour

**NF-2.3: Disaster Recovery**
- Documented disaster recovery plan
- Failover to backup infrastructure < 30 minutes
- Regular DR drills (quarterly)

**NF-2.4: Error Handling**
- Graceful error handling (no 500 errors exposed to users)
- User-friendly error messages
- Error logging for debugging
- Max 1 error per 10,000 transactions

---

#### 3.2.3 Security

**NF-3.1: Authentication & Authorization**
- JWT token-based authentication
- Passwords hashed using bcrypt (salt rounds: 12)
- Session timeout: 7 days for web, 30 days for "remember me"
- Multi-factor authentication (future): SMS OTP
- Role-based access control (RBAC): Admin, Broker, Buyer

**NF-3.2: Data Encryption**
- HTTPS/TLS 1.2+ for all communication
- Sensitive data encrypted at rest (AES-256)
- Database credentials stored in secure vault (AWS Secrets Manager)
- API keys never exposed in logs or code

**NF-3.3: Data Privacy**
- GDPR-compliant data handling
- User consent for data collection
- Data retention policy: Delete buyer search history after 90 days (unless subscribed)
- Right to deletion: Buyer can request account deletion (soft delete)
- Privacy policy displayed and agreed upon during registration

**NF-3.4: Payment Security**
- PCI-DSS compliance (level 1, if handling card data)
- Payment tokens: Never store full credit card numbers
- Use payment gateway tokenization (Telebirr, Chapa)
- SSL pinning for mobile apps (future)

**NF-3.5: Rate Limiting & DDoS Protection**
- API rate limiting: 100 requests/minute per user
- Login attempts: Max 5 per 15 minutes (IP-based lockout)
- Image uploads: Max 10 per hour per broker
- WAF (Web Application Firewall) for DDoS protection

**NF-3.6: Input Validation & Sanitization**
- All user input validated server-side
- SQL injection prevention: Parameterized queries
- XSS prevention: HTML escaping, Content Security Policy (CSP)
- CSRF protection: CSRF tokens on forms
- File upload validation: MIME type, file size, virus scan (ClamAV)

---

#### 3.2.4 Usability

**NF-4.1: User Interface**
- Mobile-responsive design (works on devices 320px - 2560px width)
- Accessibility: WCAG 2.1 AA compliance
  - Color contrast ratio >= 4.5:1 for text
  - Keyboard navigation fully supported
  - Screen reader support (alt text for images)
- Loading indicators for long operations
- Error messages in user's preferred language (Amharic/English)

**NF-4.2: Localization**
- Primary language: Amharic (ኣማርኛ)
- Secondary language: English
- Currency: ETB (Ethiopian Birr), USD display option
- Date format: DD/MM/YYYY (Ethiopian standard)
- Phone numbers: +251 format
- Support for RTL (right-to-left) text (future: Arabic)

**NF-4.3: Documentation**
- User guides for brokers (how to create listing, track sales, etc.)
- FAQ section
- In-app tooltips and help text
- Video tutorials for main flows (YouTube links)
- Email support with <24 hour response time

---

#### 3.2.5 Compatibility

**NF-5.1: Browser Support**
- Chrome (latest 2 versions) - 100% support
- Firefox (latest 2 versions) - 100% support
- Safari (latest 2 versions) - 100% support
- Edge (latest 2 versions) - 100% support
- Internet Explorer 11 - Not supported
- Mobile browsers: Chrome, Safari, Firefox

**NF-5.2: Operating System**
- Linux (Ubuntu 20.04+ preferred for hosting)
- macOS (for development)
- Windows 10+ (for development)
- Android 7+ (future app)
- iOS 12+ (future app)

**NF-5.3: Device Support**
- Desktop: 1024x768 minimum resolution
- Tablet: 768px width minimum
- Mobile: 320px width minimum
- Smartwatch: Not required
- TV: Not required

---

#### 3.2.6 Maintainability

**NF-6.1: Code Quality**
- Code coverage: >= 80% (unit tests)
- Static analysis: Pass with 0 critical issues
- Code style: Enforced via linter (ESLint for JS, Prettier)
- Code review: All PRs reviewed by 2+ developers

**NF-6.2: Documentation**
- API documentation: OpenAPI 3.0 specification
- Architecture documentation: C4 model diagrams
- Database schema documented (ER diagram)
- Deployment guide with step-by-step instructions
- Troubleshooting guide for common issues

**NF-6.3: Deployment & CI/CD**
- Automated testing: Every commit triggers test suite
- Continuous Integration: GitHub Actions or GitLab CI
- Automated deployment: Staging on every merge to develop, production manual approval
- Blue-green deployment: Zero-downtime updates
- Rollback capability: Instant rollback to previous version if issues detected

---

#### 3.2.7 Regulatory Compliance

**NF-7.1: Local Regulations**
- Ethiopian business registration: Cooperative Society or Private Limited Company
- Tax compliance: Withholding tax on commission payouts
- Consumer protection: Dispute resolution accessible to all

**NF-7.2: Data Protection**
- GDPR compliance (if serving EU users): Consent management, right to deletion
- Data localization: Keep Ethiopian user data in Ethiopia (or neighboring regions)
- Data retention: Clear policy on how long data is kept

**NF-7.3: Payment Regulations**
- Telebirr: Adhere to Telebirr terms of service
- Chapa: Adhere to Chapa terms of service
- No unauthorized financial services

---

### 3.3 Database Requirements

#### 3.3.1 Entity-Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ phone (UNIQUE)  │
│ password_hash   │
│ user_type       │ ◄─────┐
│ created_at      │       │
│ updated_at      │       │
└─────────────────┘       │
          │                │
          ├──────┬─────────┴─────────┐
          │      │                   │
          ▼      ▼                   ▼
     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
     │   Brokers    │    │    Buyers    │    │    Admins    │
     ├──────────────┤    ├──────────────┤    ├──────────────┤
     │ id (FK:Users)│    │ id (FK:Users)│    │ id (FK:Users)│
     │ business_name│    │ saved_listing│    │ role         │
     │ location     │    │ (M:M)        │    │ permissions  │
     │ verified     │    │              │    └──────────────┘
     │ commission % │    └──────────────┘
     │ total_sales  │
     └──────────────┘
          │
          │ 1:M
          ▼
     ┌──────────────┐
     │  Listings    │
     ├──────────────┤
     │ id (PK)      │
     │ broker_id(FK)│
     │ make         │
     │ model        │
     │ year         │
     │ price        │
     │ mileage      │
     │ status       │
     │ created_at   │
     │ updated_at   │
     └──────────────┘
          │
          ├─────────────┬─────────────┐
          │             │             │
          ▼             ▼             ▼
     ┌──────────┐ ┌──────────┐ ┌──────────────┐
     │ Images   │ │Inquiries │ │  Favorites   │
     ├──────────┤ ├──────────┤ ├──────────────┤
     │ id(PK)   │ │id(PK)    │ │id(PK)        │
     │listing_id│ │listing_id│ │buyer_id(FK)  │
     │url       │ │buyer_id │ │listing_id(FK)│
     │order     │ │message  │ │created_at    │
     └──────────┘ │created_at│ └──────────────┘
                  └──────────┘
                       │
                       ▼
                  ┌──────────────┐
                  │  Messages    │
                  ├──────────────┤
                  │ id (PK)      │
                  │ inquiry_id   │
                  │ sender_id(FK)│
                  │ receiver_id  │
                  │ message_text │
                  │ created_at   │
                  └──────────────┘

     ┌──────────────────┐
     │   Commissions    │
     ├──────────────────┤
     │ id (PK)          │
     │ broker_id (FK)   │
     │ listing_id (FK)  │
     │ amount           │
     │ status           │
     │ created_at       │
     └──────────────────┘
          │
          ▼
     ┌──────────────────┐
     │    Payouts       │
     ├──────────────────┤
     │ id (PK)          │
     │ broker_id (FK)   │
     │ amount           │
     │ bank_account     │
     │ status           │
     │ transfer_date    │
     │ created_at       │
     └──────────────────┘
```

#### 3.3.2 Key Tables

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('broker', 'buyer', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL -- Soft delete
);
```

**Brokers Table**
```sql
CREATE TABLE brokers (
  id UUID PRIMARY KEY REFERENCES users(id),
  business_name VARCHAR(255) NOT NULL,
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  whatsapp_number VARCHAR(20),
  location VARCHAR(255),
  business_description TEXT,
  profile_photo_url VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP NULL,
  id_document_url VARCHAR(500),
  business_reg_url VARCHAR(500),
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  total_sales DECIMAL(15,2) DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Listings Table**
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES brokers(id),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  body_type VARCHAR(50),
  transmission VARCHAR(20),
  fuel_type VARCHAR(20),
  mileage DECIMAL(10,2),
  price DECIMAL(15,2) NOT NULL,
  condition VARCHAR(20),
  features JSONB,
  description TEXT,
  location VARCHAR(255),
  status ENUM('pending', 'active', 'sold', 'deleted', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

**Commissions Table**
```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY,
  broker_id UUID NOT NULL REFERENCES brokers(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  amount DECIMAL(15,2) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  status ENUM('pending', 'approved', 'paid', 'disputed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL
);
```

---

### 3.4 API Requirements

#### 3.4.1 RESTful API Endpoints

All endpoints return JSON with standardized response format:
```json
{
  "success": true/false,
  "data": {...},
  "error": null/string,
  "timestamp": "2024-06-15T10:30:00Z"
}
```

**Authentication Endpoints**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/password-reset
POST /api/v1/auth/verify-otp
```

**Broker Endpoints**
```
GET    /api/v1/brokers/{id}              # Get broker profile
PUT    /api/v1/brokers/{id}              # Update broker profile
POST   /api/v1/brokers/{id}/upload-kyc   # Upload KYC documents
GET    /api/v1/brokers/{id}/listings     # Get broker's listings
GET    /api/v1/brokers/{id}/commissions  # Get commission history
POST   /api/v1/brokers/{id}/payout       # Request payout
GET    /api/v1/brokers/{id}/inquiries    # Get inquiries for broker's listings
```

**Listing Endpoints**
```
POST   /api/v1/listings                  # Create listing
GET    /api/v1/listings                  # Search listings
GET    /api/v1/listings/{id}             # Get listing details
PUT    /api/v1/listings/{id}             # Update listing
DELETE /api/v1/listings/{id}             # Delete listing
POST   /api/v1/listings/{id}/images      # Upload images
POST   /api/v1/listings/{id}/sold        # Mark as sold
POST   /api/v1/listings/{id}/save        # Save to favorites
```

**Inquiry Endpoints**
```
POST   /api/v1/inquiries                 # Create inquiry
GET    /api/v1/inquiries/{id}            # Get inquiry conversation
POST   /api/v1/inquiries/{id}/message    # Send message
GET    /api/v1/inquiries/by-buyer        # Get buyer's inquiries
GET    /api/v1/inquiries/by-broker       # Get broker's inquiries
```

**Admin Endpoints**
```
GET    /api/v1/admin/listings            # List pending listings
PUT    /api/v1/admin/listings/{id}/approve
PUT    /api/v1/admin/listings/{id}/reject
GET    /api/v1/admin/brokers             # List brokers
PUT    /api/v1/admin/brokers/{id}/verify
PUT    /api/v1/admin/brokers/{id}/suspend
GET    /api/v1/admin/payouts             # List pending payouts
PUT    /api/v1/admin/payouts/{id}/approve
GET    /api/v1/admin/analytics           # Get analytics dashboard data
```

---

## 4. Acceptance Criteria & Testing

### 4.1 MVP Acceptance Criteria

1. **Broker Registration & KYC**
   - [ ] 95%+ successful registrations
   - [ ] KYC verification completes within 24-48 hours
   - [ ] Rejection reason clear and actionable

2. **Listing Creation & Publishing**
   - [ ] Forms validated correctly (no invalid data in DB)
   - [ ] Images upload and display correctly
   - [ ] Listings publish within 2 hours of approval

3. **Search & Discovery**
   - [ ] Search returns correct results for all filter combinations
   - [ ] Performance: <1 second search time
   - [ ] Results sorted correctly

4. **Buyer Inquiries**
   - [ ] Inquiries submitted successfully
   - [ ] Brokers notified within 5 minutes
   - [ ] Conversation history maintained
   - [ ] No message loss

5. **Commission & Payouts**
   - [ ] Commission calculated correctly
   - [ ] Payout requests processed within 3 days
   - [ ] No discrepancies in payout records

6. **Admin Functionality**
   - [ ] Listing moderation time: <2 hours SLA
   - [ ] KYC review time: <24-48 hours
   - [ ] Payout processing: <3 business days
   - [ ] No data corruption or loss

### 4.2 Testing Strategy

**Unit Tests**
- Target coverage: >= 80%
- Test all API endpoints, business logic, validators
- Tools: Jest (for Node.js), pytest (for Python)

**Integration Tests**
- Database integration
- Payment gateway simulation (mock Telebirr/Chapa)
- Email notification testing
- Image upload testing

**End-to-End Tests**
- Complete user flows (broker registration → listing → sale → payout)
- Buyer search → inquiry → conversation
- Admin moderation workflow
- Tools: Cypress, Playwright

**Performance Testing**
- Load testing: 100+ concurrent users
- Stress testing: Database queries at scale
- Tool: Apache JMeter, k6

**Security Testing**
- SQL injection attempts
- XSS/CSRF vulnerabilities
- Authentication bypass attempts
- Tool: OWASP ZAP, Burp Suite (manual)

---

## 5. Implementation Notes for AI Agents

### 5.1 Development Priorities

**Phase 1 (Weeks 1-4): Core Infrastructure**
1. Database schema setup (PostgreSQL)
2. User authentication (registration, login, OTP)
3. Broker KYC flow
4. Basic profile management
5. API skeleton (REST endpoints)

**Phase 2 (Weeks 5-8): Listing Management**
1. Listing creation/edit/delete endpoints
2. Image upload and storage
3. Listing approval workflow (admin)
4. Search and filtering
5. Frontend UI for listings

**Phase 3 (Weeks 9-12): Commerce & Communication**
1. Inquiry/messaging system
2. Commission calculation
3. Payout request system
4. Admin dashboard
5. Email notifications

**Phase 4 (Weeks 13-16): Polish & Launch**
1. Performance optimization
2. Security hardening
3. QA and testing
4. Documentation
5. Soft launch with pilot brokers

### 5.2 Critical Dependencies

- **Payment Gateways:** Telebirr API integration (start early, allow 2-3 weeks for setup)
- **Email Service:** SendGrid or Brevo account
- **SMS Service:** Telecom partner API or Twilio
- **Image Hosting:** AWS S3 or Cloudinary account
- **Hosting:** AWS, DigitalOcean, or local server setup

### 5.3 Known Constraints

- Limited SMS integration options in Ethiopia (use WhatsApp as primary, SMS as backup)
- Payment gateway documentation may be incomplete (request from providers directly)
- Test/staging environment for payment gateways limited (use mock)
- Internet reliability in Ethiopia (design for offline functionality where possible)

---

## 6. Glossary

| Term | Definition |
|------|-----------|
| **Broker** | A registered user who lists vehicles for sale on behalf of sellers |
| **Commission** | Percentage fee (8-12%) paid by broker to platform on successful sale |
| **Listing** | A vehicle advertisement posted by a broker on CarBroker |
| **Inquiry** | A buyer's request to the broker for more information about a listing |
| **KYC** | Know Your Customer verification (government ID + business registration) |
| **Payout** | Transfer of commission earnings to broker's bank account |
| **Soft Deletion** | Logical deletion where data remains in database but marked as deleted |
| **JWT** | JSON Web Token used for stateless authentication |
| **Row-Level Security** | Database-level access control ensuring users only see their own data |
| **ETB** | Ethiopian Birr, the currency of Ethiopia |
| **Amharic** | Primary language of Ethiopia, ኣማርኛ |

---

## Appendix A: User Stories

### Broker User Stories

**US-1: As a broker, I want to register on the platform so that I can start listing vehicles.**
- Acceptance Criteria:
  - Broker completes registration in <5 minutes
  - Phone OTP verification works correctly
  - Email confirmation received
  - Account status = "Unverified" until KYC approved

**US-2: As a broker, I want to upload my government ID so that I can get verified on the platform.**
- Acceptance Criteria:
  - Document upload works for JPEG/PNG files
  - File size <5MB
  - Admin reviews within 24-48 hours
  - Broker receives approval/rejection email with reason

**US-3: As a broker, I want to create a car listing so that buyers can see my vehicles.**
- Acceptance Criteria:
  - Form has all required fields (make, model, year, price, images, etc.)
  - Validation prevents empty/invalid fields
  - Listing saves as "Pending Approval"
  - Broker receives confirmation email

**US-4: As a broker, I want to track my sales and commissions so that I know how much I've earned.**
- Acceptance Criteria:
  - Dashboard shows total sales, commissions, payouts
  - Commission breakdown available (price, rate, amount)
  - History searchable and exportable
  - Real-time updates after sale confirmation

**US-5: As a broker, I want to receive buyer inquiries so that I can respond to interested customers.**
- Acceptance Criteria:
  - Broker receives SMS/email notification
  - In-app notification shows inquiry badge
  - Message history preserved
  - Broker can reply in-app or via WhatsApp

**US-6: As a broker, I want to request a payout of my earned commissions.**
- Acceptance Criteria:
  - Minimum payout: 500 ETB
  - Bank account information validated
  - Request status visible
  - Payout processed within 3 business days

### Buyer User Stories

**US-7: As a buyer, I want to search for cars by make, model, year, and price so that I can find vehicles matching my preferences.**
- Acceptance Criteria:
  - All filters work independently and combined
  - Results update in <1 second
  - No results page provides helpful suggestions
  - Results sortable by date, price, mileage

**US-8: As a buyer, I want to view detailed information and photos of a car so that I can evaluate it before contacting the broker.**
- Acceptance Criteria:
  - All listing details displayed
  - Photo gallery works smoothly
  - Load time <2 seconds
  - Mobile responsive

**US-9: As a buyer, I want to contact a broker so that I can inquire about a specific vehicle.**
- Acceptance Criteria:
  - Inquiry form pre-filled with buyer contact info
  - Message sent to broker immediately
  - Buyer receives confirmation
  - Broker receives notification within 5 minutes

**US-10: As a buyer, I want to save my favorite listings so that I can compare them later.**
- Acceptance Criteria:
  - Save button on listing detail page
  - Favorites persistent across sessions
  - Can access favorites from profile
  - Can share favorites list with others

### Admin User Stories

**US-11: As an admin, I want to review pending listings so that I can approve or reject them based on platform guidelines.**
- Acceptance Criteria:
  - Queue shows pending listings
  - Can view full listing details
  - Can approve or reject with reason
  - Broker notified of decision within 1 hour
  - SLA: Review within 2 hours

**US-12: As an admin, I want to verify brokers so that I can ensure platform users are legitimate.**
- Acceptance Criteria:
  - KYC documents visible and clear
  - Can approve or reject with reason
  - Broker notified via email
  - Verification badge enabled on approval
  - SLA: Review within 24-48 hours

**US-13: As an admin, I want to process payouts so that brokers receive their earned commissions.**
- Acceptance Criteria:
  - Payout queue visible
  - Bank transfer recorded
  - Broker notified of payout status
  - Payout history maintained
  - SLA: Process within 3 business days

---

## End of SRS Document

**Document Prepared By:** Product Team
**Last Updated:** June 2024
**Status:** Ready for Development
**Approval:** [ ] Stakeholder [ ] Technical Lead [ ] Project Manager