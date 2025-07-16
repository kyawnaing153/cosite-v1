import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import LabourForm from "@/components/forms/labour-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Labour } from "@shared/schema";

export default function LabourPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const { toast } = useToast();

  const { data: labour, isLoading } = useQuery({
    queryKey: ['/api/labour'],
  });

  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const { data: labourGroups } = useQuery({
    queryKey: ['/api/labour-groups'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/labour/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/labour'] });
      toast({
        title: "Success",
        description: "Labour deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete labour",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (labourData: Labour) => {
    setEditingLabour(labourData);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this labour record?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'office_staff':
        return 'bg-blue-100 text-blue-800';
      case 'hire_worker':
        return 'bg-orange-100 text-orange-800';
      case 'subcontractor_labour':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'office_staff':
        return 'Office Staff';
      case 'hire_worker':
        return 'Hire Worker';
      case 'subcontractor_labour':
        return 'Subcontractor';
      default:
        return type;
    }
  };

  const getSiteName = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.siteName : `Site #${siteId}`;
  };

  const getGroupName = (groupId: number) => {
    const group = labourGroups?.find((g: any) => g.id === groupId);
    return group ? group.groupName : `Group #${groupId}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Labour Management" />
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
        <Header title="Labour Management" />
        <main className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All Labour</h3>
              <p className="text-sm text-gray-600">Manage your labour workforce</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingLabour(null);
                    setIsDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add New Labour
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingLabour ? 'Edit Labour' : 'Add New Labour'}
                  </DialogTitle>
                </DialogHeader>
                <LabourForm
                  labour={editingLabour}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setEditingLabour(null);
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
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Daily Wage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {labour?.map((labourData: Labour) => (
                    <tr key={labourData.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{labourData.fullName}</div>
                        <div className="text-sm text-gray-500">{labourData.contactNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(labourData.labourType)}>
                          {getTypeText(labourData.labourType)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {labourData.siteId ? getSiteName(labourData.siteId) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {labourData.labourGroupId ? getGroupName(labourData.labourGroupId) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${labourData.dailyWage || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(labourData.status)}>
                          {labourData.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleEdit(labourData)}
                          variant="outline"
                          size="sm"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(labourData.id)}
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
