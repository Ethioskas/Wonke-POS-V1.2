import React from 'react';
import { useApp } from '@/lib/store';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Calendar, ArrowRight } from 'lucide-react';

export default function ShopSelector() {
  const { currentUser, getOwnerShops, setActiveShop, logout } = useApp();
  const [, setLocation] = useLocation();

  if (!currentUser || currentUser.type !== 'owner') {
    setLocation('/');
    return null;
  }

  const shops = getOwnerShops(currentUser.id);

  const handleSelectShop = (shopId: string) => {
    setActiveShop(shopId);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome, {currentUser.name}</h1>
          <p className="text-muted-foreground">Select a shop to manage</p>
        </div>

        <div className="grid gap-4">
          {shops.map(shop => (
            <Card key={shop.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectShop(shop.id)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{shop.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{shop.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={shop.license.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {shop.license.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>Exp: {shop.license.expiryDate}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
