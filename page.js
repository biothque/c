document.addEventListener('DOMContentLoaded', () => {
    const splashScreen = document.getElementById('splash-screen');
    const mainContent = document.getElementById('main-content');

    // Durée totale de l'animation et du délai (2 secondes au total, comme demandé)
    // L'animation CSS dure 1s, on la laisse se jouer une fois, puis on attend 1s de plus.
    const delayDuration = 2000; // 2000 millisecondes = 2 secondes

    // Après le délai spécifié, effectuez la transition
    setTimeout(() => {
        
        // 1. Fait disparaître l'écran de démarrage avec une transition
        splashScreen.style.opacity = '0';
        
        // 2. Après une courte attente pour que l'opacité s'applique (0.5s), on masque complètement
        setTimeout(() => {
            splashScreen.style.display = 'none';

            // 3. Affiche le contenu principal en modifiant son style
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
        }, 500); // Doit correspondre à la transition CSS (0.5s)
        
    }, delayDuration); // Le délai total de 2 secondes
});
