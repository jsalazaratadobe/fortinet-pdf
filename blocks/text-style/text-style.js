/*
 * Text Style block.
 *
 * Small one-off text treatments (eyebrow, tagline, caption, source citation,
 * legal fine print, partner-logo row) that used to be authored as a plain
 * `<p class="...">` with a bespoke class. DA's authoring pipeline strips any
 * custom class off default-content elements (only block wrapper divs keep
 * their classes), so those treatments silently lost their styling once the
 * page was authored in DA instead of hand-written as static HTML.
 *
 * This block exists purely so the styling hook survives: the variant
 * (eyebrow-right | tagline | caption | source | legal | partner-logos) is a
 * modifier class on the block itself (e.g. "text-style (caption)"), which
 * DOES survive DA's pipeline, and CSS targets `.text-style.<variant>`.
 *
 * Authoring contract: a single row with a single cell containing the text.
 */
export default async function decorate(block) {
  const text = block.textContent.trim();
  block.textContent = '';
  const p = document.createElement('p');
  p.textContent = text;
  block.append(p);
}
