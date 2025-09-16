
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
            Location for complaint #{complaint.hash_id}: {complaint.issue}
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full rounded-md overflow-hidden border">
           <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    