"use client";

import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import Dashboard from '@/components/Dashboard';
import BottomControlBox from '@/components/BottomControlBox';
import TopBar from '@/components/TopBar';
import SettingsPanel from '@/components/SettingsPanel';
import AIChat from '@/components/AIChat';
import InfrastructurePalette from '@/components/InfrastructurePalette';
import dynamic from 'next/dynamic';
import { MapProvider } from 'react-map-gl/mapbox';

const CityMap = dynamic(() => import('@/components/CityMap'), { ssr: false });

export default function Home() {
  const { initGrid, tickSim } = useSimulationStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    initGrid();
    const interval = setInterval(() => {
      tickSim();
    }, 2000);
    return () => clearInterval(interval);
  }, [initGrid, tickSim]);

  return (
    <MapProvider>
      <main className="relative h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
        {/* 3D City Map - The App (full viewport) */}
        <div className="absolute inset-0 z-0">
          <CityMap />
        </div>

        {/* Overlays - Floating UI on top of the simulation */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">

          {/* Top Area: Dashboard (Left) and TopBar (Right) */}
          <div className="flex justify-between items-start w-full">
            <div className="pointer-events-auto">
              <Dashboard />
            </div>
            <div className="pointer-events-auto">
              <TopBar onOpenSettings={() => setIsSettingsOpen(true)} />
            </div>
          </div>

          {/* Middle: Infrastructure Palette (Left) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
            <InfrastructurePalette />
          </div>

          {/* Bottom Area: Scrubber (Center) and AI (Right) */}
          <div className="flex justify-between items-end w-full">
            <div className="w-[300px]" />

            <div className="pointer-events-auto flex-1 flex justify-center mb-4">
              <BottomControlBox />
            </div>

            <div className="pointer-events-auto mb-4 w-[350px]">
              <AIChat />
            </div>
          </div>
        </div>

        {/* Settings Fly-out */}
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </main>
    </MapProvider>
  );
}
