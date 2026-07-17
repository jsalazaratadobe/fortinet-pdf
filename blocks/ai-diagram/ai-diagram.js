const SECTIONS = [
  { id: 'protect', x: 580, y: 370, lineHeight: 36 },
  { id: 'assist', x: 960, y: 240, lineHeight: 36 },
  { id: 'secureai', x: 1340, y: 370, lineHeight: 36 },
];

function buildTextGroup(heading, description, cfg) {
  const lines = description.split('\n').filter(Boolean);
  const headingEl = `<text class="ai-diagram-heading" data-section="${cfg.id}" fill="#ffffff" font-family="Inter,sans-serif" font-weight="700" font-size="42" dominant-baseline="central"><textPath href="#arc-${cfg.id}" startOffset="50%" text-anchor="middle">${heading}</textPath></text>`;
  const descEls = lines.map((line, i) => `<text x="${cfg.x}" y="${cfg.y + 50 + i * cfg.lineHeight}" fill="#ffffff" font-family="Inter,sans-serif" font-size="28" text-anchor="middle">${line}</text>`).join('');
  return `${headingEl}<g class="ai-diagram-desc" data-section="${cfg.id}">${descEls}</g>`;
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const sections = rows.slice(0, 3).map((row, i) => {
    const cols = row.querySelectorAll(':scope > div');
    const heading = cols[0]?.textContent?.trim() || '';
    const description = cols[1]?.textContent?.trim() || '';
    return { heading, description, ...SECTIONS[i] };
  });

  const ctaRow = rows[3];
  const ctaLink = ctaRow?.querySelector('a');
  const href = ctaLink?.href || '/solutions/ai-security';
  const ctaText = ctaLink?.textContent?.trim() || 'Learn about FortiAI';

  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'ai-diagram-wrapper';

  const textGroups = sections.map((s) => buildTextGroup(s.heading, s.description, s)).join('');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '271.7 9.66 1376.6 889.68');
  svg.setAttribute('aria-label', 'FortiAI platform diagram');

  svg.innerHTML = `
    <defs>
      <linearGradient id="ai-grad-protect" x1="258.57" y1="268.38" x2="1156.41" y2="865.85" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#308e65"/><stop offset="0.22" stop-color="#2b805b"/><stop offset="0.63" stop-color="#1f5b41"/><stop offset="1" stop-color="#123526"/>
      </linearGradient>
      <linearGradient id="ai-grad-assist" x1="960" y1="697.96" x2="960" y2="-220.47" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#124854"/><stop offset="0.5" stop-color="#1a7a7f"/>
      </linearGradient>
      <linearGradient id="ai-grad-secureai" x1="961.26" y1="782.3" x2="1740.52" y2="182.43" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1d4c88"/><stop offset="0.5" stop-color="#2666b5"/>
      </linearGradient>
      <linearGradient id="ai-grad-ring" x1="829.19" y1="567.15" x2="1090.81" y2="828.77" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#58595b"/>
      </linearGradient>
      <linearGradient id="ai-grad-center" x1="869.27" y1="607.23" x2="1369.48" y2="1107.44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#ffffff"/><stop offset="0.99" stop-color="#58595b"/>
      </linearGradient>
      <path id="arc-protect" d="M338,697.96 A622,622 0 0,1 649,145" fill="none"/>
      <path id="arc-assist" d="M649,145 A622,622 0 0,1 1271,145" fill="none"/>
      <path id="arc-secureai" d="M1271,145 A622,622 0 0,1 1582,697.96" fill="none"/>
    </defs>
    <rect x="610" y="107.5" width="700" height="700" fill="#ffffff"/>
    <!-- outer ring segments (same gradient as slices) -->
    <path d="M656.47,158.54c-188.22,106.13 -315.31,307.94 -315.31,539.42h-69.46c0,-257.47 141.36,-481.91 350.7,-599.96z" fill="url(#ai-grad-protect)"/>
    <path d="M1297.6,98l-34.07,60.54c-89.68,-50.58 -193.23,-79.43 -303.53,-79.43c-110.3,0 -213.85,28.85 -303.53,79.43l-34.07,-60.54c99.75,-56.25 214.93,-88.34 337.6,-88.34c122.67,0 237.85,32.09 337.6,88.34z" fill="url(#ai-grad-assist)"/>
    <path d="M1648.3,697.96h-69.46c0,-231.48 -127.09,-433.29 -315.31,-539.42l34.07,-60.54c209.34,118.05 350.7,342.49 350.7,599.96z" fill="url(#ai-grad-secureai)"/>
    <!-- main pie slices -->
    <g class="ai-diagram-slice" data-section="protect">
      <path d="M960,697.96h-618.84c0,-231.48 127.09,-433.29 315.31,-539.42z" fill="url(#ai-grad-protect)"/>
    </g>
    <g class="ai-diagram-slice" data-section="assist">
      <path d="M1263.53,158.54l-303.53,539.42l-303.53,-539.42c89.68,-50.58 193.23,-79.43 303.53,-79.43c110.3,0 213.85,28.85 303.53,79.43z" fill="url(#ai-grad-assist)"/>
    </g>
    <g class="ai-diagram-slice" data-section="secureai">
      <path d="M1578.84,697.96h-618.84l303.53,-539.42c188.22,106.13 315.31,307.94 315.31,539.42z" fill="url(#ai-grad-secureai)"/>
    </g>
    <!-- center circle -->
    <circle cx="960" cy="697.96" r="183.99" fill="#bbbdbf" opacity="0.3"/>
    <circle cx="960" cy="697.96" r="183.99" fill="none" stroke="url(#ai-grad-ring)" stroke-width="2"/>
    <circle cx="960" cy="697.96" r="128.31" fill="url(#ai-grad-center)" stroke="#9e9ea0" stroke-width="2"/>
    <!-- AI text in center -->
    <text x="960" y="700" fill="#464646" font-family="Inter,sans-serif" font-weight="700" font-size="56" text-anchor="middle">AI</text>
    <!-- FortiAI logo mark -->
    <g fill="#d8291c">
      <rect x="954" y="727" width="11.4" height="7.3"/>
      <rect x="954" y="737" width="11.4" height="7.3"/>
      <rect x="966" y="727" width="11.4" height="7.3"/>
      <rect x="966" y="727" width="11.4" height="18.7" rx="3"/>
      <rect x="942" y="727" width="11.4" height="18.7" rx="3"/>
    </g>
    <!-- connector dots -->
    <circle cx="884.8" cy="653.09" r="8.92" fill="#3cb17e"/>
    <circle cx="1035.2" cy="653.09" r="8.92" fill="#2cccd3"/>
    <circle cx="960" cy="783.34" r="8.92" fill="#307fe2"/>
    <!-- connector lines -->
    <polyline points="906.76,640.41 960,609.67 1013.24,640.41" fill="none" stroke="#464646" stroke-width="5.94" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="1035.2,677.85 1035.2,739.92 981.29,771.04" fill="none" stroke="#464646" stroke-width="5.94" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="938.71,771.04 884.8,739.92 884.8,677.85" fill="none" stroke="#464646" stroke-width="5.94" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- section text (heading + description per slice) -->
    ${textGroups}
    <!-- clickable areas -->
    <path class="ai-diagram-area" data-section="protect" d="M960,697.96h-618.84c0,-231.48 127.09,-433.29 315.31,-539.42z" fill="transparent"/>
    <path class="ai-diagram-area" data-section="assist" d="M1263.53,158.54l-303.53,539.42l-303.53,-539.42c89.68,-50.58 193.23,-79.43 303.53,-79.43c110.3,0 213.85,28.85 303.53,79.43z" fill="transparent"/>
    <path class="ai-diagram-area" data-section="secureai" d="M1578.84,697.96h-618.84l303.53,-539.42c188.22,106.13 315.31,307.94 315.31,539.42z" fill="transparent"/>
  `;

  wrapper.append(svg);

  const cta = document.createElement('p');
  cta.className = 'button-container';
  const btn = document.createElement('a');
  btn.href = href;
  btn.className = 'button';
  btn.textContent = ctaText;
  cta.append(btn);

  block.append(wrapper, cta);

  svg.querySelectorAll('.ai-diagram-area').forEach((area) => {
    const section = area.dataset.section;
    area.addEventListener('mouseenter', () => svg.classList.add(`hover-${section}`));
    area.addEventListener('mouseleave', () => svg.classList.remove(`hover-${section}`));
  });
}
