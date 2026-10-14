/* Mightora status directory: progressively groups real Upptime cards and links to the services. */
(() => {
  "use strict";

  const GROUPS = [
    ["Power BI & Analytics", "Power BI, semantic models, DAX and reporting tools"],
    ["Power Platform & Integration", "Solution development, APIs, expressions and integrations"],
    ["Developer & Diagnostics", "Code comparison, troubleshooting and investigation"],
    ["Architecture & Planning", "Architecture diagrams, roadmaps and technology radars"],
    ["Presentations & Feedback", "Presentations, collaboration and feedback"],
    ["Utilities & Connectivity", "QR codes, connectivity and supporting services"],
    ["Websites & Learning", "Community, websites and educational applications"],
    ["Other services", "Additional monitored endpoints"]
  ];
  /* Explicit names and URLs are shared with automated configuration checks. */
  const SERVICES = [
    { name: "Mightora | Power BI Diff", url: "https://power-bi-diff.mightora.io/", group: "Power BI & Analytics", requested: true },
    { name: "Mightora | Semantic Model", url: "https://semantic-model.mightora.io/", group: "Power BI & Analytics", requested: true },
    { name: "Mightora | Power BI Inspector", url: "https://powerbi-inspector.mightora.io/", group: "Power BI & Analytics", requested: true },
    { name: "Mightora | DAX", url: "https://dax.mightora.io/", group: "Power BI & Analytics", requested: true },
    { name: "Mightora | Solution Explorer", url: "https://solution-explorer.mightora.io/", group: "Power Platform & Integration", requested: true },
    { name: "Mightora | REST Builder", url: "https://rest.mightora.io/", group: "Power Platform & Integration", requested: true },
    { name: "Mightora | FetchFlow", url: "https://fetchflow.mightora.io/", group: "Power Platform & Integration", requested: true },
    { name: "Mightora | Expression Lab", url: "https://expression-lab.mightora.io/", group: "Power Platform & Integration", requested: true },
    { name: "Mightora | Custom Connector Builder", url: "https://custom-connector-builder.mightora.io/", group: "Power Platform & Integration" },
    { name: "Mightora | JSON Explorer", url: "https://json-explorer.mightora.io/", group: "Power Platform & Integration" },
    { name: "Mightora | API", url: "https://api.mightora.io", group: "Power Platform & Integration" },
    { name: "Mightora | HAR Analyzer", url: "https://har.mightora.io/", group: "Developer & Diagnostics", requested: true },
    { name: "Mightora | Code Diff", url: "https://code-diff.mightora.io/", group: "Developer & Diagnostics", requested: true },
    { name: "Mightora | Architecture Lab", url: "https://architecture-lab.mightora.io/", group: "Architecture & Planning", requested: true },
    { name: "Mightora | Radar - For generating technology radars", url: "https://radar.mightora.io/", group: "Architecture & Planning", requested: true },
    { name: "Mightora | Roadmaps", url: "https://roadmaps.mightora.io/", group: "Architecture & Planning", requested: true },
    { name: "Mightora | Slides Beta", url: "https://beta.slides.mightora.io/", group: "Presentations & Feedback", requested: true },
    { name: "Mightora | Presentation Slides", url: "https://slides.mightora.io", group: "Presentations & Feedback" },
    { name: "Mightora | Feedback", url: "https://feedback.mightora.io", group: "Presentations & Feedback", requested: true },
    { name: "Mightora | QR Code Generator", url: "https://qr.mightora.io/", group: "Utilities & Connectivity", requested: true },
    { name: "Mightora | WiFi Captive Portal Helper - Connect", url: "https://connect.mightora.io/", group: "Utilities & Connectivity", requested: true },
    { name: "Mightora | WiFi Captive Portal Helper - Connecting", url: "https://connecting.mightora.io", group: "Utilities & Connectivity" },
    { name: "Mightora | WiFi Captive Portal Helper - Connected", url: "https://connected.mightora.io", group: "Utilities & Connectivity" },
    { name: "TechTweedie Blog", url: "https://techtweedie.github.io", group: "Websites & Learning" },
    { name: "Mightora | Home Page", url: "https://mightora.io", group: "Websites & Learning" },
    { name: "Ian Tweedie | Personal Website", url: "https://iantweedie.biz", group: "Websites & Learning" },
    { name: "Ian Tweedie | Presentation Archive", url: "https://itweedie.github.io", group: "Websites & Learning" },
    { name: "Power Platform Clinic", url: "https://powerplatformclinic.github.io", group: "Websites & Learning" },
    { name: "Tweed Technology Limited", url: "https://tweed.technology", group: "Websites & Learning" },
    { name: "Hero Academy | Reading", url: "https://reading.heroacademy.app/", group: "Websites & Learning" }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = { GROUPS, SERVICES };
  if (typeof document === "undefined") return;

  const byName = new Map(SERVICES.map((service) => [service.name.toLocaleLowerCase(), service]));
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function toolLink(service) {
    const link = element("a", "mightora-tool-link", "Open tool ↗");
    link.href = service.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Open " + service.name + " in a new tab");
    return link;
  }
  function init() {
    if (!["/", "/index.html"].includes(window.location.pathname)) return;
    const host = document.querySelector("section.live-status");
    if (!host || host.classList.contains("mightora-grouped-live-status")) return;
    const cards = [...host.querySelectorAll(":scope > article.link.graph")];
    if (!cards.length) return; // Upptime loads history/summary.json asynchronously.
    host.classList.add("mightora-grouped-live-status");

    const lookup = new Map();
    const entries = [];
    const present = new Set();
    for (const card of cards) {
      const historyLink = card.querySelector('h4 a[href*="/history/"]');
      if (!historyLink) continue;
      const name = historyLink.textContent.trim();
      const service = byName.get(name.toLocaleLowerCase());
      const group = service?.group || "Other services";
      const entry = { node: card, name, group, url: service?.url || "", pending: false };
      if (service) {
        present.add(service.name.toLocaleLowerCase());
        const tools = element("div", "mightora-tool-action");
        tools.append(toolLink(service));
        card.append(tools);
      }
      card.classList.add("mightora-service-card");
      entries.push(entry);
    }
    // Links are still available before newly added monitors produce their first history entry.
    for (const service of SERVICES.filter((item) => item.requested && !present.has(item.name.toLocaleLowerCase()))) {
      const card = element("article", "mightora-service-card mightora-service-pending");
      const title = element("h4", "", service.name);
      const state = element("p", "mightora-pending-description", "Awaiting first published monitoring result");
      const action = element("div", "mightora-tool-action");
      action.append(toolLink(service));
      card.append(title, state, action);
      entries.push({ node: card, name: service.name, group: service.group, url: service.url, pending: true });
    }

    const panel = element("div", "mightora-status-filter");
    const heading = element("div", "mightora-status-filter-heading");
    heading.append(
      element("h2", "", "Explore live services"),
      element("p", "", "Group services by tool type, search by name, or open a tool directly.")
    );
    const search = element("input", "mightora-status-search");
    search.type = "search";
    search.placeholder = "Search tools and services";
    search.setAttribute("aria-label", "Search tools and services");
    const choices = element("div", "mightora-status-choices");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-label", "Service categories");
    const count = element("p", "mightora-status-count");
    count.setAttribute("role", "status");
    panel.append(heading, search, choices, count);
    host.before(panel);

    const groupElements = new Map();
    for (const [group, description] of GROUPS) {
      const members = entries.filter((entry) => entry.group === group);
      if (!members.length) continue;
      const wrapper = element("section", "mightora-status-group");
      const heading = element("div", "mightora-status-group-heading");
      const title = element("h3", "", group);
      const id = "status-" + group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
      title.id = id;
      wrapper.setAttribute("aria-labelledby", id);
      const subtitle = element("p", "", description);
      const grid = element("div", "mightora-status-grid");
      heading.append(title, subtitle);
      wrapper.append(heading, grid);
      host.append(wrapper);
      groupElements.set(group, { wrapper, grid, members });
      members.forEach((entry) => grid.append(entry.node));
    }

    const activeCategories = ["All services", ...GROUPS.map(([name]) => name).filter((name) => groupElements.has(name))];
    let selected = "All services";
    const buttons = activeCategories.map((category) => {
      const amount = category === "All services" ? entries.length : groupElements.get(category).members.length;
      const button = element("button", "", category + " (" + amount + ")");
      button.type = "button";
      button.setAttribute("aria-pressed", String(selected === category));
      button.addEventListener("click", () => { selected = category; filter(); });
      choices.append(button);
      return { category, button };
    });

    function filter() {
      const term = search.value.trim().toLocaleLowerCase();
      let shown = 0;
      let awaiting = 0;
      for (const entry of entries) {
        const matches = (!term || (entry.name + " " + entry.url + " " + entry.group).toLocaleLowerCase().includes(term)) &&
          (selected === "All services" || entry.group === selected);
        entry.node.hidden = !matches;
        if (matches) {
          shown++;
          if (entry.pending) awaiting++;
        }
      }
      for (const [category, { wrapper, members }] of groupElements) {
        wrapper.hidden = !members.some((entry) => !entry.node.hidden) || (selected !== "All services" && selected !== category);
      }
      buttons.forEach(({ category, button }) => button.setAttribute("aria-pressed", String(category === selected)));
      count.textContent = shown + " of " + entries.length + " services shown" +
        (awaiting ? " · " + awaiting + " awaiting their first monitoring result" : "");
    }
    search.addEventListener("input", filter);
    filter();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
  const observer = new MutationObserver(init);
  observer.observe(document.documentElement, { subtree: true, childList: true });
})();
