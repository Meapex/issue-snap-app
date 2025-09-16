
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Complaint } from '@/app/employee/dashboard/page';

type ViewLocationModalProps = {
  complaint: Complaint;
  onOpenChange: (open: boolean) => void;
};

export function ViewLocationModal({
  complaint,
  onOpenChange,
}: ViewLocationModalProps) {

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${complaint.latitude},${complaint.longitude}`;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complaint Location</DialogTitle>
          <DialogDescription>
            Location for complaint: {complaint.issue}
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full rounded-md overflow-hidden border">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
             <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            ></iframe>
          ) : (
            <div className='w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4'>
                <p className='font-semibold text-destructive'>Map Not Configured</p>
                <p className='text-sm text-muted-foreground mt-2'>Please add your Google Maps API key to the .env.local file to enable this feature.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
