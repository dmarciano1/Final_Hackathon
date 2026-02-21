import jsPDF from 'jspdf';
import type { DispatchSnapshot } from '@/store/useSimulationStore';
import type { GridNode } from '@/store/types';
import { INFRASTRUCTURE_BLUEPRINTS } from '@/store/types';

function formatTime(hour: number) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, fill: string) {
  doc.setFillColor(fill);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function drawBar(doc: jsPDF, x: number, y: number, w: number, h: number, fill: string) {
  doc.setFillColor(fill);
  doc.rect(x, y, w, h, 'F');
}

const COLORS = {
  dark: '#0f172a',
  card: '#1e293b',
  cardLight: '#f1f5f9',
  accent: '#06b6d4',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
  orange: '#f97316',
  blue: '#3b82f6',
  purple: '#a855f7',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
  bgPage: '#f8fafc',
};

const GEN_COLORS: Record<string, string> = {
  Gas: '#f97316',
  Nuclear: '#06b6d4',
  Hydro: '#38bdf8',
  Wind: '#60a5fa',
  Solar: '#fbbf24',
  Battery: '#10b981',
  Microgrid: '#34d399',
};

export function generateSimulationReport(
  nodes: Record<string, GridNode>,
  dispatchLog: DispatchSnapshot[],
  latestDispatch: DispatchSnapshot | null,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210;
  const margin = 16;
  const cw = pw - margin * 2;
  let y = 0;

  // ─── Page 1: Cover + Executive Summary ─────────────────────────────

  // Header band
  doc.setFillColor('#0f172a');
  doc.rect(0, 0, pw, 52, 'F');

  // Accent stripe
  doc.setFillColor(COLORS.accent);
  doc.rect(0, 52, pw, 2, 'F');

  // Title
  doc.setTextColor(COLORS.white);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Grid Simulation Report', margin, 28);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#94a3b8');
  const today = new Date();
  doc.text(`Generated ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 38);

  const nodeCount = Object.keys(nodes).length;
  const snapCount = dispatchLog.length;
  doc.text(`${nodeCount} infrastructure assets  \u2022  ${snapCount} simulation snapshots`, margin, 46);

  y = 62;

  // Executive Summary Box
  drawRoundedRect(doc, margin, y, cw, 38, 3, COLORS.cardLight);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.accent);
  doc.text('EXECUTIVE SUMMARY', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textPrimary);

  const latest = latestDispatch;
  if (latest) {
    const summaryLines = [
      `This report summarizes a 24-hour grid simulation across ${nodeCount} infrastructure assets.`,
      `Peak generation reached ${latest.totalCapacity} MW with demand at ${latest.totalDemand} MW, yielding`,
      `${latest.netHeadroom > 0 ? 'a surplus' : 'a deficit'} of ${Math.abs(latest.netHeadroom)} MW. Grid stability held at ${latest.gridStability}%.`,
    ];
    summaryLines.forEach((line, i) => {
      doc.text(line, margin + 6, y + 16 + i * 5);
    });
  }

  y += 46;

  // ─── Key Metrics Cards ─────────────────────────────────────────────

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.textPrimary);
  doc.text('Key Performance Indicators', margin, y);
  y += 6;

  if (latest) {
    const metrics = [
      { label: 'Total Generation', value: `${latest.totalCapacity} MW`, color: COLORS.green },
      { label: 'Total Demand', value: `${latest.totalDemand} MW`, color: COLORS.yellow },
      { label: 'Net Headroom', value: `${latest.netHeadroom > 0 ? '+' : ''}${latest.netHeadroom} MW`, color: latest.netHeadroom >= 0 ? COLORS.green : COLORS.red },
      { label: 'Grid Stability', value: `${latest.gridStability}%`, color: latest.gridStability >= 80 ? COLORS.green : COLORS.yellow },
      { label: 'Grid Frequency', value: `${latest.frequency.toFixed(2)} Hz`, color: Math.abs(latest.frequency - 60) < 0.1 ? COLORS.green : COLORS.yellow },
      { label: 'Carbon Intensity', value: `${latest.carbonIntensity} g/kWh`, color: COLORS.orange },
    ];

    const cardW = (cw - 8) / 3;
    const cardH = 22;

    metrics.forEach((m, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = margin + col * (cardW + 4);
      const cy = y + row * (cardH + 4);

      drawRoundedRect(doc, cx, cy, cardW, cardH, 2, COLORS.white);
      doc.setDrawColor(COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, cardW, cardH, 2, 2, 'S');

      // Color accent bar on left
      doc.setFillColor(m.color);
      doc.rect(cx, cy + 2, 1.5, cardH - 4, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textSecondary);
      doc.text(m.label, cx + 6, cy + 8);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.textPrimary);
      doc.text(m.value, cx + 6, cy + 17);
    });

    y += (cardH + 4) * 2 + 8;
  }

  // ─── Generation Mix ────────────────────────────────────────────────

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.textPrimary);
  doc.text('Generation Mix', margin, y);
  y += 6;

  if (latest) {
    const genEntries = Object.entries(latest.generationMix).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
    const totalGen = genEntries.reduce((sum, [, v]) => sum + v, 0);

    drawRoundedRect(doc, margin, y, cw, 6, 1.5, '#e2e8f0');

    let barX = margin;
    genEntries.forEach(([source, value]) => {
      const barW = (value / totalGen) * cw;
      drawBar(doc, barX, y, barW, 6, GEN_COLORS[source] || '#6b7280');
      barX += barW;
    });

    y += 10;

    genEntries.forEach(([source, value], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const lx = margin + col * 60;
      const ly = y + row * 7;

      doc.setFillColor(GEN_COLORS[source] || '#6b7280');
      doc.circle(lx + 2, ly - 1.5, 1.5, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textPrimary);
      doc.text(`${source}`, lx + 6, ly);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.textSecondary);
      doc.text(`${value} MW (${Math.round((value / totalGen) * 100)}%)`, lx + 6 + doc.getTextWidth(source) + 2, ly);
    });

    y += Math.ceil(genEntries.length / 3) * 7 + 6;
  }

  // ─── Demand Breakdown ──────────────────────────────────────────────

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.textPrimary);
  doc.text('Demand Breakdown', margin, y);
  y += 6;

  if (latest) {
    const demandEntries = Object.entries(latest.demandBreakdown).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
    const totalDemand = demandEntries.reduce((sum, [, v]) => sum + v, 0);

    const barMaxW = cw - 50;

    demandEntries.forEach(([source, value]) => {
      const barW = totalDemand > 0 ? (value / totalDemand) * barMaxW : 0;
      const pct = totalDemand > 0 ? Math.round((value / totalDemand) * 100) : 0;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textSecondary);
      doc.text(source, margin, y + 3);

      drawRoundedRect(doc, margin + 40, y, barW, 4, 1, COLORS.accent);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.textPrimary);
      doc.text(`${value} MW (${pct}%)`, margin + 42 + barW, y + 3);

      y += 7;
    });

    y += 4;
  }

  // ─── Infrastructure Inventory ──────────────────────────────────────

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.textPrimary);
  doc.text('Infrastructure Inventory', margin, y);
  y += 6;

  const nodesByType: Record<string, GridNode[]> = {};
  Object.values(nodes).forEach(node => {
    if (!nodesByType[node.type]) nodesByType[node.type] = [];
    nodesByType[node.type].push(node);
  });

  // Table header
  drawRoundedRect(doc, margin, y, cw, 7, 1, '#0f172a');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.white);
  doc.text('Asset Type', margin + 3, y + 5);
  doc.text('Count', margin + 55, y + 5);
  doc.text('Total Capacity', margin + 75, y + 5);
  doc.text('Current Load', margin + 110, y + 5);
  doc.text('Status', margin + 145, y + 5);
  y += 8;

  Object.entries(nodesByType).forEach(([type, typeNodes], i) => {
    const bp = INFRASTRUCTURE_BLUEPRINTS.find(b => b.type === type);
    const totalCap = typeNodes.reduce((s, n) => s + n.capacity, 0);
    const totalLoad = typeNodes.reduce((s, n) => s + n.currentLoad, 0);
    const totalGen = typeNodes.reduce((s, n) => s + n.generation, 0);
    const offlineCount = typeNodes.filter(n => n.status === 'offline').length;
    const warnCount = typeNodes.filter(n => n.status === 'warning' || n.status === 'critical').length;

    const bgColor = i % 2 === 0 ? COLORS.white : '#f8fafc';
    drawRoundedRect(doc, margin, y, cw, 7, 0.5, bgColor);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textPrimary);
    doc.text(`${bp?.icon || ''} ${bp?.label || type}`, margin + 3, y + 5);

    doc.setTextColor(COLORS.textSecondary);
    doc.text(`${typeNodes.length}`, margin + 55, y + 5);
    doc.text(`${Math.round(totalCap)} MW`, margin + 75, y + 5);
    doc.text(`${Math.round(totalLoad || totalGen)} MW`, margin + 110, y + 5);

    const statusText = offlineCount > 0 ? `${offlineCount} offline` : warnCount > 0 ? `${warnCount} warning` : 'All normal';
    const statusColor = offlineCount > 0 ? COLORS.red : warnCount > 0 ? COLORS.yellow : COLORS.green;
    doc.setTextColor(statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(statusText, margin + 145, y + 5);

    y += 8;
  });

  y += 6;

  // ─── Simulation Timeline ───────────────────────────────────────────

  if (dispatchLog.length > 2) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.textPrimary);
    doc.text('Simulation Timeline', margin, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textSecondary);
    doc.text('Generation (green) and Demand (cyan) over the simulated period', margin, y + 4);
    y += 10;

    const chartW = cw;
    const chartH = 50;

    drawRoundedRect(doc, margin, y, chartW, chartH, 2, COLORS.white);
    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, y, chartW, chartH, 2, 2, 'S');

    const maxVal = Math.max(
      ...dispatchLog.map(s => Math.max(s.totalCapacity, s.totalDemand)),
      1
    );

    // Grid lines
    doc.setDrawColor('#e2e8f0');
    doc.setLineWidth(0.1);
    for (let i = 1; i < 4; i++) {
      const gy = y + chartH - (i / 4) * chartH;
      doc.line(margin + 1, gy, margin + chartW - 1, gy);
      doc.setFontSize(6);
      doc.setTextColor(COLORS.textMuted);
      doc.text(`${Math.round((i / 4) * maxVal)}`, margin + 2, gy - 1);
    }

    // Generation line
    doc.setDrawColor(COLORS.green);
    doc.setLineWidth(0.5);
    dispatchLog.forEach((snap, i) => {
      if (i === 0) return;
      const prev = dispatchLog[i - 1];
      const x1 = margin + ((i - 1) / (dispatchLog.length - 1)) * chartW;
      const x2 = margin + (i / (dispatchLog.length - 1)) * chartW;
      const y1 = y + chartH - (prev.totalCapacity / maxVal) * chartH;
      const y2 = y + chartH - (snap.totalCapacity / maxVal) * chartH;
      doc.line(x1, y1, x2, y2);
    });

    // Demand line
    doc.setDrawColor(COLORS.accent);
    doc.setLineWidth(0.5);
    dispatchLog.forEach((snap, i) => {
      if (i === 0) return;
      const prev = dispatchLog[i - 1];
      const x1 = margin + ((i - 1) / (dispatchLog.length - 1)) * chartW;
      const x2 = margin + (i / (dispatchLog.length - 1)) * chartW;
      const y1 = y + chartH - (prev.totalDemand / maxVal) * chartH;
      const y2 = y + chartH - (snap.totalDemand / maxVal) * chartH;
      doc.line(x1, y1, x2, y2);
    });

    // Time labels
    const first = dispatchLog[0];
    const last = dispatchLog[dispatchLog.length - 1];
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textMuted);
    doc.text(formatTime(first.time), margin, y + chartH + 4);
    doc.text(formatTime(last.time), margin + chartW - 10, y + chartH + 4);

    // Legend
    const legendY = y + chartH + 8;
    doc.setFillColor(COLORS.green);
    doc.rect(margin, legendY, 8, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.textSecondary);
    doc.text('Generation', margin + 10, legendY + 2);

    doc.setFillColor(COLORS.accent);
    doc.rect(margin + 38, legendY, 8, 2, 'F');
    doc.text('Demand', margin + 48, legendY + 2);

    y += chartH + 16;
  }

  // ─── Recommendations ───────────────────────────────────────────────

  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.textPrimary);
  doc.text('Observations & Recommendations', margin, y);
  y += 7;

  const recommendations: string[] = [];

  if (latest) {
    if (latest.netHeadroom < 0) {
      recommendations.push('The grid is currently experiencing a generation deficit. Consider adding additional generation capacity (solar farms, wind farms, or battery storage) to meet demand.');
    } else if (latest.netHeadroom < latest.totalCapacity * 0.1) {
      recommendations.push('Reserve margins are thin (below 10%). Adding standby generation or demand response programs would improve resilience during peak periods.');
    } else {
      recommendations.push('Generation capacity exceeds demand with healthy margins. The grid is well-positioned to handle unexpected demand surges.');
    }

    const gasShare = (latest.generationMix['Gas'] || 0) / (latest.totalCapacity || 1);
    if (gasShare > 0.5) {
      recommendations.push('Gas generation accounts for over 50% of the mix. Expanding renewable sources (solar, wind) would reduce carbon intensity and operating costs.');
    }

    if (latest.carbonIntensity > 300) {
      recommendations.push(`Carbon intensity is elevated at ${latest.carbonIntensity} g/kWh. Transitioning more generation to renewables and nuclear would meaningfully lower emissions.`);
    }

    const offlineNodes = Object.values(nodes).filter(n => n.status === 'offline');
    if (offlineNodes.length > 0) {
      recommendations.push(`${offlineNodes.length} infrastructure asset(s) are currently offline. Restoring these facilities would increase available capacity and improve grid stability.`);
    }

    if (Object.keys(latest.demandBreakdown).includes('EV Charging')) {
      recommendations.push('EV charging loads are present. Consider co-locating battery storage with charging hubs to manage evening peak demand spikes.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('No immediate concerns identified. The grid is operating within normal parameters.');
  }

  recommendations.forEach((rec, i) => {
    drawRoundedRect(doc, margin, y, cw, 14, 2, i % 2 === 0 ? '#f0fdf4' : '#f0f9ff');

    doc.setFillColor(i % 2 === 0 ? COLORS.green : COLORS.blue);
    doc.circle(margin + 5, y + 5, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.white);
    doc.text(`${i + 1}`, margin + 4, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textPrimary);
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(rec, cw - 16);
    doc.text(lines, margin + 12, y + 5);

    y += Math.max(14, lines.length * 4 + 6);
  });

  // ─── Footer ────────────────────────────────────────────────────────

  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor('#0f172a');
    doc.rect(0, 290, pw, 7, 'F');
    doc.setFontSize(7);
    doc.setTextColor('#94a3b8');
    doc.text('Grid Simulator  \u2022  Confidential', margin, 294);
    doc.text(`Page ${p} of ${pageCount}`, pw - margin - 20, 294);
  }

  doc.save('Grid_Simulation_Report.pdf');
}
