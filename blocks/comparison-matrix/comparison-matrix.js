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
 */

import { createTag } from '../../scripts/shared.js';

const BANNER_COLORS = ['#e5262a', '#4fa5cc', '#1a9b8f', '#1c2b4a'];

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function buildBanner(cell, idx) {
  const banner = createTag('div', { class: 'comparison-matrix-banner' });
  banner.style.setProperty('--comparison-matrix-banner-color', BANNER_COLORS[idx % BANNER_COLORS.length]);

  if (!cell) return banner;

  const icon = cell.querySelector('svg, picture');
  if (icon) {
    const iconWrap = createTag('div', { class: 'comparison-matrix-banner-icon' });
    iconWrap.append(icon);
    banner.append(iconWrap);
  }

  const paragraphs = [...cell.querySelectorAll('p')];
  const strong = cell.querySelector('strong');
  const titleParagraph = strong ? strong.closest('p') : paragraphs[0];
  const titleText = strong ? strong.textContent.trim() : (paragraphs[0]?.textContent.trim() || cellText(cell));

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

  return banner;
}

function buildItem(labelText, cell) {
  const item = createTag('div', { class: 'comparison-matrix-item' });
  item.append(createTag('div', { class: 'comparison-matrix-item-label' }, labelText));
  const content = createTag('div', { class: 'comparison-matrix-item-content' });
  if (cell) {
    while (cell.firstChild) content.append(cell.firstChild);
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
  for (let c = 0; c < numCols; c += 1) {
    const column = createTag('div', { class: 'comparison-matrix-column' });
    column.append(buildBanner(headerCells[c + 1], c));
    bodyRows.forEach((row, r) => {
      column.append(buildItem(rowLabels[r], row.children[c + 1]));
    });
    grid.append(column);
  }

  block.replaceChildren(grid);
}
