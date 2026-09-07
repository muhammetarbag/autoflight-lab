import test from "node:test";
import assert from "node:assert/strict";
import {
  advance,
  disturb,
  failureIds,
  headingError,
  initialState,
  sample,
  selectMode,
  setControl,
  setFailure,
  step,
  type Controls,
  type State,
} from "../src/sim/engine.ts";
import {
  components,
  interfaceIds,
  labs,
  loopIds,
} from "../src/content/course.ts";
import { questions, scenarios } from "../src/content/challenges.ts";
const near = (actual: number, expected: number, tolerance: number) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} should be near ${expected} ± ${tolerance}`,
  );
const energy = (s: State) =>
  s.bank * s.bank +
  s.pitch * s.pitch +
  s.yaw * s.yaw +
  s.rollRate * s.rollRate +
  s.pitchRate * s.pitchRate +
  s.yawRate * s.yawRate;

test("HDG uses bank, turns smoothly and reduces bank near target", () => {
  const start = setControl(initialState(), "selectedHeading", 150),
    early = advance(start, 6),
    end = advance(start, 100);
  assert.ok(early.bank > 5 && early.heading > 90 && early.heading < 150);
  near(end.heading, 150, 0.4);
  assert.ok(Math.abs(end.bank) < 0.2);
});
test("heading wraps across north using the shortest turn", () => {
  const start = setControl(
      { ...initialState(), heading: 350 },
      "selectedHeading",
      10,
    ),
    end = advance(start, 100);
  near(headingError(10, 350), 20, 0.01);
  assert.ok(advance(start, 5).bank > 0);
  near(headingError(10, end.heading), 0, 0.3);
});
test("AP disengage prevents commanded heading turn", () => {
  const s = advance(
    setControl(setControl(initialState(), "selectedHeading", 150), "ap", false),
    60,
  );
  near(s.heading, 90, 0.001);
  near(s.aileron, 0, 0.001);
});
test("roll channel OFF prevents bank command actuation", () => {
  const s = advance(setControl(initialState("axes"), "rollOn", false), 30);
  near(s.bank, 0, 0.001);
  near(s.aileron, 0, 0.001);
});
test("roll and pitch references create surface movement then settle", () => {
  const s = advance(initialState("axes"), 60);
  near(s.bank, 15, 0.1);
  near(s.pitch, 4, 0.1);
  assert.ok(s.altitude > 3000 && s.vs > 500);
});
test("negative pitch creates descent; positive pitch creates climb", () => {
  const up = advance(setControl(initialState("axes"), "selectedPitch", 5), 30),
    down = advance(setControl(initialState("axes"), "selectedPitch", -5), 30);
  assert.ok(up.vs > 0 && up.altitude > 3000);
  assert.ok(down.vs < 0 && down.altitude < 3000);
});
test("altitude acquisition closes the loop and annunciates ALT HOLD", () => {
  const s = advance(
    selectMode(setControl(initialState(), "selectedAltitude", 5000), "ALT ACQ"),
    200,
  );
  near(s.altitude, 5000, 2);
  assert.equal(s.vertical, "ALT HOLD");
  assert.ok(!s.armed.includes("ALT"));
});
test("ALT HOLD latches actual altitude; changing selected altitude alone does not climb", () => {
  let s = { ...initialState(), altitude: 4200 };
  s = selectMode(s, "ALT HOLD");
  s = setControl(s, "selectedAltitude", 8000);
  s = advance(s, 60);
  near(s.altitude, 4200, 0.1);
  near(s.holdAltitude, 4200, 0.1);
});
test("VS follows a vertical-speed command and captures the selected altitude", () => {
  const start = selectMode(
    setControl(
      setControl(initialState(), "selectedAltitude", 3800),
      "selectedVS",
      1000,
    ),
    "VS",
  );
  near(advance(start, 20).vs, 1000, 10);
  const end = advance(start, 180);
  near(end.altitude, 3800, 2);
  assert.equal(end.vertical, "ALT HOLD");
});
test("NAV intercept arms, captures, then tracks near-zero lateral deviation", () => {
  const start = selectMode(initialState(), "NAV");
  assert.ok(start.armed.includes("NAV"));
  assert.equal(start.lateral, "NAV INT");
  const end = advance(start, 240);
  assert.equal(end.lateral, "NAV");
  near(end.navDeviation, 0, 0.001);
  assert.ok(!end.armed.includes("NAV"));
});
test("selecting HDG after APP exits approach guidance instead of overriding HDG", () => {
  const s = selectMode(
    setControl(
      advance(selectMode(initialState(), "APP"), 10),
      "selectedHeading",
      150,
    ),
    "HDG",
  );
  assert.equal(s.phase, "READY");
  const end = advance(s, 120);
  near(end.heading, 150, 0.5);
  assert.equal(end.lateral, "HDG");
});
test("yaw damper produces opposite rudder and dissipates oscillation energy", () => {
  const base = initialState("yaw"),
    on = advance(base, 20),
    off = advance(setControl(base, "yd", false), 20),
    early = advance(base, 0.2);
  assert.ok(early.rudderCommand * early.yawRate < 0);
  assert.ok(
    on.yaw ** 2 + on.yawRate ** 2 < (off.yaw ** 2 + off.yawRate ** 2) * 0.01,
  );
});
test("damping and aircraft sensitivity change settling behavior", () => {
  const s = initialState("yaw");
  const low = advance(setControl(s, "damping", 0.2), 10),
    high = advance(setControl(s, "damping", 2), 10);
  assert.ok(
    high.yaw ** 2 + high.yawRate ** 2 < low.yaw ** 2 + low.yawRate ** 2,
  );
  assert.notEqual(
    advance(setControl(s, "sensitivity", 0.5), 3).yaw,
    advance(setControl(s, "sensitivity", 2), 3).yaw,
  );
});
test("yaw sensor failure stops both damper and yaw-channel actuation", () => {
  const s = advance(setFailure(initialState("axes"), "yawSensor", true), 5);
  assert.equal(s.controls.yd, false);
  near(s.rudder, 0, 0.001);
});
test("trim removes elevator command while maintaining pitch", () => {
  const on = advance(initialState("trim"), 60),
    off = advance(setControl(initialState("trim"), "autoTrim", false), 60);
  near(on.pitch, 6, 0.01);
  near(off.pitch, 6, 0.01);
  assert.ok(on.load < off.load * 0.01);
  assert.ok(on.trim > 2);
});
test("trim failure freezes position and retains sustained load", () => {
  const start = advance(initialState("trim"), 30);
  const end = advance(
    setControl(setFailure(start, "trim", true), "selectedPitch", 10),
    40,
  );
  assert.equal(end.trim, start.trim);
  assert.ok(end.load > 5);
  near(end.pitch, 10, 0.1);
});
test("A/T responds to speed error with a lever and engine lag", () => {
  const start = setControl(initialState("throttle"), "selectedSpeed", 220),
    early = advance(start, 1),
    end = advance(start, 160);
  assert.ok(early.thrustCommand > early.lever && early.lever > early.thrust);
  assert.ok(early.speed < 200);
  near(end.speed, 220, 0.5);
});
test("higher drag increases required thrust at the same speed", () => {
  const normal = advance(initialState("throttle"), 150),
    drag = advance(setControl(initialState("throttle"), "drag", 1.5), 150);
  near(drag.speed, 180, 0.5);
  assert.ok(drag.thrust > normal.thrust * 1.4);
});
test("greater mass reduces initial acceleration", () => {
  const s = setControl(initialState("throttle"), "selectedSpeed", 230),
    light = advance(setControl(s, "mass", 30000), 5),
    heavy = advance(setControl(s, "mass", 90000), 5);
  assert.ok(light.speed > heavy.speed);
});
test("steady headwind reduces ground speed while IAS returns to target", () => {
  const s = advance(setControl(initialState("throttle"), "wind", 30), 160);
  near(s.speed, 180, 0.5);
  near(s.groundSpeed, 150, 0.5);
});
test("A/T servo failure freezes lever despite increasing command", () => {
  const s = advance(
    setControl(
      setFailure(initialState("throttle"), "atServo", true),
      "selectedSpeed",
      240,
    ),
    30,
  );
  near(s.lever, 0.48, 0.0001);
  assert.ok(s.thrustCommand > 0.9);
  assert.ok(s.speed < 190);
});
test("slow engine failure causes a measurably slower thrust response", () => {
  const s = setControl(initialState("throttle"), "selectedSpeed", 230);
  assert.ok(
    advance(setFailure(s, "engineSlow", true), 3).thrust < advance(s, 3).thrust,
  );
});
test("A/T OFF applies manual throttle", () => {
  const s = advance(
    setControl(
      setControl(initialState("throttle"), "at", false),
      "manualThrust",
      0.2,
    ),
    30,
  );
  near(s.lever, 0.2, 0.001);
  assert.ok(s.speed < 170);
});
test("unreachable speed target reports thrust saturation", () => {
  const s = advance(
    setControl(initialState("throttle"), "selectedSpeed", 280),
    180,
  );
  assert.ok(s.warnings.some((v) => v.startsWith("THRUST LIMIT")));
  assert.ok(s.speed < 280);
});
test("APP starts armed and default autoland visits every physical phase in order", () => {
  const s = selectMode(initialState("autoland"), "APP");
  assert.deepEqual(s.armed, ["LOC", "G/S", "FLARE"]);
  const end = advance(s, 300);
  assert.deepEqual(end.phaseLog, [
    "READY",
    "APP ARM",
    "LOCALIZER CAPTURE",
    "GLIDESLOPE CAPTURE",
    "APPROACH",
    "FLARE",
    "LAND",
    "TOUCHDOWN",
  ]);
  near(end.altitude, 0, 0.01);
  assert.ok(Math.abs(end.lateralOffset) < 30);
});
test("27 offset / glideslope / crosswind combinations capture and land", () => {
  for (const lateral of [-500, 0, 500])
    for (const vertical of [-250, 0, 250])
      for (const wind of [-25, 0, 25]) {
        let s = initialState("autoland");
        s = setControl(s, "approachOffset", lateral);
        s = setControl(s, "glideOffset", vertical);
        s = setControl(s, "crosswind", wind);
        const end = advance(selectMode(s, "APP"), 300);
        assert.equal(
          end.phase,
          "TOUCHDOWN",
          JSON.stringify({ lateral, vertical, wind }),
        );
      }
});
for (const id of [
  "loc",
  "gs",
  "ra",
  "atServo",
  "ap",
  "sensorDisagree",
] as const)
  test(`autoland ${id} failure interrupts without a false touchdown`, () => {
    let s = advance(selectMode(initialState("autoland"), "APP"), 60);
    s = setFailure(s, id, true);
    assert.equal(s.phase, "INTERRUPTED");
    const end = advance(s, 300);
    assert.equal(end.phase, "INTERRUPTED");
    assert.ok(!end.phaseLog.includes("TOUCHDOWN"));
    assert.ok(end.warnings.some((v) => v.includes("AUTOLAND UNAVAILABLE")));
  });
test("go-around produces climb when control paths are healthy", () => {
  let s = advance(selectMode(initialState("autoland"), "APP"), 60);
  const alt = s.altitude;
  s = advance(selectMode(s, "GA"), 30);
  assert.equal(s.phase, "GO-AROUND");
  assert.ok(s.altitude > alt + 500);
  assert.ok(s.vs > 1000);
  assert.ok(s.thrust > 0.85);
});
test("GA does not repair an autopilot-channel failure", () => {
  let s = setFailure(
    advance(selectMode(initialState("autoland"), "APP"), 30),
    "ap",
    true,
  );
  s = advance(selectMode(s, "GA"), 20);
  assert.equal(s.controls.ap, false);
  assert.ok(s.warnings.some((v) => v.includes("manuel uçuş")));
  near(s.elevator, 0, 0.001);
});
test("air data loss prevents altitude and speed control, including re-selection", () => {
  let s = setFailure(initialState(), "airData", true);
  assert.equal(s.controls.at, false);
  assert.equal(s.vertical, "PITCH");
  s = advance(selectMode(s, "ALT ACQ"), 1);
  assert.equal(s.vertical, "PITCH");
});
test("restoring a sensor does not silently re-engage the AP", () => {
  let s = setFailure(initialState(), "attitude", true);
  s = setFailure(s, "attitude", false);
  assert.equal(s.controls.ap, false);
  s = setControl(s, "ap", true);
  assert.equal(s.controls.ap, true);
});
test("failed aileron servo preserves no-turn symptom despite bank command", () => {
  const s = advance(
    setControl(
      setFailure(initialState(), "rollServo", true),
      "selectedHeading",
      150,
    ),
    60,
  );
  assert.ok(s.bankCommand > 20);
  near(s.aileron, 0, 0.001);
  near(s.heading, 90, 0.001);
});
test("SAS reduces all-axis disturbance energy", () => {
  const s = disturb(initialState("sas"), "all"),
    on = advance(s, 30),
    off = advance(setControl(s, "sas", false), 30);
  assert.ok(energy(on) < energy(off) * 0.01);
});

test("yaw reference converges with rate damping and yaw changes nose heading", () => {
  const s = setControl(
    setControl(initialState("axes"), "selectedBank", 0),
    "selectedYaw",
    4,
  );
  const end = advance(s, 60);
  near(end.yaw, 4, 0.01);
  near(end.yawRate, 0, 0.01);
  near(end.heading, 94, 0.01);
});

test("yaw disturbance changes heading even without a bank command", () => {
  const s = advance(setControl(initialState("yaw"), "ap", false), 1);
  near(s.bank, 0, 0.001);
  assert.ok(s.heading > 90.5);
});
test("SAS reference or power loss behaves as SAS OFF", () => {
  const s = disturb(initialState("sas"), "all"),
    off = advance(setControl(s, "sas", false), 10);
  for (const failure of ["power", "attitude"] as const) {
    const failed = advance(setFailure(s, failure, true), 10);
    near(failed.bank, off.bank, 0.0001);
    near(failed.yaw, off.yaw, 0.0001);
  }
});
test("deterministic turbulence is reproducible and changes the trajectory", () => {
  const s = setControl(initialState("axes"), "turbulence", 3);
  assert.deepEqual(advance(s, 20), advance(s, 20));
  assert.notEqual(advance(s, 20).bank, advance(initialState("axes"), 20).bank);
});
test("state operations preserve their inputs", () => {
  const s = initialState(),
    snapshot = structuredClone(s);
  step(s, 0.025);
  setControl(s, "wind", 30);
  setFailure(s, "ap", true);
  selectMode(s, "APP");
  disturb(s, "roll");
  assert.deepEqual(s, snapshot);
});
test("invalid and extreme numeric input is bounded and remains finite", () => {
  for (const lab of [
    "axes",
    "yaw",
    "trim",
    "throttle",
    "autoland",
    "sas",
    "sandbox",
  ] as const) {
    let s = initialState(lab);
    for (const [key, value] of Object.entries(s.controls))
      if (typeof value === "number")
        s = setControl(s, key as keyof Controls, Number.NaN);
    s = advance(s, 120);
    for (const [key, value] of Object.entries(sample(s)))
      assert.ok(Number.isFinite(value), `${lab} ${key}`);
  }
  assert.equal(step(initialState(), Number.NaN).time, 0);
  assert.ok(step(initialState(), 1000).time <= 0.05);
});
test("every failure can be injected, reported and reset", () => {
  for (const id of failureIds) {
    const s = setFailure(initialState(), id, true);
    assert.equal(s.failures[id], true);
    assert.ok(s.warnings.length > 0);
    assert.equal(setFailure(s, id, false).failures[id], false);
  }
  assert.deepEqual(initialState(), initialState());
});
test("all labs, loop stages and interface references resolve to real content", () => {
  assert.equal(labs.length, 15);
  assert.equal(new Set(labs.map((v) => v.id)).size, labs.length);
  for (const lab of labs)
    for (const field of ["learn", "experiment", "why"] as const)
      assert.ok(lab[field].length > 30);
  for (const id of [...loopIds, ...interfaceIds])
    assert.ok(components.some((v) => v.id === id));
  for (const component of components)
    for (const field of [
      "purpose",
      "input",
      "process",
      "output",
      "failure",
      "related",
    ] as const)
      assert.ok(component[field].length > 5);
});
test("28 explained questions cover seven question types and have valid answers", () => {
  assert.equal(questions.length, 28);
  assert.ok(new Set(questions.map((v) => v.type)).size >= 7);
  assert.equal(new Set(questions.map((v) => v.text)).size, questions.length);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.ok(q.answer >= 0 && q.answer < 4);
    assert.ok(q.why.length > 30);
  }
});
test("seven diagnostic cases contain independent inspection evidence", () => {
  assert.equal(scenarios.length, 7);
  for (const s of scenarios) {
    assert.equal(Object.keys(s.evidence).length, 4);
    assert.equal(s.options.length, 4);
    assert.ok(s.options[s.answer]);
    assert.ok(s.why.length > 30);
  }
});
