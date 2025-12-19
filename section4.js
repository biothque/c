(function() {
    const section4 = document.getElementById('section4');
    if (section4) {
        section4.innerHTML = `
            <div class="s4-container">
                <h2 class="s4-title">Analyse Comparative Géographique</h2>
                <p class="s4-subtitle">Quelle province domine dans quelle catégorie ?</p>
                
                <div class="s4-grid">
                    <div class="s4-card">
                        <div class="leader-badge">🏆 Province la plus Jeune</div>
                        <h4 id="young-leader-name">-</h4>
                        <div class="chart-container"><canvas id="youngChart"></canvas></div>
                    </div>

                    <div class="s4-card">
                        <div class="leader-badge">🏆 Leadership Féminin</div>
                        <h4 id="women-leader-name">-</h4>
                        <div class="chart-container"><canvas id="womenChart"></canvas></div>
                    </div>

                    <div class="s4-card">
                        <div class="leader-badge">🏆 Diversité Économique</div>
                        <h4 id="activity-leader-name">-</h4>
                        <div class="chart-container"><canvas id="activityChart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
    }

    async function analyzeGeography() {
        try {
            const query = Backendless.DataQueryBuilder.create()
                .setProperties("province", "tranche_age_gerant", "genre", "act_principale")
                .setPageSize(100);
            const data = await Backendless.Data.of("adhesions").find(query);

            const provinces = {};

            data.forEach(item => {
                const p = item.province || "Inconnue";
                if (!provinces[p]) provinces[p] = { jeunes: 0, femmes: 0, activites: new Set() };
                
                // 1. Compter les jeunes (Tranche supposée 18-35)
                if (item.tranche_age_gerant && item.tranche_age_gerant.includes('18-35')) provinces[p].jeunes++;
                
                // 2. Compter les femmes
                if (item.genre === 'Femme' || item.genre === 'Féminin') provinces[p].femmes++;
                
                // 3. Diversité d'activités
                if (item.act_principale) provinces[p].activites.add(item.act_principale);
            });

            const provNames = Object.keys(provinces);

            // ANALYSE 1 : JEUNESSE
            const youngData = provNames.map(p => provinces[p].jeunes);
            const youngWinner = provNames[youngData.indexOf(Math.max(...youngData))];
            document.getElementById('young-leader-name').innerText = youngWinner;
            renderS4Chart('youngChart', provNames, youngData, '#F7D000');

            // ANALYSE 2 : FEMMES
            const womenData = provNames.map(p => provinces[p].femmes);
            const womenWinner = provNames[womenData.indexOf(Math.max(...womenData))];
            document.getElementById('women-leader-name').innerText = womenWinner;
            renderS4Chart('womenChart', provNames, womenData, '#CE1021');

            // ANALYSE 3 : DIVERSITÉ ACTIVITÉS
            const actData = provNames.map(p => provinces[p].activites.size);
            const actWinner = provNames[actData.indexOf(Math.max(...actData))];
            document.getElementById('activity-leader-name').innerText = actWinner;
            renderS4Chart('activityChart', provNames, actData, '#007FFF');

        } catch (e) { console.error(e); }
    }

    function renderS4Chart(id, labels, data, color) {
        new Chart(document.getElementById(id), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ data: data, backgroundColor: color, borderRadius: 5 }]
            },
            options: {
                indexAxis: 'y',
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { grid: { display: false } } }
            }
        });
    }

    analyzeGeography();
})();
