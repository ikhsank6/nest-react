import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileImage, Loader2, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { uploadService } from '@/services/upload.service';
import { showError } from '@/lib/utils';
import { env } from '@/config/env';
import { ImagePreview } from '@/components/ui/image-preview';

export interface Media {
  uuid: string;
  filename: string;
  original_name: string;
  url: string;
}

interface ImageUploadProps {
  value?: string | Media | null;
  onChange: (value: Media | null) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await uploadService.uploadImage(file);
      onChange(response);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || loading
  });

  const removeImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it's a Media object with uuid, delete from server
    if (value && typeof value === 'object' && 'uuid' in value) {
      setLoading(true);
      try {
        await uploadService.deleteMedia(value.uuid);
      } catch (error) {
        // Silently fail - the file might already be deleted or not exist
        console.error('Failed to delete media:', error);
      } finally {
        setLoading(false);
      }
    }
    
    onChange(null);
  };

  const getFullUrl = (val: string | Media | null | undefined) => {
    if (!val) return '';
    const url = typeof val === 'string' ? val : val.url;
    if (url.startsWith('http')) return url;
    return `${env.API_URL}${url}`;
  };

  const getDisplayName = (val: string | Media | null | undefined) => {
    if (!val) return '';
    return typeof val === 'string' ? val : (val.original_name || val.filename);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-all cursor-pointer overflow-hidden",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 bg-muted/5",
          disabled && "opacity-50 cursor-not-allowed",
          value && "border-solid"
        )}
      >
        <input {...getInputProps()} />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Mengunggah gambar...</p>
          </div>
        ) : value ? (
          <div className="relative w-full h-full group">
            <img
              src={getFullUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                    onClick={handleZoomClick}
                  >
                    <ZoomIn className="h-4 w-4 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Perbesar Gambar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hapus Gambar</TooltipContent>
              </Tooltip>
              
              <div className="bg-white/90 text-black px-3 py-1 rounded-full text-xs font-semibold">
                Ganti Gambar
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <div className="p-3 mb-4 rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mb-2 text-sm font-semibold">
              <span className="text-primary hover:underline">Klik untuk upload</span> atau drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, JPEG, GIF atau WebP (Maks. 5MB)
            </p>
          </div>
        )}
      </div>
      
      {value && !loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-dashed truncate">
          <FileImage className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{getDisplayName(value)}</span>
        </div>
      )}

      {/* Lightbox Modal */}
      {showLightbox && value && (
        <ImagePreview
          src={getFullUrl(value)}
          alt={getDisplayName(value)}
          className="hidden"
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}
