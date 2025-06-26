'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Truck, 
  User, 
  Package,
  Wrench,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  QrCode,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { createVansApi, deleteVansById, getVans } from './data/request';

export function VanManagement() {
  const {  users, createVan, updateVan, deleteVan, assignUserToVan } = useData();
  const [vans, setVans] = useState<any[]>([]);
  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVan, setEditingVan] = useState<any>(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
    assignedUserId: '',
    loadCapacity: 100,
  });

  const resetForm = () => {
    setFormData({
      licensePlate: '',
      status: 'active',
      assignedUserId: '',
      loadCapacity: 100,
    });
  };


  useEffect(() => {
       const loadVans = async () => {
        try {
           const response = await getVans();
            if (response) {

              console.log('Vans loaded:', response);
            }

            setVans(response.map((van: any) => ({
              id: van.id,
              licensePlate: van.licensePlate,
              
            })));
        } catch (error) {
          console.error('Failed to load vans:', error);
        }
      };

      loadVans();
    }, []);





  const handleCreate = async () => {
    if (!formData.licensePlate ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const van = {
        licensePlate: formData.licensePlate,
      
      };

      const response = await createVansApi(van);

      if (response) {
            toast.success(t('vans.vanCreated'));
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        toast.error(t('users.errorCreatingUser'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('users.errorCreatingUser'));
    }
  };

  
    
  const handleEdit = (van: any) => {
    setEditingVan(van);
    setFormData({
      licensePlate: van.licensePlate,
      status: van.status,
      assignedUserId: van.assignedUserId || '',
      loadCapacity: van.loadCapacity,
    });
  };

  const handleUpdate = () => {
    if (!formData.licensePlate) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateVan(editingVan.id, {
      licensePlate: formData.licensePlate,
      status: formData.status,
      assignedUserId: formData.assignedUserId || undefined,
      assignedUserName: formData.assignedUserId ? users.find(u => u.id === formData.assignedUserId)?.name : undefined,
      loadCapacity: formData.loadCapacity,
    });

    if (formData.assignedUserId) {
      assignUserToVan(editingVan.id, formData.assignedUserId);
    }

    toast.success(t('vans.vanUpdated'));
    setEditingVan(null);
    resetForm();
  };

  const handleDelete = async (vanId: string) => {
  try {
    const response = await deleteVansById(vanId);

    if (response) {
      toast.success(t('vans.vanDeleted'));
    } else {
      toast.error(t('vans.errorDeletingVan'));
    }
  } catch (error) {
    console.error(error);
    toast.error(t('vans.errorDeletingVan'));
  }
};

  const getStatusIcon = (status: 'active' | 'maintenance' | 'inactive') => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = (status: 'active' | 'maintenance' | 'inactive') => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'inactive':
        return 'destructive';
    }
  };

  const activeVans = vans.filter(v => v.status === 'active').length;
  const maintenanceVans = vans.filter(v => v.status === 'maintenance').length;
  const totalCapacity = vans.reduce((sum, van) => sum + van.loadCapacity, 0);
  const totalLoad = vans.reduce((sum, van) => sum + van.currentLoad, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('vans.title')}</h2>
          <p className="text-muted-foreground">{t('vans.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('vans.addVan')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('vans.createVan')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="licensePlate">{t('vans.licensePlate')}</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder={t('vans.enterLicensePlate')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="status">{t('common.status')}</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                >
                  <option value="active">{t('vans.active')}</option>
                  <option value="maintenance">{t('vans.maintenance')}</option>
                  <option value="inactive">{t('vans.inactive')}</option>
                </select>
              </div>
              
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('vans.totalFleet')}</p>
                <p className="text-2xl font-bold">{vans.length}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('vans.activeVans')}</p>
                <p className="text-2xl font-bold">{activeVans}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('vans.inMaintenance')}</p>
                <p className="text-2xl font-bold">{maintenanceVans}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('vans.fleetUtilization')}</p>
                <p className="text-2xl font-bold">{totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0}%</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Van List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vans.map((van) => (
          <Card key={van.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{van.licensePlate}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {getStatusIcon(van.status)}
                      {van.status === 'active' ? t('vans.active') : 
                       van.status === 'maintenance' ? t('vans.maintenance') : t('vans.inactive')}
                    </CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => handleEdit(van)}>
                      <Edit className="h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <QrCode className="h-4 w-4" />
                      {t('vans.scanMaterials')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <User className="h-4 w-4" />
                      {t('vans.assignUser')}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Wrench className="h-4 w-4" />
                      {t('vans.scheduleMaintenance')}
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="gap-2 text-destructive" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('vans.confirmDelete')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(van.id)}>
                            {t('common.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Assigned User */}
              {van.assignedUserName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('vans.assignedTo')}:</span>
                  <Badge variant="outline">{van.assignedUserName}</Badge>
                </div>
              )}

              {/* Load Status */}
              {van.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('vans.loadCapacity')}:</span>
                    <span>{van.currentLoad}% of {van.loadCapacity}%</span>
                  </div>
                  <Progress value={van.currentLoad} className="h-2" />
                </div>
              )}

              {/* Materials 
              {van.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('vans.loadedMaterials')}:</h4>
                  <div className="space-y-1">
                    {van.materials.slice(0, 3).map((material, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {material}
                      </div>
                    ))}
                    {van.materials.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{van.materials.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}*/}

              {/* Maintenance Info 
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('vans.nextMaintenance')}:</span>
                  <span>{van.nextMaintenance.toLocaleDateString()}</span>
                </div>
              </div>
              */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Van Dialog */}
      {editingVan && (
        <Dialog open={!!editingVan} onOpenChange={() => setEditingVan(null)}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('vans.editVan')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-licensePlate">{t('vans.licensePlate')}</Label>
                <Input
                  id="edit-licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder={t('vans.enterLicensePlate')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">{t('common.status')}</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                >
                  <option value="active">{t('vans.active')}</option>
                  <option value="maintenance">{t('vans.maintenance')}</option>
                  <option value="inactive">{t('vans.inactive')}</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-assignedUser">{t('vans.selectUser')}</Label>
                <select
                  id="edit-assignedUser"
                  value={formData.assignedUserId}
                  onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                  className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                >
                  <option value="">{t('vans.selectUser')}</option>
                  {users.filter(u => u.role === 'user').map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-loadCapacity">Load Capacity (%)</Label>
                <Input
                  id="edit-loadCapacity"
                  type="number"
                  value={formData.loadCapacity}
                  onChange={(e) => setFormData({ ...formData, loadCapacity: parseInt(e.target.value) })}
                  className="glass-panel"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingVan(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdate}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}