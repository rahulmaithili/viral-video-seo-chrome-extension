/**
 * Rahul Scripts — Viral Video AI Studio 3.0 PRO
 * Facebook In-Page AI Assistant for Reels & Videos
 * Directly injects AI generation buttons on Facebook & Meta Business Suite
 * Includes Multi-Page & Multi-Niche Master Prompt Preset Switcher
 */

(function () {
  console.log('[Viral Video AI Studio] In-page Facebook Assistant initialized.');

  // Avoid multiple injections
  if ((window as unknown as { __RS_FB_AI_INITIALIZED__?: boolean }).__RS_FB_AI_INITIALIZED__) {
    return;
  }
  (window as unknown as { __RS_FB_AI_INITIALIZED__?: boolean }).__RS_FB_AI_INITIALIZED__ = true;

  const SLEEP = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- Niche & Page Preset Interface & State ---
  type HookTone = 'viral_shock' | 'devotional' | 'comedy' | 'mystery' | 'balanced';

  let currentHookTone: HookTone = 'balanced';
  let lastGeneratedPinComment: string | null = null;

  const NICHE_SCHEDULES: Record<string, { peak: string }> = {
    bhakti: { peak: '06:00 - 08:30 AM & 06:00 - 08:00 PM' },
    cute_pets: { peak: '12:00 - 03:00 PM & 08:00 - 10:00 PM' },
    desi_village: { peak: '06:30 - 09:00 AM & 05:00 - 08:00 PM' },
    funny_comedy: { peak: '07:30 - 11:00 PM & 01:00 - 03:00 PM' },
    usa_viral: { peak: '09:00 PM - 02:00 AM IST' },
  };

  function getPeakStatus(nicheId: string): { peak: string; isPeak: boolean; statusText: string } {
    const hour = new Date().getHours();
    let isPeak = false;
    if (nicheId === 'bhakti' && ((hour >= 6 && hour <= 8) || (hour >= 18 && hour <= 20))) isPeak = true;
    else if (nicheId === 'funny_comedy' && ((hour >= 19 && hour <= 23) || (hour >= 13 && hour <= 15))) isPeak = true;
    else if (nicheId === 'cute_pets' && ((hour >= 12 && hour <= 15) || (hour >= 20 && hour <= 22))) isPeak = true;
    else if (nicheId === 'desi_village' && ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20))) isPeak = true;
    else if (nicheId === 'usa_viral' && (hour >= 21 || hour <= 2)) isPeak = true;

    const schedule = NICHE_SCHEDULES[nicheId] || { peak: '07:00 PM - 10:00 PM' };
    return {
      peak: schedule.peak,
      isPeak,
      statusText: isPeak ? '🟢 HIGH TRAFFIC NOW' : '⏰ BEST: ' + schedule.peak,
    };
  }

  interface NichePreset {
    id: string;
    name: string;
    pageKeywords: string[];
    masterPrompt: string;
    language: 'English' | 'Hindi' | 'Hinglish';
    targetUsa: boolean;
    fixedHashtags: string;
    defaultHookTone?: HookTone;
  }

  let availablePresets: NichePreset[] = [];
  let currentActivePresetId: string = 'bhakti';

  // --- Helper: Find Facebook Description Input ---
  function findDescriptionElement(): HTMLTextAreaElement | HTMLElement | null {
    // 1. If user is currently focused in an editable box, use it directly!
    const active = document.activeElement;
    if (
      active &&
      (active instanceof HTMLTextAreaElement ||
        active.getAttribute('contenteditable') === 'true' ||
        active.getAttribute('role') === 'textbox')
    ) {
      return active as HTMLElement;
    }

    // 2. Textarea with placeholder or aria matching reel/post description
    const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'));
    for (const ta of textareas) {
      const ph = (ta.placeholder || '').toLowerCase();
      const aria = (ta.getAttribute('aria-label') || '').toLowerCase();
      if (
        ph.includes('describe') ||
        ph.includes('reel') ||
        ph.includes('mind') ||
        ph.includes('what') ||
        ph.includes('caption') ||
        aria.includes('describe') ||
        aria.includes('reel') ||
        aria.includes('mind') ||
        aria.includes('caption')
      ) {
        return ta;
      }
    }

    // 3. Contenteditable divs
    const editables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'div[contenteditable="true"][role="textbox"], div[contenteditable="true"]'
      )
    );
    for (const ed of editables) {
      const aria = (ed.getAttribute('aria-label') || '').toLowerCase();
      const text = (ed.innerText || '').toLowerCase();
      const parent = ed.parentElement;
      const parentText = (parent ? parent.innerText || '' : '').toLowerCase();

      if (
        aria.includes('describe') ||
        aria.includes('reel') ||
        aria.includes('mind') ||
        aria.includes('write') ||
        aria.includes('caption') ||
        parentText.includes('describe your reel') ||
        parentText.includes('reel settings') ||
        parentText.includes("what's on your mind") ||
        parentText.includes('create post') ||
        text.includes('describe') ||
        text.includes('reel') ||
        text.includes('mind')
      ) {
        return ed;
      }
    }

    // 4. Fallback: First visible contenteditable with size
    for (const ed of editables) {
      const rect = ed.getBoundingClientRect();
      if (rect.width > 60 && rect.height > 25) {
        return ed;
      }
    }

    // 5. Fallback: First visible textarea with size
    for (const ta of textareas) {
      const rect = ta.getBoundingClientRect();
      if (rect.width > 60 && rect.height > 25) {
        return ta;
      }
    }

    return editables.length > 0 ? editables[0] : null;
  }

  // --- Helper: Find Facebook Tags Input ---
  function findTagsInputElement(): HTMLInputElement | null {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="text"], input:not([type])'));
    for (const inp of inputs) {
      const ph = (inp.placeholder || '').toLowerCase();
      const aria = (inp.getAttribute('aria-label') || '').toLowerCase();
      if (
        ph.includes('keyword') ||
        ph.includes('tag') ||
        ph.includes('find your reel') ||
        aria.includes('keyword') ||
        aria.includes('tag')
      ) {
        return inp;
      }
    }

    // Look for text node containing "Tags" or "keywords" near an input
    const allLabels = Array.from(document.querySelectorAll('span, div, label'));
    for (const label of allLabels) {
      const content = label.textContent || '';
      if (/tags\s*•/i.test(content) || /add relevant keywords/i.test(content)) {
        const container = label.closest('div[role="group"], div.x1n2onr6, div') || label.parentElement;
        if (container) {
          const matchedInput = container.querySelector<HTMLInputElement>('input');
          if (matchedInput) return matchedInput;
        }
      }
    }

    return null;
  }

  // --- Helper: Capture Frame from Facebook <video> ---
  function captureVideoFrame(): string | null {
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
    let bestVideo: HTMLVideoElement | null = null;
    let maxArea = 0;

    for (const v of videos) {
      const rect = v.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area > maxArea && rect.width > 50 && rect.height > 50) {
        maxArea = area;
        bestVideo = v;
      }
    }

    if (!bestVideo) return null;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = bestVideo.videoWidth || 640;
      canvas.height = bestVideo.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(bestVideo, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch {
      // CORS or video not ready
      return null;
    }
  }

  // --- Helper: Set value on React-controlled inputs ---
  function setReactInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
    element.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // --- Helper: Set value on Facebook contenteditable (Draft.js / Lexical) ---
  function setContentEditableValue(element: HTMLElement, text: string) {
    element.focus();

    // Select all existing content
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Try execCommand first (best for Draft.js / Lexical)
    const success = document.execCommand('insertText', false, text);

    if (!success || element.innerText.trim() === '') {
      // Direct DOM manipulation fallback
      element.innerText = text;
      element.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text,
        })
      );
    }

    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // --- Helper: Insert Tag into Facebook Tags Input ---
  async function insertTag(tagInput: HTMLInputElement, tagText: string) {
    tagInput.focus();
    const cleanTag = tagText.replace(/^#/, '').trim();
    setReactInputValue(tagInput, cleanTag);
    await SLEEP(80);

    // Simulate Enter key press
    for (const eventName of ['keydown', 'keypress', 'keyup']) {
      const ev = new KeyboardEvent(eventName, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
      });
      tagInput.dispatchEvent(ev);
    }
    await SLEEP(150);
  }

  // --- Page Detection & Auto-Matching ---
  function detectPageHint(): string {
    const dialog = document.querySelector('div[role="dialog"]');
    let dialogHeaderName = '';
    if (dialog) {
      const nameEl = dialog.querySelector('strong, span[dir="auto"].x193iq5w, a[role="link"] span[dir="auto"], h2');
      if (nameEl && nameEl.textContent) {
        dialogHeaderName = nameEl.textContent.trim();
      }
    }
    return `${dialogHeaderName} ${document.title} ${window.location.pathname}`.toLowerCase();
  }

  function autoMatchPresetWithPage() {
    if (!availablePresets || availablePresets.length === 0) return;
    const hint = detectPageHint();
    for (const p of availablePresets) {
      if (p.pageKeywords && p.pageKeywords.some((kw) => kw && hint.includes(kw.toLowerCase()))) {
        if (currentActivePresetId !== p.id) {
          currentActivePresetId = p.id;
          console.log(`[Viral Video AI Studio] Auto-matched page to niche: ${p.name} (${p.id})`);
          chrome.runtime.sendMessage({ type: 'SET_ACTIVE_PRESET', presetId: p.id });
          updatePresetDropdowns();
        }
        return;
      }
    }
  }

  function fetchPresets(): Promise<void> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_NICHE_PRESETS' }, (res) => {
        if (res && res.success && Array.isArray(res.presets)) {
          availablePresets = res.presets;
          if (res.activeId) {
            currentActivePresetId = res.activeId;
          }
          autoMatchPresetWithPage();
          updatePresetDropdowns();
        }
        resolve();
      });
    });
  }

  function updatePresetDropdowns() {
    const selects = document.querySelectorAll<HTMLSelectElement>('.rs-preset-select-dropdown');
    selects.forEach((sel) => {
      const val = currentActivePresetId;
      sel.innerHTML = availablePresets
        .map((p) => `<option value="${p.id}" ${p.id === val ? 'selected' : ''}>🎯 ${p.name}</option>`)
        .join('');
      sel.value = val;
    });

    const floatSel = document.querySelector<HTMLSelectElement>('#rs-float-preset-select');
    if (floatSel) {
      floatSel.innerHTML = availablePresets
        .map((p) => `<option value="${p.id}" ${p.id === currentActivePresetId ? 'selected' : ''}>🎯 ${p.name}</option>`)
        .join('');
      floatSel.value = currentActivePresetId;
    }
  }

  function updateHookToneDropdowns() {
    const selects = document.querySelectorAll<HTMLSelectElement>('.rs-hook-tone-select');
    selects.forEach((sel) => {
      sel.value = currentHookTone;
    });
  }

  function updatePeakTimeBadges() {
    const peakInfo = getPeakStatus(currentActivePresetId);
    const badges = document.querySelectorAll<HTMLElement>('.rs-peak-time-indicator');
    badges.forEach((b) => {
      b.textContent = peakInfo.statusText;
      b.style.color = peakInfo.isPeak ? '#34D399' : '#FCD34D';
    });
  }

  function getDefaultPinComment(nicheId: string, tone: HookTone): string {
    if (nicheId === 'bhakti' || tone === 'devotional') {
      return 'कमेंट में "हर हर महादेव" या "जय श्री राम" लिखकर अपनी हाज़िरी अवश्य लगाएं 🙏🚩';
    }
    if (nicheId === 'funny_comedy' || tone === 'comedy') {
      return 'सच बताना किस-किस के साथ ऐसा हुआ है? 😂 अपने 2 सबसे पक्के दोस्तों को टैग करो! 👇';
    }
    if (tone === 'viral_shock') {
      return 'क्या आपको इस ट्विस्ट का पहले से अंदाज़ा था? अपनी राय कमेंट में ज़रूर बताएं! 😱👇';
    }
    if (tone === 'mystery') {
      return 'इस वीडियो में सबसे अजीब चीज़ क्या नोटिस की? सिर्फ ध्यान से देखने वाले ही समझ पाएंगे! 🧐';
    }
    return 'आपको यह वीडियो कैसा लगा? कमेंट बॉक्स में अपनी राय ज़रूर शेयर करें! 👇✨';
  }

  function copyCurrentPinComment() {
    const commentToCopy = lastGeneratedPinComment || getDefaultPinComment(currentActivePresetId, currentHookTone);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(commentToCopy).then(() => {
        showToast(`💬 Copied First Pin-Comment to Clipboard!`);
      }).catch(() => {
        showToast(`💬 Pin-Comment: ${commentToCopy}`);
      });
    } else {
      showToast(`💬 Pin-Comment: ${commentToCopy}`);
    }
  }

  function setActivePreset(presetId: string) {
    currentActivePresetId = presetId;
    chrome.runtime.sendMessage({ type: 'SET_ACTIVE_PRESET', presetId });
    updatePresetDropdowns();
    const preset = availablePresets.find((p) => p.id === presetId);
    if (preset) {
      if (preset.defaultHookTone) {
        currentHookTone = preset.defaultHookTone;
        updateHookToneDropdowns();
      }
      showToast(`🎯 Niche switched: ${preset.name}`);
      const promptInput = document.querySelector<HTMLInputElement>('#rs-bulk-prompt-input');
      const langSelect = document.querySelector<HTMLSelectElement>('#rs-bulk-lang-select');
      const targetSelect = document.querySelector<HTMLSelectElement>('#rs-bulk-target-select');
      if (promptInput) promptInput.value = preset.masterPrompt;
      if (langSelect) langSelect.value = preset.language;
      if (targetSelect) targetSelect.value = preset.targetUsa ? 'usa' : 'global';
    }
    updatePeakTimeBadges();
  }

  // --- In-Page Preset Manager Modal ---
  function openPresetModal(presetToEditId?: string) {
    let modalOverlay = document.getElementById('rs-preset-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'rs-preset-modal-overlay';
      modalOverlay.className = 'rs-modal-overlay';
      document.body.appendChild(modalOverlay);
    }

    const activePreset =
      availablePresets.find((p) => p.id === (presetToEditId || currentActivePresetId)) ||
      availablePresets[0] || {
        id: `preset_${Date.now()}`,
        name: 'New Page Niche',
        pageKeywords: [],
        masterPrompt: '',
        language: 'Hindi',
        targetUsa: false,
        fixedHashtags: '#TrendingReels #ViralReels',
      };

    const isCreatingNew = presetToEditId === 'NEW';
    const targetData = isCreatingNew
      ? {
          id: `preset_${Date.now()}`,
          name: '',
          pageKeywords: [],
          masterPrompt: '',
          language: 'Hindi' as const,
          targetUsa: false,
          fixedHashtags: '',
        }
      : activePreset;

    modalOverlay.innerHTML = `
      <div class="rs-modal-card">
        <div class="rs-modal-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🎯</span>
            <div>
              <div style="font-size:14px; font-weight:800; color:#fff;">Page & Niche Preset Manager</div>
              <div style="font-size:11px; color:#A78BFA;">Configure Master Prompts & Fixed Hashtags for Facebook Pages</div>
            </div>
          </div>
          <button id="rs-modal-close-btn" class="rs-close-btn">✕</button>
        </div>

        <div class="rs-modal-body">
          <div style="margin-bottom: 14px;">
            <div style="font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; margin-bottom:6px;">Select Preset to Edit:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${availablePresets
                .map(
                  (p) => `
                <button type="button" class="rs-preset-pill ${p.id === targetData.id && !isCreatingNew ? 'active' : ''}" data-id="${p.id}">
                  🎯 ${p.name}
                </button>`
                )
                .join('')}
              <button type="button" id="rs-btn-create-new-pill" class="rs-preset-pill ${isCreatingNew ? 'active' : ''}" style="border-style:dashed; border-color:#8B5CF6;">
                + Add New Page Niche
              </button>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label class="rs-label">Page / Niche Name</label>
              <input type="text" id="rs-modal-name" class="rs-input" value="${targetData.name}" placeholder="e.g. Mahadev Bhakti 24/7 or Cute Dog Moments" />
            </div>

            <div>
              <label class="rs-label">Auto-Match Keywords (comma separated)</label>
              <input type="text" id="rs-modal-keywords" class="rs-input" value="${(targetData.pageKeywords || []).join(', ')}" placeholder="e.g. bhakti, mahadev, shiv, temple" />
              <span style="font-size:10px; color:#94A3B8; display:block; margin-top:2px;">When your Facebook page/dialog contains any of these words, this preset is chosen automatically!</span>
            </div>

            <div>
              <label class="rs-label">Master Prompt (AI Instructions for this Page)</label>
              <textarea id="rs-modal-prompt" class="rs-textarea" rows="3" placeholder="Tell AI what this page is about, the hook style, emotional tone, and audience call to action...">${targetData.masterPrompt}</textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div>
                <label class="rs-label">Language</label>
                <select id="rs-modal-lang" class="rs-select">
                  <option value="Hindi" ${targetData.language === 'Hindi' ? 'selected' : ''}>Hindi (हिन्दी)</option>
                  <option value="Hinglish" ${targetData.language === 'Hinglish' ? 'selected' : ''}>Hinglish</option>
                  <option value="English" ${targetData.language === 'English' ? 'selected' : ''}>English</option>
                </select>
              </div>
              <div>
                <label class="rs-label">Target Audience</label>
                <select id="rs-modal-target" class="rs-select">
                  <option value="global" ${!targetData.targetUsa ? 'selected' : ''}>Global / India</option>
                  <option value="usa" ${targetData.targetUsa ? 'selected' : ''}>USA Audience</option>
                </select>
              </div>
            </div>

            <div>
              <label class="rs-label">Fixed Hashtags (Always included in post)</label>
              <input type="text" id="rs-modal-hashtags" class="rs-input" value="${targetData.fixedHashtags || ''}" placeholder="e.g. #HarHarMahadev #BhaktiStatus #TrendingReels" />
            </div>
          </div>
        </div>

        <div class="rs-modal-footer">
          <button type="button" id="rs-modal-cancel-btn" class="rs-cancel-btn">Cancel</button>
          <button type="button" id="rs-modal-save-btn" class="rs-save-btn">💾 Save & Activate Preset</button>
        </div>
      </div>
    `;

    modalOverlay.style.display = 'flex';

    const closeBtn = modalOverlay.querySelector<HTMLButtonElement>('#rs-modal-close-btn');
    const cancelBtn = modalOverlay.querySelector<HTMLButtonElement>('#rs-modal-cancel-btn');
    const closeFunc = () => {
      if (modalOverlay) modalOverlay.style.display = 'none';
    };
    if (closeBtn) closeBtn.onclick = closeFunc;
    if (cancelBtn) cancelBtn.onclick = closeFunc;

    modalOverlay.querySelectorAll<HTMLButtonElement>('.rs-preset-pill[data-id]').forEach((pill) => {
      pill.onclick = (e) => {
        e.preventDefault();
        const pid = pill.getAttribute('data-id');
        if (pid) openPresetModal(pid);
      };
    });

    const createNewPill = modalOverlay.querySelector<HTMLButtonElement>('#rs-btn-create-new-pill');
    if (createNewPill) {
      createNewPill.onclick = (e) => {
        e.preventDefault();
        openPresetModal('NEW');
      };
    }

    const saveBtn = modalOverlay.querySelector<HTMLButtonElement>('#rs-modal-save-btn');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.preventDefault();
        const nameInput = modalOverlay!.querySelector<HTMLInputElement>('#rs-modal-name');
        const kwInput = modalOverlay!.querySelector<HTMLInputElement>('#rs-modal-keywords');
        const promptInput = modalOverlay!.querySelector<HTMLTextAreaElement>('#rs-modal-prompt');
        const langSelect = modalOverlay!.querySelector<HTMLSelectElement>('#rs-modal-lang');
        const targetSelect = modalOverlay!.querySelector<HTMLSelectElement>('#rs-modal-target');
        const hashInput = modalOverlay!.querySelector<HTMLInputElement>('#rs-modal-hashtags');

        const name = nameInput?.value.trim() || 'Custom Page Niche';
        const kws = (kwInput?.value || '')
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const masterPrompt = promptInput?.value.trim() || '';
        const language = (langSelect?.value || 'Hindi') as 'Hindi' | 'Hinglish' | 'English';
        const targetUsa = targetSelect?.value === 'usa';
        const fixedHashtags = hashInput?.value.trim() || '';

        const newPreset: NichePreset = {
          id: isCreatingNew ? `preset_${Date.now()}` : targetData.id,
          name,
          pageKeywords: kws,
          masterPrompt,
          language,
          targetUsa,
          fixedHashtags,
        };

        chrome.runtime.sendMessage(
          {
            type: 'SAVE_NICHE_PRESET',
            preset: newPreset,
          },
          (res) => {
            if (res && res.success) {
              availablePresets = res.presets;
              setActivePreset(res.activeId);
              closeFunc();
              showToast(`✓ Preset "${name}" saved & activated!`);
            }
          }
        );
      };
    }
  }

  // --- Request AI Generation from Background Service Worker ---
  interface GeneratedResult {
    title: string;
    caption: string;
    hashtags: string[];
    tags: string[];
    fullDescription: string;
    firstComment?: string;
    policySafe?: boolean;
    hookTone?: HookTone;
  }

  function requestAIGeneration(frameData: string | null): Promise<GeneratedResult> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: 'GENERATE_FB_REEL_METADATA',
          frameData,
          pageTitle: document.title,
          pageHint: detectPageHint(),
          presetId: currentActivePresetId,
          hookTone: currentHookTone,
          url: window.location.href,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success && response.data) {
            if (response.data.firstComment) {
              lastGeneratedPinComment = response.data.firstComment;
            }
            resolve(response.data);
          } else {
            reject(new Error(response?.error || 'AI generation failed'));
          }
        }
      );
    });
  }

  // --- Inject In-Page CSS ---
  function injectStyles() {
    if (document.getElementById('rs-ai-studio-styles')) return;
    const style = document.createElement('style');
    style.id = 'rs-ai-studio-styles';
    style.textContent = `
      .rs-ai-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
        color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(109, 40, 217, 0.35);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        margin: 4px 0;
        z-index: 10;
      }
      .rs-ai-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(109, 40, 217, 0.5);
        background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
      }
      .rs-ai-btn:active {
        transform: translateY(0);
      }
      .rs-ai-btn.rs-loading {
        opacity: 0.85;
        cursor: wait;
        pointer-events: none;
      }
      .rs-ai-btn.rs-success {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
      }
      .rs-inpage-select {
        background: #1E1B4B !important;
        border: 1px solid #7C3AED !important;
        border-radius: 6px !important;
        color: #FFFFFF !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        padding: 4px 8px !important;
        outline: none !important;
        cursor: pointer !important;
      }
      .rs-icon-btn {
        background: #2E1065 !important;
        border: 1px solid #7C3AED !important;
        color: #DDD6FE !important;
        border-radius: 6px !important;
        padding: 4px 8px !important;
        font-size: 11px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .rs-icon-btn:hover {
        background: #4C1D95 !important;
        color: #fff !important;
      }
      .rs-floating-widget {
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 2147483647 !important;
        background: #0B0F19 !important;
        border: 2px solid #7C3AED !important;
        border-radius: 14px !important;
        padding: 10px 14px !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(124, 58, 237, 0.5) !important;
        color: #fff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        animation: rs-fade-in 0.3s ease-out;
      }
      .rs-floating-widget .rs-badge {
        font-size: 10px;
        font-weight: 800;
        color: #C084FC;
        background: #2E1065;
        border: 1px solid #581C87;
        padding: 2px 6px;
        border-radius: 6px;
      }
      .rs-floating-widget .rs-title {
        font-size: 12px;
        font-weight: 700;
        color: #FFFFFF;
      }
      .rs-toast {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #10B981;
        color: #FFFFFF;
        font-size: 13px;
        font-weight: bold;
        padding: 10px 20px;
        border-radius: 30px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        z-index: 1000000;
        animation: rs-toast-slide 0.3s ease-out;
      }
      .rs-modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.75) !important;
        backdrop-filter: blur(4px) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      .rs-modal-card {
        background: #0B0F19 !important;
        border: 1px solid #7C3AED !important;
        border-radius: 16px !important;
        width: 100% !important;
        max-width: 520px !important;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(124, 58, 237, 0.3) !important;
        color: #fff !important;
        overflow: hidden !important;
        animation: rs-fade-in 0.25s ease-out !important;
      }
      .rs-modal-header {
        padding: 14px 18px !important;
        background: linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }
      .rs-close-btn {
        background: transparent !important;
        border: none !important;
        color: #94A3B8 !important;
        font-size: 16px !important;
        cursor: pointer !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
      }
      .rs-close-btn:hover {
        color: #fff !important;
        background: rgba(255,255,255,0.1) !important;
      }
      .rs-modal-body {
        padding: 16px 18px !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
      }
      .rs-preset-pill {
        background: #1E293B !important;
        border: 1px solid #475569 !important;
        color: #E2E8F0 !important;
        border-radius: 20px !important;
        padding: 4px 10px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
      }
      .rs-preset-pill.active {
        background: #7C3AED !important;
        border-color: #A78BFA !important;
        color: #fff !important;
        box-shadow: 0 0 10px rgba(124, 58, 237, 0.5) !important;
      }
      .rs-label {
        display: block !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        color: #CBD5E1 !important;
        margin-bottom: 4px !important;
      }
      .rs-input, .rs-select, .rs-textarea {
        width: 100% !important;
        background: #020617 !important;
        border: 1px solid #475569 !important;
        border-radius: 8px !important;
        padding: 8px 10px !important;
        color: #fff !important;
        font-size: 12px !important;
        outline: none !important;
        box-sizing: border-box !important;
      }
      .rs-input:focus, .rs-select:focus, .rs-textarea:focus {
        border-color: #8B5CF6 !important;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3) !important;
      }
      .rs-modal-footer {
        padding: 12px 18px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        display: flex !important;
        justify-content: flex-end !important;
        gap: 10px !important;
        background: #0B0F19 !important;
      }
      .rs-cancel-btn {
        background: #1E293B !important;
        border: 1px solid #475569 !important;
        color: #CBD5E1 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        padding: 6px 14px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
      }
      .rs-save-btn {
        background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%) !important;
        border: none !important;
        color: #fff !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        padding: 6px 16px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4) !important;
      }
      @keyframes rs-fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes rs-toast-slide {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
      }
      @keyframes rs-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .rs-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: rs-spin 0.8s linear infinite;
      }
      .rs-bulk-panel {
        background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%);
        border: 1px solid #7C3AED;
        border-radius: 12px;
        padding: 14px 18px;
        margin: 14px 0 18px 0;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(124, 58, 237, 0.2);
        color: #F8FAFC;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        z-index: 100;
        animation: rs-fade-in 0.3s ease-out;
      }
      .rs-bulk-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 8px;
      }
      .rs-bulk-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .rs-bulk-title {
        font-size: 14px;
        font-weight: 800;
        color: #FFFFFF;
      }
      .rs-bulk-detected {
        font-size: 11px;
        color: #94A3B8;
      }
      .rs-bulk-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }
      .rs-bulk-input {
        flex: 1;
        min-width: 240px;
        background: #020617;
        border: 1px solid #475569;
        border-radius: 8px;
        padding: 8px 12px;
        color: #FFFFFF;
        font-size: 12px;
        outline: none;
      }
      .rs-bulk-input:focus {
        border-color: #8B5CF6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
      }
      .rs-bulk-select {
        background: #020617;
        border: 1px solid #475569;
        border-radius: 8px;
        padding: 8px 10px;
        color: #FFFFFF;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }
      .rs-bulk-action-btn {
        background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
        color: #FFFFFF;
        font-weight: 700;
        font-size: 12px;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        transition: all 0.2s ease;
      }
      .rs-bulk-action-btn:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
      }
      .rs-bulk-action-btn.rs-loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
      }
      .rs-bulk-status {
        margin-top: 10px;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(139, 92, 246, 0.15);
        border: 1px solid rgba(139, 92, 246, 0.3);
        color: #C4B5FD;
      }
      .rs-pulse-glow {
        animation: rs-pulse-glow-anim 2s infinite;
      }
      @keyframes rs-pulse-glow-anim {
        0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
        50% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      }
      .rs-peak-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 3px 8px;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(52, 211, 153, 0.4);
        color: #34D399;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        letter-spacing: 0.3px;
        cursor: default;
      }
      .rs-safe-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 3px 7px;
        border-radius: 6px;
        background: rgba(6, 78, 59, 0.4);
        border: 1px solid rgba(16, 185, 129, 0.5);
        color: #6EE7B7;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        cursor: default;
      }
      .rs-pin-btn {
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: #FFFFFF !important;
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 8px;
        border: 1px solid rgba(52, 211, 153, 0.4);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
        transition: all 0.2s ease;
      }
      .rs-pin-btn:hover {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(message: string) {
    const existing = document.getElementById('rs-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'rs-toast';
    toast.className = 'rs-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Main Action: Auto-Fill Description & Tags ---
  async function executeAutoGeneration(target: 'all' | 'description' | 'tags', triggerButton?: HTMLElement) {
    if (triggerButton) {
      triggerButton.classList.add('rs-loading');
      triggerButton.innerHTML = `<span class="rs-spinner"></span> Analyzing Video...`;
    }

    try {
      const frameData = captureVideoFrame();
      const generated = await requestAIGeneration(frameData);

      // 1. Fill Description
      if (target === 'all' || target === 'description') {
        const descEl = findDescriptionElement();
        if (descEl) {
          if (descEl instanceof HTMLTextAreaElement) {
            setReactInputValue(descEl, generated.fullDescription);
          } else {
            setContentEditableValue(descEl, generated.fullDescription);
          }
        }
      }

      // 2. Fill Tags
      if (target === 'all' || target === 'tags') {
        const tagInput = findTagsInputElement();
        if (tagInput && generated.tags && generated.tags.length > 0) {
          for (const tag of generated.tags.slice(0, 6)) {
            await insertTag(tagInput, tag);
          }
        }
      }

      if (generated.firstComment) {
        lastGeneratedPinComment = generated.firstComment;
        const pinBtns = document.querySelectorAll<HTMLElement>('.rs-pin-btn');
        pinBtns.forEach((b) => b.classList.add('rs-pulse-glow'));
      }

      showToast('✨ Reel Title, Caption, Tags & Pin-Comment generated! 🛡️ Safe');
      if (triggerButton) {
        triggerButton.classList.remove('rs-loading');
        triggerButton.classList.add('rs-success');
        triggerButton.innerHTML = `✓ Applied!`;
        setTimeout(() => {
          triggerButton.classList.remove('rs-success');
          triggerButton.innerHTML = target === 'tags' ? `🏷️ AI Generate Tags` : `⚡ AI Generate Title & Description`;
        }, 2500);
      }
    } catch (err) {
      console.error('[Viral Video AI Studio] Auto-generation error:', err);
      showToast('⚠️ AI Generation failed. Please try again.');
      if (triggerButton) {
        triggerButton.classList.remove('rs-loading');
        triggerButton.innerHTML = `⚠️ Failed. Retry?`;
      }
    }
  }

  // --- Meta Business Suite Bulk Upload Reels Logic ---
  async function executeMetaBulkGeneration(
    statusEl: HTMLElement,
    btn: HTMLButtonElement,
    masterPrompt: string,
    language: string,
    targetUsa: boolean
  ) {
    const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).filter(
      (ta) =>
        (ta.placeholder || '').toLowerCase().includes('describe your reel') ||
        (ta.getAttribute('aria-label') || '').toLowerCase().includes('describe') ||
        Boolean(ta.closest('div[role="row"], tr, div'))
    );

    if (textareas.length === 0) {
      statusEl.style.display = 'block';
      statusEl.textContent = '⚠️ No bulk reel description boxes detected. Please wait for reels to finish uploading.';
      return;
    }

    btn.classList.add('rs-loading');
    btn.disabled = true;
    statusEl.style.display = 'block';

    let successCount = 0;
    const total = textareas.length;

    for (let i = 0; i < total; i++) {
      const ta = textareas[i];
      const row = ta.closest('div[role="row"], tr, div.x1ypdohk, div') || ta.parentElement;
      const rowText = row ? (row as HTMLElement).innerText || row.textContent || '' : '';
      const img = row ? row.querySelector<HTMLImageElement>('img') : null;
      let thumbnailData: string | null = null;

      if (img && img.src && !img.src.startsWith('data:')) {
        try {
          const cvs = document.createElement('canvas');
          cvs.width = img.naturalWidth || 320;
          cvs.height = img.naturalHeight || 180;
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
            thumbnailData = cvs.toDataURL('image/jpeg', 0.7);
          }
        } catch {
          // ignore CORS
        }
      }

      statusEl.textContent = `⏳ Processing Reel ${i + 1} of ${total} with AI...`;

      try {
        const response: any = await new Promise((resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'GENERATE_META_BULK_REEL',
              masterPrompt,
              filename: rowText.slice(0, 50),
              thumbnailData,
              rowNumber: i + 1,
              language,
              targetUsa,
              presetId: currentActivePresetId,
              hookTone: currentHookTone,
              pageHint: detectPageHint(),
            },
            (res) => resolve(res)
          );
        });

        if (response && response.success && response.data) {
          setReactInputValue(ta, response.data.fullDescription);
          successCount++;
        }
      } catch (err) {
        console.error('Failed to generate for bulk row:', err);
      }

      await SLEEP(250);
    }

    btn.classList.remove('rs-loading');
    btn.disabled = false;
    statusEl.textContent = `✓ Done! Successfully generated & filled ${successCount} of ${total} Reels!`;
    showToast(`✨ Generated metadata for ${successCount} Reels!`);
  }

  function checkAndInjectMetaBulkComposer() {
    const isMetaBulk =
      window.location.href.includes('bulk_upload_composer') ||
      document.body.innerText.includes('Bulk upload reels');

    if (!isMetaBulk) return false;

    // Find all reel textareas
    const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'));

    // 1. Inject or update top bulk control panel
    let panel = document.getElementById('rs-meta-bulk-panel');
    if (!panel) {
      const heading = Array.from(document.querySelectorAll('h1, h2, span, div')).find(
        (el) => el.textContent?.trim() === 'Bulk upload reels'
      );

      panel = document.createElement('div');
      panel.id = 'rs-meta-bulk-panel';
      panel.className = 'rs-bulk-panel';
      panel.innerHTML = `
        <div class="rs-bulk-header">
          <div class="rs-bulk-brand">
            <span style="font-size: 16px;">⚡</span>
            <span class="rs-bulk-title">Rahul Scripts — Bulk Reels AI Studio</span>
            <span class="rs-badge">3.0 PRO</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="rs-peak-badge rs-peak-time-indicator" title="Live Facebook Traffic Radar">${getPeakStatus(currentActivePresetId).statusText}</span>
            <span class="rs-safe-badge" title="Facebook Policy Safe">🛡️ Safe</span>
            <span class="rs-bulk-detected">Reels Detected: <strong id="rs-bulk-count" style="color: #A78BFA;">${textareas.length}</strong></span>
          </div>
        </div>
        <div class="rs-bulk-controls">
          <div style="display:flex; align-items:center; gap:4px;">
            <select id="rs-meta-preset-select" class="rs-bulk-select rs-preset-select-dropdown" title="Active Page / Niche Preset"></select>
            <button id="rs-meta-manage-btn" class="rs-icon-btn" title="Manage Presets & Prompts">⚙️</button>
          </div>
          <select id="rs-bulk-hook-select" class="rs-bulk-select rs-hook-tone-select" title="Reel Hook & Viral Tone">
            <option value="balanced">⚡ Balanced</option>
            <option value="viral_shock">🔥 Shock Twist</option>
            <option value="devotional">🙏 Devotional</option>
            <option value="comedy">😂 Funny Meme</option>
            <option value="mystery">❓ Curiosity</option>
          </select>
          <input
            type="text"
            id="rs-bulk-prompt-input"
            class="rs-bulk-input"
            placeholder="Niche / Master Prompt (e.g. Bhakti status, Cute puppy funny moments, Village culture, Comedy...)"
          />
          <select id="rs-bulk-lang-select" class="rs-bulk-select">
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Hinglish">Hinglish</option>
            <option value="English">English</option>
          </select>
          <select id="rs-bulk-target-select" class="rs-bulk-select">
            <option value="global">Global Audience</option>
            <option value="usa">Target USA</option>
          </select>
          <button id="rs-bulk-run-btn" class="rs-bulk-action-btn">
            ⚡ Generate & Fill All Reels
          </button>
        </div>
        <div id="rs-bulk-status-msg" class="rs-bulk-status" style="display:none;"></div>
      `;

      // Find best placement: before table/rows container or near heading
      const table = document.querySelector('div[role="grid"], div[role="table"], table');
      const tableContainer = table?.closest('div.x1y1aw1k, div.x78zum5, div') || table;

      if (tableContainer && tableContainer.parentElement) {
        tableContainer.parentElement.insertBefore(panel, tableContainer);
      } else if (heading && heading.parentElement && heading.parentElement.parentElement) {
        heading.parentElement.parentElement.insertBefore(panel, heading.parentElement.nextSibling);
      } else {
        document.body.prepend(panel);
      }

      const runBtn = panel.querySelector<HTMLButtonElement>('#rs-bulk-run-btn');
      const promptInput = panel.querySelector<HTMLInputElement>('#rs-bulk-prompt-input');
      const langSelect = panel.querySelector<HTMLSelectElement>('#rs-bulk-lang-select');
      const targetSelect = panel.querySelector<HTMLSelectElement>('#rs-bulk-target-select');
      const statusMsg = panel.querySelector<HTMLElement>('#rs-bulk-status-msg');
      const metaPresetSelect = panel.querySelector<HTMLSelectElement>('#rs-meta-preset-select');
      const metaManageBtn = panel.querySelector<HTMLButtonElement>('#rs-meta-manage-btn');
      const bulkHookSelect = panel.querySelector<HTMLSelectElement>('#rs-bulk-hook-select');

      if (bulkHookSelect) {
        bulkHookSelect.value = currentHookTone;
        bulkHookSelect.onchange = (e) => {
          currentHookTone = (e.target as HTMLSelectElement).value as HookTone;
          updateHookToneDropdowns();
          showToast(`🎭 Tone set: ${currentHookTone.replace('_', ' ').toUpperCase()}`);
        };
      }

      if (metaPresetSelect) {
        metaPresetSelect.onchange = (e) => {
          setActivePreset((e.target as HTMLSelectElement).value);
        };
      }
      if (metaManageBtn) {
        metaManageBtn.onclick = (e) => {
          e.preventDefault();
          openPresetModal();
        };
      }

      if (runBtn && promptInput && langSelect && targetSelect && statusMsg) {
        runBtn.onclick = (e) => {
          e.preventDefault();
          executeMetaBulkGeneration(
            statusMsg,
            runBtn,
            promptInput.value,
            langSelect.value,
            targetSelect.value === 'usa'
          );
        };
      }

      // Initial populate for inputs from active preset
      const activeP = availablePresets.find((p) => p.id === currentActivePresetId);
      if (activeP && promptInput && langSelect && targetSelect) {
        promptInput.value = activeP.masterPrompt || '';
        langSelect.value = activeP.language || 'Hindi';
        targetSelect.value = activeP.targetUsa ? 'usa' : 'global';
      }

      updatePresetDropdowns();
    } else {
      const countEl = panel.querySelector('#rs-bulk-count');
      if (countEl) countEl.textContent = textareas.length.toString();
    }

    // 2. Inject row-by-row button for each description textarea
    for (let i = 0; i < textareas.length; i++) {
      const ta = textareas[i];
      const parent = ta.parentElement;
      if (parent && !parent.querySelector('.rs-row-ai-btn')) {
        const rowBtn = document.createElement('button');
        rowBtn.className = 'rs-ai-btn rs-row-ai-btn';
        rowBtn.style.fontSize = '10px';
        rowBtn.style.padding = '3px 8px';
        rowBtn.style.marginBottom = '4px';
        rowBtn.style.display = 'inline-flex';
        rowBtn.innerHTML = `⚡ AI Fill`;
        rowBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          rowBtn.classList.add('rs-loading');
          rowBtn.innerHTML = `<span class="rs-spinner"></span>`;

          const promptInput = document.querySelector<HTMLInputElement>('#rs-bulk-prompt-input');
          const langSelect = document.querySelector<HTMLSelectElement>('#rs-bulk-lang-select');
          const targetSelect = document.querySelector<HTMLSelectElement>('#rs-bulk-target-select');

          const response: any = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
              {
                type: 'GENERATE_META_BULK_REEL',
                masterPrompt: promptInput?.value || '',
                filename: `Reel #${i + 1}`,
                rowNumber: i + 1,
                language: langSelect?.value || 'Hindi',
                targetUsa: targetSelect?.value === 'usa',
                presetId: currentActivePresetId,
                hookTone: currentHookTone,
                pageHint: detectPageHint(),
              },
              (res) => resolve(res)
            );
          });

          rowBtn.classList.remove('rs-loading');
          if (response && response.success && response.data) {
            setReactInputValue(ta, response.data.fullDescription);
            rowBtn.classList.add('rs-success');
            rowBtn.innerHTML = `✓`;
            setTimeout(() => {
              rowBtn.classList.remove('rs-success');
              rowBtn.innerHTML = `⚡ AI Fill`;
            }, 2000);
          } else {
            rowBtn.innerHTML = `⚠️ Retry`;
          }
        };

        parent.insertBefore(rowBtn, ta);
      }
    }

    return true;
  }

  // --- Listen for Messages from Extension Popup ---
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'TRIGGER_AUTO_FILL_ALL') {
      const statusMsg = document.getElementById('rs-bulk-status-msg');
      const runBtn = document.getElementById('rs-bulk-run-btn') as HTMLButtonElement;
      const promptInput = document.getElementById('rs-bulk-prompt-input') as HTMLInputElement;
      const langSelect = document.getElementById('rs-bulk-lang-select') as HTMLSelectElement;
      const targetSelect = document.getElementById('rs-bulk-target-select') as HTMLSelectElement;

      if (statusMsg && runBtn) {
        executeMetaBulkGeneration(
          statusMsg,
          runBtn,
          promptInput?.value || '',
          langSelect?.value || 'Hindi',
          targetSelect?.value === 'usa'
        );
      } else {
        executeAutoGeneration('all');
      }
      sendResponse({ success: true });
      return true;
    }
  });

  // --- In-Page DOM Injection Routine ---
  function checkAndInjectButtons() {
    injectStyles();

    // Check Meta Business Suite Bulk Upload
    checkAndInjectMetaBulkComposer();

    // 1. Inject Inline Button next to "Description" or "Describe your reel"
    const descEl = findDescriptionElement();
    if (descEl && !document.getElementById('rs-btn-desc-inject')) {
      const parent = descEl.parentElement;
      if (parent) {
        const isPost =
          document.body.innerText.includes('Create post') ||
          document.body.innerText.includes("What's on your mind") ||
          (descEl.getAttribute('aria-label') || '').toLowerCase().includes('mind');

        const btnContainer = document.createElement('div');
        btnContainer.id = 'rs-btn-desc-inject';
        btnContainer.style.display = 'flex';
        btnContainer.style.alignItems = 'center';
        btnContainer.style.justifyContent = 'space-between';
        btnContainer.style.flexWrap = 'wrap';
        btnContainer.style.gap = '8px';
        btnContainer.style.marginBottom = '6px';
        btnContainer.style.marginTop = '4px';
        btnContainer.style.width = '100%';

        const leftGroup = document.createElement('div');
        leftGroup.style.display = 'flex';
        leftGroup.style.alignItems = 'center';
        leftGroup.style.flexWrap = 'wrap';
        leftGroup.style.gap = '6px';

        const btn = document.createElement('button');
        btn.className = 'rs-ai-btn';
        btn.innerHTML = isPost
          ? `⚡ AI Generate Post Title, Caption & Hashtags`
          : `⚡ AI Generate Title & Description`;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          executeAutoGeneration('description', btn);
        };
        leftGroup.appendChild(btn);

        // 1. Hook & Tone Selector Dropdown
        const hookSelect = document.createElement('select');
        hookSelect.id = 'rs-inpage-hook-select';
        hookSelect.className = 'rs-inpage-select rs-hook-tone-select';
        hookSelect.title = 'Select Reel Hook Style & Emotional Tone';
        hookSelect.innerHTML = `
          <option value="balanced" ${currentHookTone === 'balanced' ? 'selected' : ''}>⚡ Balanced</option>
          <option value="viral_shock" ${currentHookTone === 'viral_shock' ? 'selected' : ''}>🔥 Shock Twist</option>
          <option value="devotional" ${currentHookTone === 'devotional' ? 'selected' : ''}>🙏 Devotional</option>
          <option value="comedy" ${currentHookTone === 'comedy' ? 'selected' : ''}>😂 Funny Meme</option>
          <option value="mystery" ${currentHookTone === 'mystery' ? 'selected' : ''}>❓ Curiosity</option>
        `;
        hookSelect.onchange = (e) => {
          e.stopPropagation();
          currentHookTone = (e.target as HTMLSelectElement).value as HookTone;
          updateHookToneDropdowns();
          showToast(`🎭 Tone set: ${currentHookTone.replace('_', ' ').toUpperCase()}`);
        };
        leftGroup.appendChild(hookSelect);

        // 2. 💬 Pin-Comment One-Click Copy Button
        const pinBtn = document.createElement('button');
        pinBtn.id = 'rs-pin-comment-btn';
        pinBtn.className = 'rs-pin-btn';
        pinBtn.title = 'Copy First Pin-Comment to boost comments and algorithmic ranking (3x viral reach)';
        pinBtn.innerHTML = `💬 Copy Pin-Comment`;
        pinBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          copyCurrentPinComment();
        };
        leftGroup.appendChild(pinBtn);

        // 3. Preset Selector & Manage Button
        const presetWrap = document.createElement('div');
        presetWrap.style.display = 'inline-flex';
        presetWrap.style.alignItems = 'center';
        presetWrap.style.gap = '4px';
        presetWrap.style.background = 'rgba(124, 58, 237, 0.15)';
        presetWrap.style.border = '1px solid rgba(124, 58, 237, 0.3)';
        presetWrap.style.borderRadius = '8px';
        presetWrap.style.padding = '2px 6px';

        const presetSelect = document.createElement('select');
        presetSelect.className = 'rs-inpage-select rs-preset-select-dropdown';
        presetSelect.title = 'Active Page / Niche Master Prompt';
        presetSelect.onchange = (e) => {
          e.stopPropagation();
          setActivePreset((e.target as HTMLSelectElement).value);
        };
        presetWrap.appendChild(presetSelect);

        const manageBtn = document.createElement('button');
        manageBtn.className = 'rs-icon-btn';
        manageBtn.title = 'Manage Page Master Prompts & Hashtags';
        manageBtn.innerHTML = '⚙️';
        manageBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openPresetModal();
        };
        presetWrap.appendChild(manageBtn);

        leftGroup.appendChild(presetWrap);

        // 4. Live Algorithm Peak Traffic Radar Badge
        const peakBadge = document.createElement('span');
        peakBadge.className = 'rs-peak-badge rs-peak-time-indicator';
        const peakInfo = getPeakStatus(currentActivePresetId);
        peakBadge.textContent = peakInfo.statusText;
        peakBadge.title = `Live Facebook Traffic Radar for this niche (Best Peak: ${peakInfo.peak})`;
        peakBadge.style.color = peakInfo.isPeak ? '#34D399' : '#FCD34D';
        leftGroup.appendChild(peakBadge);

        // 5. Facebook Policy & Reach Safe Guard Badge
        const safeBadge = document.createElement('span');
        safeBadge.className = 'rs-safe-badge';
        safeBadge.title = 'Facebook Policy Guard: 100% reach safe! Banned engagement bait automatically filtered';
        safeBadge.innerHTML = `🛡️ Safe`;
        leftGroup.appendChild(safeBadge);

        btnContainer.appendChild(leftGroup);

        const badge = document.createElement('span');
        badge.style.fontSize = '10px';
        badge.style.color = '#A78BFA';
        badge.style.fontWeight = 'bold';
        badge.textContent = 'Rahul Scripts 3.0 PRO';
        btnContainer.appendChild(badge);

        // Smart placement for Reel Settings / Post / Flex rows
        const parentStyle = window.getComputedStyle(parent);
        const grandParent = parent.parentElement;
        const grandParentStyle = grandParent ? window.getComputedStyle(grandParent) : null;

        if (parentStyle.display === 'flex' && parentStyle.flexDirection === 'row') {
          parent.parentElement?.insertBefore(btnContainer, parent);
        } else if (grandParent && grandParentStyle && grandParentStyle.display === 'flex' && grandParentStyle.flexDirection === 'row') {
          grandParent.parentElement?.insertBefore(btnContainer, grandParent);
        } else {
          parent.insertBefore(btnContainer, descEl);
        }

        updatePresetDropdowns();
      }
    }

    // 2. Inject Inline Button next to "Tags" / "Tag and collaborate"
    const tagInput = findTagsInputElement();
    if (tagInput && !document.getElementById('rs-btn-tags-inject')) {
      const parent = tagInput.parentElement;
      if (parent) {
        const btnContainer = document.createElement('div');
        btnContainer.id = 'rs-btn-tags-inject';
        btnContainer.style.display = 'flex';
        btnContainer.style.alignItems = 'center';
        btnContainer.style.gap = '8px';
        btnContainer.style.margin = '4px 0';

        const btn = document.createElement('button');
        btn.className = 'rs-ai-btn';
        btn.innerHTML = `🏷️ AI Generate Tags`;
        btn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          executeAutoGeneration('tags', btn);
        };
        btnContainer.appendChild(btn);
        parent.parentElement?.insertBefore(btnContainer, parent);
      }
    }

    // 3. Inject Floating Quick Bar (ALWAYS ACTIVE ON FACEBOOK)
    if (!document.getElementById('rs-floating-widget')) {
      const widget = document.createElement('div');
      widget.id = 'rs-floating-widget';
      widget.className = 'rs-floating-widget';
      widget.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 3px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="rs-title">Viral Video AI Studio</span>
            <span class="rs-badge">3.0 PRO</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <select id="rs-float-preset-select" class="rs-preset-select-dropdown" style="background:#1E1B4B; border:1px solid #7C3AED; border-radius:6px; color:#DDD6FE; font-size:10px; font-weight:bold; padding:2px 4px; outline:none; cursor:pointer; max-width:130px;"></select>
            <button id="rs-float-manage-btn" style="background:transparent; border:none; cursor:pointer; font-size:11px; padding:0;" title="Manage Page Presets">⚙️</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button id="rs-btn-all" class="rs-ai-btn" style="padding: 7px 12px; font-size: 12px; font-weight: bold;">
            ✨ Auto-Fill Title & Tags
          </button>
          <button id="rs-btn-float-pin" class="rs-pin-btn" style="padding: 7px 10px; font-size: 11px;" title="Copy First Pin-Comment to 3x Comments & Reach">
            💬 Pin
          </button>
        </div>
      `;

      document.body.appendChild(widget);

      const allBtn = widget.querySelector<HTMLButtonElement>('#rs-btn-all');
      if (allBtn) {
        allBtn.onclick = (e) => {
          e.preventDefault();
          executeAutoGeneration('all', allBtn);
        };
      }

      const floatPinBtn = widget.querySelector<HTMLButtonElement>('#rs-btn-float-pin');
      if (floatPinBtn) {
        floatPinBtn.onclick = (e) => {
          e.preventDefault();
          copyCurrentPinComment();
        };
      }

      const floatSel = widget.querySelector<HTMLSelectElement>('#rs-float-preset-select');
      if (floatSel) {
        floatSel.onchange = (e) => {
          setActivePreset((e.target as HTMLSelectElement).value);
        };
      }

      const floatManageBtn = widget.querySelector<HTMLButtonElement>('#rs-float-manage-btn');
      if (floatManageBtn) {
        floatManageBtn.onclick = (e) => {
          e.preventDefault();
          openPresetModal();
        };
      }

      updatePresetDropdowns();
    }
  }

  // Load presets on startup
  fetchPresets().then(() => {
    checkAndInjectButtons();
  });

  // Run periodic/mutation checks for dynamic Facebook SPAs
  const observer = new MutationObserver(() => {
    autoMatchPresetWithPage();
    checkAndInjectButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
