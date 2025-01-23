import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Loader2, Search, Filter, MapPin, Package, Users, ChevronDown, ChevronLeft,
  ChevronRight, Edit3, Phone, AlertCircle, CheckCircle, Clock, Check, RefreshCw,
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Boxes, Calendar, TrendingDown,
  BarChart4, PieChart, ShoppingBag, Ban, X, Building2, CircleDollarSign,
  ArrowLeft, ArrowUp, Truck, Share2, MessageCircle, Mail, ExternalLink, User, Copy
} from 'lucide-react';

import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie
} from 'recharts';
import _ from 'lodash';

// API Service Configuration
const API_BASE = 'https://geolink.pythonanywhere.com';

const api = {
  async fetchOrders() {
    const res = await fetch(`${API_BASE}/admin/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async fetchUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/admin/order/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getUserOrders(phoneNumber) {
    const res = await fetch(`${API_BASE}/api/orders?phone_number=${phoneNumber}`);
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return res.json();
  },

  async getOrder(orderId, phoneNumber) {
    const res = await fetch(`${API_BASE}/api/order/${orderId}?phone_number=${phoneNumber}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    return res.json();
  }
};


const Sheet = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`fixed inset-x-0 bottom-0 transform transition-transform 
                  duration-500 ease-out
                  ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl 
                      rounded-t-[2.5rem] border-t border-gray-800/50 shadow-2xl
                      max-h-[90vh] overflow-y-auto hide-scrollbar">
          {/* Handle */}
          <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
            <div className="w-12 h-1 rounded-full bg-gray-700/50 mt-3" />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export const SheetHeader = ({ title, onClose, onShare }) => (
  <div className="pt-8 px-6">
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onClose}
        className="p-2 -m-2 rounded-full hover:bg-gray-800/50 
                  transition-colors"
      >
        <ChevronDown className="w-6 h-6 text-gray-400" />
      </button>
      {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
      {onShare && (
        <button
          onClick={onShare}
          className="p-2 -m-2 rounded-full hover:bg-gray-800/50 
                    transition-colors"
        >
          <Share2 className="w-6 h-6 text-gray-400" />
        </button>
      )}
    </div>
  </div>
);

export const SheetContent = ({ children }) => (
  <div className="px-6 pb-8 space-y-6">
    {children}
  </div>
);

export const SheetClose = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 p-2 rounded-full 
              hover:bg-gray-800/50 transition-colors"
  >
    <X className="w-5 h-5 text-gray-400" />
  </button>
);

// Optional overlay touch handling
const preventScroll = (e) => {
  const delta = e.touches[0].clientY - e.target.getBoundingClientRect().top;
  if (delta < 0) {
    e.preventDefault();
  }
};


// Enhanced StatCard Component
const StatCard = ({ title, value, icon: Icon, trend, subtitle, color = 'emerald' }) => {
  const colors = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-500',
      border: 'border-emerald-500/20',
      hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      hover: 'hover:border-blue-500/40 hover:bg-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      hover: 'hover:border-amber-500/40 hover:bg-amber-500/20'
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      hover: 'hover:border-red-500/40 hover:bg-red-500/20'
    }
  }[color];

  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend >= 0 ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300
                    ${colors.bg} ${colors.border} ${colors.hover}`}>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full 
                    bg-gradient-to-br from-white/5 to-white/0" />
      <div className="absolute top-4 right-4">
        <Icon className={`w-8 h-8 ${colors.text}`} />
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-3xl font-bold ${colors.text}`}>
            {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
          </span>
          {subtitle && (
            <span className="text-sm text-gray-400">{subtitle}</span>
          )}
        </div>

        {trend !== undefined && (
          <div className={`mt-3 flex items-center gap-2 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {Math.abs(trend)}% {trend >= 0 ? 'زيادة' : 'انخفاض'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


{/* Order Actions Menu Component */ }
const OrderActionsMenu = ({ onUpdateStatus, currentStatus, onPrint, onShare }) => {
  const actions = [
    {
      status: 'Pending',
      label: 'تعليق الطلب',
      icon: Clock,
      color: 'text-yellow-500'
    },
    {
      status: 'Processing',
      label: 'جاري التجهيز',
      icon: RefreshCw,
      color: 'text-blue-500'
    },
    {
      status: 'Delivered',
      label: 'تم التوصيل',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      status: 'Cancelled',
      label: 'إلغاء الطلب',
      icon: Ban,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ status, label, icon: Icon, color }) => (
        <button
          key={status}
          onClick={() => onUpdateStatus(status)}
          disabled={currentStatus === status}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl
                    font-bold transition-all duration-300 group
                    ${currentStatus === status
              ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              : 'bg-gray-800/30 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30'}`}
        >
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm group-hover:text-white transition-colors">
            {label}
          </span>
        </button>
      ))}


    </div>
  );
};




{/* Order Item Card Component */ }
const OrderItemCard = ({ item }) => (
  <div className="bg-gray-800/30 rounded-2xl p-4 flex items-center gap-4">
    <div className="relative w-20 h-20 rounded-xl overflow-hidden group">
      <img
        src={item.image}
        alt={item.name}
        className="w-full h-full object-cover transform transition-transform
                 duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute bottom-1 right-1 bg-black/50 rounded-full 
                    px-2 py-0.5 text-xs text-white">
        {item.quantity}×
      </div>
    </div>

    <div className="flex-1">
      <div className="flex justify-between items-start">
        <span className="font-bold text-amber-500">
          {item.price.toLocaleString('ar-EG')} جنيه
        </span>
        <div className="text-right">
          <h4 className="font-bold text-white">{item.name}</h4>
          {item.colorName && (
            <p className="text-sm text-gray-400 mt-1">{item.colorName}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

{/* Order Summary Card Component */ }
const OrderSummaryCard = ({ order }) => {
  const subtotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = order.shipping_fee || 0;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-800/30 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-amber-500 font-bold">
          {subtotal.toLocaleString('ar-EG')} جنيه
        </span>
        <span className="text-gray-400">المجموع</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-green-500 font-bold">
          {shipping.toLocaleString('ar-EG')} جنيه
        </span>
        <span className="text-gray-400">الشحن</span>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-white">
          {total.toLocaleString('ar-EG')} جنيه
        </span>
        <span className="font-bold text-white">الإجمالي</span>
      </div>
    </div>
  );
};


// Input Component
export const Input = React.forwardRef(({ icon: Icon, error, ...props }, ref) => (
  <div className="relative group">
    <input
      ref={ref}
      {...props}
      className={`w-full h-12 bg-gray-800/50 rounded-xl px-12 text-white text-right
                transition-all duration-300 border
                focus:ring-2 focus:ring-amber-500/50
                placeholder:text-gray-500
                ${error
          ? 'border-red-500 focus:border-red-500'
          : 'border-gray-700/50 focus:border-amber-500/50'}`}
      dir="rtl"
    />
    <div className={`absolute left-4 top-1/2 -translate-y-1/2
                   transition-transform duration-300
                   ${error ? 'text-red-500' : 'text-gray-400'}`}>
      <Icon className="w-5 h-5" />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
));

Input.displayName = 'Input';



// Utility function to calculate statistics from orders
const calculateStats = (orders, timeRange = 'week') => {
  if (!orders?.length) {
    return {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalOrders: 0,
      ordersGrowth: 0,
      ordersByStatus: {},
      averageOrderValue: 0,
      topProducts: [],
      deliveryRate: 0,
      pendingOrders: 0,
      chartData: []
    };
  }

  const now = new Date();
  const getPeriodStart = (date, range) => {
    const d = new Date(date);
    switch (range) {
      case 'day': return new Date(d.setDate(d.getDay()));
      case 'week': return new Date(d.setDate(d.getDate() - 7));
      case 'month': return new Date(d.setMonth(d.getMonth() - 1));
      case 'year': return new Date(d.setFullYear(d.getFullYear() - 1));
      default: return new Date(d.setDate(d.getDate() - 7));
    }
  };

  const currentPeriodStart = getPeriodStart(now, timeRange);
  const previousPeriodStart = getPeriodStart(currentPeriodStart, timeRange);

  // Filter orders by period with proper date comparison
  const currentPeriodOrders = orders.filter(order =>
    new Date(order.created_at) >= currentPeriodStart &&
    new Date(order.created_at) <= now
  );

  const previousPeriodOrders = orders.filter(order =>
    new Date(order.created_at) >= previousPeriodStart &&
    new Date(order.created_at) < currentPeriodStart
  );

  // Calculate revenue metrics
  const getCurrentTotal = (orders) => orders.reduce((sum, order) => sum + order.total_price, 0);
  const currentRevenue = getCurrentTotal(currentPeriodOrders);
  const previousRevenue = getCurrentTotal(previousPeriodOrders);

  // Calculate growth rates with proper handling of edge cases
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
  const ordersGrowth = calculateGrowth(
    currentPeriodOrders.length,
    previousPeriodOrders.length
  );

  // Enhanced status analytics
  const ordersByStatus = _.groupBy(orders, 'status');
  const statusCounts = Object.entries(ordersByStatus).reduce((acc, [status, orders]) => {
    acc[status] = orders.length;
    return acc;
  }, {});

  // Calculate delivery rate and pending orders
  const totalOrders = orders.length;
  const deliveredCount = statusCounts['Delivered'] || 0;
  const pendingCount = statusCounts['Pending'] || 0;
  const processingCount = statusCounts['Processing'] || 0;
  const cancelledCount = statusCounts['Cancelled'] || 0;

  const deliveryRate = (deliveredCount / totalOrders) * 100;

  // Calculate average order value
  const averageOrderValue = currentPeriodOrders.length > 0
    ? currentRevenue / currentPeriodOrders.length
    : 0;

  // Analyze product performance
  const productAnalytics = orders.flatMap(order => order.items)
    .reduce((acc, item) => {
      const key = item.color;
      if (!acc[key]) {
        acc[key] = {
          name: item.colorName,
          quantity: 0,
          revenue: 0,
          image: item.image
        };
      }
      acc[key].quantity += item.quantity;
      acc[key].revenue += item.price;
      return acc;
    }, {});

  const topProducts = Object.entries(productAnalytics)
    .map(([key, value]) => ({
      color: key,
      ...value
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Enhanced chart data with daily aggregation
  const groupedByDate = _.groupBy(currentPeriodOrders, order =>
    new Date(order.created_at).toLocaleDateString('ar-EG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  );

  const chartData = Object.entries(groupedByDate)
    .map(([date, dateOrders]) => ({
      date,
      orders: dateOrders.length,
      revenue: dateOrders.reduce((sum, order) => sum + order.total_price, 0),
      items: dateOrders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      )
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    totalRevenue: currentRevenue,
    revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
    totalOrders: currentPeriodOrders.length,
    ordersGrowth: parseFloat(ordersGrowth.toFixed(1)),
    averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    ordersByStatus: statusCounts,
    deliveryRate: parseFloat(deliveryRate.toFixed(1)),
    pendingOrders: pendingCount,
    processingOrders: processingCount,
    cancelledOrders: cancelledCount,
    topProducts
  };
};


// OrderDetailsSheet Component
const OrderDetailsSheet = ({ order, isOpen, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const text = `
طلب #${order.id}
العميل: ${order.user.phone_number}
المنتجات:
${order.items.map(item => `- ${item.name} (${item.quantity})`).join('\n')}
الإجمالي: ${order.total_price.toLocaleString('ar-EG')} جنيه
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `طلب #${order.id}`,
          text
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          await copyToClipboard(text);
        }
      }
    } else {
      await copyToClipboard(text);
    }
  };
  const handleCopyPhoneNumber = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.user.phone_number);
      // Add toast notification here
    } catch (err) {
      console.error('Failed to copy phone number', err);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className={`fixed inset-x-0 bottom-0 transform transition-transform 
                      duration-500 ease-out
                      ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-gradient-to-b from-gray-900/95 to-gray-900 backdrop-blur-xl 
                      rounded-t-[2.5rem] border-t border-gray-800/50 shadow-2xl
                      max-h-[90vh] overflow-y-auto hide-scrollbar">
          {/* Handle */}
          <div className="absolute inset-x-0 top-0 h-7 flex justify-center items-start">
            <div className="w-12 h-1 rounded-full bg-gray-700/50 mt-3" />
          </div>

          {/* Header */}
          <div className="pt-8 px-6">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 
                          transition-colors duration-300"
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  طلب #{order.id}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(order.created_at).toLocaleDateString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={handleShare}
                className="p-2 -m-2 rounded-full hover:bg-gray-800/50 
                          transition-colors duration-300"
              >
                <Share2 className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 space-y-6">
            {/* Status Card */}
            <div className="bg-gray-800/30 rounded-2xl p-4">
              <div className="flex justify-between items-center">
                <StatusBadge status={order.status} />
                <p className="text-sm text-gray-400">
                  {new Date(order.created_at).toLocaleTimeString('ar-EG', {
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <h4 className="font-bold text-white">بيانات العميل</h4>
                  <p className="text-sm text-gray-400 mt-1" dir="ltr">
                    {order.user.phone_number}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://wa.me/${order.user.phone_number}`, '_blank');
                  }}
                  className="p-2 rounded-xl bg-gray-800/50 hover:bg-green-500/10
                        border border-transparent hover:border-green-500/30
                        transition-all duration-300"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 text-green-500" />
                </button>
                <button
                  onClick={() => window.open(`tel:${order.user.phone_number}`)}
                  className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                            border border-transparent hover:border-amber-500/30
                            transition-all duration-300"
                >
                  <Phone className="w-5 h-5 text-amber-500" />
                </button>
                <button
                  onClick={handleCopyPhoneNumber}
                  className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                         border border-transparent hover:border-amber-500/30
                         transition-all duration-300"
                  title="Copy Phone Number"
                >
                  <Copy className="w-5 h-5 text-amber-500" />
                </button>




              </div>

              {/* Address */}
              {(order.user.gov_name || order.user.city || order.user.street) && (
                <div className="flex items-start gap-3 pt-4 border-t border-gray-700/50">
                  <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1 space-y-1 text-right">
                    {order.user.gov_name && (
                      <p className="text-white">{order.user.gov_name}</p>
                    )}
                    {order.user.city && (
                      <p className="text-gray-400">{order.user.city}</p>
                    )}
                    {order.user.street && (
                      <p className="text-gray-400">{order.user.street}</p>
                    )}
                    {order.user.details && (
                      <p className="text-sm text-gray-500">{order.user.details}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-lg">المنتجات</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <OrderItemCard key={index} item={item} />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <OrderSummaryCard order={order} />

            {/* Status Update Buttons */}
            <OrderActionsMenu
              onUpdateStatus={onUpdateStatus}
              currentStatus={order.status}
              onPrint={() => window.print()}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



const StatusBadge = ({ status }) => {
  const config = {
    Pending: {
      label: 'قيد التنفيذ',
      icon: Clock,
      bgClass: 'bg-yellow-500/20',
      textClass: 'text-yellow-500'
    },
    Processing: {
      label: 'جاري التجهيز',
      icon: RefreshCw,
      bgClass: 'bg-blue-500/20',
      textClass: 'text-blue-500'
    },
    Delivered: {
      label: 'تم التوصيل',
      icon: CheckCircle,
      bgClass: 'bg-green-500/20',
      textClass: 'text-green-500'
    },
    Cancelled: {
      label: 'ملغي',
      icon: Ban,
      bgClass: 'bg-red-500/20',
      textClass: 'text-red-500'
    }
  }[status] || {
    label: 'غير معروف',
    icon: Package,
    bgClass: 'bg-gray-500/20',
    textClass: 'text-gray-500'
  };

  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                    ${config.bgClass} ${config.textClass}`}>
      <Icon className={`w-4 h-4 ${status === 'processing' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </div>
  );
};


// Order Card Component
const OrderCard = ({ order, onClick }) => {
  const handleCopyPhoneNumber = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(order.user.phone_number);
      // Add toast notification here
    } catch (err) {
      console.error('Failed to copy phone number', err);
    }
  };
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-gray-800/40 to-gray-800/20 backdrop-blur-xl 
                 rounded-2xl p-4 border border-gray-700/50 space-y-4 cursor-pointer
                 hover:border-amber-500/30 transition-all duration-300 group"
      dir='ltr'
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <StatusBadge status={order.status} />
        <div className="text-right">
          <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors">
            طلب #{order.id}
          </h3>
          <p className="text-sm text-gray-400">
            {new Date(order.created_at).toLocaleTimeString('ar-EG', {
              hour: 'numeric',
              minute: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 
                     border-gray-700/50 group-hover:border-amber-500/30 transition-all duration-300"
          >
            <div className="relative w-full h-full">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transform transition-transform 
                         duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-1 right-1 bg-black/50 rounded-full 
                           px-2 py-0.5 text-xs text-white">
                {item.quantity}×
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-3">
          {order.user?.phone_number && (
            <>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/${order.user.phone_number}`, '_blank');
                }}
                className="p-2 rounded-xl bg-gray-800/50 hover:bg-green-500/10
                        border border-transparent hover:border-green-500/30
                        transition-all duration-300"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
              </button>
              <a
                href={`tel:${order.user.phone_number}`}
                onClick={e => e.stopPropagation()}
                className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                       border border-transparent hover:border-amber-500/30
                       transition-all duration-300"
              >
                <Phone className="w-5 h-5 text-amber-500" />
              </a>
              <button
                onClick={handleCopyPhoneNumber}
                className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                         border border-transparent hover:border-amber-500/30
                         transition-all duration-300"
                title="Copy Phone Number"
              >
                <Copy className="w-5 h-5 text-amber-500" />
              </button>


            </>
          )}
          {order.user?.gov_name && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="text-gray-400">{order.user.gov_name}</span>
            </div>
          )}
        </div>
        <span className="font-bold text-amber-500">
          {order.total_price?.toLocaleString('ar-EG')} جنيه
        </span>
      </div>
    </div>
  );
};


// Enhanced Analytics Section
const AnalyticsSection = ({ orders }) => {
  const [timeRange, setTimeRange] = useState('week');
  const stats = useMemo(() => calculateStats(orders, timeRange), [orders, timeRange]);

  return (
    <div className="pt-4 mb-6">
      {/* Time Range Selector */}
      <div className="flex gap-2 mb-4"
        dir='rtl'>
        {[
          { id: 'day', label: 'اليوم' },
          { id: 'week', label: 'أسبوع' },
          { id: 'month', label: 'شهر' },
          { id: 'year', label: 'سنة' }
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id)}
            className={`px-4 py-2 rounded-xl text-sm transition-all
                       ${timeRange === range.id
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800/50 text-gray-400'}`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="إجمالي المبيعات"
          value={stats.totalRevenue.toLocaleString('ar-EG')}
          suffix="جنيه"
          icon={CircleDollarSign}
          trend={stats.revenueTrend}
          color="emerald"
        />
        <StatCard
          title="عدد الطلبات"
          value={stats.totalOrders}
          icon={Package}
          trend={stats.orderTrend}
          color="blue"
        />
        <StatCard
          title="نسبة التوصيل"
          value={`${stats.deliveryRate}%`}
          icon={Truck}
          color="amber"
        />
        <StatCard
          title="طلبات معلقة"
          value={stats.pendingOrders}
          icon={Clock}
          color="red"
        />
      </div>
    </div>
  );
};

// Orders Management Section
const OrdersSection = ({
  orders,
  onUpdateStatus,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange
}) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesLocation = locationFilter === 'all' ||
        order.user?.gov_name === locationFilter;
      const matchesSearch = !searchQuery ||
        order.user?.phone_number.includes(searchQuery) ||
        String(order.id).includes(searchQuery);

      return matchesStatus && matchesLocation && matchesSearch;
    });
  }, [orders, statusFilter, locationFilter, searchQuery]);

  // Group orders by date
  const groupedOrders = useMemo(() => {
    return _.groupBy(filteredOrders, order => {
      const date = new Date(order.created_at);
      return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    });
  }, [filteredOrders]);

  return (
    <div className="p-4">
      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        locationFilter={locationFilter}
        onLocationFilterChange={onLocationFilterChange}
        orders={orders}
      />

      {/* Orders List */}
      {isLoading ? (
        <LoadingState />
      ) : filteredOrders.length === 0 ? (
        <EmptyState />
      ) : (
        Object.entries(groupedOrders).map(([date, dateOrders]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm py-2">
              <h3 className="text-gray-400 text-sm">{date}</h3>
            </div>
            {dateOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => {
                  setSelectedOrder(order);
                  setIsDetailsOpen(true);
                }}
              />
            ))}
          </div>
        ))
      )}

      {/* Order Details Bottom Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setTimeout(() => setSelectedOrder(null), 300);
        }}
        onUpdateStatus={async (status) => {
          await onUpdateStatus(selectedOrder.id, status);
          setIsDetailsOpen(false);
        }}
      />
    </div>
  );
};

const UsersSection = ({ users, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const filteredUsers = useMemo(() => {
    return users?.filter(user =>
      !searchQuery ||
      user.phone_number.includes(searchQuery) ||
      user.gov_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [users, searchQuery]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    if (!user.orders) {
      setIsLoadingOrders(true);
      try {
        const orders = await api.getUserOrders(user.phone_number);
        setUserOrders(orders);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
  };

  const handleOrderSelect = async (order) => {
    try {
      const orderDetails = await api.getOrder(order.id, selectedUser.phone_number);
      setSelectedOrder(orderDetails);
    } catch (err) {
      console.error('Error loading order details:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-4 space-y-4">
        <Input
          icon={Search}
          placeholder="ابحث برقم الهاتف أو العنوان..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          dir="rtl"
        />

        {/* Location Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2" dir="rtl">
          {Array.from(new Set(users?.map(u => u.gov_name).filter(Boolean))).map(location => (
            <button
              key={location}
              onClick={() => setSearchQuery(location)}
              className="px-3 py-2 rounded-full text-sm bg-gray-800/50 text-gray-400
                       hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
        {isLoading ? (
          <LoadingState />
        ) : filteredUsers.length === 0 ? (
          <EmptyState type="users" />
        ) : (
          filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onClick={() => handleUserSelect(user)}
            />
          ))
        )}
      </div>

      {/* User Details Sheet */}
      <UserDetailsSheet
        user={selectedUser}
        orders={userOrders}
        selectedOrder={selectedOrder}
        isLoading={isLoadingOrders}
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setUserOrders(null);
          setSelectedOrder(null);
        }}
        onOrderClick={handleOrderSelect}
      />
    </div>
  );
};

