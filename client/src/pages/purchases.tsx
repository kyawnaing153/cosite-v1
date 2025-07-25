import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import PurchaseForm from "@/components/forms/purchase-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Purchase } from "@shared/schema";
import AppLayout from "@/components/layout/app-layout";

export default function Purchases() {
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const { toast } = useToast();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["/api/purchases"],
  }) as { data: any[], isLoading: boolean };

  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
  }) as { data: any[] };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/purchases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      deleteMutation.mutate(id);
    }
  };

  const getSiteName = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.siteName : `Site #${siteId}`;
  };

  if (isLoading) {
    return (
      <AppLayout title="Material Purchases">
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
    <AppLayout title="Material Purchases">
      {showForm ? (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {editingPurchase ? "Edit Purchase" : "Add New Purchase"}
              </h3>
              <p className="text-sm text-gray-600">
                {editingPurchase ? "Update purchase details" : "Create a new purchase record"}
              </p>
            </div>
            <Button
              onClick={() => {
                setShowForm(false);
                setEditingPurchase(null);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to List
            </Button>
          </div>
          <PurchaseForm
            purchase={editingPurchase}
            onSuccess={() => {
              setShowForm(false);
              setEditingPurchase(null);
            }}
          />
        </div>
      ) : (
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">All Purchases</h3>
            <p className="text-sm text-gray-600">
              Track material purchases for your sites
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPurchase(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Purchase
          </Button>
        </div>
      )}

      {!showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases?.map((purchase: Purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.itemDescription || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Purchase
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.siteId ? getSiteName(purchase.siteId) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${purchase.totalAmount || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        onClick={() => handleEdit(purchase)}
                        variant="outline"
                        size="sm"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(purchase.id)}
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
            {purchases?.map((purchase: Purchase) => (
              <div key={purchase.id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {purchase.itemDescription || "N/A"}
                    </h4>
                    <p className="text-xs text-gray-500">Purchase</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${purchase.totalAmount || "0"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Site:</span>
                    <span className="ml-1 text-gray-900">{purchase.siteId ? getSiteName(purchase.siteId) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <span className="ml-1 text-gray-900">N/A</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(purchase)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(purchase.id)}
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
