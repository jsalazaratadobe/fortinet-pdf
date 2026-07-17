/*
 * Venn Diagram block (page 1, one-off)
 *
 * Renders the "Networking + Security" Venn diagram as live inline SVG:
 * a red "Networking" circle, a teal->blue gradient "Security" circle, and a
 * dark blended overlap zone where they intersect. Content is a fixed,
 * illustrative diagram (not author-editable data) so the icon/label lists
 * are hardcoded here rather than parsed from the authored block — the
 * authored markup is expected to be an empty `<div class="venn-diagram">`.
 *
 * Layout is computed from a small set of circle-geometry constants so every
 * icon/label column is placed inside the correct red / security / overlap
 * band automatically (no per-item pixel guessing, no clipping across a
 * circle edge).
 */

/* -------------------------------------------------------------------- */
/* Design-space geometry (SVG user units)                                */
/* -------------------------------------------------------------------- */

const VIEW_W = 1200;
const VIEW_H = 760;
const R = 300; // circle radius
const LEFT_CX = 420; // networking circle center x
const RIGHT_CX = 760; // security circle center x
const CY = 420; // shared circle center y
const HALO = 16; // soft outer ring thickness

/** Half-width of a circle of radius r at vertical offset dy from its center. */
function halfWidthAt(dy, r = R) {
  const v = (r * r) - (dy * dy);
  return v > 0 ? Math.sqrt(v) : 0;
}

/** X-range of the circle-only ("pure") band on one side, at a given dy from CY. */
function pureBand(dy, side) {
  const w = halfWidthAt(dy);
  return side === 'left' ? [LEFT_CX - w, RIGHT_CX - w] : [LEFT_CX + w, RIGHT_CX + w];
}

/** X-range of the overlap (lens) band at a given dy from CY. */
function overlapBand(dy) {
  const w = halfWidthAt(dy);
  return [RIGHT_CX - w, LEFT_CX + w];
}

/** Evenly space `count` column centers inside [start, end], inset by `pad`. */
function columnsInBand([start, end], count, pad) {
  const usable = Math.max(end - start - (2 * pad), 0);
  if (count <= 1) return [start + ((end - start) / 2)];
  const step = usable / (count - 1);
  return Array.from({ length: count }, (_, i) => start + pad + (i * step));
}

/* -------------------------------------------------------------------- */
/* Content (hardcoded — pure decoration, per "David's Model")            */
/* -------------------------------------------------------------------- */

const NETWORKING_ROWS = [
  { dy: -140, items: [{ icon: 'router', label: 'Router' }] },
  { dy: 0, items: [{ icon: 'switch', label: 'Switch' }, { icon: 'wifi', label: 'Wi-Fi' }] },
  { dy: 140, items: [{ icon: 'sdwan', label: 'SD-WAN' }, { icon: 'fiveg', label: '5G' }] },
];

const SECURITY_ROWS = [
  {
    dy: -150,
    items: [
      { icon: 'firewall', label: 'Firewall' },
      { icon: 'ssl', label: 'SSL' },
      { icon: 'sdwan', label: 'SD-WAN' },
      { icon: 'fwaas', label: 'FWaaS' },
    ],
  },
  {
    dy: -50,
    items: [
      { icon: 'inlinemps', label: 'Inline MPS' },
      { icon: 'ips', label: 'IPS' },
      { icon: 'urlfiltering', label: 'URL Filtering' },
      { icon: 'waf', label: 'WAF' },
    ],
  },
  {
    dy: 50,
    items: [
      { icon: 'antimalware', label: 'Anti-Malware' },
      { icon: 'attacksurface', label: 'Attack Surface Security' },
      { icon: 'dlp', label: 'DLP' },
      { icon: 'casb', label: 'CASB' },
    ],
  },
  {
    dy: 150,
    items: [
      { icon: 'sandbox', label: 'Sandbox' },
      { icon: 'swg', label: 'SWG' },
      { icon: 'ztna', label: 'ZTNA' },
      { icon: 'cloudsecurity', label: 'Cloud Security' },
    ],
  },
];

const OVERLAP_ROWS = [
  { dy: -140, items: [{ icon: 'os', label: 'Single OS' }] },
  { dy: 0, items: [{ icon: 'asic', label: 'ASIC' }, { icon: 'fortiguard', label: 'FortiGuard' }] },
  { dy: 140, items: [{ icon: 'quantum', label: 'Quantum Safe' }] },
];

