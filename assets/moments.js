(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const section = $('.moments');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width:800px)');
  const scenes = {
    morning: {time:'06:30', light:'Das erste Licht.', caption:'Das Haus wird wach. Du warst schon im Wasser.', alt:'KI-Szene: ruhiger Gartenpool im Morgenlicht mit einer schwimmenden Person'},
    together: {time:'16:00', light:'Zeit, die bleiben darf.', caption:'Kein Weg nach Hause. Du bist schon da.', alt:'KI-Szene: zwei Erwachsene sitzen entspannt am Pool ihres fiktiven Gartens'},
    evening: {time:'21:15', light:'Nur noch dieser Moment.', caption:'Die letzten Gedanken ziehen weiter. Du bleibst.', alt:'KI-Szene: derselbe Poolgarten in der Abenddämmerung mit dezenter Beleuchtung'}
  };
  const order = Object.keys(scenes), tabs = $$('[data-moment-choice]');
  const visual = $('.moment-visual'), base = $('#moment-image'), overlay = $('#moment-image-next');
  let active = 'morning', displayed = 'morning', requestId = 0;
  const sourceFor = key => `assets/moment-${key}${narrow.matches ? '-small' : ''}.webp`;
  const updateOrientation = () => $('.moment-tabs').setAttribute('aria-orientation', narrow.matches ? 'horizontal' : 'vertical');
  updateOrientation(); narrow.addEventListener('change', updateOrientation);
  const updateDots = () => $$('#moment-cycle i').forEach((dot, index) => dot.classList.toggle('is-active', order[index] === active));
  updateDots();
  function selectMoment(key, focus = false) {
    if (!scenes[key]) return;
    active = key; section.dataset.moment = key;
    const id = ++requestId, scene = scenes[key];
    tabs.forEach(button => { const selected = button.dataset.momentChoice === key; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; if (focus && selected) button.focus(); });
    $('#moment-panel').setAttribute('aria-labelledby', 'moment-tab-' + key);
    updateDots();
    const preload = new Image();
    preload.onload = () => {
      if (id !== requestId) return;
      $('#moment-clock').textContent = scene.time;
      $('#moment-light').textContent = scene.light;
      $('#moment-caption').textContent = scene.caption;
      if (displayed === key) { if (window.gsap) gsap.killTweensOf(overlay); overlay.hidden = true; return; }
      const complete = () => {
        if (id !== requestId) return;
        base.srcset = `assets/moment-${key}-small.webp 850w, assets/moment-${key}.webp 1536w`;
        base.src = `assets/moment-${key}.webp`; base.alt = scene.alt; overlay.hidden = true; displayed = key;
      };
      if (window.gsap && !reduced.matches) {
        gsap.killTweensOf(overlay); overlay.src = preload.src; overlay.hidden = false;
        gsap.fromTo(overlay, {clipPath:'inset(0 0 100% 0)'}, {clipPath:'inset(0 0 0% 0)', duration:.85, ease:'power2.inOut', onComplete:complete});
        gsap.fromTo('.moment-image-label', {opacity:.2, y:9}, {opacity:1, y:0, duration:.65, ease:'power2.out'});
      } else complete();
    };
    preload.onerror = () => {
      if (id !== requestId) return;
      active = displayed; section.dataset.moment = displayed;
      tabs.forEach(button => { const selected = button.dataset.momentChoice === displayed; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
      $('#moment-panel').setAttribute('aria-labelledby', 'moment-tab-' + displayed); updateDots();
    };
    preload.src = sourceFor(key);
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => selectMoment(button.dataset.momentChoice));
    button.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); selectMoment(tabs[next].dataset.momentChoice, true); }
    });
  });
  $('#moment-cycle').addEventListener('click', () => selectMoment(order[(order.indexOf(active) + 1) % order.length]));
  visual.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || reduced.matches) return;
    const rect = visual.getBoundingClientRect(), x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
    visual.style.setProperty('--image-x', ((x - .5) * -10).toFixed(2) + 'px');
    visual.style.setProperty('--image-y', ((y - .5) * -7).toFixed(2) + 'px');
    visual.style.setProperty('--light-x', (x * 100).toFixed(1) + '%'); visual.style.setProperty('--light-y', (y * 100).toFixed(1) + '%');
  });
  visual.addEventListener('pointerleave', () => { visual.style.setProperty('--image-x', '0px'); visual.style.setProperty('--image-y', '0px'); });
  visual.addEventListener('pointerdown', e => {
    if (reduced.matches || !window.gsap) return;
    const rect = visual.getBoundingClientRect(), ripple = $('.moment-ripple');
    ripple.style.left = (e.clientX - rect.left - 80) + 'px'; ripple.style.top = (e.clientY - rect.top - 80) + 'px';
    gsap.fromTo(ripple, {scale:.15, opacity:.6}, {scale:1.8, opacity:0, duration:1.25, ease:'power2.out', overwrite:true});
  });

  const compare = $('#project-compare'), project = $('.project-main');
  const updateCompare = () => { const value = Number(compare.value); project.style.setProperty('--compare', value + '%'); compare.setAttribute('aria-valuetext', `${value} Prozent des fertigen Poolgartens sichtbar`); };
  compare.addEventListener('input', updateCompare); updateCompare();

  if (window.gsap && window.ScrollTrigger) {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('#moments-title', {y:28, opacity:0, duration:.9, ease:'power2.out', scrollTrigger:{trigger:'#moments-title', start:'top 90%', once:true}});
      gsap.from('.moment-tabs', {y:14, duration:.7, ease:'power2.out', scrollTrigger:{trigger:'.moment-tabs', start:'top 93%', once:true}});
      gsap.fromTo('.moments-water-rule', {scaleX:0}, {scaleX:1, ease:'none', scrollTrigger:{trigger:'.moments-footer', start:'top 95%', end:'top 55%', scrub:.7}});
    });
    mm.add('(min-width:801px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.moment-visual', {clipPath:'inset(4% 5% 4% 5%)'}, {clipPath:'inset(0% 0% 0% 0%)', ease:'none', scrollTrigger:{trigger:'.moment-visual', start:'top 95%', end:'top 35%', scrub:.8}});
    });
  }
})();
