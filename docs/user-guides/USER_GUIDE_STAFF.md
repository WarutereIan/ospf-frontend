# User Guide: Staff (Admin)

This guide explains how to use the platform as **Staff** (admin): managing users, farmer groups, aggregation centres, locations, commodity approvals and settings, activity logs, analytics, and reports.

---

## 1. Logging in

1. Open the platform in your browser and go to **Login**.
2. Enter your **phone** (or email) and **password**. Use the **eye icon** next to the password field to show or hide your password as you type.
3. Click **Sign in**. You are taken to **My Dashboard** (staff); the sidebar shows the full admin menu.

> **Note:** Registration is currently disabled ("Coming Soon"). New accounts are created by an existing staff member from the **Users** page.

---

## 2. Main menu and navigation

After login, the sidebar shows:

| Menu item              | Path / Purpose |
|------------------------|----------------|
| **My Dashboard**       | Overview of platform activity and metrics |
| **Users**              | Create, edit, and manage all user accounts; bulk upload farmers |
| **Commodity approval** | Approve or reject produce listings (same as lead farmer) |
| **Farmer Groups**      | Create and manage farmer groups |
| **Aggregation Centers**| Create and manage aggregation centres |
| **Locations**          | Manage location hierarchy (counties, sub-counties, wards, villages) |
| **Commodity settings** | Configure commodity types, varieties, grades, and related settings |
| **Activity Logs**      | View system activity and audit logs |
| **Analytics**          | Platform-wide analytics and visualizations |
| **Reports**            | Generate and view staff reports |

Use the **menu icon** on small screens to open or close the sidebar.

In the header, you have two separate buttons: **Settings** (opens your profile page) and **Sign Out** (with a confirmation dialog before signing out).

---

## 3. Users (user management)

**Essence:** **Users** is where you **manage everyone on the platform**: create accounts (single or bulk CSV upload), set roles and profiles, reset passwords, and suspend or reactivate users. It's the control point for who can use the system and how they're classified (farmer, buyer, officer, etc.).

**Flow: List users → Create single user or bulk upload farmers → Edit/disable/reset password as needed.**

1. Go to **Users** in the sidebar.
2. You see a **list of users** in a table. Each row shows name, email/phone, role, status, date created, and **last login** time.
3. Use **filters** (e.g. role: Farmer, Buyer, Staff; status: Active, Inactive) and **search** (name, email, phone) to find users.
4. **Create a single user:**
   - Click **Create User**. In the dialog, enter:
     - **First name**, **Last name**
     - **Email** and/or **Phone** (as required)
     - **Password**
     - **Role**: Farmer, Lead Farmer, Buyer, County Officer, Staff, Aggregation Manager, Input Provider, Transport Provider
   - Depending on the role, additional fields appear:
     - **Farmer**: cascading location dropdowns for **County → Sub-County → Ward → Village**, and optionally a **Farmer Group**
     - **Lead Farmer**: same location dropdowns as Farmer, with the ability to assign **multiple villages**
     - **County Officer**: cascading dropdowns for **County → Sub-County** and optionally **Ward**
     - **Aggregation Manager**: select an **Aggregation Centre** (required)
   - Save. The user is created and can log in. A **welcome SMS** and/or **email** is sent automatically with the user's login credentials (phone number, email if available, and password).
5. **Bulk upload farmers (CSV):**
   - Click **Bulk upload farmers (CSV)** and then **Download CSV template**. The template has columns: first_name, last_name, gender, phone, password, email, county, subcounty, ward, village. Fill in **one row per farmer**; leave email blank if the farmer has no email. Passwords can be left blank to have a random one generated.
   - Click **Upload** and select your filled CSV file. The platform processes **every row** — if one row fails (e.g. duplicate phone number), it continues to the next row instead of stopping.
   - After processing, a **results table** is shown with columns: Row, Name, Phone, Status (Created or Failed), and Message (reason for failure if applicable).
   - Use the **Download results CSV** button to export the full results as a CSV file for your records or to identify rows that need fixing.
   - Fix errors in the CSV and re-upload only the failed rows if needed.
