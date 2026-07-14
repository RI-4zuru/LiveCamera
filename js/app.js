const DATA_ROOT = './data';
const MARKER_ICON_ROOT = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img';
const MARKER_SHADOW = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const elements = {
  pageSubtitle: document.querySelector('#pageSubtitle'),
  prefectureName: document.querySelector('#prefectureName'),
  cameraCount: document.querySelector('#cameraCount'),
  youtubeToggle: document.querySelector('#youtubeToggle'),
  youtubeCount: document.querySelector('#youtubeCount'),
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
  panelBackdrop: document.querySelector('#panelBackdrop'),
  prefectureNavigation: document.querySelector('#prefectureNavigation'),
  viewer: document.querySelector('#viewer'),
  viewerImage: document.querySelector('#viewerImage'),
  viewerCaption: document.querySelector('#viewerCaption'),
  viewerClose: document.querySelector('#viewerClose')
};

const state = {
  prefectures: null,
  prefecture: null,
  area: 'all',
  search: '',
  showYoutube: false,
  map: null,
  markers: new Map(),
  markerLayer: null,
  selectedCameraId: null,
  scrollSpeed: 0,
  scrollFrame: null,
  previousScrollTime: 0,
  countdownTimer: null
};

init().catch((error) => {
  console.error(error);
  showStatus('データを読み込めませんでした。GitHub Pagesまたはローカルサーバー上で開いてください。');
});

async function init() {
  bindEvents();
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
  state.showYoutube = false;
  elements.cameraSearch.value = '';
  updateYoutubeToggle();

  updatePageMeta();
  renderAreaSelect();
  initializeOrResetMap();
  renderCameras();
  highlightNavigation(prefectureId);
  hideStatus();

  const url = new URL(location.href);
  url.searchParams.set('pref', prefectureId);
  history.replaceState(null, '', url);
  closePrefecturePanel();
}

function updatePageMeta() {
  const stillCount = state.prefecture.cameras.filter((camera) => cameraMediaType(camera) === 'image').length;
  const youtubeCount = state.prefecture.cameras.filter((camera) => cameraMediaType(camera) === 'youtube').length;
  document.title = `${state.prefecture.name}ライブカメラ｜全国ライブカメラ`;
  elements.pageSubtitle.textContent = `${state.prefecture.region}地方・${state.prefecture.name}`;
  elements.prefectureName.textContent = state.prefecture.name;
  elements.cameraCount.textContent = `${stillCount}地点（静止画）`;
  elements.youtubeCount.textContent = youtubeCount;
  elements.youtubeToggle.hidden = youtubeCount === 0;
}

function updateYoutubeToggle() {
  elements.youtubeToggle.setAttribute('aria-pressed', String(state.showYoutube));
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
    state.map = L.map('map', { zoomControl: true }).setView(center, state.prefecture.zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
    state.markerLayer = L.layerGroup().addTo(state.map);
  } else {
    state.markerLayer.clearLayers();
    state.map.setView(center, state.prefecture.zoom);
  }
  state.markers.clear();
  setTimeout(() => state.map.invalidateSize(), 0);
}

function renderCameras() {
  const cameras = filteredCameras();
  const fragment = document.createDocumentFragment();
  const visibleIds = new Set(cameras.map((camera) => camera.id));

  state.markerLayer.clearLayers();
  state.markers.clear();

  for (const area of state.prefecture.areas) {
    const areaCameras = cameras.filter((camera) => camera.area === area.id);
    if (!areaCameras.length) continue;

    const section = document.createElement('section');
    section.className = 'areaSection';
    section.id = `area-${area.id}`;
    section.style.setProperty('--area-color', markerCssColor(area.color));

    const title = document.createElement('h2');
    title.className = 'areaTitle';
    title.innerHTML = `${escapeHtml(area.name)} <span class="areaCount">${areaCameras.length}地点</span>`;

    const grid = document.createElement('div');
    grid.className = 'cameraGrid';

    for (const camera of areaCameras) {
      grid.appendChild(createCameraCard(camera, area));
      addMarker(camera, area);
    }

    section.append(title, grid);
    fragment.appendChild(section);
  }

  if (!cameras.length) {
    const empty = document.createElement('div');
    empty.className = 'emptyState';
    empty.textContent = '条件に一致するライブカメラはありません。';
    fragment.appendChild(empty);
  }

  elements.content.replaceChildren(fragment);
  const available = state.prefecture.cameras.filter((camera) => state.showYoutube || cameraMediaType(camera) !== 'youtube');
  const visibleStill = cameras.filter((camera) => cameraMediaType(camera) === 'image').length;
  const visibleYoutube = cameras.filter((camera) => cameraMediaType(camera) === 'youtube').length;
  const typeLabel = state.showYoutube
    ? `静止画${visibleStill}・YouTube${visibleYoutube}`
    : '静止画';
  elements.cameraCount.textContent = `${cameras.length} / ${available.length}地点（${typeLabel}）`;
  fitMapToVisibleMarkers(visibleIds);
}

