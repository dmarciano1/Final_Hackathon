import { StateCreator } from 'zustand';
import { SimulationStore } from '../useSimulationStore';
import { GridFilter } from '../types';
import { AVAILABLE_FILTERS } from '../availableFilters';

export interface FilterState {
    activeFilters: GridFilter[];
}

export interface FilterActions {
    addFilterById: (id: string) => void;
    removeFilterById: (id: string) => void;
    updateFilterValue: (id: string, value: string | number | boolean) => void;
    toggleFilter: (id: string) => void;
}

export type FilterSlice = FilterState & FilterActions;

export const createFilterSlice: StateCreator<SimulationStore, [], [], FilterSlice> = (set, get) => ({
    activeFilters: [],

    addFilterById: (id: string) => {
        const filter = AVAILABLE_FILTERS.find(f => f.id === id);
        if (filter && !get().activeFilters.find(f => f.id === id)) {
            set((state) => ({ activeFilters: [...state.activeFilters, filter] }));
            get().tickSim();
        }
    },

    removeFilterById: (id: string) => {
        set((state) => ({ activeFilters: state.activeFilters.filter(f => f.id !== id) }));
        get().tickSim();
    },

    updateFilterValue: (id: string, value: string | number | boolean) => {
        set((state) => ({
            activeFilters: state.activeFilters.map(f => f.id === id ? { ...f, value } : f)
        }));
        get().tickSim();
    },

    toggleFilter: (id: string) => {
        console.log('Toggling filter', id);
    },
});
