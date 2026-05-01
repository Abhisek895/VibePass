import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle, Play, Square, Clock } from 'lucide-react';
import { AuditSession } from '@/lib/types/admin';

interface Props {
  userId: string;
  activeSession: AuditSession | null;
  onStart: (reason: string) => Promise<void>;
  onEnd: () => Promise<void>;
}

export const AuditTab: React.FC<Props> = ({ userId, activeSession, onStart, onEnd }) => {
  const [reason, setReason] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const isActive = !!activeSession;

  const handleStart = async () => {
    if (!reason.trim()) return;
    setIsStarting(true);
    try {
      await onStart(reason);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className={`border-2 ${isActive ? 'border-red-500/50 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <Shield className={isActive ? 'text-red-400' : 'text-amber-400'} />
            Super Admin Audit Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-sm leading-relaxed">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300 mb-1">High Privilege Access Required</p>
                <p className="text-slate-400">
                  Audit Mode is required to view sensitive user data including full chat transcripts, 
                  deleted messages, and system logs. All actions performed during this session are 
                  recorded and permanently linked to your admin account.
                </p>
              </div>
            </div>
          </div>

          {!isActive ? (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Reason for Audit</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Harassment investigation (Report #1234)"
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-sm focus:border-amber-500/50 outline-none min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleStart}
                disabled={!reason.trim() || isStarting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12"
              >
                <Play className="w-4 h-4 mr-2" />
                {isStarting ? 'Initializing Session...' : 'Start Audit Session'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                    <Lock className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-400">Session Active</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Started: {new Date(activeSession.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={onEnd}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <Square className="w-3 h-3 mr-2" />
                  End Session
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Session ID</div>
                  <div className="text-xs font-mono truncate">{activeSession.id}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">Status</div>
                  <div className="text-xs font-bold text-emerald-400">ENHANCED_ACCESS</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          All data access is logged under Audit ID: {activeSession?.id || 'PENDING'}
        </p>
      </div>
    </div>
  );
};
