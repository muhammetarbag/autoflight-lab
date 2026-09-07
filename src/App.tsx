import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  BookOpen,
  ChevronRight,
  CircleHelp,
  CircuitBoard,
  Compass,
  Cpu,
  FlaskConical,
  Gauge,
  GraduationCap,
  Menu,
  Network,
  Pause,
  Plane,
  PlaneLanding,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Wind,
  X,
} from "lucide-react";
import { labs, sources } from "./content/course";
import type { Lab } from "./sim/engine";
import { useSimulation } from "./sim/useSimulation";
import {
  AutolandLab,
  AxesLab,
  ModesLab,
  NavigationLab,
  SasLab,
  ThrottleLab,
  TrimLab,
  YawLab,
} from "./components/FlightLabs";
import {
  ArchitectureLab,
  ComponentsLab,
  FundamentalsLab,
  InterfacesLab,
} from "./components/SystemLabs";
import { QuizLab, TroubleshootingLab } from "./components/ChallengeLabs";
const icons = {
  fundamentals: Network,
  axes: ArrowDownUp,
  yaw: Wind,
  trim: Settings2,
  modes: Gauge,
  navigation: Radio,
  throttle: Activity,
  autoland: PlaneLanding,
  sas: ScanLine,
  architecture: Plane,
  interfaces: Cpu,
  components: CircuitBoard,
  faults: ShieldCheck,
  sandbox: FlaskConical,
  quiz: GraduationCap,
};
function fromHash(): Lab {
  const value = location.hash.slice(1);
  return labs.some((v) => v.id === value) ? (value as Lab) : "modes";
}
function SourceDialog({ close }: { close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog ref={ref} className="source-dialog" onCancel={close}>
      <div className="panel-heading">
        <div>
          <span className="eyebrow">MODEL NOTES / REFERENCES</span>
          <h2>Bu laboratuvarın sınırları</h2>
        </div>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Kaynakları kapat"
        >
          <X />
        </button>
      </div>
      <p className="model-notice">
        Simplified educational model — not aircraft-specific.
      </p>
      <p>
        Bu çalışma AEE 303 / ATA 22 kavramlarını neden-sonuç deneyleriyle
        öğretir. Uçuş eğitimi cihazı, aircraft performance hesabı veya bakım
        prosedürü değildir.
      </p>
      <ul>
        <li>
          Sabit adımlı, deterministik ve sınırlandırılmış roll / pitch / yaw
          modeli. Katsayılar ve limitler eğitim için seçilmiştir.
        </li>
        <li>
          Yaw damper, Dutch roll’ün tamamını değil, hafif sönümlü tek bir yaw
          salınıcısını gösterir. SAS rotor aerodinamiğini çözmez.
        </li>
        <li>
          A/T normalize thrust ve quadratic drag kullanır. Sabit rüzgâr ground
          speed’i; değişen rüzgâr kısa süreli IAS yanıtını etkiler.
        </li>
        <li>
          Autoland: düz arazi, sıfır pist kotu, 3° yol ve genel capture
          eşikleri. Yedeklilik, CAT II/III yetkilendirmesi veya üreticiye özgü
          fail-operational mantık yoktur.
        </li>
        <li>
          AP kapalıyken FMA guidance komutları FD ONLY olarak görünür. Arızalı
          sensörün fiziksel değeri eğitim amacıyla ayrı gösterilebilir.
        </li>
      </ul>
      <h3>Kavram kaynakları</h3>
      <div className="source-links">
        {sources.map((source) => (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            key={source.url}
          >
            <BookOpen size={17} />
            <span>
              <strong>{source.name}</strong>
              <small>{source.note}</small>
            </span>
            <ChevronRight size={17} />
          </a>
        ))}
      </div>
      <p className="hint">
        Kaynaklar kavramları destekler; bu simülasyonun sayısal katsayılarını
        veya aircraft-specific davranışını doğrulamaz.
      </p>
      <button className="button primary" onClick={close}>
        Laboratuvara dön
      </button>
    </dialog>
  );
}
export default function App() {
  const [page, setPage] = useState<Lab>(fromHash),
    [mobileOpen, setMobileOpen] = useState(false),
    [sourceOpen, setSourceOpen] = useState(false),
    [epoch, setEpoch] = useState(0),
    [visited, setVisited] = useState<Set<Lab>>(() => new Set([fromHash()]));
  const sim = useSimulation(),
    lab = labs.find((v) => v.id === page)!;
  useEffect(() => {
    const onHash = () => setPage(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    sim.reset(page);
    setVisited((v) => new Set([...v, page]));
    document.title = `${lab.title} · AEE 303 Autoflight Lab`;
  }, [page, lab.title, sim.reset]);
  const navigate = (id: Lab) => {
    location.hash = id;
    setPage(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const reset = () => {
    sim.reset(page);
    sim.setRate(1);
    sim.setRunning(true);
    setEpoch((v) => v + 1);
  };
  const content = () => {
    switch (page) {
      case "fundamentals":
        return <FundamentalsLab sim={sim} />;
      case "axes":
        return <AxesLab sim={sim} />;
      case "yaw":
        return <YawLab sim={sim} />;
      case "trim":
        return <TrimLab sim={sim} />;
      case "modes":
        return <ModesLab sim={sim} />;
      case "navigation":
        return <NavigationLab sim={sim} />;
      case "throttle":
        return <ThrottleLab sim={sim} />;
      case "autoland":
        return <AutolandLab sim={sim} />;
      case "sas":
        return <SasLab sim={sim} />;
      case "architecture":
        return <ArchitectureLab />;
      case "interfaces":
        return <InterfacesLab sim={sim} />;
      case "components":
        return <ComponentsLab />;
      case "faults":
        return <TroubleshootingLab />;
      case "sandbox":
        return <ModesLab sim={sim} sandbox />;
      case "quiz":
        return <QuizLab />;
    }
  };
  return (
    <div className="app-shell" data-running={sim.running}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        İçeriğe geç
      </a>
      {mobileOpen && (
        <button
          className="nav-backdrop"
          aria-label="Menüyü kapat"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Plane size={24} />
          </div>
          <div>
            <strong>
              AUTOFLIGHT<span>VIRTUAL LABORATORY</span>
            </strong>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Navigasyonu kapat"
          >
            <X size={18} />
          </button>
        </div>
        <div className="course-label">
          <span>AEE 303</span>
          <b>ATA 22</b>
        </div>
        <nav aria-label="Laboratuvarlar">
          {[...new Set(labs.map((v) => v.group))].map((group) => (
            <div className="nav-group" key={group}>
              <h2>{group}</h2>
              {labs
                .filter((v) => v.group === group)
                .map((v) => {
                  const Icon = icons[v.id];
                  return (
                    <a
                      key={v.id}
                      href={`#${v.id}`}
                      aria-current={page === v.id ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(v.id);
                      }}
                    >
                      <Icon size={17} />
                      <span>
                        {v.title === "Autopilot Modes Simulator"
                          ? "Autopilot Modes"
                          : v.title === "Automatic Landing Lab"
                            ? "Autoland Lab"
                            : v.title === "Failure & Troubleshooting"
                              ? "Troubleshooting"
                              : v.title === "Navigation Aids Interface"
                                ? "Navigation Interface"
                                : v.title === "FCC Interface Explorer"
                                  ? "FCC Interfaces"
                                  : v.title === "Quiz / Challenge Mode"
                                    ? "Quiz & Challenges"
                                    : v.title}
                      </span>
                      {page === v.id && <ChevronRight size={13} />}
                    </a>
                  );
                })}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div>
            <GraduationCap size={17} />
            <span>DERS KEŞFİ</span>
            <b>
              {visited.size}/{labs.length}
            </b>
          </div>
          <div className="course-progress">
            <span style={{ width: `${(visited.size / labs.length) * 100}%` }} />
          </div>
          <small>{visited.size} laboratuvar açıldı</small>
          <button onClick={() => setSourceOpen(true)}>
            <BookOpen size={15} />
            Model & kaynaklar
            <ChevronRight size={13} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Laboratuvar menüsü"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} />
            </button>
            <span>VIRTUAL LAB</span>
            <ChevronRight size={13} />
            <strong>{lab.code}</strong>
            <span className="topbar-divider" />
            <span className="course-name">Automatic Flight Systems</span>
          </div>
          <div className="session-status">
            <i className={sim.running ? "running" : ""} />
            {sim.running ? "SIMULATION LIVE" : "SIMULATION PAUSED"}
            <span>LOCAL SESSION</span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="lesson-dot" />
                AEE 303 / {lab.group}
              </div>
              <h1>{lab.title}</h1>
              <p>
                {lab.short} <span>·</span> Komut ver. Tepkiyi gözle. Sistemi
                anla.
              </p>
            </div>
            <div className="simulation-toolbar">
              <div className="sim-clock">
                <span>SIM TIME</span>
                <strong>
                  {Math.floor(sim.state.time / 60)
                    .toString()
                    .padStart(2, "0")}
                  :
                  {Math.floor(sim.state.time % 60)
                    .toString()
                    .padStart(2, "0")}
                </strong>
              </div>
              <div
                className="rate-controls"
                role="group"
                aria-label="Simülasyon hızı"
              >
                {[1, 4, 12].map((rate) => (
                  <button
                    key={rate}
                    aria-pressed={sim.rate === rate}
                    onClick={() => sim.setRate(rate)}
                  >
                    {rate}×
                  </button>
                ))}
              </div>
              <button
                className="icon-button pause-button"
                onClick={() => sim.setRunning((v) => !v)}
                aria-label={
                  sim.running ? "Simülasyonu duraklat" : "Simülasyonu sürdür"
                }
              >
                {sim.running ? <Pause size={17} /> : <Play size={17} />}
              </button>
              {page !== "quiz" && (
                <button
                  className="button secondary reset-global"
                  onClick={reset}
                >
                  <RotateCcw size={14} />
                  RESET LAB
                </button>
              )}
            </div>
          </div>
          <div className="learn-strip">
            <span>
              <BookOpen size={16} />
              LEARN
            </span>
            <p>{lab.learn}</p>
          </div>
          <div className="experiment-prompt">
            <FlaskConical size={16} />
            <b>EXPERIMENT</b>
            <span>{lab.experiment}</span>
          </div>
          <div className="lab-content" key={`${page}-${epoch}`}>
            {content()}
          </div>
          <div className="why-panel">
            <CircleHelp size={23} />
            <div>
              <span>WHY?</span>
              <p>{lab.why}</p>
            </div>
            <Compass size={42} />
          </div>
          <footer>
            <span>
              <ShieldCheck size={14} />
              Simplified educational model — not aircraft-specific.
            </span>
            <button onClick={() => setSourceOpen(true)}>
              Model varsayımları & kaynaklar
              <ChevronRight size={13} />
            </button>
            <small>AEE 303 · ATA 22</small>
          </footer>
        </main>
      </div>
      {sourceOpen && <SourceDialog close={() => setSourceOpen(false)} />}
    </div>
  );
}
