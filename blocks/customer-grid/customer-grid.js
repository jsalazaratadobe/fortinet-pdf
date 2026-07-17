import { createTag } from '../../scripts/shared.js';

/**
 * Customer Grid block (page 12, one-off).
 *
 * Authoring contract: each authored row is one cell.
 *   | Customer Grid                                   |
 *   | (picture logo)                                  |
 *   | Fortune 100 home improvement retailer...        |
 *   | HQ: N. AMERICA                                   |
 *   | ------------------------------------------------ |
 *   | (picture logo)                                  |
 *   | One of the world's largest multinational...     |
 *   | HQ: N. AMERICA                                   |
 *
 * A row may put everything in one cell (a single-column table) or split
 * logo/caption/HQ across separate cells — both are flattened the same way.
 * The HQ line is detected by its text starting with "HQ:" (case-insensitive)
 * and styled distinctly from the caption. A trailing closing line/paragraph
 * below the grid (e.g. "Visit fortinet.com/customers...") is authored as
 * default section content, not part of this block.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  const ul = createTag('ul', { class: 'customer-grid-list' });

  [...block.children].forEach((row) => {
    const li = createTag('li', { class: 'customer-grid-item' });
    [...row.children].forEach((cell) => {
      while (cell.firstChild) li.append(cell.firstChild);
    });
    if (!li.children.length) {
      while (row.firstChild) li.append(row.firstChild);
    }

    // Logo: pull the picture out into its own wrapper; tolerate a broken
    // or missing image without throwing.
    const picture = li.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.addEventListener('error', () => picture.remove(), { once: true });
      }
      const pictureParent = picture.parentElement;
      const logoWrap = createTag('div', { class: 'customer-grid-logo' });
      logoWrap.append(picture);
      li.prepend(logoWrap);
      // Drop the now-empty <p> that used to wrap the picture, if any.
      if (pictureParent && pictureParent !== li && !pictureParent.textContent.trim()
        && !pictureParent.children.length) {
        pictureParent.remove();
      }
    }

    // Remaining text: classify each paragraph as the HQ tag or the caption.
    // (The logo picture was already relocated above, so no <p> here still
    // wraps an image.)
    [...li.querySelectorAll('p')].forEach((p) => {
      const text = p.textContent.trim();
      if (!text) {
        p.remove();
      } else if (/^hq:/i.test(text)) {
        p.classList.add('customer-grid-hq');
      } else {
        p.classList.add('customer-grid-caption');
      }
    });

    ul.append(li);
  });

  block.replaceChildren(ul);
}