function filteredCameras() {
  const keyword = normalizeText(state.search);
  return state.prefecture.cameras.filter((camera) => {
    if (cameraMediaType(camera) === 'youtube' && !state.showYoutube) return false;
    if (state.area !== 'all' && camera.area !== state.area) return false;
    if (!keyword) return true;
    return normalizeText(`${camera.city} ${camera.place} ${camera.terrain ?? ''} ${camera.provider ?? ''}`).includes(keyword);
  });
}

function createCameraCard(camera, area) {
  const type = cameraMediaType(camera);
  const card = document.createElement('article');
  card.className = `cameraCard ${type === 'youtube' ? 'youtubeCard' : ''}`.trim();
  card.id = `camera-${camera.id}`;
  card.dataset.cameraId = camera.id;
  card.style.setProperty('--area-color', markerCssColor(area.color));

  const header = document.createElement('div');
  header.className = 'cardHeader';
  const city = document.createElement('div');
  city.className = 'city';
  city.textContent = camera.city;
  header.appendChild(city);

  const badge = document.createElement('span');
  badge.className = `terrainBadge ${type === 'youtube' ? 'youtubeBadge' : ''}`.trim();
  badge.textContent = type === 'youtube' ? 'YouTube' : (camera.terrain || '静止画');
  header.appendChild(badge);

  const media = document.createElement('div');
  media.className = `cameraMedia ${type === 'youtube' ? 'youtubeMedia' : ''}`.trim();

  if (type === 'youtube') {
    const frame = document.createElement('iframe');
    frame.className = 'youtubeFrame';
    frame.src = youtubeEmbedUrl(camera.youtubeId);
    frame.title = `${camera.city} ${stripTerrainPrefix(camera.place)}のYouTubeライブカメラ`;
    frame.loading = 'lazy';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;

    const fallback = document.createElement('a');
    fallback.className = 'youtubeFallback';
    fallback.href = camera.pageUrl;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = '▶ YouTubeで開く';
    media.append(frame, fallback);
  } else {
    const image = document.createElement('img');
    image.className = 'cameraImage';
    image.src = cacheBustedUrl(camera.imageUrl);
    image.alt = `${camera.city} ${stripTerrainPrefix(camera.place)}のライブカメラ画像`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.dataset.baseUrl = camera.imageUrl;
    image.addEventListener('click', () => openViewer(camera));
    image.addEventListener('mouseenter', () => focusCamera(camera.id, false));
    image.addEventListener('error', () => media.classList.add('error'));
    image.addEventListener('load', () => media.classList.remove('error'));
    const error = document.createElement('div');
    error.className = 'imageError';
    error.textContent = '画像を取得できませんでした。地点名のリンクから提供元ページを確認してください。';
    media.append(image, error);
  }

  const footer = document.createElement('div');
  footer.className = 'cardFooter';
  const link = document.createElement('a');
  link.className = 'placeLink';
  link.href = camera.pageUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = camera.place;
  link.title = '提供元ページを開く';
  const coordinates = document.createElement('div');
  coordinates.className = 'coordinates';
  coordinates.textContent = `緯度 ${camera.latitude.toFixed(4)} / 経度 ${camera.longitude.toFixed(4)}`;
  footer.append(link, coordinates);

  card.addEventListener('mouseenter', () => focusCamera(camera.id, false));
  card.append(header, media, footer);
  return card;
}

function addMarker(camera, area) {
  const type = cameraMediaType(camera);
  const marker = L.marker([camera.latitude, camera.longitude], {
    icon: type === 'youtube' ? createYoutubeMarkerIcon() : createMarkerIcon(area.color),
    title: `${camera.city} ${camera.place}`
  });

  const typeText = type === 'youtube' ? '<br><strong>YouTubeライブ</strong>' : '';
  marker.bindTooltip(`${escapeHtml(camera.city)}<br>${escapeHtml(camera.place)}${typeText}`, {
    direction: 'top',
    offset: [0, -24]
  });
  marker.on('click', () => {
    focusCamera(camera.id, true);
    if (type === 'image') openViewer(camera);
  });
  marker.addTo(state.markerLayer);
  state.markers.set(camera.id, marker);
}

