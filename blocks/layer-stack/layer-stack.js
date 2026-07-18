import { createTag } from '../../scripts/shared.js';

/**
 * Layer Stack diagram (page 9, one-off illustrative diagram).
 *
 * Like concentric-rings, this is a fixed illustration ("Protecting AI
 * Infrastructure, Applications, Data, and Users") and does not read
 * authored content: decorate() clears the block (authoring contract is an
 * empty block) and builds the DOM from the hardcoded data below.
 */

// Colored "badge" icons matching the source brochure (filled shield/lock/
// firewall/chip/gear glyphs with their own baked-in colors), rather than
// plain single-color stroke outlines.
const ICONS = {
  // Green shield with two dots (Apps)
  shield: '<path d="M12 2.5l7.5 2.8v5.6c0 5.4-3.2 9-7.5 10.6-4.3-1.6-7.5-5.2-7.5-10.6V5.3z" fill="#1a9b6a"/>'
    + '<circle cx="12" cy="9.2" r="1.3" fill="#fff"/><circle cx="12" cy="13.6" r="1.3" fill="#fff"/>',
  // Blue padlock (AI Models)
  lock: '<path d="M8.3 10.2V8a3.7 3.7 0 1 1 7.4 0v2.2" fill="none" stroke="#2f7fd0" stroke-width="1.8"/>'
    + '<rect x="6.3" y="10.2" width="11.4" height="9.6" rx="1.8" fill="#2f7fd0"/>'
    + '<circle cx="12" cy="14" r="1.3" fill="#fff"/><rect x="11.3" y="14.6" width="1.4" height="2.6" fill="#fff"/>',
  // Red firewall (brick pattern + flame) badge (Infrastructure)
  firewall: '<rect x="3" y="3" width="18" height="18" rx="2" fill="#d3312c"/>'
    + '<g stroke="#a3221e" stroke-width="0.9"><path d="M3 8.5h18M3 13h18M3 17.5h18M8 3v5.5M14 8.5v4.5M8 13v4.5M14 17.5v3.5"/></g>'
    + '<circle cx="12" cy="12" r="5.4" fill="#fff"/>'
    + '<path d="M12 8c1.6 2 .4 2.8.4 4.3a1.9 1.9 0 1 0 3.8 0c0-.5-.1-1-.4-1.4.1.5 0 1-.3 1.4a2.9 2.9 0 0 1-5.3-1.7c0-2.3 1.8-2.9 1.8-4.4z" fill="#d3312c"/>',
  // Small red exchange/switch icon (second Infrastructure icon: FortiSwitch)
  switch: '<path d="M6 8h11M17 8l-2.6-2.6M17 8l-2.6 2.6M18 16H7M7 16l2.6-2.6M7 16l2.6 2.6" fill="none" stroke="#d3312c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  // Red ASIC chip badge (Chips)
  asic: '<rect x="4.5" y="4.5" width="15" height="15" rx="1.6" fill="#d3312c"/>'
    + '<path d="M8 4.5V2.7M12 4.5V2.7M16 4.5V2.7M8 21.3v-1.8M12 21.3v-1.8M16 21.3v-1.8M4.5 8H2.7M4.5 12H2.7M4.5 16H2.7M21.3 8h-1.8M21.3 12h-1.8M21.3 16h-1.8" stroke="#d3312c" stroke-width="1.2"/>'
    + '<rect x="7.2" y="7.5" width="4.2" height="3.4" fill="#fff"/>'
    + '<text x="15.6" y="17" font-size="5.6" font-weight="700" text-anchor="middle" fill="#fff" font-family="sans-serif">ASIC</text>',
  // Outlined gray-blue gear (Energy)
  gear: '<circle cx="12" cy="12" r="9.2" fill="none" stroke="#7a99b8" stroke-width="1.3"/>'
    + '<path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" stroke="#7a99b8" stroke-width="1.3" stroke-linecap="round"/>'
    + '<circle cx="12" cy="12" r="4.2" fill="none" stroke="#7a99b8" stroke-width="1.1"/>'
    + '<rect x="10.2" y="10.2" width="3.6" height="3.6" fill="#7a99b8"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
}

// Bottom-to-top order, matching the visual stack (Energy = base/largest,
// Apps = top/smallest). Each tier lists the leader-line row(s) it points
// to. A row's `text` may be a single line or (like Apps) an array of two
// lines sharing one icon and one leader line, matching the source diagram.
const TIERS = [
  {
    id: 'energy',
    label: 'Energy',
    captions: [{
      icons: ['gear'],
      text: 'OT security: Fortinet is the only three-time Westlands Advisory IT/OT Cybersecurity Platform Navigator 2025 Leader, with OT billings over 70% year-over-year (YoY).',
    }],
  },
  {
    id: 'chips',
    label: 'Chips',
    captions: [{
      icons: ['asic'],
      text: 'Fortinet: The only cybersecurity company with a custom ASIC. Strategic partner with NVIDIA.',
    }],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    // Two icons on this one leader line: the firewall badge (FortiGate) and
    // a small exchange/switch icon (FortiSwitch), matching the source.
    captions: [{ icons: ['firewall', 'switch'], text: 'FortiGate and FortiSwitch' }],
  },
  {
    id: 'ai-models',
    label: 'AI Models',
    captions: [{ icons: ['lock'], text: 'FortiAI-Secure and FortiAIGate' }],
  },
  {
    id: 'apps',
    label: 'Apps',
    // One leader line/icon shared by two stacked lines of text, matching
    // the source (not two separate icon rows).
    captions: [{
      icons: ['shield'],
      text: ['FortiAI-Protect and FortiGuard Services', 'FortiSASE and FortiEndpoint'],
    }],
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
  const iconsHtml = caption.icons.map((name) => `<span class="layer-stack-caption-icon">${icon(name)}</span>`).join('');
  const lines = Array.isArray(caption.text) ? caption.text : [caption.text];
  const textHtml = lines.map((line) => `<p class="layer-stack-caption-text">${line}</p>`).join('');
  li.innerHTML = `<span class="layer-stack-caption-leader" aria-hidden="true"></span><span class="layer-stack-caption-icons">${iconsHtml}</span><span class="layer-stack-caption-text-wrap">${textHtml}</span>`;
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
