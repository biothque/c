(function() {
    // 1. CONFIGURATION BACKENDLESS
    const APP_ID = '3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7';
    const API_KEY = 'B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4';
    Backendless.initApp(APP_ID, API_KEY);

    // 2. INJECTION DU HTML DANS LA SECTION 1
    const section1 = document.getElementById('section1');
    if (section1) {
        section1.innerHTML = `
            <div class="s1-container">
                <h2 class="s1-title">Statistiques par Provinces</h2>
                <div class="s1-content">
                    <div class="s1-chart-box">
                        <canvas id="provinceChart"></canvas>
                    </div>
                    <div id="chart-legend" class="s1-legend">
                        <p class="loading-text">Analyse des données en cours...</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Couleurs distinctes pour les provinces
    const colors = ['#007FFF', '#F7D000', '#CE1021', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899', '#71717a'];

    async function loadData() {
        try {
            // Récupération des données depuis la table "adhesions"
            const query = Backendless.DataQueryBuilder.create().setProperties("province").setPageSize(100);
            const data = await Backendless.Data.of("adhesions").find(query);

            // Comptage des provinces
            const stats = {};
            data.forEach(item => {
                const p = item.province || "Inconnue";
                stats[p] = (stats[p] || 0) + 1;
            });

            const labels = Object.keys(stats);
            const values = Object.values(stats);

            renderChart(labels, values);
            renderLegend(labels, values);

        } catch (error) {
            console.error("Erreur Backendless:", error);
            document.getElementById('chart-legend').innerHTML = "<p style='color:red'>Erreur de chargement.</p>";
        }
    }

    function renderChart(labels, values) {
        const ctx = document.getElementById('provinceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    hoverOffset: 20,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    function renderLegend(labels, values) {
        const container = document.getElementById('chart-legend');
        container.innerHTML = '';
        labels.forEach((label, i) => {
            const row = document.createElement('div');
            row.className = 's1-legend-item';
            row.innerHTML = `
                <span class="s1-dot" style="background:${colors[i]}"></span>
                <span class="s1-prov-name">${label}</span>
                <span class="s1-prov-count">${values[i]}</span>
            `;
            container.appendChild(row);
        });
    }

    loadData();
})();
