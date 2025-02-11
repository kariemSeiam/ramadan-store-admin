import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MessageCircle, Phone, Facebook, Check, AlertTriangle, Loader2,
    Copy, CheckCircle, ExternalLink, ChevronLeft
} from 'lucide-react';

import _ from 'lodash';

import { X, Upload } from 'lucide-react';


const PlaceCard = ({ place, onUpdateStatus, onSendMessage }) => {
    const [copiedPhone, setCopiedPhone] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const copyToClipboard = async (text) => {
        await navigator.clipboard.writeText(text);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative isolate bg-gradient-to-br 
                 from-gray-900/90 via-gray-800/90 to-gray-900/90
                 backdrop-blur-xl border border-gray-800/50 rounded-3xl 
                 overflow-hidden transition-all duration-500 
                 hover:scale-[1.02] hover:shadow-2xl
                 ${place.status === 'not_connected' ? 'ring-2 ring-yellow-500/20' : ''}
                 hover:border-blue-500/20 hover:shadow-blue-500/5`}
        >
            {/* Dynamic Background Glow */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 
                      transition-opacity duration-500 ${place.status === 'connected'
                    ? 'bg-gradient-conic from-green-500/30 via-transparent to-green-500/30' :
                    place.status === 'unsupported'
                        ? 'bg-gradient-conic from-red-500/30 via-transparent to-red-500/30' :
                        'bg-gradient-conic from-yellow-500/30 via-transparent to-yellow-500/30'
                }`} />

            {/* Status Indicator Light */}
            <div className={`absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 
                      rounded-full text-sm border backdrop-blur-lg 
                      transition-all duration-300 ${place.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    place.status === 'unsupported'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span>{
                    place.status === 'connected' ? 'متصل' :
                        place.status === 'unsupported' ? 'غير مدعوم' :
                            'غير متصل'
                }</span>
            </div>

            {/* Main Content */}
            <div className="relative p-6 space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <h3 className="font-medium text-md text-white group-hover:text-blue-400 
                       transition-colors line-clamp-2 pt-[-10px] ">
                        {place.name}
                    </h3>

                    {/* Contact Info */}
                    <div className="space-y-2">
                        <button
                            onClick={() => copyToClipboard(place.phone)}
                            className="flex items-center gap-2 w-full text-gray-400 
                       bg-gray-800/40 hover:bg-gray-800/60 px-4 py-2.5 
                       rounded-xl text-sm transition-all group/phone
                       relative overflow-hidden"
                        >
                            <Phone size={16} className="shrink-0" />
                            <span className="font-mono flex-1 text-right">{place.phone}</span>
                            <div className={`absolute inset-0 bg-green-500/10 
                           transition-transform duration-500 ease-out
                           ${copiedPhone ? 'translate-x-0' : 'translate-x-full'}`} />
                            {copiedPhone ? (
                                <CheckCircle size={16} className="text-green-400 shrink-0 relative" />
                            ) : (
                                <Copy size={16} className="opacity-0 group-hover/phone:opacity-100 
                                       transition-opacity relative" />
                            )}
                        </button>

                        {place.facebook_url && (
                            <a
                                href={place.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-400 
                         bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2.5 
                         rounded-xl text-sm transition-all group/fb"
                            >
                                <Facebook size={16} className="shrink-0" />
                                <span className="flex-1 text-right">صفحة فيسبوك</span>
                                <ExternalLink size={14} className="opacity-0 group-hover/fb:opacity-100 
                                               transition-opacity" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={() => onSendMessage(place)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-500 
                     hover:from-green-500 hover:to-green-400
                     px-4 py-3 rounded-xl flex items-center justify-center gap-3 
                     transition-all duration-300 shadow-lg shadow-green-500/20
                     group/btn relative overflow-hidden"
                    >
                        {/* Animated Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                         via-white/10 to-transparent -translate-x-full
                         group-hover/btn:translate-x-full transition-transform 
                         duration-1000 ease-in-out" />

                        <MessageCircle size={18} className="shrink-0" />
                        <span>تواصل عبر واتساب</span>
                        <ChevronLeft size={18} className="shrink-0 opacity-0 
                                          group-hover/btn:opacity-100 
                                          transition-opacity" />
                    </button>

                    <div className="flex gap-2">
                        {/* Success Button */}
                        <button
                            onClick={() => onUpdateStatus(place.id, 'connected')}
                            className="flex-1 relative overflow-hidden group/success
                       bg-gradient-to-br from-gray-800/50 to-gray-900/50
                       hover:from-green-500/20 hover:to-green-600/20
                       text-green-400 py-3 rounded-xl transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                           via-green-400/10 to-transparent -translate-x-full
                           group-hover/success:translate-x-full transition-transform 
                           duration-1000 ease-in-out" />
                            <Check size={18} className="mx-auto relative" />
                        </button>

                        {/* Alert Button */}
                        <button
                            onClick={() => onUpdateStatus(place.id, 'unsupported')}
                            className="flex-1 relative overflow-hidden group/alert
                       bg-gradient-to-br from-gray-800/50 to-gray-900/50
                       hover:from-red-500/20 hover:to-red-600/20
                       text-red-400 py-3 rounded-xl transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                           via-red-400/10 to-transparent -translate-x-full
                           group-hover/alert:translate-x-full transition-transform 
                           duration-1000 ease-in-out" />
                            <AlertTriangle size={18} className="mx-auto relative" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// StatusFilter component
const StatusFilter = ({ counts, activeStatus, onStatusChange }) => {
    const filters = [
        { id: 'not_connected', label: 'غير متصل', color: 'amber' },
        { id: 'connected', label: 'متصل', color: 'emerald' },
        { id: 'all', label: 'الكل', color: 'blue' }
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => onStatusChange(filter.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl 
                     transition-all duration-300 ${activeStatus === filter.id
                            ? `bg-${filter.color}-500/20 text-${filter.color}-400 
                 ring-1 ring-${filter.color}-500/30`
                            : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                        }`}
                >
                    <span>{filter.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-900/30">
                        {counts[filter.id] || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export const PlacesGrid = ({ selectedList, searchTerm, onUpdateStatus, onSendMessage, onStatsUpdate }) => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [statusCounts, setStatusCounts] = useState({});
    const [activeStatus, setActiveStatus] = useState('not_connected');
    const loaderRef = useRef(null);
    const loadingRef = useRef(false);

    const fetchPlaces = useCallback(async (pageNum, isNewSearch = false) => {
        if (!selectedList?.id || loadingRef.current) return;

        try {
            loadingRef.current = true;
            setLoading(true);
            setError(null);

            const searchParams = new URLSearchParams({
                page: pageNum,
                per_page: 12,
                status: activeStatus,
                search: searchTerm || ''
            });

            const response = await fetch(
                `https://wabulk.pythonanywhere.com/api/lists/${selectedList.id}/places?${searchParams}`
            );

            if (!response.ok) throw new Error('Failed to fetch places');

            const data = await response.json();

            setPlaces(prevPlaces => {
                if (isNewSearch) return data.places;
                const newPlaces = data.places.filter(
                    newPlace => !prevPlaces.some(existingPlace => existingPlace.id === newPlace.id)
                );
                return [...prevPlaces, ...newPlaces];
            });

            setStatusCounts(data.status_counts);
            setHasMore(data.pagination.has_next);

            if (onStatsUpdate) {
                onStatsUpdate(data.status_counts);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [selectedList?.id, searchTerm, activeStatus, onStatsUpdate]);

    const handleStatusChange = useCallback((newStatus) => {
        setActiveStatus(newStatus);
        setPage(1);
        setPlaces([]);
        setHasMore(true);
    }, []);

    const handleUpdateStatus = async (placeId, newStatus) => {
        try {
            const success = await onUpdateStatus(placeId, newStatus);
            if (success) {
                setPlaces(prevPlaces => {
                    const updatedPlaces = prevPlaces.filter(place => place.id !== placeId);

                    if (updatedPlaces.length < 12 && hasMore) {
                        setTimeout(() => setPage(prev => prev + 1), 300);
                    }

                    return updatedPlaces;
                });

                // Update counts
                setStatusCounts(prev => ({
                    ...prev,
                    [activeStatus]: Math.max(0, prev[activeStatus] - 1),
                    [newStatus]: prev[newStatus] + 1
                }));

                if (onStatsUpdate) {
                    onStatsUpdate(prev => ({
                        ...prev,
                        [activeStatus]: Math.max(0, prev[activeStatus] - 1),
                        [newStatus]: prev[newStatus] + 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const target = entries[0];
                if (target.isIntersecting && hasMore && !loadingRef.current) {
                    setTimeout(() => {
                        setPage(prevPage => prevPage + 1);
                    }, 100);
                }
            },
            {
                root: null,
                rootMargin: '200px',
                threshold: 0.1
            }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore]);

    useEffect(() => {
        setPage(1);
        setPlaces([]);
        setHasMore(true);
        fetchPlaces(1, true);
    }, [selectedList?.id, searchTerm, activeStatus]);

    useEffect(() => {
        if (page > 1) {
            fetchPlaces(page, false);
        }
    }, [page]);

    useEffect(() => {
        const handleScroll = _.debounce(() => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
                if (hasMore && !loadingRef.current) {
                    setPage(prevPage => prevPage + 1);
                }
            }
        }, 100);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20"></div>
                    <div className="relative bg-red-500/10 p-6 rounded-full">
                        <AlertTriangle size={56} className="text-red-400" />
                    </div>
                </div>
                <h3 className="text-xl font-medium mb-3 text-red-400">حدث خطأ</h3>
                <p className="text-gray-400 text-sm mb-8 max-w-md">{error}</p>
                <button
                    onClick={() => fetchPlaces(1, true)}
                    className="bg-blue-600 px-8 py-3 rounded-full hover:bg-blue-700 
                   transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (!selectedList) return null;

    return (
        <div className="space-y-6" dir="rtl">
            <StatusFilter
                counts={statusCounts}
                activeStatus={activeStatus}
                onStatusChange={handleStatusChange}
            />

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place, index) => (
                    <div
                        key={place.id}
                        className="transform transition-all duration-300 animate-fadeIn"
                    >
                        <PlaceCard
                            place={place}
                            onUpdateStatus={handleUpdateStatus}
                            onSendMessage={onSendMessage}
                        />
                    </div>
                ))}
            </div>

            <div ref={loaderRef} className="py-8 flex justify-center">
                {loading && (
                    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 
                       backdrop-blur-xl border border-gray-700/20 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20"></div>
                                <Loader2 className="animate-spin text-blue-400 relative" size={24} />
                            </div>
                            <span className="text-lg">جاري التحميل...</span>
                        </div>
                    </div>
                )}
            </div>

            {!loading && places.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative mb-8 animate-float">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
                        <div className="relative bg-blue-500/10 p-6 rounded-full">
                            <MessageCircle size={56} className="text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-xl font-medium mb-3">لا توجد نتائج</h3>
                    <p className="text-gray-400 text-sm max-w-md">
                        {searchTerm
                            ? 'لا توجد نتائج تطابق بحثك'
                            : `لا توجد أماكن ${activeStatus === 'connected' ? 'متصلة' :
                                activeStatus === 'unsupported' ? 'غير مدعومة' :
                                    'غير متصلة'
                            }`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

const processPlaces = (places) => {
    return places.map(place => ({
        name: place.name,
        phone: formatPhoneNumber(place.phone_number),
        facebook_url: place.url || ''
    })).filter(place => place.phone);
};

const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('01')) {
        return '+2' + cleaned;
    } else if (cleaned.startsWith('201')) {
        return '+' + cleaned;
    } else if (cleaned.startsWith('2001')) {
        return '+' + cleaned.slice(2);
    }
    return null;
};

const CustomButton = ({
    children,
    onClick,
    disabled,
    variant = 'primary',
    className = ''
}) => {
    const baseStyles = "w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20",
        secondary: "bg-gray-800/50 hover:bg-gray-700/50"
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const CustomInput = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    type = 'text',
    className = ''
}) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1.5">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-gray-800/50 border border-gray-700/30 
                   rounded-xl p-3 text-sm focus:ring-2 
                   focus:ring-blue-500/50 transition-all
                   placeholder:text-gray-600 disabled:opacity-50 ${className}`}
        />
    </div>
);

const CustomTextarea = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    hint,
    className = ''
}) => (
    <div>
        <label className="text-sm text-gray-400 block mb-1.5">
            {label}
        </label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-gray-800/50 border border-gray-700/30 
                   rounded-xl p-4 text-sm focus:ring-2 
                   focus:ring-blue-500/50 transition-all h-32 
                   resize-none placeholder:text-gray-600
                   disabled:opacity-50 ${className}`}
        />
        {hint && (
            <p className="text-xs text-gray-500 mt-2">{hint}</p>
        )}
    </div>
);

export const AddListDialog = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        messageTemplate: '',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const text = await file.text();
            const places = JSON.parse(text);
            const processedPlaces = processPlaces(places);

            if (processedPlaces.length === 0) {
                throw new Error('No valid places found in file');
            }

            const response = await fetch('https://wabulk.pythonanywhere.com/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    message_template: formData.messageTemplate,
                    places: processedPlaces
                })
            });

            if (!response.ok) {
                throw new Error('Failed to upload list');
            }

            const data = await response.json();
            onSuccess(data);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to process file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl"
                onClick={onClose}
            />
            <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4">
                <div className="w-full max-w-lg animate-in slide-in-from-bottom duration-300">
                    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 
                           backdrop-blur-xl border border-gray-700/20 rounded-3xl 
                           shadow-2xl">
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-100 
                                to-gray-300 bg-clip-text text-transparent">
                                    إضافة قائمة جديدة
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-gray-800/50 
                               transition-colors group"
                                >
                                    <X size={20} className="text-gray-400 group-hover:text-gray-200 
                                          transition-colors" />
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <div className="space-y-4">
                                <CustomInput
                                    label="اسم القائمة"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="اكتب اسم القائمة..."
                                    disabled={loading}
                                />

                                <div>
                                    <label className="text-sm text-gray-400 block mb-1.5">
                                        ملف JSON
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".json"
                                            onChange={handleFileUpload}
                                            disabled={loading}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`w-full bg-gray-800/50 border border-gray-700/30 
                                  rounded-xl p-4 text-sm flex items-center justify-center 
                                  gap-3 cursor-pointer hover:bg-gray-800/70 
                                  transition-all group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Upload size={18} className="text-gray-400 group-hover:text-gray-200 
                                                   transition-colors" />
                                            <span className="text-gray-400 group-hover:text-gray-200">
                                                اختر ملف JSON
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <CustomTextarea
                                    label="قالب الرسالة"
                                    name="messageTemplate"
                                    value={formData.messageTemplate}
                                    onChange={handleChange}
                                    placeholder="اكتب قالب الرسالة هنا..."
                                    disabled={loading}
                                    hint="المتغيرات المتاحة: ${'{name}'}, ${'{phone_number}'}, ${'{facebook_url}'}"
                                />

                                <div className="pt-4 space-y-3">
                                    <CustomButton
                                        onClick={() => document.getElementById('file-upload').click()}
                                        disabled={loading || !formData.name || !formData.messageTemplate}
                                        variant="primary"
                                    >
                                        <span>
                                            {loading ? 'جاري الرفع...' : 'رفع القائمة'}
                                        </span>
                                    </CustomButton>

                                    <CustomButton
                                        onClick={onClose}
                                        disabled={loading}
                                        variant="secondary"
                                    >
                                        <span>إلغاء</span>
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


