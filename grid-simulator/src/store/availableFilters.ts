import { GridFilter } from './types';

export const AVAILABLE_FILTERS: GridFilter[] = [
    // --- SECTION 4: DATA CENTER LOAD ---
    { id: 'dc_load', label: 'Data center load', theme: 'Demand', type: 'number', value: 250, min: 1, max: 500, unit: 'MW', tooltip: 'Direct power draw from primary data center nodes.' },
    { id: 'dc_ramp', label: 'Data center ramp rate', theme: 'Demand', type: 'slider', value: 10, min: 0, max: 50, unit: 'MW/min' },
    { id: 'dc_shape', label: 'Data center load shape', theme: 'Demand', type: 'dropdown', value: 'flat', options: ['flat', 'diurnal', 'bursty', 'batch-jobs'] },
    { id: 'dc_par', label: 'Peak-to-average ratio', theme: 'Demand', type: 'slider', value: 1.2, min: 1.0, max: 4.0 },
    { id: 'dc_pf', label: 'Power factor', theme: 'Demand', type: 'slider', value: 0.95, min: 0.85, max: 1.00 },
    { id: 'dc_reactive', label: 'Reactive power demand', theme: 'Demand', type: 'number', value: 50, min: 0, max: 200, unit: 'MVAr' },
    { id: 'dc_thd', label: 'Harmonics distortion', theme: 'Demand', type: 'slider', value: 2, min: 0, max: 15, unit: '%' },
    { id: 'dc_cooling', label: 'Cooling mode', theme: 'Demand', type: 'dropdown', value: 'air', options: ['air', 'chilled-water', 'liquid', 'hybrid'] },

    // ENVIRONMENT (A)
    { id: 'env_cooling_sens', label: 'Cooling COP sensitivity', theme: 'Environment', type: 'dropdown', value: 'med', options: ['low', 'med', 'high'], tooltip: 'How much cooling efficiency drops as ambient temp rises.' },

    // STORAGE (A)
    { id: 'dc_ups_cap', label: 'Onsite UPS capacity', theme: 'Storage', type: 'number', value: 100, min: 0, max: 200, unit: 'MW' },
    { id: 'dc_batt_energy', label: 'Onsite battery energy', theme: 'Storage', type: 'number', value: 400, min: 0, max: 800, unit: 'MWh' },
    { id: 'dc_batt_duration', label: 'Battery discharge duration', theme: 'Storage', type: 'slider', value: 4, min: 0.25, max: 8, unit: 'hrs' },
    { id: 'dc_batt_resp', label: 'Battery response time', theme: 'Storage', type: 'slider', value: 100, min: 10, max: 1000, unit: 'ms' },

    // GENERATION (A)
    { id: 'dc_gen_backup', label: 'Onsite generator backup', theme: 'Generation', type: 'number', value: 150, min: 0, max: 300, unit: 'MW' },
    { id: 'dc_backup_runtime', label: 'Backup runtime', theme: 'Generation', type: 'slider', value: 24, min: 0, max: 72, unit: 'hrs' },

    // POLICY (A)
    { id: 'dc_fuel_type', label: 'Backup fuel type', theme: 'Policy', type: 'dropdown', value: 'diesel', options: ['diesel', 'gas', 'HVO', 'none'] },
    { id: 'dc_queue_delay', label: 'Interconnect queue delay', theme: 'Policy', type: 'slider', value: 12, min: 0, max: 48, unit: 'months' },
    { id: 'dc_curtail_limit', label: 'Allowed curtailment', theme: 'Policy', type: 'slider', value: 5, min: 0, max: 20, unit: '%' },
    { id: 'dc_rel_tier', label: 'Preferred reliability tier', theme: 'Policy', type: 'dropdown', value: 'N+1', options: ['basic', 'N+1', 'N+2'] },
    { id: 'dc_heat_reuse', label: 'Heat reuse district connection', theme: 'Policy', type: 'toggle', value: false },
    { id: 'dc_noise_comp', label: 'Noise / setback compliance', theme: 'Policy', type: 'dropdown', value: 'standard', options: ['strict', 'standard', 'relaxed'] },

    // GRID ASSETS (A)
    { id: 'dc_volt_level', label: 'Interconnection voltage', theme: 'Grid Assets', type: 'dropdown', value: 'MV', options: ['LV', 'MV', 'HV'] },
    { id: 'dc_interconnect_pt', label: 'Interconnect point', theme: 'Grid Assets', type: 'dropdown', value: 'Sub A', options: ['Sub A', 'Sub B', 'Sub C', 'Feeder X', 'Feeder Y', 'Feeder Z'] },

    // MARKETS (A)
    { id: 'dc_budget_cap', label: 'Interconnect budget cap', theme: 'Markets', type: 'number', value: 50, min: 0, max: 500, unit: '$M' },
    { id: 'dc_curtail_penalty', label: 'Curtailment penalty', theme: 'Markets', type: 'slider', value: 500, min: 0, max: 5000, unit: '$/MWh' },

    // --- SECTION 5: CITY DEMAND & LAND USE ---
    { id: 'city_growth', label: 'Population growth rate', theme: 'Demand', type: 'slider', value: 1.5, min: -1, max: 6, unit: '%/yr' },
    { id: 'res_electrif', label: 'Res. electrification', theme: 'Demand', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
    { id: 'comm_electrif', label: 'Comm. electrification', theme: 'Demand', type: 'slider', value: 15, min: 0, max: 100, unit: '%' },
    { id: 'ind_load_growth', label: 'Industrial load growth', theme: 'Demand', type: 'slider', value: 2, min: -2, max: 8, unit: '%/yr' },
    { id: 'build_code', label: 'Building code efficiency', theme: 'Demand', type: 'dropdown', value: 'improved', options: ['baseline', 'improved', 'aggressive'] },
    { id: 'hp_pen', label: 'Heat pump penetration', theme: 'Demand', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
    { id: 'elec_cook', label: 'Electric cooking adoption', theme: 'Demand', type: 'slider', value: 30, min: 0, max: 100, unit: '%' },
    { id: 'transit_electrif', label: 'Transit electrification', theme: 'Demand', type: 'slider', value: 5, min: 0, max: 100, unit: '%' },
    { id: 'sl_conv', label: 'Street lighting conversion', theme: 'Demand', type: 'slider', value: 40, min: 0, max: 100, unit: '%' },
    { id: 'new_housing', label: 'New housing units / year', theme: 'Demand', type: 'number', value: 5000, min: 0, max: 50000 },
    { id: 'zoning_dens', label: 'Zoning density multiplier', theme: 'Demand', type: 'slider', value: 1.0, min: 0.5, max: 3.0 },
    { id: 'mixed_use', label: 'Mixed-use share', theme: 'Demand', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
    { id: 'office_occ', label: 'Downtown office occupancy', theme: 'Demand', type: 'slider', value: 60, min: 0, max: 100, unit: '%' },
    { id: 'school_load', label: 'School campus load', theme: 'Demand', type: 'number', value: 25, min: 0, max: 200, unit: 'MW' },
    { id: 'hospital_load', label: 'Hospital load', theme: 'Demand', type: 'number', value: 40, min: 0, max: 300, unit: 'MW' },
    { id: 'crit_load_share', label: 'Critical load share', theme: 'Demand', type: 'slider', value: 15, min: 0, max: 40, unit: '%' },
    { id: 'peak_shape', label: 'Seasonal peak shape', theme: 'Demand', type: 'dropdown', value: 'summer', options: ['summer', 'winter', 'dual'] },
    { id: 'volatility_idx', label: 'Demand volatility index', theme: 'Demand', type: 'slider', value: 0.3, min: 0, max: 1 },

    // --- SECTION 6: DISTRIBUTION GRID ASSETS ---
    { id: 'sub_cap', label: 'Substation capacity', theme: 'Grid Assets', type: 'slider', value: 100, min: 50, max: 200, unit: '%' },
    { id: 'trans_limits', label: 'Transformer limits', theme: 'Grid Assets', type: 'slider', value: 100, min: 80, max: 120, unit: '%' },
    { id: 'feed_topo', label: 'Feeder topology', theme: 'Grid Assets', type: 'dropdown', value: 'Radial', options: ['Radial', 'Loop', 'Network'] },
    { id: 'prot_margins', label: 'Protection margins', theme: 'Grid Assets', type: 'slider', value: 20, min: 5, max: 50, unit: '%' },
    { id: 'saidi_saifi', label: 'Reliability (SAIDI/SAIFI)', theme: 'Grid Assets', type: 'slider', value: 0.95, min: 0.5, max: 1.0 },
    { id: 'undergrounding', label: 'Undergrounding share', theme: 'Grid Assets', type: 'slider', value: 30, min: 0, max: 100, unit: '%' },
    { id: 'spare_trans', label: 'Spare transformer availability', theme: 'Grid Assets', type: 'toggle', value: true },
    { id: 'recon_time', label: 'Reconfiguration times', theme: 'Grid Assets', type: 'slider', value: 60, min: 1, max: 360, unit: 'min' },
    { id: 'interties', label: 'Distribution interties', theme: 'Grid Assets', type: 'toggle', value: true },

    // --- SECTION 7: TRANSMISSION / BULK SYSTEM ---
    { id: 'import_lim', label: 'Import limits', theme: 'Grid Assets', type: 'number', value: 5000, min: 0, max: 10000, unit: 'MW' },
    { id: 'cong_sens', label: 'Congestion sensitivity', theme: 'Grid Assets', type: 'slider', value: 5, min: 0, max: 10 },
    { id: 'res_margin', label: 'Reserve margin', theme: 'Reliability', type: 'slider', value: 15, min: 0, max: 40, unit: '%' },
    { id: 'inertia', label: 'System inertia', theme: 'Reliability', type: 'slider', value: 4.5, min: 2.0, max: 8.0, unit: 's' },
    { id: 'iso_dispatch', label: 'ISO dispatch interval', theme: 'Markets', type: 'dropdown', value: '5 min', options: ['5 min', '15 min', 'hour'] },
    { id: 'import_vol', label: 'Import price volatility', theme: 'Markets', type: 'slider', value: 0.4, min: 0, max: 1 },

    // --- SECTION 8: GENERATION MIX ---
    { id: 'gen_gas', label: 'Gas generation share', theme: 'Generation', type: 'slider', value: 40, min: 0, max: 100, unit: '%' },
    { id: 'gen_coal', label: 'Coal generation share', theme: 'Generation', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
    { id: 'gen_nuc', label: 'Nuclear generation share', theme: 'Generation', type: 'slider', value: 20, min: 0, max: 100, unit: '%' },
    { id: 'gen_hydro', label: 'Hydro generation share', theme: 'Generation', type: 'slider', value: 10, min: 0, max: 100, unit: '%' },
    { id: 'gen_wind', label: 'Wind (Utility)', theme: 'Generation', type: 'slider', value: 15, min: 0, max: 100, unit: '%' },
    { id: 'gen_solar_util', label: 'Solar (Utility)', theme: 'Generation', type: 'slider', value: 5, min: 0, max: 100, unit: '%' },
    { id: 'gen_chp', label: 'CHP penetration', theme: 'Generation', type: 'slider', value: 2, min: 0, max: 10, unit: '%' },
    { id: 'gen_blackstart', label: 'Black-start resources', theme: 'Generation', type: 'toggle', value: true },

    // --- SECTION 9: STORAGE & DR ---
    { id: 'grid_batt', label: 'Grid battery capacity', theme: 'Storage', type: 'number', value: 200, min: 0, max: 1000, unit: 'MW' },
    { id: 'dr_enroll', label: 'DR enrollment rate', theme: 'Storage', type: 'slider', value: 8, min: 0, max: 30, unit: '%' },
    { id: 'shed_stages', label: 'Load shedding stages', theme: 'Reliability', type: 'number', value: 3, min: 1, max: 5 },
    { id: 'vpp_part', label: 'VPP participation', theme: 'DER & EV', type: 'slider', value: 4, min: 0, max: 20, unit: '%' },
    { id: 'managed_charge', label: 'Managed charging share', theme: 'DER & EV', type: 'slider', value: 15, min: 0, max: 100, unit: '%' },
    { id: 'elasticity', label: 'Price elasticity', theme: 'Markets', type: 'slider', value: -0.1, min: -0.5, max: 0 },

    // --- SECTION 10: DER, EV, MICROGRIDS ---
    { id: 'roof_solar', label: 'Rooftop solar', theme: 'DER & EV', type: 'slider', value: 12, min: 0, max: 50, unit: '%' },
    { id: 'btm_batt', label: 'BTM batteries', theme: 'DER & EV', type: 'slider', value: 5, min: 0, max: 25, unit: '%' },
    { id: 'ev_fast', label: 'EV Fast Chargers', theme: 'DER & EV', type: 'number', value: 120, min: 0, max: 1000 },
    { id: 'ev_slow', label: 'EV Level 2 Chargers', theme: 'DER & EV', type: 'number', value: 4500, min: 0, max: 50000 },
    { id: 'microgrids', label: 'Microgrid count', theme: 'Reliability', type: 'number', value: 2, min: 0, max: 10 },
    { id: 'backfeed_lim', label: 'Backfeed limits', theme: 'Grid Assets', type: 'slider', value: 60, min: 0, max: 100, unit: '%' },
    { id: 'smart_inv', label: 'Smart inverter mode', theme: 'DER & EV', type: 'dropdown', value: 'Volt-Watt', options: ['None', 'Volt-Watt', 'Volt-Var'] },

    // --- SECTION 11: WEATHER ---
    { id: 'wx_temp', label: 'Ambient Temperature', theme: 'Environment', type: 'slider', value: 72, min: -20, max: 120, unit: '°F' },
    { id: 'wx_wind', label: 'Wind Speed', theme: 'Environment', type: 'slider', value: 5, min: 0, max: 100, unit: 'mph' },
    { id: 'wx_ice', label: 'Ice Accumulation', theme: 'Environment', type: 'slider', value: 0, min: 0, max: 2, unit: 'in' },
    { id: 'wx_restore', label: 'Restoration speed mult.', theme: 'Construction', type: 'slider', value: 1.0, min: 0.1, max: 2.0 },

    // --- SECTION 12: RELIABILITY ---
    { id: 'n1_enforce', label: 'N-1 enforcement', theme: 'Reliability', type: 'toggle', value: true },
    { id: 'fail_prob', label: 'Asset failure prob.', theme: 'Reliability', type: 'slider', value: 0.01, min: 0, max: 0.1 },
    { id: 'ride_through', label: 'Fault ride-through', theme: 'Reliability', type: 'toggle', value: true },
    { id: 'psps_active', label: 'PSPS active', theme: 'Reliability', type: 'toggle', value: false },

    // --- SECTION 13: CONSTRUCTION ---
    { id: 'lead_time', label: 'Equipment lead time', theme: 'Construction', type: 'slider', value: 12, min: 6, max: 36, unit: 'mo' },
    { id: 'permitting', label: 'Permitting friction', theme: 'Policy', type: 'slider', value: 5, min: 1, max: 10 },
    { id: 'community', label: 'Community opposition', theme: 'Policy', type: 'slider', value: 3, min: 1, max: 10 },

    // --- SECTION 14: MARKETS ---
    { id: 'retail_rate', label: 'Avg retail rate', theme: 'Markets', type: 'number', value: 0.14, unit: '$/kWh' },
    { id: 'tou_active', label: 'Time-of-use pricing', theme: 'Markets', type: 'toggle', value: true },
    { id: 'scarcity', label: 'Scarcity pricing mult.', theme: 'Markets', type: 'slider', value: 1.0, min: 1.0, max: 10.0 },

    // --- SECTION 15: TELEMETRY & AI ---
    { id: 'ai_aggro', label: 'AI Aggressiveness', theme: 'Telemetry', type: 'slider', value: 0.5, min: 0, max: 1 },
    { id: 'ai_risk', label: 'Risk tolerance', theme: 'Telemetry', type: 'slider', value: 0.3, min: 0, max: 1 },
    { id: 'ai_latency', label: 'Decision latency', theme: 'Telemetry', type: 'slider', value: 500, min: 10, max: 5000, unit: 'ms' },
    { id: 'ai_verbosity', label: 'Verbosity', theme: 'Telemetry', type: 'dropdown', value: 'Technical', options: ['Minimal', 'Standard', 'Technical'] },

    // --- SECTION 16: CYBER ---
    { id: 'comms_loss', label: 'Comms loss probability', theme: 'Cyber', type: 'slider', value: 0.001, min: 0, max: 0.05 },
    { id: 'cyber_shed', label: 'Cyber-triggered shed', theme: 'Cyber', type: 'toggle', value: false },
    { id: 'patch_cadence', label: 'Patch cadence', theme: 'Cyber', type: 'dropdown', value: 'Monthly', options: ['Weekly', 'Monthly', 'Quarterly'] },
];
