(() => {
  const cfg = window.BETRIEB || {};
  if (!cfg.slug) return;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const setText = (selector, value) => { const el=$(selector); if(el) el.textContent=value; };
  document.title = `${cfg.name} · Poolbau in ${cfg.region} | Website-Konzept`;
  const description=$('meta[name="description"]');
  if(description) description.content=`Öffentlicher Website-Entwurf für ${cfg.name} aus ${cfg.region}. KI-Bildwelt und Poolfinder als Designkonzept von WEBIMPACT.`;
  // Derive website accents from the supplied original logo; never recolor artwork.
  const applyLogoPalette = img => {
    try {
      const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
      const scale=Math.min(96/img.naturalWidth,96/img.naturalHeight);
      ctx.drawImage(img,0,0,img.naturalWidth*scale,img.naturalHeight*scale);
      const data=ctx.getImageData(0,0,96,96).data,bins=new Map();
      for(let i=0;i<data.length;i+=4){
        const [r,g,b,a]=data.subarray(i,i+4),hi=Math.max(r,g,b),lo=Math.min(r,g,b);
        if(a<200||hi<45||lo>225||hi-lo<32)continue;
        const key=[r,g,b].map(v=>Math.round(v/32)).join(',');
        const v=bins.get(key)||[0,0,0,0];v[0]++;v[1]+=r;v[2]+=g;v[3]+=b;bins.set(key,v);
      }
      const top=[...bins.values()].sort((a,b)=>b[0]-a[0])[0];if(!top||top[0]<10)return;
      const raw=top.slice(1).map(v=>Math.round(v/top[0]));
      const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
      let accent=raw.slice();while(lum(accent)>.18)accent=accent.map(v=>Math.floor(v*.94));
      const css=rgb=>'rgb('+rgb.join(',')+')';
      const root=document.documentElement;
      root.style.setProperty('--blue',css(accent));
      root.style.setProperty('--brand-dark',css(accent.map(v=>Math.round(v*.78))));
      root.style.setProperty('--light-blue',css(raw.map(v=>Math.round(v*.09+255*.91))));
      root.dataset.brandReady='true';
    } catch { /* Cross-origin logos retain the default accessible palette. */ }
  };
  const renderBrand = anchor => {
    if(!anchor) return;
    anchor.setAttribute('aria-label',`${cfg.name} – Startseite`);
    anchor.querySelector('svg')?.remove();
    const wordmark=anchor.querySelector('span');
    if(wordmark){
      wordmark.replaceChildren(document.createTextNode(cfg.shortName));
      const small=document.createElement('small');
      small.textContent=`POOLBAU · ${cfg.region.toUpperCase()}`;
      wordmark.append(small);
    }
    if(cfg.logo){
      const logo=document.createElement('img');
      logo.className='tenant-brand-logo'; logo.alt=cfg.name; logo.decoding='async';
      if(anchor.classList.contains('brand'))logo.addEventListener('load',()=>applyLogoPalette(logo),{once:true});
      if(/^assets\/brand-logos\//.test(cfg.logo))logo.src='https://timonguldner.github.io/pool-schwimmbadbau-kranz/'+cfg.logo;else logo.src=cfg.logo;
      if(logo.complete&&logo.naturalWidth&&anchor.classList.contains('brand'))applyLogoPalette(logo);
      logo.onerror=()=>{logo.remove();if(wordmark)wordmark.hidden=false;};
      anchor.prepend(logo);
      if(wordmark) wordmark.hidden=true;
    }
  };
  renderBrand($('.brand'));
  renderBrand($('.footer-logo'));
  setText('.header .demo-label','Website-Konzept von WEBIMPACT');
  setText('.hero-heading .eyebrow',`POOLBAU IN ${cfg.region.toUpperCase()}`);
  setText('#hero-credit',`Designentwurf für ${cfg.shortName} · KI-Bildwelt`);
  setText('#hero-title','');
  const heading=$('#hero-title');
  if(heading){heading.replaceChildren(); const line1=document.createElement('span'); line1.className='hero-line'; const text1=document.createElement('span'); text1.className='hero-line-text'; text1.textContent='Dein Garten.'; line1.append(text1); const line2=document.createElement('span'); line2.className='hero-line'; const text2=document.createElement('span'); text2.className='hero-line-text'; text2.append('Weiter '); const em=document.createElement('em'); em.textContent='gedacht.'; text2.append(em); line2.append(text2); heading.append(line1,line2);}
  setText('.project-heading .eyebrow',`GESTALTUNGSSTUDIE · ${cfg.shortName.toUpperCase()}`);
  setText('.project-main figcaption','KI-Visualisierung · kein Kundenprojekt des Betriebs');
  setText('.project-story .project-selector .eyebrow','DIE KONZEPTENTWICKLUNG');
  setText('.project-story .project-selector small','Illustrative Projektstudie. Sie zeigt keine reale Referenz oder einen Auftrag des Betriebs.');
  setText('.services .section-heading .eyebrow','MÖGLICHE LEISTUNGSBEREICHE');
  setText('.services .section-heading>p','Beispielhafte Website-Struktur. Das tatsächliche Angebot und Spezialisierungen bitte auf der Original-Website prüfen.');
  document.querySelectorAll('.service-secondary .eyebrow').forEach(el=>el.textContent=`BEISPIEL · ${el.textContent}`);
  setText('.team-copy .eyebrow','DIESE VORSCHAU');
  const teamTitle=$('.team-copy h2'); if(teamTitle) teamTitle.innerHTML='Ein klarer Auftritt.<br>Für gutes Handwerk.';
  setText('.team-copy .lead',`Ein digitaler Entwurf für ${cfg.name}.`);
  const teamCopy=$('.team-copy>p:not(.eyebrow):not(.lead):not(.demo-note)');
  if(teamCopy) teamCopy.textContent='Vor einer echten Veröffentlichung werden hier verifizierte Leistungen, Teamfotos, Qualifikationen und Referenzen des Betriebs ergänzt.';
  const teamImage=$('.team-portrait img'); if(teamImage){teamImage.src='https://timonguldner.github.io/pool-schwimmbadbau-kranz/assets/technology.webp';teamImage.alt='KI-Visualisierung eines Pooltechnikraums; keine Aufnahme des Betriebs.';}
  setText('.team-portrait figcaption','KI-Visualisierung · keine Teamaufnahme');
  setText('.team-signature>span',cfg.shortName);
  setText('.team-signature>small','Website-Konzept von WEBIMPACT');
  setText('.team-copy .demo-note','Öffentlicher Entwurf · nicht der offizielle Webauftritt des Betriebs.');
  const original=$('.team-copy .text-link'); if(original){original.textContent='Original-Website besuchen';original.href=cfg.website;original.target='_blank';original.rel='noopener noreferrer';}
  setText('.contact-intro>p:not(.eyebrow)','Diese Vorschau zeigt, wie der erste Schritt zur Poolplanung aussehen kann. Das Formular ist noch nicht an den Betrieb angebunden.');
  $('.contact-person')?.remove();
  const contactData=$('.contact-data');
  if(contactData){
    contactData.replaceChildren();
    const address=document.createElement('span'); address.textContent=cfg.address;
    const link=document.createElement('a'); link.href=cfg.website; link.target='_blank'; link.rel='noopener noreferrer'; link.textContent='Offizielle Website öffnen';
    contactData.append(address,link);
  }
  setText('#form-note','Designentwurf: Das Formular versendet nichts. Es erstellt eine Anfrage-Datei direkt in deinem Browser.');
  setText('.footer-identity>p',`Poolbau in ${cfg.region}. Ein öffentlicher Website-Entwurf.`);
  setText('.footer-demo','Konzeptseite von WEBIMPACT · kein offizieller Firmenauftritt');
  const footerDetails=$$('.footer-contact>span');
  if(footerDetails[0])footerDetails[0].textContent=cfg.address;
  if(footerDetails[1])footerDetails[1].textContent=cfg.region;
  const footerLink=document.createElement('a'); footerLink.href=cfg.website; footerLink.target='_blank'; footerLink.rel='noopener noreferrer'; footerLink.textContent='Original-Website öffnen';
  const footerContact=$('.footer-contact'); if(footerContact) footerContact.append(footerLink);
  setText('.footer-bottom>span',`Website-Konzept für ${cfg.name} · WEBIMPACT`);
  const dialogEyebrow=$('#info-dialog .eyebrow'); if(dialogEyebrow) dialogEyebrow.textContent=`${cfg.shortName.toUpperCase()} · WEBSITE-ENTWURF`;
  setText('#mobile-cta span',`Poolprojekt in ${cfg.region}`);
})();