6. **Edit user:** Open a user from the list. Change **profile** (name, location), **role**, or **status**. Save.
7. **Reset password:** Open the user → click **Reset password** → enter the new password and confirm. The user can then sign in with the new password.
8. **Disable or suspend:** Open the user → set **status** to Inactive or Suspended. Save. They can no longer log in until you reactivate them.

---

## 4. Commodity approval (listings)

**Essence:** **Commodity approval** lets you **approve or reject** produce listings (same as lead farmers). Use it when you need to clear the queue, override, or support lead farmers—so only suitable listings go live on the marketplace.

**Flow: Open Commodity approval → See pending listings → Open listing → Approve or Reject (with reason).**

1. Go to **Commodity approval** in the sidebar.
2. You see **pending** produce listings (status: **Pending lead approval**) in a list. Each may show variety, quantity, grade, farmer, location, and expected ready date.
3. Click a listing to open it and review full details (variety, grade, quantity, location, expected ready date, optional price and images).
4. Decide:
   - **Approve**: Click **Approve**. The listing becomes **ACTIVE** and appears on the buyer marketplace. The farmer is notified.
   - **Reject**: Click **Reject** and enter a **reason** (e.g. "Incorrect grade", "Missing location"). The listing goes to **Revision requested**; the farmer is notified and can edit and resubmit.
5. After you approve or reject, the listing disappears from the pending list. Repeat for other pending listings.

---

## 5. Farmer Groups

**Essence:** **Farmer Groups** is where you **create and maintain groups** (e.g. cooperatives, village groups) and assign farmers to them. Groups are used for targeting advisories, reporting, and organisation—so extension and analytics can work at group level.

**Flow: Create group → Set name, code, location → Save → Assign farmers via Users or from group.**

1. Go to **Farmer Groups** in the sidebar.
2. You see a **list of existing groups**. Each may show name, code, location, and member count.
3. **Create** a new group: click **Add group** (or similar). Enter **name**, **code** (unique), and optionally **location** (e.g. sub-county, ward). Save.
4. **Edit** or **view** a group: open it to see details and optionally **member list**. To **assign farmers** to the group, go to **Users** → open each farmer → set **farmer group** to this group; or if the group page allows, add members from a list of farmers.
5. Use groups when **sending advisories** (Extension Officer: target by farmer group) or in **reports** that break down by group.

---

## 6. Aggregation Centers

**Essence:** **Aggregation Centers** is where you **register and configure** centres (name, location, type, capacity, manager). Centres are where farmers deliver and buyers are served; assigning managers here ties the right users to the right centre.

**Flow: Create centre → Set name, location, type, capacity → Save → Assign manager in Users.**

