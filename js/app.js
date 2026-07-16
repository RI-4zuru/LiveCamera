const DATA_ROOT = './data';
const Leaflet = window.L;
const NARA_RIVER_SOURCE = 'naraPrefectureRiver';
const NARA_RIVER_INTERVAL_MS = 10 * 60 * 1000;
const NARA_RIVER_MAX_FALLBACKS = 6;
const JAPANESE_COLLATOR = new Intl.Collator('ja-JP', { numeric: true, sensitivity: 'base' });
const VISIBILITY_IMAGE_MODE_KEY = 'national-live-camera:visibility-image-mode:v1';
const MAP_VISIBILITY_KEY = 'national-live-camera:map-visible:v1';
const GRID_COLUMNS_KEY = 'national-live-camera:grid-columns:v1';
const COMPARE_GRID_COLUMNS_KEY = 'national-live-camera:compare-grid-columns:v1';
const COMPARE_MODE_KEY = 'national-live-camera:compare-mode:v1';
const PRIMARY_PREFECTURE_KEY = 'national-live-camera:primary-prefecture:v1';
const COMPARE_PREFECTURE_KEY = 'national-live-camera:compare-prefecture:v1';
const YOUTUBE_LIVE_REFRESH_MS = 5 * 60 * 1000;
const YOUTUBE_LIVE_PROBE_TIMEOUT_MS = 8000;
const MOBILE_MEDIA_QUERY = '(max-width: 620px)';
const MOBILE_GRID_COLUMNS_KEY = 'national-live-camera:mobile-grid-columns:v1';
const CUSTOM_SLOTS_KEY = 'national-live-camera:custom-slots:v1';
const CUSTOM_DRAFT_KEY = 'national-live-camera:custom-draft:v1';
const CUSTOM_ACTIVE_SLOT_KEY = 'national-live-camera:custom-active-slot:v1';

const elements = {
  pageSubtitle: document.querySelector('#pageSubtitle'),
  summaryBar: document.querySelector('#summaryBar'),
  summaryToggleButton: document.querySelector('#summaryToggleButton'),
  prefectureName: document.querySelector('#prefectureName'),
  prefectureSelectionSummary: document.querySelector('#prefectureSelectionSummary'),
  primaryPrefectureSummaryButton: document.querySelector('#primaryPrefectureSummaryButton'),
  secondaryPrefectureSummaryButton: document.querySelector('#secondaryPrefectureSummaryButton'),
  primaryPrefectureName: document.querySelector('#primaryPrefectureName'),
  secondaryPrefectureName: document.querySelector('#secondaryPrefectureName'),
  panelPrimaryPrefectureName: document.querySelector('#panelPrimaryPrefectureName'),
  panelSecondaryPrefectureName: document.querySelector('#panelSecondaryPrefectureName'),
  primaryPrefectureTarget: document.querySelector('#primaryPrefectureTarget'),
  secondaryPrefectureTarget: document.querySelector('#secondaryPrefectureTarget'),
  youtubeToggle: document.querySelector('#youtubeToggle'),
  youtubeToggleLabel: document.querySelector('#youtubeToggleLabel'),
  content: document.querySelector('#content'),
  status: document.querySelector('#statusMessage'),
  areaSelect: document.querySelector('#areaSelect'),
  cameraSearch: document.querySelector('#cameraSearch'),
  refreshButton: document.querySelector('#refreshButton'),
  resetMapButton: document.querySelector('#resetMapButton'),
  clock: document.querySelector('#clock'),
  countdown: document.querySelector('#countdown'),
  scrollSpeedSelect: document.querySelector('#scrollSpeedSelect'),
  prefecturePanel: document.querySelector('#prefecturePanel'),
  prefectureMenuButton: document.querySelector('#prefectureMenuButton'),
  prefectureMenuClose: document.querySelector('#prefectureMenuClose'),
  visibilityPanel: document.querySelector('#visibilityPanel'),
  visibilityEditButton: document.querySelector('#visibilityEditButton'),
  visibilityPanelClose: document.querySelector('#visibilityPanelClose'),
  visibilityPrefectureSwitcher: document.querySelector('#visibilityPrefectureSwitcher'),
  visibilityPrimaryPrefectureButton: document.querySelector('#visibilityPrimaryPrefectureButton'),
  visibilitySecondaryPrefectureButton: document.querySelector('#visibilitySecondaryPrefectureButton'),
  visibilityPrimaryPrefectureName: document.querySelector('#visibilityPrimaryPrefectureName'),
  visibilitySecondaryPrefectureName: document.querySelector('#visibilitySecondaryPrefectureName'),
  visibilitySearch: document.querySelector('#visibilitySearch'),
  visibilityImageMode: document.querySelector('#visibilityImageMode'),
  visibilityList: document.querySelector('#visibilityList'),
  showAllCamerasButton: document.querySelector('#showAllCamerasButton'),
  visibilitySettingsTab: document.querySelector('#visibilitySettingsTab'),
  hiddenImagesTab: document.querySelector('#hiddenImagesTab'),
  visibilitySettingsPane: document.querySelector('#visibilitySettingsPane'),
  hiddenImagesPane: document.querySelector('#hiddenImagesPane'),
  hiddenImageCount: document.querySelector('#hiddenImageCount'),
  hiddenImageList: document.querySelector('#hiddenImageList'),
  refreshHiddenImagesButton: document.querySelector('#refreshHiddenImagesButton'),
  panelBackdrop: document.querySelector('#panelBackdrop'),
  prefectureNavigation: document.querySelector('#prefectureNavigation'),
  viewer: document.querySelector('#viewer'),
  viewerImage: document.querySelector('#viewerImage'),
  viewerCaption: document.querySelector('#viewerCaption'),
  viewerClose: document.querySelector('#viewerClose'),
  youtubeViewer: document.querySelector('#youtubeViewer'),
  youtubeGalleryList: document.querySelector('#youtubeGalleryList'),
  youtubeViewerClose: document.querySelector('#youtubeViewerClose'),
  stickyStack: document.querySelector('#stickyStack'),
  layout: document.querySelector('.layout'),
  mapWrap: document.querySelector('#mapWrap'),
  mapToggleButton: document.querySelector('#mapToggleButton'),
  mapContainer: document.querySelector('#map'),
  mapHint: document.querySelector('#mapHint'),
  areaControl: document.querySelector('#areaControl'),
  gridColumnControl: document.querySelector('#gridColumnControl'),
  gridColumnSelect: document.querySelector('#gridColumnSelect'),
  comparisonToggleButton: document.querySelector('#comparisonToggleButton'),
  customModeButton: document.querySelector('#customModeButton'),
  customPanel: document.querySelector('#customPanel'),
  customPanelClose: document.querySelector('#customPanelClose'),
  customSlotSelect: document.querySelector('#customSlotSelect'),
  customSlotName: document.querySelector('#customSlotName'),
  customLoadSlotButton: document.querySelector('#customLoadSlotButton'),
  customSaveNewButton: document.querySelector('#customSaveNewButton'),
  customOverwriteButton: document.querySelector('#customOverwriteButton'),
  customRenameButton: document.querySelector('#customRenameButton'),
  customDeleteButton: document.querySelector('#customDeleteButton'),
  customPrefectureFilter: document.querySelector('#customPrefectureFilter'),
  customCameraSearch: document.querySelector('#customCameraSearch'),
  customSelectedCount: document.querySelector('#customSelectedCount'),
  customClearSelectionButton: document.querySelector('#customClearSelectionButton'),
  customCameraList: document.querySelector('#customCameraList'),
  customNormalViewButton: document.querySelector('#customNormalViewButton'),
  customApplyButton: document.querySelector('#customApplyButton')
};

const state = {
  prefectures: null,
  prefecture: null,
  area: 'all',
  search: '',
  visibilitySearch: '',
  showYoutube: false,
  hiddenCameraIds: new Set(),
  map: null,
  tileLayer: null,
  markers: new Map(),
  markerLayer: null,
  selectedCameraId: null,
  scrollSpeed: 0,
  scrollFrame: null,
  scrollReturnTimer: null,
  previousScrollTime: 0,
  scrollRemainder: 0,
  visibilityTab: 'settings',
  countdownTimer: null,
  stickyObserver: null,
  mapResizeObserver: null,
  mapRefreshFrame: null,
  mapRefreshTimers: [],
  summaryBarVisible: true,
  visibilityImagesVisible: true,
  mapVisible: true,
  gridColumns: 4,
  comparisonGridColumns: 6,
  mobileGridColumns: 2,
  isMobile: false,
  compareMode: false,
  singleViewSlot: 'primary',
  secondaryPrefecture: null,
  secondaryHiddenCameraIds: new Set(),
  secondaryPrefectureId: null,
  prefectureTargetSlot: 'primary',
  visibilityPrefectureSlot: 'primary',
  liveYoutubeIds: new Set(),
  youtubeStatusReady: false,
  youtubeStatusTimer: null,
  customMode: false,
  customSelection: [],
  customSlots: [],
  customActiveSlotId: null,
  customPrefectureData: new Map(),
  customSearch: '',
  customPrefectureFilter: 'all'
};

init().catch((error) => {
  console.error(error);
  showStatus('データまたは地図を読み込めませんでした。GitHub Pages上で再読み込みしてください。');
});

