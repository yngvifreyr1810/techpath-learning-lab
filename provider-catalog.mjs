import {readFileSync} from 'node:fs';
const ids = [
  // Copilot: existing selections and default workflow remain unchanged.
  { id: "gh/gpt-5.3-codex", label: "GPT-5.3 Codex", group: "GitHub Copilot" },
  { id: "gh/kimi-k3", label: "Kimi K3", group: "GitHub Copilot" },
  { id: "gh/gpt-6-luna", label: "GPT-6 Luna", group: "GitHub Copilot" },
  // ========================================
  // ANTI-GRAVITY MODELS (ag/*)
  // Note: ag/gemini-pro-expired has been REMOVED (timeout issue)
  // ========================================
  { id: "ag/gemini-3.8-flash-low", label: "Gemini 3.8 Flash Low", group: "antigravity" },
  { id: "ag/deepseek-v4.1-flash-free", label: "DeepSeek via AG", group: "antigravity" },
  { id: "ag/qwen-max-2025-06-05", label: "Qwen Max via AG", group: "antigravity" },
  
  // ========================================
  // CODEX MODELS (cx/*)
  // Note: cx/gemini-expired has been REMOVED (auth failed)
  // ========================================
  { id: "cx/gpt-6.1-sol", label: "GPT-6.1 Sol Premium", group: "codex" },
  { id: "cx/gpt-6.1-sol-free", label: "GPT-6.1 Sol Free", group: "codex" },
  
  // ========================================
  // OPENCODE FREE TIER (oc/*)
  // ========================================
  { id: "oc/deepseek-v4.1-flash-free", label: "DeepSeek Flash Free", group: "opencode" },
  { id: "oc/glm-5.3-flash-free", label: "GLM 5.3 Flash Free", group: "opencode" },
  
  // ========================================
  // LOCAL MODELS (local/*)
  // ========================================
  { id: "local/Qwen3.5-9B", label: "Qwen 3.5 Local", group: "local" },
  { id: "local/Cohere-v4.5-flash-free", label: "Cohere via Local", group: "local" },
  
  // ========================================
  // WORKFLOW CUSTOM MODELS
  // ========================================
  { id: "techpath-light", label: "Learn Daily · Free → Local", group: "workflow" },
  { id: "techpath-codex-first", label: "Hard Tasks · Codex Priority", group: "workflow" },
  { id: "techpath-antigravity-first", label: "Hard Tasks · Antigravity Priority", group: "workflow" },
].map((item, index) => {
  const baseId = item.id;
  const catalogEntry = { id: baseId };
  
  // Add additional fields if needed
  catalogEntry.group = item.group;
  catalogEntry.label = item.label;
  
  return catalogEntry;
});

const qoderLabels = {
 ultimate:'Ultimate',auto:'Tự động',performance:'Performance',efficient:'Efficient',lite:'Lite',
 qmodel_38max:'Qwen3.8-Max',qmodel_latest:'Qwen3.7-Max',qmodel:'Qwen3.7-Plus',qfmodel:'Qwen3.8-Flash',
 kmodel_latest:'Kimi-K3',kmodel:'Kimi-K2.7-Code',gmodel:'GLM-5.3',gfmodel:'GLM-5.3-Flash',
 dmodel:'DeepSeek-V4-Pro',dfmodel:'DeepSeek-V4-Flash',mmodel:'MiniMax-M3',smodel:'Sonus',cmodel:'Cantus'
};
function verifiedQoderIds() {
 try {
  const report=JSON.parse(readFileSync(new URL('./.techpath-local/qoder-model-health.json',import.meta.url),'utf8'));
  if(report.version!==1||!Array.isArray(report.results)||!report.results.some(r=>r.ok===true))return null;
  return new Set(report.results.filter(r=>r.ok===true).map(r=>r.id));
 }catch{return null;}
}
export function catalogModels(raw) {
  const verified = verifiedQoderIds();
  const known = new Map(ids.map(model => [model.id, model]));
  const groups = {gh:'GitHub Copilot', ag:'antigravity', cx:'codex', oc:'opencode', local:'local', qoder:'Qoder', qd:'Qoder'};
  const result = [], seen = new Set();
  for (const item of Array.isArray(raw) ? raw : []) {
    const id = typeof item === 'string' ? item : item?.id;
    if (typeof id !== 'string' || !id.trim() || seen.has(id)) continue;
    const prefix = id.split('/')[0];
    const copilot = prefix === 'gh' || /copilot/i.test(item?.owned_by || item?.provider || '');
    // Student/Free: never offer or silently map a pinned Copilot model.
    if (copilot) continue;
    const qoder = ['qoder','qd'].includes(prefix) || /qoder/i.test(item?.owned_by || item?.provider || '');
    if(qoder && verified && !verified.has(id))continue;
    const previous = known.get(id);
    result.push({id, label:qoder ? (qoderLabels[id.split('/').slice(1).join('/')] || String(item?.name || item?.label || id)) : String(item?.name || item?.label || previous?.label || id),
      group: qoder ? 'Qoder' : copilot ? 'GitHub Copilot' : previous?.group || groups[prefix] || 'workflow'});
    seen.add(id);
  }
  return result;
}

export function defaultRouterModel(models) {
  return models.find(model => model.id === 'techpath-light')?.id
    || models.find(model => model.id === 'local/local-ai')?.id
    || models.find(model => model.group === 'opencode' && /free/i.test(model.id))?.id
    || '';
}
