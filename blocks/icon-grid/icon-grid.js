import { createTag } from '../../scripts/shared.js';

/**
 * Generic placeholder icon paths (24x24 viewBox, minimal line style).
 * These stand in for real per-category icons until an author supplies a
 * picture in the first cell of a row — at that point the picture wins
 * (see decorate()) and these are no longer rendered for that item.
 * Cycled by item index purely so a long grid doesn't look like the same
 * glyph repeated; they carry no semantic meaning per category.
 */
const PLACEHOLDER_ICON_PATHS = [
  '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/>', // grid/module
  '<path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7l7-4z"/>', // shield
  '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', // clock/monitoring
  '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>', // case/platform
  '<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/>', // list/access
  '<path d="M12 3v6M12 21v-6M4.2 7.8l5.2 3M14.6 13.2l5.2 3M4.2 16.2l5.2-3M14.6 10.8l5.2-3"/>', // network/mesh
];

function buildPlaceholderIcon(index) {
  const path = PLACEHOLDER_ICON_PATHS[index % PLACEHOLDER_ICON_PATHS.length];
  const wrapper = createTag('div', { class: 'icon-grid-icon-placeholder' });
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
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
 * a generic inline-SVG placeholder icon is rendered instead (swap in a real
 * picture per row whenever per-category icon assets are ready).
 * Second cell: the label text shown under the icon.
 * A single-cell row (just text, no separate icon cell) is also supported —
 * the text is used as the label and a placeholder icon is shown.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const ul = createTag('ul', { class: 'icon-grid-list' });

  [...block.children].forEach((row, idx) => {
    const cells = [...row.children];
    const [iconCell, labelCell] = cells.length >= 2 ? cells : [cells[0], cells[0]];

    const li = createTag('li', { class: 'icon-grid-item' });

    const iconWrap = createTag('div', { class: 'icon-grid-icon' });
    const picture = iconCell?.querySelector('picture');
    if (picture) {
      iconWrap.append(picture);
    } else {
      iconWrap.append(buildPlaceholderIcon(idx));
    }
    li.append(iconWrap);

    const labelText = (labelCell?.textContent || row.textContent || '').trim();
    li.append(createTag('p', { class: 'icon-grid-label' }, labelText));

    ul.append(li);
  });

  block.replaceChildren(ul);
}
