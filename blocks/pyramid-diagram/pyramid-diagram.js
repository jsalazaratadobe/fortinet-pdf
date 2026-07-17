import { createTag } from '../../scripts/shared.js';

/**
 * Static content for the "Fortify Your Networks" convergence pyramid (PDF page 2).
 * This is a one-off illustrative diagram, not per-row authored data: the pyramid's
 * bands, base segments and grouping are fixed brand content, so `decorate()` builds
 * the whole DOM from this hardcoded structure. See block README note in the PR for
 * the authoring contract (block is authored empty).
 */
const BANDS = [
  {
    key: 'apex',
    title: 'Fortify Your Networks',
    badge: true,
  },
  {
    key: 'convergence',
    title: 'Convergence',
    desc: 'Converge networking to secure networking to manage content, application, user, device, data, and location.',
  },
  {
    key: 'fortios',
    title: 'FortiOS | FortiASIC',
    desc: 'Simplify and automate security management with FortiOS, integrating 30+ security and networking functions, leveraging FortiASIC to improve performance, lower cost, and reduce energy consumption.',
  },
];

const SEGMENTS = [
  { key: 'firewall', label: 'Firewall' },
  { key: 'ot-iot', label: 'OT, IoT, Edge Security' },
  { key: 'segmentation', label: 'Segmentation, ZTNA' },
  { key: 'sase', label: 'Unified SASE' },
  { key: 'secops', label: 'AI-Driven SecOps' },
];

// Group labels span the 5 base segments as 2 + 2 + 1 columns (matches source PDF).
const GROUPS = [
  { key: 'secure-networking', label: 'Secure Networking', span: 2 },
  { key: 'unified-sase', label: 'Unified SASE', span: 2 },
  { key: 'security-ops', label: 'Security Ops', span: 1 },
];

const CAPTION = 'Fortinet is the clear leader in secure networking convergence.';

function buildBadge() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = '<rect x="4" y="4" width="10" height="10" rx="2"/>'
    + '<rect x="18" y="4" width="10" height="10" rx="2"/>'
    + '<rect x="4" y="18" width="10" height="10" rx="2"/>'
    + '<rect x="18" y="18" width="10" height="10" rx="2"/>';
  return svg;
}

function buildBand(band) {
  const el = createTag('div', { class: `pyramid-diagram-band pyramid-diagram-band-${band.key}` });
  if (band.badge) {
    const badge = createTag('span', { class: 'pyramid-diagram-badge' });
    badge.append(buildBadge());
    el.append(badge);
  }
  el.append(createTag('p', { class: 'pyramid-diagram-band-title' }, band.title));
  if (band.desc) {
    el.append(createTag('p', { class: 'pyramid-diagram-band-desc' }, band.desc));
  }
  return el;
}

function buildShape() {
  const wrapper = createTag('div', { class: 'pyramid-diagram-shape', 'aria-hidden': 'true' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 1000 620');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = '<path d="M500,15 C516,15 531,24 538,39 L927,565 C942,585 928,610 903,610'
    + ' L97,610 C72,610 58,585 73,565 L462,39 C469,24 484,15 500,15 Z" />';
  wrapper.append(svg);
  return wrapper;
}

function buildBase() {
  const base = createTag('div', { class: 'pyramid-diagram-base' });

  const segments = createTag('div', { class: 'pyramid-diagram-segments' });
  SEGMENTS.forEach((segment) => {
    segments.append(createTag(
      'div',
      { class: `pyramid-diagram-segment pyramid-diagram-segment-${segment.key}` },
      segment.label,
    ));
  });

  // Spans are fixed 2 + 2 + 1 (see GROUPS above) and applied via CSS nth-child
  // rules in pyramid-diagram.css, since grid-column: span var(--n) support is
  // inconsistent across browsers.
  const groups = createTag('div', { class: 'pyramid-diagram-groups' });
  GROUPS.forEach((group) => {
    groups.append(createTag(
      'div',
      { class: `pyramid-diagram-group pyramid-diagram-group-${group.key}` },
      group.label,
    ));
  });

  base.append(segments, groups);
  return base;
}

/**
 * @param {Element} block - expected to be authored empty; content is illustrative
 *   and fully generated from the hardcoded BANDS/SEGMENTS/GROUPS data above.
 */
export default async function decorate(block) {
  const figure = createTag('div', { class: 'pyramid-diagram-figure' });

  figure.append(buildShape());

  const bands = createTag('div', { class: 'pyramid-diagram-bands' });
  BANDS.forEach((band) => bands.append(buildBand(band)));
  figure.append(bands);

  figure.append(buildBase());

  const caption = createTag('p', { class: 'pyramid-diagram-caption' }, CAPTION);

  block.replaceChildren(figure, caption);
}
