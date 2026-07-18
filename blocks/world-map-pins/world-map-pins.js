import { createTag } from '../../scripts/shared.js';

/*
 * Purely illustrative/decorative diagram (source: page 8 of the brochure,
 * "Owned Global Cloud Delivers Control, Performance, and Cost Benefits").
 * The PINS list below and each pin's legend color were read directly off
 * the source page (city labels + red/blue/gray dot colors sampled from the
 * brochure image), so both the roster and the color mix now match the
 * source closely; x/y placement is still an approximate equirectangular
 * percentage layout (not surveyed coordinates), since the source map isn't
 * a precise projection either. Authored block content is ignored; this
 * block expects an empty table, e.g.:
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
  // North America
  { name: 'Vancouver, Burnaby', region: 'Canada', type: 'dc', x: 14, y: 23 },
  { name: 'Portland', region: 'US', type: 'cloud', x: 14, y: 27 },
  { name: 'San Jose', region: 'US', type: 'dc', x: 13, y: 32 },
  { name: 'Toronto', region: 'Canada', type: 'dc', x: 25, y: 25 },
  { name: 'Ottawa', region: 'Canada', type: 'colo', x: 27, y: 23 },
  { name: 'Montreal', region: 'Canada', type: 'colo', x: 28, y: 24 },
  { name: 'Chicago', region: 'US', type: 'dc', x: 21, y: 28 },
  { name: 'Columbus', region: 'US', type: 'cloud', x: 23, y: 30 },
  { name: 'Las Vegas', region: 'US', type: 'colo', x: 15, y: 32 },
  { name: 'New York', region: 'US', type: 'dc', x: 29, y: 28 },
  { name: 'Ashburn', region: 'US', type: 'colo', x: 28, y: 30 },
  { name: 'Atlanta', region: 'US', type: 'dc', x: 22, y: 34 },
  { name: 'South Carolina', region: 'US', type: 'cloud', x: 26, y: 32 },
  { name: 'Dallas, Plano', region: 'US', type: 'dc', x: 18, y: 36 },
  { name: 'Miami', region: 'US', type: 'dc', x: 25, y: 40 },
  { name: 'Queretaro', region: 'Mexico', type: 'cloud', x: 15, y: 40 },
  // Europe / Middle East
  { name: 'London', region: 'UK', type: 'dc', x: 47, y: 20 },
  { name: 'Dublin', region: 'Ireland', type: 'cloud', x: 45, y: 19 },
  { name: 'Belgium & Netherlands', region: '', type: 'colo', x: 48, y: 21 },
  { name: 'Paris', region: '', type: 'colo', x: 48, y: 22 },
  { name: 'Frankfurt, Zurich', region: '', type: 'dc', x: 50, y: 21 },
  { name: 'Madrid', region: 'Spain', type: 'dc', x: 46, y: 26 },
  { name: 'Milan, Sophia', region: '', type: 'dc', x: 51, y: 24 },
  { name: 'Warsaw', region: 'Poland', type: 'cloud', x: 53, y: 19 },
  { name: 'Hamina', region: 'Finland', type: 'cloud', x: 54, y: 14 },
  { name: 'Istanbul', region: 'Turkey', type: 'colo', x: 57, y: 25 },
  { name: 'Tel Aviv', region: 'Israel', type: 'cloud', x: 58, y: 30 },
  { name: 'Doha', region: 'Qatar', type: 'cloud', x: 63, y: 33 },
  { name: 'Dammam', region: 'Saudi Arabia', type: 'cloud', x: 62, y: 32 },
  { name: 'Dubai', region: 'UAE', type: 'colo', x: 64, y: 33 },
  { name: 'Delhi', region: 'India', type: 'cloud', x: 69, y: 30 },
  // Asia-Pacific
  { name: 'Beijing, Shanghai, Guangzhou', region: '', type: 'dc', x: 80, y: 26 },
  { name: 'Seoul', region: 'S. Korea', type: 'cloud', x: 85, y: 26 },
  { name: 'Tokyo, Osaka', region: 'Japan', type: 'dc', x: 90, y: 27 },
  { name: 'Hong Kong', region: '', type: 'colo', x: 81, y: 33 },
  { name: 'Taipei', region: 'Taiwan', type: 'dc', x: 83, y: 34 },
  { name: 'Bangalore, Pune', region: 'India', type: 'dc', x: 70, y: 40 },
  { name: 'Mumbai', region: 'India', type: 'cloud', x: 68, y: 39 },
  { name: 'Cyberjaya', region: 'Malaysia', type: 'cloud', x: 76, y: 44 },
  { name: 'Bangkok', region: 'Thailand', type: 'cloud', x: 77, y: 41 },
  { name: 'Singapore', region: '', type: 'colo', x: 78, y: 46 },
  { name: 'Manila', region: 'Philippines', type: 'cloud', x: 83, y: 40 },
  { name: 'Jakarta', region: 'Indonesia', type: 'cloud', x: 78, y: 49 },
  // South America / Africa / Oceania
  { name: 'Lima', region: 'Peru', type: 'cloud', x: 30, y: 52 },
  { name: 'Vinhedo, Sao Paulo', region: 'Brazil', type: 'colo', x: 36, y: 58 },
  { name: 'Santiago', region: 'Chile', type: 'cloud', x: 30, y: 69 },
  { name: 'Buenos Aires', region: 'Argentina', type: 'cloud', x: 37, y: 66 },
  { name: 'Johannesburg', region: 'South Africa', type: 'colo', x: 56, y: 62 },
  { name: 'Perth', region: 'Australia', type: 'cloud', x: 82, y: 65 },
  { name: 'Sydney', region: 'Australia', type: 'dc', x: 90, y: 63 },
  { name: 'Melbourne', region: 'Australia', type: 'cloud', x: 89, y: 66 },
  { name: 'Auckland', region: 'New Zealand', type: 'colo', x: 94, y: 67 },
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
    // Two-line stacked label (bold city name, gray region below), matching
    // the source brochure's map labels, instead of one "City, Region" line.
    const label = createTag('span', { class: 'world-map-pins-city' });
    label.append(createTag('span', { class: 'world-map-pins-city-name' }, pin.name));
    if (pin.region) {
      label.append(createTag('span', { class: 'world-map-pins-city-region' }, pin.region));
    }
    marker.append(label);
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
