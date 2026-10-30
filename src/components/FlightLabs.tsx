import {
  ArrowUpRight,
  Crosshair,
  PlaneLanding,
  Radio,
  Wind,
} from "lucide-react";
import type { Simulation } from "../sim/useSimulation";
import {
  disturb,
  headingError,
  selectMode,
  setControl,
  setFailure,
  type Failure,
  type State,
} from "../sim/engine";
import {
  Aircraft,
  Chart,
  ControlToggle,
  FailureControls,
  FMA,
  Metric,
  Panel,
  PFD,
  Slider,
  Warnings,
} from "./Instruments";

export function ModePanel({ sim }: { sim: Simulation }) {
  const s = sim.state;
  const modeButtons = [
    "HDG",
    "NAV",
    "ALT HOLD",
    "ALT ACQ",
    "VS",
    "APP",
    "GA",
  ] as const;
  return (
    <Panel
      title="Mode Control Panel"
      kicker="COMMAND / REFERENCE"
      className="mcp-panel"
      aside={<span className="hardware-label">MCP–22</span>}
    >
      <div className="mcp-switches">
        <ControlToggle sim={sim} name="ap" label="AUTOPILOT" />
        <ControlToggle sim={sim} name="yd" label="YAW DAMPER" />
      </div>
      <div className="mode-buttons">
        {modeButtons.map((mode) => (
          <button
            key={mode}
            aria-pressed={
              mode === "APP"
                ? ["LOC", "LOC INT"].includes(s.lateral)
                : mode === "NAV"
                  ? s.lateral.startsWith("NAV")
                  : mode === "GA"
                    ? s.vertical === "GA"
                    : s.lateral === mode || s.vertical === mode
            }
            onClick={() => sim.update((v) => selectMode(v, mode))}
            title={
              mode === "ALT HOLD"
                ? "Mevcut irtifayı tut"
                : mode === "ALT ACQ"
                  ? "Selected altitude değerine tırman / alçal"
                  : mode === "GA"
                    ? "Go-around guidance"
                    : `${mode} seç`
            }
          >
            {mode === "GA" ? "GO AROUND" : mode}
            <i />
          </button>
        ))}
      </div>
      <Slider
        sim={sim}
        name="selectedHeading"
        label="Selected heading"
        min={0}
        max={359}
        unit="°"
      />
      <Slider
        sim={sim}
        name="selectedAltitude"
        label="Selected altitude"
        min={500}
        max={15000}
        step={100}
        unit="ft"
      />
      <Slider
        sim={sim}
        name="selectedVS"
        label="Vertical speed target"
        min={-2000}
        max={2000}
        step={100}
        unit="ft/min"
      />
      <Slider
        sim={sim}
        name="selectedSpeed"
        label="Selected airspeed"
        min={100}
        max={280}
        unit="kt"
      />
      <div className="mcp-note">
        <Crosshair size={15} />
        <span>
          <b>ALT HOLD</b> mevcut irtifayı tutar. Yeni hedefe geçiş için{" "}
          <b>ALT ACQ</b> seç. <b>NAV INT</b> bu modelin otomatik intercept
          yardımcısıdır.
        </span>
      </div>
    </Panel>
  );
}
function Disturbances({
  sim,
  all = false,
}: {
  sim: Simulation;
  all?: boolean;
}) {
  return (
    <div className="disturbance-controls">
      <div className="minor-heading">
        <Wind size={14} />
        DİNAMİK BOZUCU
      </div>
      <div className="button-row">
        {(["roll", "pitch", "yaw"] as const).map((axis) => (
          <button
            className="button secondary"
            key={axis}
            onClick={() => sim.update((s) => disturb(s, axis))}
          >
            {axis.toUpperCase()} darbesi
          </button>
        ))}
        {all && (
          <button
            className="button secondary"
            onClick={() => sim.update((s) => disturb(s, "all"))}
          >
            Üç eksen
          </button>
        )}
      </div>
      <Slider
        sim={sim}
        name="disturbance"
        label="Disturbance strength"
        min={1}
        max={12}
        unit="°/s"
      />
      <Slider
        sim={sim}
        name="turbulence"
        label="Turbulence"
        min={0}
        max={5}
        step={0.1}
        digits={1}
        unit="model"
      />
    </div>
  );
}
function CommandTelemetry({ s }: { s: State }) {
  return (
    <Panel title="Command → Response" kicker="LIVE TELEMETRY">
      <div className="telemetry-table">
        <div className="table-label">
          <span>SİNYAL</span>
          <span>FCC</span>
          <span>YANIT</span>
        </div>
        {[
          ["Bank", `${s.bankCommand.toFixed(1)}°`, `${s.bank.toFixed(1)}°`],
          ["Pitch", `${s.pitchCommand.toFixed(1)}°`, `${s.pitch.toFixed(1)}°`],
          [
            "Rudder",
            `${s.rudderCommand.toFixed(1)}°`,
            `${s.rudder.toFixed(1)}°`,
          ],
          [
            "Thrust",
            `${(s.thrustCommand * 100).toFixed(0)}%`,
            `${(s.thrust * 100).toFixed(0)}%`,
          ],
          ["Aileron position", "Servo", `${s.aileron.toFixed(1)}°`],
          ["Elevator position", "Servo", `${s.elevator.toFixed(1)}°`],
          ["Trim position", "Actuator", `${s.trim.toFixed(2)}°`],
          [
            "Yaw-rate sensor",
            s.failures.yawSensor ? "INVALID" : "VALID",
            `${s.yawRate.toFixed(2)}°/s`,
          ],
          [
            "Air data",
            s.failures.airData ? "INVALID" : "VALID",
            `${s.speed.toFixed(0)} kt`,
          ],
          [
            "NAV deviation",
            s.failures.nav ? "INVALID" : "VALID",
            `${s.navDeviation.toFixed(2)} nm`,
          ],
        ].map((row) => (
          <div key={row[0]}>
            {row.map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
        ))}
      </div>
      <p className="hint">
        Arızalı sensörler INVALID olarak işaretlenir. Son sütunda fiziksel
        modelin gerçek değeri eğitim amacıyla görülebilir.
      </p>
    </Panel>
  );
}
export function ModesLab({
  sim,
  sandbox = false,
}: {
  sim: Simulation;
  sandbox?: boolean;
}) {
  const s = sim.state;
  return (
    <>
      <div className="flight-grid">
        <div className="main-stack">
          <Panel
            title="Uçuşu komuta et"
            kicker="EXPERIMENT / OBSERVE"
            aside={
              <span className="live-tag">
                <i />
                LIVE DATA
              </span>
            }
          >
            <PFD s={s} />
            <div className="metric-row">
              <Metric
                label="HEADING ERROR"
                value={headingError(s.controls.selectedHeading, s.heading)}
                unit="°"
              />
              <Metric
                label="ALT TARGET ERROR"
                value={s.controls.selectedAltitude - s.altitude}
                unit="ft"
              />
              <Metric
                label="SPEED ERROR"
                value={s.controls.selectedSpeed - s.speed}
                unit="kt"
              />
            </div>
          </Panel>
          <Warnings s={s} />
          <div className="two-column charts-row">
            <Chart
              history={sim.history}
              title="Tutum yanıtı"
              unit="°"
              series={[
                { key: "bank", name: "Bank" },
                { key: "pitch", name: "Pitch" },
              ]}
            />
            <Chart
              history={sim.history}
              title="İrtifa"
              unit="ft"
              series={[{ key: "altitude", name: "Altitude" }]}
            />
          </div>
        </div>
        <ModePanel sim={sim} />
      </div>
      {sandbox ? (
        <>
          <div className="two-column">
            <Panel title="Ortam & yardımcı sistemler" kicker="FREE EXPERIMENT">
              <div className="two-column compact">
                <div>
                  <ControlToggle sim={sim} name="at" label="AUTOTHROTTLE" />
                  <ControlToggle
                    sim={sim}
                    name="autoTrim"
                    label="AUTOMATIC TRIM"
                  />
                  <Slider
                    sim={sim}
                    name="wind"
                    label="Headwind / tailwind"
                    min={-40}
                    max={40}
                    unit="kt"
                  />
                  <Slider
                    sim={sim}
                    name="crosswind"
                    label="Crosswind"
                    min={-25}
                    max={25}
                    unit="kt"
                  />
                </div>
                <Disturbances sim={sim} all />
              </div>
            </Panel>
            <CommandTelemetry s={s} />
          </div>
          <div className="two-column">
            <Aircraft s={s} />
            <Chart
              history={sim.history}
              title="Hava hızı"
              unit="kt"
              series={[
                { key: "speed", name: "IAS" },
                { key: "targetSpeed", name: "Target" },
              ]}
            />
          </div>
          <FailureControls
            sim={sim}
            ids={[
              "airData",
              "attitude",
              "heading",
              "nav",
              "loc",
              "gs",
              "ra",
              "yawSensor",
              "rollServo",
              "pitchServo",
              "trim",
              "atServo",
              "sensorDisagree",
              "power",
            ]}
          />
        </>
      ) : (
        <FailureControls
          sim={sim}
          ids={["heading", "airData", "rollServo", "pitchServo", "ap"]}
        />
      )}
    </>
  );
}
export function AxesLab({ sim }: { sim: Simulation }) {
  const s = sim.state;
  return (
    <>
      <div className="flight-grid">
        <Panel title="Üç eksen, tek kontrol çevrimi" kicker="AIRCRAFT RESPONSE">
          <Aircraft s={s} />
          <div className="metric-row">
            <Metric label="HEADING" value={s.heading} unit="°" />
            <Metric label="ALTITUDE" value={s.altitude} unit="ft" />
            <Metric label="VERTICAL SPEED" value={s.vs} unit="ft/min" />
          </div>
          <Chart
            history={sim.history}
            title="Tutum geçmişi"
            unit="°"
            series={[
              { key: "bank", name: "Roll" },
              { key: "pitch", name: "Pitch" },
              { key: "yaw", name: "Yaw" },
            ]}
          />
        </Panel>
        <Panel title="Kanal kontrolü" kicker="EXPERIMENT">
          <ControlToggle sim={sim} name="rollOn" label="ROLL CHANNEL" />
          <Slider
            sim={sim}
            name="selectedBank"
            label="Selected bank"
            min={-30}
            max={30}
            unit="°"
          />
          <ControlToggle sim={sim} name="pitchOn" label="PITCH CHANNEL" />
          <Slider
            sim={sim}
            name="selectedPitch"
            label="Selected pitch"
            min={-10}
            max={12}
            unit="°"
          />
          <ControlToggle sim={sim} name="yawOn" label="YAW CHANNEL" />
          <Slider
            sim={sim}
            name="selectedYaw"
            label="Selected yaw / sideslip"
            min={-5}
            max={5}
            step={0.5}
            unit="°"
            digits={1}
          />
          <ControlToggle sim={sim} name="yd" label="YAW DAMPER" />
          <Slider
            sim={sim}
            name="crosswind"
            label="Crosswind"
            min={-25}
            max={25}
            unit="kt"
          />
        </Panel>
      </div>
      <div className="three-column">
        <Panel title="ROLL" kicker="AILERON">
          <Metric
            label="ROLL ERROR"
            value={s.controls.selectedBank - s.bank}
            unit="°"
          />
          <Metric label="AILERON" value={s.aileron} unit="°" />
          <Metric label="ROLL RATE" value={s.rollRate} unit="°/s" />
        </Panel>
        <Panel title="PITCH" kicker="ELEVATOR">
          <Metric
            label="PITCH ERROR"
            value={s.controls.selectedPitch - s.pitch}
            unit="°"
          />
          <Metric label="ELEVATOR" value={s.elevator} unit="°" />
          <Metric label="PITCH RATE" value={s.pitchRate} unit="°/s" />
        </Panel>
        <Panel title="YAW" kicker="RUDDER">
          <Metric
            label="YAW ERROR"
            value={s.controls.selectedYaw - s.yaw}
            unit="°"
          />
          <Metric label="RUDDER" value={s.rudder} unit="°" />
          <Metric label="YAW RATE" value={s.yawRate} unit="°/s" />
        </Panel>
      </div>
      <Panel title="Bozucu uygula" kicker="EXPERIMENT">
        <Disturbances sim={sim} />
      </Panel>
      <Warnings s={s} />
      <FailureControls
        sim={sim}
        ids={["rollServo", "pitchServo", "yawSensor"]}
      />
    </>
  );
}
export function YawLab({ sim }: { sim: Simulation }) {
  const s = sim.state;
  return (
    <>
      <div className="flight-grid">
        <Panel
          title="Salınımı gör. Feedback’i izle."
          kicker="YAW DAMPER EXPERIMENT"
        >
          <Aircraft s={s} />
          <div className="signal-readout">
            <span>
              Yaw-rate sensor{" "}
              <b>
                {s.failures.yawSensor
                  ? "INVALID"
                  : `${s.yawRate.toFixed(2)}°/s`}
              </b>
            </span>
            <ArrowUpRight />
            <span>
              YD command <b>{s.rudderCommand.toFixed(2)}°</b>
            </span>
            <ArrowUpRight />
            <span>
              Rudder <b>{s.rudder.toFixed(2)}°</b>
            </span>
          </div>
        </Panel>
        <Panel title="Damping kontrolü" kicker="EXPERIMENT">
          <ControlToggle sim={sim} name="yd" label="YAW DAMPER" />
          <Slider
            sim={sim}
            name="disturbance"
            label="Disturbance strength"
            min={1}
            max={12}
            unit="°/s"
          />
          <button
            className="button primary wide"
            onClick={() => sim.update((v) => disturb(v, "yaw"))}
          >
            <Wind size={16} />
            Yaw darbesi uygula
          </button>
          <Slider
            sim={sim}
            name="damping"
            label="Damping strength"
            min={0}
            max={3}
            step={0.1}
            digits={1}
          />
          <Slider
            sim={sim}
            name="sensitivity"
            label="Aircraft response sensitivity"
            min={0.5}
            max={2}
            step={0.1}
            digits={1}
          />
          <div className="live-explanation">
            <b>
              {s.controls.yd ? "YD ON · RATE FEEDBACK" : "YD OFF · DOĞAL SÖNÜM"}
            </b>
            <p>
              {s.controls.yd
                ? `Yaw rate ${s.yawRate.toFixed(2)}°/s; bilgisayar ters yönde ${s.rudderCommand.toFixed(2)}° rudder istiyor.`
                : "Rudder damping komutu yok. Aynı darbe, hafif doğal sönümlü modelde daha uzun salınım üretir."}
            </p>
          </div>
        </Panel>
      </div>
      <div className="two-column">
        <Chart
          history={sim.history}
          title="Yaw rate / time"
          unit="°/s"
          series={[{ key: "yawRate", name: "Yaw rate" }]}
        />
        <Chart
          history={sim.history}
          title="Rudder deflection / time"
          unit="°"
          series={[{ key: "rudder", name: "Rudder" }]}
        />
      </div>
      <Warnings s={s} />
      <FailureControls sim={sim} ids={["yawSensor", "power"]} />
    </>
  );
}
export function TrimLab({ sim }: { sim: Simulation }) {
  const s = sim.state;
  return (
    <>
      <div className="flight-grid">
        <Panel title="Pitch’i tut, servo yükünü azalt" kicker="AUTOMATIC TRIM">
          <div className="trim-visual">
            <svg
              viewBox="0 0 660 315"
              role="img"
              aria-label={`Elevator ${s.elevator.toFixed(1)}°, stabilizer trim ${s.trim.toFixed(1)}°, servo yükü ${s.load.toFixed(0)}%`}
            >
              <path
                d="M45 230Q220 195 450 170L488 62 520 69 507 173 605 208 606 221 480 211Q225 248 45 242Z"
                fill="#334e5e"
                stroke="#7a97a7"
              />
              <g transform={`rotate(${-s.trim * 4} 446 200)`}>
                <path
                  d="M335 200l171-12 68 23-70 6-169-8Z"
                  fill="#d8b575"
                  stroke="#edcea0"
                />
                <path
                  d="M452 210l54-7 68 8-70 6Z"
                  fill="#7cd2df"
                  transform={`rotate(${-s.elevator * 4} 452 210)`}
                />
              </g>
              <path
                d="M436 186V134H245M546 225v44H378"
                fill="none"
                stroke="#788e9b"
              />
              <text x="126" y="128" className="amber">
                STABILIZER / TRIM {s.trim.toFixed(2)}°
              </text>
              <text x="221" y="287" className="cyan">
                ELEVATOR {s.elevator.toFixed(2)}°
              </text>
              <text x="28" y="31" className="pfd-small">
                SCHEMATIC TAILPLANE · ANGLES EXAGGERATED ×4
              </text>
            </svg>
          </div>
          <div className="metric-row">
            <Metric label="PITCH COMMAND" value={s.pitchCommand} unit="°" />
            <Metric label="ACTUAL PITCH" value={s.pitch} unit="°" />
            <Metric
              label="SERVO LOAD"
              value={s.load}
              unit="%"
              tone={s.load > 70 ? "amber" : ""}
            />
          </div>
          <div className="load-track">
            <span style={{ width: `${s.load}%` }} />
          </div>
          <div className="live-explanation">
            <b>
              {s.failures.trim
                ? "TRIM FROZEN"
                : Math.abs(s.elevator) < 0.2
                  ? "ELEVATOR UNLOADED"
                  : "TRIM TRANSFER IN PROGRESS"}
            </b>
            <p>
              Elevator hızlı düzeltmeyi yapar. Trim, sürdürülen elevator
              talebini entegre ederek denge momentini üzerine alır. Load
              göstergesi normalize edilmiş servo yüküdür.
            </p>
          </div>
        </Panel>
        <Panel title="Pitch & trim" kicker="EXPERIMENT">
          <Slider
            sim={sim}
            name="selectedPitch"
            label="Selected pitch"
            min={-10}
            max={12}
            unit="°"
          />
          <ControlToggle sim={sim} name="autoTrim" label="AUTOMATIC TRIM" />
          <ControlToggle sim={sim} name="ap" label="AUTOPILOT" />
          <button
            className="button secondary wide"
            onClick={() => sim.update((v) => disturb(v, "pitch"))}
          >
            Pitch darbesi uygula
          </button>
          <FailureControls sim={sim} ids={["trim", "pitchServo"]} />
        </Panel>
      </div>
      <div className="two-column">
        <Chart
          history={sim.history}
          title="Yükün trim’e aktarılması"
          unit="°"
          series={[
            { key: "elevator", name: "Elevator" },
            { key: "trim", name: "Trim" },
          ]}
        />
        <Chart
          history={sim.history}
          title="Servo load"
          unit="%"
          series={[{ key: "load", name: "Load" }]}
        />
      </div>
      <Warnings s={s} />
    </>
  );
}
export function ThrottleLab({ sim }: { sim: Simulation }) {
  const s = sim.state;
  return (
    <>
      <div className="flight-grid">
        <Panel title="Speed error → thrust → aircraft" kicker="AUTOTHROTTLE">
          <div className="throttle-dashboard">
            <div className="speed-dial">
              <svg
                viewBox="0 0 260 205"
                role="img"
                aria-label={`Airspeed ${s.speed.toFixed(0)} knots`}
              >
                <path
                  d="M45 172A100 100 0 1 1 215 172"
                  fill="none"
                  stroke="#304754"
                  strokeWidth="13"
                />
                <path
                  d="M45 172A100 100 0 1 1 215 172"
                  fill="none"
                  stroke="#7cd2df"
                  strokeWidth="13"
                  strokeDasharray={`${((s.speed - 80) / 240) * 430} 600`}
                />
                <text x="130" y="80" textAnchor="middle" className="pfd-small">
                  ACTUAL AIRSPEED
                </text>
                <text
                  x="130"
                  y="133"
                  textAnchor="middle"
                  className="speed-number"
                >
                  {s.speed.toFixed(0)}
                </text>
                <text x="130" y="161" textAnchor="middle">
                  KNOTS
                </text>
                <text x="130" y="201" textAnchor="middle" className="cyan">
                  TARGET {s.controls.selectedSpeed} KT
                </text>
              </svg>
            </div>
            <div
              className="throttle-levers"
              aria-label={`Throttle lever ${(s.lever * 100).toFixed(0)} percent`}
            >
              <span>THROTTLE QUADRANT</span>
              <div className="lever-scale">
                <small>MAX</small>
                {[0, 1].map((v) => (
                  <div className="lever-rail" key={v}>
                    <i style={{ bottom: `${s.lever * 76 + 4}%` }}>{v + 1}</i>
                  </div>
                ))}
                <small>IDLE</small>
              </div>
              <b>{(s.lever * 100).toFixed(1)}%</b>
            </div>
          </div>
          <div className="metric-row">
            <Metric
              label="SPEED ERROR"
              value={s.controls.selectedSpeed - s.speed}
              unit="kt"
            />
            <Metric
              label="THRUST COMMAND"
              value={s.thrustCommand * 100}
              unit="%"
            />
            <Metric label="ENGINE THRUST" value={s.thrust * 100} unit="%" />
          </div>
          <div className="metric-row">
            <Metric label="GROUND SPEED" value={s.groundSpeed} unit="kt" />
            <Metric label="WIND" value={s.windActual} unit="kt" />
            <Metric
              label="A/T STATUS"
              value={s.controls.at ? "ENGAGED" : "MANUAL"}
            />
          </div>
        </Panel>
        <Panel title="Hız deneyini ayarla" kicker="EXPERIMENT">
          <ControlToggle sim={sim} name="at" label="AUTOTHROTTLE" />
          <Slider
            sim={sim}
            name="selectedSpeed"
            label="Target speed"
            min={100}
            max={280}
            unit="kt"
          />
          <Slider
            sim={sim}
            name="drag"
            label="Aircraft drag"
            min={0.6}
            max={1.6}
            step={0.05}
            digits={2}
            unit="×"
          />
          <Slider
            sim={sim}
            name="mass"
            label="Aircraft mass"
            min={30000}
            max={90000}
            step={1000}
            unit="kg"
          />
          <Slider
            sim={sim}
            name="wind"
            label="Headwind (+) / tailwind (−)"
            min={-40}
            max={40}
            unit="kt"
          />
          <fieldset disabled={s.controls.at}>
            <Slider
              sim={sim}
              name="manualThrust"
              label="Manual throttle (A/T OFF)"
              min={0}
              max={1}
              step={0.01}
              digits={2}
              unit="fraction"
            />
          </fieldset>
        </Panel>
      </div>
      <div className="two-column">
        <Chart
          history={sim.history}
          title="Airspeed / time"
          unit="kt"
          series={[
            { key: "speed", name: "IAS" },
            { key: "targetSpeed", name: "Target" },
          ]}
        />
        <Chart
          history={sim.history}
          title="Engine thrust / time"
          unit="%"
          series={[{ key: "thrust", name: "Thrust" }]}
        />
      </div>
      <Warnings s={s} />
      <FailureControls
        sim={sim}
        ids={["sensorDisagree", "atServo", "engineSlow", "atDisconnect"]}
      />
    </>
  );
}
const sequence = [
  "APP ARM",
  "LOCALIZER CAPTURE",
  "GLIDESLOPE CAPTURE",
  "APPROACH",
  "FLARE",
  "LAND",
  "TOUCHDOWN",
] as const;
export function ApproachScene({ s }: { s: State }) {
  const near = 1 - Math.min(6, Math.max(0, s.distance)) / 6;
  const center = 360 - s.lateralOffset * 0.26;
  const runwayTop = 130 + near * 40,
    runwayBottom = 250 + near * 210;
  return (
    <div className="approach-scene">
      <svg
        viewBox="0 0 720 382"
        role="img"
        aria-label={`Pist yaklaşması: ${s.phase}, localizer deviation ${s.lateralOffset.toFixed(0)} metre, glideslope deviation ${s.gsError.toFixed(0)} feet`}
      >
        <defs>
          <linearGradient id="approach-sky" x2="0" y2="1">
            <stop stopColor="#122a3c" />
            <stop offset="1" stopColor="#416577" />
          </linearGradient>
          <linearGradient id="approach-ground" x2="0" y2="1">
            <stop stopColor="#293e42" />
            <stop offset="1" stopColor="#15232b" />
          </linearGradient>
        </defs>
        <rect width="720" height="190" fill="url(#approach-sky)" />
        <rect y="150" width="720" height="232" fill="url(#approach-ground)" />
        <path
          d="M0 152l94-14 62 11 112-19 151 16 131-8 170 14"
          fill="#203d48"
        />
        <path d="M0 153H720" stroke="#87a2aa" opacity=".25" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((v) => (
          <path
            key={v}
            d={`M${center} 153L${v * 150 - 140} 382`}
            stroke="#405955"
            opacity=".28"
          />
        ))}
        {[190, 240, 310, 380].map((v) => (
          <path key={v} d={`M0 ${v}H720`} stroke="#405955" opacity=".2" />
        ))}
        <path
          d={`M${center - 13 - near * 10} ${runwayTop}L${center + 13 + near * 10} ${runwayTop}L${center + 72 + near * 115} ${runwayBottom}L${center - 72 - near * 115} ${runwayBottom}Z`}
          fill="#222d32"
          stroke="#a4b8b6"
          strokeWidth="1.5"
        />
        <path
          d={`M${center} 111V${runwayBottom + 70}`}
          stroke="#80d4cf"
          strokeDasharray="6 10"
          opacity=".8"
        />
        {[0.25, 0.4, 0.55, 0.7, 0.85].map((v, i) => (
          <g key={v}>
            <path
              d={`M${center - 4 - v * 5} ${runwayTop + (runwayBottom - runwayTop) * v}h${8 + v * 10}`}
              stroke="#dfdfcb"
              strokeWidth={2 + i}
            />
            <circle
              cx={center - (13 + near * 10) * (1 - v) - (72 + near * 115) * v}
              cy={runwayTop + (runwayBottom - runwayTop) * v}
              r={1 + v * 2}
              fill="#e5c986"
            />
            <circle
              cx={center + (13 + near * 10) * (1 - v) + (72 + near * 115) * v}
              cy={runwayTop + (runwayBottom - runwayTop) * v}
              r={1 + v * 2}
              fill="#e5c986"
            />
          </g>
        ))}
        <text
          x={center}
          y={runwayTop + 30}
          textAnchor="middle"
          fill="#e5e4d4"
          stroke="#222d32"
          strokeWidth="5"
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize="15"
        >
          09
        </text>
        <g transform={`translate(360 273) rotate(${s.bank})`}>
          <path
            d="M0-15v39M-89 12L0-4 89 12M-27 25l27-7 27 7"
            fill="none"
            stroke="#e2eced"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M-13-3H13" stroke="#7cd2df" strokeWidth="6" />
        </g>
        <g stroke="#7cd2df" fill="none" opacity=".65">
          <path d="M105 112h-30v30m540-30h30v30M75 281v30h30m540-30v30h-30" />
          <path d="M315 170h90m-45-25v50" strokeDasharray="3 5" />
        </g>
        <text x="29" y="35" className="cyan">
          ILS 09 · 3.0° MODEL PATH
        </text>
        <text x="691" y="35" textAnchor="end">
          {s.distance.toFixed(2)} NM
        </text>
        <text x="31" y="353" className="pfd-small">
          APPROACH VIEW · SCHEMATIC
        </text>
        <text x="691" y="353" textAnchor="end" className="cyan">
          RA {s.failures.ra ? "INVALID" : s.altitude.toFixed(0) + " FT"}
        </text>
        <rect
          x="620"
          y="82"
          width="58"
          height="164"
          rx="4"
          fill="#0e202b"
          opacity=".8"
        />
        <path d="M649 100v126M637 163h24" stroke="#a1b4bd" />
        <circle
          cx="649"
          cy={163 + Math.max(-62, Math.min(62, s.gsError * 0.25))}
          r="6"
          fill={s.failures.gs ? "#ec9687" : "#d2a6db"}
        />
        <text x="649" y="263" textAnchor="middle">
          G/S
        </text>
      </svg>
      <div className="approach-deviations">
        <div>
          <Radio size={14} />
          <span>LOC</span>
          <b>
            {s.failures.loc ? "INVALID" : `${s.lateralOffset.toFixed(1)} m`}
          </b>
        </div>
        <div>
          <span>G/S</span>
          <b>{s.failures.gs ? "INVALID" : `${s.gsError.toFixed(1)} ft`}</b>
        </div>
        <div>
          <span>V/S</span>
          <b>{s.vs.toFixed(0)} ft/min</b>
        </div>
      </div>
    </div>
  );
}
export function AutolandLab({ sim }: { sim: Simulation }) {
  const s = sim.state,
    failureIds: Failure[] = [
      "loc",
      "gs",
      "ra",
      "atServo",
      "ap",
      "sensorDisagree",
    ];
  return (
    <>
      <div
        className={`phase-banner ${s.phase === "INTERRUPTED" ? "interrupted" : ""}`}
      >
        <PlaneLanding size={25} />
        <div>
          <span>AUTOLAND PHASE</span>
          <strong>
            {s.phase === "READY" ? "READY FOR APPROACH" : s.phase}
          </strong>
        </div>
        <div className="phase-progress">
          {sequence.map((phase, i) => (
            <span
              key={phase}
              title={phase}
              className={s.phaseLog.includes(phase) ? "done" : ""}
            >
              {i + 1}
              <small>
                {phase
                  .replace("LOCALIZER", "LOC")
                  .replace("GLIDESLOPE", "G/S")
                  .replace(" CAPTURE", " CAP")}
              </small>
            </span>
          ))}
        </div>
      </div>
      <div className="flight-grid">
        <Panel title="Pist 09 yaklaşması" kicker="EXPERIMENT / OBSERVE">
          <FMA s={s} />
          <ApproachScene s={s} />
          <div className="metric-row">
            <Metric label="ALTITUDE / RA*" value={s.altitude} unit="ft" />
            <Metric label="AIRSPEED" value={s.speed} unit="kt" />
            <Metric label="THRUST" value={s.thrust * 100} unit="%" />
          </div>
          <p className="hint">
            *Düz arazi ve sıfır pist kotu varsayılır; modelde barometrik irtifa
            ile RA sayısal olarak aynıdır. Sapmalar metre/feet cinsindendir, ILS
            dot ölçeği değildir.
          </p>
        </Panel>
        <Panel title="Yaklaşmayı hazırla" kicker="INITIAL CONDITIONS">
          <fieldset disabled={s.phase !== "READY"}>
            <Slider
              sim={sim}
              name="approachOffset"
              label="Approach lateral offset"
              min={-500}
              max={500}
              step={10}
              unit="m"
            />
            <Slider
              sim={sim}
              name="glideOffset"
              label="Glideslope offset"
              min={-250}
              max={250}
              step={10}
              unit="ft"
            />
          </fieldset>
          <p className="hint">
            Başlangıç sapmaları APP ARM öncesinde ayarlanır. Yeni başlangıç için
            RESET.
          </p>
          <Slider
            sim={sim}
            name="crosswind"
            label="Approach crosswind"
            min={-25}
            max={25}
            unit="kt"
          />
          <button
            className="button primary wide"
            disabled={s.phase !== "READY"}
            onClick={() => sim.update((v) => selectMode(v, "APP"))}
          >
            <PlaneLanding size={17} />
            APP ARM
          </button>
          <button
            className="button amber-button wide"
            disabled={
              s.phase === "READY" ||
              s.phase === "TOUCHDOWN" ||
              s.phase === "GO-AROUND"
            }
            onClick={() => sim.update((v) => selectMode(v, "GA"))}
          >
            <ArrowUpRight size={17} />
            GO-AROUND
          </button>
          <div className="live-explanation">
            <b>
              {s.phase === "INTERRUPTED"
                ? "AUTOLAND DEVAM EDEMEZ"
                : s.phase === "GO-AROUND"
                  ? "GA GUIDANCE"
                  : s.phase === "TOUCHDOWN"
                    ? "TOUCHDOWN COMPLETE"
                    : "CAPTURE MONITOR"}
            </b>
            <p>
              {s.phase === "INTERRUPTED"
                ? "Kritik referans veya kumanda yolu kayıp. GO-AROUND seç; AP kanalı arızalıysa FD talebi otomatik uygulanmaz."
                : s.phase === "GO-AROUND"
                  ? "Pitch komutu 8°, thrust talebi %92. Bu genel modelde published missed-approach route bulunmaz."
                  : s.phase === "TOUCHDOWN"
                    ? "Tüm yakalama koşulları sağlandı ve temas gerçekleşti. Yavaşlama normalize edilmiş sabit bir modeldir."
                    : "LOC capture: |sapma| < 90 m. Ardından G/S capture: |sapma| < 65 ft. FLARE ≤ 50 ft; LAND ≤ 12 ft. Eşikler yalnız bu deneyin varsayımlarıdır."}
            </p>
          </div>
        </Panel>
      </div>
      <Warnings s={s} />
      <div className="two-column">
        <Chart
          history={sim.history}
          title="Localizer deviation"
          unit="m"
          series={[{ key: "loc", name: "LOC offset" }]}
        />
        <Chart
          history={sim.history}
          title="Glideslope deviation"
          unit="ft"
          series={[{ key: "gs", name: "G/S offset" }]}
        />
      </div>
      <Panel title="Yaklaşma profili" kicker="PATH HISTORY">
        <svg
          className="approach-profile"
          viewBox="0 0 900 190"
          role="img"
          aria-label="Üç derecelik glideslope ve güncel uçak konumu"
        >
          <path d="M50 160H850" stroke="#536d79" />
          <path d="M50 35L780 153" stroke="#7cd2df" strokeDasharray="5 7" />
          <path d="M780 153H870" stroke="#c3c9be" strokeWidth="5" />
          <text x="55" y="24">
            6 NM / ~1960 FT
          </text>
          <text x="746" y="183">
            RWY 09
          </text>
          <text x="344" y="62" className="cyan">
            3° GUIDANCE
          </text>
          <g
            transform={`translate(${Math.max(50, Math.min(866, 50 + ((6 - s.distance) / 6) * 730))} ${Math.max(28, Math.min(157, 160 - (s.altitude / 2100) * 130))}) rotate(${-s.pitch})`}
          >
            <path
              d="M-19 0h38l-14-5m-15 5-6-9"
              fill="none"
              stroke="#e0b978"
              strokeWidth="3"
            />
          </g>
        </svg>
      </Panel>
      <FailureControls sim={sim} ids={failureIds} />
    </>
  );
}
export function SasLab({ sim }: { sim: Simulation }) {
  return (
    <>
      <div className="flight-grid">
        <Panel title="Helicopter stability augmentation" kicker="SAS RESPONSE">
          <Aircraft s={sim.state} helicopter />
          <Chart
            history={sim.history}
            title="Tutum salınımları"
            unit="°"
            series={[
              { key: "bank", name: "Roll" },
              { key: "pitch", name: "Pitch" },
              { key: "yaw", name: "Yaw" },
            ]}
          />
        </Panel>
        <Panel title="Stabiliteyi karşılaştır" kicker="EXPERIMENT">
          <ControlToggle sim={sim} name="sas" label="STABILITY AUGMENTATION" />
          <Disturbances sim={sim} all />
          <div className="live-explanation">
            <b>
              {sim.state.controls.sas &&
              !sim.state.failures.attitude &&
              !sim.state.failures.power
                ? "SAS ON · RATE DAMPING"
                : "SAS UNAVAILABLE / OFF"}
            </b>
            <p>
              SAS, kontrol çevrimine ek sönümleme katar. Rotor hareketi ve lift
              performansı hesaplanmaz; şekil üç eksen tutumunu gösterir.
            </p>
          </div>
        </Panel>
      </div>
      <Warnings s={sim.state} />
      <FailureControls sim={sim} ids={["attitude", "power"]} />
    </>
  );
}
export function NavigationLab({ sim }: { sim: Simulation }) {
  const signals: {
    id: Failure;
    name: string;
    data: string;
    targets: string;
  }[] = [
    {
      id: "nav",
      name: "VOR / NAV",
      data: `${sim.state.navDeviation.toFixed(2)} nm`,
      targets: "NAV lateral guidance",
    },
    {
      id: "loc",
      name: "LOCALIZER",
      data: `${sim.state.lateralOffset.toFixed(0)} m`,
      targets: "LOC capture / approach alignment",
    },
    {
      id: "gs",
      name: "GLIDESLOPE",
      data: `${sim.state.gsError.toFixed(0)} ft`,
      targets: "G/S capture / vertical guidance",
    },
    {
      id: "heading",
      name: "HEADING REF",
      data: `${sim.state.heading.toFixed(1)}°`,
      targets: "HDG tracking",
    },
    {
      id: "airData",
      name: "AIR DATA",
      data: `${sim.state.speed.toFixed(0)} kt / ${sim.state.altitude.toFixed(0)} ft`,
      targets: "ALT / VS / A/T",
    },
    {
      id: "attitude",
      name: "ATTITUDE REF",
      data: `φ ${sim.state.bank.toFixed(1)}° / θ ${sim.state.pitch.toFixed(1)}°`,
      targets: "AP roll / pitch",
    },
    {
      id: "ra",
      name: "RADIO ALTITUDE",
      data: `${sim.state.altitude.toFixed(0)} ft`,
      targets: "FLARE / LAND",
    },
  ];
  return (
    <>
      <Panel
        title="Guidance girişlerini kes, bağımlılıkları gör"
        kicker="NAVIGATION INTERFACE"
      >
        <div className="navigation-map">
          <div className="nav-sensors">
            {signals.map((signal) => (
              <div
                className={`sensor-route ${sim.state.failures[signal.id] ? "invalid" : ""}`}
                key={signal.id}
              >
                <button
                  aria-pressed={sim.state.failures[signal.id]}
                  onClick={() =>
                    sim.update((s) =>
                      setFailure(s, signal.id, !s.failures[signal.id]),
                    )
                  }
                >
                  <Radio size={16} />
                  <span>
                    {signal.name}
                    <small>
                      {sim.state.failures[signal.id]
                        ? "INVALID — yeniden bağla"
                        : signal.data}
                    </small>
                  </span>
                  <i />
                </button>
                <span className="signal-wire" />
                <span className="dependent-function">{signal.targets}</span>
              </div>
            ))}
          </div>
          <div className="fcc-hub">
            <span>ATA 22</span>
            <strong>FCC</strong>
            <small>
              SIGNAL VALIDITY
              <br />
              COMMAND PROCESSING
              <br />
              SYSTEM MONITORS
            </small>
            <div>
              {signals.filter((v) => !sim.state.failures[v.id]).length} / 7
              VALID
            </div>
          </div>
        </div>
        <p className="hint">
          Sensör kartına tıklamak sinyalin validity bilgisini keser/geri
          getirir. Bu ekran simülasyonun fiziksel değerlerini eğitim için
          göstermeye devam eder.
        </p>
      </Panel>
      <Warnings s={sim.state} />
      <div className="two-column">
        <PFD s={sim.state} />
        <Panel title="Modlarla dene" kicker="EXPERIMENT">
          <button
            className="button primary wide"
            onClick={() => sim.update((s) => selectMode(s, "NAV"))}
          >
            NAV intercept başlat
          </button>
          <button
            className="button secondary wide"
            onClick={() => sim.update((s) => selectMode(s, "APP"))}
          >
            APP yaklaşmasını hazırla
          </button>
          <ControlToggle sim={sim} name="ap" label="AUTOPILOT" />
          <ControlToggle sim={sim} name="at" label="AUTOTHROTTLE" />
          <button
            className="button secondary wide"
            onClick={() =>
              sim.update((s) => setControl(s, "selectedHeading", 150))
            }
          >
            Heading hedefini 150° yap
          </button>
          <FailureControls
            sim={sim}
            ids={signals
              .filter((v) => sim.state.failures[v.id])
              .map((v) => v.id)}
          />
        </Panel>
      </div>
    </>
  );
}
