const DATA_ROOT = './data';
const Leaflet = window.L;
const NARA_RIVER_SOURCE = 'naraPrefectureRiver';
const NARA_RIVER_INTERVAL_MS = 10 * 60 * 1000;
const NARA_RIVER_MAX_FALLBACKS = 6;
const JAPANESE_COLLATOR = new Intl.Collator('ja-JP', { numeric: true, sensitivity: 'base' });

const elements = {
  pageSubtitle: document.querySelector('#pageSubtitle'),
  prefectureName: document.querySelector('#prefectureName'),
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
  visibilitySearch: document.querySelector('#visibilitySearch'),
  visibilityList: document.querySelector('#visibilityList'),
  showAllCamerasButton: document.querySelector('#showAllCamerasButton'),
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
  mapContainer: document.querySelector('#map'),
  mapHint: document.querySelector('#mapHint')
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
  previousScrollTime: 0,
  countdownTimer: null,
  stickyObserver: null,
  mapResizeObserver: null,
  mapRefreshFrame: null,
  mapRefreshTimers: []
};

init().catch((error) => {
  console.error(error);
  showStatus('データまたは地図を読み込めませんでした。GitHub Pages上で再読み込みしてください。');
});

async function init() {
  if (!Leaflet) throw new Error('Leafletを読み込めませんでした。');
  bindEvents();
  setupStickyStackObserver();
  state.prefectures = await fetchJson(`${DATA_ROOT}/prefectures.json`);
  renderPrefectureNavigation();

  const requested = new URLSearchParams(location.search).get('pref');
  const prefectureId = findEnabledPrefecture(requested)
    ? requested
    : state.prefectures.defaultPrefecture;

  await loadPrefecture(prefectureId);
  startClock();
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

async function loadPrefecture(prefectureId) {
  showStatus('ライブカメラデータを読み込んでいます。');
  const data = await fetchJson(`${DATA_ROOT}/cameras/${prefectureId}.json`);

  state.prefecture = data;
  state.area = 'all';
  state.search = '';
  state.visibilitySearch = '';
  state.showYoutube = false;
  state.selectedCameraId = null;
  state.hiddenCameraIds = loadHiddenCameraIds(prefectureId, data.cameras);
  elements.youtubeViewer.classList.remove('open');
  elements.youtubeViewer.setAttribute('aria-hidden', 'true');
  updateBodyScrollLock();

  elements.cameraSearch.value = '';
  elements.visibilitySearch.value = '';

  updatePageMeta();
  updateYoutubeToggle();
  renderAreaSelect();
  initializeOrResetMap();
  renderCameras();
  renderVisibilityEditor();
  highlightNavigation(prefectureId);
  hideStatus();

  const url = new URL(location.href);
  url.searchParams.set('pref', prefectureId);
  history.replaceState(null, '', url);
  closeAllSidePanels();
}

function updatePageMeta() {
  const hasYoutube = state.prefecture.cameras.some((camera) => cameraMediaType(camera) === 'youtube');
  document.title = `${state.prefecture.name}ライブカメラ｜全国ライブカメラ`;
  elements.pageSubtitle.textContent = `${state.prefecture.region}地方・${state.prefecture.name}`;
  elements.prefectureName.textContent = state.prefecture.name;
  elements.youtubeToggle.hidden = !hasYoutube;
}

function updateYoutubeToggle() {
  elements.youtubeToggle.setAttribute('aria-pressed', String(state.showYoutube));
  elements.youtubeToggle.classList.toggle('is-active', state.showYoutube);
  elements.youtubeToggleLabel.textContent = state.showYoutube ? 'YouTube ON' : 'YouTube OFF';
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
      button.textContent = prefecture.name;
      button.disabled = !prefecture.enabled;
      if (prefecture.enabled) {
        button.addEventListener('click', () => loadPrefecture(prefecture.id));
      }
      list.appendChild(button);
    }

    section.append(heading, list);
    fragment.appendChild(section);
  }

  elements.prefectureNavigation.replaceChildren(fragment);
}

function highlightNavigation(prefectureId) {
  document.querySelectorAll('.prefectureButton').forEach((button) => {
    button.classList.toggle('active', button.dataset.prefectureId === prefectureId);
  });
}

function renderAreaSelect() {
  const options = [new Option('全域', 'all')];
  for (const area of state.prefecture.areas) {
    options.push(new Option(area.name, area.id));
  }
  elements.areaSelect.replaceChildren(...options);
  elements.areaSelect.value = 'all';
}

