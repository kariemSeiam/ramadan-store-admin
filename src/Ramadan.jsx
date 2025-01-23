import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext
} from 'react';

import {
  Package, MapPin, Gift, Navigation, Phone, Store, Heart, Edit3, CheckCircle, ZoomOut, Moon, Edit2, Building2, Navigation2,
  Share2, ChevronDown, Star, User, Search, ShoppingCart, Loader2, Landmark, Delete, Trash2, LogOut, ExternalLink, Minus,
  ArrowRight, Clock, Calendar, Filter, CreditCard, Truck, RefreshCw, ChevronLeft, CheckCircle2, MapPinOff, Coffee, Users,
  Shield, ArrowLeft, ZoomIn, X, Check, AlertCircle, Copy, MessageCircle, Facebook, ChevronRight, Compass, Book, Plus
} from 'lucide-react';

import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import _ from 'lodash';
import ImageViewer from './ImageViewer';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders.jsx';
import { useCart } from '../hooks/useCart.jsx';
import { toast, Toaster } from 'react-hot-toast'; // For notifications
import { formatCurrency, formatDate, formatTime, formatRelativeTime } from '../utils/formatting.jsx';

// Create context
export const AuthContext = createContext();


// Constants
const prayerMatColors = [
  {
    id: 'pearl-white-geometric',
    name: 'أبيض لؤلؤي هندسي',
    hex: '#f8fafc',
    image: 'https://laviewedding.shop/cdn/shop/files/7_37f23a6c-dfc0-4c50-be0b-c629d541a5c3.jpg?v=1736077166',
    price: 350
  },
  {
    id: 'golden-aqsa',
    name: 'ذهبي القدس',
    hex: '#b7791f',
    image: 'https://laviewedding.shop/cdn/shop/files/9_0bed9031-1886-4121-9b51-a9734d599689.jpg?v=1736077166',
    price: 350
  },
  {
    id: 'turquoise-mosque',
    name: 'فيروزي المسجد',
    hex: '#2dd4bf',
    image: 'https://laviewedding.shop/cdn/shop/files/1_880e5e54-d234-4d3a-ab13-0d9d8e639b06.jpg?v=1736077166',
    price: 350
  },
  {
    id: 'pink-blossom',
    name: 'وردي زهري',
    hex: '#ec4899',
    image: 'https://laviewedding.shop/cdn/shop/files/4_a677f586-4828-4419-a4a1-841645856719.jpg?v=1736077166',
    price: 350
  }
];

const packageContents = [
  { icon: "🎁", title: "شنطه التراويح", description: "مقاسها كبير تتسع لمستلزمات الصلاة" },
  { icon: "🕌", title: "سجاده صلاه قطيفة", description: "خامة فاخرة وناعمة" },
  { icon: "📿", title: "سبحة عدد 100 حبه", description: "تصميم أنيق" },
  { icon: "📅", title: "مخطط رمضان", description: "لتنظيم العبادات والأذكار" },
  { icon: "📖", title: "فاصل للمصحف", description: "لورد القرآن" },
  { icon: "💌", title: "كارت الاهداء", description: "لإضافة لمسة شخصية" },
  { icon: "🌙", title: "كارت اذكار", description: "أذكار الصباح والمساء" },
  { icon: "🎁", title: "🎁", description: "" }
];

// Snap positions in pixels instead of percentages for better control
const SNAP_POSITIONS = {
  PEEK: window.innerHeight * 0.92,
  HALF: 400,
  FULL: window.innerHeight * 0.92
};

// Enhanced store data structure
const nearbyStores = [
  {
    id: 1,
    name: "متجر النور الإسلامي",
    slugName: "noor-islamic",
    distance: "0.8 كم",
    address: "شارع التحرير، وسط البلد",
    phone: "01234567890",
    hasWhatsapp: true,
    socials: {
      facebook: "https://www.facebook.com/groups/529392277944647",
      whatsapp: "+201234567890",
      maps: "ChIJB7jI9oQVWBQRheyPTEzLekk"
    },
    rating: {
      score: 4.8,
      reviews: 234,
      breakdown: {
        5: 180,
        4: 40,
        3: 10,
        2: 3,
        1: 1
      }
    },
    hours: {
      open: "9:00",
      close: "22:00",
      isOpen: true,
      schedule: {
        weekdays: "9:00 ص - 10:00 م",
        weekends: "10:00 ص - 11:00 م"
      }
    },
    features: ["parking", "cards", "delivery"],
    inventory: {
      status: "in_stock",
      items: 50,
      popular: ["prayer_mats", "quran", "gifts"]
    }
  },
  {
    id: 2,
    name: "معرض الهدايا الإسلامية",
    slugName: "islamic-gifts",
    distance: "1.2 كم",
    address: "شارع المعز، الحسين",
    phone: "01198765432",
    hasWhatsapp: true,
    socials: {
      facebook: "https://www.facebook.com/groups/526518181",
      whatsapp: "+201198765432",
      maps: "ChIJB7jI9oQVWBQRheysdasdasdLekk"
    },
    rating: {
      score: 4.9,
      reviews: 187,
      breakdown: {
        5: 150,
        4: 30,
        3: 5,
        2: 2,
        1: 0
      }
    },
    hours: {
      open: "10:00",
      close: "23:00",
      isOpen: true,
      schedule: {
        weekdays: "10:00 ص - 11:00 م",
        weekends: "11:00 ص - 12:00 م"
      }
    },
    features: ["parking", "cards", "delivery", "wifi"],
    inventory: {
      status: "limited",
      items: 30,
      popular: ["prayer_mats", "abayas", "gifts"]
    }
  }
];

