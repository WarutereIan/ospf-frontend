# OFSP Digital Marketplace Platform
## Reporting, Analytics & Visualization Specification

**Document Version:** 1.0  
**Date:** January 13, 2026  
**Status:** Planning & Specification

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Reporting Framework Overview](#2-reporting-framework-overview)
3. [User-Specific Reporting Capabilities](#3-user-specific-reporting-capabilities)
4. [Metrics & KPIs by User Type](#4-metrics--kpis-by-user-type)
5. [Visualization Guidelines](#5-visualization-guidelines)
6. [Report Configuration & Scheduling](#6-report-configuration--scheduling)
7. [Data Export & Sharing](#7-data-export--sharing)
8. [Implementation Recommendations](#8-implementation-recommendations)

---

## 1. Introduction

### 1.1 Purpose

This document provides comprehensive guidance on the reporting, analytics, and visualization capabilities for the OFSP Digital Marketplace Platform. It defines what reports each user type can generate, which metrics to track, appropriate visualization methods, and recommended frequencies for different report types.

### 1.2 Design Principles

1. **Role-Based Access**: Users only see data relevant to their role and scope
2. **Actionable Insights**: Reports should drive decisions, not just display data
3. **Appropriate Visualization**: Match visualization type to data characteristics and user sophistication
4. **Accessibility**: Consider low-bandwidth, mobile-first, and varying literacy levels
5. **Flexibility**: Allow user customization within their access boundaries
6. **Timeliness**: Provide real-time, daily, weekly, monthly, and custom period options

### 1.3 User Literacy Considerations

| User Type | Digital Literacy | Data Literacy | Recommended Approach |
|-----------|-----------------|---------------|---------------------|
| Farmers | Variable (Low-Medium) | Low-Medium | Simple visuals, icons, color coding, SMS summaries |
| Buyers | Medium-High | Medium-High | Standard dashboards, detailed tables, exports |
| Aggregation Managers | Medium | Medium | Operational dashboards, clear metrics, alerts |
| County Officers | Medium-High | Medium-High | Analytical dashboards, trend analysis, maps |
| Project Staff | High | High | Full analytics, custom reports, raw data access |
| Input Providers | Medium | Medium | Sales-focused dashboards, inventory alerts |
| Transport Providers | Low-Medium | Low | Simple metrics, route-based visuals, earnings focus |

---

## 2. Reporting Framework Overview

### 2.1 Report Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPORT CATEGORIES                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   OPERATIONAL   │   ANALYTICAL    │      STRATEGIC              │
├─────────────────┼─────────────────┼─────────────────────────────┤
│ • Daily summaries│ • Trend analysis│ • Impact assessment        │
│ • Transaction logs│ • Comparisons  │ • Forecasting              │
│ • Inventory status│ • Performance  │ • Planning reports         │
│ • Delivery tracking│ • Quality metrics│ • Donor/Government reports│
│ • Payment status │ • Market analysis│ • Program evaluation       │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### 2.2 Report Generation Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **On-Demand** | User generates manually when needed | Ad-hoc analysis, specific queries |
| **Scheduled** | Automatically generated at set intervals | Regular monitoring, compliance |
| **Triggered** | Generated when conditions are met | Alerts, exceptions, thresholds |
| **Shared** | Pre-configured reports shared with user | Standard organizational reports |

### 2.3 Data Freshness Levels

| Level | Latency | Use Cases |
|-------|---------|-----------|
| **Real-time** | < 1 minute | Active deliveries, payment status, live inventory |
| **Near Real-time** | < 15 minutes | Dashboard metrics, order tracking |
| **Hourly** | 1 hour | Operational summaries, stock levels |
| **Daily** | End of day | Daily reports, reconciliation |
| **Weekly/Monthly** | End of period | Analytical reports, trends |

---

## 3. User-Specific Reporting Capabilities

### 3.1 FARMERS

#### Access Scope
- Own production data
- Own sales and orders
- Own quality history
- Market prices (public)
- Peer comparison (anonymized)
- Own payment history

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **My Sales Summary** | Overview of sales performance | Daily, Weekly, Monthly, Custom | Total sales (KES), quantity sold (kg), average price, number of transactions |
| **Production Record** | Harvest and delivery history | Weekly, Monthly, Seasonal | Quantities delivered, varieties, quality grades received |
| **Quality Performance** | Quality check results over time | Monthly, Quarterly | Grade distribution, rejection rates, common issues |
| **Earnings Statement** | Detailed payment breakdown | Weekly, Monthly | Gross earnings, platform fees, net earnings, payment status |
| **Market Price Report** | Current and historical prices | Daily, Weekly | Price by variety, price by grade, price trends |
| **My Ranking Report** | Performance vs peers (anonymized) | Monthly | Volume ranking, quality ranking, consistency score |
| **Input Purchase History** | Agricultural inputs bought | Monthly, Quarterly | Items purchased, costs, suppliers |
| **Seasonal Summary** | End-of-season comprehensive report | Seasonal (3x/year) | Total production, earnings, quality trends, recommendations |

#### Recommended Visualizations for Farmers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Monthly earnings | **Simple bar chart** with large numbers | Easy to compare months, clear totals |
| Quality grades | **Pie chart with icons** (A=✓, B=⚠, C=✗) | Quick understanding of grade distribution |
| Price trends | **Sparkline** or **simple line** | Shows direction without complexity |
| Peer comparison | **Thermometer/gauge** with position marker | Intuitive ranking display |
| Earnings breakdown | **Pictograph** (money icons) | Tangible representation of amounts |
| Season progress | **Progress bar** | Clear goal tracking |

#### Delivery Format Recommendations
- **SMS Summary**: Key numbers (weekly earnings, next payment date)
- **Mobile App**: Visual dashboard with large touch targets
- **Printable**: Simple 1-page summary with clear sections

---

### 3.2 BUYERS

#### Access Scope
- Own purchase history
- Order and delivery tracking
- Payment history
- Supplier (farmer) ratings
- Market availability
- Price analytics

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **Purchase Summary** | Overview of buying activity | Daily, Weekly, Monthly | Total spend, quantities, order count, average order value |
| **Supplier Performance** | Farmer quality and reliability | Monthly, Quarterly | Quality scores, delivery reliability, response rates |
| **Order History** | Detailed transaction log | On-demand, Monthly | All orders with status, amounts, timelines |
| **Spend Analysis** | Breakdown of expenditure | Monthly, Quarterly | Spend by variety, by supplier, by location |
| **Price Comparison** | Price paid vs market average | Weekly, Monthly | Price variances, best deals, premium paid |
| **Quality Received** | Quality of produce received | Monthly | Grade distribution, rejection instances, issues |
| **Delivery Performance** | Logistics tracking | Weekly, Monthly | On-time delivery %, delays, delivery costs |
| **Payment Report** | Financial transactions | Monthly | Payment timeline, escrow status, fees paid |
| **Forecast Report** | Predicted availability | Weekly | Supply forecasts, price predictions, seasonal outlook |

#### Recommended Visualizations for Buyers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Monthly spend | **Area chart** with trend line | Shows volume and trajectory |
| Supplier comparison | **Radar/spider chart** | Multi-dimensional comparison |
| Order status | **Kanban/pipeline view** | Clear workflow status |
| Price trends | **Candlestick chart** or **line with range** | Price volatility visibility |
| Spend breakdown | **Treemap** or **sunburst** | Hierarchical spend analysis |
| Delivery performance | **Bullet chart** against targets | Performance vs expectations |
| Quality distribution | **Stacked bar chart** | Grade breakdown over time |

#### Delivery Format Recommendations
- **Dashboard**: Real-time web dashboard with drill-down
- **Email**: Weekly summary with key metrics
- **Export**: Excel/CSV for financial reconciliation
- **PDF**: Monthly statements for accounting

---

### 3.3 AGGREGATION CENTRE MANAGERS

#### Access Scope
- Centre inventory (own centre + satellites if main)
- Transactions through centre
- Farmers delivering to centre
- Quality check records
- Storage capacity
- Wastage data

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **Daily Operations Summary** | End-of-day operational snapshot | Daily | Stock in, stock out, current inventory, transactions |
| **Inventory Status** | Current stock levels and aging | Real-time, Daily | Quantities by variety/grade, days in storage, aging alerts |
| **Farmer Delivery Report** | Who delivered what | Daily, Weekly | Farmer details, quantities, quality grades, payments due |
| **Quality Check Summary** | Results of quality assessments | Daily, Weekly | Pass/fail rates, grade distribution, common defects |
| **Wastage Report** | Stock losses and causes | Weekly, Monthly | Wastage quantity, reasons, financial impact |
| **Capacity Utilization** | Storage space usage | Daily, Weekly | % capacity used, peak times, forecast |
| **Financial Summary** | Centre financial performance | Weekly, Monthly | Revenue, farmer payments, operating costs, margins |
| **Satellite Centre Rollup** | Consolidated satellite data (main centres only) | Daily, Weekly | Combined inventory, transactions, capacity |
| **Farmer Performance** | Farmer reliability and quality | Monthly | Regular suppliers, quality trends, volume trends |
| **Buyer Fulfillment** | Order completion rates | Weekly, Monthly | Orders fulfilled, partial fills, rejections |

#### Recommended Visualizations for Aggregation Managers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Current inventory | **Stacked bar** by variety/grade | Quick overview of stock composition |
| Capacity utilization | **Gauge/meter** | Immediate capacity visibility |
| Stock aging | **Heat map calendar** | Days in storage urgency |
| Daily transactions | **Timeline/waterfall** | Stock flow visualization |
| Quality distribution | **Donut chart** with center stat | Grade breakdown with total |
| Wastage trends | **Line chart with annotations** | Patterns and incident markers |
| Farmer deliveries | **Bar chart ranked** | Top suppliers visibility |
| Satellite comparison | **Small multiples** | Compare multiple centres |

#### Delivery Format Recommendations
- **Dashboard**: Operational dashboard with alerts
- **Mobile**: Quick-glance metrics for floor management
- **Printable**: Daily logs for record-keeping
- **Alerts**: SMS/push for critical thresholds

---

### 3.4 COUNTY AGRICULTURAL OFFICERS

#### Access Scope
- All farmers in jurisdiction
- All aggregation centres in jurisdiction
- Production volumes by area
- Quality trends by area
- Market activity summary
- Farmer registration data

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **County Production Report** | Total OFSP production | Monthly, Quarterly | Volumes by subcounty/ward, variety breakdown, growth rates |
| **Farmer Registration Report** | New and active farmers | Monthly, Quarterly | New registrations, active farmers, demographics |
| **Centre Performance** | Aggregation centre metrics | Monthly | Throughput, capacity, efficiency by centre |
| **Quality Standards Report** | Quality compliance overview | Monthly, Quarterly | Grade distributions, rejection rates, improvement trends |
| **Market Activity** | Trading volumes and values | Weekly, Monthly | Transaction counts, values, price trends |
| **Geographic Distribution** | Spatial analysis of activity | Monthly, Quarterly | Production by ward, centre coverage, gaps |
| **Extension Impact** | Farmer improvement metrics | Quarterly, Annual | Quality improvements, yield trends, adoption rates |
| **Price Monitoring** | Market price tracking | Weekly, Monthly | Price ranges, anomalies, comparisons |
| **Seasonal Forecast** | Production predictions | Seasonal | Expected volumes, timing, capacity needs |
| **Government Reporting Pack** | Pre-formatted county reports | Quarterly, Annual | Standard metrics for government reporting |

#### Key Metrics for County Government Reporting

| Category | Metrics | Why It Matters |
|----------|---------|----------------|
| **Production** | Total tonnes produced, hectares under cultivation, yield per hectare | Food security, agricultural productivity |
| **Economic** | Total market value, farmer incomes, jobs created | Economic development indicators |
| **Participation** | Number of farmers, youth participation, women participation | Inclusive growth metrics |
| **Quality** | % Grade A produce, rejection rates, quality improvement | Standards compliance |
| **Infrastructure** | Centre utilization, storage capacity, coverage | Infrastructure investment ROI |
| **Nutrition** | Volumes reaching markets, pricing accessibility | Nutrition program objectives |

#### Recommended Visualizations for Officers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Geographic production | **Choropleth map** | Spatial distribution patterns |
| Production trends | **Multi-series line chart** | Compare subcounties over time |
| Farmer demographics | **Population pyramid** or **grouped bars** | Age/gender breakdown |
| Centre performance | **Benchmark bar chart** | Performance comparison |
| Quality by area | **Heat map** (geographic) | Identify quality hotspots |
| Seasonal patterns | **Stream graph** or **stacked area** | Volume flow over seasons |
| Market prices | **Box plot** by period | Price distribution and outliers |
| Growth metrics | **Bullet charts** against targets | KPI tracking |

#### Delivery Format Recommendations
- **Dashboard**: Executive summary with drill-down
- **Reports**: Formatted reports for government submission
- **Maps**: Geographic visualizations for planning
- **Presentations**: Auto-generated slides for meetings

---

### 3.5 CONCERN PROJECT STAFF (M&E Focus)

#### Access Scope
- Full system data access
- Cross-county comparisons
- Historical data
- Program indicator tracking
- Beneficiary data
- Financial program data

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **Program Dashboard** | Overall program performance | Real-time, Weekly | All key indicators, progress vs targets |
| **Beneficiary Report** | Farmer participation and benefits | Monthly, Quarterly | Registered farmers, active farmers, income changes |
| **Market Development** | Market system health | Monthly, Quarterly | Transaction volumes, buyer engagement, price stability |
| **Quality Improvement** | Quality trends over time | Quarterly | Grade improvements, training impact, best practices |
| **Gender & Youth** | Inclusion metrics | Quarterly | Participation rates, income by demographic, barriers |
| **Value Chain Analysis** | End-to-end performance | Quarterly | Margins, efficiency, bottlenecks |
| **Impact Assessment** | Outcome-level metrics | Annual | Income changes, food security, nutrition outcomes |
| **Donor Report Pack** | Formatted donor reports | As required | Standard donor indicators, narrative support |
| **Geographic Coverage** | Expansion and reach | Quarterly | Coverage maps, gap analysis, growth |
| **Risk Register** | Program risks and issues | Weekly, Monthly | Active issues, mitigation status |

#### M&E Indicator Framework

| Level | Indicator Category | Example Metrics |
|-------|-------------------|-----------------|
| **Output** | Activities completed | Farmers trained, centres established, transactions facilitated |
| **Outcome** | Behavior/practice changes | Adoption rates, quality improvement, market participation |
| **Impact** | Long-term changes | Income increase, food security, nutrition status |

#### Key M&E Metrics to Track

**Reach Indicators:**
- Number of farmers registered (disaggregated by gender, age, location)
- Number of farmers actively transacting
- Number of buyers engaged
- Geographic coverage (wards, subcounties)
- Volume of produce transacted

**Quality Indicators:**
- % of produce meeting Grade A standards
- Quality improvement rate over time
- Post-harvest loss reduction
- Training attendance and completion rates

**Economic Indicators:**
- Average farmer income from OFSP
- Income change vs baseline
- Price premium achieved
- Transaction costs reduced
- Market linkage success rate

**Sustainability Indicators:**
- Platform financial viability
- User retention rates
- Repeat transaction rates
- Local ownership indicators

#### Recommended Visualizations for M&E

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Progress vs targets | **Bullet charts** | Clear target tracking |
| Beneficiary growth | **Cumulative area chart** | Total reach over time |
| Geographic reach | **Density map** with overlays | Coverage and gap analysis |
| Indicator trends | **Sparkline grids** | Many metrics at once |
| Comparison | **Slope charts** | Before/after or period comparison |
| Disaggregation | **Small multiples** | Same metric across groups |
| Theory of change | **Sankey diagram** | Flow from inputs to outcomes |
| Risk/issues | **Matrix/quadrant chart** | Priority visualization |

#### Delivery Format Recommendations
- **Dashboard**: Comprehensive with filters and export
- **Reports**: Donor-formatted templates
- **Data**: Raw data export for external analysis
- **Presentations**: Auto-generated program reviews

---

### 3.6 INPUT PROVIDERS

#### Access Scope
- Own product listings
- Own sales data
- Customer (farmer) data
- Inventory levels
- Order history
- Payment history

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **Sales Summary** | Overall sales performance | Daily, Weekly, Monthly | Revenue, units sold, average order value |
| **Product Performance** | Sales by product | Weekly, Monthly | Best sellers, slow movers, stock turnover |
| **Customer Report** | Buyer analysis | Monthly | Customer count, repeat customers, geographic spread |
| **Inventory Report** | Stock levels and movement | Daily, Weekly | Current stock, reorder alerts, stock days |
| **Order Fulfillment** | Order completion metrics | Weekly, Monthly | Orders received, fulfilled, pending, cancelled |
| **Revenue Report** | Financial performance | Monthly | Gross revenue, net revenue, payment status |
| **Geographic Sales** | Sales by location | Monthly | Sales by subcounty/ward, delivery patterns |
| **Seasonal Trends** | Demand patterns | Quarterly, Annual | Peak seasons, product demand cycles |

#### Recommended Visualizations for Input Providers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Sales trend | **Bar chart with trend line** | Volume and direction |
| Product mix | **Pie/donut chart** | Product contribution |
| Inventory status | **Stock level bars with threshold lines** | Reorder visibility |
| Customer geography | **Simple map with markers** | Distribution pattern |
| Order pipeline | **Funnel chart** | Conversion tracking |
| Revenue | **Large number cards** | Key financial metrics |

---

### 3.7 TRANSPORT PROVIDERS

#### Access Scope
- Own delivery data
- Own earnings
- Route history
- Customer ratings
- Performance metrics

#### Available Reports

| Report Name | Description | Frequency Options | Metrics Included |
|-------------|-------------|-------------------|------------------|
| **Earnings Summary** | Income overview | Daily, Weekly, Monthly | Total earnings, trips completed, average per trip |
| **Trip History** | Delivery log | On-demand, Weekly | All trips with details, earnings, distance |
| **Performance Report** | Service quality metrics | Weekly, Monthly | On-time rate, customer ratings, completion rate |
| **Route Analysis** | Geographic patterns | Monthly | Common routes, distance traveled, fuel efficiency |
| **Payment Statement** | Detailed earnings breakdown | Weekly, Monthly | Trip payments, bonuses, deductions |
| **Customer Feedback** | Ratings and reviews | Monthly | Average rating, feedback themes, trends |

#### Recommended Visualizations for Transport Providers

| Metric | Visualization | Rationale |
|--------|---------------|-----------|
| Daily/weekly earnings | **Large numbers with simple bar** | Focus on income |
| Trip count | **Simple counter** | Easy to understand |
| Rating | **Star display** with numeric | Familiar format |
| Routes | **Simple map with routes** | Geographic patterns |
| Earnings trend | **Simple line chart** | Progress over time |
| Completion rate | **Percentage circle** | Quick performance check |

---

## 4. Metrics & KPIs by User Type

### 4.1 Complete Metrics Catalog

#### FARMER METRICS

| Category | Metric | Unit | Frequency | Visualization |
|----------|--------|------|-----------|---------------|
| **Production** | Total quantity delivered | kg | Per delivery, Monthly | Running total, bar chart |
| | Delivery frequency | count | Monthly | Calendar view |
| | Variety breakdown | % | Monthly | Pie chart |
| **Quality** | Average quality grade | Grade (A/B/C) | Per delivery, Monthly | Grade icons, trend |
| | Grade A percentage | % | Monthly | Progress bar |
| | Rejection rate | % | Monthly | Trend line |
| | Quality score | 0-100 | Monthly | Gauge |
| **Financial** | Total earnings | KES | Weekly, Monthly | Bar chart, large number |
| | Average price received | KES/kg | Monthly | Comparison bar |
| | Payment pending | KES | Real-time | Alert card |
| | Net earnings after fees | KES | Monthly | Statement |
| **Market** | Current market price | KES/kg | Real-time | Ticker, comparison |
| | Price vs last month | % change | Weekly | Arrow indicator |
| | Best price location | Name | Real-time | Text with map |
| **Comparison** | Volume ranking | Percentile | Monthly | Gauge with position |
| | Quality ranking | Percentile | Monthly | Gauge with position |
| | Earnings ranking | Percentile | Monthly | Gauge with position |

#### BUYER METRICS

| Category | Metric | Unit | Frequency | Visualization |
|----------|--------|------|-----------|---------------|
| **Purchasing** | Total spend | KES | Weekly, Monthly | Area chart |
| | Quantity purchased | kg | Weekly, Monthly | Bar chart |
| | Order count | count | Weekly, Monthly | Counter |
| | Average order value | KES | Monthly | Trend line |
| **Sourcing** | Supplier count | count | Monthly | Counter |
| | Top suppliers | List | Monthly | Ranked bar |
| | Geographic sources | Map | Monthly | Choropleth |
| | Supplier reliability | % | Monthly | Score card |
| **Quality** | Grade A received | % | Monthly | Progress bar |
| | Rejection rate | % | Monthly | Trend |
| | Quality consistency | Score | Monthly | Gauge |
| **Logistics** | On-time delivery rate | % | Monthly | Bullet chart |
| | Average delivery time | Hours/days | Monthly | Trend |
| | Delivery cost | KES | Monthly | Stack bar |
| **Financial** | Spend vs budget | % | Monthly | Progress bar |
| | Price efficiency | % vs market | Monthly | Comparison bar |
| | Payment status | Count by status | Real-time | Pipeline |

#### AGGREGATION CENTRE METRICS

| Category | Metric | Unit | Frequency | Visualization |
|----------|--------|------|-----------|---------------|
| **Inventory** | Current stock | kg | Real-time | Gauge with zones |
| | Stock by variety | kg per variety | Real-time | Stacked bar |
| | Stock by grade | kg per grade | Real-time | Donut |
| | Stock age | Days | Real-time | Heat map |
| | Stock value | KES | Daily | Large number |
| **Throughput** | Stock in today | kg | Real-time | Running total |
| | Stock out today | kg | Real-time | Running total |
| | Daily transactions | count | Daily | Counter |
| | Weekly throughput | kg | Weekly | Bar chart |
| **Capacity** | Utilization rate | % | Real-time | Gauge |
| | Available capacity | kg | Real-time | Number card |
| | Peak utilization | % | Weekly | Line with max marker |
| **Quality** | QC pass rate | % | Daily | Progress bar |
| | Grade distribution | % per grade | Daily | Pie chart |
| | Rejection count | count | Daily | Alert counter |
| **Wastage** | Wastage quantity | kg | Daily, Weekly | Bar chart |
| | Wastage rate | % | Weekly | Trend line |
| | Wastage reasons | % per reason | Weekly | Donut |
| **Financial** | Revenue | KES | Weekly, Monthly | Bar chart |
| | Farmer payments due | KES | Daily | Alert card |
| | Operating margin | % | Monthly | Gauge |

#### COUNTY OFFICER METRICS

| Category | Metric | Unit | Frequency | Visualization |
|----------|--------|------|-----------|---------------|
| **Production** | Total production | Tonnes | Monthly, Quarterly | Area chart |
| | Production by subcounty | Tonnes | Monthly | Grouped bars, map |
| | Production growth rate | % | Quarterly | Comparison |
| | Yield per hectare | kg/ha | Seasonal | Bar chart |
| **Participation** | Registered farmers | count | Monthly | Cumulative line |
| | Active farmers | count | Monthly | Counter with trend |
| | New registrations | count | Monthly | Bar chart |
| | Women farmers | % | Quarterly | Progress bar |
| | Youth farmers | % | Quarterly | Progress bar |
| **Market** | Total market value | KES | Monthly | Large number |
| | Average farmer income | KES | Quarterly | Trend line |
| | Market price range | KES/kg | Weekly | Box plot |
| **Quality** | County Grade A rate | % | Monthly | Progress bar |
| | Quality by subcounty | % | Monthly | Heat map |
| | Improvement trend | % change | Quarterly | Slope chart |
| **Infrastructure** | Centre utilization | % | Monthly | Bullet charts |
| | Coverage (wards reached) | count | Quarterly | Map |

#### PROJECT STAFF (M&E) METRICS

| Category | Metric | Unit | Frequency | Visualization |
|----------|--------|------|-----------|---------------|
| **Reach** | Total beneficiaries | count | Monthly | Cumulative area |
| | Active beneficiaries | count | Monthly | Funnel |
| | Geographic coverage | % of target | Quarterly | Map with targets |
| | Beneficiary growth rate | % | Monthly | Trend |
| **Outcome** | Average income change | KES or % | Quarterly | Bar with baseline |
| | Quality improvement | % change | Quarterly | Slope chart |
| | Market participation rate | % | Monthly | Progress |
| | Adoption rates | % | Quarterly | Multi-bar |
| **Sustainability** | Platform revenue | KES | Monthly | Trend |
| | Cost per beneficiary | KES | Quarterly | Trend |
| | User retention | % | Monthly | Cohort |
| **Program** | Budget utilization | % | Monthly | Progress bar |
| | Activity completion | % | Monthly | Gantt/checklist |
| | Risk score | Level | Weekly | Matrix |

---

## 5. Visualization Guidelines

### 5.1 Visualization Selection Framework

```
┌──────────────────────────────────────────────────────────────────────┐
│               VISUALIZATION SELECTION GUIDE                          │
├──────────────────────┬───────────────────────────────────────────────┤
│ DATA RELATIONSHIP    │ RECOMMENDED VISUALIZATION                     │
├──────────────────────┼───────────────────────────────────────────────┤
│ Comparison           │ Bar chart, Grouped bar, Bullet chart          │
│ Trend over time      │ Line chart, Area chart, Sparkline             │
│ Part-to-whole        │ Pie chart, Donut, Treemap, Stacked bar        │
│ Distribution         │ Histogram, Box plot, Violin plot              │
│ Correlation          │ Scatter plot, Bubble chart                    │
│ Geographic           │ Choropleth map, Point map, Heat map           │
│ Flow/Process         │ Sankey, Funnel, Pipeline                      │
│ Hierarchy            │ Treemap, Sunburst, Organization chart         │
│ Performance vs Target│ Bullet chart, Gauge, Progress bar             │
│ Ranking              │ Horizontal bar, Lollipop chart                │
└──────────────────────┴───────────────────────────────────────────────┘
```

### 5.2 User-Appropriate Visualization Mapping

| User Type | Complexity Level | Preferred Visualizations | Avoid |
|-----------|-----------------|--------------------------|-------|
| **Farmers** | Simple | Bar charts, pie charts, progress bars, large numbers, icons, color coding | Complex multi-series, scatter plots, statistical charts |
| **Buyers** | Medium-High | Tables with sorting, line charts, stacked bars, gauges, pipeline views | Overly artistic, 3D charts |
| **Aggregation Managers** | Medium | Gauges, heat maps, stacked bars, alert indicators, timelines | Complex analytics, correlation charts |
| **County Officers** | Medium-High | Maps, grouped bars, trend lines, bullet charts, small multiples | Raw data tables, overly detailed |
| **Project Staff** | High | Any appropriate visualization, including statistical charts, cohort analysis, Sankey diagrams | None - full sophistication appropriate |
| **Input Providers** | Medium | Sales charts, inventory bars, pie charts, large numbers | Complex analytics |
| **Transport Providers** | Simple | Large numbers, simple bars, maps with routes, star ratings | Complex charts, multi-dimensional |

### 5.3 Color Guidelines

#### Semantic Color Usage

| Meaning | Color | Usage |
|---------|-------|-------|
| Positive/Good | Green (#22C55E) | Grade A, On target, Increase, Success |
| Warning/Caution | Amber/Yellow (#F59E0B) | Grade B, Near threshold, Aging stock |
| Negative/Alert | Red (#EF4444) | Grade C, Below target, Critical, Failure |
| Neutral/Info | Blue (#3B82F6) | Information, In progress, Links |
| Inactive/Pending | Gray (#6B7280) | Disabled, Pending, Historical |

#### Accessibility Requirements
- Minimum contrast ratio of 4.5:1 for text
- Do not rely on color alone (use icons, patterns, labels)
- Support color blindness (use patterns, different saturation levels)
- Provide data labels on charts

### 5.4 Mobile-First Considerations

**For Farmer Mobile Views:**
- Single KPI per screen section
- Large tap targets (minimum 44px)
- Swipe-friendly card navigation
- Offline-capable summary views
- SMS fallback for key metrics

**For Field Worker Mobile Views:**
- Collapsible sections
- Quick filters
- Landscape charts when needed
- Download for offline viewing

### 5.5 Print/Export Considerations

| Format | Best For | Visualization Adjustments |
|--------|----------|---------------------------|
| **PDF** | Formal reports, records | Black/white friendly, include legends, page breaks |
| **Excel** | Data analysis, reconciliation | Include raw data tables, minimal charts |
| **PowerPoint** | Presentations | Large fonts, key messages, simplified charts |
| **Image** | Social media, sharing | High resolution, branded, standalone context |

---

## 6. Report Configuration & Scheduling

### 6.1 Scheduling Options by User Type

| User Type | Recommended Schedules | Delivery Methods |
|-----------|----------------------|------------------|
| **Farmers** | Weekly earnings SMS (Friday), Monthly summary | SMS, App notification, WhatsApp |
| **Buyers** | Daily order summary, Weekly spend report, Monthly analysis | Email, Dashboard, PDF |
| **Aggregation Managers** | Daily operations (EOD), Weekly summary (Monday AM) | Email, Dashboard, Mobile |
| **County Officers** | Weekly activity, Monthly report, Quarterly analysis | Email, Dashboard, PDF |
| **Project Staff** | Weekly dashboard, Monthly donor prep, Quarterly review | Email, Dashboard, Export |
| **Input Providers** | Daily orders, Weekly sales, Monthly financial | Email, Dashboard |
| **Transport Providers** | Daily earnings, Weekly summary | SMS, App notification |

### 6.2 Report Scheduling Configuration

**User-Configurable Options:**

```
REPORT SCHEDULE SETTINGS
├── Report Selection
│   └── Choose from available reports
├── Frequency
│   ├── Daily (specify time)
│   ├── Weekly (specify day and time)
│   ├── Monthly (specify date and time)
│   ├── Quarterly
│   └── Custom (cron expression for advanced)
├── Delivery Method
│   ├── Email (enter addresses)
│   ├── SMS (for summaries only)
│   ├── In-app notification
│   └── Dashboard only
├── Format
│   ├── Dashboard view
│   ├── PDF attachment
│   ├── Excel attachment
│   └── CSV attachment
└── Filters/Scope
    └── Pre-set filters for the report
```

### 6.3 Alert-Based Reports

| Alert Type | Trigger Condition | Users Notified | Report Content |
|------------|-------------------|----------------|----------------|
| **Low Stock** | Inventory < threshold | Aggregation Manager | Current stock, reorder suggestion |
| **Quality Issue** | Rejection rate > threshold | Aggregation Manager, Officer | Batch details, cause analysis |
| **Payment Due** | Payment pending > X days | Farmer, Aggregation Manager | Payment details, action required |
| **Capacity Alert** | Utilization > 80% | Aggregation Manager | Current capacity, incoming forecast |
| **Price Anomaly** | Price deviation > 20% | Officer, Project Staff | Price analysis, market context |
| **Target Achievement** | KPI reaches milestone | Project Staff | Progress summary, next target |

---

## 7. Data Export & Sharing

### 7.1 Export Capabilities by User Type

| User Type | PDF | Excel | CSV | API | Raw Data |
|-----------|-----|-------|-----|-----|----------|
| Farmers | ✓ | ✗ | ✗ | ✗ | ✗ |
| Buyers | ✓ | ✓ | ✓ | ✓* | ✗ |
| Aggregation Managers | ✓ | ✓ | ✓ | ✗ | ✗ |
| County Officers | ✓ | ✓ | ✓ | ✓* | ✗ |
| Project Staff | ✓ | ✓ | ✓ | ✓ | ✓ |
| Input Providers | ✓ | ✓ | ✓ | ✗ | ✗ |
| Transport Providers | ✓ | ✗ | ✗ | ✗ | ✗ |

*With approval/registration

### 7.2 Data Sharing Rules

| Data Type | Can Be Shared | With Whom | Restrictions |
|-----------|---------------|-----------|--------------|
| Own transaction data | Yes | Anyone | User's choice |
| Aggregated market data | Yes | All users | Anonymized |
| Individual farmer data | Limited | Officers with jurisdiction | Role-based |
| Quality data | Limited | Relevant parties | Transaction parties |
| Financial summaries | Yes | Account owner | Authentication required |
| Raw system data | Restricted | Project staff only | Audit logging |

### 7.3 Report Templates

**Pre-Configured Report Templates:**

1. **Government Submission Pack** (For Officers)
   - Monthly production summary
   - Farmer participation report
   - Market price analysis
   - Quality compliance report

2. **Donor Report Pack** (For Project Staff)
   - Beneficiary reach report
   - Outcome indicator summary
   - Financial summary
   - Success stories data

3. **Financial Statement Pack** (For All)
   - Transaction history
   - Payment summary
   - Fee breakdown
   - Outstanding balances

---

## 8. Implementation Recommendations

### 8.1 Phased Rollout

**Phase 1: Foundation (Months 1-2)**
- Basic dashboards for all user types
- Essential reports (daily, weekly summaries)
- Simple visualizations (bars, numbers, progress)
- PDF export capability

**Phase 2: Enhanced (Months 3-4)**
- Scheduled report generation
- Email delivery
- Additional visualizations
- Excel export
- Alert-based reports

**Phase 3: Advanced (Months 5-6)**
- Custom report builder
- Advanced visualizations
- API access for key users
- Predictive analytics
- Mobile-optimized reports

### 8.2 Technology Recommendations

| Component | Recommended Approach |
|-----------|---------------------|
| **Dashboard Framework** | React with Recharts or Chart.js |
| **Report Generation** | Server-side PDF generation (puppeteer, wkhtmltopdf) |
| **Scheduled Jobs** | Cron-based scheduler with queue system |
| **Data Aggregation** | Pre-computed rollups, materialized views |
| **Export** | Stream-based for large datasets |
| **SMS Integration** | Africa's Talking, Twilio |
| **Email** | SendGrid, Mailgun with templates |

### 8.3 Performance Considerations

- **Caching**: Cache dashboard data with appropriate TTL
- **Pre-aggregation**: Compute daily/weekly rollups overnight
- **Pagination**: Limit table rows, lazy load charts
- **Progressive Loading**: Load summary first, details on demand
- **Offline Support**: Cache recent data for mobile users

### 8.4 User Training Requirements

| User Type | Training Focus | Duration |
|-----------|----------------|----------|
| Farmers | Reading reports, understanding metrics | 30 minutes |
| Buyers | Dashboard navigation, report scheduling, exports | 1 hour |
| Aggregation Managers | Daily reporting workflow, alert response | 2 hours |
| County Officers | Analytical reports, geographic analysis, exports | 3 hours |
| Project Staff | Full system training, custom reports, API | 1 day |

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **KPI** | Key Performance Indicator - critical metric for success |
| **Dashboard** | Visual display of important metrics on single screen |
| **Drill-down** | Ability to click on summary to see details |
| **Sparkline** | Tiny inline chart showing trend |
| **Choropleth** | Map with areas colored by data value |
| **Cohort Analysis** | Tracking groups over time |
| **Sankey Diagram** | Flow diagram showing quantities between stages |
| **Bullet Chart** | Bar chart with target marker for comparison |

---

## Appendix B: Sample Report Mockups

*(To be developed during implementation phase)*

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 13, 2026 | System Architect | Initial specification |

---

**End of Document**
