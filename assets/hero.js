(() => {
  'use strict';
  const hero = document.querySelector('.hero-immersive');
  const night = document.querySelector('.hero-evening');
  const input = document.querySelector('#hero-light');
  const clock = document.querySelector('#hero-time');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  if (!hero || !night || !input) return;
  let preview = null, userControlled = false, inView = true;
  const render = value => {
    const amount = Math.min(100, Math.max(0, value));
    night.style.opacity = String(amount / 100);
    input.value = String(Math.round(amount));
    const minutes = 18 * 60 + 30 + Math.round(amount * 1.5);
    clock.textContent = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
    input.setAttribute('aria-valuetext', amount < 30 ? 'Abendsonne' : amount > 75 ? 'Blaue Stunde' : 'Abenddämmerung');
  };
  const stopPreview = () => { userControlled = true; preview?.kill(); };
  input.addEventListener('pointerdown', stopPreview);
  input.addEventListener('keydown', stopPreview);
  input.addEventListener('input', () => {
    stopPreview();
    render(Number(input.value));
    document.dispatchEvent(new Event('hero-light-change'));
  });
  document.querySelector('#film-toggle').addEventListener('click', stopPreview);
  const syncPreview = () => {
    if (!preview || userControlled) return;
    if (inView && !document.hidden && !reduced.matches) preview.resume(); else preview.pause();
  };
  document.addEventListener('visibilitychange', syncPreview);
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncPreview(); }).observe(hero);
  reduced.addEventListener('change', () => { if (reduced.matches) preview?.kill(); });
  if (!window.gsap || !window.ScrollTrigger) return;
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion:no-preference)', () => {
    const entrance = gsap.timeline({defaults:{ease:'power3.out'}});
    entrance.from('.hero-heading>.eyebrow', {opacity:0,y:12,duration:.8}, .15)
      .from('.hero-line-text', {yPercent:105,rotation:2,duration:1.35,stagger:.15}, .2)
      .from('.hero-copy', {opacity:0,y:15,duration:.9}, .8)
      .fromTo('.hero-bottom', {opacity:0,y:8}, {opacity:1,y:0,duration:.8,clearProps:'opacity,transform'}, 1.15);
    const state = {light:Number(input.value)};
    night.querySelector('img').decode().then(() => {
      if (userControlled || reduced.matches) return;
      preview = gsap.to(state, {light:100,duration:7,delay:2.3,ease:'sine.inOut',onUpdate:()=>render(state.light)});
      syncPreview();
    }).catch(() => {});
    return () => preview?.kill();
  });
  mm.add('(min-width:801px) and (prefers-reduced-motion:no-preference)', () => {
    gsap.fromTo('.hero-immersive .hero-poster', {yPercent:-2,scale:1.035}, {yPercent:3,scale:1.035,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.hero-heading', {y:45,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:1}});
  });
})();
