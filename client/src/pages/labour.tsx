import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import LabourForm from "@/components/forms/labour-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Labour, LabourGroup } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabourTeamForm from "@/components/forms/labour-team-form";
import AppLayout from "@/components/layout/app-layout";

export default function LabourPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState<Labour | null>(null);
  const [editingLabourGroup, setEditingLabourGroup] =
    useState<LabourGroup | null>(null);
  const [activeTab, setActiveTab] = useState("Labours");
  const { toast } = useToast();

  useEffect(() => {
    // When the tab changes, reset editing states to ensure the correct form is shown
    setEditingLabour(null);
    setEditingLabourGroup(null);
  }, [activeTab]);

  const { data: labours = [], isLoading } = useQuery<Labour[]>({
    // Renamed 'labour' to 'labours' for clarity
    queryKey: ["/api/labour"],
  }) as { data: Labour[], isLoading: boolean };

  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ["/api/sites"],
  }) as { data: any[] };

  const { data: labourGroups = [] } = useQuery<LabourGroup[]>({
    queryKey: ["/api/labour-groups"],
  }) as { data: LabourGroup[] };

  // Mutation for deleting a Labour record
  const deleteLabourMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/labour/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labour"] });
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

  // Mutation for deleting a LabourGroup record
  const deleteLabourGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/labour-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/labour-groups"] });
      toast({
        title: "Success",
        description: "Labour Team deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete labour team",
        variant: "destructive",
      });
    },
  });

  const handleLabourGroupEdit = (labourGroup: LabourGroup) => {
    setEditingLabourGroup(labourGroup);
    setIsDialogOpen(true);
  };

  const handleLabourEdit = (labourData: Labour) => {
    // Renamed for clarity
    setEditingLabour(labourData);
    setIsDialogOpen(true);
  };

  const handleDeleteLabour = (id: number) => {
    // Specific handler for Labour
    if (confirm("Are you sure you want to delete this labour record?")) {
      deleteLabourMutation.mutate(id);
    }
  };

  const handleDeleteLabourGroup = (id: number) => {
    // Specific handler for LabourGroup
    if (confirm("Are you sure you want to delete this labour team record?")) {
      deleteLabourGroupMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 hover:text-white"
      : "bg-red-100 text-red-800 hover:text-white";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "office_staff":
        return "bg-cyan-100 text-cyan-800 hover:text-white";
      case "hire_worker":
        return "bg-orange-100 text-orange-800 hover:text-white";
      case "subcontractor_labour":
        return "bg-purple-100 text-purple-800 hover:text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "office_staff":
        return "Office Staff";
      case "hire_worker":
        return "Hire Worker";
      case "subcontractor_labour":
        return "Subcontractor";
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
      <AppLayout title="Labour Management">
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
    <AppLayout title="Labour Management">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Labour Management
          </h3>{" "}
          {/* Changed title for clarity */}
          <p className="text-sm text-gray-600">
            Manage your individual labour and labour teams
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* Button to add new Labour or Labour Team based on active tab */}
            {activeTab === "Labours" ? (
              <Button
                onClick={() => {
                  setEditingLabour(null); // Ensure no labour is being edited when adding new
                  setIsDialogOpen(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <i className="fas fa-plus mr-2"></i>
                Add New Labour
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditingLabourGroup(null); // Ensure no labour group is being edited when adding new
                  setIsDialogOpen(true);
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <i className="fas fa-plus mr-2"></i>
                Add New Labour Team
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {/* Dynamic dialog title based on active tab and editing state */}
                {activeTab === "Labours"
                  ? editingLabour
                    ? "Edit Labour"
                    : "Add New Labour"
                  : editingLabourGroup // Corrected: Check editingLabourGroup for Labour Teams
                  ? "Edit Labour Team"
                  : "Add New Labour Team"}
              </DialogTitle>
            </DialogHeader>
            {/* Conditionally render LabourForm or LabourTeamForm */}
            {activeTab === "Labours" ? (
              <LabourForm
                labour={editingLabour}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingLabour(null);
                }}
              />
            ) : (
              <LabourTeamForm
                team={editingLabourGroup} // Pass editingLabourGroup prop
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingLabourGroup(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <Tabs
            defaultValue="Labours"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              {" "}
              {/* Adjusted grid-cols to 2 */}
              <TabsTrigger value="Labours">Labours</TabsTrigger>
              <TabsTrigger value="Labours Teams">Labour Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="Labours">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Labours</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
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
                        {labours?.length === 0 && (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              No labour records found.
                            </td>
                          </tr>
                        )}
                        {labours?.map((labourData: Labour, idx: number) => (
                          <tr key={labourData.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {labourData.fullName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {labourData.contactNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={getTypeColor(labourData.labourType)}
                              >
                                {getTypeText(labourData.labourType)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {labourData.siteId
                                ? getSiteName(labourData.siteId)
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {labourData.labourGroupId
                              ? getGroupName(labourData.labourGroupId)
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Ks {labourData.dailyWage || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap capitalize">
                            <Badge
                              className={getStatusColor(labourData.status)}
                            >
                              {labourData.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              onClick={() => handleLabourEdit(labourData)}
                              variant="outline"
                              size="sm"
                            >
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteLabour(labourData.id)}
                              variant="destructive"
                              size="sm"
                              disabled={deleteLabourMutation.isPending}
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
                    {labours?.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No labour records found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {labours?.map((labourData: Labour, idx: number) => (
                          <div key={labourData.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                                  <Badge className={getTypeColor(labourData.labourType)}>
                                    {getTypeText(labourData.labourType)}
                                  </Badge>
                                  <Badge className={getStatusColor(labourData.status)}>
                                    {labourData.status}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {labourData.fullName}
                                </h4>
                                <p className="text-xs text-gray-600">{labourData.contactNumber}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  Ks {labourData.dailyWage || "N/A"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div>
                                <span className="text-gray-500">Site:</span>
                                <span className="ml-1 text-gray-900">
                                  {labourData.siteId ? getSiteName(labourData.siteId) : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Group:</span>
                                <span className="ml-1 text-gray-900">
                                  {labourData.labourGroupId ? getGroupName(labourData.labourGroupId) : "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleLabourEdit(labourData)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteLabour(labourData.id)}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                disabled={deleteLabourMutation.isPending}
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="Labours Teams">
              <Card>
                <CardHeader>
                  <CardTitle>Labour Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Group Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {labourGroups?.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              No labour team records found.
                            </td>
                          </tr>
                        )}
                        {labourGroups?.map(
                          (labourGroup: LabourGroup, idx: number) => (
                            <tr key={labourGroup.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {idx + 1}
                              </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {labourGroup.groupName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {labourGroup.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button
                                onClick={() =>
                                  handleLabourGroupEdit(labourGroup)
                                }
                                variant="outline"
                                size="sm"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteLabourGroup(labourGroup.id)
                                } // Call specific delete handler
                                variant="destructive"
                                size="sm"
                                disabled={deleteLabourGroupMutation.isPending}
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </Button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    {labourGroups?.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No labour team records found.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {labourGroups?.map((labourGroup: LabourGroup, idx: number) => (
                          <div key={labourGroup.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500">#{idx + 1}</span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {labourGroup.groupName}
                                </h4>
                                <p className="text-xs text-gray-600">{labourGroup.description}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleLabourGroupEdit(labourGroup)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleDeleteLabourGroup(labourGroup.id)}
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                disabled={deleteLabourGroupMutation.isPending}
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
