import { Button } from '@/components/ui/button';
import { Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ComplaintCardClientOnly } from '@/components/complaint-card-client-only';
import type { Complaint } from '@/app/employee/dashboard/page';

export default async function Home() {
  const supabase = createClient();
  const { data: complaints } = await supabase
    .from('complaints')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  const ongoingComplaints =
    complaints?.filter(
      (c) => c.status !== 'Resolved' && c.status !== 'Denied'
    ) || [];
  const resolvedComplaints =
    complaints?.filter((c) => c.status === 'Resolved') || [];
  const deniedComplaints =
    complaints?.filter((c) => c.status === 'Denied') || [];

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-16 animate-fade-in">
          <div className="mx-auto flex items-center justify-center bg-primary/10 p-4 rounded-full w-fit mb-4 border border-primary/20">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-foreground font-headline">
            IssueSnap
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            See an issue in your community? Snap a photo, and our AI will help you report
            it to the correct city department in seconds.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className='transition-transform transform hover:scale-105'>
                Report an Issue <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/employee/login">
              <Button size="lg" variant="outline" className='transition-transform transform hover:scale-105'>
                Employee Login
              </Button>
            </Link>
          </div>
        </header>

        <section className='animate-fade-in' style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
          <h2 className="text-3xl font-semibold text-center mb-8">
            Recent Complaints
          </h2>
          <Tabs defaultValue="ongoing" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="ongoing">
                Ongoing ({ongoingComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({resolvedComplaints.length})
              </TabsTrigger>
              <TabsTrigger value="denied">
                Denied ({deniedComplaints.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ongoing" className="mt-6 space-y-4">
              {ongoingComplaints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ongoingComplaints.map((complaint) => (
                    <ComplaintCardClientOnly
                      key={complaint.id}
                      complaint={complaint as Complaint}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-16 bg-secondary/50 rounded-lg">
                  <p>No ongoing complaints at the moment.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="resolved" className="mt-6 space-y-4">
              {resolvedComplaints.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resolvedComplaints.map((complaint) => (
                    <ComplaintCardClientOnly
                      key={complaint.id}
                      complaint={complaint as Complaint}
                    />
                  ))}
                </div>
              ) : (
                 <div className="text-center text-muted-foreground py-16 bg-secondary/50 rounded-lg">
                  <p>No resolved complaints to show yet.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="denied" className="mt-6 space-y-4">
               <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-center">
                <AlertCircle className="h-4 w-4 !text-destructive mx-auto mb-2" />
                <AlertTitle className='text-destructive'>Denied Complaints</AlertTitle>
                <AlertDescription className='text-destructive/80'>
                  These are issues that have been reviewed by an employee and marked as invalid or not actionable.
                </AlertDescription>
              </Alert>
              {deniedComplaints.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deniedComplaints.map((complaint) => (
                    <ComplaintCardClientOnly
                      key={complaint.id}
                      complaint={complaint as Complaint}
                    />
                  ))}
                </div>
              ) : (
                 <div className="text-center text-muted-foreground py-16 bg-secondary/50 rounded-lg">
                  <p>No denied complaints to show.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}
