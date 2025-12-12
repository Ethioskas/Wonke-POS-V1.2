import React from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, TrendingUp, AlertTriangle, Building2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { currentUser, activeShopId, getShopProducts, getShopById, getOwnerShops, getShopSales, getShopStaff, t } = useApp();

  const activeShop = activeShopId ? getShopById(activeShopId) : null;
  const products = activeShopId ? getShopProducts(activeShopId) : [];
  const sales = activeShopId ? getShopSales(activeShopId) : [];
  const shopStaff = activeShopId ? getShopStaff(activeShopId) : [];
  const ownerShops = currentUser?.type === 'owner' ? getOwnerShops(currentUser.id) : [];

  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
  const todaySales = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const license = activeShop?.license;
  const daysUntilExpiry = license ? Math.ceil((new Date(license.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const stats = [
    { title: "Today's Sales", value: `R${todaySales.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { title: "Inventory Value", value: `R${totalValue.toFixed(2)}`, icon: Package, color: "text-blue-600" },
    { title: "Low Stock Alerts", value: lowStockItems.length, icon: AlertTriangle, color: lowStockItems.length > 0 ? "text-orange-600" : "text-gray-400" },
    { title: "License Days", value: daysUntilExpiry > 0 ? daysUntilExpiry : 0, icon: TrendingUp, color: daysUntilExpiry < 30 ? "text-orange-600" : "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h1>
        {activeShop && (
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{activeShop.name}</span>
          </div>
        )}
      </div>

      {currentUser?.type === 'owner' && ownerShops.length > 1 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Shops Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {ownerShops.map(shop => {
                const shopSalesTotal = getShopSales(shop.id).reduce((sum, s) => sum + s.totalAmount, 0);
                return (
                  <div key={shop.id} className={`p-3 rounded-lg border ${activeShopId === shop.id ? 'bg-primary/10 border-primary' : 'bg-card'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.location}</p>
                      </div>
                      <Badge className={shop.license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {shop.license.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Sales: </span>
                      <span className="font-medium">R{shopSalesTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t('lowStock')}</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-sm">All stock levels are healthy.</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-destructive font-bold">{item.stockQuantity}</span>
                      <span className="text-xs text-muted-foreground block">Threshold: {item.lowStockThreshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
               <Users className="h-5 w-5" />
               Shop Staff
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shopStaff.length === 0 ? (
              <p className="text-muted-foreground text-sm">No staff assigned to this shop.</p>
            ) : (
              shopStaff.map(s => (
                <div key={s.id} className="flex justify-between items-center p-2 bg-muted/20 rounded-lg">
                  <span className="font-medium">{s.name}</span>
                  <Badge className={s.role === 'supervisor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                    {s.role}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {license && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">License Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <Badge className={license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {license.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Plan</span>
                <span className="font-medium capitalize">{license.plan}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                <span className="text-sm font-medium">Expiry Date</span>
                <span className="font-mono">{license.expiryDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
