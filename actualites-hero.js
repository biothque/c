// actualites-hero.js
(function() {
    // Remplace par ton lien de vidéo (MP4 recommandé pour la compatibilité)
    const videoURL = "Précomp.-AnnimLogoAgri.mp4"; 

    const htmlContent = `
        <div class="news-hero-container">
            <video autoplay muted loop playsinline class="news-hero-video">
                <source src="${videoURL}" type="video/mp4">
                Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            
            <div class="news-hero-overlay"></div>

            <div class="news-hero-content">
                <h1 class="text-4xl sm:text-6xl news-hero-title mb-4">
                    Nos Dernières Actualités
                </h1>
                <p class="text-lg md:text-xl font-light max-w-2xl mx-auto italic">
                    Restez informé des activités de la COPEMECO et de l'évolution des PME en RDC.
                </p>
            </div>
        </div>
    `;

    const target = document.getElementById('news-hero-injection');
    if (target) {
        target.innerHTML = htmlContent;
    }
})();
