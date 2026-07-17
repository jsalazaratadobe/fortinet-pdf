import { createTag } from '../../scripts/shared.js';

/*
 * Purely illustrative/decorative diagram (source: page 8 of the brochure,
 * "Owned Global Cloud Delivers Control, Performance, and Cost Benefits").
 * The source lists ~40 city labels, but which legend color applies to each
 * individual city is not reliably legible, so this hardcodes a
 * representative ~20-pin global spread across the three legend categories
 * instead of expecting authors to maintain a huge, largely illustrative
 * pin table. Authored block content is ignored; this block expects an
 * empty table, e.g.:
 *   | world-map-pins |
 *   | --- |
 */

const STATS = [
  { title: 'Owned Infrastructure', value: '5M+ total sq ft' },
  { title: 'Lower TCO', value: 'cost saving for customers' },
  { title: 'High Availability', value: '99.999% FortiSASE SLA target' },
  { title: 'Scale', value: '~200 global cloud locations. Flexibility to choose cloud provider' },
];

const LEGEND = [
  { type: 'dc', label: 'Fortinet Data Center / POP' },
  { type: 'colo', label: 'Co-location / Cloud' },
  { type: 'cloud', label: 'Public Cloud (GCP, AWS)' },
];

// x/y are approximate equirectangular percentage positions (longitude and
// latitude mapped to a 0-100% plane), not surveyed coordinates — a
// reasonable global spread for a decorative diagram, not a precise map.
const PINS = [
  { name: 'San Jose', region: 'US', type: 'dc', x: 16, y: 29 },
  { name: 'Ashburn', region: 'US', type: 'dc', x: 28, y: 28 },
  { name: 'Dallas', region: 'US', type: 'dc', x: 23, y: 32 },
  { name: 'New York', region: 'US', type: 'colo', x: 29, y: 27 },
  { name: 'London', region: 'UK', type: 'dc', x: 50, y: 21 },
  { name: 'Dublin', region: 'Ireland', type: 'cloud', x: 48, y: 20 },
  { name: 'Paris', region: 'France', type: 'colo', x: 51, y: 23 },
  { name: 'Madrid', region: 'Spain', type: 'cloud', x: 49, y: 28 },
  { name: 'Frankfurt', region: 'Germany', type: 'dc', x: 52, y: 22 },
  { name: 'Istanbul', region: 'Turkey', type: 'cloud', x: 58, y: 27 },
  { name: 'Tel Aviv', region: 'Israel', type: 'colo', x: 60, y: 32 },
  { name: 'Dubai', region: 'UAE', type: 'colo', x: 65, y: 36 },
  { name: 'Mumbai', region: 'India', type: 'cloud', x: 70, y: 39 },
  { name: 'Singapore', region: '', type: 'dc', x: 79, y: 49 },
  { name: 'Hong Kong', region: '', type: 'colo', x: 82, y: 38 },
  { name: 'Tokyo', region: 'Japan', type: 'dc', x: 89, y: 30 },
  { name: 'Seoul', region: 'S. Korea', type: 'cloud', x: 85, y: 29 },
  { name: 'Sydney', region: 'Australia', type: 'dc', x: 90, y: 69 },
  { name: 'Sao Paulo', region: 'Brazil', type: 'colo', x: 37, y: 63 },
  { name: 'Johannesburg', region: 'South Africa', type: 'colo', x: 58, y: 65 },
];

const CONTINENTS = ['na', 'sa', 'eu', 'af', 'as', 'au'];

function buildStats() {
  const list = createTag('ul', { class: 'world-map-pins-stats' });
  STATS.forEach((stat) => {
    const li = createTag('li', { class: 'world-map-pins-stat' });
    li.append(createTag('p', { class: 'world-map-pins-stat-title' }, stat.title));
    li.append(createTag('p', { class: 'world-map-pins-stat-value' }, stat.value));
    list.append(li);
  });
  return list;
}

function buildLegend() {
  const list = createTag('ul', { class: 'world-map-pins-legend' });
  LEGEND.forEach((item) => {
    const li = createTag('li', { class: 'world-map-pins-legend-item' });
    li.append(createTag('span', { class: `world-map-pins-legend-dot world-map-pins-legend-dot-${item.type}` }));
    li.append(createTag('span', {}, item.label));
    list.append(li);
  });
  return list;
}

function buildMap() {
  const mapLabel = "World map showing Fortinet's global network of owned data centers, "
    + 'co-location/cloud sites, and public cloud regions across North America, Europe, '
    + 'the Middle East, Asia-Pacific, South America and Africa.';
  const map = createTag('div', { class: 'world-map-pins-map', role: 'img', 'aria-label': mapLabel });

  const continents = createTag('div', { class: 'world-map-pins-continents' });
  CONTINENTS.forEach((c) => {
    continents.append(createTag('span', { class: `world-map-pins-continent world-map-pins-continent-${c}` }));
  });
  map.append(continents);

  const markers = createTag('div', { class: 'world-map-pins-markers' });
  PINS.forEach((pin) => {
    const marker = createTag('div', {
      class: `world-map-pins-marker world-map-pins-marker-${pin.type}`,
      style: `left:${pin.x}%; top:${pin.y}%;`,
    });
    marker.append(createTag('span', { class: 'world-map-pins-dot' }));
    marker.append(createTag('span', { class: 'world-map-pins-city' }, pin.region ? `${pin.name}, ${pin.region}` : pin.name));
    markers.append(marker);
  });
  map.append(markers);

  return map;
}

export default async function decorate(block) {
  block.textContent = '';

  const mapCol = createTag('div', { class: 'world-map-pins-map-col' });
  mapCol.append(buildMap(), buildLegend());

  const inner = createTag('div', { class: 'world-map-pins-inner' });
  inner.append(buildStats(), mapCol);

  block.append(inner);
}
