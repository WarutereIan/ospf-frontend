# User Guide: Aggregation Manager

This guide explains how to use the platform as an **Aggregation Manager**: managing stock in, receiving from ward, stock out, order processing, buyer matching, inventory, reports, and farmers at your centre.

---

## 1. Logging in

1. Open the platform in your browser and go to **Login**.
2. Enter your **phone** (or email) and **password**. Use the **eye icon** next to the password field to show or hide your password as you type.
3. Click **Sign in**. You are taken to **My Dashboard** (aggregation); the sidebar shows the centre management menu. You see only the centre(s) you are assigned to.

> **Note:** Registration is currently disabled ("Coming Soon"). Your account is created by a staff admin from the **Users** page.

---

## 2. Main menu and navigation

After login, the sidebar shows:

| Menu item            | Path / Purpose |
|----------------------|----------------|
| **My Dashboard**     | Overview of your centre's activity and metrics |
| **Stock In**         | Record produce received at the centre (e.g. from farmers) |
| **Receive from Ward**| Record produce received from ward-level satellite centres |
| **Stock Out**        | Record stock going out (e.g. to buyers, delivery) |
| **Order Processing** | Process marketplace orders (match to stock, fulfil) |
| **Buyer Matching**   | Match buyer demand to available inventory |
| **Inventory**        | View and manage current inventory at the centre |
| **Reports**          | Centre-level reports |
| **Farmers**          | View farmers linked to your centre (CRM-style) |

Use the **menu icon** on small screens to open or close the sidebar.

In the header, you have two separate buttons: **Settings** (opens your profile page) and **Sign Out** (with a confirmation dialog before signing out).

---

## 3. Stock In

**Essence:** **Stock In** is how you **record produce arriving** at your centre from farmers (or from ward collection). Each record creates or updates a batch in inventory so it can be allocated to orders or stock out—so your books and inventory stay accurate and traceable.

**Flow: Farmer delivers produce → You record stock in (batch, variety, grade, quantity, farmer) → Stock appears in inventory.**

1. Go to **Stock In** in the sidebar.
2. Click **New stock in** (or **Record receipt**). You see a form with several sections.
3. **Batch Information:**
   - **Search for a batch** by typing a batch ID or farmer name. The search uses full-text search to find matching batches. Select an existing batch or create a new one (batch ID is auto-generated or you can enter a reference).
4. **Direct Delivery – Farmer (optional):**
   - **Search for the farmer** by typing their name or phone number. The system searches the database in real-time and shows matching results. Select the delivering farmer.
5. **Link to Order (optional):**
   - If this delivery is for a specific buyer order, **search by order ID or buyer name** to link the stock-in to that order. This helps track fulfilment.
6. **Produce details:**
   - **Variety** (e.g. Kenya, SPK004, Kabode — from the commodity catalogue)
   - **Grade** (A, B, or C)
   - **Quantity** and unit (e.g. kg)
7. **Grading matrix (optional):**
   - Fill in weight range, colour intensity (1–10), physical condition, freshness, and days since harvest.
   - The system provides a **grade recommendation** based on the grading matrix. Click **Apply Recommended Grade** to use it.
8. **Photos (optional):** Upload photos of the produce (PNG/JPG, up to 10 MB each).
9. **Notes (optional):** Add any additional notes.
10. Submit. The produce is **added to your centre's inventory** and a **receipt** is generated (viewable with a QR code). The stock can now be used in **Order Processing** and **Stock Out**.
11. **Pending confirmations:** If produce was recorded via a pickup booking, you may see pending transactions to **Confirm** or **Reject** before they are added to inventory.

---

## 4. Receive from Ward

**Essence:** **Receive from Ward** is for recording produce **received from satellite (ward-level) centres** into your main centre. It keeps stock and traceability correct when your flow uses ward aggregation before the main centre.

**Flow: Ward satellite delivers to centre → You record receive from ward (source centre, batch, quantity) → Stock added to inventory.**

