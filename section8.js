(function() {
    const section8 = document.getElementById('section8');
    if (section8) {
        section8.innerHTML = `
            <div class="s8-container">
                <div class="s8-toolbar">
                    <div class="s8-group">
                        <button id="logoutBtn" class="btn-logout">🚪 Déconnexion</button>
                        <select id="pageNav" class="nav-select">
                            <option value="">Aller vers...</option>
                            <option value="index.html">Accueil</option>
                            <option value="actualites.html">Actualités</option>
                            <option value="presentation.html">Projets</option>
                            <option value="contact.html">Contact</option>
                        </select>
                    </div>

                    <div class="s8-group">
                        <button id="captureBtn" class="btn-capture">
                            📄 Générer le Rapport PDF A4
                        </button>
                    </div>
                </div>
                <p class="s8-note text-center mt-4 text-gray-500 text-sm">
                    Note : Le PDF sera généré en respectant la mise en page officielle de la COPEMECO.
                </p>
            </div>
        `;
    }

    // --- LOGIQUE DE DÉCONNEXION ---
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm("Voulez-vous vraiment vous déconnecter ?")) {
            localStorage.clear(); // Nettoie le matricule stocké
            window.location.href = "login.html";
        }
    });

    // --- NAVIGATION ---
    document.getElementById('pageNav').addEventListener('change', (e) => {
        if(e.target.value) window.location.href = e.target.value;
    });

    // --- GÉNÉRATION PDF A4 ---
    document.getElementById('captureBtn').addEventListener('click', () => {
        const element = document.body; // Capture toute la page
        const opt = {
            margin:       0.5,
            filename:     'Statistiques_COPEMECO.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak:    { mode: 'avoid-all', before: '.rdc-separator' } // Saute une page à chaque drapeau RDC
        };

        // Lancement de la génération
        html2pdf().set(opt).from(element).save().then(() => {
            alert("Rapport généré ! Veuillez l'envoyer manuellement par email aux adresses spécifiées pour validation.");
            // Note technique : L'envoi automatique d'un PDF généré côté client vers un email 
            // sans interaction humaine nécessite un serveur SMTP ou un service comme EmailJS.
        });
    });

})();
