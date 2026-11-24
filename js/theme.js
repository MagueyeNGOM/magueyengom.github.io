(() => {
  document.documentElement.dataset.theme = "splatoon2";

  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduit) {
    document.documentElement.classList.add("anim-pret");
    window.setTimeout(() => {
      if (!document.documentElement.dataset.animOk) document.documentElement.classList.add("anim-force");
    }, 4500);
  }
})();
