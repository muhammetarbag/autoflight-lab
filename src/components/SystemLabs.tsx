import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  MapPin,
  Play,
  Search,
  SkipForward,
  Square,
  Zap,
} from "lucide-react";
import {
  components,
  interfaceIds,
  loopIds,
  type ComponentInfo,
} from "../content/course";
import { headingError, selectMode, setControl } from "../sim/engine";
import type { Simulation } from "../sim/useSimulation";
import { Chain, Metric, Panel, Slider } from "./Instruments";

export function ComponentCard({ component }: { component: ComponentInfo }) {
  return (
    <article className="component-detail">
      <span className="component-family">
        <CircuitBoard size={14} />
        {component.family} <span>·</span> {component.location}
      </span>
      <h3>{component.name}</h3>
      <p>{component.purpose}</p>
      <dl>
        <div>
          <dt>INPUT</dt>
          <dd>{component.input}</dd>
        </div>
        <div>
          <dt>PROCESSING</dt>
          <dd>{component.process}</dd>
        </div>
        <div>
          <dt>OUTPUT</dt>
          <dd>{component.output}</dd>
        </div>
        <div>
          <dt>INTERFACE / FUNCTION</dt>
          <dd>{component.related}</dd>
        </div>
        <div className="detail-failure">
          <dt>IF IT FAILS</dt>
          <dd>{component.failure}</dd>
        </div>
      </dl>
    </article>
  );
}
export function FundamentalsLab({ sim }: { sim: Simulation }) {
  const [active, setActive] = useState(0),
    [selected, setSelected] = useState("fcc"),
    [stepping, setStepping] = useState(false);
  useEffect(() => {
    if (stepping || !sim.running) return;
    const timer = setInterval(() => setActive((v) => (v + 1) % 9), 850);
    return () => clearInterval(timer);
  }, [stepping, sim.running]);
  const s = sim.state,
    component = components.find((v) => v.id === selected)!;
  const signals = [
    `${s.controls.selectedHeading}° HDG`,
    "HDG request",
    `e = ${headingError(s.controls.selectedHeading, s.heading).toFixed(1)}°`,
    `${s.bankCommand.toFixed(1)}° bank cmd`,
    `${s.aileron.toFixed(1)}° aileron`,
    "Aerodynamic moment",
    `${s.heading.toFixed(1)}° heading`,
    `${s.heading.toFixed(1)}° feedback`,
  ];
  const labels = [
    "Command Input",
    "Mode Control / Reference",
    "Flight Control Computer",
    "Command Processing",
    "Servo / Actuator",
    "Control Surface",
    "Aircraft Response",
    "Sensors / Transducers",
  ];
  return (
    <>
      <Panel
        title="Komuttan feedback’e, kapalı çevrim"
        kicker="AUTOMATIC FLIGHT CONTROL"
        aside={
          <div className="button-row">
            <button
              className={`button ${stepping ? "primary" : "secondary"}`}
              aria-pressed={stepping}
              onClick={() => setStepping((v) => !v)}
            >
              {stepping ? <Square size={14} /> : <SkipForward size={14} />}Adım
              modu {stepping ? "ON" : "OFF"}
            </button>
            <button
              className="button secondary"
              onClick={() => {
                setStepping(true);
                setActive((v) => (v + 1) % 9);
              }}
            >
              Sonraki sinyal
              <ArrowRight size={14} />
            </button>
          </div>
        }
      >
        <div className="loop-grid">
          {loopIds.map((id, i) => (
            <button
              className={`loop-node ${selected === id ? "selected" : ""} ${active === i ? "signal-active" : ""}`}
              key={id}
              onClick={() => setSelected(id)}
            >
              <span className="node-sequence">
                {String(i + 1).padStart(2, "0")}
                {active === i && <i />}
              </span>
              <strong>{labels[i]}</strong>
              <code>{signals[i]}</code>
              <ArrowRight className="node-arrow" size={20} />
            </button>
          ))}
        </div>
        <button
          className={`feedback-return ${active === 8 ? "signal-active" : ""}`}
          onClick={() => {
            setSelected("fcc");
            setActive(8);
            setStepping(true);
          }}
        >
          <span>↶</span>
          <b>FEEDBACK TO FCC</b>
          <span>Ölçüm, referansla yeniden karşılaştırılır</span>
          <code>e = reference − measured</code>
        </button>
        <div className="loop-progress">
          <span>STAGE {active + 1} / 9</span>
          <b>
            {active === 8
              ? "Feedback → Flight Control Computer"
              : labels[active]}
          </b>
          <span>{stepping ? "MANUAL STEP" : "ANIMATED TRACE"}</span>
        </div>
      </Panel>
      <div className="two-column">
        <Panel title="İçeri gir: bileşeni incele" kicker="LEARN">
          <ComponentCard component={component} />
        </Panel>
        <Panel title="Referansı değiştir" kicker="EXPERIMENT">
          <Slider
            sim={sim}
            name="selectedHeading"
            label="Commanded heading"
            min={0}
            max={359}
            unit="°"
          />
          <div className="metric-row">
            <Metric label="MEASURED" value={s.heading} unit="°" />
            <Metric
              label="ERROR"
              value={headingError(s.controls.selectedHeading, s.heading)}
              unit="°"
            />
          </div>
          <p className="hint">
            Adım modu sinyal yolunun görsel anlatımını durdurur. Fiziksel uçuş
            modeli, üstteki duraklat düğmesine kadar çalışır.
          </p>
          <button
            className="button primary"
            onClick={() =>
              sim.update((v) => setControl(v, "selectedHeading", 150))
            }
          >
            090° → 150° deneyini uygula
            <ArrowRight size={16} />
          </button>
          <div className="live-explanation">
            <b>COMMAND SIGNAL PROCESSING</b>
            <p>
              Bu modelde heading error × 0.65, ±25° bank limitiyle işlenir.
              Roll-rate feedback ve actuator gecikmesi hareketi sönümler.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
const locations = [
  { name: "Flight compartment", label: "Flight compartment", x: 10, y: 38 },
  { name: "Instrument panel", label: "Instrument panel", x: 23, y: 20 },
  {
    name: "Electronic equipment compartment",
    label: "Electronic equipment",
    x: 31,
    y: 69,
  },
  { name: "Tailcone", label: "Tailcone", x: 84, y: 31 },
  { name: "Wheel well", label: "Wheel well", x: 53, y: 82 },
  { name: "Wings", label: "Wings / servos", x: 58, y: 38 },
  { name: "Lower fuselage", label: "Radio altitude antennas", x: 70, y: 69 },
  { name: "Nose / fuselage", label: "Air data probes", x: 12, y: 77 },
  { name: "Airframe", label: "Airframe sensors", x: 53, y: 13 },
];
export function ArchitectureLab() {
  const [location, setLocation] = useState("Electronic equipment compartment");
  const found = components.filter((v) => v.location === location);
  const [selected, setSelected] = useState("fcc");
  const component = found.find((v) => v.id === selected) ?? found[0];
  return (
    <>
      <Panel
        title="Autoflight sisteminin uçaktaki izleri"
        kicker="REPRESENTATIVE COMPONENT LOCATIONS"
      >
        <div className="aircraft-cutaway">
          <svg
            viewBox="0 0 1050 365"
            role="img"
            aria-label="Temsilî uçak kesiti ve bileşen konumları"
          >
            <defs>
              <linearGradient id="cutaway-body" x2="0" y2="1">
                <stop stopColor="#466170" />
                <stop offset="1" stopColor="#233e4e" />
              </linearGradient>
            </defs>
            <path
              d="M51 206Q71 155 171 150L771 150 873 41 901 45 870 150 1007 187 1010 211 849 233H170Q91 232 51 206Z"
              fill="url(#cutaway-body)"
              stroke="#8fabb7"
              strokeWidth="1.5"
            />
            <path
              d="M71 205H983M190 152v76m70-76v76m70-76v76m70-76v76m70-76v76m70-76v76m70-76v76m70-76v76m70-76v76m70-76v76"
              stroke="#6f8b9a"
              opacity=".35"
            />
            <path
              d="M125 163l-29 20h65l11-20z"
              fill="#122d3f"
              stroke="#93b6c7"
            />
            <path
              d="M458 177l99-2 167 106-41 6-225-76z"
              fill="#4b687a"
              stroke="#92afbc"
            />
            <path
              d="M861 187l100 62-27 8-107-48"
              fill="#496576"
              stroke="#8faab9"
            />
            <path
              d="M500 230v28h27m-336-28v28h23"
              stroke="#9daeb2"
              strokeWidth="4"
            />
            <circle cx="520" cy="267" r="12" fill="#13232a" stroke="#758f9b" />
            <circle cx="207" cy="267" r="10" fill="#13232a" stroke="#758f9b" />
            <rect
              x="213"
              y="198"
              width="96"
              height="29"
              rx="3"
              fill="#68aab2"
              opacity=".45"
            />
            <path d="M189 218H836" stroke="#79cbd3" strokeDasharray="6 7" />
            <text x="52" y="340">
              GENERIC TRANSPORT AIRCRAFT · LOCATION MAP
            </text>
          </svg>
          {locations.map((v) => (
            <button
              key={v.name}
              className={`location-pin ${v.name === location ? "selected" : ""}`}
              style={{ left: `${v.x}%`, top: `${v.y}%` }}
              onClick={() => {
                setLocation(v.name);
                setSelected("");
              }}
              aria-pressed={v.name === location}
            >
              <MapPin size={14} />
              <span>{v.label}</span>
            </button>
          ))}
        </div>
        <div className="location-mobile-list">
          {locations.map((v) => (
            <button
              key={v.name}
              aria-pressed={location === v.name}
              onClick={() => {
                setLocation(v.name);
                setSelected("");
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="model-notice">
          Exact component locations vary between aircraft types. Bu konumlar
          temsilîdir; gerçek yerleşim AMM / aircraft documentation ile
          doğrulanır.
        </p>
      </Panel>
      <div className="two-column">
        <Panel title={location} kicker="BU KONUMDAKİ TEMSİLÎ BİLEŞENLER">
          <div className="component-list">
            {found.map((v) => (
              <button
                key={v.id}
                className={component.id === v.id ? "selected" : ""}
                onClick={() => setSelected(v.id)}
              >
                <CircuitBoard size={18} />
                <span>
                  {v.name}
                  <small>{v.family}</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Fiziksel işlev & arayüz" kicker="COMPONENT CARD">
          <ComponentCard component={component} />
        </Panel>
      </div>
    </>
  );
}
export function InterfacesLab({ sim }: { sim: Simulation }) {
  const [selected, setSelected] = useState("mcp"),
    [trace, setTrace] = useState(false),
    [stage, setStage] = useState(0);
  const traceItems = [
    "Selected Altitude",
    "Mode Control Panel",
    "Flight Control Computer",
    "Pitch command",
    "Elevator servo",
    "Aircraft response",
    "Air data feedback",
    "FCC",
  ];
  useEffect(() => {
    if (!trace || !sim.running) return;
    const timer = setInterval(() => setStage((v) => (v + 1) % 8), 850);
    return () => clearInterval(timer);
  }, [trace, sim.running]);
  const component = components.find((v) => v.id === selected)!;
  return (
    <>
      <Panel
        title="Flight Control Computer arayüzleri"
        kicker="SYSTEM INTERFACE EXPLORER"
        aside={<span className="hardware-label">12 INTERFACES</span>}
      >
        <div className="interface-board">
          <svg
            viewBox="0 0 1000 426"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {interfaceIds.map((id, i) => {
              const left = i < 6,
                y = 36 + (i % 6) * 70;
              const path = `M${left ? 235 : 765} ${y}H${left ? 320 : 680}L${left ? 435 : 565} 213`;
              return (
                <g key={id}>
                  <path
                    d={path}
                    fill="none"
                    stroke={id === selected ? "#7cd2df" : "#344f60"}
                    strokeWidth={id === selected ? 3 : 1.5}
                    strokeDasharray={id === selected ? "7 7" : undefined}
                    className={
                      id === selected && sim.running ? "flow-line" : ""
                    }
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="18"
                    style={{ pointerEvents: "stroke", cursor: "pointer" }}
                    onClick={() => setSelected(id)}
                  >
                    <title>
                      {components.find((v) => v.id === id)!.name} bağlantısı
                    </title>
                  </path>
                </g>
              );
            })}
          </svg>
          <div className="interface-ports">
            {interfaceIds.map((id) => {
              const c = components.find((v) => v.id === id)!;
              return (
                <button
                  key={id}
                  className={id === selected ? "selected" : ""}
                  onClick={() => setSelected(id)}
                  aria-pressed={id === selected}
                >
                  <span className="port-dot" />
                  <span>{c.name}</span>
                  <ArrowRight size={13} />
                </button>
              );
            })}
          </div>
          <div className="fcc-center">
            <Cpu size={38} />
            <strong>FCC</strong>
            <span>
              COMPUTE · CONTROL
              <br />
              MONITOR
            </span>
            <small>
              <i />
              POWER VALID
            </small>
          </div>
        </div>
      </Panel>
      <div className="two-column">
        <Panel title="Seçilen bağlantı" kicker="DATA / DEPENDENCIES">
          <ComponentCard component={component} />
        </Panel>
        <Panel title="Bir altitude sinyalini takip et" kicker="TRACE SIGNAL">
          <div className="button-row">
            <button
              className={`button ${trace ? "secondary" : "primary"}`}
              onClick={() => {
                setTrace((v) => !v);
                if (!trace) {
                  setStage(0);
                  sim.update((s) =>
                    selectMode(
                      setControl(s, "selectedAltitude", 3500),
                      "ALT ACQ",
                    ),
                  );
                }
              }}
            >
              {trace ? <Square size={15} /> : <Play size={15} />}Trace Signal{" "}
              {trace ? "durdur" : "başlat"}
            </button>
            <button
              className="button secondary"
              onClick={() => {
                setTrace(false);
                setStage((v) => (v + 1) % 8);
              }}
            >
              Sonraki adım
              <SkipForward size={14} />
            </button>
          </div>
          <Chain items={traceItems} active={stage} />
          <div className="live-explanation">
            <b>{traceItems[stage]}</b>
            <p>
              Selected altitude {sim.state.controls.selectedAltitude} ft →
              gerçek irtifa {sim.state.altitude.toFixed(0)} ft. FCC pitch talebi{" "}
              {sim.state.pitchCommand.toFixed(1)}°, elevator{" "}
              {sim.state.elevator.toFixed(1)}°.
            </p>
          </div>
          <p className="hint">
            Trace başlatmak 3500 ft hedefi ve ALT ACQ modunu seçer. Görsel
            adımlar haberleşme bus zamanlamasını temsil etmez.
          </p>
        </Panel>
      </div>
    </>
  );
}
export function ComponentsLab() {
  const [query, setQuery] = useState(""),
    [family, setFamily] = useState("All"),
    [selected, setSelected] = useState("mcp");
  const families = ["All", ...new Set(components.map((v) => v.family))];
  const filtered = components.filter(
    (v) =>
      (family === "All" || v.family === family) &&
      `${v.name} ${v.purpose} ${v.related}`
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")),
  );
  const component = components.find((v) => v.id === selected)!;
  return (
    <>
      <Panel
        title="Bileşeni bul, işlevi ilişkilendir"
        kicker="COMPONENT LIBRARY"
        aside={
          <span className="hardware-label">{components.length} COMPONENTS</span>
        }
      >
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Bileşen ara"
            placeholder="FCC, servo, altitude…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span>{filtered.length} sonuç</span>
        </div>
        <div className="filter-buttons">
          {families.map((v) => (
            <button
              key={v}
              aria-pressed={family === v}
              onClick={() => setFamily(v)}
            >
              {v === "All" ? "Tümü" : v}
            </button>
          ))}
        </div>
      </Panel>
      <div className="component-browser">
        <div className="component-card-grid">
          {filtered.map((v) => (
            <button
              className={`component-tile ${selected === v.id ? "selected" : ""}`}
              key={v.id}
              onClick={() => setSelected(v.id)}
              aria-pressed={selected === v.id}
            >
              <span className="tile-icon">
                {v.family === "Controller" ? (
                  <Cpu />
                ) : v.family === "Interface" ? (
                  <Zap />
                ) : (
                  <CircuitBoard />
                )}
              </span>
              <small>{v.family}</small>
              <strong>{v.name}</strong>
              <p>{v.purpose}</p>
              <span className="tile-link">
                Bileşeni incele
                <ArrowRight size={15} />
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search />
              <h3>Eşleşen bileşen yok</h3>
              <p>Başka bir terim dene veya filtreyi Tümü yap.</p>
            </div>
          )}
        </div>
        <Panel title="Component detail" kicker="PHYSICAL / FUNCTIONAL">
          <ComponentCard component={component} />
          <div className="detail-note">
            <CheckCircle2 size={15} />
            İşlevler geneldir; fiziksel tasarım uçak tipine göre değişir.
          </div>
        </Panel>
      </div>
    </>
  );
}
