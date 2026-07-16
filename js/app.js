const DATA_ROOT = './data';
const MARINE_DATA_URL = `${DATA_ROOT}/cameras/marine.json`;
const MARINE_AREA_ID = 'marine';
let marineDataPromise = null;
const Leaflet = window.L;
const NARA_RIVER_SOURCE = 'naraPrefectureRiver';
const NARA_RIVER_INTERVAL_MS = 10 * 60 * 1000;
const NARA_RIVER_MAX_FALLBACKS = 6;
const WSRV_IMAGE_PROXY = 'wsrv';
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
const COMPACT_GRID_MEDIA_QUERY = '(max-width: 1100px)';
const SINGLE_PANE_COMPARE_MEDIA_QUERY = '(max-width: 1280px)';
const MOBILE_GRID_COLUMNS_KEY = 'national-live-camera:mobile-grid-columns:v1';
const CUSTOM_SLOTS_KEY = 'national-live-camera:custom-slots:v1';
const CUSTOM_DRAFT_KEY = 'national-live-camera:custom-draft:v1';
const CUSTOM_DRAFT_ORDER_KEY = 'national-live-camera:custom-draft-order:v1';
const CUSTOM_ACTIVE_SLOT_KEY = 'national-live-camera:custom-active-slot:v1';
const PRIMARY_CUSTOM_SLOT_KEY = 'national-live-camera:primary-custom-slot:v1';
const SECONDARY_CUSTOM_SLOT_KEY = 'national-live-camera:secondary-custom-slot:v1';
const COMPACT_COMPARE_GRID_COLUMNS_KEY = 'national-live-camera:compact-compare-grid-columns:v1';
const PRIMARY_AREAS_KEY = 'national-live-camera:primary-areas:v1';
const SECONDARY_AREAS_KEY = 'national-live-camera:secondary-areas:v1';
const COMPARISON_SCROLL_MODE_KEY = 'national-live-camera:comparison-scroll-mode:v1';
const COMPARISON_SCROLL_PAUSE_MS = 1000;
const CUSTOM_PREFECTURE_THEMES = [
  { accent: '#0f766e', soft: '#ccfbf1', text: '#115e59' },
  { accent: '#c2410c', soft: '#ffedd5', text: '#9a3412' },
  { accent: '#1d4ed8', soft: '#dbeafe', text: '#1e40af' },
  { accent: '#a21caf', soft: '#fae8ff', text: '#86198f' },
  { accent: '#7c3aed', soft: '#ede9fe', text: '#5b21b6' },
  { accent: '#be123c', soft: '#ffe4e6', text: '#9f1239' },
  { accent: '#0369a1', soft: '#e0f2fe', text: '#075985' },
  { accent: '#4d7c0f', soft: '#ecfccb', text: '#3f6212' },
  { accent: '#b45309', soft: '#fef3c7', text: '#92400e' },
  { accent: '#4338ca', soft: '#e0e7ff', text: '#3730a3' },
  { accent: '#047857', soft: '#d1fae5', text: '#065f46' },
  { accent: '#b91c1c', soft: '#fee2e2', text: '#991b1b' }
];

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
  areaControls: document.querySelector('#areaControls'),
  primaryAreaControl: document.querySelector('#primaryAreaControl'),
  secondaryAreaControl: document.querySelector('#secondaryAreaControl'),
  primaryAreaLabel: document.querySelector('#primaryAreaLabel'),
  secondaryAreaLabel: document.querySelector('#secondaryAreaLabel'),
  primaryAreaSummary: document.querySelector('#primaryAreaSummary'),
  secondaryAreaSummary: document.querySelector('#secondaryAreaSummary'),
  primaryAreaOptions: document.querySelector('#primaryAreaOptions'),
  secondaryAreaOptions: document.querySelector('#secondaryAreaOptions'),
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
  prefectureCustomSlotList: document.querySelector('#prefectureCustomSlotList'),
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

  gridColumnControl: document.querySelector('#gridColumnControl'),
  gridColumnSelect: document.querySelector('#gridColumnSelect'),
  comparisonToggleButton: document.querySelector('#comparisonToggleButton'),
  comparisonScrollModeControl: document.querySelector('#comparisonScrollModeControl'),
  comparisonScrollModeSelect: document.querySelector('#comparisonScrollModeSelect'),
  customModeButton: document.querySelector('#customModeButton'),
  customReorderButton: document.querySelector('#customReorderButton'),
  customOrderResetButton: document.querySelector('#customOrderResetButton'),
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
  customSelectVisibleButton: document.querySelector('#customSelectVisibleButton'),
  customClearSelectionButton: document.querySelector('#customClearSelectionButton'),
  customCameraList: document.querySelector('#customCameraList'),
  customNormalViewButton: document.querySelector('#customNormalViewButton'),
  customApplyButton: document.querySelector('#customApplyButton')
};

const state = {
  prefectures: null,
  prefecture: null,
  area: 'all',
  primaryAreas: new Set(),
  secondaryAreas: new Set(),
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
  comparisonScrollMode: 'linked',
  paneScrollStates: new Map(),
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
  compactComparisonGridColumns: 2,
  mobileGridColumns: 2,
  isMobile: false,
  isCompactGrid: false,
  isSinglePaneComparison: false,
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
  primaryCustomSlotId: null,
  secondaryCustomSlotId: null,
  customPrefectureData: new Map(),
  customSearch: '',
  customPrefectureFilter: 'all',
  customOrderCustomized: false,
  customReorderMode: false,
  customDraggedKey: null
};

init().catch((error) => {
  console.error(error);
  showStatus('データまたは地図を読み込めませんでした。GitHub Pages上で再読み込みしてください。');
});

