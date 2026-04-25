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

// Old full Account page (your previous account content)
import AccountContent from "@/src-pages/AccountPage";

// New Edit Profile section
import ProfileSection from "./ProfileSection";

import BookingsSection from "./BookingsSection";
import OrdersSection from "./OrdersSection";
import WishlistSection from "./WishlistSection";
import MessagesSection from "./MessagesSection";
import BudgetSection from "./BudgetSection";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); // Default tab = Account
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
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
        {/* Decorative flowers - only visible on larger screens */}
        <div className="hidden xl:block absolute top-16 right-12 text-blue-200/20 text-[160px] leading-none pointer-events-none select-none">🌸</div>
        <div className="hidden xl:block absolute bottom-28 left-8 text-blue-200/20 text-[130px] leading-none pointer-events-none select-none rotate-12">🌺</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* === WELCOME BACK SECTION (Cursive + Responsive) === */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <p className="text-blue-600 text-sm tracking-[1px] font-medium">WELCOME BACK</p>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-black leading-none">
                {firstName}
                <span className="text-blue-600"> 👑</span>
              </h1>
              <p className="text-black/60 mt-2 text-lg">
                Your personal braiding sanctuary
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-medium hover:scale-105 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3 whitespace-nowrap"
              >
                <span>Go to Admin Panel</span>
                <span className="text-xl">→</span>
              </button>
            )}
          </div>

          {/* === TABS - Mobile + Desktop Friendly === */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl rounded-3xl p-1.5 mb-10 overflow-x-auto scrollbar-hide">
              <TabsTrigger
                value="account"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <User size={20} />
                <span className="font-medium">Account</span>
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <User size={20} />
                <span className="font-medium">Profile</span>
              </TabsTrigger>

              <TabsTrigger
                value="bookings"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <Calendar size={20} />
                <span className="font-medium">Bookings</span>
              </TabsTrigger>

              <TabsTrigger
                value="orders"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <Package size={20} />
                <span className="font-medium">Orders</span>
              </TabsTrigger>

              <TabsTrigger
                value="wishlist"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <Heart size={20} />
                <span className="font-medium">Wishlist</span>
              </TabsTrigger>

              <TabsTrigger
                value="messages"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Messages</span>
              </TabsTrigger>

              <TabsTrigger
                value="budget"
                className="flex items-center justify-center gap-2 py-3.5 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-3xl transition-all whitespace-nowrap"
              >
                <TrendingUp size={20} />
                <span className="font-medium">Budget</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="account" className="mt-0">
              <AccountContent />
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <ProfileSection user={user} />
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
