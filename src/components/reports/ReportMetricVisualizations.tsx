/**
 * Report metric visualizations aligned with REPORTING_FRAMEWORK.md parameter matrix.
 * Maps each section (financial, quality, operational, users, geographic, farmerGroups, transactionEvidence)
 * and trends/summary to appropriate chart types: KPI cards, line, bar, horizontal bar, pie, gauge.
 * 
 * Enhanced for robust multi-visualization reports: each section now includes multiple viz types.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  StatCard,
  LineChart,
  SimpleBarChart,
  HorizontalBarChart,
  PieChart,
  CircularProgress,
  StackedBarChart,
} from "@/components/visualizations";
import {
  IconCurrencyDollar,
  IconPackage,
  IconUsers,
  IconChecklist,
  IconMapPin,
  IconBuildingStore,
  IconReceipt,
  IconTrendingUp,
  IconAlertTriangle,
  IconShieldCheck,
} from "@tabler/icons-react";

// ----- Helpers: format values for display -----
function fmtNum(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString();
}
function fmtCurrency(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `KES ${Number(n).toLocaleString()}`;
}
function fmtPct(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Number(n).toFixed(1)}%`;
}
function safeNum(n: unknown): number {
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  return 0;
}

// ----- Time series: map backend trends to chart data -----
function trendsToChartSeries(
  trends: Array<{ date?: string; revenue?: number; orders?: number; volume?: number }> | undefined
): { name: string; value: number; revenue?: number; orders?: number; volume?: number }[] {
  if (!Array.isArray(trends) || trends.length === 0) return [];
  return trends.map((t) => ({
    name: t.date ? new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "",
    value: t.revenue ?? 0,
    revenue: t.revenue ?? 0,
    orders: t.orders ?? 0,
    volume: t.volume ?? 0,
  }));
}

interface ReportMetricVisualizationsProps {
  report: {
    templateId?: string;
    summary?: Record<string, unknown> | null;
    trends?: Array<{ date?: string; revenue?: number; orders?: number; volume?: number }> | null;
    financial?: Record<string, unknown> | null;
    quality?: Record<string, unknown> | null;
    operational?: Record<string, unknown> | null;
    users?: Record<string, unknown> | null;
    geographic?: Record<string, unknown> | null;
    farmerGroups?: Record<string, unknown> | null;
    transactionEvidence?: Record<string, unknown> | null;
    staffAnalytics?: Record<string, unknown> | null;
    dateRange?: { start?: string; end?: string };
  } | null;
  includeCharts: boolean;
}

export function ReportMetricVisualizations({ report, includeCharts }: ReportMetricVisualizationsProps) {
  if (!report || !includeCharts) return null;

  const { summary, trends, financial, quality, operational, users, geographic, farmerGroups, transactionEvidence } = report;

  return (
    <div className="space-y-8">
      {/* Summary KPIs (from dashboard stats when template includes dashboard) */}
      {summary && typeof summary === "object" && Object.keys(summary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Key metrics for the report period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summary.totalRevenue != null && (
                <StatCard
                  label="Total Revenue"
                  value={fmtCurrency(summary.totalRevenue as number)}
                  icon={<IconCurrencyDollar className="h-5 w-5" />}
                />
              )}
              {summary.totalOrders != null && (
                <StatCard
                  label="Total Orders"
                  value={fmtNum(summary.totalOrders)}
                  icon={<IconPackage className="h-5 w-5" />}
                />
              )}
              {summary.totalFarmers != null && (
                <StatCard
                  label="Farmers"
                  value={fmtNum(summary.totalFarmers)}
                  icon={<IconUsers className="h-5 w-5" />}
                />
              )}
              {summary.totalBuyers != null && (
                <StatCard
                  label="Buyers"
                  value={fmtNum(summary.totalBuyers)}
                  icon={<IconUsers className="h-5 w-5" />}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time series: Revenue / Orders / Volume (REPORTING_FRAMEWORK trends) */}
      {Array.isArray(trends) && trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trends</CardTitle>
            <CardDescription>Revenue, orders, and volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={trendsToChartSeries(trends)}
              lines={[
                { dataKey: "revenue", name: "Revenue", color: "#22C55E" },
                { dataKey: "orders", name: "Orders", color: "#3B82F6" },
                { dataKey: "volume", name: "Volume (kg)", color: "#8B5CF6" },
              ]}
              title="Revenue, Orders & Volume"
              description={report.dateRange?.start && report.dateRange?.end ? `Period: ${report.dateRange.start.slice(0, 10)} – ${report.dateRange.end.slice(0, 10)}` : undefined}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {/* Financial (F1–F7, V4, V5): KPIs + pie charts + bar charts */}
      {financial && typeof financial === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Financial</CardTitle>
            <CardDescription>Revenue, payments, and volume metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {financial.total_revenue != null && (
                <StatCard label="Total Revenue" value={fmtCurrency(financial.total_revenue as number)} icon={<IconCurrencyDollar className="h-5 w-5" />} />
              )}
              {financial.average_order_value != null && (
                <StatCard label="Avg Order Value" value={fmtCurrency(financial.average_order_value as number)} />
              )}
              {financial.total_volume_kg != null && (
                <StatCard label="Total Volume (kg)" value={fmtNum(financial.total_volume_kg)} icon={<IconPackage className="h-5 w-5" />} />
              )}
              {financial.average_price_per_kg != null && (
                <StatCard label="Avg Price (KES/kg)" value={fmtNum(financial.average_price_per_kg)} />
              )}
            </div>
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Pie */}
              {Array.isArray(financial.payment_status_distribution) && financial.payment_status_distribution.length > 0 && (
                <PieChart
                  data={(financial.payment_status_distribution as { status: string; count: number }[]).map((p) => ({
                    name: p.status,
                    value: p.count,
                  }))}
                  title="Payment Status Distribution"
                  height={280}
                  colors={["#22C55E", "#F59E0B", "#EF4444"]}
                />
              )}
              {/* Order Status Pie */}
              {Array.isArray(financial.order_status_distribution) && financial.order_status_distribution.length > 0 && (
                <PieChart
                  data={(financial.order_status_distribution as { status: string; count: number }[]).map((o) => ({
                    name: o.status,
                    value: o.count,
                  }))}
                  title="Order Status Distribution"
                  height={280}
                />
              )}
            </div>
            {/* Revenue by Location Bar */}
            {Array.isArray(financial.revenue_by_location) && financial.revenue_by_location.length > 0 && (
              <HorizontalBarChart
                data={(financial.revenue_by_location as { location: string; revenue: number }[]).map((r) => ({
                  name: r.location,
                  value: r.revenue,
                }))}
                title="Revenue by Location (Top 10)"
                formatter={(v) => fmtCurrency(v)}
                sorted
                color="#22C55E"
                height={Math.max(200, (financial.revenue_by_location as unknown[]).length * 36)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Quality (Q2–Q5): Gauges, pie charts for grade & approval distribution, wastage bar */}
      {quality && typeof quality === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Quality & Compliance</CardTitle>
            <CardDescription>Grade distribution, approval status, wastage analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gauges and KPIs row */}
            <div className="flex flex-wrap items-start gap-8">
              {quality.quality_grade_a_pct != null && (
                <CircularProgress
                  value={Number(quality.quality_grade_a_pct)}
                  maxValue={100}
                  text={fmtPct(quality.quality_grade_a_pct)}
                  label="Grade A %"
                  size={120}
                  color="#22C55E"
                />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quality.quality_approved_count != null && (
                  <StatCard label="Approved Checks" value={fmtNum(quality.quality_approved_count)} icon={<IconShieldCheck className="h-5 w-5" />} />
                )}
                {quality.quality_rejected_count != null && (
                  <StatCard label="Rejected Checks" value={fmtNum(quality.quality_rejected_count)} icon={<IconAlertTriangle className="h-5 w-5" />} />
                )}
                {quality.wastage_quantity_kg != null && (
                  <StatCard label="Total Wastage (kg)" value={fmtNum(quality.wastage_quantity_kg)} />
                )}
              </div>
            </div>
            {/* Distribution charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution Pie */}
              {Array.isArray(quality.grade_distribution) && quality.grade_distribution.length > 0 && (
                <PieChart
                  data={(quality.grade_distribution as { grade: string; count: number }[]).map((g) => ({
                    name: `Grade ${g.grade}`,
                    value: g.count,
                  }))}
                  title="Quality Grade Distribution"
                  height={280}
                  colors={["#22C55E", "#3B82F6", "#F59E0B", "#EF4444"]}
                />
              )}
              {/* Approval Distribution Pie */}
              {Array.isArray(quality.approval_distribution) && quality.approval_distribution.length > 0 && (
                <PieChart
                  data={(quality.approval_distribution as { status: string; count: number }[]).map((a) => ({
                    name: a.status,
                    value: a.count,
                  }))}
                  title="Approval Status Distribution"
                  height={280}
                  colors={["#22C55E", "#EF4444"]}
                />
              )}
            </div>
            {/* Wastage by Category Bar */}
            {Array.isArray(quality.wastage_count_by_category) && quality.wastage_count_by_category.length > 0 && (
              <HorizontalBarChart
                data={(quality.wastage_count_by_category as { category?: string; quantity_kg?: number }[]).map((r) => ({
                  name: r.category ?? "Unknown",
                  value: Number(r.quantity_kg) || 0,
                }))}
                title="Wastage by Category (kg)"
                formatter={(v) => fmtNum(v)}
                sorted
                color="#F59E0B"
                height={Math.max(180, (quality.wastage_count_by_category as unknown[]).length * 36)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Operational (O1–O5, A1, A2): KPIs, stock flow comparison, inventory pie, activity bars */}
      {operational && typeof operational === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Operational</CardTitle>
            <CardDescription>Stock flow, inventory, centers, activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {operational.stock_in_quantity_kg != null && (
                <StatCard label="Stock In (kg)" value={fmtNum(operational.stock_in_quantity_kg)} icon={<IconTrendingUp className="h-5 w-5" />} />
              )}
              {operational.stock_out_quantity_kg != null && (
                <StatCard label="Stock Out (kg)" value={fmtNum(operational.stock_out_quantity_kg)} />
              )}
              {operational.inventory_fresh_kg != null && (
                <StatCard label="Fresh Inventory (kg)" value={fmtNum(operational.inventory_fresh_kg)} />
              )}
              {operational.centers_count != null && (
                <StatCard label="Active Centers" value={fmtNum(operational.centers_count)} icon={<IconBuildingStore className="h-5 w-5" />} />
              )}
              {operational.centers_with_activity_count != null && (
                <StatCard label="Centers with Activity" value={fmtNum(operational.centers_with_activity_count)} />
              )}
              {operational.activity_log_count != null && (
                <StatCard label="Activity Events" value={fmtNum(operational.activity_log_count)} />
              )}
            </div>
            {/* Charts row: Stock Flow + Inventory Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Flow Comparison Bar */}
              {Array.isArray(operational.stock_flow_comparison) && operational.stock_flow_comparison.length > 0 && (
                <SimpleBarChart
                  data={(operational.stock_flow_comparison as { type: string; quantity_kg: number }[]).map((s) => ({
                    name: s.type,
                    value: s.quantity_kg,
                  }))}
                  title="Stock Flow Comparison"
                  formatter={(v) => `${fmtNum(v)} kg`}
                  color="#3B82F6"
                  height={260}
                />
              )}
              {/* Inventory by Status Pie */}
              {Array.isArray(operational.inventory_by_status) && operational.inventory_by_status.length > 0 && (
                <PieChart
                  data={(operational.inventory_by_status as { status: string; quantity_kg: number }[]).map((i) => ({
                    name: i.status,
                    value: i.quantity_kg,
                  }))}
                  title="Inventory by Status"
                  height={260}
                  colors={["#22C55E", "#F59E0B", "#EF4444", "#6B7280"]}
                />
              )}
            </div>
            {/* Stock by Center Bar */}
            {Array.isArray(operational.stock_by_center) && operational.stock_by_center.length > 0 && (
              <HorizontalBarChart
                data={(operational.stock_by_center as { center: string; quantity_kg: number }[]).map((c) => ({
                  name: c.center,
                  value: c.quantity_kg,
                }))}
                title="Stock Volume by Center (Top 10)"
                formatter={(v) => `${fmtNum(v)} kg`}
                sorted
                color="#06B6D4"
                height={Math.max(200, (operational.stock_by_center as unknown[]).length * 36)}
              />
            )}
            {/* Activity by Action Bar */}
            {Array.isArray(operational.activity_by_action) && operational.activity_by_action.length > 0 && (
              <HorizontalBarChart
                data={(operational.activity_by_action as { action?: string; count?: number }[]).map((r) => ({
                  name: r.action ?? "Unknown",
                  value: Number(r.count) || 0,
                }))}
                title="Activity by Action Type"
                sorted
                color="#8B5CF6"
                height={Math.max(200, (operational.activity_by_action as unknown[]).length * 32)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Users (U1–U8): KPIs, role/status distribution pies, new users comparison */}
      {users && typeof users === "object" && Object.keys(users).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users & Engagement</CardTitle>
            <CardDescription>User counts, growth, role and status distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {users.total_users != null && <StatCard label="Total Users" value={fmtNum(users.total_users)} icon={<IconUsers className="h-5 w-5" />} />}
              {users.total_farmers != null && <StatCard label="Farmers" value={fmtNum(users.total_farmers)} />}
              {users.total_buyers != null && <StatCard label="Buyers" value={fmtNum(users.total_buyers)} />}
              {users.user_growth_rate != null && (
                <StatCard label="User Growth" value={fmtPct(users.user_growth_rate)} trend={{ value: Number(users.user_growth_rate), direction: Number(users.user_growth_rate) >= 0 ? "up" : "down" }} />
              )}
              {users.new_farmers_in_period != null && <StatCard label="New Farmers (period)" value={fmtNum(users.new_farmers_in_period)} />}
              {users.new_buyers_in_period != null && <StatCard label="New Buyers (period)" value={fmtNum(users.new_buyers_in_period)} />}
              {users.active_users_count != null && <StatCard label="Active Users" value={fmtNum(users.active_users_count)} />}
              {users.last_login_count != null && <StatCard label="Logins (period)" value={fmtNum(users.last_login_count)} />}
            </div>
            {/* Distribution charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Role Distribution Pie */}
              {Array.isArray(users.user_role_distribution) && users.user_role_distribution.length > 0 && (
                <PieChart
                  data={(users.user_role_distribution as { role: string; count: number }[]).map((r) => ({
                    name: r.role,
                    value: r.count,
                  }))}
                  title="Users by Role"
                  height={260}
                />
              )}
              {/* User Status Distribution Pie */}
              {Array.isArray(users.user_status_distribution) && users.user_status_distribution.length > 0 && (
                <PieChart
                  data={(users.user_status_distribution as { status: string; count: number }[]).map((s) => ({
                    name: s.status,
                    value: s.count,
                  }))}
                  title="Users by Status"
                  height={260}
                  colors={["#22C55E", "#F59E0B", "#EF4444", "#6B7280"]}
                />
              )}
              {/* New Users Comparison Bar */}
              {Array.isArray(users.new_users_comparison) && users.new_users_comparison.length > 0 && (
                <SimpleBarChart
                  data={(users.new_users_comparison as { type: string; count: number }[]).map((u) => ({
                    name: u.type,
                    value: u.count,
                  }))}
                  title="New Users (Period)"
                  color="#3B82F6"
                  height={260}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geographic (G1–G4): Horizontal bars by location */}
      {geographic && typeof geographic === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Farmers and centers by location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.isArray(geographic.farmers_by_subcounty) && geographic.farmers_by_subcounty.length > 0 && (
              <HorizontalBarChart
                data={(geographic.farmers_by_subcounty as { subCounty?: string; count?: number }[]).map((r) => ({ name: r.subCounty ?? "Unknown", value: Number(r.count) || 0 }))}
                title="Farmers by Sub-county"
                sorted
                color="#06B6D4"
                height={Math.max(200, (geographic.farmers_by_subcounty as unknown[]).length * 32)}
              />
            )}
            {Array.isArray(geographic.farmers_by_county) && geographic.farmers_by_county.length > 0 && (
              <HorizontalBarChart
                data={(geographic.farmers_by_county as { county?: string; count?: number }[]).map((r) => ({ name: r.county ?? "Unknown", value: Number(r.count) || 0 }))}
                title="Farmers by County"
                sorted
                color="#EC4899"
                height={Math.max(200, (geographic.farmers_by_county as unknown[]).length * 32)}
              />
            )}
            {Array.isArray(geographic.centers_by_location) && geographic.centers_by_location.length > 0 && (
              <HorizontalBarChart
                data={(geographic.centers_by_location as { county?: string; subCounty?: string; count?: number }[]).map((r) => ({
                  name: [r.county, r.subCounty].filter(Boolean).join(", ") || "Unknown",
                  value: Number(r.count) || 0,
                }))}
                title="Centers by Location"
                sorted
                color="#F59E0B"
                height={Math.max(180, (geographic.centers_by_location as unknown[]).length * 28)}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Farmer groups (FG1–FG3): KPIs */}
      {farmerGroups && typeof farmerGroups === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Farmer Groups</CardTitle>
            <CardDescription>Groups and membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {farmerGroups.farmer_groups_count != null && (
                <StatCard label="Farmer Groups" value={fmtNum(farmerGroups.farmer_groups_count)} icon={<IconBuildingStore className="h-5 w-5" />} />
              )}
              {farmerGroups.farmer_group_members_total != null && (
                <StatCard label="Total Members in Groups" value={fmtNum(farmerGroups.farmer_group_members_total)} />
              )}
              {farmerGroups.farmers_unassigned_count != null && (
                <StatCard label="Farmers Not in a Group" value={fmtNum(farmerGroups.farmers_unassigned_count)} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Evidence (E1–E3): Gauges, KPIs, distribution pie charts */}
      {transactionEvidence && typeof transactionEvidence === "object" && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Evidence</CardTitle>
            <CardDescription>Order evidence coverage, delivery rates, disputes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gauges row */}
            <div className="flex flex-wrap items-start gap-8">
              {transactionEvidence.evidence_coverage_pct != null && (
                <CircularProgress
                  value={Number(transactionEvidence.evidence_coverage_pct)}
                  maxValue={100}
                  text={fmtPct(transactionEvidence.evidence_coverage_pct)}
                  label="Evidence Coverage"
                  size={120}
                  color="#22C55E"
                />
              )}
              {transactionEvidence.delivery_rate_pct != null && (
                <CircularProgress
                  value={Number(transactionEvidence.delivery_rate_pct)}
                  maxValue={100}
                  text={fmtPct(transactionEvidence.delivery_rate_pct)}
                  label="Delivery Rate"
                  size={120}
                  color="#3B82F6"
                />
              )}
              {transactionEvidence.dispute_rate_pct != null && (
                <CircularProgress
                  value={Number(transactionEvidence.dispute_rate_pct)}
                  maxValue={100}
                  text={fmtPct(transactionEvidence.dispute_rate_pct)}
                  label="Dispute Rate"
                  size={120}
                  color={Number(transactionEvidence.dispute_rate_pct) > 5 ? "#EF4444" : "#F59E0B"}
                />
              )}
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {transactionEvidence.orders_with_payment_evidence != null && (
                <StatCard label="Orders with Evidence" value={fmtNum(transactionEvidence.orders_with_payment_evidence)} icon={<IconShieldCheck className="h-5 w-5" />} />
              )}
              {transactionEvidence.orders_without_evidence != null && (
                <StatCard label="Orders without Evidence" value={fmtNum(transactionEvidence.orders_without_evidence)} icon={<IconAlertTriangle className="h-5 w-5" />} />
              )}
              {transactionEvidence.orders_delivered_count != null && (
                <StatCard label="Delivered Orders" value={fmtNum(transactionEvidence.orders_delivered_count)} />
              )}
              {transactionEvidence.total_orders_in_period != null && (
                <StatCard label="Total Orders (period)" value={fmtNum(transactionEvidence.total_orders_in_period)} />
              )}
              {transactionEvidence.disputed_orders_count != null && (
                <StatCard label="Disputed" value={fmtNum(transactionEvidence.disputed_orders_count)} />
              )}
            </div>
            {/* Distribution pie charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evidence Distribution Pie */}
              {Array.isArray(transactionEvidence.evidence_distribution) && transactionEvidence.evidence_distribution.length > 0 && (
                <PieChart
                  data={(transactionEvidence.evidence_distribution as { status: string; count: number }[]).map((e) => ({
                    name: e.status,
                    value: e.count,
                  }))}
                  title="Evidence Coverage Distribution"
                  height={260}
                  colors={["#22C55E", "#EF4444"]}
                />
              )}
              {/* Order Outcome Distribution Pie */}
              {Array.isArray(transactionEvidence.order_outcome_distribution) && transactionEvidence.order_outcome_distribution.length > 0 && (
                <PieChart
                  data={(transactionEvidence.order_outcome_distribution as { outcome: string; count: number }[]).map((o) => ({
                    name: o.outcome,
                    value: o.count,
                  }))}
                  title="Order Outcome Distribution"
                  height={260}
                  colors={["#22C55E", "#EF4444", "#6B7280"]}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
