'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from './AuthContext';
import { toast } from 'sonner';

export interface Van {
  id: string;
  licensePlate: string;
  status: 'active' | 'maintenance' | 'inactive';
  assignedUserId?: string;
  assignedUserName?: string;
  loadCapacity: number;
  currentLoad: number;
  materials: string[];
  lastMaintenance: Date;
  nextMaintenance: Date;
  loadedMaterials: Material[];
}

export interface Material {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  qrCode: string;
  status: 'available' | 'loaded' | 'in_use' | 'maintenance';
  assignedVanId?: string;
  assignedVanPlate?: string;
  parentContainerId?: string;
  isContainer: boolean;
  contents?: string[];
  quantity: number;
  location: string;
  lastScanned?: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  assignedUserIds: string[];
  assignedUserNames: string[];
  assignedVanId?: string;
  assignedVanPlate?: string;
  location: string;
  status: 'scheduled' | 'loading' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  requiredMaterials: Material[];
  loadedMaterials: Material[];
}

interface DataContextType {
  // Users
  users: User[];
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Vans
  vans: Van[];
  createVan: (vanData: Omit<Van, 'id' | 'materials' | 'currentLoad' | 'lastMaintenance' | 'nextMaintenance' | 'loadedMaterials'>) => void;
  updateVan: (id: string, vanData: Partial<Van>) => void;
  deleteVan: (id: string) => void;
  assignUserToVan: (vanId: string, userId: string) => void;
  
  // Materials
  materials: Material[];
  createMaterial: (materialData: Omit<Material, 'id' | 'qrCode' | 'status' | 'location'>) => void;
  updateMaterial: (id: string, materialData: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  assignMaterialToVan: (materialId: string, vanId: string) => void;
  unassignMaterialFromVan: (materialId: string) => void;
  
  // Tasks
  tasks: Task[];
  createTask: (taskData: Omit<Task, 'id' | 'createdBy' | 'loadedMaterials'>, createdBy: string) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addMaterialToTask: (taskId: string, materialId: string) => void;
  removeMaterialFromTask: (taskId: string, materialId: string) => void;
  
  // Van Loading
  startVanLoading: (taskId: string) => void;
  loadMaterialToVan: (taskId: string, materialId: string) => void;
  unloadMaterialFromVan: (taskId: string, materialId: string) => void;
  confirmVanLoading: (taskId: string) => void;
  
  // Utility functions
  getUserById: (id: string) => User | undefined;
  getVanById: (id: string) => Van | undefined;
  getMaterialById: (id: string) => Material | undefined;
  getTaskById: (id: string) => Task | undefined;
  generateQRCode: () => string;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

// Initial mock data
const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@gesworx.com',
    name: 'Super Admin',
    role: 'superadmin',
    avatar: 'SA',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'manager@gesworx.com',
    name: 'Warehouse Manager',
    role: 'admin',
    avatar: 'WM',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'worker@gesworx.com',
    name: 'Field Worker',
    role: 'user',
    assignedVan: 'ABC-123',
    avatar: 'FW',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    email: 'sarah@gesworx.com',
    name: 'Sarah Wilson',
    role: 'user',
    assignedVan: 'DEF-456',
    avatar: 'SW',
    isActive: true,
    createdAt: new Date(),
  },
];

const initialVans: Van[] = [
  {
    id: '1',
    licensePlate: 'ABC-123',
    status: 'active',
    assignedUserId: '3',
    assignedUserName: 'Field Worker',
    loadCapacity: 100,
    currentLoad: 0,
    materials: [],
    loadedMaterials: [],
    lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    licensePlate: 'DEF-456',
    status: 'active',
    assignedUserId: '4',
    assignedUserName: 'Sarah Wilson',
    loadCapacity: 100,
    currentLoad: 0,
    materials: [],
    loadedMaterials: [],
    lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextMaintenance: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
  },
];

