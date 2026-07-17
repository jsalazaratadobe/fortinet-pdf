import { createTag } from '../../scripts/shared.js';

/**
 * Static content for the arrow-flow diagram (page 6 of the source brochure).
 * This block is purely illustrative and is reused twice on the page with
 * identical content, so the data lives here rather than being authored —
 * see the block-level comment on `decorate()` for the authoring contract.
 */
const STEPS = [
  {
    title: 'NGFW',
    detail: 'ASIC',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="11" rx="1"/><path d="M9 20h6M12 16v4"/></svg>',
  },
  {
    title: 'LAN',
    detail: 'Switch, Wireless, NAC',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="10" width="18" height="6" rx="1"/><path d="M7 10V7M12 10V7M17 10V7"/></svg>',
  },
  {
    title: 'SD-WAN',
    detail: 'Branch, Data Center, Cloud',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M12 8.5V13M12 13L6.8 16M12 13l5.2 3"/></svg>',
  },
  {
    title: 'SASE',
    detail: 'SWG, SaaS, Unified Agent, Sovereign',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 17a8 5 0 0 1 16 0"/><path d="M7 13a5 3.5 0 0 1 10 0"/><circle cx="12" cy="17" r="1.2"/></svg>',
  },
  {
    title: 'Universal ZTNA',
    detail: 'Private Apps, CASB',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="11" width="12" height="9" rx="1.5"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/></svg>',
  },
];

const BRIDGES = [
  { className: 'flow-arrows-bridge-1', label: 'FortiClient Unified Agent' },
  { className: 'flow-arrows-bridge-2', label: 'FortiClient Unified Agent' },
];

const CAPTION = {
  label: 'Fortinet Delivers',
  columns: [
    ['Unified management', 'Consistent security'],
    ['Vendor consolidation', 'Lower costs and high performance'],
  ],
};

function buildStep(step) {
  const li = createTag('li', { class: 'flow-arrows-step' });
  const title = createTag('strong', { class: 'flow-arrows-step-title' }, step.title);
  const detail = createTag('p', { class: 'flow-arrows-step-detail' }, step.detail);
  const icon = createTag('span', { class: 'flow-arrows-step-icon', 'aria-hidden': 'true' });
  icon.innerHTML = step.icon;
  li.append(title, detail, icon);
  return li;
}

function buildBridge(bridge) {
  const div = createTag('div', { class: `flow-arrows-bridge ${bridge.className}` });
  div.append(createTag('span', { class: 'flow-arrows-bridge-label' }, bridge.label));
  return div;
}

function buildCaption() {
  const wrapper = createTag('div', { class: 'flow-arrows-caption' });
  wrapper.append(createTag('p', { class: 'flow-arrows-caption-label' }, CAPTION.label));
  CAPTION.columns.forEach((lines) => {
    const ul = createTag('ul', { class: 'flow-arrows-caption-list' });
    lines.forEach((line) => ul.append(createTag('li', {}, line)));
    wrapper.append(ul);
  });
  return wrapper;
}

/**
 * Decorate the flow-arrows diagram.
 *
 * Authoring contract: this is a fixed illustrative diagram (identical on both
 * occurrences in the source brochure), so decorate() ignores any authored
 * rows and always renders the hardcoded STEPS/BRIDGES/CAPTION data above.
 * Authors only need to place an empty `flow-arrows` block on the page.
 * @param {Element} block
 */
export default async function decorate(block) {
  const steps = createTag('ul', { class: 'flow-arrows-steps' });
  STEPS.forEach((step) => steps.append(buildStep(step)));

  const bridges = createTag('div', { class: 'flow-arrows-bridges' });
  BRIDGES.forEach((bridge) => bridges.append(buildBridge(bridge)));

  block.replaceChildren(steps, bridges, buildCaption());
}
