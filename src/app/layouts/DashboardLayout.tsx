import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from '../../components/CommandPalette/CommandPalette';
import { siteSettingsApi } from '../../core/api/services/site-settings.api';
import { useSiteSettingsStore } from '../../core/stores/site-settings.store';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setSidebarColors, setSettings } = useSiteSettingsStore();

  const { data: allSettings } = useQuery({
    queryKey: ['site-settings-all'],
    queryFn: () => siteSettingsApi.getAll(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: paletteData } = useQuery({
    queryKey: ['sidebar-palette'],
    queryFn: () => siteSettingsApi.getPalette('sidebar'),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (allSettings && allSettings.length > 0) {
      setSettings(allSettings);
    }
  }, [allSettings, setSettings]);

  useEffect(() => {
    if (!paletteData) return;
    if (paletteData.colors && Object.keys(paletteData.colors).length > 0) {
      setSidebarColors(paletteData.colors);
    } else if (paletteData.background) {
      const { id, key, colors, ...colorValues } = paletteData;
      if (Object.keys(colorValues).length > 0) {
        setSidebarColors(colorValues as Record<string, string>);
      }
    }
  }, [paletteData, setSidebarColors]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CommandPalette />
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
