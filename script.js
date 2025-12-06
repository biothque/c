// ==============================================
// Backendless configuration
// ==============================================
// ** IMPORTANT : Remplacez les valeurs par vos clés API et App ID ! **
const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; // JavaScript API Key
const TABLE = "adhesions"; // Nom de la table

// Initialisation Backendless
if (typeof Backendless !== 'undefined') {
    Backendless.serverURL = "https://api.backendless.com";
    Backendless.initApp(APP_ID, API_KEY);
} else {
    console.error("Le SDK Backendless n'est pas chargé. Veuillez vérifier index.html.");
}


// Sélection du formulaire et des boutons
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const formActions = document.querySelector('.form-actions');


// Fonction pour générer un numéro d’adhésion unique
function generateMembershipNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
    return `ADH-${year}${month}${day}-${random}`;
}

// Fonction pour collecter TOUTES les données du formulaire avec VALIDER LES CHAMPS OBLIGATOIRES
function collectFormData() {
    const data = {};
    const elements = document.querySelectorAll('input, textarea, select');
    let missingField = null;

    elements.forEach(el => {
        if (el.name) {
            let value = el.value.trim();
            
            // Validation des champs requis (déjà gérée par checkValidity, mais maintenue ici pour la logique de secours)
            if (el.required && value === '') {
                missingField = el; 
            }

            // Remplacer par "Non précisé" si le champ est vide (seulement pour l'enregistrement/affichage PDF)
            data[el.name] = value === '' ? 'Non précisé' : value;
        }
    });
    
    // Si un champ requis est manquant, lance une exception ou retourne l'élément manquant
    if (missingField) {
        return { error: true, field: missingField };
    }


    // Ajouter les métadonnées
    data.createdAt = new Date().toISOString();
    // Génère le numéro d'adhésion
    data.numero_adhesion = data.numero_adhesion || generateMembershipNumber(); 

    return data;
}

// Fonction vibration pour retour utilisateur
function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// -------------------------------------------------
// Générateur PDF A4 fidèle (Utilise jsPDF)
// -------------------------------------------------
const { jsPDF } = window.jspdf;