const UserCard = ({ user, onClick }) => {
  const [error, setError] = useState(null);
  const orderCount = user.order_count || 0;

  const handleCopyPhoneNumber = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(user.phone_number);
      // Add toast notification here
    } catch (err) {
      setError('Failed to copy phone number');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const text = `Customer: ${user.phone_number}\nAddress: ${[user.gov_name, user.city, user.street].filter(Boolean).join(', ')}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `Customer ${user.phone_number}`, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to share data');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden bg-gradient-to-br from-gray-800/40 to-gray-800/20 
                 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50 space-y-4 
                 cursor-pointer hover:border-amber-500/30 transition-all duration-300"
    >
      {/* User Info Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${user.phone_number}`, '_blank');
            }}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-green-500/10
                        border border-transparent hover:border-green-500/30
                        transition-all duration-300"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-green-500" />
          </button>
          <button
            onClick={() => window.open(`tel:${user.phone_number}`)}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                            border border-transparent hover:border-amber-500/30
                            transition-all duration-300"
          >
            <Phone className="w-5 h-5 text-amber-500" />
          </button>

          <button
            onClick={handleCopyPhoneNumber}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                         border border-transparent hover:border-amber-500/30
                         transition-all duration-300"
            title="Copy Phone Number"
          >
            <Copy className="w-5 h-5 text-amber-500" />
          </button>
        </div>

        <div className="text-right">
          <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors text-lg pt-1" dir="ltr">
            {user.phone_number}
          </h3>
        </div>
      </div>

      {/* Address */}
      {user.gov_name && (
        <AddressInfo user={user} />
      )}

      {/* Stats */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
        <OrderCount count={orderCount} />
        <div className="text-right">
          <span className="text-sm text-gray-400">عدد الطلبات</span>
          <p className="font-bold text-amber-500">{orderCount} طلب</p>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} />
      )}
    </div>
  );
};

