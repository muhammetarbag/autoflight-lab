/** Deterministic, bounded teaching model. Coefficients are illustrative, not aircraft data. */
export type Lab =
  | "fundamentals"
  | "axes"
  | "yaw"
  | "trim"
  | "modes"
  | "navigation"
  | "throttle"
  | "autoland"
  | "sas"
  | "architecture"
  | "interfaces"
  | "components"
  | "faults"
  | "sandbox"
  | "quiz";
export type Failure =
  | "loc"
  | "gs"
  | "ra"
  | "atServo"
  | "ap"
  | "sensorDisagree"
  | "airData"
  | "attitude"
  | "heading"
  | "nav"
  | "yawSensor"
  | "rollServo"
  | "pitchServo"
  | "trim"
  | "power"
  | "engineSlow"
  | "atDisconnect";
export type Lateral = "ROLL" | "HDG" | "NAV INT" | "NAV" | "LOC INT" | "LOC";
export type Vertical =
  | "PITCH"
  | "ALT HOLD"
  | "ALT ACQ"
  | "VS"
  | "G/S INT"
  | "G/S"
  | "FLARE"
  | "LAND"
  | "GA";
export type Phase =
  | "READY"
  | "APP ARM"
  | "LOCALIZER CAPTURE"
  | "GLIDESLOPE CAPTURE"
  | "APPROACH"
  | "FLARE"
  | "LAND"
  | "TOUCHDOWN"
  | "GO-AROUND"
  | "INTERRUPTED";
export interface Controls {
  ap: boolean;
  yd: boolean;
  at: boolean;
  autoTrim: boolean;
  sas: boolean;
  rollOn: boolean;
  pitchOn: boolean;
  yawOn: boolean;
  selectedHeading: number;
  selectedAltitude: number;
  selectedVS: number;
  selectedSpeed: number;
  selectedBank: number;
  selectedPitch: number;
  selectedYaw: number;
  wind: number;
  crosswind: number;
  turbulence: number;
  damping: number;
  sensitivity: number;
  disturbance: number;
  drag: number;
  mass: number;
  manualThrust: number;
  approachOffset: number;
  glideOffset: number;
}
export interface State {
  lab: Lab;
  time: number;
  controls: Controls;
  failures: Record<Failure, boolean>;
  heading: number;
  bank: number;
  rollRate: number;
  pitch: number;
  pitchRate: number;
  yaw: number;
  yawRate: number;
  altitude: number;
  vs: number;
  speed: number;
  groundSpeed: number;
  aileron: number;
  elevator: number;
  rudder: number;
  trim: number;
  load: number;
  bankCommand: number;
  pitchCommand: number;
  rudderCommand: number;
  thrustCommand: number;
  lever: number;
  thrust: number;
  speedIntegral: number;
  windActual: number;
  lateral: Lateral;
  vertical: Vertical;
  armed: string[];
  holdAltitude: number;
  navDeviation: number;
  distance: number;
  lateralOffset: number;
  gsError: number;
  phase: Phase;
  phaseTime: number;
  phaseLog: Phase[];
  warnings: string[];
}
export interface Sample {
  time: number;
  bank: number;
  pitch: number;
  yaw: number;
  yawRate: number;
  rudder: number;
  elevator: number;
  trim: number;
  load: number;
  speed: number;
  targetSpeed: number;
  altitude: number;
  vs: number;
  thrust: number;
  loc: number;
  gs: number;
}
export const failureIds: Failure[] = [
  "loc",
  "gs",
  "ra",
  "atServo",
  "ap",
  "sensorDisagree",
  "airData",
  "attitude",
  "heading",
  "nav",
  "yawSensor",
  "rollServo",
  "pitchServo",
  "trim",
  "power",
  "engineSlow",
  "atDisconnect",
];
export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : 0));
export const headingError = (target: number, actual: number): number =>
  ((((target - actual + 540) % 360) + 360) % 360) - 180;
