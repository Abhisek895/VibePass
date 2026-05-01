import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { AIUserInsight } from '@/lib/types/admin';
import { Brain, AlertCircle, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { useAnalyzeUser } from '@/hooks/use-admin-intelligence';

interface Props {
  insight?: AIUserInsight;
  isLoading: boolean;
  userId: string;
}

export const AIIntelligenceTab: React.FC<Props> = ({ insight, isLoading, userId }) => {
  const analyzeMutation = useAnalyzeUser();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const riskColor = {
    LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse',
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Risk Level</div>
            <Badge className={riskColor[insight?.riskLevel || 'LOW']}>
              <ShieldAlert className="w-3 h-3 mr-1" />
              {insight?.riskLevel || 'NOT ANALYZED'}
            </Badge>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">User Persona</div>
            <div className="text-lg font-bold flex items-center gap-2 text-violet-400">
              <Zap className="w-4 h-4" />
              {insight?.persona || 'ANALYZING...'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Engagement</div>
            <div className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              {insight?.engagementLevel || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Anomaly Status</div>
            <Badge variant={insight?.anomalyDetected ? 'danger' : 'success'}>
              {insight?.anomalyDetected ? 'Detected' : 'Clear'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action & Choice Perspective */}
        <Card className="md:col-span-2 bg-white/5 border-white/10 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-400" />
              Behavioral Matrix: Actions & Choices
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Behavioral Summary</div>
              <p className="text-sm leading-relaxed text-slate-300">
                {insight?.behaviorSummary || 'No summary generated yet.'}
              </p>
            </div>

            {insight?.analysisDetail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-1">Actions Taken</div>
                  <p className="text-xs text-white/60">{insight.analysisDetail.actions}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Choices Made</div>
                  <p className="text-xs text-white/60">{insight.analysisDetail.choices}</p>
                </div>
              </div>
            )}

            {insight?.intentSummary && (
              <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10">
                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">Psychological Profile</div>
                <div className="flex flex-wrap gap-2">
                  {insight.intentSummary.motivations?.map((m: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-violet-500/20 text-violet-300">
                      {m}
                    </Badge>
                  )) || <span className="text-xs text-white/40 italic">Determining primary motivations...</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/40">Primary Intent: <span className="text-white/80 font-bold">{insight.intentSummary.primary}</span></span>
                  <span className="text-xs text-white/40">Tone: <span className="text-white/80 font-bold">{insight.intentSummary.tone}</span></span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Recs */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="py-3 bg-red-500/10 border-b border-white/10">
              <CardTitle className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {insight?.alerts.map((alert, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    {alert}
                  </li>
                )) || <li className="text-xs text-muted-foreground italic">No alerts detected</li>}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="py-3 bg-emerald-500/10 border-b border-white/10">
              <CardTitle className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" /> Recommended Action
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-sm font-bold text-slate-200">
                {insight?.recommendation?.nextStep || 'No recommendations'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Priority: {insight?.recommendation?.urgency || 'Normal'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => analyzeMutation.mutate(userId)}
          disabled={analyzeMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Brain className="w-4 h-4 mr-2" />
          {analyzeMutation.isPending ? 'Analyzing...' : 'Regenerate AI Insight'}
        </Button>
      </div>
    </div>
  );
};
