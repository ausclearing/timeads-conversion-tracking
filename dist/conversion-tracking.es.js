const c = /* @__PURE__ */ (() => {
  let e = {};
  const s = (...n) => {
    console.log("[ConversionTracking DEBUG]:", ...n);
  }, t = () => new URLSearchParams(window.location.search).get("naugladur") || null;
  return {
    initialize: () => {
      const n = t();
      n ? (e.sessionId = n, s("Session ID captured:", n)) : s("No session ID found in the URL.");
    },
    land: () => {
      e.landedAt = (/* @__PURE__ */ new Date()).toISOString(), s("Landing recorded at:", e.landedAt, "Session ID:", e.sessionId);
    },
    trackEvent: (n, o = {}) => {
      const a = {
        event: n,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        sessionId: e.sessionId,
        ...o
      };
      s("Event tracked:", a);
    }
  };
})();
export {
  c as default
};