async function init() {
  if (!Leaflet) throw new Error('Leafletを読み込めませんでした。');
  bindEvents();
  initializeSummaryBar();
  initializeDisplayPreferences();
  setupStickyStackObserver();
  state.prefectures = await fetchJson(`${DATA_ROOT}/prefectures.json`);
  initializeCustomStorage();
  renderPrefectureNavigation();
  updatePrefectureSelectionUI();

  const requested = new URLSearchParams(location.search).get('pref');
  const savedPrimary = localStorage.getItem(PRIMARY_PREFECTURE_KEY);
  const prefectureId = findEnabledPrefecture(requested)
    ? requested
    : findEnabledPrefecture(savedPrimary)
      ? savedPrimary
      : state.prefectures.defaultPrefecture;

  await loadPrefecture(prefectureId);
  startClock();
  startYoutubeLivePolling();
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function findEnabledPrefecture(id) {
  return state.prefectures.regions
    .flatMap((region) => region.prefectures)
    .find((prefecture) => prefecture.id === id && prefecture.enabled);
}


function customCameraKey(prefectureId, cameraId) {
  return `${prefectureId}::${cameraId}`;
}

function initializeCustomStorage() {
  try {
    const slots = JSON.parse(localStorage.getItem(CUSTOM_SLOTS_KEY) || '[]');
    state.customSlots = Array.isArray(slots)
      ? slots.filter((slot) => slot && typeof slot.id === 'string' && typeof slot.name === 'string' && Array.isArray(slot.cameras))
      : [];
  } catch (error) {
    console.warn('カスタム保存スロットを読み込めませんでした。', error);
    state.customSlots = [];
  }

  try {
    const draft = JSON.parse(localStorage.getItem(CUSTOM_DRAFT_KEY) || '[]');
    state.customSelection = Array.isArray(draft) ? [...new Set(draft.filter((key) => typeof key === 'string'))] : [];
  } catch {
    state.customSelection = [];
  }
  state.customActiveSlotId = localStorage.getItem(CUSTOM_ACTIVE_SLOT_KEY) || null;
}

function persistCustomSlots() {
  localStorage.setItem(CUSTOM_SLOTS_KEY, JSON.stringify(state.customSlots));
}

function persistCustomSelection() {
  localStorage.setItem(CUSTOM_DRAFT_KEY, JSON.stringify(state.customSelection));
}

function createCustomSlotId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureCustomPrefectureData() {
  const tasks = enabledPrefectures().map(async (prefectureInfo) => {
    if (state.customPrefectureData.has(prefectureInfo.id)) return;
    let data = null;
    if (state.prefecture?.id === prefectureInfo.id) data = state.prefecture;
    else if (state.secondaryPrefecture?.id === prefectureInfo.id) data = state.secondaryPrefecture;
    else data = await fetchJson(`${DATA_ROOT}/cameras/${prefectureInfo.id}.json`);
    state.customPrefectureData.set(prefectureInfo.id, data);
  });
  await Promise.all(tasks);
}

function allCustomCameraEntries() {
  const entries = [];
  for (const prefectureInfo of enabledPrefectures()) {
    const prefecture = state.customPrefectureData.get(prefectureInfo.id);
    if (!prefecture) continue;
    const sorted = prefecture.cameras
      .filter((camera) => cameraMediaType(camera) === 'image')
      .sort(compareCamerasForPrefecture(prefecture));
    for (const camera of sorted) {
      entries.push({
        key: customCameraKey(prefecture.id, camera.id),
        prefecture,
        camera,
        area: prefecture.areas.find((area) => area.id === camera.area) || { id: camera.area, name: '', color: 'grey' }
      });
    }
  }
  return entries;
}

function selectedCustomEntries() {
  const byKey = new Map(allCustomCameraEntries().map((entry) => [entry.key, entry]));
  return state.customSelection.map((key) => byKey.get(key)).filter(Boolean);
}

function updateCustomSlotControls() {
  if (!elements.customSlotSelect) return;
  const options = [new Option('保存スロットを選択', '')];
  for (const slot of state.customSlots) options.push(new Option(slot.name, slot.id));
  elements.customSlotSelect.replaceChildren(...options);
  const activeExists = state.customSlots.some((slot) => slot.id === state.customActiveSlotId);
  elements.customSlotSelect.value = activeExists ? state.customActiveSlotId : '';
  const active = state.customSlots.find((slot) => slot.id === elements.customSlotSelect.value);
  if (active && elements.customSlotName) elements.customSlotName.value = active.name;
  const hasActive = Boolean(active);
  for (const button of [elements.customLoadSlotButton, elements.customOverwriteButton, elements.customRenameButton, elements.customDeleteButton]) {
    if (button) button.disabled = !hasActive;
  }
}

function updateCustomSelectedCount() {
  if (elements.customSelectedCount) elements.customSelectedCount.textContent = String(state.customSelection.length);
}

async function renderCustomCameraEditor() {
  await ensureCustomPrefectureData();
  updateCustomSlotControls();
  updateCustomSelectedCount();

  if (elements.customPrefectureFilter) {
    const current = state.customPrefectureFilter;
    const options = [new Option('すべて', 'all')];
    for (const prefectureInfo of enabledPrefectures()) options.push(new Option(prefectureInfo.name, prefectureInfo.id));
    elements.customPrefectureFilter.replaceChildren(...options);
    elements.customPrefectureFilter.value = options.some((option) => option.value === current) ? current : 'all';
  }

  const selected = new Set(state.customSelection);
  const keyword = normalizeText(state.customSearch);
  const entries = allCustomCameraEntries().filter((entry) => {
    if (state.customPrefectureFilter !== 'all' && entry.prefecture.id !== state.customPrefectureFilter) return false;
    if (!keyword) return true;
    return normalizeText(`${entry.prefecture.name} ${entry.camera.city} ${stripTerrainPrefix(entry.camera.place)} ${entry.camera.provider || ''}`).includes(keyword);
  });
  const fragment = document.createDocumentFragment();

  for (const entry of entries) {
    const label = document.createElement('label');
    label.className = 'customCameraOption';
    label.classList.toggle('is-selected', selected.has(entry.key));

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selected.has(entry.key);
    checkbox.value = entry.key;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!state.customSelection.includes(entry.key)) state.customSelection.push(entry.key);
      } else {
        state.customSelection = state.customSelection.filter((key) => key !== entry.key);
      }
      label.classList.toggle('is-selected', checkbox.checked);
      persistCustomSelection();
      updateCustomSelectedCount();
    });

    const media = document.createElement('div');
    media.className = 'customCameraPreview';
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = `${entry.prefecture.name} ${entry.camera.city} ${stripTerrainPrefix(entry.camera.place)}`;
    setCameraImageSource(image, entry.camera, 0);
    image.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openViewer(entry.camera, image.currentSrc || image.src);
    });
    image.addEventListener('error', () => handleCameraImageError(image, media, entry.camera));
    const imageError = document.createElement('span');
    imageError.textContent = '画像取得不可';
    media.append(image, imageError);

    const text = document.createElement('span');
    text.className = 'customCameraText';
    const prefecture = document.createElement('small');
    prefecture.textContent = entry.prefecture.name;
    const city = document.createElement('strong');
    city.textContent = municipalityName(entry.camera.city);
    const place = document.createElement('span');
    place.textContent = stripTerrainPrefix(entry.camera.place);
    text.append(prefecture, city, place);

    label.append(checkbox, media, text);
    fragment.appendChild(label);
  }

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = '条件に一致する静止画カメラはありません。';
    fragment.appendChild(empty);
  }
  elements.customCameraList.replaceChildren(fragment);
}

async function openCustomPanel() {
  closePrefecturePanel(false);
  closeVisibilityPanel(false);
  showStatus('カスタム用のカメラデータを読み込んでいます。');
  try {
    await renderCustomCameraEditor();
    hideStatus();
  } catch (error) {
    console.error(error);
    showStatus('カスタム用データを読み込めませんでした。');
  }
  elements.customPanel.classList.add('open');
  elements.customPanel.setAttribute('aria-hidden', 'false');
  elements.customModeButton.setAttribute('aria-expanded', 'true');
  elements.panelBackdrop.hidden = false;
  stopAutoScroll();
}

function closeCustomPanel(updateBackdrop = true) {
  elements.customPanel.classList.remove('open');
  elements.customPanel.setAttribute('aria-hidden', 'true');
  elements.customModeButton.setAttribute('aria-expanded', 'false');
  if (updateBackdrop) updatePanelBackdrop();
}

function selectedCustomSlot() {
  return state.customSlots.find((slot) => slot.id === elements.customSlotSelect?.value) || null;
}

function customSlotNameValue() {
  return elements.customSlotName?.value.trim() || '';
}

function saveCustomSlotAsNew() {
  if (!state.customSelection.length) {
    showStatus('保存するカメラを1件以上選択してください。');
    return;
  }
  const name = customSlotNameValue() || `カスタム ${state.customSlots.length + 1}`;
  const slot = { id: createCustomSlotId(), name, cameras: [...state.customSelection], updatedAt: new Date().toISOString() };
  state.customSlots.push(slot);
  state.customActiveSlotId = slot.id;
  localStorage.setItem(CUSTOM_ACTIVE_SLOT_KEY, slot.id);
  persistCustomSlots();
  updateCustomSlotControls();
  showStatus(`「${name}」を保存しました。`);
}

function overwriteCustomSlot() {
  const slot = selectedCustomSlot();
  if (!slot) return;
  if (!state.customSelection.length) {
    showStatus('上書きするカメラを1件以上選択してください。');
    return;
  }
  slot.cameras = [...state.customSelection];
  slot.updatedAt = new Date().toISOString();
  persistCustomSlots();
  showStatus(`「${slot.name}」を上書きしました。`);
}

function renameCustomSlot() {
  const slot = selectedCustomSlot();
  const name = customSlotNameValue();
  if (!slot || !name) {
    showStatus('変更後のスロット名を入力してください。');
    return;
  }
  slot.name = name;
  slot.updatedAt = new Date().toISOString();
  persistCustomSlots();
  updateCustomSlotControls();
  showStatus(`スロット名を「${name}」へ変更しました。`);
}

function deleteCustomSlot() {
  const slot = selectedCustomSlot();
  if (!slot || !window.confirm(`「${slot.name}」を削除しますか？`)) return;
  state.customSlots = state.customSlots.filter((item) => item.id !== slot.id);
  if (state.customActiveSlotId === slot.id) {
    state.customActiveSlotId = null;
    localStorage.removeItem(CUSTOM_ACTIVE_SLOT_KEY);
  }
  persistCustomSlots();
  if (elements.customSlotName) elements.customSlotName.value = '';
  updateCustomSlotControls();
  showStatus(`「${slot.name}」を削除しました。`);
}

async function loadCustomSlot() {
  const slot = selectedCustomSlot();
  if (!slot) return;
  await ensureCustomPrefectureData();
  const valid = new Set(allCustomCameraEntries().map((entry) => entry.key));
  state.customSelection = slot.cameras.filter((key) => valid.has(key));
  state.customActiveSlotId = slot.id;
  localStorage.setItem(CUSTOM_ACTIVE_SLOT_KEY, slot.id);
  persistCustomSelection();
  await renderCustomCameraEditor();
  showStatus(`「${slot.name}」を読み込みました。`);
  await applyCustomSelection();
}

async function applyCustomSelection() {
  await ensureCustomPrefectureData();
  const valid = new Set(allCustomCameraEntries().map((entry) => entry.key));
  state.customSelection = state.customSelection.filter((key) => valid.has(key));
  if (!state.customSelection.length) {
    showStatus('表示するカメラを1件以上選択してください。');
    return;
  }
  persistCustomSelection();
  state.customMode = true;
  state.compareMode = false;
  localStorage.setItem(COMPARE_MODE_KEY, 'false');
  state.area = 'all';
  state.search = '';
  elements.cameraSearch.value = '';
  closeCustomPanel();
  updateComparisonControls();
  updatePageMeta();
  initializeOrResetMap();
  renderCameras();
  hideStatus();
}

function exitCustomMode() {
  if (!state.customMode) {
    closeCustomPanel();
    return;
  }
  state.customMode = false;
  closeCustomPanel();
  renderAreaSelect();
  updateComparisonControls();
  updatePageMeta();
  initializeOrResetMap();
  renderCameras();
}

function singleViewContext() {
  const useSecondary = !state.compareMode
    && state.singleViewSlot === 'secondary'
    && state.secondaryPrefecture;
  return useSecondary
    ? { slot: 'secondary', prefecture: state.secondaryPrefecture, hiddenIds: state.secondaryHiddenCameraIds }
    : { slot: 'primary', prefecture: state.prefecture, hiddenIds: state.hiddenCameraIds };
}

function displayedPrefecture() {
  return singleViewContext().prefecture;
}

function displayedHiddenCameraIds() {
  return singleViewContext().hiddenIds;
}

async function loadPrefecture(prefectureId) {
  showStatus('ライブカメラデータを読み込んでいます。');
  const data = await fetchJson(`${DATA_ROOT}/cameras/${prefectureId}.json`);

  state.prefecture = data;
  state.area = 'all';
  state.search = '';
  state.visibilitySearch = '';
  state.visibilityTab = 'settings';
  state.visibilityPrefectureSlot = 'primary';
  state.singleViewSlot = 'primary';
  state.customMode = false;
  state.showYoutube = false;
  state.selectedCameraId = null;
  state.hiddenCameraIds = loadHiddenCameraIds(prefectureId, data.cameras);
  elements.youtubeViewer.classList.remove('open');
  elements.youtubeViewer.setAttribute('aria-hidden', 'true');
  updateBodyScrollLock();

  elements.cameraSearch.value = '';
  elements.visibilitySearch.value = '';

  await ensureSecondaryPrefecture(prefectureId);

  updatePageMeta();
  updateYoutubeToggle();
  renderAreaSelect();
  updateComparisonControls();
  initializeOrResetMap();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  setVisibilityTab('settings');
  highlightNavigation();
  hideStatus();

  const url = new URL(location.href);
  url.searchParams.set('pref', prefectureId);
  history.replaceState(null, '', url);
  localStorage.setItem(PRIMARY_PREFECTURE_KEY, prefectureId);
  closeAllSidePanels();

  refreshYoutubeLiveStatus();
}

