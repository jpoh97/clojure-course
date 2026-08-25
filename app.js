/* ============ Learn Clojure — app.js ============ */
"use strict";

var MODULES = [
  { id: "m01", slug: "m01-setup-and-repl.html",              title: "Setup & the REPL",                 phase: 1 },
  { id: "m02", slug: "m02-syntax-essentials.html",           title: "Syntax Essentials",                phase: 1 },
  { id: "m03", slug: "m03-collections-immutability.html",    title: "Collections & Immutability",       phase: 1 },
  { id: "m04", slug: "m04-functions-closures.html",          title: "Functions & Closures",             phase: 1 },
  { id: "m05", slug: "m05-control-flow-threading.html",      title: "Control Flow & Threading Macros",  phase: 1 },
  { id: "m06", slug: "m06-sequences-laziness-transducers.html", title: "Sequences, Laziness & Transducers", phase: 2 },
  { id: "m07", slug: "m07-state-concurrency.html",           title: "State & Concurrency",              phase: 2 },
  { id: "m08", slug: "m08-java-interop.html",                title: "Java Interop for JVM Veterans",    phase: 2 },
  { id: "m09", slug: "m09-macros-metaprogramming.html",      title: "Macros & Metaprogramming",         phase: 2 },
  { id: "m10", slug: "m10-web-backends-ring-reitit.html",    title: "Web Backends: Ring + Reitit",      phase: 3 },
  { id: "m11", slug: "m11-postgres-nextjdbc-honeysql.html",  title: "PostgreSQL: next.jdbc + HoneySQL", phase: 3 },
  { id: "m12", slug: "m12-frontend-cljs-reagent.html",       title: "Frontend: ClojureScript + Reagent", phase: 3 },
  { id: "m13", slug: "m13-testing-capstone.html",            title: "Testing & Capstone Project",       phase: 3 }
];

var PHASE_NAMES = {
  1: "Phase 1 · Foundations",
  2: "Phase 2 · Idiomatic Power",
  3: "Phase 3 · Real Applications"
};

var STORE_KEY = "learn-clojure-progress-v1";

function loadProgress() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    var p = raw ? JSON.parse(raw) : null;
    if (!p || typeof p !== "object") p = {};
    if (!p.scores) p.scores = {};
    if (!p.completed) p.completed = {};
    return p;
  } catch (e) {
    return { scores: {}, completed: {} };
  }
}

function saveProgress(p) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
}

function currentModuleId() {
  return document.body.getAttribute("data-module") || null;
}

function completedCount(p) {
  var n = 0;
  MODULES.forEach(function (m) { if (p.completed[m.id]) n++; });
  return n;
}

/* ---------------- Sidebar ---------------- */
function buildSidebar() {
  var el = document.getElementById("sidebar");
  if (!el) return;
  var p = loadProgress();
  var cur = currentModuleId();
  var html = '<nav class="side-nav">';
  html += '<a class="side-home" href="index.html">Course overview</a>';
  [1, 2, 3].forEach(function (ph) {
    html += '<div class="side-phase">' + PHASE_NAMES[ph] + "</div>";
    MODULES.filter(function (m) { return m.phase === ph; }).forEach(function (m) {
      var done = p.completed[m.id];
      var score = p.scores[m.id];
      html += '<a class="side-link' + (m.id === cur ? " active" : "") + '" href="' + m.slug + '">'
        + (done ? '<span class="check">&#10003;</span>' : '<span class="dot"></span>')
        + '<span class="side-title">' + m.title + "</span>"
        + (score != null ? '<span class="score">' + score + "%</span>" : "")
        + "</a>";
    });
  });
  html += "</nav>";
  el.innerHTML = html;

  el.querySelectorAll("a.side-link").forEach(function (a) {
    a.addEventListener("click", function () { el.classList.remove("open"); });
  });
}

/* ---------------- Topbar progress chip ---------------- */
function updateProgressChip() {
  var chip = document.getElementById("progressChip");
  if (!chip) return;
  var p = loadProgress();
  chip.textContent = completedCount(p) + "/" + MODULES.length + " passed";
}

/* ---------------- Home progress summary ---------------- */
function updateHomeProgress() {
  var box = document.getElementById("homeProgress");
  if (!box) return;
  var p = loadProgress();
  var done = completedCount(p);
  var pct = Math.round((done / MODULES.length) * 100);
  box.innerHTML =
    '<div class="stat"><b>' + done + "/" + MODULES.length + '</b> exams passed</div>' +
    '<div class="stat"><b>' + pct + '%</b> of the roadmap complete</div>' +
    (done > 0
      ? '<div class="stat"><b>Next up:</b> ' + nextModuleTitle(p) + "</div>"
      : '<div class="stat"><b>Start with:</b> Module 01 &mdash; Setup &amp; the REPL</div>');
}

function nextModuleTitle(p) {
  for (var i = 0; i < MODULES.length; i++) {
    if (!p.completed[MODULES[i].id]) return MODULES[i].title;
  }
  return "All done - revisit the capstone";
}

