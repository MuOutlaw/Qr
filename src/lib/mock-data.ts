// Mock data layer — designed for easy replacement with Convex queries
// Each hook simulates useQuery patterns with loading/data states

export type LiveStream = {
  _id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  thumbnailUrl: string;
  currentBid: number;
  viewerCount: number;
  isLive: boolean;
  category: "camels" | "sheep" | "goats" | "horses" | "cattle";
  location: string;
};

export type Listing = {
  _id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: "camels" | "sheep" | "goats" | "horses" | "cattle";
  location: string;
  type: "fixed" | "auction";
  createdAt: string;
};

export type Auction = {
  _id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  imageUrl: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  endsAt: string;
  category: "camels" | "sheep" | "goats" | "horses" | "cattle";
  location: string;
};

export type Bid = {
  _id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
};

export type ChatMessage = {
  _id: string;
  streamId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

export type SellerProfile = {
  _id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  totalSales: number;
  location: string;
  joinedAt: string;
  isVerified: boolean;
};

const CAMEL_IMG = "https://images.unsplash.com/photo-1599475504246-11c1217748c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const CAMEL_IMG_2 = "https://images.unsplash.com/photo-1722704264670-609ad35aaa53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const SHEEP_IMG = "https://images.unsplash.com/photo-1622043935694-6279a3a93323?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const SHEEP_IMG_2 = "https://images.unsplash.com/photo-1732121242615-fabf6d55a189?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const HORSE_IMG = "https://images.unsplash.com/photo-1645767006495-0136265e26c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const GOAT_IMG = "https://images.unsplash.com/photo-1723625449728-40e7a4d968e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const GOAT_IMG_2 = "https://images.unsplash.com/photo-1560819400-434c188f63ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";
const CATTLE_IMG = "https://images.unsplash.com/photo-1705113998960-871ba05d84cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800";

export const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    _id: "ls1",
    sellerId: "s1",
    sellerName: "عبدالله المطيري",
    sellerAvatar: "",
    title: "مزاد إبل نجدية أصيلة",
    thumbnailUrl: CAMEL_IMG,
    currentBid: 45000,
    viewerCount: 342,
    isLive: true,
    category: "camels",
    location: "الرياض",
  },
  {
    _id: "ls2",
    sellerId: "s2",
    sellerName: "محمد الدوسري",
    sellerAvatar: "",
    title: "أغنام نعيمي فاخرة",
    thumbnailUrl: SHEEP_IMG,
    currentBid: 2800,
    viewerCount: 128,
    isLive: true,
    category: "sheep",
    location: "بريدة",
  },
  {
    _id: "ls3",
    sellerId: "s3",
    sellerName: "فهد العتيبي",
    sellerAvatar: "",
    title: "حصان عربي أسود",
    thumbnailUrl: HORSE_IMG,
    currentBid: 120000,
    viewerCount: 567,
    isLive: true,
    category: "horses",
    location: "جدة",
  },
  {
    _id: "ls4",
    sellerId: "s4",
    sellerName: "سعود الشمري",
    sellerAvatar: "",
    title: "ماعز حجازي للبيع",
    thumbnailUrl: GOAT_IMG,
    currentBid: 1500,
    viewerCount: 89,
    isLive: true,
    category: "goats",
    location: "المدينة",
  },
  {
    _id: "ls5",
    sellerId: "s5",
    sellerName: "خالد القحطاني",
    sellerAvatar: "",
    title: "إبل مجاهيم سمينة",
    thumbnailUrl: CAMEL_IMG_2,
    currentBid: 35000,
    viewerCount: 214,
    isLive: true,
    category: "camels",
    location: "حائل",
  },
  {
    _id: "ls6",
    sellerId: "s6",
    sellerName: "ناصر الحربي",
    sellerAvatar: "",
    title: "أبقار هولندية حلوب",
    thumbnailUrl: CATTLE_IMG,
    currentBid: 18000,
    viewerCount: 76,
    isLive: false,
    category: "cattle",
    location: "الطائف",
  },
];

