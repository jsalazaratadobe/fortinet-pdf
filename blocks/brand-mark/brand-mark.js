/*
 * Brand Mark block — the "FORTINET" wordmark lockup on the brochure cover.
 *
 * This used to be a hand-authored inline <svg> sitting directly in default
 * content. DA's authoring pipeline escapes/mangles raw inline SVG markup
 * placed in plain content (it isn't a recognized image/block shape), so it
 * rendered as literal text once authored in DA. Moving it into a block
 * fixes that: blocks build their DOM at render time via JS, so the SVG is
 * never round-tripped through DA's content model as stored markup.
 *
 * Authoring contract: empty block, e.g. `| brand-mark |` with no content —
 * decorate() ignores any authored content and renders the fixed lockup.
 */
export default async function decorate(block) {
  block.innerHTML = `
    <svg viewBox="0 0 260 40" width="150" height="23" role="img" aria-label="Fortinet">
      <text x="0" y="30" font-family="Arial, sans-serif" font-weight="800" font-size="30" fill="#1a1a1a">F</text>
      <circle cx="46" cy="18" r="15" fill="none" stroke="#e5262a" stroke-width="3"></circle>
      <rect x="38" y="10" width="7" height="6" rx="2" fill="#e5262a"></rect>
      <rect x="48" y="10" width="7" height="6" rx="2" fill="#e5262a"></rect>
      <rect x="38" y="20" width="7" height="6" rx="2" fill="#e5262a"></rect>
      <rect x="48" y="20" width="7" height="6" rx="2" fill="#e5262a"></rect>
      <text x="66" y="30" font-family="Arial, sans-serif" font-weight="800" font-size="30" fill="#1a1a1a">RTINET</text>
    </svg>
  `;
}
