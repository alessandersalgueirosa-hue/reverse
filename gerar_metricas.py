#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gerar_metricas.py
Gera DOIS arquivos na pasta public/:
1. metricas.html (apenas o catálogo de métricas)
2. calculadora-trafego.html (apenas a calculadora)
Ambos com o menu do sistema integrado e encoding UTF-8 com BOM.
"""

import json
import sys
from datetime import date
from pathlib import Path

BASE = Path(__file__).resolve().parent
ARQ_DADOS = BASE / "metricas.json"
PUBLIC_DIR = BASE / "public"

# Menu compartilhado entre as páginas
MENU_HTML = """
<header class="bg-slate-900 border-b border-slate-800 p-4 flex flex-wrap justify-between items-center gap-4 text-white font-sans text-left">
    <div class="flex items-center gap-3">
        <div class="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white">R</div>
        <h1 class="text-xl font-bold">{titulo_pagina}</h1>
    </div>
    <div class="flex flex-wrap items-center gap-4 text-sm">
        <a href="/admin.html" class="text-slate-400 hover:text-white transition-colors">Dashboard</a>
        <a href="/leads.html" class="text-slate-400 hover:text-white transition-colors">Leads</a>
        <a href="/clientes.html" class="text-slate-400 hover:text-white transition-colors">Clientes</a>
        <a href="/prospects.html" class="text-slate-400 hover:text-white transition-colors">Prospects</a>
        <a href="/campanhas.html" class="text-slate-400 hover:text-white transition-colors">Campanhas</a>
        <a href="/inbound.html" class="text-slate-400 hover:text-white transition-colors">Inbound</a>
        <a href="/outbound.html" class="text-slate-400 hover:text-white transition-colors">Outbound</a>
        <a href="/financeiro.html" class="text-slate-400 hover:text-white transition-colors">Financeiro</a>
        <a href="/trafego_pago.html" class="text-slate-400 hover:text-white transition-colors">Tráfego Pago</a>
        <a href="/tarefas.html" class="text-slate-400 hover:text-white transition-colors">Tarefas</a>
        
        <!-- NOVOS LINKS -->
        <a href="/metricas.html" class="{classe_metricas}">Métricas</a>
        <a href="/calculadora-trafego.html" class="{classe_calc}">Calculadora de Tráfego</a>
        
        <a href="/redes_sociais.html" class="text-slate-400 hover:text-white transition-colors">Redes Sociais</a>
        <a href="/storytelling.html" class="text-slate-400 hover:text-white transition-colors">Storytelling</a>
        <a href="/base_conhecimento.html" class="text-slate-400 hover:text-white transition-colors">Conhecimento</a>
        <a href="/portal_cliente.html" class="text-slate-400 hover:text-white transition-colors">Portal do Cliente</a>
        <button id="btnSair" onclick="localStorage.removeItem('token'); window.location.href='/login.html';" class="text-slate-400 hover:text-white transition-colors font-bold">Sair</button>
    </div>
