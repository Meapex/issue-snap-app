
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Complaint = {
  id: string;
  issue: string;
  location_description: string;
  status: 'New' | 'In Progress' | 'Resolved';
  image_url: string;
  created_at: string;
  category: string;
  department: string;
  resolution_image_url: string | null;
  resolved_at: string | null;
};

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const [isMounted, setIsMounted] = useState(false);
  const [reportedDate, setReportedDate] = useState('');
  const [resolvedDate, setResolvedDate] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setReportedDate(
      formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })
    );
    if (complaint.resolved_at) {
      setResolvedDate(
        formatDistanceToNow(new Date(complaint.resolved_at), {
          addSuffix: true,
        })
      );
    }
  }, [complaint.created_at, complaint.resolved_at]);

  if (!isMounted) {
    return null;
  }

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
              Reported {reportedDate}
            </div>
            {complaint.resolved_at && resolvedDate && (
              <div className="text-xs text-green-600">
                Resolved {resolvedDate}
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
