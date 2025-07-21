import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCard from "@/components/dashboard/metrics-card";
import RecentSites from "@/components/dashboard/recent-sites";
import RecentActivity from "@/components/dashboard/recent-activity";
import RecentPurchases from "@/components/dashboard/recent-purchases";
import PendingWages from "@/components/dashboard/pending-wages";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Dashboard" />
        <main className="p-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricsCard
              title="Active Sites"
              value={metrics?.activeSites || 0}
              icon="fas fa-building text-cyan-600"
              iconColor="bg-cyan-100"
              change={{ value: "+2.5%", type: "increase" }}
            />
            <MetricsCard
              title="Total Labour"
              value={metrics?.totalLabour || 0}
              icon="fas fa-users text-orange-500"
              iconColor="bg-orange-100"
              change={{ value: "+8.2%", type: "increase" }}
            />
            <MetricsCard
              title="Monthly Expenses"
              value={`$${metrics?.monthlyExpenses?.toLocaleString() || 0}`}
              icon="fas fa-dollar-sign text-yellow-500"
              iconColor="bg-yellow-100"
              change={{ value: "-3.1%", type: "decrease" }}
            />
            <MetricsCard
              title="Pending Invoices"
              value={metrics?.pendingInvoices || 0}
              icon="fas fa-file-invoice text-red-500"
              iconColor="bg-red-100"
              change={{ value: "+1.2%", type: "increase" }}
            />
          </div>

          {/* Recent Activity and Sites Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentSites />
            <RecentActivity />
          </div>

          {/* Data Tables Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RecentPurchases />
            <PendingWages />
          </div>
        </main>
      </div>
    </div>
  );
}
