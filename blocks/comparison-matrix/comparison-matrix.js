/*
 * Comparison Matrix block
 *
 * Renders a row-labeled, N-column comparison table where each column has a
 * colored header banner (cycling brand colors), e.g. "How Fortinet Delivers"
 * vs. "Impact" vs. "Proven Results" across "More Secure and Reliable" /
 * "Reduce Costs" / "Simplify Operations".
 *
 * AUTHORING CONTRACT
 * -------------------
 * The block is authored as a simple grid of rows/cells (standard EDS table
 * markup: each row is a <div>, each cell inside it is a <div>).
 *
 * - Every row has the SAME number of cells: 1 (label column) + N (option
 *   columns) = N+1 cells total.
 * - Row 1 (the FIRST row) is the header row:
 *     - cell 1 is left empty (it sits above the row-label column, which has
 *       no banner of its own) — content here is ignored.
 *     - cells 2..N+1 become the colored column banners. Each header cell may
 *       contain, in any combination:
 *         - an icon: an inline <svg> or <picture> (optional)
 *         - a title: wrap it in <strong> if the cell has other text too;
 *           otherwise plain text/first paragraph is used as the title
 *         - a subtitle: any additional paragraph(s), rendered under the title
 *       Example (simple 3-col matrix): cell text is just "Reduce Costs".
 *       Example (FortiAI 4-col matrix): cell contains an <svg> icon, a
 *       "<p><strong>FortiGuard Labs</strong></p>", and a
 *       "<p>Event Process and Verdict, Threat Intelligence</p>".
 * - Every subsequent row is a data row:
 *     - cell 1 is the row label (e.g. "How Fortinet Delivers", "Impact",
 *       "Proven Results", "Features", "Values") — plain text.
 *     - cells 2..N+1 are that row's content for each column. Content is used
 *       as-authored (paragraphs, <ul> bullet lists, links, etc. all pass
 *       through untouched).
 *     - A bare bolded number in its own paragraph (e.g. "<p><strong>65%</strong></p>")
 *       is automatically styled as a large stat callout — no extra markup
 *       needed beyond bolding the whole paragraph.
 *
 * Modifiers:
 * - `.compact` — denser spacing/smaller type for tighter layouts.
 *
 * PLAIN / ICON-HEADER VARIANT (auto-detected)
 * --------------------------------------------
 * Some matrices (e.g. the FortiAI matrix) are authored with plain-text
 * header cells shaped like "Name (Caption, Subtitle)" and no explicit icon
 * markup. When a header cell's text matches that shape, it is rendered as a
 * flat header (no colored banner background) with an auto-picked round
 * icon, a small caption line, and a bold subtitle line — matching the
 * source brochure's FortiAI matrix styling — instead of the solid-color
 * banner used for the classic 3-column matrices. The whole matrix switches
 * to this style (adds an `icon-header` modifier class to the block) as soon as
 * one header cell matches, since a matrix mixes one style or the other.
 */

import { createTag } from '../../scripts/shared.js';

// Classic matrices (page 7) all use the same solid brand-blue banner across
// every column (sampled from the source brochure), not a cycling palette.
const BANNER_COLOR = '#4d7bc7';

// Round auto-icons for the plain/icon-header variant, keyed by a lowercase
// substring match against the header title. Colors sampled from the source
// FortiAI matrix (page 8).
const PLAIN_ICONS = [
  {
    match: /fortiguard/,
    color: '#1a9b6a',
    svg: '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><path d="M9 12.2l1.8 1.8L15 10"/>',
  },
  {
    match: /assist/,
    color: '#4fa5cc',
    svg: '<circle cx="12" cy="11" r="6"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/><path d="M9 14.2c.8.6 1.9.9 3 .9s2.2-.3 3-.9M12 5V3M9 3.6l.7 1.3M15 3.6l-.7 1.3"/>',
  },
  {
    match: /secure/,
    color: '#3a7fc4',
    svg: '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><rect x="9.4" y="11.3" width="5.2" height="4.2" rx="0.8"/><path d="M10.4 11.3v-1.4a1.6 1.6 0 0 1 3.2 0v1.4"/>',
  },
  {
    match: /protect/,
    color: '#1a9b6a',
    svg: '<path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z"/><path d="M8.7 13.4a2.1 2.1 0 0 1 .5-4.1 2.6 2.6 0 0 1 5 .3 1.9 1.9 0 0 1-.3 3.8z"/>',
  },
];
const DEFAULT_PLAIN_ICON = {
  color: '#1c2b4a',
  svg: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
};

