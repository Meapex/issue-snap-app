
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
import { Eye, Loader2, Trash2, TrendingUp, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type Complaint = {
  id: string;
  issue: string;
  location_description: string;
  status: 'New' | 'In Progress' | 'Resolved';
  image_url: string;
  created_at: string;
  category: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

const chartConfig = {
  total: {
    label: 'Complaints',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function EmployeeDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
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

  const analyticsData = useMemo(() => {
    if (!complaints.length) return { chartData: [], topCategories: [] };

    const categoryCounts = complaints.reduce((acc, complaint) => {
      const category = complaint.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(categoryCounts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    const topCategories = chartData.slice(0, 3);

    return { chartData, topCategories };
  }, [complaints]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Trash':
        return <Trash2 className="h-6 w-6 text-muted-foreground" />;
      case 'Pothole':
        return <TrendingUp className="h-6 w-6 text-muted-foreground" />;
      case 'Graffiti':
        return <Eye className="h-6 w-6 text-muted-foreground" />;
       case 'Broken Streetlight':
        return <Zap className="h-6 w-6 text-muted-foreground" />;
      default:
        return <Eye className="h-6 w-6 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading complaints...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full flex-col bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Complaints Dashboard
        </h1>

        <section id="analytics">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
            Analytics
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Complaints by Category</CardTitle>
                <CardDescription>
                  A breakdown of all reported issues by their category.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <BarChart accessibilityLayer data={analyticsData.chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
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
                      dataKey="total"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            {analyticsData.topCategories.map((cat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {cat.name}
                  </CardTitle>
                  {getCategoryIcon(cat.name)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cat.total}</div>
                  <p className="text-xs text-muted-foreground">
                    Total complaints
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="recent-complaints">
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
                    <TableHead>Image</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <Image
                          src={complaint.image_url}
                          alt={complaint.issue}
                          width={100}
                          height={66}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {complaint.issue}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{complaint.category || 'Other'}</Badge>
                      </TableCell>
                      <TableCell>{complaint.location_description}</TableCell>
                      <TableCell>{formatDate(complaint.created_at)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            complaint.status === 'New'
                              ? 'destructive'
                              : complaint.status === 'In Progress'
                              ? 'secondary'
                              : 'default'
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
