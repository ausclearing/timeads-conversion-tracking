const k = /* @__PURE__ */ (() => {
  const n = async () => {
    try {
      const s = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256
        },
        !0,
        // Whether the key is exportable
        ["encrypt", "decrypt"]
      ), r = await crypto.subtle.exportKey("raw", s);
      return c(r);
    } catch (s) {
      throw console.error("Error generating encryption key:", s), s;
    }
  }, i = async (s) => {
    try {
      const r = g(s);
      return await crypto.subtle.importKey(
        "raw",
        r,
        { name: "AES-GCM" },
        !0,
        ["encrypt", "decrypt"]
      );
    } catch (r) {
      throw console.error("Error importing encryption key:", r), r;
    }
  }, y = async (s, r) => {
    if (!p(s))
      throw new Error("Invalid Base64 Key");
    const a = await i(s), e = crypto.getRandomValues(new Uint8Array(12)), o = new TextEncoder().encode(JSON.stringify(r)), u = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: e },
      a,
      o
    );
    return {
      iv: c(e),
      // Base64 encode IV
      cipherText: c(u)
      // Base64 encode encrypted data
    };
  }, l = async (s, r) => {
    try {
      const a = await i(s), e = g(r.iv), o = g(r.cipherText), u = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: e
        },
        a,
        o
      );
      return JSON.parse(new TextDecoder().decode(u));
    } catch (a) {
      throw console.error("Error decrypting data:", a), a;
    }
  }, p = (s) => {
    try {
      return btoa(atob(s)) === s;
    } catch {
      return !1;
    }
  }, c = (s) => {
    const a = new Uint8Array(s).reduce((e, o) => e + String.fromCharCode(o), "");
    return btoa(a);
  }, g = (s) => {
    const r = atob(s), a = new Uint8Array(r.length);
    for (let e = 0; e < r.length; e++)
      a[e] = r.charCodeAt(e);
    return a.buffer;
  };
  return {
    generateKey: n,
    encrypt: y,
    decrypt: l
  };
})(), t = /* @__PURE__ */ (() => {
  let n = !1;
  return {
    debug: (...c) => {
      n && console.log("[ConversionTracking DEBUG]:", ...c);
    },
    warn: (...c) => {
      n && console.warn("[ConversionTracking WARNING]:", ...c);
    },
    error: (...c) => {
      console.error("[ConversionTracking ERROR]:", ...c);
    },
    setDebug: (c) => {
      n = !!c;
    }
  };
})(), d = /* @__PURE__ */ ((n = {
  cookieName: "jdiiwkssl",
  localStorageKey: "lsoqejaiked"
}) => ({
  storeInLocalStorage: async (r, a) => {
    try {
      const e = await k.encrypt(r, a);
      return localStorage.setItem(n.localStorageKey, JSON.stringify(e)), t.debug("Data stored in localStorage."), !0;
    } catch (e) {
      return t.error("Error storing data in localStorage:", e), !1;
    }
  },
  retrieveFromLocalStorage: async (r) => {
    try {
      const a = JSON.parse(localStorage.getItem(n.localStorageKey));
      if (!a)
        return t.debug("No data found in localStorage."), null;
      const e = await k.decrypt(r, a);
      return t.debug("Data retrieved and decrypted from localStorage."), e;
    } catch (a) {
      return t.error("Error retrieving data from localStorage:", a), null;
    }
  },
  storeInCookies: async (r) => {
    const a = n.cookieName + "=";
    try {
      return document.cookie = `${a}${btoa(JSON.stringify(r))}; Secure; SameSite=Strict; path=/;`, t.debug("Data stored in cookies."), !0;
    } catch (e) {
      return t.error("Error storing data in cookies:", e), !1;
    }
  },
  retrieveFromCookies: async () => {
    try {
      const r = n.cookieName + "=", a = document.cookie.split("; ").find((o) => o.startsWith(r));
      if (!a)
        return t.debug("No data found in cookies."), null;
      const e = JSON.parse(atob(a.split("=")[1]));
      return t.debug("Data retrieved and decrypted from cookies."), e;
    } catch (r) {
      return t.error("Error retrieving data from cookies:", r), null;
    }
  },
  checkCookieSupport: () => {
    try {
      document.cookie = "yourock=1; SameSite=Strict; path=/;";
      const r = document.cookie.indexOf("yourock=") !== -1;
      return r && (document.cookie = "yourock=; SameSite=Strict; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"), r;
    } catch {
      return !1;
    }
  },
  checkLocalStorageSupport: () => {
    try {
      const r = "__yourock__";
      return localStorage.setItem(r, "1"), localStorage.removeItem(r), !0;
    } catch (r) {
      return t.error("Error checking localStorage support:", r), !1;
    }
  },
  setConfig: (r) => {
    n = {
      cookieName: r.cookieName !== void 0 ? r.cookieName : n.cookieName,
      localStorageKey: r.localStorageKey !== void 0 ? r.localStorageKey : n.localStorageKey
    };
  }
}))(), f = {
  PURCHASE: "purchase",
  SIGNUP: "signup",
  VIEW_ITEM: "view_item"
}, v = ((n = {
  debug: !1,
  sessionIdParam: "thurin",
  endPoint: "http://127.0.0.1/api/track"
}) => {
  t.setDebug(n.debug);
  let i = {};
  const y = (e) => {
    n = {
      debug: e.debug !== void 0 ? e.debug : n.debug,
      sessionIdParam: e.sessionIdParam !== void 0 ? e.sessionIdParam : n.sessionIdParam,
      endPoint: e.endPoint !== void 0 ? e.endPoint : n.endPoint
    }, d.setConfig(n), t.setDebug(n.debug), t.debug("Configuration updated:", n);
  }, l = (e) => {
    fetch(n.endPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    }).then((o) => o.json()).then((o) => {
      t.debug("Data sent to server:", o);
    }).catch((o) => {
      t.debug("Error sending data to server:", o);
    });
  }, p = () => new URLSearchParams(window.location.search).get(n.sessionIdParam) || null, c = () => {
    if (t.debug("Initializing ConversionTracking..."), t.debug("Checking cookies support..."), !d.checkCookieSupport())
      throw t.error("Cookies are not supported. Conversion tracking may not work as expected."), new Error("Cookies are not supported.");
    if (t.debug("Checking localStorage support..."), !d.checkLocalStorageSupport())
      throw t.error("LocalStorage is not supported. Conversion tracking may not work as expected."), new Error("LocalStorage is not supported.");
  }, g = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), s = (e) => {
    const o = [];
    return "event" in e ? typeof e.event != "string" ? o.push("event must be a string.") : e.event.length < 5 && o.push("event must be at least 5 characters.") : o.push("event is required."), e.value !== void 0 && (typeof e.value != "number" || isNaN(e.value)) && o.push("value must be a valid float (number)."), e.tags !== void 0 && (Array.isArray(e.tags) ? e.tags.length > 3 ? o.push("tags can contain at most 3 items.") : e.tags.forEach((u, S) => {
      typeof u != "string" ? o.push(`tags[${S}] must be a string.`) : u.length > 50 && o.push(`tags[${S}] cannot exceed 50 characters.`);
    }) : o.push("tags must be an array.")), {
      isValid: o.length === 0,
      errors: o
    };
  };
  return {
    land: async () => {
      c(), i.landed_at = (/* @__PURE__ */ new Date()).toISOString();
      const e = p();
      if (!e) {
        t.warn("Session ID not found in URL query parameters.");
        return;
      }
      i.session_id = e, t.debug("Landing recorded at:", i.landed_at, "Session ID:", i.session_id), i.transaction_id = g(), t.debug("Generated transaction ID:", i.transaction_id);
      const o = await k.generateKey();
      if (t.debug("Generated key:", o), !await d.storeInCookies(o)) {
        t.error("Error storing key in cookies.");
        return;
      }
      if (!await d.storeInLocalStorage(o, i)) {
        t.error("Error storing data in localStorage.");
        return;
      }
      const u = {
        event: "landed",
        ...i
      };
      l(u);
    },
    trackEvent: async (e, o = {}) => {
      if (c(), typeof e != "string" || e.length === 0 || e.length > 200) {
        t.error("Invalid transaction ID");
        return;
      }
      const u = await d.retrieveFromCookies();
      if (!u) {
        t.error("Error retrieving key from cookies.");
        return;
      }
      const S = await d.retrieveFromLocalStorage(u);
      if (!S) {
        t.error("Error retrieving data from LocalStorage.");
        return;
      }
      const { isValid: m, errors: b } = s(o);
      if (!m) {
        t.error("Validation errors:", b);
        return;
      }
      const h = {
        ...o,
        transaction_id: e,
        landed_at: (/* @__PURE__ */ new Date()).toISOString(),
        session_id: S.session_id
      };
      t.debug("Event tracked:", h), l(h);
    },
    Event: f,
    setConfig: y
  };
})();
export {
  v as default
};
