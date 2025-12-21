// ==============================================
// Backendless configuration
// ==============================================
// ** IMPORTANT : Vos informations conservées ! **
const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7";
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; // JavaScript API Key
const TABLE = "futur_entrepreneur"; // NOM DE TABLE

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

// Fonction pour générer un numéro d’inscription unique
function generateMembershipNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
    return `ENTREPRENEUR-${year}${month}${day}-${random}`;
}

// Fonction pour collecter TOUTES les données du formulaire
function collectFormData() {
    const data = {};
    const elements = document.querySelectorAll('input, textarea, select');

    elements.forEach(el => {
        if (el.name) {
             let value = el.value.trim();
             if (el.tagName === 'SELECT' && value === "--Choisir--") {
                 data[el.name] = "";
             } else {
                 data[el.name] = value;
             }
        }
    });

    // Ajouter les métadonnées
    data.createdAt = new Date().toISOString();
    // Génère le numéro d'inscription seulement s'il n'existe pas déjà
    data.numero_inscription = data.numero_inscription || generateMembershipNumber();
    
    // Remplacer les champs qui sont **encore vides** (après collecte) par "Non précisé"
    const fieldsToSanitizeForPDF = [
        'noms_entrepreneur', 'adresse_entrepreneur', 'telephone', 'genre', 'tranche_age',
        'secteur_domaine', 'type_entreprise', 'description_projet', 'objectifs_projet',
        'besoin_financement', 'montant_investissement', 'lieu_implantation', 'motivation_implantation',
        'province_origine', 'produits_precises', 'nb_employes_envisages', 
        'duree_financement', 'formation_academique', 'experience_pro', 
        'motivation_personnelle', 'ressources_reseau', 'autres_commentaires'
    ];

    fieldsToSanitizeForPDF.forEach(fieldName => {
        if (!data[fieldName] || String(data[fieldName]).trim() === "") {
            data[fieldName] = "Non précisé";
        }
    });


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
    pdf.text('FICHE D\'INSCRIPTION FUTUR ENTREPRENEUR', pageWidth/2, 40, { align: 'center' });

    pdf.setFontSize(10);
    let y = 50;

    function drawLineField(label, value, xLabel=15, xValue=90){ // xValue ajusté pour plus de place
        pdf.setFontSize(10);
        pdf.setFont('helvetica', (label.endsWith(':') || label.length > 50) ? 'bold' : 'normal');
        pdf.text(label.replace(':', '') + ' :', xLabel, y);

        pdf.setFont('helvetica','normal');
        // Le champ est déjà 'Non précisé' si vide grâce à collectFormData
        const display = value || '................................................................................';
        pdf.text(display, xValue, y, { maxWidth: pageWidth - xValue - 10 });
        y += 7;
    }

    // Numéro d'Inscription
    drawLineField('Numéro d\'Inscription (Généré)', formData.numero_inscription, 15, 90);
    y += 3;

    // SECTION 1: IDENTIFICATION DE L'ENTREPRENEUR
    pdf.setFont('helvetica','bold');
    pdf.text('1. IDENTIFICATION DE L\'ENTREPRENEUR', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('NOMS complets', formData.noms_entrepreneur);
    drawLineField('Adresse (Quartier, Avenue n°/Commune)', formData.adresse_entrepreneur);
    drawLineField('Téléphone', formData.telephone);
    drawLineField('Genre', formData.genre);
    drawLineField('Tranche d\'âge', formData.tranche_age);
    drawLineField('Origine de la Province', formData.province_origine);
    y += 4;

    // SECTION 2: INFORMATION DE VOTRE PROJET
    pdf.setFont('helvetica','bold');
    pdf.text('2. INFORMATION DE VOTRE PROJET', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Secteur ou domaine d\'activité', formData.secteur_domaine);
    drawLineField('Veuillez préciser les produits', formData.produits_precises); 
    drawLineField('Type d\'entreprise (Forme juridique OHADA)', formData.type_entreprise);


    pdf.setFont('helvetica','bold');
    pdf.text('Description du projet :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.description_projet || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    pdf.setFont('helvetica','bold');
    pdf.text('Objectifs (Court et Long terme) :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.objectifs_projet || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    drawLineField('Besoin de financement', formData.besoin_financement);
    drawLineField('Montant d\'investissement initial prévu (en $)', formData.montant_investissement);
    drawLineField('Nombre d\'employés envisagés (hors créateur)', formData.nb_employes_envisages);
    drawLineField('Durée escomptée pour le financement (si Oui)', formData.duree_financement);

    // Ajustement pour le bas de page
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('Lieu d\'implantation du projet :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.lieu_implantation || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 12; // Espace pour 2 lignes

    pdf.setFont('helvetica','bold');
    pdf.text('Motivation d\'implantation (Pourquoi ce lieu ?) :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.motivation_implantation || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 12; // Espace pour 2 lignes


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
    pdf.text('3. INFORMATION COMPLÉMENTAIRE SUR LE CRÉATEUR', pageWidth/2, 18, { align: 'center' });
    y = 28;
    pdf.setFont('helvetica','normal');

    // SECTION 3: INFORMATION COMPLÉMENTAIRE SUR LE CRÉATEUR
    drawLineField('Formation académique (Ex: Licencié en Droit, Bac en Commerciale)', formData.formation_academique);
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('Expérience professionnelle (Postes occupés, durée, secteur) :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.experience_pro || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    pdf.setFont('helvetica','bold');
    pdf.text('Motivation ou vision personnelle : Pourquoi souhaitez-vous créer cette entreprise ? :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.motivation_personnelle || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    pdf.setFont('helvetica','bold');
    pdf.text('Ressources personnelles ou réseau (Atouts, compétences, contacts clés) :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.ressources_reseau || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    pdf.setFont('helvetica','bold');
    pdf.text('Autres commentaires ou informations pertinents :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    pdf.text(formData.autres_commentaires || 'Non précisé', 15, y, { maxWidth: 180 });
    y += 18; // Espace pour 3 lignes

    const sigY = 240;
    pdf.setFontSize(11);

    pdf.text('Pour l\'Entrepreneur', 20, sigY - 5);
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
        new QRious({ element: qrCanvas, value: formData.numero_inscription || 'INSCRIPTION_ENTREPRENEUR', size: 200 });
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
    event.preventDefault();
    vibrate();

    if (typeof Backendless === 'undefined' || !Backendless.initApp) {
        alert("Erreur: Le SDK Backendless n'est pas disponible. Vérifiez la connexion et l'index.html.");
        return;
    }

    // 1. Collecte des données pour l'enregistrement (formData contiendra "Non précisé" pour les champs vides)
    const formData = collectFormData(); 

    submitBtn.disabled = true;
    submitBtn.textContent = "Génération PDF...";

    try {
        // 2. GÉNÉRATION DU PDF (Blob)
        const pdfBlob = await generatePDFExact(formData);
        
        // Construction du nom du fichier
        const baseName = formData.noms_entrepreneur && formData.noms_entrepreneur !== "Non précisé" ? formData.noms_entrepreneur : 'Futur_Entrepreneur';
        const safeName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const pdfFileName = `INSCRIPTION_${safeName}_${formData.numero_inscription}.pdf`;
        
        // 3. UPLOAD DU PDF VERS BACKENDLESS FILE STORAGE
        submitBtn.textContent = "Téléchargement du fichier...";
        const uploadResult = await Backendless.Files.upload(pdfBlob, 'fiches_entrepreneurs/' + pdfFileName, true);

        // La propriété fileURL contient le lien permanent pour le téléchargement
        const permanentFileUrl = uploadResult.fileURL;
        
        // 4. MISE À JOUR DE L'OBJET AVEC L'URL PERMANENTE
        // On crée un objet de données propre pour la DB (en retirant les valeurs "Non précisé" si on veut des champs vides dans la DB)
        // Mais pour la simplicité, nous allons ajouter le champ à l'objet existant.
        formData.lien_telechargement_pdf = permanentFileUrl;

        // 5. ENREGISTREMENT FINAL DANS BACKENDLESS (avec l'URL du PDF)
        submitBtn.textContent = "Enregistrement final...";
        await Backendless.Data.of(TABLE).save(formData);

        // 6. CRÉATION DU LIEN DE TÉLÉCHARGEMENT POUR L'UTILISATEUR (utilise le lien permanent)
        
        // Création du message de succès et du bouton de téléchargement
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
            <h3 style="color: green;">✅ Succès de l'enregistrement !</h3>
            <p>Vos informations ont été enregistrées sous le numéro: <strong>${formData.numero_inscription}</strong>.</p>
            <p>Le lien permanent pour vous et la COPEMECO est: <strong>${permanentFileUrl}</strong></p>
            <p>Veuillez télécharger votre fiche d'inscription :</p>
            <a id="downloadLink" href="${permanentFileUrl}" download="${pdfFileName}" style="
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
        
        // Ajout d'un bouton pour recommencer le formulaire
        document.getElementById('newFormBtn').addEventListener('click', () => {
             location.reload(); 
        });


    } catch (error) {
        console.error("Erreur lors de l'enregistrement ou de la génération/upload PDF :", error);
        alert(`❌ Erreur critique. Veuillez vérifier Backendless File Storage et réessayer. Détail : ${error.message || error}`);

        // Restaure les boutons en cas d'erreur
        formActions.innerHTML = '';
        formActions.appendChild(submitBtn);
        formActions.appendChild(resetBtn);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Soumettre";
});

// ----------------------------------------------
// Bouton Réinitialiser
// ----------------------------------------------
resetBtn.addEventListener('click', () => {
    vibrate();
    document.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
});
