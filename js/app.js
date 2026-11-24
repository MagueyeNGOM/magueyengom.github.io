(() => {
  const donnees = window.PORTFOLIO;
  const racine = document.documentElement;
  const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function themes() {
    const boutons = document.querySelectorAll("[data-theme-choix]");

    function appliquer(theme) {
      racine.dataset.theme = theme;
      boutons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoix === theme)));
    }

    boutons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoix === racine.dataset.theme)));

    boutons.forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const theme = bouton.dataset.themeChoix;
        if (theme === racine.dataset.theme) return;

        if (reduit) {
          appliquer(theme);
        } else {
          const balayage = document.createElement("div");
          balayage.className = "balayage";
          balayage.setAttribute("aria-hidden", "true");
          document.body.appendChild(balayage);
          window.setTimeout(() => appliquer(theme), 140);
          window.setTimeout(() => balayage.remove(), 700);
        }

      });
    });
  }

  function navigation() {
    const onglets = document.querySelectorAll(".onglet");
    const sections = [...onglets].map((o) => document.getElementById(o.dataset.onglet)).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;

    const suivi = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (!entree.isIntersecting) return;
          onglets.forEach((o) => {
            const actif = o.dataset.onglet === entree.target.id;
            o.classList.toggle("onglet--actif", actif);
            if (actif) {
              o.setAttribute("aria-current", "true");
            } else {
              o.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach((s) => suivi.observe(s));
  }

  function projets() {
    const grille = document.querySelector("[data-grille]");
    if (!grille) return;
    const cartes = [...grille.querySelectorAll(".carte-projet")];
    const conteneur = document.querySelector("[data-filters]");
    const filtres = conteneur ? [...conteneur.querySelectorAll("[data-filter]")] : [];
    const compteur = document.querySelector("[data-compteur-projets]");

    function lancer(carte) {
      if (reduit) return;
      const video = carte.querySelector(".carte-projet__video");
      if (!video) return;
      video.muted = true;
      carte.classList.add("carte-projet--lecture");
      const promesse = video.play();
      if (promesse) promesse.catch(() => carte.classList.remove("carte-projet--lecture"));
    }

    function arreter(carte) {
      const video = carte.querySelector(".carte-projet__video");
      carte.classList.remove("carte-projet--lecture");
      if (!video) return;
      video.pause();
      video.currentTime = 0;
    }

    function survol(type, action) {
      grille.addEventListener(type, (evenement) => {
        const carte = evenement.target.closest("[data-project-id]");
        if (!carte || carte.contains(evenement.relatedTarget)) return;
        action(carte);
      });
    }

    survol("mouseover", lancer);
    survol("mouseout", arreter);
    survol("focusin", lancer);
    survol("focusout", arreter);

    function filtrer(cle) {
      let visibles = 0;
      cartes.forEach((carte) => {
        const montrer = cle === "all" || carte.dataset.category === cle;
        carte.hidden = !montrer;
        if (!montrer) arreter(carte);
        carte.classList.remove("carte-projet--vedette", "carte-projet--entree");
        if (!montrer) return;
        carte.classList.add("anim--vue");
        if (visibles === 0 && cartes.length === 3 && cle === "all") carte.classList.add("carte-projet--vedette");
        if (!reduit) {
          void carte.offsetWidth;
          carte.classList.add("carte-projet--entree");
        }
        visibles += 1;
      });
      grille.dataset.count = String(visibles);
      filtres.forEach((f) => {
        const actif = f.dataset.filter === cle;
        f.classList.toggle("filtre--actif", actif);
        f.setAttribute("aria-pressed", String(actif));
      });
      if (compteur) compteur.textContent = visibles + (visibles > 1 ? " projets affichés" : " projet affiché");
    }

    if (conteneur) {
      conteneur.addEventListener("click", (evenement) => {
        const bouton = evenement.target.closest("[data-filter]");
        if (bouton) filtrer(bouton.dataset.filter);
      });
    }
    filtrer("all");
    cartes.forEach((c) => c.classList.remove("carte-projet--entree"));

    const modale = document.getElementById("modale");
    const contenu = modale.querySelector("[data-modale-contenu]");

    function ouvrir(id) {
      const projet = donnees.projets.find((p) => p.id === id);
      if (!projet) return;
      const marques = projet.technos.map((t) => `<li class="marque">${t}</li>`).join("");
      const paragraphes = projet.description.map((t) => `<p>${t}</p>`).join("");
      const liens = [
        projet.liens.demo ? `<a class="bouton" href="${projet.liens.demo}" target="_blank" rel="noopener noreferrer">Voir le site</a>` : "",
        projet.liens.code ? `<a class="bouton bouton--secondaire" href="${projet.liens.code}" target="_blank" rel="noopener noreferrer">Code</a>` : "",
      ].join("");

      contenu.innerHTML = `
        <button class="modale__fermer" type="button" data-fermer aria-label="Fermer les détails">
          <svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <p class="modale__mode">${projet.mode} · ${projet.cadre}</p>
        <h3 class="modale__titre" id="modale-titre">${projet.titre}</h3>
        <div class="modale__video">
          <video controls preload="metadata" poster="${projet.image}" aria-label="Démonstration de ${projet.titre}">
            <source src="${projet.video}" type="video/mp4" />
          </video>
        </div>
        <div class="modale__texte">${paragraphes}</div>
        <ul class="modale__marques" aria-label="Technologies">${marques}</ul>
        ${liens ? `<div class="modale__actions">${liens}</div>` : ""}`;

      modale.showModal();
    }

    grille.addEventListener("click", (evenement) => {
      if (evenement.target.closest("a")) return;
      const carte = evenement.target.closest("[data-project-id]");
      if (carte) ouvrir(carte.dataset.projectId);
    });

    function fermer() {
      if (reduit) {
        modale.close();
        return;
      }
      modale.classList.add("modale--fermeture");
      window.setTimeout(() => {
        modale.classList.remove("modale--fermeture");
        if (modale.open) modale.close();
      }, 220);
    }

    modale.addEventListener("click", (evenement) => {
      if (evenement.target === modale || evenement.target.closest("[data-fermer]")) fermer();
    });

    modale.addEventListener("cancel", (evenement) => {
      evenement.preventDefault();
      fermer();
    });

    modale.addEventListener("close", () => {
      const video = modale.querySelector("video");
      if (video) video.pause();
      contenu.innerHTML = "";
    });
  }

  function capacites() {
    const bulle = document.getElementById("infobulle");

    function montrer(bouton) {
      const cle = (bouton.dataset.capacite || "").split("|")[1];
      const outil = donnees.outils[cle];
      if (!outil) return;
      bulle.innerHTML = `<p class="infobulle__nom">${outil.nom}</p><p class="infobulle__texte">${outil.detail}</p>`;
      bulle.hidden = false;
      const rect = bouton.getBoundingClientRect();
      const largeur = bulle.offsetWidth;
      let gauche = rect.left + rect.width / 2 - largeur / 2;
      gauche = Math.max(8, Math.min(gauche, window.innerWidth - largeur - 8));
      bulle.style.left = `${gauche + window.scrollX}px`;
      bulle.style.top = `${rect.top + window.scrollY - bulle.offsetHeight - 10}px`;
    }

    function cacher() {
      bulle.hidden = true;
    }

    document.addEventListener("pointerover", (e) => {
      const b = e.target.closest("[data-capacite]");
      if (b) montrer(b);
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("[data-capacite]")) cacher();
    });
    document.addEventListener("focusin", (e) => {
      const b = e.target.closest("[data-capacite]");
      if (b) montrer(b);
    });
    document.addEventListener("focusout", (e) => {
      if (e.target.closest("[data-capacite]")) cacher();
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-capacite]");
      if (b) montrer(b);
    });
  }

  function copier() {
    const toast = document.querySelector("[data-toast]");
    let minuterie = null;

    function afficher(texte) {
      toast.textContent = texte;
      toast.classList.add("toast--visible");
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(() => toast.classList.remove("toast--visible"), 2200);
    }

    document.addEventListener("click", async (evenement) => {
      const bouton = evenement.target.closest("[data-copier]");
      if (!bouton) return;
      const texte = bouton.dataset.copier;
      let reussi = false;

      try {
        await navigator.clipboard.writeText(texte);
        reussi = true;
      } catch (erreur) {
        const zone = document.createElement("textarea");
        zone.value = texte;
        zone.setAttribute("readonly", "");
        zone.style.position = "fixed";
        zone.style.opacity = "0";
        document.body.appendChild(zone);
        zone.select();
        try {
          reussi = document.execCommand("copy");
        } catch (secours) {
          reussi = false;
        }
        zone.remove();
      }

      if (reussi) {
        afficher("Email copié !");
      } else {
        afficher("Copie impossible");
      }
    });
  }

  function eclaboussures() {
    if (reduit) return;
    const cibles = ".bouton, .filtre, .theme__choix, [data-copier]";

    document.addEventListener("click", (evenement) => {
      const element = evenement.target.closest(cibles);
      if (!element) return;
      let x = evenement.clientX;
      let y = evenement.clientY;
      if (!evenement.detail) {
        const rect = element.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      const eclat = document.createElement("span");
      eclat.className = "eclat";
      eclat.setAttribute("aria-hidden", "true");
      eclat.style.left = `${x}px`;
      eclat.style.top = `${y}px`;

      for (let i = 0; i < 6; i += 1) {
        const goutte = document.createElement("i");
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
        const distance = 18 + Math.random() * 16;
        goutte.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
        goutte.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
        goutte.style.setProperty("--taille", `${5 + Math.random() * 5}px`);
        eclat.appendChild(goutte);
      }

      document.body.appendChild(eclat);
      eclat.lastChild.addEventListener("animationend", () => eclat.remove());
      window.setTimeout(() => eclat.remove(), 700);
    });
  }

  themes();
  navigation();
  projets();
  capacites();
  copier();
  eclaboussures();
})();
