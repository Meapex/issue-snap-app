
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  CheckCircle,
  FileText,
  Loader2,
  LogOut,
  Newspaper,
} from 'lucide-react';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ResolveComplaintModal } from '@/components/resolve-complaint-modal';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type Complaint = {
  id: string;
  issue: string;
  location_description: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Denied';
  image_url: string;
  created_at: string;
  latitude: number;
  longitude: number;
  category: string;
  department: string;
  resolution_image_url: string | null;
  resolved_at: string | null;
};

function formatDate(dateString: string | null) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const chartConfig = {
  complaints: {
    label: 'Complaints',
  },
  Pothole: {
    label: 'Pothole',
    color: 'hsl(var(--chart-1))',
  },
  Graffiti: {
    label: 'Graffiti',
    color: 'hsl(var(--chart-2))',
  },
  Trash: {
    label: 'Trash',
    color: 'hsl(var(--chart-3))',
  },
  'Broken Streetlight': {
    label: 'Broken Streetlight',
    color: 'hsl(var(--chart-4))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export default function EmployeeDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [complaintToDeny, setComplaintToDeny] = useState<Complaint | null>(
    null
  );
  const [isDenying, setIsDenying] = useState(false);

  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/employee/login');
  };

  useEffect(() => {
    setIsMounted(true);
    const fetchComplaints = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints:', error);
      } else {
        setComplaints(data as Complaint[]);
      }
      setLoading(false);
    };

    fetchComplaints();
  }, [supabase]);

  const handleComplaintResolved = (updatedComplaint: Complaint) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    setSelectedComplaint(null);
  };

  const handleDenyComplaint = async () => {
    if (!complaintToDeny) return;

    setIsDenying(true);
    const { error } = await supabase
      .from('complaints')
      .update({ status: 'Denied' })
      .eq('id', complaintToDeny.id);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to deny the complaint. Please try again.',
      });
    } else {
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintToDeny.id ? { ...c, status: 'Denied' } : c
        )
      );
      toast({
        title: 'Complaint Denied',
        description: `Complaint has been marked as denied.`,
      });
    }
    setIsDenying(false);
    setComplaintToDeny(null);
  };

  const { totalComplaints, newComplaints, resolvedComplaints, chartData, statusChartData } =
    useMemo(() => {
      const categoryCounts = complaints.reduce((acc, complaint) => {
        const category = complaint.category || 'Other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(categoryCounts)
        .map(([name, total]) => ({
          name,
          complaints: total,
          fill: `var(--color-${name.replace(' ', '')})`,
        }))
        .sort((a, b) => b.complaints - a.complaints);
      
      const newCount = complaints.filter((c) => c.status === 'New').length;
      const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
      const deniedCount = complaints.filter((c) => c.status === 'Denied').length;
      const inProgressCount = complaints.length - newCount - resolvedCount - deniedCount;


      const statusChartData = [
          { status: 'New', count: newCount, fill: 'hsl(var(--chart-2))' },
          { status: 'In Progress', count: inProgressCount, fill: 'hsl(var(--chart-4))' },
          { status: 'Resolved', count: resolvedCount, fill: 'hsl(var(--chart-1))' },
          { status: 'Denied', count: deniedCount, fill: 'hsl(var(--destructive))' },
      ]

      return {
        totalComplaints: complaints.length,
        newComplaints: newCount,
        resolvedComplaints: resolvedCount,
        chartData,
        statusChartData,
      };
    }, [complaints]);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading complaints...</p>
      </main>
    );
  }

  return (
    <>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Complaints Dashboard
            </h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Complaints
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalComplaints}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Complaints</CardTitle>
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newComplaints}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolved Complaints
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedComplaints}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview by Category</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="complaints"
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="col-span-4 md:col-span-3">
              <CardHeader>
                <CardTitle>Complaints by Status</CardTitle>
                <CardDescription>
                  Distribution of new, in-progress, and resolved complaints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={statusChartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>
                Here are the latest issues reported by users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue Photo</TableHead>
                    <TableHead>Resolution Photo</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Resolved At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Image
                          src={complaint.image_url}
                          alt={complaint.issue}
                          width={100}
                          height={66}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        {complaint.resolution_image_url ? (
                          <Image
                            src={complaint.resolution_image_url}
                            alt={`Resolution for ${complaint.issue}`}
                            width={100}
                            height={66}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-[100px] h-[66px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            Not Resolved
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {complaint.issue}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {complaint.category || 'Other'}
                        </Badge>
                      </TableCell>
                      <TableCell>{complaint.department || 'N/A'}</TableCell>
                      <TableCell>
                        {complaint.location_description}
                      </TableCell>
                      {isMounted ? (
                        <TableCell>{formatDate(complaint.created_at)}</TableCell>
                      ) : null}
                      {isMounted ? (
                        <TableCell>{formatDate(complaint.resolved_at)}</TableCell>
                      ) : null}
                      <TableCell>
                        <Badge
                          variant={
                            complaint.status === 'New'
                              ? 'secondary'
                              : complaint.status === 'Resolved'
                              ? 'default'
                              : complaint.status === 'Denied'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {complaint.status === 'New' || complaint.status === 'In Progress' ? (
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setComplaintToDeny(complaint)}
                            >
                              Deny
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              Resolve
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      {selectedComplaint && (
        <ResolveComplaintModal
          complaint={selectedComplaint}
          onOpenChange={() => setSelectedComplaint(null)}
          onComplaintResolved={handleComplaintResolved}
        />
      )}
       <AlertDialog open={!!complaintToDeny} onOpenChange={(open) => !open && setComplaintToDeny(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deny this complaint?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark this complaint as "Denied". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDenying}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDenyComplaint} disabled={isDenying} className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'>
              {isDenying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deny Complaint
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

  