/* -------------------------------------------------------------------- */
/* Icons — simple 24x24 line-icon pictograms (stroke=currentColor)       */
/* -------------------------------------------------------------------- */

const ICONS = {
  router: '<circle cx="12" cy="12" r="8"/><path d="M12 5v3m0 8v3M5 12h3m8 0h3"/><path d="M10 7l2-2 2 2M10 17l2 2 2-2M7 10l-2 2 2 2M17 10l2 2-2 2"/>',
  switch: '<path d="M4 8h13m0 0-3-3m3 3-3 3"/><path d="M20 16H7m0 0 3 3m-3-3 3-3"/>',
  wifi: '<path d="M5 9a11 11 0 0 1 14 0"/><path d="M8 12.5a6.5 6.5 0 0 1 8 0"/><circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none"/>',
  sdwan: '<circle cx="12" cy="6" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/><path d="M12 7.6v3M12 10.6 7 16.8M12 10.6l5 6.2"/>',
  fiveg: '<rect x="4" y="14" width="2.5" height="6" rx="1"/><rect x="8.5" y="10" width="2.5" height="10" rx="1"/><rect x="13" y="6" width="2.5" height="14" rx="1"/><rect x="17.5" y="3" width="2.5" height="17" rx="1"/>',
  firewall: '<path d="M4 6l7 6-7 6z"/><path d="M12 6l7 6-7 6z"/>',
  ssl: '<rect x="6" y="11" width="9" height="7" rx="1.5"/><path d="M8.5 11V8.5a2.5 2.5 0 0 1 5 0V11"/><path d="M17 12h2M17 15h2"/>',
  fwaas: '<rect x="4" y="5" width="16" height="14" rx="1.5"/><path d="M4 10h16M4 15h16M9 5v5M15 10v5M9 15v4"/>',
  inlinemps: '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><circle cx="10" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r="1" fill="currentColor" stroke="none"/>',
  ips: '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M12 8v5"/><circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none"/>',
  urlfiltering: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.5 2.5 13 0 16M12 4c-2.5 2.5-2.5 13 0 16"/>',
  waf: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 9.3h16M4 14.7h16M9.3 4v5.3M14.7 9.3v5.3M9.3 14.7V20"/>',
  antimalware: '<circle cx="12" cy="13" r="5"/><path d="M12 8V5M9 9 7 7M15 9l2-2M7 13H4M20 13h-3M9 17l-2 2M15 17l2 2"/>',
  attacksurface: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  dlp: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><rect x="9.5" y="13" width="5" height="4" rx="1"/><path d="M10.5 13v-1.5a1.5 1.5 0 0 1 3 0V13"/>',
  casb: '<path d="M7 17a4 4 0 0 1 .4-8 5 5 0 0 1 9.5-1.3A4.5 4.5 0 0 1 17 17H7z"/><rect x="9.8" y="17.2" width="4.4" height="3" rx="0.8"/><path d="M10.6 17.2v-1a1.4 1.4 0 0 1 2.8 0v1"/>',
  sandbox: '<rect x="4" y="6" width="16" height="12" rx="1.5"/><circle cx="12" cy="12" r="3"/>',
  swg: '<circle cx="11" cy="11" r="7"/><path d="M4 11h14M11 4c2 2 2 12 0 14M11 4c-2 2-2 12 0 14"/><rect x="15" y="13" width="6" height="5" rx="1"/><path d="M16.5 13v-1.4a1.5 1.5 0 0 1 3 0V13"/>',
  ztna: '<circle cx="12" cy="12" r="8"/><path d="M9 12l2 2 4-4.5"/>',
  cloudsecurity: '<path d="M7 15a3.5 3.5 0 0 1 .4-7 4.5 4.5 0 0 1 8.6-1.2A4 4 0 0 1 16 15H7z"/><path d="M12 12l1.6 3.2-1.6.8-1.6-.8z"/>',
  os: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>',
  asic: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M7 9H4M7 12H4M7 15H4M20 9h-3M20 12h-3M20 15h-3"/>',
  fortiguard: '<path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  quantum: '<ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
};

function buildIconDefs() {
  return Object.entries(ICONS)
    .map(([key, markup]) => `<symbol id="vd-icon-${key}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${markup}</symbol>`)
    .join('');
}

/* -------------------------------------------------------------------- */
/* Markup builders                                                       */
/* -------------------------------------------------------------------- */

