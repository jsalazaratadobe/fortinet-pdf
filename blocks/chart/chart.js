import { loadChartJs, createChart, createTag } from '../../scripts/shared.js';

// 14-color sequence matched (via pixel sampling of the source PDF) to the one
// chart in this brochure that has no authored `colors` control row (the 14
// -category "Billings by Vertical" pie): index 0-6 are also used as the
// general small-N fallback palette for any other uncoloured chart.
const DEFAULT_PALETTE = [
  '#46b876', '#8155b0', '#25563c', '#61389d', '#5cc8ca', '#88d5a4', '#a4b2ca',
  '#6680aa', '#264994', '#3e9c9f', '#4d76c4', '#243f78', '#db2624', '#691716',
];

/**
 * Parse the authored table rows into headers/data, pulling out an optional
 * `colors | #hex | #hex ...` control row so authors can override the palette
 * without touching code.
 * @param {Element} block
 */
function parseTable(block) {
  const rows = [...block.children].map((row) => [...row.children].map((cell) => cell.textContent.trim()));
  let colors;
  let title;
  const filtered = rows.filter((row) => {
    if (row[0]?.toLowerCase() === 'colors') {
      colors = row.slice(1).filter(Boolean);
      return false;
    }
    if (row[0]?.toLowerCase() === 'title') {
      [, title] = row;
      return false;
    }
    return row.some((cell) => cell !== '');
  });
  const [header, ...dataRows] = filtered;
  return {
    header, dataRows, colors, title,
  };
}

function toNumber(value) {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function buildSeries(header, dataRows) {
  const categories = dataRows.map((row) => row[0]);
  const seriesNames = header.slice(1);
  const series = seriesNames.map((name, i) => {
    const values = dataRows.map((row) => toNumber(row[i + 1]));
    // A series is treated as a percentage series either when its header says
    // so (e.g. "GAAP Operating Margin %") or - since several authored charts
    // share the exact same "Year | Company | Company | Company" header shape
    // for both percentage-share data and dollar data - when every value in
    // the series already looks like a plausible percentage (0-100).
    const isPercent = /%/.test(name) || (values.length > 0 && values.every((v) => v >= 0 && v <= 100));
    return { name, isPercent, values };
  });
  return { categories, series };
}

function baseFont() {
  return { family: 'Inter, sans-serif', size: 12 };
}

function formatByUnit(value, isPercent) {
  return isPercent ? `${value}%` : `$${Number(value).toLocaleString()}`;
}

/**
 * Small self-contained Chart.js plugins (registered per-chart via
 * `config.plugins`, not globally) that draw the direct-on-chart value/percent
 * labels the source PDF uses throughout instead of relying on hover tooltips.
 */
function barValueLabelsPlugin() {
  return {
    id: 'brochureBarLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const { data } = chart.data.datasets[0];
      ctx.save();
      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillStyle = '#555';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      meta.data.forEach((el, i) => {
        const value = data[i];
        if (value === undefined || value === null) return;
        ctx.fillText(`$${Number(value).toLocaleString()}`, el.x, el.y - 4);
      });
      ctx.restore();
    },
  };
}

function lineValueLabelsPlugin() {
  return {
    id: 'brochureLineLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.font = '700 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      chart.data.datasets.forEach((ds, dsIndex) => {
        if (ds.type && ds.type !== 'line') return;
        const meta = chart.getDatasetMeta(dsIndex);
        if (meta.hidden) return;
        ctx.fillStyle = ds.borderColor || '#333';
        meta.data.forEach((el, i) => {
          const value = ds.data[i];
          if (value === undefined || value === null) return;
          ctx.textBaseline = 'bottom';
          ctx.fillText(formatByUnit(value, ds._isPercent), el.x, el.y - 8);
        });
      });
      ctx.restore();
    },
  };
}

function hbarValueLabelsPlugin() {
  return {
    id: 'brochureHbarLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const { data } = chart.data.datasets[0];
      ctx.save();
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#1a1a1a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      meta.data.forEach((el, i) => {
        const value = data[i];
        if (value === undefined || value === null) return;
        ctx.fillText(Number(value).toLocaleString(), el.x + 8, el.y);
      });
      ctx.restore();
    },
  };
}

function pieValueLabelsPlugin() {
  return {
    id: 'brochurePieLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const { data } = chart.data.datasets[0];
      const total = data.reduce((a, b) => a + b, 0);
      if (!total) return;
      ctx.save();
      ctx.font = '700 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillStyle = '#fff';
      meta.data.forEach((arc, i) => {
        const value = data[i];
        const pct = Math.round((value / total) * 100);
        // Skip tiny slivers - the source brochure calls these out with an
        // external leader-line label instead of cramming text into the arc.
        if (pct < 3) return;
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const radius = (arc.innerRadius + arc.outerRadius) / 2;
        const x = arc.x + (Math.cos(angle) * radius);
        const y = arc.y + (Math.sin(angle) * radius);
        const label = `${pct}%`;
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);
      });
      ctx.restore();
    },
  };
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
          _isPercent: true,
        },
      ],
    },
    plugins: [barValueLabelsPlugin(), lineValueLabelsPlugin()],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 20 } },
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
          min: 0,
          max: 45,
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
    type: 'line',
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
        _isPercent: s.isPercent,
      })),
    },
    plugins: [lineValueLabelsPlugin()],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 18 } },
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
        barPercentage: 0.6,
      }],
    },
    plugins: [hbarValueLabelsPlugin()],
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 60 } },
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false, grid: { display: false } },
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
    plugins: [pieValueLabelsPlugin()],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: type === 'doughnut' ? '65%' : undefined,
      plugins: {
        // The source brochure only shows a side legend for the plain "pie"
        // instances (Q1 2026 revenue/billings breakdowns); every "donut"
        // instance instead relies on inline slice labels / external captions
        // authored around the chart, with no on-chart legend.
        legend: {
          display: type !== 'doughnut',
          position: 'right',
          labels: { font: baseFont(), boxWidth: 12, usePointStyle: true },
        },
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
  const {
    header, dataRows, colors = [], title,
  } = parseTable(block);
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
      plugins: [barValueLabelsPlugin()],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 20 } },
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { grid: { color: '#eee' } } },
      },
    };
  }
  if (!config.type) config.type = isLineMulti ? 'line' : 'bar';

  const wrapper = createTag('div', { class: 'chart-canvas-wrapper' });
  const canvas = createTag('canvas', { role: 'img', 'aria-label': title || header.slice(1).join(', ') });
  wrapper.append(canvas);

  const children = [];
  if (title) {
    const caption = createTag('p', { class: 'chart-title' });
    caption.textContent = title;
    children.push(caption);
  }
  children.push(wrapper);
  block.replaceChildren(...children);

  await loadChartJs();
  createChart(canvas, config);
}
