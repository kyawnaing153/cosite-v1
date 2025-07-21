import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertSiteSchema, type Site } from "@shared/schema";
import { z } from "zod";
import { CheckCircle } from "lucide-react";

// Define the User interface based on your API response for /api/staff/users
interface User {
    id: number; // Matches backend output
    fullname: string;
    joinDate?: string;
}

const siteFormSchema = insertSiteSchema.extend({
    // These are strings because HTML date/number inputs return strings
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.string().optional(),
    userId: z.string().optional(), // Select component value is a string
});

interface SiteFormProps {
    site?: Site | null;
    onSuccess: () => void;
}

export default function SiteForm({ site, onSuccess }: SiteFormProps) {
    const { toast } = useToast();

    // --- Data Fetching for Users using useQuery ---
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<User[]>({
        queryKey: ['/api/staff/users'],
        queryFn: async () => {
            const response = await apiRequest('GET', '/api/staff/users');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return Array.isArray(data) ? data : [];
        }
    });


    const form = useForm<z.infer<typeof siteFormSchema>>({
        resolver: zodResolver(siteFormSchema),
        defaultValues: {
            siteName: site?.siteName || "",
            location: site?.location || "",
            status: site?.status || "on_progress",
            startDate: site?.startDate ? new Date(site.startDate).toISOString().split("T")[0] : "",
            endDate: site?.endDate ? new Date(site.endDate).toISOString().split("T")[0] : "",
            budget: site?.budget ? site.budget.toString() : "", // as string
            userId: site?.userId ? String(site.userId) : "",     // as string (Select input expects string)
        },
    });

    // --- Data Mutation for Site (Create/Update) using useMutation ---
    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof siteFormSchema>) => {

            const submitData = {
                siteName: data.siteName || "",
                userId: data.userId ? Number(data.userId) : undefined, // 🔁 string -> number
                location: data.location || "",
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                budget: data.budget || "",
                status: data.status || "on_progress",
            };

            //console.log(new Date(data.startDate));

            if (site) {
                await apiRequest('PUT', `/api/sites/${site.id}`, submitData);
            } else {
                console.log(submitData)
                await apiRequest('POST', '/api/sites', submitData);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/sites'] });
            queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-sites'] });
            toast({
                title: "Success",
                description: site ? "Site updated successfully" : "Site created successfully",
                //icon: <CheckCircle className="h-5 w-5 text-green-700" />,
            });
            onSuccess();
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to save site",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: z.infer<typeof siteFormSchema>) => {
        mutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="siteName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Site Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter site name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* User selection field */}
                    <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign User</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    disabled={usersLoading || mutation.isPending}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={usersLoading ? "Loading users..." : "Select staff"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {usersError ? (
                                            <SelectItem value="error-loading-users" disabled>Error loading users</SelectItem>
                                        ) : users.length === 0 && !usersLoading ? (
                                            <SelectItem value="no-users-available" disabled>No users available</SelectItem>
                                        ) : (
                                            users.map(user => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.fullname}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                    <FormControl />
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter full location" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Expected End Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter budget" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="on_progress">On Progress</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button type="button" variant="outline" onClick={onSuccess} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending || usersLoading}>
                        {mutation.isPending ? 'Saving...' : site ? 'Update Site' : 'Create Site'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