/** Split a label into at most a few short lines, matching the source's stacked captions. */
function wrapLabel(label, max = 9) {
  const words = label.split(' ');
  if (words.length === 1) return [label];
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function labelTspans(label, fontSize) {
  return wrapLabel(label)
    .map((line, i) => `<tspan x="0" dy="${i === 0 ? 0 : fontSize * 1.15}">${line}</tspan>`)
    .join('');
}

function itemMarkup({
  x, y, icon, label, iconSize, fontSize,
}) {
  const textY = (iconSize / 2) + fontSize + 6;
  return `<g class="venn-item" transform="translate(${x} ${y})">
    <use href="#vd-icon-${icon}" aria-hidden="true" x="${-iconSize / 2}" y="${-iconSize / 2}" width="${iconSize}" height="${iconSize}" class="venn-icon-use"></use>
    <text class="venn-item-label" y="${textY}" text-anchor="middle" font-size="${fontSize}">${labelTspans(label, fontSize)}</text>
  </g>`;
}

function buildGrid(rows, side, iconSize, fontSize, pad) {
  return rows.map((row) => {
    const y = CY + row.dy;
    const band = side === 'overlap' ? overlapBand(row.dy) : pureBand(row.dy, side);
    const xs = columnsInBand(band, row.items.length, pad);
    return row.items.map((item, i) => itemMarkup({
      x: xs[i], y, icon: item.icon, label: item.label, iconSize, fontSize,
    })).join('');
  }).join('');
}

function buildSvgMarkup() {
  const networkingGrid = buildGrid(NETWORKING_ROWS, 'left', 36, 17, 45);
  const securityGrid = buildGrid(SECURITY_ROWS, 'right', 26, 13, 45);
  const overlapGrid = buildGrid(OVERLAP_ROWS, 'overlap', 32, 15, 30);

  return `
    <defs>
      ${buildIconDefs()}
      <linearGradient id="vd-security-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2ab08f"/>
        <stop offset="1" stop-color="#4fa5cc"/>
      </linearGradient>
      <clipPath id="vd-clip-left"><circle cx="${LEFT_CX}" cy="${CY}" r="${R}"/></clipPath>
      <clipPath id="vd-clip-right"><circle cx="${RIGHT_CX}" cy="${CY}" r="${R}"/></clipPath>
    </defs>

    <circle class="venn-circle-halo" cx="${LEFT_CX}" cy="${CY}" r="${R + HALO}"></circle>
    <circle class="venn-circle-halo" cx="${RIGHT_CX}" cy="${CY}" r="${R + HALO}"></circle>

    <circle class="venn-circle-left" cx="${LEFT_CX}" cy="${CY}" r="${R}"></circle>
    <circle class="venn-circle-right" cx="${RIGHT_CX}" cy="${CY}" r="${R}"></circle>

    <g clip-path="url(#vd-clip-left)">
      <g clip-path="url(#vd-clip-right)">
        <rect class="venn-overlap-fill" x="0" y="0" width="${VIEW_W}" height="${VIEW_H}"></rect>
      </g>
    </g>

    <text class="venn-label-external" x="${LEFT_CX}" y="72" text-anchor="middle" font-size="32">NETWORKING</text>
    <text class="venn-label-external" x="${RIGHT_CX}" y="72" text-anchor="middle" font-size="32">SECURITY</text>
    <text class="venn-label-inline" x="795" y="200" text-anchor="middle" font-size="24">SASE FIREWALL</text>

    ${networkingGrid}
    ${securityGrid}
    ${overlapGrid}
  `;
}

/**
 * Build the full Venn diagram DOM. Authored block content is discarded —
 * this diagram is a fixed illustration (see file header), not authorable data.
 * @param {Element} block
 */
export default async function decorate(block) {
  const stage = document.createElement('div');
  stage.className = 'venn-diagram-stage';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VIEW_W} ${VIEW_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('class', 'venn-diagram-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Venn diagram showing the convergence of Networking (Router, Switch, Wi-Fi, SD-WAN, 5G) and Security (SASE Firewall capabilities including Firewall, SSL, IPS, WAF, DLP, CASB, Sandbox, SWG, ZTNA, Cloud Security and more), sharing a unified Single OS, custom ASIC, FortiGuard services, and Quantum Safe cryptography.');
  svg.innerHTML = buildSvgMarkup();

  stage.append(svg);
  block.replaceChildren(stage);
}
