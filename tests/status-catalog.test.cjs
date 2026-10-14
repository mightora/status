const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { GROUPS, SERVICES } = require("../assets/status-groups.js");

const config = fs.readFileSync(path.join(__dirname, "../.upptimerc.yml"), "utf8");
const siteSection = config.split("\nstatus-website:")[0];
const monitored = [...siteSection.matchAll(/^\s{2}- name: ([^\r\n]+)\r?\n\s{4}url: ([^\r\n]+)/gm)]
  .map((match) => ({ name: match[1].trim(), url: match[2].trim() }));
const byName = new Map(monitored.map((site) => [site.name, site]));
const key = (url) => {
  const value = new URL(url);
  return value.origin + value.pathname.replace(/\/$/, "");
};

test("all 17 requested tools have unique, HTTPS Upptime monitors", () => {
  const requested = SERVICES.filter((service) => service.requested);
  assert.equal(requested.length, 17);
  assert.equal(new Set(requested.map((service) => service.name)).size, 17);
  assert.equal(new Set(monitored.map((site) => site.name)).size, monitored.length);
  for (const tool of requested) {
    assert.ok(tool.url.startsWith("https://"), tool.name + " must use HTTPS");
    const monitor = byName.get(tool.name);
    assert.ok(monitor, "Missing Upptime monitor: " + tool.name);
    assert.equal(key(monitor.url), key(tool.url), "Mismatch for: " + tool.name);
  }
});

test("each published service link matches a configured monitor", () => {
  for (const service of SERVICES) {
    const monitor = byName.get(service.name);
    assert.ok(monitor, "Missing Upptime monitor: " + service.name);
    assert.equal(key(monitor.url), key(service.url), "Wrong public URL: " + service.name);
  }
});

test("all public links have an explicit supported category", () => {
  const supported = new Set(GROUPS.map(([name]) => name));
  for (const service of SERVICES) {
    assert.ok(supported.has(service.group), service.name + " has unknown category");
    assert.ok(new URL(service.url).hostname, service.name + " has invalid URL");
  }
});

test("the generated status page loads published branding and grouping assets", () => {
  assert.match(config, /themeUrl:\s*https:\/\/status\.mightora\.io\/mightora-theme\.css/);
  assert.match(config, /<script src="https:\/\/status\.mightora\.io\/status-groups\.js" defer><\/script>/);
  assert.match(config, /<mightora-header/);
  assert.match(config, /<mightora-author/);
  assert.match(config, /<mightora-footer/);
  assert.match(config, /status-catalog-check\.yml/);
  assert.match(config, /\/blob\/master\/LICENSE/);
});
