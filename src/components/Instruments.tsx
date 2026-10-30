import { useId, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { Controls, Failure, Sample, State } from "../sim/engine";
import { clamp, setControl, setFailure } from "../sim/engine";
import type { Simulation } from "../sim/useSimulation";
import { failureInfo } from "../content/course";

export function Panel({
  title,
  kicker,
  children,
  className = "",
  aside,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          {kicker && <span className="eyebrow">{kicker}</span>}
          <h2>{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
export function Toggle({
  label,
  on,
  onChange,
  detail,
}: {
  label: string;
  on: boolean;
  onChange: () => void;
  detail?: string;
}) {
  return (
    <button
      className={`toggle ${on ? "on" : ""}`}
      role="switch"
      aria-checked={on}
      onClick={onChange}
      title={detail}
    >
      <span>
        {label}
        {detail && <small>{detail}</small>}
      </span>
      <span className="switch-track">
        <span />
      </span>
      <b>{on ? "ON" : "OFF"}</b>
    </button>
  );
}
export function ControlToggle({
  sim,
  name,
  label,
  detail,
}: {
  sim: Simulation;
  name: keyof Controls;
  label: string;
  detail?: string;
}) {
  return (
    <Toggle
      label={label}
      detail={detail}
      on={Boolean(sim.state.controls[name])}
      onChange={() => sim.update((s) => setControl(s, name, !s.controls[name]))}
    />
  );
}
export function Slider({
  sim,
  name,
  label,
  min,
  max,
  step = 1,
  unit = "",
  digits = 0,
}: {
  sim: Simulation;
  name: keyof Controls;
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  digits?: number;
}) {
  const id = useId(),
    value = Number(sim.state.controls[name]);
  return (
    <div className="slider-control">
      <label htmlFor={id}>
        {label}
        <output>
          {value.toFixed(digits)}
          <span> {unit}</span>
        </output>
      </label>
      <input
        id={id}
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          sim.update((s) => setControl(s, name, Number(e.target.value)))
        }
      />
      <div className="range-limits">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
export function Metric({
  label,
  value,
  unit = "",
  tone = "",
}: {
  label: string;
  value: number | string;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>
        {typeof value === "number" ? value.toFixed(1) : value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
export function FailureControls({
  sim,
  ids,
}: {
  sim: Simulation;
  ids: Failure[];
}) {
  const active = ids.filter((id) => sim.state.failures[id]);
  return (
    <div className="failure-controls">
      <div className="minor-heading">
        <AlertTriangle size={14} />
        <span>FAILURE INJECTION</span>
        <small>Tekrar tıkla: sinyali geri getir</small>
      </div>
      <div className="failure-buttons">
        {ids.map((id) => (
          <button
            key={id}
            aria-pressed={sim.state.failures[id]}
            className={sim.state.failures[id] ? "fault-active" : ""}
            onClick={() =>
              sim.update((s) => setFailure(s, id, !s.failures[id]))
            }
          >
            {sim.state.failures[id] ? (
              <AlertTriangle size={13} />
            ) : (
              <span className="empty-dot" />
            )}
            {failureInfo[id].name}
          </button>
        ))}
      </div>
      {active.map((id) => (
        <div className="fault-explanation" key={id}>
          <strong>{failureInfo[id].name}</strong>
          <span>
            <b>Kayıp yol:</b> {failureInfo[id].signal}
          </span>
          <p>{failureInfo[id].effect}</p>
        </div>
      ))}
      {active.length > 0 && (
        <p className="hint">
          Sinyali geri getirmek ayrılmış AP / YD / A/T sistemlerini otomatik
          bağlamaz; yeniden ON seç.
        </p>
      )}
    </div>
  );
}
export function Warnings({ s }: { s: State }) {
  return (
    <div
      className={`warning-strip ${s.warnings.length ? "caution" : ""}`}
      role="status"
    >
      {s.warnings.length ? <AlertTriangle size={16} /> : <Check size={16} />}
      <div>
        {s.warnings.length ? (
          s.warnings.map((w) => <span key={w}>{w}</span>)
        ) : (
          <span>
            SYSTEM MONITOR <b>Referanslar geçerli · etkin arıza yok</b>
          </span>
        )}
      </div>
    </div>
  );
}
export function FMA({ s }: { s: State }) {
  return (
    <div className="fma">
      <div>
        <span>THRUST</span>
        <strong>{s.controls.at ? "SPEED" : "MAN THR"}</strong>
        <small>
          {s.failures.atServo
            ? "SERVO FAIL"
            : `${Math.round(s.thrust * 100)}% THR`}
        </small>
      </div>
      <div>
        <span>LATERAL ACTIVE</span>
        <strong>{s.lateral}</strong>
        <small>{s.controls.ap ? "AP CMD" : "FD ONLY"}</small>
      </div>
      <div>
        <span>VERTICAL ACTIVE</span>
        <strong>{s.vertical}</strong>
        <small className="armed">
          {s.armed.length ? `ARMED ${s.armed.join(" · ")}` : "ARMED —"}
        </small>
      </div>
      <div>
        <span>ENGAGEMENT</span>
        <strong className={!s.controls.ap ? "amber" : ""}>
          {s.controls.ap ? "AP ENGAGED" : "AP OFF"}
        </strong>
        <small>{s.controls.yd ? "YD ON" : "YD OFF"}</small>
      </div>
    </div>
  );
}
/** Absolute multiples of `step` around `value`, so a tape can scroll with the true value. */
const tapeValues = (value: number, step: number, below: number, above: number) =>
  Array.from(
    { length: below + above + 1 },
    (_, i) => Math.floor(value / step) * step + (i - below) * step,
  );
export function PFD({ s }: { s: State }) {
  const clip = useId().replaceAll(":", "");
  const speedY = (v: number) => 167 - (v - s.speed) * 2.25,
    altitudeY = (v: number) => 167 - (v - s.altitude) * 0.12,
    // Labels are drawn only when they fit whole; ticks may be cut by the clip.
    labelFits = (y: number) => y > 48 && y < 290,
    ladderLabelFits = (x: number, v: number) => {
      const t = (-s.bank * Math.PI) / 180,
        y = (s.pitch - v) * 6;
      return (
        Math.abs(x * Math.cos(t) - y * Math.sin(t)) <= 80 &&
        Math.abs(x * Math.sin(t) + y * Math.cos(t)) <= 75
      );
    };
  return (
    <div className="pfd">
      <FMA s={s} />
      <svg
        viewBox="0 0 670 360"
        role="img"
        aria-label={`Primary Flight Display: heading ${s.heading.toFixed(0)}, altitude ${s.altitude.toFixed(0)} feet, bank ${s.bank.toFixed(1)}, pitch ${s.pitch.toFixed(1)}`}
      >
        <defs>
          <clipPath id={clip}>
            <rect x="142" y="32" width="386" height="266" rx="5" />
          </clipPath>
          <clipPath id={`${clip}-ladder`}>
            <rect x="245" y="84" width="180" height="162" />
          </clipPath>
          <clipPath id={`${clip}-speed`}>
            <rect x="50" y="40" width="74" height="258" />
          </clipPath>
          <clipPath id={`${clip}-altitude`}>
            <rect x="546" y="40" width="84" height="258" />
          </clipPath>
        </defs>
        <rect x="142" y="32" width="386" height="266" rx="5" fill="#182d3a" />
        <g clipPath={`url(#${clip})`}>
          <g
            transform={`translate(335 165) rotate(${-s.bank}) translate(0 ${s.pitch * 6})`}
          >
            <rect x="-450" y="-600" width="900" height="600" fill="#285b79" />
            <rect x="-450" y="0" width="900" height="600" fill="#63543f" />
            <path d="M-450 0H450" stroke="#e3eaf0" strokeWidth="2" />
          </g>
          <g clipPath={`url(#${clip}-ladder)`}>
            <g
              transform={`translate(335 165) rotate(${-s.bank}) translate(0 ${s.pitch * 6})`}
            >
              {[-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30].map((v) => (
                <g key={v} transform={`translate(0 ${-v * 6})`}>
                  <path
                    d={`M${v % 10 === 0 ? -56 : -28} 0H${v % 10 === 0 ? 56 : 28}`}
                    stroke="white"
                    strokeOpacity=".8"
                  />
                  {v % 10 === 0 && (
                    <>
                      {ladderLabelFits(-79, v) && (
                        <text x="-73" y="4" textAnchor="end">
                          {Math.abs(v)}
                        </text>
                      )}
                      {ladderLabelFits(79, v) && (
                        <text x="73" y="4">
                          {Math.abs(v)}
                        </text>
                      )}
                    </>
                  )}
                </g>
              ))}
            </g>
          </g>
        </g>
        <path
          d="M234.5 107A116 116 0 0 1 435.5 107"
          fill="none"
          stroke="#e2e6e9"
          strokeOpacity=".7"
        />
        {[-60, -30, -20, -10, 0, 10, 20, 30, 60].map((v) => (
          <path
            key={v}
            d="M335 49v-9"
            stroke="#e2e6e9"
            strokeWidth={v % 30 === 0 ? 3 : 1}
            transform={`rotate(${v} 335 165)`}
          />
        ))}
        <path
          d="M328 60l7-12 7 12z"
          fill="#e6b467"
          transform={`rotate(${-s.bank} 335 165)`}
        />
        <path
          d="M246 165h54v9h15m41 0h15v-9h54"
          fill="none"
          stroke="#edbe6c"
          strokeWidth="5"
        />
        <rect x="331" y="161" width="8" height="8" fill="#edbe6c" />
        <g stroke="#d5a1dc" strokeWidth="3">
          <path
            d={`M280 ${165 - clamp(s.pitchCommand - s.pitch, -10, 10) * 4}H390`}
          />
          <path
            d={`M${335 + clamp(s.bankCommand - s.bank, -25, 25) * 2} 126v78`}
          />
        </g>
        <text x="335" y="284" textAnchor="middle" className="pfd-small">
          BANK {s.bank.toFixed(1)}° · PITCH {s.pitch.toFixed(1)}°
        </text>
        <rect x="50" y="40" width="74" height="258" rx="3" fill="#192a35" />
        <g clipPath={`url(#${clip}-speed)`}>
          {tapeValues(s.speed, 10, 6, 7)
            .filter((v) => v >= 0)
            .map((v) => (
              <g key={v} transform={`translate(0 ${speedY(v)})`}>
                {v % 20 === 0 && labelFits(speedY(v)) && (
                  <text x="98" y="4" textAnchor="end">
                    {v}
                  </text>
                )}
                <path
                  d={v % 20 === 0 ? "M107 0h13" : "M113 0h7"}
                  stroke="#7d909b"
                />
              </g>
            ))}
        </g>
        <path d="M44 148h71l13 19-13 19H44z" fill="#0a121a" stroke="#e9eef0" />
        <text x="83" y="175" textAnchor="middle" className="pfd-number">
          {s.speed.toFixed(0)}
        </text>
        <text x="85" y="22" textAnchor="middle" className="cyan">
          {s.controls.selectedSpeed} KT
        </text>
        <rect x="546" y="40" width="84" height="258" rx="3" fill="#192a35" />
        <g clipPath={`url(#${clip}-altitude)`}>
          {tapeValues(s.altitude, 100, 11, 12)
            .filter((v) => v >= 0)
            .map((v) => (
              <g key={v} transform={`translate(0 ${altitudeY(v)})`}>
                {v % 200 === 0 && labelFits(altitudeY(v)) && (
                  <text x="621" y="4" textAnchor="end">
                    {v}
                  </text>
                )}
                <path
                  d={v % 200 === 0 ? "M549 0h10" : "M549 0h5"}
                  stroke="#7d909b"
                />
              </g>
            ))}
        </g>
        <path
          d="M633 148h-73l-13 19 13 19h73z"
          fill="#0a121a"
          stroke="#e9eef0"
        />
        <text x="595" y="175" textAnchor="middle" className="pfd-number">
          {s.altitude.toFixed(0)}
        </text>
        <text x="587" y="22" textAnchor="middle" className="cyan">
          {s.controls.selectedAltitude} FT
        </text>
        <text x="587" y="322" textAnchor="middle">
          V/S {s.vs > 0 ? "+" : ""}
          {s.vs.toFixed(0)}
        </text>
        <path d="M182 318H488" stroke="#566974" />
        {tapeValues(s.heading, 10, 8, 9)
          .filter((v) => Math.abs((v - s.heading) * 2) <= 150)
          .map((v) => (
            <g key={v} transform={`translate(${335 + (v - s.heading) * 2} 318)`}>
              <path d={v % 30 === 0 ? "M0 0v7" : "M0 0v4"} stroke="#92a3ad" />
              {v % 30 === 0 && (
                <text x="0" y="27" textAnchor="middle">
                  {(((v % 360) + 360) % 360).toString().padStart(3, "0")}
                </text>
              )}
            </g>
          ))}
        <rect
          x="301"
          y="306"
          width="68"
          height="25"
          rx="2"
          fill="#0b1720"
          stroke="#e6b467"
        />
        <text x="335" y="324" textAnchor="middle" className="amber">
          {Math.round(s.heading).toString().padStart(3, "0")}°
        </text>
        <text x="85" y="322" textAnchor="middle">
          GS {s.groundSpeed.toFixed(0)}
        </text>
        {(s.failures.airData || s.failures.attitude || s.failures.heading) && (
          <g>
            <rect x="162" y="213" width="346" height="32" fill="#4a2624" />
            <text x="335" y="234" textAnchor="middle" className="amber">
              SENSOR INVALID · TRUE VALUES SHOWN
            </text>
          </g>
        )}
      </svg>
      <div className="instrument-caption">
        <span>PRIMARY FLIGHT DISPLAY</span>
        <span>Magenta: FD command · Amber: aircraft reference</span>
      </div>
    </div>
  );
}
export function Aircraft({
  s,
  helicopter = false,
}: {
  s: State;
  helicopter?: boolean;
}) {
  // Orthographic projection of body-axis rotations through a tilted camera.
  // Wings move vertically in roll; yaw rotates the nose in the horizontal plane.
  const bank = (s.bank * Math.PI) / 180,
    pitch = (s.pitch * Math.PI) / 180,
    yaw = (s.yaw * Math.PI) / 180,
    camera = (35 * Math.PI) / 180;
  const a = Math.cos(bank) * Math.cos(yaw);
  const b =
    Math.cos(bank) * Math.sin(yaw) * Math.cos(camera) +
    Math.sin(bank) * Math.sin(camera);
  const c =
    Math.sin(pitch) * Math.sin(bank) * Math.cos(yaw) -
    Math.cos(pitch) * Math.sin(yaw);
  const d =
    (Math.sin(pitch) * Math.sin(bank) * Math.sin(yaw) +
      Math.cos(pitch) * Math.cos(yaw)) *
      Math.cos(camera) -
    Math.sin(pitch) * Math.cos(bank) * Math.sin(camera);
  return (
    <div className="aircraft-visual">
      <svg
        viewBox="0 0 620 350"
        role="img"
        aria-label={`${helicopter ? "Helikopter" : "Uçak"} tutumu: roll ${s.bank.toFixed(1)}, pitch ${s.pitch.toFixed(1)}, yaw ${s.yaw.toFixed(1)}`}
      >
        <defs>
          <radialGradient id="aircraft-glow">
            <stop stopColor="#3d5967" stopOpacity=".3" />
            <stop offset="1" stopColor="#13232e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aircraft-body" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d5e1e7" />
            <stop offset=".5" stopColor="#8da6b3" />
            <stop offset="1" stopColor="#425e6e" />
          </linearGradient>
        </defs>
        <ellipse
          cx="310"
          cy="176"
          rx="250"
          ry="166"
          fill="url(#aircraft-glow)"
        />
        {[55, 90, 130].map((r) => (
          <ellipse
            key={r}
            cx="310"
            cy="186"
            rx={r * 1.8}
            ry={r}
            fill="none"
            stroke="#46616f"
            opacity=".3"
            strokeDasharray="3 8"
          />
        ))}
        <path
          d="M60 186H560M310 30V318"
          stroke="#405d6d"
          strokeDasharray="4 7"
        />
        <text x="557" y="178">
          PITCH
        </text>
        <text x="317" y="34">
          ROLL
        </text>
        <text x="76" y="298">
          YAW
        </text>
        <g
          transform={`translate(310 ${180 - s.pitch}) matrix(${a} ${b} ${c} ${d} 0 0) translate(-310 -180)`}
        >
          {helicopter ? (
            <g>
              <path
                d="M284 190q-12-75 26-91 39 16 26 91l-15 15-5 79h-12l-5-79z"
                fill="url(#aircraft-body)"
              />
              <ellipse
                cx="310"
                cy="165"
                rx="38"
                ry="50"
                fill="none"
                stroke="#b4c4cd"
              />
              <path
                d="M309 138h-160m160 0h160m-160 0v-85m0 85v115"
                stroke="#c2d4dd"
                strokeWidth="8"
              />
              <path
                d="M268 177v76m83-76v76m-87 0h15m67 0h14M290 278h40"
                stroke="#839ead"
                strokeWidth="5"
              />
              <ellipse
                cx="310"
                cy="139"
                rx="164"
                ry="66"
                fill="none"
                stroke="#7cd2df"
                opacity=".25"
              />
            </g>
          ) : (
            <g>
              <path
                d="M309 54c-13 11-17 52-18 78L94 217l-9 22 207-45 4 64-48 30v13l61-16 63 16v-13l-48-30 4-64 207 45-9-22-197-85c-1-26-5-67-20-78z"
                fill="url(#aircraft-body)"
                stroke="#b9cdd6"
                strokeWidth="1.2"
              />
              <path
                d="M310 59v225M294 121h31"
                fill="none"
                stroke="#edf4f7"
                opacity=".5"
              />
              <path d="M298 96q11-14 24 0l-2 16h-21z" fill="#1a384b" />
              <path
                d="M117 220l83-26 5 16-92 21z"
                fill="#77cedb"
                transform={`rotate(${s.aileron} 157 218)`}
              />
              <path
                d="M420 193l81 27 5 11-91-21z"
                fill="#77cedb"
                transform={`rotate(${-s.aileron} 460 218)`}
              />
              <path
                d="M270 281l27-16 1 14-29 10m51-10 1-14 28 16 1 8"
                fill="#e0b978"
                transform={`translate(0 ${s.elevator * 0.6})`}
              />
              <path
                d="M310 237l5 40-5 8-5-8z"
                fill="#a0cbb7"
                transform={`rotate(${s.rudder} 310 240)`}
              />
              <path
                d="M230 182v31m160-31v31"
                stroke="#415e6f"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
        <text x="66" y="332" className="pfd-small">
          SCHEMATIC ATTITUDE VIEW · NOT TO SCALE
        </text>
      </svg>
      <div className="attitude-readout">
        <Metric label="ROLL" value={s.bank} unit="°" />
        <Metric label="PITCH" value={s.pitch} unit="°" />
        <Metric label="YAW / SIDESLIP" value={s.yaw} unit="°" />
      </div>
    </div>
  );
}
const colors = ["#7cd2df", "#e0b978", "#b6a2d5", "#95c9aa"];
export function Chart({
  history,
  series,
  title,
  unit,
}: {
  history: Sample[];
  series: { key: keyof Sample; name: string }[];
  title: string;
  unit: string;
}) {
  const values = history.flatMap((s) => series.map((v) => s[v.key]));
  let low = Math.min(...values, 0),
    high = Math.max(...values, 1);
  const pad = (high - low) * 0.12;
  low -= pad;
  high += pad;
  const start = history[0]?.time ?? 0,
    end = history.at(-1)?.time ?? 1;
  const x = (t: number) => 46 + ((t - start) / Math.max(1, end - start)) * 602;
  const y = (v: number) => 145 - ((v - low) / (high - low)) * 122;
  return (
    <div className="chart">
      <div className="chart-heading">
        <h3>
          <Activity size={15} />
          {title}
        </h3>
        <span>{unit} / t (s)</span>
      </div>
      <svg
        viewBox="0 0 670 178"
        role="img"
        aria-label={`${title}; ${series.map((v) => `${v.name}: ${history.at(-1)?.[v.key].toFixed(1) ?? 0} ${unit}`).join(", ")}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <path
              d={`M46 ${23 + 122 * v}H648`}
              stroke="#344a59"
              strokeDasharray="3 5"
            />
            <text x="37" y={27 + 122 * v} textAnchor="end">
              {(high - v * (high - low)).toFixed(Math.abs(high) > 100 ? 0 : 1)}
            </text>
          </g>
        ))}
        {series.map((v, i) => (
          <polyline
            key={v.key}
            points={history
              .map((p) => `${x(p.time).toFixed(1)},${y(p[v.key]).toFixed(1)}`)
              .join(" ")}
            fill="none"
            stroke={colors[i % 4]}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <text x="46" y="169">
          {start.toFixed(0)} s
        </text>
        <text x="648" y="169" textAnchor="end">
          {end.toFixed(1)} s
        </text>
      </svg>
      <div className="chart-legend">
        {series.map((v, i) => (
          <span key={v.key}>
            <i style={{ background: colors[i % 4] }} />
            {v.name}
            <b>{history.at(-1)?.[v.key].toFixed(1) ?? "0"}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
export function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="button secondary" onClick={onClick}>
      <RotateCcw size={14} />
      RESET
    </button>
  );
}
export function Chain({
  items,
  active = 0,
}: {
  items: string[];
  active?: number;
}) {
  return (
    <div className="trace-chain">
      {items.map((item, i) => (
        <div key={`${item}-${i}`}>
          <span
            className={i === active ? "current" : i < active ? "passed" : ""}
          >
            {item}
          </span>
          {i < items.length - 1 && <ChevronRight size={14} />}
        </div>
      ))}
    </div>
  );
}