function updatePageMeta() {
  const prefectures = activePrefectures();
  const displayed = displayedPrefecture();
  const hasYoutube = !state.customMode && prefectures.some((prefecture) =>
    prefecture?.cameras.some((camera) => cameraMediaType(camera) === 'youtube' && isYoutubeCurrentlyLive(camera))
  );
  const titleName = state.customMode
    ? 'カスタム'
    : state.compareMode && state.secondaryPrefecture
      ? `${state.prefecture.name}・${state.secondaryPrefecture.name}`
      : displayed?.name || '全国';
  document.title = `${titleName}ライブカメラ｜全国ライブカメラ`;
  elements.pageSubtitle.textContent = state.customMode
    ? `選択した${state.customSelection.length}地点をカスタム表示`
    : state.compareMode && state.secondaryPrefecture
      ? `${state.prefecture.name}と${state.secondaryPrefecture.name}を比較表示`
      : displayed ? `${displayed.region}地方・${displayed.name}` : 'データを読み込み中...';
  elements.prefectureName.textContent = state.customMode
    ? 'カスタム'
    : state.compareMode && state.secondaryPrefecture
      ? `${state.prefecture.name} × ${state.secondaryPrefecture.name}`
      : displayed?.name || '-';
  updatePrefectureSelectionUI();
  elements.youtubeToggle.hidden = !hasYoutube;
  if (elements.areaControl) elements.areaControl.hidden = state.compareMode || state.customMode;
  if (elements.visibilityEditButton) elements.visibilityEditButton.hidden = state.customMode;
  if (elements.customModeButton) {
    elements.customModeButton.classList.toggle('is-active', state.customMode);
    elements.customModeButton.textContent = state.customMode ? 'カスタム中' : 'カスタム';
  }
  updateResponsiveControls();
}

function updateYoutubeToggle() {
  elements.youtubeToggle.setAttribute('aria-pressed', String(state.showYoutube));
  elements.youtubeToggle.classList.toggle('is-active', state.showYoutube);
  elements.youtubeToggleLabel.textContent = 'YouTube';
  elements.youtubeToggle.title = state.showYoutube
    ? 'YouTubeライブカメラを非表示にします'
    : 'YouTubeライブカメラを表示します';
}

function renderPrefectureNavigation() {
  const fragment = document.createDocumentFragment();

  for (const region of state.prefectures.regions) {
    const section = document.createElement('section');
    section.className = 'regionGroup';

    const heading = document.createElement('h2');
    heading.textContent = region.name;

    const list = document.createElement('div');
    list.className = 'prefectureList';

    for (const prefecture of region.prefectures) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'prefectureButton';
      button.dataset.prefectureId = prefecture.id;

      const name = document.createElement('span');
      name.className = 'prefectureButtonName';
      name.textContent = prefecture.name;

      const slots = document.createElement('span');
      slots.className = 'prefectureButtonSlots';
      slots.setAttribute('aria-hidden', 'true');

      button.append(name, slots);
      button.disabled = !prefecture.enabled;
      if (prefecture.enabled) {
        button.addEventListener('click', () => assignPrefectureToSlot(prefecture.id));
      }
      list.appendChild(button);
    }

    section.append(heading, list);
    fragment.appendChild(section);
  }

  elements.prefectureNavigation.replaceChildren(fragment);
  highlightNavigation();
}

function highlightNavigation() {
  document.querySelectorAll('.prefectureButton').forEach((button) => {
    const id = button.dataset.prefectureId;
    const isPrimary = id === state.prefecture?.id;
    const isSecondary = id === state.secondaryPrefectureId;
    button.classList.toggle('is-primary', isPrimary);
    button.classList.toggle('is-secondary', isSecondary);
    button.classList.toggle('active', isPrimary || isSecondary);

    const slots = button.querySelector('.prefectureButtonSlots');
    if (slots) {
      slots.textContent = `${isPrimary ? '①' : ''}${isSecondary ? '②' : ''}`;
    }
    const label = button.querySelector('.prefectureButtonName')?.textContent || '';
    if (isPrimary && isSecondary) button.setAttribute('aria-label', `${label} 第1県・第2県`);
    else if (isPrimary) button.setAttribute('aria-label', `${label} 第1県`);
    else if (isSecondary) button.setAttribute('aria-label', `${label} 第2県`);
    else button.removeAttribute('aria-label');
  });
}

function renderAreaSelect() {
  const prefecture = displayedPrefecture();
  const options = [new Option('全域', 'all')];
  for (const area of prefecture?.areas || []) {
    options.push(new Option(area.name, area.id));
  }
  elements.areaSelect.replaceChildren(...options);
  elements.areaSelect.value = 'all';
}

function initializeOrResetMap() {
  const prefecture = displayedPrefecture();
  if (!prefecture && !state.customMode) return;
  const center = state.customMode
    ? [36.2, 138.2]
    : [prefecture.center.latitude, prefecture.center.longitude];
  const zoom = state.customMode ? 5 : prefecture.zoom;

  if (!state.map) {
    state.map = Leaflet.map(elements.mapContainer, {
      zoomControl: true,
      preferCanvas: false
    }).setView(center, zoom);

    state.tileLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; OpenStreetMap contributors',
      crossOrigin: true
    }).addTo(state.map);

    state.tileLayer.on('tileerror', () => {
      elements.mapHint.textContent = '地図タイルを再取得しています';
    });
    state.tileLayer.on('load', () => {
      elements.mapHint.textContent = '画像またはピンを選択できます';
    });

    state.markerLayer = Leaflet.layerGroup().addTo(state.map);
    setupMapResizeObserver();
    state.map.whenReady(() => scheduleMapRefresh());
  } else {
    state.markerLayer.clearLayers();
    state.map.setView(center, zoom);
  }

  state.markers.clear();
  scheduleMapRefresh();
}

function initializeDisplayPreferences() {
  const savedImageMode = localStorage.getItem(VISIBILITY_IMAGE_MODE_KEY);
  state.visibilityImagesVisible = savedImageMode !== 'hide';
  if (elements.visibilityImageMode) {
    elements.visibilityImageMode.value = state.visibilityImagesVisible ? 'show' : 'hide';
  }

  state.isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  const savedMapVisibility = localStorage.getItem(MAP_VISIBILITY_KEY);
  state.mapVisible = savedMapVisibility !== 'false';
  const savedColumns = Number(localStorage.getItem(GRID_COLUMNS_KEY));
  state.gridColumns = savedColumns === 6 ? 6 : 4;
  const savedMobileColumns = Number(localStorage.getItem(MOBILE_GRID_COLUMNS_KEY));
  state.mobileGridColumns = [1, 2, 3, 4].includes(savedMobileColumns) ? savedMobileColumns : 2;
  const savedComparisonColumns = Number(localStorage.getItem(COMPARE_GRID_COLUMNS_KEY));
  state.comparisonGridColumns = [6, 8, 10].includes(savedComparisonColumns) ? savedComparisonColumns : 6;
  state.compareMode = !state.isMobile && localStorage.getItem(COMPARE_MODE_KEY) === 'true';
  state.secondaryPrefectureId = localStorage.getItem(COMPARE_PREFECTURE_KEY);
  updateMapVisibility();
  updateResponsiveControls();
}

function updateMapVisibility() {
  if (!elements.mapWrap || !elements.layout || !elements.mapToggleButton) return;
  const effectiveMapVisible = state.mapVisible && !state.compareMode;

  elements.mapWrap.hidden = !effectiveMapVisible;
  elements.layout.classList.toggle('mapHidden', !effectiveMapVisible);
  elements.layout.classList.toggle('comparisonMode', state.compareMode);
  elements.layout.classList.toggle('customMode', state.customMode);
  elements.layout.classList.toggle('gridColumns4', !state.compareMode && !state.isMobile && state.gridColumns === 4);
  elements.layout.classList.toggle('gridColumns6', !state.compareMode && !state.isMobile && state.gridColumns === 6);
  for (const columns of [1, 2, 3, 4]) {
    elements.layout.classList.toggle(`mobileColumns${columns}`, !state.compareMode && state.isMobile && state.mobileGridColumns === columns);
  }
  elements.layout.classList.toggle('comparisonColumns6', state.compareMode && state.comparisonGridColumns === 6);
  elements.layout.classList.toggle('comparisonColumns8', state.compareMode && state.comparisonGridColumns === 8);
  elements.layout.classList.toggle('comparisonColumns10', state.compareMode && state.comparisonGridColumns === 10);
  elements.mapToggleButton.hidden = state.compareMode;
  elements.mapToggleButton.classList.toggle('is-off', !state.mapVisible);
  elements.mapToggleButton.setAttribute('aria-pressed', String(state.mapVisible));
  elements.mapToggleButton.textContent = state.mapVisible ? '地図表示' : '地図非表示';
  elements.mapToggleButton.title = state.mapVisible ? '地図を非表示にします' : '地図を表示します';
  updateGridColumnControl();

  if (effectiveMapVisible) {
    window.setTimeout(() => scheduleMapRefresh(new Set(state.markers.keys())), 0);
  }
}

function updateGridColumnControl() {
  if (!elements.gridColumnControl || !elements.gridColumnSelect) return;
  const values = state.isMobile ? [1, 2, 3, 4] : state.compareMode ? [6, 8, 10] : [4, 6];
  const selected = state.isMobile
    ? state.mobileGridColumns
    : state.compareMode
      ? state.comparisonGridColumns
      : state.gridColumns;
  const currentValues = [...elements.gridColumnSelect.options].map((option) => Number(option.value));
  if (currentValues.join(',') !== values.join(',')) {
    elements.gridColumnSelect.replaceChildren(...values.map((value) => new Option(`${value}列`, String(value))));
  }
  elements.gridColumnSelect.value = String(selected);
  elements.gridColumnControl.hidden = false;
}

function updateResponsiveControls() {
  const mobile = state.isMobile;
  if (elements.comparisonToggleButton) elements.comparisonToggleButton.hidden = mobile || state.customMode;
  if (elements.secondaryPrefectureSummaryButton) elements.secondaryPrefectureSummaryButton.hidden = mobile;
  if (elements.secondaryPrefectureTarget) {
    elements.secondaryPrefectureTarget.disabled = mobile;
    elements.secondaryPrefectureTarget.closest('.prefectureTargetOption')?.toggleAttribute('hidden', mobile);
  }
  if (elements.visibilitySecondaryPrefectureButton) elements.visibilitySecondaryPrefectureButton.hidden = mobile;
  if (mobile && state.prefectureTargetSlot === 'secondary') setPrefectureTargetSlot('primary');
  updateGridColumnControl();
}

function handleResponsiveChange() {
  const mobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  if (mobile === state.isMobile) {
    updateResponsiveControls();
    return;
  }

  state.isMobile = mobile;
  if (mobile && state.compareMode) {
    state.compareMode = false;
    localStorage.setItem(COMPARE_MODE_KEY, 'false');
    state.singleViewSlot = 'primary';
    renderAreaSelect();
    initializeOrResetMap();
  }
  updateComparisonControls();
  updateResponsiveControls();
  updateMapVisibility();
  renderCameras();
}

function toggleMapVisibility() {
  if (state.compareMode) return;
  state.mapVisible = !state.mapVisible;
  localStorage.setItem(MAP_VISIBILITY_KEY, String(state.mapVisible));
  updateMapVisibility();
}

function initializeSummaryBar() {
  const mobile = window.matchMedia('(max-width: 620px)').matches;
  const saved = localStorage.getItem('liveCameraSummaryBarVisible');

  // スマートフォンでは画像領域を広く取るため初期状態を非表示にする。
  // 一度切り替えた後は、その端末での選択を保存する。
  state.summaryBarVisible = saved === null ? !mobile : saved === 'true';
  updateSummaryBarVisibility();
}

function toggleSummaryBar() {
  state.summaryBarVisible = !state.summaryBarVisible;
  localStorage.setItem('liveCameraSummaryBarVisible', String(state.summaryBarVisible));
  updateSummaryBarVisibility();
}

