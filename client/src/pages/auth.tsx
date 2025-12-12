import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, User } from 'lucide-react';

export default function Login() {
  const { loginOwner, loginStaff, t, getOwnerShops } = useApp();
  const [, setLocation] = useLocation();
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      const success = await loginOwner(ownerUsername, ownerPassword);
      if (success) {
        setLocation('/dashboard');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      const success = await loginStaff(staffUsername, staffPassword);
      if (success) {
        setLocation('/pos');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
             <Store className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="font-bold text-primary text-[34px]">Wonke POS</CardTitle>
            <CardDescription className="mt-2 text-base">
              Mobile Point of Sale System
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staff">
                <User className="w-4 h-4 mr-2" />
                Staff Login
              </TabsTrigger>
              <TabsTrigger value="owner">
                <Store className="w-4 h-4 mr-2" />
                Owner Login
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="staff" className="mt-4">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-username">{t('username')}</Label>
                  <Input 
                    id="staff-username" 
                    placeholder="Enter staff username" 
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    className="h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">{t('password')}</Label>
                  <Input 
                    id="staff-password" 
                    type="password"
                    placeholder="Enter password" 
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                  {isLoading ? "..." : t('login')}
                </Button>
                <div className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded border">
                  <p className="font-semibold mb-1">Demo Staff:</p>
                  <p>Supervisor: <span className="font-mono text-primary">sara / staff123</span></p>
                  <p>Cashier: <span className="font-mono text-primary">kebede / staff123</span></p>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="owner" className="mt-4">
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-username">{t('username')}</Label>
                  <Input 
                    id="owner-username" 
                    placeholder="Enter owner username" 
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-password">{t('password')}</Label>
                  <Input 
                    id="owner-password" 
                    type="password"
                    placeholder="Enter password" 
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={isLoading}>
                  {isLoading ? "..." : t('login')}
                </Button>
                <div className="text-xs text-muted-foreground text-center bg-muted/50 p-3 rounded border">
                  <p className="font-semibold mb-1">Demo Owners:</p>
                  <p>Abebe (1 shop): <span className="font-mono text-primary">abebe / owner123</span></p>
                  <p>Sammy (2 shops): <span className="font-mono text-primary">sammy / owner123</span></p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
