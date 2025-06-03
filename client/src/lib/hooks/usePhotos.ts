import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PhotoItem } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function usePhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/photos'],
  });

  useEffect(() => {
    if (data) {
      setPhotos(data);
    }
  }, [data]);

  useEffect(() => {
    if (photos.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 7000); // Change photo every 7 seconds
      
      return () => clearInterval(interval);
    }
  }, [photos]);

  const currentPhoto = photos.length > 0 ? photos[currentPhotoIndex] : null;

  const uploadPhoto = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      
      await refetch();
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    photos,
    currentPhoto,
    isLoading,
    isUploading,
    error,
    uploadPhoto,
    refetch
  };
}
