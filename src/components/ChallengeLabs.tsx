import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Eye,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { questions, scenarios } from "../content/challenges";
import { Metric, Panel } from "./Instruments";

export function TroubleshootingLab() {
  const [index, setIndex] = useState(0),
    [inspected, setInspected] = useState<string[]>([]),
    [choice, setChoice] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false),
    [solved, setSolved] = useState<number[]>([]);
  const scenario = scenarios[index];
  const changeCase = (i: number) => {
    setIndex(i);
    setInspected([]);
    setChoice(null);
    setSubmitted(false);
  };
  return (
    <>
      <div className="case-tabs">
        {scenarios.map((v, i) => (
          <button
            key={v.title}
            aria-pressed={i === index}
            onClick={() => changeCase(i)}
          >
            <span>CASE {String(i + 1).padStart(2, "0")}</span>
            {v.title}
            {solved.includes(i) && <CheckCircle2 size={15} />}
          </button>
        ))}
      </div>
      <div className="two-column">
        <Panel
          title={scenario.title}
          kicker={`TROUBLESHOOTING / CASE ${index + 1}`}
        >
          <div className="symptom-box">
            <CircleHelp size={28} />
            <div>
              <span>GÖZLENEN BELİRTİ</span>
              <p>{scenario.symptom}</p>
            </div>
          </div>
          <div className="inspection-heading">
            <h3>Kanıt topla</h3>
            <span>{inspected.length} / 4 kontrol noktası</span>
          </div>
          <div className="inspection-list">
            {Object.entries(scenario.evidence).map(([key, value], i) => (
              <div key={key}>
                <button
                  onClick={() =>
                    setInspected((v) => (v.includes(key) ? v : [...v, key]))
                  }
                  aria-expanded={inspected.includes(key)}
                >
                  <span>{i + 1}</span>
                  <b>{key}</b>
                  {inspected.includes(key) ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {inspected.includes(key) && <p>{value}</p>}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Şüpheli arızayı seç" kicker="DIAGNOSIS">
          <p className="hint">
            Dört kontrol noktasını incele. Giriş, hesaplama ve fiziksel hareketi
            birlikte değerlendir.
          </p>
          <div className="answer-options">
            {scenario.options.map((v, i) => (
              <button
                key={v}
                className={`${choice === i ? "chosen" : ""} ${submitted && i === scenario.answer ? "correct" : ""} ${submitted && choice === i && i !== scenario.answer ? "incorrect" : ""}`}
                role="radio"
                aria-checked={choice === i}
                disabled={submitted}
                onClick={() => setChoice(i)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {v}
              </button>
            ))}
          </div>
          <button
            className="button primary wide"
            disabled={choice === null || inspected.length < 4 || submitted}
            onClick={() => {
              setSubmitted(true);
              if (choice === scenario.answer)
                setSolved((v) => [...new Set([...v, index])]);
            }}
          >
            <Search size={16} />
            Teşhisi kontrol et
          </button>
          {submitted && (
            <div
              className={`answer-feedback ${choice === scenario.answer ? "correct" : "incorrect"}`}
              role="status"
            >
              {choice === scenario.answer ? (
                <CheckCircle2 size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <div>
                <h3>
                  {choice === scenario.answer
                    ? "Doğru teşhis"
                    : "Kanıt zincirini tekrar değerlendir"}
                </h3>
                <p>{scenario.why}</p>
                <strong>Arıza: {scenario.options[scenario.answer]}</strong>
              </div>
            </div>
          )}
          {submitted && (
            <button
              className="button secondary wide"
              onClick={() => {
                setSubmitted(false);
                setChoice(null);
              }}
            >
              Yeniden değerlendir
            </button>
          )}
          <div className="case-progress">
            <ShieldCheck size={18} />
            {solved.length} / {scenarios.length} vaka çözüldü
          </div>
          <p className="hint">
            Vakalar kontrollü teşhis alıştırmalarıdır; bakım talimatı veya
            aircraft fault-isolation manual yerine kullanılmaz.
          </p>
        </Panel>
      </div>
    </>
  );
}
const storageKey = "aee303-quiz-v1";
function readAnswers(): Record<number, number> {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return Object.fromEntries(
      Object.entries(raw).filter(
        ([k, v]) =>
          /^\d+$/.test(k) &&
          Number(k) < questions.length &&
          Number.isInteger(v) &&
          Number(v) >= 0 &&
          Number(v) < 4,
      ),
    );
  } catch {
    return {};
  }
}
export function QuizLab() {
  const [answers, setAnswers] = useState<Record<number, number>>(readAnswers),
    [index, setIndex] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [storageNotice, setStorageNotice] = useState("");
  const answered = Object.keys(answers).length,
    correct = Object.entries(answers).filter(
      ([k, v]) => questions[Number(k)].answer === v,
    ).length;
  const submitted = answers[index] !== undefined,
    question = questions[index],
    selected = submitted ? answers[index] : choice;
  const save = (value: Record<number, number>) => {
    setAnswers(value);
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
      setStorageNotice("");
    } catch {
      setStorageNotice(
        "Tarayıcı kaydı kullanılamıyor. İlerlemen bu açık oturumda korunuyor.",
      );
    }
  };
  const go = (v: number) => {
    setIndex(v);
    setChoice(null);
  };
  return (
    <>
      <div className="quiz-score">
        <Metric
          label="SCORE"
          value={`${Math.round((correct / questions.length) * 100)}`}
          unit="/100"
        />
        <Metric label="CORRECT" value={String(correct)} tone="green" />
        <Metric
          label="INCORRECT"
          value={String(answered - correct)}
          tone="amber"
        />
        <Metric
          label="COMPLETION"
          value={`${Math.round((answered / questions.length) * 100)}`}
          unit="%"
        />
        <button
          className="button secondary"
          onClick={() => {
            save({});
            go(0);
          }}
        >
          Sınavı sıfırla
        </button>
      </div>
      <div className="completion-bar">
        <span style={{ width: `${(answered / questions.length) * 100}%` }} />
      </div>
      {storageNotice && (
        <p role="status" className="model-notice">
          {storageNotice}
        </p>
      )}
      <div className="quiz-layout">
        <Panel
          title={`Soru ${index + 1} / ${questions.length}`}
          kicker={`${question.topic.toUpperCase()} / ${question.type.toUpperCase()}`}
        >
          <h3 className="question-text">{question.text}</h3>
          <div
            className="answer-options"
            role="radiogroup"
            aria-label="Yanıt seçenekleri"
          >
            {question.options.map((v, i) => (
              <button
                key={v}
                role="radio"
                aria-checked={selected === i}
                className={`${selected === i ? "chosen" : ""} ${submitted && i === question.answer ? "correct" : ""} ${submitted && selected === i && i !== question.answer ? "incorrect" : ""}`}
                disabled={submitted}
                onClick={() => setChoice(i)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {v}
              </button>
            ))}
          </div>
          {!submitted ? (
            <button
              className="button primary"
              disabled={choice === null}
              onClick={() => {
                if (choice !== null) save({ ...answers, [index]: choice });
              }}
            >
              <ClipboardCheck size={16} />
              Yanıtı kontrol et
            </button>
          ) : (
            <div
              className={`answer-feedback ${selected === question.answer ? "correct" : "incorrect"}`}
              role="status"
            >
              {selected === question.answer ? (
                <CheckCircle2 size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <div>
                <h3>
                  {selected === question.answer
                    ? "Doğru yanıt"
                    : "Bu yanıt doğru değil"}
                </h3>
                <p>{question.why}</p>
                <strong>
                  Doğru yanıt: {question.options[question.answer]}
                </strong>
              </div>
            </div>
          )}
          <div className="quiz-navigation">
            <button
              className="button secondary"
              disabled={index === 0}
              onClick={() => go(index - 1)}
            >
              <ArrowLeft size={15} />
              Önceki
            </button>
            <span>{submitted ? "Yanıt kaydedildi" : "Yanıt bekleniyor"}</span>
            <button
              className="button secondary"
              disabled={index === questions.length - 1}
              onClick={() => go(index + 1)}
            >
              Sonraki
              <ArrowRight size={15} />
            </button>
          </div>
        </Panel>
        <Panel title="Challenge map" kicker="COURSE KNOWLEDGE">
          <div className="question-map">
            {questions.map((_, i) => (
              <button
                key={i}
                className={`${index === i ? "current" : ""} ${answers[i] !== undefined ? (answers[i] === questions[i].answer ? "correct" : "incorrect") : ""}`}
                aria-label={`Soru ${i + 1}`}
                aria-current={index === i ? "step" : undefined}
                onClick={() => go(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="map-legend">
            <span>
              <i className="green-dot" />
              Doğru
            </span>
            <span>
              <i className="amber-dot" />
              Yanlış
            </span>
            <span>
              <i />
              Bekliyor
            </span>
          </div>
          <p className="hint">
            Cevap, gönderimden önce gösterilmez. Yanıtlanmış sorulara dönerek
            açıklamaları inceleyebilirsin.
          </p>
          {answered === questions.length && (
            <div className="quiz-complete">
              <ShieldCheck size={32} />
              <h3>Challenge tamamlandı</h3>
              <p>
                {correct} doğru / {questions.length} soru. Yanlış yanıtların
                konularını ilgili laboratuvarda tekrar dene.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