function initializeOrResetMap() {
  const center = [state.prefecture.center.latitude, state.prefecture.center.longitude];

  if (!state.map) {
    state.map = Leaflet.map(elements.mapContainer, {
      zoomControl: true,
      preferCanvas: false
    }).setView(center, state.prefecture.zoom);

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
    state.map.setView(center, state.prefecture.zoom);
  }

  state.markers.clear();
  scheduleMapRefresh();
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
  if (!state.map) return;

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

  const imageCameras = filteredCameras('image').sort(compareCamerasByMunicipality);
  const youtubeCameras = state.showYoutube
    ? filteredCameras('youtube').sort(compareCamerasByMunicipality)
    : [];
  const fragment = document.createDocumentFragment();
  const visibleIds = new Set();

  state.markerLayer.clearLayers();
  state.markers.clear();

  const cityGroups = new Map();
  for (const camera of imageCameras) {
    const city = municipalityName(camera.city);
    if (!cityGroups.has(city)) cityGroups.set(city, []);
    cityGroups.get(city).push(camera);
  }

  for (const [city, cityCameras] of cityGroups) {
    const firstArea = findArea(cityCameras[0]?.area);
    const section = document.createElement('section');
    section.className = 'areaSection municipalitySection';
    section.id = `city-${slugForId(city)}`;
    section.style.setProperty('--area-color', markerCssColor(firstArea?.color));

    const title = document.createElement('h2');
    title.className = 'areaTitle';
    title.textContent = city;

    const grid = document.createElement('div');
    grid.className = 'cameraGrid';

    for (const camera of cityCameras) {
      const area = findArea(camera.area);
      if (!area) continue;
      grid.appendChild(createCameraCard(camera, area));
      addMarker(camera, area);
      visibleIds.add(camera.id);
    }

    section.append(title, grid);
    fragment.appendChild(section);
  }

  for (const camera of youtubeCameras) {
    const area = findArea(camera.area);
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

function filteredCameras(mediaType = 'image') {
  const keyword = normalizeText(state.search);

  return state.prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) !== mediaType) return false;
    if (state.hiddenCameraIds.has(camera.id)) return false;
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

function createCameraCard(camera, area) {
  const card = document.createElement('article');
  card.className = 'cameraCard';
  card.id = `camera-${camera.id}`;
  card.dataset.cameraId = camera.id;
  card.style.setProperty('--area-color', markerCssColor(area.color));

  const header = document.createElement('div');
  header.className = 'cardHeader';

  const city = document.createElement('div');
  city.className = 'city';
  city.textContent = camera.city;
  header.appendChild(city);

  const media = document.createElement('div');
  media.className = 'cameraMedia';

  const image = document.createElement('img');
  image.className = 'cameraImage';
  image.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のライブカメラ画像`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.dataset.cameraId = camera.id;

  setCameraImageSource(image, camera, 0);

  image.addEventListener('click', () => openViewer(camera, image.currentSrc || image.src));
  image.addEventListener('mouseenter', () => focusCamera(camera.id, false));
  image.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
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

  card.addEventListener('mouseleave', () => releaseCameraFocus(camera.id));
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
  document.querySelectorAll('.cameraImage[data-camera-id]').forEach((image) => {
    const camera = state.prefecture?.cameras.find((item) => item.id === image.dataset.cameraId);
    if (!camera) return;
    image.closest('.cameraMedia')?.classList.remove('error');
    setCameraImageSource(image, camera, 0);
  });
}

function addMarker(camera, area) {
  const type = cameraMediaType(camera);
  const marker = Leaflet.marker([camera.latitude, camera.longitude], {
    icon: type === 'youtube' ? createYoutubeMarkerIcon() : createMarkerIcon(area.color),
    title: `${camera.city} ${stripTerrainPrefix(camera.place)}`,
    keyboard: true
  });

  const typeText = type === 'youtube' ? '<br><strong>YouTubeライブ</strong>' : '';
  marker.bindTooltip(
    `${escapeHtml(camera.city)}<br>${escapeHtml(stripTerrainPrefix(camera.place))}${typeText}`,
    { direction: 'top', offset: [0, -24], permanent: false, sticky: false }
  );

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
  const camera = state.prefecture?.cameras.find((item) => item.id === cameraId);
  if (!camera) return;

  state.selectedCameraId = cameraId;
  document.querySelectorAll('.cameraCard.selected').forEach((card) => card.classList.remove('selected'));

  const card = document.querySelector(`#camera-${CSS.escape(cameraId)}`);
  card?.classList.add('selected');
  if (scrollToCard) card?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const marker = state.markers.get(cameraId);
  if (marker && state.map) {
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
  if (!state.map) return;

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
  if (!state.prefecture || !state.map) return;
  state.map.setView(
    [state.prefecture.center.latitude, state.prefecture.center.longitude],
    state.prefecture.zoom,
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
  const intervalMs = state.prefecture.refreshIntervalMinutes * 60 * 1000;
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
  const cameras = filteredCameras('youtube').sort(compareCamerasByMunicipality);
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
    thumbnail.src = camera.thumbnailUrl || youtubeThumbnailUrl(camera.youtubeId);
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

    const city = document.createElement('strong');
    city.textContent = municipalityName(camera.city);

    const place = document.createElement('span');
    place.textContent = stripTerrainPrefix(camera.place);

    text.append(city, place);
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

function saveHiddenCameraIds() {
  if (!state.prefecture) return;
  try {
    localStorage.setItem(
      hiddenStorageKey(state.prefecture.id),
      JSON.stringify([...state.hiddenCameraIds])
    );
  } catch (error) {
    console.warn('非表示設定を保存できませんでした。', error);
  }
}

function renderVisibilityEditor() {
  if (!state.prefecture) return;

  const keyword = normalizeText(state.visibilitySearch);
  const cameras = state.prefecture.cameras.filter((camera) => {
    if (!keyword) return true;
    return normalizeText([
      camera.city,
      stripTerrainPrefix(camera.place),
      camera.provider,
      camera.riverName
    ].filter(Boolean).join(' ')).includes(keyword);
  });

  const fragment = document.createDocumentFragment();
  const groups = [
    ...state.prefecture.areas.map((area) => ({ id: area.id, name: area.name })),
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
      fragment.appendChild(createVisibilityRow(camera));
    }
  }

  if (!cameras.length) {
    const empty = document.createElement('div');
    empty.className = 'visibilityEmpty';
    empty.textContent = '条件に一致するカメラはありません。';
    fragment.appendChild(empty);
  }

  elements.visibilityList.replaceChildren(fragment);
}

function createVisibilityRow(camera) {
  const row = document.createElement('label');
  row.className = 'visibilityRow';
  row.classList.toggle('is-hidden', state.hiddenCameraIds.has(camera.id));

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !state.hiddenCameraIds.has(camera.id);
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
  row.append(checkbox, name);

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      state.hiddenCameraIds.delete(camera.id);
    } else {
      state.hiddenCameraIds.add(camera.id);
    }
    row.classList.toggle('is-hidden', !checkbox.checked);
    saveHiddenCameraIds();
    renderCameras();
  });

  return row;
}

