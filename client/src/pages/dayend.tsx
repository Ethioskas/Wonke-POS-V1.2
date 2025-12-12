import React from 'react';
import { useApp } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';

export default function DayEnd() {
  const { activeShopId, getShopStaff, getShopSales, cashOutUser, t } = useApp();

  const staff = activeShopId ? getShopStaff(activeShopId) : [];
  const salesHistory = activeShopId ? getShopSales(activeShopId) : [];

  const staffSales = staff.map(member => {
    const memberHistory = salesHistory.filter(s => s.staffId === member.id);
    const totalSales = memberHistory.reduce((sum, s) => sum + s.totalAmount, 0);
    const openSales = memberHistory.filter(s => s.status === 'open').reduce((sum, s) => sum + s.totalAmount, 0);
    
    const openCash = memberHistory
      .filter(s => s.status === 'open' && s.paymentMethod === 'cash')
      .reduce((sum, s) => sum + s.totalAmount, 0);
      
    const openCard = memberHistory
      .filter(s => s.status === 'open' && s.paymentMethod === 'card')
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const transactionCount = memberHistory.length;
    
    return {
      member,
      totalSales,
      openSales,
      openCash,
      openCard,
      transactionCount
    };
  });

  if (!activeShopId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a shop to view day-end reconciliation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('dayend')}</h1>

      {staffSales.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No staff members assigned to this shop yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {staffSales.map(({ member, totalSales, openSales, openCash, openCard, transactionCount }) => (
            <Card key={member.id} className={openSales > 0 ? "border-primary/50 shadow-md" : "opacity-80"}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {member.name}
                    <Badge variant="outline" className="text-xs font-normal capitalize">{member.role}</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">@{member.username}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">R{openSales.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Total Open Amount</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Cash</p>
                    <p className="text-xl font-bold text-green-800">R{openCash.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Card</p>
                    <p className="text-xl font-bold text-blue-800">R{openCard.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="bg-muted/20 p-2 rounded">
                    <p className="text-muted-foreground">Transactions</p>
                    <p className="font-semibold">{transactionCount}</p>
                  </div>
                  <div className="bg-muted/20 p-2 rounded">
                    <p className="text-muted-foreground">Total Lifetime</p>
                    <p className="font-semibold">R{totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-muted/20 p-2 rounded flex items-center justify-center">
                     {openSales > 0 ? (
                       <span className="flex items-center text-orange-600 gap-1 font-medium"><AlertCircle className="w-4 h-4" /> Pending</span>
                     ) : (
                       <span className="flex items-center text-green-600 gap-1 font-medium"><CheckCircle className="w-4 h-4" /> Settled</span>
                     )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => cashOutUser(member.id)} 
                    disabled={openSales === 0}
                    variant={openSales > 0 ? "default" : "secondary"}
                    className="w-full sm:w-auto"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {t('cashOut')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
