import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import AppLayout from "./components/layout/app-layout.tsx";
import Index from "./pages/Index.tsx";
import LiveStreamPage from "./pages/live/page.tsx";
import AuctionsPage from "./pages/auctions/page.tsx";
import ClassifiedsPage from "./pages/classifieds/page.tsx";
import SellerProfilePage from "./pages/seller/page.tsx";
import CreateListingPage from "./pages/create/page.tsx";
import SearchPage from "./pages/search/page.tsx";
import FavoritesPage from "./pages/favorites/page.tsx";
import MessagesPage from "./pages/messages/page.tsx";
import NotificationsPage from "./pages/notifications/page.tsx";
import SettingsPage from "./pages/settings/page.tsx";
import AdminPage from "./pages/admin/page.tsx";
import SubscriptionsPage from "./pages/subscriptions/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/classifieds" element={<ClassifiedsPage />} />
            <Route path="/profile" element={<SellerProfilePage />} />
            <Route path="/seller/:id" element={<SellerProfilePage />} />
            <Route path="/create" element={<CreateListingPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          </Route>
          {/* Full-screen pages outside layout */}
          <Route path="/live/:id" element={<LiveStreamPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
