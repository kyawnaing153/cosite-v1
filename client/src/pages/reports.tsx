import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

export default function Reports() {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");

  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
  }) as { data: any[] };

  const { data: purchases = [] } = useQuery({
    queryKey: ["/api/purchases"],
  }) as { data: any[] };

  const { data: salaries = [] } = useQuery({
    queryKey: ["/api/salaries"],
  }) as { data: any[] };

  const { data: labour = [] } = useQuery({
    queryKey: ["/api/labour"],
  }) as { data: any[] };

  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
  }) as { data: any[] };

  // Calculate totals
  const totalPurchases =
    purchases?.reduce(
      (sum: number, purchase: any) =>
        sum + (parseFloat(purchase.totalAmount) || 0),
      0
    ) || 0;
  const totalWages =
    salaries?.reduce(
      (sum: number, salary: any) =>
        sum + (parseFloat(salary.paymentAmount) || 0),
      0
    ) || 0;
  const totalInvoices =
    invoices?.reduce(
      (sum: number, invoice: any) =>
        sum + (parseFloat(invoice.grandTotal) || 0),
      0
    ) || 0;
  const paidInvoices =
    invoices
      ?.filter((invoice: any) => invoice.paymentStatus === "paid")
      .reduce(
        (sum: number, invoice: any) =>
          sum + (parseFloat(invoice.grandTotal) || 0),
        0
      ) || 0;

  const handleExport = (type: string) => {
    // In a real app, this would generate and download the report
    alert(`Exporting ${type} report...`);
  };

  return (
    <AppLayout title="Reports">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Reports & Analytics
          </h3>
          <p className="text-sm text-gray-600">
            Generate comprehensive reports for your construction projects
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => handleExport("pdf")} className="w-full sm:w-auto">
            <i className="fas fa-file-pdf mr-2"></i>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")} className="w-full sm:w-auto">
            <i className="fas fa-file-excel mr-2"></i>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Site:</label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites?.map((site: any) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.siteName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              ${totalPurchases.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {purchases?.length || 0} transactions
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Wages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              ${totalWages.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {salaries?.length || 0} payments
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              ${totalInvoices.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {invoices?.length || 0} invoices
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Paid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${paidInvoices.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {Math.round((paidInvoices / totalInvoices) * 100) || 0}%
              collection rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Site Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Site Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sites?.map((site: any) => {
                const sitePurchases =
                  purchases?.filter((p: any) => p.siteId === site.id) || [];
                const siteWages =
                  salaries?.filter((s: any) => s.siteId === site.id) || [];
                const siteExpenses =
                  sitePurchases.reduce(
                    (sum: number, p: any) =>
                      sum + (parseFloat(p.totalAmount) || 0),
                    0
                  ) +
                  siteWages.reduce(
                    (sum: number, s: any) =>
                      sum + (parseFloat(s.paymentAmount) || 0),
                    0
                  );

                return (
                  <div
                    key={site.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {site.siteName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {site.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${siteExpenses.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Expenses
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Labour Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Labour Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Total Workers</div>
                  <div className="text-sm text-gray-600">All active labour</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {labour?.length || 0}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Office Staff</div>
                  <div className="text-sm text-gray-600">Management team</div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {labour?.filter((l: any) => l.labourType === "office_staff")
                    .length || 0}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Hire Workers</div>
                  <div className="text-sm text-gray-600">Regular workers</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {labour?.filter((l: any) => l.labourType === "hire_worker")
                    .length || 0}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    Subcontractors
                  </div>
                  <div className="text-sm text-gray-600">Contract labour</div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {labour?.filter(
                    (l: any) => l.labourType === "subcontractor_labour"
                  ).length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {purchases?.slice(0, 5).map((purchase: any) => (
              <div key={`purchase-${purchase.id}`} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">Purchase</div>
                  <div className="text-sm font-medium text-red-600">-${purchase.totalAmount}</div>
                </div>
                <div className="text-sm text-gray-600 mb-1">{purchase.itemDescription}</div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                  <span>{sites?.find((s: any) => s.id === purchase.siteId)?.siteName || "N/A"}</span>
                </div>
              </div>
            ))}
            {salaries?.slice(0, 5).map((salary: any) => (
              <div key={`salary-${salary.id}`} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">Wage Payment</div>
                  <div className="text-sm font-medium text-red-600">-${salary.paymentAmount}</div>
                </div>
                <div className="text-sm text-gray-600 mb-1">{salary.paymentType} payment</div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(salary.paymentDate).toLocaleDateString()}</span>
                  <span>{sites?.find((s: any) => s.id === salary.siteId)?.siteName || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases?.slice(0, 5).map((purchase: any) => (
                  <tr
                    key={`purchase-${purchase.id}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Purchase
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.itemDescription}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -${purchase.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sites?.find((s: any) => s.id === purchase.siteId)
                        ?.siteName || "N/A"}
                    </td>
                  </tr>
                ))}
                {salaries?.slice(0, 5).map((salary: any) => (
                  <tr key={`salary-${salary.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(salary.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Wage Payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {salary.paymentType} payment
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -${salary.paymentAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sites?.find((s: any) => s.id === salary.siteId)
                        ?.siteName || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
