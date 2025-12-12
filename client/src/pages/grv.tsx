import React, { useState } from 'react';
import { useApp, GRVItem, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// --- Reused Product Schema (Simplified for GRV Quick Add) ---
const uomSchema = z.object({
  level: z.number(),
  name: z.string().min(1, "Required"),
  multiplier: z.coerce.number().min(1),
  barcode: z.string().min(1, "Required"),
  price: z.coerce.number().min(0),
});

const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  category: z.string().min(1, "Category required"),
  costPrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  uoms: z.array(uomSchema).min(1, "At least one UoM required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function GRV() {
  const { activeShopId, getShopProducts, processGRV, addProduct, t } = useApp();
  const { toast } = useToast();
  
  const products = activeShopId ? getShopProducts(activeShopId) : [];
  
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [grvItems, setGrvItems] = useState<(GRVItem & { name: string })[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Quick Add Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      uoms: [{ level: 1, name: 'Base Unit', multiplier: 1, barcode: '', price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "uoms"
  });

  const onQuickAddSubmit = (data: ProductFormValues) => {
    const productData = {
      ...data,
      uoms: data.uoms.map((u, idx) => ({ ...u, level: (idx + 1) as 1|2|3|4 }))
    };
    
    addProduct(productData);
    setIsAddProductOpen(false);
    form.reset();
    toast({ title: "Product added", description: "You can now add it to this GRV from the dropdown" });
  };

  const handleAddProduct = (product: Product) => {
    // Check if already added
    if (grvItems.find(i => i.productId === product.id)) {
      toast({ title: "Already added", variant: "destructive" });
      return;
    }

    setGrvItems(prev => [...prev, {
      productId: product.id,
      name: product.name,
      quantityReceived: 0,
      oldCost: product.costPrice,
      newCost: product.costPrice
    }]);
    setOpenCombobox(false);
  };

  const handleRemoveItem = (index: number) => {
    setGrvItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof GRVItem, value: number) => {
    setGrvItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    if (!supplier || !invoiceNo || grvItems.length === 0) {
      toast({ title: "Missing Fields", description: "Please fill supplier, invoice and add items.", variant: "destructive" });
      return;
    }

    processGRV(grvItems);
    // Reset form
    setSupplier('');
    setInvoiceNo('');
    setGrvItems([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">{t('grv')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Receiving Details</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('supplier')}</Label>
            <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier Name" />
          </div>
          <div className="space-y-2">
            <Label>{t('invoiceNo')}</Label>
            <Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="INV-0000" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Items</h2>
          
          <div className="flex gap-2">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openCombobox} className="w-[250px] justify-between">
                  {t('searchProduct')}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0">
                <Command>
                  <CommandInput placeholder="Search product..." />
                  <CommandList>
                    <CommandEmpty>No product found.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.uoms.map(u => u.barcode).join(' ')}`}
                          onSelect={() => handleAddProduct(product)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              grvItems.find(i => i.productId === product.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {product.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plus className="mr-2 h-4 w-4" /> New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Quick Add Product</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onQuickAddSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('productName')}</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('category')}</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField control={form.control} name="costPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('cost')}</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('stock')}</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lowStockThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Low Alert</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="space-y-2 border rounded-md p-3 bg-muted/10">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-sm">Units of Measure</h3>
                        {fields.length < 4 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => append({ level: fields.length + 1, name: '', multiplier: 1, barcode: '', price: 0 })}>
                            <Plus className="h-3 w-3 mr-1" /> Add Level
                          </Button>
                        )}
                      </div>
                      
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end border-b pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                          <div className="col-span-3">
                            <Label className="text-xs">Name</Label>
                            <Input {...form.register(`uoms.${index}.name` as const)} placeholder="e.g. Box" className="h-8 text-xs" />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Mult.</Label>
                            <Input type="number" {...form.register(`uoms.${index}.multiplier` as const)} className="h-8 text-xs" disabled={index === 0} />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Barcode</Label>
                            <Input {...form.register(`uoms.${index}.barcode` as const)} className="h-8 text-xs" />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Price</Label>
                            <Input type="number" step="0.01" {...form.register(`uoms.${index}.price` as const)} className="h-8 text-xs" />
                          </div>
                          <div className="col-span-1">
                            {index > 0 && (
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>{t('cancel')}</Button>
                      <Button type="submit">Create & Add</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="border rounded-lg bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-[120px]">Qty (Base)</TableHead>
                <TableHead className="w-[120px]">Old Cost</TableHead>
                <TableHead className="w-[120px]">New Cost</TableHead>
                <TableHead className="w-[100px]">Diff %</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grvItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No items added yet.
                  </TableCell>
                </TableRow>
              ) : (
                grvItems.map((item, index) => {
                  const diff = item.oldCost > 0 
                    ? ((item.newCost - item.oldCost) / item.oldCost) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.quantityReceived} 
                          onChange={e => handleUpdateItem(index, 'quantityReceived', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.oldCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                         <Input 
                          type="number" 
                          step="0.01"
                          value={item.newCost} 
                          onChange={e => handleUpdateItem(index, 'newCost', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <span className={diff > 0 ? "text-destructive" : "text-green-600"}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end pt-4">
          <Button size="lg" onClick={handleSubmit} disabled={grvItems.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {t('submitGRV')}
          </Button>
        </div>
      </div>
    </div>
  );
}
