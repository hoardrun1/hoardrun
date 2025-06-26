'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  Settings,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Wallet,
  BarChart3,
  Target,
  Receipt,
  Shield,
  Phone,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { navigation } from '@/lib/navigation';

interface SidebarProps {
  className?: string;
  onAddMoney?: () => void;
}

// Create a simple context for sidebar state if needed
export const useSidebarState = () => {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, setIsOpen };
};

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  description?: string;
  category: 'main' | 'financial' | 'account' | 'support';
}

const menuItems: MenuItem[] = [
  // Main Navigation
  { id: 'home', label: 'Dashboard', icon: Home, href: '/home', category: 'main' },
  { id: 'overview', label: 'Overview', icon: BarChart3, href: '/overview', category: 'main' },

  // Financial Features
  { id: 'savings', label: 'Savings Goals', icon: PiggyBank, href: '/savings', description: 'Manage your savings', category: 'financial' },
  { id: 'investments', label: 'Investments', icon: TrendingUp, href: '/investment', description: 'Grow your wealth', category: 'financial' },
  { id: 'transfer', label: 'Money Transfer', icon: ArrowUpRight, href: '/transfer', description: 'Send & receive money', category: 'financial' },
  { id: 'cards', label: 'Cards', icon: CreditCard, href: '/cards', description: 'Manage your cards', category: 'financial' },
  { id: 'transactions', label: 'Transactions', icon: Receipt, href: '/transactions', description: 'View transaction history', category: 'financial' },
  { id: 'budget', label: 'Budget Planner', icon: Target, href: '/budget', description: 'Plan your expenses', category: 'financial' },

  // Account Management
  { id: 'profile', label: 'Profile', icon: User, href: '/profile', category: 'account' },
  { id: 'security', label: 'Security', icon: Shield, href: '/security', category: 'account' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications', badge: '3', category: 'account' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', category: 'account' },

  // Support
  { id: 'help', label: 'Help Center', icon: HelpCircle, href: '/help', category: 'support' },
  { id: 'contact', label: 'Contact Us', icon: Phone, href: '/contact', category: 'support' },
];

export function Sidebar({ className, onAddMoney }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false); // Close sidebar on desktop by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  // Add/remove body class for sidebar state
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  // Keyboard shortcut to toggle sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
      // ESC key to close sidebar
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNavigation = (item: MenuItem) => {
    navigation.connect('home', item.id);
    router.push(item.href);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || (href !== '/home' && pathname.startsWith(href));
  };

  const renderMenuSection = (category: string, title: string) => {
    const items = menuItems.filter(item => item.category === category);

    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                isActiveRoute(item.href)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${
                isActiveRoute(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className={`text-xs mt-0.5 truncate ${
                    isActiveRoute(item.href) ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-300'
                  }`}>
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${
                isActiveRoute(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
              }`} />
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Hamburger Menu Button - Dynamic Position */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-4 z-[60] shadow-lg transition-all duration-300 ${
          isOpen
            ? 'top-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
            : 'top-12 bg-blue-600 border border-blue-500 hover:bg-blue-700 text-white'
        }`}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Menu className="h-5 w-5" />
        </motion.div>
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[50] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: isMobile ? -312 : -320 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -312 : -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[312px] md:w-80 bg-gray-900 border-r border-gray-700 z-[55] overflow-y-auto"
          >
            {/* Header */}
            <div className="pt-16 px-6 pb-6 border-b border-gray-700 relative">
              {/* Hamburger Menu Area Indicator */}
              <div className="absolute top-6 left-4 w-10 h-10 border border-gray-600 rounded-lg opacity-30"></div>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">HoardRun</h1>
                  <p className="text-sm text-gray-400">Digital Banking</p>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-gray-400 text-sm truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <div className="px-4 py-4">
              {/* Quick Actions */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      if (onAddMoney) {
                        onAddMoney();
                      } else {
                        // Fallback to navigation if no callback provided
                        handleNavigation({ id: 'add-money', label: 'Add Money', icon: Plus, href: '/home', category: 'financial' });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => handleNavigation({ id: 'transfer', label: 'Transfer', icon: ArrowUpRight, href: '/transfer', category: 'financial' })}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Transfer
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-700 mb-6" />

              {/* Menu Sections */}
              {renderMenuSection('main', 'Main')}
              {renderMenuSection('financial', 'Financial')}
              {renderMenuSection('account', 'Account')}
              {renderMenuSection('support', 'Support')}

              {/* Logout */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-600/20"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
