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

// Define a type for the user data fetched from the API
interface User {
  id: number;
  username: string;
  fullname: string;
  role: string; // Added role based on your backend data
  // Add other user properties if needed
}

// Extend the insertSiteSchema to handle form specific types
const siteFormSchema = insertSiteSchema.extend({
  // Use z.coerce.number() to automatically convert the string value from Select to a number
  // .optional().nullable() allows the field to be absent or null
  userId: z.coerce.number().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  // Use z.coerce.number() to convert string input from budget field to a number
  budget: z.coerce.number().optional().nullable(),
});

interface SiteFormProps {
  site?: Site | null;
  onSuccess: () => void;
}

export default function SiteForm({ site, onSuccess }: SiteFormProps) {
  const { toast } = useToast();

  // Fetch users (system staff)
  const { data: users = [], isLoading: usersLoading, isError: usersError, error: usersFetchError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/staff/users');
        const fetchedUsers = res.data;
        console.log("Frontend: Fetched users from API:", fetchedUsers); // IMPORTANT: Check this log
        return fetchedUsers;
      } catch (error) {
        console.error("Frontend: Error fetching staff users:", error); // Log any fetch errors
        throw error; // Re-throw to let react-query handle onError
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to load staff users: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof siteFormSchema>>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      siteName: site?.siteName || "",
      // Ensure userId is a string for the form's default value
      userId: "6",
      location: site?.location || "",
      status: site?.status || "on_progress",
      startDate: site?.startDate ? new Date(site.startDate).toISOString().split('T')[0] : "",
      endDate: site?.endDate ? new Date(site.endDate).toISOString().split('T')[0] : "",
      // Ensure budget is a string for the form's default value
      budget: site?.budget ? site.budget.toString() : "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof siteFormSchema>) => {
      const submitData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        // budget and userId are already coerced to number by Zod,
        // but ensure they are null if they are NaN (from empty input)
        budget: (data.budget === undefined || data.budget === null || isNaN(data.budget)) ? null : data.budget,
        userId: (data.userId === undefined || data.userId === null || isNaN(data.userId)) ? null : data.userId,
      };

      if (site) {
        await apiRequest('PUT', `/api/sites/${site.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/sites', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-sites'] });
      toast({
        title: "Success",
        description: site ? "Site updated successfully" : "Site created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Site form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to save site. Please try again.",
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
            render={({ field }) => {
              console.log("Frontend: FormField userId value:", field.value); // Log the value from react-hook-form
              return (
                <FormItem>
                  <FormLabel>Assign Staff</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    // Ensure defaultValue is a string
                    defaultValue={field.value ? String(field.value) : ""}
                    // Control the component with string value
                    value={field.value ? String(field.value) : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={usersLoading ? "Loading..." : "Select staff"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersError ? (
                        <SelectItem value="error" disabled>Error loading users</SelectItem>
                      ) : usersLoading ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : users.length === 0 ? (
                        <SelectItem value="6" disabled>No staff users found</SelectItem>
                      ) : (
                        users.map((user: User) => (
                          <SelectItem key={user.id} value={String(user.id)}> {/* Convert user.id to string */}
                            {user.username} ({user.fullname})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ""} // Ensure value is a string, not null/undefined
                  />
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
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ""} // Ensure value is a string, not null/undefined
                  />
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
                  <Input
                    type="number"
                    placeholder="Enter budget"
                    {...field}
                    // For number inputs, field.value can be number or string.
                    // Ensure it's a string for the input element.
                    value={field.value === null || field.value === undefined ? "" : String(field.value)}
                    onChange={(e) => {
                      // Allow empty string for optional number fields
                      field.onChange(e.target.value === "" ? null : e.target.value);
                    }}
                  />
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
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : site ? 'Update Site' : 'Create Site'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
