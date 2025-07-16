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
import { insertPurchaseSchema, type Purchase } from "@shared/schema";
import { z } from "zod";

const purchaseFormSchema = insertPurchaseSchema.extend({
  quantity: z.string().optional(),
  unitPrice: z.string().optional(),
  totalAmount: z.string().optional(),
});

interface PurchaseFormProps {
  purchase?: Purchase | null;
  onSuccess: () => void;
}

export default function PurchaseForm({ purchase, onSuccess }: PurchaseFormProps) {
  const { toast } = useToast();
  
  const { data: sites } = useQuery({
    queryKey: ['/api/sites'],
  });

  const form = useForm<z.infer<typeof purchaseFormSchema>>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      siteId: purchase?.siteId || undefined,
      itemDescription: purchase?.itemDescription || "",
      purchaseType: purchase?.purchaseType || "",
      quantity: purchase?.quantity ? purchase.quantity.toString() : "",
      units: purchase?.units || "",
      unitPrice: purchase?.unitPrice ? purchase.unitPrice.toString() : "",
      totalAmount: purchase?.totalAmount ? purchase.totalAmount.toString() : "",
    },
  });

  const watchQuantity = form.watch("quantity");
  const watchUnitPrice = form.watch("unitPrice");

  // Auto-calculate total amount
  const calculateTotal = () => {
    const quantity = parseFloat(watchQuantity || "0");
    const unitPrice = parseFloat(watchUnitPrice || "0");
    const total = quantity * unitPrice;
    if (!isNaN(total) && total > 0) {
      form.setValue("totalAmount", total.toString());
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof purchaseFormSchema>) => {
      const submitData = {
        ...data,
        quantity: data.quantity ? parseFloat(data.quantity) : null,
        unitPrice: data.unitPrice ? parseFloat(data.unitPrice) : null,
        totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : null,
      };
      
      if (purchase) {
        await apiRequest('PUT', `/api/purchases/${purchase.id}`, submitData);
      } else {
        await apiRequest('POST', '/api/purchases', submitData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-purchases'] });
      toast({
        title: "Success",
        description: purchase ? "Purchase updated successfully" : "Purchase created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save purchase",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof purchaseFormSchema>) => {
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
            name="purchaseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Materials, Tools, Equipment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="itemDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter detailed description of the item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter quantity"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setTimeout(calculateTotal, 100);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., bags, pieces, tons" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter unit price"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setTimeout(calculateTotal, 100);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Total amount (auto-calculated)"
                  {...field}
                />
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
            {mutation.isPending ? 'Saving...' : purchase ? 'Update Purchase' : 'Create Purchase'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
