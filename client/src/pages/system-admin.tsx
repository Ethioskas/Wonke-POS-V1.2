import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useApp, Owner, Shop, ShopLicense, StaffMember, StaffRole } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Shield, Plus, Pencil, Trash2, Store, Building2, LogOut, ChevronRight, Calendar, User } from 'lucide-react';

export default function SystemAdmin() {
  const [, setLocation] = useLocation();
  const { 
    owners, shops, staff, 
    addOwner, updateOwner, deleteOwner,
    addShop, updateShop, deleteShop, updateShopLicense,
    addStaff, updateStaff, deleteStaff,
    getOwnerShops, getShopStaff
  } = useApp();
  
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [editingLicenseShopId, setEditingLicenseShopId] = useState<string | null>(null);
  
  const [newOwner, setNewOwner] = useState({ name: '', email: '', phone: '', username: '', password: '' });
  const [newShop, setNewShop] = useState({ name: '', location: '', license: { status: 'active' as const, expiryDate: '2025-12-31', plan: 'basic' as const } });
  const [newStaff, setNewStaff] = useState({ name: '', username: '', password: '', role: 'cashier' as StaffRole });
  const [editingLicense, setEditingLicense] = useState<ShopLicense | null>(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    setLocation('/admin-login');
  };

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.username || !newOwner.password) return;
    addOwner(newOwner);
    setNewOwner({ name: '', email: '', phone: '', username: '', password: '' });
    setIsAddOwnerOpen(false);
  };

  const handleUpdateOwner = () => {
    if (!editingOwner) return;
    updateOwner(editingOwner);
    setEditingOwner(null);
  };

  const handleAddShop = () => {
    if (!newShop.name || !selectedOwnerId) return;
    addShop({ ...newShop, ownerId: selectedOwnerId });
    setNewShop({ name: '', location: '', license: { status: 'active', expiryDate: '2025-12-31', plan: 'basic' } });
    setSelectedOwnerId('');
    setIsAddShopOpen(false);
  };

  const handleUpdateShop = () => {
    if (!editingShop) return;
    updateShop(editingShop);
    setEditingShop(null);
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.username || !selectedShopId) return;
    addStaff({ ...newStaff, shopId: selectedShopId });
    setNewStaff({ name: '', username: '', password: '', role: 'cashier' });
    setSelectedShopId('');
    setIsAddStaffOpen(false);
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    updateStaff(editingStaff);
    setEditingStaff(null);
  };

  const handleUpdateLicense = () => {
    if (!editingLicenseShopId || !editingLicense) return;
    updateShopLicense(editingLicenseShopId, editingLicense);
    setEditingLicenseShopId(null);
    setEditingLicense(null);
  };

  const openEditLicense = (shop: Shop) => {
    setEditingLicenseShopId(shop.id);
    setEditingLicense({ ...shop.license });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Wonke POS Admin</h1>
              <p className="text-xs text-slate-400">System Administration Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setLocation('/')} className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Store className="w-4 h-4 mr-2" />
              Go to POS
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4 mb-6">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Owners</p>
                  <p className="text-3xl font-bold text-white">{owners.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Shops</p>
                  <p className="text-3xl font-bold text-white">{shops.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Staff</p>
                  <p className="text-3xl font-bold text-white">{staff.length}</p>
                </div>
                <User className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Licenses</p>
                  <p className="text-3xl font-bold text-white">{shops.filter(s => s.license.status === 'active').length}</p>
                </div>
                <Shield className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Owner Hierarchy</h2>
          <div className="flex gap-2">
            <Dialog open={isAddOwnerOpen} onOpenChange={setIsAddOwnerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Owner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Owner</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      <Input value={newOwner.name} onChange={(e) => setNewOwner({...newOwner, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email</Label>
                      <Input value={newOwner.email} onChange={(e) => setNewOwner({...newOwner, email: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Phone</Label>
                      <Input value={newOwner.phone} onChange={(e) => setNewOwner({...newOwner, phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Username</Label>
                      <Input value={newOwner.username} onChange={(e) => setNewOwner({...newOwner, username: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Password</Label>
                    <Input type="password" value={newOwner.password} onChange={(e) => setNewOwner({...newOwner, password: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOwnerOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                  <Button onClick={handleAddOwner} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddShopOpen} onOpenChange={setIsAddShopOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Shop
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Shop</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Owner</Label>
                    <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {owners.map(o => (
                          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Shop Name</Label>
                      <Input value={newShop.name} onChange={(e) => setNewShop({...newShop, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Location</Label>
                      <Input value={newShop.location} onChange={(e) => setNewShop({...newShop, location: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">License Plan</Label>
                      <Select value={newShop.license.plan} onValueChange={(v) => setNewShop({...newShop, license: {...newShop.license, plan: v as 'basic' | 'pro' | 'enterprise'}})}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">License Expiry</Label>
                      <Input type="date" value={newShop.license.expiryDate} onChange={(e) => setNewShop({...newShop, license: {...newShop.license, expiryDate: e.target.value}})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddShopOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                  <Button onClick={handleAddShop} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Staff</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Shop</Label>
                    <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select shop" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {shops.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Full Name</Label>
                      <Input value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Role</Label>
                      <Select value={newStaff.role} onValueChange={(v) => setNewStaff({...newStaff, role: v as StaffRole})}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                          <SelectItem value="cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Username</Label>
                      <Input value={newStaff.username} onChange={(e) => setNewStaff({...newStaff, username: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Password</Label>
                      <Input type="password" value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddStaffOpen(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                  <Button onClick={handleAddStaff} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {owners.map(owner => (
            <Card key={owner.id} className="bg-slate-900/60 border-slate-700">
              <Accordion type="single" collapsible>
                <AccordionItem value={owner.id} className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-400">{owner.name[0]}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-semibold text-white">{owner.name}</h3>
                        <p className="text-sm text-slate-400">@{owner.username} | {owner.email}</p>
                      </div>
                      <Badge className="bg-purple-500/20 text-purple-400 mr-4">
                        {getOwnerShops(owner.id).length} Shop(s)
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="flex justify-end gap-2 mb-4">
                      <Dialog open={editingOwner?.id === owner.id} onOpenChange={(open) => !open && setEditingOwner(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingOwner(owner)} className="border-slate-700 text-slate-300">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Owner
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Owner</DialogTitle>
                          </DialogHeader>
                          {editingOwner && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-slate-300">Full Name</Label>
                                  <Input value={editingOwner.name} onChange={(e) => setEditingOwner({...editingOwner, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-slate-300">Email</Label>
                                  <Input value={editingOwner.email} onChange={(e) => setEditingOwner({...editingOwner, email: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-slate-300">Phone</Label>
                                  <Input value={editingOwner.phone} onChange={(e) => setEditingOwner({...editingOwner, phone: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-slate-300">Username</Label>
                                  <Input value={editingOwner.username} onChange={(e) => setEditingOwner({...editingOwner, username: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-300">Password</Label>
                                <Input type="password" value={editingOwner.password} onChange={(e) => setEditingOwner({...editingOwner, password: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingOwner(null)} className="border-slate-700 text-slate-300">Cancel</Button>
                            <Button onClick={handleUpdateOwner} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border-red-700/50 text-red-400 hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Owner
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Owner</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you sure you want to delete this owner? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteOwner(owner.id)} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {getOwnerShops(owner.id).length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No shops yet. Add a shop for this owner.</p>
                    ) : (
                      <div className="space-y-3 ml-4">
                        {getOwnerShops(owner.id).map(shop => (
                          <Card key={shop.id} className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Building2 className="h-5 w-5 text-blue-400" />
                                  <div>
                                    <h4 className="font-medium text-white">{shop.name}</h4>
                                    <p className="text-xs text-slate-400">{shop.location}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right mr-4">
                                    <Badge className={shop.license.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                      {shop.license.status}
                                    </Badge>
                                    <p className="text-xs text-slate-400 mt-1">{shop.license.plan} | Exp: {shop.license.expiryDate}</p>
                                  </div>
                                  <Dialog open={editingLicenseShopId === shop.id} onOpenChange={(open) => !open && setEditingLicenseShopId(null)}>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => openEditLicense(shop)} className="text-slate-400 hover:text-white">
                                        <Calendar className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-700">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Edit License - {shop.name}</DialogTitle>
                                      </DialogHeader>
                                      {editingLicense && (
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label className="text-slate-300">Status</Label>
                                            <Select value={editingLicense.status} onValueChange={(v) => setEditingLicense({...editingLicense, status: v as 'active' | 'expired'})}>
                                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-slate-300">Plan</Label>
                                            <Select value={editingLicense.plan} onValueChange={(v) => setEditingLicense({...editingLicense, plan: v as 'basic' | 'pro' | 'enterprise'})}>
                                              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="basic">Basic</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-slate-300">Expiry Date</Label>
                                            <Input type="date" value={editingLicense.expiryDate} onChange={(e) => setEditingLicense({...editingLicense, expiryDate: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                          </div>
                                        </div>
                                      )}
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingLicenseShopId(null)} className="border-slate-700 text-slate-300">Cancel</Button>
                                        <Button onClick={handleUpdateLicense} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Dialog open={editingShop?.id === shop.id} onOpenChange={(open) => !open && setEditingShop(null)}>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => setEditingShop(shop)} className="text-slate-400 hover:text-white">
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-700">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Edit Shop</DialogTitle>
                                      </DialogHeader>
                                      {editingShop && (
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label className="text-slate-300">Shop Name</Label>
                                            <Input value={editingShop.name} onChange={(e) => setEditingShop({...editingShop, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                          </div>
                                          <div className="space-y-2">
                                            <Label className="text-slate-300">Location</Label>
                                            <Input value={editingShop.location} onChange={(e) => setEditingShop({...editingShop, location: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                          </div>
                                        </div>
                                      )}
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditingShop(null)} className="border-slate-700 text-slate-300">Cancel</Button>
                                        <Button onClick={handleUpdateShop} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Shop</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          Are you sure you want to delete this shop?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteShop(shop.id)} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 px-4 border-t border-slate-700">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-400">Staff ({getShopStaff(shop.id).length})</span>
                              </div>
                              {getShopStaff(shop.id).length === 0 ? (
                                <p className="text-xs text-slate-500 ml-6">No staff assigned</p>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-6">
                                  {getShopStaff(shop.id).map(s => (
                                    <div key={s.id} className="flex items-center justify-between bg-slate-900/50 rounded px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <ChevronRight className="h-3 w-3 text-slate-500" />
                                        <span className="text-sm text-white">{s.name}</span>
                                        <Badge className={s.role === 'supervisor' ? 'bg-blue-500/20 text-blue-400 text-xs' : 'bg-green-500/20 text-green-400 text-xs'}>
                                          {s.role}
                                        </Badge>
                                      </div>
                                      <div className="flex gap-1">
                                        <Dialog open={editingStaff?.id === s.id} onOpenChange={(open) => !open && setEditingStaff(null)}>
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => setEditingStaff(s)} className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="bg-slate-900 border-slate-700">
                                            <DialogHeader>
                                              <DialogTitle className="text-white">Edit Staff</DialogTitle>
                                            </DialogHeader>
                                            {editingStaff && (
                                              <div className="space-y-4 py-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <Label className="text-slate-300">Full Name</Label>
                                                    <Input value={editingStaff.name} onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                                  </div>
                                                  <div className="space-y-2">
                                                    <Label className="text-slate-300">Role</Label>
                                                    <Select value={editingStaff.role} onValueChange={(v) => setEditingStaff({...editingStaff, role: v as StaffRole})}>
                                                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                        <SelectValue />
                                                      </SelectTrigger>
                                                      <SelectContent className="bg-slate-800 border-slate-700">
                                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                                        <SelectItem value="cashier">Cashier</SelectItem>
                                                      </SelectContent>
                                                    </Select>
                                                  </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                  <div className="space-y-2">
                                                    <Label className="text-slate-300">Username</Label>
                                                    <Input value={editingStaff.username} onChange={(e) => setEditingStaff({...editingStaff, username: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                                  </div>
                                                  <div className="space-y-2">
                                                    <Label className="text-slate-300">Password</Label>
                                                    <Input type="password" value={editingStaff.password} onChange={(e) => setEditingStaff({...editingStaff, password: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            <DialogFooter>
                                              <Button variant="outline" onClick={() => setEditingStaff(null)} className="border-slate-700 text-slate-300">Cancel</Button>
                                              <Button onClick={handleUpdateStaff} className="bg-purple-600 hover:bg-purple-700">Save</Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-slate-900 border-slate-700">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-white">Delete Staff</AlertDialogTitle>
                                              <AlertDialogDescription className="text-slate-400">
                                                Are you sure you want to remove this staff member?
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="border-slate-700 text-slate-300">Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => deleteStaff(s.id)} className="bg-red-600 text-white hover:bg-red-700">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
