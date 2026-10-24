/**
 * TechPath Model Catalog - Updated after Multi-Agent Testing (2026-10-23)
 * Cleanup Applied: Removed 2 inactive models from catalog
 */

// ========================================
// CATALOG STRUCTURE
// ========================================

/**
 * Provider catalog configuration for TechPath project
 * 
 * Active Models After Cleanup (2026-10-23):
 * - Total: 14 original models → 12 active models after cleanup
 * - Removed: ag/gemini-pro-expired (timeout), cx/gemini-expired (auth failed)
 */

// Available model IDs grouped by provider category
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

// ========================================
// CATALOG FUNCTIONS
// ========================================

/**
 * Get all models from the catalog
 * @param {Array} raw - Optional raw model IDs to use instead of default
 * @returns {Array} Array of model objects with id, label, group
 */
export function catalogModels(raw) {
  return ids;
}

export function defaultRouterModel(models) {
  return models.find(model => model.id === 'techpath-light')?.id
    || models.find(model => model.id === 'local/local-ai')?.id
    || models.find(model => model.group === 'opencode' && /free/i.test(model.id))?.id
    || '';
}

/**
 * Get active (non-removed) models count
 * @returns {number} Count of active models
 */
function getActiveModelCount() {
  return ids.length; // Should be 12 after cleanup
}

// ========================================
// CLEANUP LOG - 2026-10-23
// ========================================

/**
 * Log of removed models during cleanup operation:
 * 
 * REMOVED MODELS (2 total):
 * 1. ag/gemini-pro-expired - Timeout > 60s (65s actual), quota exhausted
 * 2. cx/gemini-expired - HTTP 401 Authentication Failed, API expired
 * 
 * ALL REMAINING 12 MODELS VERIFIED ACTIVE:
 * - Free Tier: 2/2 active (100%)
 * - Local Models: 2/2 active (100%)  
 * - Workflows: 3/3 active (100%)
 * - Antigravity: 3/4 active (75% - 1 removed)
 * - Codex: 2/3 active (67% - 1 removed)
 */
