import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  createTag,
  fetchQueryIndexAll,
  getAuthoredLinks,
  normalizePath,
  resolveArticlesFromIndex,
  isUE,
} from '../../scripts/shared.js';

function buildLinksCard(article) {
  const href = normalizePath(article.path);
  const li = createTag('li');
  const link = createTag('a', { href, class: 'cards-card-link' });

  if (article.image) {
    const imageDiv = createTag('div', { class: 'cards-card-image' });
    imageDiv.append(createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]));
    link.append(imageDiv);
  }

  const body = createTag('div', { class: 'cards-card-body' });
  body.append(createTag('p', {}, createTag('strong', {}, article.title || href)));
  if (article.description) {
    body.append(createTag('p', {}, article.description));
  }
  link.append(body);
  li.append(link);

  return li;
}

/**
 * Decorate "cards links" variant: fetch index, match paths, render cards.
 */
async function decorateLinks(block) {
  const authoredLinks = getAuthoredLinks(block);
  if (!authoredLinks.length) {
    block.textContent = '';
    block.append(createTag('p', { class: 'cards-links-empty' }, 'No links provided.'));
    return;
  }

  let indexRows = [];
  try {
    indexRows = await fetchQueryIndexAll();
  } catch {
    indexRows = [];
  }

  const articles = resolveArticlesFromIndex(authoredLinks, indexRows);

  const ul = createTag('ul');
  articles.forEach((article) => ul.append(buildLinksCard(article)));
  block.replaceChildren(ul);
}

/**
 * Decorate bento-grid cards variant.
 * Each authored row becomes a card. The first <p> in each card is treated
 * as a tag/label (e.g. "// Knowledge Base v1.0"), and the first card is
 * marked as the featured (primary) card.
 */
function decorateBento(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row, idx) => {
    const li = createTag('li');
    if (idx === 0) li.classList.add('cards-card-featured');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Unwrap the single wrapper div if present
    const wrapper = li.firstElementChild;
    if (wrapper && wrapper.tagName === 'DIV' && li.children.length === 1) {
      while (wrapper.firstChild) li.append(wrapper.firstChild);
      wrapper.remove();
    }

    // Separate image into its own wrapper (consistent with default cards)
    const picture = li.querySelector('picture');
    if (picture) {
      const imageDiv = createTag('div', { class: 'cards-card-image' });
      const pictureParent = picture.parentElement;
      imageDiv.append(picture);
      li.prepend(imageDiv);
      if (pictureParent && pictureParent.tagName === 'A' && !pictureParent.children.length) {
        pictureParent.remove();
      }
    } else {
      li.classList.add('cards-card-text-only');
    }

    // Find and mark the tag/label (first <p> that looks like a category tag)
    const firstP = li.querySelector('p');
    if (firstP && !firstP.querySelector('picture') && !firstP.classList.contains('button-container')) {
      firstP.classList.add('cards-card-tag');
    }

    // Wrap remaining non-image content in a body div
    const body = createTag('div', { class: 'cards-card-body' });
    [...li.children].forEach((child) => {
      if (!child.classList.contains('cards-card-image')) body.append(child);
    });
    li.append(body);

    ul.append(li);
  });

  block.replaceChildren(ul);
}

/**
 * Decorate regular cards (authored rows with image + body).
 */
