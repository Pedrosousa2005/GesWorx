'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Package, 
  Search,
  QrCode,
  Truck,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Box,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QRCodeDisplay } from './QRCodeDisplay';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { createMaterialsApi, deleteMaterialsById, getMaterials, updateMaterialsById } from './data/request';

export function MaterialManagement() {
  const {  vans, createMaterial, updateMaterial, deleteMaterial, assignMaterialToVan } = useData();
  const [materials, setMaterials] = useState<any[]>([]);
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    quantity: 1,
    isContainer: false,
  });

  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category)))];

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.qrCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      quantity: 1,
      isContainer: false,
    });
  };


  useEffect(() => {
         const loadMaterials = async () => {
          try {
             const response = await getMaterials();
              if (response) {

                console.log('Materials loaded:', response);
              }

              setMaterials(response.map((material: any) => ({
                id: material.id,
                name: material.name,
                category: material.category,
                subcategory: material.subcategory,
                QrCode: material.qrCode,
                parentId: material.parentId,
                vanId: material.vanId,
              })));
          } catch (error) {
            console.error('Failed to load materials:', error);
          }
        };

        loadMaterials();
      }, []);

  


  const handleCreate = async () => {
      if (!formData.name || !formData.category ) {
        toast.error('Please fill in all required fields');
        return;
      }
  
      try {
        const material = {
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory,
          quantity: formData.quantity,
          isContainer: formData.isContainer,
          contents: formData.isContainer ? [] : undefined,
        };

        const response = await createMaterialsApi(material);

        if (response) {
              toast.success(t('materials.materialCreated'));
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

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      category: material.category,
      subcategory: material.subcategory,
      quantity: material.quantity,
      isContainer: material.isContainer,
    });
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.category ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const response = await updateMaterialsById(editingMaterial.id, {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,

    });

    toast.success(t('materials.materialUpdated'));
    setEditingMaterial(null);
    resetForm();
  };

 


   const handleDelete = async (materialId: string) => {
    try {
      const response = await deleteMaterialsById(materialId);

      if (response) {
        toast.success(t('materials.materialDeleted'));
      } else {
        toast.error(t('materials.errorDeletingMaterial'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('materials.errorDeletingMaterial'));
    }
  };

  const handleAssignToVan = (materialId: string, vanId: string) => {
    assignMaterialToVan(materialId, vanId);
    toast.success('Material assigned to van successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'loaded':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'in_use':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'loaded':
        return 'secondary';
      case 'in_use':
        return 'outline';
      case 'maintenance':
        return 'destructive';
    }
  };

  const availableMaterials = materials.filter(m => m.status === 'available').length;
  const loadedMaterials = materials.filter(m => m.status === 'loaded').length;
  const inUseMaterials = materials.filter(m => m.status === 'in_use').length;
  const totalContainers = materials.filter(m => m.isContainer).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('materials.title')}</h2>
          <p className="text-muted-foreground">{t('materials.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('materials.addMaterial')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('materials.createMaterial')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('materials.materialName')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('materials.enterMaterialName')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="category">{t('common.category')}</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Tools, Electronics, Safety"
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="subcategory">{t('materials.subcategory')}</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder={t('materials.enterSubcategory')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="quantity">{t('common.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  placeholder={t('materials.enterQuantity')}
                  className="glass-panel"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isContainer"
                  checked={formData.isContainer}
                  onCheckedChange={(checked) => setFormData({ ...formData, isContainer: !!checked })}
                />
                <Label htmlFor="isContainer" className="text-sm">
                  {t('materials.isContainer')}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('materials.containerDescription')}
              </p>
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
                <p className="text-sm font-medium text-muted-foreground">{t('materials.available')}</p>
                <p className="text-2xl font-bold">{availableMaterials}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('materials.loadedInVans')}</p>
                <p className="text-2xl font-bold">{loadedMaterials}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('materials.inUse')}</p>
                <p className="text-2xl font-bold">{inUseMaterials}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('materials.containers')}</p>
                <p className="text-2xl font-bold">{totalContainers}</p>
              </div>
              <Box className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('materials.searchMaterials')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-panel"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? t('materials.allCategories') : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    {material.isContainer ? (
                      <Box className="h-6 w-6 text-primary" />
                    ) : (
                      <Package className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{material.name}</CardTitle>
                    <CardDescription>{material.category} • {material.subcategory}</CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => handleEdit(material)}>
                      <Edit className="h-4 w-4" />
                      {t('common.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2"
                      onClick={() => setShowQRCode(material.qrCode)}
                    >
                      <QrCode className="h-4 w-4" />
                      {t('materials.showQRCode')}
                    </DropdownMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <DropdownMenuItem className="gap-2" onSelect={(e) => e.preventDefault()}>
                          <Truck className="h-4 w-4" />
                          {t('materials.assignToVan')}
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left">
                        {vans.filter(v => v.status === 'active').map(van => (
                          <DropdownMenuItem 
                            key={van.id}
                            onClick={() => handleAssignToVan(material.id, van.id)}
                          >
                            {van.licensePlate}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="gap-2 text-destructive" onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('materials.confirmDelete')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(material.id)}>
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
              {/* Status and QR Code */}
              <div className="flex items-center justify-between">
                
                <Badge variant="outline" className="font-mono text-xs">
                  {material.qrCode}
                </Badge>
              </div>

              {/* Location and Assignment */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('common.location')}:</span>
                  <span>{material.location}</span>
                </div>
                
                {material.assignedVanPlate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Assigned Van:</span>
                    <Badge variant="outline">{material.assignedVanPlate}</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('common.quantity')}:</span>
                  <span>{material.quantity}</span>
                </div>
              </div>

              {/* Container Contents */}
              {material.isContainer && material.contents && material.contents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">{t('materials.contents')}:</h4>
                  <div className="space-y-1">
                    {material.contents.slice(0, 2).map((item, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {item}
                      </div>
                    ))}
                    {material.contents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{material.contents.length - 2} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Last Scanned */}
              {material.lastScanned && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('materials.lastScanned')}:</span>
                    <span>{material.lastScanned.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Display Modal */}
      {showQRCode && (
        <QRCodeDisplay
          qrCode={showQRCode}
          onClose={() => setShowQRCode(null)}
        />
      )}

      {/* Edit Material Dialog */}
      {editingMaterial && (
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('materials.editMaterial')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t('materials.materialName')}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('materials.enterMaterialName')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">{t('common.category')}</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Tools, Electronics, Safety"
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-subcategory">{t('materials.subcategory')}</Label>
                <Input
                  id="edit-subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  placeholder={t('materials.enterSubcategory')}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-quantity">{t('common.quantity')}</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  placeholder={t('materials.enterQuantity')}
                  className="glass-panel"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isContainer"
                  checked={formData.isContainer}
                  onCheckedChange={(checked) => setFormData({ ...formData, isContainer: !!checked })}
                />
                <Label htmlFor="edit-isContainer" className="text-sm">
                  {t('materials.isContainer')}
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMaterial(null)}>
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