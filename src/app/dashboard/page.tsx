"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, Package, Heart, MessageCircle, TrendingUp } from "lucide-react";

import ProfileSection from "./ProfileSection";
import BookingsSection from "./BookingsSection";
import OrdersSection from "./OrdersSection";
import WishlistSection from "./WishlistSection";
import MessagesSection from "./MessagesSection";
import BudgetSection from "./BudgetSection";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("local_auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setUser({
      id: 1,
      name: "Onyeka Anazor",
      email: "onyekaanazor@gmail.com",
      role: "user", // Change to "admin" or "super_admin" to test admin button
      avatar: "/images/avatar.jpg",
    });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "super_admin";

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#f8f5f0] pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif">
                Welcome back, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-black/60 text-sm sm:text-base">Manage your bookings, orders &amp; preferences</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="bg-black text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-black/90 transition-colors w-full sm:w-auto"
              >
                Go to Admin Panel
              </button>
            )}
          </div>

          {/* Tabs - Mobile friendly */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full bg-white border rounded-3xl p-1 mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <User size={18} />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <Calendar size={18} />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <Package size={18} />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <Heart size={18} />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <MessageCircle size={18} />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2 text-xs sm:text-sm py-3">
                <TrendingUp size={18} />
                <span className="hidden sm:inline">Budget</span>
              </TabsTrigger>
            </TabsList>

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
