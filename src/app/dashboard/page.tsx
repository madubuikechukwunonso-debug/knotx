'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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

type DashboardTab =
  | "account"
  | "profile"
  | "bookings"
  | "orders"
  | "wishlist"
  | "messages"
  | "budget";

const tabItems: {
  value: DashboardTab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { value: "account", label: "Account", icon: User },
  { value: "profile", label: "Profile", icon: User },
  { value: "bookings", label: "Bookings", icon: Calendar },
  { value: "orders", label: "Orders", icon: Package },
  { value: "wishlist", label: "Wishlist", icon: Heart },
  { value: "messages", label: "Messages", icon: MessageCircle },
  { value: "budget", label: "Budget", icon: TrendingUp },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("account");
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-12 relative overflow-hidden">
        <div className="hidden xl:block absolute top-16 right-12 text-blue-200/20 text-[160px] leading-none pointer-events-none select-none">
          🌸
        </div>
        <div className="hidden xl:block absolute bottom-28 left-8 text-blue-200/20 text-[130px] leading-none pointer-events-none select-none rotate-12">
          🌺
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <p className="text-blue-600 text-sm tracking-[1px] font-medium">
                WELCOME BACK
              </p>
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

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashboardTab)}>
            <div className="mb-10">
              <div className="rounded-[2rem] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-xl p-2 sm:p-3">
                <div className="flex gap-3 overflow-x-auto pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`shrink-0 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                            : "bg-white text-black/70 hover:bg-white/90"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  {tabItems.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    return (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setActiveTab(tab.value)}
                        className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                            : "bg-white/80 text-black/70 hover:bg-white"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

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