const StoreCard = ({ store, onShare, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

  const handleNavigate = async () => {
    setIsLoading(true);
    await onNavigate(store);
    setIsLoading(false);
  };

  const getStatusBadge = () => {
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= parseInt(store.hours.open) &&
      currentHour < parseInt(store.hours.close);

    return (
      <div className={`no-scrollbar px-3 py-1 rounded-full text-sm flex items-center gap-2
                    ${isOpen ? 'bg-green-500/10 text-green-500' :
          'bg-red-500/10 text-red-500'}`}>
        <div className={`no-scrollbar w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' :
          'bg-red-500'} animate-pulse`} />
        <span>{isOpen ? 'مفتوح' : 'مغلق'}</span>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className="group/card relative bg-gradient-to-br from-gray-800/40 to-gray-800/20 
                 backdrop-blur-xl rounded-2xl border border-gray-700/50
                 hover:border-amber-500/30 transition-all duration-500
                 hover:shadow-lg hover:shadow-amber-500/5"
    >
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Store Info */}
          <div className="flex-1 text-right">
            <div className="flex justify-between items-start">
              {getStatusBadge()}
              <h3 className="text-xl font-bold text-white group-hover/card:text-amber-500 
                          transition-colors duration-300">
                {store.name}
              </h3>
            </div>

            {/* Rating Section */}
            <div className="flex items-center gap-2 justify-end mt-3">
              <span className="text-gray-400 text-sm">({store.rating.reviews})</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-medium text-white">{store.rating.score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Store Details */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-end gap-3 text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-sm">{store.distance}</span>
              <span className="text-sm">·</span>
              <span className="text-sm">{store.address}</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-gray-800/50 flex items-center 
                         justify-center">
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 text-gray-400">
            <span className="text-sm">{store.hours.schedule.weekdays}</span>
            <div className="w-8 h-8 rounded-xl bg-gray-800/50 flex items-center 
                         justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 justify-end">
          {/* Share Button */}
          <button
            onClick={() => onShare(store)}
            className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700 
                     transition-colors group/btn"
          >
            <Share2 className="w-5 h-5 text-amber-500 group-hover/btn:scale-110 
                           transition-transform" />
          </button>

          {/* Navigate Button */}
          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className="p-3 rounded-xl bg-gray-800/50 hover:bg-gray-700 
                     transition-colors group/btn"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5 text-amber-500 group-hover/btn:scale-110 
                                 transition-transform" />
            )}
          </button>

          {/* WhatsApp Button (if available) */}
          {store.hasWhatsapp && (
            <a
              href={`https://wa.me/${store.socials.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-green-500 hover:bg-green-600 
                       transition-colors group/btn"
            >
              <MessageCircle className="w-5 h-5 text-white group-hover/btn:scale-110 
                                    transition-transform" />
            </a>
          )}

          {/* Phone Button */}
          <a
            href={`tel:${store.phone}`}
            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 
                     transition-colors group/btn"
          >
            <Phone className="w-5 h-5 text-white group-hover/btn:scale-110 
                           transition-transform" />
          </a>
        </div>

        {/* Social Links */}
        {store.socials.facebook && (
          <div className="mt-4">
            <a
              href={store.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-end gap-2 text-amber-500 
                       hover:text-amber-400 transition-colors text-sm group/link"
            >
              <span>صفحة المتجر</span>
              <Facebook className="w-4 h-4 group-hover/link:scale-110 
                               transition-transform" />
            </a>
          </div>
        )}
      </div>

      {/* Features Section (Optional) */}
      {store.features && store.features.length > 0 && (
        <div className="px-6 pb-4 flex gap-2 justify-end flex-wrap">
          {store.features.map(feature => (
            <span
              key={feature}
              className="px-2 py-1 rounded-full text-xs bg-gray-800/50 
                       text-gray-400"
            >
              {feature}
            </span>
          ))}
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br 
                   from-amber-500/0 to-amber-500/0 opacity-0 
                   group-hover/card:opacity-10 transition-opacity duration-500" />
    </div>
  );
};

const NearbyPlacesSheet = ({ isOpen, onClose, selectedColor, stores = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [snapPosition, setSnapPosition] = useState(SNAP_POSITIONS.PEEK);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(null);
  const [currentY, setCurrentY] = useState(null);
  const sheetRef = useRef(null);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async (store) => {
    try {
      await navigator.share({
        title: store.name,
        text: `تعرف على ${store.name} - ${store.address}`,
        url: store.url
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNavigate = (store) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}&query_place_id=${store.place_id}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`no-scrollbar fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                 transition-all duration-300
                 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        ref={sheetRef}
        style={{
          height: snapPosition,
          transform: isDragging && currentY && startY
            ? `translateY(${Math.max(0, currentY - startY)}px)`
            : undefined
        }}
        className={`no-scrollbar fixed left-0 right-0 bottom-0 transition-all duration-300 
                   ease-out bg-gradient-to-b from-gray-900/95 to-gray-900 
                   backdrop-blur-xl rounded-t-3xl border-t border-gray-800/50 
                   shadow-xl hide-scrollbar overflow-hidden
                   ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
          <div className="w-12 h-1 rounded-full bg-gray-700 mt-3" />
        </div>

        {/* Header */}
        <div className="pt-8 px-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-800/50 text-gray-400
                     hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-white">المتاجر القريبة</h2>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="ابحث عن متجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSnapPosition(SNAP_POSITIONS.FULL)}
              className="w-full h-12 bg-gray-800/50 rounded-xl px-12 text-white
                     text-right border border-gray-700/50
                     focus:ring-2 focus:ring-amber-500/50
                     focus:border-amber-500/50 transition-all"
              dir="rtl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Store List */}
        <div className="px-4 hide-scrollbar overflow-y-auto"
          style={{ height: `calc(${snapPosition}px - 140px)` }}>
          <div className="space-y-4 pb-6">
            {filteredStores.length > 0 ? (
              nearbyStores.map(store => (
                <StoreCard
                  key={store.id}
                  store={store}
                  selectedColor={selectedColor}
                  onShare={handleShare}
                  onNavigate={handleNavigate}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full 
                             bg-gray-800 flex items-center justify-center">
                  <MapPinOff className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-gray-400">
                  جرب البحث بكلمات مختلفة
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CreativeFAB = ({
  quantity,
  items,
  onAddToCart,
  onUpdateQuantity,
  selectedColor,
  onRemoveItem,
  onCheckout,
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showCartHint, setShowCartHint] = useState(false);
  const [addButtonWidth, setAddButtonWidth] = useState('w-32');

  // Dynamic button width based on screen size
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 380) setAddButtonWidth('w-28');
      else if (width < 640) setAddButtonWidth('w-32');
      else setAddButtonWidth('w-40');
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleAddToCart = () => {
    onAddToCart();
    setAddedAnimation(true);

    // Animate success state
    setTimeout(() => {
      setAddedAnimation(false);
      // Show cart hint with delay
      setTimeout(() => {
        setShowCartHint(true);
        // Hide hint after 3 seconds
        setTimeout(() => setShowCartHint(false), 3000);
      }, 300);
    }, 1000);
  };

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <>
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onCheckout={onCheckout}
      />

      {/* Main FAB Container */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-30">
        <div className="max-w-lg mx-auto relative">
          {/* Enhanced Cart Hint with Animation */}
          <div className={`absolute bottom-full left-1/3 -translate-x-1/2 mb-4 
                        transition-all duration-500 ease-out transform
                        ${showCartHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 
                          text-white px-5 py-2.5 rounded-xl shadow-lg
                          flex items-center gap-2 whitespace-nowrap
                          border border-amber-400/20 backdrop-blur-sm">
              <ShoppingCart className="w-4 h-4 animate-bounce" />
              <span className="text-sm font-medium">اضغط هنا لتأكيد طلبك</span>
              <ChevronRight className="w-4 h-4 animate-pulse" />
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 
                            w-3 h-3 bg-gradient-to-br from-amber-500 to-amber-600 rotate-45" />
            </div>
          </div>

          {/* Enhanced FAB Group */}
          <div className="bg-gray-900/95 backdrop-blur-xl p-2 rounded-full 
                         border border-gray-700/50 shadow-xl
                         flex items-center justify-between gap-2">

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex-1 h-12 rounded-full flex items-center justify-center gap-3 px-2
                       bg-gradient-to-r from-gray-800/80 to-gray-700/80 
                       hover:from-gray-700/80 hover:to-gray-600/80
                       transition-all duration-300 border border-gray-700/50 
                       group relative overflow-hidden"
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className="font-bold bg-gradient-to-r from-amber-400 to-amber-500 
                               bg-clip-text text-transparent text-sm sm:text-base
                               group-hover:scale-105 transition-transform">
                  {totalAmount.toLocaleString('ar-EG')} جنيه
                </span>
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-amber-500 
                                       group-hover:scale-110 group-hover:rotate-12
                                       transition-all duration-300" />
                  {items.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 
                                 bg-gradient-to-r from-red-500 to-red-600
                                 text-white rounded-full flex items-center justify-center 
                                 text-xs font-bold scale-100 group-hover:scale-110
                                 transition-transform">
                      {items.length}
                      <div className="absolute inset-0 rounded-full animate-ping 
                                   bg-gradient-to-r from-red-500/40 to-red-600/40" />
                    </div>
                  )}
                </div>
              </div>
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-700/30 to-gray-700/0
                           translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>

            {/* Enhanced Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addedAnimation}
              className={`${addButtonWidth} h-12 rounded-full relative overflow-hidden px-16
                       transition-all duration-500 transform
                       ${addedAnimation
                  ? 'bg-gradient-to-r from-green-500 to-green-600 scale-105'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-105'
                }`}
            >
              <div className={`absolute inset-0 flex items-center justify-center
                           transition-transform duration-500
                           ${addedAnimation ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-sm">تم الإضافة</span>
                </div>
              </div>

              <div className={`absolute inset-0 flex items-center justify-center
                           transition-transform duration-500
                           ${addedAnimation ? '-translate-y-full' : 'translate-y-0'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90">{quantity}×</span>
                  <span className="font-bold text-white text-sm">أضف للسلة</span>
                </div>
              </div>

              {/* Dynamic color indicator */}
              <div className="absolute right-0 top-0 h-full w-2.5 transition-all duration-300"
                style={{ backgroundColor: selectedColor.hex }} />

              {/* Add ripple effect on click */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0
                           translate-x-[-100%] hover:translate-x-[100%] 
                           transition-transform duration-1000" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Animation Overlay */}
      <div className={`fixed inset-0 z-50 pointer-events-none flex items-center 
                    justify-center transition-all duration-500
                    ${addedAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white 
                     px-6 py-3 rounded-full flex items-center gap-3 shadow-lg
                     animate-bounce border border-green-400/20 backdrop-blur-sm">
          <Check className="w-5 h-5" />
          <span className="font-bold">تمت الإضافة للسلة</span>
        </div>
      </div>
    </>
  );
};

// Custom Animation Keyframes
const styles = `
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .hide-scrollbar {
    -ms-hide-scrollbar overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Add the styles to the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Enhanced Bottom Sheet Component with Gestures
const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const sheetRef = useRef(null);
  const [startY, setStartY] = useState(null);
  const [currentY, setCurrentY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!startY) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!startY || !currentY) {
      setIsDragging(false);
      setStartY(null);
      setCurrentY(null);
      return;
    }

    const diff = currentY - startY;
    if (diff > 100) {
      onClose();
    }

    setIsDragging(false);
    setStartY(null);
    setCurrentY(null);
  };

  const getSheetStyle = () => {
    if (!isDragging || !startY || !currentY) {
      return {};
    }

    const diff = currentY - startY;
    if (diff < 0) return {};

    return {
      transform: `translateY(${diff}px)`,
      transition: 'none'
    };
  };

  return (
    <div
      className={`no-scrollbar fixed inset-0 bg-black/60 backdrop-blur-sm z-50 
                 transition-opacity duration-300 
                 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div
        ref={sheetRef}
        style={getSheetStyle()}
        className={`no-scrollbar fixed inset-x-0 bottom-0 transform transition-transform 
                   duration-300 ease-out will-change-transform
                   ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 
                      backdrop-blur-xl rounded-t-[2.5rem] hide-scrollbar overflow-hidden 
                      border-t border-gray-800/50 shadow-xl">
          {/* Handle */}
          <div className="absolute inset-x-0 top-0 h-7 flex justify-center 
                        items-start cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1 rounded-full bg-gray-700 mt-3 opacity-50" />
          </div>

          {/* Header */}
          <div className="pt-8 px-6 pb-4">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 
                         transition-colors group"
              >
                <ChevronDown className="w-6 h-6 text-gray-400 
                                    group-hover:text-white transition-colors" />
              </button>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 max-h-[75vh] hide-scrollbar overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Phone Verification Sheet
const PhoneVerificationSheet = ({
  isOpen,
  onClose,
  onVerified,
  loading: externalLoading,
  savedPhone = ''
}) => {
  const [phone, setPhone] = useState(savedPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);

  useEffect(() => {
    const isValid = /^01[0125][0-9]{8}$/.test(phone);
    setIsValidPhone(isValid);
  }, [phone]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onVerified({ phone_number: phone });
      onClose();
    } catch (error) {
      console.error('Phone verification failed:', error);
      toast.error(error.message || 'فشل تسجيل رقم الهاتف');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setPhone(savedPhone);
    }
  }, [isOpen, savedPhone]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="إدخال رقم الهاتف"
    >
      <div className="p-6 space-y-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 mx-auto 
                     flex items-center justify-center relative hide-scrollbar overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Phone className="w-12 h-12 text-white relative z-10" />
        </div>

        <div className="text-center">
          <h4 className="text-xl font-bold text-white mb-2">
            أدخل رقم هاتفك
          </h4>
          <p className="text-gray-400 mb-2">
            سنستخدم هذا الرقم للتواصل معك
          </p>
          <p className="text-amber-500 text-sm">
            يفضل إدخال رقم الواتساب لتسهيل التواصل
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl p-4 
                       text-center text-xl tracking-wide
                       focus:ring-4 focus:ring-amber-500/50 border-none"
              dir="ltr"
            />
            {phone && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isValidPhone ? (
                  <Check className="w-6 h-6 text-green-500 animate-pulse" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 animate-pulse" />
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValidPhone || isLoading || externalLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white 
                     rounded-xl py-4 font-bold uppercase tracking-wider
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:from-amber-600 hover:to-amber-700 
                     transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {isLoading || externalLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري التحقق...</span>
              </div>
            ) : (
              'تأكيد رقم الهاتف'
            )}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};

const LocationPicker = ({ isOpen, onClose, onLocationSelect }) => {
  // Form state with enhanced validation
  const [formData, setFormData] = useState({
    governorate: '',
    city: '',
    street: '',
    details: ''
  });

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [recentLocations] = useState([
    { governorate: 'القاهرة', city: 'مدينة نصر', street: 'شارع عباس العقاد' },
    { governorate: 'الجيزة', city: 'الدقي', street: 'شارع التحرير' }
  ]);

  // Enhanced steps configuration with animations
  const steps = [
    {
      id: 1,
      field: 'governorate',
      label: 'في أي محافظة؟',
      icon: Compass,
      placeholder: 'مثال: القاهرة',
      suggestions: ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة']
    },
    {
      id: 2,
      field: 'city',
      label: 'المدينة أو الحي',
      icon: Building2,
      placeholder: 'مثال: مدينة نصر',
      suggestions: formData.governorate === 'القاهرة'
        ? ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'وسط البلد']
        : []
    },
    {
      id: 3,
      field: 'street',
      label: 'اسم الشارع',
      icon: Navigation2,
      placeholder: 'مثال: شارع التحرير'
    },
    {
      id: 4,
      field: 'details',
      label: 'تفاصيل إضافية',
      icon: MapPin,
      placeholder: 'علامة مميزة تساعد في الوصول (اختياري)'
    }
  ];

  // Reset form state on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setFormData({
          governorate: '',
          city: '',
          street: '',
          details: ''
        });
        setError(null);
        setSuggestions([]);
      }, 300);
    }
  }, [isOpen]);

  const handleInputChange = (value) => {
    const currentField = steps[step - 1].field;
    setFormData(prev => ({ ...prev, [currentField]: value }));
    setError(null);

    if (steps[step - 1].suggestions) {
      const filtered = steps[step - 1].suggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(value ? filtered : []);
    }
  };

  const handleSuggestionSelect = (value) => {
    handleInputChange(value);
    setSuggestions([]);
    if (step < steps.length) {
      setTimeout(() => setStep(s => s + 1), 300);
    }
  };

  const handleRecentSelect = (location) => {
    setFormData(location);
    setStep(4);
  };

  const canProceed = useCallback(() => {
    const currentValue = formData[steps[step - 1].field];
    return step === 4 ? true : currentValue.length >= 3;
  }, [step, formData, steps]);

  const handleNext = () => {
    if (!canProceed()) {
      setError('برجاء إدخال بيانات صحيحة');
      return;
    }

    if (step === steps.length) {
      setIsLoading(true);
      setTimeout(() => {
        onLocationSelect({
          name: `${formData.city}، ${formData.governorate}`,
          details: `${formData.street}${formData.details ? ` - ${formData.details}` : ''}`,
          coords: [30.0444, 31.2357]
        });
        setIsLoading(false);
        onClose();
      }, 800);
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transform transition-all duration-500
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Enhanced backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main sheet with improved animations */}
      <div className="absolute inset-x-0 bottom-0 transform transition-all duration-500">
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl
                       rounded-t-[2.5rem] overflow-hidden border-t border-gray-800/50 shadow-2xl">
          {/* Floating handle */}
          <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
            <div className="w-12 h-1 rounded-full bg-gray-700/50 mt-3" />
          </div>

          {/* Enhanced header with RTL layout */}
          <div className="pt-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors group"
              >
                <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
              </button>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold text-white">تحديد العنوان</h2>
              </div>
            </div>

            {/* Enhanced progress indicator */}
            <div className="flex justify-between items-center mb-6">
              {steps.map((s, index) => (
                <div key={s.id} className="relative flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                                 transition-all duration-300 transform
                                 ${step === s.id ? 'bg-amber-500 text-white scale-110' :
                      step > s.id ? 'bg-amber-500/50 text-white' :
                        'bg-gray-800/80 text-gray-500'}`}>
                    {step > s.id ? (
                      <CheckCircle2 className="w-5 h-5 animate-pulse" />
                    ) : (
                      <span className="text-sm">{s.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-12 mx-1 transition-all duration-300
                                   ${step > s.id ? 'bg-amber-500/50' : 'bg-gray-800/80'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced content area with RTL support */}
          <div className="px-6 pb-8">
            {/* Current step with improved animations */}
            <div className="mb-6"
              dir='rtl'>
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(steps[step - 1].icon, {
                  className: "w-6 h-6 text-amber-500 animate-pulse"
                })}
                <h3 className="text-xl font-bold text-white">
                  {steps[step - 1].label}
                </h3>
              </div>

              {/* Enhanced input field */}
              <div className="relative rtl">
                <input
                  type="text"
                  value={formData[steps[step - 1].field]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={steps[step - 1].placeholder}
                  className="w-full h-14 bg-gray-800/50 rounded-xl px-6 text-white text-right
                           border border-gray-700/50 focus:ring-2 focus:ring-amber-500/30
                           focus:border-amber-500/50 transition-all placeholder-gray-500"
                  dir="rtl"
                />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-2 bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="w-full p-3 text-right text-white hover:bg-amber-500/10
                               transition-colors border-b border-gray-700/50 last:border-none
                               flex items-center justify-end gap-2"
                    >
                      <span>{suggestion}</span>
                      <Search className="w-4 h-4 text-amber-500" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Enhanced error message */}
            {error && (
              <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-500/10
                            rounded-xl p-3 animate-shake">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Enhanced action button */}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600
                       text-white rounded-xl font-bold hover:brightness-110
                       transition-all duration-300 transform hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-between px-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent
                              rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  <span>{step === steps.length ? 'تأكيد العنوان' : 'التالي'}</span>
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Cart Sheet with Micro-interactions
const CartSheet = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`no-scrollbar fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Cart Sheet */}
      <div
        className={`no-scrollbar fixed inset-x-0 bottom-0 z-50 transform transition-all duration-500 ease-out
                   ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl 
                      rounded-t-[2.5rem]  hide-scrollbar overflow-hidden shadow-2xl
                      border-t border-gray-800/50">
          {/* Handle */}
          <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
            <div className="w-12 h-1 rounded-full bg-gray-700 mt-3 opacity-50" />
          </div>

          {/* Header */}
          <div className="pt-8 px-6 pb-4">
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors
                         group"
              >
                <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-white
                                     transition-colors" />
              </button>
              <h3 className="text-2xl font-bold text-white">سلة التسوق</h3>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 hide-scrollbar overflow-auto max-h-[60vh]">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-amber-500/0 
                                rounded-full animate-spin-slow" />
                  <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center 
                                justify-center">
                    <ShoppingCart className="w-10 h-10 text-amber-500" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">السلة فارغة</h4>
                <p className="text-gray-400 max-w-[250px] mx-auto">
                  اختر منتجاتك المفضلة وأضفها للسلة لتتمتع بتجربة تسوق مميزة
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-r from-gray-800/50 to-gray-800/30 
                             backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50
                             hover:border-amber-500/30 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl hide-scrollbar overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transform 
                                   group-hover:scale-110 transition-transform duration-500"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="p-1.5 -mt-1 -mr-1 rounded-full hover:bg-red-500/10
                                     group/remove transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500 opacity-60 
                                      group-hover/remove:opacity-100" />
                          </button>
                          <div className="text-right">
                            <h4 className="font-bold text-white group-hover:text-amber-500
                                       transition-colors">{item.name}</h4>
                            <p className="text-sm text-gray-400">{item.colorName}</p>
                          </div>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex justify-between items-center mt-3">
                          <span className="font-bold text-amber-500">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <div className="flex items-center gap-3 bg-gray-800/50 rounded-full
                                        px-2 py-1">
                            <button
                              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center
                                       hover:bg-gray-700 transition-colors"
                            >
                              -
                            </button>
                            <span className="text-white font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center
                                       hover:bg-gray-700 transition-colors text-amber-500"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-500 font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                  <span className="text-gray-400">المجموع</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-500 font-medium">
                    {formatCurrency(shipping)}
                  </span>
                  <span className="text-gray-400">الشحن</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">
                    {formatCurrency(total)}
                  </span>
                  <span className="font-bold text-white">الإجمالي</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
                className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 
                         rounded-2xl font-bold text-white text-lg
                         hover:brightness-110 transform hover:-translate-y-0.5
                         transition-all duration-300 shadow-lg shadow-amber-500/25"
              >
                إتمام الشراء
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Enhanced OrdersView Component
const OrdersView = ({ orders, onClose, formatCurrency, formatDate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Status color and text mapping
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bgClass: 'bg-yellow-500/20 text-yellow-500',
          text: 'قيد التنفيذ',
          icon: <Clock className="w-4 h-4 mr-1" />
        };
      case 'Processing':
        return {
          bgClass: 'bg-blue-500/20 text-blue-500',
          text: 'جاري التجهيز',
          icon: <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
        };
      case 'Delivered':
        return {
          bgClass: 'bg-green-500/20 text-green-500',
          text: 'تم التوصيل',
          icon: <MapPin className="w-4 h-4 mr-1" />
        };
      default:
        return {
          bgClass: 'bg-red-500/20 text-red-500',
          text: 'ملغي',
          icon: <X className="w-4 h-4 mr-1" />
        };
    }
  };

  const filteredOrders = orders.filter(order =>
    filterStatus === 'all' || order.status === filterStatus
  );

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 z-40 hide-scrollbar overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm">
            <div className="px-4 py-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-white">طلباتي</h2>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 pb-4">
              <div className="flex gap-2 hide-scrollbar overflow-x-auto hide-scrollbar">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'Pending', label: 'قيد التنفيذ' },
                  { id: 'Processing', label: 'جاري التجهيز' },
                  { id: 'Delivered', label: 'تم التوصيل' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterStatus(tab.id)}
                    className={`no-scrollbar px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${filterStatus === tab.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="flex-1 hide-scrollbar overflow-auto pb-8">
            <div className="px-4 space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsOpen(true);
                      }}
                      className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 
                                rounded-2xl p-6 border border-gray-700/50 
                                hover:border-amber-500/30 transition-all duration-300 
                                cursor-pointer group animate-fade-in"
                    >
                      {/* Order Header */}
                      <div className="flex justify-between items-start mb-4">
                        <span className={`no-scrollbar px-3 py-1 rounded-full text-sm inline-flex 
                                     items-center ${statusStyle.bgClass}`}>
                          {statusStyle.icon}
                          {statusStyle.text}
                        </span>
                        <div className="text-right">
                          <h3 className="font-bold text-white group-hover:text-amber-500 
                                     transition-colors">
                            طلب #{order.id}
                          </h3>
                          <p className="text-sm text-gray-400">{formatDate(order.created_at)}</p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="flex gap-2 justify-end mb-4 hide-scrollbar overflow-x-auto hide-scrollbar">
                        {order.items.slice(0, 4).map((item, index) => (
                          <div
                            key={index}
                            className="w-16 h-16 flex-shrink-0 rounded-lg hide-scrollbar overflow-hidden 
                                      border-2 border-gray-700 group-hover:border-amber-500 
                                      transition-all duration-300"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-800 rounded-lg 
                                        flex items-center justify-center text-white">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="flex justify-between items-center pt-4 
                                    border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-amber-500" />
                          <span className="text-gray-400 text-sm">
                            {order.items.length} منتج
                          </span>
                        </div>
                        <span className="text-amber-500 font-bold text-lg">
                          {formatCurrency(order.total_price)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-800 
                                to-gray-900 mx-auto mb-6 flex items-center justify-center 
                                relative hide-scrollbar overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 
                                  to-amber-500/0 animate-spin-slow rounded-full" />
                    <Package className="w-12 h-12 text-amber-500 relative z-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-400 mb-6">
                    ابدأ التسوق الآن واستمتع بمجموعتنا المميزة
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 
                             text-white rounded-xl px-8 py-3 font-bold 
                             hover:brightness-110 transition-all duration-300 
                             transform hover:-translate-y-0.5 shadow-lg 
                             shadow-amber-500/25"
                  >
                    تسوق الآن
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Bottom Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setTimeout(() => setSelectedOrder(null), 300);
        }}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusStyle={getStatusStyle}
      />
    </>
  );
};

// Timeline Component for Order Status
const OrderTimeline = ({ status }) => {
  const steps = [
    { id: 'Pending', label: 'تم الطلب', icon: Clock },
    { id: 'Processing', label: 'جاري التجهيز', icon: Package },
    { id: 'Shipping', label: 'في الطريق', icon: Truck },
    { id: 'Delivered', label: 'تم التوصيل', icon: Shield }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === status);

  return (
    <div className="relative py-6">

      <div className="relative flex justify-between mx-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStepIndex;
          const isCurrentStep = index === currentStepIndex;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`no-scrollbar w-10 h-10 rounded-full flex items-center justify-center 
                          ${isActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-800 text-gray-500'} 
                          ${isCurrentStep ? 'ring-4 ring-amber-500/20' : ''} 
                          transition-all duration-300`}
              >
                <Icon className={`no-scrollbar w-5 h-5 ${isCurrentStep ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`no-scrollbar mt-2 text-sm ${isActive ? 'text-white' : 'text-gray-500'
                }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SupportActions = () => {
  const actions = [
    {
      icon: MessageCircle,
      label: 'تحدث معنا',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      action: () => window.open('https://wa.me/+201033939828', '_blank')
    },
    {
      icon: Phone,
      label: 'اتصل بنا',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      action: () => window.open('tel:+201033939828', '_blank')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`no-scrollbar ${action.bgColor} rounded-xl p-4 flex flex-col items-center 
                     gap-2 hover:brightness-110 transition-all duration-300`}
        >
          <action.icon className={`no-scrollbar w-6 h-6 ${action.color}`} />
          <span className="text-sm text-white text-center">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
};

// Main Order Details Component
const OrderDetailsSheet = ({
  order,
  isOpen,
  onClose,
  formatCurrency,
  formatDate,
  getStatusStyle
}) => {
  if (!order) return null;

  const { status } = order;
  const statusStyle = getStatusStyle(status);


  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="تفاصيل الطلب"
    >

      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex items-center justify-between bg-gray-800/50 
                      rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <span className={`no-scrollbar px-3 py-1 rounded-full text-sm inline-flex 
                          items-center ${statusStyle.bgClass}`}>
              {statusStyle.icon}
              {statusStyle.text}
            </span>
            <span className="text-gray-400">
              {formatDate(order.created_at)}
            </span>
          </div>
          <h3 className="font-bold text-white">
            طلب #{order.id}
          </h3>
        </div>

        {/* Order Timeline */}
        <OrderTimeline status={status} />

        {/* Order Items */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-lg">المنتجات</h4>
          {order.items.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 
                        rounded-xl p-4 flex items-center gap-4 border 
                        border-gray-700/50 hover:border-amber-500/30 
                        transition-all duration-300"
            >
              <div className="relative w-20 h-20 rounded-xl hide-scrollbar overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transform 
                           hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t 
                              from-black/40 to-transparent" />
                <div className="absolute bottom-1 right-1 bg-black/50 
                              rounded-full px-2 py-0.5 text-xs text-white">
                  {item.quantity}×
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-amber-500">
                    {formatCurrency(item.price)}
                  </span>
                  <div className="text-right">
                    <h4 className="font-bold text-white">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.colorName}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 
                      rounded-xl p-4 border border-gray-700/50">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-amber-500 font-bold">
                {formatCurrency(order.total_price - 50)}
              </span>
              <span className="text-gray-400">المجموع</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-500 font-bold">
                {formatCurrency(50)}
              </span>
              <span className="text-gray-400">الشحن</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent 
                          via-gray-700 to-transparent" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-white">
                {formatCurrency(order.total_price)}
              </span>
              <span className="font-bold text-white">الإجمالي</span>
            </div>
          </div>
        </div>

        {/* Support Actions */}
        <div className="pt-6 border-t border-gray-800">
          <h4 className="font-bold text-white mb-4 text-right">
            هل تحتاج إلى مساعدة؟
          </h4>
          <SupportActions />
        </div>
      </div>
    </BottomSheet>
  );
};

const HeroSection = ({ selectedColor }) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  return (
    <>
      <div
        className="relative h-[60vh] hide-scrollbar overflow-hidden group"
        onClick={() => setIsImageViewerOpen(true)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10" />

        {/* Zoom indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 
                     group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm 
                       flex items-center justify-center transform group-hover:scale-110
                       transition-transform duration-300">
            <ZoomIn className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Touch indicator for mobile */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:hidden">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2
                       text-white/80 text-sm whitespace-nowrap">
            Tap to view full image
          </div>
        </div>

        {/* Image */}
        <img
          src={selectedColor.image}
          alt="Prayer Mat"
          className="w-full h-full object-cover transition-all duration-500 
                   group-hover:scale-105 cursor-zoom-in"
        />

        {/* Content */}
        <div className="absolute bottom-0 right-0 left-0 p-8 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-right">
              <h2 className="text-3xl font-bold mb-2">مجموعة تهادوا تحابوا</h2>
              <p className="text-xl text-amber-500">مجموعة شاملة للصلاة والذكر 🌙⭐️</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        imageUrl={selectedColor.image}
      />
    </>
  );
};

// Enhanced RamadanStore Component
const RamadanStore = () => {
  // Replace useContext with custom hooks
  const { userInfo, login, updateProfile, logout } = useAuth();
  const {
    items: cartItems,
    addItem: addToCart,
    updateQuantity: updateCartQuantity,
    removeItem: removeFromCart,
    clearCart,
    getTotal: getCartTotal
  } = useCart();

  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    createOrder,
    fetchOrders
  } = useOrders();

  // UI State
  const [selectedColor, setSelectedColor] = useState(prayerMatColors[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeView, setActiveView] = useState('product');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch orders when user is authenticated
  useEffect(() => {
    if (userInfo?.phone_number) {
      fetchOrders();
    }
  }, [userInfo?.phone_number, fetchOrders]);

  const checkRequirements = useCallback(async (onComplete) => {
    if (!userInfo?.phone_number) {
      setShowPhoneVerification(true);
      return false;
    }

    if (!userInfo?.city) {
      setShowLocationPicker(true);
      return false;
    }

    await onComplete();
    return true;
  }, [userInfo]);

  const RAMADAN_2025 = new Date('2025-03-01T00:00:00');

  const RamadanCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const difference = RAMADAN_2025.getTime() - now.getTime();

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }
      };

      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="relative bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full translate-x-16 translate-y-16" />
        </div>

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent animate-spin-slow rounded-full" />
                <Moon className="w-6 h-6 text-amber-500 relative z-10" />
              </div>
              <Star className="w-4 h-4 text-amber-500/50 animate-pulse" />
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold text-white mb-1">رمضان ٢٠٢٥</h3>
              <p className="text-sm text-amber-500">١ مارس ٢٠٢٥</p>
            </div>
          </div>

          {/* Countdown Grid */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'يوم', value: timeLeft.days },
              { label: 'ساعة', value: timeLeft.hours },
              { label: 'دقيقة', value: timeLeft.minutes },
              { label: 'ثانية', value: timeLeft.seconds }
            ].map((item, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl transform transition-transform group-hover:scale-105 opacity-0 group-hover:opacity-100" />
                <div className="relative bg-gray-800/30 rounded-xl p-4 text-center border border-gray-700/50 group-hover:border-amber-500/30 transition-all duration-300">
                  <div className="text-2xl font-bold text-white group-hover:text-amber-500 transition-colors">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Motivational Message */}
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              استعد لاستقبال شهر الخير والبركات
            </p>
          </div>
        </div>
      </div>
    );
  };


  const handleUpdateCartQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQuantity;
    setCartItems(newCart);
  };


  const handleRemoveFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };


  const handlePhoneSubmitted = (data) => {
    login({
      ...userInfo,
      phone: data.phone
    });
  };

  const UserProfileSheet = useCallback(({ isOpen, onClose }) => {
    if (!userInfo) return null;

    const profileSections = [
      {
        id: 'phone',
        icon: Phone,
        title: "رقم الهاتف",
        value: userInfo.phone_number,
        action: () => {
          onClose();
          setShowPhoneVerification(true);
        }
      },
      {
        id: 'location',
        icon: MapPin,
        title: "عنوان التوصيل",
        value: userInfo.city ? `${userInfo.city}، ${userInfo.gov_name}` : null,
        subValue: userInfo.street,
        action: () => {
          onClose();
          setShowLocationPicker(true);
        }
      },
      {
        id: 'orders',
        icon: Package,
        title: "إجمالي الطلبات",
        value: `${orders.length} طلب`
      }
    ];

    return (
      <div className={`no-scrollbar fixed inset-0 z-50 transform transition-all duration-500 ${isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
        {/* Backdrop with modern blur effect */}
        <div
          className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Main sheet container */}
        <div className="absolute inset-x-0 bottom-0 transform transition-all duration-500">
          <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl 
                       rounded-t-3xl hide-scrollbar overflow-hidden border-t border-gray-800/50 shadow-2xl">
            {/* Handle bar */}
            <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
              <div className="w-12 h-1 rounded-full bg-gray-700/50 mt-3" />
            </div>

            {/* Header */}
            <div className="pt-8 px-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={onClose}
                  className="p-2 -m-2 rounded-full hover:bg-gray-800/50 transition-colors"
                >
                  <ChevronDown className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                </button>
                <h2 className="text-xl font-bold text-white">الملف الشخصي</h2>
              </div>
            </div>

            {/* Profile sections with modern card design */}
            <div className="px-6 py-4 space-y-3">
              {profileSections.map((section) => (
                <div
                  key={section.id}
                  className="group bg-gray-800/30 backdrop-blur-md rounded-2xl p-4
                           border border-gray-700/50 hover:border-amber-500/30
                           transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={section.action}
                      className={`no-scrollbar p-2 rounded-full bg-gray-800/50 hover:bg-amber-500/10 
                               transition-colors ${section.action ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Edit3 className="w-4 h-4 text-amber-500" />
                    </button>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{section.title}</p>
                        <p className="font-bold text-white group-hover:text-amber-500 
                                  transition-colors">
                          {section.value}
                        </p>
                        {section.subValue && (
                          <p className="text-sm text-gray-500 mt-1">{section.subValue}</p>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gray-800/50 flex items-center 
                                  justify-center text-amber-500">
                        <section.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Logout button with modern gradient */}
            <div className="p-6">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-red-500/10 to-red-600/10 
                         text-red-500 rounded-xl py-4 px-6 font-bold
                         hover:from-red-500/20 hover:to-red-600/20
                         transition-all duration-300 flex items-center justify-between"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [userInfo, orders.length]);

  const handleAddToCart = useCallback(() => {
    const newItem = {
      ...selectedColor,
      colorName: selectedColor.name,
      quantity,
    };
    addToCart(newItem);
    toast.success('تمت الإضافة إلى السلة');
  }, [selectedColor, quantity, addToCart]);

  const handleCheckout = useCallback(async () => {
    await checkRequirements(async () => {
      try {
        setLoading(true);
        await createOrder(cartItems);
        clearCart();
        setActiveView('orders');
        toast.success('تم إنشاء الطلب بنجاح');
      } catch (error) {
        console.error('Checkout failed:', error);
        toast.error(error.message || 'فشل إنشاء الطلب');
      } finally {
        setLoading(false);
      }
    });
  }, [cartItems, createOrder, clearCart, checkRequirements]);

  const handlePhoneVerified = useCallback(async (data) => {
    try {
      setLoading(true);
      await login(data.phone_number);

      if (!userInfo?.city) {
        setShowLocationPicker(true);
      }
      toast.success('تم تسجيل رقم الهاتف بنجاح');
    } catch (error) {
      console.error('Phone verification failed:', error);
      toast.error(error.message || 'فشل تسجيل رقم الهاتف');
    } finally {
      setLoading(false);
    }
  }, [login, userInfo]);

  const handleLocationSelected = useCallback(async (location) => {
    try {
      setLoading(true);
      await updateProfile({
        phone_number: userInfo.phone_number,
        gov_name: location.name.split('،')[1].trim(),
        city: location.name.split('،')[0].trim(),
        street: location.details,
        details: location.details
      });
      toast.success('تم تحديث العنوان بنجاح');
    } catch (error) {
      console.error('Location update failed:', error);
      toast.error(error.message || 'فشل تحديث العنوان');
    } finally {
      setLoading(false);
    }
  }, [updateProfile, userInfo]);


  return (
    <>
      {/* Main Store Content */}
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => userInfo ? setShowUserProfile(true) : setShowPhoneVerification(true)}
                className="p-2 rounded-full bg-gray-800 text-amber-500"
              >
                {userInfo ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-2xl font-bold">تهادوا تحابوا</h1>
              <button
                onClick={() => {
                  if (!userInfo) {
                    setShowPhoneVerification(true);
                    return;
                  }
                  setActiveView('orders');
                }}
                className="p-2 rounded-full bg-gray-800 text-amber-500"
              >
                <Package className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Product View */}
        {activeView === 'product' && (
          <>
            {/* Hero Section */}
            <HeroSection selectedColor={selectedColor} />


            {/* Color Selection */}
            <div className="bg-gray-800 p-6">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-xl font-bold mb-4 text-right">اختر اللون المناسب</h3>
                <div className="flex justify-end gap-4 mb-6">
                  {prayerMatColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`no-scrollbar w-12 h-12 rounded-full border-2 transition-transform ${selectedColor.id === color.id
                        ? 'border-amber-500 scale-110'
                        : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>

                {/* Quantity and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">السعر للمجموعة</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-500">
                        {formatCurrency(selectedColor.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gifting Section */}
            <div className="px-4 mt-8">
              <RamadanCountdown />
            </div>

            {/* Package Contents */}
            <div className="max-w-7xl mx-auto px-4 py-8 pb-4">
              <h3 className="text-2xl font-bold mb-6 text-right">محتويات المجموعة</h3>
              <div className="space-y-4">
                {packageContents.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl p-4 flex items-center justify-between border border-gray-700 hover:border-amber-500 transition-all duration-300"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="text-right">
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            onClose={() => setActiveView('product')}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        {/* Enhanced FAB */}
        <CreativeFAB
          quantity={quantity}
          items={cartItems}
          loading={loading}
          onAddToCart={() => {
            if (!userInfo?.phone_number) {
              setShowPhoneVerification(true);
              return;
            }
            handleAddToCart();
          }}
          onCheckout={handleCheckout}
          selectedColor={selectedColor}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          nearbyStores={nearbyStores}
        />
      </div>

      {/* Sheets */}
      <PhoneVerificationSheet
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onVerified={handlePhoneVerified} // This now expects phone_number property
        loading={loading}
        savedPhone={userInfo?.phone_number}
      />

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelected}
        loading={loading}
      />

      <UserProfileSheet
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Optional: Add a loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-full">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        </div>
      )}
    </>
  );
};


export default RamadanStore;