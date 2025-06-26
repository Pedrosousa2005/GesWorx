'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  QrCode, 
  Camera, 
  Package, 
  Truck, 
  CheckCircle,
  AlertCircle,
  Scan
} from 'lucide-react';
import { toast } from 'sonner';

interface ScannedMaterial {
  qrCode: string;
  name: string;
  category: string;
  status: 'found' | 'not_found';
  currentVan?: string;
  action: 'load' | 'unload';
  timestamp: Date;
}

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [selectedVan, setSelectedVan] = useState('');
  const [scannedMaterials, setScannedMaterials] = useState<ScannedMaterial[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock material database
  const materialDatabase = {
    'MAT-001': { name: 'Power Drill Set', category: 'Tools', currentVan: 'ABC-123' },
    'RACK-001': { name: 'Equipment Rack #1', category: 'Storage', currentVan: 'DEF-456' },
    'NET-001': { name: 'Network Switch', category: 'Electronics', currentVan: null },
    'SAF-001': { name: 'Safety Equipment Kit', category: 'Safety', currentVan: null },
    'SRV-001': { name: 'Server Cabinet', category: 'Electronics', currentVan: null },
  };

  const vans = ['ABC-123', 'DEF-456', 'GHI-789', 'JKL-012'];

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        toast.success('Camera started. Point at a QR code to scan.');
      }
    } catch (error) {
      toast.error('Camera access denied. Please use manual input.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const processScan = (qrCode: string, action: 'load' | 'unload') => {
    const material = materialDatabase[qrCode as keyof typeof materialDatabase];
    
    if (material) {
      const scannedMaterial: ScannedMaterial = {
        qrCode,
        name: material.name,
        category: material.category,
        status: 'found',
        currentVan: material.currentVan || undefined,
        action,
        timestamp: new Date(),
      };
      
      setScannedMaterials(prev => [scannedMaterial, ...prev]);
      
      if (action === 'load') {
        toast.success(`${material.name} loaded to van ${selectedVan}`);
      } else {
        toast.success(`${material.name} unloaded from van ${material.currentVan}`);
      }
    } else {
      const scannedMaterial: ScannedMaterial = {
        qrCode,
        name: 'Unknown Material',
        category: 'Unknown',
        status: 'not_found',
        action,
        timestamp: new Date(),
      };
      
      setScannedMaterials(prev => [scannedMaterial, ...prev]);
      toast.error('Material not found in database');
    }
  };

  const handleManualScan = (action: 'load' | 'unload') => {
    if (!manualCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }
    
    if (action === 'load' && !selectedVan) {
      toast.error('Please select a van for loading');
      return;
    }
    
    processScan(manualCode.trim(), action);
    setManualCode('');
  };

  // Simulate QR code detection (in real app, use react-qr-reader)
  const simulateQRDetection = () => {
    const mockCodes = Object.keys(materialDatabase);
    const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
    processScan(randomCode, 'load');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">QR Code Scanner</h2>
          <p className="text-muted-foreground">Scan materials for loading and unloading</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>Use camera or manual input to scan materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Scanner */}
            <div className="space-y-4">
              <h3 className="font-medium">Camera Scanner</h3>
              
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse-slow">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-32 h-32 border-2 border-primary rounded-lg opacity-50"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={stopScanning} variant="outline" className="flex-1">
                      Stop Scanner
                    </Button>
                    <Button onClick={simulateQRDetection} className="flex-1">
                      Simulate Scan
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={startScanning} className="w-full gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera Scanner
                </Button>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="font-medium">Manual Input</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qr-code">QR Code</Label>
                  <Input
                    id="qr-code"
                    placeholder="Enter QR code (e.g., MAT-001)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="glass-panel font-mono"
                  />
                </div>
                
                <div>
                  <Label htmlFor="van-select">Target Van (for loading)</Label>
                  <select
                    id="van-select"
                    value={selectedVan}
                    onChange={(e) => setSelectedVan(e.target.value)}
                    className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                  >
                    <option value="">Select a van...</option>
                    {vans.map(van => (
                      <option key={van} value={van}>{van}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleManualScan('load')} 
                    className="flex-1 gap-2"
                    variant="default"
                  >
                    <Package className="h-4 w-4" />
                    Load Material
                  </Button>
                  <Button 
                    onClick={() => handleManualScan('unload')} 
                    className="flex-1 gap-2"
                    variant="outline"
                  >
                    <Truck className="h-4 w-4" />
                    Unload Material
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Scan History
            </CardTitle>
            <CardDescription>Recent QR code scans and actions</CardDescription>
          </CardHeader>
          <CardContent>
            {scannedMaterials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scans yet</p>
                <p className="text-sm">Start scanning materials to see history</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scannedMaterials.map((scan, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-lg p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {scan.status === 'found' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{scan.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{scan.category}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={scan.action === 'load' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {scan.action.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {scan.qrCode}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{scan.timestamp.toLocaleTimeString()}</span>
                      {scan.currentVan && (
                        <span>Van: {scan.currentVan}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common QR codes for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(materialDatabase).map(([code, material]) => (
              <Button
                key={code}
                variant="outline"
                className="p-4 h-auto flex flex-col gap-2"
                onClick={() => {
                  setManualCode(code);
                  toast.info(`QR code ${code} entered`);
                }}
              >
                <QrCode className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-mono text-xs">{code}</div>
                  <div className="text-xs text-muted-foreground">{material.name}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}