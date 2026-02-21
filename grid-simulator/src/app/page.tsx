"use client";

import { useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import Dashboard from '@/components/Dashboard';
import BottomControlBox from '@/components/BottomControlBox';
import FilterSearch from '@/components/FilterSearch';
import AIChat from '@/components/AIChat';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/CityMap'), { ssr: false });

export default function Home() {
  const { initGrid, tickSim } = useSimulationStore();

  useEffect(() => {
    initGrid();
    const interval = setInterval(() => {
      tickSim();
    }, 2000);
    return () => clearInterval(interval);
  }, [initGrid, tickSim]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-[#64FFDA]/30">
      {/* 3D City Map - The App (full viewport) */}
      <div className="absolute inset-0 z-0">
        <CityMap />
      </div>

      {/* Overlays - Floating UI on top of the simulation */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">

        {/* Top Area: Dashboard (Left) and Filters (Right) */}
        <div className="flex justify-between items-start w-full">
          <div className="pointer-events-auto">
            {/* Keeping the high-level dashboard metrics on the top left */}
            <Dashboard />
          </div>
          <div className="pointer-events-auto">
            <FilterSearch />
          </div>
        </div>

        {/* Bottom Area: Scrubber (Center) and AI (Right) */}
        <div className="flex justify-between items-end w-full">
          {/* Empty spacer for flex alignment if we want the bottom box centered */}
          <div className="w-[300px]" />

          <div className="pointer-events-auto flex-1 flex justify-center mb-4">
            <BottomControlBox />
          </div>

          <div className="pointer-events-auto mb-4 w-[350px]">
            <AIChat />
          </div>
        </div>

      </div>
    </main>
  );
}
