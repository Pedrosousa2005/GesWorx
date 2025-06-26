'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Truck, 
  Package, 
  QrCode, 
  CheckCircle, 
  Plus,
  Minus,
  Search,
  ArrowRight,
  ArrowLeft,
  Loader,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type LoadingStep = 'select-task' | 'loading' | 'confirm';

export function VanLoadingInterface() {
  const { tasks, materials, vans, startVanLoading, loadMaterialToVan, unloadMaterialFromVan, confirmVanLoading } = useData();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<LoadingStep>('select-task');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');

  // Filter tasks that are scheduled or loading and have assigned vans
  const availableTasks = tasks.filter(task => 
    (task.status === 'scheduled' || task.status === 'loading') && 
    task.assignedVanId
  );

  // Get available materials for loading
  const availableMaterials = materials.filter(material => 
    material.status === 'available' && 
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    startVanLoading(task.id);
    setCurrentStep('loading');
    toast.success(`Started loading process for task: ${task.title}`);
  };

  const handleLoadMaterial = (materialId: string) => {
    if (selectedTask) {
      loadMaterialToVan(selectedTask.id, materialId);
      toast.success('Material loaded to van');
    }
  };

  const handleUnloadMaterial = (materialId: string) => {
    if (selectedTask) {
      unloadMaterialFromVan(selectedTask.id, materialId);
      toast.success('Material unloaded from van');
    }
  };

  const handleScanQRCode = () => {
    if (!manualQRCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    const material = materials.find(m => m.qrCode === manualQRCode.trim());
    if (material) {
      if (material.status === 'available') {
        handleLoadMaterial(material.id);
      } else if (material.status === 'loaded' && selectedTask?.loadedMaterials.some((m: any) => m.id === material.id)) {
        handleUnloadMaterial(material.id);
      } else {
        toast.error('Material not available for loading/unloading');
      }
    } else {
      toast.error('Material not found');
    }
    setManualQRCode('');
  };

  const handleConfirmLoading = () => {
    if (selectedTask) {
      confirmVanLoading(selectedTask.id);
      toast.success('Van loading confirmed. Task is now in progress.');
      setCurrentStep('confirm');
    }
  };

  const handleStartNewLoading = () => {
    setSelectedTask(null);
    setCurrentStep('select-task');
    setSearchTerm('');
    setManualQRCode('');
  };

  const getSelectedVan = () => {
    return selectedTask ? vans.find(v => v.id === selectedTask.assignedVanId) : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('dashboard.vanLoading')}</h2>
          <p className="text-muted-foreground">Mobile-optimized van loading interface</p>
        </div>
        {currentStep !== 'select-task' && (
          <Button variant="outline" onClick={handleStartNewLoading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start New Loading
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${currentStep === 'select-task' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select-task' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="font-medium">Select Task</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${currentStep === 'loading' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'loading' ? 'bg-primary text-primary-foreground' : currentStep === 'confirm' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                {currentStep === 'confirm' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium">Load Materials</span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${currentStep === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {currentStep === 'confirm' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span className="font-medium">Confirm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Task */}
      {currentStep === 'select-task' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTasks.length === 0 ? (
            <Card className="glass-card col-span-full">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tasks Available</h3>
                  <p className="text-muted-foreground">No scheduled tasks with assigned vans found.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            availableTasks.map((task) => {
              const van = vans.find(v => v.id === task.assignedVanId);
              return (
                <Card key={task.id} className="glass-card cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleSelectTask(task)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant={task.status === 'loading' ? 'secondary' : 'default'}>
                        {task.status === 'loading' ? 'Loading' : 'Scheduled'}
                      </Badge>
                    </div>
                    <CardDescription>{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Van: {van?.licensePlate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{task.loadedMaterials.length} materials loaded</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task.date.toLocaleDateString()} • {task.startTime} - {task.endTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Step 2: Loading Materials */}
      {currentStep === 'loading' && selectedTask && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Van Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Van {getSelectedVan()?.licensePlate}
              </CardTitle>
              <CardDescription>Loading materials for: {selectedTask.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Load Progress:</span>
                  <span>{getSelectedVan()?.currentLoad}%</span>
                </div>
                <Progress value={getSelectedVan()?.currentLoad || 0} className="h-2" />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Loaded Materials ({selectedTask.loadedMaterials.length})</h4>
                {selectedTask.loadedMaterials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No materials loaded yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTask.loadedMaterials.map((material: any) => (
                      <div key={material.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="text-sm">{material.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnloadMaterial(material.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button 
                  onClick={handleConfirmLoading} 
                  className="w-full"
                  disabled={selectedTask.loadedMaterials.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Loading & Start Task
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Material Selection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Materials
              </CardTitle>
              <CardDescription>Add materials to the van</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Scanner */}
              <div className="space-y-3">
                <h4 className="font-medium">QR Code Scanner</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter QR code (e.g., MAT-001)"
                    value={manualQRCode}
                    onChange={(e) => setManualQRCode(e.target.value)}
                    className="glass-panel font-mono"
                  />
                  <Button onClick={handleScanQRCode}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="space-y-3">
                <h4 className="font-medium">Manual Selection</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-panel"
                  />
                </div>
              </div>

              {/* Material List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableMaterials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">{material.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {material.category} • {material.qrCode}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLoadMaterial(material.id)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 'confirm' && selectedTask && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Loading Complete!</h3>
              <p className="text-muted-foreground">
                Van {getSelectedVan()?.licensePlate} has been loaded with {selectedTask.loadedMaterials.length} materials for task "{selectedTask.title}".
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={handleStartNewLoading}>
                  Load Another Van
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}