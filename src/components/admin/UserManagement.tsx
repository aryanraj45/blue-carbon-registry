import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Shield, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  dateJoined: string;
  status: 'Pending Approval' | 'Approved' | 'Suspended';
  activityLevel: number;
  type: 'NGO' | 'Verifier';
  certifications?: string[];
  totalProjects?: number;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Ocean Conservation NGO',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@oceanconservation.org',
      dateJoined: '2024-01-15',
      status: 'Approved',
      activityLevel: 8,
      type: 'NGO',
      totalProjects: 12
    },
    {
      id: '2',
      name: 'Coastal Guardians',
      contactPerson: 'Mike Chen',
      email: 'mike@coastalguardians.org',
      dateJoined: '2024-01-20',
      status: 'Pending Approval',
      activityLevel: 0,
      type: 'NGO',
      totalProjects: 0
    },
    {
      id: '3',
      name: 'Dr. Maria Rodriguez',
      contactPerson: 'Dr. Maria Rodriguez',
      email: 'maria.rodriguez@university.edu',
      dateJoined: '2024-01-10',
      status: 'Approved',
      activityLevel: 15,
      type: 'Verifier',
      certifications: ['Marine Biology PhD', 'Carbon Assessment Certified'],
      totalProjects: 23
    },
    {
      id: '4',
      name: 'Dr. James Smith',
      contactPerson: 'Dr. James Smith',
      email: 'james.smith@research.org',
      dateJoined: '2024-01-25',
      status: 'Suspended',
      activityLevel: 5,
      type: 'Verifier',
      certifications: ['Environmental Science PhD'],
      totalProjects: 8
    }
  ]);

  const handleApproveUser = useCallback((userId: string) => {
    setUsers(prev => 
      prev.map(user => user.id === userId ? { ...user, status: 'Approved' } : user)
    );
    toast({
      title: "User Approved",
      description: "User has been successfully approved and can now access the platform.",
    });
  }, [toast]);

  const handleSuspendUser = useCallback((userId: string) => {
    setUsers(prev => 
      prev.map(user => user.id === userId ? { ...user, status: 'Suspended' } : user)
    );
    toast({
      title: "User Suspended", 
      description: "User access has been suspended.",
      variant: "destructive"
    });
  }, [toast]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success text-success-foreground';
      case 'Suspended': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  }, []);

  const filteredNGOs = useMemo(
    () => users.filter(user =>
      user.type === 'NGO' &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [users, searchTerm]
  );
  const filteredVerifiers = useMemo(
    () => users.filter(user =>
      user.type === 'Verifier' &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [users, searchTerm]
  );

  const UserTable = useCallback(({ userType }: { userType: 'NGO' | 'Verifier' }) => {
    const tableUsers = userType === 'NGO' ? filteredNGOs : filteredVerifiers;
    return (
      <div className="space-y-4">
        {tableUsers.map((user) => (
          <Card key={user.id} className="shadow-sm border border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      {userType === 'NGO'
                        ? <Users className="h-5 w-5 text-primary" />
                        : <Shield className="h-5 w-5 text-secondary" />
                      }
                      <h3 className="font-semibold text-foreground">{user.name}</h3>
                    </div>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{user.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date Joined</p>
                      <p className="font-medium">{user.dateJoined}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{userType === 'NGO' ? 'Projects Submitted' : 'Projects Reviewed'}</p>
                      <p className="font-medium">{user.totalProjects}</p>
                    </div>
                  </div>
                  {user.certifications && (
                    <div className="mt-3">
                      <p className="text-muted-foreground text-sm mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-2">
                        {user.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  {user.status === 'Pending Approval' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveUser(user.id)}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  {user.status === 'Approved' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSuspendUser(user.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [filteredNGOs, filteredVerifiers, getStatusColor, handleApproveUser, handleSuspendUser]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>User Management Hub</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ngos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ngos" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>NGOs & Communities</span>
              </TabsTrigger>
              <TabsTrigger value="verifiers" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Verifiers</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ngos" className="mt-6">
              <UserTable userType="NGO" />
            </TabsContent>
            <TabsContent value="verifiers" className="mt-6">
              <UserTable userType="Verifier" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
