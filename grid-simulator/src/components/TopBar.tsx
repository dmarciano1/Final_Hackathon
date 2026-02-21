"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useMap } from 'react-map-gl/mapbox';

export default function TopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const { current: map } = useMap();

    // Avoid hydration mismatch
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!geocoderContainerRef.current || !mounted) return;

        const geocoder = new MapboxGeocoder({
            accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN!,
            types: 'address,poi,place',
            placeholder: 'Search address...',
            // @ts-expect-error Mapbox GL types mismatch with geocoder library
            mapboxgl: mapboxgl,
            marker: false,
        });

        geocoder.addTo(geocoderContainerRef.current);

        geocoder.on('result', (e: unknown) => {
            const result = (e as { result: { center: [number, number] } }).result;
            if (map) {
                const center = result.center;
                map.flyTo({
                    center,
                    zoom: 17,
                    pitch: 60,
                    essential: true
                });
            }
        });

        return () => {
            geocoder.onRemove();
        };
    }, [mounted, map]);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-3">
            {/* Geocoder Search Bar */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl flex items-center min-w-[320px]">
                <div className="flex-1 px-2" ref={geocoderContainerRef} id="geocoder-container" />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all group"
            >
                <motion.div
                    animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                    transition={{ type: 'spring', damping: 15 }}
                >
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
                </motion.div>
            </button>

            {/* Settings Gear */}
            <button
                onClick={onOpenSettings}
                className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all group"
            >
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            </button>
        </div>
    );
}
