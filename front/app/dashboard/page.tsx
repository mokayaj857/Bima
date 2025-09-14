'use client'

import React, { useState, useEffect } from 'react';
import { Search, FileText, Edit, Users, BookOpen, Download, Send, X, Menu, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface NavLinkProps {
  children: React.ReactNode;
  href?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ children, href = "#" }) => (
  <a 
    href={href}
    className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
  >
    {children}
  </a>
);

const RhodaDashboard: React.FC = () => {
  // All hooks at the top, before any early returns
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Courses');
  const [enrolled, setEnrolled] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [published, setPublished] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);


  React.useEffect(() => {
    fetch('/api/user-content')
      .then(res => res.json())
      .then(data => {
        setEnrolled(data.enrolled || []);
        setBookmarks(data.bookmarks || []);
        setDrafts(data.drafts || []);
        setPublished(data.published || []);
        setSubscriptions(data.subscriptions || []);
      });
  }, []);

  // Authentication check
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const contentData: Record<string, Array<any>> = {
    Courses: enrolled,
    Bookmarks: bookmarks,
    'My Content': [], // You can map to user's own created content if available
    Drafts: drafts,
    Published: published,
    Subscriptions: subscriptions,
  };

  const tabs = [
    { label: 'Courses', value: 'Courses', icon: <BookOpen size={18} /> },
    { label: 'Bookmarks', value: 'Bookmarks', icon: <Bookmark size={18} /> },
    { label: 'My Content', value: 'My Content', icon: <FileText size={18} /> },
    { label: 'Drafts', value: 'Drafts', icon: <Edit size={18} /> },
    { label: 'Published', value: 'Published', icon: <Send size={18} /> },
    { label: 'Subscriptions', value: 'Subscriptions', icon: <Download size={18} /> },
  ];

  const filteredContent = contentData[activeTab]?.filter(item =>
    (item.title?.toLowerCase?.().includes(searchQuery.toLowerCase()) ||
    item.subtitle?.toLowerCase?.().includes(searchQuery.toLowerCase()))
  ) || [];

  // Ensure each course card has a visible background color
  const getCardColor = (item: any, idx: number) => {
    // Use color from item if present, else fallback to a visible default
    return item.color || [
      'bg-green-100',
      'bg-yellow-100',
      'bg-blue-100',
      'bg-purple-100',
      'bg-pink-100',
      'bg-orange-100',
      'bg-red-100',
    ][idx % 7];
  };

  return (
    <div className="min-h-screen flex bg-[#1e1e1e] relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-64 h-screen border-r border-white/10 flex flex-col bg-[#181818]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo and Close Button */}
        

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Courses' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Courses')}
            >
              <Users size={20} />
              <span>My Courses</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Bookmarks' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Bookmarks')}
            >
              <Bookmark size={20} />
              <span>Bookmarks</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Drafts' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Drafts')}
            >
              <Edit size={20} />
              <span>Drafts</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Published' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Published')}
            >
              <Send size={20} />
              <span>Published</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Subscriptions' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Subscriptions')}
            >
              <Download size={20} />
              <span>Subscriptions</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar Section */}
        <div className="flex items-center justify-between px-6 py-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/80 hover:text-white transition-colors mr-4"
          >
            <Menu size={24} />
          </button>
          
          {/* Search Bar Centered */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#353535] border border-transparent rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>
          </div>
        </div>

        {/* Main Content Area - Fixed Grid Layout */}
        <main className="p-6">
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredContent.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.id ? `/dashboard/course/${item.id}` : '#'}
                  className={`flex flex-col rounded-2xl px-4 lg:px-6 py-4 lg:py-5 ${getCardColor(item, idx)} shadow-lg hover:shadow-xl transition-shadow duration-200`}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base lg:text-lg text-gray-900 mb-1 line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {item.subtitle}
                      </div>
                      {item.readTime && (
                        <div className="text-gray-600 text-xs">{item.readTime}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/80 py-10">
              {searchQuery ? 'No content matches your search.' : 'No content available.'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RhodaDashboard;