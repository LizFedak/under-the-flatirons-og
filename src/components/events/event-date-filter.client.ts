// src/components/events/event-date-filter.client.ts
// Behavior for <event-date-filter>:
// - Popover stays display:none while closed
// - Flatpickr is created ONLY when the popover opens (so sizing is correct)
// - It is destroyed on close (no stale layout/listeners)
// - Presets and "Apply" use Denver-local calendar days
// - URL params stored as YYYY-MM-DD (no ISO/UTC drift)

import flatpickr from 'flatpickr';

// ---------------- Denver-local date helpers ----------------

const DENVER_TZ = 'America/Denver' as const;

/** Format as YYYY-MM-DD (from a local Date) */
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Parse YYYY-MM-DD as a local Date (no UTC involved) */
const parseYMD = (s?: string | null): Date | null => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [, yy, mm, dd] = m;
  return new Date(Number(yy), Number(mm) - 1, Number(dd));
};

/** Denver "today" as a local Date with that Y/M/D (regardless of the viewer's timezone) */
const todayDenver = (): Date => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DENVER_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const y = get('year');
  const m = get('month');
  const d = get('day');
  return new Date(y, m - 1, d - 1); // local Date; we only use Y/M/D afterwards
};

const SOD = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** This weekend relative to Denver "today" */
const weekendRange = (base = todayDenver()) => {
  const t = SOD(base);
  const dow = t.getDay(); // 0..6
  const sat = addDays(t, (6 - dow + 7) % 7);
  const sun = addDays(sat, 1);
  return [sat, sun] as const;
};

/** Next week (Mon..Sun) relative to Denver "today" */
const nextWeekRange = (base = todayDenver()) => {
  const t = SOD(base);
  const dow = t.getDay();
  const monThis = addDays(t, (1 - dow + 7) % 7);
  const monNext = addDays(monThis, 7);
  const sunNext = addDays(monNext, 6);
  return [monNext, sunNext] as const;
};

// ---------------- Custom element ----------------

class EventDateFilterEl extends HTMLElement {
  private fp: any | undefined;
  private inputEl?: HTMLInputElement;
  private draftRange: Date[] | null = null; // remember last in-UI selection between open/close (without Apply)

