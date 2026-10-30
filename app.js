const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------- Resaltado de GDScript ---------- */
const KW = "func|var|const|extends|if|elif|else|for|while|match|return|signal|class_name|and|or|not|in|is|await|pass|enum|true|false|null|self|static|break|continue";
const TOKEN = new RegExp(
  [
    "(#[^\\n]*)",                                   // 1 comentario
    "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')", // 2 string
    "(@\\w+)",                                       // 3 anotación
    "(\\$[\\w/]+|%\\w+|&\"\\w+\")",                  // 4 nodo
    `\\b(${KW})\\b`,                                 // 5 keyword
    "\\b(\\d+\\.?\\d*)\\b",                          // 6 número
    "\\b([A-Z][A-Za-z0-9_]*)\\b",                    // 7 tipo
    "\\b([a-z_]\\w*)(?=\\()",                        // 8 función
  ].join("|"),
  "g"
);
const CLS = [null, "tk-c", "tk-s", "tk-a", "tk-node", "tk-k", "tk-n", "tk-t", "tk-fn"];

function highlight(src) {
  let out = "", last = 0;
  for (const m of src.matchAll(TOKEN)) {
    out += esc(src.slice(last, m.index));
    const g = m.findIndex((v, i) => i > 0 && v !== undefined);
    out += `<span class="${CLS[g]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}

// file: nombre que aparece en la cabecera tipo pestaña de editor (opcional)
function codeBlock(src, file) {
  const copy = `<button class="copy" type="button" data-copy>Copiar</button>`;
  return file
    ? `<div class="code has-head"><div class="code-head"><span class="code-file">${esc(file)}</span><span class="code-lang">${/\.json$/.test(file) ? "JSON" : /\.gdshader$/.test(file) ? "Shader" : "GDScript"}</span>${copy}</div><pre><code>${highlight(src)}</code></pre></div>`
    : `<div class="code">${copy}<pre><code>${highlight(src)}</code></pre></div>`;
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.closest(".code").querySelector("pre").textContent);
    btn.textContent = "Copiado";
  } catch {
    btn.textContent = "Error";
  }
  setTimeout(() => (btn.textContent = "Copiar"), 1400);
});

/* ---------- Imágenes externas: si una falla, se oculta su figura ---------- */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img.tagName !== "IMG") return;
  const fig = img.closest(".shot");
  if (fig) fig.classList.add("broken");
  else if (img.src.includes("/editor/icons/") && !img.dataset.fb) {
    img.dataset.fb = 1;
    img.src = ICON("Node");
  }
}, true);

const shot = (src, caption) =>
  src ? `<figure class="shot"><img src="${src}" alt="${esc(caption)}" loading="lazy"><figcaption>${esc(caption)} · fuente: docs.godotengine.org</figcaption></figure>` : "";

// recipeId: si se pasa, cada fila es un botón que abre la ficha del nodo en el contexto de esa receta
function treeHTML(rows, selectFirst = true, recipeId = null) {
  return rows.map(([type, name, d, icon], i) => {
    const inner = `<img src="${ICON(icon)}" alt="" loading="lazy">${esc(name)}<span class="t-type">${type !== name ? esc(type) : ""}</span>`;
    const body = recipeId && findNode(type)
      ? `<button type="button" class="tree-btn" data-recipe="${recipeId}" data-row="${i}" aria-label="Qué es ${esc(name)} (${esc(type)})">${inner}</button>`
      : inner;
    return `<li style="--d:${d};${d ? "--branch:block" : ""}" class="${i === 0 && selectFirst ? "sel" : ""}">${body}</li>`;
  }).join("");
}

// Tipo de nodo de un árbol → entrada de NODES ("VBoxContainer" → "Containers (VBox, HBox, Margin, Grid)")
const NODE_ALIAS = {
  AudioStreamPlayer2D: "AudioStreamPlayer", AudioStreamPlayer3D: "AudioStreamPlayer", TextureProgressBar: "ProgressBar",
  VBoxContainer: "Containers (VBox, HBox, Margin, Grid)", HBoxContainer: "Containers (VBox, HBox, Margin, Grid)",
  MarginContainer: "Containers (VBox, HBox, Margin, Grid)", CenterContainer: "Containers (VBox, HBox, Margin, Grid)",
  GridContainer: "Containers (VBox, HBox, Margin, Grid)",
  HSlider: "Slider, CheckBox y OptionButton", VSlider: "Slider, CheckBox y OptionButton",
};
function findNode(type) {
  const name = NODE_ALIAS[type] || type;
  return NODES.find((n) => n.name === name) || NODES.find((n) => n.name.split(/[^\w]+/).includes(type));
}

/* ---------- Hero ---------- */
$("#heroTree").innerHTML = treeHTML(RECIPES[0].tree);
$("#stats").innerHTML = [
  [NODES.length, "nodos"],
  [SIGNALS.length, "señales"],
  [FUNCTIONS.length + LIFECYCLE.length, "funciones"],
  [GLOSSARY.length, "términos"],
].map(([n, l]) => `<div><dt>${l}</dt><dd>${n}</dd></div>`).join("");

/* ---------- Recetas ---------- */
const tabs = $("#recipeTabs");
const recipeSelect = $("#recipeSelect");
const byId = (id) => RECIPES.find((r) => r.id === id);
const ORDER = RECIPE_GROUPS.flatMap(([, ids]) => ids);
const label = (r) => r.title.replace(/^(Un|Una) (.)/, (_, _a, c) => c.toUpperCase());

tabs.innerHTML = RECIPE_GROUPS.map(([group, ids]) =>
  `<p class="tab-group" role="presentation">${esc(group)}</p>` + ids.map((id) => {
    const r = byId(id), i = ORDER.indexOf(id);
    return `<button class="recipe-tab" role="tab" id="tab-${id}" aria-controls="recipePanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-id="${id}">
      <img src="${ICON(r.tree[0][3])}" alt=""><span class="rt-label">${esc(label(r))}</span><span class="rt-dim">${RECIPE_META[id][0]}</span>
    </button>`;
  }).join("")).join("");

// En pantallas angostas las pestañas se reemplazan por un selector nativo
recipeSelect.innerHTML = RECIPE_GROUPS.map(([group, ids]) =>
  `<optgroup label="${esc(group)}">${ids.map((id) => `<option value="${id}">${esc(label(byId(id)))}</option>`).join("")}</optgroup>`).join("");
recipeSelect.addEventListener("change", () => showRecipe(recipeSelect.value));

const CHECK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

// Checklist por receta, guardado solo en este navegador
const doneKey = (id) => `atlas-receta-${id}`;
function loadDone(id) {
  try { return JSON.parse(localStorage.getItem(doneKey(id))) || []; } catch { return []; }
}
function saveDone(id, list) {
  try { localStorage.setItem(doneKey(id), JSON.stringify(list)); } catch {}
}

function progressHTML(done, total) {
  return `<span class="rc-bar"><i style="width:${(done / total) * 100}%"></i></span><span class="rc-count">${done}/${total} listos</span>`;
}

function showRecipe(id, focus = false) {
  const r = byId(id);
  const [dim, lvl, file] = RECIPE_META[id];
  const done = loadDone(id);
  const i = ORDER.indexOf(id);
  const prev = byId(ORDER[(i - 1 + ORDER.length) % ORDER.length]);
  const next = byId(ORDER[(i + 1) % ORDER.length]);
  const group = RECIPE_GROUPS.find(([, ids]) => ids.includes(id))[0];

  recipeSelect.value = id;
  tabs.querySelectorAll("[role=tab]").forEach((t) => {
    const on = t.dataset.id === id;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
    // Mantiene visible la pestaña elegida dentro de la lista lateral, sin mover la página
    if (on && (t.offsetTop < tabs.scrollTop || t.offsetTop + t.offsetHeight > tabs.scrollTop + tabs.clientHeight))
      tabs.scrollTop = t.offsetTop - tabs.clientHeight / 2;
  });
  $("#recipePanel").setAttribute("aria-labelledby", `tab-${id}`);
  $("#recipePanel").dataset.id = id;
  $("#recipePanel").innerHTML = `
    <header class="rc-head">
      <p class="rc-kicker">${esc(group)} · receta ${String(i + 1).padStart(2, "0")}/${ORDER.length}</p>
      <h3>${esc(r.title)}</h3>
      <p class="lead">${esc(r.lead)}</p>
      <ul class="rc-meta">
        <li class="pill pill-dim">${dim}</li>
        <li class="pill pill-lvl lvl-${slug(lvl)}">${lvl}</li>
        <li>${r.tree.length} nodos</li>
        <li>${r.need.length} piezas</li>
      </ul>
    </header>

    <ol class="rc-steps">
      <li class="rc-step">
        <span class="rc-num" aria-hidden="true">01</span>
        <div class="rc-body">
          <h4>Arma la escena</h4>
          <p class="rc-desc">Crea estos nodos en el panel Escena respetando la jerarquía. <b>Toca cualquier nodo</b> para ver qué es y qué hace en esta receta.</p>
          <div class="rc-scene ${r.img ? "" : "solo"}">
            <div class="win"><div class="win-head"><span>Escena</span><span class="mono">${esc(r.tree[0][1].split(" ")[0].toLowerCase())}.tscn</span></div><ul class="tree">${treeHTML(r.tree, true, id)}</ul></div>
            ${r.img ? `<figure class="win rc-shot"><div class="win-head"><span>Así se ve</span><span class="mono">docs.godotengine.org</span></div><img src="${r.img}" alt="${esc(r.title)}" loading="lazy"></figure>` : ""}
          </div>
        </div>
      </li>
      <li class="rc-step">
        <span class="rc-num" aria-hidden="true">02</span>
        <div class="rc-body">
          <h4>Entiende cómo funciona</h4>
          <p class="rc-desc">La idea antes del código, en palabras simples.</p>
          <ol class="how">${(RECIPE_HOW[id] || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
        </div>
      </li>
      <li class="rc-step">
        <span class="rc-num" aria-hidden="true">03</span>
        <div class="rc-body">
          <div class="rc-row"><h4>Reúne las piezas</h4><div class="rc-progress" aria-live="polite">${progressHTML(done.length, r.need.length)}</div></div>
          <p class="rc-desc">Márcalas a medida que las tengas en tu proyecto. Se guardan en este navegador.</p>
          <ul class="need">${r.need.map(([b, s], k) => `
            <li><label class="need-item">
              <input type="checkbox" data-k="${k}" ${done.includes(k) ? "checked" : ""}>
              <span class="check">${CHECK}</span><b>${esc(b)}</b><span>${esc(s)}</span>
            </label></li>`).join("")}</ul>
        </div>
      </li>
      <li class="rc-step">
        <span class="rc-num" aria-hidden="true">04</span>
        <div class="rc-body">
          ${r.steps ? `
          <h4>Escríbelo paso a paso</h4>
          <p class="rc-desc">Cada paso es un archivo. Lee la explicación antes de copiar el código.</p>
          <ol class="substeps">${r.steps.map((s, k) => `
            <li class="substep">
              <p class="substep-title"><span>${String.fromCharCode(65 + k)}</span>${esc(s.t)}</p>
              <p class="substep-desc">${esc(s.d)}</p>
              ${s.code ? codeBlock(s.code, s.file) : ""}
            </li>`).join("")}</ol>` : `
          <h4>Escribe el script</h4>
          <p class="rc-desc">Adjúntalo al nodo raíz (clic derecho → Adjuntar script) y pega el código.</p>
          ${codeBlock(r.code, file)}`}
        </div>
      </li>
      <li class="rc-step">
        <span class="rc-num" aria-hidden="true">05</span>
        <div class="rc-body">
          <h4>Pule los detalles</h4>
          <ul class="tips">${r.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </div>
      </li>
    </ol>

    <nav class="rc-pager" aria-label="Otras recetas">
      <button type="button" data-go="${prev.id}" class="rc-prev"><span>Anterior</span><b>${esc(label(prev))}</b></button>
      <button type="button" data-go="${next.id}" class="rc-next"><span>Siguiente</span><b>${esc(label(next))}</b>${ARROW}</button>
    </nav>`;
}
tabs.addEventListener("click", (e) => {
  const t = e.target.closest("[role=tab]");
  if (t) showRecipe(t.dataset.id);
});
$("#recipePanel").addEventListener("click", (e) => {
  const tb = e.target.closest(".tree-btn");
  if (tb) {
    const r = byId(tb.dataset.recipe);
    const [type, name] = r.tree[+tb.dataset.row];
    return openNode(findNode(type).name, { recipe: r, type, name });
  }
  const go = e.target.closest("[data-go]");
  if (!go) return;
  showRecipe(go.dataset.go);
  $("#recetas").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
$("#recipePanel").addEventListener("change", (e) => {
  if (!e.target.matches(".need-item input")) return;
  const panel = $("#recipePanel");
  const boxes = [...panel.querySelectorAll(".need-item input")];
  const done = boxes.filter((b) => b.checked).map((b) => +b.dataset.k);
  saveDone(panel.dataset.id, done);
  panel.querySelector(".rc-progress").innerHTML = progressHTML(done.length, boxes.length);
});
tabs.addEventListener("keydown", (e) => {
  const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  if (!(e.key in keys)) return;
  e.preventDefault();
  const i = ORDER.indexOf(document.activeElement.dataset.id);
  showRecipe(ORDER[(i + keys[e.key] + ORDER.length) % ORDER.length], true);
});
showRecipe(ORDER[0]);

/* ---------- Filtros reutilizables ---------- */
function chipGroup(el, options, onChange) {
  let current = "all";
  el.innerHTML = [["all", "Todos", null], ...options].map(([v, l, c]) =>
    `<button class="chip" type="button" data-v="${v}" aria-pressed="${v === "all"}" ${c ? `style="--sw:${c}"` : ""}>${c ? "<i></i>" : ""}${esc(l)}</button>`).join("");
  el.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    current = b.dataset.v;
    el.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    onChange(current);
  });
  return () => current;
}

/* ---------- Nodos ---------- */
const nodeCat = chipGroup($("#nodeChips"), Object.entries(CATEGORIES).map(([k, v]) => [k, v.label, v.color]), renderNodes);
$("#nodeFilter").addEventListener("input", renderNodes);

function renderNodes() {
  const q = norm($("#nodeFilter").value);
  const cat = nodeCat();
  const list = NODES.filter((n) => (cat === "all" || n.cat === cat) && (!q || norm(n.name + " " + n.short + " " + n.use).includes(q)));
  $("#nodeGrid").innerHTML = list.length ? list.map((n) =>
    `<button class="node-card reveal ${n.img ? "has-img" : ""}" type="button" data-node="${esc(n.name)}" id="node-${slug(n.name)}" style="--cc:${CATEGORIES[n.cat].color}">
      <span class="nc-top"><img src="${ICON(n.icon)}" alt="" loading="lazy"><strong class="nm">${esc(n.name)}</strong></span>
      <p>${esc(n.short)}</p>
      <span class="cat">${CATEGORIES[n.cat].label}</span>
    </button>`).join("") : `<p class="empty">Ningún nodo coincide.</p>`;
  observe($("#nodeGrid"));
}
$("#nodeGrid").addEventListener("click", (e) => {
  const c = e.target.closest("[data-node]");
  if (c) openNode(c.dataset.node);
});

const dlg = $("#nodeDialog");
// Nombre base de un miembro tal como se lista: "get_node(path) / $Nodo" → "get_node"
const memberKey = (s) => s.split(/[ (]/)[0];
// Los nombres compuestos ("Path2D + PathFollow2D") apuntan a la clase de su ícono
const className = (n) => (n.name.includes(" ") ? n.icon.split("/").pop() : n.name);

const list = (arr, kind, n) => arr.length
  ? `<ul>${arr.map((x) => MEMBERS[kind][memberKey(x)]
      ? `<li><button class="member" type="button" data-kind="${kind}" data-label="${esc(x)}" data-node="${esc(n.name)}"><code>${esc(x)}</code></button></li>`
      : `<li><code>${esc(x)}</code></li>`).join("")}</ul>`
  : `<p class="empty" style="padding:0">—</p>`;

// Explica qué papel cumple el nodo dentro de la receta desde la que se abrió
function recipeRole(ctx) {
  const base = ctx.name.split(" (")[0];
  const hit = ctx.recipe.need.find(([label]) => label.includes(base)) || ctx.recipe.need.find(([label]) => label.includes(ctx.type));
  return `<div class="role">
    <p class="role-k">En la receta «${esc(ctx.recipe.title)}»</p>
    <p><b>${esc(ctx.name)}</b>${ctx.name !== ctx.type ? ` es un <code>${esc(ctx.type)}</code>` : ""}${hit ? `: ${esc(hit[1])}` : "."}</p>
  </div>`;
}

function ideasHTML(idea) {
  if (!idea) return "";
  return `<div class="ideas">
    <div class="idea-like"><span>Piénsalo como</span><p>${esc(idea.like)}</p></div>
    <div class="idea-games"><span>En un juego te sirve para</span><ul>${idea.games.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
  </div>`;
}

function openNode(name, ctx = null) {
  const n = NODES.find((x) => x.name === name);
  const docName = className(n).toLowerCase();
  $("#nodeDialogBody").innerHTML = `
    <div class="sheet-head">
      <img src="${ICON(n.icon)}" alt="">
      <h2 id="ndTitle">${esc(n.name)}</h2>
      <button class="icon-btn sheet-close" type="button" aria-label="Cerrar" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <p class="lead">${esc(n.short)}</p>
    ${ctx ? recipeRole(ctx) : ""}
    ${ideasHTML(NODE_IDEAS[n.name])}
    ${shot(n.img, n.name + " en el editor")}
    <div class="sheet-grid">
      <div class="kv use"><h4>Para qué sirve</h4><p>${esc(n.use)}</p></div>
      <div class="kv"><h4>Propiedades clave</h4>${list(n.props, "prop", n)}</div>
      <div class="kv"><h4>Métodos</h4>${list(n.methods, "method", n)}</div>
      <div class="kv use"><h4>Señales</h4>${list(n.signals, "signal", n)}</div>
    </div>
    <p class="hint">Toca una propiedad, método o señal para ver qué hace y cómo se usa.</p>
    <p class="panel-label">Ejemplo</p>
    ${codeBlock(n.code)}
    <a class="doc-link" href="${DOCS}${docName}.html" target="_blank" rel="noopener">Referencia oficial de ${esc(n.name.split(" ")[0])} ↗</a>`;
  dlg.showModal();
  history.replaceState(null, "", `#node-${slug(n.name)}`);
}
dlg.addEventListener("click", (e) => {
  const m = e.target.closest(".member");
  if (m) return openMember(m.dataset.kind, m.dataset.label, NODES.find((x) => x.name === m.dataset.node));
  if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
});
dlg.addEventListener("close", () => history.replaceState(null, "", "#nodos"));

/* ---------- Detalle de propiedad / método / señal ---------- */
const mdlg = $("#memberDialog");
const KIND_LABEL = { prop: "Propiedad", method: "Método", signal: "Señal" };
const DOC_KIND = { prop: "property", method: "method", signal: "signal" };

// Ejemplo genérico cuando el miembro no trae uno propio
function memberExample(kind, label, n) {
  const key = memberKey(label);
  const path = "$" + className(n).replace(/\W/g, "");
  if (kind === "signal") {
    const args = (label.match(/\(([^)]*)\)/)?.[1] || "").trim();
    return `func _ready() -> void:\n    ${path}.${key}.connect(_on_${key})\n\nfunc _on_${key}(${args}) -> void:\n    pass  # reacciona aquí`;
  }
  if (kind === "method") return `${path}.${label.split(" / ")[0].split(" (")[0]}`;
  if (!/^\w+$/.test(key)) return null; // claves compuestas como "limit_left/right/top/bottom"
  return `# En el Inspector: selecciona ${className(n)} y busca "${key}"\nprint(${path}.${key})   # leer\n${path}.${key} = ...      # cambiar`;
}

function openMember(kind, label, n) {
  const key = memberKey(label);
  const info = MEMBERS[kind][key];
  const cls = className(n);
  const anchor = /^\w+$/.test(key) ? `#class-${cls.toLowerCase()}-${DOC_KIND[kind]}-${key.replace(/_/g, "-")}` : "";
  const code = info.c || memberExample(kind, label, n);
  $("#memberDialogBody").innerHTML = `
    <div class="sheet-head">
      <span class="kind-badge kind-${kind}">${KIND_LABEL[kind]}</span>
      <button class="icon-btn sheet-close" type="button" aria-label="Cerrar" data-close>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>
    <h2 id="mdTitle" class="member-title">${esc(label)}</h2>
    <p class="member-owner"><img src="${ICON(n.icon)}" alt="">de ${esc(n.name)}</p>
    <div class="kv use"><h4>Para qué sirve</h4><p>${esc(info.d)}</p></div>
    ${info.u ? `<div class="kv use"><h4>Cómo se usa</h4><p>${esc(info.u)}</p></div>` : ""}
    ${code ? `<p class="panel-label">Ejemplo</p>${codeBlock(code)}` : ""}
    <div class="member-actions">
      ${dlg.open ? `<button class="back-btn" type="button" data-close>← Volver a ${esc(n.name)}</button>` : ""}
      <a class="doc-link" href="${DOCS}${cls.toLowerCase()}.html${anchor}" target="_blank" rel="noopener">Ver en la documentación oficial ↗</a>
    </div>`;
  mdlg.showModal();
}
mdlg.addEventListener("click", (e) => {
  if (e.target === mdlg || e.target.closest("[data-close]")) mdlg.close();
});

/* ---------- Señales ---------- */
$("#signalFilter").addEventListener("input", renderSignals);
function renderSignals() {
  const q = norm($("#signalFilter").value);
  const rows = SIGNALS.filter((s) => !q || norm([s.node, s.signal, s.when, s.example].join(" ")).includes(q));
  $("#signalList").innerHTML = rows.length ? rows.map(signalCard).join("") : `<p class="empty">Ninguna señal coincide.</p>`;
}

function signalCard(s) {
  const name = s.signal.split("(")[0];
  // "Node2D (Node3D en 3D)" → "Node2D" para la firma
  const sig = `func _on_${name}(${s.params.map(([p, t]) => `${p}: ${t.split(" ")[0]}`).join(", ")}) -> void:\n    pass`;
  const file = s.code.match(/#\s*(\w+\.gd)/)?.[1];
  return `
  <details class="sig" id="sig-${slug(s.node + "-" + s.signal)}">
    <summary>
      <code class="sig-name">${esc(s.signal)}</code>
      <span class="sig-node">${esc(s.node)}</span>
      <span class="sig-when">${esc(s.when)}</span>
      <svg class="sig-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </summary>
    <div class="sig-body">
      <div class="sig-grid">
        <div class="kv">
          <h4>Parámetros que recibe</h4>
          ${s.params.length
            ? `<table class="ptable"><tbody>${s.params.map(([p, t, d]) =>
                `<tr><td><code>${esc(p)}</code></td><td><span class="ptype">${esc(t)}</span></td><td>${esc(d)}</td></tr>`).join("")}</tbody></table>`
            : `<p>Ninguno. La función conectada se declara sin argumentos: <code>func _on_${esc(name)}()</code>.</p>`}
        </div>
        <div class="kv">
          <h4>Qué devuelve</h4>
          <p><span class="ptype">void</span> — nada. Una señal solo avisa: <code>emit()</code> no espera respuesta y, si tu función devolviera algo, Godot lo ignora.</p>
        </div>
      </div>
      <p class="panel-label">Firma de la función que la recibe</p>
      ${codeBlock(sig)}
      <div class="idea-games sig-ideas"><span>En un juego te sirve para</span><ul>${
        [s.example, ...(SIGNAL_IDEAS[`${s.node} · ${s.signal}`] || [])].map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
      <p class="panel-label">Script de ejemplo</p>
      ${codeBlock(s.code, file)}
    </div>
  </details>`;
}

/* ---------- Ciclo de vida y funciones ---------- */
// Bloque "Recibe / Devuelve" de una función
function ioHTML(name) {
  const sig = FN_SIG[name];
  if (!sig) return "";
  return `<dl class="io">
    <div><dt>Recibe</dt><dd>${sig.p.length
      ? `<ul>${sig.p.map(([p, t, d]) => `<li><code>${esc(p)}</code> <span class="ptype">${esc(t)}</span><span class="io-d">${esc(d)}</span></li>`).join("")}</ul>`
      : `<span class="io-none">Nada</span>`}</dd></div>
    <div><dt>Devuelve</dt><dd><span class="ptype">${esc(sig.r[0])}</span><span class="io-d">${esc(sig.r[1])}</span></dd></div>
  </dl>`;
}

$("#lifecycle").innerHTML = LIFECYCLE.map((l) =>
  `<li class="lc reveal ${/process/.test(l.name) ? "loop" : ""}" id="fn-${slug(l.name)}">
    <h4>${esc(l.name)}</h4><p class="when">${esc(l.when)}</p><p class="tip">${esc(l.tip)}</p>${ioHTML(l.name)}${codeBlock(l.code)}
  </li>`).join("");

const groups = [...new Set(FUNCTIONS.map((f) => f.group))];
const fnGroup = chipGroup($("#fnChips"), groups.map((g) => [g, g]), renderFns);
function renderFns() {
  const g = fnGroup();
  $("#fnGrid").innerHTML = FUNCTIONS.filter((f) => g === "all" || f.group === g).map((f) =>
    `<article class="fn reveal" id="fn-${slug(f.name)}">
      <header><h4>${esc(f.name)}</h4><span class="grp">${esc(f.group)}</span></header>
      <p>${esc(f.desc)}</p>${ioHTML(f.name)}${codeBlock(f.code)}
    </article>`).join("");
  observe($("#fnGrid"));
}

/* ---------- Diccionario ---------- */
const tags = [...new Set(GLOSSARY.map((g) => g.tag))].sort();
const glossTag = chipGroup($("#glossChips"), tags.map((t) => [t, t]), renderGloss);
$("#glossFilter").addEventListener("input", renderGloss);
function renderGloss() {
  const q = norm($("#glossFilter").value);
  const t = glossTag();
  const items = GLOSSARY.filter((g) => (t === "all" || g.tag === t) && (!q || norm(g.term + " " + g.def).includes(q)))
    .sort((a, b) => a.term.localeCompare(b.term, "es"));

  // Agrupa por primera letra; términos que empiezan con símbolo (".tscn", "@tool") van a "#"
  const groups = new Map();
  for (const g of items) {
    const first = norm(g.term)[0];
    const ch = /[a-z]/.test(first) ? first.toUpperCase() : "#";
    if (!groups.has(ch)) groups.set(ch, []);
    groups.get(ch).push(g);
  }

  $("#glossAz").innerHTML = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].map((l) =>
    groups.has(l)
      ? `<a href="#az-${l === "#" ? "sym" : l}" aria-label="Términos con ${l === "#" ? "símbolo" : l} (${groups.get(l).length})">${l}</a>`
      : `<span aria-hidden="true">${l}</span>`).join("");

  $("#gloss").innerHTML = items.length ? [...groups].map(([l, terms]) =>
    `<section class="az-group" id="az-${l === "#" ? "sym" : l}" aria-label="${l}">
      <h3 class="az-letter">${l}<span>${terms.length}</span></h3>
      <div class="az-terms">${terms.map((g) =>
        `<article class="term" id="term-${slug(g.term)}">
          <header><h4>${esc(g.term)}</h4><span class="tag">${esc(g.tag)}</span></header>
          <p>${esc(g.def)}</p>${g.code ? codeBlock(g.code) : ""}
        </article>`).join("")}</div>
    </section>`).join("") : `<p class="empty">Sin resultados.</p>`;
  azIO?.disconnect();
  document.querySelectorAll(".az-group").forEach((s) => azIO?.observe(s));
}

// Resalta en la barra A–Z la letra que se está leyendo
const azIO = "IntersectionObserver" in window ? new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  document.querySelectorAll("#glossAz a").forEach((a) => a.classList.toggle("active", a.hash === "#" + en.target.id));
}), { rootMargin: "-140px 0px -70% 0px" }) : null;

/* ---------- Bloques de código estáticos ---------- */
document.querySelectorAll(".code[data-code]").forEach((el) => {
  el.outerHTML = codeBlock(el.dataset.code.replace(/\\n/g, "\n"));
});

/* ---------- Animación de entrada ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = "IntersectionObserver" in window && !reduce
  ? new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px" })
  : null;
function observe(root = document) {
  root.querySelectorAll(".reveal:not(.in)").forEach((el, i) => {
    if (!io) return el.classList.add("in");
    el.style.setProperty("--delay", `${(i % 8) * 40}ms`);
    io.observe(el);
  });
}

/* ---------- Paleta de búsqueda global ---------- */
const INDEX = [
  ...NODES.map((n) => ({ kind: "Nodo", title: n.name, desc: n.short, icon: ICON(n.icon), go: () => openNode(n.name) })),
  ...SIGNALS.map((s) => ({ kind: "Señal", title: s.signal, desc: `${s.node} — ${s.when}`, go: () => {
    const id = `sig-${slug(s.node + "-" + s.signal)}`;
    $("#signalFilter").value = "";
    renderSignals();
    document.getElementById(id).open = true;
    jump(id);
  } })),
  ...LIFECYCLE.map((l) => ({ kind: "Ciclo", title: l.name, desc: l.when, go: () => jump(`fn-${slug(l.name)}`) })),
  ...FUNCTIONS.map((f) => ({ kind: "Función", title: f.name, desc: f.desc, go: () => jump(`fn-${slug(f.name)}`, () => resetChips("#fnChips", renderFns)) })),
  ...GLOSSARY.map((g) => ({ kind: "Término", title: g.term, desc: g.def, go: () => jump(`term-${slug(g.term)}`, () => { $("#glossFilter").value = ""; resetChips("#glossChips", renderGloss); }) })),
  ...RECIPES.map((r) => ({ kind: "Receta", title: "Quiero hacer " + r.title.toLowerCase(), desc: r.lead, icon: ICON(r.tree[0][3]), go: () => { showRecipe(r.id); jump("recetas"); } })),
];
const KIND_MARK = { Señal: "~", Ciclo: "↻", Función: "ƒ", Término: "Aa" };

function resetChips(sel, render) {
  $(sel).querySelector('[data-v="all"]').click();
  render();
}
function jump(id, prepare) {
  prepare?.();
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("in");
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

const pal = $("#palette"), pin = $("#paletteInput"), plist = $("#paletteList");
let results = [], sel = 0;

function score(item, q) {
  const t = norm(item.title), d = norm(item.desc);
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  const words = q.split(/\s+/);
  if (words.every((w) => t.includes(w) || d.includes(w))) return 30;
  return 0;
}
function renderPalette() {
  const q = norm(pin.value.trim());
  results = q
    ? INDEX.map((it) => [it, score(it, q)]).filter(([, s]) => s).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([it]) => it)
    : INDEX.filter((it) => it.kind === "Receta" || ["Coyote time", "CharacterBody2D", "Area2D", "_ready()", "body_entered(body)"].includes(it.title));
  sel = 0;
  plist.innerHTML = results.length ? results.map((r, i) =>
    `<li role="option" id="opt-${i}" aria-selected="${i === sel}" data-i="${i}">
      ${r.icon ? `<img src="${r.icon}" alt="">` : `<span class="kind-ico">${KIND_MARK[r.kind] || "·"}</span>`}
      <div><span class="t">${esc(r.title)}</span><span class="d">${esc(r.desc)}</span></div>
      <span class="kind">${r.kind}</span>
    </li>`).join("") : `<li class="empty" aria-disabled="true">Nada por aquí. Prueba con otra palabra.</li>`;
  pin.setAttribute("aria-activedescendant", results.length ? "opt-0" : "");
}
function moveSel(d) {
  if (!results.length) return;
  sel = (sel + d + results.length) % results.length;
  plist.querySelectorAll("[role=option]").forEach((li, i) => li.setAttribute("aria-selected", i === sel));
  plist.children[sel].scrollIntoView({ block: "nearest" });
  pin.setAttribute("aria-activedescendant", `opt-${sel}`);
}
function choose(i) {
  const r = results[i];
  if (!r) return;
  pal.close();
  r.go();
}
function openPalette() {
  if (dlg.open) dlg.close();
  pin.value = "";
  renderPalette();
  pal.showModal();
  pin.focus();
}
pin.addEventListener("input", renderPalette);
pin.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
  else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
});
plist.addEventListener("click", (e) => {
  const li = e.target.closest("[data-i]");
  if (li) choose(+li.dataset.i);
});
pal.addEventListener("click", (e) => { if (e.target === pal) pal.close(); });
$("#openPalette").addEventListener("click", openPalette);
$("#heroSearch").addEventListener("click", openPalette);
document.addEventListener("keydown", (e) => {
  const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
  else if (e.key === "/" && !typing && !pal.open) { e.preventDefault(); openPalette(); }
});

/* ---------- Tema ---------- */
const root = document.documentElement;
try {
  const saved = localStorage.getItem("atlas-theme");
  if (saved) root.dataset.theme = saved;
} catch {}
$("#themeToggle").addEventListener("click", () => {
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("atlas-theme", root.dataset.theme); } catch {}
});

/* ---------- Nav activa ---------- */
const navLinks = [...document.querySelectorAll(".topnav a")];
if ("IntersectionObserver" in window) {
  const navIO = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.hash === "#" + en.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll("main > section[id]").forEach((s) => navIO.observe(s));
}

/* ---------- Arranque ---------- */
renderNodes();
renderSignals();
renderFns();
renderGloss();
observe();

// Enlace directo a un nodo: index.html#node-area2d
const deep = location.hash.match(/^#node-(.+)$/);
if (deep) {
  const n = NODES.find((x) => slug(x.name) === deep[1]);
  if (n) openNode(n.name);
}
