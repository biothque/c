(function() {
    const section8 = document.getElementById('section8');
    
    // 1. Injection du HTML
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
                            <option value="documentaire.html">Documentations</option>
                            <option value="contact.html">Contact</option>
                        </select>
                    </div>
                    <div class="s8-group">
                        <button id="captureBtn" class="btn-capture">📄 Générer le Rapport PDF A4</button>
                    </div>
                </div>
                <p class="s8-note text-center mt-4 text-gray-500 text-sm">
                    Note : Le PDF sera généré en respectant la mise en page officielle de la COPEMECO.
                </p>
            </div>
        `;

        // 2. Attachement de l'événement de déconnexion APRES l'injection
        const btnLogout = document.getElementById('logoutBtn');
        if (btnLogout) {
            btnLogout.addEventListener('click', function() {
                if (confirm("Voulez-vous vraiment quitter la page des statistiques ?")) {
                    // On vide le stockage pour bloquer l'accès futur
                    localStorage.removeItem('userMatricule');
                    localStorage.clear();
                    // Redirection vers le login
                    window.location.replace("login.html");
                }
            });
        }

        // 3. Gestion de la navigation
        const navSelect = document.getElementById('pageNav');
        if (navSelect) {
            navSelect.addEventListener('change', (e) => {
                if (e.target.value) window.location.href = e.target.value;
            });
        }

        // 4. Capture PDF (Vérifiez que html2pdf est chargé dans le HTML)
        const btnCapture = document.getElementById('captureBtn');
        if (btnCapture) {
            btnCapture.addEventListener('click', () => {
                const element = document.body;
                const opt = {
                    margin: 0.5,
                    filename: 'Statistiques_COPEMECO.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
            });
        }
    }
})();
