'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Truck,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

export function CalendarView() {
  const { user, hasPermission } = useAuth();
  const { tasks, users, vans, materials, createTask, updateTask, deleteTask, addMaterialToTask, removeMaterialFromTask } = useData();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    assignedUserIds: [] as string[],
    assignedVanId: '',
    location: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    requiredMaterialIds: [] as string[],
  });

  // Filter tasks based on user role
  const filteredTasks = tasks.filter(task => {
    if (user?.role === 'user') {
      return task.assignedUserIds.includes(user.id);
    }
    return true; // Admins and super admins see all tasks
  });

  // Get tasks for selected date
  const selectedDateTasks = filteredTasks.filter(task => 
    isSameDay(task.date, selectedDate)
  );

  // Get days with tasks for calendar highlighting
  const daysWithTasks = filteredTasks.map(task => task.date);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      assignedUserIds: [],
      assignedVanId: '',
      location: '',
      priority: 'medium',
      requiredMaterialIds: [],
    });
  };

  const handleCreate = () => {
    if (!formData.title || !formData.description || formData.assignedUserIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const assignedUserNames = formData.assignedUserIds.map(id => 
      users.find(u => u.id === id)?.name || ''
    ).filter(Boolean);

    const assignedVan = formData.assignedVanId ? vans.find(v => v.id === formData.assignedVanId) : undefined;
    const requiredMaterials = formData.requiredMaterialIds.map(id => 
      materials.find(m => m.id === id)
    ).filter(Boolean) as any[];

    createTask({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      assignedUserIds: formData.assignedUserIds,
      assignedUserNames,
      assignedVanId: formData.assignedVanId || undefined,
      assignedVanPlate: assignedVan?.licensePlate,
      location: formData.location,
      status: 'scheduled',
      priority: formData.priority,
      requiredMaterials,
    }, user?.name || 'Unknown');

    toast.success(t('calendar.taskCreated'));
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
      assignedUserIds: task.assignedUserIds,
      assignedVanId: task.assignedVanId || '',
      location: task.location,
      priority: task.priority,
      requiredMaterialIds: task.requiredMaterials?.map((m: any) => m.id) || [],
    });
  };

  const handleUpdate = () => {
    if (!formData.title || !formData.description || formData.assignedUserIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const assignedUserNames = formData.assignedUserIds.map(id => 
      users.find(u => u.id === id)?.name || ''
    ).filter(Boolean);

    const assignedVan = formData.assignedVanId ? vans.find(v => v.id === formData.assignedVanId) : undefined;
    const requiredMaterials = formData.requiredMaterialIds.map(id => 
      materials.find(m => m.id === id)
    ).filter(Boolean) as any[];

    updateTask(editingTask.id, {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      assignedUserIds: formData.assignedUserIds,
      assignedUserNames,
      assignedVanId: formData.assignedVanId || undefined,
      assignedVanPlate: assignedVan?.licensePlate,
      location: formData.location,
      priority: formData.priority,
      requiredMaterials,
    });

    toast.success(t('calendar.taskUpdated'));
    setEditingTask(null);
    resetForm();
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    toast.success(t('calendar.taskDeleted'));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'loading':
        return 'secondary';
      case 'in_progress':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
    }
  };

  // For users, show only their assigned tasks with limited information
  if (user?.role === 'user') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{t('calendar.title')}</h2>
          <p className="text-muted-foreground">{t('calendar.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="glass-card lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  hasTask: daysWithTasks,
                }}
                modifiersStyles={{
                  hasTask: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '50%',
                  },
                }}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* User Tasks */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Your Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription>
                {selectedDateTasks.length} {t('calendar.tasksScheduled')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('calendar.noTasks')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            {task.priority === 'high' ? t('calendar.high') : 
                             task.priority === 'medium' ? t('calendar.medium') : t('calendar.low')}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {task.status === 'scheduled' ? t('calendar.scheduled') :
                             task.status === 'loading' ? 'Loading' :
                             task.status === 'in_progress' ? t('calendar.inProgress') :
                             task.status === 'completed' ? t('calendar.completed') : task.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{task.startTime} - {task.endTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{task.location}</span>
                        </div>
                      </div>

                      {task.assignedVanPlate && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>Van: {task.assignedVanPlate}</span>
                        </div>
                      )}

                      {/* Show materials for the user */}
                      {task.requiredMaterials && task.requiredMaterials.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Required Materials ({task.requiredMaterials.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {task.requiredMaterials.map((material: any) => (
                              <div key={material.id} className="text-xs bg-white/5 rounded p-2">
                                <div className="font-medium">{material.name}</div>
                                <div className="text-muted-foreground">{material.category} • {material.qrCode}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show loaded materials status */}
                      {task.loadedMaterials && task.loadedMaterials.length > 0 && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ {task.loadedMaterials.length} materials loaded in van
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin and Super Admin view (full functionality)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('calendar.title')}</h2>
          <p className="text-muted-foreground">{t('calendar.subtitleAdmin')}</p>
        </div>
        {hasPermission('manage_tasks') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('calendar.addTask')}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('calendar.createTask')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">{t('calendar.taskTitle')}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={t('calendar.enterTaskTitle')}
                      className="glass-panel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">{t('common.location')}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter location"
                      className="glass-panel"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">{t('common.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('calendar.enterDescription')}
                    className="glass-panel"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">{t('calendar.startTime')}</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="glass-panel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">{t('calendar.endTime')}</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="glass-panel"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedUsers">{t('calendar.assignedUser')}</Label>
                    <select
                      id="assignedUsers"
                      multiple
                      value={formData.assignedUserIds}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData({ ...formData, assignedUserIds: selectedOptions });
                      }}
                      className="w-full p-2 rounded-md bg-background border border-input glass-panel min-h-[100px]"
                    >
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="assignedVan">Assigned Van</Label>
                    <select
                      id="assignedVan"
                      value={formData.assignedVanId}
                      onChange={(e) => setFormData({ ...formData, assignedVanId: e.target.value })}
                      className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                    >
                      <option value="">Select a van...</option>
                      {vans.filter(v => v.status === 'active').map(van => (
                        <option key={van.id} value={van.id}>{van.licensePlate}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">{t('calendar.priority')}</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                    >
                      <option value="low">{t('calendar.low')}</option>
                      <option value="medium">{t('calendar.medium')}</option>
                      <option value="high">{t('calendar.high')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="requiredMaterials">Required Materials</Label>
                    <select
                      id="requiredMaterials"
                      multiple
                      value={formData.requiredMaterialIds}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData({ ...formData, requiredMaterialIds: selectedOptions });
                      }}
                      className="w-full p-2 rounded-md bg-background border border-input glass-panel min-h-[100px]"
                    >
                      {materials.filter(m => m.status === 'available').map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.qrCode})
                        </option>
                      ))}
                    </select>
                  </div>
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
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasTask: daysWithTasks,
              }}
              modifiersStyles={{
                hasTask: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%',
                },
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Tasks for Selected Date */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t('calendar.tasksFor')} {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>
              {selectedDateTasks.length} {t('calendar.tasksScheduled')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('calendar.noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                          {task.priority === 'high' ? t('calendar.high') : 
                           task.priority === 'medium' ? t('calendar.medium') : t('calendar.low')}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status === 'scheduled' ? t('calendar.scheduled') :
                           task.status === 'loading' ? 'Loading' :
                           task.status === 'in_progress' ? t('calendar.inProgress') :
                           task.status === 'completed' ? t('calendar.completed') : task.status}
                        </Badge>
                        {hasPermission('manage_tasks') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => handleEdit(task)}>
                                <Edit className="h-4 w-4" />
                                {t('common.edit')}
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
                                    <AlertDialogTitle>{t('calendar.confirmDelete')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(task.id)}>
                                      {t('common.delete')}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.startTime} - {task.endTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{task.assignedUserNames.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{task.location}</span>
                      </div>
                    </div>

                    {task.assignedVanPlate && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>Van: {task.assignedVanPlate}</span>
                      </div>
                    )}

                    {/* Show required materials */}
                    {task.requiredMaterials && task.requiredMaterials.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Required Materials ({task.requiredMaterials.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {task.requiredMaterials.slice(0, 4).map((material: any) => (
                            <div key={material.id} className="text-xs bg-white/5 rounded p-2">
                              <div className="font-medium">{material.name}</div>
                              <div className="text-muted-foreground">{material.category} • {material.qrCode}</div>
                            </div>
                          ))}
                          {task.requiredMaterials.length > 4 && (
                            <div className="text-xs text-muted-foreground">
                              +{task.requiredMaterials.length - 4} more materials
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Show loading status */}
                    {task.loadedMaterials && task.loadedMaterials.length > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        ✓ {task.loadedMaterials.length} materials loaded in van
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {filteredTasks.filter(t => t.status === 'scheduled').length}
              </p>
              <p className="text-sm text-muted-foreground">{t('calendar.scheduled')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {filteredTasks.filter(t => t.status === 'loading').length}
              </p>
              <p className="text-sm text-muted-foreground">Loading</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {filteredTasks.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">{t('calendar.inProgress')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {filteredTasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">{t('calendar.completed')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('calendar.editTask')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">{t('calendar.taskTitle')}</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('calendar.enterTaskTitle')}
                    className="glass-panel"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">{t('common.location')}</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="glass-panel"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">{t('common.description')}</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('calendar.enterDescription')}
                  className="glass-panel"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-startTime">{t('calendar.startTime')}</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="glass-panel"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-endTime">{t('calendar.endTime')}</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="glass-panel"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-assignedUsers">{t('calendar.assignedUser')}</Label>
                  <select
                    id="edit-assignedUsers"
                    multiple
                    value={formData.assignedUserIds}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, assignedUserIds: selectedOptions });
                    }}
                    className="w-full p-2 rounded-md bg-background border border-input glass-panel min-h-[100px]"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="edit-assignedVan">Assigned Van</Label>
                  <select
                    id="edit-assignedVan"
                    value={formData.assignedVanId}
                    onChange={(e) => setFormData({ ...formData, assignedVanId: e.target.value })}
                    className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                  >
                    <option value="">Select a van...</option>
                    {vans.filter(v => v.status === 'active').map(van => (
                      <option key={van.id} value={van.id}>{van.licensePlate}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">{t('calendar.priority')}</Label>
                  <select
                    id="edit-priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                  >
                    <option value="low">{t('calendar.low')}</option>
                    <option value="medium">{t('calendar.medium')}</option>
                    <option value="high">{t('calendar.high')}</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="edit-requiredMaterials">Required Materials</Label>
                  <select
                    id="edit-requiredMaterials"
                    multiple
                    value={formData.requiredMaterialIds}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({ ...formData, requiredMaterialIds: selectedOptions });
                    }}
                    className="w-full p-2 rounded-md bg-background border border-input glass-panel min-h-[100px]"
                  >
                    {materials.filter(m => m.status === 'available').map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.qrCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingTask(null)}>
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