function updateSummaryBarVisibility() {
  if (!elements.summaryBar || !elements.summaryToggleButton) return;

  elements.summaryBar.classList.toggle('is-collapsed', !state.summaryBarVisible);
  elements.summaryToggleButton.setAttribute('aria-expanded', String(state.summaryBarVisible));
  elements.summaryToggleButton.textContent = state.summaryBarVisible ? '設定非表示' : '設定表示';
  elements.summaryToggleButton.title = state.summaryBarVisible
    ? 'エリア・YouTube・表示編集・絞り込みを隠します'
    : 'エリア・YouTube・表示編集・絞り込みを表示します';

  requestAnimationFrame(() => {
    updateStickyStackHeight();
    scheduleMapRefresh(new Set(state.markers.keys()));
  });
}

function setupStickyStackObserver() {
  updateStickyStackHeight();
  if ('ResizeObserver' in window && elements.stickyStack) {
    state.stickyObserver = new ResizeObserver(updateStickyStackHeight);
    state.stickyObserver.observe(elements.stickyStack);
  }
}

function updateStickyStackHeight() {
  if (!elements.stickyStack) return;
  const height = Math.ceil(elements.stickyStack.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--sticky-stack-height', `${height}px`);
  scheduleMapRefresh();
}

function setupMapResizeObserver() {
  if (!('ResizeObserver' in window) || state.mapResizeObserver || !elements.mapContainer) return;
  state.mapResizeObserver = new ResizeObserver(() => scheduleMapRefresh());
  state.mapResizeObserver.observe(elements.mapContainer);
}

function scheduleMapRefresh(visibleIds = null) {
  if (!state.map || !state.mapVisible) return;

  cancelAnimationFrame(state.mapRefreshFrame);
  for (const timer of state.mapRefreshTimers) clearTimeout(timer);
  state.mapRefreshTimers = [];

  state.mapRefreshFrame = requestAnimationFrame(() => {
    state.map.invalidateSize({ pan: false, animate: false });
    if (visibleIds) fitMapToVisibleMarkers(visibleIds);
  });

  for (const delay of [120, 420]) {
    state.mapRefreshTimers.push(window.setTimeout(() => {
      if (!state.map) return;
      state.map.invalidateSize({ pan: false, animate: false });
    }, delay));
  }
}

function renderCameras() {
  if (!state.prefecture || !state.markerLayer) return;
  if (state.customMode) {
    renderCustomCameras();
    return;
  }
  if (state.compareMode && state.secondaryPrefecture) {
    renderComparisonCameras();
    return;
  }

  const viewPrefecture = displayedPrefecture();
  if (!viewPrefecture) return;
  const sorter = compareCamerasForPrefecture(viewPrefecture);
  const imageCameras = filteredCameras('image').sort(sorter);
  const youtubeCameras = filteredCameras('youtube').sort(sorter);
  const fragment = document.createDocumentFragment();
  const visibleIds = new Set();

  state.markerLayer.clearLayers();
  state.markers.clear();

  for (const area of viewPrefecture.areas) {
    const areaCameras = imageCameras.filter((camera) => camera.area === area.id);
    if (!areaCameras.length) continue;

    const section = document.createElement('section');
    section.className = 'areaSection';
    section.id = `area-${area.id}`;
    section.style.setProperty('--area-color', markerCssColor(area.color));

    const areaTitle = document.createElement('h2');
    areaTitle.className = 'areaTitle';
    areaTitle.textContent = area.name;
    section.appendChild(areaTitle);

    const grid = document.createElement('div');
    grid.className = 'cameraGrid';

    let previousMunicipality = '';
    for (const camera of areaCameras) {
      const municipality = municipalityName(camera.city);
      const card = createCameraCard(camera, area);

      // エリア内は一つのグリッドを保ち、市町村順に連続して配置する。
      // 市町村が変わる最初のカードだけ印を付けるが、改行や別グリッドにはしない。
      if (municipality !== previousMunicipality) {
        card.classList.add('municipalityStart');
        card.dataset.municipality = municipality;
        previousMunicipality = municipality;
      }

      grid.appendChild(card);
      addMarker(camera, area);
      visibleIds.add(camera.id);
    }

    section.appendChild(grid);

    fragment.appendChild(section);
  }

  for (const camera of youtubeCameras) {
    const area = findArea(camera.area, viewPrefecture);
    if (!area) continue;
    addMarker(camera, area);
    visibleIds.add(camera.id);
  }

  if (!imageCameras.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = '表示条件に一致する静止画ライブカメラはありません。表示編集も確認してください。';
    fragment.appendChild(empty);
  }

  elements.content.replaceChildren(fragment);
  scheduleMapRefresh(visibleIds);
}

function renderCustomCameras() {
  state.markerLayer?.clearLayers();
  state.markers.clear();
  const keyword = normalizeText(state.search);
  const entries = selectedCustomEntries().filter((entry) => {
    if (!keyword) return true;
    return normalizeText(`${entry.prefecture.name} ${entry.camera.city} ${stripTerrainPrefix(entry.camera.place)} ${entry.camera.provider || ''}`).includes(keyword);
  });
  const visibleIds = new Set();
  const section = document.createElement('section');
  section.className = 'areaSection customCameraSection';
  section.style.setProperty('--area-color', '#7c3aed');

  const title = document.createElement('h2');
  title.className = 'areaTitle';
  title.textContent = 'カスタム表示';
  const grid = document.createElement('div');
  grid.className = 'cameraGrid';

  for (const entry of entries) {
    const card = createCameraCard(entry.camera, entry.area, {
      prefectureName: entry.prefecture.name
    });
    grid.appendChild(card);
    addMarker(entry.camera, entry.area);
    visibleIds.add(entry.camera.id);
  }
  section.append(title, grid);

  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = 'カスタム表示に選択された画像がないか、絞り込み条件に一致しません。';
    elements.content.replaceChildren(empty);
  } else {
    elements.content.replaceChildren(section);
  }
  scheduleMapRefresh(visibleIds);
}

function renderComparisonCameras() {
  state.markerLayer?.clearLayers();
  state.markers.clear();
  const shell = document.createElement('div');
  shell.className = 'comparisonShell';
  shell.append(
    createComparisonPane(state.prefecture, state.hiddenCameraIds),
    createComparisonPane(state.secondaryPrefecture, state.secondaryHiddenCameraIds)
  );
  elements.content.replaceChildren(shell);
  updateMapVisibility();
}

function createComparisonPane(prefecture, hiddenIds) {
  const pane = document.createElement('section');
  pane.className = 'comparisonPane';
  pane.dataset.prefectureId = prefecture.id;
  const heading = document.createElement('h2');
  heading.className = 'comparisonPrefectureTitle';
  heading.textContent = prefecture.name;
  pane.appendChild(heading);

  const imageCameras = filteredCamerasFor(prefecture, hiddenIds, 'image')
    .sort(compareCamerasForPrefecture(prefecture));
  for (const area of prefecture.areas) {
    const areaCameras = imageCameras.filter((camera) => camera.area === area.id);
    if (!areaCameras.length) continue;
    const section = document.createElement('section');
    section.className = 'areaSection';
    section.style.setProperty('--area-color', markerCssColor(area.color));
    const areaTitle = document.createElement('h3');
    areaTitle.className = 'areaTitle';
    areaTitle.textContent = area.name;
    const grid = document.createElement('div');
    grid.className = 'cameraGrid';
    let previousMunicipality = '';
    for (const camera of areaCameras) {
      const card = createCameraCard(camera, area, { mapFocus: false });
      const municipality = municipalityName(camera.city);
      if (municipality !== previousMunicipality) {
        card.classList.add('municipalityStart');
        previousMunicipality = municipality;
      }
      grid.appendChild(card);
    }
    section.append(areaTitle, grid);
    pane.appendChild(section);
  }
  if (!imageCameras.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = '表示できる静止画カメラがありません。';
    pane.appendChild(empty);
  }
  return pane;
}

function filteredCamerasFor(prefecture, hiddenIds, mediaType = 'image') {
  const keyword = normalizeText(state.search);
  return prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) !== mediaType || hiddenIds.has(camera.id)) return false;
    if (mediaType === 'youtube' && !isYoutubeCurrentlyLive(camera)) return false;
    if (!keyword) return true;
    return normalizeText([
      camera.city, municipalityName(camera.city), stripTerrainPrefix(camera.place),
      camera.provider, camera.riverName
    ].filter(Boolean).join(' ')).includes(keyword);
  });
}

function compareCamerasForPrefecture(prefecture) {
  const areaOrder = new Map(prefecture.areas.map((area, index) => [area.id, index]));
  return (a, b) => (areaOrder.get(a.area) ?? Number.MAX_SAFE_INTEGER)
    - (areaOrder.get(b.area) ?? Number.MAX_SAFE_INTEGER)
    || compareCamerasByMunicipality(a, b);
}

function filteredCameras(mediaType = 'image') {
  const keyword = normalizeText(state.search);
  const prefecture = displayedPrefecture();
  const hiddenIds = displayedHiddenCameraIds();
  if (!prefecture) return [];

  return prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) !== mediaType) return false;
    if (mediaType === 'youtube' && !isYoutubeCurrentlyLive(camera)) return false;
    if (hiddenIds.has(camera.id)) return false;
    if (state.area !== 'all' && camera.area !== state.area) return false;
    if (!keyword) return true;

    const searchable = [
      camera.city,
      municipalityName(camera.city),
      stripTerrainPrefix(camera.place),
      camera.provider,
      camera.riverName
    ].filter(Boolean).join(' ');

    return normalizeText(searchable).includes(keyword);
  });
}

function createCameraCard(camera, area, { mapFocus = true, prefectureName = '' } = {}) {
  const card = document.createElement('article');
  card.className = 'cameraCard';
  card.id = `camera-${camera.id}`;
  card.dataset.cameraId = camera.id;
  card.style.setProperty('--area-color', markerCssColor(area.color));

  const header = document.createElement('div');
  header.className = 'cardHeader';

  const city = document.createElement('div');
  city.className = 'city';
  city.textContent = prefectureName ? `${prefectureName}・${camera.city}` : camera.city;
  header.appendChild(city);

  const media = document.createElement('div');
  media.className = 'cameraMedia';

  const image = document.createElement('img');
  image.className = 'cameraImage';
  image.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のライブカメラ画像`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.dataset.cameraId = camera.id;
  image.dataset.liveCameraImage = 'true';

  setCameraImageSource(image, camera, 0);

  image.addEventListener('click', () => openViewer(camera, image.currentSrc || image.src));
  if (mapFocus) {
    image.addEventListener('mouseenter', () => focusCamera(camera.id, false));
    image.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
  }
  image.addEventListener('load', () => media.classList.remove('error'));
  image.addEventListener('error', () => handleCameraImageError(image, media, camera));

  const error = document.createElement('div');
  error.className = 'imageError';
  error.textContent = '画像を取得できませんでした。地点名のリンクから提供元ページを確認し、必要に応じて「表示編集」で非表示にできます。';
  media.append(image, error);

  const footer = document.createElement('div');
  footer.className = 'cardFooter';

  const link = document.createElement('a');
  link.className = 'placeLink';
  link.href = camera.pageUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = stripTerrainPrefix(camera.place);
  link.title = '提供元ページを開く';
  footer.appendChild(link);

  if (mapFocus) card.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
  card.append(header, media, footer);
  return card;
}

function setCameraImageSource(image, camera, attempt) {
  image.dataset.attempt = String(attempt);
  image.src = cameraImageUrl(camera, attempt);
}

function handleCameraImageError(image, media, camera) {
  const attempt = Number(image.dataset.attempt || 0);
  if (camera.imageSource === NARA_RIVER_SOURCE && attempt < NARA_RIVER_MAX_FALLBACKS) {
    setCameraImageSource(image, camera, attempt + 1);
    return;
  }
  media.classList.add('error');
}

function cameraImageUrl(camera, attempt = 0) {
  if (camera.imageSource === NARA_RIVER_SOURCE) {
    return naraRiverImageUrl(camera.stationId, attempt);
  }
  return cacheBustedUrl(camera.imageUrl);
}

function naraRiverImageUrl(stationId, attempt = 0) {
  const jstNow = Date.now() + 9 * 60 * 60 * 1000;
  const rounded = Math.floor(jstNow / NARA_RIVER_INTERVAL_MS) * NARA_RIVER_INTERVAL_MS;
  const target = new Date(rounded - attempt * NARA_RIVER_INTERVAL_MS);

  const year = target.getUTCFullYear();
  const month = pad2(target.getUTCMonth() + 1);
  const day = pad2(target.getUTCDate());
  const hour = pad2(target.getUTCHours());
  const minute = pad2(target.getUTCMinutes());
  const station = String(stationId).padStart(3, '0');
  const date = `${year}${month}${day}`;
  const timestamp = `${date}${hour}${minute}`;

  return `https://www.kasen.pref.nara.jp/camera/${date}/${station}/image_${station}_${timestamp}.jpg`;
}