function decorateDefault(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row) => {
    const li = createTag('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    const content = li.firstElementChild;
    if (content?.children?.length > 1) {
      const imageEl = [...content.children].find((el) => el.querySelector('picture'));
      if (imageEl) {
        const picture = imageEl.querySelector('picture');
        const imageDiv = createTag('div', { class: 'cards-card-image' });
        if (picture) imageDiv.append(picture);
        const bodyDiv = createTag('div', { class: 'cards-card-body' });
        [...content.children].forEach((el) => { if (el !== imageEl) bodyDiv.append(el); });
        li.replaceChildren(imageDiv, bodyDiv);
      } else {
        content.className = 'cards-card-body';
      }
    } else {
      [...li.children].forEach((div) => {
        div.className = (div.children.length === 1 && div.querySelector('picture'))
          ? 'cards-card-image' : 'cards-card-body';
      });
    }

    const linkEl = li.querySelector('.cards-card-image a[href]') || li.querySelector('.cards-card-body a[href]');
    if (linkEl) {
      if (isUE) {
        // In UE: use a <div> wrapper so the authored <a> (with its href) is preserved
        const wrapper = createTag('div', { class: 'cards-card-link' });
        while (li.firstChild) wrapper.append(li.firstChild);
        li.append(wrapper);
        //Remove the button class from the link and button-container class from the parent
        const parent = linkEl.parentElement;
        if (parent) {
          parent.classList.remove('button-container');
        }
        linkEl.classList.remove('button');
       } else {
        const wrapper = createTag('a', {
          href: linkEl.getAttribute('href'),
          title: linkEl.getAttribute('title')?.trim() || undefined,
          class: 'cards-card-link',
        });
        while (li.firstChild) wrapper.append(li.firstChild);
        li.append(wrapper);
        linkEl.replaceWith(...linkEl.childNodes);
        li.querySelectorAll('.cards-card-body a[href]').forEach((a) => a.replaceWith(...a.childNodes));
      }
    }

    const article = createTag('article');
    while (li.firstChild) article.append(li.firstChild);
    li.append(article);

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (picture) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
    }
  });

  block.replaceChildren(ul);
}

function decorateCarousel(block) {
  decorateDefault(block);

  const ul = block.querySelector('ul');
  if (!ul) return;

  ul.classList.add('cards-carousel-track');

  const nav = createTag('div', { class: 'cards-carousel-nav' });
  const prevBtn = createTag('button', { class: 'cards-carousel-prev', 'aria-label': 'Previous' });
  prevBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
  const progress = createTag('div', { class: 'cards-carousel-progress' });
  const progressBar = createTag('div', { class: 'cards-carousel-progress-bar' });
  progress.append(progressBar);
  const nextBtn = createTag('button', { class: 'cards-carousel-next', 'aria-label': 'Next' });
  nextBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';
  nav.append(prevBtn, progress, nextBtn);
  block.append(nav);

  function scroll(direction) {
    const card = ul.querySelector('li');
    if (!card) return;
    const scrollAmount = card.offsetWidth + parseInt(getComputedStyle(ul).gap, 10) || 24;
    ul.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', () => scroll(-1));
  nextBtn.addEventListener('click', () => scroll(1));

  function updateNav() {
    prevBtn.disabled = ul.scrollLeft <= 0;
    nextBtn.disabled = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 1;
    const maxScroll = ul.scrollWidth - ul.clientWidth;
    const pct = maxScroll > 0 ? ((ul.scrollLeft + ul.clientWidth) / ul.scrollWidth) * 100 : 100;
    progressBar.style.width = `${pct}%`;
  }

  ul.addEventListener('scroll', updateNav);
  new ResizeObserver(updateNav).observe(ul);
  updateNav();
}

function decorateTestimonial(block) {
  const stories = [...block.children];
  const container = createTag('div', { class: 'testimonial-container' });

  const slides = stories.map((row) => {
    const slide = createTag('div', { class: 'testimonial-slide' });
    const cols = [...row.children];
    const textCol = cols[0];

    const title = textCol?.querySelector('strong');
    const paragraphs = textCol?.querySelectorAll('p') || [];
    const quoteP = [...paragraphs].find((p) => p.querySelector('em') || (p.textContent.startsWith('"') && !p.querySelector('a') && !p.querySelector('strong')));
    const attrP = [...paragraphs].find((p) => p.querySelector('em'));
    const linkP = [...paragraphs].find((p) => p.querySelector('a'));

    const content = createTag('div', { class: 'testimonial-content' });
    if (title) {
      const h3 = createTag('h3');
      h3.textContent = title.textContent;
      content.append(h3);
    }
    if (linkP) {
      const cta = createTag('div', { class: 'testimonial-cta' });
      const a = linkP.querySelector('a');
      if (a) {
        const link = createTag('a', { href: a.href, class: 'testimonial-link' });
        link.textContent = a.textContent;
        cta.append(link);
      }
      content.append(cta);
    }

    const quote = createTag('div', { class: 'testimonial-quote' });
    if (quoteP) {
      const q = createTag('p');
      q.textContent = quoteP.textContent;
      quote.append(q);
    }
    if (attrP) {
      const attr = createTag('p', { class: 'testimonial-attribution' });
      attr.innerHTML = attrP.innerHTML;
      quote.append(attr);
    }
    content.append(quote);
    const imgCol = cols[1];
    const imgPanel = createTag('div', { class: 'testimonial-image' });
    const picture = imgCol?.querySelector('picture');
    if (picture) {
      imgPanel.append(picture);
    }
    slide.append(content, imgPanel);

    return slide;
  });

  slides.forEach((slide, i) => {
    if (i === 0) slide.classList.add('active');
    container.append(slide);
  });

  const logos = createTag('div', { class: 'testimonial-logos' });
  stories.forEach((row, i) => {
    const btn = createTag('button', { class: 'testimonial-logo-btn', 'aria-label': `Story ${i + 1}` });
    const title = row.querySelector('strong');
    if (title) {
      const name = title.textContent.split(/\s+(Boosts|Streamlines|Provides|Enhances|Leading)/)[0].trim();
      btn.textContent = name;
    }
    if (i === 0) btn.classList.add('active');
    btn.addEventListener('click', () => {
      container.querySelector('.testimonial-slide.active')?.classList.remove('active');
      logos.querySelector('.testimonial-logo-btn.active')?.classList.remove('active');
      slides[i].classList.add('active');
      btn.classList.add('active');
    });
    logos.append(btn);
  });

  const cta = createTag('div', { class: 'testimonial-footer' });
  const exploreBtn = createTag('a', { href: '/customers', class: 'button primary' });
  exploreBtn.textContent = 'Explore All Customer Stories';
  cta.append(exploreBtn);

  block.replaceChildren(container, logos, cta);
}

function decorateFlip(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row) => {
    const li = createTag('li');
    const cols = [...row.children];
    const imgCol = cols.find((c) => c.querySelector('picture'));
    const textCol = cols.find((c) => c.querySelector('h3'));

    const front = createTag('div', { class: 'cards-flip-front' });
    const back = createTag('div', { class: 'cards-flip-back' });

    if (imgCol) {
      const picture = imgCol.querySelector('picture');
      if (picture) front.append(picture);
    }

    const h3 = textCol?.querySelector('h3');
    if (h3) {
      const title = createTag('h3');
      title.textContent = h3.textContent;
      front.append(title);

      const backTitle = createTag('h3');
      backTitle.textContent = h3.textContent;
      back.append(backTitle);
    }

    const desc = textCol?.querySelector('p');
    if (desc) back.append(desc);

    const list = textCol?.querySelector('ul');
    if (list) back.append(list);

    li.append(front, back);
    ul.append(li);
  });

  block.replaceChildren(ul);
}

