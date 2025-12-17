/**
 * Script de Visite Guidée pour Fiche d'Inscription COPEMECO
 * Spécialement adapté pour les champs spécifiques (Genre, Province, Âge)
 */

// 1. Chargement dynamique des ressources Driver.js
const driverCSS = document.createElement('link');
driverCSS.rel = 'stylesheet';
driverCSS.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.css';
document.head.appendChild(driverCSS);

const driverJS = document.createElement('script');
driverJS.src = 'https://cdn.jsdelivr.net/npm/driver.js@1.0.1/dist/driver.js.iife.js';
document.head.appendChild(driverJS);

driverJS.onload = () => {
    // 2. Création du bouton flottant "?"
    const btnAide = document.createElement('button');
    btnAide.innerHTML = '?';
    btnAide.id = 'tour-guide-btn';
    Object.assign(btnAide.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        fontSize: '28px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    document.body.appendChild(btnAide);

    // 3. Configuration de la visite guidée détaillée
    const driver = window.driver.js.driver;
    const tour = driver({
        showProgress: true,
        nextBtnText: 'Suivant',
        prevBtnText: 'Précédent',
        doneBtnText: 'Terminer',
        steps: [
            { 
                element: 'input[name="noms_entrepreneur"]', 
                popover: { 
                    title: 'Votre Nom', 
                    description: 'Veuillez saisir votre nom complet (Nom et Prénoms).', 
                    side: "bottom" 
                } 
            },
            { 
                element: 'select[name="genre"]', 
                popover: { 
                    title: 'Genre', 
                    description: 'Sélectionnez votre sexe dans la liste.', 
                    side: "top" 
                } 
            },
            { 
                element: 'select[name="province_origine"]', 
                popover: { 
                    title: 'Province d\'Origine', 
                    description: 'Choisissez votre province parmi les 26 provinces de la RDC.', 
                    side: "top" 
                } 
            },
            { 
                element: 'select[name="tranche_age"]', 
                popover: { 
                    title: 'Votre Âge', 
                    description: 'Indiquez votre tranche d\'âge pour les statistiques.', 
                    side: "top" 
                } 
            },
            { 
                element: '#informations_projet', 
                popover: { 
                    title: 'Détails du Projet', 
                    description: 'En une phrase simple, Décrivez ici votre secteur d\'activité et vos besoins de financement.', 
                    side: "top" 
                } 
            },
            { 
                element: '#page2', 
                popover: { 
                    title: 'Profil et Vision', 
                    description: 'En une phrase simple, Complétez vos informations académiques et votre motivation sur cette deuxième page.', 
                    side: "top" 
                } 
            },
            { 
                element: '#submitBtn', 
                popover: { 
                    title: 'Prêt à envoyer ?', 
                    description: 'Ne surcharez pas le formulaire avec de long paragraphe, décrivez vos souhaits avec de petites phrases simples pour que vos données soient envoyées, Une fois que tout est correct, cliquez ici pour soumettre votre dossier, veuillez cliquer sur le lien afin de télécharger votre formulaire après la sa soumission. Un conseil où le formulaire refuse de soumettre faute de surcharge des des phrases, veuillez donc réduire les différentes phrases,si le problème persiste veuillez contacer le Web-Master au niveau WhatsApp :+243 982 489 067', 
                    side: "top" 
                } 
            }
        ]
    });

    // Lancer au clic sur le bouton
    btnAide.onclick = () => tour.drive();

    // Lancer automatiquement si c'est la première fois
    if (!localStorage.getItem('copemeco_tour_done')) {
        setTimeout(() => {
            if(confirm("la Coordination Nationale de Jeunes Entrepreneurs vous la Bienvenue ! Souhaitez-vous une visite guidée pour remplir votre fiche d'inscription ?")) {
                tour.drive();
            }
            localStorage.setItem('copemeco_tour_done', 'true');
        }, 800);
    }
};
