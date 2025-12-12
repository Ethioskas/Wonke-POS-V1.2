import React from 'react';
import { useApp } from '@/lib/store';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  FileBarChart, 
  UserCircle, 
  LogOut,
  Menu,
  Globe,
  Wallet,
  Building2
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, activeShopId, logout, t, language, setLanguage, getShopById, getOwnerShops, setActiveShop } = useApp();
  const [location] = useLocation();

  const activeShop = activeShopId ? getShopById(activeShopId) : null;
  const ownerShops = currentUser?.type === 'owner' ? getOwnerShops(currentUser.id) : [];

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, roles: ['owner', 'supervisor'] },
    { path: '/pos', label: t('pos'), icon: ShoppingCart, roles: ['owner', 'supervisor', 'cashier'] },
    { path: '/inventory', label: t('inventory'), icon: Package, roles: ['owner', 'supervisor'] },
    { path: '/grv', label: t('grv'), icon: Truck, roles: ['owner', 'supervisor'] },
    { path: '/dayend', label: t('dayend'), icon: Wallet, roles: ['owner', 'supervisor'] },
    { path: '/reports', label: t('reports'), icon: FileBarChart, roles: ['owner'] },
  ];

  const filteredNav = navItems.filter(item => currentUser && item.roles.includes(currentUser.role));

  if (!currentUser) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (activeShop?.license.status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-destructive text-destructive-foreground p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('licenseStatus')}: {t('expired')}</h1>
        <p className="text-xl mb-8">{t('licenseExpiredMsg')}</p>
        <Button variant="secondary" size="lg" onClick={logout}>{t('logout')}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px]">
              <div className="flex flex-col h-full py-4">
                <h2 className="text-2xl font-bold px-4 mb-6 text-primary">{t('appName')}</h2>
                <nav className="flex-1 flex flex-col gap-2">
                  {filteredNav.map(item => (
                    <Link key={item.path} href={item.path}>
                      <a className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                        location === item.path ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      )}>
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </nav>
                <div className="border-t pt-4">
                  <Link href="/profile">
                    <a className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-md">
                      <UserCircle className="h-5 w-5" />
                      {t('profile')}
                    </a>
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 text-destructive rounded-md w-full text-left">
                    <LogOut className="h-5 w-5" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">{t('appName')}</span>
        </div>
        
        <div className="flex items-center gap-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('am')}>
                Amharic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b">
           <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
             {t('appName')}
           </h1>
           <p className="text-xs text-muted-foreground mt-1">{currentUser.role.toUpperCase()}</p>
           {activeShop && (
             <div className="mt-2 flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded">
               <Building2 className="h-3 w-3" />
               <span className="truncate">{activeShop.name}</span>
             </div>
           )}
        </div>

        {ownerShops.length > 1 && (
          <div className="px-4 py-2 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span className="truncate">{activeShop?.name || 'Select Shop'}</span>
                  <Building2 className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {ownerShops.map(shop => (
                  <DropdownMenuItem key={shop.id} onClick={() => setActiveShop(shop.id)}>
                    {shop.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           {filteredNav.map(item => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all hover:translate-x-1",
                location === item.path 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between mb-4">
             <span className="text-sm font-medium">{t('language')}</span>
             <div className="flex gap-1">
               <Button 
                 variant={language === 'en' ? 'default' : 'outline'} 
                 size="sm" 
                 onClick={() => setLanguage('en')}
                 className="h-7 px-2 text-xs"
               >EN</Button>
               <Button 
                 variant={language === 'am' ? 'default' : 'outline'} 
                 size="sm" 
                 onClick={() => setLanguage('am')}
                 className="h-7 px-2 text-xs"
               >AM</Button>
             </div>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
             <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {currentUser.name[0]}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium truncate">{currentUser.name}</p>
               <Link href="/profile"><a className="text-xs text-muted-foreground hover:underline">{t('profile')}</a></Link>
             </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen bg-muted/10">
        <div className="container mx-auto p-4 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
};