function openPrefecturePanel() {
  closeVisibilityPanel(false);
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
  renderVisibilityEditor();
  elements.visibilityPanel.classList.add('open');
  elements.visibilityPanel.setAttribute('aria-hidden', 'false');
  elements.visibilityEditButton.setAttribute('aria-expanded', 'true');
  elements.panelBackdrop.hidden = false;
  stopAutoScroll();
  window.setTimeout(() => elements.visibilitySearch.focus(), 220);
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
  elements.panelBackdrop.hidden = true;
}

function updatePanelBackdrop() {
  const anyOpen = elements.prefecturePanel.classList.contains('open')
    || elements.visibilityPanel.classList.contains('open');
  elements.panelBackdrop.hidden = !anyOpen;
}

function setScrollSpeed(value) {
  state.scrollSpeed = Number(value) || 0;
  state.previousScrollTime = performance.now();
  cancelAnimationFrame(state.scrollFrame);
  if (state.scrollSpeed > 0) state.scrollFrame = requestAnimationFrame(autoScroll);
}

function autoScroll(timestamp) {
  if (state.scrollSpeed <= 0) return;
  const elapsed = Math.min(100, timestamp - state.previousScrollTime) / 1000;
  state.previousScrollTime = timestamp;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const next = window.scrollY + state.scrollSpeed * elapsed;
  window.scrollTo({ top: next >= maxScroll - 1 ? 0 : next, behavior: 'auto' });
  state.scrollFrame = requestAnimationFrame(autoScroll);
}

function stopAutoScroll() {
  state.scrollSpeed = 0;
  elements.scrollSpeedSelect.value = '0';
  cancelAnimationFrame(state.scrollFrame);
}

function bindEvents() {
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
  elements.visibilitySearch.addEventListener('input', (event) => {
    state.visibilitySearch = event.target.value;
    renderVisibilityEditor();
  });
  elements.showAllCamerasButton.addEventListener('click', () => {
    state.hiddenCameraIds.clear();
    saveHiddenCameraIds();
    renderVisibilityEditor();
    renderCameras();
  });

  elements.refreshButton.addEventListener('click', refreshImages);
  elements.resetMapButton.addEventListener('click', resetMap);
  elements.scrollSpeedSelect.addEventListener('change', (event) => setScrollSpeed(event.target.value));
  window.addEventListener('wheel', stopAutoScroll, { passive: true });
  window.addEventListener('touchstart', stopAutoScroll, { passive: true });
  window.addEventListener('resize', () => {
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

function findArea(areaId) {
  return state.prefecture.areas.find((area) => area.id === areaId);
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
