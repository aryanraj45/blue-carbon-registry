import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shimmer, ShimmerSkeleton } from '@/components/ui/shimmer';
import { CheckCircle, Brain, FileText, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'completed' | 'failed' | 'warning' | 'pending';
  description?: string;
}

interface AIAnalysisTabProps {
  projectId: string;
  aiNarrativeSummary: string;
  checklistItems: ChecklistItem[];
  onUpdateChecklist: (items: ChecklistItem[]) => void;
  isLoadingInsights?: boolean;
  insights?: string[];
}

const AIAnalysisTab: React.FC<AIAnalysisTabProps> = ({
  aiNarrativeSummary,
  checklistItems,
  onUpdateChecklist,
  isLoadingInsights = false,
  insights = [],
}) => {
  const [editableItems, setEditableItems] = useState(checklistItems);
  const [notes, setNotes] = useState('');

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-secondary" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-success text-success-foreground">Verified</Badge>;
      case 'failed': return <Badge variant="destructive">Issues Found</Badge>;
      case 'warning': return <Badge variant="secondary">Needs Review</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  }, []);

  const toggleChecklistItem = useCallback(
    (id: string) => {
      const updatedItems = editableItems.map(item => {
        if (item.id === id) {
          let newStatus: ChecklistItem['status'];
          switch (item.status) {
            case 'pending': newStatus = 'completed'; break;
            case 'completed': newStatus = 'warning'; break;
            case 'warning': newStatus = 'failed'; break;
            default: newStatus = 'pending';
          }
          return { ...item, status: newStatus };
        }
        return item;
      });
      setEditableItems(updatedItems);
      onUpdateChecklist(updatedItems);
    },
    [editableItems, onUpdateChecklist]
  );

  const completedCount = useMemo(
    () => editableItems.filter(item => item.status === 'completed').length,
    [editableItems]
  );

  return (
    <div className="space-y-6">
      {/* AI Narrative Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span>AI Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-foreground leading-relaxed">{aiNarrativeSummary}</p>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights with Shimmer Effect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingInsights ? (
            <div className="space-y-3">
              <Shimmer>
                <ShimmerSkeleton className="h-4 w-full" />
              </Shimmer>
              <Shimmer>
                <ShimmerSkeleton className="h-4 w-3/4" />
              </Shimmer>
              <Shimmer>
                <ShimmerSkeleton className="h-4 w-5/6" />
              </Shimmer>
            </div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Shimmer key={index} className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                </Shimmer>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No insights available yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Verification Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span>Verification Checklist</span>
            <Badge variant="outline">{completedCount} / {editableItems.length} Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editableItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <button onClick={() => toggleChecklistItem(item.id)} className="mt-1">
                  {getStatusIcon(item.status)}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">{item.label}</h4>
                    {getStatusBadge(item.status)}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verifier Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Verifier Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add your verification notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px]"
          />
          <Button className="mt-3" variant="outline">
            Save Notes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisTab;
