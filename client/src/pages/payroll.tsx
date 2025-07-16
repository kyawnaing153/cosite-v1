import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import WageForm from "@/components/forms/wage-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Salary } from "@shared/schema";

export default function Payroll() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWage, setEditingWage] = useState<Salary | null>(null);
  const { toast } = useToast();

  const { data: salaries, isLoading } = useQuery({
    queryKey: ['/api/salaries'],
  });

  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const { data: labour } = useQuery({
    queryKey: ['/api/labour'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/salaries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      toast({
        title: "Success",
        description: "Wage record deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete wage record",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (wage: Salary) => {
    setEditingWage(wage);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this wage record?')) {
      deleteMutation.mutate(id);
    }
  };

  const getSiteName = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.siteName : `Site #${siteId}`;
  };

  const getLabourName = (labourId: number) => {
    const labourData = labour?.find((l: any) => l.id === labourId);
    return labourData ? labourData.fullName : `Labour #${labourId}`;
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'piecework':
        return 'bg-green-100 text-green-800';
      case 'advance':
        return 'bg-orange-100 text-orange-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Payroll & Wages" />
          <main className="p-6">
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
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Payroll & Wages" />
        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All Wage Records</h3>
              <p className="text-sm text-gray-600">Manage payroll and wage payments</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingWage(null);
                    setIsDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Record New Wage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingWage ? 'Edit Wage Record' : 'Record New Wage'}
                  </DialogTitle>
                </DialogHeader>
                <WageForm
                  wage={editingWage}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setEditingWage(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Labour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salaries?.map((wage: Salary) => (
                    <tr key={wage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {wage.labourId ? getLabourName(wage.labourId) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {wage.siteId ? getSiteName(wage.siteId) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getPaymentTypeColor(wage.paymentType || 'daily')}>
                          {wage.paymentType || 'Daily'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${wage.paymentAmount || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wage.paymentDate ? new Date(wage.paymentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleEdit(wage)}
                          variant="outline"
                          size="sm"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(wage.id)}
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
          </div>
        </main>
      </div>
    </div>
  );
}
