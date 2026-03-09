/* ═══════════════════════════════════════════════════════════════════
   FlixTN v3.0 — Production Ready
   • Fixed auth (login/register/session persistence)
   • Admin CRUD fully connected to Supabase
   • Full profile page
   • Series → Seasons → Episodes management
   • Loading skeletons, search, favorites, history
═══════════════════════════════════════════════════════════════════ */

// ── CONFIG (CHANGE THESE) ────────────────────────────────────────
const SUPABASE_URL  = "https://XXXXXXXXXXXXXXXX.supabase.co"; // ← PUT YOUR URL
const SUPABASE_ANON = "eyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // ← PUT YOUR KEY
// ────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { createClient } = supabase;

// Supabase client — persists session in localStorage automatically
const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
});

/* ═══════════ GLOBAL CSS ════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&family=Oswald:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:    #050510;
  --bg1:   #0a0a1a;
  --bg2:   #0f0f22;
  --bg3:   #161630;
  --s1:    #1c1c3a;
  --s2:    #222244;
  --s3:    #2a2a55;
  --s4:    #323268;

  --red:   #e50914;
  --red2:  #ff1f2b;
  --red3:  #ff6b6b;
  --redbg: rgba(229,9,20,.12);
  --redbr: rgba(229,9,20,.3);

  --gold:  #f5c518;
  --cyan:  #00d4ff;
  --green: #1db954;
  --purp:  #9b59b6;

  --t1: #f0f0ff;
  --t2: #a0a0cc;
  --t3: #606090;
  --t4: #404068;

  --r:  10px;
  --r2: 14px;
  --tr: 0.22s cubic-bezier(.4,0,.2,1);
  --shadow: 0 4px 24px rgba(0,0,0,.6);
  --glow: 0 0 30px rgba(229,9,20,.25);
}

html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--t1);
  font-family: 'Cairo', sans-serif;
  overflow-x: hidden;
  direction: rtl;
}
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg1); }
::-webkit-scrollbar-thumb { background: var(--red); border-radius: 3px; }

/* ── NAVBAR ───────────────────────────────────── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: .9rem 2.5rem; transition: background .4s, box-shadow .4s;
}
.nav.transparent { background: linear-gradient(to bottom,rgba(5,5,16,.95),transparent); }
.nav.solid       { background: rgba(5,5,16,.98); backdrop-filter: blur(24px); box-shadow: 0 1px 0 rgba(255,255,255,.05); }
.nav-logo {
  font-family: 'Oswald', sans-serif; font-size: 1.7rem; font-weight: 700;
  cursor: pointer; letter-spacing: -1px; user-select: none;
}
.nav-logo .f { color: #fff; }
.nav-logo .t { color: var(--red); }
.nav-links { display: flex; gap: 1.8rem; align-items: center; }
.nav-link {
  font-size: .82rem; cursor: pointer; color: var(--t2);
  transition: color var(--tr); padding: .3rem 0;
  border-bottom: 2px solid transparent; transition: color .2s, border-color .2s;
  white-space: nowrap;
}
.nav-link:hover, .nav-link.active { color: var(--t1); border-bottom-color: var(--red); }
.nav-right { display: flex; align-items: center; gap: .6rem; }
.nav-icon { background: none; border: none; color: var(--t1); font-size: 1.1rem; cursor: pointer; padding: .4rem; border-radius: 7px; transition: background var(--tr); }
.nav-icon:hover { background: var(--s2); }

.avatar-wrap { position: relative; }
.avatar-img {
  width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
  cursor: pointer; border: 2px solid var(--s3); transition: border-color var(--tr);
}
.avatar-img:hover { border-color: var(--red); }

.user-menu {
  position: absolute; left: 0; top: calc(100% + .7rem);
  background: var(--bg2); border: 1px solid var(--s3); border-radius: var(--r2);
  min-width: 230px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.8);
  animation: menuIn .2s ease;
}
@keyframes menuIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
.user-menu-head {
  padding: 1rem; display: flex; align-items: center; gap: .75rem;
  border-bottom: 1px solid var(--s2); background: var(--s1);
}
.user-menu-head img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--red); }
.user-menu-head .name { font-weight: 700; font-size: .82rem; }
.user-menu-head .email { font-size: .66rem; color: var(--t3); margin-top: .1rem; }
.menu-item {
  display: flex; align-items: center; gap: .65rem; padding: .75rem 1rem;
  font-size: .8rem; cursor: pointer; transition: background var(--tr); width: 100%;
  background: none; border: none; color: var(--t1); text-align: right;
}
.menu-item:hover { background: var(--s2); }
.menu-div { height: 1px; background: var(--s2); margin: .25rem 0; }

.btn-login  { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: var(--t1); padding: .42rem .95rem; border-radius: 7px; cursor: pointer; font-size: .8rem; font-family: 'Cairo',sans-serif; transition: background var(--tr); }
.btn-login:hover  { background: rgba(255,255,255,.16); }
.btn-signup { background: var(--red); border: none; color: #fff; padding: .42rem .95rem; border-radius: 7px; cursor: pointer; font-size: .8rem; font-family: 'Cairo',sans-serif; font-weight: 700; transition: background var(--tr); }
.btn-signup:hover { background: var(--red2); }

/* ── HERO ─────────────────────────────────────── */
.hero { position: relative; height: 100vh; min-height: 580px; display: flex; align-items: flex-end; overflow: hidden; }
.hero-bg { position: absolute; inset: 0; }
.hero-bg img { width: 100%; height: 100%; object-fit: cover; animation: kenBurns 22s ease infinite alternate; }
@keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.07); } }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg) 0%, rgba(5,5,16,.55) 40%, rgba(5,5,16,.1) 75%, transparent 100%); }
.hero-overlay2 { position: absolute; inset: 0; background: linear-gradient(to right, rgba(5,5,16,.7) 0%, transparent 60%); }
.hero-content { position: relative; z-index: 2; padding: 4rem 2.5rem; max-width: 680px; }
.hero-genres { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: .7rem; }
.genre-pill { background: var(--redbg); border: 1px solid var(--redbr); color: var(--red3); padding: .22rem .6rem; border-radius: 20px; font-size: .65rem; font-weight: 700; }
.hero-title { font-family: 'Oswald', sans-serif; font-size: clamp(2rem,5.5vw,3.8rem); font-weight: 700; line-height: 1.1; margin-bottom: .6rem; text-shadow: 0 2px 20px rgba(0,0,0,.5); }
.hero-meta { display: flex; gap: .8rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; font-size: .82rem; }
.hero-meta .rating { color: var(--gold); font-weight: 700; }
.hero-meta .match  { color: var(--green); font-weight: 700; }
.hero-desc { color: var(--t2); font-size: .9rem; line-height: 1.7; max-width: 540px; margin-bottom: 1.5rem; font-family: 'Tajawal', sans-serif; }
.hero-btns { display: flex; gap: .8rem; flex-wrap: wrap; }
.btn-play { background: var(--red); border: none; color: #fff; padding: .8rem 2rem; border-radius: 8px; cursor: pointer; font-size: .88rem; font-family: 'Cairo',sans-serif; font-weight: 700; display: flex; align-items: center; gap: .5rem; transition: all .25s; }
.btn-play:hover { background: var(--red2); transform: translateY(-2px); box-shadow: var(--glow); }
.btn-outline { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18); color: var(--t1); padding: .8rem 1.8rem; border-radius: 8px; cursor: pointer; font-size: .88rem; font-family: 'Cairo',sans-serif; font-weight: 600; backdrop-filter: blur(8px); transition: all .25s; }
.btn-outline:hover { background: rgba(255,255,255,.2); }

/* ── SECTIONS / ROWS ──────────────────────────── */
.row { padding: .5rem 0 2rem; }
.row-head { display: flex; align-items: center; justify-content: space-between; padding: .5rem 2.5rem 1rem; }
.row-head-left { display: flex; align-items: center; gap: .65rem; }
.row-bar { width: 4px; height: 22px; background: var(--red); border-radius: 2px; }
.row-title { font-family: 'Oswald',sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: .4px; }
.row-more { font-size: .72rem; color: var(--t3); cursor: pointer; transition: color var(--tr); }
.row-more:hover { color: var(--t1); }
.slider { display: flex; gap: 1rem; overflow-x: auto; padding: .3rem 2.5rem 1rem; scroll-snap-type: x mandatory; scrollbar-width: none; }
.slider::-webkit-scrollbar { display: none; }

/* ── CARDS ────────────────────────────────────── */
.card { flex-shrink: 0; width: 158px; cursor: pointer; position: relative; scroll-snap-align: start; transition: transform .28s, z-index 0s .28s; }
.card:hover { transform: translateY(-8px) scale(1.05); z-index: 5; transition: transform .28s; }
.card-img { width: 158px; height: 237px; object-fit: cover; border-radius: var(--r); background: var(--s2); display: block; transition: box-shadow .28s; }
.card:hover .card-img { box-shadow: 0 16px 48px rgba(229,9,20,.35); }
.card-overlay { position: absolute; inset: 0; border-radius: var(--r); background: linear-gradient(to top,rgba(5,5,16,.98) 0%,rgba(5,5,16,.2) 55%,transparent 100%); opacity: 0; transition: opacity .25s; }
.card:hover .card-overlay { opacity: 1; }
.card-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) scale(.75); width: 44px; height: 44px; border-radius: 50%; background: rgba(229,9,20,.92); display: flex; align-items: center; justify-content: center; opacity: 0; transition: all .25s; font-size: 1rem; }
.card:hover .card-play { opacity: 1; transform: translate(-50%,-50%) scale(1); }
.card-info { position: absolute; bottom: 0; left: 0; right: 0; padding: .65rem; opacity: 0; transition: opacity .25s; }
.card:hover .card-info { opacity: 1; }
.card-title { font-size: .72rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: .18rem; }
.card-meta { font-size: .62rem; color: var(--t3); display: flex; gap: .4rem; align-items: center; }
.card-badge { position: absolute; top: .5rem; right: .5rem; background: var(--red); color: #fff; font-size: .57rem; font-weight: 700; padding: .14rem .38rem; border-radius: 4px; font-family: 'Oswald',sans-serif; }
.card-fav { position: absolute; top: .5rem; left: .5rem; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.7); border: none; color: var(--red3); cursor: pointer; font-size: .8rem; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all .25s; }
.card:hover .card-fav { opacity: 1; }
.card-fav.on { opacity: 1; color: var(--red); }

/* RANK CARD */
.rank-card { flex-shrink: 0; width: 175px; cursor: pointer; display: flex; align-items: flex-end; scroll-snap-align: start; }
.rank-num { font-family: 'Oswald',sans-serif; font-size: 7.5rem; font-weight: 900; line-height: 1; color: transparent; -webkit-text-stroke: 3px var(--s3); margin-left: -18px; flex-shrink: 0; transition: -webkit-text-stroke-color .25s; }
.rank-card:hover .rank-num { -webkit-text-stroke-color: var(--red); }
.rank-img { width: 125px; height: 188px; object-fit: cover; border-radius: var(--r); background: var(--s2); transition: box-shadow .25s; }
.rank-card:hover .rank-img { box-shadow: 0 12px 40px rgba(229,9,20,.4); }

