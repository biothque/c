// contact-hero.js
(function() {
    const images = [
        "000.jpg", "AAA.jpg", "BBB.jpg", 
        "CCC.jpg", "DDD.jpg", "EEE.jpg", "FFF.jpg"
    ];

    const htmlContent = `
        <div class="hero-glass-container">
            <div class="hero-bg-slideshow" id="heroSlideshow">
                ${images.map((src, i) => `<img src="${src}" class="${i === 0 ? 'active' : ''}" data-index="${i}">`).join('')}
            </div>
            <div class="glass-overlay">
                <h1 class="text-4xl md:text-6xl glass-title">Où Nous Trouver</h1>
                <p class="text-white text-lg mt-4 font-light italic">
                    La COPEMECO : Proximité et Engagement pour les PME en RDC
                </p>
            </div>
        </div>
    `;

    const target = document.getElementById('hero-injection-point');
    if (target) {
        target.innerHTML = htmlContent;

        const imgs = target.querySelectorAll('.hero-bg-slideshow img');
        let currentIdx = 0;

        function changeImage() {
            const nextIdx = (currentIdx + 1) % imgs.length;
            
            // On retire la classe active de l'ancienne
            imgs[currentIdx].classList.remove('active');
            
            // On applique l'effet de transition mosaïque/fondu sur la nouvelle
            imgs[nextIdx].style.clipPath = "circle(0% at 50% 50%)"; // Départ mosaïque/cercle
            imgs[nextIdx].classList.add('active');
            
            // Animation du clip-path pour l'effet d'apparition "dévoilé"
            setTimeout(() => {
                imgs[nextIdx].style.transition = "clip-path 2s ease-in-out, opacity 2s ease-in-out";
                imgs[nextIdx].style.clipPath = "circle(150% at 50% 50%)";
            }, 50);

            currentIdx = nextIdx;
        }

        setInterval(changeImage, 6000); // Change toutes les 6 secondes
    }
})();
