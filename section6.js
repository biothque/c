(function() {
    const section6 = document.getElementById('section6');
    let currentIndex = 0;
    let entrepreneurs = [];

    if (section6) {
        section6.innerHTML = `
            <div class="s6-container">
                <h2 class="s6-title">Annuaire des Adhérents</h2>
                <div class="s6-wrapper">
                    <div id="entrepreneur-card" class="s6-card">
                        <div class="loader">Chargement des données...</div>
                    </div>
                    <div class="s6-controls">
                        <button id="prevBtn" class="s6-nav-btn">← Précédent</button>
                        <span id="card-counter" class="s6-counter">0 / 0</span>
                        <button id="nextBtn" class="s6-nav-btn">Suivant →</button>
                    </div>
                    <div class="s6-action">
                        <a id="downloadBtn" href="#" target="_blank" class="s6-download-btn">
                            📥 Télécharger le Formulaire (PDF)
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadEntrepreneurs() {
        try {
            // On récupère TOUTES les colonnes pour être sûr de ne rien rater
            const query = Backendless.DataQueryBuilder.create().setPageSize(100);
            entrepreneurs = await Backendless.Data.of("adhesions").find(query);

            console.log("Données reçues de Backendless :", entrepreneurs[0]); // Pour vérifier les noms des colonnes dans la console

            if (entrepreneurs && entrepreneurs.length > 0) {
                updateCard();
            } else {
                document.getElementById('entrepreneur-card').innerHTML = "Aucune donnée trouvée.";
            }
        } catch (e) {
            console.error("Erreur Section 6:", e);
        }
    }

    function updateCard() {
        const card = document.getElementById('entrepreneur-card');
        const counter = document.getElementById('card-counter');
        const downloadBtn = document.getElementById('downloadBtn');
        const data = entrepreneurs[currentIndex];

        // Vérification et fallback si les colonnes ont des noms légèrement différents
        const denomination = data.denomination || data.Denomination || "N/A";
        const proprietaire = data.nom_proprietaire || data.proprietaire || "Non défini";
        const telephone = data.tel || data.telephone || "Aucun numéro";
        const province = data.province || "Non définie";
        const pdfLink = data.lien_telechargement_pdf || data.formulaire_pdf || data.lien_pdf;

        card.innerHTML = `
            <div class="card-content">
                <span class="prov-tag">${province}</span>
                <h3 class="ent-name">${denomination}</h3>
                <p class="owner-name"><strong>Propriétaire:</strong> ${proprietaire}</p>
                <p class="phone-num"><strong>📞 Tél:</strong> ${telephone}</p>
            </div>
        `;

        counter.innerText = `${currentIndex + 1} / ${entrepreneurs.length}`;
        
        // Gestion du bouton de téléchargement
        if (pdfLink && pdfLink.trim() !== "") {
            downloadBtn.href = pdfLink;
            downloadBtn.style.visibility = "visible";
            downloadBtn.style.display = "inline-block";
        } else {
            // Si pas de lien, on cache le bouton proprement
            downloadBtn.style.visibility = "hidden";
        }
    }

    // Événements
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentIndex < entrepreneurs.length - 1) {
            currentIndex++;
            updateCard();
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCard();
        }
    });

    loadEntrepreneurs();
})();
                
