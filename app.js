
// PWA: register SW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}

// Simple localStorage state
function useLocalState(key, initial) {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch { return initial; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

function Badge({ children }) {
  return React.createElement("span", { className: "inline-flex items-center rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-200" }, children);
}

const SAMPLE_QUESTIONS = [
  {
    id: "2024-AM-103-01",
    year: 2024,
    sectionCode: "103",
    section: "103 不動産投資の基礎",
    type: "A",
    stem: "不動産投資の基本概念に関する次の記述（ア〜エ）について、正誤を判定せよ。",
    choices: [
      { id: "ア", text: "リスク要因の洗い出しは投資判断に直結するため重要である。", isTrue: true,  explain: "要点: リスク特定→管理→期待収益調整。落とし穴: 用語の混同。" },
      { id: "イ", text: "リスクが高いほど必ず期待収益は低下する。",                       isTrue: false, explain: "要点: 一般にリスクが高いほど期待収益率は上昇要求。落とし穴: ‘必ず’という断定に注意。" },
      { id: "ウ", text: "ストック社会では維持更新投資の重要性が高まる。",                  isTrue: true,  explain: "要点: 保全投資→CFの安定性。落とし穴: 修繕=費用だけと誤解しない。" },
      { id: "エ", text: "事後修繕のみを徹底すればライフサイクルコストは最小となる。",      isTrue: false, explain: "要点: 予防保全が有効。落とし穴: 目先コストと長期最適の混同。" },
    ],
    globalExplain: "投資基本と維持管理。用語の『絶対・必ず』に注意。",
    difficulty: 1,
    keywords: ["基本概念", "維持更新", "リスク"]
  },
  {
    id: "2024-PM-104-07",
    year: 2024,
    sectionCode: "104",
    section: "104 不動産証券化の法務／会計・税務",
    type: "B",
    stem: "SPCストラクチャに関する記述（ア〜エ）のうち『正しいものはいくつ』か。各選択肢に○×を付けよ。",
    choices: [
      { id: "ア", text: "倒産隔離ではSPCの目的限定や関与者の申立制限が論点になる。", isTrue: true,  explain: "要点: 目的限定・ノンリコ・申立制限等。" },
      { id: "イ", text: "TMKは常に不動産そのものではなく受益権しか保有できない。",     isTrue: false, explain: "要点: TMKは現物を直接保有可能（スキームに依存）。" },
      { id: "ウ", text: "真正売買性と会計オフバランスは完全に無関係で個別判断。",       isTrue: false, explain: "要点: 法律論と会計論は別概念だが相互に影響・整合の検討が必要。" },
      { id: "エ", text: "倒産手続申立てをしない旨の誓約取得は隔離強化の一手段。",       isTrue: true,  explain: "要点: ノン・ペティション条項等。" },
    ],
    globalExplain: "法務の基礎。ノンペティション/真正売買/保有形態の整理。",
    difficulty: 2,
    keywords: ["倒産隔離", "TMK", "真正売買"]
  },
];

function App() {
  const [focusSections, setFocusSections] = useLocalState("focus.sections", []);
  const [qIndex, setQIndex] = useLocalState("q.index", 0);
  const [choiceCursor, setChoiceCursor] = React.useState(0);
  const [marks, setMarks] = React.useState({});
  const [showExplain, setShowExplain] = React.useState(false);
  const [lastResult, setLastResult] = React.useState(null);
  const [stats, setStats] = useLocalState("stats.v1", {});

  const pool = React.useMemo(() => {
    const base = SAMPLE_QUESTIONS;
    return (focusSections?.length ?? 0) > 0 ? base.filter(q => focusSections.includes(q.sectionCode)) : base;
  }, [focusSections]);
  const q = pool[qIndex % pool.length];
  const current = q.choices[choiceCursor];

  const handleMark = (mark) => {
    if (marks[current.id]) return;
    const isCorrect = (mark === "○" && current.isTrue) || (mark === "×" && !current.isTrue);
    setMarks(prev => ({ ...prev, [current.id]: mark }));
    setLastResult({ correct: isCorrect });
    setShowExplain(true);
  };

  const encourage = React.useMemo(() => {
    if (!lastResult || lastResult.correct) return null;
    const msgs = [
      "ナイスチャレンジ！落とし穴ワードに注意しよう。",
      "ここは頻出。解説の“要点”だけ押さえればOK！",
      "次は取れる！キーワードを1つ覚えるだけで正答率UP。",
    ];
    return msgs[(qIndex + choiceCursor) % msgs.length];
  }, [lastResult, qIndex, choiceCursor]);

  const closeExplain = () => {
    setShowExplain(false);
    if (choiceCursor < q.choices.length - 1) {
      setChoiceCursor(choiceCursor + 1);
    } else {
      const perChoiceAllCorrect = q.choices.every(ch => {
        const mk = marks[ch.id];
        return (mk === "○" && ch.isTrue) || (mk === "×" && !ch.isTrue);
      });
      setStats(prev => {
        const s = { ...(prev || {}) };
        const cur = s[q.sectionCode] || { seen: 0, perfect: 0, wrongChoices: 0 };
        cur.seen += 1;
        if (perChoiceAllCorrect) cur.perfect += 1; else {
          cur.wrongChoices += q.choices.filter(ch => {
            const mk = marks[ch.id];
            return !((mk === "○" && ch.isTrue) || (mk === "×" && !ch.isTrue));
          }).length;
        }
        s[q.sectionCode] = cur;
        return s;
      });
      setMarks({});
      setChoiceCursor(0);
      setQIndex(idx => idx + 1);
    }
  };

  const goPrevChoice = () => { if (choiceCursor > 0) setChoiceCursor(choiceCursor - 1); };

  const sectionList = React.useMemo(() => {
    const codes = Array.from(new Set(SAMPLE_QUESTIONS.map(x => x.sectionCode)));
    return codes;
  }, []);

  const rateFor = (code) => {
    const s = stats[code] || { seen: 0, perfect: 0, wrongChoices: 0 };
    const rate = s.seen ? Math.round((s.perfect / s.seen) * 100) : 0;
    return `${rate}%（${s.perfect}/${s.seen}）`;
  };

  const weakCodes = React.useMemo(() => {
    return sectionList.filter(cd => {
      const s = stats[cd];
      if (!s) return false;
      const perfectRate = s.seen ? s.perfect / s.seen : 1;
      return perfectRate < 0.6 || (s.wrongChoices || 0) >= 4;
    });
  }, [stats, sectionList]);

  return React.createElement("div", { className: "min-h-screen bg-black text-neutral-100" },
    React.createElement("header", { className: "sticky top-0 z-10 border-b border-neutral-800 bg-black/80 backdrop-blur" },
      React.createElement("div", { className: "mx-auto flex max-w-3xl items-center justify-between px-4 py-3" },
        React.createElement("div", { className: "text-sm uppercase tracking-widest text-neutral-400" }, "Securitization Master"),
        React.createElement("div", { className: "flex items-center gap-2" },
          React.createElement("button", {
            className: "rounded-xl border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:bg-neutral-900",
            onClick: () => { setQIndex(0); setChoiceCursor(0); setMarks({}); }
          }, "再開")
        )
      )
    ),
    React.createElement("main", { className: "mx-auto max-w-3xl px-4 py-6" },
      React.createElement("div", { className: "mb-4 flex flex-wrap items-center gap-2" },
        React.createElement("span", { className: "text-xs text-neutral-400" }, "出題分野（タップで絞込）:"),
        ...sectionList.map(code => {
          const active = focusSections.includes(code);
          return React.createElement("button", {
            key: code,
            onClick: () => setFocusSections(prev => active ? prev.filter(x => x !== code) : [...prev, code]),
            className: `rounded-full border px-3 py-1 text-xs ${active ? "border-neutral-200 bg-neutral-100 text-black" : "border-neutral-700 text-neutral-300 hover:bg-neutral-900"}`
          }, code);
        }),
        React.createElement("button", { onClick: () => setFocusSections(weakCodes), className: "ml-2 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-900" }, "苦手だけ"),
        React.createElement("button", { onClick: () => setFocusSections([]), className: "rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-900" }, "解除"),
      ),
      React.createElement("div", { className: "mb-6 grid grid-cols-2 gap-3 md:grid-cols-4" },
        React.createElement("div", { className: "rounded-2xl border border-neutral-800 p-4" },
          React.createElement("div", { className: "text-xs text-neutral-400" }, "現在の分野"),
          React.createElement("div", { className: "text-xl" }, q.section)
        ),
        React.createElement("div", { className: "rounded-2xl border border-neutral-800 p-4" },
          React.createElement("div", { className: "text-xs text-neutral-400" }, "分野別正答率（完全正解率）"),
          React.createElement("div", { className: "mt-2 flex flex-wrap gap-2" },
            ...sectionList.map(cd => React.createElement(Badge, { key: cd }, `${cd}: ${rateFor(cd)}`))
          )
        ),
        React.createElement("div", { className: "rounded-2xl border border-neutral-800 p-4" },
          React.createElement("div", { className: "text-xs text-neutral-400" }, "問題進行"),
          React.createElement("div", { className: "text-2xl" }, `${(qIndex % pool.length) + 1} / ${pool.length}`)
        ),
        React.createElement("div", { className: "rounded-2xl border border-neutral-800 p-4" },
          React.createElement("div", { className: "text-xs text-neutral-400" }, "選択肢"),
          React.createElement("div", { className: "text-2xl" }, `${choiceCursor + 1} / ${q.choices.length}`)
        )
      ),
      React.createElement("div", { className: "rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow" },
        React.createElement("div", { className: "mb-2 text-xs text-neutral-400" }, `${q.year}年度 / ${q.section} / 形式: ${q.type}`),
        React.createElement("h1", { className: "mb-3 text-lg leading-relaxed" }, q.stem),
        React.createElement("div", { className: "mt-4 rounded-xl border border-neutral-800 p-4" },
          React.createElement("div", { className: "mb-2 flex items-center justify-between text-xs text-neutral-400" },
            React.createElement("span", null, `選択肢 ${choiceCursor + 1} / ${q.choices.length}`),
            React.createElement("div", { className: "flex items-center gap-2" },
              React.createElement("button", { onClick: () => { if (choiceCursor > 0) setChoiceCursor(choiceCursor - 1); }, className: "rounded-lg border border-neutral-700 px-2 py-1 hover:bg-neutral-900" }, "戻る")
            )
          ),
          React.createElement("div", { className: "text-base leading-relaxed mb-3" }, `${current.id}. ${current.text}`),
          React.createElement("div", { className: "mt-2 flex gap-2" },
            React.createElement("button", { className: "w-24 rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900 disabled:opacity-40", onClick: () => handleMark("○"), disabled: !!marks[current.id] }, "○ 正しい"),
            React.createElement("button", { className: "w-24 rounded-xl border border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-900 disabled:opacity-40", onClick: () => handleMark("×"), disabled: !!marks[current.id] }, "× 誤り")
          ),
          showExplain && React.createElement("div", { className: "mt-4 rounded-xl border border-neutral-700 bg-black/60 p-4" },
            React.createElement("div", { className: "mb-1 text-xs text-neutral-400" }, "解説"),
            React.createElement("div", { className: "mb-2" },
              current.isTrue ? React.createElement("div", { className: "text-green-400" }, "正解：○（正しい）") : React.createElement("div", { className: "text-red-400" }, "正解：×（誤り）")
            ),
            React.createElement("p", { className: "text-sm leading-relaxed text-neutral-200" },
              React.createElement("strong", null, "要点："), " ", current.explain.replace("要点:", "").split("落とし穴")[0]
            ),
            current.explain.includes("落とし穴") && React.createElement("p", { className: "mt-2 text-sm leading-relaxed text-neutral-300" },
              React.createElement("strong", null, "落とし穴："), current.explain.split("落とし穴:")[1]
            ),
            (!lastResult?.correct) && encourage && React.createElement("div", { className: "mt-3 text-sm text-amber-300" }, encourage),
            React.createElement("div", { className: "mt-4 flex justify-end" },
              React.createElement("button", { onClick: () => closeExplain(), className: "rounded-lg border border-neutral-700 px-3 py-1 hover:bg-neutral-900" }, "閉じる（次へ）")
            )
          )
        ),
        q.type === "B" && React.createElement("div", { className: "mt-4 text-xs text-neutral-400" }, "※B型：選択肢の○の数は問題終了時に自動集計されます。")
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
