import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 animate-pulse-slow mx-auto" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold gradient-text">GESWORX</h2>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
}