async function init() {
  if (!Leaflet) throw new Error('Leafletを読み込めませんでした。');
  initializeCustomSelectVisibleButton();
  initializeComparisonScrollModeControl();
  bindEvents();
  initializeSummaryBar();
  initializeDisplayPreferences();
  setupStickyStackObserver();
  state.prefectures = await fetchJson(`${DATA_ROOT}/prefectures.json`);
  initializeCustomStorage();
  renderPrefectureNavigation();
  renderPrefectureCustomSlots();
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

async function loadMarineSupplement() {
  if (!marineDataPromise) {
    marineDataPromise = fetch(MARINE_DATA_URL, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`${MARINE_DATA_URL}: HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        console.warn('海上カメラ追加データを読み込めませんでした。', error);
        return {
          area: { id: MARINE_AREA_ID, name: '海上', color: 'black' },
          prefectures: {}
        };
      });
  }
  return marineDataPromise;
}

async function applyMarineSupplement(data, url) {
  const match = /\/cameras\/([^/?#]+)\.json(?:[?#].*)?$/.exec(url);
  if (!match || match[1] === 'marine' || !data?.id) return;

  const supplement = await loadMarineSupplement();
  const marine = supplement?.prefectures?.[data.id];
  if (!marine) return;

  const moveCameraIds = Array.isArray(marine.moveCameraIds) ? marine.moveCameraIds : [];
  const extraCameras = Array.isArray(marine.cameras) ? marine.cameras : [];
  if (!moveCameraIds.length && !extraCameras.length) return;

  const areaDefinition = {
    id: MARINE_AREA_ID,
    name: '海上',
    color: 'black',
    ...(supplement.area || {})
  };

  const currentAreas = Array.isArray(data.areas) ? data.areas : [];
  const existingMarineArea = currentAreas.find((area) => area.id === MARINE_AREA_ID);

  data.areas = currentAreas.filter((area) => area.id !== MARINE_AREA_ID);
  data.areas.push({
    ...areaDefinition,
    ...(existingMarineArea || {}),
    id: MARINE_AREA_ID
  });

  if (!Array.isArray(data.cameras)) data.cameras = [];

  const moveSet = new Set(moveCameraIds);
  data.cameras.forEach((camera) => {
    if (moveSet.has(camera.id)) camera.area = MARINE_AREA_ID;
  });

  const existingIds = new Set(data.cameras.map((camera) => camera.id));
  extraCameras.forEach((camera) => {
    if (!camera?.id || existingIds.has(camera.id)) return;
    data.cameras.push({ ...camera, area: MARINE_AREA_ID });
    existingIds.add(camera.id);
  });
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const data = await response.json();
  normalizeYoutubeCameraIds(data);
  await applyMarineSupplement(data, url);
  normalizeYoutubeCameraIds(data);
  return data;
}


function initializeCustomSelectVisibleButton() {
  if (elements.customSelectVisibleButton || !elements.customClearSelectionButton) return;

  const button = document.createElement('button');
  button.id = 'customSelectVisibleButton';
  button.className = 'secondaryButton';
  button.type = 'button';
  button.textContent = '表示中を全選択';
  button.title = '都道府県と検索条件に一致して現在表示されているカメラを、まとめて選択します。';

  elements.customClearSelectionButton.parentElement?.insertBefore(button, elements.customClearSelectionButton);
  elements.customSelectVisibleButton = button;
}

function initializeComparisonScrollModeControl() {
  if (elements.comparisonScrollModeControl || !elements.summaryToggleButton) return;

  const control = document.createElement('label');
  control.id = 'comparisonScrollModeControl';
  control.className = 'compactControl comparisonScrollModeControl';
  control.hidden = true;
  control.title = '2枠表示中の自動スクロール方法を切り替えます。';

  const label = document.createElement('span');
  label.textContent = '2枠自動';

  const select = document.createElement('select');
  select.id = 'comparisonScrollModeSelect';
  select.setAttribute('aria-label', '2枠表示の自動スクロール方法');
  select.append(
    new Option('連動', 'linked'),
    new Option('独立', 'independent')
  );

  control.append(label, select);
  elements.summaryToggleButton.after(control);
  elements.comparisonScrollModeControl = control;
  elements.comparisonScrollModeSelect = select;
}

function normalizeYoutubeCameraIds(data) {
  if (!Array.isArray(data?.cameras)) return;
  for (const camera of data.cameras) {
    if (camera?.mediaType !== 'youtube' || camera.youtubeId) continue;
    camera.youtubeId = extractYoutubeVideoId(camera.pageUrl || camera.youtubeUrl || '');
  }
}

function extractYoutubeVideoId(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  try {
    const url = new URL(text, location.href);
    if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v') || '';
      const match = url.pathname.match(/^\/(?:live|embed|shorts)\/([^/?#]+)/u);
      return match?.[1] || '';
    }
  } catch {
    // URLとして解釈できない値は、YouTube IDらしい文字列だけを採用する。
  }
  return /^[A-Za-z0-9_-]{11}$/u.test(text) ? text : '';
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
      ? slots
          .filter((slot) => slot && typeof slot.id === 'string' && typeof slot.name === 'string' && Array.isArray(slot.cameras))
          .map((slot) => ({
            ...slot,
            cameras: [...new Set(slot.cameras.filter((key) => typeof key === 'string'))],
            orderCustomized: slot.orderCustomized === true
          }))
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
  state.customOrderCustomized = localStorage.getItem(CUSTOM_DRAFT_ORDER_KEY) === 'true';
  state.customActiveSlotId = localStorage.getItem(CUSTOM_ACTIVE_SLOT_KEY) || null;
  const slotIds = new Set(state.customSlots.map((slot) => slot.id));
  const primaryAssigned = localStorage.getItem(PRIMARY_CUSTOM_SLOT_KEY);
  const secondaryAssigned = localStorage.getItem(SECONDARY_CUSTOM_SLOT_KEY);
  state.primaryCustomSlotId = slotIds.has(primaryAssigned) ? primaryAssigned : null;
  state.secondaryCustomSlotId = slotIds.has(secondaryAssigned) ? secondaryAssigned : null;
  if (!state.primaryCustomSlotId) localStorage.removeItem(PRIMARY_CUSTOM_SLOT_KEY);
  if (!state.secondaryCustomSlotId) localStorage.removeItem(SECONDARY_CUSTOM_SLOT_KEY);
}

function persistCustomSlots() {
  localStorage.setItem(CUSTOM_SLOTS_KEY, JSON.stringify(state.customSlots));
}

function persistCustomSelection() {
  localStorage.setItem(CUSTOM_DRAFT_KEY, JSON.stringify(state.customSelection));
  localStorage.setItem(CUSTOM_DRAFT_ORDER_KEY, state.customOrderCustomized ? 'true' : 'false');
}

function createCustomSlotId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureCustomPrefectureData() {
  const failures = [];
  const tasks = enabledPrefectures().map(async (prefectureInfo) => {
    if (state.customPrefectureData.has(prefectureInfo.id)) return;
    try {
      let data = null;
      if (state.prefecture?.id === prefectureInfo.id) data = state.prefecture;
      else if (state.secondaryPrefecture?.id === prefectureInfo.id) data = state.secondaryPrefecture;
      else data = await fetchJson(`${DATA_ROOT}/cameras/${prefectureInfo.id}.json`);
      state.customPrefectureData.set(prefectureInfo.id, data);
    } catch (error) {
      failures.push({ prefectureInfo, error });
      console.warn(`カスタム用データを読み込めませんでした: ${prefectureInfo.name}`, error);
    }
  });
  await Promise.all(tasks);

  if (!state.customPrefectureData.size && failures.length) throw failures[0].error;
  return failures;
}

function allCustomCameraEntries() {
  const entries = [];
  for (const prefectureInfo of enabledPrefectures()) {
    const prefecture = state.customPrefectureData.get(prefectureInfo.id);
    if (!prefecture) continue;
    // JSONに登録されている元の順番を、カスタム表示の既定順として使う。
    for (const camera of prefecture.cameras) {
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

function customKeysInDefaultOrder(keys = []) {
  const selected = new Set(keys);
  return allCustomCameraEntries()
    .filter((entry) => selected.has(entry.key))
    .map((entry) => entry.key);
}

function normalizeCustomKeys(keys = [], orderCustomized = false) {
  const unique = [...new Set(keys.filter((key) => typeof key === 'string'))];
  if (orderCustomized) return unique;
  return customKeysInDefaultOrder(unique);
}

function selectedCustomEntries() {
  return customEntriesForKeys(state.customSelection, state.customOrderCustomized);
}

function customEntriesForKeys(keys = [], orderCustomized = false) {
  const entries = allCustomCameraEntries();
  const byKey = new Map(entries.map((entry) => [entry.key, entry]));
  const orderedKeys = orderCustomized ? normalizeCustomKeys(keys, true) : customKeysInDefaultOrder(keys);
  return orderedKeys.map((key) => byKey.get(key)).filter(Boolean);
}

function assignedCustomSlot(slotName) {
  const slotId = slotName === 'secondary' ? state.secondaryCustomSlotId : state.primaryCustomSlotId;
  return state.customSlots.find((slot) => slot.id === slotId) || null;
}

function customSlotEntries(slotName) {
  const slot = assignedCustomSlot(slotName);
  return slot ? customEntriesForKeys(slot.cameras, slot.orderCustomized) : [];
}

function slotSource(slotName) {
  const customSlot = assignedCustomSlot(slotName);
  if (customSlot) {
    return {
      type: 'custom',
      slotName,
      customSlot,
      name: customSlot.name,
      entries: customEntriesForKeys(customSlot.cameras, customSlot.orderCustomized)
    };
  }
  const secondary = slotName === 'secondary';
  const prefecture = secondary ? state.secondaryPrefecture : state.prefecture;
  return {
    type: 'prefecture',
    slotName,
    prefecture,
    hiddenIds: secondary ? state.secondaryHiddenCameraIds : state.hiddenCameraIds,
    name: prefecture?.name || '未選択'
  };
}

function slotLabel(slotName) {
  return assignedCustomSlot(slotName)?.name
    || (slotName === 'secondary' ? state.secondaryPrefecture?.name : state.prefecture?.name)
    || '未選択';
}

function currentSingleSource() {
  return slotSource(state.singleViewSlot === 'secondary' ? 'secondary' : 'primary');
}

function persistAssignedCustomSlots() {
  if (state.primaryCustomSlotId) localStorage.setItem(PRIMARY_CUSTOM_SLOT_KEY, state.primaryCustomSlotId);
  else localStorage.removeItem(PRIMARY_CUSTOM_SLOT_KEY);
  if (state.secondaryCustomSlotId) localStorage.setItem(SECONDARY_CUSTOM_SLOT_KEY, state.secondaryCustomSlotId);
  else localStorage.removeItem(SECONDARY_CUSTOM_SLOT_KEY);
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
  renderPrefectureCustomSlots();
}

function renderPrefectureCustomSlots() {
  if (!elements.prefectureCustomSlotList) return;
  const fragment = document.createDocumentFragment();

  if (!state.customSlots.length) {
    const empty = document.createElement('p');
    empty.className = 'prefectureCustomSlotEmpty';
    empty.textContent = '保存したカスタム設定はありません。';
    fragment.appendChild(empty);
  } else {
    for (const slot of state.customSlots) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'prefectureCustomSlotButton';
      button.dataset.slotId = slot.id;

      const name = document.createElement('strong');
      name.textContent = slot.name;
      const count = document.createElement('span');
      count.textContent = `${slot.cameras.length}地点`;
      button.append(name, count);
      const markers = `${state.primaryCustomSlotId === slot.id ? '①' : ''}${state.secondaryCustomSlotId === slot.id ? '②' : ''}`;
      if (markers) {
        const assigned = document.createElement('span');
        assigned.className = 'prefectureCustomSlotAssignment';
        assigned.textContent = markers;
        button.appendChild(assigned);
      }
      button.classList.toggle('is-primary', state.primaryCustomSlotId === slot.id);
      button.classList.toggle('is-secondary', state.secondaryCustomSlotId === slot.id);
      button.addEventListener('click', () => assignCustomSlotToTarget(slot.id));
      fragment.appendChild(button);
    }
  }

  elements.prefectureCustomSlotList.replaceChildren(fragment);
}

async function assignCustomSlotToTarget(slotId) {
  const slot = state.customSlots.find((item) => item.id === slotId);
  if (!slot) {
    showStatus('選択したカスタム設定が見つかりません。');
    renderPrefectureCustomSlots();
    return;
  }

  const target = state.isMobile ? 'primary' : state.prefectureTargetSlot;
  if (target === 'secondary') state.secondaryCustomSlotId = slot.id;
  else state.primaryCustomSlotId = slot.id;
  persistAssignedCustomSlots();
  state.singleViewSlot = target;
  state.customMode = false;
  state.area = 'all';
  state.search = '';
  elements.cameraSearch.value = '';
  await ensureCustomPrefectureData();
  closePrefecturePanel();
  renderAreaSelect();
  updateComparisonControls();
  updatePageMeta();
  initializeOrResetMap();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  await refreshYoutubeLiveStatus();
  showStatus(`「${slot.name}」を${target === 'secondary' ? '第2' : '第1'}へ設定しました。`);
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
  const imageEntries = entries.filter((entry) => cameraMediaType(entry.camera) !== 'youtube');
  const youtubeEntries = entries.filter((entry) => cameraMediaType(entry.camera) === 'youtube');
  const orderedEntries = [...imageEntries, ...youtubeEntries];

  if (elements.customSelectVisibleButton) {
    const visibleKeys = orderedEntries.map((entry) => entry.key);
    const selectedVisibleCount = visibleKeys.filter((key) => selected.has(key)).length;
    const allVisibleSelected = visibleKeys.length > 0 && selectedVisibleCount === visibleKeys.length;
    elements.customSelectVisibleButton.disabled = visibleKeys.length === 0 || allVisibleSelected;
    elements.customSelectVisibleButton.textContent = allVisibleSelected ? '表示中は選択済み' : '表示中を全選択';
    elements.customSelectVisibleButton.title = visibleKeys.length
      ? `現在表示中の${visibleKeys.length}件をまとめて選択します。`
      : '現在の条件で表示されているカメラはありません。';
  }

  for (const [entryIndex, entry] of orderedEntries.entries()) {
    const isYoutube = cameraMediaType(entry.camera) === 'youtube';
    if (isYoutube && entryIndex === imageEntries.length) {
      const heading = document.createElement('h3');
      heading.className = 'customCameraGroupHeading';
      heading.textContent = 'YouTubeライブカメラ';
      fragment.appendChild(heading);
    }
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
      if (!state.customOrderCustomized) {
        state.customSelection = normalizeCustomKeys(state.customSelection, false);
      }
      label.classList.toggle('is-selected', checkbox.checked);
      persistCustomSelection();
      updateCustomSelectedCount();
    });

    const media = document.createElement('div');
    media.className = `customCameraPreview${isYoutube ? ' is-youtube' : ''}`;
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = `${entry.prefecture.name} ${entry.camera.city} ${stripTerrainPrefix(entry.camera.place)}`;
    if (isYoutube) {
      setYoutubeSelectionThumbnail(image, entry.camera, media);
      image.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        window.open(entry.camera.pageUrl, '_blank', 'noopener,noreferrer');
      });
      const badge = document.createElement('div');
      badge.className = 'customYoutubeBadge';
      badge.textContent = 'YouTube';
      const imageError = document.createElement('div');
      imageError.className = 'customCameraPreviewError';
      imageError.textContent = 'サムネイル取得不可';
      media.append(image, badge, imageError);
    } else {
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
    }

    const text = document.createElement('span');
    text.className = 'customCameraText';
    const prefecture = document.createElement('small');
    prefecture.textContent = `${entry.prefecture.name}${isYoutube ? '・YouTube' : ''}`;
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
    empty.textContent = '条件に一致するカメラはありません。';
    fragment.appendChild(empty);
  }
  elements.customCameraList.replaceChildren(fragment);
}

async function openCustomPanel() {
  state.customReorderMode = false;
  updateCustomReorderButton();
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
  state.customSelection = normalizeCustomKeys(state.customSelection, state.customOrderCustomized);
  const slot = { id: createCustomSlotId(), name, cameras: [...state.customSelection], orderCustomized: state.customOrderCustomized, updatedAt: new Date().toISOString() };
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
  state.customSelection = normalizeCustomKeys(state.customSelection, state.customOrderCustomized);
  slot.cameras = [...state.customSelection];
  slot.orderCustomized = state.customOrderCustomized;
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
  updatePrefectureSelectionUI();
  updatePageMeta();
  renderCameras();
  showStatus(`スロット名を「${name}」へ変更しました。`);
}

function deleteCustomSlot() {
  const slot = selectedCustomSlot();
  if (!slot || !window.confirm(`「${slot.name}」を削除しますか？`)) return;
  state.customSlots = state.customSlots.filter((item) => item.id !== slot.id);
  if (state.primaryCustomSlotId === slot.id) state.primaryCustomSlotId = null;
  if (state.secondaryCustomSlotId === slot.id) state.secondaryCustomSlotId = null;
  persistAssignedCustomSlots();
  if (state.customActiveSlotId === slot.id) {
    state.customActiveSlotId = null;
    localStorage.removeItem(CUSTOM_ACTIVE_SLOT_KEY);
  }
  persistCustomSlots();
  if (elements.customSlotName) elements.customSlotName.value = '';
  updateCustomSlotControls();
  updatePrefectureSelectionUI();
  updatePageMeta();
  renderCameras();
  showStatus(`「${slot.name}」を削除しました。`);
}

async function loadCustomSlot() {
  const slot = selectedCustomSlot();
  if (!slot) return;
  await ensureCustomPrefectureData();
  const valid = new Set(allCustomCameraEntries().map((entry) => entry.key));
  state.customOrderCustomized = slot.orderCustomized === true;
  state.customSelection = normalizeCustomKeys(slot.cameras.filter((key) => valid.has(key)), state.customOrderCustomized);
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
  state.customSelection = normalizeCustomKeys(
    state.customSelection.filter((key) => valid.has(key)),
    state.customOrderCustomized
  );
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
  await refreshYoutubeLiveStatus();
  hideStatus();
}

function exitCustomMode() {
  state.customReorderMode = false;
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
  return currentSingleSource();
}

function displayedPrefecture() {
  const source = currentSingleSource();
  return source.type === 'prefecture' ? source.prefecture : null;
}

function displayedHiddenCameraIds() {
  const source = currentSingleSource();
  return source.type === 'prefecture' ? source.hiddenIds : new Set();
}

function displayedCustomSlot() {
  const source = currentSingleSource();
  return source.type === 'custom' ? source.customSlot : null;
}

async function loadPrefecture(prefectureId) {
  showStatus('ライブカメラデータを読み込んでいます。');
  const data = await fetchJson(`${DATA_ROOT}/cameras/${prefectureId}.json`);

  state.prefecture = data;
  state.primaryAreas.clear();
  persistAreaSelection('primary');
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
  if (state.primaryCustomSlotId || state.secondaryCustomSlotId) await ensureCustomPrefectureData();

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
  const singleSource = currentSingleSource();
  const primarySource = slotSource('primary');
  const secondarySource = slotSource('secondary');
  const singleIsCustom = !state.compareMode && singleSource.type === 'custom';
  const hasYoutube = youtubeEntriesForCurrentView({ liveOnly: false }).length > 0;
  const comparisonSource = state.isSinglePaneComparison
    ? slotSource(state.singleViewSlot === 'secondary' ? 'secondary' : 'primary')
    : null;
  const titleName = state.customMode
    ? 'カスタム'
    : state.compareMode
      ? state.isSinglePaneComparison ? comparisonSource.name : `${primarySource.name}・${secondarySource.name}`
      : singleSource.name || '全国';
  document.title = `${titleName}ライブカメラ｜全国ライブカメラ`;
  elements.pageSubtitle.textContent = state.customMode
    ? `選択した${state.customSelection.length}地点をカスタム表示`
    : state.compareMode
      ? state.isSinglePaneComparison ? `${comparisonSource.name}を表示（第1・第2を切替可能）` : `${primarySource.name}と${secondarySource.name}を比較表示`
      : singleIsCustom
        ? `保存したカスタム設定「${singleSource.name}」を表示`
        : singleSource.prefecture ? `${singleSource.prefecture.region}地方・${singleSource.prefecture.name}` : 'データを読み込み中...';
  elements.prefectureName.textContent = state.customMode
    ? 'カスタム'
    : state.compareMode
      ? state.isSinglePaneComparison ? comparisonSource.name : `${primarySource.name} × ${secondarySource.name}`
      : singleSource.name || '-';
  updatePrefectureSelectionUI();
  elements.youtubeToggle.hidden = !hasYoutube;
  renderAreaSelect();
  if (elements.visibilityEditButton) elements.visibilityEditButton.hidden = state.customMode || singleIsCustom;
  if (elements.customModeButton) {
    elements.customModeButton.classList.toggle('is-active', state.customMode || singleIsCustom);
    elements.customModeButton.textContent = state.customMode || singleIsCustom ? 'カスタム中' : 'カスタム';
  }
  updateCustomReorderButton();
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
    // カスタムスロットが割り当てられている側では、背後に保持している
    // 通常の都道府県を選択中として表示しない。
    const isPrimary = !state.primaryCustomSlotId && id === state.prefecture?.id;
    const isSecondary = !state.secondaryCustomSlotId && id === state.secondaryPrefectureId;
    button.classList.toggle('is-primary', isPrimary);
    button.classList.toggle('is-secondary', isSecondary);
    button.classList.toggle('active', isPrimary || isSecondary);

    const slots = button.querySelector('.prefectureButtonSlots');
    if (slots) {
      slots.textContent = `${isPrimary ? '①' : ''}${isSecondary ? '②' : ''}`;
    }
    const label = button.querySelector('.prefectureButtonName')?.textContent || '';
    if (isPrimary && isSecondary) button.setAttribute('aria-label', `${label} 第1・第2`);
    else if (isPrimary) button.setAttribute('aria-label', `${label} 第1`);
    else if (isSecondary) button.setAttribute('aria-label', `${label} 第2`);
    else button.removeAttribute('aria-label');
  });
}

function renderAreaSelect() {
  const singleSource = currentSingleSource();
  const customSingle = !state.compareMode && singleSource.type === 'custom';
  const hideAll = state.customMode || customSingle;
  if (elements.areaControls) elements.areaControls.hidden = hideAll;
  if (hideAll) {
    closeAreaSelectionMenus();
    if (elements.primaryAreaControl) elements.primaryAreaControl.hidden = true;
    if (elements.secondaryAreaControl) elements.secondaryAreaControl.hidden = true;
    return;
  }

  if (state.compareMode) {
    const primarySource = slotSource('primary');
    const secondarySource = slotSource('secondary');
    renderAreaControl('primary', primarySource.type === 'prefecture' ? primarySource.prefecture : null, '第1エリア');
    renderAreaControl('secondary', secondarySource.type === 'prefecture' ? secondarySource.prefecture : null, '第2エリア');
  } else {
    const slot = state.singleViewSlot === 'secondary' ? 'secondary' : 'primary';
    renderAreaControl('primary', singleSource.type === 'prefecture' ? singleSource.prefecture : null, 'エリア', slot);
    if (elements.secondaryAreaControl) elements.secondaryAreaControl.hidden = true;
  }
}

function areaSelectionForSlot(slotName) {
  return slotName === 'secondary' ? state.secondaryAreas : state.primaryAreas;
}

function areaStorageKey(slotName) {
  return slotName === 'secondary' ? SECONDARY_AREAS_KEY : PRIMARY_AREAS_KEY;
}

function persistAreaSelection(slotName) {
  localStorage.setItem(areaStorageKey(slotName), JSON.stringify([...areaSelectionForSlot(slotName)]));
}

function loadAreaSelection(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : []);
  } catch {
    return new Set();
  }
}

function cameraMatchesAreaSelection(camera, slotName) {
  const selected = areaSelectionForSlot(slotName);
  return selected.size === 0 || selected.has(camera.area);
}

function areaSelectionText(prefecture, selected) {
  if (!prefecture || selected.size === 0) return '全域';
  const names = prefecture.areas.filter((area) => selected.has(area.id)).map((area) => area.name);
  if (!names.length || names.length === prefecture.areas.length) return '全域';
  if (names.length === 1) return names[0];
  return `${names.length}エリア`;
}

function renderAreaControl(controlPosition, prefecture, labelText, selectionSlot = controlPosition) {
  const isSecondaryPosition = controlPosition === 'secondary';
  const control = isSecondaryPosition ? elements.secondaryAreaControl : elements.primaryAreaControl;
  const label = isSecondaryPosition ? elements.secondaryAreaLabel : elements.primaryAreaLabel;
  const summary = isSecondaryPosition ? elements.secondaryAreaSummary : elements.primaryAreaSummary;
  const optionList = isSecondaryPosition ? elements.secondaryAreaOptions : elements.primaryAreaOptions;
  if (!control || !optionList || !summary) return;
  control.hidden = !prefecture;
  if (!prefecture) return;
  if (label) label.textContent = labelText;

  const selected = areaSelectionForSlot(selectionSlot);
  const validIds = new Set(prefecture.areas.map((area) => area.id));
  for (const id of [...selected]) if (!validIds.has(id)) selected.delete(id);
  if (selected.size === prefecture.areas.length) selected.clear();
  persistAreaSelection(selectionSlot);
  summary.textContent = areaSelectionText(prefecture, selected);

  const fragment = document.createDocumentFragment();
  const allLabel = document.createElement('label');
  allLabel.className = 'areaOption is-all';
  const allCheckbox = document.createElement('input');
  allCheckbox.type = 'checkbox';
  allCheckbox.checked = selected.size === 0;
  const allText = document.createElement('span');
  allText.textContent = '全域';
  allLabel.append(allCheckbox, allText);
  allCheckbox.addEventListener('change', () => {
    selected.clear();
    persistAreaSelection(selectionSlot);
    renderAreaSelect();
    renderCameras();
    if (state.showYoutube) renderYoutubeGallery();
  });
  fragment.appendChild(allLabel);

  for (const area of prefecture.areas) {
    const option = document.createElement('label');
    option.className = 'areaOption';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selected.has(area.id);
    const swatch = document.createElement('span');
    swatch.className = 'areaOptionSwatch';
    swatch.style.background = markerCssColor(area.color);
    const text = document.createElement('span');
    text.textContent = area.name;
    option.append(checkbox, swatch, text);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(area.id);
      else selected.delete(area.id);
      if (selected.size === prefecture.areas.length) selected.clear();
      persistAreaSelection(selectionSlot);
      renderAreaSelect();
      renderCameras();
      if (state.showYoutube) renderYoutubeGallery();
    });
    fragment.appendChild(option);
  }
  optionList.replaceChildren(fragment);
}

function initializeOrResetMap() {
  const prefecture = displayedPrefecture();
  const assignedCustom = displayedCustomSlot();
  if (!prefecture && !state.customMode && !assignedCustom) return;
  const customView = state.customMode || Boolean(assignedCustom);
  const center = customView
    ? [36.2, 138.2]
    : [prefecture.center.latitude, prefecture.center.longitude];
  const zoom = customView ? 5 : prefecture.zoom;

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
  if (elements.visibilityImageMode) elements.visibilityImageMode.value = state.visibilityImagesVisible ? 'show' : 'hide';

  state.isMobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  state.isCompactGrid = window.matchMedia(COMPACT_GRID_MEDIA_QUERY).matches;
  state.isSinglePaneComparison = window.matchMedia(SINGLE_PANE_COMPARE_MEDIA_QUERY).matches;
  state.mapVisible = localStorage.getItem(MAP_VISIBILITY_KEY) !== 'false';
  const savedColumns = Number(localStorage.getItem(GRID_COLUMNS_KEY));
  state.gridColumns = [1, 2, 3, 4, 6, 8].includes(savedColumns) ? savedColumns : 4;
  const savedComparisonColumns = Number(localStorage.getItem(COMPARE_GRID_COLUMNS_KEY));
  state.comparisonGridColumns = [2, 4, 6, 8].includes(savedComparisonColumns) ? savedComparisonColumns : 6;
  const savedCompactComparisonColumns = Number(localStorage.getItem(COMPACT_COMPARE_GRID_COLUMNS_KEY));
  state.compactComparisonGridColumns = [1, 2, 3, 4].includes(savedCompactComparisonColumns) ? savedCompactComparisonColumns : 4;
  state.primaryAreas = loadAreaSelection(PRIMARY_AREAS_KEY);
  state.secondaryAreas = loadAreaSelection(SECONDARY_AREAS_KEY);
  const savedComparisonScrollMode = localStorage.getItem(COMPARISON_SCROLL_MODE_KEY);
  state.comparisonScrollMode = savedComparisonScrollMode === 'independent' ? 'independent' : 'linked';
  if (elements.comparisonScrollModeSelect) elements.comparisonScrollModeSelect.value = state.comparisonScrollMode;
  state.compareMode = !state.isMobile && localStorage.getItem(COMPARE_MODE_KEY) === 'true';
  state.secondaryPrefectureId = localStorage.getItem(COMPARE_PREFECTURE_KEY);
  updateMapVisibility();
  updateResponsiveControls();
}

function allowedSingleGridColumns() {
  return state.isMobile || state.isCompactGrid ? [1, 2, 3, 4] : [1, 2, 3, 4, 6, 8];
}

function effectiveSingleGridColumns() {
  const allowed = allowedSingleGridColumns();
  return allowed.includes(state.gridColumns) ? state.gridColumns : 4;
}

function customPrefectureTheme(prefectureId, prefectureName = '') {
  const key = String(prefectureId || prefectureName || 'custom');
  let hash = 0;
  for (const character of key) hash = ((hash * 31) + character.codePointAt(0)) >>> 0;
  return CUSTOM_PREFECTURE_THEMES[hash % CUSTOM_PREFECTURE_THEMES.length];
}

function applyCustomPrefectureTheme(card, prefectureId, prefectureName) {
  if (!prefectureId && !prefectureName) return;
  const theme = customPrefectureTheme(prefectureId, prefectureName);
  card.classList.add('customPrefectureCard');
  card.dataset.prefectureId = prefectureId || '';
  card.dataset.prefectureName = prefectureName || '';
  card.style.setProperty('--prefecture-accent', theme.accent);
  card.style.setProperty('--prefecture-soft', theme.soft);
  card.style.setProperty('--prefecture-text', theme.text);
}

function updateMapVisibility() {
  if (!elements.mapWrap || !elements.layout || !elements.mapToggleButton) return;
  const effectiveMapVisible = state.mapVisible && !state.compareMode;

  elements.mapWrap.hidden = !effectiveMapVisible;
  elements.layout.classList.toggle('mapHidden', !effectiveMapVisible);
  elements.layout.classList.toggle('comparisonMode', state.compareMode);
  elements.layout.classList.toggle('singlePaneComparison', state.compareMode && state.isSinglePaneComparison);
  elements.layout.classList.toggle('customMode', state.customMode);
  const singleGridColumns = effectiveSingleGridColumns();
  for (const columns of [1, 2, 3, 4, 6, 8]) {
    elements.layout.classList.toggle(`gridColumns${columns}`, !state.compareMode && singleGridColumns === columns);
    elements.layout.classList.remove(`compactColumns${columns}`, `mobileColumns${columns}`);
  }
  for (const columns of [2, 4, 6, 8, 10]) {
    elements.layout.classList.toggle(`comparisonColumns${columns}`, state.compareMode && !state.isSinglePaneComparison && state.comparisonGridColumns === columns);
  }
  for (const columns of [1, 2, 3, 4]) {
    elements.layout.classList.toggle(`compactComparisonColumns${columns}`, state.compareMode && state.isSinglePaneComparison && state.compactComparisonGridColumns === columns);
  }
  elements.mapToggleButton.hidden = state.compareMode;
  elements.mapToggleButton.classList.toggle('is-off', !state.mapVisible);
  elements.mapToggleButton.setAttribute('aria-pressed', String(state.mapVisible));
  elements.mapToggleButton.textContent = state.mapVisible ? '地図非表示' : '地図表示';
  elements.mapToggleButton.title = state.mapVisible ? '地図を非表示にします' : '地図を表示します';
  updateGridColumnControl();

  if (effectiveMapVisible) window.setTimeout(() => scheduleMapRefresh(new Set(state.markers.keys())), 0);
}

function updateGridColumnControl() {
  if (!elements.gridColumnControl || !elements.gridColumnSelect) return;
  const values = state.compareMode
    ? state.isSinglePaneComparison ? [1, 2, 3, 4] : [2, 4, 6, 8]
    : allowedSingleGridColumns();
  const selected = state.compareMode
    ? state.isSinglePaneComparison ? state.compactComparisonGridColumns : state.comparisonGridColumns
    : effectiveSingleGridColumns();
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
  updateComparisonScrollModeControl();
}

function handleResponsiveChange() {
  const mobile = window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  const compactGrid = window.matchMedia(COMPACT_GRID_MEDIA_QUERY).matches;
  const singlePaneComparison = window.matchMedia(SINGLE_PANE_COMPARE_MEDIA_QUERY).matches;
  if (mobile === state.isMobile && compactGrid === state.isCompactGrid && singlePaneComparison === state.isSinglePaneComparison) {
    updateResponsiveControls();
    return;
  }

  state.isMobile = mobile;
  state.isCompactGrid = compactGrid;
  state.isSinglePaneComparison = singlePaneComparison;
  if (mobile && state.compareMode) {
    state.compareMode = false;
    localStorage.setItem(COMPARE_MODE_KEY, 'false');
    state.singleViewSlot = 'primary';
    renderAreaSelect();
    initializeOrResetMap();
  }
  updateComparisonControls();
  updatePageMeta();
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
  if (!state.compareMode && displayedCustomSlot()) {
    renderAssignedCustomCameras(displayedCustomSlot());
    return;
  }
  if (state.compareMode) {
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
  renderCustomEntrySet(selectedCustomEntries(), 'カスタム表示', { type: 'draft' });
}

function renderAssignedCustomCameras(customSlot) {
  renderCustomEntrySet(
    customEntriesForKeys(customSlot.cameras, customSlot.orderCustomized),
    customSlot.name,
    { type: 'slot', slotId: customSlot.id }
  );
}

function currentCustomReorderContext() {
  if (state.compareMode) return null;
  if (state.customMode) return { type: 'draft' };
  const source = currentSingleSource();
  return source.type === 'custom' ? { type: 'slot', slotId: source.customSlot.id } : null;
}

function customOrderIsCustomized(target) {
  if (!target) return false;
  if (target.type === 'draft') return state.customOrderCustomized === true;
  return state.customSlots.find((item) => item.id === target.slotId)?.orderCustomized === true;
}

function updateCustomReorderButton() {
  const context = currentCustomReorderContext();
  if (!context) state.customReorderMode = false;

  if (elements.customReorderButton) {
    elements.customReorderButton.hidden = !context;
    elements.customReorderButton.classList.toggle('is-active', state.customReorderMode);
    elements.customReorderButton.setAttribute('aria-pressed', String(state.customReorderMode));
    elements.customReorderButton.textContent = state.customReorderMode ? '完了' : '並替';
    elements.customReorderButton.title = state.customReorderMode
      ? 'ドラッグ並べ替えを終了します'
      : 'カスタム画像の表示順をドラッグまたはボタンで変更します';
  }

  if (elements.customOrderResetButton) {
    elements.customOrderResetButton.hidden = !context;
    elements.customOrderResetButton.disabled = !context || !customOrderIsCustomized(context);
    elements.customOrderResetButton.title = customOrderIsCustomized(context)
      ? 'カスタム画像を元のデータ順へ戻します'
      : '現在は元のデータ順です';
  }
}

function toggleCustomReorderMode() {
  if (!currentCustomReorderContext()) return;
  state.customReorderMode = !state.customReorderMode;
  stopCustomDragAutoScroll();
  updateCustomReorderButton();
  renderCameras();
  showStatus(state.customReorderMode
    ? '画像をドラッグするか、各カードの「前・後・先頭・末尾」で順番を変更できます。'
    : '並べ替えを終了しました。');
}

function customKeysForReorderTarget(target) {
  if (target.type === 'draft') return [...state.customSelection];
  const slot = state.customSlots.find((item) => item.id === target.slotId);
  return slot ? [...slot.cameras] : [];
}

function saveCustomKeysForReorderTarget(target, keys, orderCustomized = true) {
  if (target.type === 'draft') {
    state.customSelection = keys;
    state.customOrderCustomized = orderCustomized;
    persistCustomSelection();
    updateCustomReorderButton();
    return;
  }
  const slot = state.customSlots.find((item) => item.id === target.slotId);
  if (!slot) return;
  slot.cameras = keys;
  slot.orderCustomized = orderCustomized;
  slot.updatedAt = new Date().toISOString();
  persistCustomSlots();
  if (state.customActiveSlotId === slot.id) {
    state.customSelection = [...keys];
    state.customOrderCustomized = orderCustomized;
    persistCustomSelection();
  }
  updateCustomSlotControls();
  updateCustomReorderButton();
}

function resetCustomOrder() {
  const target = currentCustomReorderContext();
  if (!target) return;
  const keys = normalizeCustomKeys(customKeysForReorderTarget(target), false);
  saveCustomKeysForReorderTarget(target, keys, false);
  stopCustomDragAutoScroll();
  renderCameras();
  updatePageMeta();
  showStatus('カスタム画像を元のデータ順へ戻しました。');
}

function clearCustomDragClasses() {
  document.querySelectorAll('.cameraCard.is-dragging, .cameraCard.drag-before, .cameraCard.drag-after, .customReorderDropZone.is-over')
    .forEach((element) => element.classList.remove('is-dragging', 'drag-before', 'drag-after', 'is-over'));
}

function splitCustomKeysForImageReorder(target) {
  const byKey = new Map(allCustomCameraEntries().map((entry) => [entry.key, entry]));
  const currentKeys = normalizeCustomKeys(customKeysForReorderTarget(target), true);
  return {
    imageKeys: currentKeys.filter((key) => cameraMediaType(byKey.get(key)?.camera || {}) === 'image'),
    otherKeys: currentKeys.filter((key) => cameraMediaType(byKey.get(key)?.camera || {}) !== 'image')
  };
}

function commitCustomImageOrder(target, imageKeys, otherKeys) {
  saveCustomKeysForReorderTarget(target, [...imageKeys, ...otherKeys], true);
  renderCameras();
  updatePageMeta();
}

function reorderCustomImages(target, draggedKey, targetKey, insertAfter) {
  if (!draggedKey || !targetKey || draggedKey === targetKey) return;
  const { imageKeys, otherKeys } = splitCustomKeysForImageReorder(target);
  const fromIndex = imageKeys.indexOf(draggedKey);
  const targetIndex = imageKeys.indexOf(targetKey);
  if (fromIndex < 0 || targetIndex < 0) return;
  imageKeys.splice(fromIndex, 1);
  let insertionIndex = imageKeys.indexOf(targetKey);
  if (insertAfter) insertionIndex += 1;
  imageKeys.splice(Math.max(0, insertionIndex), 0, draggedKey);
  commitCustomImageOrder(target, imageKeys, otherKeys);
}

function moveCustomImage(target, customKey, action) {
  const { imageKeys, otherKeys } = splitCustomKeysForImageReorder(target);
  const fromIndex = imageKeys.indexOf(customKey);
  if (fromIndex < 0) return;
  const [key] = imageKeys.splice(fromIndex, 1);
  let insertionIndex = fromIndex;
  if (action === 'first') insertionIndex = 0;
  if (action === 'previous') insertionIndex = Math.max(0, fromIndex - 1);
  if (action === 'next') insertionIndex = Math.min(imageKeys.length, fromIndex + 1);
  if (action === 'last') insertionIndex = imageKeys.length;
  imageKeys.splice(insertionIndex, 0, key);
  commitCustomImageOrder(target, imageKeys, otherKeys);
}

let customDragAutoScrollFrame = null;
let customDragPointerY = null;

function customDragAutoScrollStep() {
  customDragAutoScrollFrame = null;
  if (customDragPointerY === null || !state.customDraggedKey) return;
  const edge = Math.min(150, Math.max(80, window.innerHeight * 0.16));
  let delta = 0;
  if (customDragPointerY < edge) {
    delta = -Math.ceil((edge - customDragPointerY) / 4);
  } else if (customDragPointerY > window.innerHeight - edge) {
    delta = Math.ceil((customDragPointerY - (window.innerHeight - edge)) / 4);
  }
  if (delta) window.scrollBy(0, Math.max(-34, Math.min(34, delta)));
  customDragAutoScrollFrame = requestAnimationFrame(customDragAutoScrollStep);
}

function updateCustomDragAutoScroll(clientY) {
  customDragPointerY = clientY;
  if (!customDragAutoScrollFrame) customDragAutoScrollFrame = requestAnimationFrame(customDragAutoScrollStep);
}

function stopCustomDragAutoScroll() {
  customDragPointerY = null;
  if (customDragAutoScrollFrame) cancelAnimationFrame(customDragAutoScrollFrame);
  customDragAutoScrollFrame = null;
}

function createCustomReorderControls(customKey, target) {
  const controls = document.createElement('div');
  controls.className = 'customReorderControls';
  const actions = [
    ['first', '先頭', '先頭へ移動'],
    ['previous', '前', '1つ前へ移動'],
    ['next', '後', '1つ後ろへ移動'],
    ['last', '末尾', '末尾へ移動']
  ];
  for (const [action, label, title] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.title = title;
    button.addEventListener('pointerdown', (event) => event.stopPropagation());
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      moveCustomImage(target, customKey, action);
    });
    controls.appendChild(button);
  }
  return controls;
}

function createCustomReorderDropZone(target, edge) {
  const zone = document.createElement('div');
  zone.className = `customReorderDropZone is-${edge}`;
  zone.textContent = edge === 'start' ? 'ここへドロップして先頭へ' : 'ここへドロップして末尾へ';
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    updateCustomDragAutoScroll(event.clientY);
    zone.classList.add('is-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    const draggedKey = state.customDraggedKey || event.dataTransfer.getData('text/plain');
    clearCustomDragClasses();
    stopCustomDragAutoScroll();
    state.customDraggedKey = null;
    if (draggedKey) moveCustomImage(target, draggedKey, edge === 'start' ? 'first' : 'last');
  });
  return zone;
}

function enableCustomCardReorder(card, customKey, target) {
  card.draggable = true;
  card.dataset.customKey = customKey;
  card.classList.add('is-reorderable');
  card.appendChild(createCustomReorderControls(customKey, target));
  card.addEventListener('dragstart', (event) => {
    if (event.target.closest?.('.customReorderControls')) {
      event.preventDefault();
      return;
    }
    state.customDraggedKey = customKey;
    card.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', customKey);
  });
  card.addEventListener('dragover', (event) => {
    event.preventDefault();
    updateCustomDragAutoScroll(event.clientY);
    if (!state.customDraggedKey || state.customDraggedKey === customKey) return;
    clearCustomDragClasses();
    const rect = card.getBoundingClientRect();
    const nearSameRow = Math.abs(event.clientY - (rect.top + rect.height / 2)) < rect.height * 0.28;
    const insertAfter = event.clientY > rect.top + rect.height / 2
      || (nearSameRow && event.clientX > rect.left + rect.width / 2);
    card.classList.add(insertAfter ? 'drag-after' : 'drag-before');
  });
  card.addEventListener('drop', (event) => {
    event.preventDefault();
    const draggedKey = state.customDraggedKey || event.dataTransfer.getData('text/plain');
    const insertAfter = card.classList.contains('drag-after');
    clearCustomDragClasses();
    stopCustomDragAutoScroll();
    state.customDraggedKey = null;
    reorderCustomImages(target, draggedKey, customKey, insertAfter);
  });
  card.addEventListener('dragend', () => {
    state.customDraggedKey = null;
    stopCustomDragAutoScroll();
    clearCustomDragClasses();
  });
}

function renderCustomEntrySet(sourceEntries, titleText, reorderTarget = null) {
  state.markerLayer?.clearLayers();
  state.markers.clear();
  const keyword = normalizeText(state.search);
  const matchedEntries = sourceEntries.filter((entry) => {
    if (!keyword) return true;
    return normalizeText(`${entry.prefecture.name} ${entry.camera.city} ${stripTerrainPrefix(entry.camera.place)} ${entry.camera.provider || ''}`).includes(keyword);
  });
  // YouTubeはカスタム選択画面と上部のYouTube一覧で扱い、通常の画像グリッドには混ぜない。
  const displayEntries = matchedEntries.filter((entry) => cameraMediaType(entry.camera) === 'image');
  const liveYoutubeEntries = matchedEntries.filter((entry) => cameraMediaType(entry.camera) === 'youtube' && isYoutubeCurrentlyLive(entry.camera));
  const selectedYoutubeCount = matchedEntries.filter((entry) => cameraMediaType(entry.camera) === 'youtube').length;
  const visibleIds = new Set();
  const section = document.createElement('section');
  section.className = 'areaSection customCameraSection';
  section.classList.toggle('is-reordering', state.customReorderMode && Boolean(reorderTarget));
  section.style.setProperty('--area-color', '#7c3aed');

  const title = document.createElement('h2');
  title.className = 'areaTitle';
  title.textContent = titleText;
  const grid = document.createElement('div');
  grid.className = 'cameraGrid';
  if (state.customReorderMode && reorderTarget) {
    grid.addEventListener('dragover', (event) => {
      if (!state.customDraggedKey) return;
      event.preventDefault();
      updateCustomDragAutoScroll(event.clientY);
    });
  }

  for (const entry of displayEntries) {
    const card = createCameraCard(entry.camera, entry.area, {
      prefectureName: entry.prefecture.name,
      prefectureId: entry.prefecture.id
    });
    if (state.customReorderMode && reorderTarget) enableCustomCardReorder(card, entry.key, reorderTarget);
    grid.appendChild(card);
    addMarker(entry.camera, entry.area);
    visibleIds.add(entry.camera.id);
  }
  for (const entry of liveYoutubeEntries) {
    addMarker(entry.camera, entry.area);
    visibleIds.add(entry.camera.id);
  }
  if (state.customReorderMode && reorderTarget) {
    const guide = document.createElement('p');
    guide.className = 'customReorderGuide';
    guide.textContent = 'ドラッグ、またはカード上のボタンで順番を変更できます。';
    section.append(title, guide, createCustomReorderDropZone(reorderTarget, 'start'), grid, createCustomReorderDropZone(reorderTarget, 'end'));
  } else {
    section.append(title, grid);
  }

  if (!displayEntries.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = selectedYoutubeCount
      ? '静止画が選択されていません。選択したYouTubeは上部の「YouTube」から開けます。'
      : 'カスタム表示に選択されたカメラがないか、絞り込み条件に一致しません。';
    elements.content.replaceChildren(empty);
  } else {
    elements.content.replaceChildren(section);
  }
  scheduleMapRefresh(visibleIds);
}

function renderComparisonCameras() {
  state.markerLayer?.clearLayers();
  state.markers.clear();
  const previousScrollPositions = captureComparisonPaneScrollPositions();
  const shell = document.createElement('div');
  shell.className = 'comparisonShell';

  if (state.isSinglePaneComparison) {
    shell.classList.add('is-single-pane');
    const slot = state.singleViewSlot === 'secondary' ? 'secondary' : 'primary';
    shell.append(createComparisonPaneForSource(slotSource(slot)));
  } else {
    shell.classList.add('is-dual-scroll');
    shell.dataset.scrollMode = state.comparisonScrollMode;
    shell.append(
      createComparisonPaneForSource(slotSource('primary')),
      createComparisonPaneForSource(slotSource('secondary'))
    );
    bindComparisonPaneManualScroll(shell);
  }

  elements.content.replaceChildren(shell);
  restoreComparisonPaneScrollPositions(previousScrollPositions);
  updateComparisonScrollModeControl();
  updateMapVisibility();
}

function comparisonPanes() {
  return [...elements.content.querySelectorAll('.comparisonShell.is-dual-scroll > .comparisonPane')];
}

function captureComparisonPaneScrollPositions() {
  const positions = new Map();
  for (const pane of comparisonPanes()) {
    positions.set(pane.dataset.scrollSlot || String(positions.size), pane.scrollTop);
  }
  return positions;
}

function restoreComparisonPaneScrollPositions(positions) {
  if (!positions?.size) return;
  requestAnimationFrame(() => {
    for (const pane of comparisonPanes()) {
      const saved = positions.get(pane.dataset.scrollSlot || '');
      if (!Number.isFinite(saved)) continue;
      pane.scrollTop = Math.min(saved, comparisonPaneMaxScroll(pane));
    }
  });
}

function comparisonPaneMaxScroll(pane) {
  return Math.max(0, pane.scrollHeight - pane.clientHeight);
}

function bindComparisonPaneManualScroll(shell) {
  let synchronizing = false;
  const panes = [...shell.querySelectorAll(':scope > .comparisonPane')];

  for (const pane of panes) {
    pane.addEventListener('pointerdown', () => {
      if (state.scrollSpeed > 0) stopAutoScroll();
    }, { passive: true });
    pane.addEventListener('scroll', () => {
      if (state.comparisonScrollMode !== 'linked' || synchronizing) return;
      synchronizing = true;
      for (const other of panes) {
        if (other === pane) continue;
        other.scrollTop = Math.min(pane.scrollTop, comparisonPaneMaxScroll(other));
      }
      requestAnimationFrame(() => { synchronizing = false; });
    }, { passive: true });
  }

  shell.addEventListener('wheel', (event) => {
    if (state.comparisonScrollMode !== 'linked' || event.ctrlKey) return;
    if (panes.length < 2) return;

    const referenceHeight = panes[0]?.clientHeight || window.innerHeight;
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 18
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? referenceHeight
        : 1;
    const delta = event.deltaY * unit;
    if (!delta) return;

    const canMove = panes.some((pane) => {
      const maxScroll = comparisonPaneMaxScroll(pane);
      return delta > 0 ? pane.scrollTop < maxScroll - 1 : pane.scrollTop > 1;
    });
    if (!canMove) return;

    event.preventDefault();
    synchronizing = true;
    for (const pane of panes) {
      pane.scrollTop = Math.max(0, Math.min(comparisonPaneMaxScroll(pane), pane.scrollTop + delta));
    }
    requestAnimationFrame(() => { synchronizing = false; });
  }, { passive: false });
}

function createComparisonPaneForSource(source) {
  if (source.type === 'custom') {
    const pane = document.createElement('section');
    pane.className = 'comparisonPane comparisonCustomPane';
    pane.dataset.scrollSlot = source.slotName || 'custom';
    const heading = document.createElement('h2');
    heading.className = 'comparisonPrefectureTitle';
    heading.textContent = source.name;
    pane.appendChild(heading);
    const section = document.createElement('section');
    section.className = 'areaSection customCameraSection';
    section.style.setProperty('--area-color', '#7c3aed');
    const areaTitle = document.createElement('h3');
    areaTitle.className = 'areaTitle';
    areaTitle.textContent = 'カスタム表示';
    const grid = document.createElement('div');
    grid.className = 'cameraGrid';
    const keyword = normalizeText(state.search);
    const matchedEntries = source.entries
      .filter((entry) => !keyword || normalizeText(`${entry.prefecture.name} ${entry.camera.city} ${entry.camera.place}`).includes(keyword));
    const entries = matchedEntries.filter((entry) => cameraMediaType(entry.camera) === 'image');
    for (const entry of entries) {
      grid.appendChild(createCameraCard(entry.camera, entry.area, {
        mapFocus: false,
        prefectureName: entry.prefecture.name,
        prefectureId: entry.prefecture.id,
        cardIdPrefix: `${source.slotName}-`
      }));
    }
    section.append(areaTitle, grid);
    pane.appendChild(section);
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'emptyState';
      empty.textContent = matchedEntries.some((entry) => cameraMediaType(entry.camera) === 'youtube')
        ? '静止画が選択されていません。選択したYouTubeは上部の「YouTube」から開けます。'
        : '表示できるカスタムカメラがありません。';
      pane.appendChild(empty);
    }
    return pane;
  }
  return createComparisonPane(source.prefecture, source.hiddenIds, source.slotName);
}

function createComparisonPane(prefecture, hiddenIds, slotName = 'primary') {
  const pane = document.createElement('section');
  pane.className = 'comparisonPane';
  pane.dataset.prefectureId = prefecture.id;
  pane.dataset.scrollSlot = slotName;
  const heading = document.createElement('h2');
  heading.className = 'comparisonPrefectureTitle';
  heading.textContent = prefecture.name;
  pane.appendChild(heading);

  const imageCameras = filteredCamerasFor(prefecture, hiddenIds, 'image', slotName)
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
      const card = createCameraCard(camera, area, { mapFocus: false, cardIdPrefix: `${slotName}-` });
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

function filteredCamerasFor(prefecture, hiddenIds, mediaType = 'image', slotName = 'primary') {
  const keyword = normalizeText(state.search);
  return prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) !== mediaType || hiddenIds.has(camera.id)) return false;
    if (!cameraMatchesAreaSelection(camera, slotName)) return false;
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
  const slotName = state.singleViewSlot === 'secondary' ? 'secondary' : 'primary';
  if (!prefecture) return [];

  return prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) !== mediaType) return false;
    if (mediaType === 'youtube' && !isYoutubeCurrentlyLive(camera)) return false;
    if (hiddenIds.has(camera.id)) return false;
    if (!cameraMatchesAreaSelection(camera, slotName)) return false;
    if (!keyword) return true;
    const searchable = [camera.city, municipalityName(camera.city), stripTerrainPrefix(camera.place), camera.provider, camera.riverName]
      .filter(Boolean).join(' ');
    return normalizeText(searchable).includes(keyword);
  });
}

function createCameraCard(camera, area, { mapFocus = true, prefectureName = '', prefectureId = '', cardIdPrefix = '' } = {}) {
  const type = cameraMediaType(camera);
  const isYoutube = type === 'youtube';
  const card = document.createElement('article');
  card.className = `cameraCard${isYoutube ? ' youtubeCameraCard' : ''}`;
  card.id = `camera-${cardIdPrefix}${camera.id}`;
  card.dataset.cameraId = camera.id;
  card.style.setProperty('--area-color', markerCssColor(area.color));
  applyCustomPrefectureTheme(card, prefectureId, prefectureName);

  const header = document.createElement('div');
  header.className = 'cardHeader';

  const city = document.createElement('div');
  city.className = 'city';
  city.textContent = prefectureName ? `${prefectureName}・${camera.city}` : camera.city;
  header.appendChild(city);

  if (isYoutube) {
    const badge = document.createElement('span');
    badge.className = 'youtubeBadge';
    badge.textContent = 'YouTube LIVE';
    header.appendChild(badge);
  }

  const media = document.createElement('div');
  media.className = `cameraMedia${isYoutube ? ' youtubeMedia' : ''}`;

  const image = document.createElement('img');
  image.className = 'cameraImage';
  image.alt = isYoutube
    ? `${camera.city} ${stripTerrainPrefix(camera.place)}のYouTubeライブサムネイル`
    : `${camera.city} ${stripTerrainPrefix(camera.place)}のライブカメラ画像`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.dataset.cameraId = camera.id;

  if (isYoutube) {
    image.src = camera.thumbnailUrl || youtubeThumbnailUrl(camera.youtubeId);
    image.addEventListener('click', () => {
      window.open(camera.pageUrl, '_blank', 'noopener,noreferrer');
    });
  } else {
    image.dataset.liveCameraImage = 'true';
    setCameraImageSource(image, camera, 0);
    image.addEventListener('click', () => openViewer(camera, image.currentSrc || image.src));
  }

  if (mapFocus) {
    image.addEventListener('mouseenter', () => focusCamera(camera.id, false));
    image.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
  }
  image.addEventListener('load', () => media.classList.remove('error'));
  image.addEventListener('error', () => {
    if (isYoutube) {
      media.classList.add('error');
      return;
    }
    handleCameraImageError(image, media, camera);
  });

  const error = document.createElement('div');
  error.className = 'imageError';
  error.textContent = isYoutube
    ? 'YouTubeのサムネイルを取得できませんでした。地点名から配信ページを開いてください。'
    : '画像を取得できませんでした。地点名のリンクから提供元ページを確認し、必要に応じて「表示編集」で非表示にできます。';
  media.append(image, error);

  if (isYoutube) {
    const play = document.createElement('span');
    play.className = 'cameraYoutubePlay';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';
    media.appendChild(play);
  }

  const footer = document.createElement('div');
  footer.className = 'cardFooter';

  const link = document.createElement('a');
  link.className = 'placeLink';
  link.href = camera.pageUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = stripTerrainPrefix(camera.place);
  link.title = isYoutube ? 'YouTubeライブ配信を別タブで開く' : '提供元ページを開く';
  footer.appendChild(link);

  if (mapFocus) card.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
  card.append(header, media, footer);
  return card;
}

function setCameraImageSource(image, camera, attempt) {
  image.dataset.attempt = String(attempt);
  if (camera.referrerPolicy) image.referrerPolicy = camera.referrerPolicy;
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
  if (camera.imageProxy === WSRV_IMAGE_PROXY) {
    return wsrvImageUrl(camera.imageUrl, camera.imageRefreshSeconds);
  }
  return cacheBustedUrl(camera.imageUrl);
}

function wsrvImageUrl(sourceUrl, refreshSeconds = 60) {
  const seconds = Math.max(1, Number(refreshSeconds) || 60);
  const cacheKey = Math.floor(Date.now() / (seconds * 1000));
  let origin = String(sourceUrl || '').trim();

  // wsrv.nl はスキームなしをHTTP取得として扱う。HTTPS配信元だけはスキームを残す。
  if (origin.startsWith('http://')) origin = origin.slice('http://'.length);
  origin += `${origin.includes('?') ? '&' : '?'}_ts=${cacheKey}`;

  const params = new URLSearchParams({
    url: origin,
    output: 'jpg'
  });
  return `https://wsrv.nl/?${params.toString()}`;
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
  const entries = youtubeEntriesForCurrentView();
  const fragment = document.createDocumentFragment();

  for (const entry of entries) {
    const camera = entry.camera;
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
    prefectureLabel.textContent = entry.prefecture.name;
    const city = document.createElement('strong');
    city.textContent = municipalityName(camera.city);
    const place = document.createElement('span');
    place.textContent = stripTerrainPrefix(camera.place);
    text.append(prefectureLabel, city, place);
    link.append(media, text);
    link.addEventListener('click', () => window.setTimeout(() => closeYoutubeGallery({ keepEnabled: true }), 0));
    fragment.appendChild(link);
  }

  if (!entries.length) {
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
  const slot = state.visibilityPrefectureSlot === 'secondary' ? 'secondary' : 'primary';
  const source = slotSource(slot);
  if (source.type === 'custom') {
    return { slot, prefecture: null, hiddenIds: new Set(), customSlot: source.customSlot };
  }
  return { slot, prefecture: source.prefecture, hiddenIds: source.hiddenIds };
}

function updateVisibilityPrefectureSwitcher() {
  const visible = Boolean(state.secondaryPrefecture) && !state.isMobile;
  if (elements.visibilityPrefectureSwitcher) elements.visibilityPrefectureSwitcher.hidden = !visible;
  if (!visible) state.visibilityPrefectureSlot = 'primary';

  if (elements.visibilityPrimaryPrefectureName) {
    elements.visibilityPrimaryPrefectureName.textContent = slotLabel('primary');
  }
  if (elements.visibilitySecondaryPrefectureName) {
    elements.visibilitySecondaryPrefectureName.textContent = slotLabel('secondary');
  }

  elements.visibilityPrimaryPrefectureButton?.classList.toggle(
    'is-active', state.visibilityPrefectureSlot === 'primary'
  );
  elements.visibilitySecondaryPrefectureButton?.classList.toggle(
    'is-active', state.visibilityPrefectureSlot === 'secondary'
  );
}

function setVisibilityPrefectureSlot(slot) {
  state.visibilityPrefectureSlot = slot === 'secondary' && !state.isMobile ? 'secondary' : 'primary';
  state.visibilitySearch = '';
  if (elements.visibilitySearch) elements.visibilitySearch.value = '';
  updateVisibilityPrefectureSwitcher();
  renderVisibilityEditor();
  renderHiddenImages();
}

function renderVisibilityEditor() {
  const context = visibilityContext();
  const { prefecture, hiddenIds } = context;
  updateVisibilityPrefectureSwitcher();
  if (!prefecture) {
    const empty = document.createElement('div');
    empty.className = 'visibilityEmpty';
    empty.textContent = 'この枠にはカスタム設定が割り当てられています。内容は「カスタム」から編集してください。';
    elements.visibilityList.replaceChildren(empty);
    elements.hiddenImageList?.replaceChildren();
    if (elements.hiddenImageCount) elements.hiddenImageCount.textContent = '0';
    return;
  }
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

  // 1枠表示、または横幅が狭く1枠だけを表示している場合は、
  // 現在画面に出ている側をそのまま都道府県の変更先にする。
  // これにより、第2を見ながら選択画面を開いたのに第1を変更してしまう誤操作を防ぐ。
  if (!state.isMobile && (!state.compareMode || state.isSinglePaneComparison)) {
    setPrefectureTargetSlot(state.singleViewSlot === 'secondary' ? 'secondary' : 'primary');
  } else if (state.isMobile) {
    setPrefectureTargetSlot('primary');
  }

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
  resetAutoScrollState();

  if (state.scrollSpeed > 0) {
    state.scrollFrame = requestAnimationFrame(autoScroll);
  }
}

function setComparisonScrollMode(value) {
  state.comparisonScrollMode = value === 'independent' ? 'independent' : 'linked';
  localStorage.setItem(COMPARISON_SCROLL_MODE_KEY, state.comparisonScrollMode);
  if (elements.comparisonScrollModeSelect) elements.comparisonScrollModeSelect.value = state.comparisonScrollMode;

  const shell = elements.content.querySelector('.comparisonShell.is-dual-scroll');
  if (shell) shell.dataset.scrollMode = state.comparisonScrollMode;
  resetAutoScrollState();
  updateComparisonScrollModeControl();
  if (state.scrollSpeed > 0) state.scrollFrame = requestAnimationFrame(autoScroll);
}

function updateComparisonScrollModeControl() {
  if (!elements.comparisonScrollModeControl || !elements.comparisonScrollModeSelect) return;
  const available = state.compareMode && !state.isSinglePaneComparison && !state.isMobile && !state.customMode;
  elements.comparisonScrollModeControl.hidden = !available;
  elements.comparisonScrollModeSelect.value = state.comparisonScrollMode;
  elements.comparisonScrollModeControl.title = state.comparisonScrollMode === 'independent'
    ? '各枠が別々に進み、末尾で1秒停止してその枠だけ先頭へ戻ります。'
    : '両枠を同じ速さで進め、短い枠は末尾で停止し、両方が末尾に着いたら一緒に先頭へ戻ります。';
}

function resetAutoScrollState() {
  state.previousScrollTime = 0;
  state.scrollRemainder = 0;
  state.paneScrollStates.clear();
  cancelAnimationFrame(state.scrollFrame);
  clearTimeout(state.scrollReturnTimer);
  state.scrollFrame = null;
  state.scrollReturnTimer = null;
}

function autoScroll(timestamp) {
  if (state.scrollSpeed <= 0) return;

  if (state.previousScrollTime === 0) {
    state.previousScrollTime = timestamp;
    state.scrollFrame = requestAnimationFrame(autoScroll);
    return;
  }

  const elapsedSeconds = Math.min(0.12, Math.max(0, timestamp - state.previousScrollTime) / 1000);
  state.previousScrollTime = timestamp;

  const panes = comparisonPanes();
  if (panes.length >= 2) {
    if (state.comparisonScrollMode === 'independent') {
      autoScrollIndependentPanes(panes, timestamp, elapsedSeconds);
    } else {
      if (autoScrollLinkedPanes(panes, elapsedSeconds)) return;
    }
    state.scrollFrame = requestAnimationFrame(autoScroll);
    return;
  }

  if (autoScrollDocument(elapsedSeconds)) return;
  state.scrollFrame = requestAnimationFrame(autoScroll);
}

function autoScrollLinkedPanes(panes, elapsedSeconds) {
  state.scrollRemainder += state.scrollSpeed * elapsedSeconds;
  const movePixels = Math.floor(state.scrollRemainder);
  state.scrollRemainder -= movePixels;

  let allAtEnd = true;
  for (const pane of panes) {
    const maxScroll = comparisonPaneMaxScroll(pane);
    if (maxScroll <= 1) continue;
    const remaining = maxScroll - pane.scrollTop;
    if (remaining > Math.max(2, movePixels)) {
      allAtEnd = false;
      if (movePixels > 0) pane.scrollTop = Math.min(maxScroll, pane.scrollTop + movePixels);
    } else {
      pane.scrollTop = maxScroll;
    }
  }

  if (!allAtEnd) return false;
  state.previousScrollTime = 0;
  state.scrollRemainder = 0;
  state.scrollReturnTimer = window.setTimeout(() => {
    state.scrollReturnTimer = null;
    if (state.scrollSpeed <= 0) return;
    for (const pane of comparisonPanes()) pane.scrollTop = 0;
    state.previousScrollTime = 0;
    state.scrollRemainder = 0;
    state.scrollFrame = requestAnimationFrame(autoScroll);
  }, COMPARISON_SCROLL_PAUSE_MS);
  return true;
}

function autoScrollIndependentPanes(panes, timestamp, elapsedSeconds) {
  for (const pane of panes) {
    const slot = pane.dataset.scrollSlot || String(panes.indexOf(pane));
    const paneState = state.paneScrollStates.get(slot) || { remainder: 0, waitingUntil: 0 };
    const maxScroll = comparisonPaneMaxScroll(pane);

    if (maxScroll <= 1) {
      paneState.remainder = 0;
      paneState.waitingUntil = 0;
      state.paneScrollStates.set(slot, paneState);
      continue;
    }

    if (paneState.waitingUntil > 0) {
      if (timestamp < paneState.waitingUntil) {
        state.paneScrollStates.set(slot, paneState);
        continue;
      }
      pane.scrollTop = 0;
      paneState.remainder = 0;
      paneState.waitingUntil = 0;
      state.paneScrollStates.set(slot, paneState);
      continue;
    }

    paneState.remainder += state.scrollSpeed * elapsedSeconds;
    const movePixels = Math.floor(paneState.remainder);
    paneState.remainder -= movePixels;
    const remaining = maxScroll - pane.scrollTop;

    if (remaining <= Math.max(2, movePixels)) {
      pane.scrollTop = maxScroll;
      paneState.remainder = 0;
      paneState.waitingUntil = timestamp + COMPARISON_SCROLL_PAUSE_MS;
    } else if (movePixels > 0) {
      pane.scrollTop = Math.min(maxScroll, pane.scrollTop + movePixels);
    }
    state.paneScrollStates.set(slot, paneState);
  }
}

function autoScrollDocument(elapsedSeconds) {
  const scroller = document.scrollingElement || document.documentElement;
  const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  if (maxScroll <= 1) return false;

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
    }, COMPARISON_SCROLL_PAUSE_MS);
    return true;
  }

  if (movePixels > 0) scroller.scrollTop = Math.min(maxScroll, scroller.scrollTop + movePixels);
  return false;
}

function stopAutoScroll() {
  state.scrollSpeed = 0;
  if (elements.scrollSpeedSelect) elements.scrollSpeedSelect.value = '0';
  resetAutoScrollState();
}

function closeAreaSelectionMenus(except = null) {
  for (const control of [elements.primaryAreaControl, elements.secondaryAreaControl]) {
    if (control && control !== except) control.open = false;
  }
}

function bindAreaSelectionMenuEvents() {
  for (const control of [elements.primaryAreaControl, elements.secondaryAreaControl]) {
    control?.addEventListener('toggle', () => {
      if (control.open) closeAreaSelectionMenus(control);
    });
  }

  document.addEventListener('pointerdown', (event) => {
    const openMenus = [elements.primaryAreaControl, elements.secondaryAreaControl]
      .filter((control) => control?.open);
    if (!openMenus.length) return;
    if (openMenus.some((control) => control.contains(event.target))) return;
    closeAreaSelectionMenus();
  });
}

function bindEvents() {
  bindAreaSelectionMenuEvents();
  elements.summaryToggleButton?.addEventListener('click', toggleSummaryBar);

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
    if (state.compareMode) {
      if (state.isSinglePaneComparison) {
        state.compactComparisonGridColumns = [1, 2, 3, 4].includes(value) ? value : 4;
        localStorage.setItem(COMPACT_COMPARE_GRID_COLUMNS_KEY, String(state.compactComparisonGridColumns));
      } else {
        state.comparisonGridColumns = [2, 4, 6, 8].includes(value) ? value : 6;
        localStorage.setItem(COMPARE_GRID_COLUMNS_KEY, String(state.comparisonGridColumns));
      }
    } else {
      state.gridColumns = [1, 2, 3, 4, 6, 8].includes(value) ? value : 4;
      localStorage.setItem(GRID_COLUMNS_KEY, String(state.gridColumns));
    }
    updateMapVisibility();
  });
  elements.comparisonToggleButton?.addEventListener('click', toggleComparisonMode);
  elements.comparisonScrollModeSelect?.addEventListener('change', (event) => setComparisonScrollMode(event.target.value));
  elements.customModeButton?.addEventListener('click', openCustomPanel);
  elements.customReorderButton?.addEventListener('click', toggleCustomReorderMode);
  elements.customOrderResetButton?.addEventListener('click', resetCustomOrder);
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
  elements.customSelectVisibleButton?.addEventListener('click', async () => {
    const visibleKeys = [...elements.customCameraList.querySelectorAll('.customCameraOption input[type="checkbox"][value]')]
      .map((checkbox) => checkbox.value)
      .filter(Boolean);
    if (!visibleKeys.length) return;

    state.customSelection = normalizeCustomKeys(
      [...state.customSelection, ...visibleKeys],
      state.customOrderCustomized
    );
    persistCustomSelection();
    await renderCustomCameraEditor();
  });
  elements.customClearSelectionButton?.addEventListener('click', async () => {
    state.customSelection = [];
    state.customOrderCustomized = false;
    persistCustomSelection();
    await renderCustomCameraEditor();
  });
  elements.customApplyButton?.addEventListener('click', applyCustomSelection);
  elements.customNormalViewButton?.addEventListener('click', exitCustomMode);
  elements.primaryPrefectureSummaryButton?.addEventListener('click', async () => {
    if (state.compareMode && state.isSinglePaneComparison) await setComparisonViewSlot('primary');
    else if (state.compareMode) await swapComparisonPrefectures();
    else await setSingleViewSlot('primary');
  });
  elements.secondaryPrefectureSummaryButton?.addEventListener('click', async () => {
    if (state.compareMode && state.isSinglePaneComparison) await setComparisonViewSlot('secondary');
    else if (state.compareMode) await swapComparisonPrefectures();
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
  const primaryName = slotLabel('primary');
  const secondaryName = slotLabel('secondary');
  if (elements.primaryPrefectureName) elements.primaryPrefectureName.textContent = primaryName;
  if (elements.secondaryPrefectureName) elements.secondaryPrefectureName.textContent = secondaryName;
  if (elements.secondaryPrefectureSummaryButton) elements.secondaryPrefectureSummaryButton.hidden = state.isMobile;
  if (elements.panelPrimaryPrefectureName) elements.panelPrimaryPrefectureName.textContent = primaryName;
  if (elements.panelSecondaryPrefectureName) elements.panelSecondaryPrefectureName.textContent = secondaryName;
  const onePaneComparison = state.compareMode && state.isSinglePaneComparison;
  const viewingPrimary = state.compareMode ? (!onePaneComparison || state.singleViewSlot === 'primary') : state.singleViewSlot === 'primary';
  const viewingSecondary = state.compareMode ? (!onePaneComparison || state.singleViewSlot === 'secondary') : state.singleViewSlot === 'secondary';
  elements.primaryPrefectureSummaryButton?.classList.toggle('is-viewing', viewingPrimary);
  elements.secondaryPrefectureSummaryButton?.classList.toggle('is-viewing', viewingSecondary);
  elements.primaryPrefectureSummaryButton?.setAttribute('aria-pressed', String((!state.compareMode || onePaneComparison) && state.singleViewSlot === 'primary'));
  elements.secondaryPrefectureSummaryButton?.setAttribute('aria-pressed', String((!state.compareMode || onePaneComparison) && state.singleViewSlot === 'secondary'));
  setPrefectureTargetSlot(state.prefectureTargetSlot);
  updateVisibilityPrefectureSwitcher();
  highlightNavigation();
}

async function assignPrefectureToSlot(prefectureId) {
  if (!findEnabledPrefecture(prefectureId)) return;

  if (state.prefectureTargetSlot === 'secondary' && !state.isMobile) {
    state.secondaryCustomSlotId = null;
    state.secondaryAreas.clear();
    persistAreaSelection('secondary');
    persistAssignedCustomSlots();
    await loadSecondaryPrefecture(prefectureId);
    updatePrefectureSelectionUI();
    closePrefecturePanel();
    return;
  }

  const previousPrimaryId = state.prefecture?.id;
  const hadPrimaryCustom = Boolean(state.primaryCustomSlotId);
  state.primaryCustomSlotId = null;
  state.primaryAreas.clear();
  persistAreaSelection('primary');
  persistAssignedCustomSlots();
  if (prefectureId === previousPrimaryId && !hadPrimaryCustom) {
    closePrefecturePanel();
    renderAreaSelect();
    return;
  }
  if (prefectureId === previousPrimaryId && hadPrimaryCustom) {
    state.singleViewSlot = 'primary';
    closePrefecturePanel();
    renderAreaSelect();
    updateComparisonControls();
    updatePageMeta();
    initializeOrResetMap();
    renderCameras();
    return;
  }
  await loadPrefecture(prefectureId);
}

async function ensureSecondaryPrefecture(primaryId) {
  const enabled = enabledPrefectures();
  let target = state.secondaryPrefectureId;
  if (!enabled.some((prefecture) => prefecture.id === target)) target = primaryId || enabled[0]?.id;
  await loadSecondaryPrefecture(target, false);
}

async function loadSecondaryPrefecture(prefectureId, rerender = true) {
  if (!prefectureId || !findEnabledPrefecture(prefectureId)) prefectureId = state.prefecture?.id || enabledPrefectures()[0]?.id;
  if (!prefectureId) return;
  state.secondaryPrefecture = await fetchJson(`${DATA_ROOT}/cameras/${prefectureId}.json`);
  state.secondaryPrefectureId = prefectureId;
  state.secondaryHiddenCameraIds = loadHiddenCameraIds(prefectureId, state.secondaryPrefecture.cameras);
  localStorage.setItem(COMPARE_PREFECTURE_KEY, prefectureId);
  updatePrefectureSelectionUI();
  updateComparisonControls();
  if (rerender) {
    if (!state.compareMode && state.singleViewSlot === 'secondary') {
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
  if (target === 'secondary' && !state.secondaryPrefecture && !assignedCustomSlot('secondary')) return;
  if (assignedCustomSlot(target)) await ensureCustomPrefectureData();
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

async function setComparisonViewSlot(slot) {
  if (!state.compareMode || !state.isSinglePaneComparison) return;
  const target = slot === 'secondary' ? 'secondary' : 'primary';
  if (target === 'secondary' && !state.secondaryPrefecture) await ensureSecondaryPrefecture(state.prefecture?.id);
  if (assignedCustomSlot(target)) await ensureCustomPrefectureData();
  if (state.singleViewSlot === target) {
    updatePrefectureSelectionUI();
    return;
  }

  state.singleViewSlot = target;
  state.visibilityPrefectureSlot = target;
  updatePrefectureSelectionUI();
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
  const previousPrimaryCustomSlotId = state.primaryCustomSlotId;

  state.prefecture = state.secondaryPrefecture;
  state.hiddenCameraIds = state.secondaryHiddenCameraIds;
  state.secondaryPrefecture = previousPrimary;
  state.secondaryHiddenCameraIds = previousPrimaryHidden;
  state.secondaryPrefectureId = previousPrimary.id;
  state.primaryCustomSlotId = state.secondaryCustomSlotId;
  state.secondaryCustomSlotId = previousPrimaryCustomSlotId;
  const previousPrimaryAreas = state.primaryAreas;
  state.primaryAreas = state.secondaryAreas;
  state.secondaryAreas = previousPrimaryAreas;
  persistAreaSelection('primary');
  persistAreaSelection('secondary');
  persistAssignedCustomSlots();
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
  resetAutoScrollState();
  state.compareMode = !state.compareMode;
  localStorage.setItem(COMPARE_MODE_KEY, String(state.compareMode));
  if (state.compareMode) {
    await ensureSecondaryPrefecture(state.prefecture.id);
    if (state.primaryCustomSlotId || state.secondaryCustomSlotId) await ensureCustomPrefectureData();
  }
  updateComparisonControls();
  updatePageMeta();
  updateYoutubeToggle();
  updateMapVisibility();
  renderCameras();
  renderVisibilityEditor();
  renderHiddenImages();
  refreshYoutubeLiveStatus();
  if (state.scrollSpeed > 0) state.scrollFrame = requestAnimationFrame(autoScroll);
}

function updateComparisonControls() {
  if (!elements.comparisonToggleButton) return;
  elements.comparisonToggleButton.classList.toggle('is-active', state.compareMode);
  elements.comparisonToggleButton.setAttribute('aria-pressed', String(state.compareMode));
  elements.comparisonToggleButton.textContent = state.compareMode ? '1枠表示' : '2枠表示';
  if (elements.comparisonToggleButton) elements.comparisonToggleButton.hidden = state.isMobile || state.customMode;
  updateComparisonScrollModeControl();
  renderAreaSelect();
  updateGridColumnControl();
  updatePrefectureSelectionUI();
  updateVisibilityPrefectureSwitcher();
  updateMapVisibility();
}

function prefecturesForSource(source) {
  if (source.type === 'prefecture') return source.prefecture ? [source.prefecture] : [];
  const seen = new Set();
  const prefectures = [];
  for (const entry of source.entries || []) {
    if (seen.has(entry.prefecture.id)) continue;
    seen.add(entry.prefecture.id);
    prefectures.push(entry.prefecture);
  }
  return prefectures;
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
  const sources = state.compareMode
    ? [slotSource('primary'), slotSource('secondary')]
    : [currentSingleSource()];
  const seen = new Set();
  const result = [];
  for (const source of sources) {
    for (const prefecture of prefecturesForSource(source)) {
      if (seen.has(prefecture.id)) continue;
      seen.add(prefecture.id);
      result.push(prefecture);
    }
  }
  return result;
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

function youtubeEntriesForCurrentView({ liveOnly = true } = {}) {
  const keyword = normalizeText(state.search);
  const sources = state.customMode
    ? [{ type: 'custom', slotName: 'primary', name: 'カスタム', entries: selectedCustomEntries() }]
    : state.compareMode
      ? [slotSource('primary'), slotSource('secondary')]
      : [currentSingleSource()];
  const prefectureOrder = new Map(enabledPrefectures().map((prefecture, index) => [prefecture.id, index]));
  const result = [];
  const seen = new Set();

  for (const source of sources) {
    const entries = source.type === 'custom'
      ? source.entries
      : (source.prefecture?.cameras || []).map((camera) => ({
          key: customCameraKey(source.prefecture.id, camera.id),
          prefecture: source.prefecture,
          camera,
          area: source.prefecture.areas.find((area) => area.id === camera.area) || { id: camera.area, name: '', color: 'grey' }
        }));
    for (const entry of entries) {
      const { camera, prefecture } = entry;
      if (cameraMediaType(camera) !== 'youtube') continue;
      const key = customCameraKey(prefecture.id, camera.id);
      if (seen.has(key)) continue;
      if (source.type === 'prefecture') {
        if (source.hiddenIds?.has(camera.id)) continue;
        if (!cameraMatchesAreaSelection(camera, source.slotName || 'primary')) continue;
      }
      if (liveOnly && !isYoutubeCurrentlyLive(camera)) continue;
      const searchable = normalizeText([prefecture.name, camera.city, camera.place, camera.provider].filter(Boolean).join(' '));
      if (keyword && !searchable.includes(keyword)) continue;
      seen.add(key);
      result.push({ ...entry, key });
    }
  }

  result.sort((a, b) => (prefectureOrder.get(a.prefecture.id) ?? Number.MAX_SAFE_INTEGER)
    - (prefectureOrder.get(b.prefecture.id) ?? Number.MAX_SAFE_INTEGER)
    || compareCamerasForPrefecture(a.prefecture)(a.camera, b.camera));
  return result;
}

function youtubeCamerasForCurrentView() {
  return youtubeEntriesForCurrentView().map((entry) => entry.camera);
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

function youtubeThumbnailCandidates(camera) {
  const videoId = camera?.youtubeId || extractYoutubeVideoId(camera?.pageUrl || camera?.videoUrl || '');
  if (!videoId) return [];
  const safeId = encodeURIComponent(videoId);
  return [...new Set([
    camera?.thumbnailUrl,
    `https://i.ytimg.com/vi/${safeId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${safeId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${safeId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${safeId}/0.jpg`
  ].filter(Boolean))];
}

function setYoutubeSelectionThumbnail(image, camera, media) {
  const candidates = youtubeThumbnailCandidates(camera);
  let candidateIndex = 0;
  image.referrerPolicy = 'no-referrer';
  image.classList.add('youtubeSelectionThumbnail');
  const loadNext = () => {
    if (candidateIndex >= candidates.length) {
      media.classList.add('error');
      image.removeAttribute('src');
      return;
    }
    media.classList.remove('error');
    image.src = candidates[candidateIndex++];
  };
  image.addEventListener('load', () => media.classList.remove('error'));
  image.addEventListener('error', loadNext);
  loadNext();
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
