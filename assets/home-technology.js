(() => {
  function initTechnologyTabs() {
    const group = document.querySelector('[data-technology-tabs]');
    if (!group) return;
    const tabs = [...group.querySelectorAll('button')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    if (tabs.length < 2 || panels.some(panel => !panel)) return;

    function select(active) {
      tabs.forEach((tab, index) => {
        const selected = index === active;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[index].hidden = !selected;
      });
    }

    group.setAttribute('role', 'tablist');
    group.setAttribute('aria-label', 'Technology categories');
    tabs.forEach((tab, index) => {
      const panel = panels[index];
      tab.setAttribute('role', 'tab');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const positions = {
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          ArrowRight: (index + 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        if (!Object.hasOwn(positions, event.key)) return;
        event.preventDefault();
        const next = positions[event.key];
        select(next);
        tabs[next].focus();
      });
    });
    select(0);
    group.hidden = false;
  }

  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initTechnologyTabs, { once: true });
  } else {
    initTechnologyTabs();
  }
})();
