'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  Package,
  Heart,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

// Import your old Account page as the default tab
import AccountContent from "@/src-pages/AccountPage";   // ← Make sure this path is correct

import ProfileSection from "./ProfileSection";
import BookingsSection from "./BookingsSection";
import OrdersSection from "./OrdersSection";
import WishlistSection from "./WishlistSection";
import MessagesSection from "./MessagesSection";
import BudgetSection from "./BudgetSection";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); // Account is now the default tab
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!data?.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-black/70">Loading your sanctuary...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";
  const firstName = user.name?.split(" ")[0] || "beautiful";

  return (
    <>
      <Navigation />

      {/* Blue Floral Background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12 relative overflow-hidden">
        {/* Decorative flowers */}
        <div className="absolute top-12 right-12 text-blue-200/30 text-[200px] leading-none pointer-events-none select-none">🌸</div>
        <div className="absolute bottom-24 left-8 text-blue-200/30 text-[160px] leading-none pointer-events-none select-none rotate-12">🌺</div>
        <div className="absolute top-1/3 left-1/4 text-blue-200/20 text-[110px] leading-none pointer-events-none select-none">🪻</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <p className="text-blue-600 text-sm tracking-widest font-medium">WELCOME BACK</p>
              <h1 className="text-5xl sm:text-6xl font-serif text-black">
                {firstName} <span className="text-blue-600">👑</span>
              </h1>
              <p className="text-black/60 mt-2 text-lg">
                Your personal braiding sanctuary
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-medium hover:scale-105 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3"
              >
                <span>Go to Admin Panel</span>
                <span className="text-xl">→</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-white/70 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-2 mb-10">
              <TabsTrigger
                value="account"
                className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base"
              >
                <User size={24} />
                <span className="font-medium">Account</span>
              </TabsTrigger>

              <TabsTrigger value="bookings" className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base">
                <Calendar size={24} />
                <span className="font-medium">Bookings</span>
              </TabsTrigger>

              <TabsTrigger value="orders" className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base">
                <Package size={24} />
                <span className="font-medium">Orders</span>
              </TabsTrigger>

              <TabsTrigger value="wishlist" className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base">
                <Heart size={24} />
                <span className="font-medium">Wishlist</span>
              </TabsTrigger>

              <TabsTrigger value="messages" className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base">
                <MessageCircle size={24} />
                <span className="font-medium">Messages</span>
              </TabsTrigger>

              <TabsTrigger value="budget" className="flex items-center justify-center gap-3 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all text-base">
                <TrendingUp size={24} />
                <span className="font-medium">Budget</span>
              </TabsTrigger>
            </TabsList>

            {/* Default tab = Your old Account page content */}
            <TabsContent value="account" className="mt-0">
              <AccountContent />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <BookingsSection />
            </TabsContent>
            <TabsContent value="orders" className="mt-0">
              <OrdersSection />
            </TabsContent>
            <TabsContent value="wishlist" className="mt-0">
              <WishlistSection />
            </TabsContent>
            <TabsContent value="messages" className="mt-0">
              <MessagesSection />
            </TabsContent>
            <TabsContent value="budget" className="mt-0">
              <BudgetSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  );
}
