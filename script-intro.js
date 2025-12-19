document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('intro-screen');
    const main = document.getElementById('main-content');

    // On attend 4.5 secondes (fin de l'animation)
    setTimeout(() => {
        if (intro) {
            // display: none retire l'élément du flux pour ne plus bloquer le clic sur PC
            intro.style.display = 'none'; 
        }
        if (main) {
            // On rend le contenu principal visible
            main.classList.add('visible');
            main.style.opacity = "1";
        }
    }, 4500); 
});
