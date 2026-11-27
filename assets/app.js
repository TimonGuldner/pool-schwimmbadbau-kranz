(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 800px)');
  const cfg = window.BETRIEB || {};

  const menu = $('.menu-toggle');
  const closeMenu = () => { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menü öffnen'); $('#navigation').classList.remove('open'); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); $('#navigation').classList.toggle('open', open); });
  $$('#navigation a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => { if (!$('.header').contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  mobile.addEventListener('change', closeMenu);

  // Architecture is the opening scene. Video is an explicit full-screen alternative.
  const film = $('#hero-film'), filmToggle = $('#film-toggle');
  let userRequestedFilm = false, heroVisible = true;
  const filmState = playing => {
    film.classList.toggle('is-playing', playing);
    filmToggle.setAttribute('aria-pressed', String(playing));
    filmToggle.setAttribute('aria-label', playing ? 'Architektur ansehen' : 'Wasserfilm ansehen');
    filmToggle.textContent = playing ? 'Architektur ansehen' : 'Wasserfilm ansehen';
    $('#hero-credit').textContent = playing ? 'Poolfilm · freie Bildwelt, keine Referenz' : 'KI-Architekturstudie · Design-Demo';
  };
  const loadFilm = () => { if (film.dataset.loaded) return; const source = $('source', film); source.src = mobile.matches ? 'assets/water-film-mobile.mp4' : source.dataset.src; film.load(); film.dataset.loaded = 'true'; };
  const startFilm = async () => { loadFilm(); try { await film.play(); if (userRequestedFilm && heroVisible && !document.hidden) filmState(true); else { film.pause(); filmState(false); } } catch { filmState(false); } };
  const pauseFilm = () => { film.pause(); filmState(false); };
  filmToggle.addEventListener('click', () => { userRequestedFilm = !userRequestedFilm; if (userRequestedFilm) startFilm(); else pauseFilm(); });
  const syncFilm = () => { if (heroVisible && !document.hidden && userRequestedFilm && !reduced.matches) startFilm(); else pauseFilm(); };
  document.addEventListener('hero-light-change', () => { userRequestedFilm = false; pauseFilm(); });
  document.addEventListener('visibilitychange', syncFilm);
  reduced.addEventListener('change', () => { userRequestedFilm = false; pauseFilm(); });

  // A coherent fictional case study. The photographs show the same garden in three stages.
  const phases = {
    before: {src:'assets/before.webp', alt:'KI-Projektstudie: Garten vor dem Poolbau mit Rasen und dunklem Holzhaus', title:'Viel Garten. Noch keine Verbindung.', copy:'Im Beispiel wird die Rasenfläche selten genutzt. Gewünscht ist ein Ort zum Schwimmen, Sitzen und Zusammensein. Die vorhandenen Bäume und der Charakter des Hauses sollen bleiben.'},
    build: {src:'assets/build.webp', alt:'KI-Projektstudie: Poolbecken im Bau, noch ohne Wasser und fertigen Beckenrand', title:'Die Idee bekommt ein Fundament.', copy:'Das Becken nimmt die Linien des Hauses auf. Aufbau, Abdichtung und Anschlüsse werden aufeinander abgestimmt. Der neue Außenraum wächst aus dem Bestand heraus.'},
    finished: {src:'assets/pool.webp', alt:'KI-Projektstudie: fertiger geradliniger Poolgarten am dunklen Holzhaus', title:'Der Pool gehört zum Haus.', copy:'Heller Stein führt die Terrasse ans Wasser. Breite Stufen werden zum ruhigen Einstieg. Der Garten behält seine Bäume – und bekommt einen neuen Mittelpunkt.'}
  };
  let phaseToken = 0;
  const imageSwap = (img, src, alt) => { const token = String(++phaseToken); img.dataset.swap = token; const temp = new Image(); temp.onload = () => { if (img.dataset.swap !== token) return; img.src = src; img.alt = alt; img.classList.remove('is-switching'); }; temp.onerror = () => img.classList.remove('is-switching'); img.classList.add('is-switching'); temp.src = src; };
  const tabs = $$('[data-stage]');
  const selectPhase = (button, focus = false) => { const data = phases[button.dataset.stage]; $('.project-main').classList.toggle('show-comparison', button.dataset.stage === 'finished'); const compareHint = $('#comparison-instruction'); if (compareHint) compareHint.textContent = button.dataset.stage === 'finished' ? 'Zieh die Linie. Entdecke den Unterschied.' : button.dataset.stage === 'build' ? 'So entsteht der neue Poolgarten.' : 'Der Garten vor der Veränderung.'; tabs.forEach(b => { const selected = b === button; b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1; }); $('#project-panel').setAttribute('aria-labelledby', button.id); $('#project-story-title').textContent = data.title; $('#project-story-copy').textContent = data.copy; imageSwap($('#project-image'), data.src, data.alt); if (focus) button.focus(); };
  tabs.forEach((button, index) => { button.addEventListener('click', () => selectPhase(button)); button.addEventListener('keydown', e => { let next; if (e.key === 'ArrowRight') next = (index + 1) % tabs.length; if (e.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length; if (e.key === 'Home') next = 0; if (e.key === 'End') next = tabs.length - 1; if (next !== undefined) { e.preventDefault(); selectPhase(tabs[next], true); } }); });

  const finder = $('#finder-form'), preview = $('.finder-preview');
  const materials = {hell:'Heller Naturstein', graphit:'Graphit', holz:'Warmes Holz'};
  const friendly = {Schwimmen:'Bahnen schwimmen', Familie:'Zeit zusammen', Pflege:'Wenig Pflegeaufwand', Gestaltung:'Klare Gestaltung'};
  let chosen = {type:'', location:'Im Garten', wishes:[], material:'hell'}, appliedSummary = '';
  function updateFinder() {
    const data = new FormData(finder);
    chosen = {type:data.get('pooltype') || '', location:data.get('location') || '', wishes:data.getAll('wish'), material:data.get('material') || 'hell'};
    Object.assign(preview.dataset, {type:chosen.type, location:chosen.location, material:chosen.material, lanes:String(chosen.wishes.includes('Schwimmen')), family:String(chosen.wishes.includes('Familie')), care:String(chosen.wishes.includes('Pflege'))});
    $('#plan-location').textContent = chosen.location || 'Standort offen';
    $('#material-caption').textContent = materials[chosen.material];
    const count = Number(!!chosen.type) + Number(!!chosen.location) + Number(chosen.wishes.length > 0);
    $('#finder-progress').textContent = count ? `${count} von 3 Planungsthemen gewählt` : 'Deine Ideen sind der Anfang.';
    const tags = [];
    if (chosen.type === 'Naturpool') tags.push('Naturpool-Konzept');
    if (chosen.type === 'Klassischer Pool') tags.push('Poolbau & Beckenplanung');
    if (chosen.type === 'Noch offen') tags.push('Beratung zur Poolart');
    tags.push(chosen.location === 'Im Haus' ? 'Innenpool & Raumklima' : 'Garten & Einbauort');
    const topics = {Schwimmen:'Schwimmstrecke & Gegenstrom', Familie:'Einstieg & Sicherheit', Pflege:'Wasserpflege & Abdeckung', Gestaltung:'Material & Proportion'};
    chosen.wishes.forEach(w => tags.push(topics[w]));
    $('#result-title').textContent = chosen.type === 'Naturpool' && chosen.location === 'Im Haus' ? 'Erst die Machbarkeit klären.' : chosen.type === 'Naturpool' ? 'Natürlich gedacht. Klar gestaltet.' : chosen.location === 'Im Haus' ? 'Wasser wird Teil des Hauses.' : chosen.type ? 'Deine Idee nimmt Form an.' : 'Ein Pool. Viele Möglichkeiten.';
    $('#result-copy').textContent = chosen.type === 'Naturpool' && chosen.location === 'Im Haus' ? 'Ein Naturpool im Haus erfordert eine individuelle Prüfung von Wasseraufbereitung, Raumklima und Gebäudetechnik. Das klären wir, bevor die Planung konkret wird.' : chosen.type ? 'Deine Auswahl ist der Ausgangspunkt für unser Gespräch. Gemeinsam klären wir Bauweise, Ausstattung und die Verbindung zu deinem Zuhause.' : 'Wähle Poolart und Wünsche. Hier sammeln wir, was für deine Planung wichtig wird.';
    $('#result-tags').replaceChildren(...tags.map(text => { const span = document.createElement('span'); span.textContent = text; return span; }));
    $('#plan-live').textContent = [chosen.type || 'Poolart noch offen', materials[chosen.material], ...chosen.wishes.map(w => friendly[w])].join(' · ');
  }
  finder.addEventListener('change', updateFinder);
  finder.addEventListener('reset', () => requestAnimationFrame(() => { preview.dataset.night = 'false'; $('#light-toggle').setAttribute('aria-pressed', 'false'); $('#light-toggle').textContent = 'Abendlicht testen'; updateFinder(); }));
  $('#light-toggle').addEventListener('click', () => { const night = preview.dataset.night !== 'true'; preview.dataset.night = String(night); $('#light-toggle').setAttribute('aria-pressed', String(night)); $('#light-toggle').textContent = night ? 'Zurück zum Tag' : 'Abendlicht testen'; });
  updateFinder();

  const contact = $('#contact-form');
  $('#take-selection').addEventListener('click', () => {
    const summary = 'Meine Poolideen: ' + [chosen.type || 'Poolart noch offen', chosen.location, materials[chosen.material], ...chosen.wishes.map(w => friendly[w])].filter(Boolean).join(' · ');
    const input = contact.elements.project;
    input.value = appliedSummary && input.value.includes(appliedSummary) ? input.value.replace(appliedSummary, summary) : summary + (input.value ? '\n\n' + input.value : '');
    appliedSummary = summary; $('#selection-note').hidden = false; $('#selection-note').textContent = 'Deine Ideen aus dem Poolfinder wurden übernommen.';
  });
  $$('[data-project]').forEach(a => a.addEventListener('click', () => { if (!contact.elements.project.value) contact.elements.project.value = 'Mein Vorhaben: ' + a.dataset.project; }));
  contact.elements.contact.addEventListener('input', e => e.target.setCustomValidity(''));
  contact.addEventListener('submit', e => {
    e.preventDefault(); if (!contact.reportValidity()) return;
    const data = new FormData(contact), value = String(data.get('contact')).trim(), input = contact.elements.contact;
    input.setCustomValidity('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !(/^[+()\d\s./-]+$/.test(value) && value.replace(/\D/g, '').length >= 6)) { input.setCustomValidity('Bitte gib eine gültige E-Mail-Adresse oder Telefonnummer an.'); input.reportValidity(); return; }
    const text = `MEIN POOLPROJEKT\n${cfg.name || 'UFER'} · öffentlicher Website-Entwurf\n\nName: ${String(data.get('name')).trim()}\nRegion: ${String(data.get('region')).trim()}\nKontakt: ${value}\n\nProjektwunsch:\n${String(data.get('project')).trim()}\n\nDiese Anfrage wurde lokal erstellt und nicht versendet.\n`;
    const blob = new Blob([text], {type:'text/plain;charset=utf-8'}), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'Meine-Poolanfrage.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    $('#form-status').textContent = `Deine Anfrage-Datei wurde vorbereitet. Es wurde nichts versendet. ${cfg.name || 'UFER'} ist hier als Website-Entwurf dargestellt.`;
  });

  const craftScenes = {craft:{src:'assets/craft.webp', alt:'KI-Handwerksstudie: ein Beckenrand wird mit einer Wasserwaage ausgerichtet', caption:'Beckenrand & Präzision · KI-Studie'}, stone:{src:'assets/stone.webp', alt:'KI-Materialstudie: heller Naturstein und ruhiges Poolwasser', caption:'Material & Übergänge · KI-Studie'}, technology:{src:'assets/technology.webp', alt:'KI-Technikstudie: kompakte Filteranlage mit zugänglicher Pooltechnik', caption:'Technik & Wasserpflege · KI-Studie'}};
  let activeCraft = 'craft';
  function setCraft(scene) { if (!craftScenes[scene]) return; $$('.craft-chapter').forEach(el => el.classList.toggle('is-active', el.dataset.craftScene === scene)); $$('[data-craft]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.craft === scene))); if (activeCraft === scene) return; activeCraft = scene; const data = craftScenes[scene]; imageSwap($('#craft-main-image'), data.src, data.alt); $('#craft-caption').textContent = data.caption; }
  $$('[data-craft]').forEach(btn => btn.addEventListener('click', () => setCraft(btn.dataset.craft)));
  setCraft('craft');

  // Demo information is a visible content disclosure, not fictional business proof.
  const dialog = $('#info-dialog'); let dialogTrigger;
  const companyName = cfg.name || 'UFER';
  const originalSite = cfg.website || 'keine echte Betriebswebsite';
  const isCompanyConcept = Boolean(cfg.slug);
  const details = {
    imprint: ['Impressum & Entwurfshinweis', [
      isCompanyConcept ? `Diese Seite ist ein öffentlicher Website-Entwurf von WEBIMPACT für ${companyName}. Sie wird nicht von ${companyName} betrieben.` : 'UFER ist eine fiktive Demomarke. Diese Seite ist ein Website-Entwurf von WEBIMPACT.',
      'Anbieter des Entwurfs: WEBIMPACT · [vollständigen Namen, Anschrift und E-Mail ergänzen].',
      isCompanyConcept ? `Verbindliche Firmenangaben findest du auf der Original-Website: ${originalSite}.` : 'Vor einer geschäftlichen Nutzung müssen die vollständigen Anbieterangaben ergänzt werden.'
    ]],
    privacy: ['Datenschutzhinweis', [
      'Die Seite lädt lokale Bilder, Schriften, Skripte und ein lokales Video. Es sind keine Analyse- oder Marketingdienste eingebunden.',
      'Die Formularangaben werden nur in deinem Browser verarbeitet. Beim Klick auf „Anfrage vorbereiten“ entsteht eine Textdatei auf deinem Gerät. Es werden keine Angaben an einen Server oder den Poolbetrieb gesendet.',
      'Die Original-Website des Betriebs öffnet sich nur, wenn du den entsprechenden Link anklickst.'
    ]],
    concept: ['Entwurf & Bildnachweise', [
      isCompanyConcept ? `Diese Konzeptseite ist ein unverbindlicher Entwurf für ${companyName}, kein offizieller Firmenauftritt.` : 'UFER ist eine fiktive Design-Demo von WEBIMPACT.',
      'Pool-, Handwerks-, Technik- und Gartenbilder sind KI-Visualisierungen. Sie zeigen keine realen Kundenprojekte, Qualifikationen oder Teammitglieder. Es werden keine Kundenbewertungen dargestellt.',
      'Markenlogos stammen aus den öffentlich erreichbaren Original-Websites. Fehlt eine Logo-Datei, wird der Firmenname als Wortmarke gesetzt.',
      'Poolfinder und Projektphasen sind interaktive Visualisierungen. Sie ersetzen keine technische Planung, Leistungszusage oder Preisangabe.'
    ]]
  };
  $$('[data-dialog]').forEach(btn => btn.addEventListener('click', () => {
    dialogTrigger = btn; const [title, paragraphs] = details[btn.dataset.dialog]; $('#dialog-title').textContent = title;
    $('#dialog-body').replaceChildren(...paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    if (btn.dataset.dialog === 'concept') { const p = document.createElement('p'), a = document.createElement('a'); a.href = 'https://www.pexels.com/video/serene-pool-water-ripples-in-the-sunlight-34341666/'; a.textContent = 'Poolfilm von Reco Alleyne auf Pexels'; a.target = '_blank'; a.rel = 'noopener noreferrer'; p.append(a); $('#dialog-body').append(p); }
    dialog.showModal();
  }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialogTrigger?.focus());
  dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); });

  const bar = $('.mobile-cta'); let contactVisible = false;
  const syncBar = () => bar.classList.toggle('is-hidden', heroVisible || contactVisible);
  if ('IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncBar(); syncFilm(); }, {threshold:0}); heroObserver.observe($('.hero'));
    const contactObserver = new IntersectionObserver(entries => { contactVisible = entries[0].isIntersecting; syncBar(); }, {threshold:0}); contactObserver.observe($('#kontakt'));
  }
  syncFilm();
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.reveal').forEach(el => gsap.from(el, {opacity:0, y:25, duration:.8, ease:'power2.out', scrollTrigger:{trigger:el, start:'top 93%', once:true}}));
      gsap.to('.waterline span', {scaleX:1, ease:'none', scrollTrigger:{trigger:document.body, start:'top top', end:'bottom bottom', scrub:true}});
      gsap.to('.timeline-track span', {scaleX:1, ease:'none', scrollTrigger:{trigger:'.timeline', start:'top 85%', end:'bottom 40%', scrub:.6}});
    });
    mm.add('(min-width: 801px)', () => {
      $$('.craft-chapter').forEach(el => ScrollTrigger.create({trigger:el, start:'top 65%', end:'bottom 35%', onEnter:()=>setCraft(el.dataset.craftScene), onEnterBack:()=>setCraft(el.dataset.craftScene)}));
      if (!reduced.matches) { gsap.fromTo('.project-detail', {y:30, rotation:5}, {y:-12, rotation:2, ease:'none', scrollTrigger:{trigger:'.project-canvas', start:'top bottom', end:'bottom top', scrub:1}}); }
    });
  }
})();
