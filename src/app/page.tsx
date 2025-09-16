import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

async function ComplaintCard({ complaint }: { complaint: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-foreground">{complaint.issue}</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Location:</span>{' '}
              {complaint.location_description}
            </p>
            <div className="text-xs text-muted-foreground">
              Reported{' '}
              {formatDistanceToNow(new Date(complaint.created_at), {
                addSuffix: true,
              })}
            </div>
            {complaint.resolved_at && (
              <div className="text-xs text-green-600">
                Resolved{' '}
                {formatDistanceToNow(new Date(complaint.resolved_at), {
                  addSuffix: true,
                })}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Issue
              </span>
              <Image
                src={complaint.image_url}
                alt={complaint.issue}
                width={150}
                height={100}
                className="rounded-md object-cover aspect-[3/2]"
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Resolution
              </span>
              {complaint.resolution_image_url ? (
                <Image
                  src={complaint.resolution_image_url}
                  alt={`Resolution for ${complaint.issue}`}
                  width={150}
                  height={100}
                  className="rounded-md object-cover aspect-[3/2]"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground aspect-[3/2]">
                  Pending
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Home() {
  const supabase = createClient();
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const ongoingComplaints =
    complaints?.filter((c) => c.status !== 'Resolved') || [];
  const resolvedComplaints =
    complaints?.filter((c) => c.status === 'Resolved') || [];

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline">
            IssueSnap
          </h1>
          <p className="text-muted-foreground mt-2">
            See an issue in your community? Snap it, and we'll help you report
            it to the right department.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <Link href="/report">
              <Button size="lg">
                Report an Issue <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/employee/login">
              <Button size="lg" variant="outline">
                Employee Login
              </Button>
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-center mb-6">
            Recent Complaints
          </h2>
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ongoing">
                Ongoing ({ongoingComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({resolvedComplaints.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ongoing" className="mt-4 space-y-4">
              {ongoingComplaints.length > 0 ? (
                ongoingComplaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No ongoing complaints at the moment.
                </p>
              )}
            </TabsContent>
            <TabsContent value="resolved" className="mt-4 space-y-4">
              {resolvedComplaints.length > 0 ? (
                resolvedComplaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No resolved complaints to show yet.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
