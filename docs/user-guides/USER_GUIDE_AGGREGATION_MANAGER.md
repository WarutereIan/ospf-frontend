# User Guide: Aggregation Manager

This guide explains how to use the platform as an **Aggregation Manager**: managing stock in, receiving from ward, stock out, order processing, buyer matching, inventory, reports, and farmers at your centre.

---

## 1. Logging in

1. Open the platform in your browser and go to **Login**.
2. Enter your **phone** (or email) and **password**.
3. Click **Sign in**. You are taken to **My Dashboard** (aggregation); the sidebar shows the centre management menu. You see only the centre(s) you are assigned to.

---

## 2. Main menu and navigation

After login, the sidebar shows:

| Menu item            | Path / Purpose |
|----------------------|----------------|
| **My Dashboard**     | Overview of your centre’s activity and metrics |
| **Stock In**         | Record produce received at the centre (e.g. from farmers) |
| **Receive from Ward**| Record produce received from ward-level collection |
| **Stock Out**        | Record stock going out (e.g. to buyers, delivery) |
| **Order Processing** | Process marketplace orders (match to stock, fulfil) |
| **Buyer Matching**   | Match buyer demand to available inventory |
| **Inventory**        | View and manage current inventory at the centre |
| **Reports**          | Centre-level reports |
| **Farmers**          | View farmers linked to your centre (CRM-style) |

Use the **menu icon** on small screens to open or close the sidebar.

---

## 3. Stock In

**Essence:** **Stock In** is how you **record produce arriving** at your centre from farmers (or from ward collection). Each record creates or updates a batch in inventory so it can be allocated to orders or stock out—so your books and inventory stay accurate and traceable.

**Flow: Farmer delivers produce → You record stock in (batch, variety, grade, quantity, farmer) → Stock appears in inventory.**

1. Go to **Stock In** in the sidebar.
2. Click **New stock in** (or **Record receipt**). You see a form to record incoming produce.
3. Fill in:
   - **Farmer**: select or search for the farmer who delivered (or enter name/phone if the UI allows).
   - **Batch**: select an existing batch or create a **new batch** (batch ID may be auto-generated or you enter a reference). Linking to a **pickup booking** or **listing** can pre-fill some fields if the UI supports it.
   - **Variety** (e.g. Kenya, SPK004, Kabode)
   - **Grade** (A, B, or C)
   - **Quantity** and unit (e.g. kg)
   - Any other required fields (e.g. date received, notes).
4. Submit. The produce is **added to your centre’s inventory** and can be used in **Order Processing** (allocate to buyer orders) and **Stock Out** (record when it leaves). The farmer may see a receipt or confirmation if the system generates one.
5. Repeat for each delivery. You can view **past stock-in records** from the same screen or from Reports.

---

## 4. Receive from Ward

**Essence:** **Receive from Ward** is for recording produce **received from ward-level** collection points into your centre. It keeps stock and traceability correct when your flow uses ward aggregation before the main centre.

**Flow: Ward delivers to centre → You record receive from ward (source ward, batch, quantity) → Stock added to inventory.**

1. Go to **Receive from Ward** in the sidebar.
2. Click **New receipt** (or similar). You see a form to record produce received **from a ward** (e.g. from a ward collection point or sub-centre).
3. Fill in **source ward**, **batch** (or create new), **variety**, **grade**, **quantity**, and any required details. Submit.
4. The stock is **added to your centre’s inventory** and can be used in Order Processing and Stock Out. Use this flow only when your process involves ward-level aggregation; otherwise use **Stock In** for direct farmer deliveries.

---

## 5. Stock Out

**Essence:** **Stock Out** is how you **record produce leaving** the centre—to a buyer, order, or delivery. It reduces inventory and can update order status, so your stock levels and order fulfilment stay in sync.

**Flow: Buyer order or delivery → You record stock out (batch, quantity, buyer/order) → Inventory decreases.**

1. Go to **Stock Out** in the sidebar.
2. Click **New stock out** (or **Record dispatch**). You see a form to record produce leaving the centre.
3. Fill in:
   - **Batch** (or inventory item): select the batch you are dispatching from. The available quantity may be shown.
   - **Quantity** to dispatch (cannot exceed available).
   - **Buyer** or **Order**: link to the buyer or marketplace order if applicable, so the order status can update (e.g. Ready for collection, Dispatched).
   - Any other required fields (e.g. date, destination, notes).
4. Submit. **Inventory is reduced** for that batch. If linked to an order, the order status may change (e.g. to Ready for collection or In delivery). The buyer can then collect or receive delivery and confirm.
5. Repeat for each dispatch. View **past stock-out records** from the same screen or Reports.