/* ---------------- Clojure syntax highlighting ---------------- */
var BUILTINS = [
  "def", "defn", "defn-", "defonce", "defmacro", "defrecord", "defprotocol",
  "deftype", "defmulti", "defmethod", "declare", "ns", "require", "import",
  "let", "letfn", "fn", "loop", "recur", "do", "if", "when", "when-not",
  "when-let", "when-some", "when-first", "if-let", "if-not", "if-some",
  "cond", "condp", "case", "doseq", "dotimes", "for", "while", "try",
  "catch", "finally", "throw", "quote", "var", "new", "set!",
  "binding", "with-open", "with-redefs", "with-out-str", "dosync", "locking",
  "io!", "lazy-seq", "lazy-cat", "delay", "future", "promise", "deliver",
  "deref", "atom", "swap!", "reset!", "reset-vals!", "swap-vals!",
  "compare-and-set!", "add-watch", "remove-watch", "set-validator!",
  "ref", "alter", "commute", "ensure", "ref-set", "agent", "send", "send-off",
  "await", "map", "mapv", "mapcat", "map-indexed", "keep", "keep-indexed",
  "filter", "filterv", "remove", "reduce", "reduce-kv", "reductions",
  "apply", "comp", "partial", "juxt", "complement", "identity", "constantly",
  "merge", "merge-with", "select-keys", "update", "update-in", "assoc",
  "assoc-in", "dissoc", "conj", "cons", "concat", "into", "zipmap", "group-by",
  "frequencies", "partition", "partition-all", "partition-by", "interleave",
  "interpose", "iterate", "repeat", "repeatedly", "range", "count", "str",
  "format", "println", "prn", "print", "name", "namespace", "symbol",
  "keyword", "list", "vector", "vec", "hash-map", "hash-set", "set", "sorted-map",
  "sorted-set", "contains?", "get", "get-in", "find", "peek", "pop", "subvec",
  "empty", "not-empty", "keys", "vals", "first", "second", "last", "rest",
  "next", "nth", "take", "take-while", "take-last", "take-nth", "drop",
  "drop-while", "drop-last", "sort", "sort-by", "distinct", "dedupe",
  "flatten", "reverse", "every?", "some", "not-any?", "not-every?", "seq",
  "sequence", "seq?", "doall", "dorun", "run!", "empty?", "nil?", "some?",
  "zero?", "pos?", "neg?", "even?", "odd?", "number?", "string?", "keyword?",
  "symbol?", "map?", "vector?", "list?", "set?", "coll?", "sequential?",
  "associative?", "counted?", "fn?", "ifn?", "instance?", "satisfies?",
  "class", "type", "min", "max", "abs", "inc", "dec", "quot", "rem", "mod",
  "min-key", "max-key", "into-array", "to-array", "aget", "aset", "alength",
  "amap", "areduce", "make-array", "test", "assert", "ex-info", "ex-data",
  "time", "rand", "rand-int", "rand-nth", "shuffle", "memoize", "trampoline",
  "pmap", "realized?", "force", "volatile!", "vswap!", "vreset!", "compare",
  "transduce", "eduction", "completing", "halt-when", "parse-long",
  "parse-double", "random-uuid", "tap>", "add-tap"
];

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeCljRegex() {
  var kwSrc = "::?[A-Za-z*+!_?<>=.-][\\w*+!?<>=.-]*(?:\\/[\\w*+!?<>=.-]+)?";
  var numSrc =
    "\\d+\\/\\d+" +
    "|0[xX][0-9a-fA-F]+" +
    "|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?M?N?";
  var biSrc = BUILTINS.map(escapeRe).join("|");
  var lead = "(?<![\\w*+!?<>=.$#'/-])";
  var trailKw = "";
  var trailBi = "(?![\\w*+!?<>=.$#'/-])";

  return new RegExp(
    [
      "(;[^\\n]*)",                                   // 1 comment
      '("(?:[^"\\\\\\n]|\\\\.)*")',                   // 2 string
      "(" + kwSrc + ")" + trailKw,                    // 3 keyword
      lead + "(nil|true|false)" + trailBi,            // 4 nil / booleans
      lead + "(" + numSrc + ")" + trailBi,            // 5 number
      lead + "(" + biSrc + ")" + trailBi              // 6 builtin fn/macro
    ].join("|"),
    "g"
  );
}

function highlightClojure(src) {
  var s = escHtml(src);
  var re = makeCljRegex();
  return s.replace(re, function (m, cm, st, kw, nb, nm, fn) {
    if (cm) return '<span class="cm">' + cm + "</span>";
    if (st) return '<span class="st">' + st + "</span>";
    if (kw) return '<span class="kw">' + kw + "</span>";
    if (nb) return '<span class="ni">' + nb + "</span>";
    if (nm) return '<span class="nm">' + nm + "</span>";
    if (fn) return '<span class="fn">' + fn + "</span>";
    return m;
  });
}

