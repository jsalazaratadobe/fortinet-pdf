import { loadChartJs, createChart, createTag } from '../../scripts/shared.js';

/*
 * Authoring contract: this block is purely decorative/illustrative (a
 * "mountain" style stacked-area chart lifted from a PDF brochure). The
 * source material only gives qualitative endpoints and shapes (e.g. "TAM
 * grows from ~$5B to ~$45B", "Firewall reaches >50% of units shipped") —
 * no exact per-point figures are legible or knowable. Asking authors to
 * fill in a data table (like blocks/chart does) would imply a precision
 * that doesn't exist, so both datasets below are hardcoded in JS and
 * documented here. The authored block content itself is expected to be
 * empty; the only authoring lever is the `journey` modifier class, e.g.:
 *   | mountain-chart |
 *   | --- |
 * or
 *   | mountain-chart (journey) |
 *   | --- |
 */

// --- "Total Addressable Market" dataset (default variant) --------------------
const TAM = {
  categories: ['1990s', '2000', '2005', '2010', '2012/2017', '2018/2020', '2021/2023', 'Q1 2026'],
  eraLines: [
    ['Firewall, VPN, IPS,', 'Web Filtering'],
    ['UTM/NGFW'],
    ['Sandbox'],
    ['WAF'],
    ['OT Security'],
    ['SD-WAN'],
    ['SASE and Quantum'],
    ['AI Security'],
  ],
  // Illustrative total TAM in $B, smoothly rising $5B -> $45B (accelerating,
  // matching the curve shape in the source image, not exact quarterly data).
  totals: [5, 8, 13, 19, 26, 33, 40, 45],
  // Share of the total held by Fortinet's "Single OS Integrated Solution"
  // (red) vs. the fragmented "Multi Point Solution" (blue) market. NOTE:
  // the reference image (pdf-pages/page-06.png) shows red growing to be the
  // *dominant* majority of the stack by Q1 2026 (the "FORTINET" wordmark
  // spans nearly the full height at the right edge, with blue reduced to a
  // thin sliver up top) rather than capped at ~1/3 — this dataset follows
  // the image's visual read since fidelity to the source shape was the goal.
  redShare: [0.02, 0.05, 0.10, 0.18, 0.28, 0.42, 0.58, 0.72],
  // Swatch colors sampled directly from the legend dots in page-06.png.
  legend: [
    { color: '#46b775', label: 'Total Addressable Market' },
    { color: '#ade0ec', label: 'Multi Point Solution' },
    { color: '#e12923', label: 'Single OS Integrated Solution' },
  ],
  // Generic placeholder company-name chips (plain text, not real logos —
  // source logos are unlicensed/illegible) scattered above the curve.
  chips: [
    { name: 'SonicWall', top: 70, left: 6 },
    { name: 'WatchGuard', top: 80, left: 10 },
    { name: 'Juniper', top: 58, left: 20 },
    { name: 'Palo Alto', top: 68, left: 24 },
    { name: 'Imperva', top: 50, left: 34 },
    { name: 'F5', top: 60, left: 38 },
    { name: 'Netscaler', top: 42, left: 48 },
    { name: 'Forescout', top: 52, left: 52 },
    { name: 'Versa', top: 34, left: 61 },
    { name: 'Zscaler', top: 26, left: 70 },
    { name: 'Cato', top: 16, left: 78 },
    { name: 'Cisco Umbrella', top: 10, left: 88 },
  ],
};

// --- "Fortinet Journey" dataset (`.journey` variant) -------------------------
const JOURNEY = {
  categories: ['2000', '2002', '2005', '2010', '2015', '2020', '2022', '2025'],
  eraLines: [
    ['Stateful Firewall'],
    ['UTM', 'Anti-Malware'],
    ['URL Filtering', 'IPS', 'IPsec'],
    ['NGFW', 'SSL', 'Sandbox', 'OT Security'],
    ['SD-WAN', 'Mobile Malware', 'CASB'],
    ['ZTNA', '5G', 'SWG'],
    ['DLP', 'RBI', 'UZTNA', 'DEM'],
    ['Sovereign SASE'],
  ],
  // Illustrative stacked layer heights (no shared unit — each layer traces
  // its own smooth adoption curve; the three call-outs on the right carry
  // the real, sourced percentages).
  firewall: [30, 40, 48, 58, 68, 76, 82, 88],
  sdwan: [0, 0, 0, 6, 16, 26, 32, 38],
  sase: [0, 0, 0, 0, 3, 9, 13, 17],
  stats: [
    { label: 'FIREWALL', value: '>50%', caption: 'Market Global Firewall Units Shipped' },
    { label: 'SD-WAN', value: '>70%', caption: 'Large Enterprise Penetration' },
    { label: 'SASE', value: '18%', caption: 'Large Enterprise Penetration' },
  ],
};