1. Go to **Aggregation Centers** in the sidebar.
2. You see a **list of centres**. Each may show name, location, type (main/satellite), capacity, status, and manager.
3. **Create** a centre: click **Add centre** (or similar). Enter **name**, **location** (e.g. ward, sub-county — using the platform's location hierarchy), **type** (main or satellite; satellite may link to a main centre), **capacity** if applicable, and optionally **status**. Save.
4. **Edit** or **view** a centre: open it to change details. To **assign a manager**, go to **Users** → create or edit a user with role **Aggregation Manager** → set **aggregation centre** to this centre. That user will then see the centre in their dashboard and manage stock in/out, order processing, etc.
5. Deleting a centre may be restricted if it has linked data (e.g. stock, orders); check the UI or contact support.

---

## 7. Locations (hierarchy)

**Essence:** **Locations** is where you **maintain the geography** of the platform: counties, sub-counties, wards, villages. Farmers, centres, and advisories all use this hierarchy; keeping it correct ensures bulk uploads, filters, and targeting work as expected. Deleting a parent cascades to its children.

**Flow: Add county → Add sub-counties under county → Add wards under sub-county → Add villages under ward. Names are normalized (e.g. title case).**

1. Go to **Locations** in the sidebar.
2. You see the **location hierarchy** in tabs: **Counties**, **Sub-counties**, **Wards**, **Villages**. Names are **normalized** (e.g. "KANGUNDO" becomes "Kangundo") for consistent matching in bulk upload and filters. Each tab has a **search field** to quickly find locations by name.
3. **Create a county:** Open **Counties** → **Add county**. Enter **name** (e.g. Machakos) and optional **code**. Save.
4. **Create a sub-county:** Open **Sub-counties** → **Add sub-county**. Enter **name** and select **county**. Save.
5. **Create a ward:** Open **Wards** → **Add ward**. Enter **name** and select **sub-county**. Save.
6. **Create a village:** Open **Villages** → **Add village**. Enter **name** and select **ward**. Save.
7. **Edit** or **delete** a location: open it and update or delete. **Deleting a parent** (e.g. a ward) **cascades** to its children (e.g. villages under that ward). Use with care.
8. Use this so that **farmers** (and bulk CSV), **centres**, and **advisories** can be assigned to the correct locations. If a location is missing, bulk upload or targeting by location may fail.

---

## 8. Commodity Settings

**Essence:** **Commodity settings** is where you **configure** the product types, varieties, and grades used across the platform (e.g. OFSP varieties like Kenya, SPK004, Kabode; grades A, B, C). These settings feed into listing creation, marketplace filters, stock-in forms, and reports.

1. Go to **Commodity settings** in the sidebar.
2. View and manage **product types**, **varieties**, and **grade definitions**.
3. Add, edit, or deactivate entries as needed. Changes are reflected across the platform (marketplace, stock-in, produce listings, etc.).

---

## 9. Activity Logs

**Essence:** **Activity Logs** show **who did what and when** (e.g. logins, order changes, approvals). Use them for support, disputes, and auditing—so you can trace actions and keep the platform accountable.

**Flow: Open Activity Logs → Filter by user, action, date → View entries.**

1. Go to **Activity Logs** in the sidebar.
2. You see **recent activity** in a list or table: e.g. user, action (login, order created, listing approved), timestamp, and optional details (IP, resource ID).
3. Use **filters** (user, action type, date range) if available to find specific events. Use for **support** (e.g. "Did this user place the order?"), **disputes**, and **auditing**.

---

## 10. Analytics and Reports

**Essence:** **Analytics** and **Reports** give you **platform-wide** metrics and exportable reports (users, orders, listings, revenue, growth). Use them to monitor health, report to stakeholders, and make data-driven decisions.

**Flow: Open Analytics or Reports → Select view or report → Apply filters → Export/print if needed.**

1. **Analytics:** Go to **Analytics** in the sidebar. You see **platform-wide** charts and metrics, e.g.:
   - User growth (by role, over time)
   - Orders and revenue
   - Listings (active, pending)
   - Activity by location or period
   Use **date range** and **filters** as needed. Use for **monitoring** and **reporting to stakeholders**.
2. **Reports:** Go to **Reports** in the sidebar. **Generate or view** staff reports (e.g. user growth, commodity approval queue, locations, farmer groups). Select report type and filters, then view or **export** (CSV, PDF) or **print** if supported.

---

## 11. Notifications and profile

- **Notifications** (bell icon) may alert you to critical platform events. Open them to go to the relevant screen.
- Click **Settings** in the header to open your **Profile** page, where you can update personal details, change your phone or email (with OTP verification), or update your password.
- Click **Sign Out** in the header to log out. A **confirmation dialog** will ask you to confirm before signing out.

---

## 12. Quick reference: key flows

| Goal | Steps |
|------|--------|
| Add one user | Users → Create User → Set role + profile (name, location, etc.) → Save |
| Add many farmers | Users → Bulk upload farmers (CSV) → Download template → Fill rows → Upload → Review results table → Download results CSV if needed |
| Approve listings | Commodity approval → Open pending listing → Approve or Reject with reason |
| Add farmer group | Farmer Groups → Add group → Name, code, location → Save → Assign farmers in Users |
| Add centre | Aggregation Centers → Add centre → Name, location, type, capacity → Save → Assign manager in Users |
| Add location | Locations → Add county/sub-county/ward/village under parent → Save (names normalized) |
| Configure commodities | Commodity settings → Add/edit product types, varieties, grades |
| Audit | Activity Logs → Filter by user/action/date → View entries |
| Report | Analytics or Reports → Select view/report → Apply filters → Export/print if needed |

---