function refreshImages() {
  document.querySelectorAll('[data-live-camera-image][data-camera-id]').forEach((image) => {
    const camera = findCameraById(image.dataset.cameraId);
    if (!camera) return;
    image.closest('.cameraMedia, .hiddenImageMedia, .visibilityPreview, .cameraMapTooltipMedia')?.classList.remove('error');
    setCameraImageSource(image, camera, 0);
  });
}

function createMarkerTooltipContent(camera, type) {
  const tooltip = document.createElement('div');
  tooltip.className = 'cameraMapTooltip';

  const city = document.createElement('span');
  city.className = 'cameraMapTooltipCity';
  city.textContent = municipalityName(camera.city);
  city.title = municipalityName(camera.city);

  const place = document.createElement('span');
  place.className = 'cameraMapTooltipPlace';
  place.textContent = stripTerrainPrefix(camera.place);
  place.title = stripTerrainPrefix(camera.place);

  const media = document.createElement('div');
  media.className = 'cameraMapTooltipMedia';

  const image = document.createElement('img');
  image.alt = `${municipalityName(camera.city)} ${stripTerrainPrefix(camera.place)}のカメラ画像`;
  image.loading = 'lazy';
  image.decoding = 'async';

  if (type === 'youtube') {
    image.src = camera.thumbnailUrl || youtubeLiveThumbnailUrl(camera.youtubeId);
  } else {
    image.dataset.cameraId = camera.id;
    image.dataset.liveCameraImage = 'true';
    setCameraImageSource(image, camera, 0);
  }

  image.addEventListener('load', () => media.classList.remove('error'));
  image.addEventListener('error', () => {
    const attempt = Number(image.dataset.attempt || 0);
    if (type !== 'youtube' && camera.imageSource === NARA_RIVER_SOURCE && attempt < NARA_RIVER_MAX_FALLBACKS) {
      setCameraImageSource(image, camera, attempt + 1);
      return;
    }
    media.classList.add('error');
  });

  const error = document.createElement('span');
  error.className = 'cameraMapTooltipError';
  error.textContent = '画像を取得できません';
  media.append(image, error);

  if (type === 'youtube') {
    const badge = document.createElement('span');
    badge.className = 'cameraMapTooltipYoutube';
    badge.textContent = 'YouTube LIVE';
    media.appendChild(badge);
  }

  tooltip.append(city, place, media);
  return tooltip;
}

function addMarker(camera, area) {
  const type = cameraMediaType(camera);
  const marker = Leaflet.marker([camera.latitude, camera.longitude], {
    icon: type === 'youtube' ? createYoutubeMarkerIcon() : createMarkerIcon(area.color),
    title: `${camera.city} ${stripTerrainPrefix(camera.place)}`,
    keyboard: true
  });

  marker.bindTooltip(createMarkerTooltipContent(camera, type), {
    className: 'cameraPreviewTooltip',
    direction: 'top',
    offset: [0, -24],
    permanent: false,
    sticky: false,
    opacity: 1
  });

  marker.on('click', () => {
    if (type === 'youtube') {
      openYoutubeGallery(camera.id);
      return;
    }

    focusCamera(camera.id, true);
    const cardImage = document.querySelector(`#camera-${CSS.escape(camera.id)} .cameraImage`);
    openViewer(camera, cardImage?.currentSrc || cardImage?.src || null);
  });

  marker.addTo(state.markerLayer);
  state.markers.set(camera.id, marker);
}

function createYoutubeMarkerIcon() {
  return Leaflet.divIcon({
    className: '',
    html: '<span class="youtubeMarker" aria-hidden="true">▶</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function createMarkerIcon(color) {
  const pinColor = markerCssColor(color);
  return Leaflet.divIcon({
    className: 'cameraMarkerWrapper',
    html: `<span class="cameraMapPin" style="--pin-color:${pinColor}" aria-hidden="true"></span>`,
    iconSize: [30, 36],
    iconAnchor: [15, 34],
    tooltipAnchor: [0, -30]
  });
}

function focusCamera(cameraId, scrollToCard) {
  const camera = findCameraById(cameraId);
  if (!camera) return;

  state.selectedCameraId = cameraId;
  document.querySelectorAll('.cameraCard.selected').forEach((card) => card.classList.remove('selected'));

  const card = document.querySelector(`#camera-${CSS.escape(cameraId)}`);
  card?.classList.add('selected');
  if (scrollToCard) card?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const marker = state.markers.get(cameraId);
  if (marker && state.map && state.mapVisible) {
    state.map.panTo(marker.getLatLng(), { animate: true, duration: 0.35 });
    marker.openTooltip();
  }
}

function releaseCameraFocus(cameraId) {
  const card = document.querySelector(`#camera-${CSS.escape(cameraId)}`);
  card?.classList.remove('selected');

  const marker = state.markers.get(cameraId);
  marker?.closeTooltip();

  if (state.selectedCameraId === cameraId) state.selectedCameraId = null;
}

function fitMapToVisibleMarkers(visibleIds = new Set(state.markers.keys())) {
  if (!state.map || !state.mapVisible) return;

  const latLngs = [...visibleIds]
    .map((id) => state.markers.get(id)?.getLatLng())
    .filter(Boolean);

  if (!latLngs.length) {
    resetMap();
  } else if (latLngs.length === 1) {
    state.map.setView(latLngs[0], 13);
  } else {
    state.map.fitBounds(Leaflet.latLngBounds(latLngs), {
      padding: [28, 28],
      maxZoom: 12,
      animate: false
    });
  }
}

function resetMap() {
  if (!state.map) return;
  if (state.customMode) {
    const markerIds = new Set(state.markers.keys());
    if (markerIds.size) fitMapToVisibleMarkers(markerIds);
    else state.map.setView([36.2, 138.2], 5, { animate: false });
    return;
  }
  const prefecture = displayedPrefecture();
  if (!prefecture) return;
  state.map.setView(
    [prefecture.center.latitude, prefecture.center.longitude],
    prefecture.zoom,
    { animate: false }
  );
  scheduleMapRefresh();
}

function startClock() {
  updateClock();
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  elements.clock.textContent = `現在時刻 ${new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now)}`;

  if (!state.prefecture) return;
  const refreshIntervals = activePrefectures().map((prefecture) => prefecture.refreshIntervalMinutes || 5);
  const intervalMinutes = refreshIntervals.length ? Math.min(...refreshIntervals) : 5;
  const intervalMs = intervalMinutes * 60 * 1000;
  const next = Math.floor(now.getTime() / intervalMs + 1) * intervalMs;
  const seconds = Math.max(0, Math.ceil((next - now.getTime()) / 1000));
  elements.countdown.textContent = `次回更新まで ${seconds}秒`;
  if (seconds === 1) setTimeout(refreshImages, 1100);
}

function openViewer(camera, sourceUrl = null) {
  if (cameraMediaType(camera) !== 'image') return;
  elements.viewerImage.src = sourceUrl || cameraImageUrl(camera, 0);
  elements.viewerImage.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}`;
  elements.viewerCaption.textContent = `${camera.city}｜${stripTerrainPrefix(camera.place)}`;
  elements.viewer.classList.add('open');
  elements.viewer.setAttribute('aria-hidden', 'false');
  updateBodyScrollLock();
  elements.viewerClose.focus();
}

function closeViewer() {
  elements.viewer.classList.remove('open');
  elements.viewer.setAttribute('aria-hidden', 'true');
  elements.viewerImage.src = '';
  updateBodyScrollLock();
}

function openYoutubeGallery(focusCameraId = null) {
  state.showYoutube = true;
  updateYoutubeToggle();
  renderCameras();
  renderYoutubeGallery(focusCameraId);
  elements.youtubeViewer.classList.add('open');
  elements.youtubeViewer.setAttribute('aria-hidden', 'false');
  updateBodyScrollLock();
  stopAutoScroll();

  window.setTimeout(() => {
    const target = focusCameraId
      ? elements.youtubeGalleryList.querySelector(`[data-camera-id="${CSS.escape(focusCameraId)}"]`)
      : null;
    target?.focus();
    if (!target) elements.youtubeViewerClose.focus();
  }, 0);
}

function closeYoutubeGallery({ keepEnabled = false } = {}) {
  elements.youtubeViewer.classList.remove('open');
  elements.youtubeViewer.setAttribute('aria-hidden', 'true');

  if (!keepEnabled && state.showYoutube) {
    state.showYoutube = false;
    updateYoutubeToggle();
    renderCameras();
  }

  updateBodyScrollLock();
}

function renderYoutubeGallery(focusCameraId = null) {
  const cameras = youtubeCamerasForCurrentView().sort(compareCamerasByMunicipality);
  const fragment = document.createDocumentFragment();

  for (const camera of cameras) {
    const link = document.createElement('a');
    link.className = 'youtubeGalleryCard';
    link.href = camera.pageUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.cameraId = camera.id;
    if (camera.id === focusCameraId) link.classList.add('is-focused');

    const media = document.createElement('div');
    media.className = 'youtubeGalleryMedia';

    const thumbnail = document.createElement('img');
    thumbnail.src = camera.thumbnailUrl || youtubeLiveThumbnailUrl(camera.youtubeId);
    thumbnail.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のYouTubeサムネイル`;
    thumbnail.loading = 'lazy';
    thumbnail.decoding = 'async';

    const play = document.createElement('span');
    play.className = 'youtubeGalleryPlay';
    play.textContent = '▶';
    play.setAttribute('aria-hidden', 'true');
    media.append(thumbnail, play);

    const text = document.createElement('div');
    text.className = 'youtubeGalleryText';

    const prefectureLabel = document.createElement('small');
    prefectureLabel.className = 'youtubeGalleryPrefecture';
    prefectureLabel.textContent = prefectureNameForCamera(camera.id);

    const city = document.createElement('strong');
    city.textContent = municipalityName(camera.city);

    const place = document.createElement('span');
    place.textContent = stripTerrainPrefix(camera.place);

    text.append(prefectureLabel, city, place);
    link.append(media, text);
    link.addEventListener('click', () => {
      window.setTimeout(() => closeYoutubeGallery({ keepEnabled: true }), 0);
    });
    fragment.appendChild(link);
  }

  if (!cameras.length) {
    const empty = document.createElement('div');
    empty.className = 'youtubeGalleryEmpty';
    empty.textContent = '現在の表示条件に一致するYouTubeライブカメラはありません。';
    fragment.appendChild(empty);
  }

  elements.youtubeGalleryList.replaceChildren(fragment);
}

function updateBodyScrollLock() {
  const shouldLock = elements.viewer.classList.contains('open')
    || elements.youtubeViewer.classList.contains('open');
  document.body.style.overflow = shouldLock ? 'hidden' : '';
}

function hiddenStorageKey(prefectureId) {
  return `national-live-camera:hidden:${prefectureId}:v1`;
}

function loadHiddenCameraIds(prefectureId, cameras) {
  try {
    const stored = JSON.parse(localStorage.getItem(hiddenStorageKey(prefectureId)) || '[]');
    if (!Array.isArray(stored)) return new Set();
    const validIds = new Set(cameras.map((camera) => camera.id));
    return new Set(stored.filter((id) => validIds.has(id)));
  } catch (error) {
    console.warn('非表示設定を読み込めませんでした。', error);
    return new Set();
  }
}

