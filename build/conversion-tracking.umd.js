(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.TimeAdsTracking = factory());
})(this, (function() {
  "use strict";
  const PARAM = "ta_clickid";
  const STORE_KEY = "ta_conv";
  const MAX_TRANSACTION_LENGTH = 80;
  const MAX_TAGS = 3;
  const MAX_TAG_LENGTH = 50;
  const MAX_CUSTOM_EVENT_LENGTH = 100;
  const byteLength = (value) => new TextEncoder().encode(value).length;
  const MAX_VALUE = 1e5;
  const EVENTS = ["landed", "purchase", "signup", "custom"];
  function createTracker() {
    const script = document.currentScript;
    let debug = !!(script == null ? void 0 : script.hasAttribute("data-debug"));
    let endpoint = "";
    try {
      endpoint = new URL("/track", script.src).href;
    } catch {
    }
    let pendingLanding = null;
    function log(...args) {
      var _a;
      if (debug) (_a = window.console) == null ? void 0 : _a.debug("[TimeAds]", ...args);
    }
    function load() {
      try {
        return JSON.parse(window.localStorage.getItem(STORE_KEY));
      } catch {
        return null;
      }
    }
    function save(state) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
        return true;
      } catch {
        log("Storage unavailable; tracking is disabled.");
        return false;
      }
    }
    async function post(payload) {
      if (!endpoint) {
        log("Configure the tracking endpoint first.");
        return false;
      }
      try {
        const response = await window.fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true
        });
        log("Beacon status", response.status);
        return response.ok || response.status === 409;
      } catch {
        log("Beacon request failed; call again to retry.");
        return false;
      }
    }
    async function land() {
      let token;
      try {
        token = new URLSearchParams(window.location.search).get(PARAM);
      } catch {
        return false;
      }
      if (!token) return false;
      let state = load();
      if ((state == null ? void 0 : state.token) === token && state.landed) return true;
      if ((pendingLanding == null ? void 0 : pendingLanding.token) === token) return pendingLanding.promise;
      if ((state == null ? void 0 : state.token) !== token) {
        state = { token, transactionId: `ta-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, landed: false };
      }
      if (!save(state)) return false;
      const promise = post({ click_id: token, transaction_id: state.transactionId, event: "landed" }).then((ok) => {
        var _a;
        if (ok && ((_a = load()) == null ? void 0 : _a.token) === token) save({ ...state, landed: true });
        if ((pendingLanding == null ? void 0 : pendingLanding.token) === token) pendingLanding = null;
        return ok;
      });
      pendingLanding = { token, promise };
      return promise;
    }
    async function track(transactionId, options = {}) {
      var _a;
      const token = (_a = load()) == null ? void 0 : _a.token;
      if (!token) return false;
      if (typeof transactionId !== "string" || !transactionId.trim() || byteLength(transactionId) > MAX_TRANSACTION_LENGTH) return false;
      if (!options || typeof options.event !== "string" || !options.event.trim()) return false;
      if (options.event === "update") return false;
      const payload = { click_id: token, transaction_id: transactionId, event: options.event };
      if (!EVENTS.includes(payload.event)) {
        payload.event_custom = payload.event;
        payload.event = "custom";
      } else if (payload.event === "custom") {
        if (typeof options.event_custom !== "string" || !options.event_custom.trim()) return false;
        payload.event_custom = options.event_custom;
      }
      if (payload.event_custom && byteLength(payload.event_custom) > MAX_CUSTOM_EVENT_LENGTH) return false;
      if (options.value !== void 0) {
        if (!["number", "string"].includes(typeof options.value) || String(options.value).trim() === "") return false;
        const value = Number(options.value);
        if (!Number.isFinite(value) || value < 0 || value > MAX_VALUE) return false;
        payload.value = String(options.value);
      }
      if (payload.event === "purchase" && !(Number(payload.value) > 0)) return false;
      if (options.tags !== void 0) {
        if (!Array.isArray(options.tags) || options.tags.length > MAX_TAGS || options.tags.some((t) => typeof t !== "string" || byteLength(t) > MAX_TAG_LENGTH)) return false;
        payload.tags = options.tags;
      }
      return post(payload);
    }
    const api = {
      land,
      track,
      token: () => {
        var _a;
        return ((_a = load()) == null ? void 0 : _a.token) ?? null;
      },
      configure(options = {}) {
        if (options.endpoint !== void 0) {
          const url = new URL(options.endpoint);
          if (url.protocol !== "https:") throw new Error("Tracking endpoint must use HTTPS");
          endpoint = url.href;
        }
        if (options.debug !== void 0) debug = !!options.debug;
        return land();
      }
    };
    window.TimeAdsTracking = api;
    void land();
    document.dispatchEvent(new CustomEvent("timeads:ready"));
    return api;
  }
  const conversionTracking = typeof window === "undefined" ? null : createTracker();
  return conversionTracking;
}));
