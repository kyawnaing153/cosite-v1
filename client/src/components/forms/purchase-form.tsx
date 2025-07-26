import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

// Schema for individual product row
const productRowSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  units: z.string().min(1, "Unit is required"),
  unitPrice: z.string().min(1, "Unit price is required"),
  discount: z.string().optional(),
  singleTotal: z.string().optional(),
});

// Main form schema
const purchaseFormSchema = z.object({
  siteId: z.string().min(1, "Site is required"),
  purchaseDate: z.string().optional(),
  itemDescription: z.string().optional(),
  invoiceNumberORImg: z.string().optional(),
  products: z.array(productRowSchema).min(1, "At least one product is required"),
  totalAmount: z.string().optional(),
});

interface PurchaseFormProps {
  purchase?: FullPurchase | null;
  onSuccess: () => void;
}

export default function PurchaseForm({ purchase, onSuccess }: PurchaseFormProps) {
  const { toast } = useToast();
  
  const { data: sites = [] } = useQuery({
    queryKey: ['/api/sites'],
  }) as { data: any[] };

  // Updated defaultValues to handle nested products
  const defaultFormValues = React.useMemo(() => {
    if (purchase) {
      return {
        siteId: purchase.siteId?.toString() || "",
        purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        itemDescription: purchase.itemDescription || "",
        invoiceNumberORImg: purchase.invoiceNumberORImg || "",
        products: purchase.purchaseProducts.map(p => ({
          name: p.name,
          quantity: p.quantity.toString(),
          units: p.units,
          unitPrice: p.unitPrice.toString(),
          discount: p.discount?.toString() || "",
          singleTotal: p.singleTotal?.toString() || "",
        })),
        totalAmount: purchase.totalAmount?.toString() || "0",
      };
    }

    // Default values for a new purchase
    return {
      siteId: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      itemDescription: "",
      invoiceNumberORImg: "",
      products: [{
        name: "",
        quantity: "",
        units: "pcs",
        unitPrice: "",
        discount: "",
        singleTotal: "",
      }],
      totalAmount: "0",
    };
  }, [purchase]);

  const form = useForm<z.infer<typeof purchaseFormSchema>>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: defaultFormValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  // Watch form values for calculations
  const watchedProducts = form.watch("products");

  // Calculate totals
  const calculateProductTotal = (index: number) => {
    const product = watchedProducts[index];
    if (product?.quantity && product?.unitPrice) {
      const quantity = parseFloat(product.quantity);
      const unitPrice = parseFloat(product.unitPrice);
      const discount = parseFloat(product.discount || "0");
      const total = (quantity * unitPrice) - (quantity * unitPrice * discount / 100);
      form.setValue(`products.${index}.singleTotal`, total.toFixed(1));
      return total;
    }
    return 0;
  };

  const calculateTotalAmount = () => {
    const totalAmount = watchedProducts.reduce((sum, product, index) => {
      return sum + calculateProductTotal(index);
    }, 0);
    form.setValue("totalAmount", totalAmount.toFixed(1));
    return totalAmount;
  };

  // Recalculate when products change
  React.useEffect(() => {
    calculateTotalAmount();
  }, [watchedProducts]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof purchaseFormSchema>) => {
      // Transform data for API
      const submitData = {
        siteId: parseInt(data.siteId),
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        itemDescription: data.itemDescription,
        invoiceNumberORImg: data.invoiceNumberORImg,
        totalAmount: data.totalAmount || "0",
        products: data.products.map(product => ({
          name: product.name,
          quantity: parseFloat(product.quantity),
          units: product.units,
          unitPrice: parseFloat(product.unitPrice),
          singleTotal: parseFloat(product.singleTotal || "0"),
        })),
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

  const addProductRow = () => {
    append({
      name: "",
      quantity: "",
      units: "pcs",
      unitPrice: "",
      discount: "",
      singleTotal: "",
    });
  };

  const removeProductRow = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Purchase</h2>
        <p className="text-gray-600">Record material purchases</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Site*
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
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Purchase Date*
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Item Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoiceNumberORImg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Invoice Number/Image
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Invoice number or image reference"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Product Details Table */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Product Details</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Product Name OR Service <span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Quantity <span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Unit <span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Unit Price <span className="text-red-600 text-sm">*</span>
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Discount(%)
                    </th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Single Total
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
                          name={`products.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  className="border h-auto"
                                  placeholder="Product name or Service"
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
                          name={`products.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1" min={0}
                                  className="border h-auto"
                                  placeholder="Quantity"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setTimeout(() => calculateProductTotal(index), calculateTotalAmount(), 100);
                                  }}
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
                          name={`products.${index}.units`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="border h-auto">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pcs">pcs</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="m">m</SelectItem>
                                    <SelectItem value="sqm">sqm</SelectItem>
                                    <SelectItem value="l">li</SelectItem>
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
                          name={`products.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1" min={0}
                                  className="border h-auto"
                                  placeholder="Unit Price"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setTimeout(() => calculateProductTotal(index), calculateTotalAmount(), 100);
                                  }}
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
                          name={`products.${index}.discount`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1" min={0}
                                  className="border h-auto"
                                  placeholder="Discount"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    setTimeout(() => calculateProductTotal(index), calculateTotalAmount(), 100);
                                  }}
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
                          name={`products.${index}.singleTotal`}
                          render={({ field }) => (
                            <FormItem className="mb-0">
                              <FormControl>
                                <Input
                                  type="number"
                                  step="1" min={0}
                                  className="border h-auto bg-gray-200"
                                  placeholder="Single Total"
                                  {...field}
                                  readOnly
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
                            onClick={addProductRow}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 sm:py-2 sm:px-4 rounded-lg"
                          >
                            <i className="fas fa-plus"></i>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => removeProductRow(index)}
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

          {/* Total Amount */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Total Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1" min={0}
                        className="bg-gray-50 font-semibold"
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
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2"
            >
              <i className="fas fa-save mr-2"></i>
              {mutation.isPending ? 'Saving...' : 'Save Purchase'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