function saveHiddenCameraIdsFor(prefectureId, hiddenIds) {
  if (!prefectureId) return;
  try {
    localStorage.setItem(
      hiddenStorageKey(prefectureId),
      JSON.stringify([...hiddenIds])
    );
  } catch (error) {
    console.warn('非表示設定を保存できませんでした。', error);
  }
}

function saveHiddenCameraIds() {
  if (!state.prefecture) return;
  saveHiddenCameraIdsFor(state.prefecture.id, state.hiddenCameraIds);
}

function visibilityContext() {
  if (state.visibilityPrefectureSlot === 'secondary' && state.secondaryPrefecture) {
    return {
      slot: 'secondary',
      prefecture: state.secondaryPrefecture,
      hiddenIds: state.secondaryHiddenCameraIds
    };
  }
  return {
    slot: 'primary',
    prefecture: state.prefecture,
    hiddenIds: state.hiddenCameraIds
  };
}

function updateVisibilityPrefectureSwitcher() {
  const visible = Boolean(state.secondaryPrefecture) && !state.isMobile;
  if (elements.visibilityPrefectureSwitcher) elements.visibilityPrefectureSwitcher.hidden = !visible;
  if (!visible) state.visibilityPrefectureSlot = 'primary';

  if (elements.visibilityPrimaryPrefectureName) {
    elements.visibilityPrimaryPrefectureName.textContent = state.prefecture?.name || '-';
  }
  if (elements.visibilitySecondaryPrefectureName) {
    elements.visibilitySecondaryPrefectureName.textContent = state.secondaryPrefecture?.name || '-';
  }

  elements.visibilityPrimaryPrefectureButton?.classList.toggle(
    'is-active', state.visibilityPrefectureSlot === 'primary'
  );
  elements.visibilitySecondaryPrefectureButton?.classList.toggle(
    'is-active', state.visibilityPrefectureSlot === 'secondary'
  );
}

function setVisibilityPrefectureSlot(slot) {
  state.visibilityPrefectureSlot = slot === 'secondary' && state.secondaryPrefecture
    ? 'secondary'
    : 'primary';
  state.visibilitySearch = '';
  if (elements.visibilitySearch) elements.visibilitySearch.value = '';
  updateVisibilityPrefectureSwitcher();
  renderVisibilityEditor();
  renderHiddenImages();
}

function renderVisibilityEditor() {
  const context = visibilityContext();
  const { prefecture, hiddenIds } = context;
  if (!prefecture) return;
  updateVisibilityPrefectureSwitcher();
  if (elements.visibilityImageMode) {
    elements.visibilityImageMode.value = state.visibilityImagesVisible ? 'show' : 'hide';
  }

  const keyword = normalizeText(state.visibilitySearch);
  const cameras = prefecture.cameras
    .filter((camera) => cameraMediaType(camera) !== 'youtube' || isYoutubeCurrentlyLive(camera))
    .filter((camera) => {
      if (!keyword) return true;
      return normalizeText([
        camera.city,
        stripTerrainPrefix(camera.place),
        camera.provider,
        camera.riverName
      ].filter(Boolean).join(' ')).includes(keyword);
    })
    .sort(compareCamerasForPrefecture(prefecture));

  const fragment = document.createDocumentFragment();
  const groups = [
    ...prefecture.areas.map((area) => ({ id: area.id, name: area.name })),
    { id: 'youtube', name: 'YouTubeライブ' }
  ];

  for (const group of groups) {
    const groupCameras = cameras.filter((camera) => {
      if (group.id === 'youtube') return cameraMediaType(camera) === 'youtube';
      return cameraMediaType(camera) === 'image' && camera.area === group.id;
    });
    if (!groupCameras.length) continue;

    const heading = document.createElement('div');
    heading.className = 'visibilityGroupTitle';
    heading.textContent = group.name;
    fragment.appendChild(heading);

    for (const camera of groupCameras) {
      fragment.appendChild(createVisibilityRow(camera, context));
    }
  }

  if (!cameras.length) {
    const empty = document.createElement('div');
    empty.className = 'visibilityEmpty';
    empty.textContent = '条件に一致するカメラはありません。';
    fragment.appendChild(empty);
  }

  elements.visibilityList.replaceChildren(fragment);
  updateHiddenImageCount();
}

function createVisibilityRow(camera, context = visibilityContext()) {
  const { prefecture, hiddenIds } = context;
  const row = document.createElement('article');
  row.className = 'visibilityRow';
  row.classList.toggle('is-hidden', hiddenIds.has(camera.id));
  row.classList.toggle('has-preview', state.visibilityImagesVisible);

  if (state.visibilityImagesVisible) {
    const preview = document.createElement('div');
    preview.className = 'visibilityPreview';

    const previewImage = document.createElement('img');
    previewImage.loading = 'lazy';
    previewImage.decoding = 'async';
    previewImage.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のカメラ画像`;

    if (cameraMediaType(camera) === 'youtube') {
      previewImage.src = camera.thumbnailUrl || youtubeLiveThumbnailUrl(camera.youtubeId);
      previewImage.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(camera.pageUrl, '_blank', 'noopener,noreferrer');
      });
    } else {
      previewImage.dataset.cameraId = camera.id;
      previewImage.dataset.prefectureId = prefecture.id;
      previewImage.dataset.liveCameraImage = 'true';
      setCameraImageSource(previewImage, camera, 0);
      previewImage.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openViewer(camera, previewImage.currentSrc || previewImage.src);
      });
      previewImage.addEventListener('load', () => preview.classList.remove('error'));
      previewImage.addEventListener('error', () => handleCameraImageError(previewImage, preview, camera));
    }

    const error = document.createElement('div');
    error.className = 'imageError';
    error.textContent = '画像を取得できません';
    preview.append(previewImage, error);
    row.appendChild(preview);
  }

  const control = document.createElement('label');
  control.className = 'visibilityRowControl';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !hiddenIds.has(camera.id);
  checkbox.dataset.cameraId = camera.id;

  const name = document.createElement('div');
  name.className = 'visibilityName';

  const city = document.createElement('div');
  city.className = 'visibilityCity';
  city.textContent = camera.city;

  const place = document.createElement('div');
  place.className = 'visibilityPlace';
  place.textContent = stripTerrainPrefix(camera.place);

  name.append(city, place);
  control.append(checkbox, name);
  row.appendChild(control);

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      hiddenIds.delete(camera.id);
    } else {
      hiddenIds.add(camera.id);
    }
    saveHiddenCameraIdsFor(prefecture.id, hiddenIds);
    renderVisibilityEditor();
    renderHiddenImages();
    renderCameras();
  });

  return row;
}

function setVisibilityTab(tabName) {
  state.visibilityTab = tabName === 'hidden' ? 'hidden' : 'settings';
  const hiddenActive = state.visibilityTab === 'hidden';

  elements.visibilitySettingsTab.classList.toggle('is-active', !hiddenActive);
  elements.visibilitySettingsTab.setAttribute('aria-selected', String(!hiddenActive));
  elements.hiddenImagesTab.classList.toggle('is-active', hiddenActive);
  elements.hiddenImagesTab.setAttribute('aria-selected', String(hiddenActive));
  elements.visibilitySettingsPane.hidden = hiddenActive;
  elements.hiddenImagesPane.hidden = !hiddenActive;

  if (hiddenActive) {
    renderHiddenImages();
  } else {
    window.setTimeout(() => elements.visibilitySearch.focus(), 0);
  }
}

function updateHiddenImageCount() {
  const { prefecture, hiddenIds } = visibilityContext();
  if (!elements.hiddenImageCount || !prefecture) return;
  const count = prefecture.cameras.filter((camera) =>
    cameraMediaType(camera) === 'image' && hiddenIds.has(camera.id)
  ).length;
  elements.hiddenImageCount.textContent = String(count);
}

function renderHiddenImages() {
  const context = visibilityContext();
  const { prefecture, hiddenIds } = context;
  if (!prefecture || !elements.hiddenImageList) return;

  const cameras = prefecture.cameras
    .filter((camera) => cameraMediaType(camera) === 'image' && hiddenIds.has(camera.id))
    .sort(compareCamerasForPrefecture(prefecture));
  const fragment = document.createDocumentFragment();

  for (const camera of cameras) {
    fragment.appendChild(createHiddenImageCard(camera, context));
  }

  if (!cameras.length) {
    const empty = document.createElement('div');
    empty.className = 'hiddenImageEmpty';
    empty.textContent = '非表示にしている静止画カメラはありません。';
    fragment.appendChild(empty);
  }

  elements.hiddenImageList.replaceChildren(fragment);
  updateHiddenImageCount();
}

function createHiddenImageCard(camera, context = visibilityContext()) {
  const { prefecture, hiddenIds } = context;
  const card = document.createElement('article');
  card.className = 'hiddenImageCard';
  card.dataset.cameraId = camera.id;
  card.dataset.prefectureId = prefecture.id;

  const media = document.createElement('div');
  media.className = 'hiddenImageMedia';

  const image = document.createElement('img');
  image.className = 'hiddenCameraImage';
  image.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のライブカメラ画像`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.dataset.cameraId = camera.id;
  image.dataset.prefectureId = prefecture.id;
  image.dataset.liveCameraImage = 'true';
  setCameraImageSource(image, camera, 0);
  image.addEventListener('click', () => openViewer(camera, image.currentSrc || image.src));
  image.addEventListener('load', () => media.classList.remove('error'));
  image.addEventListener('error', () => handleCameraImageError(image, media, camera));

  const error = document.createElement('div');
  error.className = 'imageError';
  error.textContent = '現在は画像を取得できません';
  media.append(image, error);

  const text = document.createElement('div');
  text.className = 'hiddenImageText';

  const city = document.createElement('strong');
  city.textContent = municipalityName(camera.city);

  const source = document.createElement('a');
  source.href = camera.pageUrl;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = stripTerrainPrefix(camera.place);
  source.title = '提供元ページを開く';
  text.append(city, source);

  const restore = document.createElement('button');
  restore.className = 'hiddenImageRestore';
  restore.type = 'button';
  restore.textContent = '表示に戻す';
  restore.addEventListener('click', () => {
    hiddenIds.delete(camera.id);
    saveHiddenCameraIdsFor(prefecture.id, hiddenIds);
    renderVisibilityEditor();
    renderHiddenImages();
    renderCameras();
  });

  card.append(media, text, restore);
  return card;
}

function refreshHiddenImages() {
  const { prefecture } = visibilityContext();
  if (!prefecture) return;
  elements.hiddenImageList.querySelectorAll('[data-live-camera-image][data-camera-id]').forEach((image) => {
    const camera = prefecture.cameras.find((item) => item.id === image.dataset.cameraId);
    if (!camera) return;
    image.closest('.hiddenImageMedia')?.classList.remove('error');
    setCameraImageSource(image, camera, 0);
  });
}

function openPrefecturePanel() {
  closeVisibilityPanel(false);
  closeCustomPanel(false);
  elements.prefecturePanel.classList.add('open');
  elements.prefecturePanel.setAttribute('aria-hidden', 'false');
  elements.prefectureMenuButton.setAttribute('aria-expanded', 'true');
  elements.panelBackdrop.hidden = false;
  stopAutoScroll();
}

function closePrefecturePanel(updateBackdrop = true) {
  elements.prefecturePanel.classList.remove('open');
  elements.prefecturePanel.setAttribute('aria-hidden', 'true');
  elements.prefectureMenuButton.setAttribute('aria-expanded', 'false');
  if (updateBackdrop) updatePanelBackdrop();
}

function openVisibilityPanel() {
  closePrefecturePanel(false);
  closeCustomPanel(false);
  renderVisibilityEditor();
  renderHiddenImages();
  setVisibilityTab(state.visibilityTab);
  elements.visibilityPanel.classList.add('open');
  elements.visibilityPanel.setAttribute('aria-hidden', 'false');
  elements.visibilityEditButton.setAttribute('aria-expanded', 'true');
  elements.panelBackdrop.hidden = false;
  stopAutoScroll();
  if (state.visibilityTab === 'settings') {
    window.setTimeout(() => elements.visibilitySearch.focus(), 220);
  }
}

function closeVisibilityPanel(updateBackdrop = true) {
  elements.visibilityPanel.classList.remove('open');
  elements.visibilityPanel.setAttribute('aria-hidden', 'true');
  elements.visibilityEditButton.setAttribute('aria-expanded', 'false');
  if (updateBackdrop) updatePanelBackdrop();
}

function closeAllSidePanels() {
  closePrefecturePanel(false);
  closeVisibilityPanel(false);
  closeCustomPanel(false);
  elements.panelBackdrop.hidden = true;
}

function updatePanelBackdrop() {
  const anyOpen = elements.prefecturePanel.classList.contains('open')
    || elements.visibilityPanel.classList.contains('open')
    || elements.customPanel.classList.contains('open');
  elements.panelBackdrop.hidden = !anyOpen;
}

function setScrollSpeed(value) {
  state.scrollSpeed = Number(value) || 0;
  state.previousScrollTime = 0;
  state.scrollRemainder = 0;
  cancelAnimationFrame(state.scrollFrame);
  clearTimeout(state.scrollReturnTimer);
  state.scrollReturnTimer = null;

  if (state.scrollSpeed > 0) {
    state.scrollFrame = requestAnimationFrame(autoScroll);
  }
}

function autoScroll(timestamp) {
  if (state.scrollSpeed <= 0) return;

  const scroller = document.scrollingElement || document.documentElement;
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);

  if (state.previousScrollTime === 0) {
    state.previousScrollTime = timestamp;
    state.scrollFrame = requestAnimationFrame(autoScroll);
    return;
  }

  if (maxScroll <= 1) {
    state.previousScrollTime = timestamp;
    state.scrollFrame = requestAnimationFrame(autoScroll);
    return;
  }

  const elapsedSeconds = Math.min(0.12, Math.max(0, timestamp - state.previousScrollTime) / 1000);
  state.previousScrollTime = timestamp;
  state.scrollRemainder += state.scrollSpeed * elapsedSeconds;

  const movePixels = Math.floor(state.scrollRemainder);
  state.scrollRemainder -= movePixels;
  const remaining = maxScroll - scroller.scrollTop;

  if (remaining <= Math.max(2, movePixels)) {
    scroller.scrollTop = maxScroll;
    state.previousScrollTime = 0;
    state.scrollRemainder = 0;
    state.scrollReturnTimer = window.setTimeout(() => {
      state.scrollReturnTimer = null;
      if (state.scrollSpeed <= 0) return;

      scroller.scrollTop = 0;
      state.previousScrollTime = 0;
      state.scrollRemainder = 0;
      state.scrollFrame = requestAnimationFrame(autoScroll);
    }, 1000);
    return;
  }

  if (movePixels > 0) {
    scroller.scrollTop = Math.min(maxScroll, scroller.scrollTop + movePixels);
  }
  state.scrollFrame = requestAnimationFrame(autoScroll);
}