const UserDetailsSheet = ({ user, orders, selectedOrder, isOpen, onClose, onOrderClick }) => {
  if (!user) return null;

  const orderCount = orders?.length || 0;

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <SheetHeader user={user} onClose={onClose} />

      <div className="px-6 pb-8 space-y-6">
        <UserInfo user={user} />
        <UserStats orderCount={orderCount} orders={orders} />

        {orders?.length > 0 && (
          <OrderHistory
            orders={orders}
            onOrderClick={onOrderClick}
            selectedOrder={selectedOrder}
          />
        )}
      </div>
    </Sheet>
  );
};

const UserStats = ({ orders = [] }) => {
  const stats = calculateUserStats(orders);

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCardU
        title="إجمالي الطلبات"
        value={stats.totalOrders}
        icon={Package}
        color="emerald"
      />
      <StatCardU
        title="إجمالي المشتريات"
        value={`${stats.totalSpent.toLocaleString('ar-EG')} جنيه`}
        icon={CircleDollarSign}
        color="amber"
      />
    </div>
  );
};

const OrderHistory = ({ orders, onOrderClick, selectedOrder }) => {
  const groupedOrders = _.groupBy(orders, order =>
    new Date(order.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
  );

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-white text-lg">سجل الطلبات</h4>
      {Object.entries(groupedOrders).map(([month, monthOrders]) => (
        <div key={month} className="space-y-3">
          <h5 className="text-sm text-gray-400">{month}</h5>
          {monthOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
              isSelected={selectedOrder?.id === order.id}
            />
          ))}
        </div>
      ))}
    </div>
  );
};