/* WIDE CARD */
.wide-card { flex-shrink: 0; width: 265px; cursor: pointer; scroll-snap-align: start; transition: transform .28s; }
.wide-card:hover { transform: translateY(-5px); }
.wide-img { width: 265px; height: 149px; object-fit: cover; border-radius: var(--r); background: var(--s2); display: block; transition: box-shadow .28s; }
.wide-card:hover .wide-img { box-shadow: 0 10px 35px rgba(229,9,20,.3); }
.wide-title { font-size: .78rem; font-weight: 700; padding: .5rem .2rem .1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wide-meta { font-size: .65rem; color: var(--t3); padding: 0 .2rem; }

/* SKELETON */
.skel { background: linear-gradient(90deg, var(--s2) 25%, var(--s3) 50%, var(--s2) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease infinite; border-radius: var(--r); }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.skel-card { width: 158px; height: 237px; flex-shrink: 0; }

/* ── DETAIL PAGE ──────────────────────────────── */
.detail-hero { position: relative; height: 62vh; min-height: 420px; display: flex; align-items: flex-end; overflow: hidden; }
.detail-hero-bg { position: absolute; inset: 0; }
.detail-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
.detail-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg) 0%, rgba(5,5,16,.6) 45%, transparent 100%); }
.detail-content { position: relative; z-index: 2; padding: 2.5rem; }
.detail-title { font-family: 'Oswald',sans-serif; font-size: clamp(1.5rem,4vw,3rem); font-weight: 700; line-height: 1.1; margin-bottom: .5rem; }
.detail-body { display: grid; grid-template-columns: 1fr 290px; gap: 2rem; padding: 2rem 2.5rem; max-width: 1400px; margin: 0 auto; }
@media(max-width:880px) { .detail-body { grid-template-columns: 1fr; } }
.detail-desc { color: var(--t2); font-size: .9rem; line-height: 1.8; margin-bottom: 1.5rem; font-family: 'Tajawal',sans-serif; }
.info-tags { display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.info-tag { background: var(--s2); border: 1px solid var(--s3); border-radius: 6px; padding: .28rem .65rem; font-size: .71rem; color: var(--t2); }
.cast-row { display: flex; gap: .8rem; flex-wrap: wrap; margin-top: .7rem; }
.cast-item { display: flex; flex-direction: column; align-items: center; gap: .3rem; width: 62px; }
.cast-img { width: 52px; height: 52px; border-radius: 50%; object-fit: cover; background: var(--s2); border: 2px solid var(--s3); }
.cast-name { font-size: .6rem; text-align: center; color: var(--t2); line-height: 1.2; }

/* Sidebar */
.sidebar-card { background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r2); padding: 1.2rem; margin-bottom: .9rem; }
.sidebar-title { font-family: 'Oswald',sans-serif; font-size: .82rem; font-weight: 600; letter-spacing: .4px; margin-bottom: .9rem; color: var(--t2); text-transform: uppercase; }
.act-btn { display: block; width: 100%; padding: .72rem; background: var(--s2); border: 1px solid var(--s3); border-radius: 8px; color: var(--t1); cursor: pointer; font-family: 'Cairo',sans-serif; font-size: .8rem; text-align: center; margin-bottom: .5rem; transition: all .25s; }
.act-btn:hover { background: var(--s3); border-color: var(--red); }
.act-btn.fav-on { background: var(--redbg); border-color: var(--redbr); color: var(--red3); }

