import { getMetadata } from '../../scripts/aem.js';

const DESKTOP = window.matchMedia('(min-width: 900px)');

function getNavPath() {
  const meta = getMetadata('nav');
  return (meta ? new URL(meta, window.location).pathname : null) || '/nav';
}

function buildMegamenu(subUl) {
  const mega = document.createElement('div');
  mega.className = 'nav-mega';

  const sidebar = document.createElement('ul');
  sidebar.className = 'nav-mega-sidebar';

  const panels = document.createElement('div');
  panels.className = 'nav-mega-panels';

  const categories = [...subUl.children];
  categories.forEach((cat, idx) => {
    const catLink = cat.querySelector(':scope > a') || cat.querySelector(':scope > p > a');
    const catSub = cat.querySelector(':scope > ul');

    const sideItem = document.createElement('li');
    sideItem.className = 'nav-mega-sidebar-item';
    if (idx === 0) sideItem.classList.add('active');

    const sideLink = document.createElement('a');
    sideLink.href = catLink ? catLink.href : '#';
    sideLink.textContent = catLink ? catLink.textContent : '';
    sideItem.append(sideLink);
    sidebar.append(sideItem);

    const panel = document.createElement('div');
    panel.className = 'nav-mega-panel';
    if (idx === 0) panel.classList.add('active');

    if (catSub) {
      const grid = document.createElement('div');
      grid.className = 'nav-mega-grid';

      let currentCol = null;
      [...catSub.children].forEach((li) => {
        const strong = li.querySelector('strong');
        if (strong) {
          currentCol = document.createElement('div');
          currentCol.className = 'nav-mega-col';
          const heading = document.createElement('h4');
          heading.textContent = strong.textContent;
          currentCol.append(heading);
          grid.append(currentCol);
        } else {
          const link = li.querySelector('a');
          if (link && currentCol) {
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.textContent;
            currentCol.append(a);
          } else if (link) {
            if (!currentCol) {
              currentCol = document.createElement('div');
              currentCol.className = 'nav-mega-col';
              grid.append(currentCol);
            }
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.textContent;
            currentCol.append(a);
          }
        }
      });
      panel.append(grid);
    }

    panels.append(panel);

    sideItem.addEventListener('mouseenter', () => {
      sidebar.querySelectorAll('.active').forEach((s) => s.classList.remove('active'));
      panels.querySelectorAll('.active').forEach((p) => p.classList.remove('active'));
      sideItem.classList.add('active');
      panel.classList.add('active');
    });
  });

  const viewAll = document.createElement('a');
  viewAll.className = 'nav-mega-view-all';
  viewAll.href = categories[0]?.querySelector(':scope > a')?.closest('ul')?.parentElement?.querySelector(':scope > a')?.href || '#';
  viewAll.textContent = 'View All Products »';
  sidebar.append(viewAll);

  mega.append(sidebar);
  mega.append(panels);
  return mega;
}

function buildSimpleDropdown(subUl) {
  const dropdown = document.createElement('div');
  dropdown.className = 'nav-dropdown';
  const list = document.createElement('ul');
  [...subUl.children].forEach((li) => {
    const link = li.querySelector('a');
    if (link) {
      const item = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent;
      item.append(a);
      list.append(item);
    }
  });
  dropdown.append(list);
  return dropdown;
}

