const overlay = document.querySelector('.overlay');
const links = document.querySelectorAll('.drawer-link');
const drawers = document.querySelectorAll('.drawer');

let offenerDrawer = null;
let letzterLink = null;

drawers.forEach((d) => { d.inert = true; });

function schliessen() {
  if (!offenerDrawer) return;
  offenerDrawer.classList.remove('offen');
  offenerDrawer.inert = true;
  document.body.classList.remove('drawer-offen');
  links.forEach((l) => l.setAttribute('aria-expanded', 'false'));
  offenerDrawer = null;
  if (letzterLink) letzterLink.focus();
}

function oeffnen(drawer, link) {
  if (offenerDrawer) {
    offenerDrawer.classList.remove('offen');
    offenerDrawer.inert = true;
  }
  links.forEach((l) => l.setAttribute('aria-expanded', String(l === link)));
  drawer.classList.add('offen');
  drawer.inert = false;
  document.body.classList.add('drawer-offen');
  offenerDrawer = drawer;
  letzterLink = link;
  drawer.querySelector('.schliessen').focus();
}

links.forEach((link) => {
  link.addEventListener('click', () => {
    const drawer = document.getElementById(link.getAttribute('aria-controls'));
    if (offenerDrawer === drawer) schliessen();
    else oeffnen(drawer, link);
  });
});

drawers.forEach((d) => {
  d.querySelector('.schliessen').addEventListener('click', schliessen);
});
overlay.addEventListener('click', schliessen);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') schliessen();
});

const hcKnopf = document.querySelector('.hc-toggle');
const hcLabel = hcKnopf.querySelector('.hc-label');
let hcVorbereitet = false;

function leerzeichenMarkieren() {
  const bereiche = document.querySelectorAll('.kopf, .intro, .flaeche, .drawer');
  const inline = ['P', 'H2', 'H3', 'A', 'BUTTON', 'SPAN', 'EM', 'U', 'STRONG'];
  bereiche.forEach((bereich) => {
    const walker = document.createTreeWalker(bereich, NodeFilter.SHOW_TEXT);
    const knoten = [];
    while (walker.nextNode()) knoten.push(walker.currentNode);
    knoten.forEach((n) => {
      const eltern = n.parentElement;
      if (!eltern || eltern.closest('svg, .hc-sp') || !inline.includes(eltern.tagName)) return;
      if (!n.nodeValue.trim() && getComputedStyle(eltern).display.includes('flex')) return;
      let text = n.nodeValue.replace(/[ \t\n\r]+/g, ' ');
      const vorher = n.previousSibling;
      if (!vorher || vorher.nodeName === 'BR') text = text.replace(/^ +/, '');
      if (!n.nextSibling) text = text.replace(/ +$/, '');
      if (!/[ \u00a0]/.test(text)) { n.nodeValue = text; return; }
      const frag = document.createDocumentFragment();
      text.split(/([ \u00a0])/).forEach((teil) => {
        if (teil === ' ' || teil === '\u00a0') {
          const sp = document.createElement('span');
          sp.className = 'hc-sp';
          sp.textContent = teil;
          frag.appendChild(sp);
        } else if (teil) {
          frag.appendChild(document.createTextNode(teil));
        }
      });
      n.replaceWith(frag);
    });
  });
  hcVorbereitet = true;
}

hcKnopf.addEventListener('click', () => {
  if (!hcVorbereitet) leerzeichenMarkieren();
  const an = document.documentElement.classList.toggle('hc-an');
  hcKnopf.setAttribute('aria-pressed', String(an));
  hcLabel.textContent = an ? 'HIDE HIDDEN CHARACTERS' : 'SHOW HIDDEN CHARACTERS';
  window.scrollTo({ top: 0 });
});

const fadenkreuz = document.querySelector('.fadenkreuz');
const info = fadenkreuz.querySelector('.fadenkreuz-info');
const PX_PRO_MM = 96 / 25.4;

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.documentElement.classList.add('cursor-an');
  let x = 0, y = 0, geplant = false;

  const zeichnen = () => {
    geplant = false;
    fadenkreuz.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    info.textContent = `X ${Math.round(x / PX_PRO_MM)} MM \u00a0 Y ${Math.round(y / PX_PRO_MM)} MM`;
    fadenkreuz.classList.toggle('links', x + info.offsetWidth * 1.15 + 20 > window.innerWidth);
    fadenkreuz.classList.toggle('oben', y + info.offsetHeight * 2 + 10 > window.innerHeight);
  };

  document.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    fadenkreuz.classList.add('sichtbar');
    fadenkreuz.classList.toggle('ueber-link', !!e.target.closest('a, button'));
    if (!geplant) { geplant = true; requestAnimationFrame(zeichnen); }
  });
  hcKnopf.addEventListener('click', () => { [50, 400, 900].forEach((t) => setTimeout(zeichnen, t)); });
  window.addEventListener('resize', zeichnen);
  document.addEventListener('mouseleave', () => fadenkreuz.classList.remove('sichtbar'));
  document.documentElement.addEventListener('mouseleave', () => fadenkreuz.classList.remove('sichtbar'));
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.body.classList.contains('drawer-offen')
      && document.documentElement.classList.contains('hc-an')) {
    hcKnopf.click();
  }
}, true);

(function versalsatz() {
  const klassen = { '-': 'vk-strich', '–': 'vk-strich', '×': 'vk-mal',
                    '(': 'vk-klammer', ')': 'vk-klammer', '[': 'vk-klammer', ']': 'vk-klammer',
                    ':': 'vk-doppelpunkt', '@': 'vk-at' };
  const muster = /[-–×()[\]:@]/;
  document.querySelectorAll('.kopf, .intro, .flaeche, .drawer').forEach((bereich) => {
    const walker = document.createTreeWalker(bereich, NodeFilter.SHOW_TEXT);
    const knoten = [];
    while (walker.nextNode()) knoten.push(walker.currentNode);
    knoten.forEach((n) => {
      if (!muster.test(n.nodeValue) || n.parentElement.closest('em:not(.lbl), svg, .vk')) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/([-–×()[\]:@])/).forEach((teil) => {
        if (klassen[teil]) {
          const sp = document.createElement('span');
          sp.className = 'vk ' + klassen[teil];
          sp.textContent = teil;
          frag.appendChild(sp);
        } else if (teil) {
          frag.appendChild(document.createTextNode(teil));
        }
      });
      n.replaceWith(frag);
    });
  });
})();
