import { createTag } from '../../scripts/shared.js';

/**
 * Static content for the FortiSOC hub-and-spoke diagram (page 9 of the
 * source brochure). This block is purely illustrative and one-off, so the
 * data lives here rather than being authored — see the block-level comment
 * on `decorate()` for the authoring contract.
 */
const STATS = [
  { value: '86%', label: 'Shrink the attacker window', caption: 'Reduction in cyber incidents' },
  { value: '99%', label: 'Respond at machine speed', caption: 'Faster response' },
  { value: '5x', label: 'Maximize SOC productivity', caption: 'Improvement in output' },
];

const LEFT_SPOKES = [
  {
    title: 'Endpoint Security',
    detail: 'EDR, EPP, Unified Agent',
    color: '#1c2b4a',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
  },
  {
    title: 'Network Detection',
    detail: 'NDR, Sandbox, Deception',
    color: '#0d5c54',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8v3a3 3 0 0 0 3 3h1M18 8v3a3 3 0 0 1-3 3h-1"/></svg>',
  },
  {
    title: 'Cloud Security',
    detail: 'CNAPP',
    color: '#1a9b8f',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17a4 4 0 0 1 .5-7.96A5 5 0 0 1 17 10a3.5 3.5 0 0 1-.5 7H7z"/></svg>',
  },
];

const RIGHT_SPOKES = [
  {
    title: 'Data and Mail Security',
    detail: 'DLP, DSPM, Email and Workspace Security',
    color: '#1c2b4a',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 6l9 7 9-7"/></svg>',
  },
  {
    title: 'Exposure Management',
    detail: 'CTEM, Recon, Vuln. Mgmt.',
    color: '#0d5c54',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  },
  {
    title: 'Identity Security',
    detail: 'IAM, PAM, Identity SaaS',
    color: '#1a9b8f',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.2"/><path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5"/></svg>',
  },
];

function buildStats() {
  const ul = createTag('ul', { class: 'hub-spoke-stats' });
  STATS.forEach((stat) => {
    const li = createTag('li', { class: 'hub-spoke-stat' });
    li.append(
      createTag('strong', { class: 'hub-spoke-stat-value' }, stat.value),
      createTag('p', { class: 'hub-spoke-stat-label' }, stat.label),
      createTag('p', { class: 'hub-spoke-stat-caption' }, stat.caption),
    );
    ul.append(li);
  });
  return ul;
}

function buildSpoke(spoke, side) {
  const li = createTag('li', { class: `hub-spoke-box hub-spoke-box-${side}` });
  li.style.setProperty('--hub-spoke-color', spoke.color);

  const icon = createTag('span', { class: 'hub-spoke-box-icon', 'aria-hidden': 'true' });
  icon.innerHTML = spoke.icon;

  const text = createTag('span', { class: 'hub-spoke-box-text' });
  text.append(
    createTag('strong', {}, spoke.title),
    createTag('span', { class: 'hub-spoke-box-detail' }, spoke.detail),
  );

  const line = createTag('span', { class: 'hub-spoke-box-line', 'aria-hidden': 'true' });

  li.append(...(side === 'left' ? [icon, text, line] : [line, text, icon]));
  return li;
}

function buildCenter() {
  const center = createTag('div', { class: 'hub-spoke-center' });
  const badge = createTag('span', { class: 'hub-spoke-center-badge' }, 'AI');
  const circle = createTag('div', { class: 'hub-spoke-center-circle' });
  circle.append(
    createTag('strong', {}, 'SOC Platform'),
    createTag('span', {}, '(SIEM, SOAR, XDR)'),
  );
  center.append(badge, circle);
  return center;
}

/**
 * Decorate the FortiSOC hub-and-spoke diagram.
 *
 * Authoring contract: this is a fixed illustrative diagram, so decorate()
 * ignores any authored rows and always renders the hardcoded STATS/
 * LEFT_SPOKES/RIGHT_SPOKES data above. Authors only need to place an empty
 * `hub-spoke-diagram` block on the page.
 * @param {Element} block
 */
export default async function decorate(block) {
  const stats = buildStats();

  const diagram = createTag('div', { class: 'hub-spoke-diagram-main' });
  const title = createTag('h3', { class: 'hub-spoke-title' }, 'FortiSOC');

  const ring = createTag('div', { class: 'hub-spoke-ring' });
  const leftList = createTag('ul', { class: 'hub-spoke-boxes hub-spoke-boxes-left' });
  LEFT_SPOKES.forEach((spoke) => leftList.append(buildSpoke(spoke, 'left')));
  const rightList = createTag('ul', { class: 'hub-spoke-boxes hub-spoke-boxes-right' });
  RIGHT_SPOKES.forEach((spoke) => rightList.append(buildSpoke(spoke, 'right')));
  ring.append(leftList, buildCenter(), rightList);

  const subtitle = createTag('p', { class: 'hub-spoke-subtitle' }, 'Managed SOC Services');

  diagram.append(title, ring, subtitle);

  block.replaceChildren(stats, diagram);
}
