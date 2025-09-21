import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Search, 
  Flag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  projectName: string;
  ngoName: string;
  assignedVerifier: string;
  dateSubmitted: string;
  aiScore: number;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Admin Hold' | 'Minted';
  carbonValue: number;
  location: string;
}

const ProjectOversight = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifierFilter, setVerifierFilter] = useState('all');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1847',
      projectName: 'Mangrove Restoration Project',
      ngoName: 'Ocean Conservation NGO',
      assignedVerifier: 'Dr. Maria Rodriguez',
      dateSubmitted: '2024-01-15',
      aiScore: 65,
      status: 'Under Review',
      carbonValue: 150,
      location: '-1.2921, 36.8219'
    },
    {
      id: '1848',
      projectName: 'Seagrass Restoration Initiative',
      ngoName: 'Blue Ocean Trust',
      assignedVerifier: 'Dr. James Smith',
      dateSubmitted: '2024-01-12',
      aiScore: 92,
      status: 'Approved',
      carbonValue: 200,
      location: '2.0469, 45.3182'
    },
    {
      id: '1849',
      projectName: 'Coastal Wetland Protection',
      ngoName: 'Marine Life Foundation',
      assignedVerifier: 'Dr. Maria Rodriguez',
      dateSubmitted: '2024-01-10',
      aiScore: 88,
      status: 'Minted',
      carbonValue: 180,
      location: '-4.0435, 39.6682'
    },
    {
      id: '1850',
      projectName: 'Kelp Forest Conservation',
      ngoName: 'Coastal Guardians',
      assignedVerifier: 'Dr. James Smith',
      dateSubmitted: '2024-01-18',
      aiScore: 45,
      status: 'Admin Hold',
      carbonValue: 120,
      location: '36.7783, -119.4179'
    }
  ]);

  const verifiers = useMemo(
    () => ['Dr. Maria Rodriguez', 'Dr. James Smith', 'Dr. Emily Chen'],
    []
  );

  const handleReassignProject = useCallback((projectId: string, newVerifier: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, assignedVerifier: newVerifier }
          : project
      )
    );
    toast({
      title: "Project Reassigned",
      description: `Project #${projectId} has been reassigned to ${newVerifier}`,
    });
  }, [toast]);

  const handleFlagForAudit = useCallback((projectId: string) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, status: 'Admin Hold' as const }
          : project
      )
    );
    toast({
      title: "Project Flagged for Audit",
      description: `Project #${projectId} has been placed on admin hold`,
      variant: "destructive"
    });
  }, [toast]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success text-success-foreground';
      case 'Minted': return 'bg-primary text-primary-foreground';
      case 'Admin Hold': return 'bg-destructive text-destructive-foreground';
      case 'Under Review': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  }, []);

  const getAIScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  }, []);

  const filteredProjects = useMemo(() =>
    projects.filter(project => {
      const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesVerifier = verifierFilter === 'all' || project.assignedVerifier === verifierFilter;
      return matchesSearch && matchesStatus && matchesVerifier;
    })
  , [projects, searchTerm, statusFilter, verifierFilter]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-primary" />
              <span>Project Oversight & Audit Module</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Admin Hold">Admin Hold</SelectItem>
                <SelectItem value="Minted">Minted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifierFilter} onValueChange={setVerifierFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Verifier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verifiers</SelectItem>
                {verifiers.map(verifier => (
                  <SelectItem key={verifier} value={verifier}>{verifier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Table */}
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="shadow-sm border border-border hover:bg-muted/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <h3 className="font-semibold text-foreground mb-1">
                          #{project.id} - {project.projectName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{project.ngoName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Assigned Verifier</p>
                        <p className="font-medium text-foreground">{project.assignedVerifier}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date Submitted</p>
                        <p className="font-medium text-foreground">{project.dateSubmitted}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">AI Score</p>
                        <p className={`font-bold ${getAIScoreColor(project.aiScore)}`}>{project.aiScore}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Select onValueChange={(newVerifier) => handleReassignProject(project.id, newVerifier)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Reassign" />
                        </SelectTrigger>
                        <SelectContent>
                          {verifiers.filter(v => v !== project.assignedVerifier).map(verifier => (
                            <SelectItem key={verifier} value={verifier}>{verifier}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {project.status !== 'Admin Hold' && project.status !== 'Minted' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleFlagForAudit(project.id)}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag for Audit
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Carbon Value: {project.carbonValue} tonnes CO₂</span>
                      <span>Location: {project.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOversight;
