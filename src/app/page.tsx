import { Button } from '@/components/ui/button';
import { Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComplaintCard } from '@/components/complaint-card-client';

export default async function Home() {
  const supabase = createClient();
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  const ongoingComplaints =
    complaints?.filter((c) => c.status !== 'Resolved' && c.status !== 'Denied') || [];
  const resolvedComplaints =
    complaints?.filter((c) => c.status === 'Resolved') || [];

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 lg:p-8">
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

    