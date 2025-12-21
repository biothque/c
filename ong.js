const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7";
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4";
const TABLE = "og";

if (typeof Backendless !== 'undefined') {
    Backendless.serverURL = "https://api.backendless.com";
    Backendless.initApp(APP_ID, API_KEY);
}

const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const formActions = document.querySelector('.form-actions');

function generateMembershipNumber() {
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
}

function collectFormData() {
    const data = {};
    const elements = document.querySelectorAll('input, textarea, select');
    elements.forEach(el => {
        if (el.name) {
             let value = el.value.trim();
             data[el.name] = (value === "" || value === "--Choisir--") ? "" : value;
        }
    });

    data.createdAt = new Date().toISOString();
    data.numero_inscription = data.numero_inscription || generateMembershipNumber();
    
    // Champs mis à jour pour le "Non précisé"
    const fields = [
        'nom_org', 'siege_social', 'date_creation', 'province_org', 'docs_juridiques',
        'activite_principale', 'activite_secondaire', 'nb_membres', 'noms_dirigeant',
        'genre', 'tranche_age', 'email_dirigeant', 'tel_dirigeant', 'forfait_adhesion'
    ];

    fields.forEach(f => { if (!data[f]) data[f] = "Non précisé"; });
    return data;
}

function vibrate() { if (navigator.vibrate) navigator.vibrate(100); }

const { jsPDF } = window.jspdf;

async function generatePDFExact(formData){
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;

    const loadImage = (src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });

    let logoImg = await loadImage('COP.png');

    // FILIGRANE (Gardé de ton script)
    if(logoImg){
        const wmCanvas = document.createElement('canvas');
        const ctx = wmCanvas.getContext('2d');
        wmCanvas.width = 1200; wmCanvas.height = 1200;
        ctx.globalAlpha = 0.07;
        ctx.drawImage(logoImg, 0, 0, 1200, 1200);
        pdf.addImage(wmCanvas.toDataURL('image/png'), 'PNG', 45, 40, 120, 120);
    }

    pdf.setFont('helvetica','bold').setFontSize(12);
    pdf.text('Confédération des Petites et Moyennes Entreprises Congolaises', pageWidth/2, 20, { align: 'center' });
    pdf.setFontSize(18).text('COPEMECO', pageWidth/2, 28, { align: 'center' });
    pdf.setFontSize(14).text('FICHE D\'INSCRIPTION ORGANISATION', pageWidth/2, 40, { align: 'center' });

    let y = 50;
    const drawLineField = (label, value) => {
        pdf.setFontSize(10).setFont('helvetica', 'bold');
        pdf.text(label + ' :', 15, y);
        pdf.setFont('helvetica','normal');
        pdf.text(String(value), 85, y, { maxWidth: 110 });
        y += 7;
    };

    // SECTION 1
    pdf.setFont('helvetica','bold').text('1. IDENTIFICATION DE L\'ORGANISATION', 15, y); y += 6;
    drawLineField('Nom Org.', formData.nom_org);
    drawLineField('Siège Social', formData.siege_social);
    drawLineField('Date Création', formData.date_creation);
    drawLineField('Province', formData.province_org);
    drawLineField('Docs Juridiques', formData.docs_juridiques);
    y += 5;

    // SECTION 2
    pdf.setFont('helvetica','bold').text('2. IDENTIFICATION DES ACTIVITÉS', 15, y); y += 6;
    drawLineField('Activité Principale', formData.activite_principale);
    drawLineField('Activité Secondaire', formData.activite_secondaire);
    drawLineField('Nombre membres', formData.nb_membres);
    y += 10;

    // PAGE 2 (Gardé de ton script)
    pdf.addPage();
    y = 20;
    pdf.setFont('helvetica','bold').text('3. IDENTIFICATION DU DIRIGEANT', 15, y); y += 10;
    drawLineField('Nom Dirigeant', formData.noms_dirigeant);
    drawLineField('Genre / Age', `${formData.genre} / ${formData.tranche_age}`);
    drawLineField('Email', formData.email_dirigeant);
    drawLineField('Téléphone', formData.tel_dirigeant);
    y += 10;

    pdf.setFont('helvetica','bold').text('4. INFOS COMPLÉMENTAIRES', 15, y); y += 10;
    drawLineField('Forfait Adhésion', formData.forfait_adhesion);

    // SIGNATURES & QR CODE (Gardé de ton script)
    y = 240;
    pdf.text('Pour l\'Organisation', 20, y); pdf.line(20, y+2, 80, y+2);
    pdf.text('Pour la COPEMECO', 120, y); pdf.line(120, y+2, 180, y+2);

    if(typeof QRious !== 'undefined'){
        const qrCanvas = document.createElement('canvas');
        new QRious({ element: qrCanvas, value: formData.numero_inscription, size: 200 });
        pdf.addImage(qrCanvas.toDataURL('image/png'), 'PNG', 160, 260, 30, 30);
    }

    return pdf.output('blob');
}

// GESTIONNAIRE SUBMIT (Logique Backendless 100% conservée)
submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    vibrate();
    const formData = collectFormData();
    submitBtn.disabled = true;
    submitBtn.textContent = "Génération PDF...";

    try {
        const pdfBlob = await generatePDFExact(formData);
        const pdfFileName = `INSCRIPTION_ORG_${formData.numero_inscription}.pdf`;
        
        submitBtn.textContent = "Upload...";
        const uploadResult = await Backendless.Files.upload(pdfBlob, 'fiches_organisations/' + pdfFileName, true);
        
        formData.lien_telechargement_pdf = uploadResult.fileURL;
        await Backendless.Data.of(TABLE).save(formData);

        formActions.innerHTML = `<h3 style="color:green">✅ Enregistré ! Numéro : ${formData.numero_inscription}</h3>
        <a href="${uploadResult.fileURL}" target="_blank" style="padding:10px; background:blue; color:white; text-decoration:none; border-radius:5px">Télécharger PDF</a>`;
    } catch (error) {
        alert("Erreur: " + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = "Soumettre";
    }
});

resetBtn.addEventListener('click', () => {
    vibrate();
    document.querySelectorAll('input, textarea, select').forEach(el => el.value = "");
});