function stopAutoScroll() {
  state.scrollSpeed = 0;
  state.previousScrollTime = 0;
  state.scrollRemainder = 0;
  elements.scrollSpeedSelect.value = '0';
  cancelAnimationFrame(state.scrollFrame);
  clearTimeout(state.scrollReturnTimer);
  state.scrollReturnTimer = null;
}

function bindEvents() {
  elements.summaryToggleButton?.addEventListener('click', toggleSummaryBar);

  elements.areaSelect.addEventListener('change', (event) => {
    state.area = event.target.value;
    renderCameras();
  });

  elements.cameraSearch.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderCameras();
  });

  elements.youtubeToggle.addEventListener('click', () => {
    if (state.showYoutube) {
      closeYoutubeGallery();
    } else {
      openYoutubeGallery();
    }
  });

  elements.visibilityEditButton.addEventListener('click', openVisibilityPanel);
  elements.visibilityPanelClose.addEventListener('click', () => closeVisibilityPanel());
  elements.visibilitySettingsTab.addEventListener('click', () => setVisibilityTab('settings'));
  elements.hiddenImagesTab.addEventListener('click', () => setVisibilityTab('hidden'));
  elements.refreshHiddenImagesButton.addEventListener('click', refreshHiddenImages);
  elements.visibilitySearch.addEventListener('input', (event) => {
    state.visibilitySearch = event.target.value;
    renderVisibilityEditor();
  });
  elements.visibilityImageMode?.addEventListener('change', (event) => {
    state.visibilityImagesVisible = event.target.value === 'show';
    localStorage.setItem(VISIBILITY_IMAGE_MODE_KEY, state.visibilityImagesVisible ? 'show' : 'hide');
    renderVisibilityEditor();
  });
  elements.showAllCamerasButton.addEventListener('click', () => {
    const { prefecture, hiddenIds } = visibilityContext();
    if (!prefecture) return;
    hiddenIds.clear();
    saveHiddenCameraIdsFor(prefecture.id, hiddenIds);
    renderVisibilityEditor();
    renderHiddenImages();
    renderCameras();
  });

  elements.gridColumnSelect?.addEventListener('change', (event) => {
    const value = Number(event.target.value);
    if (state.isMobile) {
      state.mobileGridColumns = [1, 2, 3, 4].includes(value) ? value : 2;
      localStorage.setItem(MOBILE_GRID_COLUMNS_KEY, String(state.mobileGridColumns));
    } else if (state.compareMode) {
      state.comparisonGridColumns = [6, 8, 10].includes(value) ? value : 6;
      localStorage.setItem(COMPARE_GRID_COLUMNS_KEY, String(state.comparisonGridColumns));
    } else {
      state.gridColumns = value === 6 ? 6 : 4;
      localStorage.setItem(GRID_COLUMNS_KEY, String(state.gridColumns));
    }
    updateMapVisibility();
  });
  elements.comparisonToggleButton?.addEventListener('click', toggleComparisonMode);
  elements.customModeButton?.addEventListener('click', openCustomPanel);
  elements.customPanelClose?.addEventListener('click', () => closeCustomPanel());
  elements.customCameraSearch?.addEventListener('input', async (event) => {
    state.customSearch = event.target.value;
    await renderCustomCameraEditor();
  });
  elements.customPrefectureFilter?.addEventListener('change', async (event) => {
    state.customPrefectureFilter = event.target.value;
    await renderCustomCameraEditor();
  });
  elements.customSlotSelect?.addEventListener('change', () => {
    const slot = selectedCustomSlot();
    state.customActiveSlotId = slot?.id || null;
    if (slot) {
      localStorage.setItem(CUSTOM_ACTIVE_SLOT_KEY, slot.id);
      elements.customSlotName.value = slot.name;
    } else {
      localStorage.removeItem(CUSTOM_ACTIVE_SLOT_KEY);
      elements.customSlotName.value = '';
    }
    updateCustomSlotControls();
  });
  elements.customLoadSlotButton?.addEventListener('click', loadCustomSlot);
  elements.customSaveNewButton?.addEventListener('click', saveCustomSlotAsNew);
  elements.customOverwriteButton?.addEventListener('click', overwriteCustomSlot);
  elements.customRenameButton?.addEventListener('click', renameCustomSlot);
  elements.customDeleteButton?.addEventListener('click', deleteCustomSlot);
  elements.customClearSelectionButton?.addEventListener('click', async () => {
    state.customSelection = [];
    persistCustomSelection();
    await renderCustomCameraEditor();
  });
  elements.customApplyButton?.addEventListener('click', applyCustomSelection);
  elements.customNormalViewButton?.addEventListener('click', exitCustomMode);
  elements.primaryPrefectureSummaryButton?.addEventListener('click', async () => {
    if (state.compareMode) await swapComparisonPrefectures();
    else await setSingleViewSlot('primary');
  });
  elements.secondaryPrefectureSummaryButton?.addEventListener('click', async () => {
    if (state.compareMode) await swapComparisonPrefectures();
    else await setSingleViewSlot('secondary');
  });
  elements.visibilityPrimaryPrefectureButton?.addEventListener('click', () => setVisibilityPrefectureSlot('primary'));
  elements.visibilitySecondaryPrefectureButton?.addEventListener('click', () => setVisibilityPrefectureSlot('secondary'));
  elements.primaryPrefectureTarget?.addEventListener('change', () => setPrefectureTargetSlot('primary'));
  elements.secondaryPrefectureTarget?.addEventListener('change', () => setPrefectureTargetSlot('secondary'));

  elements.refreshButton.addEventListener('click', refreshImages);
  elements.mapToggleButton?.addEventListener('click', toggleMapVisibility);
  elements.resetMapButton.addEventListener('click', resetMap);
  elements.scrollSpeedSelect.addEventListener('change', (event) => setScrollSpeed(event.target.value));
  window.addEventListener('wheel', stopAutoScroll, { passive: true });
  window.addEventListener('touchstart', stopAutoScroll, { passive: true });
  window.addEventListener('resize', () => {
    handleResponsiveChange();
    updateSummaryBarVisibility();
    updateStickyStackHeight();
    scheduleMapRefresh(new Set(state.markers.keys()));
  });

  elements.prefectureMenuButton.addEventListener('click', openPrefecturePanel);
  elements.prefectureMenuClose.addEventListener('click', () => closePrefecturePanel());
  elements.panelBackdrop.addEventListener('click', closeAllSidePanels);

  elements.viewerClose.addEventListener('click', closeViewer);
  elements.viewerImage.addEventListener('click', closeViewer);
  elements.viewer.addEventListener('click', (event) => {
    if (event.target === elements.viewer) closeViewer();
  });

  elements.youtubeViewerClose.addEventListener('click', () => closeYoutubeGallery());
  elements.youtubeViewer.addEventListener('click', (event) => {
    if (event.target === elements.youtubeViewer) closeYoutubeGallery();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeViewer();
      closeYoutubeGallery();
      closeAllSidePanels();
    }
  });
}

function enabledPrefectures() {
  return state.prefectures?.regions.flatMap((region) => region.prefectures).filter((prefecture) => prefecture.enabled) || [];
}

function setPrefectureTargetSlot(slot) {
  state.prefectureTargetSlot = state.isMobile ? 'primary' : slot === 'secondary' ? 'secondary' : 'primary';
  if (elements.primaryPrefectureTarget) elements.primaryPrefectureTarget.checked = state.prefectureTargetSlot === 'primary';
  if (elements.secondaryPrefectureTarget) elements.secondaryPrefectureTarget.checked = state.prefectureTargetSlot === 'secondary';
  document.querySelectorAll('.prefectureTargetOption').forEach((label) => {
    const input = label.querySelector('input[name="prefectureTarget"]');
    label.classList.toggle('is-active', Boolean(input?.checked));
  });
}

function updatePrefectureSelectionUI() {
  const primaryName = state.prefecture?.name || '未選択';
  const secondaryName = state.secondaryPrefecture?.name || '未選択';
  if (elements.primaryPrefectureName) elements.primaryPrefectureName.textContent = primaryName;
  if (elements.secondaryPrefectureName) elements.secondaryPrefectureName.textContent = secondaryName;
  if (elements.secondaryPrefectureSummaryButton) elements.secondaryPrefectureSummaryButton.hidden = state.isMobile;
  if (elements.panelPrimaryPrefectureName) elements.panelPrimaryPrefectureName.textContent = primaryName;
  if (elements.panelSecondaryPrefectureName) elements.panelSecondaryPrefectureName.textContent = secondaryName;
  const viewingPrimary = state.compareMode || state.singleViewSlot === 'primary';
  const viewingSecondary = state.compareMode || state.singleViewSlot === 'secondary';
  elements.primaryPrefectureSummaryButton?.classList.toggle('is-viewing', viewingPrimary);
  elements.secondaryPrefectureSummaryButton?.classList.toggle('is-viewing', viewingSecondary);
  elements.primaryPrefectureSummaryButton?.setAttribute('aria-pressed', String(!state.compareMode && state.singleViewSlot === 'primary'));
  elements.secondaryPrefectureSummaryButton?.setAttribute('aria-pressed', String(!state.compareMode && state.singleViewSlot === 'secondary'));
  setPrefectureTargetSlot(state.prefectureTargetSlot);
  updateVisibilityPrefectureSwitcher();
  highlightNavigation();
}