export default async function decorate(block) {
  const navPath = getNavPath();
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch(`${navPath}.plain.html`);
  if (!resp.ok) return;

  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections = doc.querySelectorAll('body > div');

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';

  // Utility bar (from section 3)
  const utilBar = document.createElement('div');
  utilBar.className = 'nav-util';
  const utilInner = document.createElement('div');
  utilInner.className = 'nav-util-inner';

  const toolsSection = sections[2];
  if (toolsSection) {
    const links = toolsSection.querySelectorAll('a');
    const utilLinks = document.createElement('div');
    utilLinks.className = 'nav-util-links';
    links.forEach((a, i) => {
      if (i < 3) {
        const link = document.createElement('a');
        link.href = a.href;
        link.textContent = a.textContent.toUpperCase();
        utilLinks.append(link);
        if (i < 2) {
          const sep = document.createElement('span');
          sep.className = 'nav-util-sep';
          sep.textContent = '|';
          utilLinks.append(sep);
        }
      }
    });
    utilInner.append(utilLinks);
  }

  const utilIcons = document.createElement('div');
  utilIcons.className = 'nav-util-icons';
  const searchBtn = document.createElement('button');
  searchBtn.className = 'nav-search-btn';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>';
  utilIcons.append(searchBtn);

  const globeBtn = document.createElement('button');
  globeBtn.className = 'nav-globe-btn';
  globeBtn.setAttribute('aria-label', 'Select language');
  globeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
  utilIcons.append(globeBtn);
  utilInner.append(utilIcons);
  utilBar.append(utilInner);
  wrapper.append(utilBar);

  // Main nav bar
  const mainBar = document.createElement('nav');
  mainBar.className = 'nav-main';
  mainBar.setAttribute('aria-label', 'Main');
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';

  // Brand
  const brandSection = sections[0];
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const logoLink = brandSection?.querySelector('a');
  if (logoLink) {
    const a = document.createElement('a');
    a.href = logoLink.href;
    a.setAttribute('aria-label', 'Fortinet home');
    const img = logoLink.querySelector('img');
    if (img) {
      const logoImg = document.createElement('img');
      logoImg.src = img.getAttribute('src');
      logoImg.alt = img.alt || 'Fortinet';
      logoImg.loading = 'eager';
      a.append(logoImg);
    }
    brand.append(a);
  }
  mainInner.append(brand);

  // Hamburger
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  mainInner.append(hamburger);

  // Nav items
  const navItems = document.createElement('div');
  navItems.className = 'nav-items';
  const navSection = sections[1];
  const mainList = navSection?.querySelector('ul');
  let activeItem = null;

  if (mainList) {
    [...mainList.children].forEach((li) => {
      const link = li.querySelector(':scope > a') || li.querySelector(':scope > p > a');
      const subUl = li.querySelector(':scope > ul');

      const item = document.createElement('div');
      item.className = 'nav-item';

      const a = document.createElement('a');
      a.href = link ? link.href : '#';
      a.textContent = link ? link.textContent : '';
      a.className = 'nav-item-link';
      item.append(a);

      if (subUl) {
        item.classList.add('has-dropdown');
        const hasNestedSub = subUl.querySelector(':scope > li > ul');

        if (hasNestedSub) {
          const mega = buildMegamenu(subUl);
          item.append(mega);
          item.classList.add('has-mega');
        } else {
          const dropdown = buildSimpleDropdown(subUl);
          item.append(dropdown);
        }

        item.addEventListener('mouseenter', () => {
          if (!DESKTOP.matches) return;
          if (activeItem && activeItem !== item) {
            activeItem.classList.remove('open');
          }
          item.classList.add('open');
          activeItem = item;
        });

        item.addEventListener('mouseleave', () => {
          if (!DESKTOP.matches) return;
          item.classList.remove('open');
          activeItem = null;
        });

        a.addEventListener('click', (e) => {
          if (!DESKTOP.matches) {
            e.preventDefault();
            item.classList.toggle('open');
          }
        });
      }

      navItems.append(item);
    });
  }
  mainInner.append(navItems);

  // Right CTA
  const rightCta = document.createElement('div');
  rightCta.className = 'nav-right-cta';
  if (toolsSection) {
    const links = toolsSection.querySelectorAll('a');
    if (links.length > 3) {
      const a = document.createElement('a');
      a.href = links[3].href;
      a.innerHTML = `<span class="nav-fortiguard-icon">&#9679;</span> <span class="nav-fortiguard-label">FORTIGUARD LABS</span> <span>THREAT INTELLIGENCE &raquo;</span>`;
      a.className = 'nav-fortiguard-link';
      rightCta.append(a);
    }
  }
  mainInner.append(rightCta);
  mainBar.append(mainInner);
  wrapper.append(mainBar);

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navItems.classList.toggle('nav-open', !expanded);
    document.body.classList.toggle('nav-overlay', !expanded);
  });

  DESKTOP.addEventListener('change', () => {
    hamburger.setAttribute('aria-expanded', 'false');
    navItems.classList.remove('nav-open');
    document.body.classList.remove('nav-overlay');
    navItems.querySelectorAll('.open').forEach((el) => el.classList.remove('open'));
  });

  block.textContent = '';
  block.append(wrapper);
}
