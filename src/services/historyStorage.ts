import { PromptVersion, RequirementStructure, PromptMode } from '../types/prompt';

const STORAGE_KEY = 'bkgforge_prompt_creator_history_v1';

export function loadPromptHistory(): PromptVersion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load prompt history from localStorage:', err);
    return [];
  }
}

export function savePromptVersion(
  version: Omit<PromptVersion, 'id' | 'timestamp'>
): PromptVersion {
  const history = loadPromptHistory();
  const newEntry: PromptVersion = {
    ...version,
    id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString()
  };

  const updated = [newEntry, ...history].slice(0, 50); // Behalte die letzten 50 Versionen
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist version history:', err);
  }
  return newEntry;
}

export function clearPromptHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function deletePromptVersion(id: string): PromptVersion[] {
  const history = loadPromptHistory().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to delete version:', err);
  }
  return history;
}

export function exportPromptAsMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPromptAsJson(filename: string, data: object): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
