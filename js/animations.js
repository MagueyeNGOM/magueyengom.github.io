(() => {
  const racine = document.documentElement;
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function compteurs() {
    const elements = document.querySelectorAll("[data-compteur]");
    if (reduit || !elements.length) return;

    elements.forEach((element) => {
      const cible = Number(element.dataset.compteur);
      const depart = 480;
      const duree = 650;
      element.textContent = "0";

      window.setTimeout(() => {
        const debut = performance.now();

        function pas(maintenant) {
          const t = Math.min((maintenant - debut) / duree, 1);
          const progres = 1 - Math.pow(1 - t, 3);
          element.textContent = String(Math.round(cible * progres));
          if (t < 1) {
            window.requestAnimationFrame(pas);
          } else {
            element.classList.add("compteur--fin");
          }
        }

        window.requestAnimationFrame(pas);
      }, depart);

      window.setTimeout(() => {
        element.textContent = String(cible);
      }, depart + duree + 400);
    });
  }

  function reveler() {
    if (reduit) return;

    if (!("IntersectionObserver" in window)) {
      racine.classList.add("anim-force");
      return;
    }

    document.querySelectorAll(".section__rang").forEach((element) => {
      element.dataset.anim = "pop";
    });
    document.querySelectorAll(".bande-titre").forEach((element) => {
      element.dataset.anim = "brush";
      element.style.setProperty("--delai", "100ms");
    });
    document.querySelectorAll(".section__intro").forEach((element) => {
      element.dataset.anim = "rise";
      element.style.setProperty("--delai", "250ms");
    });

    const reglages = { threshold: 0.05, rootMargin: "0px 0px 80px 0px" };
    const atteint = (entree) => entree.isIntersecting || entree.boundingClientRect.top < 0;

    const observateur = new IntersectionObserver((entrees) => {
      entrees.forEach((entree) => {
        if (!atteint(entree)) return;
        entree.target.classList.add("anim--vue");
        observateur.unobserve(entree.target);
      });
    }, reglages);

    document.querySelectorAll("[data-anim]").forEach((element) => {
      if (!element.closest(".section__entete")) observateur.observe(element);
    });

    const entetes = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!atteint(entree)) return;
          entree.target.querySelectorAll("[data-anim]").forEach((element) => element.classList.add("anim--vue"));
          entetes.unobserve(entree.target);
        });
      },
      reglages
    );

    document.querySelectorAll(".section__entete").forEach((element) => entetes.observe(element));

    let attente = false;
    function rattraper() {
      attente = false;
      const limite = window.innerHeight + 80;
      document.querySelectorAll("[data-anim]:not(.anim--vue)").forEach((element) => {
        if (element.getBoundingClientRect().top < limite) element.classList.add("anim--vue");
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (attente) return;
        attente = true;
        window.requestAnimationFrame(rattraper);
      },
      { passive: true }
    );
    window.addEventListener("hashchange", rattraper);
    rattraper();
  }

  function barreEncre() {
    const remplissage = document.querySelector(".barre-encre__remplissage");
    if (!remplissage) return;
    let attente = false;

    function maj() {
      attente = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const taux = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      remplissage.style.setProperty("--progression", taux.toFixed(4));
    }

    window.addEventListener(
      "scroll",
      () => {
        if (attente) return;
        attente = true;
        window.requestAnimationFrame(maj);
      },
      { passive: true }
    );
    window.addEventListener("resize", maj);
    maj();
  }

  compteurs();
  barreEncre();
  reveler();
  racine.dataset.animOk = "1";
})();
