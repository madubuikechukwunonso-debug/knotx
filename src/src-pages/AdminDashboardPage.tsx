'use client';

import { useState, useEffect } from 'react';
import {
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, Upload, Video, Image as ImageIcon, LogOut, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { galleryImages as defaultGalleryImages } from '@/lib/galleryImages';
import { uploadMediaAction } from '@/app/actions/upload-media';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

interface MediaItem {
  id?: number;
  url: string;
  name: string;
}

interface OverviewData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalBookings: number;
    revenueFromOrders?: number;
    revenueFromBookings?: number;
  };
  recentUsers: any[];
  recentOrders: any[];
  recentBookings: any[];
  liveVisitors?: any[];
}

export default function AdminOverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [heroVideos, setHeroVideos] = useState<MediaItem[]>([]);
  const [galleryImagesState, setGalleryImagesState] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const defaultVideos = [
    { url: "/videos/1.webm", name: "Hero Video 1" },
    { url: "/videos/2.webm", name: "Hero Video 2" },
    { url: "/videos/3.webm", name: "Hero Video 3" },
    { url: "/videos/4.webm", name: "Hero Video 4" },
  ];

  async function fetchData(isManual = false) {
    if (!isManual) setLoading(true);
    
    try {
      const [overviewRes, mediaRes] = await Promise.all([
        fetch('/api/admin/overview', { cache: 'no-store' }),
        fetch('/api/admin/media', { cache: 'no-store' }),
      ]);

      const overviewData = await overviewRes.json();
      const mediaData = await mediaRes.json();

      setData(overviewData);

      // Merge hero videos
      const dbVideos = mediaData.heroVideos || [];
      const mergedVideos = defaultVideos.map((defaultVideo, index) => {
        const dbVideo = dbVideos.find((v: any) => v.position === index);
        return dbVideo
          ? { id: dbVideo.id, url: dbVideo.url, name: dbVideo.name || defaultVideo.name }
          : defaultVideo;
      });
      setHeroVideos(mergedVideos);

      // Merge gallery images
      const dbImages = mediaData.galleryImages || [];
      const realGallery = defaultGalleryImages.slice(0, 3).map((img, index) => ({
        id: img.id,
        url: img.src,
        name: img.alt || `Gallery Image ${index + 1}`,
      }));

      const mergedImages = realGallery.map((defaultImg, index) => {
        const dbImg = dbImages.find((img: any) => img.position === index);
        return dbImg
          ? { id: dbImg.id, url: dbImg.url, name: dbImg.name || defaultImg.name }
          : defaultImg;
      });
      setGalleryImagesState(mergedImages);

      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      if (!isManual) setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleIndividualUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'hero' | 'gallery',
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('position', index.toString());

      const result = await uploadMediaAction(formData);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload failed');
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          url: result.url,
          name: result.name,
          position: index,
        }),
      });

      if (!response.ok) throw new Error('Failed to save media to database');

      alert(`${type === 'hero' ? 'Video' : 'Image'} ${index + 1} updated successfully!`);
      await fetchData(true);
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  // Sort visitors by newest first
  const sortedLiveVisitors = [...(data?.liveVisitors || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Build map locations (only those with coordinates)
  const liveVisitorLocations = sortedLiveVisitors
    .filter((visitor: any) => visitor.latitude && visitor.longitude)
    .map((visitor: any) => ({
      name: visitor.city || visitor.country || 'Unknown',
      coordinates: [visitor.longitude, visitor.latitude] as [number, number],
      count: 1,
      page: visitor.page,
      userType: visitor.userType,
    }));

  return (
    <div className="space-y-8 bg-background min-h-screen p-6 text-foreground">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time overview • KnotX &amp; Krafts</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium transition-all text-primary-foreground"
          >
            <LogOut size={18} />
            Return to User Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground tracking-widest">TOTAL REVENUE</p>
              <p className="text-4xl font-semibold tabular-nums mt-1">
                {loading && !data ? "..." : `$${(data?.stats.totalRevenue || 0) / 100}`}
              </p>
            </div>
            <DollarSign className="text-primary" size={28} />
          </div>
          <div className="mt-4 space-y-2 text-sm border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">From Orders</span>
              <span className="font-medium">${(data?.stats.revenueFromOrders || 0) / 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">From Booking Deposits</span>
              <span className="font-medium">${(data?.stats.revenueFromBookings || 0) / 100}</span>
            </div>
          </div>
        </div>

        {[
          { label: "Total Orders", value: data?.stats.totalOrders ?? "—", icon: ShoppingCart },
          { label: "Customers", value: data?.stats.totalCustomers ?? "—", icon: Users },
          { label: "Bookings", value: data?.stats.totalBookings ?? "—", icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground tracking-widest">{stat.label}</p>
                <p className="text-4xl font-semibold mt-3 tabular-nums">
                  {loading && !data ? "..." : stat.value}
                </p>
              </div>
              <stat.icon className="text-primary mt-1" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* === LIVE VISITOR MAP === */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="text-primary" />
            <div>
              <p className="text-primary text-xs tracking-[3px]">LIVE VISITORS</p>
              <p className="text-xl font-medium">Global Activity Map</p>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={() => fetchData(true)} 
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 border border-border transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
            Refresh
          </button>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-border bg-background">
          <ComposableMap
            projectionConfig={{ scale: 140 }}
            width={900}
            height={420}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#334155"
                    stroke="#475569"
                    strokeWidth={0.6}
                  />
                ))
              }
            </Geographies>

            {liveVisitorLocations.map((location, index) => (
              <Marker key={index} coordinates={location.coordinates}>
                <g>
                  <circle r={8} fill="#22d3ee" opacity="0.3">
                    <animate attributeName="r" values="8;22;8" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <circle r={7} fill="#22d3ee" />
                  <circle r={3.5} fill="#ffffff" />
                </g>
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {liveVisitorLocations.length > 0 ? (
            liveVisitorLocations.map((loc, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl">
                <div className="w-2.5 h-2.5 bg-[#22d3ee] rounded-full" />
                <span className="font-medium">{loc.name}</span>
                <span className="text-muted-foreground">({loc.count} active)</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No live locations yet.</p>
          )}
        </div>

        {/* === RECENT VISITS LOG (Mobile Friendly) === */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-primary text-sm font-medium tracking-widest">RECENT VISITS</p>
            <span className="text-xs text-muted-foreground">Newest first</span>
          </div>

          <div className="space-y-3">
            {sortedLiveVisitors.length > 0 ? (
              sortedLiveVisitors.slice(0, 20).map((visitor: any, index: number) => (
                <div 
                  key={index} 
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {visitor.displayName || 'Guest Visitor'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                        visitor.userType === 'registered' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {visitor.userType || 'guest'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {visitor.page}
                    </p>
                  </div>

                  <div className="text-left sm:text-right text-xs text-muted-foreground">
                    <div>{new Date(visitor.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</div>
                    <div className="truncate max-w-[160px] sm:max-w-[180px]">
                      {visitor.city || visitor.country || visitor.ip}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <p className="text-muted-foreground">No recent visits logged yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Management */}
      <div className="bg-card border border-border rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Upload className="text-primary" /> Media Management
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Upload or replace videos and images individually. Only the selected slot will be updated.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Videos with Preview */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Video className="text-primary" />
              <h4 className="font-semibold text-lg">Hero Section Videos</h4>
            </div>
            <div className="space-y-6">
              {heroVideos.map((video, index) => (
                <div key={index} className="border border-border rounded-2xl p-4">
                  <div className="mb-3">
                    <p className="font-medium">{video.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                  </div>

                  {/* Video Preview */}
                  <div className="mb-4 rounded-xl overflow-hidden border border-border bg-black">
                    <video 
                      src={video.url} 
                      controls 
                      className="w-full max-h-[180px] object-contain"
                    />
                  </div>

                  <div className="flex justify-end">
                    <label className="cursor-pointer">
                      <div className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium transition-all text-primary-foreground">
                        {uploadingIndex === index ? "Uploading..." : "Change Video"}
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleIndividualUpload(e, 'hero', index)}
                        className="hidden"
                        disabled={uploadingIndex !== null}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-primary" />
              <h4 className="font-semibold text-lg">Home Gallery Images</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {galleryImagesState.map((img, index) => (
                <div key={index} className="border border-border rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <img src={img.url} alt={img.name} className="max-h-full object-cover" />
                  </div>
                  <div className="p-3 flex justify-between items-center bg-card">
                    <p className="text-sm truncate">{img.name}</p>
                    <label className="cursor-pointer">
                      <div className="px-3 py-1.5 bg-primary hover:bg-primary/90 rounded-lg text-xs font-medium transition-all text-primary-foreground">
                        {uploadingIndex === index ? "..." : "Change"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIndividualUpload(e, 'gallery', index)}
                        className="hidden"
                        disabled={uploadingIndex !== null}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
