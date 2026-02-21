"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronDown, ChevronRight, Settings,
    Search, Info, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useSimulationStore } from '../store/useSimulationStore';
import { AVAILABLE_FILTERS } from '../store/availableFilters';
import { THEME_COLORS, FilterTheme, GridFilter } from '../store/types';

export default function SettingsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { activeFilters, addFilterById, removeFilterById, updateFilterValue } = useSimulationStore();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Demand']));
    const [searchQuery, setSearchQuery] = useState('');

    const themes: FilterTheme[] = [
        'Demand', 'Generation', 'Storage', 'Grid Assets', 'DER & EV',
        'Reliability', 'Policy', 'Markets', 'Environment', 'Telemetry',
        'Construction', 'Cyber'
    ];

    const toggleGroup = (theme: string) => {
        const newGroups = new Set(expandedGroups);
        if (newGroups.has(theme)) newGroups.delete(theme);
        else newGroups.add(theme);
        setExpandedGroups(newGroups);
    };

    const filteredItems = AVAILABLE_FILTERS.filter(f =>
        f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.theme.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-96 bg-black/40 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Settings className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-white/90">System Controls</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-6 py-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search parameters..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                        </div>
                    </div>

                    {/* Groups Scroll Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                        {themes.map(theme => {
                            const items = filteredItems.filter(i => i.theme === theme);
                            if (items.length === 0) return null;

                            const isExpanded = expandedGroups.has(theme);
                            const activeCount = items.filter(i => activeFilters.some(af => af.id === i.id)).length;

                            return (
                                <div key={theme} className="space-y-2">
                                    <button
                                        onClick={() => toggleGroup(theme)}
                                        className="w-full flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: THEME_COLORS[theme] }} />
                                            <span className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white/70 transition-colors">{theme}</span>
                                            {activeCount > 0 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60 font-mono">
                                                    {activeCount}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/20" /> : <ChevronRight className="w-4 h-4 text-white/20" />}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="space-y-3 overflow-hidden"
                                            >
                                                {items.map(filter => (
                                                    <FilterControl
                                                        key={filter.id}
                                                        filter={filter}
                                                        activeFilter={activeFilters.find(af => af.id === filter.id)}
                                                        onAdd={() => addFilterById(filter.id)}
                                                        onRemove={() => removeFilterById(filter.id)}
                                                        onUpdate={(val) => updateFilterValue(filter.id, val)}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function FilterControl({
    filter,
    activeFilter,
    onAdd,
    onRemove,
    onUpdate
}: {
    filter: GridFilter,
    activeFilter?: GridFilter,
    onAdd: () => void,
    onRemove: () => void,
    onUpdate: (val: string | number | boolean) => void
}) {
    const isEnabled = !!activeFilter;
    const val = isEnabled ? activeFilter.value : filter.value;

    return (
        <div className={`p-3 rounded-xl border transition-all ${isEnabled ? 'bg-white/[0.04] border-white/10' : 'bg-transparent border-transparent opacity-60'}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => isEnabled ? onRemove() : onAdd()}
                        className={`transition-colors ${isEnabled ? 'text-blue-400' : 'text-white/20 hover:text-white/40'}`}
                    >
                        {isEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <span className="text-sm font-medium text-white/80">{filter.label}</span>
                    {filter.tooltip && (
                        <div className="group relative">
                            <Info className="w-3 h-3 text-white/20 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg text-[10px] text-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {filter.tooltip}
                            </div>
                        </div>
                    )}
                </div>
                <span className="text-xs font-mono text-blue-400/80">
                    {val}{filter.unit}
                </span>
            </div>

            {isEnabled && (
                <div className="px-1">
                    {filter.type === 'slider' && (
                        <input
                            type="range"
                            min={filter.min}
                            max={filter.max}
                            step={filter.step ?? (filter.max! - filter.min!) / 100}
                            value={val as number}
                            onChange={(e) => onUpdate(parseFloat(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    )}
                    {filter.type === 'number' && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => onUpdate((val as number) - 1)} className="p-1 hover:bg-white/10 rounded">-</button>
                            <input
                                type="number"
                                value={val as number}
                                onChange={(e) => onUpdate(parseFloat(e.target.value))}
                                className="bg-transparent border-b border-white/10 text-center w-full text-sm"
                            />
                            <button onClick={() => onUpdate((val as number) + 1)} className="p-1 hover:bg-white/10 rounded">+</button>
                        </div>
                    )}
                    {filter.type === 'dropdown' && (
                        <select
                            value={val as string}
                            onChange={(e) => onUpdate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-1.5 text-xs text-white/70"
                        >
                            {filter.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}
                    {filter.type === 'toggle' && (
                        <div className="flex items-center justify-end">
                            <button
                                onClick={() => onUpdate(!(val as boolean))}
                                className={`w-10 h-5 rounded-full transition-colors relative ${(val as boolean) ? 'bg-blue-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${(val as boolean) ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
