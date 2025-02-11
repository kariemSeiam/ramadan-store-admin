import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, Search, Plus, Check, X, AlertTriangle,
  Upload, Loader2, Facebook, Phone, MessageSquare,
  ChevronRight, Settings, MoreVertical, ArrowUpDown
} from 'lucide-react';
import {AddListDialog, PlacesGrid } from './PlacesGrid.jsx'; // Import the new PlacesGrid component



// Stats Card Component
const StatsCard = ({ label, value, color = 'blue' }) => (
  <div className={`bg-${color}-500/10 px-4 py-2 rounded-xl`}>
    <div className={`text-${color}-400 text-sm mb-1`}>{label}</div>
    <div className="text-xl font-bold">{value}</div>
  </div>
);

const WhatsAppDashboard = () => {
  // State Management
  const [places, setPlaces] = useState([]);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddListDialog, setShowAddListDialog] = useState(false);
  const [showEditMessageDialog, setShowEditMessageDialog] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newListData, setNewListData] = useState({
    name: '',
    messageTemplate: '',
    file: null
  });

  // Keep stats state but update it differently
  const [stats, setStats] = useState({
    all: 0,
    connected: 0,
    notConnected: 0,
    unsupported: 0
  });

  // Handler for WhatsApp action
  const handleSendMessage = (place) => {
    const encodedMessage = encodeURIComponent(place.formatted_message);
    window.open(`https://wa.me/${place.phone}?text=${encodedMessage}`, '_blank');
  };

  // Update place status handler
  const updatePlaceStatus = async (placeId, newStatus) => {
    try {
      const response = await fetch(`https://wabulk.pythonanywhere.com/api/places/${placeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // We'll let the PlacesGrid component handle its own state update
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  // Fetch lists (keep as is)
  const fetchLists = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://wabulk.pythonanywhere.com/api/lists');
      const data = await response.json();
      setLists(data.lists);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
    setLoading(false);
  };

  // Handle file upload (keep as is)
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const places = JSON.parse(e.target.result);

        const payload = {
          name: newListData.name,
          message_template: newListData.messageTemplate,
          places: places
        };

        const response = await fetch('https://wabulk.pythonanywhere.com/api/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setShowAddListDialog(false);
          fetchLists();
          setNewListData({ name: '', messageTemplate: '', file: null });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Update message template (keep as is)
  const updateMessageTemplate = async () => {
    if (!selectedList) return;

    try {
      const response = await fetch(`https://wabulk.pythonanywhere.com/api/lists/${selectedList.id}/message`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_template: messageTemplate })
      });

      if (response.ok) {
        setShowEditMessageDialog(false);
        // Don't need to fetch places here anymore as PlacesGrid will handle it
      }
    } catch (error) {
      console.error('Error updating message template:', error);
    }
  };

  // Stats update callback
  const handleStatsUpdate = useCallback((newStats) => {
    setStats(newStats);
  }, []);

  // Effects
  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      setMessageTemplate(selectedList.message_template);
    }
  }, [selectedList]);

  
  const fetchPlaces = useCallback(async (listId) => {
    if (!listId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://wabulk.pythonanywhere.com/api/lists/${listId}/places`);
      const data = await response.json();
      setPlaces(data.places);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
    setLoading(false);
  }, []);


  // Effects
  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList) {
      fetchPlaces(selectedList.id);
      setMessageTemplate(selectedList.message_template);
    }
  }, [selectedList, fetchPlaces]);

  useEffect(() => {
    setStats({
      total: places.length,
      connected: places.filter(p => p.status === 'connected').length,
      notConnected: places.filter(p => p.status === 'not_connected').length,
      unsupported: places.filter(p => p.status === 'unsupported').length
    });
  }, [places]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/95 
                    to-gray-900/80 backdrop-blur-2xl border-b border-gray-800/30 
                    text-white overflow-x-hidden"
         dir="rtl">
      <main className="container mx-auto px-4 pb-6">
        {/* Header Section */}
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 
                           via-blue-500 to-blue-600 bg-clip-text text-transparent">
                WA-Bulk
              </h1>
              {selectedList && (
                <div className="hidden sm:flex items-center gap-2 text-gray-400">
                  <ChevronRight size={16} />
                  <span>{selectedList.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedList && (
                <button
                  onClick={() => setShowEditMessageDialog(true)}
                  className="bg-gray-800/50 w-10 h-10 rounded-full flex items-center 
                           justify-center hover:bg-gray-700/50 transition-all duration-300
                           sm:w-auto sm:px-4 sm:h-auto sm:py-2 sm:rounded-xl"
                >
                  <MessageSquare size={18} />
                  <span className="hidden sm:inline sm:mr-2">تعديل الرسالة</span>
                </button>
              )}
              <button
                onClick={() => setShowAddListDialog(true)}
                className="bg-blue-600 w-10 h-10 rounded-full flex items-center 
                         justify-center hover:bg-blue-700 transition-all duration-300
                         shadow-sm shadow-blue-500/20
                         sm:w-auto sm:px-4 sm:h-auto sm:py-2 sm:rounded-xl"
              >
                <Plus size={18} />
                <span className="hidden sm:inline sm:mr-2">قائمة جديدة</span>
              </button>
            </div>
          </div>

          {/* Stats Section */}
          {selectedList && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <StatsCard label="الإجمالي" value={stats.all} color="blue" />
              <StatsCard label="متصل" value={stats.connected} color="green" />
              <StatsCard label="غير متصل" value={stats.not_connected} color="yellow" />
              <StatsCard label="غير مدعوم" value={stats.unsupported} color="red" />
            </div>
          )}

          {/* Lists Section */}
          <div className="mt-4 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setSelectedList(list)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap flex items-center gap-2
                           transition-all duration-300 ${
                    selectedList?.id === list.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50'
                  }`}
                >
                  {list.name}
                  
                </button>
              ))}
            </div>
          </div>

          {/* Search Section */}
          <div className="relative mt-4">
            <div className="flex items-center gap-4 mb-2">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-800/20 border border-gray-700/20 rounded-xl px-4 py-2.5 
                         text-sm focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Places Grid - Using the new component */}
        {places.length > 0 && (
           <PlacesGrid
           selectedList={selectedList}
           searchTerm={searchTerm}
           onUpdateStatus={updatePlaceStatus}
           onSendMessage={handleSendMessage}
           onStatsUpdate={handleStatsUpdate}
         />
        )}

        {/* Empty States */}
        {!loading && places.length === 0 && selectedList && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-8 animate-float">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
              <div className="relative bg-blue-500/10 p-6 rounded-full">
                <MessageCircle size={56} className="text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-3">لا توجد أماكن في هذه القائمة</h3>
            <p className="text-gray-400 text-sm max-w-md">
              قم بإضافة أماكن جديدة عن طريق تحميل ملف JSON للبدء في إرسال الرسائل
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !selectedList && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mb-8 animate-float">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20"></div>
              <div className="relative bg-blue-500/10 p-6 rounded-full">
                <MessageCircle size={56} className="text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-3">اختر قائمة للبدء</h3>
            <p className="text-gray-400 text-sm mb-8 max-w-md">
              اختر قائمة من الأعلى أو قم بإنشاء قائمة جديدة للبدء في إدارة جهات الاتصال
            </p>
            <button
              onClick={() => setShowAddListDialog(true)}
              className="bg-blue-600 px-8 py-3 rounded-full flex items-center gap-3 
                       hover:bg-blue-700 transition-all duration-300 
                       shadow-sm shadow-blue-500/20 group"
            >
              <Plus size={20} />
              <span>إنشاء قائمة جديدة</span>
              <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 
                                              transition-opacity" />
            </button>
          </div>
        )}
      </main>

      {/* Add List Dialog */}
      {showAddListDialog && (
        <AddListDialog
        onClose={() => setShowAddListDialog(false)}
        onSuccess={() => {
          fetchLists();
          setShowAddListDialog(false);
        }}
      />
      )}

      {/* Edit Message Dialog */}
      {showEditMessageDialog && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl"
               onClick={() => setShowEditMessageDialog(false)} />
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
                      تعديل قالب الرسالة
                    </h3>
                    <button
                      onClick={() => setShowEditMessageDialog(false)}
                      className="p-2 rounded-xl hover:bg-gray-800/50 
                               transition-colors group"
                    >
                      <X size={20} className="text-gray-400 group-hover:text-gray-200 
                                          transition-colors" />
                    </button>
                  </div>

                  {/* Message Template */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1.5">
                        قالب الرسالة
                      </label>
                      <textarea
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        placeholder="اكتب قالب الرسالة هنا..."
                        className="w-full bg-gray-800/50 border border-gray-700/30 
                                 rounded-xl p-4 text-sm focus:ring-2 
                                 focus:ring-blue-500/50 transition-all h-48 
                                 resize-none placeholder:text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        المتغيرات المتاحة: ${'{name}'}, ${'{phone_number}'}, ${'{facebook_url}'}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-3">
                      <button
                        onClick={updateMessageTemplate}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 
                                 hover:from-blue-500 hover:to-blue-400
                                 py-3 rounded-xl flex items-center justify-center 
                                 gap-2 transition-all duration-300 shadow-sm 
                                 shadow-blue-500/20 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                                     via-white/10 to-transparent -translate-x-full
                                     group-hover:translate-x-full transition-transform 
                                     duration-1000" />
                        <span className="relative">حفظ التغييرات</span>
                      </button>
                      <button
                        onClick={() => setShowEditMessageDialog(false)}
                        className="w-full bg-gray-800/50 py-3 rounded-xl 
                                 flex items-center justify-center gap-2 
                                 hover:bg-gray-700/50 transition-all"
                      >
                        <span>إلغاء</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl flex items-center 
                      justify-center z-50">
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
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        .mask-fade-edges {
          mask-image: linear-gradient(to right, 
            transparent, black 10%, black 90%, transparent);
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes slide-in-from-bottom {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .slide-in-from-bottom {
          animation: slide-in-from-bottom 0.3s ease-out;
        }

        .animate-in {
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default WhatsAppDashboard;