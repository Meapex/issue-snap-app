
'use client';

import { generateComplaintFromImage } from '@/ai/flows/generate-complaint-from-image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
  Camera,
  CheckCircle,
  Loader2,
  MapPin,
  RefreshCcw,
  Send,
  Upload,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';


type Location = { latitude: number; longitude: number };

export function ComplaintForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationDescription, setLocationDescription] =
    useState<string>('My current location');
  const [complaint, setComplaint] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageDataUri(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationRequest = () => {
    setIsLocationLoading(true);
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      setIsLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        setLocation(newLocation);
        setLocationDescription(
          `approx. ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );
        setIsLocationLoading(false);
        toast({
          title: 'Location Acquired',
          description: 'Your location has been successfully recorded.',
          action: <CheckCircle className="text-green-500" />,
        });
      },
      () => {
        toast({
          variant: 'destructive',
          title: 'Location access denied',
          description: 'Please enable location services to proceed.',
        });
        setIsLocationLoading(false);
      }
    );
  };

  const handleGenerateComplaint = async () => {
    if (!imageDataUri || !locationDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide both an image and a location.',
      });
      return;
    }

    setIsGenerating(true);
    setComplaint('');
    try {
      const result = await generateComplaintFromImage({
        photoDataUri: imageDataUri,
        locationDescription,
      });
      setComplaint(result.complaintDraft);
      setCategory(result.category);
      toast({
        title: 'Complaint Drafted!',
        description: 'Review and edit the AI-generated complaint below.',
      });
    } catch (error) {
      console.error('Error generating complaint:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating complaint',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !complaint || !location) return;

    setIsSubmitting(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // 2. Get public URL for the image
      const { data: urlData } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // 3. Insert complaint into Supabase database
      const { error: insertError } = await supabase.from('complaints').insert({
        issue: complaint,
        location_description: locationDescription,
        image_url: imageUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        category: category,
      });

      if (insertError) throw insertError;

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting complaint:', JSON.stringify(error, null, 2));
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
      });
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setImageDataUri(null);
    setImageFile(null);
    setLocation(null);
    setLocationDescription('My current location');
    setComplaint('');
    setCategory('');
    setIsGenerating(false);
    setIsSubmitting(false);
    setIsSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8 flex flex-col items-center gap-4 rounded-lg bg-green-50 border border-green-200">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h3 className="text-2xl font-semibold text-green-800 font-headline">
          Complaint Submitted!
        </h3>
        <p className="text-green-700">
          Thank you for your report. Our team will look into it shortly.
        </p>
        <Button onClick={resetForm} className="mt-4" variant="outline">
          <RefreshCcw className="mr-2" />
          File Another Complaint
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground font-headline">
          1. Capture the Issue
        </h3>
        <div className="p-4 border-2 border-dashed rounded-lg text-center">
          {imagePreview ? (
            <div className="relative group w-full aspect-video rounded-md overflow-hidden">
              <Image
                src={imagePreview}
                alt="Issue preview"
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
              <Upload className="h-10 w-10" />
              <p className="font-semibold">Upload an image of the issue</p>
              <p className="text-sm">PNG, JPG, or WEBP up to 4MB</p>
              <Button
                type="button"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2" />
                Take or Upload Photo
              </Button>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground font-headline">
          2. Confirm Location
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
          <Button
            type="button"
            onClick={handleLocationRequest}
            disabled={isLocationLoading || !!location}
            className="w-full sm:w-auto"
          >
            {isLocationLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <MapPin className="mr-2" />
            )}
            {location ? 'Location Acquired' : 'Get My Location'}
          </Button>
          <div className="flex-grow flex items-center gap-2 text-sm text-muted-foreground">
            {location ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <span>{locationDescription}</span>
              </>
            ) : (
              <span>We need your location to process the complaint.</span>
            )}
          </div>
        </div>
      </div>

      {(imagePreview || complaint) && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium text-foreground font-headline">
            3. Generate & Submit
          </h3>
          {!complaint && (
            <Button
              type="button"
              onClick={handleGenerateComplaint}
              disabled={isGenerating || !imagePreview || !location}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <Wand2 className="mr-2" />
              )}
              Generate Complaint with AI
            </Button>
          )}

          {(isGenerating || complaint) && (
            <div className="space-y-4">
              <Textarea
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="AI is generating your complaint..."
                rows={8}
                className="bg-white"
                disabled={isGenerating}
              />
              <Button
                type="submit"
                disabled={isSubmitting || isGenerating || !complaint}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 animate-spin" />
                ) : (
                  <Send className="mr-2" />
                )}
                Submit Complaint
              </Button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
