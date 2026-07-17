/*
 * Stat Rail block
 *
 * A full-height red sidebar of financial/company stats (page 2 of the
 * brochure): annual sales, quarterly results, lifetime customer counts,
 * a headcount-by-region table, and footnotes.
 *
 * This is a dense, one-off financial sidebar with many distinct visual
 * sub-sections, so — per project guidance — it uses a small set of explicit
 * row-type keywords rather than trying to infer structure from free-form
 * content. Each authored row is a <div> whose cells are <div>s; the FIRST
 * cell's text is always the row-type keyword (case-insensitive).
 *
 * AUTHORING CONTRACT
 * -------------------
 * | Row type    | Remaining cells                              | Renders                                                    |
 * |-------------|-----------------------------------------------|-------------------------------------------------------------|
 * | `heading`   | 1: heading text                                | A section heading, e.g. "Annual Sales"                       |
 * | `stat`      | pairs of (label, value) cells — see below       | One or more stat blocks (label + big bold value)             |
 * | `divider`   | (none)                                         | A horizontal rule separating sections                        |
 * | `table`     | 3: region (blank = continue previous group),   | One row of the nested "Headcount by Region" table; consecutive|
 * |             |    row label, value                            | `table` rows merge into a single table automatically          |
 * | `footnote`  | 1: footnote text                               | One small footnote line at the bottom (stack several rows)    |
 *
 * `stat` row cell counts:
 * - 2 cells (1 label/value pair) with an EMPTY label -> a single large hero
 *   stat with no visible label (e.g. "" | "900,000+"). Use this when the
 *   preceding `heading` row already names the stat (e.g. "Lifetime Customers").
 * - 4 cells (2 label/value pairs) -> a side-by-side stat pair
 *   (e.g. "Revenue" | "$7.1B" | "Billings" | "$8.0B").
 * - 8 cells (4 label/value pairs) -> a 2x2 stat grid
 *   (e.g. Revenue/Billings/Op. Margin (GAAP)/EPS (GAAP)).
 *
 * `table` rows: a row with row-label "TOTAL" (case-insensitive) is rendered
 * as the bold grand-total line, regardless of its region cell.
 *
 * Example authoring (pipe = cell boundary):
 *   heading  | Annual Sales
 *   stat     | Revenue | $7.1B | Billings | $8.0B
 *   divider
 *   heading  | Q1 2026 Results
 *   stat     | Revenue | $1.85B | Billings | $2.1B | Op. Margin (GAAP) | 31.4% | EPS (GAAP) | $0.72/share
 *   stat     | Cash and Investments | $3.6B | Market Cap | $88.5B
 *   divider
 *   heading  | Lifetime Customers
 *   stat     | | 900,000+
 *   divider
 *   heading  | Cumulative Units Shipped
 *   stat     | | 16.5+ Million
 *   divider
 *   heading  | Headcount by Region
 *   table    | AMERICAS | U.S. | 4,319
 *   table    | | Canada | 2,740
 *   table    | | Rest of Americas | 1,125
 *   table    | EMEA | U.K. | 574
 *   ...
 *   table    | | TOTAL | 15,311
 *   footnote | All information as of 3/31/2026
 *   footnote | Market cap as of 5/14/2026
 *   footnote | Annual sales based on LTM
 */

import { createTag } from '../../scripts/shared.js';

function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function buildStatBlock(label, value) {
  const stat = createTag('div', { class: 'stat-rail-stat' });
  stat.append(createTag('p', { class: 'stat-rail-stat-value' }, value));
  if (label) stat.append(createTag('p', { class: 'stat-rail-stat-label' }, label));
  return stat;
}

function buildStatRow(cells) {
  const values = cells.map((c) => cellText(c));
  let pairs;
  if (values.length <= 1) {
    pairs = [['', values[0] || '']];
  } else {
    pairs = [];
    for (let i = 0; i < values.length; i += 2) {
      pairs.push([values[i] || '', values[i + 1] || '']);
    }
  }

  const row = createTag('div', { class: 'stat-rail-stats' });
  const variant = pairs.length >= 4 ? 'grid' : pairs.length === 2 ? 'pair' : 'hero';
  row.classList.add(`stat-rail-stats-${variant}`);
  pairs.forEach(([label, value]) => row.append(buildStatBlock(label, value)));
  return row;
}

function buildTable(rowsData) {
  const table = createTag('div', { class: 'stat-rail-table' });
  let currentGroup = null;

  rowsData.forEach(({ region, label, value }) => {
    const isTotal = label.toUpperCase() === 'TOTAL';

    if (isTotal) {
      const line = createTag('div', { class: 'stat-rail-table-row stat-rail-table-total' });
      line.append(createTag('span', { class: 'stat-rail-table-label' }, label));
      line.append(createTag('span', { class: 'stat-rail-table-value' }, value));
      table.append(line);
      return;
    }

    if (region) {
      currentGroup = createTag('div', { class: 'stat-rail-table-group' });
      currentGroup.append(createTag('p', { class: 'stat-rail-table-region' }, region));
      table.append(currentGroup);
    }

    const line = createTag('div', { class: 'stat-rail-table-row' });
    line.append(createTag('span', { class: 'stat-rail-table-label' }, label));
    line.append(createTag('span', { class: 'stat-rail-table-value' }, value));
    (currentGroup || table).append(line);
  });

  return table;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const container = createTag('div', { class: 'stat-rail-content' });

  let pendingTableRows = [];
  let footnotesEl = null;

  const flushTable = () => {
    if (pendingTableRows.length) {
      container.append(buildTable(pendingTableRows));
      pendingTableRows = [];
    }
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    const type = cellText(cells[0]).toLowerCase();

    if (type !== 'table') flushTable();

    switch (type) {
      case 'heading':
        container.append(createTag('h3', { class: 'stat-rail-heading' }, cellText(cells[1])));
        break;

      case 'stat':
        container.append(buildStatRow(cells.slice(1)));
        break;

      case 'divider':
        container.append(createTag('hr', { class: 'stat-rail-divider' }));
        break;

      case 'table':
        pendingTableRows.push({
          region: cellText(cells[1]),
          label: cellText(cells[2]),
          value: cellText(cells[3]),
        });
        break;

      case 'footnote':
        if (!footnotesEl) {
          footnotesEl = createTag('div', { class: 'stat-rail-footnotes' });
          container.append(footnotesEl);
        }
        footnotesEl.append(createTag('p', {}, cellText(cells[1])));
        break;

      default:
        // Unknown row type: skip gracefully rather than breaking the rail.
        break;
    }
  });

  flushTable();

  block.replaceChildren(container);
}
