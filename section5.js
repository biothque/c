(function() {
    const section5 = document.getElementById('section5');
    if (section5) {
        section5.innerHTML = `
            <div class="s5-container">
                <div class="s5-grid">
                    <div class="s5-card total">
                        <div class="s5-icon">👥</div>
                        <div class="s5-info">
                            <span class="s5-label">Total des Entrepreneurs</span>
                            <h2 id="total-entrepreneurs">0</h2>
                        </div>
                    </div>

                    <div class="s5-card weekly">
                        <div class="s5-icon">📅</div>
                        <div class="s5-info">
                            <span class="s5-label">Nouveaux cette semaine</span>
                            <h2 id="weekly-adhesions">0</h2>
                            <p class="s5-reset-info text-xs mt-2 opacity-70">Réinitialisé chaque lundi</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadCounters() {
        try {
            // 1. Récupérer le total général (optimisé)
            const totalCount = await Backendless.Data.of("adhesions").getObjectCount();
            document.getElementById('total-entrepreneurs').innerText = totalCount.toLocaleString();

            // 2. Calculer le début de la semaine actuelle (Lundi à 00:00)
            const now = new Date();
            const day = now.getDay(); // 0 (Dimanche) à 6 (Samedi)
            const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajustement pour obtenir Lundi
            const startOfWeek = new Date(now.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);

            // Convertir en timestamp pour la requête Backendless
            const timestampStart = startOfWeek.getTime();

            // 3. Récupérer les adhésions depuis le début de la semaine
            // On utilise la colonne système 'created' de Backendless
            const query = Backendless.DataQueryBuilder.create()
                .setWhereClause(`created >= ${timestampStart}`);
            
            const weeklyCount = await Backendless.Data.of("adhesions").getObjectCount(query);
            document.getElementById('weekly-adhesions').innerText = weeklyCount;

        } catch (e) {
            console.error("Erreur Section 5:", e);
        }
    }

    loadCounters();
})();
