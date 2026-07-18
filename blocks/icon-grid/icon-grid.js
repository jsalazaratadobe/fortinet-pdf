import { createTag } from '../../scripts/shared.js';

/**
 * Category icon glyphs (24x24 viewBox, white line-style, matching the
 * Gartner-category icon tiles on the source brochure page).
 * Matched against an item's label text (case-insensitive, first match wins),
 * so authoring order doesn't matter and new rows still get a sane icon.
 * A generic fallback glyph covers any label that doesn't match a keyword.
 */
const ICON_RULES = [
  {
    // Enterprise Wired and Wireless Infrastructure
    test: /wired|wireless|infrastructure/i,
    path: '<circle cx="4" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M7.2 8.6a5 5 0 0 1 0 6.8"/><path d="M10 6a9 9 0 0 1 0 12"/><path d="M12.8 3.4a13 13 0 0 1 0 17.2"/>',
  },
  {
    // Endpoint Protection Platforms
    test: /endpoint/i,
    path: '<rect x="2" y="4" width="13" height="9" rx="1"/><path d="M6 17h5M8.5 13v4"/><path d="M9.2 6.3l1.6-.8 1.6.8v1.7c0 1.5-.7 2.3-1.6 2.7-.9-.4-1.6-1.2-1.6-2.7V6.3z"/><path d="M17 10l2-1 2 1v2.6c0 1.9-1 2.9-2 3.4-1-.5-2-1.5-2-3.4V10z"/>',
  },
  {
    // SIEM
    test: /\bsiem\b/i,
    path: '<circle cx="12" cy="12" r="3.4"/><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none"/><path d="M12 3.2v3M12 17.8v3M3.2 12h3M17.8 12h3M5.9 5.9l2.1 2.1M16 16l2.1 2.1M5.9 18.1l2.1-2.1M16 8l2.1-2.1"/>',
  },
  {
    // Data Center Switching
    test: /data center|switching/i,
    path: '<ellipse cx="9.5" cy="5.2" rx="5.5" ry="2"/><path d="M4 5.2v5.4c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2V5.2"/><path d="M4 10.6V16c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-5.4"/><circle cx="18" cy="17.5" r="3"/><path d="M18 16.2v2.6M16.7 17.5h2.6"/>',
  },
  {
    // Security Service Edge
    test: /security service edge/i,
    path: '<rect x="2" y="3" width="11" height="11" rx="1"/><path d="M2 8.5h11M7.5 3v11"/><circle cx="16.5" cy="16.5" r="5.7"/><path d="M10.8 16.5h11.4M16.5 10.8v11.4M12.9 12.9a8 8 0 0 0 0 7.2M20.1 12.9a8 8 0 0 1 0 7.2"/>',
  },
  {
    // Hybrid Mesh Firewall
    test: /firewall/i,
    path: '<rect x="2" y="4" width="20" height="16" rx="1"/><path d="M2 9.3h8.5M12.8 9.3h9.2M6 4v5.3M17.5 9.3v5.3M2 14.7h5M9.2 14.7h9M14.5 14.7v5.3"/>',
  },
  {
    // SASE Platforms
    test: /sase/i,
    path: '<circle cx="12" cy="12" r="2.1"/><circle cx="12" cy="4.6" r="1.5"/><circle cx="18.4" cy="8.3" r="1.5"/><circle cx="18.4" cy="15.7" r="1.5"/><circle cx="12" cy="19.4" r="1.5"/><circle cx="5.6" cy="15.7" r="1.5"/><circle cx="5.6" cy="8.3" r="1.5"/><path d="M12 6.7v3.2M16.6 8.9l-2.6 1.8M16.6 15.1l-2.6-1.8M12 17.3v-3.2M7.4 15.1l2.6-1.8M7.4 8.9l2.6 1.8"/>',
  },
  {
    // Access Management (not privileged)
    test: /^access management$|(?<!privileged )access management/i,
    path: '<path d="M9 2.2v2M15 2.2v2"/><rect x="5" y="4.2" width="14" height="17.6" rx="2"/><circle cx="12" cy="11" r="2.4"/><path d="M8.1 17.8c0-2.1 1.7-3.3 3.9-3.3s3.9 1.2 3.9 3.3"/>',
  },
  {
    // Privileged Access Management (source brochure pairs this with an
    // envelope+lock glyph, not the expected badge icon)
    test: /privileged access/i,
    path: '<rect x="2" y="5.2" width="16" height="12" rx="1"/><path d="M2 6.2l8 6 8-6"/><rect x="14.2" y="12" width="8" height="7" rx="1"/><path d="M15.9 12v-1.9a2.1 2.1 0 0 1 4.2 0V12"/>',
  },
  {
    // Email Security Platforms (source brochure pairs this with a
    // monitor + person + lock glyph, not an envelope)
    test: /email security/i,
    path: '<rect x="2" y="4" width="13.5" height="10.4" rx="1"/><path d="M6 17.6h5.5"/><circle cx="8.7" cy="7.9" r="1.7"/><path d="M5.8 12c0-1.6 1.4-2.5 2.9-2.5s2.9.9 2.9 2.5"/><rect x="16" y="9.2" width="7" height="6" rx="1"/><path d="M17.5 9.2V7.6a1.7 1.7 0 0 1 3.4 0v1.6"/>',
  },
  {
    // Cyber-Physical Systems Protection Platforms (CPS PP)
    test: /cyber-physical|cps/i,
    path: '<circle cx="17.2" cy="5.2" r="2"/><path d="M17.2 7.2v2.8l-3.8 2.8"/><circle cx="13" cy="13.2" r="1.6"/><path d="M13 14.8L9.2 18"/><circle cx="9.2" cy="18" r="1.4"/><path d="M6.2 21h6"/>',
  },
];

