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
            // Requête vers Backendless en demandant explicitement vos colonnes
            const query = Backendless.DataQueryBuilder.create()
                .setProperties("denomination", "nom_proprietaire", "tel", "province", "lien_telechargement_pdf")
                .setPageSize(100);
            
            entrepreneurs = await Backendless.Data.of("adhesions").find(query);

            if (entrepreneurs && entrepreneurs.length > 0) {
                updateCard();
            } else {
                document.getElementById('entrepreneur-card').innerHTML = "Aucun adhérent trouvé dans la base.";
            }
        } catch (e) {
            console.error("Erreur de chargement Section 6:", e);
            document.getElementById('entrepreneur-card').innerHTML = "Erreur de connexion aux données.";
        }
    }

    function updateCard() {
        const card = document.getElementById('entrepreneur-card');
        const counter = document.getElementById('card-counter');
        const downloadBtn = document.getElementById('downloadBtn');
        
        const data = entrepreneurs[currentIndex];

        // --- VERIFICATION DES COLONNES ---
        const denomination = data.denomination || "Dénomination non renseignée";
        const proprietaire = data.nom_proprietaire || "Propriétaire non défini";
        const telephone = data.tel || "Téléphone non disponible";
        const province = data.province || "Province non définie";
        const pdfLink = data.lien_telechargement_pdf;

        card.innerHTML = `
            <div class="card-content">
                <span class="prov-tag">${province}</span>
                <h3 class="ent-name">${denomination}</h3>
                <div class="s6-details">
                    <p><strong>👤 Propriétaire :</strong> ${proprietaire}</p>
                    <p><strong>📞 Contact :</strong> ${telephone}</p>
                </div>
            </div>
        `;

        counter.innerText = `${currentIndex + 1} / ${entrepreneurs.length}`;
        
        // --- LOGIQUE DU BOUTON DE TÉLÉCHARGEMENT ---
        if (pdfLink && pdfLink.trim() !== "") {
            downloadBtn.href = pdfLink;
            downloadBtn.style.display = "inline-block";
            downloadBtn.innerText = `📥 Télécharger le PDF de ${denomination}`;
        } else {
            // On cache le bouton si le lien est vide dans Backendless
            downloadBtn.style.display = "none";
        }
    }

    // Navigation
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