function round1(n) {
  return Math.round(n * 10) / 10;
}

function baseFont() {
  return { family: 'Inter, sans-serif', size: 11 };
}

function buildLegend(items) {
  const list = createTag('ul', { class: 'mountain-chart-legend' });
  items.forEach((item) => {
    const li = createTag('li', { class: 'mountain-chart-legend-item' });
    li.append(createTag('span', { class: 'mountain-chart-legend-dot', style: `background:${item.color};` }));
    li.append(createTag('span', {}, item.label));
    list.append(li);
  });
  return list;
}

function buildOsBadge() {
  // "OS" roundel that anchors the left end of the Journey timeline (page-06,
  // Fortinet Journey chart only - the TAM chart has no equivalent badge).
  const badge = createTag('div', { class: 'mountain-chart-os-badge', 'aria-hidden': 'true' });
  badge.append(createTag('span', { class: 'mountain-chart-os-badge-text' }, 'OS'));
  const iconWrap = createTag('span', { class: 'mountain-chart-os-badge-icon' });
  iconWrap.innerHTML = icon('grid');
  badge.append(iconWrap);
  return badge;
}

function icon(name) {
  if (name === 'grid') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  }
  return '';
}

function buildTimeline(categories, eraLines) {
  const wrap = createTag('div', { class: 'mountain-chart-timeline' });
  categories.forEach((cat, i) => {
    const item = createTag('div', { class: 'mountain-chart-timeline-item' });
    item.append(createTag('span', { class: 'mountain-chart-timeline-dot' }));
    item.append(createTag('span', { class: 'mountain-chart-timeline-year' }, cat));
    const lines = eraLines[i] || [];
    if (lines.length) {
      const label = createTag('span', { class: 'mountain-chart-timeline-label' });
      lines.forEach((line) => label.append(createTag('span', {}, line)));
      item.append(label);
    }
    wrap.append(item);
  });
  return wrap;
}

function buildChips(chips) {
  const wrap = createTag('div', { class: 'mountain-chart-chips', 'aria-hidden': 'true' });
  chips.forEach((chip) => {
    wrap.append(createTag('span', {
      class: 'mountain-chart-chip',
      style: `top:${chip.top}%; left:${chip.left}%;`,
    }, chip.name));
  });
  return wrap;
}

function buildStats(stats) {
  const wrap = createTag('ul', { class: 'mountain-chart-stats' });
  stats.forEach((stat) => {
    const li = createTag('li', { class: 'mountain-chart-stat' });
    li.append(createTag('p', { class: 'mountain-chart-stat-label' }, stat.label));
    li.append(createTag('p', { class: 'mountain-chart-stat-value' }, stat.value));
    li.append(createTag('p', { class: 'mountain-chart-stat-caption' }, stat.caption));
    wrap.append(li);
  });
  return wrap;
}