async function generatePDFExact(formData){
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210, pageHeight = 297;

    // Fonction d'aide pour obtenir la valeur, ou "Non précisé" si vide
    const getValue = (key) => formData[key] && formData[key].trim() !== 'Non précisé' ? formData[key] : 'Non précisé';


    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => {
            console.warn(`Image ${src} non chargée.`);
            resolve(null);
        };
        img.src = src; 
    });

    let logoImg = null;
    try { logoImg = await loadImage('COP.png'); } 
    catch(e){ console.warn('Erreur critique logo COP.png:', e); }

    // --- PAGE 1 ---
    if(logoImg){
        try{
            const wmCanvas = document.createElement('canvas');
            const ctx = wmCanvas.getContext('2d');
            const wmSizePx = 1200;
            wmCanvas.width = wmSizePx; wmCanvas.height = wmSizePx;
            ctx.globalAlpha = 0.07;
            ctx.drawImage(logoImg, 0, 0, wmSizePx, wmSizePx);
            const wmData = wmCanvas.toDataURL('image/png');
            const wmSizeMm = 120;
            pdf.addImage(wmData, 'PNG', (pageWidth - wmSizeMm) / 2, 40, wmSizeMm, wmSizeMm);
        }catch(e){ console.warn('Erreur filigrane pdf:', e); }
    }

    pdf.setFont('helvetica','bold');
    pdf.setFontSize(12);
    pdf.text('Confédération des Petites et Moyennes Entreprises Congolaises', pageWidth/2, 20, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text('COPEMECO', pageWidth/2, 28, { align: 'center' });

    pdf.setFontSize(14);
    pdf.text('FICHE DE RENSEIGNEMENTS POUR ADHESION', pageWidth/2, 40, { align: 'center' });

    pdf.setFontSize(10);
    let y = 50;

    function drawLineField(label, value, xLabel=15, xValue=80){
        pdf.setFontSize(10);
        pdf.setFont('helvetica', (label.endsWith(':') || label.length > 50) ? 'bold' : 'normal');
        pdf.text(label.replace(':', '') + ' :', xLabel, y); 
        
        pdf.setFont('helvetica','normal');
        // Utilise getValue pour gérer "Non précisé"
        const display = getValue(value) || '................................................................................';
        pdf.text(display, xValue, y, { maxWidth: pageWidth - xValue - 10 });
        y += 7;
    }
    
    // Pour les champs non-directs
    drawLineField('Numéro d\'Adhésion (Généré)', 'numero_adhesion', 15, 80);
    y += 3;

    pdf.setFont('helvetica','bold');
    pdf.text('IDENTIFICATION', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Dénomination / Raison sociale', 'denomination');
    drawLineField('N° RCCM', 'rccm');
    drawLineField('N° ID NAT', 'idnat');
    drawLineField('N° Impôt', 'impot');
    drawLineField('Siège Social (Adresse complète)', 'siege');
    drawLineField('Tél', 'tel', 15, 30);
    drawLineField('Email', 'email', 70, 95);
    drawLineField('Nationalité de PME', 'nationalite', 130, 165);
    y -= 14; 
    
    drawLineField('Siège d’exploitation', 'siege_exploitation');
    drawLineField('Province', 'province');
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('SITUATION JURIDIQUE', 15, y);
    y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Forme juridique de la PME', 'forme_juridique');
    drawLineField('Date et année de création', 'date_creation');
    drawLineField('Nombre d’associés', 'nb_associés');
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('ACTIVITES ECONOMIQUES OU COMMERCIALES', 15, y);
    y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Objectif Social', 'objectif_social');
    drawLineField('Activité Principale', 'act_principale');
    drawLineField('Activité Secondaire', 'act_secondaire');
    drawLineField('Produit(s) / Services', 'produits');
    drawLineField('Capital social', 'capital');
    drawLineField('Nombre d’agents', 'nb_agents');
    drawLineField("Chiffre d'affaires mensuel (en $)", 'ca_mensuel');
    drawLineField('Masse salariale payée mensuellement (en $)', 'masse_salariale');
    drawLineField("Volume de l'IPR payé mensuellement (en $)", 'ipr');
    drawLineField("Volume d'Impôts & taxes payés mensuellement (en $)", 'impots');

    pdf.setFontSize(9);
    pdf.text('Adresse : Av. Colonel Ebeya, n°195 Immeuble la référence 3ème étage/ local 311. C. Gombe / Kinshasa', 15, 287);

    // --- PAGE 2 ---
    pdf.addPage();
    y = 20;

    if(logoImg){
        try{
            const wmCanvas2 = document.createElement('canvas');
            const ctx2 = wmCanvas2.getContext('2d');
            const wmSizePx2 = 1200;
            wmCanvas2.width = wmSizePx2; wmCanvas2.height = wmSizePx2;
            ctx2.globalAlpha = 0.07;
            ctx2.drawImage(logoImg, 0, 0, wmSizePx2, wmSizePx2);
            const wmData2 = wmCanvas2.toDataURL('image/png');
            const wmSizeMm2 = 120;
            pdf.addImage(wmData2, 'PNG', (pageWidth - wmSizeMm2) / 2, 40, wmSizeMm2, wmSizeMm2);
        }catch(e){ console.warn('Erreur filigrane p2', e); }
    }

    pdf.setFont('helvetica','bold');
    pdf.setFontSize(12);
    pdf.text('IDENTIFICATION DU RESPONSABLE', pageWidth/2, 18, { align: 'center' });
    y = 28;
    pdf.setFont('helvetica','normal');

    drawLineField('Nom du Propriétaire', 'nom_proprietaire');
    drawLineField('Adresse du Propriétaire', 'adresse_responsable');
    drawLineField('Niveau d’études', 'niveau_etudes');
    drawLineField('Faculté / Domaine d\'études', 'faculte_etudes'); 
    drawLineField('Nom du Gérant', 'nom_gerant');
    drawLineField('Nationalité du Gérant', 'nat_gerant');
    drawLineField('Tél / Email du Gérant', 'contact_gerant');
    drawLineField('Genre du Gérant', 'genre_gerant'); 
    drawLineField('Tranche d\'âge du Gérant', 'tranche_age_gerant'); 
    drawLineField('Nationalité des associés', 'nat_associes');
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('Noms et Adresses de fournisseurs :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const fournisseursText = getValue('fournisseurs') ? String(getValue('fournisseurs')).split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' / ') : 'Non précisé';
    pdf.text(fournisseursText, 15, y, { maxWidth: 180 });
    y += (Math.ceil(pdf.getStringUnitWidth(fournisseursText) * pdf.internal.getFontSize() / pageWidth * 180 / 180) * 5) + 5; 

    pdf.setFont('helvetica','bold');
    pdf.text('Noms et Adresses de clients :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const clientsText = getValue('clients') ? String(getValue('clients')).split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' / ') : 'Non précisé';
    pdf.text(clientsText, 15, y, { maxWidth: 180 });
    y += (Math.ceil(pdf.getStringUnitWidth(clientsText) * pdf.internal.getFontSize() / pageWidth * 180 / 180) * 5) + 5;

    drawLineField('Avez-vous une comptabilité', 'comptabilite');
    drawLineField('Si oui, est-elle régulièrement tenue', 'compta_reguliere');
    drawLineField('Date de la dernière déclaration du bilan', 'date_declaration');
    drawLineField('Exercice concerné', 'exercice');

    y += 8;
    pdf.setFont('helvetica','bold');
    pdf.text('Qu’est-ce que la PME attend de la COPEMECO ?', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const attentesText = getValue('attentes') ? String(getValue('attentes')) : 'Non précisé';
    pdf.text(attentesText, 15, y, { maxWidth: 180 });

    const sigY = 240;
    pdf.setFontSize(11);

    pdf.text('Pour la PME', 20, sigY - 5);
    pdf.line(20, sigY, 90, sigY);
    pdf.text('Nom et Qualité', 20, sigY + 5);
    pdf.line(20, sigY + 15, 90, sigY + 15);

    pdf.text('Pour la COPEMECO', 120, sigY - 5);
    pdf.line(120, sigY, 195, sigY);
    pdf.text('Nom et Qualité', 120, sigY + 5);
    pdf.line(120, sigY + 15, 195, sigY + 15);

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth()+1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    pdf.text(`Fait à Kinshasa le ${dateStr}`, 15, 275);

    if(typeof QRious !== 'undefined'){
        const qrCanvas = document.createElement('canvas');
        new QRious({ element: qrCanvas, value: formData.numero_adhesion || 'ADHESION_COPEMECO', size: 200 });
        const qrData = qrCanvas.toDataURL('image/png');
        pdf.addImage(qrData, 'PNG', 160, 260, 30, 30);
    } else {
        console.warn("La librairie QRious n'est pas chargée.");
    }

    return pdf.output('blob');
}

// ----------------------------------------------
// Gestionnaire de Soumission (Submit)
// ----------------------------------------------
submitBtn.addEventListener('click', async (event) => {
    // 🔥 CORRECTION : Empêche l'action par défaut (rechargement) en premier
    event.preventDefault(); 
    vibrate();

    // Permet au navigateur de gérer la validation HTML5 native (champs required)
    if (!document.querySelector('.a4').checkValidity()) {
        // Le navigateur a affiché l'erreur et on a empêché le rechargement. On sort.
        return; 
    }

    if (typeof Backendless === 'undefined' || !Backendless.initApp) {
        alert("Erreur: Le SDK Backendless n'est pas disponible. Vérifiez la connexion et l'index.html.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enregistrement...";

    try {
        // Collecte les données
        const formData = collectFormData();
        
        // --- 1. ENREGISTREMENT DANS BACKENDLESS ---
        await Backendless.Data.of(TABLE).save(formData);

        // --- 2. GÉNÉRATION DU PDF ---
        const pdfBlob = await generatePDFExact(formData);
        
        // --- 3. CRÉATION DU LIEN DE TÉLÉCHARGEMENT ---
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfFileName = `ADHESION_${formData.denomination.replace(/\s/g, '_')}_${formData.numero_adhesion}.pdf`;

        // Création du message de succès et du bouton de téléchargement
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
            <h3 style="color: green;">✅ Succès de l'enregistrement !</h3>
            <p>Vos informations ont été enregistrées sous le numéro: <strong>${formData.numero_adhesion}</strong>.</p>
            <p>Veuillez télécharger votre fiche d'adhésion :</p>
            <a id="downloadLink" href="${pdfUrl}" download="${pdfFileName}" style="
                padding: 10px 20px; 
                background-color: #007BFF; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block; 
                margin-top: 10px;
                font-weight: bold;
            ">Télécharger la Fiche PDF</a>
            <button id="newFormBtn" type="button" style="
                padding: 10px 20px;
                background-color: #6c757d;
                color: white;
                border-radius: 5px;
                margin-left: 10px;
                font-weight: bold;
                border: none;
                cursor: pointer;
            ">Nouveau Formulaire</button>
        `;
        
        // Remplacement du bouton Soumettre par le message de succès et le lien
        formActions.innerHTML = '';
        formActions.appendChild(successMessage);
        
        // Nettoyage des champs du formulaire après succès
        document.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
        
        // Gestion de la révocation de l'URL Blob
        const dlLink = document.getElementById('downloadLink');
        if(dlLink) {
            dlLink.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 100); 
            });
        }

        // Ajout d'un bouton pour recommencer le formulaire
        document.getElementById('newFormBtn').addEventListener('click', () => {
             location.reload(); // Recharger simplement la page pour un nouveau formulaire propre
        });


    } catch (error) {
        console.error("Erreur lors de l'enregistrement ou de la génération PDF :", error);
        alert(`Erreur lors de l'enregistrement. Veuillez réessayer. Détail : ${error.message || error}`);
        
        // Restaure les boutons en cas d'erreur
        formActions.innerHTML = '';
        formActions.appendChild(submitBtn);
        formActions.appendChild(resetBtn);
        submitBtn.disabled = false;
        submitBtn.textContent = "Soumettre";
    }

    // Le bouton est désactivé seulement après le bloc try/catch initial
    // pour éviter de le laisser dans un état désactivé après une erreur non bloquante.
    // Il est préférable de le laisser désactivé jusqu'à la fin du bloc try/catch.
    // Le code suivant est redondant car géré dans le catch/success
    // submitBtn.disabled = false;
    // submitBtn.textContent = "Soumettre";
});

// ----------------------------------------------
// Bouton Réinitialiser
// ----------------------------------------------
resetBtn.addEventListener('click', () => {
    vibrate();
    document.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
});