---

## 6. Order Processing

**Essence:** **Order Processing** is where you **fulfil buyer orders** at your centre: see incoming orders, allocate batches from inventory, and mark orders ready for collection or delivery. It links marketplace demand to your physical stock so buyers get what they ordered.

**Flow: Buyer orders from marketplace → Order appears in Order Processing → You allocate stock (batch) to the order → Mark ready for collection or trigger delivery.**

1. Go to **Order Processing** in the sidebar.
2. You see **orders** that need to be fulfilled at your centre (e.g. marketplace orders linked to your centre or to listings that will be delivered via you). The list may show order number, buyer, variety, grade, quantity, and status.
3. Click an order to open it. You see **buyer** details, **quantity** and **variety/grade** required, and **delivery/collection** preferences.
4. **Allocate stock**: link the order to a **batch** (or inventory item) that matches variety and grade and has enough quantity. If the UI allows, select the batch and confirm allocation. Optionally update order status to **Ready for collection** or **In delivery**.
5. When the buyer (or transport) **collects** or **receives delivery**, the order may be marked **Collected** or **Delivered** from this screen, or the buyer/transport flow may update it. Use **Stock Out** to record the physical dispatch if you use that step.
6. Orders that are already fulfilled or cancelled may be filtered out; use status filters to see only **pending** or **in progress** orders.

---

## 7. Buyer Matching

**Essence:** **Buyer Matching** shows **buyer demand** (e.g. from marketplace or sourcing requests) alongside **your inventory**. Use it to match demand to batches, create or update allocations, and fill orders efficiently.

**Flow: Open Buyer Matching → See demand and inventory → Allocate batches to orders or create allocations.**

1. Go to **Buyer Matching** in the sidebar.
2. You see **buyer demand** (e.g. open orders or sourcing requests) and **available inventory** (batches at your centre with variety, grade, quantity). The view may be a list, table, or matching interface.
3. **Match** demand to batches: for each order or request, select a batch that fits (variety, grade, quantity) and **allocate** or **assign**. This may create or update the link between order and batch as in **Order Processing**.
4. Use this to **plan** which batches will fulfil which orders and to fill orders in bulk when many are pending.

---

## 8. Inventory

**Essence:** **Inventory** is your **live view of stock** at the centre—batches, variety, grade, quantity. Use it to know what’s available for order processing and stock out, and to spot gaps or surpluses.

**Flow: Open Inventory → View batches and quantities → Use for allocation and stock-out decisions.**

1. Go to **Inventory** in the sidebar.
2. You see **current inventory** at your centre: list or table of **batches** (or inventory items) with **variety**, **grade**, **quantity** available, and optionally **farmer**, **date received**, **location** (e.g. storage area).
3. Use **filters** (e.g. variety, grade) and **search** if available to find specific batches. Use this to decide what to allocate to orders (**Order Processing**, **Buyer Matching**) and what to dispatch (**Stock Out**). Check for **low stock** or **surplus** to plan receipts or promotions.
4. Some pages may also show **Storage** or **Capacity** management (e.g. bins, zones); use those if your centre tracks physical storage.

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

- **Notifications** (bell icon or in-app) may alert you to **new orders** to process, **low stock**, or **pickup schedules**. Open them to go to the relevant screen.
- Use **Settings** or **Profile** (if available) to update your details or password. Your **centre assignment** is managed by staff in **Users** and **Aggregation Centers**.

---

## 11. Quick reference: key flows

| Goal | Steps |
|------|--------|
| Record produce received | Stock In → New stock in → Farmer, batch, variety, grade, quantity → Submit |
| Record from ward | Receive from Ward → New receipt → Source ward, batch, quantity → Submit |
| Record produce leaving | Stock Out → New stock out → Batch, quantity, link to buyer/order → Submit |
| Fulfil buyer order | Order Processing → Open order → Allocate batch → Mark ready for collection/delivered as applicable |
| Match demand to stock | Buyer Matching → View demand and inventory → Allocate batches to orders |
| Check what you have | Inventory → View batches and quantities → Filter by variety/grade if needed |
| Report | Reports → Select report type and date range → Generate or view → Export/print |
| See farmers | Farmers → View list → Open farmer for history and contact |

---

For **farmers** (posting listings, booking pickups to your centre), see **[User Guide: Farmer](USER_GUIDE_FARMER.md)**. For **buyers** (placing orders, collection), see **[User Guide: Buyer](USER_GUIDE_BUYER.md)**.
