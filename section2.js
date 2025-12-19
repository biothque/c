(function() {
    // 1. INJECTION DU HTML DANS LA SECTION 2
    const section2 = document.getElementById('section2');
    if (section2) {
        section2.innerHTML = `
            <div class="s2-container">
                <h2 class="s2-title">Répartition par Secteurs d'Activité</h2>
                <div class="s2-chart-container">
                    <canvas id="sectorChart"></canvas>
                </div>
            </div>
        `;
    }

    async function loadSectorData() {
        try {
            // Utilisation de la colonne exacte : act_principale
            const query = Backendless.DataQueryBuilder.create().setProperties("act_principale").setPageSize(100);
            const data = await Backendless.Data.of("adhesions").find(query);

            const stats = {};
            data.forEach(item => {
                // On récupère la valeur de act_principale
                const secteur = item.act_principale || "Non spécifié";
                stats[secteur] = (stats[secteur] || 0) + 1;
            });

            // Tri pour avoir les plus gros secteurs en haut
            const sortedSectors = Object.entries(stats).sort((a, b) => b[1] - a[1]);
            const labels = sortedSectors.map(s => s[0]);
            const values = sortedSectors.map(s => s[1]);

            renderSectorChart(labels, values);

        } catch (error) {
            console.error("Erreur Section 2 (Backendless):", error);
        }
    }

    function renderSectorChart(labels, values) {
        const ctx = document.getElementById('sectorChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre d\'entreprises',
                    data: values,
                    backgroundColor: 'rgba(0, 127, 255, 0.6)', // Bleu ciel RDC
                    borderColor: '#007FFF',
                    borderWidth: 1,
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y', // Barres horizontales pour une lecture facile
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { 
                        beginAtZero: true,
                        grid: { color: '#f0f0f0' },
                        ticks: { stepSize: 1 } 
                    },
                    y: { 
                        grid: { display: false },
                        ticks: { font: { weight: 'bold' } }
                    }
                }
            }
        });
    }

    loadSectorData();
})();
