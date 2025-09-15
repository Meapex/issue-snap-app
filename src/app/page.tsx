import { ComplaintForm } from '@/components/complaint-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Camera } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <Card className="w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center bg-primary/10 p-4 rounded-full w-fit">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold tracking-tight text-foreground font-headline">
              IssueSnap
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              See an issue? Snap it, and we'll help you report it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintForm />
          </CardContent>
        </Card>
        <div className="mt-4 text-center">
          <Link href="/employee/login" className="text-sm text-muted-foreground hover:text-primary">
            Employee Login
          </Link>
        </div>
      </div>
    </main>
  );
}
