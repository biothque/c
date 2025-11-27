// ==============================================
// Backendless configuration
// ==============================================
// ** IMPORTANT : Remplacez les valeurs par vos clés API et App ID ! **
const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; // JavaScript API Key
const TABLE = "adhesions";

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

// Fonction pour collecter TOUTES les données du formulaire
function collectFormData() {
    const data = {};
    const elements = document.querySelectorAll('input, textarea, select');

    elements.forEach(el => {
        if (el.name) data[el.name] = el.value.trim();
    });

    // Ajouter les métadonnées
    data.createdAt = new Date().toISOString();
    // Génère le numéro d'adhésion seulement s'il n'existe pas déjà (pour un éventuel test de mise à jour)
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
// (Code inchangé pour la génération du PDF)
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
    pdf.text('FICHE DE RENSEIGNEMENTS POUR ADHESION', pageWidth/2, 40, { align: 'center' });

    pdf.setFontSize(10);
    let y = 50;

    function drawLineField(label, value, xLabel=15, xValue=80){
        pdf.setFontSize(10);
        pdf.setFont('helvetica', (label.endsWith(':') || label.length > 50) ? 'bold' : 'normal');
        pdf.text(label.replace(':', '') + ' :', xLabel, y); 
        
        pdf.setFont('helvetica','normal');
        const display = (value && String(value).trim() !== '') ? String(value) : '................................................................................';
        pdf.text(display, xValue, y);
        y += 7;
    }

    drawLineField('Numéro d\'Adhésion (Généré)', formData.numero_adhesion, 15, 80);
    y += 3;

    pdf.setFont('helvetica','bold');
    pdf.text('IDENTIFICATION', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Dénomination / Raison sociale', formData.denomination);
    drawLineField('N° RCCM', formData.rccm);
    drawLineField('N° ID NAT', formData.idnat);
    drawLineField('N° Impôt', formData.impot);
    drawLineField('Siège Social (Adresse complète)', formData.siege);
    drawLineField('Tél', formData.tel, 15, 30);
    drawLineField('Email', formData.email, 70, 95);
    drawLineField('Nationalité de PME', formData.nationalite, 130, 165);
    y -= 14; 
    
    drawLineField('Siège d’exploitation', formData.siege_exploitation);
    drawLineField('Province', formData.province);
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('SITUATION JURIDIQUE', 15, y);
    y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Forme juridique de la PME', formData.forme_juridique);
    drawLineField('Date et année de création', formData.date_creation);
    drawLineField('Nombre d’associés', formData.nb_associés);
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('ACTIVITES ECONOMIQUES OU COMMERCIALES', 15, y);
    y += 6;
    pdf.setFont('helvetica','normal');
    drawLineField('Objectif Social', formData.objectif_social);
    drawLineField('Activité Principale', formData.act_principale);
    drawLineField('Activité Secondaire', formData.act_secondaire);
    drawLineField('Produit(s) / Services', formData.produits);
    drawLineField('Capital social', formData.capital);
    drawLineField('Nombre d’agents', formData.nb_agents);
    drawLineField("Chiffre d'affaires mensuel (en $)", formData.ca_mensuel);
    drawLineField('Masse salariale payée mensuellement (en $)', formData.masse_salariale);
    drawLineField("Volume de l'IPR payé mensuellement (en $)", formData.ipr);
    drawLineField("Volume d'Impôts & taxes payés mensuellement (en $)", formData.impots);

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

    drawLineField('Nom du Propriétaire', formData.nom_proprietaire);
    drawLineField('Adresse', formData.adresse_responsable);
    drawLineField('Niveau d’études', formData.niveau_etudes);
    drawLineField('Nom du Gérant', formData.nom_gerant);
    drawLineField('Nationalité du Gérant', formData.nat_gerant);
    drawLineField('Tél / Email', formData.contact_gerant);
    drawLineField('Genre', formData.genre);
    drawLineField('Nationalité des associés', formData.nat_associes);
    y += 4;

    pdf.setFont('helvetica','bold');
    pdf.text('Noms et Adresses de fournisseurs :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const fournisseursText = formData.fournisseurs ? String(formData.fournisseurs).split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' / ') : '1. ................................  2. ................................  3. ................................';
    pdf.text(fournisseursText, 15, y, { maxWidth: 180 });
    y += (Math.ceil(pdf.getStringUnitWidth(fournisseursText) * pdf.internal.getFontSize() / pageWidth * 180 / 180) * 5) + 5; 

    pdf.setFont('helvetica','bold');
    pdf.text('Noms et Adresses de clients :', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const clientsText = formData.clients ? String(formData.clients).split('\n').map(l => l.trim()).filter(l => l.length > 0).join(' / ') : '1. ................................  2. ................................  3. ................................';
    pdf.text(clientsText, 15, y, { maxWidth: 180 });
    y += (Math.ceil(pdf.getStringUnitWidth(clientsText) * pdf.internal.getFontSize() / pageWidth * 180 / 180) * 5) + 5;

    drawLineField('Avez-vous une comptabilité', formData.comptabilite);
    drawLineField('Si oui, est-elle régulièrement tenue', formData.compta_reguliere);
    drawLineField('Date de la dernière déclaration du bilan', formData.date_declaration);
    drawLineField('Exercice', formData.exercice);

    y += 8;
    pdf.setFont('helvetica','bold');
    pdf.text('Qu’est-ce que la PME attend de la COPEMECO ?', 15, y); y += 6;
    pdf.setFont('helvetica','normal');
    const attentesText = formData.attentes ? String(formData.attentes) : '........................................................................................';
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
    event.preventDefault(); 
    vibrate();

    if (typeof Backendless === 'undefined' || !Backendless.initApp) {
        alert("Erreur: Le SDK Backendless n'est pas disponible. Vérifiez la connexion et l'index.html.");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enregistrement...";

    try {
        const formData = collectFormData();
        
        // --- 1. ENREGISTREMENT DANS BACKENDLESS ---
        // On enregistre les données d'abord
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
        `;
        
        // Remplacement du bouton Soumettre par le message de succès et le lien
        formActions.innerHTML = '';
        formActions.appendChild(successMessage);
        
        // Nettoyage des champs du formulaire après succès (sauf si on veut laisser les données)
        document.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
        
        // L'URL Blob doit être révoquée (libérée) une fois le téléchargement terminé pour éviter les fuites de mémoire.
        // On utilise un timeout ou un événement (moins fiable)
        setTimeout(() => {
             // On s'assure que le lien est bien créé avant de le lier à l'événement
             const dlLink = document.getElementById('downloadLink');
             if(dlLink) {
                 dlLink.addEventListener('click', () => {
                     // Petite pause avant de révoquer l'URL pour laisser le navigateur initier le téléchargement
                     setTimeout(() => URL.revokeObjectURL(pdfUrl), 100); 
                 });
             }
        }, 500);


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