/* Episodes */
.ep-section { margin-top: 1.5rem; }
.season-tabs { display: flex; gap: .45rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
.season-tab { padding: .42rem 1rem; background: var(--s2); border: 1px solid var(--s3); border-radius: 6px; color: var(--t2); cursor: pointer; font-size: .76rem; font-family: 'Cairo',sans-serif; transition: all .25s; }
.season-tab:hover, .season-tab.active { background: var(--red); border-color: var(--red); color: #fff; font-weight: 700; }
.ep-item { display: flex; align-items: center; gap: 1rem; padding: .9rem; background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r); cursor: pointer; margin-bottom: .55rem; transition: all .25s; }
.ep-item:hover { background: var(--s1); border-color: var(--s3); transform: translateX(-4px); }
.ep-num { font-family: 'Oswald',sans-serif; font-size: 1.4rem; font-weight: 700; color: var(--t4); width: 30px; flex-shrink: 0; text-align: center; }
.ep-thumb { width: 120px; height: 68px; object-fit: cover; border-radius: 6px; background: var(--s2); flex-shrink: 0; }
.ep-info { flex: 1; min-width: 0; }
.ep-title { font-weight: 700; font-size: .84rem; margin-bottom: .18rem; }
.ep-desc { font-size: .72rem; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ep-dur { font-size: .67rem; color: var(--t4); margin-top: .18rem; }
.ep-play-icon { color: var(--red); font-size: 1.1rem; flex-shrink: 0; }

/* ── PLAYER PAGE ──────────────────────────────── */
.player-page { background: #000; min-height: 100vh; }
.player-nav { display: flex; align-items: center; gap: 1rem; padding: .75rem 1.5rem; background: rgba(0,0,0,.85); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 10; }
.player-back { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: var(--t1); padding: .4rem .9rem; border-radius: 6px; cursor: pointer; font-size: .8rem; font-family: 'Cairo',sans-serif; }
.player-back:hover { background: rgba(255,255,255,.16); }
.player-wrap { position: relative; width: 100%; padding-bottom: 56.25%; background: #000; overflow: hidden; max-height: 78vh; padding-bottom: 0; aspect-ratio: 16/9; }
.player-wrap iframe, .player-wrap video { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
.player-no-video { display: flex; flex-direction: column; align-items: center; justify-content: center; aspect-ratio: 16/9; background: var(--bg1); color: var(--t3); gap: 1rem; }
.player-info { padding: 1.5rem 2.5rem; max-width: 980px; }

/* ── SEARCH ───────────────────────────────────── */
.search-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(5,5,16,.97); backdrop-filter: blur(24px); overflow-y: auto; padding: 5rem 1.5rem 2rem; }
.search-box { max-width: 900px; margin: 0 auto; }
.search-field { display: flex; align-items: center; gap: .8rem; background: var(--bg2); border: 1px solid var(--s3); border-radius: 12px; padding: .75rem 1.1rem; margin-bottom: 1.6rem; }
.search-input { background: none; border: none; color: var(--t1); font-size: 1.1rem; font-family: 'Cairo',sans-serif; flex: 1; outline: none; }
.search-close { background: var(--s2); border: none; color: var(--t2); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: .85rem; display: flex; align-items: center; justify-content: center; }
.search-label { font-size: .7rem; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: .8rem; }
.search-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(142px,1fr)); gap: 1rem; }

/* ── AUTH PAGE ────────────────────────────────── */
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; position: relative; }
.auth-bg { position: fixed; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(229,9,20,.08) 0%, transparent 60%), linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%); z-index: -1; }
.auth-box { background: rgba(15,15,34,.95); border: 1px solid var(--s3); border-radius: 18px; padding: 2.8rem; width: 100%; max-width: 430px; backdrop-filter: blur(24px); }
.auth-logo { font-family: 'Oswald',sans-serif; font-size: 2.1rem; font-weight: 700; text-align: center; margin-bottom: .25rem; }
.auth-tagline { text-align: center; font-size: .73rem; color: var(--t3); margin-bottom: 1.8rem; }
.auth-tab-row { display: flex; background: var(--s1); border-radius: 9px; padding: .25rem; margin-bottom: 1.5rem; }
.auth-tab { flex: 1; padding: .55rem; border: none; background: transparent; color: var(--t2); cursor: pointer; font-family: 'Cairo',sans-serif; font-size: .82rem; border-radius: 7px; transition: all .22s; }
.auth-tab.active { background: var(--red); color: #fff; font-weight: 700; }
.fg { margin-bottom: 1.1rem; }
.fl { display: block; font-size: .68rem; color: var(--t3); margin-bottom: .38rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
.fi { width: 100%; background: var(--bg3); border: 1px solid var(--s3); border-radius: 9px; padding: .75rem 1rem; color: var(--t1); font-family: 'Cairo',sans-serif; font-size: .9rem; outline: none; transition: border-color .25s; direction: ltr; }
.fi:focus { border-color: var(--red); }
.fi-rtl { direction: rtl; }
.ferror { background: var(--redbg); border: 1px solid var(--redbr); border-radius: 8px; padding: .65rem .9rem; font-size: .78rem; color: var(--red3); margin-bottom: .9rem; }
.fsuccess { background: rgba(29,185,84,.12); border: 1px solid rgba(29,185,84,.3); border-radius: 8px; padding: .65rem .9rem; font-size: .78rem; color: var(--green); margin-bottom: .9rem; }
.btn-auth { width: 100%; background: var(--red); border: none; color: #fff; padding: .9rem; border-radius: 9px; cursor: pointer; font-size: .92rem; font-family: 'Cairo',sans-serif; font-weight: 700; transition: background .25s; margin-top: .4rem; }
.btn-auth:hover { background: var(--red2); }
.btn-auth:disabled { background: var(--s2); color: var(--t3); cursor: not-allowed; }

/* ── PROFILE PAGE ─────────────────────────────── */
.profile-page { padding: 5.5rem 2.5rem 3rem; max-width: 1300px; margin: 0 auto; }
.profile-cover { height: 200px; border-radius: var(--r2); background: linear-gradient(135deg, var(--s3) 0%, var(--s1) 100%); position: relative; overflow: hidden; margin-bottom: 4rem; }
.profile-cover-grad { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(229,9,20,.3) 0%, transparent 60%); }
.profile-avatar-wrap { position: absolute; bottom: -3rem; right: 2rem; }
.profile-avatar { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid var(--bg); background: var(--s2); }
.profile-meta { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
.profile-name { font-family: 'Oswald',sans-serif; font-size: 1.5rem; font-weight: 700; }
.profile-email { font-size: .78rem; color: var(--t3); margin-top: .2rem; }
.profile-badges { display: flex; gap: .5rem; margin-top: .5rem; flex-wrap: wrap; }
.badge { display: inline-flex; align-items: center; gap: .3rem; padding: .22rem .65rem; border-radius: 20px; font-size: .67rem; font-weight: 700; }
.badge-admin { background: var(--redbg); border: 1px solid var(--redbr); color: var(--red3); }
.badge-member { background: rgba(29,185,84,.12); border: 1px solid rgba(29,185,84,.3); color: var(--green); }
.profile-tabs { display: flex; gap: .4rem; border-bottom: 1px solid var(--s2); margin-bottom: 1.5rem; overflow-x: auto; scrollbar-width: none; padding-bottom: .5rem; }
.p-tab { padding: .6rem 1.2rem; background: transparent; border: none; color: var(--t3); cursor: pointer; font-size: .8rem; font-family: 'Cairo',sans-serif; white-space: nowrap; transition: color .2s; border-bottom: 2px solid transparent; padding-bottom: .8rem; }
.p-tab:hover { color: var(--t1); }
.p-tab.active { color: var(--t1); border-bottom-color: var(--red); font-weight: 700; }
.settings-form { background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r2); padding: 1.8rem; max-width: 550px; }
.settings-form h3 { font-family: 'Oswald',sans-serif; font-size: .95rem; font-weight: 600; margin-bottom: 1.3rem; color: var(--t2); text-transform: uppercase; letter-spacing: .5px; }
.stat-row { display: grid; grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 1rem; margin-bottom: 2rem; }
.stat-box { background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r); padding: 1.1rem; text-align: center; }
.stat-val { font-family: 'Oswald',sans-serif; font-size: 1.9rem; font-weight: 700; color: var(--red3); }
.stat-lbl { font-size: .7rem; color: var(--t3); margin-top: .2rem; }

/* ── ADMIN ────────────────────────────────────── */
.admin-page { padding: 5.5rem 2.5rem 3rem; max-width: 1500px; margin: 0 auto; }
.admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.admin-title { font-family: 'Oswald',sans-serif; font-size: 1.6rem; font-weight: 700; }
.admin-badge { background: var(--redbg); border: 1px solid var(--redbr); color: var(--red3); padding: .28rem .85rem; border-radius: 20px; font-size: .72rem; font-weight: 700; }
.admin-tabs { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1.5rem; border-bottom: 1px solid var(--s2); padding-bottom: .8rem; overflow-x: auto; scrollbar-width: none; }
.a-tab { padding: .52rem 1.2rem; background: transparent; border: 1px solid var(--s2); border-radius: 8px; color: var(--t3); cursor: pointer; font-size: .78rem; font-family: 'Cairo',sans-serif; transition: all .22s; white-space: nowrap; }
.a-tab:hover { color: var(--t1); border-color: var(--s3); }
.a-tab.active { background: var(--red); border-color: var(--red); color: #fff; font-weight: 700; }
.stat-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(155px,1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.admin-table-wrap { background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r2); overflow: hidden; }
table.at { width: 100%; border-collapse: collapse; font-size: .78rem; }
table.at th { text-align: right; padding: .75rem 1rem; color: var(--t3); font-size: .67rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid var(--s2); white-space: nowrap; }
table.at td { padding: .7rem 1rem; border-bottom: 1px solid var(--s1); vertical-align: middle; }
table.at tr:last-child td { border-bottom: none; }
table.at tr:hover td { background: rgba(255,255,255,.018); }
.a-thumb { width: 38px; height: 54px; object-fit: cover; border-radius: 4px; background: var(--s2); }
.a-toggle { padding: .27rem .6rem; border-radius: 5px; font-size: .66rem; cursor: pointer; border: 1px solid; font-family: 'Cairo',sans-serif; transition: all .2s; }
.a-toggle.on  { background: rgba(245,197,24,.12); border-color: rgba(245,197,24,.3); color: var(--gold); }
.a-toggle.off { background: var(--s1); border-color: var(--s2); color: var(--t4); }
.a-btn { padding: .3rem .7rem; border-radius: 5px; font-size: .68rem; cursor: pointer; font-family: 'Cairo',sans-serif; transition: all .2s; border: 1px solid; white-space: nowrap; }
.a-btn-edit { background: rgba(0,212,255,.08); border-color: rgba(0,212,255,.2); color: var(--cyan); }
.a-btn-edit:hover { background: rgba(0,212,255,.18); }
.a-btn-del  { background: var(--redbg); border-color: var(--redbr); color: var(--red3); }
.a-btn-del:hover  { background: rgba(229,9,20,.25); }
.a-btn-green { background: rgba(29,185,84,.08); border-color: rgba(29,185,84,.25); color: var(--green); }
.a-btn-green:hover { background: rgba(29,185,84,.2); }

/* FORMS */
.form-section { background: var(--bg2); border: 1px solid var(--s2); border-radius: var(--r2); padding: 1.8rem; }
.form-section h3 { font-family: 'Oswald',sans-serif; font-size: 1rem; font-weight: 600; margin-bottom: 1.3rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media(max-width:580px) { .form-grid { grid-template-columns: 1fr; } }
.form-full { grid-column: 1/-1; }
.ftarea { width: 100%; background: var(--bg3); border: 1px solid var(--s3); border-radius: 9px; padding: .75rem 1rem; color: var(--t1); font-family: 'Cairo',sans-serif; font-size: .88rem; outline: none; min-height: 90px; resize: vertical; transition: border-color .25s; direction: rtl; }
.ftarea:focus { border-color: var(--red); }
.fsel { width: 100%; background: var(--bg3); border: 1px solid var(--s3); border-radius: 9px; padding: .75rem 1rem; color: var(--t1); font-family: 'Cairo',sans-serif; font-size: .88rem; outline: none; cursor: pointer; }
.fcheck-row { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.fcheck { display: flex; align-items: center; gap: .4rem; cursor: pointer; font-size: .8rem; color: var(--t2); }
.fcheck input { accent-color: var(--red); }

/* MODAL */
.modal-backdrop { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,.82); backdrop-filter: blur(10px); display: flex; align-items: flex-start; justify-content: center; padding: 3rem 1rem 2rem; overflow-y: auto; }
.modal-box { background: var(--bg2); border: 1px solid var(--s3); border-radius: 16px; width: 100%; max-width: 740px; padding: 1.8rem; animation: modalIn .25s ease; }
@keyframes modalIn { from { opacity:0; transform:translateY(-20px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4rem; }
.modal-head h3 { font-family: 'Oswald',sans-serif; font-size: 1.05rem; font-weight: 600; }
.modal-close { background: var(--s2); border: none; color: var(--t2); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: background var(--tr); }
.modal-close:hover { background: var(--s3); color: var(--t1); }

/* CONFIRM DIALOG */
.confirm-box { background: var(--bg2); border: 1px solid var(--s3); border-radius: 14px; padding: 2rem; max-width: 380px; width: 100%; text-align: center; }
.confirm-icon { font-size: 2.5rem; margin-bottom: .9rem; }
.confirm-msg { color: var(--t2); font-size: .88rem; line-height: 1.6; margin-bottom: 1.5rem; }
.confirm-btns { display: flex; gap: .7rem; justify-content: center; }
.btn-confirm-yes { padding: .65rem 1.6rem; background: var(--red); border: none; border-radius: 8px; color: #fff; cursor: pointer; font-weight: 700; font-family: 'Cairo',sans-serif; }
.btn-confirm-no  { padding: .65rem 1.2rem; background: var(--s2); border: 1px solid var(--s3); border-radius: 8px; color: var(--t2); cursor: pointer; font-family: 'Cairo',sans-serif; }

/* TOAST */
.toast { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); background: var(--bg2); border: 1px solid var(--s3); border-radius: 10px; padding: .75rem 1.4rem; font-size: .82rem; z-index: 9999; box-shadow: var(--shadow); animation: toastIn .3s ease; white-space: nowrap; }
@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
.toast.success { border-color: rgba(29,185,84,.4); color: var(--green); }
.toast.error   { border-color: var(--redbr); color: var(--red3); }

/* LOADING */
.loading-screen { position: fixed; inset: 0; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.2rem; z-index: 9999; }
.loading-logo { font-family: 'Oswald',sans-serif; font-size: 2.5rem; font-weight: 700; animation: pulse 1.5s ease infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.spinner { width: 38px; height: 38px; border: 3px solid var(--s2); border-top-color: var(--red); border-radius: 50%; animation: spin .75s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinner-sm { width: 18px; height: 18px; border: 2px solid var(--s2); border-top-color: var(--red); border-radius: 50%; animation: spin .75s linear infinite; display: inline-block; }

/* MISC */
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; color: var(--t3); text-align: center; }
.empty-icon { font-size: 3rem; opacity: .3; margin-bottom: 1rem; }
.empty-text { font-size: .85rem; }
.section-title-lg { font-family: 'Oswald',sans-serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 1.2rem; }
.content-page { padding: 5.5rem 2.5rem 3rem; max-width: 1400px; margin: 0 auto; }
.filter-bar { display: flex; gap: .45rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.chip { padding: .38rem .9rem; background: var(--s2); border: 1px solid var(--s3); border-radius: 20px; font-size: .74rem; cursor: pointer; color: var(--t2); transition: all .22s; font-family: 'Cairo',sans-serif; }
.chip:hover, .chip.active { background: var(--red); border-color: var(--red); color: #fff; }
.c-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(150px,1fr)); gap: 1rem; }
.footer { background: var(--bg1); border-top: 1px solid var(--s2); padding: 3rem 2.5rem 1.5rem; margin-top: 4rem; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
@media(max-width:720px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
.footer-logo { font-family: 'Oswald',sans-serif; font-size: 1.5rem; font-weight: 700; margin-bottom: .6rem; }
.footer-desc { font-size: .75rem; color: var(--t3); line-height: 1.7; }
.footer-col-title { font-size: .65rem; text-transform: uppercase; letter-spacing: 1px; color: var(--t4); font-weight: 700; margin-bottom: .8rem; }
.footer-link { display: block; font-size: .77rem; color: var(--t3); cursor: pointer; margin-bottom: .4rem; transition: color .2s; }
.footer-link:hover { color: var(--t1); }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 1.5rem; border-top: 1px solid var(--s2); flex-wrap: wrap; gap: .5rem; }
.footer-copy { font-size: .7rem; color: var(--t4); }
`;

/* ═══════════════ UTILS ═════════════════════════════════════════ */
function getEmbed(url) {
  if (!url) return null;
  if (url.includes('/embed/') || url.includes('player.vimeo') || url.includes('dailymotion.com/embed')) return url;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const dm = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dm) return `https://www.dailymotion.com/embed/video/${dm[1]}?autoplay=1`;
  const vi = url.match(/vimeo\.com\/(\d+)/);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1`;
  return url;
}
const isDirect = url => url && /\.(mp4|webm|ogg)(\?|$)/i.test(url);
const catLabel = c => ({ arabic: '🇸🇦 عربي', tunisian: '🇹🇳 تونسي', international: '🌍 عالمي' })[c] || c;

/* ═══════════════ MINI COMPONENTS ══════════════════════════════ */
function Toast({ msg, type = '', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, []);
  return <div className={`toast ${type}`} onClick={onClose}>{msg}</div>;
}

function Confirm({ msg, onYes, onNo }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onNo()}>
      <div className="confirm-box">
        <div className="confirm-icon">⚠️</div>
        <div className="confirm-msg">{msg}</div>
        <div className="confirm-btns">
          <button className="btn-confirm-yes" onClick={onYes}>تأكيد</button>
          <button className="btn-confirm-no"  onClick={onNo}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function Spinner({ size = 'lg' }) {
  return <div className={size === 'sm' ? 'spinner-sm' : 'spinner'} />;
}

/* ═══════════════ SUPABASE LAYER ════════════════════════════════ */
// All DB calls go here — centralised, easy to debug

const DB = {
  /* AUTH */
  async login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password
    });
    if (error) throw new Error(
      error.message === 'Invalid login credentials'
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        : error.message
    );
    return data;
  },
  async register(email, password, username) {
    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { username, full_name: username } }
    });
    if (error) throw new Error(error.message);
    // Ensure profile exists
    if (data.user) {
      await sb.from('profiles').upsert({
        id: data.user.id,
        username,
        full_name: username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        is_admin: false
      });
    }
    return data;
  },
  async logout() { await sb.auth.signOut(); },
  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },
  async getProfile(uid) {
    const { data, error } = await sb.from('profiles').select('*').eq('id', uid).single();
    if (error) return null;
    return data;
  },
  async updateProfile(uid, updates) {
    const { data, error } = await sb.from('profiles').update(updates).eq('id', uid).select().single();
    if (error) throw error;
    return data;
  },
  async changePassword(newPwd) {
    const { error } = await sb.auth.updateUser({ password: newPwd });
    if (error) throw error;
  },

  /* CONTENT */
  async getAllContent() {
    const { data, error } = await sb
      .from('content').select('*').eq('is_published', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async getContent(id) {
    const { data, error } = await sb
      .from('content')
      .select(`*, seasons(*, episodes(*))`)
      .eq('id', id).single();
    if (error) throw error;
    if (data?.seasons) {
      data.seasons.sort((a, b) => a.season_num - b.season_num);
      data.seasons.forEach(s => s.episodes?.sort((a, b) => a.ep_num - b.ep_num));
    }
    return data;
  },
  async searchContent(q) {
    const { data, error } = await sb
      .from('content').select('*')
      .or(`title.ilike.%${q}%,title_en.ilike.%${q}%,description.ilike.%${q}%`)
      .eq('is_published', true).limit(24);
    if (error) throw error;
    return data || [];
  },
  async createContent(payload) {
    const { data, error } = await sb.from('content').insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  async updateContent(id, payload) {
    const { data, error } = await sb.from('content')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteContent(id) {
    const { error } = await sb.from('content').delete().eq('id', id);
    if (error) throw error;
  },

  /* SEASONS */
  async createSeason(contentId, title, num) {
    const { data, error } = await sb.from('seasons')
      .insert({ content_id: contentId, title, season_num: num })
      .select().single();
    if (error) throw error;
    return { ...data, episodes: [] };
  },
  async updateSeason(id, payload) {
    const { data, error } = await sb.from('seasons').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteSeason(id) {
    const { error } = await sb.from('seasons').delete().eq('id', id);
    if (error) throw error;
  },

  /* EPISODES */
  async createEpisode(seasonId, contentId, payload) {
    const { data, error } = await sb.from('episodes')
      .insert({ season_id: seasonId, content_id: contentId, ...payload })
      .select().single();
    if (error) throw error;
    return data;
  },
  async updateEpisode(id, payload) {
    const { data, error } = await sb.from('episodes')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteEpisode(id) {
    const { error } = await sb.from('episodes').delete().eq('id', id);
    if (error) throw error;
  },

  /* FAVORITES */
  async getFavorites(uid) {
    const { data, error } = await sb.from('favorites')
      .select('*, content(*)').eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async toggleFavorite(uid, contentId) {
    const { data: ex } = await sb.from('favorites').select('id')
      .eq('user_id', uid).eq('content_id', contentId).single();
    if (ex) {
      await sb.from('favorites').delete().eq('id', ex.id);
      return false;
    }
    await sb.from('favorites').insert({ user_id: uid, content_id: contentId });
    return true;
  },

  /* HISTORY */
  async getHistory(uid) {
    const { data, error } = await sb.from('watch_history')
      .select('*, content(*)').eq('user_id', uid)
      .order('watched_at', { ascending: false }).limit(30);
    if (error) throw error;
    return data || [];
  },
  async addHistory(uid, contentId, episodeId = null) {
    try {
      const existing = await sb.from('watch_history').select('id')
        .eq('user_id', uid).eq('content_id', contentId).is('episode_id', episodeId ? null : null);
      await sb.from('watch_history').upsert({
        user_id: uid, content_id: contentId, episode_id: episodeId,
        watched_at: new Date().toISOString()
      }, { onConflict: 'user_id,content_id,episode_id' });
    } catch(_) {}
  },

  /* USERS (admin) */
  async getAllUsers() {
    const { data, error } = await sb.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

/* ═══════════════ CARD COMPONENTS ══════════════════════════════ */
function MovieCard({ item, onClick, onFavToggle, isFav, showType }) {
  return (
    <div className="card" onClick={() => onClick(item)}>
      <img className="card-img" src={item.poster_url || item.poster}
        alt={item.title} loading="lazy"
        onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/160/240`; }} />
      <div className="card-overlay" />
      <div className="card-play">▶</div>
      <div className="card-info">
        <div className="card-title">{item.title}</div>
        <div className="card-meta">
          <span style={{ color: '#f5c518' }}>★{item.rating}</span>
          <span>{item.year}</span>
          {showType && <span style={{ color: item.type === 'movie' ? 'var(--red3)' : 'var(--cyan)' }}>
            {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
          </span>}
        </div>
      </div>
      {item.is_trending && <div className="card-badge">🔥</div>}
      {onFavToggle && (
        <button className={`card-fav ${isFav ? 'on' : ''}`}
          onClick={e => { e.stopPropagation(); onFavToggle(item); }}>
          {isFav ? '❤' : '♡'}
        </button>
      )}
    </div>
  );
}

function SkeletonRow({ count = 6 }) {
  return (
    <div className="row">
      <div className="row-head">
        <div style={{ width: 160, height: 18, borderRadius: 6 }} className="skel" />
      </div>
      <div className="slider">
        {Array.from({ length: count }).map((_, i) => <div key={i} className="skel skel-card" />)}
      </div>
    </div>
  );
}

/* ═══════════════ AUTH PAGE ═════════════════════════════════════ */
function AuthPage({ onAuth, onBack }) {
  const [tab, setTab] = useState('login');
  const [f, setF] = useState({ email: '', password: '', username: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inp = (k, v) => { setF(p => ({ ...p, [k]: v })); setError(''); };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!f.email || !f.password) { setError('يرجى ملء جميع الحقول'); return; }
    if (tab === 'register') {
      if (!f.username) { setError('يرجى إدخال اسم المستخدم'); return; }
      if (f.password !== f.confirm) { setError('كلمة المرور غير متطابقة'); return; }
      if (f.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        const data = await DB.login(f.email, f.password);
        if (data.user) {
          const profile = await DB.getProfile(data.user.id);
          onAuth(data.user, profile);
        }
      } else {
        await DB.register(f.email, f.password, f.username);
        // Auto-login after register
        const data = await DB.login(f.email, f.password);
        if (data.user) {
          const profile = await DB.getProfile(data.user.id);
          onAuth(data.user, profile);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-box">
        <div className="auth-logo"><span className="f">FLIX</span><span className="t">TN</span></div>
        <div className="auth-tagline">السينما العربية والتونسية والعالمية</div>
        <div className="auth-tab-row">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>تسجيل الدخول</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>إنشاء حساب</button>
        </div>

        {error   && <div className="ferror">⚠ {error}</div>}
        {success && <div className="fsuccess">✓ {success}</div>}

        {tab === 'register' && (
          <div className="fg">
            <label className="fl">اسم المستخدم</label>
            <input className="fi fi-rtl" value={f.username} onChange={e => inp('username', e.target.value)} placeholder="اسمك في الموقع" />
          </div>
        )}
        <div className="fg">
          <label className="fl">البريد الإلكتروني</label>
          <input className="fi" type="email" value={f.email} onChange={e => inp('email', e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="fg">
          <label className="fl">كلمة المرور</label>
          <input className="fi" type="password" value={f.password} onChange={e => inp('password', e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()} />
        </div>
        {tab === 'register' && (
          <div className="fg">
            <label className="fl">تأكيد كلمة المرور</label>
            <input className="fi" type="password" value={f.confirm} onChange={e => inp('confirm', e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && !loading && handleSubmit()} />
          </div>
        )}
        <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
          {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}><Spinner size="sm" /> جاري التحميل...</span>
            : tab === 'login' ? 'دخول' : 'إنشاء الحساب'}
        </button>
        {onBack && <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '.75rem', color: 'var(--t3)', cursor: 'pointer' }} onClick={onBack}>← العودة</div>}
      </div>
    </div>
  );
}

/* ═══════════════ HOME PAGE ═════════════════════════════════════ */
function HomePage({ movies, series, loading, onItemClick, onPlay, user, favorites, onFavToggle }) {
  const all = [...movies, ...series];
  const featured  = all.filter(x => x.is_featured);
  const trending  = all.filter(x => x.is_trending);
  const top10     = [...all].sort((a, b) => (b.rating||0) - (a.rating||0)).slice(0, 10);
  const arabicM   = movies.filter(m => m.category === 'arabic');
  const tunisianM = movies.filter(m => m.category === 'tunisian');
  const intlM     = movies.filter(m => m.category === 'international');
  const arabicS   = series.filter(s => s.category === 'arabic');
  const hero      = featured[0] || trending[0] || all[0];
  const favIds    = new Set(favorites.map(f => f.content_id));

  if (loading) return (
    <div>
      <div style={{ height: '100vh', background: 'var(--s1)' }} className="skel" />
      {[1,2,3].map(i => <SkeletonRow key={i} />)}
    </div>
  );
  if (!hero) return (
    <div className="empty" style={{ paddingTop: '10rem' }}>
      <div className="empty-icon">🎬</div>
      <div className="empty-text">لا يوجد محتوى حالياً — أضف من لوحة الإدارة</div>
    </div>
  );

  const Row = ({ title, items, type = 'card', icon = '' }) => items.length === 0 ? null : (
    <div className="row">
      <div className="row-head">
        <div className="row-head-left">
          <div className="row-bar" />
          <span className="row-title">{icon} {title}</span>
        </div>
      </div>
      <div className="slider">
        {type === 'card' && items.map(it =>
          <MovieCard key={it.id} item={it} onClick={onItemClick} showType
            onFavToggle={user ? onFavToggle : null} isFav={favIds.has(it.id)} />)}
        {type === 'wide' && items.map(it => (
          <div key={it.id} className="wide-card" onClick={() => onItemClick(it)}>
            <img className="wide-img" src={it.backdrop_url || it.poster_url || it.backdrop || it.poster}
              alt={it.title} loading="lazy"
              onError={e => { e.target.src = `https://picsum.photos/seed/${it.id}b/265/149`; }} />
            <div className="wide-title">{it.title}</div>
            <div className="wide-meta">★{it.rating} · {it.year}</div>
          </div>
        ))}
        {type === 'rank' && items.map((it, i) => (
          <div key={it.id} className="rank-card" onClick={() => onItemClick(it)}>
            <span className="rank-num">{i + 1}</span>
            <img className="rank-img" src={it.poster_url || it.poster}
              alt={it.title} loading="lazy"
              onError={e => { e.target.src = `https://picsum.photos/seed/${it.id}/125/188`; }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div className="hero-bg">
          <img src={hero.backdrop_url || hero.backdrop || hero.poster_url || hero.poster} alt={hero.title} />
        </div>
        <div className="hero-overlay" /><div className="hero-overlay2" />
        <div className="hero-content">
          <div className="hero-genres">{hero.genre?.map(g => <span key={g} className="genre-pill">{g}</span>)}</div>
          <h1 className="hero-title">{hero.title}</h1>
          <div className="hero-meta">
            <span className="rating">★ {hero.rating}</span>
            <span style={{ color: 'var(--t3)' }}>{hero.year}</span>
            {hero.duration && <span style={{ color: 'var(--t3)' }}>⏱ {hero.duration}</span>}
            <span className="match">{hero.match_pct}% مطابق</span>
          </div>
          <p className="hero-desc">{hero.description?.slice(0, 145)}...</p>
          <div className="hero-btns">
            <button className="btn-play" onClick={() => onPlay(hero)}>▶ شاهد الآن</button>
            <button className="btn-outline" onClick={() => onItemClick(hero)}>ℹ التفاصيل</button>
          </div>
        </div>
      </div>

      <Row title="رائج الآن"     items={trending}    type="wide" icon="🔥" />
      <Row title="أفضل 10"       items={top10}        type="rank" icon="🏆" />
      <Row title="آخر الأفلام"   items={movies.slice(0,14)} type="card" icon="🎬" />
      <Row title="المسلسلات"     items={series.slice(0,12)} type="card" icon="📺" />
      <Row title="أفلام عربية"   items={arabicM}      type="card" icon="🇸🇦" />
      <Row title="أفلام تونسية"  items={tunisianM}    type="card" icon="🇹🇳" />
      <Row title="أفلام عالمية"  items={intlM}        type="card" icon="🌍" />
      <Row title="مسلسلات عربية" items={arabicS}      type="card" icon="📺" />
    </div>
  );
}

/* ═══════════════ MOVIES / SERIES PAGE ═════════════════════════ */
function ContentListPage({ type, items, loading, onItemClick, user, favorites, onFavToggle }) {
  const [cat, setCat] = useState('all');
  const catMap = { عربي: 'arabic', تونسي: 'tunisian', عالمي: 'international' };
  const cats = ['الكل', 'عربي', 'تونسي', 'عالمي'];
  const favIds = new Set(favorites.map(f => f.content_id));
  const filtered = cat === 'all' ? items : items.filter(m => m.category === catMap[cats[cats.indexOf(cat)] === cat ? cat : '']);
  const filt2 = cat === 'الكل' ? items : items.filter(m => m.category === catMap[cat]);

  return (
    <div className="content-page">
      <h1 className="section-title-lg">{type === 'movie' ? '🎬 الأفلام' : '📺 المسلسلات'}</h1>
      <div className="filter-bar">
        {cats.map(c => <div key={c} className={`chip ${(c === 'الكل' ? cat === 'الكل' : cat === c) ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</div>)}
      </div>
      {loading ? (
        <div className="c-grid">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="skel" style={{ height: 237, borderRadius: 10 }} />)}</div>
      ) : filt2.length === 0 ? (
        <div className="empty"><div className="empty-icon">🎬</div><div className="empty-text">لا توجد نتائج</div></div>
      ) : (
        <div className="c-grid">
          {filt2.map(it => <MovieCard key={it.id} item={it} onClick={onItemClick}
            onFavToggle={user ? onFavToggle : null} isFav={favIds.has(it.id)} />)}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ DETAIL PAGE ═══════════════════════════════════ */
function DetailPage({ itemId, onPlay, onBack, user, favorites, onFavToggle, onSelectEp }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(0);
  const favIds = new Set(favorites.map(f => f.content_id));

  useEffect(() => {
    setLoading(true);
    DB.getContent(itemId).then(d => { setItem(d); setLoading(false); }).catch(() => setLoading(false));
  }, [itemId]);

  if (loading) return (
    <div>
      <div style={{ height: '62vh' }} className="skel" />
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 290px', gap: '2rem' }}>
        <div><div style={{ height: 20, borderRadius: 6, marginBottom: '1rem' }} className="skel" />
        <div style={{ height: 100, borderRadius: 8 }} className="skel" /></div>
        <div style={{ height: 200, borderRadius: 12 }} className="skel" />
      </div>
    </div>
  );
  if (!item) return <div className="empty" style={{ paddingTop: '8rem' }}><div className="empty-icon">⚠️</div><div className="empty-text">المحتوى غير موجود</div></div>;

  const isSeries = item.type === 'series';
  const isFav = favIds.has(item.id);
  const seasons = item.seasons || [];

  return (
    <div>
      <div className="detail-hero">
        <div className="detail-hero-bg">
          <img src={item.backdrop_url || item.backdrop || item.poster_url || item.poster} alt={item.title} />
        </div>
        <div className="detail-overlay" />
        <div className="detail-content">
          <div className="hero-genres" style={{ marginBottom: '.6rem' }}>
            {item.genre?.map(g => <span key={g} className="genre-pill">{g}</span>)}
          </div>
          <h1 className="detail-title">{item.title}</h1>
          {item.title_en && <div style={{ color: 'var(--t3)', fontSize: '.88rem', marginBottom: '.4rem' }}>{item.title_en}</div>}
          <div className="hero-meta">
            <span className="rating">★ {item.rating}</span>
            <span style={{ color: 'var(--t3)' }}>{item.year}</span>
            {item.duration && <span style={{ color: 'var(--t3)' }}>⏱ {item.duration}</span>}
            {isSeries && <span style={{ color: 'var(--cyan)' }}>{seasons.length} موسم</span>}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div>
          <div style={{ display: 'flex', gap: '.8rem', marginBottom: '1.8rem', flexWrap: 'wrap' }}>
            {!isSeries && <button className="btn-play" onClick={() => onPlay(item)}>▶ شاهد الفيلم</button>}
            {isSeries && seasons[0]?.episodes?.[0] &&
              <button className="btn-play" onClick={() => onSelectEp(item, seasons[0].episodes[0])}>▶ الحلقة الأولى</button>}
            {user && <button className={`btn-outline act-btn ${isFav ? 'fav-on' : ''}`} style={{ padding: '.8rem 1.6rem', display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
              onClick={() => onFavToggle(item)}>
              {isFav ? '❤ في المفضلة' : '♡ أضف للمفضلة'}
            </button>}
          </div>
          <p className="detail-desc">{item.description}</p>
          <div className="info-tags">
            <span className="info-tag">📅 {item.year}</span>
            <span className="info-tag">⭐ {item.rating}/10</span>
            {item.duration && <span className="info-tag">⏱ {item.duration}</span>}
            <span className="info-tag">{catLabel(item.category)}</span>
            {item.director && <span className="info-tag">🎬 {item.director}</span>}
          </div>
          {item.cast_list?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '.68rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '.7rem' }}>طاقم التمثيل</div>
              <div className="cast-row">
                {item.cast_list.map((c, i) => (
                  <div key={i} className="cast-item">
                    <img className="cast-img" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c}`} alt={c} />
                    <span className="cast-name">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEASONS & EPISODES */}
          {isSeries && (
            <div className="ep-section">
              <div style={{ fontSize: '.68rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '.9rem' }}>الحلقات</div>
              {seasons.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--t4)', background: 'var(--bg2)', borderRadius: 8, border: '1px dashed var(--s3)', fontSize: '.82rem' }}>
                  لا توجد حلقات متاحة
                </div>
              ) : (
                <>
                  <div className="season-tabs">
                    {seasons.map((s, i) => (
                      <button key={s.id} className={`season-tab ${season === i ? 'active' : ''}`} onClick={() => setSeason(i)}>
                        {s.title} <span style={{ opacity: .65, fontSize: '.65rem' }}>({s.episodes?.length || 0})</span>
                      </button>
                    ))}
                  </div>
                  {(seasons[season]?.episodes || []).map((ep, i) => (
                    <div key={ep.id} className="ep-item" onClick={() => onSelectEp(item, ep)}>
                      <span className="ep-num">{ep.ep_num || i + 1}</span>
                      {ep.thumb_url
                        ? <img className="ep-thumb" src={ep.thumb_url} alt={ep.title} loading="lazy" onError={e => e.target.style.display = 'none'} />
                        : <div className="ep-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)', fontSize: '1.4rem', background: 'var(--s2)' }}>▶</div>}
                      <div className="ep-info">
                        <div className="ep-title">{ep.title}</div>
                        {ep.description && <div className="ep-desc">{ep.description}</div>}
                        {ep.duration && <div className="ep-dur">⏱ {ep.duration}</div>}
                        {ep.video_url && <div style={{ fontSize: '.64rem', color: 'var(--green)', marginTop: '.18rem' }}>🎬 رابط متاح</div>}
                      </div>
                      <span className="ep-play-icon">▶</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div>
          <div className="sidebar-card">
            <div className="sidebar-title">الإجراءات</div>
            {!isSeries && <button className="btn-play" style={{ width: '100%', justifyContent: 'center', marginBottom: '.5rem' }} onClick={() => onPlay(item)}>▶ مشاهدة الفيلم</button>}
            {user && <button className={`act-btn ${isFav ? 'fav-on' : ''}`} onClick={() => onFavToggle(item)}>
              {isFav ? '❤ إزالة من المفضلة' : '♡ إضافة للمفضلة'}
            </button>}
            <button className="act-btn" onClick={onBack}>← رجوع</button>
          </div>
          {/* Similar */}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ PLAYER PAGE ═══════════════════════════════════ */
function PlayerPage({ item, episode, onBack }) {
  const [err, setErr] = useState(false);
  const rawUrl = episode?.video_url || item?.video_url;
  const embedUrl = getEmbed(rawUrl);
  const title = episode ? `${item?.title} — ${episode.title}` : item?.title;

  return (
    <div className="player-page">
      <div className="player-nav">
        <button className="player-back" onClick={onBack}>← رجوع</button>
        <span style={{ fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Cairo',sans-serif", fontSize: '.88rem' }}>{title}</span>
        {rawUrl && <a href={rawUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', fontSize: '.72rem' }}>🔗 الرابط</a>}
      </div>

      {!rawUrl ? (
        <div className="player-no-video"><div style={{ fontSize: '3rem', opacity: .25 }}>🎬</div><div>لا يوجد رابط فيديو لهذا المحتوى</div></div>
      ) : isDirect(rawUrl) ? (
        <div className="player-wrap"><video controls autoPlay style={{ width: '100%', height: '100%', background: '#000' }}><source src={rawUrl} /></video></div>
      ) : !err ? (
        <div className="player-wrap">
          <iframe key={embedUrl} src={embedUrl} title={title} allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            onError={() => setErr(true)} />
        </div>
      ) : (
        <div className="player-no-video">
          <div style={{ fontSize: '2rem', opacity: .3 }}>⚠️</div>
          <div>تعذّر تحميل الفيديو</div>
          <a href={rawUrl} target="_blank" rel="noreferrer"
            style={{ padding: '.6rem 1.3rem', background: 'var(--red)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: '.82rem', fontFamily: "'Cairo',sans-serif" }}>
            فتح في تبويب جديد
          </a>
        </div>
      )}

      {item && (
        <div className="player-info">
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
            {item.genre?.map(g => <span key={g} className="genre-pill">{g}</span>)}
            <span style={{ color: 'var(--t3)', fontSize: '.78rem' }}>{item.year}</span>
            <span style={{ color: '#f5c518', fontSize: '.8rem' }}>★ {item.rating}</span>
          </div>
          <h2 style={{ fontFamily: "'Oswald',sans-serif", fontSize: '1.3rem', fontWeight: 600, marginBottom: '.6rem' }}>{title}</h2>
          <p style={{ color: 'var(--t2)', fontSize: '.86rem', lineHeight: 1.75, fontFamily: "'Tajawal',sans-serif" }}>
            {episode?.description || item?.description}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ SEARCH ════════════════════════════════════════ */
function SearchOverlay({ movies, series, onItemClick, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const all = [...movies, ...series];
  const trending = all.filter(x => x.is_trending).slice(0, 10);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      const res = await DB.searchContent(q).catch(() => []);
      setResults(res);
      setLoading(false);
    }, 320);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div className="search-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="search-box">
        <div className="search-field">
          <span style={{ fontSize: '1.1rem' }}>🔍</span>
          <input className="search-input" autoFocus placeholder="ابحث عن أفلام، مسلسلات..."
            value={q} onChange={e => setQ(e.target.value)} />
          {loading && <Spinner size="sm" />}
          <button className="search-close" onClick={onClose}>✕</button>
        </div>
        {q.length < 2 ? (
          <>
            <div className="search-label">الأكثر بحثاً</div>
            <div className="search-grid">
              {trending.map(it => <MovieCard key={it.id} item={it} onClick={i => { onItemClick(i); onClose(); }} showType />)}
            </div>
          </>
        ) : results.length === 0 && !loading ? (
          <div className="empty"><div className="empty-icon">🔍</div><div className="empty-text">لا توجد نتائج لـ "{q}"</div></div>
        ) : (
          <>
            <div className="search-label">{results.length} نتيجة</div>
            <div className="search-grid">
              {results.map(it => <MovieCard key={it.id} item={it} onClick={i => { onItemClick(i); onClose(); }} showType />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ PROFILE PAGE ══════════════════════════════════ */
function ProfilePage({ user, profile, onLogout, onProfileUpdate, movies, series }) {
  const [tab, setTab] = useState('history');
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [editForm, setEditForm] = useState({ username: profile?.username || '', full_name: profile?.full_name || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', new: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    Promise.all([DB.getFavorites(user.id), DB.getHistory(user.id)])
      .then(([favs, hist]) => { setFavorites(favs); setHistory(hist); setLoading(false); });
  }, [user.id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await DB.updateProfile(user.id, editForm);
      onProfileUpdate(updated);
      showToast('✓ تم حفظ التغييرات');
    } catch { showToast('حدث خطأ'); }
    setSaving(false);
  };

  const changePassword = async () => {
    setPwdError('');
    if (!pwdForm.new || !pwdForm.confirm) { setPwdError('يرجى ملء جميع الحقول'); return; }
    if (pwdForm.new !== pwdForm.confirm) { setPwdError('كلمة المرور غير متطابقة'); return; }
    if (pwdForm.new.length < 6) { setPwdError('كلمة المرور قصيرة جداً'); return; }
    setSaving(true);
    try {
      await DB.changePassword(pwdForm.new);
      setPwdForm({ current: '', new: '', confirm: '' });
      showToast('✓ تم تغيير كلمة المرور');
    } catch (err) { setPwdError(err.message); }
    setSaving(false);
  };

  const favItems   = favorites.map(f => f.content).filter(Boolean);
  const histItems  = history.map(h => h.content).filter(Boolean);
  const tabs = [
    ['history', '🕓 سجل المشاهدة'],
    ['favorites', '❤ المفضلة'],
    ['settings', '⚙ الإعدادات'],
    ['password', '🔒 كلمة المرور'],
  ];

  return (
    <div className="profile-page">
      {toast && <Toast msg={toast} type="success" onClose={() => setToast('')} />}
      <div className="profile-cover">
        <div className="profile-cover-grad" />
        <div className="profile-avatar-wrap">
          <img className="profile-avatar"
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
            alt="" onError={e => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username||'U'}`} />
        </div>
      </div>

      <div className="profile-meta">
        <div>
          <div className="profile-name">{profile?.full_name || profile?.username || 'مستخدم'}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-badges">
            {profile?.is_admin ? <span className="badge badge-admin">👑 مدير النظام</span> : <span className="badge badge-member">✓ عضو نشط</span>}
          </div>
        </div>
        <button onClick={onLogout} style={{ padding: '.55rem 1.2rem', background: 'rgba(229,9,20,.12)', border: '1px solid rgba(229,9,20,.3)', borderRadius: 8, color: 'var(--red3)', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '.8rem' }}>
          🚪 تسجيل الخروج
        </button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-box"><div className="stat-val">{favorites.length}</div><div className="stat-lbl">المفضلة</div></div>
        <div className="stat-box"><div className="stat-val">{history.length}</div><div className="stat-lbl">شاهدت</div></div>
        <div className="stat-box"><div className="stat-val">{movies.length + series.length}</div><div className="stat-lbl">محتوى متاح</div></div>
      </div>

      <div className="profile-tabs">
        {tabs.map(([k, l]) => <button key={k} className={`p-tab ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>)}
      </div>

      {tab === 'history' && (
        loading ? <div className="empty"><Spinner /></div>
        : histItems.length === 0 ? <div className="empty"><div className="empty-icon">🕓</div><div className="empty-text">لم تشاهد أي محتوى بعد</div></div>
        : <div className="c-grid">{histItems.map(it => <MovieCard key={it.id} item={it} onClick={() => {}} showType />)}</div>
      )}

      {tab === 'favorites' && (
        loading ? <div className="empty"><Spinner /></div>
        : favItems.length === 0 ? <div className="empty"><div className="empty-icon">❤</div><div className="empty-text">لا توجد مفضلات بعد</div></div>
        : <div className="c-grid">{favItems.map(it => <MovieCard key={it.id} item={it} onClick={() => {}} showType />)}</div>
      )}

      {tab === 'settings' && (
        <div className="settings-form">
          <h3>معلومات الحساب</h3>
          <div className="fg"><label className="fl">اسم المستخدم</label>
            <input className="fi fi-rtl" value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} /></div>
          <div className="fg"><label className="fl">الاسم الكامل</label>
            <input className="fi fi-rtl" value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} /></div>
          <div className="fg"><label className="fl">البريد الإلكتروني</label>
            <input className="fi" value={user.email} disabled style={{ opacity: .5 }} /></div>
          <button className="btn-auth" onClick={saveProfile} disabled={saving} style={{ marginTop: '.5rem' }}>
            {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}><Spinner size="sm" /> جاري الحفظ...</span> : '💾 حفظ التغييرات'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="settings-form">
          <h3>تغيير كلمة المرور</h3>
          {pwdError && <div className="ferror">⚠ {pwdError}</div>}
          <div className="fg"><label className="fl">كلمة المرور الجديدة</label>
            <input className="fi" type="password" value={pwdForm.new} onChange={e => setPwdForm(p => ({ ...p, new: e.target.value }))} placeholder="••••••••" /></div>
          <div className="fg"><label className="fl">تأكيد كلمة المرور</label>
            <input className="fi" type="password" value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" /></div>
          <button className="btn-auth" onClick={changePassword} disabled={saving} style={{ marginTop: '.5rem' }}>
            {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem' }}><Spinner size="sm" /> جاري التغيير...</span> : '🔒 تغيير كلمة المرور'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ADMIN — CONTENT FORM MODAL ════════════════════ */
function ContentFormModal({ item, onClose, onSaved, showToast }) {
  const isNew = !item?.id;
  const [type, setType] = useState(item?.type || 'movie');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [f, setF] = useState({
    title:       item?.title || '',
    title_en:    item?.title_en || '',
    year:        item?.year || new Date().getFullYear(),
    rating:      item?.rating || 7.5,
    genre:       (item?.genre || []).join('، '),
    category:    item?.category || 'international',
    poster_url:  item?.poster_url || item?.poster || '',
    backdrop_url: item?.backdrop_url || item?.backdrop || '',
    description: item?.description || '',
    cast_list:   (item?.cast_list || []).join('، '),
    director:    item?.director || '',
    duration:    item?.duration || '',
    video_url:   item?.video_url || '',
    trailer_url: item?.trailer_url || '',
    is_featured: item?.is_featured || false,
    is_trending: item?.is_trending || false,
    match_pct:   item?.match_pct || 90,
  });
  const inp = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!f.title.trim()) { setErr('العنوان مطلوب'); return; }
    setSaving(true); setErr('');
    const payload = {
      type, ...f,
      year: parseInt(f.year) || new Date().getFullYear(),
      rating: parseFloat(f.rating) || 7.0,
      genre: f.genre.split(/[,،]/).map(x => x.trim()).filter(Boolean),
      cast_list: f.cast_list.split(/[,،]/).map(x => x.trim()).filter(Boolean),
      poster_url: f.poster_url || `https://picsum.photos/seed/${Date.now()}/300/450`,
      backdrop_url: f.backdrop_url || `https://picsum.photos/seed/${Date.now()}b/1280/720`,
    };
    try {
      const saved = isNew ? await DB.createContent(payload) : await DB.updateContent(item.id, payload);
      showToast(isNew ? '✓ تمت الإضافة بنجاح' : '✓ تم حفظ التعديلات');
      onSaved(saved);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>{isNew ? `➕ ${type === 'movie' ? 'فيلم جديد' : 'مسلسل جديد'}` : `✏ تعديل: ${item.title}`}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {isNew && (
          <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem' }}>
            {['movie', 'series'].map(t => (
              <div key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>
                {t === 'movie' ? '🎬 فيلم' : '📺 مسلسل'}
              </div>
            ))}
          </div>
        )}
        {err && <div className="ferror">⚠ {err}</div>}

        <div className="form-grid">
          <div className="fg"><label className="fl">العنوان *</label><input className="fi fi-rtl" value={f.title} onChange={e => inp('title', e.target.value)} /></div>
          <div className="fg"><label className="fl">العنوان بالإنجليزية</label><input className="fi" value={f.title_en} onChange={e => inp('title_en', e.target.value)} /></div>
          <div className="fg"><label className="fl">السنة</label><input className="fi" value={f.year} onChange={e => inp('year', e.target.value)} /></div>
          <div className="fg"><label className="fl">التقييم (0-10)</label><input className="fi" value={f.rating} onChange={e => inp('rating', e.target.value)} /></div>
          <div className="fg"><label className="fl">التصنيف</label>
            <select className="fsel" value={f.category} onChange={e => inp('category', e.target.value)}>
              <option value="arabic">🇸🇦 عربي</option>
              <option value="tunisian">🇹🇳 تونسي</option>
              <option value="international">🌍 عالمي</option>
            </select>
          </div>
          {type === 'movie' && <div className="fg"><label className="fl">المدة</label><input className="fi" value={f.duration} onChange={e => inp('duration', e.target.value)} placeholder="2س 15د" /></div>}
          <div className="fg"><label className="fl">الأنواع (بفاصلة)</label><input className="fi fi-rtl" value={f.genre} onChange={e => inp('genre', e.target.value)} placeholder="دراما، إثارة" /></div>
          <div className="fg"><label className="fl">المخرج</label><input className="fi fi-rtl" value={f.director} onChange={e => inp('director', e.target.value)} /></div>
          <div className="fg form-full"><label className="fl">طاقم التمثيل (بفاصلة)</label><input className="fi fi-rtl" value={f.cast_list} onChange={e => inp('cast_list', e.target.value)} /></div>
          {type === 'movie' && <div className="fg form-full"><label className="fl">رابط الفيديو</label><input className="fi" value={f.video_url} onChange={e => inp('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>}
          <div className="fg"><label className="fl">رابط البوستر</label><input className="fi" value={f.poster_url} onChange={e => inp('poster_url', e.target.value)} /></div>
          <div className="fg"><label className="fl">رابط الخلفية</label><input className="fi" value={f.backdrop_url} onChange={e => inp('backdrop_url', e.target.value)} /></div>
          <div className="fg form-full"><label className="fl">الوصف</label><textarea className="ftarea" value={f.description} onChange={e => inp('description', e.target.value)} /></div>
          <div className="fg form-full">
            <div className="fcheck-row">
              <label className="fcheck"><input type="checkbox" checked={f.is_featured} onChange={e => inp('is_featured', e.target.checked)} /> مميز في الرئيسية</label>
              <label className="fcheck"><input type="checkbox" checked={f.is_trending} onChange={e => inp('is_trending', e.target.checked)} /> 🔥 رائج</label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.7rem', marginTop: '1.2rem' }}>
          <button onClick={save} disabled={saving} className="btn-play" style={{ fontSize: '.82rem' }}>
            {saving ? <span style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}><Spinner size="sm" /> جاري الحفظ...</span> : '💾 حفظ'}
          </button>
          <button onClick={onClose} style={{ padding: '.6rem 1.1rem', background: 'var(--s2)', border: '1px solid var(--s3)', borderRadius: 8, color: 'var(--t2)', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '.82rem' }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN — SEASONS MODAL ════════════════════════ */
function SeasonsModal({ series, onClose, showToast }) {
  const [seasons, setSeasons]   = useState(series.seasons || []);
  const [selSeason, setSelSeason] = useState(0);
  const [newSeasonTitle, setNewSeasonTitle] = useState('');
  const [addingEp, setAddingEp] = useState(false);
  const [epForm, setEpForm]     = useState({ title: '', ep_num: 1, description: '', duration: '', thumb_url: '', video_url: '' });
  const [editEp, setEditEp]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const addSeason = async () => {
    if (!newSeasonTitle.trim()) return;
    setLoading(true);
    try {
      const s = await DB.createSeason(series.id, newSeasonTitle.trim(), seasons.length + 1);
      setSeasons(p => [...p, s]);
      setNewSeasonTitle('');
      setSelSeason(seasons.length);
      showToast('✓ تم إضافة الموسم');
    } catch (e) { showToast('خطأ: ' + e.message); }
    setLoading(false);
  };

  const delSeason = async (sid) => {
    if (!window.confirm('حذف هذا الموسم وجميع حلقاته؟')) return;
    await DB.deleteSeason(sid);
    setSeasons(p => p.filter(s => s.id !== sid));
    setSelSeason(0);
    showToast('تم الحذف');
  };

  const addEpisode = async () => {
    if (!epForm.title.trim() || seasons.length === 0) return;
    setLoading(true);
    try {
      const ep = await DB.createEpisode(seasons[selSeason].id, series.id, {
        ...epForm, ep_num: (seasons[selSeason].episodes?.length || 0) + 1
      });
      setSeasons(p => p.map((s, i) => i === selSeason ? { ...s, episodes: [...(s.episodes || []), ep] } : s));
      setEpForm({ title: '', ep_num: 1, description: '', duration: '', thumb_url: '', video_url: '' });
      setAddingEp(false);
      showToast('✓ تمت إضافة الحلقة');
    } catch (e) { showToast('خطأ: ' + e.message); }
    setLoading(false);
  };

  const saveEpisode = async (ep, updates) => {
    setLoading(true);
    try {
      const updated = await DB.updateEpisode(ep.id, updates);
      setSeasons(p => p.map((s, i) =>
        i === selSeason ? { ...s, episodes: s.episodes.map(e => e.id === ep.id ? updated : e) } : s
      ));
      setEditEp(null);
      showToast('✓ تم حفظ الحلقة');
    } catch (e) { showToast('خطأ: ' + e.message); }
    setLoading(false);
  };

  const delEpisode = async (epId) => {
    await DB.deleteEpisode(epId);
    setSeasons(p => p.map((s, i) => i === selSeason ? { ...s, episodes: s.episodes.filter(e => e.id !== epId) } : s));
    showToast('تم الحذف');
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 800 }}>
        <div className="modal-head">
          <h3>📺 مواسم: {series.title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Add season */}
        <div style={{ display: 'flex', gap: '.6rem', marginBottom: '1rem' }}>
          <input className="fi fi-rtl" style={{ flex: 1 }} value={newSeasonTitle}
            onChange={e => setNewSeasonTitle(e.target.value)} placeholder="اسم الموسم (مثال: الموسم 1)"
            onKeyDown={e => e.key === 'Enter' && addSeason()} />
          <button onClick={addSeason} disabled={loading} className="btn-play" style={{ fontSize: '.8rem', padding: '.6rem 1.2rem', whiteSpace: 'nowrap' }}>
            {loading ? <Spinner size="sm" /> : '+ موسم'}
          </button>
        </div>

        {seasons.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--t4)', background: 'var(--bg3)', borderRadius: 8, border: '1px dashed var(--s3)', fontSize: '.82rem' }}>
            لا توجد مواسم — أضف موسماً أولاً
          </div>
        )}

        {seasons.length > 0 && (
          <>
            <div className="season-tabs" style={{ marginBottom: '1rem' }}>
              {seasons.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '.2rem' }}>
                  <button className={`season-tab ${selSeason === i ? 'active' : ''}`} onClick={() => setSelSeason(i)}>
                    {s.title} <span style={{ opacity: .6, fontSize: '.63rem' }}>({s.episodes?.length || 0})</span>
                  </button>
                  <button onClick={() => delSeason(s.id)} style={{ background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', fontSize: '.8rem', padding: '.2rem' }}>🗑</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.7rem' }}>
              <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t2)' }}>{seasons[selSeason]?.title}</div>
              <button onClick={() => setAddingEp(true)} className="a-btn a-btn-green">+ حلقة جديدة</button>
            </div>

            {/* Add episode form */}
            {addingEp && (
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--s3)', borderRadius: 10, padding: '1.1rem', marginBottom: '.9rem' }}>
                <div className="form-grid">
                  <div className="fg"><label className="fl">عنوان الحلقة *</label><input className="fi fi-rtl" value={epForm.title} onChange={e => setEpForm(p => ({ ...p, title: e.target.value }))} /></div>
                  <div className="fg"><label className="fl">المدة</label><input className="fi" value={epForm.duration} onChange={e => setEpForm(p => ({ ...p, duration: e.target.value }))} placeholder="45د" /></div>
                  <div className="fg form-full"><label className="fl">رابط الفيديو</label><input className="fi" value={epForm.video_url} onChange={e => setEpForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." /></div>
                  <div className="fg"><label className="fl">رابط الصورة المصغرة</label><input className="fi" value={epForm.thumb_url} onChange={e => setEpForm(p => ({ ...p, thumb_url: e.target.value }))} /></div>
                  <div className="fg"><label className="fl">الوصف</label><input className="fi fi-rtl" value={epForm.description} onChange={e => setEpForm(p => ({ ...p, description: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', gap: '.6rem', marginTop: '.5rem' }}>
                  <button onClick={addEpisode} disabled={loading} className="btn-play" style={{ fontSize: '.8rem', padding: '.55rem 1.2rem' }}>
                    {loading ? <Spinner size="sm" /> : '💾 إضافة'}
                  </button>
                  <button onClick={() => setAddingEp(false)} style={{ padding: '.55rem 1rem', background: 'var(--s2)', border: '1px solid var(--s3)', borderRadius: 7, color: 'var(--t2)', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '.8rem' }}>إلغاء</button>
                </div>
              </div>
            )}

            {/* Edit episode inline */}
            {(seasons[selSeason]?.episodes || []).length === 0 && !addingEp && (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--t4)', fontSize: '.8rem' }}>لا توجد حلقات — أضف أول حلقة</div>
            )}
            {(seasons[selSeason]?.episodes || []).map((ep, i) => (
              <div key={ep.id}>
                {editEp?.id === ep.id ? (
                  <EpEditInline ep={ep} onSave={updates => saveEpisode(ep, updates)} onCancel={() => setEditEp(null)} loading={loading} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem', padding: '.75rem .9rem', background: 'var(--bg3)', border: '1px solid var(--s2)', borderRadius: 8, marginBottom: '.5rem' }}>
                    {ep.thumb_url
                      ? <img src={ep.thumb_url} alt="" style={{ width: 80, height: 46, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                      : <div style={{ width: 80, height: 46, background: 'var(--s2)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)', flexShrink: 0 }}>▶</div>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.82rem' }}>{ep.ep_num || i+1}. {ep.title}</div>
                      <div style={{ fontSize: '.68rem', color: 'var(--t4)' }}>
                        {ep.duration && `⏱ ${ep.duration}`}
                        {ep.video_url && ' · 🎬 رابط متاح'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.35rem', flexShrink: 0 }}>
                      <button onClick={() => setEditEp(ep)} className="a-btn a-btn-edit">تعديل</button>
                      <button onClick={() => delEpisode(ep.id)} className="a-btn a-btn-del">حذف</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EpEditInline({ ep, onSave, onCancel, loading }) {
  const [f, setF] = useState({ title: ep.title, description: ep.description || '', duration: ep.duration || '', thumb_url: ep.thumb_url || '', video_url: ep.video_url || '' });
  return (
    <div style={{ background: 'var(--s1)', border: '1px solid var(--red)', borderRadius: 9, padding: '1rem', marginBottom: '.5rem' }}>
      <div className="form-grid">
        <div className="fg"><label className="fl">العنوان</label><input className="fi fi-rtl" value={f.title} onChange={e => setF(p => ({ ...p, title: e.target.value }))} /></div>
        <div className="fg"><label className="fl">المدة</label><input className="fi" value={f.duration} onChange={e => setF(p => ({ ...p, duration: e.target.value }))} /></div>
        <div className="fg form-full"><label className="fl">رابط الفيديو</label><input className="fi" value={f.video_url} onChange={e => setF(p => ({ ...p, video_url: e.target.value }))} /></div>
        <div className="fg"><label className="fl">الصورة المصغرة</label><input className="fi" value={f.thumb_url} onChange={e => setF(p => ({ ...p, thumb_url: e.target.value }))} /></div>
        <div className="fg"><label className="fl">الوصف</label><input className="fi fi-rtl" value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} /></div>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
        <button onClick={() => onSave(f)} disabled={loading} className="btn-play" style={{ fontSize: '.78rem', padding: '.5rem 1rem' }}>{loading ? <Spinner size="sm" /> : '💾 حفظ'}</button>
        <button onClick={onCancel} style={{ padding: '.5rem .9rem', background: 'var(--s2)', border: '1px solid var(--s3)', borderRadius: 7, color: 'var(--t2)', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '.78rem' }}>إلغاء</button>
      </div>
    </div>
  );
}

/* ═══════════════ ADMIN PAGE ════════════════════════════════════ */
function AdminPage({ movies, series, goHome, onRefresh }) {
  const [tab, setTab]         = useState('stats');
  const [users, setUsers]     = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [seasonsItem, setSeasonsItem] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast]     = useState({ msg: '', type: '' });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const all = [...movies, ...series];

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: '' }), 3200); };

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      setLoadingUsers(true);
      DB.getAllUsers().then(d => { setUsers(d); setLoadingUsers(false); });
    }
  }, [tab]);

  const handleDelete = (item) => {
    setConfirm({
      msg: `حذف "${item.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
      onYes: async () => {
        setConfirm(null);
        await DB.deleteContent(item.id);
        showToast('✓ تم الحذف نهائياً من قاعدة البيانات');
        onRefresh();
      }
    });
  };

  const toggleField = async (item, field) => {
    await DB.updateContent(item.id, { [field]: !item[field] });
    showToast('✓ تم التحديث');
    onRefresh();
  };

  const toggleAdmin = async (uid, current) => {
    await sb.from('profiles').update({ is_admin: !current }).eq('id', uid);
    setUsers(u => u.map(x => x.id === uid ? { ...x, is_admin: !current } : x));
    showToast(`✓ تم ${current ? 'إلغاء' : 'منح'} صلاحية الأدمين`);
  };

  const catLabel2 = c => ({ arabic: 'عربي', tunisian: 'تونسي', international: 'عالمي' })[c] || c;

  return (
    <div className="admin-page">
      {toast.msg && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:'', type:'' })} />}
      {confirm && <Confirm msg={confirm.msg} onYes={confirm.onYes} onNo={() => setConfirm(null)} />}
      {editItem && (
        <ContentFormModal item={editItem === 'new-movie' ? { type:'movie' } : editItem === 'new-series' ? { type:'series' } : editItem}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); onRefresh(); }}
          showToast={showToast} />
      )}
      {seasonsItem && <SeasonsModal series={seasonsItem} onClose={() => setSeasonsItem(null)} showToast={showToast} />}

      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={goHome} style={{ padding: '.4rem .9rem', background: 'var(--s2)', border: '1px solid var(--s3)', borderRadius: 8, color: 'var(--t2)', cursor: 'pointer', fontFamily: "'Cairo',sans-serif", fontSize: '.78rem' }}>🏠 الرئيسية</button>
          <div className="admin-title"><span>FLIX</span><span style={{ color: 'var(--red)' }}>TN</span></div>
          <span className="admin-badge">لوحة الإدارة</span>
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--t4)' }}>{movies.length} فيلم · {series.length} مسلسل · {users.length} مستخدم</div>
      </div>

      <div className="admin-tabs">
        {[['stats','📊 إحصائيات'],['movies','🎬 الأفلام'],['series','📺 المسلسلات'],['users','👥 المستخدمون'],['add','➕ إضافة']].map(([k,l]) => (
          <button key={k} className={`a-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* STATS */}
      {tab === 'stats' && (
        <div>
          <div className="stat-grid">
            <div className="stat-box"><div className="stat-val" style={{ color: 'var(--cyan)' }}>{movies.length}</div><div className="stat-lbl">الأفلام</div></div>
            <div className="stat-box"><div className="stat-val" style={{ color: 'var(--purp)' }}>{series.length}</div><div className="stat-lbl">المسلسلات</div></div>
            <div className="stat-box"><div className="stat-val">{users.length || '—'}</div><div className="stat-lbl">المستخدمون</div></div>
            <div className="stat-box"><div className="stat-val" style={{ color: 'var(--green)' }}>{series.reduce((a,s) => a + (s.seasons?.reduce((b,se) => b + (se.episodes?.length||0),0)||0), 0)}</div><div className="stat-lbl">الحلقات</div></div>
            <div className="stat-box"><div className="stat-val">{all.filter(x=>x.is_featured).length}</div><div className="stat-lbl">مميز</div></div>
            <div className="stat-box"><div className="stat-val">{all.filter(x=>x.is_trending).length}</div><div className="stat-lbl">رائج</div></div>
          </div>
          <div className="admin-table-wrap">
            <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--s2)', fontFamily: "'Oswald',sans-serif", fontSize: '.85rem', fontWeight: 600 }}>آخر الإضافات</div>
            <table className="at">
              <thead><tr><th>الصورة</th><th>العنوان</th><th>النوع</th><th>التقييم</th><th>التصنيف</th></tr></thead>
              <tbody>{all.slice(0,8).map(it => (
                <tr key={it.id}>
                  <td><img className="a-thumb" src={it.poster_url||it.poster} alt="" onError={e => e.target.src='https://picsum.photos/38/54'} /></td>
                  <td style={{ fontWeight: 600 }}>{it.title}</td>
                  <td><span style={{ fontSize: '.68rem', background: 'var(--s2)', padding: '.2rem .5rem', borderRadius: 4 }}>{it.type==='movie'?'فيلم':'مسلسل'}</span></td>
                  <td><span style={{ color: '#f5c518', fontWeight: 700 }}>★ {it.rating}</span></td>
                  <td style={{ fontSize: '.72rem', color: 'var(--t3)' }}>{catLabel2(it.category)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOVIES TABLE */}
      {tab === 'movies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '.82rem', color: 'var(--t3)' }}>{movies.length} فيلم في قاعدة البيانات</div>
            <button onClick={() => setEditItem('new-movie')} className="btn-play" style={{ fontSize: '.78rem', padding: '.55rem 1.2rem' }}>+ فيلم جديد</button>
          </div>
          <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="at">
              <thead><tr><th>الصورة</th><th>العنوان</th><th>السنة</th><th>التقييم</th><th>تصنيف</th><th>مميز</th><th>رائج</th><th>الإجراءات</th></tr></thead>
              <tbody>{movies.map(m => (
                <tr key={m.id}>
                  <td><img className="a-thumb" src={m.poster_url||m.poster} alt="" onError={e => e.target.src='https://picsum.photos/38/54'} /></td>
                  <td style={{ fontWeight: 600, maxWidth: 180 }}><div style={{ whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{m.title}</div></td>
                  <td>{m.year}</td>
                  <td><span style={{ color:'#f5c518', fontWeight:700 }}>★ {m.rating}</span></td>
                  <td style={{ fontSize:'.72rem',color:'var(--t3)' }}>{catLabel2(m.category)}</td>
                  <td>
                    <button onClick={() => toggleField(m, 'is_featured')} className={`a-toggle ${m.is_featured?'on':'off'}`}>
                      {m.is_featured ? '★ مميز' : 'تمييز'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => toggleField(m, 'is_trending')} className={`a-toggle ${m.is_trending?'on':'off'}`}>
                      {m.is_trending ? '🔥 رائج' : 'رائج'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'.35rem' }}>
                      <button onClick={() => setEditItem(m)} className="a-btn a-btn-edit">تعديل</button>
                      <button onClick={() => handleDelete(m)} className="a-btn a-btn-del">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* SERIES TABLE */}
      {tab === 'series' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '.82rem', color: 'var(--t3)' }}>{series.length} مسلسل في قاعدة البيانات</div>
            <button onClick={() => setEditItem('new-series')} className="btn-play" style={{ fontSize: '.78rem', padding: '.55rem 1.2rem' }}>+ مسلسل جديد</button>
          </div>
          <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="at">
              <thead><tr><th>الصورة</th><th>العنوان</th><th>السنة</th><th>المواسم</th><th>الحلقات</th><th>الإجراءات</th></tr></thead>
              <tbody>{series.map(s => (
                <tr key={s.id}>
                  <td><img className="a-thumb" src={s.poster_url||s.poster} alt="" onError={e => e.target.src='https://picsum.photos/38/54'} /></td>
                  <td style={{ fontWeight: 600, maxWidth: 180 }}><div style={{ whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{s.title}</div></td>
                  <td>{s.year}</td>
                  <td><span style={{ background:'rgba(0,212,255,.1)',color:'var(--cyan)',padding:'.18rem .45rem',borderRadius:4,fontSize:'.72rem',fontWeight:700 }}>{s.seasons?.length||0}</span></td>
                  <td><span style={{ background:'rgba(29,185,84,.1)',color:'var(--green)',padding:'.18rem .45rem',borderRadius:4,fontSize:'.72rem',fontWeight:700 }}>{s.seasons?.reduce((a,se)=>a+(se.episodes?.length||0),0)||0}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'.35rem', flexWrap:'wrap' }}>
                      <button onClick={() => setEditItem(s)} className="a-btn a-btn-edit">تعديل</button>
                      <button onClick={() => setSeasonsItem(s)} className="a-btn a-btn-green">المواسم</button>
                      <button onClick={() => handleDelete(s)} className="a-btn a-btn-del">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TABLE */}
      {tab === 'users' && (
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          {loadingUsers ? <div style={{ padding: '2rem', textAlign: 'center' }}><Spinner /></div> : (
            <table className="at">
              <thead><tr><th>الصورة</th><th>الاسم</th><th>تاريخ التسجيل</th><th>الدور</th><th>الإجراءات</th></tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.id}>
                  <td><img src={u.avatar_url||`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt=""
                    style={{ width:34,height:34,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--s3)',background:'var(--s2)' }} /></td>
                  <td style={{ fontWeight:600 }}>{u.username||'—'}</td>
                  <td style={{ fontSize:'.72rem',color:'var(--t3)' }}>{new Date(u.created_at).toLocaleDateString('ar-TN')}</td>
                  <td>
                    <span style={{ background:u.is_admin?'var(--redbg)':'rgba(29,185,84,.1)', color:u.is_admin?'var(--red3)':'var(--green)', border:`1px solid ${u.is_admin?'var(--redbr)':'rgba(29,185,84,.3)'}`, padding:'.22rem .65rem', borderRadius:20, fontSize:'.66rem', fontWeight:700 }}>
                      {u.is_admin ? '👑 مدير' : '✓ مستخدم'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => toggleAdmin(u.id, u.is_admin)} style={{ padding:'.28rem .65rem', background:'rgba(245,197,24,.1)', border:'1px solid rgba(245,197,24,.2)', borderRadius:5, color:'var(--gold)', cursor:'pointer', fontSize:'.67rem', fontFamily:"'Cairo',sans-serif" }}>
                      {u.is_admin ? 'إلغاء مدير' : 'ترقية مدير'}
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {/* ADD TAB */}
      {tab === 'add' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-section" style={{ textAlign:'center', cursor:'pointer' }} onClick={() => { setEditItem('new-movie'); setTab('movies'); }}>
            <div style={{ fontSize:'3rem', marginBottom:'.8rem' }}>🎬</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'.4rem' }}>إضافة فيلم</div>
            <div style={{ fontSize:'.78rem', color:'var(--t3)' }}>أضف فيلماً جديداً مع كل بياناته</div>
          </div>
          <div className="form-section" style={{ textAlign:'center', cursor:'pointer' }} onClick={() => { setEditItem('new-series'); setTab('series'); }}>
            <div style={{ fontSize:'3rem', marginBottom:'.8rem' }}>📺</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:'1.1rem', fontWeight:600, marginBottom:'.4rem' }}>إضافة مسلسل</div>
            <div style={{ fontSize:'.78rem', color:'var(--t3)' }}>أضف مسلسلاً مع مواسمه وحلقاته</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ FOOTER ════════════════════════════════════════ */
function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-logo"><span>FLIX</span><span style={{ color:'var(--red)' }}>TN</span></div>
          <div className="footer-desc">بوابتك إلى السينما العربية والتونسية والعالمية. محتوى غير محدود في أي وقت.</div>
        </div>
        <div>
          <div className="footer-col-title">تصفح</div>
          {[['الرئيسية','home'],['الأفلام','movies'],['المسلسلات','series']].map(([l,k]) =>
            <span key={k} className="footer-link" onClick={() => onNav(k)}>{l}</span>)}
        </div>
        <div>
          <div className="footer-col-title">الأنواع</div>
          {['دراما','أكشن','خيال علمي','كوميديا','رعب'].map(g => <span key={g} className="footer-link">{g}</span>)}
        </div>
        <div>
          <div className="footer-col-title">الدعم</div>
          {['من نحن','سياسة الخصوصية','شروط الاستخدام','اتصل بنا'].map(l => <span key={l} className="footer-link">{l}</span>)}
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© {new Date().getFullYear()} FlixTN. جميع الحقوق محفوظة.</div>
        <div style={{ display:'flex', gap:'1rem' }}>
          {['الخصوصية','الشروط','المساعدة'].map(l => <span key={l} className="footer-copy" style={{ cursor:'pointer' }}>{l}</span>)}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════ ROOT APP ══════════════════════════════════════ */
function App() {
  // ── STATE ──────────────────────────────────────────────────
  const [page,         setPage]         = useState('home');
  const [user,         setUser]         = useState(null);
  const [profile,      setProfile]      = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [movies,       setMovies]       = useState([]);
  const [series,       setSeries]       = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [favorites,    setFavorites]    = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [playerItem,   setPlayerItem]   = useState(null);
  const [playerEp,     setPlayerEp]     = useState(null);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [toast,        setToast]        = useState({ msg:'', type:'' });

  const showToast = useCallback((msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg:'',type:'' }), 3200); }, []);
  const navigate  = useCallback((p) => { setPage(p); window.scrollTo(0,0); }, []);

  // ── SESSION RESTORE (critical fix) ─────────────────────────
  useEffect(() => {
    // First: check existing session
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        DB.getProfile(session.user.id).then(p => { setProfile(p); });
      }
      setSessionLoading(false);
    });

    // Then: listen for future changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const p = await DB.getProfile(session.user.id);
        setProfile(p);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setProfile(null); setFavorites([]);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── LOAD CONTENT ───────────────────────────────────────────
  const loadContent = useCallback(() => {
    setContentLoading(true);
    DB.getAllContent().then(all => {
      setMovies(all.filter(c => c.type === 'movie'));
      setSeries(all.filter(c => c.type === 'series'));
      setContentLoading(false);
    }).catch(() => setContentLoading(false));
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  // ── LOAD FAVORITES ─────────────────────────────────────────
  useEffect(() => {
    if (user) DB.getFavorites(user.id).then(setFavorites).catch(() => {});
  }, [user]);

  // ── SCROLL ─────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── HANDLERS ───────────────────────────────────────────────
  const handleAuth = useCallback((u, p) => {
    setUser(u); setProfile(p);
    navigate('home');
    showToast('مرحباً! تم تسجيل الدخول ✓', 'success');
  }, [navigate, showToast]);

  const handleLogout = useCallback(async () => {
    await DB.logout();
    setUser(null); setProfile(null); setFavorites([]);
    setUserMenuOpen(false);
    navigate('home');
    showToast('تم تسجيل الخروج');
  }, [navigate, showToast]);

  const handleItemClick = useCallback((item) => {
    setSelectedId(item.id);
    navigate('detail');
  }, [navigate]);

  const handlePlay = useCallback(async (item) => {
    setPlayerItem(item); setPlayerEp(null);
    navigate('player');
    if (user) DB.addHistory(user.id, item.id).catch(() => {});
  }, [navigate, user]);

  const handleSelectEp = useCallback(async (item, ep) => {
    setPlayerItem(item); setPlayerEp(ep);
    navigate('player');
    if (user) DB.addHistory(user.id, item.id, ep.id).catch(() => {});
  }, [navigate, user]);

  const handleFavToggle = useCallback(async (item) => {
    if (!user) { showToast('يرجى تسجيل الدخول أولاً', 'error'); return; }
    const added = await DB.toggleFavorite(user.id, item.id);
    setFavorites(prev => added
      ? [...prev, { content_id: item.id, content: item }]
      : prev.filter(f => f.content_id !== item.id)
    );
    showToast(added ? '❤ أضيف للمفضلة' : 'تمت الإزالة من المفضلة');
  }, [user, showToast]);

  const handleBack = useCallback(() => {
    if (page === 'player') { navigate(selectedId ? 'detail' : 'home'); return; }
    navigate('home');
  }, [page, selectedId, navigate]);

  // ── LOADING SCREEN ─────────────────────────────────────────
  if (sessionLoading) return (
    <div>
      <style>{GLOBAL_CSS}</style>
      <div className="loading-screen">
        <div className="loading-logo"><span style={{ color:'#fff' }}>FLIX</span><span style={{ color:'var(--red)' }}>TN</span></div>
        <Spinner />
      </div>
    </div>
  );

  const isAdmin     = profile?.is_admin;
  const showNav     = !['auth','player'].includes(page);
  const showFooter  = !['auth','player','admin'].includes(page);
  const favIds      = new Set(favorites.map(f => f.content_id));

  return (
    <div>
      <style>{GLOBAL_CSS}</style>

      {/* TOAST */}
      {toast.msg && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:'',type:'' })} />}

      {/* SEARCH */}
      {searchOpen && (
        <SearchOverlay movies={movies} series={series}
          onItemClick={it => { handleItemClick(it); setSearchOpen(false); }}
          onClose={() => setSearchOpen(false)} />
      )}

      {/* NAV */}
      {showNav && (
        <nav className={`nav ${scrolled ? 'solid' : 'transparent'}`}>
          <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
            <div className="nav-logo" onClick={() => navigate('home')}>
              <span className="f">FLIX</span><span className="t">TN</span>
            </div>
            <div className="nav-links">
              {[['home','الرئيسية'],['movies','الأفلام'],['series','المسلسلات']].map(([k,l]) => (
                <div key={k} className={`nav-link ${page===k?'active':''}`} onClick={() => navigate(k)}>{l}</div>
              ))}
              {isAdmin && <div className={`nav-link ${page==='admin'?'active':''}`} onClick={() => navigate('admin')}>⚙ الإدارة</div>}
            </div>
          </div>
          <div className="nav-right">
            <button className="nav-icon" onClick={() => setSearchOpen(true)}>🔍</button>
            {user ? (
              <div className="avatar-wrap">
                <img className="avatar-img"
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="" onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username||'U'}`; }} />
                {userMenuOpen && (
                  <div className="user-menu">
                    <div className="user-menu-head">
                      <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt=""
                        onError={e => { e.target.src=`https://api.dicebear.com/7.x/initials/svg?seed=U`; }} />
                      <div>
                        <div className="name">{profile?.username || 'مستخدم'}</div>
                        <div className="email">{user.email}</div>
                      </div>
                    </div>
                    <button className="menu-item" onClick={() => { navigate('home'); setUserMenuOpen(false); }}>🏠 الرئيسية</button>
                    <button className="menu-item" onClick={() => { navigate('profile'); setUserMenuOpen(false); }}>👤 ملفي الشخصي</button>
                    {isAdmin && <button className="menu-item" onClick={() => { navigate('admin'); setUserMenuOpen(false); }}>⚙ لوحة الإدارة</button>}
                    <div className="menu-div" />
                    <button className="menu-item" style={{ color:'var(--red3)' }} onClick={handleLogout}>🚪 تسجيل الخروج</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:'flex', gap:'.5rem' }}>
                <button className="btn-login"  onClick={() => navigate('auth')}>دخول</button>
                <button className="btn-signup" onClick={() => navigate('auth')}>انضم مجاناً</button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* backdrop to close menu */}
      {userMenuOpen && <div style={{ position:'fixed',inset:0,zIndex:150 }} onClick={() => setUserMenuOpen(false)} />}

      {/* PAGES */}
      {page === 'auth'    && <AuthPage onAuth={handleAuth} onBack={() => navigate('home')} />}
      {page === 'home'    && <HomePage movies={movies} series={series} loading={contentLoading} onItemClick={handleItemClick} onPlay={handlePlay} user={user} favorites={favorites} onFavToggle={handleFavToggle} />}
      {page === 'movies'  && <ContentListPage type="movie"  items={movies} loading={contentLoading} onItemClick={handleItemClick} user={user} favorites={favorites} onFavToggle={handleFavToggle} />}
      {page === 'series'  && <ContentListPage type="series" items={series} loading={contentLoading} onItemClick={handleItemClick} user={user} favorites={favorites} onFavToggle={handleFavToggle} />}
      {page === 'detail'  && selectedId && <DetailPage itemId={selectedId} onPlay={handlePlay} onBack={handleBack} user={user} favorites={favorites} onFavToggle={handleFavToggle} onSelectEp={handleSelectEp} />}
      {page === 'player'  && playerItem  && <PlayerPage item={playerItem} episode={playerEp} onBack={handleBack} />}
      {page === 'profile' && user        && <ProfilePage user={user} profile={profile} onLogout={handleLogout} onProfileUpdate={p => setProfile(p)} movies={movies} series={series} />}
      {page === 'admin'   && isAdmin     && <AdminPage movies={movies} series={series} goHome={() => navigate('home')} onRefresh={loadContent} />}
      {page === 'admin'   && !isAdmin    && navigate('home')}

      {showFooter && <Footer onNav={navigate} />}
    </div>
  );
}
