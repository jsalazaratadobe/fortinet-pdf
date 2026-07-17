/** @param {Element} block The hero block element */
export default function decorate(block) {
  const slides = [...block.children];

  if (slides.length <= 1) {
    decorateSingle(block);
    return;
  }

  decorateCarousel(block, slides);
}

function decorateSingle(block) {
  const pictures = block.querySelectorAll('picture');

  if (pictures.length >= 2) {
    const lightDiv = pictures[0].closest('.hero > div');
    const darkDiv = pictures[1].closest('.hero > div');
    if (lightDiv) lightDiv.classList.add('hero-img-light');
    if (darkDiv) darkDiv.classList.add('hero-img-dark');
  } else if (pictures.length < 1) {
    block.classList.add('no-image');
  }

  const h1 = block.querySelector('h1');
  if (!h1) return;

  const contentDiv = h1.closest('div');
  if (!contentDiv) return;

  const textDiv = contentDiv.parentElement;
  if (textDiv) textDiv.classList.add('hero-text');

  const children = [...contentDiv.children];
  const h1Index = children.indexOf(h1);

  for (let i = 0; i < h1Index; i += 1) {
    if (children[i].tagName === 'P' && !children[i].classList.contains('button-container')) {
      children[i].classList.add('hero-tagline');
      break;
    }
  }
}

function decorateCarousel(block, slides) {
  block.classList.add('hero-carousel');

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  slides.forEach((slide, i) => {
    slide.classList.add('hero-slide');
    if (i === 0) slide.classList.add('active');

    const picture = slide.querySelector('picture');
    if (picture) {
      if (i === 0) {
        const img = picture.querySelector('img');
        if (img) img.loading = 'eager';
      }
      const imgWrapper = picture.closest('div');
      if (imgWrapper && imgWrapper.parentElement === slide) {
        imgWrapper.classList.add('hero-slide-bg');
      }
    }

    const textCells = [...slide.children].filter((c) => !c.querySelector('picture'));
    textCells.forEach((cell) => {
      cell.classList.add('hero-slide-content');
      const buttons = cell.querySelectorAll('p.button-container');
      if (buttons.length > 1) {
        const btnRow = document.createElement('div');
        btnRow.className = 'hero-slide-buttons';
        buttons.forEach((btn) => btnRow.append(btn));
        cell.append(btnRow);
      }
    });

    track.append(slide);
  });

  block.textContent = '';
  block.append(track);

  const indicators = document.createElement('div');
  indicators.className = 'hero-carousel-indicators';
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-carousel-dot';
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    indicators.append(dot);
  });
  block.append(indicators);

  let current = 0;
  let interval = null;

  function goToSlide(idx) {
    slides[current].classList.remove('active');
    indicators.children[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    indicators.children[current].classList.add('active');
    resetInterval();
  }

  function next() {
    goToSlide((current + 1) % slides.length);
  }

  function resetInterval() {
    if (interval) clearInterval(interval);
    interval = setInterval(next, 6000);
  }

  resetInterval();

  block.addEventListener('mouseenter', () => { if (interval) clearInterval(interval); });
  block.addEventListener('mouseleave', () => { resetInterval(); });
}
