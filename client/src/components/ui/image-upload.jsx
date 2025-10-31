import { useState, useRef, useCallback, useEffect } from "react";
import { DndContext, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon, Upload, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const DroppableArea = ({ children, disabled }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'image-upload-dropzone',
    disabled
  });

  return (
    <div ref={setNodeRef} className={isOver && !disabled ? 'opacity-100' : ''}>
      {children}
    </div>
  );
};

const ImageUpload = ({ 
  value, 
  onChange, 
  onError, 
  className,
  disabled = false,
  maxSize = 5 * 1024 * 1024,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (value && value instanceof File) {
      const previewUrl = URL.createObjectURL(value);
      setPreview(previewUrl);
      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFile = useCallback((file) => {
    if (!file) return;

    if (!acceptedTypes.includes(file.type)) {
      onError?.('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      onError?.(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    onChange?.(file);
  }, [acceptedTypes, maxSize, onChange, onError]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleDragEnd = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={cn("space-y-2 max-w-48", className)}>
        <Label className="text-sm font-medium flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          Image
        </Label>
        
        <DroppableArea disabled={disabled}>
          <Card 
            className={cn(
              "border-2 border-dashed transition-colors cursor-pointer max-w-48 w-full",
              isDragOver && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed",
              preview && "border-solid"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <CardContent className="p-4">
              {preview ? (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    {isDragOver ? (
                      <Upload className="h-6 w-6 text-primary" />
                    ) : (
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">
                      {isDragOver ? "Drop image here" : "Upload an image"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Up to {Math.round(maxSize / 1024 / 1024)}MB
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </DroppableArea>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </DndContext>
  );
};

export default ImageUpload;
