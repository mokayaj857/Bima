'use client'

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Upload, 
  AlertCircle, 
  BarChart3, 
  Settings, 
  Bell, 
  Zap, 
  Clock, 
  TrendingUp,
  Droplets,
  Leaf,
  Settings2,
  Users,
  FileBarChart2,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Home,
  LayoutDashboard,
  X,
  Activity,
  FileSpreadsheet,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
  User,
  BookOpen,
  Bookmark,
  Edit,
  Send,
  Download as DownloadIcon,
  Cpu,
  ShieldCheck,
  Menu,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Navigation tabs configuration using landing page colors
const tabs = [
  { 
    value: 'overview', 
    label: 'Overview', 
    icon: <LayoutDashboard className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
  { 
    value: 'water', 
    label: 'Water Flow', 
    icon: <Droplets className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
  { 
    value: 'sensor', 
    label: 'Sensor Map', 
    icon: <Activity className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
  { 
    value: 'bills', 
    label: 'Bill Parsing', 
    icon: <FileSpreadsheet className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
  { 
    value: 'ai', 
    label: 'AI Insights', 
    icon: <Cpu className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    icon: <ShieldCheck className="h-5 w-5" />,
    primaryColor: '#F37933', // Orange from landing page
    secondaryColor: '#F3C80F', // Yellow from landing page
    glowColor: 'rgba(243, 121, 51, 0.2)'
  },
];

// Placeholder components for missing imports
const AIRecommendations = () => (
  <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
    <h3 className="text-xl font-semibold mb-4">AI Recommendations</h3>
    <p className="text-gray-400">AI recommendations will appear here.</p>
  </div>
);

const BillParsingUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Handle successful upload
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Bill Parsing</CardTitle>
        <CardDescription className="text-gray-300">Upload and analyze your water bills</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
          {file ? (
            <div className="space-y-4">
              <FileText className="mx-auto h-12 w-12 text-blue-400" />
              <p className="text-sm text-gray-300">{file.name}</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  Change File
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload Bill'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-500" />
              <div className="text-sm text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminPanel = () => {
  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Admin Panel</CardTitle>
        <CardDescription className="text-gray-300">Manage system settings and configurations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-400">Admin features will appear here.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">Manage user accounts and permissions</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">Configure system preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Dynamic imports for better performance
const WaterFlowChart = dynamic(
  () => import('@/components/WaterFlowChart').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading chart...</div> }
);
const SensorMap = dynamic(
  () => import('@/components/SensorMap').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading map...</div> }
);
const WaterConsumptionChart = dynamic(
  () => import('@/components/WaterConsumptionChart').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading consumption data...</div> }
);
const HistoricalDataChart = dynamic(
  () => import('@/components/HistoricalDataChart').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading historical data...</div> }
);
const AnomalyDetection = dynamic(
  () => import('@/components/AnomalyDetection').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading anomaly detection...</div> }
);
const AnomalyAlert = dynamic(
  () => import('@/components/AnomalyAlert').then(mod => mod.default),
  { ssr: false, loading: () => <div>Loading alerts...</div> }
);

const PredictiveAnalysisChart = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-900/80 to-gray-800/80 text-white backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
        <CardHeader className="border-b border-gray-700/50">
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </motion.div>
                Predictive Analysis
              </CardTitle>
              <CardDescription className="text-gray-300/90">
                AI-powered forecasts for water usage and carbon emissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                <Clock className="mr-2 h-4 w-4" /> View Timeline
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white">
                    This Month <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>Last Month</DropdownMenuItem>
                  <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
                  <DropdownMenuItem>Custom Range</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="water" className="w-full">
              <TabsList className="bg-gray-800/50 border border-gray-700">
                <TabsTrigger value="water" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" /> Water
                </TabsTrigger>
                <TabsTrigger value="carbon" className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" /> Carbon Footprint
                </TabsTrigger>
              </TabsList>
              <TabsContent value="water" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Current Usage</span>
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          15,000 L/day
                        </Badge>
                      </div>
                      <Progress value={75} className="h-2 bg-gray-700 [&>div]:bg-blue-500" />
                      <p className="text-xs text-gray-400">
                        <span className="text-green-400">+5%</span> from last month
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">Peak Hours</span>
                        <Badge variant="outline" className="border-amber-500 text-amber-400">
                          9:00 AM - 2:00 PM
                        </Badge>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-sm">
                        <p className="text-gray-300">Shift 15% of usage to off-peak to save ~$1,200/mo</p>
                      </div>
                    </div>
                  </div>
                  <motion.div 
                    className="h-64 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-4 hover:border-blue-400/30 transition-all duration-300 overflow-hidden relative group"
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="h-full flex items-center justify-center relative z-10">
                      <WaterFlowChart />
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
              <TabsContent value="carbon" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimatedCard delay={0} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700/50 hover:border-green-400/30 transition-all duration-300 shadow-lg hover:shadow-green-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Carbon Footprint</span>
                        <motion.div 
                          className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Leaf className="w-4 h-4 text-green-400" />
                        </motion.div>
                      </div>
                      <motion.div 
                        className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                      >
                        2.4 tCO₂
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-400 mt-2 flex items-center gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <span>This month</span>
                        <motion.span
                          animate={{ y: [0, -2, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ↓
                        </motion.span>
                      </motion.div>
                    </AnimatedCard>
                    <AnimatedCard className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">vs. Last Month</div>
                      <div className="text-2xl font-bold text-red-400">+0.3 tCO₂</div>
                      <div className="text-xs text-gray-500 mt-1">14% increase</div>
                    </AnimatedCard>
                    <AnimatedCard className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="text-sm text-gray-400 mb-1">Efficiency Score</div>
                      <div className="flex items-center gap-2">
                        <Progress value={68} className="h-2.5 bg-gray-200 dark:bg-gray-700" />
                        <span className="text-amber-400 text-sm font-medium">68%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Industry avg: 72%</div>
                    </AnimatedCard>
                  </div>
                  <div className="h-64 rounded-lg bg-gray-800/50 border border-gray-700 p-4">
                    <div className="h-full flex items-center justify-center">
                      <HistoricalDataChart />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
  );
};

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0, className = '' }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            delay: delay * 0.1
          }
        }
      }}
      className={className}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

const BimaDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('water');

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isMounted ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex h-screen"
    >
      <motion.aside 
        className="w-64 bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border-r border-white/10 p-6 flex-shrink-0 relative overflow-hidden"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 256, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Animated background elements */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)',
              'linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
              'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute top-10 right-10 w-2 h-2 rounded-full"
          style={{ backgroundColor: 'rgba(243, 121, 51, 0.3)' }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-32 right-16 w-1 h-1 rounded-full"
          style={{ backgroundColor: 'rgba(243, 200, 15, 0.4)' }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-20 right-12 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'rgba(243, 121, 51, 0.35)' }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <motion.div 
          className="flex items-center gap-3 mb-8 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Link href="/">
              <motion.img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-8 rounded-lg shadow-lg"
                whileHover={{ 
                  boxShadow: "0 0 20px rgba(243, 121, 51, 0.5)",
                  filter: "brightness(1.2)"
                }}
              />
            </Link>
            <motion.div
              className="absolute inset-0 rounded-lg blur-sm -z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.2), rgba(243, 200, 15, 0.2))'
              }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <motion.h2 
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFF, #F3C80F)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Bima Dashboard
          </motion.h2>
        </motion.div>

        <motion.div 
          className="space-y-3 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.value}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index + 0.6, duration: 0.5 }}
            >
              <motion.button
                whileHover={{ 
                  x: 8,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.value)}
                className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl font-medium text-base transition-all duration-300 overflow-hidden ${
                  activeTab === tab.value 
                    ? 'text-white shadow-2xl border border-white/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
                style={activeTab === tab.value ? {
                  background: `linear-gradient(135deg, ${tab.primaryColor}, ${tab.secondaryColor})`,
                  boxShadow: `0 0 30px ${tab.glowColor}`
                } : {}}
              >
                {/* Animated background glow for active tab */}
                {activeTab === tab.value && (
                  <>
                    <motion.div
                      className="absolute inset-0 opacity-20 blur-xl"
                      style={{
                        background: `linear-gradient(135deg, ${tab.primaryColor}, ${tab.secondaryColor})`
                      }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </>
                )}

                {/* Active tab indicator */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom, ${tab.primaryColor}, ${tab.secondaryColor})`
                    }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                  />
                )}

                {/* Icon with enhanced animations */}
                <motion.div
                  className={`relative z-10 ${
                    activeTab === tab.value 
                      ? 'text-white' 
                      : 'text-white/60 group-hover:text-white'
                  }`}
                  animate={activeTab === tab.value ? {
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  } : {}}
                  transition={{ duration: 2, repeat: activeTab === tab.value ? Infinity : 0 }}
                >
                  {tab.icon}
                </motion.div>

                {/* Label with smooth transitions */}
                <motion.span 
                  className="relative z-10 font-semibold tracking-wide"
                  layout="position"
                  transition={{ duration: 0.3 }}
                >
                  {tab.label}
                </motion.span>

                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />

                {/* Ripple effect on click */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-2xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div 
          className="absolute bottom-6 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Animated background for main content */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 50%, rgba(15, 23, 42, 0.5) 100%)',
              'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.3) 50%, rgba(30, 41, 59, 0.5) 100%)',
              'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 50%, rgba(15, 23, 42, 0.5) 100%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Search Bar Section */}
        <motion.div 
          className="flex items-center justify-between px-6 py-6 border-b border-white/10 backdrop-blur-sm relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/80 hover:text-white transition-all duration-300 mr-4 p-2 rounded-lg hover:bg-white/10"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={24} />
          </motion.button>

          {/* Search Bar Centered */}
          <div className="flex-1 flex justify-center">
            <motion.div 
              className="relative w-full max-w-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {/* Search icon with glow effect */}
              <motion.div
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Search className="text-orange-400/80" size={20} />
              </motion.div>

              {/* Enhanced search input */}
              <motion.input
                type="text"
                placeholder="Search across all data and insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-400/50 text-base transition-all duration-300 shadow-lg"
                whileFocus={{ 
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(243, 121, 51, 0.3)',
                  borderColor: 'rgba(243, 121, 51, 0.5)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />

              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl blur-xl -z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.1))'
                }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              {/* Clear button with enhanced animations */}
              {searchQuery && (
                <motion.button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-all duration-300 p-1 rounded-full hover:bg-white/10"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              )}

              {/* Search suggestions indicator */}
              <motion.div
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs font-medium"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {!searchQuery && "⌘K"}
              </motion.div>
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div 
            className="hidden lg:flex items-center gap-3 ml-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5 text-white/70" />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-5 w-5 text-white/70" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Main Content Area */}
        <motion.main 
          key={activeTab}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.4 }
          }}
          className="flex-1 p-8 overflow-y-auto relative z-10"
        >
          {activeTab === 'overview' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Page Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #FFF, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Dashboard Overview
                </h1>
                <p className="text-white/60 text-lg">Real-time insights and system monitoring</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Enhanced Stat Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="border-0 backdrop-blur-sm transition-all duration-300 shadow-lg overflow-hidden relative" style={{
                    background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))',
                    border: '1px solid rgba(243, 121, 51, 0.3)'
                  }}>
                    {/* Animated background */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.1))'
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(243, 121, 51, 0.2)' }}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <Activity className="h-6 w-6" style={{ color: '#F37933' }} />
                        </motion.div>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-400"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #F37933, #F3C80F)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>24</p>
                      <p className="text-sm text-white/70 font-medium">Active Sensors</p>
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                        <p className="text-xs text-green-400 font-medium">All systems operational</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                {/* Water Flow Rate Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="border-0 backdrop-blur-sm transition-all duration-300 shadow-lg overflow-hidden relative" style={{
                    background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))',
                    border: '1px solid rgba(243, 121, 51, 0.3)'
                  }}>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.1))'
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
                    />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(243, 121, 51, 0.2)' }}
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        >
                          <Droplets className="h-6 w-6" style={{ color: '#F37933' }} />
                        </motion.div>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-400"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        />
                      </div>
                      <p className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #F37933, #F3C80F)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>1.2 L/s</p>
                      <p className="text-sm text-white/70 font-medium">Flow Rate</p>
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                        <p className="text-xs text-green-400 font-medium">Normal range</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Anomalies Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="border-0 backdrop-blur-sm transition-all duration-300 shadow-lg overflow-hidden relative" style={{
                    background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))',
                    border: '1px solid rgba(243, 121, 51, 0.3)'
                  }}>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.1))'
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(243, 121, 51, 0.2)' }}
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                        >
                          <AlertTriangle className="h-6 w-6" style={{ color: '#F37933' }} />
                        </motion.div>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-red-400"
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      <p className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #F37933, #F3C80F)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>2</p>
                      <p className="text-sm text-white/70 font-medium">Anomalies</p>
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 rounded-full bg-red-400 mr-2 animate-pulse"></div>
                        <p className="text-xs text-red-400 font-medium">Last 24 hours</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* System Health Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="border-0 backdrop-blur-sm transition-all duration-300 shadow-lg overflow-hidden relative" style={{
                    background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))',
                    border: '1px solid rgba(243, 121, 51, 0.3)'
                  }}>
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.1))'
                      }}
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                    />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <motion.div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: 'rgba(243, 121, 51, 0.2)' }}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                        >
                          <ShieldCheck className="h-6 w-6" style={{ color: '#F37933' }} />
                        </motion.div>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-green-400"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        />
                      </div>
                      <p className="text-4xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #F37933, #F3C80F)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>98%</p>
                      <p className="text-sm text-white/70 font-medium">System Health</p>
                      <div className="flex items-center mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                        <p className="text-xs text-green-400 font-medium">Excellent status</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'water' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #F37933, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Water Flow Analysis
                </h1>
                <p className="text-white/60 text-lg">Real-time water flow monitoring and analytics</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
              >
                <WaterFlowChart />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'sensor' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #F37933, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Sensor Network Map
                </h1>
                <p className="text-white/60 text-lg">Interactive sensor locations and status monitoring</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
              >
                <SensorMap key={activeTab} />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #F37933, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  AI Insights & Recommendations
                </h1>
                <p className="text-white/60 text-lg">Intelligent analysis and predictive recommendations</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
              >
                <AIRecommendations />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'bills' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #F37933, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Bill Parsing & Analysis
                </h1>
                <p className="text-white/60 text-lg">Upload and analyze your water bills with AI</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <BillParsingUploader />
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold mb-2" style={{
                  background: `linear-gradient(135deg, #F37933, #F3C80F)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  System Administration
                </h1>
                <p className="text-white/60 text-lg">Manage system settings and configurations</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <AdminPanel />
              </motion.div>
            </motion.div>
          )}
        </motion.main>
      </div>
      
      
      {/* Enhanced Background Elements */}
      <motion.div 
        className="fixed top-0 right-0 w-1/3 h-1/3 rounded-full filter blur-3xl -z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))'
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6],
          x: [0, 20, 0],
          y: [0, -10, 0]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="fixed bottom-0 left-0 w-1/2 h-1/2 rounded-full filter blur-3xl -z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.1), rgba(243, 200, 15, 0.05))'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4],
          x: [0, -15, 0],
          y: [0, 10, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full filter blur-3xl -z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(243, 121, 51, 0.05), rgba(243, 200, 15, 0.05))'
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          delay: 1
        }}
      />
      
      {/* Floating particles */}
      <motion.div 
        className="fixed top-20 left-20 w-2 h-2 rounded-full -z-10"
        style={{ backgroundColor: 'rgba(243, 121, 51, 0.3)' }}
        animate={{
          y: [0, -30, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.5, 1]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="fixed top-40 right-40 w-1 h-1 rounded-full -z-10"
        style={{ backgroundColor: 'rgba(243, 200, 15, 0.4)' }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.9, 0.4],
          scale: [1, 2, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div 
        className="fixed bottom-40 left-40 w-1.5 h-1.5 rounded-full -z-10"
        style={{ backgroundColor: 'rgba(243, 121, 51, 0.35)' }}
        animate={{
          y: [0, -25, 0],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </motion.div>
  );
};

export default BimaDashboard;