function highlightAllCode() {
  document.querySelectorAll("pre code").forEach(function (code) {
    var cls = code.className || "";
    if (cls.indexOf("language-clojure") !== -1 || cls === "" ) {
      try {
        code.innerHTML = highlightClojure(code.textContent);
      } catch (e) {
        /* older browser without lookbehind: leave plain */
      }
    } else {
      try { code.innerHTML = escHtml(code.textContent); } catch (e2) {}
    }
  });
}

/* ---------------- Code block chrome + copy buttons ---------------- */
function decoratePreBlocks() {
  document.querySelectorAll("pre").forEach(function (pre) {
    if (pre.parentElement && pre.parentElement.classList.contains("codewrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "codewrap";
    var head = document.createElement("div");
    head.className = "codehead";
    var code = pre.querySelector("code");
    var lang = "clojure";
    if (code && code.className.indexOf("language-bash") !== -1) lang = "shell";
    if (code && code.className.indexOf("language-text") !== -1) lang = "text";
    if (code && code.className.indexOf("language-edn") !== -1) lang = "edn";
    head.innerHTML = "<span>" + lang + "</span>";
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "copy";
    btn.addEventListener("click", function () {
      copyText(pre.innerText).then(function () {
        btn.textContent = "copied";
        btn.classList.add("ok");
        setTimeout(function () {
          btn.textContent = "copy";
          btn.classList.remove("ok");
        }, 1400);
      });
    });
    head.appendChild(btn);
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(head);
    wrap.appendChild(pre);
  });
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    resolve();
  });
}

/* ---------------- Quizzes ---------------- */
function initQuizzes() {
  document.querySelectorAll("form.quiz").forEach(function (form) {
    var result = form.querySelector(".result");
    var submitBtn = form.querySelector('button[type="submit"]');
    var retakeBtn = form.querySelector(".retake");

    function grade(e) {
      if (e) e.preventDefault();
      var qs = Array.prototype.slice.call(form.querySelectorAll("fieldset.q"));
      var correct = 0;
      qs.forEach(function (fs) {
        var answer = fs.getAttribute("data-answer");
        var picked = fs.querySelector("input:checked");
        fs.querySelectorAll("label").forEach(function (l) {
          l.classList.remove("good", "bad");
        });
        fs.classList.remove("right", "wrong");
        fs.querySelectorAll("input").forEach(function (i) { i.disabled = true; });

        var goodLabel = fs.querySelector('input[value="' + answer + '"]');
        if (goodLabel && goodLabel.closest("label")) {
          goodLabel.closest("label").classList.add("good");
        }
        if (picked && picked.value === answer) {
          fs.classList.add("right");
          correct++;
        } else {
          fs.classList.add("wrong");
          if (picked && picked.closest("label")) {
            picked.closest("label").classList.add("bad");
          }
        }
        var ex = fs.querySelector(".explain");
        if (ex) ex.hidden = false;
      });

      var pct = Math.round((correct / qs.length) * 100);
      var passed = pct >= 70;
      if (result) {
        result.hidden = false;
        result.className = "result " + (passed ? "pass" : "fail");
        result.textContent =
          "Score: " + correct + "/" + qs.length + " (" + pct + "%) - " +
          (passed
            ? "Passed. Module marked complete."
            : "Not yet - review the explanations above and retake.");
      }
      if (submitBtn) submitBtn.hidden = true;
      if (retakeBtn) retakeBtn.hidden = false;

      var mid = currentModuleId() || form.getAttribute("data-quiz");
      if (mid && passed) {
        var p = loadProgress();
        var prev = p.scores[mid];
        if (prev == null || pct > prev) p.scores[mid] = pct;
        p.completed[mid] = true;
        saveProgress(p);
        updateProgressChip();
        updateHomeProgress();
        buildSidebar();
      }
    }

    function reset() {
      form.querySelectorAll("fieldset.q").forEach(function (fs) {
        fs.classList.remove("right", "wrong");
        fs.querySelectorAll("input").forEach(function (i) {
          i.disabled = false;
          i.checked = false;
        });
        fs.querySelectorAll("label").forEach(function (l) {
          l.classList.remove("good", "bad");
        });
        var ex = fs.querySelector(".explain");
        if (ex) ex.hidden = true;
      });
      if (result) result.hidden = true;
      if (submitBtn) submitBtn.hidden = false;
      if (retakeBtn) retakeBtn.hidden = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    form.addEventListener("submit", grade);
    if (retakeBtn) retakeBtn.addEventListener("click", reset);
  });
}

/* ---------------- Mobile menu ---------------- */
function initMenu() {
  var btn = document.getElementById("menuBtn");
  var sidebar = document.getElementById("sidebar");
  if (!btn || !sidebar) return;
  btn.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });
}

/* ---------------- Boot ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  buildSidebar();
  updateProgressChip();
  updateHomeProgress();
  highlightAllCode();
  decoratePreBlocks();
  initQuizzes();
  initMenu();
});
