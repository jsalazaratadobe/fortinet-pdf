import { loadChartJs, createChart, createTag } from '../../scripts/shared.js';

const DEFAULT_PALETTE = ['#e5262a', '#2ab08f', '#4fa5cc', '#1c2b4a', '#f5a623', '#7b2d8b', '#666'];

/**
 * Parse the authored table rows into headers/data, pulling out an optional
 * `colors | #hex | #hex ...` control row so authors can override the palette
 * without touching code.
 * @param {Element} block
 */
function parseTable(block) {
  const rows = [...block.children].map((row) => [...row.children].map((cell) => cell.textContent.trim()));
  let colors;
  const filtered = rows.filter((row) => {
    if (row[0]?.toLowerCase() === 'colors') {
      colors = row.slice(1).filter(Boolean);
      return false;
    }
    return row.some((cell) => cell !== '');
  });
  const [header, ...dataRows] = filtered;
  return { header, dataRows, colors };
}

function toNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function buildSeries(header, dataRows) {
  const categories = dataRows.map((row) => row[0]);
  const seriesNames = header.slice(1);
  const series = seriesNames.map((name, i) => ({
    name,
    isPercent: /%/.test(name),
    values: dataRows.map((row) => toNumber(row[i + 1])),
  }));
  return { categories, series };
}

function baseFont() {
  return { family: 'Inter, sans-serif', size: 12 };
}

function buildBarLineConfig(categories, series, colors) {
  const [barSeries, lineSeries] = series;
  return {
    data: {
      labels: categories,
      datasets: [
        {
          type: 'bar',
          label: barSeries.name,
          data: barSeries.values,
          backgroundColor: colors[0] || '#c3d3ef',
          borderRadius: 2,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: lineSeries.name,
          data: lineSeries.values,
          borderColor: colors[1] || '#e5262a',
          backgroundColor: colors[1] || '#e5262a',
          pointBackgroundColor: colors[1] || '#e5262a',
          pointRadius: 4,
          tension: 0.35,
          yAxisID: 'y1',
          order: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { font: baseFont(), usePointStyle: true } },
        tooltip: { enabled: true },
      },
      scales: {
        y: {
          position: 'left',
          ticks: { callback: (v) => `$${v.toLocaleString()}`, font: baseFont() },
          grid: { color: '#eee' },
        },
        y1: {
          position: 'right',
          ticks: { callback: (v) => `${v}%`, font: baseFont() },
          grid: { display: false },
        },
        x: { ticks: { font: baseFont() }, grid: { display: false } },
      },
    },
  };
}

function buildLineMultiConfig(categories, series, colors) {
  return {
    data: {
      labels: categories,
      datasets: series.map((s, i) => ({
        label: s.name,
        data: s.values,
        borderColor: colors[i] || DEFAULT_PALETTE[i],
        backgroundColor: colors[i] || DEFAULT_PALETTE[i],
        pointRadius: 3,
        tension: 0.3,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: baseFont(), usePointStyle: true } },
      },
      scales: {
        y: {
          ticks: {
            callback: (v) => (series[0]?.isPercent ? `${v}%` : `$${v.toLocaleString()}`),
            font: baseFont(),
          },
          grid: { color: '#eee' },
        },
        x: { ticks: { font: baseFont() }, grid: { display: false } },
      },
    },
  };
}

function buildHorizontalBarConfig(categories, series, colors) {
  return {
    data: {
      labels: categories,
      datasets: [{
        label: series[0].name,
        data: series[0].values,
        backgroundColor: categories.map((_, i) => colors[i] || DEFAULT_PALETTE[i] || DEFAULT_PALETTE[DEFAULT_PALETTE.length - 1]),
        borderRadius: 2,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: baseFont() }, grid: { color: '#eee' } },
        y: { ticks: { font: baseFont() }, grid: { display: false } },
      },
    },
  };
}

function buildPieDonutConfig(type, categories, series, colors) {
  return {
    type,
    data: {
      labels: categories,
      datasets: [{
        data: series[0].values,
        backgroundColor: categories.map((_, i) => colors[i] || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]),
        borderColor: '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: type === 'donut' ? '65%' : undefined,
      plugins: {
        legend: { position: 'right', labels: { font: baseFont(), boxWidth: 12, usePointStyle: true } },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
              return `${ctx.label}: ${pct}%`;
            },
          },
        },
      },
    },
  };
}

export default async function decorate(block) {
  const { header, dataRows, colors = [] } = parseTable(block);
  if (!header || !dataRows.length) return;
  const { categories, series } = buildSeries(header, dataRows);

  const isBarLine = block.classList.contains('bar-line');
  const isDonut = block.classList.contains('donut');
  const isPie = block.classList.contains('pie');
  const isHorizontal = block.classList.contains('horizontal-bar');
  const isLineMulti = block.classList.contains('line-multi');

  let config;
  if (isBarLine) {
    config = buildBarLineConfig(categories, series, colors);
  } else if (isDonut || isPie) {
    config = buildPieDonutConfig(isDonut ? 'doughnut' : 'pie', categories, series, colors);
  } else if (isHorizontal) {
    config = buildHorizontalBarConfig(categories, series, colors);
  } else if (isLineMulti) {
    config = buildLineMultiConfig(categories, series, colors);
  } else {
    // simple bar fallback
    config = {
      data: {
        labels: categories,
        datasets: [{
          label: series[0]?.name,
          data: series[0]?.values,
          backgroundColor: colors[0] || DEFAULT_PALETTE[0],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } },
      },
    };
  }
  if (!config.type) config.type = isBarLine ? 'bar' : 'bar';

  const wrapper = createTag('div', { class: 'chart-canvas-wrapper' });
  const canvas = createTag('canvas', { role: 'img', 'aria-label': header.slice(1).join(', ') });
  wrapper.append(canvas);
  block.replaceChildren(wrapper);

  await loadChartJs();
  createChart(canvas, config);
}
