// ── WORD COUNTER ──
function updateAll() {
  const text = document.getElementById('main-input').value;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) || []).length;
  const paras = text.trim() === '' ? 0 : text.trim().split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
  const readMins = Math.ceil(words / 200);
  const speakMins = Math.ceil(words / 130);

  document.getElementById('stat-words').textContent = words.toLocaleString();
  document.getElementById('stat-chars').textContent = chars.toLocaleString();
  document.getElementById('stat-chars-no-space').textContent = charsNoSpace.toLocaleString() + ' without spaces';
  document.getElementById('stat-sentences').textContent = sentences.toLocaleString();
  document.getElementById('stat-paras').textContent = paras.toLocaleString();
  document.getElementById('stat-read').textContent = readMins < 1 ? '< 1 min' : readMins + ' min';
  document.getElementById('stat-speak').textContent = speakMins < 1 ? '< 1 min' : speakMins + ' min';
}

async function copyText() {
  const text = document.getElementById('main-input').value;
  if (!text) return;
  await navigator.clipboard.writeText(text).catch(() => {});
}

async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('main-input').value = text;
    updateAll();
  } catch(e) { alert('Paste permission not available. Use Ctrl+V / Cmd+V to paste.'); }
}

function clearText() {
  document.getElementById('main-input').value = '';
  updateAll();
}

// ── TOOL SWITCHER ──
function switchTool(name, btn) {
  ['counter','case','clean','sort','keywords'].forEach(t => {
    document.getElementById('tool-' + t).style.display = t === name ? 'block' : 'none';
  });
  document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// ── CASE CONVERTER ──
function convertCase(type) {
  const input = document.getElementById('case-input').value;
  let result = '';
  switch (type) {
    case 'upper': result = input.toUpperCase(); break;
    case 'lower': result = input.toLowerCase(); break;
    case 'title': result = input.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); break;
    case 'sentence': result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()); break;
    case 'camel':
      result = input.toLowerCase().replace(/[\s_-]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase());
      break;
    case 'snake': result = input.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, ''); break;
    case 'kebab': result = input.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, ''); break;
    case 'alternate':
      result = input.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      break;
  }
  document.getElementById('case-output').textContent = result;
}

// ── CLEAN TEXT ──
function cleanText(type) {
  const input = document.getElementById('clean-input').value;
  let result = '';
  switch (type) {
    case 'trim': result = input.replace(/[ \t]+/g, ' ').replace(/^ /gm, '').replace(/ $/gm, ''); break;
    case 'lines': result = input.split('\n').filter(l => l.trim() !== '').join('\n'); break;
    case 'duplicate': result = [...new Set(input.split('\n'))].join('\n'); break;
    case 'reverse': result = input.split('').reverse().join(''); break;
    case 'numbers': result = input.replace(/[0-9]/g, ''); break;
    case 'punctuation': result = input.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, ''); break;
  }
  document.getElementById('clean-output').textContent = result;
}

// ── SORT LINES ──
function sortLines(type) {
  const lines = document.getElementById('sort-input').value.split('\n');
  let result = [];
  switch (type) {
    case 'az': result = [...lines].sort((a, b) => a.localeCompare(b)); break;
    case 'za': result = [...lines].sort((a, b) => b.localeCompare(a)); break;
    case 'shuffle': result = [...lines].sort(() => Math.random() - 0.5); break;
    case 'reverse': result = [...lines].reverse(); break;
    case 'unique': result = [...new Set(lines)]; break;
    case 'num': result = [...lines].sort((a, b) => parseFloat(a) - parseFloat(b)); break;
  }
  document.getElementById('sort-output').textContent = result.join('\n');
}

// ── KEYWORD DENSITY ──
function analyseKeywords() {
  const text = document.getElementById('kw-input').value.toLowerCase();
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  if (words.length === 0) { document.getElementById('kw-output').innerHTML = ''; return; }

  const stopWords = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','day','get','has','him','his','how','its','may','now','old','see','two','way','who','boy','did','its','let','put','say','she','too','use','than','that','this','with','have','from','they','will','been','come','does','here','just','like','long','make','many','more','most','much','only','over','said','same','some','such','take','them','then','time','very','when','were','what','your','also','into','made','well','back','even','good','know','live','need','only','than','them','well','came','each','felt','kept','left','lost','next','once','open','show','side','true','went','word','year','from','into','most','note','over','part','some','than','that','them','then','this','time','very','what','will','with']);
  const freq = {};
  words.forEach(w => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1; });

  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const max = top[0]?.[1] || 1;
  const total = words.length;

  document.getElementById('kw-output').innerHTML = `
    <table class="keyword-table">
      <thead><tr><th>Keyword</th><th>Count</th><th>Density</th><th>Frequency</th></tr></thead>
      <tbody>${top.map(([w, c]) => `
        <tr>
          <td><strong>${w}</strong></td>
          <td>${c}</td>
          <td>${(c / total * 100).toFixed(2)}%</td>
          <td><div class="bar"><div class="bar-fill" style="width:${c / max * 100}%"></div></div></td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="font-size:12px; color:#065f46; margin-top:8px;">Total words analysed: ${total} (stop words excluded)</div>`;
}

// ── COPY OUTPUT ──
async function copyOutput(id) {
  const text = document.getElementById(id).textContent;
  if (!text) return;
  await navigator.clipboard.writeText(text).catch(() => {});
  const btn = event.target;
  btn.textContent = '✅ Copied!';
  setTimeout(() => btn.textContent = '📋 Copy Result', 2000);
}
