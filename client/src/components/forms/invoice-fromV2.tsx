import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertInvoiceSchema, type Invoice } from "@shared/schema";
import { z } from "zod";
import { type FullInvoice } from "@shared/schema" // Assuming FullInvoice type is defined here

// Define the schema for an individual labour detail entry, using z.coerce.number()
const labourDetailSchema = z.object({
  id: z.number().optional(), // Optional for existing records
  labourId: z.string().min(1, "Labour is required."),
  labourGroupId: z.string().min(1, "Labour Group is required."),
  pieceworkPayment: z.coerce.number().optional().default(0),
  dailyWage: z.coerce.number().optional().default(0),
  advancePayment: z.coerce.number().optional().default(0),
  refund: z.coerce.number().optional().default(0),
  sign: z.string().optional(),
});

// Extend the main invoice schema to include the array of labour details
const invoiceFormSchema = z.object({
  siteId: z.string().min(1, "Site is required."),
  invoiceNumber: z.string().min(1, "Invoice number is required."),
  invoiceDate: z.string().min(1, "Invoice date is required."),
  grandTotal: z.number().optional().default(0),
  totalPiecework: z.number().optional().default(0),
  totalDailyWage: z.number().optional().default(0),
  totalAdvancePayment: z.coerce.number().optional().default(0),
  totalRefund: z.number().optional().default(0),
  paymentStatus: z.enum(["paid", "credit"], { required_error: "Payment status is required." }),
  labourDetails: z.array(labourDetailSchema).min(1, "At least one labour detail is required."),
});

interface InvoiceFormProps {
  invoice?: FullInvoice | null;
  onSuccess: () => void;
}

