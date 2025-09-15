'use client'

import React, { useState, useEffect } from 'react';
import { Search, FileText, Edit, Users, BookOpen, Download, Send, X, Menu, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import WaterFlowChart from '@/components/WaterFlowChart';
import SensorMap from '@/components/SensorMap';
import WaterConsumptionChart from '@/components/WaterConsumptionChart';
import HistoricalDataChart from '@/components/HistoricalDataChart';
import AnomalyDetection from '@/components/AnomalyDetection';
import AnomalyAlert from '@/components/AnomalyAlert';

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

const BimaDashboard: React.FC = () => {
  // All hooks at the top, before any early returns
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Overview');

  const contentData: Record<string, Array<any>> = {
    Overview: [],
    WaterFlow: [],
    SensorMap: [],
    Consumption: [],
    HistoricalData: [],
    AnomalyDetection: [],
  };

  const tabs = [
    { label: 'Overview', value: 'Overview', icon: <BookOpen size={18} /> },
    { label: 'Water Flow', value: 'WaterFlow', icon: <Bookmark size={18} /> },
    { label: 'Sensor Map', value: 'SensorMap', icon: <FileText size={18} /> },
    { label: 'Consumption', value: 'Consumption', icon: <Edit size={18} /> },
    { label: 'Historical Data', value: 'HistoricalData', icon: <Send size={18} /> },
    { label: 'Anomaly Detection', value: 'AnomalyDetection', icon: <Download size={18} /> },
  ];



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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Overview' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Overview')}
            >
              <Users size={20} />
              <span>Overview</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'WaterFlow' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('WaterFlow')}
            >
              <Bookmark size={20} />
              <span>Water Flow</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'SensorMap' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('SensorMap')}
            >
              <Edit size={20} />
              <span>Sensor Map</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'Consumption' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('Consumption')}
            >
              <Send size={20} />
              <span>Consumption</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'HistoricalData' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('HistoricalData')}
            >
              <Download size={20} />
              <span>Historical Data</span>
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base ${activeTab === 'AnomalyDetection' ? 'bg-[#232323] text-white' : 'text-white/80 hover:text-white hover:bg-[#232323]'}`}
              onClick={() => setActiveTab('AnomalyDetection')}
            >
              <FileText size={20} />
              <span>Anomaly Detection</span>
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

        {/* Main Content Area */}
        <main className="p-6">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Water Monitoring Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-[#232323] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Sensors</h3>
                  <p className="text-3xl font-bold text-blue-400">24</p>
                  <p className="text-sm text-gray-400">Active monitoring</p>
                </div>
                <div className="bg-[#232323] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Current Flow Rate</h3>
                  <p className="text-3xl font-bold text-green-400">1.2 L/s</p>
                  <p className="text-sm text-gray-400">Normal range</p>
                </div>
                <div className="bg-[#232323] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Anomalies Detected</h3>
                  <p className="text-3xl font-bold text-red-400">2</p>
                  <p className="text-sm text-gray-400">Last 24 hours</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'WaterFlow' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Water Flow Visualization</h2>
              <div className="bg-[#232323] rounded-lg p-6">
                <WaterFlowChart />
              </div>
            </div>
          )}

          {activeTab === 'SensorMap' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Sensor Locations Map</h2>
              <div className="bg-[#232323] rounded-lg p-6">
                
                <SensorMap />
              </div>
            </div>
          )}

          {activeTab === 'Consumption' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Water Consumption Analysis</h2>
              <div className="bg-[#232323] rounded-lg p-6">
                <WaterConsumptionChart />
              </div>
            </div>
          )}

          {activeTab === 'HistoricalData' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Historical Data Trends</h2>
              <div className="bg-[#232323] rounded-lg p-6">
                <HistoricalDataChart />
              </div>
            </div>
          )}

          {activeTab === 'AnomalyDetection' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Anomaly Detection System</h2>
              <AnomalyDetection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BimaDashboard;
