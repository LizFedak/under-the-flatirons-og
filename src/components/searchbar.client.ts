function initOne(root: HTMLElement) {
    const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]');
    const panel  = root.querySelector<HTMLElement>('[data-panel]');
    const input  = root.querySelector<HTMLInputElement>('[data-input]');
    const closeB = root.querySelector<HTMLButtonElement>('[data-close]');
  
    if (!toggle || !panel || !input) return;
  
    const open = () => {
      panel.hidden = false;
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      // prefill from current URL
      try {
        const q = new URLSearchParams(location.search).get('q');
        if (q && !input.value) input.value = q;
      } catch {}
      setTimeout(() => input.focus(), 0);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKey);
    };
  
    const close = () => {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { panel.hidden = true; }, 160);
    };
  
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.contains(t) && !toggle.contains(t)) close();
    };
  
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      // "/" quick open unless typing already
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const ae = document.activeElement as HTMLElement | null;
        const typing = !!ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable);
        if (!typing) { e.preventDefault(); if (panel.hidden) open(); else input.focus(); }
      }
    };
  
    toggle.addEventListener('click', () => { panel.hidden ? open() : close(); });
    closeB?.addEventListener('click', close);
  }
  
  document.querySelectorAll<HTMLElement>('[data-searchbar]').forEach(initOne);
  