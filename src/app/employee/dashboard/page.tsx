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
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Complaint = {
  id: string;
  issue: string;
  location_description: string;
  status: 'New' | 'In Progress' | 'Resolved';
  image_url: string;
  created_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export default function EmployeeDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/employee/login');
      }
    };

    const fetchComplaints = async () => {
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

    checkUser();
    fetchComplaints();
  }, [router, supabase]);

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
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          Complaints Dashboard
        </h1>
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
      </div>
    </main>
  );
}
