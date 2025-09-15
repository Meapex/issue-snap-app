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

// Mock data for complaints
const complaints = [
  {
    id: '1',
    issue: 'Large pothole',
    location: 'Main St & 1st Ave',
    status: 'New',
    imageUrl: 'https://picsum.photos/seed/1/150/100',
    submittedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: '2',
    issue: 'Broken streetlight',
    location: 'Oak Ave & 2nd St',
    status: 'In Progress',
    imageUrl: 'https://picsum.photos/seed/2/150/100',
    submittedAt: '2024-05-19T14:30:00Z',
  },
  {
    id: '3',
    issue: 'Graffiti on wall',
    location: 'Parkside Dr',
    status: 'Resolved',
    imageUrl: 'https://picsum.photos/seed/3/150/100',
    submittedAt: '2024-05-18T09:15:00Z',
  },
    {
    id: '4',
    issue: 'Overflowing trash can',
    location: 'City Hall Plaza',
    status: 'New',
    imageUrl: 'https://picsum.photos/seed/4/150/100',
    submittedAt: '2024-05-20T11:00:00Z',
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

export default function EmployeeDashboard() {
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
                        src={complaint.imageUrl}
                        alt={complaint.issue}
                        width={100}
                        height={66}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {complaint.issue}
                    </TableCell>
                    <TableCell>{complaint.location}</TableCell>
                    <TableCell>{formatDate(complaint.submittedAt)}</TableCell>
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
