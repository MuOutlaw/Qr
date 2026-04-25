// Mock hooks that simulate Convex useQuery patterns
// Replace these with real Convex queries when backend is ready

import { useState, useMemo } from "react";
import {
  MOCK_LIVE_STREAMS,
  MOCK_AUCTIONS,
  MOCK_LISTINGS,
  MOCK_CHAT_MESSAGES,
  MOCK_SELLER,
  type LiveStream,
  type Auction,
  type Listing,
  type ChatMessage,
  type SellerProfile,
} from "@/lib/mock-data.ts";

type CategoryFilter = "all" | "camels" | "sheep" | "goats" | "horses" | "cattle";

export function useLiveStreams(category?: CategoryFilter): LiveStream[] | undefined {
  return useMemo(() => {
    if (!category || category === "all") return MOCK_LIVE_STREAMS;
    return MOCK_LIVE_STREAMS.filter((s) => s.category === category);
  }, [category]);
}

export function useLiveStream(id: string): LiveStream | undefined {
  return useMemo(() => {
    return MOCK_LIVE_STREAMS.find((s) => s._id === id);
  }, [id]);
}

export function useAuctions(filters?: {
  category?: CategoryFilter;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}): Auction[] | undefined {
  return useMemo(() => {
    let result = [...MOCK_AUCTIONS];
    if (filters?.category && filters.category !== "all") {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters?.location) {
      result = result.filter((a) => a.location === filters.location);
    }
    if (filters?.minPrice !== undefined) {
      result = result.filter((a) => a.currentBid >= (filters.minPrice ?? 0));
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((a) => a.currentBid <= (filters.maxPrice ?? Infinity));
    }
    return result;
  }, [filters?.category, filters?.location, filters?.minPrice, filters?.maxPrice]);
}

export function useListings(filters?: {
  category?: CategoryFilter;
  location?: string;
  type?: "fixed" | "auction";
}): Listing[] | undefined {
  return useMemo(() => {
    let result = [...MOCK_LISTINGS];
    if (filters?.category && filters.category !== "all") {
      result = result.filter((l) => l.category === filters.category);
    }
    if (filters?.location) {
      result = result.filter((l) => l.location === filters.location);
    }
    if (filters?.type) {
      result = result.filter((l) => l.type === filters.type);
    }
    return result;
  }, [filters?.category, filters?.location, filters?.type]);
}

export function useBids(_auctionId: string): ChatMessage[] | undefined {
  return MOCK_CHAT_MESSAGES;
}

export function useChatMessages(_streamId: string): ChatMessage[] | undefined {
  return MOCK_CHAT_MESSAGES;
}

export function useSellerProfile(_sellerId: string): SellerProfile | undefined {
  return MOCK_SELLER;
}

// Simulate placing a bid (returns a function like useMutation)
export function usePlaceBid() {
  const [isPending, setIsPending] = useState(false);
  const mutate = async (_args: { auctionId: string; amount: number }) => {
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsPending(false);
  };
  return { mutate, isPending };
}
