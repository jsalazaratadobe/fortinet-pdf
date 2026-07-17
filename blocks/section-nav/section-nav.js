export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const nav = document.createElement('nav');
  nav.className = 'section-nav-bar';
  nav.setAttribute('aria-label', 'Page sections');

  const ul = document.createElement('ul');

  rows.forEach((row) => {
    const link = row.querySelector('a');
    const text = row.textContent.trim();
    if (!text) return;

    const li = document.createElement('li');
    const a = document.createElement('a');

    if (link) {
      a.href = link.href;
      a.textContent = link.textContent.trim();
    } else {
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      a.href = `#${id}`;
      a.textContent = text;
    }

    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href)
          || document.getElementById(href.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        ul.querySelectorAll('.active').forEach((el) => el.classList.remove('active'));
        li.classList.add('active');
      }
    });

    li.append(a);
    ul.append(li);
  });

  nav.append(ul);
  block.textContent = '';
  block.append(nav);
}