export const MOCK_AUCTIONS: Auction[] = [
  {
    _id: "a1",
    sellerId: "s1",
    sellerName: "عبدالله المطيري",
    title: "ناقة مجاهيم عمر 4 سنوات",
    imageUrl: CAMEL_IMG,
    currentBid: 45000,
    startingBid: 30000,
    bidCount: 23,
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    category: "camels",
    location: "الرياض",
  },
  {
    _id: "a2",
    sellerId: "s2",
    sellerName: "محمد الدوسري",
    title: "خروف نعيمي سمين",
    imageUrl: SHEEP_IMG,
    currentBid: 2800,
    startingBid: 1500,
    bidCount: 12,
    endsAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    category: "sheep",
    location: "بريدة",
  },
  {
    _id: "a3",
    sellerId: "s3",
    sellerName: "فهد العتيبي",
    title: "حصان عربي أصيل",
    imageUrl: HORSE_IMG,
    currentBid: 120000,
    startingBid: 80000,
    bidCount: 8,
    endsAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    category: "horses",
    location: "جدة",
  },
  {
    _id: "a4",
    sellerId: "s4",
    sellerName: "سعود الشمري",
    title: "مجموعة ماعز حجازي 10 رؤوس",
    imageUrl: GOAT_IMG_2,
    currentBid: 8500,
    startingBid: 5000,
    bidCount: 15,
    endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    category: "goats",
    location: "المدينة",
  },
  {
    _id: "a5",
    sellerId: "s5",
    sellerName: "خالد القحطاني",
    title: "إبل صفر أصيلة",
    imageUrl: CAMEL_IMG_2,
    currentBid: 55000,
    startingBid: 40000,
    bidCount: 19,
    endsAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    category: "camels",
    location: "حائل",
  },
  {
    _id: "a6",
    sellerId: "s6",
    sellerName: "ناصر الحربي",
    title: "بقرة حلوب ممتازة",
    imageUrl: CATTLE_IMG,
    currentBid: 18000,
    startingBid: 12000,
    bidCount: 7,
    endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    category: "cattle",
    location: "الطائف",
  },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    _id: "l1",
    sellerId: "s1",
    sellerName: "عبدالله المطيري",
    title: "ناقة حلوب عمر 5 سنوات",
    description: "ناقة مجاهيم حلوب بصحة ممتازة، تنتج 8 لتر يومياً",
    imageUrl: CAMEL_IMG,
    price: 35000,
    category: "camels",
    location: "الرياض",
    type: "fixed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "l2",
    sellerId: "s2",
    sellerName: "محمد الدوسري",
    title: "خراف نعيمي للبيع - 20 رأس",
    description: "خراف نعيمي أعمار مختلفة بحالة صحية ممتازة",
    imageUrl: SHEEP_IMG_2,
    price: 15000,
    category: "sheep",
    location: "بريدة",
    type: "fixed",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "l3",
    sellerId: "s3",
    sellerName: "فهد العتيبي",
    title: "فرس عربية أصيلة",
    description: "فرس عربية أصيلة بشهادة نسب، عمر 3 سنوات",
    imageUrl: HORSE_IMG,
    price: 95000,
    category: "horses",
    location: "جدة",
    type: "fixed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "l4",
    sellerId: "s4",
    sellerName: "سعود الشمري",
    title: "تيس حجازي فاخر",
    description: "تيس حجازي أصيل بصحة ممتازة، مناسب للتربية",
    imageUrl: GOAT_IMG,
    price: 3500,
    category: "goats",
    location: "المدينة",
    type: "fixed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "l5",
    sellerId: "s5",
    sellerName: "خالد القحطاني",
    title: "قعود صفر عمر سنتين",
    description: "قعود صفر بحالة ممتازة، تم تطعيمه بالكامل",
    imageUrl: CAMEL_IMG_2,
    price: 25000,
    category: "camels",
    location: "حائل",
    type: "auction",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "l6",
    sellerId: "s6",
    sellerName: "ناصر الحربي",
    title: "أبقار حلوب - 5 رؤوس",
    description: "أبقار هولندية حلوب بإنتاج عالي",
    imageUrl: CATTLE_IMG,
    price: 45000,
    category: "cattle",
    location: "الطائف",
    type: "fixed",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  { _id: "c1", streamId: "ls1", userId: "u1", userName: "أحمد", text: "كم آخر سوم؟", createdAt: new Date(Date.now() - 30000).toISOString() },
  { _id: "c2", streamId: "ls1", userId: "u2", userName: "سلطان", text: "45 ألف وراها", createdAt: new Date(Date.now() - 25000).toISOString() },
  { _id: "c3", streamId: "ls1", userId: "u3", userName: "فيصل", text: "ما شاء الله عليها", createdAt: new Date(Date.now() - 20000).toISOString() },
  { _id: "c4", streamId: "ls1", userId: "u4", userName: "عمر", text: "الله يبارك", createdAt: new Date(Date.now() - 15000).toISOString() },
  { _id: "c5", streamId: "ls1", userId: "u5", userName: "بندر", text: "46 ألف", createdAt: new Date(Date.now() - 10000).toISOString() },
  { _id: "c6", streamId: "ls1", userId: "u1", userName: "أحمد", text: "47 ألف يا جماعة", createdAt: new Date(Date.now() - 5000).toISOString() },
];

export const MOCK_SELLER: SellerProfile = {
  _id: "s1",
  name: "عبدالله المطيري",
  avatar: "",
  bio: "مربي إبل ومواشي منذ أكثر من 15 سنة. متخصص في الإبل النجدية الأصيلة.",
  rating: 4.8,
  totalSales: 234,
  location: "الرياض، المملكة العربية السعودية",
  joinedAt: "2022-01-15T00:00:00Z",
  isVerified: true,
};

// Formatting helpers
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(price) + " ر.س";
}

export function formatViewers(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K";
  }
  return count.toString();
}

export const CATEGORIES = [
  { value: "all", label: "الكل" },
  { value: "camels", label: "إبل" },
  { value: "sheep", label: "أغنام" },
  { value: "goats", label: "ماعز" },
  { value: "horses", label: "خيول" },
  { value: "cattle", label: "أبقار" },
] as const;

export const LOCATIONS = [
  "الرياض",
  "جدة",
  "بريدة",
  "حائل",
  "المدينة",
  "الطائف",
  "الدمام",
] as const;
