import { createTag } from '../../scripts/shared.js';

/**
 * Concentric Rings diagram (page 4, one-off illustrative diagram).
 *
 * This block renders a fixed illustration (FortiOS platform evolution,
 * 2000-2026) and does not read authored content: the diagram is entirely
 * illustrative/non-editable, so decorate() clears whatever is in the block
 * (an empty block is the expected authoring contract - see README note in
 * the block folder / PR description) and builds the DOM from the hardcoded
 * data below.
 */

const ICONS = {
  atom: '<ellipse cx="12" cy="12" rx="9" ry="3.7"/><ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.7" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  'shield-check': '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><path d="M9 12.2l1.8 1.8L15 10"/>',
  'shield-lock': '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><rect x="9.4" y="11.3" width="5.2" height="4.2" rx="0.8"/><path d="M10.4 11.3v-1.4a1.6 1.6 0 0 1 3.2 0v1.4"/>',
  bot: '<rect x="4.5" y="8.5" width="15" height="9.5" rx="2"/><circle cx="9" cy="13" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.1" fill="currentColor" stroke="none"/><path d="M12 8.5V5.3"/><circle cx="12" cy="4" r="1"/><path d="M4.5 12.5H2.5M21.5 12.5h-2"/>',
  cpu: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.2"/><rect x="9.7" y="9.7" width="4.6" height="4.6"/><path d="M9 3.3v3.2M15 3.3v3.2M9 17.5v3.2M15 17.5v3.2M3.3 9h3.2M3.3 15h3.2M17.5 9h3.2M17.5 15h3.2"/>',
  factory: '<path d="M3.5 20.5V11l4.5 2.7V11l4.5 2.7V11l4.5 2.7v6.8z"/><path d="M3.5 20.5h13"/><path d="M17.5 20.5V8l3-2v14.5"/>',
  droplet: '<path d="M12 3.2s5.8 6.3 5.8 10.6a5.8 5.8 0 1 1-11.6 0C6.2 9.5 12 3.2 12 3.2z"/><path d="M9.2 14.6a2.8 2.8 0 0 0 2.8 2.8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M5 5l2.1 2.1M16.9 16.9 19 19M2.5 12h3M18.5 12h3M5 19l2.1-2.1M16.9 7.1 19 5"/>',
  target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

const RINGS = {
  core: { label: 'FW/VPN' },
  networking: {
    label: 'SECURE NETWORKING',
    items: ['NGFW/UTM', 'IPS', 'App Control', 'Antivirus', 'Sandbox', 'Wireless', 'Switch'],
    badge: { icon: 'atom', label: 'Quantum Safe' },
  },
  sase: {
    label: 'UNIFIED SASE',
    items: ['SD-WAN', 'SSE', 'ZTNA', 'DLP', 'SWG', 'FWaaS', 'Cloud Security', 'WAF', 'CASB'],
  },
};

const RIM = {
  top: {
    label: 'ARTIFICIAL INTELLIGENCE',
    items: [
      { icon: 'shield-check', label: 'Autonomous Threat Detection' },
      { icon: 'shield-lock', label: 'Shadow AI Lockdown' },
      { icon: 'bot', label: 'Agentic AI Operations' },
      { icon: 'cpu', label: 'LLM Security' },
      { icon: 'factory', label: 'AI Factory' },
    ],
  },
  bottom: {
    label: 'SECURITY OPERATIONS',
    // Left-to-right order matches the source diagram, where the rim icons
    // cascade outward from the label: "AI Exposure Guard" sits lowest and
    // closest to the SECURITY OPERATIONS label, "Data Leakage Prevention"
    // sits highest and closest to the divider/AI badge on the right.
    items: [
      { icon: 'target', label: 'AI Exposure Guard' },
      { icon: 'gear', label: 'Autonomous SOC' },
      { icon: 'droplet', label: 'Data Leakage Prevention' },
    ],
  },
};

const TIMELINE = { start: '2000', end: '2026' };

function buildRimList(side, data) {
  const ul = createTag('ul', { class: `concentric-rings-rim concentric-rings-rim-${side}` });
  data.items.forEach((item) => {
    const li = createTag('li', { class: 'concentric-rings-rim-item' });
    li.innerHTML = `<span class="concentric-rings-rim-icon">${icon(item.icon)}</span><span class="concentric-rings-rim-text">${item.label}</span>`;
    ul.append(li);
  });
  return ul;
}

function buildRingList(items) {
  const ul = createTag('ul', { class: 'concentric-rings-ring-list' });
  items.forEach((item) => ul.append(createTag('li', {}, item)));
  return ul;
}

export default async function decorate(block) {
  block.textContent = '';

  const diagram = createTag('div', { class: 'concentric-rings-diagram' });

  const saseRing = createTag('div', { class: 'concentric-rings-ring concentric-rings-ring-sase' });
  saseRing.append(
    createTag('p', { class: 'concentric-rings-ring-label' }, RINGS.sase.label),
    buildRingList(RINGS.sase.items),
  );

  const networkingRing = createTag('div', { class: 'concentric-rings-ring concentric-rings-ring-networking' });
  networkingRing.append(
    createTag('p', { class: 'concentric-rings-ring-label' }, RINGS.networking.label),
    buildRingList(RINGS.networking.items),
  );
  const badge = createTag('div', { class: 'concentric-rings-badge' });
  badge.innerHTML = `<span class="concentric-rings-badge-icon">${icon(RINGS.networking.badge.icon)}</span><span class="concentric-rings-badge-text">${RINGS.networking.badge.label}</span>`;
  networkingRing.append(badge);

  const coreRing = createTag(
    'div',
    { class: 'concentric-rings-ring concentric-rings-ring-core' },
    createTag('p', { class: 'concentric-rings-ring-label' }, RINGS.core.label),
  );

  const bandTop = createTag('p', { class: 'concentric-rings-band-label concentric-rings-band-label-top' }, RIM.top.label);
  const bandBottom = createTag('p', { class: 'concentric-rings-band-label concentric-rings-band-label-bottom' }, RIM.bottom.label);

  // Rings appended before band labels/rim lists so the labels/icons (which
  // visually sit at or near ring edges) always paint above the ellipses.
  diagram.append(
    saseRing,
    networkingRing,
    coreRing,
    bandTop,
    bandBottom,
    buildRimList('top', RIM.top),
    buildRimList('bottom', RIM.bottom),
  );

  const timeline = createTag('div', { class: 'concentric-rings-timeline' });
  timeline.append(
    createTag('span', { class: 'concentric-rings-timeline-year concentric-rings-timeline-start' }, TIMELINE.start),
    createTag('span', { class: 'concentric-rings-timeline-line', 'aria-hidden': 'true' }),
    createTag('span', { class: 'concentric-rings-timeline-year concentric-rings-timeline-end' }, TIMELINE.end),
  );

  block.append(diagram, timeline);
}
