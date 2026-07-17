import { createTag } from '../../scripts/shared.js';

/**
 * Layer Stack diagram (page 9, one-off illustrative diagram).
 *
 * Like concentric-rings, this is a fixed illustration ("Protecting AI
 * Infrastructure, Applications, Data, and Users") and does not read
 * authored content: decorate() clears the block (authoring contract is an
 * empty block) and builds the DOM from the hardcoded data below.
 */

const ICONS = {
  'shield-check': '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><path d="M9 12.2l1.8 1.8L15 10"/>',
  'shield-cloud': '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><path d="M8.7 13.4a2.1 2.1 0 0 1 .5-4.1 2.6 2.6 0 0 1 5 .3 1.9 1.9 0 0 1-.3 3.8z"/>',
  'shield-lock': '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><rect x="9.4" y="11.3" width="5.2" height="4.2" rx="0.8"/><path d="M10.4 11.3v-1.4a1.6 1.6 0 0 1 3.2 0v1.4"/>',
  flame: '<path d="M12 3c2 3-1 4-1 7a3 3 0 1 0 6 0c0-1-.3-1.8-1-2.5.3 1 .2 2-.4 2.8A5 5 0 0 1 12 21a5 5 0 0 1-5-5c0-4 3-5 3-8 0-1 .7-3 2-5z"/>',
  asic: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.2"/><rect x="9.7" y="9.7" width="4.6" height="4.6"/><path d="M9 3.3v3.2M15 3.3v3.2M9 17.5v3.2M15 17.5v3.2M3.3 9h3.2M3.3 15h3.2M17.5 9h3.2M17.5 15h3.2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M5 5l2.1 2.1M16.9 16.9 19 19M2.5 12h3M18.5 12h3M5 19l2.1-2.1M16.9 7.1 19 5"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

// Bottom-to-top order, matching the visual stack (Energy = base/largest,
// Apps = top/smallest). Each tier lists the icon+caption row(s) that its
// leader line(s) point to.
const TIERS = [
  {
    id: 'energy',
    label: 'Energy',
    captions: [{
      icon: 'gear',
      text: 'OT security: Fortinet is the only three-time Westlands Advisory IT/OT Cybersecurity Platform Navigator 2025 Leader, with OT billings over 70% year-over-year (YoY).',
    }],
  },
  {
    id: 'chips',
    label: 'Chips',
    captions: [{
      icon: 'asic',
      text: 'Fortinet: The only cybersecurity company with a custom ASIC. Strategic partner with NVIDIA.',
    }],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    captions: [{ icon: 'flame', text: 'FortiGate and FortiSwitch' }],
  },
  {
    id: 'ai-models',
    label: 'AI Models',
    captions: [{ icon: 'shield-lock', text: 'FortiAI-Secure and FortiAIGate' }],
  },
  {
    id: 'apps',
    label: 'Apps',
    captions: [
      { icon: 'shield-check', text: 'FortiAI-Protect and FortiGuard Services' },
      { icon: 'shield-cloud', text: 'FortiSASE and FortiEndpoint' },
    ],
  },
];

function buildTier(tier) {
  return createTag(
    'div',
    { class: `layer-stack-tier layer-stack-tier-${tier.id}` },
    createTag('span', { class: 'layer-stack-tier-label' }, tier.label),
  );
}

function buildCaption(tier, caption) {
  const li = createTag('li', { class: 'layer-stack-caption', 'data-tier': tier.id });
  li.innerHTML = `<span class="layer-stack-caption-leader" aria-hidden="true"></span><span class="layer-stack-caption-icon">${icon(caption.icon)}</span><p class="layer-stack-caption-text">${caption.text}</p>`;
  return li;
}

export default async function decorate(block) {
  block.textContent = '';

  const diagram = createTag('div', { class: 'layer-stack-diagram' });
  // TIERS is already bottom-to-top (Energy first, Apps last). The CSS uses
  // flex-direction: column-reverse to flip that into the correct visual
  // stacking order (Apps on top), while normal DOM paint order keeps Apps
  // (last child) rendered in front of the wider tiers beneath it.
  TIERS.forEach((tier) => diagram.append(buildTier(tier)));

  const captionList = createTag('ul', { class: 'layer-stack-captions' });
  // Captions read top-to-bottom (Apps first), mirroring the visual stack
  // and the leader-line order in the source diagram.
  [...TIERS].reverse().forEach((tier) => {
    tier.captions.forEach((caption) => captionList.append(buildCaption(tier, caption)));
  });

  const figure = createTag('div', { class: 'layer-stack-figure' }, [diagram, captionList]);
  block.append(figure);
}
