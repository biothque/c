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
                        <div class="loader">Chargement...</div>
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
            const query = Backendless.DataQueryBuilder.create()
                .setProperties("denomination", "nom_proprietaire", "tel", "province", "lien_telechargement_pdf")
                .setPageSize(100);
            
            entrepreneurs = await Backendless.Data.of("adhesions").find(query);

            if (entrepreneurs.length > 0) {
                updateCard();
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

        card.innerHTML = `
            <div class="card-content">
                <span class="prov-tag">${data.province || 'Province Inconnue'}</span>
                <h3 class="ent-name">${data.denomination || 'N/A'}</h3>
                <p class="owner-name"><strong>Propriétaire:</strong> ${data.nom_proprietaire || 'Non mentionné'}</p>
                <p class="phone-num"><strong>📞 Tél:</strong> ${data.tel || 'Aucun numéro'}</p>
            </div>
        `;

        counter.innerText = `${currentIndex + 1} / ${entrepreneurs.length}`;
        
        // Mise à jour du lien de téléchargement
        if (data.lien_telechargement_pdf) {
            downloadBtn.href = data.lien_telechargement_pdf;
            downloadBtn.style.display = "inline-block";
        } else {
            downloadBtn.style.display = "none";
        }
    }

    // Événements boutons
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