function decorateHeader(block) {
  const ul = createTag('ul');
  const colors = ['#da291c', '#1a1a1a', '#1a6fbf', '#1a1a1a'];

  [...block.children].forEach((row, idx) => {
    const li = createTag('li');
    const cols = [...row.children];

    const headerCol = cols[0];
    const bodyCol = cols[1];

    const header = createTag('div', { class: 'cards-header-banner' });
    header.style.backgroundColor = colors[idx % colors.length];
    const headerText = headerCol?.querySelector('strong')?.textContent || headerCol?.textContent?.trim() || '';
    header.textContent = headerText;
    li.append(header);

    const body = createTag('div', { class: 'cards-header-body' });
    if (bodyCol) {
      while (bodyCol.firstChild) body.append(bodyCol.firstChild);
    }
    li.append(body);

    ul.append(li);
  });

  block.replaceChildren(ul);
}

export default async function decorate(block) {
  if (block.classList.contains('links')) {
    await decorateLinks(block);
  } else if (block.classList.contains('bento')) {
    decorateBento(block);
  } else if (block.classList.contains('carousel')) {
    decorateCarousel(block);
  } else if (block.classList.contains('flip')) {
    decorateFlip(block);
  } else if (block.classList.contains('header')) {
    decorateHeader(block);
  } else if (block.classList.contains('testimonial')) {
    decorateTestimonial(block);
  } else if (block.classList.contains('stats') || block.classList.contains('dark')) {
    decorateDefault(block);
  } else {
    decorateDefault(block);
  }
}
