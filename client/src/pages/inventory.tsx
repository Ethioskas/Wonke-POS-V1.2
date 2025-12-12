import React, { useState } from 'react';
import { useApp, Product, UoM } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema for Product Form
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


// Helper component to manage UoM Row logic (auto-calc)
const UomRow = ({ index, remove, form, costPrice, basePrice }: { index: number, remove: (index: number) => void, form: any, costPrice: number, basePrice: number }) => {
  const multiplier = useWatch({
    control: form.control,
    name: `uoms.${index}.multiplier`,
    defaultValue: 1
  });

  // Calculate estimated cost for this UoM
  const estimatedCost = (costPrice || 0) * (multiplier || 1);
  
  // Auto-suggest price if multiplier changes and price is 0 (simple heuristic)
  // Note: We don't want to overwrite user input aggressively, so we only display the cost hint
  // and maybe one-time set. But for now, just showing the cost hint is safer and very helpful.

  return (
    <div className="grid grid-cols-12 gap-2 items-end border-b pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
      <div className="col-span-3">
        <Label className="text-xs">Name</Label>
        <Input {...form.register(`uoms.${index}.name` as const)} placeholder="e.g. Box" className="h-8 text-xs" />
      </div>
      <div className="col-span-2">
        <Label className="text-xs">Mult.</Label>
        <Input 
          type="number" 
          {...form.register(`uoms.${index}.multiplier` as const)} 
          className="h-8 text-xs" 
          disabled={index === 0} 
          onChange={(e) => {
            form.register(`uoms.${index}.multiplier`).onChange(e);
            // Auto-fill price logic could go here if desired
            // const val = parseFloat(e.target.value);
            // if (val && basePrice) {
            //   form.setValue(`uoms.${index}.price`, basePrice * val);
            // }
          }}
        />
      </div>
      <div className="col-span-3">
        <Label className="text-xs">Barcode</Label>
        <Input {...form.register(`uoms.${index}.barcode` as const)} className="h-8 text-xs" />
      </div>
      <div className="col-span-3">
        <Label className="text-xs">Price</Label>
        <Input type="number" step="0.01" {...form.register(`uoms.${index}.price` as const)} className="h-8 text-xs" />
        <p className="text-[10px] text-muted-foreground mt-1">Est. Cost: {estimatedCost.toFixed(2)}</p>
      </div>
      <div className="col-span-1">
        {index > 0 && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
            <Trash className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default function Inventory() {
  const { activeShopId, getShopProducts, addProduct, updateProduct, t } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const products = activeShopId ? getShopProducts(activeShopId) : [];

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

  // Watch cost price to pass to rows
  const costPrice = useWatch({ control: form.control, name: 'costPrice' });
  // Watch base price (uoms[0].price) to help with auto-calc if needed
  const basePrice = useWatch({ control: form.control, name: 'uoms.0.price' });

  const onSubmit = (data: ProductFormValues) => {
    const formattedUoms = data.uoms.map((u, idx) => ({ ...u, level: (idx + 1) as 1|2|3|4 }));

    if (editingId) {
      const existingProduct = products.find(p => p.id === editingId);
      if (existingProduct) {
        updateProduct({
          ...existingProduct,
          ...data,
          uoms: formattedUoms
        });
      }
    } else {
      addProduct({
        ...data,
        uoms: formattedUoms
      });
    }
    setIsDialogOpen(false);
    form.reset();
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      uoms: product.uoms
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      name: '',
      category: '',
      costPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 5,
      uoms: [{ level: 1, name: 'Base Unit', multiplier: 1, barcode: '', price: 0 }]
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('inventory')}</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> {t('addProduct')}
        </Button>
      </div>

      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('productName')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead className="text-right">{t('stock')} (Base)</TableHead>
              <TableHead className="text-right">{t('cost')}</TableHead>
              <TableHead>{t('uom')}</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right font-mono">
                  <span className={product.stockQuantity <= product.lowStockThreshold ? "text-destructive font-bold" : ""}>
                    {product.stockQuantity}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">{product.costPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.uoms.map(u => (
                      <Badge key={u.level} variant="secondary" className="text-[10px]">
                        {u.name} ({u.multiplier}x)
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('editProduct') : t('addProduct')}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormControl><Input type="number" {...field} disabled={!!editingId} /></FormControl>
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
                  <UomRow 
                    key={field.id} 
                    index={index} 
                    remove={remove} 
                    form={form} 
                    costPrice={costPrice}
                    basePrice={basePrice}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('save')}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
