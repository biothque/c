const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; 
const TABLE = "og"; // Table ciblée : og

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
    return `ONG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`;
}

function collectFormData() {
    const data = {};
    const elements = document.querySelectorAll('input, textarea, select');
    elements.forEach(el => {
        if (el.name) {
            data[el.name] = el.value.trim() === '' ? 'Non précisé' : el.value.trim();
        }
    });
    data.createdAt = new Date().toISOString();
    data.numero_enregistrement = generateMembershipNumber();
    return data;
}

const { jsPDF } = window.jspdf;

async function generatePDFExact(formData){
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    let y = 50;

    // Helper function for labels/values
    const drawLine = (label, valueKey, xVal = 80) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label + " :", 15, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(formData[valueKey] || '...'), xVal, y);
        y += 8;
    };

    // --- Header & Layout (Repris du script original) ---
    pdf.setFontSize(12);
    pdf.text('Confédération des Petites et Moyennes Entreprises Congolaises', pageWidth/2, 20, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text('COPEMECO', pageWidth/2, 28, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('FICHE D\'IDENTIFICATION ORGANISATION (OG)', pageWidth/2, 40, { align: 'center' });

    pdf.setFontSize(10);
    drawLine('N° Enregistrement', 'numero_enregistrement');
    y += 4;
    pdf.setFont('helvetica', 'bold'); pdf.text("1. IDENTIFICATION", 15, y); y += 8;
    drawLine('Nom ONG', 'nom');
    drawLine('Forme Juridique', 'forme_juridique');
    drawLine('Date Création', 'date_creation');
    drawLine('Siège Social', 'siege_social');
    drawLine('Province', 'province');
    drawLine('Doc. Juridique', 'document_juridique');

    y += 4;
    pdf.setFont('helvetica', 'bold'); pdf.text("2. ACTIVITÉS", 15, y); y += 8;
    drawLine('Nb Personnes', 'nb_personnes');
    drawLine('Activité Principale', 'activite_principale');
    pdf.text("Autres sites :", 15, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(formData.autres_sites), 15, y + 5, { maxWidth: 180 });
    y += 15;

    y += 4;
    pdf.setFont('helvetica', 'bold'); pdf.text("3. DIRIGEANT", 15, y); y += 8;
    drawLine('Nom Dirigeant', 'nom_dirigeant');
    drawLine('Genre / Âge', 'genre', 40); 
    pdf.text("/ " + formData.tranche_age, 70, y - 8);
    drawLine('Email', 'email');
    drawLine('Téléphone', 'telephone');

    // Signatures
    const sigY = 240;
    pdf.text('Pour l\'Organisation', 20, sigY);
    pdf.text('Pour la COPEMECO', 120, sigY);
    pdf.text('BUKASA K. RUBENS (Coord. Nat.)', 120, sigY + 15);

    // QR Code
    if(typeof QRious !== 'undefined'){
        const qrCanvas = document.createElement('canvas');
        new QRious({ element: qrCanvas, value: formData.numero_enregistrement, size: 200 });
        pdf.addImage(qrCanvas.toDataURL('image/png'), 'PNG', 160, 255, 30, 30);
    }

    return pdf.output('blob');
}

submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Traitement...";

    try {
        const formData = collectFormData();
        const pdfBlob = await generatePDFExact(formData);
        const fileName = `OG_${formData.nom.replace(/\s+/g, '_')}.pdf`;
        
        // Upload PDF
        const upload = await Backendless.Files.upload(pdfBlob, 'fiches_og/' + fileName, true);
        formData.lien_telechargement_pdf = upload.fileURL;

        // Save to Table 'og'
        await Backendless.Data.of(TABLE).save(formData);

        formActions.innerHTML = `
            <div style="color:green; font-weight:bold">✅ Enregistré ! Numéro : ${formData.numero_enregistrement}</div>
            <a href="${upload.fileURL}" target="_blank" style="padding:10px; background:blue; color:white; text-decoration:none; border-radius:5px">Télécharger le PDF</a>
            <button onclick="location.reload()">Nouveau</button>
        `;
    } catch (err) {
        alert("Erreur : " + err.message);
        submitBtn.disabled = false;
    }
});
