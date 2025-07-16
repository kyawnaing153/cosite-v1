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
import { insertLabourSchema, type Labour } from "@shared/schema";
import { z } from "zod";

const labourFormSchema = insertLabourSchema.extend({
  dailyWage: z.string().optional(),
  monthlySalary: z.string().optional(),
});

interface LabourFormProps {
  labour?: Labour | null;
  onSuccess: () => void;
}

export default function LabourForm({ labour, onSuccess }: LabourFormProps) {
  const { toast } = useToast();
  
  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const { data: labourGroups } = useQuery({
    queryKey: ['/api/labour-groups'],
  });

  const form = useForm<z.infer<typeof labourFormSchema>>({
    resolver: zodResolver(labourFormSchema),
    defaultValues: {
      fullName: labour?.fullName || "",
      siteId: labour?.siteId || undefined,
      labourGroupId: labour?.labourGroupId || undefined,
      labourType: labour?.labourType || "hire_worker",
      contactNumber: labour?.contactNumber || "",
      address: labour?.address || "",
      dailyWage: labour?.dailyWage ? labour.dailyWage.toString() : "",
      monthlySalary: labour?.monthlySalary ? labour.monthlySalary.toString() : "",
      status: labour?.status || "active",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof labourFormSchema>) => {
      const submitData = {
        ...data,
        dailyWage: data.dailyWage ? parseFloat(data.dailyWage) : null,
        monthlySalary: data.monthlySalary ? parseFloat(data.monthlySalary) : null,
      };
      
      if (labour) {
        await apiRequest('PUT', `/api/labour/${labour.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/labour', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/labour'] });
      toast({
        title: "Success",
        description: labour ? "Labour updated successfully" : "Labour created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save labour",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof labourFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contact number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="siteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sites?.map((site: any) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labourGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour Group</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select labour group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {labourGroups?.map((group: any) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.groupName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="labourType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select labour type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="office_staff">Office Staff</SelectItem>
                    <SelectItem value="hire_worker">Hire Worker</SelectItem>
                    <SelectItem value="subcontractor_labour">Subcontractor Labour</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dailyWage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Wage</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter daily wage" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="monthlySalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Salary</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter monthly salary" {...field} />
                </FormControl>
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
            {mutation.isPending ? 'Saving...' : labour ? 'Update Labour' : 'Create Labour'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
