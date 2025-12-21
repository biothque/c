/**
 * Script de Visite Guidée adapté pour Fiche d'Inscription ORGANISATION (COPEMECO)
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
                element: 'input[name="nom_org"]', 
                popover: { 
                    title: 'Nom de l\'Organisation', 
                    description: 'Saisissez le nom officiel de votre structure ou association.', 
                    side: "bottom" 
                } 
            },
            { 
                element: 'select[name="province_org"]', 
                popover: { 
                    title: 'Province du Siège', 
                    description: 'Sélectionnez la province où se trouve votre bureau principal.', 
                    side: "top" 
                } 
            },
            { 
                element: 'textarea[name="activite_principale"]', 
                popover: { 
                    title: 'Activité Principale', 
                    description: 'Décrivez brièvement le domaine majeur de votre organisation.', 
                    side: "top" 
                } 
            },
            { 
                element: 'input[name="noms_dirigeant"]', 
                popover: { 
                    title: 'Responsable', 
                    description: 'Indiquez le nom complet du dirigeant ou du mandataire.', 
                    side: "top" 
                } 
            },
            { 
                element: 'select[name="forfait_adhesion"]', 
                popover: { 
                    title: 'Adhésion', 
                    description: 'Choisissez le forfait correspondant au nombre de vos membres.', 
                    side: "top" 
                } 
            },
            { 
                element: '#submitBtn', 
                popover: { 
                    title: 'Soumission du dossier', 
                    description: 'Une fois rempli, cliquez ici. Évitez les longs paragraphes pour faciliter l\'enregistrement. En cas de blocage, contactez le Web-Master (+243 982 489 067). N\'oubliez pas de télécharger votre PDF après succès !', 
                    side: "top" 
                } 
            }
        ]
    });

    // Lancer au clic
    btnAide.onclick = () => tour.drive();

    // Lancement automatique au premier passage
    if (!localStorage.getItem('copemeco_tour_done')) {
        setTimeout(() => {
            if(confirm("Bienvenue sur l'espace d'inscription des Organisations ! Souhaitez-vous une visite guidée ?")) {
                tour.drive();
            }
            localStorage.setItem('copemeco_tour_done', 'true');
        }, 1000);
    }
};
