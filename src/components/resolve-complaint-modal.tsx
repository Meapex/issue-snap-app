
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Complaint } from '@/app/employee/dashboard/page';

type ResolveComplaintModalProps = {
  complaint: Complaint;
  onOpenChange: (open: boolean) => void;
  onComplaintResolved: (complaint: Complaint) => void;
};

export function ResolveComplaintModal({
  complaint,
  onOpenChange,
  onComplaintResolved,
}: ResolveComplaintModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'Missing Image',
        description: 'Please upload an image of the resolved issue.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `resolution-${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get public URL for the image
      const { data: urlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(fileName);

      const resolutionImageUrl = urlData.publicUrl;
      const resolvedAt = new Date().toISOString();

      // 3. Update complaint in Supabase database
      const { data: updatedComplaint, error: updateError } = await supabase
        .from('complaints')
        .update({
          status: 'Resolved',
          resolution_image_url: resolutionImageUrl,
          resolved_at: resolvedAt,
        })
        .eq('id', complaint.id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast({
        title: 'Complaint Resolved!',
        description: 'The issue has been marked as resolved.',
      });
      onComplaintResolved(updatedComplaint as Complaint);
    } catch (error: any) {
      console.error('Error resolving complaint:', JSON.stringify(error, null, 2));
      toast({
        variant: 'destructive',
        title: 'Resolution Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Complaint</DialogTitle>
          <DialogDescription>
            Upload an image to confirm resolution and update the status to
            "Resolved".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="p-4 border-2 border-dashed rounded-lg text-center">
            {imagePreview ? (
              <div className="relative group w-full aspect-video rounded-md overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Resolution preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                <Upload className="h-10 w-10" />
                <p className="font-semibold">Upload resolution photo</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !imageFile}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark as Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