  connectedCallback() {
    const root = this as HTMLElement;

    const pill = root.querySelector<HTMLButtonElement>('.pill')!;
    const pop = root.querySelector<HTMLDivElement>('.popover')!;
    const mount = root.querySelector<HTMLDivElement>('.cal-mount')!;
    const applyBtn = root.querySelector<HTMLButtonElement>('[data-action="apply"]')!;
    const cancelBtn = root.querySelector<HTMLButtonElement>('[data-action="cancel"]')!;
    const presets = Array.from(root.querySelectorAll<HTMLButtonElement>('.preset'));

    const storageKey = root.dataset.storageKey || 'eventDateFilter';
    const paramStart = root.dataset.paramStart || 'start';
    const paramEnd = root.dataset.paramEnd || 'end';
    const shouldNav = (root.dataset.navigate || 'true') === 'true';

    const onDocDown = (e: MouseEvent) => {
      if (!root.contains(e.target as Node)) close();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    const open = () => {
      if (!pop.classList.contains('hidden')) return;

      // Show popover so Flatpickr can measure real size
      pop.classList.remove('hidden');
      pill.setAttribute('aria-expanded', 'true');

      // Create a fresh input each time (so destroy is clean)
      this.inputEl = document.createElement('input');
      this.inputEl.type = 'text';
      // Keep it present but visually hidden; flatpickr renders inline UI into mount via appendTo
      this.inputEl.style.position = 'absolute';
      this.inputEl.style.opacity = '0';
      this.inputEl.style.pointerEvents = 'none';
      mount.appendChild(this.inputEl);

      const initialDates = this.getInitialDates(storageKey, paramStart, paramEnd);

      this.fp = flatpickr(this.inputEl, {
        mode: 'range',
        inline: true,
        showMonths: 2,
        dateFormat: 'Y-m-d',
        defaultDate: this.draftRange ?? initialDates,
        disableMobile: true,
        appendTo: mount,
        onChange: (selectedDates: Date[]) => {
          // Keep a draft so reopening without Apply remembers the user's last pick
          this.draftRange = selectedDates.map(SOD);
        },
      });

      // In case layout changes after opening, force a redraw next frame
      requestAnimationFrame(() => this.fp?.redraw());

      document.addEventListener('mousedown', onDocDown);
      document.addEventListener('keydown', onEsc);
    };

    const close = () => {
      if (pop.classList.contains('hidden')) return;

      pop.classList.add('hidden');
      pill.setAttribute('aria-expanded', 'false');

      // Destroy flatpickr & remove the input
      this.fp?.destroy();
      this.fp = undefined;
      if (this.inputEl?.parentNode) this.inputEl.parentNode.removeChild(this.inputEl);
      this.inputEl = undefined;

      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onEsc);
    };

    // Toggle
    pill.addEventListener('click', () => (pop.classList.contains('hidden') ? open() : close()));
    cancelBtn.addEventListener('click', close);

    // Presets (work only when open; lazy-init means fp exists then)
    presets.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (!this.fp) return;
        const base = todayDenver(); // always Denver day
        let range: Date[] = [];
        switch (btn.dataset.preset) {
          case 'all':
            range = [];
            break;
          case 'today':
            range = [base, base];
            break;
          case 'tomorrow':
            range = [addDays(base, 1), addDays(base, 1)];
            break;
          case 'next7':
            range = [base, addDays(base, 6)];
            break;
          case 'next14':
            range = [base, addDays(base, 13)];
            break;
          case 'weekend':
            range = [...weekendRange(base)];
            break;
          case 'nextweek':
            range = [...nextWeekRange(base)];
            break;
        }
        this.fp.setDate(range, true);
      });
    });

    // Apply → persist + URL + navigate/emit
    applyBtn.addEventListener('click', () => {
      const dates = (this.fp?.selectedDates || []).map(SOD);
      const start = dates[0] ? ymd(dates[0]) : '';
      const end = dates[1] ? ymd(dates[1]) : start;
      this.draftRange = dates.length ? dates : null;

      const payload = { start, end };
      try {
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {}

      const u = new URL(location.href);
      if (start) u.searchParams.set(paramStart, start);
      else u.searchParams.delete(paramStart);
      if (end) u.searchParams.set(paramEnd, end);
      else u.searchParams.delete(paramEnd);

      if (shouldNav) {
        location.href = u.toString();
      } else {
        history.replaceState({}, '', u);
        window.dispatchEvent(new CustomEvent('eventDateFilterChange', { detail: payload }));
      }
      close();
    });
  }

  disconnectedCallback() {
    // Safety cleanup if element gets removed
    try {
      this.fp?.destroy();
    } catch {}
    this.fp = undefined;
    if (this.inputEl?.parentNode) this.inputEl.parentNode.removeChild(this.inputEl);
    this.inputEl = undefined;
  }

  /** Restore initial dates from URL (?start=&end=) or localStorage (YYYY-MM-DD), as local Dates */
  private getInitialDates(storageKey: string, paramStart: string, paramEnd: string): Date[] {
    // 1) URL
    const url = new URL(location.href);
    const sQ = parseYMD(url.searchParams.get(paramStart));
    const eQ = parseYMD(url.searchParams.get(paramEnd));
    if (sQ || eQ) return [sQ, eQ].filter(Boolean) as Date[];

    // 2) localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const s = parseYMD(saved.start);
      const e = parseYMD(saved.end);
      if (s || e) return [s, e].filter(Boolean) as Date[];
    } catch {}

    // 3) default: empty (picker shows nothing until user picks or uses presets)
    return [];
  }
}

// Register once
if (!customElements.get('event-date-filter')) {
  customElements.define('event-date-filter', EventDateFilterEl);
}
