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
import { z } from "zod";

const attendanceFormSchema = z.object({
  siteId: z.number().optional(),
  labourId: z.number().optional(),
  date: z.string().optional(),
  status: z.enum(['present', 'absent', 'half_day']).default('present'),
  hoursWorked: z.string().optional(),
  remarks: z.string().optional(),
});

interface AttendanceFormProps {
  attendance?: any;
  onSuccess: () => void;
}

export default function AttendanceForm({ attendance, onSuccess }: AttendanceFormProps) {
  const { toast } = useToast();
  
  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const { data: labour } = useQuery({
    queryKey: ['/api/labour'],
  });

  const form = useForm<z.infer<typeof attendanceFormSchema>>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      siteId: attendance?.siteId || undefined,
      labourId: attendance?.labourId || undefined,
      date: attendance?.date ? new Date(attendance.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: attendance?.status || 'present',
      hoursWorked: attendance?.hoursWorked ? attendance.hoursWorked.toString() : "",
      remarks: attendance?.remarks || "",
    },
  });

  const watchSiteId = form.watch("siteId");
  const filteredLabour = labour?.filter((l: any) => !watchSiteId || l.siteId === watchSiteId);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof attendanceFormSchema>) => {
      const submitData = {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
        hoursWorked: data.hoursWorked ? parseFloat(data.hoursWorked) : null,
      };
      
      // For demo purposes, we'll store attendance data in a separate endpoint
      // In a real app, you'd have a proper attendance table
      if (attendance) {
        await apiRequest('PUT', `/api/attendance/${attendance.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/attendance', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({
        title: "Success",
        description: attendance ? "Attendance updated successfully" : "Attendance recorded successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof attendanceFormSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="labourId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labour</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select labour" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredLabour?.map((labourData: any) => (
                      <SelectItem key={labourData.id} value={labourData.id.toString()}>
                        {labourData.fullName}
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
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
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half_day">Half Day</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hoursWorked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours Worked</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="Enter hours worked"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any remarks or notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : attendance ? 'Update Attendance' : 'Record Attendance'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
