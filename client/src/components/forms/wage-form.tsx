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
import { insertSalarySchema, type Salary } from "@shared/schema";
import { z } from "zod";

const wageFormSchema = insertSalarySchema.extend({
  paymentAmount: z.string().optional(),
  dailyWage: z.string().optional(),
  pieceworkPayment: z.string().optional(),
  advancePayment: z.string().optional(),
  totalDailywage: z.string().optional(),
  totalPiecework: z.string().optional(),
  totalAdvancePayment: z.string().optional(),
  totalRefund: z.string().optional(),
  refund: z.string().optional(),
});

interface WageFormProps {
  wage?: Salary | null;
  onSuccess: () => void;
}

export default function WageForm({ wage, onSuccess }: WageFormProps) {
  const { toast } = useToast();
  
  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const { data: labour } = useQuery({
    queryKey: ['/api/labour'],
  });

  const form = useForm<z.infer<typeof wageFormSchema>>({
    resolver: zodResolver(wageFormSchema),
    defaultValues: {
      siteId: wage?.siteId || undefined,
      labourId: wage?.labourId || undefined,
      paymentAmount: wage?.paymentAmount ? wage.paymentAmount.toString() : "",
      paymentType: wage?.paymentType || "daily",
      dailyWage: wage?.dailyWage ? wage.dailyWage.toString() : "",
      pieceworkPayment: wage?.pieceworkPayment ? wage.pieceworkPayment.toString() : "",
      advancePayment: wage?.advancePayment ? wage.advancePayment.toString() : "",
      totalDailywage: wage?.totalDailywage ? wage.totalDailywage.toString() : "",
      totalPiecework: wage?.totalPiecework ? wage.totalPiecework.toString() : "",
      totalAdvancePayment: wage?.totalAdvancePayment ? wage.totalAdvancePayment.toString() : "",
      totalRefund: wage?.totalRefund ? wage.totalRefund.toString() : "",
      refund: wage?.refund ? wage.refund.toString() : "",
      remarks: wage?.remarks || "",
    },
  });

  const watchSiteId = form.watch("siteId");
  const filteredLabour = labour?.filter((l: any) => !watchSiteId || l.siteId === watchSiteId);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof wageFormSchema>) => {
      const submitData = {
        ...data,
        paymentAmount: data.paymentAmount ? parseFloat(data.paymentAmount) : null,
        dailyWage: data.dailyWage ? parseFloat(data.dailyWage) : null,
        pieceworkPayment: data.pieceworkPayment ? parseFloat(data.pieceworkPayment) : null,
        advancePayment: data.advancePayment ? parseFloat(data.advancePayment) : null,
        totalDailywage: data.totalDailywage ? parseFloat(data.totalDailywage) : null,
        totalPiecework: data.totalPiecework ? parseFloat(data.totalPiecework) : null,
        totalAdvancePayment: data.totalAdvancePayment ? parseFloat(data.totalAdvancePayment) : null,
        totalRefund: data.totalRefund ? parseFloat(data.totalRefund) : null,
        refund: data.refund ? parseFloat(data.refund) : null,
      };
      
      if (wage) {
        await apiRequest('PUT', `/api/salaries/${wage.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/salaries', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/pending-wages'] });
      toast({
        title: "Success",
        description: wage ? "Wage updated successfully" : "Wage recorded successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save wage",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof wageFormSchema>) => {
    mutation.mutate(data);
  };

  const getSiteName = (siteId: number) => {
    const site = sites?.find((s: any) => s.id === siteId);
    return site ? site.siteName : `Site #${siteId}`;
  };

  const getLabourName = (labourId: number) => {
    const labourData = labour?.find((l: any) => l.id === labourId);
    return labourData ? labourData.fullName : `Labour #${labourId}`;
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
            name="paymentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily Wage</SelectItem>
                    <SelectItem value="piecework">Piecework</SelectItem>
                    <SelectItem value="advance">Advance Payment</SelectItem>
                    <SelectItem value="monthly">Monthly Salary</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter payment amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="dailyWage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Wage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter daily wage"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pieceworkPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piecework Payment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter piecework payment"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="advancePayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Payment</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter advance payment"
                    {...field}
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
            name="totalDailywage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Daily Wage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Total daily wage"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalPiecework"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Piecework</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Total piecework"
                    {...field}
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
            name="refund"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Refund</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter refund amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalRefund"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Refund</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Total refund amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {mutation.isPending ? 'Saving...' : wage ? 'Update Wage' : 'Record Wage'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
