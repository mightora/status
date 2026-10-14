/* Progressive enhancement for the Upptime service list; incident history is untouched. */
(() => {
  const groups = [
    ["Tools & utilities", /architecture lab|code diff|radar|roadmaps|custom connector|json explorer|qr code/i],
    ["Platforms & applications", /feedback|presentation slides|hero academy/i],
    ["Infrastructure & APIs", /api|wifi|wi-fi|captive portal|connect(ing|ed)?/i],
    ["Websites & community", /techtweedie|home page|personal website|presentation archive|power platform clinic|tweed technology/i]
  ];
  function init() {
    if (document.querySelector(".mightora-status-filter")) return true;
    const links = [...document.querySelectorAll('a[href*="/history/"]')];
    const cards = [...new Set(links.map(a => a.closest("article")).filter(Boolean))];
    if (cards.length < 3) return false;
    const entries = cards.map(card => {
      const link = card.querySelector('a[href*="/history/"]');
      const name = link?.textContent?.trim() || card.querySelector("h2,h3")?.textContent?.trim() || "";
      const group = groups.find(([, re]) => re.test(name))?.[0] || "Other services";
      card.dataset.statusGroup = group;
      card.classList.add("mightora-service-card");
      return { card, name, group };
    });
    const parent = cards[0].parentElement;
    if (!entries.every(item => item.card.parentElement === parent)) return false;
    const bar = document.createElement("nav");
    bar.className = "mightora-status-filter";
    bar.setAttribute("aria-label", "Filter monitored services");
    const heading = document.createElement("div");
    heading.className = "mightora-status-filter-heading";
    heading.innerHTML = '<h2>Explore live services</h2><p>Browse by category or find a monitored service.</p>';
    bar.append(heading);
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search services";
    search.setAttribute("aria-label", "Search monitored services");
    search.className = "mightora-status-search";
    bar.append(search);
    const choices = document.createElement("div");
    choices.className = "mightora-status-choices";
    bar.append(choices);
    const categories = ["All services", ...groups.map(([name]) => name), "Other services"].filter((name, i, a) => name === "All services" || entries.some(e => e.group === name));
    let selected = "All services";
    const buttons = categories.map(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label + " (" + (label === "All services" ? entries.length : entries.filter(e => e.group === label).length) + ")";
      button.setAttribute("aria-pressed", String(label === selected));
      button.addEventListener("click", () => { selected = label; apply(); });
      choices.append(button);
      return { button, label };
    });
    const count = document.createElement("p");
    count.className = "mightora-status-count";
    count.setAttribute("role", "status");
    bar.append(count);
    parent.before(bar);
    function apply() {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const entry of entries) {
        const show = (selected === "All services" || entry.group === selected) && (!query || entry.name.toLocaleLowerCase().includes(query));
        entry.card.classList.toggle("mightora-service-hidden", !show);
        if (show) visible++;
      }
      buttons.forEach(({button,label}) => button.setAttribute("aria-pressed", String(label === selected)));
      count.textContent = visible + " of " + entries.length + " monitored services shown";
    }
    search.addEventListener("input", apply);
    apply();
    return true;
  }
  if (init()) return;
  const observer = new MutationObserver(() => { if (init()) observer.disconnect(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("load", () => { if (init()) observer.disconnect(); }, { once: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