const initialMaterials: Material[] = [
  {
    id: '1',
    name: 'Power Drill Set',
    category: 'Tools',
    subcategory: 'Power Tools',
    qrCode: 'MAT-001',
    status: 'available',
    isContainer: false,
    quantity: 1,
    location: 'Warehouse',
  },
  {
    id: '2',
    name: 'Equipment Rack #1',
    category: 'Storage',
    subcategory: 'Racks',
    qrCode: 'RACK-001',
    status: 'available',
    isContainer: true,
    contents: ['Network Switch', 'Power Cables', 'Mounting Brackets'],
    quantity: 1,
    location: 'Warehouse',
  },
  {
    id: '3',
    name: 'Safety Equipment Kit',
    category: 'Safety',
    subcategory: 'PPE',
    qrCode: 'SAF-001',
    status: 'available',
    isContainer: false,
    quantity: 1,
    location: 'Warehouse',
  },
  {
    id: '4',
    name: 'Network Switch',
    category: 'Electronics',
    subcategory: 'Networking',
    qrCode: 'NET-001',
    status: 'available',
    isContainer: false,
    quantity: 1,
    location: 'Warehouse',
  },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Equipment Installation',
    description: 'Install networking equipment at client site',
    date: new Date(),
    startTime: '09:00',
    endTime: '12:00',
    assignedUserIds: ['3'],
    assignedUserNames: ['Field Worker'],
    assignedVanId: '1',
    assignedVanPlate: 'ABC-123',
    location: 'Client Site #1',
    status: 'scheduled',
    priority: 'high',
    createdBy: 'Super Admin',
    requiredMaterials: [],
    loadedMaterials: [],
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [vans, setVans] = useState<Van[]>(initialVans);
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Utility functions
  const generateQRCode = (): string => {
    const prefix = 'MAT';
    const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${number}`;
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const getVanById = (id: string) => vans.find(v => v.id === id);
  const getMaterialById = (id: string) => materials.find(m => m.id === id);
  const getTaskById = (id: string) => tasks.find(t => t.id === id);

  // User CRUD operations
  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    // Also remove user assignments from vans
    setVans(prev => prev.map(van => 
      van.assignedUserId === id 
        ? { ...van, assignedUserId: undefined, assignedUserName: undefined }
        : van
    ));
  };

  // Van CRUD operations
  const createVan = (vanData: Omit<Van, 'id' | 'materials' | 'currentLoad' | 'lastMaintenance' | 'nextMaintenance' | 'loadedMaterials'>) => {
    const newVan: Van = {
      ...vanData,
      id: Date.now().toString(),
      materials: [],
      loadedMaterials: [],
      currentLoad: 0,
      lastMaintenance: new Date(),
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };
    setVans(prev => [...prev, newVan]);
  };

  const updateVan = (id: string, vanData: Partial<Van>) => {
    setVans(prev => prev.map(van => 
      van.id === id ? { ...van, ...vanData } : van
    ));
  };

  const deleteVan = (id: string) => {
    const van = getVanById(id);
    if (van) {
      // Unassign materials from this van
      setMaterials(prev => prev.map(material => 
        material.assignedVanId === id 
          ? { 
              ...material, 
              assignedVanId: undefined, 
              assignedVanPlate: undefined,
              status: 'available',
              location: 'Warehouse'
            }
          : material
      ));
      
      // Remove user assignment
      if (van.assignedUserId) {
        setUsers(prev => prev.map(user => 
          user.id === van.assignedUserId 
            ? { ...user, assignedVan: undefined }
            : user
        ));
      }
    }
    setVans(prev => prev.filter(van => van.id !== id));
  };

  const assignUserToVan = (vanId: string, userId: string) => {
    const user = getUserById(userId);
    const van = getVanById(vanId);
    
    if (user && van) {
      // Update van with user assignment
      setVans(prev => prev.map(v => 
        v.id === vanId 
          ? { ...v, assignedUserId: userId, assignedUserName: user.name }
          : v
      ));
      
      // Update user with van assignment
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, assignedVan: van.licensePlate }
          : u
      ));
    }
  };

  // Material CRUD operations
  const createMaterial = (materialData: Omit<Material, 'id' | 'qrCode' | 'status' | 'location'>) => {
    const newMaterial: Material = {
      ...materialData,
      id: Date.now().toString(),
      qrCode: generateQRCode(),
      status: 'available',
      location: 'Warehouse',
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id: string, materialData: Partial<Material>) => {
    setMaterials(prev => prev.map(material => 
      material.id === id ? { ...material, ...materialData } : material
    ));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const assignMaterialToVan = (materialId: string, vanId: string) => {
    const van = getVanById(vanId);
    if (van) {
      setMaterials(prev => prev.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              assignedVanId: vanId,
              assignedVanPlate: van.licensePlate,
              status: 'loaded',
              location: `Van ${van.licensePlate}`,
              lastScanned: new Date()
            }
          : material
      ));
    }
  };

  const unassignMaterialFromVan = (materialId: string) => {
    setMaterials(prev => prev.map(material => 
      material.id === materialId 
        ? { 
            ...material, 
            assignedVanId: undefined,
            assignedVanPlate: undefined,
            status: 'available',
            location: 'Warehouse',
            lastScanned: new Date()
          }
        : material
    ));
  };

  // Task CRUD operations
  const createTask = (taskData: Omit<Task, 'id' | 'createdBy' | 'loadedMaterials'>, createdBy: string) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdBy,
      loadedMaterials: [],
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...taskData } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addMaterialToTask = (taskId: string, materialId: string) => {
    const material = getMaterialById(materialId);
    if (material) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              requiredMaterials: [...task.requiredMaterials, material]
            }
          : task
      ));
    }
  };

  const removeMaterialFromTask = (taskId: string, materialId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            requiredMaterials: task.requiredMaterials.filter(m => m.id !== materialId)
          }
        : task
    ));
  };

  // Van Loading Operations
  const startVanLoading = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'loading' }
        : task
    ));
  };

  const loadMaterialToVan = (taskId: string, materialId: string) => {
    const task = getTaskById(taskId);
    const material = getMaterialById(materialId);
    
    if (task && material && task.assignedVanId) {
      // Add material to task's loaded materials
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              loadedMaterials: [...t.loadedMaterials, material]
            }
          : t
      ));

      // Update material status and assignment
      assignMaterialToVan(materialId, task.assignedVanId);

      // Add material to van's loaded materials
      setVans(prev => prev.map(van => 
        van.id === task.assignedVanId 
          ? { 
              ...van, 
              loadedMaterials: [...van.loadedMaterials, material],
              currentLoad: Math.min(van.currentLoad + 10, 100) // Simplified load calculation
            }
          : van
      ));
    }
  };

  const unloadMaterialFromVan = (taskId: string, materialId: string) => {
    const task = getTaskById(taskId);
    
    if (task && task.assignedVanId) {
      // Remove material from task's loaded materials
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              loadedMaterials: t.loadedMaterials.filter(m => m.id !== materialId)
            }
          : t
      ));

      // Update material status
      unassignMaterialFromVan(materialId);

      // Remove material from van's loaded materials
      setVans(prev => prev.map(van => 
        van.id === task.assignedVanId 
          ? { 
              ...van, 
              loadedMaterials: van.loadedMaterials.filter(m => m.id !== materialId),
              currentLoad: Math.max(van.currentLoad - 10, 0) // Simplified load calculation
            }
          : van
      ));
    }
  };

  const confirmVanLoading = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'in_progress' }
        : task
    ));
  };

  return (
    <DataContext.Provider value={{
      users,
      createUser,
      updateUser,
      deleteUser,
      vans,
      createVan,
      updateVan,
      deleteVan,
      assignUserToVan,
      materials,
      createMaterial,
      updateMaterial,
      deleteMaterial,
      assignMaterialToVan,
      unassignMaterialFromVan,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      addMaterialToTask,
      removeMaterialFromTask,
      startVanLoading,
      loadMaterialToVan,
      unloadMaterialFromVan,
      confirmVanLoading,
      getUserById,
      getVanById,
      getMaterialById,
      getTaskById,
      generateQRCode,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);