// src/sections/admin/GalleryUploadControls.tsx
'use client';

import { useState } from 'react';
import { Upload, Camera, X, Image as ImageIcon } from 'lucide-react';
import { uploadGalleryFiles } from './gallery-actions';

export default function GalleryUploadControls() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const openModal = () => {
    setModalOpen(true);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setTitle('');
    setCaption('');
    setDescription('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    if (title) formData.append('title', title);
    if (caption) formData.append('caption', caption);
    if (description) formData.append('description', description);
    formData.append('category', 'general');

    try {
      await uploadGalleryFiles(formData);

      // Cleanup
      previewUrls.forEach((url) => URL.revokeObjectURL(url));

      setModalOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setModalOpen(false);
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-3xl font-medium transition-colors"
        >
          <Upload size={20} />
          Upload Images / Videos
        </button>

        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-primary-foreground px-6 py-3 rounded-3xl font-medium transition-colors"
        >
          <Camera size={20} />
          Take Photo
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border">
              <h2 className="text-2xl font-serif text-foreground">Add to Gallery</h2>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* File selector */}
              <label className="block border-2 border-dashed border-border hover:border-primary rounded-3xl p-8 text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium text-foreground">Click or tap to select images/videos</p>
                <p className="text-sm text-muted-foreground mt-1">or use camera</p>
              </label>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border">
                      <img
                        src={url}
                        alt={`preview ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Metadata fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:border-primary outline-none text-foreground"
                    placeholder="Summer collection 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Caption (optional)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:border-primary outline-none text-foreground"
                    placeholder="Hand-knotted with love"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 focus:border-primary outline-none resize-none text-foreground"
                    placeholder="Detailed description of this gallery item..."
                  />
                </div>
              </div>
            </div>

            {/* Footer with buttons - always visible */}
            <div className="border-t border-border p-8 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-4 border border-border rounded-3xl font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-3xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {uploading
                  ? 'Uploading...'
                  : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
