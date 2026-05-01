"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Star, Camera, Send, Heart } from "lucide-react";

const EMOJIS = [
  { emoji: "😍", label: "Amazing", value: 5 },
  { emoji: "😊", label: "Great", value: 4 },
  { emoji: "🙂", label: "Good", value: 3 },
  { emoji: "😐", label: "Okay", value: 2 },
  { emoji: "😕", label: "Not Great", value: 1 },
];

const SERVICE_TYPES = [
  "Hair Braiding Service",
  "Hair Product Purchase",
  "Both Service & Product",
  "Other",
];

interface Review {
  id: number;
  customerName: string;
  rating: number;
  emoji: string;
  comment: string;
  image: string | null;
  serviceType: string;
  createdAt: string;
}

export default function RateUsPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Auto-fill user details if logged in
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || user.displayName || "");
      setCustomerEmail(user.email || "");
    }
  }, [isAuthenticated, user]);

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  // Rotate reviews every 4 seconds
  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const handleEmojiSelect = (index: number) => {
    setSelectedEmoji(index);
    setRating(EMOJIS[index].value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmoji && !comment.trim()) {
      alert("Please select an emoji or write a comment!");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('customerName', customerName || 'Anonymous');
      formData.append('customerEmail', customerEmail || 'anonymous@knotxandkrafts.com');
      formData.append('customerPhone', customerPhone);
      formData.append('rating', rating.toString());
      formData.append('emoji', selectedEmoji !== null ? EMOJIS[selectedEmoji].emoji : '⭐');
      formData.append('comment', comment);
      formData.append('serviceType', serviceType);
      
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSubmitted(true);
        // Refresh reviews
        setTimeout(() => {
          fetchReviews();
        }, 1000);
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentReview = reviews[currentReviewIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-black to-emerald-950">
      <Navigation />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* HERO HEADER */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full mb-6">
              <Heart className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium tracking-[3px] uppercase">We Value Your Voice</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-tight">
              How Was<br />Your Experience?
            </h1>
            <p className="text-xl text-emerald-200/80 max-w-2xl mx-auto">
              Your feedback helps us craft unforgettable moments. Share your story with us.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* RATING FORM */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif text-white">Rate Your Experience</h3>
                    <p className="text-emerald-300/70">Select an emoji that matches your vibe</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* EMOJI RATING */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-4">How do you feel?</label>
                  <div className="flex justify-between gap-3">
                    {EMOJIS.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(index)}
                        className={`flex-1 aspect-square flex flex-col items-center justify-center rounded-3xl transition-all duration-300 border-2 ${
                          selectedEmoji === index
                            ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-2xl shadow-emerald-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-5xl mb-2">{item.emoji}</span>
                        <span className={`text-xs font-medium ${selectedEmoji === index ? 'text-white' : 'text-emerald-300/70'}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STAR RATING (Visual) */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                    />
                  ))}
                  <span className="ml-3 text-emerald-300 text-sm">({rating}/5)</span>
                </div>

                {/* SERVICE TYPE */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-3">What did you experience?</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
                  >
                    {SERVICE_TYPES.map((type, i) => (
                      <option key={i} value={type} className="bg-emerald-950">{type}</option>
                    ))}
                  </select>
                </div>

                {/* COMMENT */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-3">Tell us more (optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="What made your experience special? Any suggestions?"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder:text-emerald-300/50 rounded-3xl px-6 py-4 focus:outline-none focus:border-emerald-500 resize-y"
                  />
                </div>

                {/* PHOTO UPLOAD */}
                <div>
                  <label className="block text-sm font-medium text-emerald-300 mb-3 flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Share a photo (optional)
                  </label>
                  
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-3xl p-8 text-center transition-colors">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl" />
                          <button
                            type="button"
                            onClick={() => { setImage(null); setImagePreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="h-10 w-10 mx-auto text-emerald-400 mb-4" />
                          <p className="text-emerald-300">Click to upload a photo</p>
                          <p className="text-xs text-emerald-400/60 mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                {/* CUSTOMER DETAILS */}
                <div className="pt-4 border-t border-white/10">
                  <label className="block text-sm font-medium text-emerald-300 mb-4">Your Details</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white placeholder:text-emerald-300/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white placeholder:text-emerald-300/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-4 w-full bg-white/5 border border-white/10 text-white placeholder:text-emerald-300/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white hover:bg-emerald-50 active:bg-white text-black font-semibold py-5 rounded-3xl flex items-center justify-center gap-3 text-lg transition-all disabled:opacity-70"
                >
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      Share My Experience <Send className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* LIVE REVIEWS SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className="text-xl font-medium text-white">What Our Community Says</h3>
                </div>

                {reviews.length > 0 ? (
                  <div className="relative h-[420px] overflow-hidden">
                    {reviews.map((review, index) => (
                      <div
                        key={review.id}
                        className={`absolute inset-0 transition-all duration-700 ${
                          index === currentReviewIndex 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-8 pointer-events-none'
                        }`}
                      >
                        <div className="bg-white/5 rounded-3xl p-8 h-full flex flex-col">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="text-6xl">{review.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">{review.customerName}</span>
                                <div className="flex">
                                  {Array.from({ length: review.rating }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-emerald-400">{review.serviceType}</p>
                            </div>
                          </div>

                          <p className="text-emerald-100 flex-1 text-[15px] leading-relaxed">
                            "{review.comment || 'Had an amazing experience!'}"
                          </p>

                          {review.image && (
                            <div className="mt-6 rounded-2xl overflow-hidden">
                              <img src={review.image} alt="Review" className="w-full h-48 object-cover" />
                            </div>
                          )}

                          <div className="mt-6 pt-6 border-t border-white/10 text-xs text-emerald-400/60">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-emerald-300">Be the first to share your experience!</p>
                  </div>
                )}
              </div>

              {/* TRUST BAR */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 bg-emerald-500 rounded-full border-2 border-emerald-950 flex items-center justify-center text-lg">👩🏾</div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-emerald-300">Join <span className="font-semibold text-white">2,847+</span> happy clients</p>
                    <p className="text-xs text-emerald-400/70">who've shared their stories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