const approachPhases: Phase[] = [
  "APP ARM",
  "LOCALIZER CAPTURE",
  "GLIDESLOPE CAPTURE",
  "APPROACH",
  "FLARE",
  "LAND",
];
const bounds: Partial<Record<keyof Controls, [number, number]>> = {
  selectedHeading: [0, 359],
  selectedAltitude: [500, 15000],
  selectedVS: [-2000, 2000],
  selectedSpeed: [100, 280],
  selectedBank: [-30, 30],
  selectedPitch: [-10, 12],
  selectedYaw: [-5, 5],
  wind: [-40, 40],
  crosswind: [-25, 25],
  turbulence: [0, 5],
  damping: [0, 3],
  sensitivity: [0.5, 2],
  disturbance: [1, 12],
  drag: [0.6, 1.6],
  mass: [30000, 90000],
  manualThrust: [0, 1],
  approachOffset: [-500, 500],
  glideOffset: [-250, 250],
};
export function initialState(lab: Lab = "modes"): State {
  const landing = lab === "autoland";
  const controls: Controls = {
    ap: true,
    yd: true,
    at: true,
    autoTrim: true,
    sas: true,
    rollOn: true,
    pitchOn: true,
    yawOn: true,
    selectedHeading: 90,
    selectedAltitude: 3000,
    selectedVS: 700,
    selectedSpeed: landing ? 140 : 180,
    selectedBank: 15,
    selectedPitch: lab === "trim" ? 6 : 4,
    selectedYaw: 0,
    wind: 0,
    crosswind: 0,
    turbulence: 0,
    damping: 1.3,
    sensitivity: 1,
    disturbance: 6,
    drag: 1,
    mass: 60000,
    manualThrust: 0.48,
    approachOffset: 240,
    glideOffset: 120,
  };
  return {
    lab,
    time: 0,
    controls,
    failures: Object.fromEntries(failureIds.map((id) => [id, false])) as Record<
      Failure,
      boolean
    >,
    heading: 90,
    bank: 0,
    rollRate: 0,
    pitch: 0,
    pitchRate: 0,
    yaw: 0,
    yawRate: lab === "yaw" ? 6 : 0,
    altitude: landing ? glideAltitude(6) + 120 : 3000,
    vs: 0,
    speed: landing ? 140 : 180,
    groundSpeed: landing ? 140 : 180,
    aileron: 0,
    elevator: 0,
    rudder: 0,
    trim: 0,
    load: 0,
    bankCommand: 0,
    pitchCommand: 0,
    rudderCommand: 0,
    thrustCommand: 0.48,
    lever: 0.48,
    thrust: 0.48,
    speedIntegral: 0,
    windActual: 0,
    lateral: lab === "axes" ? "ROLL" : "HDG",
    vertical: ["axes", "trim"].includes(lab) ? "PITCH" : "ALT HOLD",
    armed: [],
    holdAltitude: 3000,
    navDeviation: 0.7,
    distance: 6,
    lateralOffset: 240,
    gsError: 120,
    phase: "READY",
    phaseTime: 0,
    phaseLog: ["READY"],
    warnings: [],
  };
}
export function setControl<K extends keyof Controls>(
  s: State,
  key: K,
  value: Controls[K],
): State {
  const valueRange = bounds[key];
  const next = {
    ...s,
    controls: {
      ...s.controls,
      [key]:
        typeof value === "number" && valueRange
          ? clamp(value, valueRange[0], valueRange[1])
          : value,
    },
  };
  if (next.lab === "autoland" && next.phase === "READY") {
    next.lateralOffset = next.controls.approachOffset;
    next.altitude = glideAltitude(next.distance) + next.controls.glideOffset;
    next.gsError = next.controls.glideOffset;
  }
  return monitor(next);
}
export function setFailure(s: State, id: Failure, enabled: boolean): State {
  return monitor({
    ...s,
    controls: { ...s.controls },
    failures: { ...s.failures, [id]: enabled },
  });
}
function transition(s: State, phase: Phase): void {
  if (s.phase === phase) return;
  s.phase = phase;
  s.phaseTime = s.time;
  s.phaseLog = [...s.phaseLog, phase].slice(-16);
}
function monitor(s: State): State {
  const f = s.failures,
    warnings: string[] = [];
  if (f.ap || f.attitude || f.power || f.sensorDisagree) {
    s.controls.ap = false;
    warnings.push("AP DISCONNECT — kontrol referansı/kanalı geçersiz");
  }
  if (f.airData) {
    s.controls.at = false;
    if (["ALT HOLD", "ALT ACQ", "VS", "G/S"].includes(s.vertical))
      s.vertical = "PITCH";
    warnings.push("AIR DATA FAIL — ALT / VS / A/T kullanılamıyor");
  }
  if (f.heading && s.lateral === "HDG") {
    s.lateral = "ROLL";
    s.controls.selectedBank = 0;
  }
  if (f.heading) warnings.push("HDG REF FAIL — heading guidance kayıp");
  if (f.atDisconnect || f.power || f.sensorDisagree) s.controls.at = false;
  if (f.atDisconnect) warnings.push("A/T DISCONNECT — manuel thrust gerekli");
  if (f.yawSensor || f.power) {
    s.controls.yd = false;
    warnings.push("YAW DAMPER INOP — yaw-rate feedback kayıp");
  }
  if (f.trim) warnings.push("AUTO TRIM FAIL — sustained elevator / servo load");
  if (f.rollServo) warnings.push("AILERON SERVO FAIL — komut var, hareket yok");
  if (f.pitchServo)
    warnings.push("ELEVATOR SERVO FAIL — pitch kumandası kayıp");
  if (f.atServo) warnings.push("A/T SERVO FAIL — throttle lever dondu");
  if (f.engineSlow) warnings.push("ENGINE LAG — thrust yanıtı yavaş");
  if (f.loc) warnings.push("LOC INVALID — lateral ILS sinyali kayıp");
  if (f.gs) warnings.push("G/S INVALID — vertical ILS sinyali kayıp");
  if (f.ra) warnings.push("RA INVALID — flare height referansı kayıp");
  if (f.nav) {
    warnings.push("NAV INVALID — VOR guidance kayıp");
    if (s.lateral === "NAV" || s.lateral === "NAV INT") {
      s.lateral = "HDG";
      s.armed = s.armed.filter((m) => m !== "NAV");
    }
  }
  const landFault =
    f.loc ||
    f.gs ||
    f.ra ||
    f.atServo ||
    f.ap ||
    f.sensorDisagree ||
    f.airData ||
    f.attitude ||
    f.power ||
    f.rollServo ||
    f.pitchServo ||
    f.atDisconnect;
  if (
    approachPhases.includes(s.phase) &&
    (landFault || !s.controls.ap || !s.controls.at)
  ) {
    transition(s, "INTERRUPTED");
    s.armed = [];
    s.lateral = "ROLL";
    s.vertical = "PITCH";
  }
  if (s.phase === "INTERRUPTED")
    warnings.push("AUTOLAND UNAVAILABLE — GO-AROUND / manuel devralma");
  if (s.phase === "GO-AROUND" && !s.controls.ap)
    warnings.push("GA: flight director komutu; AP yok, manuel uçuş gerekir");
  if (!s.controls.ap && s.lab !== "sas")
    warnings.push("AP OFF — servo guidance uygulanmıyor");
  if (s.load > 70)
    warnings.push("HIGH SERVO LOAD — trim ve pitch kanalını incele");
  if (
    s.time > 8 &&
    s.thrustCommand > 0.98 &&
    s.controls.selectedSpeed - s.speed > 8
  )
    warnings.push("THRUST LIMIT — mevcut drag / kütle / hız talebini incele");
  s.warnings = warnings;
  return s;
}
export function selectMode(
  s: State,
  mode: "HDG" | "NAV" | "ALT HOLD" | "ALT ACQ" | "VS" | "APP" | "GA",
): State {
  const n = {
    ...s,
    controls: { ...s.controls },
    armed: [...s.armed],
    phaseLog: [...s.phaseLog],
  };
  if (mode !== "APP" && mode !== "GA" && approachPhases.includes(n.phase)) {
    transition(n, "READY");
    n.armed = [];
    n.lateral = "HDG";
    n.vertical = "ALT HOLD";
    n.holdAltitude = n.altitude;
  }
  if (mode === "HDG") {
    n.lateral = "HDG";
    n.armed = n.armed.filter((x) => !["NAV", "LOC"].includes(x));
  }
  if (mode === "NAV" && !n.failures.nav) {
    n.lateral = "NAV INT";
    n.armed = ["NAV"];
  }
  if (mode === "ALT HOLD") {
    n.vertical = "ALT HOLD";
    n.holdAltitude = n.altitude;
    n.armed = n.armed.filter((x) => x !== "ALT");
  }
  if (mode === "ALT ACQ") {
    n.vertical = "ALT ACQ";
    n.armed = ["ALT"];
  }
  if (mode === "VS") {
    n.vertical = "VS";
    n.armed = ["ALT"];
  }
  if (mode === "APP") {
    if (n.phase === "TOUCHDOWN") return n;
    if (n.lab !== "autoland") {
      n.distance = 6;
      n.altitude = glideAltitude(6) + n.controls.glideOffset;
      n.lateralOffset = n.controls.approachOffset;
      n.speed = 140;
      n.controls.selectedSpeed = 140;
    }
    n.controls.ap = true;
    n.controls.at = true;
    n.lateral = "LOC INT";
    n.vertical = "G/S INT";
    n.armed = ["LOC", "G/S", "FLARE"];
    transition(n, "APP ARM");
  }
  if (mode === "GA" && n.phase !== "TOUCHDOWN") {
    transition(n, "GO-AROUND");
    n.controls.ap = true;
    n.controls.at = true;
    n.controls.selectedSpeed = 170;
    n.lateral = "HDG";
    n.controls.selectedHeading = 90;
    n.vertical = "GA";
    n.armed = [];
  }
  return monitor(n);
}
export function disturb(
  s: State,
  axis: "roll" | "pitch" | "yaw" | "all",
): State {
  const n = { ...s };
  if (axis === "roll" || axis === "all") n.rollRate += s.controls.disturbance;
  if (axis === "pitch" || axis === "all")
    n.pitchRate += s.controls.disturbance * 0.65;
  if (axis === "yaw" || axis === "all") n.yawRate += s.controls.disturbance;
  return n;
}
export const glideAltitude = (distance: number): number =>
  Math.max(0, distance) * 6076.12 * Math.tan((3 * Math.PI) / 180) + 50;
