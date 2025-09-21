import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, ExternalLink, Zap, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

//=========== TYPE DEFINITIONS ===========//
interface Project {
  id: string;
  name: string;
  ngoName: string;
  location: string; 
  dateSubmitted: string;
  aiRecommendation: 'Data Sufficient' | 'Field Visit Recommended' | 'In Review';
  status: 'Pending' | 'Approved' | 'Rejected' | 'More Info Requested';
  confidenceScore: number;
}
interface ProjectQueueTableProps {
  projects: Project[];
}

//=========== CUSTOM HOOK (IN-FILE) ===========//
// Debounces a value to prevent rapid state updates on every keystroke.
const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


//=========== SUB-COMPONENTS (IN-FILE) ===========//

// --- Memoized Table Row Component ---
// This prevents the entire table from re-rendering when only one row's state changes.
const ProjectRow = React.memo(({ project, onRowClick, onGenerateReport, isGenerating }: any) => {
  // Badge logic can be further componentized if needed, but is fine here for now.
  const getAIRecommendationBadge = () => { /* ... JSX from original file ... */ };
  const getStatusBadge = () => { /* ... JSX from original file ... */ };

  return (
    <TableRow key={project.id} className="hover:bg-muted/50">
      <TableCell className="font-medium cursor-pointer" onClick={() => onRowClick(project.id)}>
        <div>{project.name}</div>
        <div className="text-sm text-muted-foreground">ID: {project.id}</div>
      </TableCell>
      <TableCell>{project.ngoName}</TableCell>
      <TableCell>{project.location}</TableCell>
      <TableCell>{project.dateSubmitted}</TableCell>
      <TableCell>{getAIRecommendationBadge()}</TableCell>
      <TableCell>{getStatusBadge()}</TableCell>
      <TableCell>
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline" size="sm" className="w-32"
            disabled={isGenerating}
            onClick={(e) => { e.stopPropagation(); onGenerateReport(project); }}
          >
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Zap className="h-4 w-4 mr-2" />AI ANALYSIS</>}
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={(e) => { e.stopPropagation(); onRowClick(project.id); }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />View
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

// --- Memoized Table Filters Component ---
const TableFilters = React.memo(({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, aiFilter, setAiFilter }: any) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search projects, NGOs, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>{/* ... Select JSX from original file ... */}</Select>
                <Select value={aiFilter} onValueChange={setAiFilter}>{/* ... Select JSX from original file ... */}</Select>
            </div>
        </div>
    );
});


//=========== MAIN COMPONENT ===========//

const ProjectQueueTable: React.FC<ProjectQueueTableProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  // Debounce the search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  // Memoize the filtering logic so it only runs when inputs change
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(project => {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(lowercasedTerm) ||
        project.ngoName.toLowerCase().includes(lowercasedTerm) ||
        project.location.toLowerCase().includes(lowercasedTerm);
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesAI = aiFilter === 'all' || project.aiRecommendation === aiFilter;
      
      return matchesSearch && matchesStatus && matchesAI;
    });
  }, [projects, debouncedSearchTerm, statusFilter, aiFilter]);

  // Memoize event handlers to provide stable props to child components
  const handleProjectClick = useCallback((projectId: string) => {
    navigate(`/project/${projectId}`);
  }, [navigate]);

  const handleGenerateReport = useCallback(async (project: Project) => {
    setIsGenerating(project.id);
    setReportData(null);
    try {
        const response = await fetch('http://localhost:3001/api/automation/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Server error.');
        setReportData(data); 
    } catch (error) {
        toast({ title: "Automation Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
        setIsGenerating(null);
    }
  }, [toast]);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Verification Queue</span>
            <Badge variant="outline">{filteredProjects.length} Projects</Badge>
          </CardTitle>
          <TableFilters 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            aiFilter={aiFilter} setAiFilter={setAiFilter}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>{/* ... TableHeader JSX from original file ... */}</TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <ProjectRow 
                    key={project.id}
                    project={project}
                    onRowClick={handleProjectClick}
                    onGenerateReport={handleGenerateReport}
                    isGenerating={isGenerating === project.id}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={!!reportData} onOpenChange={() => setReportData(null)}>
        {/* ... Dialog JSX from original file ... */}
      </Dialog>
    </>
  );
};

export default ProjectQueueTable;