import { useState } from "react";

/*
  A small single-series bar chart in plain HTML.
  data: [{ label: "Jan", value: 3, tooltip?: "3 movies in January" }]
  One colour (brand), rounded tops, 2px gaps, the peak labelled directly,
  a tooltip on hover/focus, and a hidden table for screen readers.
*/
const BarChart = ({ data, height = 140, title, valueLabel = "Value", formatValue = (v) => v }) => {
  const [active, setActive] = useState(null);
  const max = Math.max(...data.map((item) => item.value), 1);
  const peakIndex = data.reduce((best, item, index) => (item.value > data[best].value ? index : best), 0);

  return (
    <figure className="w-full">
      <div className="relative flex items-end gap-[2px] border-b border-line" style={{ height }} role="img" aria-label={title}>
        {data.map((item, index) => {
          const barHeight = item.value > 0 ? Math.max((item.value / max) * (height - 22), 4) : 0;
          const isActive = active === index;
          return (
            <div
              key={item.label}
              className="relative flex h-full flex-1 flex-col items-center justify-end outline-none"
              onPointerEnter={() => setActive(index)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              tabIndex={0}
              aria-label={item.tooltip ?? `${item.label}: ${formatValue(item.value)}`}
            >
              {/* The peak gets its number written on it; others show it on hover */}
              {(index === peakIndex && item.value > 0) || isActive ? (
                <span className="mb-1 text-[11px] font-semibold tabular-nums text-fg">{formatValue(item.value)}</span>
              ) : null}
              <div
                className={`w-full max-w-10 rounded-t-[4px] transition-colors ${isActive ? "bg-brand-hover" : "bg-brand"}`}
                style={{ height: barHeight }}
              />
              {isActive && item.tooltip && (
                <div className="pointer-events-none absolute bottom-full z-10 mb-6 whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 py-1.5 text-xs text-fg shadow-xl">
                  {item.tooltip}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-[2px]" aria-hidden="true">
        {data.map((item) => (
          <span key={item.label} className="flex-1 text-center text-[10px] text-muted">
            {item.label}
          </span>
        ))}
      </div>

      {/* The same numbers as a table, for screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{formatValue(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

export default BarChart;
