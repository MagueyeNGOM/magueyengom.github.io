(() => {
  const donnees = window.PORTFOLIO;

  const icones = {
    code: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    trace: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    lecture: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    equipe: '<circle cx="8" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M2 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M15 15c3 0 5.5 1.6 5.5 4.5"/>',
  };

  const svg = (nom) =>
    `<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icones[nom]}</svg>`;

  const cible = (nom) => document.querySelector(`[data-rendu="${nom}"]`);

  const serie = (code) =>
    `<p class="etiquette-serie" aria-hidden="true"><span class="etiquette-serie__code">${code}</span><span class="etiquette-serie__barres"></span></p>`;

  const lignesStat = (liste) =>
    liste.map(([nom, valeur]) => `<div class="ligne-stat"><dt class="ligne-stat__nom">${nom}</dt><dd class="ligne-stat__valeur">${valeur}</dd></div>`).join("");

  function nombreOutils() {
    let total = 0;
    donnees.competences.forEach((cat) =>
      cat.lignes.forEach((l) => {
        total += 1 + l.secondaires.filter(Boolean).length;
      })
    );
    return total;
  }

  function profil() {
    const p = donnees.profil;
    const theme = document.documentElement.dataset.theme === "splatoon1" ? "splatoon1" : "splatoon2";
    const stats = [
      [donnees.projets.length, "Projets"],
      [donnees.competences.length, "Domaines"],
      [nombreOutils(), "Outils"],
    ]
      .map(([valeur, nom]) => `<li class="mini-stat"><span class="mini-stat__valeur" data-compteur="${valeur}">${valeur}</span><span class="mini-stat__nom">${nom}</span></li>`)
      .join("");

    return `
      <div class="profil__conteneur conteneur">
        <div class="profil__texte">
          <p class="profil__statut"><span class="profil__point" aria-hidden="true"></span>Recherche de stage</p>
          <h1 class="profil__nom" id="titre-profil">
            <span class="profil__prenom">${p.prenom}</span>
            <span class="profil__famille">${p.famille}</span>
          </h1>
          <p class="profil__accroche">${p.accroche}</p>
          <div class="profil__actions">
            <a class="bouton bouton--grand" href="#projets">Voir mes projets</a>
            <a class="bouton bouton--grand bouton--secondaire" href="#contact">Me contacter</a>
            <a class="bouton bouton--grand bouton--secondaire" href="${donnees.contact.cv}" download="CV_Magueye-NGOM.pdf" aria-label="Télécharger mon CV en PDF">Mon CV · PDF</a>
          </div>
        </div>
        <aside class="carte-profil" aria-label="Carte profil">
          <div class="carte-profil__ligne">
            <div>
              <p class="carte-profil__nom">${p.prenom} ${p.famille}</p>
              <p class="carte-profil__role">${p.role}</p>
            </div>
            <p class="carte-profil__rang" aria-label="Deuxième année">${p.rang}</p>
          </div>
          <ul class="carte-profil__stats">${stats}</ul>
          ${serie("PROFIL")}
        </aside>
      </div>`;
  }

  function apropos() {
    const a = donnees.apropos;
    const citation = a.citation.replace(a.citationMise, `<mark class="citation__mise">${a.citationMise}</mark>`);
    const paragraphes = a.paragraphes.map((t) => `<p>${t}</p>`).join("");

    return `
      <div class="apropos__grille">
        <blockquote class="citation" data-anim="pop-incline" style="--delai:0ms">
          <p class="citation__texte">${citation}</p>
        </blockquote>
        <div class="apropos__texte" data-anim="rise" style="--delai:120ms">
          ${paragraphes}
        </div>
        <section class="fiche" aria-label="En bref" data-anim="rise" style="--delai:200ms">
          <span class="encre encre--secondaire fiche__encre" aria-hidden="true"></span>
          <div class="fiche__entete">
            <h3 class="fiche__titre">En bref</h3>
            <p class="fiche__dispo">${a.dispo}</p>
          </div>
          <dl class="fiche__table">${lignesStat(a.stats)}</dl>
          ${serie("EN BREF")}
        </section>
      </div>`;
  }

  function parcours() {
    const p = donnees.parcours;
    const marques = p.rangs
      .map((rang, i) => {
        const atteint = i <= Math.floor(p.progression);
        return `<li class="jauge-rang__marque${atteint ? " jauge-rang__marque--atteinte" : ""}" style="--pos:${(i / (p.rangs.length - 1)) * 100}%"><span>${rang}</span></li>`;
      })
      .join("");
    const taux = (p.progression / (p.rangs.length - 1)) * 100;
    const etapes = p.etapes
      .map(
        (e, i) => `
        <li class="marche${e.statut.startsWith("En cours") ? " marche--cours" : ""}" style="--niveau:${i};--delai:${i * 110}ms" data-anim="glisse">
          <p class="marche__rang" aria-label="${e.rang}">${e.rang}</p>
          <div class="marche__corps">
            <p class="marche__periode">${e.periode}</p>
            <h3 class="marche__titre">${e.titre}</h3>
            <p class="marche__lieu">${e.lieu}</p>
            <p class="marche__statut">${e.statut}</p>
          </div>
        </li>`
      )
      .join("");

    return `
      <div class="jauge-rang" data-anim="jauge" style="--echelle:${taux / 100}" role="img" aria-label="Progression, début de la 2e année de BUT en novembre">
        <div class="jauge-rang__piste"><span class="jauge-rang__remplissage"></span><span class="jauge-rang__curseur"></span></div>
        <ol class="jauge-rang__marques">${marques}</ol>
        <p class="jauge-rang__note">En cours, 2e année de BUT MMI (novembre).</p>
      </div>
      <ol class="escalier">${etapes}</ol>`;
  }

  function projets() {
    const liste = donnees.projets;
    const filtres = [
      ["all", "Tous"],
      ["universitaire", "Universitaire"],
      ["personnel", "Personnel"],
    ]
      .map(
        ([cle, nom], i) =>
          `<button class="filtre${i === 0 ? " filtre--actif" : ""}" type="button" aria-pressed="${i === 0}" data-filter="${cle}">${nom}</button>`
      )
      .join("");
    const cartes = liste
      .map((p, i) => {
        const marques = p.technos.map((t) => `<li class="marque">${t}</li>`).join("");
        const liens = [
          p.liens.demo ? `<a class="bouton bouton--secondaire" href="${p.liens.demo}" target="_blank" rel="noopener noreferrer" aria-label="Voir le site ${p.titre} (nouvel onglet)">Voir le site</a>` : "",
          p.liens.code ? `<a class="bouton bouton--secondaire" href="${p.liens.code}" target="_blank" rel="noopener noreferrer">Code</a>` : "",
        ].join("");
        return `
        <article class="carte-projet" data-category="${p.mode.toLowerCase()}" data-project-id="${p.id}" data-anim="pop" style="--delai:${i * 90}ms">
          <div class="carte-projet__visuel">
            <img src="${p.image}" alt="Capture du projet ${p.titre}" loading="lazy" />
            <video class="carte-projet__video" src="${p.video}" muted playsinline loop preload="metadata" aria-hidden="true" tabindex="-1"></video>
            <span class="carte-projet__apercu" aria-hidden="true">Aperçu</span>
            <p class="carte-projet__badge">Projet ${p.mode === "Personnel" ? "personnel" : "universitaire"}</p>
          </div>
          <div class="carte-projet__corps">
            <h3 class="carte-projet__titre">${p.titre}</h3>
            <p class="carte-projet__resume">${p.resume}</p>
            <ul class="carte-projet__marques" aria-label="Technologies">${marques}</ul>
            <div class="carte-projet__actions">
              <button class="bouton" type="button" data-ouvrir="${p.id}">Voir le projet</button>
              ${liens}
            </div>
          </div>
          <footer class="carte-projet__mode">
            <span class="carte-projet__mode-lettre" aria-hidden="true">${p.mode.charAt(0)}</span>
            <span class="carte-projet__mode-nom">${p.mode} · ${p.cadre.split(",")[0]}</span>
          </footer>
          ${serie("PROJET 0" + (i + 1))}
        </article>`;
      })
      .join("");

    return `
      <div class="filtres" role="group" aria-label="Filtrer les projets" data-filters>${filtres}</div>
      <p class="filtres__compte" aria-live="polite" data-compteur-projets>${liste.length} projets affichés</p>
      <div class="grille-projets" data-grille data-count="${liste.length}">${cartes}</div>`;
  }

  function capacite(cle, taille, id) {
    if (!cle) {
      return `<span class="capacite capacite--${taille} capacite--vide" aria-hidden="true"><span class="capacite__vide">?</span></span>`;
    }
    const o = donnees.outils[cle];
    const contenu = o.icone
      ? `<img class="capacite__icone" src="assets/icons/tech/${o.icone}.svg" alt="" />`
      : `<span class="capacite__badge" data-marque="${o.marque || ""}">${o.badge}</span>`;
    return `<button class="capacite capacite--${taille}" type="button" data-capacite="${id}" aria-describedby="infobulle">${contenu}<span class="sr-only">${o.nom}, ${o.detail}</span></button>`;
  }

  function competences() {
    return donnees.competences
      .map((cat) => {
        const lignes = cat.lignes
          .map((l, i) => {
            const noms = [l.principale, ...l.secondaires].filter(Boolean).map((c) => donnees.outils[c].nom).join(" · ");
            const secondaires = l.secondaires.map((c, j) => capacite(c, "petite", `${cat.id}-${i}-s${j}|${c}`)).join("");
            return `
            <div class="ligne-equipement" data-anim="ligne">
              <p class="ligne-equipement__nom">${l.nom}</p>
              <div class="ligne-equipement__capacites">
                ${capacite(l.principale, "grande", `${cat.id}-${i}-p|${l.principale}`)}
                <div class="ligne-equipement__secondaires">${secondaires}</div>
              </div>
              <p class="ligne-equipement__noms">${noms}</p>
            </div>`;
          })
          .join("");
        return `
        <section class="equipement equipement--${cat.ton}" data-anim="rise" aria-labelledby="equip-${cat.id}">
          <header class="equipement__entete">
            <span class="equipement__icone">${svg(cat.icone)}</span>
            <div>
              <h3 class="equipement__titre" id="equip-${cat.id}">${cat.titre}</h3>
            </div>
          </header>
          <div class="equipement__lignes">${lignes}</div>
          ${serie(cat.serie)}
        </section>`;
      })
      .join("");
  }

  function contact() {
    const c = donnees.contact;
    return `
      <div class="contact__corps" data-anim="rise">
        <span class="encre encre--secondaire contact__encre" aria-hidden="true"></span>
        <p class="contact__texte">Je recherche un stage en développement web de 8 à 12 semaines à partir d'avril. N'hésitez pas à me contacter par mail.</p>
        <div class="contact__actions">
          <button class="bouton bouton--grand contact__copier" type="button" data-copier="${c.email}">Copier mon email</button>
          <a class="bouton bouton--grand bouton--secondaire" href="${c.cv}" download="CV_Magueye-NGOM.pdf" aria-label="Télécharger mon CV en PDF">Mon CV · PDF</a>
          <p class="contact__email">${c.email}</p>
        </div>
      </div>`;
  }

  const rendus = { profil, apropos, parcours, projets, competences, contact };
  Object.keys(rendus).forEach((nom) => {
    const element = cible(nom);
    if (element) element.innerHTML = rendus[nom]();
  });



})();
