export default function decorate(block) {
  const items = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'accordion-items';

  const imagePanel = document.createElement('div');
  imagePanel.className = 'accordion-image-panel';

  const detailsList = [];
  const imageSlides = [];

  items.forEach((item, index) => {
    const title = item.children[0];
    const content = item.children[1];

    const details = document.createElement('details');
    if (index === 0) details.open = true;
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-title';
    summary.textContent = title?.textContent?.trim() || '';

    const body = document.createElement('div');
    body.className = 'accordion-body';

    const picture = content?.querySelector('picture');
    if (picture) {
      const imgSlide = document.createElement('div');
      imgSlide.className = `accordion-image${index === 0 ? ' is-active' : ''}`;
      imgSlide.append(picture);
      imagePanel.append(imgSlide);
      imageSlides.push(imgSlide);
    }

    if (content) body.append(...content.childNodes);
    details.append(summary, body);
    wrapper.append(details);
    detailsList.push(details);
  });

  wrapper.addEventListener('toggle', (e) => {
    const toggled = e.target.closest('details');
    if (!toggled?.open) return;

    const idx = detailsList.indexOf(toggled);
    detailsList.forEach((d) => { if (d !== toggled) d.open = false; });
    imageSlides.forEach((img, i) => img.classList.toggle('is-active', i === idx));
  }, true);

  block.replaceChildren(wrapper);
  if (imagePanel.children.length) block.append(imagePanel);
}