export function sample(s: State): Sample {
  return {
    time: s.time,
    bank: s.bank,
    pitch: s.pitch,
    yaw: s.yaw,
    yawRate: s.yawRate,
    rudder: s.rudder,
    elevator: s.elevator,
    trim: s.trim,
    load: s.load,
    speed: s.speed,
    targetSpeed: s.controls.selectedSpeed,
    altitude: s.altitude,
    vs: s.vs,
    thrust: s.thrust * 100,
    loc: s.lateralOffset,
    gs: s.gsError,
  };
}
export function step(previous: State, dt: number): State {
  const n = monitor({
    ...previous,
    controls: { ...previous.controls },
    armed: [...previous.armed],
  });
  const c = n.controls,
    f = n.failures,
    h = clamp(dt, 0, 0.05);
  if (!h) return n;
  n.time += h;
  if (n.phase === "TOUCHDOWN") {
    n.speed = Math.max(0, n.speed - 2.5 * h);
    n.groundSpeed = n.speed;
    n.thrust = 0;
    n.lever = 0;
    n.thrustCommand = 0;
    n.vs = 0;
    return n;
  }
  if (n.lab === "autoland" && n.phase === "READY") return n;
  if (n.lab === "sas") return stepSas(n, h);
  const landing = approachPhases.includes(n.phase);
  const gust =
    c.turbulence * (Math.sin(n.time * 2.3) + 0.45 * Math.sin(n.time * 5.7));
  // Outer-loop lateral guidance -> desired bank -> aileron -> roll acceleration.
  let bankTarget = n.lateral === "ROLL" ? c.selectedBank : 0;
  if (n.lateral === "HDG")
    bankTarget = headingError(c.selectedHeading, n.heading) * 0.65;
  if (["NAV INT", "NAV"].includes(n.lateral)) {
    const course = 90 - clamp(n.navDeviation * 40, -30, 30);
    bankTarget = headingError(course, n.heading) * 0.8;
    if (Math.abs(n.navDeviation) < 0.12) {
      n.lateral = "NAV";
      n.armed = n.armed.filter((x) => x !== "NAV");
    }
  }
  if (landing) {
    const crab =
      (Math.asin(clamp(c.crosswind / Math.max(90, n.speed), -0.4, 0.4)) * 180) /
      Math.PI;
    const course = 90 - clamp(n.lateralOffset * 0.07 + crab, -30, 30);
    bankTarget = headingError(course, n.heading) * 1.1;
  }
  if (n.phase === "INTERRUPTED") bankTarget = 0;
  n.bankCommand = clamp(bankTarget, -25, 25);
  const rollDrive =
    c.ap && c.rollOn && !f.rollServo
      ? clamp((n.bankCommand - n.bank) * 1.3 - n.rollRate * 0.65, -20, 20)
      : 0;
  n.aileron += (rollDrive - n.aileron) * Math.min(1, h * 5);
  n.rollRate += (n.aileron * 2 - n.rollRate * 1.8 + gust * 0.8) * h;
  n.rollRate = clamp(n.rollRate, -25, 25);
  n.bank = clamp(n.bank + n.rollRate * h, -45, 45);
  n.heading =
    (n.heading +
      ((((9.81 * Math.tan((n.bank * Math.PI) / 180)) /
        (Math.max(90, n.speed) * 0.51444)) *
        180) /
        Math.PI) *
        h +
      360) %
    360;
  // Inner-loop pitch demand includes trim/elevator equilibrium and actuator lag.
  let targetVS = 0,
    pitchTarget = c.selectedPitch;
  if (n.vertical === "ALT HOLD")
    targetVS = clamp((n.holdAltitude - n.altitude) * 3, -1800, 1800);
  if (n.vertical === "ALT ACQ")
    targetVS = clamp((c.selectedAltitude - n.altitude) * 3, -1500, 1500);
  if (n.vertical === "VS") targetVS = c.selectedVS;
  if (
    ["ALT ACQ", "VS"].includes(n.vertical) &&
    Math.abs(c.selectedAltitude - n.altitude) <
      Math.max(35, Math.abs(n.vs) / 12)
  ) {
    const toward =
      n.vertical === "ALT ACQ" ||
      (c.selectedAltitude - n.altitude) * c.selectedVS >= 0;
    if (toward) {
      n.vertical = "ALT HOLD";
      n.holdAltitude = c.selectedAltitude;
      n.armed = n.armed.filter((x) => x !== "ALT");
      targetVS = clamp((n.holdAltitude - n.altitude) * 3, -1800, 1800);
    }
  }
  if (landing) {
    n.gsError = n.altitude - glideAltitude(n.distance);
    targetVS = clamp(
      -n.groundSpeed * 101.27 * Math.tan(Math.PI / 60) - n.gsError * 2.2,
      -1800,
      500,
    );
    if (n.phase === "FLARE") targetVS = -140;
    if (n.phase === "LAND") targetVS = -100;
  }
  if (n.vertical !== "PITCH")
    pitchTarget =
      (Math.asin(
        clamp(targetVS / (Math.max(90, n.speed) * 101.27), -0.2, 0.2),
      ) *
        180) /
      Math.PI;
  if (n.vertical === "GA") pitchTarget = 8;
  if (n.phase === "INTERRUPTED") pitchTarget = 0;
  n.pitchCommand = clamp(pitchTarget, -10, 12);
  const pitchDrive =
    c.ap && c.pitchOn && !f.pitchServo
      ? clamp(
          (n.pitchCommand - n.pitch) * 2 -
            n.pitchRate * 0.8 +
            0.4 * n.pitch -
            n.trim,
          -20,
          20,
        )
      : 0;
  n.elevator += (pitchDrive - n.elevator) * Math.min(1, h * 5);
  if (c.autoTrim && c.ap && c.pitchOn && !f.trim && !f.pitchServo && !f.power)
    n.trim = clamp(n.trim + n.elevator * 0.16 * h, -8, 8);
  n.pitchRate +=
    (2 * (n.elevator + n.trim) -
      0.8 * n.pitch -
      1.8 * n.pitchRate +
      gust * 0.25) *
    h;
  n.pitchRate = clamp(n.pitchRate, -12, 12);
  n.pitch = clamp(n.pitch + n.pitchRate * h, -15, 18);
  n.load = clamp(Math.abs(n.elevator) * 5, 0, 100);
  n.vs +=
    (n.speed * 101.27 * Math.sin((n.pitch * Math.PI) / 180) - n.vs) *
    Math.min(1, h * 1.8);
  n.altitude = Math.max(0, n.altitude + (n.vs * h) / 60);
  // Lightly damped yaw oscillator. Rate feedback adds physical damping through rudder.
  n.rudderCommand = clamp(
    (c.yd && !f.yawSensor ? -c.damping * n.yawRate : 0) +
      (n.lab === "axes" && c.yawOn && c.ap && !f.yawSensor && !f.power
        ? (c.selectedYaw - n.yaw) * 1.8 -
          n.yawRate * 0.6 +
          (0.85 * c.selectedYaw) / (0.9 * c.sensitivity)
        : 0),
    -20,
    20,
  );
  n.rudder += (n.rudderCommand - n.rudder) * Math.min(1, h * 6);
  n.yawRate +=
    (-0.85 * n.yaw -
      0.07 * n.yawRate +
      n.rudder * 0.9 * c.sensitivity +
      gust +
      c.crosswind * 0.04) *
    h;
  n.yawRate = clamp(n.yawRate, -20, 20);
  n.yaw = clamp(n.yaw + n.yawRate * h, -20, 20);
  // Nose-heading includes the transient yaw displacement, not only the banked turn.
  n.heading = (n.heading + n.yaw - previous.yaw + 360) % 360;
  // Thrust balances quadratic drag; integral control removes steady speed error.
  const speedError = c.selectedSpeed - n.speed;
  if (c.at && !f.airData && !f.atServo)
    n.speedIntegral = clamp(n.speedIntegral + speedError * h, -100, 100);
  n.thrustCommand = c.at
    ? clamp(0.48 + speedError * 0.018 + n.speedIntegral * 0.004, 0, 1)
    : c.manualThrust;
  if (n.phase === "GO-AROUND" && c.at) n.thrustCommand = 0.92;
  if (["FLARE", "LAND"].includes(n.phase)) n.thrustCommand = 0.08;
  if (!f.atServo) n.lever += (n.thrustCommand - n.lever) * Math.min(1, h * 1.7);
  n.thrust += (n.lever - n.thrust) * Math.min(1, h / (f.engineSlow ? 10 : 1.7));
  const windRate = (c.wind - n.windActual) / 3;
  n.windActual += windRate * h;
  const drag = 0.48 * c.drag * (n.speed / 180) ** 2;
  n.speed = clamp(
    n.speed +
      (((n.thrust - drag) * 18 * 60000) / c.mass -
        n.pitch * 0.12 +
        windRate * 0.45) *
        h,
    80,
    320,
  );
  n.groundSpeed = Math.max(0, n.speed - n.windActual);
  n.navDeviation +=
    ((n.groundSpeed * Math.sin((headingError(n.heading, 90) * Math.PI) / 180) +
      c.crosswind) /
      3600) *
    h;
  if (landing || n.phase === "INTERRUPTED" || n.phase === "GO-AROUND") {
    n.distance -= (n.groundSpeed / 3600) * h;
    n.lateralOffset +=
      (n.speed * Math.sin((headingError(n.heading, 90) * Math.PI) / 180) +
        c.crosswind) *
      0.51444 *
      h;
    n.gsError = n.altitude - glideAltitude(n.distance);
  }
  if (landing) {
    if (n.phase === "APP ARM" && Math.abs(n.lateralOffset) < 90) {
      transition(n, "LOCALIZER CAPTURE");
      n.lateral = "LOC";
      n.armed = n.armed.filter((x) => x !== "LOC");
    } else if (n.phase === "LOCALIZER CAPTURE" && Math.abs(n.gsError) < 65) {
      transition(n, "GLIDESLOPE CAPTURE");
      n.vertical = "G/S";
      n.armed = n.armed.filter((x) => x !== "G/S");
    } else if (
      n.phase === "GLIDESLOPE CAPTURE" &&
      Math.abs(n.lateralOffset) < 45 &&
      Math.abs(n.gsError) < 35
    ) {
      transition(n, "APPROACH");
    } else if (
      n.phase === "APPROACH" &&
      n.altitude <= 50 &&
      n.distance < 0.35
    ) {
      transition(n, "FLARE");
      n.vertical = "FLARE";
      n.armed = [];
    } else if (n.phase === "FLARE" && n.altitude <= 12) {
      transition(n, "LAND");
      n.vertical = "LAND";
    } else if (
      n.phase === "LAND" &&
      n.altitude <= 0.2 &&
      Math.abs(n.lateralOffset) < 30
    ) {
      transition(n, "TOUCHDOWN");
      n.altitude = 0;
      n.vs = 0;
    }
    if (n.altitude <= 0 && !n.phaseLog.includes("TOUCHDOWN"))
      transition(n, "INTERRUPTED");
  }
  return monitor(n);
}
function stepSas(n: State, h: number): State {
  const c = n.controls,
    enabled = c.sas && !n.failures.attitude && !n.failures.power;
  const damping = enabled ? 2.2 : 0.08;
  const gust =
    c.turbulence * (Math.sin(n.time * 2.3) + 0.45 * Math.sin(n.time * 5.7));
  n.aileron = enabled ? -n.rollRate * 2 : 0;
  n.elevator = enabled ? -n.pitchRate * 2 : 0;
  n.rudder = enabled ? -n.yawRate * 2 : 0;
  n.rollRate += (-0.45 * n.bank - damping * n.rollRate + gust) * h;
  n.pitchRate += (-0.5 * n.pitch - damping * n.pitchRate + gust * 0.7) * h;
  n.yawRate += (-0.6 * n.yaw - damping * n.yawRate + gust * 0.8) * h;
  n.bank = clamp(n.bank + n.rollRate * h, -40, 40);
  n.pitch = clamp(n.pitch + n.pitchRate * h, -25, 25);
  n.yaw = clamp(n.yaw + n.yawRate * h, -30, 30);
  return n;
}
export function advance(s: State, seconds: number): State {
  let n = s;
  const count = Math.round(clamp(seconds, 0, 1800) / 0.025);
  for (let i = 0; i < count; i++) n = step(n, 0.025);
  return n;
}
