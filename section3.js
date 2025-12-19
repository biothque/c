(function() {
    // 1. INJECTION DU HTML
    const section3 = document.getElementById('section3');
    if (section3) {
        section3.innerHTML = `
            <div class="s3-container">
                <h2 class="s3-title">Profil Démographique des Gérants</h2>
                
                <div class="s3-grid">
                    <div class="s3-card">
                        <h3>Répartition par Genre</h3>
                        <div class="chart-h"><canvas id="genreChart"></canvas></div>
                    </div>

                    <div class="s3-card">
                        <h3>Tranches d'Âge (Global)</h3>
                        <div class="chart-h"><canvas id="ageChart"></canvas></div>
                    </div>

                    <div class="s3-card full-width">
                        <h3>Analyse des Âges par Province</h3>
                        <div class="chart-h-large"><canvas id="ageProvChart"></canvas></div>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadDemographics() {
        try {
            const query = Backendless.DataQueryBuilder.create()
                .setProperties("genre", "tranche_age_gerant", "province")
                .setPageSize(100);
            const data = await Backendless.Data.of("adhesions").find(query);

            const statsGenre = {};
            const statsAge = {};
            const statsAgeProv = {}; // Structure: { Province: { Tranche: Count } }

            data.forEach(item => {
                const g = item.genre || "Non défini";
                const a = item.tranche_age_gerant || "Inconnu";
                const p = item.province || "Inconnue";

                statsGenre[g] = (statsGenre[g] || 0) + 1;
                statsAge[a] = (statsAge[a] || 0) + 1;

                if(!statsAgeProv[p]) statsAgeProv[p] = {};
                statsAgeProv[p][a] = (statsAgeProv[p][a] || 0) + 1;
            });

            renderGenre(statsGenre);
            renderAge(statsAge);
            renderAgeProv(statsAgeProv);

        } catch (e) { console.error("Erreur S3:", e); }
    }

    function renderGenre(stats) {
        new Chart(document.getElementById('genreChart'), {
            type: 'pie',
            data: {
                labels: Object.keys(stats),
                datasets: [{ data: Object.values(stats), backgroundColor: ['#007FFF', '#CE1021', '#F7D000'] }]
            },
            options: { plugins: { legend: { position: 'bottom' } } }
        });
    }

    function renderAge(stats) {
        new Chart(document.getElementById('ageChart'), {
            type: 'polarArea',
            data: {
                labels: Object.keys(stats),
                datasets: [{ data: Object.values(stats), backgroundColor: ['rgba(0,127,255,0.5)', 'rgba(247,208,0,0.5)', 'rgba(206,16,33,0.5)', 'rgba(16,185,129,0.5)'] }]
            }
        });
    }

    function renderAgeProv(statsAgeProv) {
        const provinces = Object.keys(statsAgeProv);
        const tranches = [...new Set(Object.values(statsAgeProv).flatMap(o => Object.keys(o)))];
        
        const datasets = tranches.map((tranche, i) => ({
            label: tranche,
            data: provinces.map(p => statsAgeProv[p][tranche] || 0),
            backgroundColor: ['#007FFF', '#F7D000', '#CE1021', '#10B981'][i % 4]
        }));

        new Chart(document.getElementById('ageProvChart'), {
            type: 'bar',
            data: { labels: provinces, datasets: datasets },
            options: { scales: { x: { stacked: true }, y: { stacked: true } } }
        });
    }

    loadDemographics();
})();
