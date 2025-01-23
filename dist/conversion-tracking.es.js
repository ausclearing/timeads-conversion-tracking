const t = /* @__PURE__ */ (() => {
  let n = {};
  return {
    land: () => {
      n.landedAt = (/* @__PURE__ */ new Date()).toISOString(), console.log("Landing recorded at:", n.landedAt);
    }
  };
})();
export {
  t as default
};