1. Go to **Receive from Ward** in the sidebar.
2. Click **New receipt** (or similar). You see a form to record produce received from a satellite centre.
3. **Source centre:** Select the **satellite (ward-level) centre** from the dropdown. Only centres classified as satellite/ward-level appear here.
4. **Transfer details:**
   - **Batch ID**: search or enter the batch reference
   - **Transfer date and time**
   - **Variety** (from the commodity catalogue)
   - **Quantity** (kg)
5. **Grading matrix:**
   - Fill in weight range, colour intensity (1–10), physical condition, freshness, and days since harvest.
   - The system provides a **grade recommendation**. Click **Apply Recommended Grade** to use it, or view the **Grading matrix guide** for detailed criteria.
6. **Transport details:** Transporter name and vehicle number.
7. **Photos and notes** (optional).
8. Submit. The stock is **added to your centre's inventory** and a **receipt** is generated (with QR code). Use this flow only when your process involves ward-level aggregation; otherwise use **Stock In** for direct farmer deliveries.

---

## 5. Stock Out

**Essence:** **Stock Out** is how you **record produce leaving** the centre—to a buyer, order, or delivery. It reduces inventory and can update order status, so your stock levels and order fulfilment stay in sync.

**Flow: Buyer order or delivery → You record stock out (batch, quantity, buyer/order) → Inventory decreases.**

1. Go to **Stock Out** in the sidebar.
2. Click **New stock out** (or **Record dispatch**). You see a form to record produce leaving the centre.
3. **Order & Buyer:**
   - **Search by order ID or buyer name** to link the dispatch to a specific order. Selecting an order auto-fills buyer details.
4. **Produce details:**
   - **Variety** (from the commodity catalogue)
   - **Quantity** (kg) — cannot exceed available stock
   - **Quality grade** (A, B, or C)
5. **Transport details:**
   - **Vehicle details**, **Driver name**, and **Driver phone**
   - **Notes** (optional)
6. **Photos (optional):** Upload photos of the dispatch (PNG/JPG, up to 10 MB).
7. Submit. **Inventory is reduced** for that batch. If linked to an order, the order status may change (e.g. to Ready for collection or In delivery). A **receipt** is generated (with QR code). The buyer can then collect or receive delivery and confirm.

---

## 6. Order Processing

**Essence:** **Order Processing** is where you **fulfil buyer orders** at your centre: see incoming orders, allocate batches from inventory, and mark orders ready for collection or delivery. It links marketplace demand to your physical stock so buyers get what they ordered.

**Flow: Buyer orders from marketplace → Order appears in Order Processing → You allocate stock (batch) to the order → Mark ready for collection or trigger delivery.**

1. Go to **Order Processing** in the sidebar.
2. You see **orders** that need to be fulfilled at your centre. The list may show order number, buyer, variety, grade, quantity, and status.
3. Click an order to open it. You see **buyer** details, **quantity** and **variety/grade** required, and **delivery/collection** preferences.
4. **Allocate stock**: link the order to a **batch** (or inventory item) that matches variety and grade and has enough quantity. Confirm allocation. Optionally update order status to **Ready for collection** or **In delivery**.
5. When the buyer (or transport) **collects** or **receives delivery**, the order may be marked **Collected** or **Delivered**. Use **Stock Out** to record the physical dispatch if you use that step.
6. Use status filters to see only **pending** or **in progress** orders.

---

## 7. Buyer Matching

**Essence:** **Buyer Matching** shows **buyer demand** alongside **your inventory**. Use it to match demand to batches, create or update allocations, and fill orders efficiently.

**Flow: Open Buyer Matching → See demand and inventory → Allocate batches to orders or create allocations.**

1. Go to **Buyer Matching** in the sidebar.
2. You see **buyer demand** (e.g. open orders or sourcing requests) and **available inventory** (batches at your centre with variety, grade, quantity).
3. **Match** demand to batches: for each order or request, select a batch that fits (variety, grade, quantity) and **allocate** or **assign**.
4. Use this to **plan** which batches will fulfil which orders and to fill orders in bulk when many are pending.

---

