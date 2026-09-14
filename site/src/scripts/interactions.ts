const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

function setupNavigation() {
  const nav = document.querySelector<HTMLDetailsElement>('.site-nav');
  if (!nav) return;
  const compact = window.matchMedia('(max-width: 767px)');
  const syncMode = () => { nav.open = !compact.matches; };
  syncMode();
  compact.addEventListener('change', syncMode);
  nav.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) {
      nav.open = false;
    }
  });
  document.addEventListener('click', (event) => {
    if (compact.matches && nav.open && !(event.target as Element).closest('.site-nav')) nav.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (compact.matches && nav.open && event.key === 'Escape') {
      nav.open = false;
      nav.querySelector<HTMLElement>('summary')?.focus();
    }
  });
}

function setupHeaderDock() {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  const update = () => { header.dataset.docked = String(window.scrollY > 24); };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function setupExperience() {
  const section = document.querySelector<HTMLElement>('[data-experience]');
  const viewport = section?.querySelector<HTMLElement>('[data-experience-viewport]');
  const list = section?.querySelector<HTMLOListElement>('[data-experience-list]');
  if (!section || !viewport || !list) return;
  let frame = 0;
  let previous = 0;
  let position = 0;
  let hovered = false;
  let visible = true;
  let copies: HTMLElement[] = [];
  const canAnimate = () => !reducedMotion.matches && finePointer.matches;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const tick = (time: number) => {
    const height = list.offsetHeight;
    // Keep fractional pixels so the slow movement stays smooth at every refresh rate.
    position += previous ? Math.min(time - previous, 64) * .012 : 0;
    previous = time;
    if (height) position = height + ((position - height) % height + height) % height;
    viewport.scrollTop = position;
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    stop();
    if (!canAnimate() || hovered || section.contains(document.activeElement) || document.hidden || !visible) return;
    position = viewport.scrollTop;
    frame = requestAnimationFrame(tick);
  };
  const configure = () => {
    stop();
    copies.forEach(copy => copy.remove());
    copies = [];
    if (canAnimate()) {
      copies = [list.cloneNode(true), list.cloneNode(true)] as HTMLElement[];
      copies.forEach(copy => {
        copy.removeAttribute('data-experience-list');
        copy.setAttribute('aria-hidden', 'true');
      });
      list.before(copies[0]);
      list.after(copies[1]);
      viewport.scrollTop = list.offsetHeight;
    } else {
      viewport.scrollTop = 0;
    }
    sync();
  };
  section.addEventListener('pointerenter', () => { hovered = true; sync(); });
  section.addEventListener('pointerleave', () => { hovered = false; sync(); });
  section.addEventListener('focusin', sync);
  section.addEventListener('focusout', () => queueMicrotask(sync));
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', configure);
  finePointer.addEventListener('change', configure);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(section);
  new ResizeObserver(sync).observe(list);
  configure();
}

function setupTestimonials() {
  if (reducedMotion.matches) return;
  document.querySelectorAll<HTMLElement>('[data-testimonial-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll<HTMLElement>('[data-testimonial-slide]')];
    if (slides.length < 2) return;
    let active = 0;
    let timer = 0;
    const show = (next: number) => {
      active = next;
      slides.forEach((slide, index) => {
        const isActive = index === active;
        slide.hidden = !isActive;
        slide.dataset.active = String(isActive);
      });
    };
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!document.hidden) timer = window.setInterval(() => show((active + 1) % slides.length), 8000);
    };
    carousel.addEventListener('pointerenter', stop);
    carousel.addEventListener('pointerleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', start);
    start();
  });
}

function setupCaseGalleries() {
  document.querySelectorAll<HTMLElement>('[data-case-gallery]').forEach((gallery) => {
    const track = gallery.querySelector<HTMLElement>('[data-gallery-track]');
    if (!track || reducedMotion.matches) return;
    const originals = [...track.querySelectorAll<HTMLElement>('[data-gallery-slide]')];
    if (originals.length < 2) return;
    const clones = originals.map((slide) => {
      const clone = slide.cloneNode(true) as HTMLElement;
      clone.dataset.galleryClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
        link.removeAttribute('data-enlarge');
        link.removeAttribute('data-cursor');
        link.tabIndex = -1;
      });
      track.append(clone);
      return clone;
    });
    let frame = 0;
    let previous = 0;
    let position = 0;
    let hovered = false;
    const originalWidth = () => (clones[0]?.offsetLeft ?? 0) - (originals[0]?.offsetLeft ?? 0);
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const normalize = () => {
      const width = originalWidth();
      if (width && position >= width) position -= width;
    };
    const tick = (time: number) => {
      // Ten pixels per second keeps the screens readable without feeling stationary.
      position += previous ? Math.min(time - previous, 64) * .01 : 0;
      previous = time;
      normalize();
      track.scrollLeft = position;
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      stop();
      position = track.scrollLeft;
      normalize();
      track.scrollLeft = position;
      if (!hovered && !gallery.contains(document.activeElement) && !document.hidden) frame = requestAnimationFrame(tick);
    };
    gallery.addEventListener('pointerenter', () => { hovered = true; stop(); });
    gallery.addEventListener('pointerleave', () => { hovered = false; start(); });
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', () => queueMicrotask(start));
    document.addEventListener('visibilitychange', start);
    start();
  });
}

function setupDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-image-dialog]');
  const image = document.querySelector<HTMLImageElement>('[data-dialog-image]');
  const close = document.querySelector<HTMLButtonElement>('[data-dialog-close]');
  if (!dialog || !image || !close) return;
  let trigger: HTMLElement | null = null;
  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('[data-enlarge]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const source = anchor.querySelector('img');
    trigger = anchor;
    image.src = anchor.href;
    image.alt = source?.alt ?? 'Expanded image';
    dialog.showModal();
    close.focus();
  });
  const hide = () => { dialog.close(); trigger?.focus(); };
  close.addEventListener('click', hide);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) hide(); });
}

function setupEmail() {
  const tooltip = document.createElement('span');
  tooltip.className = 'email-feedback';
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.append(tooltip);
  let dismiss = 0;
  const position = (x: number, y: number) => {
    const width = tooltip.offsetWidth;
    tooltip.style.left = `${Math.max(8, Math.min(x - width / 2, window.innerWidth - width - 8))}px`;
    tooltip.style.top = `${Math.max(8, Math.min(y + 24, window.innerHeight - tooltip.offsetHeight - 8))}px`;
  };
  document.addEventListener('pointermove', (event) => {
    if (tooltip.dataset.visible === 'true' && event.pointerType === 'mouse') position(event.clientX, event.clientY);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach((button) => {
    const status = button.parentElement?.querySelector<HTMLElement>('[data-email-status]');
    if (!status) return;
    button.addEventListener('click', async (event) => {
      const email = button.dataset.copyEmail ?? '';
      status.textContent = '';
      let message = 'Email copied.';
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        message = 'Opening your email app.';
        window.location.href = `mailto:${email}`;
      }
      status.textContent = message;
      tooltip.textContent = message;
      tooltip.dataset.visible = 'true';
      document.documentElement.dataset.emailFeedback = 'true';
      const bounds = button.getBoundingClientRect();
      position(event.detail ? event.clientX : bounds.left + bounds.width / 2, event.detail ? event.clientY : bounds.bottom);
      window.clearTimeout(dismiss);
      dismiss = window.setTimeout(() => {
        tooltip.dataset.visible = 'false';
        delete document.documentElement.dataset.emailFeedback;
      }, 1800);
    });
  });
}

function setupContents() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((link) => [link.dataset.tocLink, link]));
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!visible) return;
    links.forEach((link) => link.dataset.active = String(link === byId.get(visible.target.id)));
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
  document.querySelectorAll<HTMLElement>('.article-section[id], [data-content-heading][id]').forEach((section) => observer.observe(section));
}

function setupBackToTop() {
  const button = document.querySelector<HTMLAnchorElement>('[data-back-to-top]');
  if (!button) return;
  document.documentElement.dataset.js = 'true';
  const update = () => { button.dataset.visible = String(window.scrollY > 280); };
  update();
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  });
}

function setupCursor() {
  const label = document.querySelector<HTMLElement>('[data-cursor-label]');
  const text = document.querySelector<HTMLElement>('[data-cursor-text]');
  const icon = document.querySelector<HTMLElement>('[data-cursor-icon]');
  if (!label || !text || !icon) return;
  let enabled = false;
  let frame = 0;
  let x = 0;
  let y = 0;
  const render = () => { frame = 0; label.style.left = `${x}px`; label.style.top = `${y}px`; };
  const setAction = (target: EventTarget | null) => {
    const action = target instanceof Element ? target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor : undefined;
    if (!action) {
      label.dataset.mode = 'dot';
      text.textContent = '';
      return;
    }
    label.dataset.mode = 'action';
    text.textContent = action;
    icon.textContent = action === 'image' ? '+' : action === 'copy email' ? '⧉' : '↗';
  };
  const update = () => {
    enabled = finePointer.matches && !reducedMotion.matches;
    document.documentElement.dataset.customCursor = String(enabled);
    label.dataset.visible = String(enabled);
    if (!enabled) setAction(null);
  };
  update();
  finePointer.addEventListener('change', update);
  reducedMotion.addEventListener('change', update);
  document.addEventListener('pointermove', (event) => {
    if (!enabled) return;
    label.dataset.visible = 'true';
    setAction(event.target);
    x = event.clientX; y = event.clientY;
    if (!frame) frame = requestAnimationFrame(render);
  });
  document.addEventListener('pointerleave', () => label.dataset.visible = 'false');
  document.addEventListener('pointerenter', () => label.dataset.visible = String(enabled));
  document.addEventListener('pointerdown', () => { if (enabled) label.dataset.pressed = 'true'; });
  document.addEventListener('pointerup', () => { label.dataset.pressed = 'false'; });
  document.addEventListener('pointercancel', () => { label.dataset.pressed = 'false'; });
  document.addEventListener('keydown', () => label.dataset.visible = 'false');
}

setupNavigation();
setupHeaderDock();
setupExperience();
setupTestimonials();
setupCaseGalleries();
setupDialog();
setupEmail();
setupContents();
setupBackToTop();
setupCursor();
