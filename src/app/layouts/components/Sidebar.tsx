import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, X, Command } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../../../core/api/services/menu.api';
import { MenuItem } from '../../../domain/models/menu.model';
import { useAuthStore } from '../../../features/auth/store/auth.store';
import { useSiteSettingsStore } from '../../../core/stores/site-settings.store';
import { AppConfig } from '../../../core/config/app.config';

const iconMap: Record<string, string> = {
  dashboard: 'LayoutDashboard',
  users: 'Users',
  roles: 'Shield',
  rolepermissions: 'ShieldCheck',
  'role-permissions': 'ShieldCheck',
  permissions: 'Key',
  'user-roles': 'UserCheck',
  settings: 'Settings',
  reports: 'FileText',
  'chart-bar': 'BarChart3',
  activity: 'Activity',
  home: 'Home',
  products: 'Package',
  orders: 'ShoppingCart',
  analytics: 'TrendingUp',
  notifications: 'Bell',
  calendar: 'Calendar',
  messages: 'MessageSquare',
  profile: 'User',
  preferences: 'Sliders',
  menu: 'Menu',
  'site-settings': 'Palette',
  palette: 'Palette',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { tokenPayload } = useAuthStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { sidebarColors, siteTitle } = useSiteSettingsStore();

  const hasCustomColors = Object.keys(sidebarColors).length > 0;
  const displayTitle = siteTitle || AppConfig.app.name;

  const isSuperAdmin = tokenPayload?.role === 'SuperAdmin' ||
    tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'SuperAdmin';

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu', isSuperAdmin ? 'all' : 'filtered'],
    queryFn: () => isSuperAdmin ? menuApi.getAllMenuItems() : menuApi.getMenuItems(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const getIcon = (iconName?: string | null) => {
    if (!iconName) return null;
    const mapped = iconMap[iconName.toLowerCase()] || iconName;
    const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }> | undefined>)[mapped];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const isActive = item.url === location.pathname;

    if (hasChildren) {
      return (
        <div key={item.id ?? item.url ?? item.title}>
          <button
            onClick={() => toggleExpand(item.title)}
            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              !hasCustomColors
                ? isExpanded
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                : ''
            }`}
            style={{
              paddingLeft: `${1 + depth * 0.75}rem`,
              ...(hasCustomColors
                ? {
                    color: isExpanded ? sidebarColors.activeText : sidebarColors.text,
                    backgroundColor: isExpanded ? sidebarColors.activeBackground : 'transparent',
                  }
                : {}),
            }}
          >
            <div className="flex items-center gap-3">
              {getIcon(item.icon)}
              <span>{item.title}</span>
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!item.url) return null;

    return (
      <Link
        key={item.id ?? item.url ?? item.title}
        to={item.url}
        onClick={onClose}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          !hasCustomColors
            ? isActive
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            : ''
        }`}
        style={{
          paddingLeft: `${1 + depth * 0.75}rem`,
          ...(hasCustomColors
            ? {
                color: isActive ? sidebarColors.activeText : sidebarColors.text,
                backgroundColor: isActive ? sidebarColors.activeBackground : 'transparent',
              }
            : {}),
        }}
      >
        {getIcon(item.icon)}
        <span>{item.title}</span>
      </Link>
    );
  };

  // Filter: only show top-level items that have children or a URL
  // Deduplicate: items appearing inside a parent should not also appear at top level
  const childIds = new Set<number>();
  menuItems.forEach(item => {
    if (item.children) {
      // The per-user menu tree has no ids; only dedupe items that actually have one.
      item.children.forEach(child => { if (child.id != null) childIds.add(child.id); });
    }
  });
  const dedupedItems = menuItems.filter(item =>
    !(item.id != null && childIds.has(item.id)) && ((item.children && item.children.length > 0) || item.url)
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col ${!hasCustomColors ? 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800' : ''}`}
        style={hasCustomColors ? { backgroundColor: sidebarColors.background, borderRight: `1px solid ${sidebarColors.border}` } : undefined}
      >
        <div
          className={`flex items-center justify-between p-4 ${!hasCustomColors ? 'border-b border-gray-200 dark:border-gray-800' : ''}`}
          style={hasCustomColors ? { borderBottom: `1px solid ${sidebarColors.border}` } : undefined}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${!hasCustomColors ? 'bg-blue-600' : ''}`}
              style={hasCustomColors ? { backgroundColor: sidebarColors.logoBackground } : undefined}
            >
              <Command className="w-4 h-4" style={{ color: hasCustomColors ? sidebarColors.activeText : 'white' }} />
            </div>
            <h2
              className={`text-lg font-bold ${!hasCustomColors ? 'text-gray-900 dark:text-white' : ''}`}
              style={hasCustomColors ? { color: sidebarColors.text } : undefined}
            >
              {displayTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`lg:hidden p-1 ${!hasCustomColors ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' : ''}`}
            style={hasCustomColors ? { color: sidebarColors.text } : undefined}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {dedupedItems.map((item) => renderMenuItem(item))}
        </nav>

        <div
          className={`p-3 ${!hasCustomColors ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}
          style={hasCustomColors ? { borderTop: `1px solid ${sidebarColors.border}` } : undefined}
        >
          <div
            className={`flex items-center justify-center gap-2 text-xs ${!hasCustomColors ? 'text-gray-400 dark:text-gray-500' : ''}`}
            style={hasCustomColors ? { color: sidebarColors.text, opacity: 0.6 } : undefined}
          >
            <kbd
              className={`px-1.5 py-0.5 rounded font-medium ${!hasCustomColors ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              style={hasCustomColors ? { backgroundColor: sidebarColors.hoverBackground } : undefined}
            >Ctrl</kbd>
            <span>+</span>
            <kbd
              className={`px-1.5 py-0.5 rounded font-medium ${!hasCustomColors ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              style={hasCustomColors ? { backgroundColor: sidebarColors.hoverBackground } : undefined}
            >K</kbd>
            <span className="ml-1">Quick Search</span>
          </div>
        </div>
      </aside>
    </>
  );
};