## 8. Inventory

**Essence:** **Inventory** is your **live view of stock** at the centre—batches, variety, grade, quantity, and freshness. Use it to know what's available for order processing and stock out, and to spot gaps or surpluses.

**Flow: Open Inventory → View batches and quantities → Use for allocation and stock-out decisions.**

1. Go to **Inventory** in the sidebar.
2. You see **summary cards** at the top:
   - **Total Stock** — all batches combined
   - **Fresh Stock** — batches less than 5 days old
   - **Aging Stock** — batches 5–7 days old
   - **Critical Stock** — batches older than 7 days
   Click a card to filter the table to that category.
3. Below the cards, the **inventory table** shows each batch with: Batch #, Variety, Grade, Quantity, Age (days), Status (fresh/aging/critical), and Farmer name.
4. Use **filters** (variety, grade, status) and **search** (variety, farmer name, batch number) to find specific items.
5. Click a batch to open **batch details**: batch number, centre, farmer, variety, grade, quantity, age, stock-in date, location, and storage conditions (temperature, humidity).
6. Use this to decide what to allocate to orders (**Order Processing**, **Buyer Matching**) and what to dispatch (**Stock Out**). Watch for **aging** and **critical** stock that needs to move quickly.

---

## 9. Reports and Farmers

**Essence:** **Reports** give you **centre-level** summaries (stock in/out, orders fulfilled, farmer volumes) for planning and reporting. **Farmers** is a **CRM-style** list of farmers who deliver to you—use it for follow-up and planning collection or support.

**Reports — Flow: Open Reports → Select report type → Generate or view → Export/print if needed.**

1. Go to **Reports** in the sidebar.
2. Select **report type** (e.g. stock in/out summary, orders fulfilled, farmer volumes, period comparison). Apply **date range** or other filters. Generate or view the report.
3. **Export** (CSV, PDF) or **print** if supported. Use for **planning** and **reporting** to supervisors or partners.

**Farmers — Flow: Open Farmers → See list of farmers who have delivered to your centre → Open farmer for history and contact.**

1. Go to **Farmers** in the sidebar.
2. You see a **list of farmers** linked to your centre (e.g. from stock-in history or assigned location). Each may show name, phone, last delivery date, total volume.
3. Click a farmer to view **profile**, **delivery history**, or **orders** related to your centre. Use for **follow-up** (e.g. reminders to deliver), **planning** collection runs, or **support**.

---

## 10. Notifications and profile

- **Notifications** (bell icon) may alert you to **new orders** to process, **low stock**, or **pickup schedules**. Open them to go to the relevant screen.
- Click **Settings** in the header to open your **Profile** page, where you can update personal details, change your phone or email (with OTP verification), or update your password.
- Click **Sign Out** in the header to log out. A **confirmation dialog** will ask you to confirm before signing out.

---

## 11. Quick reference: key flows

| Goal | Steps |
|------|--------|
| Record produce received | Stock In → New stock in → Search farmer, search batch, fill variety/grade/quantity, optional grading matrix and photos → Submit → Receipt generated |
| Record from satellite centre | Receive from Ward → New receipt → Select source centre, fill batch/quantity, grading matrix → Submit → Receipt generated |
| Record produce leaving | Stock Out → New stock out → Search order/buyer, fill variety/quantity/grade, transport details → Submit → Receipt generated |
| Fulfil buyer order | Order Processing → Open order → Allocate batch → Mark ready for collection/delivered |
| Match demand to stock | Buyer Matching → View demand and inventory → Allocate batches to orders |
| Check what you have | Inventory → View summary cards (total/fresh/aging/critical) → Filter and search batches |
| Report | Reports → Select report type and date range → Generate or view → Export/print |
| See farmers | Farmers → View list → Open farmer for history and contact |

---

For **farmers** (posting listings, booking pickups to your centre), see **[User Guide: Farmer](USER_GUIDE_FARMER.md)**. For **buyers** (placing orders, collection), see **[User Guide: Buyer](USER_GUIDE_BUYER.md)**.