function createYoutubeMarkerIcon() {
  return L.divIcon({
    className: '',
    html: '<span class="youtubeMarker" aria-hidden="true">▶</span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

function createMarkerIcon(color) {
  return L.icon({
    iconUrl: `${MARKER_ICON_ROOT}/marker-icon-${color}.png`,
    shadowUrl: MARKER_SHADOW,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

function focusCamera(cameraId, scrollToCard) {
  const camera = state.prefecture.cameras.find((item) => item.id === cameraId);
  if (!camera) return;

  state.selectedCameraId = cameraId;
  document.querySelectorAll('.cameraCard.selected').forEach((card) => card.classList.remove('selected'));
  const card = document.querySelector(`#camera-${CSS.escape(cameraId)}`);
  card?.classList.add('selected');
  if (scrollToCard) card?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const marker = state.markers.get(cameraId);
  if (marker) {
    state.map.panTo(marker.getLatLng(), { animate: true, duration: 0.35 });
    marker.openTooltip();
  }
}

function fitMapToVisibleMarkers(visibleIds = new Set(state.markers.keys())) {
  const latLngs = [...visibleIds]
    .map((id) => state.markers.get(id)?.getLatLng())
    .filter(Boolean);

  if (!latLngs.length) {
    resetMap();
  } else if (latLngs.length === 1) {
    state.map.setView(latLngs[0], 13);
  } else {
    state.map.fitBounds(L.latLngBounds(latLngs), { padding: [28, 28], maxZoom: 12 });
  }
}

function resetMap() {
  if (!state.prefecture || !state.map) return;
  state.map.setView(
    [state.prefecture.center.latitude, state.prefecture.center.longitude],
    state.prefecture.zoom
  );
}

function refreshImages() {
  document.querySelectorAll('.cameraImage[data-base-url]').forEach((image) => {
    image.src = cacheBustedUrl(image.dataset.baseUrl);
  });
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

function startClock() {
  updateClock();
  clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(updateClock, 1000);
}

function updateClock() {
  const now = new Date();
  elements.clock.textContent = `現在時刻 ${new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(now)}`;

  if (!state.prefecture) return;
  const intervalMs = state.prefecture.refreshIntervalMinutes * 60 * 1000;
  const next = Math.floor(now.getTime() / intervalMs + 1) * intervalMs;
  const seconds = Math.max(0, Math.ceil((next - now.getTime()) / 1000));
  elements.countdown.textContent = `次回更新まで ${seconds}秒`;
  if (seconds === 1) setTimeout(refreshImages, 1100);
}

function openViewer(camera) {
  if (cameraMediaType(camera) !== 'image') return;
  elements.viewerImage.src = cacheBustedUrl(camera.imageUrl);
  elements.viewerImage.alt = `${camera.city} ${camera.place}`;
  elements.viewerCaption.textContent = `${camera.city}｜${camera.place}`;
  elements.viewer.classList.add('open');
  elements.viewer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  elements.viewerClose.focus();
}

function closeViewer() {
  elements.viewer.classList.remove('open');
  elements.viewer.setAttribute('aria-hidden', 'true');
  elements.viewerImage.src = '';
  document.body.style.overflow = '';
}

function openPrefecturePanel() {
  elements.prefecturePanel.classList.add('open');
  elements.prefecturePanel.setAttribute('aria-hidden', 'false');
  elements.prefectureMenuButton.setAttribute('aria-expanded', 'true');
  elements.panelBackdrop.hidden = false;
}

function closePrefecturePanel() {
  elements.prefecturePanel.classList.remove('open');
  elements.prefecturePanel.setAttribute('aria-hidden', 'true');
  elements.prefectureMenuButton.setAttribute('aria-expanded', 'false');
  elements.panelBackdrop.hidden = true;
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
    state.showYoutube = !state.showYoutube;
    updateYoutubeToggle();
    renderCameras();
  });
  elements.refreshButton.addEventListener('click', refreshImages);
  elements.resetMapButton.addEventListener('click', resetMap);
  elements.scrollSpeedSelect.addEventListener('change', (event) => setScrollSpeed(event.target.value));
  window.addEventListener('wheel', stopAutoScroll, { passive: true });
  window.addEventListener('touchstart', stopAutoScroll, { passive: true });

  elements.prefectureMenuButton.addEventListener('click', openPrefecturePanel);
  elements.prefectureMenuClose.addEventListener('click', closePrefecturePanel);
  elements.panelBackdrop.addEventListener('click', closePrefecturePanel);

  elements.viewerClose.addEventListener('click', closeViewer);
  elements.viewer.addEventListener('click', (event) => {
    if (event.target === elements.viewer) closeViewer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeViewer();
      closePrefecturePanel();
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

function youtubeEmbedUrl(videoId) {
  const safeId = encodeURIComponent(videoId ?? '');
  return `https://www.youtube-nocookie.com/embed/${safeId}?playsinline=1&rel=0`;
}

function normalizeText(text) {
  return text.normalize('NFKC').toLocaleLowerCase('ja-JP').replace(/\s+/g, '');
}

function stripTerrainPrefix(place) {
  return place.replace(/^【[^】]+】/, '').trim();
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
    blue: '#2a7be4', green: '#2d9d61', violet: '#8a5de8',
    orange: '#ec8b2e', red: '#df4b4b', yellow: '#d1a500',
    grey: '#64748b', black: '#1f2937', gold: '#b7791f'
  };
  return colors[color] ?? '#64748b';
}