function plainIconFor(titleText) {
  const lower = titleText.toLowerCase();
  return PLAIN_ICONS.find((i) => i.match.test(lower)) || DEFAULT_PLAIN_ICON;
}

function buildPlainIcon(titleText) {
  const { color, svg } = plainIconFor(titleText);
  const wrap = createTag('div', { class: 'comparison-matrix-banner-icon comparison-matrix-banner-icon-plain' });
  wrap.style.setProperty('--comparison-matrix-icon-color', color);
  wrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${svg}</svg>`;
  return wrap;
}

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

// Matches plain-text headers shaped like "Name (Caption, Subtitle)" or
// "Name (Caption)", used by matrices authored without explicit icon markup.
const PLAIN_HEADER_RE = /^(.+?)\s*\(([^()]+)\)\s*$/;

function buildBanner(cell) {
  const banner = createTag('div', { class: 'comparison-matrix-banner' });
  banner.style.setProperty('--comparison-matrix-banner-color', BANNER_COLOR);

  if (!cell) return { banner, isPlain: false };

  const icon = cell.querySelector('svg, picture');
  const rawTitle = cellText(cell);
  const plainMatch = !icon && rawTitle.match(PLAIN_HEADER_RE);

  if (plainMatch) {
    banner.classList.add('comparison-matrix-banner-plain');
    const [, titleText, parenthetical] = plainMatch;
    const commaSplit = parenthetical.split(/,(.+)/s);
    const captionText = commaSplit[0].trim();
    const subtitleText = commaSplit[1]?.trim();

    banner.append(buildPlainIcon(titleText));
    const textWrap = createTag('div', { class: 'comparison-matrix-banner-text' });
    textWrap.append(createTag('p', { class: 'comparison-matrix-banner-title' }, titleText));
    if (subtitleText) {
      textWrap.append(createTag('p', { class: 'comparison-matrix-banner-caption' }, captionText));
      textWrap.append(createTag('p', { class: 'comparison-matrix-banner-subtitle' }, subtitleText));
    } else if (captionText) {
      textWrap.append(createTag('p', { class: 'comparison-matrix-banner-subtitle' }, captionText));
    }
    banner.append(textWrap);
    return { banner, isPlain: true };
  }

  if (icon) {
    const iconWrap = createTag('div', { class: 'comparison-matrix-banner-icon' });
    iconWrap.append(icon);
    banner.append(iconWrap);
  }

  const paragraphs = [...cell.querySelectorAll('p')];
  const strong = cell.querySelector('strong');
  const titleParagraph = strong ? strong.closest('p') : paragraphs[0];
  const titleText = strong ? strong.textContent.trim() : (paragraphs[0]?.textContent.trim() || rawTitle);

  if (titleText) {
    banner.append(createTag('p', { class: 'comparison-matrix-banner-title' }, titleText));
  }

  const subtitleText = paragraphs
    .filter((p) => p !== titleParagraph)
    .map((p) => p.textContent.trim())
    .filter(Boolean)
    .join(' · ');
  if (subtitleText) {
    banner.append(createTag('p', { class: 'comparison-matrix-banner-subtitle' }, subtitleText));
  }

  return { banner, isPlain: false };
}

// Round icon shown next to the big stat number on a "Proven Results" row,
// matching the source brochure's per-column result icons (OS/ASIC/clipboard/
// cloud/gears), keyed by the column's banner title.
const STAT_ICONS = [
  {
    match: /secure and reliable|easy to adopt/,
    svg: '<circle cx="12" cy="12" r="8"/><rect x="9" y="9" width="2.6" height="2.6"/><rect x="12.4" y="9" width="2.6" height="2.6"/><rect x="9" y="12.4" width="2.6" height="2.6"/><rect x="12.4" y="12.4" width="2.6" height="2.6"/>',
  },
  {
    match: /reduce costs/,
    svg: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.2"/><rect x="9.7" y="9.7" width="4.6" height="4.6"/><path d="M9 3.3v3.2M15 3.3v3.2M9 17.5v3.2M15 17.5v3.2M3.3 9h3.2M3.3 15h3.2M17.5 9h3.2M17.5 15h3.2"/>',
  },
  {
    match: /simplify operations/,
    svg: '<rect x="5" y="4" width="14" height="17" rx="1.3"/><path d="M9 4V3h6v1"/><path d="M8 10h8M8 13h8M8 16h5"/>',
  },
  {
    match: /best value and security/,
    svg: '<path d="M7 17a4 4 0 0 1 .5-7.96A5 5 0 0 1 17 10a3.5 3.5 0 0 1-.5 7H7z"/><rect x="9.5" y="11" width="2" height="2"/><rect x="12.5" y="11" width="2" height="2"/>',
  },
  {
    match: /broadest solution/,
    svg: '<circle cx="9" cy="10" r="4"/><circle cx="16" cy="15" r="3"/><path d="M9 6v1.2M9 12.8V14M5.8 10H7M11 10h1.2M6.2 6.8l.9.9M11 13l.9.9M14.6 15v.8M16 11.8v.8M13.4 15h.8M17.6 15h.8"/>',
  },
];

function statIconFor(colTitle) {
  const lower = colTitle.toLowerCase();
  const found = STAT_ICONS.find((i) => i.match.test(lower));
  return found ? found.svg : null;
}

function buildItem(labelText, cell, colTitle) {
  const item = createTag('div', { class: 'comparison-matrix-item' });
  item.append(createTag('div', { class: 'comparison-matrix-item-label' }, labelText));
  const content = createTag('div', { class: 'comparison-matrix-item-content' });
  if (cell) {
    while (cell.firstChild) content.append(cell.firstChild);
  }

  // "Proven Results" rows get a round result icon next to the big stat
  // number, matching the source brochure (OS/ASIC/clipboard/cloud/gears).
  const statSvg = labelText.trim().toLowerCase() === 'proven results' && colTitle
    ? statIconFor(colTitle) : null;
  if (statSvg) {
    content.classList.add('comparison-matrix-item-content-stat');
    const iconWrap = createTag('div', { class: 'comparison-matrix-stat-icon' });
    iconWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${statSvg}</svg>`;
    content.append(iconWrap);
  }

  item.append(content);
  return item;
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [headerRow, ...bodyRows] = rows;
  const headerCells = [...headerRow.children];
  const numCols = Math.max(0, headerCells.length - 1);
  const numRows = Math.max(1, bodyRows.length);

  if (!numCols) return;

  const grid = createTag('div', { class: 'comparison-matrix-grid' });
  grid.style.setProperty('--comparison-matrix-cols', numCols);
  grid.style.setProperty('--comparison-matrix-rows', numRows);

  // Row labels (used both by the dedicated desktop label column and by the
  // inline per-item label shown on mobile).
  const rowLabels = bodyRows.map((row) => cellText(row.children[0]));
  const colTitles = headerCells.slice(1).map((cell) => cellText(cell));

  // Dedicated label column (desktop only; hidden on mobile in favor of the
  // inline label baked into each item).
  const labelColumn = createTag('div', { class: 'comparison-matrix-column comparison-matrix-label-column' });
  labelColumn.append(createTag('div', { class: 'comparison-matrix-banner-spacer' }));
  rowLabels.forEach((labelText) => {
    labelColumn.append(createTag('div', { class: 'comparison-matrix-row-label' }, labelText));
  });
  grid.append(labelColumn);

  // One column per comparison option, built top-to-bottom (banner, then one
  // item per data row) — this DOM order also happens to be exactly the order
  // mobile needs to stack columns vertically.
  let isPlain = false;
  for (let c = 0; c < numCols; c += 1) {
    const column = createTag('div', { class: 'comparison-matrix-column' });
    const { banner, isPlain: colIsPlain } = buildBanner(headerCells[c + 1]);
    if (colIsPlain) isPlain = true;
    column.append(banner);
    bodyRows.forEach((row, r) => {
      column.append(buildItem(rowLabels[r], row.children[c + 1], colTitles[c]));
    });
    grid.append(column);
  }
  block.classList.toggle('icon-header', isPlain);

  block.replaceChildren(grid);
}
