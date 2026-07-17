import { createTag } from '../../scripts/shared.js';

/**
 * Static content for the "Performance and Applications" ASIC growth-stairs
 * diagram (PDF page 5). This is a one-off illustrative diagram, not per-row
 * authored data: the 4 steps and their carried-forward feature lists are
 * fixed brand content, so `decorate()` builds the whole DOM from this
 * hardcoded structure (block is authored empty).
 *
 * Each step is a stack of chips, bottom (oldest/carried-forward) to top
 * (newest). `weight` drives each chip's relative height within the step via
 * flex-grow, so the stack reads like a small stacked bar chart.
 */
const HEADER = 'Performance and Applications';

const STEPS = [
  {
    key: 'sp2',
    label: 'SP2',
    count: '2 apps',
    chips: [
      { type: 'new', text: 'Anti-Malware, Firewall', weight: 1 },
    ],
  },
  {
    key: 'sp3',
    label: 'SP3',
    count: '4 apps',
    chips: [
      { type: 'new', text: 'IPS, IPsec', weight: 1 },
      { type: 'base', text: 'Anti-Malware, Firewall', weight: 1 },
    ],
  },
  {
    key: 'sp4',
    label: 'SP4',
    count: '7 apps',
    chips: [
      { type: 'new', text: 'SD-WAN, SSL', weight: 1 },
      { type: 'achievement', text: 'NGFW', weight: 0.5 },
      {
        type: 'base',
        text: 'IPS, IPsec, Anti-Malware, Firewall',
        weight: 1.4,
      },
    ],
  },
  {
    key: 'sp5',
    label: 'SP5',
    count: '14 apps',
    chips: [
      {
        type: 'new',
        text: 'SD-Branch, Zero Trust, OT, 5G, Edge Compute, VXLAN',
        weight: 1.7,
      },
      { type: 'achievement', text: 'Secure Boot', weight: 0.5 },
      {
        type: 'base',
        text: 'SD-WAN, SSL, NGFW, IPS, IPsec, Anti-Malware, Firewall',
        weight: 1.7,
      },
    ],
  },
];

function buildStep(step, index) {
  const li = createTag('li', { class: `growth-stairs-step growth-stairs-step-${step.key}` });
  li.style.setProperty('--growth-stairs-level', index + 1);

  li.append(createTag('p', { class: 'growth-stairs-count' }, step.count));

  const stack = createTag('div', { class: 'growth-stairs-stack' });
  // Reverse so the newest (top) chip renders first in the flex column,
  // which visually stacks new features above the carried-forward base.
  [...step.chips].reverse().forEach((chip) => {
    const chipEl = createTag('div', { class: `growth-stairs-chip growth-stairs-chip-${chip.type}` }, chip.text);
    chipEl.style.setProperty('--growth-stairs-weight', chip.weight);
    stack.append(chipEl);
  });
  li.append(stack);

  li.append(createTag('p', { class: 'growth-stairs-label' }, step.label));

  return li;
}

function buildArrow() {
  const wrapper = createTag('div', { class: 'growth-stairs-arrow', 'aria-hidden': 'true' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 30');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = '<line x1="2" y1="28" x2="93" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    + '<path d="M84,2 L96,3 L92,14 Z" fill="currentColor"/>';
  wrapper.append(svg);
  return wrapper;
}

/**
 * @param {Element} block - expected to be authored empty; content is illustrative
 *   and fully generated from the hardcoded STEPS data above.
 */
export default async function decorate(block) {
  const wrapper = createTag('div', { class: 'growth-stairs-wrapper' });

  wrapper.append(createTag('p', { class: 'growth-stairs-header' }, HEADER));

  const chart = createTag('div', { class: 'growth-stairs-chart' });
  chart.append(buildArrow());

  const steps = createTag('ol', { class: 'growth-stairs-steps' });
  STEPS.forEach((step, index) => steps.append(buildStep(step, index)));
  chart.append(steps);

  wrapper.append(chart);
  block.replaceChildren(wrapper);
}
