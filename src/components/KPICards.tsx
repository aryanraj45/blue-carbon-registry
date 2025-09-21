import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, MapPin, CheckCircle, BarChart3 } from 'lucide-react';

interface KPIData {
  projectsPending: number;
  projectsRequiringVisit: number;
  approvedLast30Days: number;
  totalHectaresVerified: number;
}

interface KPICardsProps {
  data: KPIData;
}

const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Projects Pending Review
          </CardTitle>
          <Eye className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{data.projectsPending}</div>
          <Badge variant="outline" className="mt-1">
            In Queue
          </Badge>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-secondary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Field Visits Required
          </CardTitle>
          <MapPin className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{data.projectsRequiringVisit}</div>
          <Badge variant="secondary" className="mt-1">
            AI Flagged
          </Badge>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-success/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Approved (Last 30 Days)
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{data.approvedLast30Days}</div>
          <Badge className="mt-1 bg-success text-success-foreground">
            Verified
          </Badge>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-accent/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Hectares Verified
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {data.totalHectaresVerified.toLocaleString()}
          </div>
          <Badge variant="outline" className="mt-1">
            All Time
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;