function buildTamConfig() {
  const { categories, totals, redShare } = TAM;
  const redValues = totals.map((total, i) => round1(total * redShare[i]));
  const blueValues = totals.map((total, i) => round1(total - redValues[i]));

  return {
    type: 'line',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Single OS Integrated Solution',
          data: redValues,
          // Colors sampled from the legend swatches in pdf-pages/page-06.png.
          borderColor: '#e12923',
          backgroundColor: 'rgb(225 41 35 / 92%)',
          fill: 'origin',
          stack: 'tam',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Multi Point Solution',
          data: blueValues,
          borderColor: '#ade0ec',
          backgroundColor: 'rgb(173 224 236 / 92%)',
          fill: '-1',
          stack: 'tam',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
        },
        {
          // The source diagram traces the whole stack's outer boundary with a
          // thin green line, matching the "Total Addressable Market" legend
          // swatch - the previous version had that legend entry with nothing
          // on the canvas to back it up. Deliberately left out of the `tam`
          // stack group since it's a boundary outline, not another filled
          // layer. Chart.js draws lower `order` values last/on top, so
          // without this it renders *underneath* the opaque red/blue fills
          // and is invisible - order must be explicitly below their default
          // of 0.
          label: 'Total Addressable Market',
          data: totals,
          borderColor: '#46b775',
          backgroundColor: 'transparent',
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
          order: -1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y}B` },
        },
      },
      scales: {
        x: { stacked: true, display: false, grid: { display: false } },
        y: {
          stacked: true,
          min: 0,
          max: 48,
          afterBuildTicks: (axis) => {
            axis.ticks = [5, 15, 30, 45].map((value) => ({ value }));
          },
          ticks: { callback: (v) => `$${v}B`, font: baseFont(), color: '#888' },
          grid: { color: '#eee' },
        },
      },
    },
  };
}

function buildJourneyConfig() {
  const { categories, firewall, sdwan, sase } = JOURNEY;
  return {
    type: 'line',
    data: {
      labels: categories,
      datasets: [
        {
          // Colors sampled from pdf-pages/page-06.png Journey chart
          // (Firewall layer measures ~#ed1c24, more saturated than the
          // previous #d5382c).
          label: 'Firewall',
          data: firewall,
          borderColor: '#c41d1d',
          backgroundColor: '#ec2124',
          fill: 'origin',
          stack: 'journey',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'SD-WAN',
          data: sdwan,
          borderColor: '#ee7267',
          backgroundColor: '#ee7267',
          fill: '-1',
          stack: 'journey',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'SASE',
          data: sase,
          borderColor: '#f4b3a8',
          backgroundColor: '#f4b3a8',
          fill: '-1',
          stack: 'journey',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}` } },
      },
      scales: {
        x: { stacked: true, display: false, grid: { display: false } },
        y: {
          stacked: true, display: false, min: 0, max: 100,
        },
      },
    },
  };
}

export default async function decorate(block) {
  const isJourney = block.classList.contains('journey');
  block.textContent = '';

  const chartLabel = isJourney
    ? "Area chart showing Fortinet's product journey from 2000 to 2025 across Firewall, SD-WAN and SASE, reaching over 50% of global firewall units shipped, over 70% large-enterprise SD-WAN penetration, and 18% large-enterprise SASE penetration."
    : 'Area chart showing the total addressable market for network security growing from about $5 billion in the 1990s to about $45 billion by Q1 2026, split between a shrinking multi-point-solution segment and Fortinet\'s growing single-OS integrated solution segment.';

  const dataset = isJourney ? JOURNEY : TAM;

  const canvasWrapper = createTag('div', { class: 'mountain-chart-canvas-wrapper' });
  const canvas = createTag('canvas', { role: 'img', 'aria-label': chartLabel });
  canvasWrapper.append(canvas);

  if (!isJourney) {
    canvasWrapper.append(buildChips(TAM.chips));
    canvasWrapper.append(createTag('span', { class: 'mountain-chart-brand', 'aria-hidden': 'true' }, 'FORTINET'));
  }

  const timelineRow = createTag('div', { class: 'mountain-chart-timeline-row' });
  if (isJourney) timelineRow.append(buildOsBadge());
  timelineRow.append(buildTimeline(dataset.categories, dataset.eraLines));

  const main = createTag('div', { class: 'mountain-chart-main' });
  main.append(canvasWrapper, timelineRow);

  const inner = createTag('div', { class: 'mountain-chart-inner' });
  if (isJourney) {
    inner.append(main, buildStats(JOURNEY.stats));
  } else {
    inner.append(buildLegend(TAM.legend), main);
  }

  block.append(inner);

  await loadChartJs();
  createChart(canvas, isJourney ? buildJourneyConfig() : buildTamConfig());
}