export default function InvoiceForm({ invoice, onSuccess }: InvoiceFormProps) {
  const { toast } = useToast();

  // Fetch sites data
  const { data: sites = [] } = useQuery({
    queryKey: ['/api/sites'],
  }) as { data: any[] };

  // Fetch labour data
  const { data: labours = [] } = useQuery({
    queryKey: ['/api/labour'],
  }) as { data: any[] };

  // Fetch labour groups data
  const { data: labourGroups = [] } = useQuery({
    queryKey: ['/api/labour-groups'],
  }) as { data: any[] };

  const defaultFormValues = React.useMemo(() => {
    if (invoice) {
      return {
        siteId: invoice.siteId?.toString() || "",
        invoiceNumber: invoice.invoiceNumber || "",
        invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : "",
        grandTotal: invoice.grandTotal ?? 0,
        totalPiecework: invoice.totalPiecework ?? 0,
        totalDailyWage: invoice.totalDailyWage ?? 0,
        totalAdvancePayment: invoice.totalAdvancePayment ?? 0,
        totalRefund: invoice.totalRefund ?? 0,
        paymentStatus: invoice.paymentStatus || "credit",
        labourDetails: invoice.invoiceLabourDetails.map(ld => ({
          id: ld.id,
          labourId: ld.labourId.toString(),
          labourGroupId: ld.labourGroupId.toString(),
          pieceworkPayment: ld.pieceworkPayment ?? 0,
          dailyWage: ld.dailyWage ?? 0,
          advancePayment: ld.advancePayment ?? 0,
          refund: ld.refund ?? 0,
          sign: ld.sign || "",
        })),
      };
    }
    // Default values for a new invoice
    return {
      siteId: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      grandTotal: 0,
      totalPiecework: 0,
      totalDailyWage: 0,
      totalAdvancePayment: 0,
      totalRefund: 0,
      paymentStatus: "credit",
      labourDetails: [{
        labourId: "",
        labourGroupId: "",
        pieceworkPayment: 0,
        dailyWage: 0,
        advancePayment: 0,
        refund: 0,
        sign: "",
      }],
    };
  }, [invoice]);

  const form = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultFormValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "labourDetails",
  });

  // Watch all labour details for calculations
  const watchedLabourDetails = form.watch("labourDetails");

  React.useEffect(() => {
    let pieceworkTotal = 0;
    let dailyWageTotal = 0;
    let advancePaymentTotal = 0;
    let refundTotal = 0;

    watchedLabourDetails.forEach(detail => {
      // Zod's coerce handles the string-to-number conversion, so we can use the value directly
      pieceworkTotal += parseFloat(detail.pieceworkPayment.toFixed(1)) ?? 0;
      dailyWageTotal += detail.dailyWage ?? 0;
      advancePaymentTotal += detail.advancePayment ?? 0;
      refundTotal += detail.refund ?? 0;
    });

    const grandTotal = pieceworkTotal + dailyWageTotal - advancePaymentTotal + refundTotal;

    // We now set the numbers directly to the form state
    form.setValue("totalPiecework", pieceworkTotal, { shouldValidate: true });
    form.setValue("totalDailyWage", dailyWageTotal, { shouldValidate: true });
    form.setValue("totalAdvancePayment", advancePaymentTotal, { shouldValidate: true });
    form.setValue("totalRefund", refundTotal, { shouldValidate: true });
    form.setValue("grandTotal", grandTotal, { shouldValidate: true });

  }, [watchedLabourDetails, form.setValue]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof invoiceFormSchema>) => {
      // Transform data for API submission
      const submitData = {
        siteId: parseInt(data.siteId),
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        // No need for parseFloat() here, Zod has already handled the coercion
        totalPiecework: data.totalPiecework,
        totalDailyWage: data.totalDailyWage,
        totalAdvancePayment: data.totalAdvancePayment,
        totalRefund: data.totalRefund,
        grandTotal: data.grandTotal,
        paymentStatus: data.paymentStatus,
        invoiceLabourDetails: data.labourDetails.map(ld => ({
          id: ld.id,
          labourId: parseInt(ld.labourId),
          labourGroupId: parseInt(ld.labourGroupId),
          // No need for parseFloat() here either
          pieceworkPayment: ld.pieceworkPayment,
          dailyWage: ld.dailyWage,
          advancePayment: ld.advancePayment,
          refund: ld.refund,
          sign: ld.sign,
        })),
      };

      if (invoice) {
        await apiRequest('PUT', `/api/invoices/${invoice.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/invoices', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Success",
        description: invoice ? "Invoice updated successfully" : "Invoice created successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Invoice save error:", error);
      toast({
        title: "Error",
        description: `Failed to save invoice: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    mutation.mutate(data);
  };

  const addLabourDetailRow = () => {
    append({
      labourId: "",
      labourGroupId: "",
      pieceworkPayment: 0,
      dailyWage: 0,
      advancePayment: 0,
      refund: 0,
      sign: "",
    });
  };

  const removeLabourDetailRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice</h2>
        <p className="text-gray-600">Create and manage invoices for labour and services.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Invoice Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Site<span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a site" />
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
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Invoice Date<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        className="pr-10"
                        {...field}
                      />
                      <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Invoice Number<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Generated Invoice Number"
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Payment Status<span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Labour Details Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Labour Details</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Labour<span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Labour Group<span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Piecework Payment
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Daily Wage
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Advance Payment
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Refund
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Sign
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, index) => (
                    <tr key={field.id}>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.labourId`}
                          render={({ field: labourField }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select onValueChange={labourField.onChange} value={labourField.value}>
                                  <SelectTrigger className="border h-auto">
                                    <SelectValue placeholder="Select Labour" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {labours?.map((labour: any) => (
                                      <SelectItem key={labour.id} value={labour.id.toString()}>
                                        {labour.fullName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.labourGroupId`}
                          render={({ field: groupField }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select onValueChange={groupField.onChange} value={groupField.value}>
                                  <SelectTrigger className="border h-auto">
                                    <SelectValue placeholder="Select Group" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {labourGroups?.map((group: any) => (
                                      <SelectItem key={group.id} value={group.id.toString()}>
                                        {group.groupName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.pieceworkPayment`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  className="border h-auto"
                                  placeholder="Payment"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.dailyWage`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  className="border h-auto"
                                  placeholder="Daily Wage"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.advancePayment`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  className="border h-auto"
                                  placeholder="Advance"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.refund`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  className="border h-auto"
                                  placeholder="Refund"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 border-r border-gray-200">
                        <FormField
                          control={form.control}
                          name={`labourDetails.${index}.sign`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  className="border h-auto"
                                  placeholder="Signature Ref"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        {index === 0 ? (
                          <Button
                            type="button"
                            onClick={addLabourDetailRow}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 sm:py-2 sm:px-4 rounded-lg"
                          >
                            <i className="fas fa-plus"></i>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => removeLabourDetailRow(index)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 sm:py-2 sm:px-4 rounded-lg"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="totalPiecework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Total Piecework
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="bg-gray-50 font-semibold"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalDailyWage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Total Daily Wage
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="bg-gray-50 font-semibold"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalAdvancePayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Total Advance Payment
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="bg-gray-50 font-semibold"
                      readOnly
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
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Total Refund
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      className="bg-gray-50 font-semibold"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Grand Total */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64">
              <FormField
                control={form.control}
                name="grandTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Grand Total
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        className="bg-gray-50 font-semibold text-right"
                        readOnly
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {mutation.isPending ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
