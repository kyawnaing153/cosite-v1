import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import InvoiceForm from "@/components/forms/invoice-form"; // Dialog and related imports removed
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { InvoiceTemplate } from "@/components/ui/invoice-ui/invoice-template";

type FullInvoice = Invoice & {
  invoiceLabourDetails: {
    id?: number; // optional if creating new
    invoiceId: number;
    labourId: number;
    pieceworkPayment: number;
    dailyWage: number;
    advancePayment: number;
    refund: number,
    sign: string,
  }[];
};

export default function Invoices() {
  const [showForm, setShowForm] = useState(false); // Changed from isDialogOpen
  const [editingInvoice, setEditingInvoice] = useState<FullInvoice | null>(null);
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoices'],
  }) as { data: any[], isLoading: boolean };

  const { data: sites = [] } = useQuery({
    queryKey: ['/api/sites'],
  }) as { data: any[] };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (invoice: FullInvoice) => {
    // Ensure invoiceLabourDetails is defined and is an array
    const labourDetails = Array.isArray(invoice.invoiceLabourDetails)
      ? invoice.invoiceLabourDetails
      : [];

    const totalPiecework = labourDetails.reduce(
      (sum, detail) => sum + (detail.pieceworkPayment || 0),
      0
    );
    const totalDailyWage = labourDetails.reduce(
      (sum, detail) => sum + (detail.dailyWage || 0),
      0
    );
    const totalAdvancePayment = labourDetails.reduce(
      (sum, detail) => sum + (detail.advancePayment || 0),
      0
    );
    const totalRefund = labourDetails.reduce(
      (sum, detail) => sum + (detail.refund || 0),
      0
    );
    const grandTotal =
      totalPiecework + totalDailyWage - totalAdvancePayment + totalRefund;

    setEditingInvoice({
      ...invoice,
      invoiceLabourDetail: labourDetails, // Use invoiceLabourDetails for labourDetails
      totalPiecework,
      totalDailyWage,
      totalAdvancePayment,
      totalRefund,
      grandTotal,
    });
    setShowForm(true); // Changed from setIsDialogOpen(true)
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteMutation.mutate(id);
    }
  };

  const getSiteName = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.siteName : `Site #${siteId}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <AppLayout title="Invoices">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Invoices">
      {showForm ? ( // Conditional rendering based on showForm
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
              </h3>
              <p className="text-sm text-gray-600">
                {editingInvoice ? "Update invoice details" : "Create a new invoice record"}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowForm(false); // Changed from setIsDialogOpen(false)
                setEditingInvoice(null);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to List
            </Button>
          </div>
          <InvoiceForm
            invoice={editingInvoice}
            onSuccess={() => {
              setShowForm(false); // Changed from setIsDialogOpen(false)
              setEditingInvoice(null);
            }}
          />
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">All Invoices</h3>
            <p className="text-sm text-gray-600">Manage invoices and payment tracking</p>
          </div>
          <Button
            onClick={() => {
              setEditingInvoice(null);
              setShowForm(true); // Changed from setIsDialogOpen(true)
            }}
            className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto"
          >
            <i className="fas fa-plus mr-2"></i>
            Create New Invoice
          </Button>
        </div>
      )}

      {!showForm && ( // Conditional rendering for the table/card view
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grand Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices?.map((invoice: FullInvoice, idx: number) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber || `INV-${invoice.id}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.siteId ? getSiteName(invoice.siteId) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ks {invoice.grandTotal || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                      <Badge className={getStatusColor(invoice.paymentStatus)}>
                        {invoice.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.createdAt ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleEdit(invoice)}
                        variant="outline"
                        size="sm"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(invoice.id)}
                        variant="destructive"
                        size="sm"
                        disabled={deleteMutation.isPending}
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Delete
                      </Button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            {invoices?.map((invoice: FullInvoice) => (
              <div key={invoice.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {invoice.invoiceNumber || `INV-${invoice.id}`}
                    </h4>
                    <p className="text-xs text-gray-600">{invoice.siteId ? getSiteName(invoice.siteId) : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(invoice.paymentStatus)}>
                      {invoice.paymentStatus}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-1 text-gray-900">${invoice.grandTotal || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-1 text-gray-900">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(invoice)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(invoice.id)}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}