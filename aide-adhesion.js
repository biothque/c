/**
 * Script de Visite Guidée - Fiche d'Adhésion COPEMECO
 * Fichier : aide-adhesion.js
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
        backgroundColor: '#28a745', // Vert pour différencier de l'autre formulaire
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    document.body.appendChild(btnAide);

    // 3. Configuration de la visite guidée
    const driver = window.driver.js.driver;
    const tour = driver({
        showProgress: true,
        nextBtnText: 'Suivant',
        prevBtnText: 'Précédent',
        doneBtnText: 'Terminer',
        steps: [
            { 
                element: '#identification', 
                popover: { title: 'Identification PME', description: 'Commencez par la raison sociale et vos numéros officiels (RCCM, ID NAT).', side: "bottom" } 
            },
            { 
                element: 'select[name="province"]', 
                popover: { title: 'Localisation', description: 'Sélectionnez la province où se situe votre siège.', side: "top" } 
            },
            { 
                element: 'select[name="forme_juridique"]', 
                popover: { title: 'Cadre Juridique', description: 'Précisez la forme juridique de votre entreprise.', side: "top" } 
            },
            { 
                element: 'select[name="act_principale"]', 
                popover: { title: 'Activités', description: 'Choisissez votre domaine d\'activité principal, tout en rappelant de vouloir bien utiliser de phrases simples pour eviter le surcharge du formulaire.', side: "top" } 
            },
            { 
                element: '#page2 h2', 
                popover: { title: 'Responsable', description: 'Nous passons à la page 2 pour identifier le propriétaire et le gérant.', side: "bottom" } 
            },
            { 
                element: 'textarea[name="attentes"]', 
                popover: { title: 'Vos Attentes', description: 'Dites-nous ce que vous attendez de votre adhésion à la COPEMECO, veuillez observer que votre champs de remplissage n.est pas surchargé afin d.éviter mes erreurs back', side: "top" } 
            },
            { 
                element: '#submitBtn', 
                popover: { title: 'Validation', description: 'Avant tout veuillez vérifier si vos champs de remplissage texte contient des phrases simples, car s.il y a de phrases complexes, le formulaire ne sera point envoyé, Cliquez ici pour soumettre votre demande d\'adhésion une fois le formulaire complet, un petit rappel de vouloir télécharger sur liej qui sera affiché après soumission du formulaire afin de le télécharger en version PDF. S.il y a un problème d.envoi veuillez contacter le Web-Master par WhatsApp : +243 982 489 067.', side: "top" } 
            }
        ]
    });

    // Lancer au clic
    btnAide.onclick = () => tour.drive();

    // Proposition automatique au premier chargement
    if (!localStorage.getItem('adh_tour_done')) {
        setTimeout(() => {
            if(confirm(" La Coordination Nationale des Jeunes Entrepreneurs vous souhaite la Bienvenue ! Souhaitez-vous une visite guidée pour remplir votre fiche d'adhésion ?")) {
                tour.drive();
            }
            localStorage.setItem('adh_tour_done', 'true');
        }, 1000);
    }
};
