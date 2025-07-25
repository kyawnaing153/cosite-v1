import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showMenu, setShowMenu] = useState(true);

  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
  }) as { data: any[] };

  const { data: labour = [] } = useQuery({
    queryKey: ["/api/labour"],
  }) as { data: any[] };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would update the user profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would change the password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const userData = {
        username: formData.get("username") as string,
        password: formData.get("password") as string,
        email: formData.get("email") as string,
        fullname: formData.get("fullname") as string,
        role: formData.get("role") as string,
      };

      await apiRequest("POST", "/api/auth/register", userData);
      toast({
        title: "Success",
        description: "User created successfully",
      });

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Header title="Settings" />
        <main className="p-3 sm:p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                System Settings
              </h3>
              <p className="text-sm text-gray-600">
                Manage your account and application settings
              </p>
            </div>

            {/* Mobile Menu View */}
            {showMenu && (
              <div className="md:hidden">
                <div className="flex flex-col space-y-2 mb-6">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setShowMenu(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Profile</div>
                    <div className="text-sm text-gray-500">
                      Manage your profile settings
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("security");
                      setShowMenu(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Security</div>
                    <div className="text-sm text-gray-500">
                      Change password and security settings
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("users");
                      setShowMenu(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Users</div>
                    <div className="text-sm text-gray-500">
                      Manage user accounts
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("system");
                      setShowMenu(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">System</div>
                    <div className="text-sm text-gray-500">
                      System configuration and preferences
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("about");
                      setShowMenu(false);
                    }}
                    className="px-4 py-3 text-left rounded-lg border bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">About</div>
                    <div className="text-sm text-gray-500">
                      System information and support
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Tabs - Horizontal Layout */}
            <div className="hidden md:block">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              name="username"
                              defaultValue={user?.username}
                              disabled
                            />
                          </div>
                          <div>
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                              id="fullname"
                              name="fullname"
                              defaultValue={user?.fullname}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            name="role"
                            defaultValue={user?.role}
                            disabled
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleChangePassword}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="current-password">
                            Current Password
                          </Label>
                          <Input
                            id="current-password"
                            name="currentPassword"
                            type="password"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            name="newPassword"
                            type="password"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Changing..." : "Change Password"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={handleCreateUser}
                        className="space-y-4 mb-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-username">Username</Label>
                            <Input id="new-username" name="username" required />
                          </div>
                          <div>
                            <Label htmlFor="new-fullname">Full Name</Label>
                            <Input id="new-fullname" name="fullname" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new-email">Email</Label>
                            <Input
                              id="new-email"
                              name="email"
                              type="email"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new-role">Role</Label>
                            <select
                              id="new-role"
                              name="role"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="new-password">Password</Label>
                          <Input
                            id="new-password"
                            name="password"
                            type="password"
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Creating..." : "Create User"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="system">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Receive email notifications for important updates
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-gray-600">
                            Receive SMS notifications for critical alerts
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto Backup</Label>
                          <p className="text-sm text-gray-600">
                            Automatically backup data daily
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-gray-600">
                            Use dark theme interface
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="about">
                  <Card>
                    <CardHeader>
                      <CardTitle>About ConstructPro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          <i className="fas fa-hard-hat text-orange-500 text-4xl"></i>
                          <h2 className="text-3xl font-bold text-gray-800">
                            ConstructPro
                          </h2>
                        </div>
                        <p className="text-lg text-gray-600 mb-4">
                          Construction Site Management System
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">
                            Version 1.0.0 - Built with React, TypeScript, and
                            Express.js
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            System Statistics
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Sites:</span>
                              <span className="font-medium">
                                {sites?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Workers:</span>
                              <span className="font-medium">
                                {labour?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Active Sites:</span>
                              <span className="font-medium">
                                {sites?.filter(
                                  (s: any) => s.status === "on_progress"
                                ).length || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">
                            Support
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <span className="ml-2">
                                support@constructpro.com
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <span className="ml-2">+1 (555) 123-4567</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Website:</span>
                              <span className="ml-2">www.constructpro.com</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile Content */}
            <div className="md:hidden">
              {!showMenu && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowMenu(true)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Settings Menu
                  </button>
                </div>
              )}
              
              {!showMenu && activeTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            defaultValue={user?.username}
                            disabled
                          />
                        </div>
                        <div>
                          <Label htmlFor="fullname">Full Name</Label>
                          <Input
                            id="fullname"
                            name="fullname"
                            defaultValue={user?.fullname}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            name="role"
                            defaultValue={user?.role}
                            disabled
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

                             {!showMenu && activeTab === "security" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          name="currentPassword"
                          type="password"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          name="newPassword"
                          type="password"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          name="confirmPassword"
                          type="password"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

                             {!showMenu && activeTab === "users" && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="new-username">Username</Label>
                          <Input id="new-username" name="username" required />
                        </div>
                        <div>
                          <Label htmlFor="new-fullname">Full Name</Label>
                          <Input id="new-fullname" name="fullname" required />
                        </div>
                        <div>
                          <Label htmlFor="new-email">Email</Label>
                          <Input
                            id="new-email"
                            name="email"
                            type="email"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-role">Role</Label>
                          <select
                            id="new-role"
                            name="role"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="new-password">Password</Label>
                          <Input
                            id="new-password"
                            name="password"
                            type="password"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Creating..." : "Create User"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

                             {!showMenu && activeTab === "system" && (
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-gray-600">
                          Receive SMS notifications for critical alerts
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Backup</Label>
                        <p className="text-sm text-gray-600">
                          Automatically backup data daily
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-gray-600">
                          Use dark theme interface
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              )}

                             {!showMenu && activeTab === "about" && (
                <Card>
                  <CardHeader>
                    <CardTitle>About ConstructPro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <i className="fas fa-hard-hat text-orange-500 text-4xl"></i>
                        <h2 className="text-3xl font-bold text-gray-800">
                          ConstructPro
                        </h2>
                      </div>
                      <p className="text-lg text-gray-600 mb-4">
                        Construction Site Management System
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700">
                          Version 1.0.0 - Built with React, TypeScript, and
                          Express.js
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          System Statistics
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Sites:</span>
                            <span className="font-medium">
                              {sites?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Workers:</span>
                            <span className="font-medium">
                              {labour?.length || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Sites:</span>
                            <span className="font-medium">
                              {sites?.filter(
                                (s: any) => s.status === "on_progress"
                              ).length || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Support
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>
                            <span className="ml-2">
                              support@constructpro.com
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-2">+1 (555) 123-4567</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Website:</span>
                            <span className="ml-2">www.constructpro.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
