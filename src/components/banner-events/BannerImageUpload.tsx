import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, File, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BannerImageUploadProps {
  eventId: number;
  eventName: string;
  isOpen: boolean;
  onClose: () => void;
  existingImages?: any[];
}

interface UploadFile extends File {
  id: string;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const BannerImageUpload: React.FC<BannerImageUploadProps> = ({
  eventId,
  eventName,
  isOpen,
  onClose,
  existingImages = []
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => apiService.uploadBannerImages(eventId, files),
    onSuccess: (data: any) => {
      const uploadedCount = Array.isArray(data) ? data.length : 1;
      toast.success(`Successfully uploaded ${uploadedCount} images!`);
      queryClient.invalidateQueries({ queryKey: ['bannerEvents'] });
      queryClient.invalidateQueries({ queryKey: ['bannerEvent', eventId] });
      
      // Update file status to success
      setFiles(prevFiles => 
        prevFiles.map(file => ({ 
          ...file, 
          status: 'success' as const, 
          progress: 100 
        }))
      );
      
      // Close dialog after a short delay
      setTimeout(() => {
        onClose();
        setFiles([]);
      }, 1500);
    },
    onError: (error) => {
      toast.error('Failed to upload images');
      console.error('Upload error:', error);
      
      // Update file status to error
      setFiles(prevFiles => 
        prevFiles.map(file => ({ 
          ...file, 
          status: 'error' as const,
          error: 'Upload failed'
        }))
      );
    }
  });

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));

    // Validate file types
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter(f => f.id !== fileId);
    });
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    // Update status to uploading
    setFiles(prevFiles => 
      prevFiles.map(file => ({ 
        ...file, 
        status: 'uploading' as const 
      }))
    );

    // Simulate progress for each file
    const progressInterval = setInterval(() => {
      setFiles(prevFiles => 
        prevFiles.map(file => {
          if (file.status === 'uploading' && file.progress < 90) {
            return { ...file, progress: file.progress + 10 };
          }
          return file;
        })
      );
    }, 200);

    // Convert UploadFile to File for upload
    const filesToUpload = files.map(({ id, preview, status, progress, error, ...file }) => file as File);
    
    uploadMutation.mutate(filesToUpload);
    
    // Clear progress interval
    setTimeout(() => {
      clearInterval(progressInterval);
    }, 2000);
  };

  const getFileIcon = (file: UploadFile) => {
    switch (file.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (file: UploadFile) => {
    switch (file.status) {
      case 'success':
        return <Badge variant="default">Uploaded</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'uploading':
        return <Badge variant="secondary">Uploading...</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Banner Images</DialogTitle>
          <DialogDescription>
            Upload promotional banner images for "{eventName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Images ({existingImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.imageUrl}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-1 right-1 text-xs"
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Area */}
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drag and drop images here, or{' '}
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Support JPG, PNG, GIF up to 10MB each
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Files */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-2">
                            {getFileIcon(file)}
                            {getStatusBadge(file)}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        
                        {file.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={file.progress} className="h-1" />
                          </div>
                        )}
                        
                        {file.error && (
                          <p className="text-xs text-red-500 mt-1">{file.error}</p>
                        )}
                      </div>

                      {file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
