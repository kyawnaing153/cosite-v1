// labour-team-form.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query"; // Import useMutation
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Import Shadcn Form components
import { apiRequest, queryClient } from "@/lib/queryClient"; // Assuming you have queryClient and apiRequest
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { z } from "zod"; // Import zod
import { insertLabourGroupSchema, type LabourGroup } from "@shared/schema";

// Define the Zod schema for the Labour Team form
const labourTeamFormSchema = z.object({
    groupName: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
});

// Infer the type from the schema
type LabourTeamFormValues = z.infer<typeof labourTeamFormSchema>;

interface LabourTeamFormProps {
    team?: LabourGroup | null; // Added id for update scenario
    onSuccess: () => void;
}

export default function LabourTeamForm({ team, onSuccess }: LabourTeamFormProps) {
    const { toast } = useToast();

    const form = useForm<LabourTeamFormValues>({
        resolver: zodResolver(labourTeamFormSchema),
        defaultValues: {
            groupName: team?.groupName || "",
            description: team?.description || "",
        },
    });

    // --- Data Mutation for Labour Team (Create/Update) using useMutation ---
    const mutation = useMutation({
        mutationFn: async (data: LabourTeamFormValues) => {
            const submitData = {
                groupName: data.groupName,
                description: data.description || null, // Ensure description is null if empty string for API
            };

            if (team?.id) {
                // If 'team' object has an 'id', it's an update
                // TODO: Replace with actual PUT API call
                await apiRequest('PUT', `/api/labour-groups/${team.id}`, submitData);
                console.log("Simulating PUT request for Labour Team:", team.id, submitData);
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            } else {
                // Otherwise, it's a create operation
                // TODO: Replace with actual POST API call
                await apiRequest('POST', '/api/labour-groups', submitData);
                console.log("Simulating POST request for Labour Team:", submitData);
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            }
        },
        onSuccess: () => {
            // Invalidate relevant queries to refetch data after successful mutation
            queryClient.invalidateQueries({ queryKey: ['/api/labour-groups'] });
            // You might have other queries related to labour teams, e.g., dashboard stats
            // queryClient.invalidateQueries({ queryKey: ['/api/dashboard/labour-team-summary'] });

            toast({
                title: "Success",
                description: team ? "Labour team updated successfully" : "Labour team created successfully",
            });
            onSuccess(); // Close modal or navigate away
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Failed to save labour team: ${error.message || "Unknown error"}`,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: LabourTeamFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Team Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter team name" {...field} />
                            </FormControl>
                            <FormMessage /> {/* Displays validation errors */}
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSuccess}
                        disabled={mutation.isPending} // Disable if mutation is in progress
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}