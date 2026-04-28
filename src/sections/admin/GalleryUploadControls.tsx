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

  const openModal = (capture?: 'environment') => {
    setModalOpen(true);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setTitle('');
    setCaption('');
    setDescription('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create previews
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (formData: FormData) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    // Add files and metadata to FormData
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('title', title);
    formData.append('caption', caption);
    formData.append('description', description);

    await uploadGalleryFiles(formData);

    // Cleanup
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setModalOpen(false);
    setUploading(false);
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl font-medium transition-colors"
        >
          <Upload size={20} />
          Upload Images / Videos
        </button>

        <button
          onClick={() => openModal('environment')}
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
                  onClick={() => {
                    previewUrls.forEach(url => URL.revokeObjectURL(url));
                    setModalOpen(false);
                  }}
                  className="text-black/40 hover:text-black"
                >
                  <X size={24} />
                </button>
              </div>

              {/* File input (hidden, triggered by label) */}
              <label className="block border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-3xl p-8 text-center cursor-pointer mb-6">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  capture={undefined} // will be set when reopening for camera
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <ImageIcon className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                <p className="font-medium text-emerald-700">Click to select files or take photo</p>
                <p className="text-sm text-emerald-500 mt-1">Images and videos supported</p>
              </label>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {previewUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`preview ${i}`}
                      className="aspect-square object-cover rounded-2xl border border-emerald-100"
                    />
                  ))}
                </div>
              )}

              {/* Metadata form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="Product showcase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Caption (optional)</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="Beautiful handmade knot"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="Detailed description of this gallery item..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button
                  onClick={() => {
                    previewUrls.forEach(url => URL.revokeObjectURL(url));
                    setModalOpen(false);
                  }}
                  className="flex-1 py-4 border border-black/10 rounded-3xl font-medium"
                >
                  Cancel
                </button>
                <form action={handleSubmit} className="flex-1">
                  <button
                    type="submit"
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full py-4 bg-black text-white rounded-3xl font-medium disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