const StatCardU = ({ title, value, icon: Icon, color = 'emerald', subtitle }) => {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${colors[color]}`}>
      <div className="absolute top-4 right-4">
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-gray-400">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const calculateUserStats = (orders) => {
  if (!orders?.length) {
    return {
      totalOrders: 0,
      totalSpent: 0,
      orderRate: 0,
      lastOrderDays: 0
    };
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);

  // Calculate order rate (orders per month)
  const firstOrder = new Date(orders[orders.length - 1].created_at);
  const lastOrder = new Date(orders[0].created_at);
  const monthsDiff = (lastOrder - firstOrder) / (1000 * 60 * 60 * 24 * 30);
  const orderRate = monthsDiff > 0 ? (totalOrders / monthsDiff).toFixed(1) : totalOrders;

  // Days since last order
  const daysSinceLastOrder = Math.floor((new Date() - lastOrder) / (1000 * 60 * 60 * 24));

  return {
    totalOrders,
    totalSpent,
    orderRate,
    lastOrderDays: daysSinceLastOrder
  };
};

const UserInfo = ({ user }) => {
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone & Actions */}
      <div className="bg-gray-800/30 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 text-right" dir="ltr">
            <h4 className="font-bold text-white text-xl">
              {user.phone_number}
            </h4>
          </div>
          <button
            onClick={() => copyToClipboard(user.phone_number)}
            className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
                      border border-transparent hover:border-amber-500/30
                      transition-all duration-300"
          >
            <Copy className="w-5 h-5 text-amber-500" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <ActionButton
            icon={Phone}
            label="اتصال"
            onClick={() => window.open(`tel:${user.phone_number}`, '_self')}
            color="amber"
          />
          <ActionButton
            icon={MessageCircle}
            label="واتساب"
            onClick={() => window.open(`https://wa.me/${user.phone_number}`, '_blank')}
            color="green"
          />
        </div>
      </div>

      {/* Address */}
      {(user.gov_name || user.city || user.street) && (
        <div className="bg-gray-800/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1 space-y-1 text-right">
              {user.gov_name && (
                <p className="text-white">{user.gov_name}</p>
              )}
              {user.city && (
                <p className="text-gray-400">{user.city}</p>
              )}
              {user.street && (
                <p className="text-gray-400">{user.street}</p>
              )}
              {user.details && (
                <p className="text-sm text-gray-500">{user.details}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 p-3 rounded-xl
              bg-${color}-500/10 text-${color}-500 hover:bg-${color}-500/20
              transition-colors`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);



// Helper Components
const Button = ({ icon: Icon, onClick, tooltip }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-xl bg-gray-800/50 hover:bg-amber-500/10
             border border-transparent hover:border-amber-500/30
             transition-all duration-300"
    title={tooltip}
  >
    <Icon className="w-5 h-5 text-amber-500" />
  </button>
);


const AddressInfo = ({ user }) => (
  <div className="flex items-start gap-3">
    <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
    <div className="flex-1 space-y-1 text-right">
      <p className="text-white">{user.gov_name}</p>
      {user.city && <p className="text-gray-400">{user.city}</p>}
      {user.street && <p className="text-gray-400">{user.street}</p>}
      {user.details && <p className="text-sm text-gray-500">{user.details}</p>}
    </div>
  </div>
);

const OrderCount = ({ count }) => (
  <div className="relative">
    <Package className="w-4 h-4 text-amber-500" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
    )}
  </div>
);


const ErrorMessage = ({ message }) => (
  <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 text-red-500
                rounded-lg p-2 flex items-center gap-2 text-sm">
    <AlertCircle className="w-4 h-4" />
    <span>{message}</span>
  </div>
);

// Main Admin Dashboard Component
const AdminDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersData, usersData] = await Promise.all([
        api.fetchOrders(),
        api.fetchUsers()
      ]);

      setOrders(ordersData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating order status:', err);
      // Show error toast/notification here
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-white">عذراً، حدث خطأ ما</h1>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold
                       hover:bg-amber-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm 
                          border-b border-gray-800/50">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-center">لوحة التحكم</h1>
          </div>

          {/* Navigation Tabs */}
          <nav className="px-4 pb-4">
            <div className="flex gap-4">
              <TabButton
                active={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                icon={Users}
                label="العملاء"
              />
              <TabButton
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
                icon={Package}
                label="الطلبات"
              />

            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="pb-8">
          {activeTab === 'orders' ? (
            <>
              {/* Analytics Dashboard */}
              <div className="px-4">
                <AnalyticsSection orders={orders} />
              </div>

              {/* Orders Management */}
              <OrdersSection
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                locationFilter={locationFilter}
                onLocationFilterChange={setLocationFilter}
              />
            </>
          ) : (
            <UsersSection
              users={users}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

// Utility Components
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl 
               transition-all duration-300 transform
               ${active
        ? 'bg-amber-500 text-white scale-105'
        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

// Search and Filters Component
export const SearchAndFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
  orders
}) => {
  const locations = _.uniq(orders.map(order => order.user?.gov_name).filter(Boolean));

  return (
    <div className="sticky top-16 z-30 bg-gray-900/95 backdrop-blur-sm space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          icon={Search}
          placeholder="ابحث برقم الطلب أو رقم الهاتف..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute left-12 top-1/2 -translate-y-1/2 p-1 rounded-full
                     hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 ps-1 pb-2"
        dir='rtl'>
        <FilterButton
          active={statusFilter === 'all'}
          onClick={() => onStatusFilterChange('all')}
          label="الكل"
        />
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <FilterButton
            key={status}
            active={statusFilter === status}
            onClick={() => onStatusFilterChange(status)}
            icon={config.icon}
            label={config.label}
            color={config.color}
          />
        ))}
      </div>

      {/* Location Filter */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar px-1 pb-4"
        dir='rtl'>
        <FilterButton
          active={locationFilter === 'all'}
          onClick={() => onLocationFilterChange('all')}
          label="كل المحافظات"
          icon={MapPin}
        />
        {locations.map(location => (
          <FilterButton
            key={location}
            active={locationFilter === location}
            onClick={() => onLocationFilterChange(location)}
            label={location}
            icon={MapPin}
          />
        ))}
      </div>
    </div>
  );
};

// Filter Button Component
export const FilterButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
              whitespace-nowrap transition-all duration-300
              ${active
        ? 'bg-amber-500 text-white scale-105'
        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'}`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span>{label}</span>
  </button>
);

export const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="space-y-4 text-center">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
      <p className="text-gray-400">جاري تحميل البيانات...</p>
    </div>
  </div>
);

export const EmptyState = ({ type = 'orders', icon: Icon, title, description }) => {
  const config = {
    orders: {
      icon: Package,
      title: 'لا توجد طلبات',
      description: 'لم يتم العثور على طلبات تطابق معايير البحث'
    },
    users: {
      icon: Users,
      title: 'لا يوجد عملاء',
      description: 'لم يتم العثور على عملاء مسجلين'
    }
  }[type];

  const IconComponent = Icon || config.icon;

  return (
    <div className="text-center py-12">
      <IconComponent className="w-16 h-16 text-gray-700 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{title || config.title}</h3>
      <p className="text-gray-400">{description || config.description}</p>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold text-white">عذراً، حدث خطأ ما</h1>
            <p className="text-gray-400">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold
                       hover:bg-amber-600 transition-colors"
            >
              إعادة تحميل التطبيق
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Constants
const STATUS_CONFIG = {
  Pending: {
    label: 'قيد التنفيذ',
    icon: Clock,
    color: 'yellow'
  },
  Processing: {
    label: 'جاري التجهيز',
    icon: RefreshCw,
    color: 'blue'
  },
  Delivered: {
    label: 'تم التوصيل',
    icon: CheckCircle,
    color: 'green'
  },
  Cancelled: {
    label: 'ملغي',
    icon: Ban,
    color: 'red'
  }
};

export default AdminDashboard;