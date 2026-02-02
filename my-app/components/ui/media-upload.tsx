"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, FileVideo, Image as ImageIcon } from "lucide-react";
import { uploadFile } from "@/lib/actions/upload.actions";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
  onUpload: (url: string) => void;
  onRemove: (url: string) => void;
  value: string[];
  disabled?: boolean;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

export function MediaUpload({
  onUpload,
  onRemove,
  value = [],
  disabled,
  maxFiles = 5,
  accept = "image/*,video/*",
  label = "Upload Media",
}: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadFile(formData);
        if (result.success && result.url) {
          onUpload(result.url);
        } else {
          console.error("Upload failed", result.error);
          alert(`Failed to upload ${file.name}`);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || isUploading || value.length >= maxFiles}
          className="relative overflow-hidden"
        >
          {isUploading ? "Uploading..." : label}
          <Input
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept={accept}
            disabled={disabled || isUploading || value.length >= maxFiles}
            multiple
          />
          {!isUploading && <Upload className="h-4 w-4 ml-2" />}
        </Button>
        <span className="text-sm text-muted-foreground">
          {value.length} / {maxFiles} files
        </span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => {
            const isVideo = url.match(/\.(mp4|webm|mov)$/i);
            return (
              <div
                key={index}
                className="relative group aspect-square rounded-lg border bg-muted overflow-hidden"
              >
                {isVideo ? (
                  <video
                    src={url}
                    className="h-full w-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={url}
                    alt="Uploaded media"
                    className="h-full w-full object-cover"
                  />
                )}

                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
