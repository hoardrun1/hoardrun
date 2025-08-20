'use client';

import { useState, useEffect, useRef } from 'react';
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOutFromFirebase } = useAuth();

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

  // Click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the hamburger button
        const hamburgerButton = document.querySelector('[title="Close sidebar"], [title="Open sidebar"]');
        if (hamburgerButton && hamburgerButton.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
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
      await signOutFromFirebase();
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
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4 px-4 select-none">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-300 group relative overflow-hidden ${
                isActiveRoute(item.href)
                  ? 'text-black bg-white/95 backdrop-blur-sm shadow-lg shadow-black/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.995 }}
            >
              {/* Active indicator line */}
              {isActiveRoute(item.href) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-black"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isActiveRoute(item.href) 
                  ? 'bg-black shadow-lg' 
                  : 'bg-gray-800/50 group-hover:bg-gray-700/70'
              }`}>
                <item.icon className={`h-5 w-5 transition-colors duration-300 ${
                  isActiveRoute(item.href) ? 'text-white' : 'text-gray-300 group-hover:text-white'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm transition-colors duration-300 ${
                    isActiveRoute(item.href) ? 'text-black' : 'group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <Badge 
                      className={`ml-2 text-[10px] font-bold px-2 py-0.5 transition-colors duration-300 ${
                        isActiveRoute(item.href)
                          ? 'bg-black text-white'
                          : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className={`text-xs mt-1 transition-colors duration-300 ${
                    isActiveRoute(item.href) 
                      ? 'text-gray-600' 
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}>
                    {item.description}
                  </p>
                )}
              </div>
              
              <motion.div
                animate={{ 
                  x: isActiveRoute(item.href) ? 0 : -4,
                  opacity: isActiveRoute(item.href) ? 1 : 0.5
                }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className={`h-4 w-4 transition-colors duration-300 ${
                  isActiveRoute(item.href) ? 'text-black' : 'text-gray-500 group-hover:text-gray-300'
                }`} />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Hamburger Menu Button - Ultra Modern */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-5 z-[60] w-11 h-11 rounded-2xl border-2 backdrop-blur-xl transition-all duration-500 shadow-2xl ${
          isOpen
            ? 'top-6 bg-white/95 border-gray-200 hover:bg-white text-black shadow-black/20'
            : 'top-12 bg-black/90 border-gray-800 hover:bg-black text-white shadow-black/40'
        }`}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.320, 1] }}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.div>
      </Button>

      {/* Overlay - Premium blur effect */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Ultra Premium Design */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: isMobile ? -340 : -360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -340 : -360, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.2 }
            }}
            className="fixed left-0 top-0 h-full w-[340px] md:w-[360px] bg-black border-r border-gray-800/50 z-[55] overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #000000 0%, #0f0f0f 100%)'
            }}
          >
            {/* Glass overlay for premium effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            
            {/* Scrollable content */}
            <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {/* Header - Ultra Premium */}
              <div className="pt-20 px-6 pb-8 border-b border-gray-800/30 relative">
                {/* Hamburger Menu Area Indicator - Subtle */}
                <div className="absolute top-6 left-5 w-11 h-11 border border-gray-800/30 rounded-2xl opacity-20"></div>

                {/* Brand Identity */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-white/10">
                      <Wallet className="h-7 w-7 text-black" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl -z-10 blur-lg"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">HoardRun</h1>
                    <p className="text-sm text-gray-400 font-medium">Premium Banking</p>
                  </div>
                </div>

                {/* User Profile - Elegant */}
                <motion.div 
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/[0.08] to-white/[0.04] rounded-2xl border border-white/10 backdrop-blur-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-black font-bold text-lg">
                        {user?.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/10 rounded-2xl -z-10 blur-md"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-gray-400 text-sm truncate font-medium">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Menu Content */}
              <div className="px-2 py-6">
                {/* Quick Actions - Modern Design */}
                <div className="mb-8 px-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-gray-100 font-bold py-3 px-4 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                      onClick={() => {
                        if (onAddMoney) {
                          onAddMoney();
                        } else {
                          handleNavigation({ id: 'add-money', label: 'Add Money', icon: Plus, href: '/home', category: 'financial' });
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Money
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-800/80 text-white hover:bg-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-700 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                      onClick={() => handleNavigation({ id: 'transfer', label: 'Transfer', icon: ArrowUpRight, href: '/transfer', category: 'financial' })}
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Transfer
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-800/50 mx-4 mb-8" />

                {/* Menu Sections */}
                {renderMenuSection('main', 'Dashboard')}
                {renderMenuSection('financial', 'Financial Tools')}
                {renderMenuSection('account', 'Account Management')}
                {renderMenuSection('support', 'Support & Help')}

                {/* Logout - Professional */}
                <div className="mt-8 pt-8 px-4 border-t border-gray-800/30">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10 font-semibold py-3 px-4 rounded-xl transition-all duration-300 group"
                  >
                    <div className="p-2 rounded-xl bg-gray-800/50 group-hover:bg-red-500/20 transition-colors duration-300 mr-3">
                      <LogOut className="h-4 w-4" />
                    </div>
                    Sign Out
                  </Button>
                </div>

                {/* Bottom Spacing */}
                <div className="h-6"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}