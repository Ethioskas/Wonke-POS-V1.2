import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, useApp } from "@/lib/store";
import { Layout } from "@/components/layout";

// Pages
import Login from "@/pages/auth";
import POS from "@/pages/pos";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import GRV from "@/pages/grv";
import DayEnd from "@/pages/dayend";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import AdminLogin from "@/pages/admin-login";
import SystemAdmin from "@/pages/system-admin";
import ShopSelector from "@/pages/shop-selector";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, path, allowedRoles }: { component: React.ComponentType, path: string, allowedRoles?: string[] }) {
  const { currentUser } = useApp();
  
  const hasAccess = currentUser && (!allowedRoles || allowedRoles.includes(currentUser.role));
  
  return (
    <Route path={path}>
      {hasAccess ? <Component /> : <Redirect to={currentUser ? '/dashboard' : '/'} />}
    </Route>
  );
}

function Router() {
  const { currentUser, activeShopId, getOwnerShops } = useApp();
  
  // Owner logged in but no shop selected - redirect to shop selector
  const needsShopSelection = currentUser?.type === 'owner' && !activeShopId && getOwnerShops(currentUser.id).length > 1;
  
  return (
    <Switch>
      <Route path="/">
        {currentUser ? (
          needsShopSelection ? <Redirect to="/select-shop" /> : 
          <Redirect to={currentUser.role === 'cashier' ? '/pos' : '/dashboard'} />
        ) : <Login />}
      </Route>
      
      <Route path="/select-shop" component={ShopSelector} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/pos" component={POS} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/grv" component={GRV} />
      <ProtectedRoute path="/dayend" component={DayEnd} />
      <ProtectedRoute path="/reports" component={Reports} allowedRoles={['owner']} />
      <ProtectedRoute path="/profile" component={Profile} />
      
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/system-admin" component={SystemAdmin} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Layout>
          <Router />
          <Toaster />
        </Layout>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
