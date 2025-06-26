'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Printer as Print } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: string;
  onClose: () => void;
}

export function QRCodeDisplay({ qrCode, onClose }: QRCodeDisplayProps) {
  // Generate a simple text-based QR representation for demo
  // In a real app, you'd use a QR code library like qrcode
  const generateQRPattern = (text: string) => {
    const size = 21; // Standard QR code minimum size
    const pattern = [];
    
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Create a pseudo-random pattern based on the text and position
        const seed = text.charCodeAt(j % text.length) + i * j;
        row.push(seed % 2 === 0);
      }
      pattern.push(row);
    }
    
    return pattern;
  };

  const qrPattern = generateQRPattern(qrCode);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code: {qrCode}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="grid grid-cols-21 gap-px" style={{ gridTemplateColumns: 'repeat(21, 1fr)' }}>
                {qrPattern.flat().map((cell, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 ${cell ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
              <div className="text-center mt-2 text-black text-sm font-mono">
                {qrCode}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="gap-2">
              <Print className="h-4 w-4" />
              Print
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Scan this QR code to quickly identify and track this material.</p>
            <p>Use your mobile device or QR scanner to load/unload materials.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}