const DEFAULT_ICON_PATH = '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>';

function pathForLabel(label) {
  const match = ICON_RULES.find(({ test }) => test.test(label));
  return match ? match.path : DEFAULT_ICON_PATH;
}

function buildIcon(label) {
  const wrapper = createTag('div', { class: 'icon-grid-icon-placeholder' });
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${pathForLabel(label)}</svg>`;
  return wrapper;
}

/**
 * Icon Grid block.
 *
 * Authoring contract: each authored row is one item.
 *   | Icon Grid                                        |
 *   | (picture)          | Enterprise Wired and Wireless Infrastructure |
 *   | (picture)          | Endpoint Protection Platforms                |
 *   | ...                | ...                                          |
 *
 * First cell: an image/picture for the item's icon. Optional — if omitted,
 * an inline-SVG icon is chosen by matching the label text against a set of
 * category keywords (see ICON_RULES above), falling back to a generic glyph
 * when nothing matches. Swap in a real picture per row any time a bespoke
 * icon asset is ready; it always wins over the keyword-matched glyph.
 * Second cell: the label text shown next to the icon.
 * A single-cell row (just text, no separate icon cell) is also supported —
 * the text is used as the label and a keyword-matched icon is shown.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const ul = createTag('ul', { class: 'icon-grid-list' });

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [iconCell, labelCell] = cells.length >= 2 ? cells : [cells[0], cells[0]];

    const li = createTag('li', { class: 'icon-grid-item' });

    const labelText = (labelCell?.textContent || row.textContent || '').trim();

    const iconWrap = createTag('div', { class: 'icon-grid-icon' });
    const picture = iconCell?.querySelector('picture');
    if (picture) {
      iconWrap.append(picture);
    } else {
      iconWrap.append(buildIcon(labelText));
    }
    li.append(iconWrap);

    li.append(createTag('p', { class: 'icon-grid-label' }, labelText));

    ul.append(li);
  });

  block.replaceChildren(ul);
}
