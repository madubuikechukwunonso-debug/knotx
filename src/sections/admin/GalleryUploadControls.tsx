'use client';

import { useFormStatus } from 'react-dom';
import { Upload, Camera } from 'lucide-react';
import type { ComponentType } from 'react';
import { uploadGalleryFiles } from './gallery-actions';

interface UploadFormContentProps {
  icon: ComponentType<{ size?: number }>;
  label: string;
  accept: string;
  capture?: 'user' | 'environment';
  multiple?: boolean;
  webkitdirectory?: boolean;
  bg: string;
}

function UploadFormContent({
  icon: Icon,
  label,
  accept,
  capture,
  multiple,
  webkitdirectory,
  bg,
}: UploadFormContentProps) {
  const { pending } = useFormStatus();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && !pending) {
      const form = e.target.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <label
      className={`flex items-center gap-2 ${bg} text-white px-6 py-3 rounded-3xl transition-colors shadow-sm cursor-pointer w-full sm:w-auto justify-center sm:justify-start ${pending ? 'opacity-70 pointer-events-none' : 'hover:brightness-105'}`}
    >
      <Icon size={20} />
      <span className="font-medium">{pending ? 'Uploading...' : label}</span>
      <input
        type="file"
        name="files"
        accept={accept}
        multiple={multiple}
        capture={capture}
        // @ts-expect-error non-standard but widely supported for folder uploads
        webkitdirectory={webkitdirectory ? '' : undefined}
        className="hidden"
        onChange={handleFileChange}
        disabled={pending}
      />
    </label>
  );
}

export default function GalleryUploadControls() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* UPLOAD BUTTON (Images / Videos / Folder) */}
      <form action={uploadGalleryFiles} className="flex items-center gap-3">
        <UploadFormContent
          icon={Upload}
          label="Upload Images / Videos or Folder"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,video/*"
          multiple
          webkitdirectory
          bg="bg-emerald-600 hover:bg-emerald-700"
        />
        <input type="hidden" name="category" value="general" />
      </form>

      {/* CAMERA CAPTURE BUTTON */}
      <form action={uploadGalleryFiles} className="flex items-center gap-3">
        <UploadFormContent
          icon={Camera}
          label="Take Photo"
          accept="image/*"
          capture="environment"
          bg="bg-emerald-700 hover:bg-emerald-800"
        />
        <input type="hidden" name="category" value="general" />
      </form>
    </div>
  );
}
