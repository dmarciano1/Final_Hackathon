"use client";

import { useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import AIChat from '@/components/AIChat';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/CityMap'), { ssr: false });

export default function Home() {
  const { initGrid, tickSim } = useSimulationStore();

  useEffect(() => {
    initGrid();

    // Auto-tick simulation every few seconds just in case of unhandled manual events
    const interval = setInterval(() => {
      tickSim();
    }, 2000);
    return () => clearInterval(interval);
  }, [initGrid, tickSim]);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-black text-white selection:bg-cyan-500/30">

      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CityMap />
      </div>

      {/* UI Overlay */}
      <div className="z-10 flex flex-col w-full h-full pointer-events-none">

        {/* Top Dashboard */}
        <div className="pointer-events-auto w-full">
          <Dashboard />
        </div>

        {/* Mid Section */}
        <div className="flex-1 flex justify-between items-stretch overflow-hidden">
          <div className="pointer-events-auto h-full hidden md:block">
            <ControlPanel />
          </div>

          <div className="pointer-events-auto h-full hidden lg:block w-80">
            <AIChat />
          </div>
        </div>
      </div>
    </main>
  );
}