async function assignPrefectureToSlot(prefectureId) {
  if (!findEnabledPrefecture(prefectureId)) return;

  if (state.prefectureTargetSlot === 'secondary' && !state.isMobile) {
    if (prefectureId === state.prefecture?.id) {
      showStatus('第2県には、第1県とは別の都道府県を選んでください。');
      return;
    }
    await loadSecondaryPrefecture(prefectureId);
    updatePrefectureSelectionUI();
    closePrefecturePanel();
    return;
  }

  const previousPrimaryId = state.prefecture?.id;
  if (prefectureId === previousPrimaryId) {
    closePrefecturePanel();
    return;
  }

  if (prefectureId === state.secondaryPrefectureId && previousPrimaryId) {
    state.secondaryPrefectureId = previousPrimaryId;
    localStorage.setItem(COMPARE_PREFECTURE_KEY, previousPrimaryId);
  }
  await loadPrefecture(prefectureId);
}

async function ensureSecondaryPrefecture(primaryId) {
  const enabled = enabledPrefectures();
  let target = state.secondaryPrefectureId;
  if (!enabled.some((prefecture) => prefecture.id === target && target !== primaryId)) {
    target = enabled.find((prefecture) => prefecture.id !== primaryId)?.id || primaryId;
  }
  await loadSecondaryPrefecture(target, false);
}

async function loadSecondaryPrefecture(prefectureId, rerender = true) {
  if (!prefectureId || prefectureId === state.prefecture?.id) {
    prefectureId = enabledPrefectures().find((prefecture) => prefecture.id !== state.prefecture?.id)?.id;
  }
  if (!prefectureId) return;
  state.secondaryPrefecture = await fetchJson(`${DATA_ROOT}/cameras/${prefectureId}.json`);
  state.secondaryPrefectureId = prefectureId;
  state.secondaryHiddenCameraIds = loadHiddenCameraIds(prefectureId, state.secondaryPrefecture.cameras);
  localStorage.setItem(COMPARE_PREFECTURE_KEY, prefectureId);
  updatePrefectureSelectionUI();
  updateComparisonControls();
  if (rerender) {
    if (!state.compareMode && state.singleViewSlot === 'secondary') {
      state.area = 'all';
      state.search = '';
      elements.cameraSearch.value = '';
      renderAreaSelect();
      initializeOrResetMap();
    }
    updatePageMeta();
    renderCameras();
    renderVisibilityEditor();
    renderHiddenImages();
    refreshYoutubeLiveStatus();
  }
}

async function setSingleViewSlot(slot) {
  if (state.compareMode) return;
  const wasCustomMode = state.customMode;
  if (wasCustomMode) state.customMode = false;
  const target = slot === 'secondary' ? 'secondary' : 'primary';
  if (target === 'secondary' && !state.secondaryPrefecture) {
    await ensureSecondaryPrefecture(state.prefecture?.id);
  }
  if (target === 'secondary' && !state.secondaryPrefecture) return;
  if (state.singleViewSlot === target && !wasCustomMode) {
    updatePrefectureSelectionUI();
    return;
  }

  state.singleViewSlot = target;
  state.area = 'all';
  state.search = '';
  state.visibilityPrefectureSlot = target;
  elements.cameraSearch.value = '';
  renderAreaSelect();
  updateComparisonControls();
  initializeOrResetMap();
  updatePageMeta();
  updateYoutubeToggle();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  await refreshYoutubeLiveStatus();
}

async function swapComparisonPrefectures() {
  if (!state.compareMode || !state.prefecture || !state.secondaryPrefecture) return;

  const previousPrimary = state.prefecture;
  const previousPrimaryHidden = state.hiddenCameraIds;

  state.prefecture = state.secondaryPrefecture;
  state.hiddenCameraIds = state.secondaryHiddenCameraIds;
  state.secondaryPrefecture = previousPrimary;
  state.secondaryHiddenCameraIds = previousPrimaryHidden;
  state.secondaryPrefectureId = previousPrimary.id;
  state.area = 'all';
  state.search = '';
  elements.cameraSearch.value = '';

  localStorage.setItem(PRIMARY_PREFECTURE_KEY, state.prefecture.id);
  localStorage.setItem(COMPARE_PREFECTURE_KEY, state.secondaryPrefectureId);

  const url = new URL(location.href);
  url.searchParams.set('pref', state.prefecture.id);
  history.replaceState(null, '', url);

  renderAreaSelect();
  initializeOrResetMap();
  updateComparisonControls();
  updatePageMeta();
  updateYoutubeToggle();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  refreshYoutubeLiveStatus();
}

async function toggleComparisonMode() {
  if (state.isMobile || state.customMode) return;
  state.compareMode = !state.compareMode;
  localStorage.setItem(COMPARE_MODE_KEY, String(state.compareMode));
  if (state.compareMode) await ensureSecondaryPrefecture(state.prefecture.id);
  updateComparisonControls();
  updatePageMeta();
  updateYoutubeToggle();
  updateMapVisibility();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  refreshYoutubeLiveStatus();
}

function updateComparisonControls() {
  if (!elements.comparisonToggleButton) return;
  elements.comparisonToggleButton.classList.toggle('is-active', state.compareMode);
  elements.comparisonToggleButton.setAttribute('aria-pressed', String(state.compareMode));
  elements.comparisonToggleButton.textContent = state.compareMode ? '1県表示' : '2県表示';
  if (elements.areaControl) elements.areaControl.hidden = state.compareMode || state.customMode;
  if (elements.comparisonToggleButton) elements.comparisonToggleButton.hidden = state.isMobile || state.customMode;
  updateGridColumnControl();
  updatePrefectureSelectionUI();
  updateVisibilityPrefectureSwitcher();
  updateMapVisibility();
}

function activePrefectures() {
  if (state.customMode) {
    const seen = new Set();
    const prefectures = [];
    for (const entry of selectedCustomEntries()) {
      if (seen.has(entry.prefecture.id)) continue;
      seen.add(entry.prefecture.id);
      prefectures.push(entry.prefecture);
    }
    return prefectures;
  }
  return state.compareMode && state.secondaryPrefecture
    ? [state.prefecture, state.secondaryPrefecture]
    : [displayedPrefecture()].filter(Boolean);
}

function findCameraById(cameraId) {
  for (const prefecture of activePrefectures()) {
    const camera = prefecture?.cameras.find((item) => item.id === cameraId);
    if (camera) return camera;
  }
  return null;
}

function prefectureNameForCamera(cameraId) {
  return activePrefectures().find((prefecture) => prefecture?.cameras.some((camera) => camera.id === cameraId))?.name || '';
}

function youtubeCamerasForCurrentView() {
  const keyword = normalizeText(state.search);
  const result = [];
  for (const prefecture of activePrefectures()) {
    const hiddenIds = prefecture.id === state.prefecture.id ? state.hiddenCameraIds : state.secondaryHiddenCameraIds;
    for (const camera of prefecture.cameras) {
      if (cameraMediaType(camera) !== 'youtube' || hiddenIds.has(camera.id) || !isYoutubeCurrentlyLive(camera)) continue;
      if (state.area !== 'all' && !state.compareMode && camera.area !== state.area) continue;
      const searchable = normalizeText([camera.city, camera.place, camera.provider].filter(Boolean).join(' '));
      if (!keyword || searchable.includes(keyword)) result.push(camera);
    }
  }
  return result;
}

function showStatus(message) {
  elements.status.textContent = message;
  elements.status.classList.add('visible');
}

function hideStatus() {
  elements.status.classList.remove('visible');
}

function cameraMediaType(camera) {
  return camera.mediaType === 'youtube' ? 'youtube' : 'image';
}


function municipalityName(city) {
  return String(city ?? '').replace(/(?:北部|南部|東部|西部)$/u, '').trim();
}

function compareCamerasByMunicipality(a, b) {
  return JAPANESE_COLLATOR.compare(municipalityName(a.city), municipalityName(b.city))
    || JAPANESE_COLLATOR.compare(stripTerrainPrefix(a.place), stripTerrainPrefix(b.place));
}

function compareCamerasByAreaAndMunicipality(a, b) {
  const areaOrder = new Map(state.prefecture.areas.map((area, index) => [area.id, index]));
  return (areaOrder.get(a.area) ?? Number.MAX_SAFE_INTEGER)
    - (areaOrder.get(b.area) ?? Number.MAX_SAFE_INTEGER)
    || compareCamerasByMunicipality(a, b);
}

function isYoutubeCurrentlyLive(camera) {
  return cameraMediaType(camera) === 'youtube' && state.liveYoutubeIds.has(camera.id);
}

function youtubeLiveThumbnailUrl(videoId) {
  const safeId = encodeURIComponent(videoId ?? '');
  return `https://i.ytimg.com/vi/${safeId}/hqdefault_live.jpg?_ts=${Date.now()}`;
}

function probeYoutubeCamera(camera) {
  return new Promise((resolve) => {
    if (!camera?.youtubeId) {
      resolve(false);
      return;
    }
    const image = new Image();
    let finished = false;
    const finish = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(result);
    };
    const timer = window.setTimeout(() => finish(false), YOUTUBE_LIVE_PROBE_TIMEOUT_MS);
    image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
    image.onerror = () => finish(false);
    image.src = youtubeLiveThumbnailUrl(camera.youtubeId);
  });
}

async function refreshYoutubeLiveStatus() {
  const candidates = [];
  for (const prefecture of activePrefectures()) {
    for (const camera of prefecture?.cameras || []) {
      if (cameraMediaType(camera) === 'youtube') candidates.push(camera);
    }
  }

  const results = await Promise.all(candidates.map(async (camera) => [camera.id, await probeYoutubeCamera(camera)]));
  state.liveYoutubeIds = new Set(results.filter(([, live]) => live).map(([id]) => id));
  state.youtubeStatusReady = true;
  updatePageMeta();
  updateYoutubeToggle();
  renderCameras();
  renderVisibilityEditor();
  if (state.showYoutube) renderYoutubeGallery();
}

function startYoutubeLivePolling() {
  clearInterval(state.youtubeStatusTimer);
  state.youtubeStatusTimer = window.setInterval(refreshYoutubeLiveStatus, YOUTUBE_LIVE_REFRESH_MS);
}

function youtubeThumbnailUrl(videoId) {
  const safeId = encodeURIComponent(videoId ?? '');
  return `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`;
}

function slugForId(value) {
  return encodeURIComponent(String(value ?? '')).replaceAll('%', '').toLowerCase();
}


function normalizeText(text) {
  return String(text ?? '').normalize('NFKC').toLocaleLowerCase('ja-JP').replace(/\s+/g, '');
}

function stripTerrainPrefix(place) {
  return String(place ?? '').replace(/^【[^】]+】\s*/, '').trim();
}

function cacheBustedUrl(url) {
  try {
    const parsed = new URL(url, location.href);
    parsed.searchParams.set('_ts', Date.now().toString());
    return parsed.href;
  } catch {
    return `${url}${url.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
  }
}

function findArea(areaId, prefecture = displayedPrefecture()) {
  return prefecture?.areas.find((area) => area.id === areaId);
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function markerCssColor(color) {
  const colors = {
    blue: '#2a7be4',
    green: '#2d9d61',
    violet: '#8a5de8',
    orange: '#ec8b2e',
    red: '#df4b4b',
    yellow: '#d1a500',
    grey: '#64748b',
    black: '#1f2937',
    gold: '#b7791f'
  };
  return colors[color] ?? '#64748b';
}
