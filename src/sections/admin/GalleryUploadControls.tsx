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

    // Create object URLs for preview
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    const formData = new FormData();

    // Add all selected files
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    // Add metadata
    if (title) formData.append('title', title);
    if (caption) formData.append('caption', caption);
    if (description) formData.append('description', description);
    formData.append('category', 'general');

    try {
      await uploadGalleryFiles(formData);
      
      // Cleanup previews
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      
      // Close modal
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
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl font-medium transition-colors"
        >
          <Upload size={20} />
          Upload Images / Videos
        </button>

        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-3xl font-medium transition-colors"
        >
          <Camera size={20} />
          Take Photo
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif">Add to Gallery</h2>
                <button
                  onClick={closeModal}
                  className="text-black/40 hover:text-black transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              {/* File selector */}
              <label className="block border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-3xl p-8 text-center cursor-pointer mb-6">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                <p className="font-medium text-emerald-700">Click or tap to select images/videos</p>
                <p className="text-sm text-emerald-500 mt-1">or use camera</p>
              </label>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-emerald-100">
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
                  <label className="block text-xs font-medium mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-emerald-400 outline-none"
                    placeholder="Summer collection 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Caption (optional)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-emerald-400 outline-none"
                    placeholder="Hand-knotted with love"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3 focus:border-emerald-400 outline-none resize-none"
                    placeholder="Detailed description of this gallery item..."
                  />
                </div>
              </div>

              {/* ACTION BUTTONS - NOW CLEARLY VISIBLE */}
              <div className="flex gap-3 mt-10">
                <button
                  onClick={closeModal}
                  className="flex-1 py-4 border border-black/10 rounded-3xl font-medium text-black hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 py-4 bg-black text-white rounded-3xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {uploading
                    ? 'Uploading...'
                    : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
