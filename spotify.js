/* ============================================================
   SPOTIFY-INTEGRATION
   PKCE-Login (kein Server nötig), Geräteauswahl, Track-Steuerung.
   ============================================================ */

const SPOTIFY_CLIENT_ID = '455b0f8307db4cb7906eb42d7e5b3ef6';
const SPOTIFY_SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
const SPOTIFY_TOKEN_KEY = 'party-bingo-spotify-tokens-v1';
const SPOTIFY_VERIFIER_KEY = 'party-bingo-spotify-pkce-verifier';

function spotifyRedirectUri(){
  // Muss exakt (inkl. Slash/Groß-Kleinschreibung) im Spotify-Dashboard als Redirect-URI hinterlegt sein.
  return window.location.origin + window.location.pathname;
}

/* ---------- PKCE Hilfsfunktionen ---------- */

function base64UrlEncode(buffer){
  let str = '';
  const bytes = new Uint8Array(buffer);
  for(let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(){
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer).slice(0, 128);
}

async function generateCodeChallenge(verifier){
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

/* ---------- Token-Verwaltung ---------- */

function saveTokens(tokens){
  const withExpiry = { ...tokens, obtained_at: Date.now() };
  localStorage.setItem(SPOTIFY_TOKEN_KEY, JSON.stringify(withExpiry));
}

function loadTokens(){
  try{
    const raw = localStorage.getItem(SPOTIFY_TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}

function isConnected(){
  return !!loadTokens();
}

function disconnect(){
  localStorage.removeItem(SPOTIFY_TOKEN_KEY);
}

async function getAccessToken(){
  const tokens = loadTokens();
  if(!tokens) return null;
  const ageMs = Date.now() - tokens.obtained_at;
  const stillValid = ageMs < (tokens.expires_in * 1000 - 60000); // 1 Min. Puffer
  if(stillValid) return tokens.access_token;
  return await refreshAccessToken(tokens.refresh_token);
}

async function refreshAccessToken(refreshToken){
  if(!refreshToken) return null;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: SPOTIFY_CLIENT_ID
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if(!res.ok) { disconnect(); return null; }
  const data = await res.json();
  // Spotify liefert bei Refresh nicht immer einen neuen refresh_token mit
  if(!data.refresh_token) data.refresh_token = refreshToken;
  saveTokens(data);
  return data.access_token;
}

/* ---------- Login-Flow ---------- */

async function connect(){
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: spotifyRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
}

async function handleRedirect(){
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if(!code) return false;

  const verifier = sessionStorage.getItem(SPOTIFY_VERIFIER_KEY);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: spotifyRedirectUri(),
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  // Code aus der URL entfernen, damit ein Reload nicht erneut versucht, ihn einzulösen
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  window.history.replaceState({}, document.title, url.pathname + url.search);

  if(!res.ok) return false;
  const data = await res.json();
  saveTokens(data);
  return true;
}

/* ---------- Web API Aufrufe ---------- */

async function apiFetch(path, options = {}){
  const token = await getAccessToken();
  if(!token) throw new Error('Nicht mit Spotify verbunden');
  const res = await fetch('https://api.spotify.com/v1' + path, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if(res.status === 204) return null;
  if(!res.ok){
    const text = await res.text().catch(() => '');
    throw new Error(`Spotify API Fehler ${res.status}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

async function getDevices(){
  const data = await apiFetch('/me/player/devices');
  return (data && data.devices) || [];
}

const trackDurationCache = {};

async function getTrackDuration(trackUri){
  const id = trackUri.split(':').pop();
  if(trackDurationCache[id]) return trackDurationCache[id];
  const data = await apiFetch('/tracks/' + id);
  const ms = data.duration_ms;
  trackDurationCache[id] = ms;
  return ms;
}

async function playTrack(trackUri, deviceId){
  const query = deviceId ? ('?device_id=' + encodeURIComponent(deviceId)) : '';
  await apiFetch('/me/player/play' + query, {
    method: 'PUT',
    body: JSON.stringify({ uris: [trackUri] })
  });
}

async function pausePlayback(deviceId){
  const query = deviceId ? ('?device_id=' + encodeURIComponent(deviceId)) : '';
  try{ await apiFetch('/me/player/pause' + query, { method: 'PUT' }); }catch(e){ /* egal, evtl. schon pausiert */ }
}

async function resumePlayback(deviceId){
  const query = deviceId ? ('?device_id=' + encodeURIComponent(deviceId)) : '';
  await apiFetch('/me/player/play' + query, { method: 'PUT' });
}

/* ---------- Web Playback SDK (Browser-Tab als Gerät) ---------- */

let sdkReady = false;
let sdkPlayer = null;
let sdkDeviceId = null;

window.onSpotifyWebPlaybackSDKReady = () => { sdkReady = true; };

function initLocalPlayer(){
  return new Promise((resolve, reject) => {
    const tryInit = () => {
      if(!sdkReady){ setTimeout(tryInit, 200); return; }
      if(sdkPlayer && sdkDeviceId){ resolve(sdkDeviceId); return; }

      sdkPlayer = new Spotify.Player({
        name: 'Pauls Soundsystem-Bingo (Laptop)',
        getOAuthToken: cb => { getAccessToken().then(token => cb(token)); },
        volume: 1.0
      });

      sdkPlayer.addListener('ready', ({ device_id }) => {
        sdkDeviceId = device_id;
        resolve(device_id);
      });
      sdkPlayer.addListener('not_ready', () => { sdkDeviceId = null; });
      sdkPlayer.addListener('initialization_error', ({ message }) => reject(new Error(message)));
      sdkPlayer.addListener('authentication_error', ({ message }) => reject(new Error(message)));
      sdkPlayer.addListener('account_error', ({ message }) => reject(new Error('Spotify Premium wird benötigt: ' + message)));

      sdkPlayer.connect();
    };
    tryInit();
  });
}

/* ---------- Öffentliche API ---------- */

window.SpotifyIntegration = {
  isConnected,
  connect,
  disconnect,
  handleRedirect,
  getDevices,
  initLocalPlayer,
  playTrack,
  pausePlayback,
  resumePlayback,
  getTrackDuration,
  LOCAL_DEVICE_LABEL: 'Dieser Laptop (Browser)'
};
