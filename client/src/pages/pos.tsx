import React, { useState } from 'react';
import { useApp, Product, UoM } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

export default function POS() {
  const { activeShopId, getShopProducts, cart, addToCart, removeFromCart, processSale, t, clearCart } = useApp();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uomModalOpen, setUomModalOpen] = useState(false);

  const products = activeShopId ? getShopProducts(activeShopId) : [];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.uoms.some(u => u.barcode.includes(search))
  );

  const handleBarcodeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const barcode = search.trim();
      if (!barcode) return;

      // Find product with exact barcode match
      let foundProduct: Product | undefined;
      let foundUom: UoM | undefined;

      for (const p of products) {
        const u = p.uoms.find(uom => uom.barcode === barcode);
        if (u) {
          foundProduct = p;
          foundUom = u;
          break;
        }
      }

      if (foundProduct && foundUom) {
        addToCart(foundProduct, foundUom);
        setSearch(''); // Clear input for next scan
      }
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleProductClick = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    
    // If only 1 UoM, add directly
    if (product.uoms.length === 1) {
      addToCart(product, product.uoms[0]);
    } else {
      // Show UoM selector
      setSelectedProduct(product);
      setUomModalOpen(true);
    }
  };

  const handleUomSelect = (uom: UoM) => {
    if (selectedProduct) {
      addToCart(selectedProduct, uom);
      setUomModalOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col gap-4 h-full">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder={t('searchProduct')} 
            className="pl-10 h-12 text-lg shadow-sm bg-card border-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleBarcodeEnter}
          />
        </div>

        <ScrollArea className="flex-1 bg-muted/5 rounded-lg border p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className={cn(
                  "cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-95",
                  product.stockQuantity === 0 ? "opacity-60 grayscale" : ""
                )}
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-4 flex flex-col h-full justify-between gap-2">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                       <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{product.category}</Badge>
                       {product.stockQuantity <= product.lowStockThreshold && (
                         <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                       )}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  </div>
                  
                  <div className="mt-2">
                    <div className="text-primary font-bold text-lg">
                      R{product.uoms[0].price.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                      <span>{product.stockQuantity} in stock</span>
                      {product.uoms.length > 1 && <Badge variant="secondary" className="text-[10px] h-4 px-1">+{product.uoms.length - 1} options</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <div className="w-full md:w-[400px] bg-card rounded-lg shadow-sm border flex flex-col h-[50vh] md:h-full">
        <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Sale
          </h2>
          {cart.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8">
              Clear
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <ShoppingCart className="h-12 w-12 mb-2" />
              <p>{t('addToCart')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-muted/20 p-3 rounded-md border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.uomName} @ R{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">x{item.quantity}</span>
                    <span className="font-mono font-bold w-16 text-right">R{item.subtotal.toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(idx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-muted/20 border-t space-y-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{t('total')}</span>
            <span className="text-primary">R{cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={() => processSale('cash')}
              disabled={cart.length === 0}
            >
              <Banknote className="mr-2 h-5 w-5" />
              {t('cash')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/5 font-bold"
              onClick={() => processSale('card')}
              disabled={cart.length === 0}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {t('card')}
            </Button>
          </div>
        </div>
      </div>

      {/* UoM Selection Modal */}
      <Dialog open={uomModalOpen} onOpenChange={setUomModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name} - Select Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {selectedProduct?.uoms.map((uom) => (
              <Button 
                key={uom.level} 
                variant="outline" 
                className="h-auto py-4 flex justify-between items-center hover:border-primary hover:bg-primary/5"
                onClick={() => handleUomSelect(uom)}
              >
                <div className="text-left">
                  <div className="font-bold">{uom.name}</div>
                  <div className="text-xs text-muted-foreground">Contains {uom.multiplier} units</div>
                </div>
                <div className="font-mono font-bold text-lg text-primary">
                  R{uom.price.toFixed(2)}
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