</header>
"""

# CSS Base para as duas páginas
CSS_BASE = """
<style>
:root{
  --bg:#f5f6f8; --card:#ffffff; --text:#101828; --muted:#667085; --border:#e4e7ec;
  --accent:#2563eb; --accent-soft:#eff4ff; --chip:#f2f4f7; --hover:#f9fafb;
  --mark:#fde68a; --mark-txt:#422006; --radius:12px;
  --ok:#16a34a; --ruim:#dc2626;
  --shadow:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.08);
}
html[data-tema="escuro"]{
  --bg:#0f172a; --card:#1e293b; --text:#f8fafc; --muted:#94a3b8; --border:#334155;
  --accent:#3b82f6; --accent-soft:#1e3a8a; --chip:#0f172a; --hover:#334155;
  --mark:#d97706; --mark-txt:#ffffff;
  --ok:#22c55e; --ruim:#ef4444;
  --shadow:0 1px 2px rgba(0,0,0,.4);
}
body{background-color:var(--bg); color:var(--text); font-family:system-ui,-apple-system,sans-serif;}
.topo{padding:16px clamp(14px,4vw,40px) 14px; border-bottom:1px solid var(--border); margin-bottom:20px;}
.barra{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.barra input[type="search"]{flex:1 1 260px;min-width:200px}
.barra input,.barra select,.btn{font:inherit;font-size:14px;color:var(--text);background:var(--card);border:1px solid var(--border);border-radius:10px;padding:9px 12px}
.barra input:focus,.barra select:focus,.btn:focus-visible,.calc-grid input:focus{outline:2px solid var(--accent);outline-offset:1px}
.btn{cursor:pointer;transition:border-color .15s,color .15s}
.btn:hover{border-color:var(--accent);color:var(--accent)}
main{padding:22px clamp(14px,4vw,40px) 60px;max-width:1240px;margin:0 auto}
.dica{background:var(--accent-soft);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;margin:0 0 22px;font-size:14px}
.dica strong{color:var(--accent)}
.calculadora{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:18px 20px 20px;margin:0 0 26px}
.calculadora h2{display:flex;align-items:center;gap:8px;font-size:1.08rem;margin:0 0 4px}
.cat-desc{margin:0 0 12px;color:var(--muted);font-size:13.5px}
.calc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:12px 0 14px}
.calc-grid label{display:flex;flex-direction:column;gap:5px;font-size:12.5px;font-weight:600;color:var(--muted)}
.calc-grid input{font:inherit;font-size:14px;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;width:100%}
.calc-acoes{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.calc-resultados{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.calc-card{border:1px solid var(--border);border-radius:10px;padding:12px 14px;background:var(--bg);display:flex;flex-direction:column;gap:2px}
.calc-card.ok{border-color:var(--ok);border-left-width:4px}
.calc-card.ruim{border-color:var(--ruim);border-left-width:4px}
.calc-card.pendente{opacity:.72}
.calc-nome{font-weight:700;font-size:13.5px;letter-spacing:.02em}
.calc-rotulo{color:var(--muted);font-size:12.5px;margin:0 0 6px}
.calc-valor{font-size:1.35rem;font-weight:700;font-variant-numeric:tabular-nums;margin:0 0 4px}
.calc-valor.calc-pendente-txt{font-size:.92rem;font-weight:500;color:var(--muted)}
.calc-meta{font-size:12.5px;margin:2px 0 4px;color:var(--ok);font-weight:600}
.calc-meta.ruim{color:var(--ruim)}
.calc-formula-mini{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--muted);background:var(--chip);padding:3px 6px;border-radius:5px;display:inline-block;margin-top:auto;align-self:flex-start}
.categoria{margin:0 0 30px}
.categoria h2{display:flex;align-items:center;gap:10px;font-size:1.05rem;margin:0 0 4px}
.categoria .icone{font-size:1.1rem}
.badge{font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-soft);border-radius:999px;padding:1px 9px}
.tabela-wrap{overflow-x:auto;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow)}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);padding:10px 14px;border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:12px 14px;border-bottom:1px solid var(--border);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--hover)}
td.nome{font-weight:600;min-width:165px}
.formula{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;background:var(--chip);padding:2px 7px;border-radius:6px}
.obs{color:var(--muted);font-size:13.5px}
.vazio{text-align:center;color:var(--muted);padding:60px 20px}
mark{background:var(--mark);color:var(--mark-txt);border-radius:3px;padding:0 2px}
.toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;background:var(--text);color:var(--bg);padding:10px 18px;border-radius:999px;font-size:13.5px;pointer-events:none;transition:.25s;z-index:50}
.toast.ativo{opacity:1;transform:translate(-50%,0)}
@media(max-width:760px){
  thead{display:none}
  table,tbody,tr,td{display:block;width:100%}
  tr{padding:10px 0;border-bottom:1px solid var(--border)}
  tbody tr:last-child{border-bottom:0}
  td{border:0;padding:3px 14px}
  td[data-label]::before{content:attr(data-label) ": ";font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
  td.nome{font-size:1.02rem;padding-bottom:6px}
  td.nome::before{content:none}
}
</style>
"""

# Scripts compartilhados
JS_TOAST_E_TEMA = """
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className='toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('ativo');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('ativo'); }, 2400);
  }
  var CHAVE_TEMA = 'metricas.tema';
  function aplicarTema(t) {
    document.documentElement.dataset.tema = t;
    var btn = document.getElementById('btn-tema');
    if(btn) {
        btn.textContent = t === 'escuro' ? '☀️' : '🌙';
        btn.title = t === 'escuro' ? 'Tema claro' : 'Tema escuro';
    }
    try { localStorage.setItem(CHAVE_TEMA, t); } catch (e) {}
  }
  var temaSalvo = null;
  try { temaSalvo = localStorage.getItem(CHAVE_TEMA); } catch (e) {}
  aplicarTema(temaSalvo || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'));
"""

# ==========================================
# TEMPLATE DA CALCULADORA
# ==========================================
HTML_CALCULADORA = f"""<!DOCTYPE html>
<html lang="pt-BR" data-tema="claro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Calculadora de Tráfego - Reverse Marketing</title>
<script src="https://cdn.tailwindcss.com"></script>
{CSS_BASE}
</head>
<body>
{MENU_HTML.replace('{titulo_pagina}', 'Calculadora de Tráfego').replace('{classe_metricas}', 'text-slate-400 hover:text-white transition-colors').replace('{classe_calc}', 'text-white font-bold border-b-2 border-orange-500 pb-1')}

<div class="topo">
  <div class="barra">
    <button class="btn" id="btn-tema" type="button" aria-label="Alternar tema">🌙</button>
  </div>
</div>

<main>
  <section class="calculadora" id="calculadora">
    <h2>🧮 Calculadora de Métricas</h2>
    <p class="cat-desc">Preencha os campos disponíveis — cada resultado aparece assim que os dados necessários estiverem completos.</p>
    <div class="calc-grid">
      <label>Investimento (R$)
        <input type="number" inputmode="decimal" min="0" step="0.01" id="inp-investimento" placeholder="0,00">
      </label>
      <label>Impressões
        <input type="number" inputmode="numeric" min="0" step="1" id="inp-impressoes" placeholder="0">
      </label>
      <label>Cliques
        <input type="number" inputmode="numeric" min="0" step="1" id="inp-cliques" placeholder="0">
      </label>
      <label>Conversões
        <input type="number" inputmode="numeric" min="0" step="1" id="inp-conversoes" placeholder="0">
      </label>
      <label>Receita (R$)
        <input type="number" inputmode="decimal" min="0" step="0.01" id="inp-receita" placeholder="0,00">
      </label>
    </div>
    <div class="calc-acoes">
      <button type="button" class="btn" id="btn-calc-limpar">Limpar</button>
      <button type="button" class="btn" id="btn-calc-copiar">Copiar resultados</button>
      <button type="button" class="btn" id="btn-calc-csv">Exportar CSV</button>
    </div>
    <div class="calc-resultados" id="calc-resultados" aria-live="polite"></div>
  </section>
</main>

<script>
(function () {{
  {JS_TOAST_E_TEMA}
  
  var CAMPOS_CALC = ['investimento', 'impressoes', 'cliques', 'conversoes', 'receita'];
  var LABELS_CALC = {{ investimento: 'Investimento', impressoes: 'Impressões', cliques: 'Cliques', conversoes: 'Conversões', receita: 'Receita' }};
  var CALC_DEFS = [
    {{ nome:'CPM', precisa:['investimento','impressoes'], denom:'impressoes', fmt:'moeda', formula:'(Investimento ÷ Impressões) × 1.000', calc:function(v){{ return v.investimento / v.impressoes * 1000; }} }},
    {{ nome:'CTR', precisa:['cliques','impressoes'], denom:'impressoes', fmt:'pct', formula:'(Cliques ÷ Impressões) × 100', calc:function(v){{ return v.cliques / v.impressoes * 100; }} }},
    {{ nome:'CPC', precisa:['investimento','cliques'], denom:'cliques', fmt:'moeda', formula:'Investimento ÷ Cliques', calc:function(v){{ return v.investimento / v.cliques; }} }},
    {{ nome:'CR', precisa:['conversoes','cliques'], denom:'cliques', fmt:'pct', formula:'(Conversões ÷ Cliques) × 100', calc:function(v){{ return v.conversoes / v.cliques * 100; }} }},
    {{ nome:'CPA / CPL', precisa:['investimento','conversoes'], denom:'conversoes', fmt:'moeda', formula:'Investimento ÷ Conversões', calc:function(v){{ return v.investimento / v.conversoes; }} }},
    {{ nome:'ROAS', precisa:['receita','investimento'], denom:'investimento', fmt:'mult', meta:1, formula:'Receita ÷ Investimento', calc:function(v){{ return v.receita / v.investimento; }} }},
    {{ nome:'ROI', precisa:['receita','investimento'], denom:'investimento', fmt:'pct', meta:0, formula:'((Receita − Investimento) ÷ Investimento) × 100', calc:function(v){{ return (v.receita - v.investimento) / v.investimento * 100; }} }},
    {{ nome:'EPC', precisa:['receita','cliques'], denom:'cliques', fmt:'moeda', formula:'Receita ÷ Cliques', calc:function(v){{ return v.receita / v.cliques; }} }},
    {{ nome:'RPM', precisa:['receita','impressoes'], denom:'impressoes', fmt:'moeda', formula:'(Receita ÷ Impressões) × 1.000', calc:function(v){{ return v.receita / v.impressoes * 1000; }} }}
  ];

  var fmtMoeda = new Intl.NumberFormat('pt-BR', {{ style:'currency', currency:'BRL' }});
  var fmtPct   = new Intl.NumberFormat('pt-BR', {{ minimumFractionDigits:2, maximumFractionDigits:2 }});
  var fmtMult  = new Intl.NumberFormat('pt-BR', {{ minimumFractionDigits:2, maximumFractionDigits:2 }});

  function formatarValor(valor, fmt) {{
    if (fmt === 'moeda') return fmtMoeda.format(valor);
    if (fmt === 'pct') return fmtPct.format(valor) + '%';
    if (fmt === 'mult') return fmtMult.format(valor) + 'x';
    return String(valor);
  }}

  function lerEntrada(campo) {{
    var el = document.getElementById('inp-' + campo);
    var s = el.value.trim();
    if (s === '') return null;
    var n = parseFloat(s);
    return (isFinite(n) && n >= 0) ? n : NaN;
  }}

  function renderCalc() {{
    var v = {{}};
    CAMPOS_CALC.forEach(function(k) {{ v[k] = lerEntrada(k); }});
    var alvo = document.getElementById('calc-resultados');
    var frag = document.createDocumentFragment();

    CALC_DEFS.forEach(function (def) {{
      var card = document.createElement('article');
      card.className = 'calc-card';
      
      var nome = document.createElement('div'); nome.className = 'calc-nome'; nome.textContent = def.nome;
      var valor = document.createElement('div'); valor.className = 'calc-valor';
      
      var faltando = def.precisa.filter(function(k) {{ return v[k] === null; }});
      var s = {{ tipo: faltando.length ? 'faltando' : 'ok', valor: 0, campos: faltando }};
      if (s.tipo === 'ok' && v[def.denom] === 0) s.tipo = 'divisor';
      if (s.tipo === 'ok') s.valor = def.calc(v);

      if (s.tipo === 'faltando') {{
        card.classList.add('pendente'); valor.classList.add('calc-pendente-txt');
        valor.textContent = 'Faltam: ' + s.campos.map(function(k){{return LABELS_CALC[k];}}).join(', ');
      }} else if (s.tipo === 'divisor') {{
        card.classList.add('pendente'); valor.classList.add('calc-pendente-txt');
        valor.textContent = 'Divisor zero: ' + LABELS_CALC[def.denom];
      }} else {{
        valor.textContent = formatarValor(s.valor, def.fmt);
        if (def.meta !== undefined) {{
          var ok = s.valor >= def.meta;
          card.classList.add(ok ? 'ok' : 'ruim');
          var metaBadge = document.createElement('div');
          metaBadge.className = 'calc-meta' + (ok ? '' : ' ruim');
          metaBadge.textContent = (ok ? '✓ ' : '✗ ') + 'Meta ' + (ok ? 'atingida' : 'não atingida') + ' (≥ ' + formatarValor(def.meta, def.fmt) + ')';
          card.appendChild(metaBadge);
        }}
      }}
      card.prepend(nome); card.appendChild(valor);
      var formulaDiv = document.createElement('div'); formulaDiv.className = 'calc-formula-mini'; formulaDiv.textContent = def.formula;
      card.appendChild(formulaDiv);
      frag.appendChild(card);
    }});
    alvo.replaceChildren(frag);
  }}

  CAMPOS_CALC.forEach(function (k) {{
    var inp = document.getElementById('inp-' + k);
    try {{
      var salvo = localStorage.getItem('calc.' + k);
      if (salvo != null) inp.value = salvo;
    }} catch (e) {{}}
    inp.addEventListener('input', function () {{
      try {{ localStorage.setItem('calc.' + k, inp.value); }} catch (e) {{}}
      renderCalc();
    }});
  }});

  document.getElementById('btn-calc-limpar').addEventListener('click', function () {{
    CAMPOS_CALC.forEach(function (k) {{
      document.getElementById('inp-' + k).value = '';
      try {{ localStorage.removeItem('calc.' + k); }} catch (e) {{}}
    }});
    renderCalc();
    document.getElementById('inp-investimento').focus();
  }});

  document.getElementById('btn-tema').addEventListener('click', function () {{
    aplicarTema(document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro');
  }});

  renderCalc();
}})();
</script>
</body>
</html>
"""

# ==========================================
# TEMPLATE DAS MÉTRICAS (CATÁLOGO)
# ==========================================
HTML_METRICAS = f"""<!DOCTYPE html>
<html lang="pt-BR" data-tema="claro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Métricas de Tráfego Pago - Reverse Marketing</title>
<script src="https://cdn.tailwindcss.com"></script>
{CSS_BASE}
</head>
<body>
{MENU_HTML.replace('{titulo_pagina}', 'Métricas').replace('{classe_metricas}', 'text-white font-bold border-b-2 border-orange-500 pb-1').replace('{classe_calc}', 'text-slate-400 hover:text-white transition-colors')}

<div class="topo">
  <p class="sub" id="contador" style="margin-bottom:12px; color:var(--muted); font-size:13.5px;">Carregando...</p>
  <div class="barra">
    <input id="busca" type="search" placeholder="Buscar métrica, fórmula ou descrição…  (atalho: /)" autocomplete="off">
    <select id="filtro-categoria"></select>
    <button class="btn" id="btn-tema" type="button">🌙</button>
  </div>
</div>

<main>
  <aside class="dica"><strong>Como usar:</strong> escolha <strong>uma métrica principal</strong> alinhada ao objetivo da campanha (ROAS para vendas, CPL para leads, CPM para awareness) e trate as demais como <strong>métricas de diagnóstico</strong>.</aside>
  <div id="conteudo"></div>
</main>

<script id="dados" type="application/json">__DADOS__</script>
<script>
(function () {{
  {JS_TOAST_E_TEMA}

  var DADOS = JSON.parse(document.getElementById('dados').textContent);
  var CATS = DADOS.categorias || [];
  var TOTAL = CATS.reduce(function (n, c) {{ return n + (c.metricas || []).length; }}, 0);

  var norm = function (s) {{ return String(s == null ? '' : s).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim(); }};
  CATS.forEach(function (c) {{
    (c.metricas || []).forEach(function (m) {{
      m._busca = norm([c.nome, c.descricao, m.nome, m.mede, m.formula, m.obs].join(' '));
    }});
  }});

  var $ = function (id) {{ return document.getElementById(id); }};
  var conteudo = $('conteudo'), busca = $('busca'), selectCat = $('filtro-categoria'), contador = $('contador');
  var estado = {{ termo: '', categoria: '' }};

  var opTodas = document.createElement('option'); opTodas.value = ''; opTodas.textContent = 'Todas as categorias'; selectCat.appendChild(opTodas);
  CATS.forEach(function (c) {{
    var op = document.createElement('option'); op.value = c.nome; op.textContent = (c.icone ? c.icone + ' ' : '') + c.nome; selectCat.appendChild(op);
  }});

  function el(tag, cls, txt) {{ var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }}
  function destacar(texto, termo) {{
    var frag = document.createDocumentFragment(); var txt = String(texto == null ? '' : texto); var alvoTermo = norm(termo);
    if (!alvoTermo) {{ frag.appendChild(document.createTextNode(txt)); return frag; }}
    var alvo = norm(txt); var i = 0;
    while (i <= txt.length) {{
      var pos = alvo.indexOf(alvoTermo, i);
      if (pos === -1) {{ frag.appendChild(document.createTextNode(txt.slice(i))); break; }}
      if (pos > i) frag.appendChild(document.createTextNode(txt.slice(i, pos)));
      var mk = document.createElement('mark'); mk.textContent = txt.slice(pos, pos + alvoTermo.length); frag.appendChild(mk);
      i = pos + alvoTermo.length;
    }}
    return frag;
  }}

  function construirSecao(cat, itens, termo) {{
    var sec = el('section', 'categoria');
    var h2 = el('h2'); if (cat.icone) h2.appendChild(el('span', 'icone', cat.icone));
    h2.appendChild(document.createTextNode(cat.nome)); h2.appendChild(el('span', 'badge', String(itens.length)));
    var wrap = el('div', 'tabela-wrap'); var table = el('table'); var thead = el('thead'); var trh = el('tr');
    ['Métrica', 'O que mede', 'Fórmula', 'Observação'].forEach(function (t) {{ trh.appendChild(el('th', null, t)); }}); thead.appendChild(trh);
    var tbody = el('tbody');
    itens.forEach(function (m) {{
      var tr = el('tr');
      var tdNome = el('td', 'nome'); tdNome.dataset.label = 'Métrica'; tdNome.appendChild(destacar(m.nome, termo));
      var tdMede = el('td'); tdMede.dataset.label = 'O que mede'; tdMede.appendChild(destacar(m.mede, termo));
      var tdForm = el('td'); tdForm.dataset.label = 'Fórmula';
      if (m.formula) {{ var code = el('code', 'formula'); code.appendChild(destacar(m.formula, termo)); tdForm.appendChild(code); }} else {{ tdForm.appendChild(el('span', 'obs', '—')); }}
      var tdObs = el('td'); tdObs.dataset.label = 'Observação';
      if (m.obs) {{ var sp = el('span', 'obs'); sp.appendChild(destacar(m.obs, termo)); tdObs.appendChild(sp); }} else {{ tdObs.appendChild(el('span', 'obs', '—')); }}
      tr.append(tdNome, tdMede, tdForm, tdObs); tbody.appendChild(tr);
    }});
    table.append(thead, tbody); wrap.appendChild(table); sec.appendChild(h2);
    if (cat.descricao) sec.appendChild(el('p', 'cat-desc', cat.descricao));
    sec.appendChild(wrap); return sec;
  }}

  function render() {{
    var termo = estado.termo, alvo = norm(termo), catSel = estado.categoria, frag = document.createDocumentFragment();
    CATS.forEach(function (c) {{
      if (catSel && c.nome !== catSel) return;
      var itens = (c.metricas || []).filter(function (m) {{ return !alvo || m._busca.indexOf(alvo) !== -1; }});
      if (!itens.length) return;
      frag.appendChild(construirSecao(c, itens, termo));
    }});
    conteudo.replaceChildren(frag);
    if (contador) contador.textContent = 'Métricas de Tráfego Pago - ' + TOTAL + ' cadastradas';
  }}

  var debounce; busca.addEventListener('input', function () {{ clearTimeout(debounce); debounce = setTimeout(function () {{ estado.termo = busca.value; render(); }}, 120); }});
  selectCat.addEventListener('change', function () {{ estado.categoria = selectCat.value; render(); }});
  document.getElementById('btn-tema').addEventListener('click', function () {{ aplicarTema(document.documentElement.dataset.tema === 'escuro' ? 'claro' : 'escuro'); }});
  
  render();
}})();
</script>
</body>
</html>
"""

def main():
    if not ARQ_DADOS.exists():
        print("ERRO: metricas.json não encontrado.")
        return

    with open(ARQ_DADOS, "r", encoding="utf-8") as f:
        dados = json.load(f)

    payload = json.dumps(dados, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    html_cat = HTML_METRICAS.replace("__DADOS__", payload)

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    # Salva as métricas
    p_met = PUBLIC_DIR / "metricas.html"
    p_met.write_text(html_cat, encoding="utf-8-sig")
    print("OK — metricas.html gerado.")
    
    # Salva a calculadora
    p_calc = PUBLIC_DIR / "calculadora-trafego.html"
    p_calc.write_text(HTML_CALCULADORA, encoding="utf-8-sig")
    print("OK — calculadora-trafego.html gerado.")

if __name__ == "__main__":
    main()