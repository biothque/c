const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; 
Backendless.serverURL = "https://api.backendless.com";
Backendless.initApp(APP_ID, API_KEY);

const { jsPDF } = window.jspdf;

async function generatePDFExact(formData) {
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

    // --- EN-TÊTE PROFESSIONNEL (Copie du document source) ---
    if (logoImg) {
        pdf.addImage(logoImg, 'PNG', 15, 12, 25, 25); [span_2](start_span)// Logo à gauche[span_2](end_span)
    }

    pdf.setTextColor(0, 86, 179); // Bleu
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('COPEMECO', 50, 20); [span_3](start_span)//[span_3](end_span)

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.text('Confédération des Petites et Moyennes', 50, 26); [span_4](start_span)//[span_4](end_span)
    pdf.text('Entreprises Congolaises', 50, 31);

    pdf.setLineWidth(0.5);
    pdf.line(15, 40, 195, 40); // Ligne de séparation

    // Titre
    pdf.setFontSize(14);
    pdf.text('FICHE DE RENSEIGNEMENTS POUR ADHESION', pageWidth / 2, 50, { align: 'center' }); [span_5](start_span)//[span_5](end_span)

    // --- CONTENU DES CHAMPS ---
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let y = 65;

    const drawField = (label, value) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label + " :", 20, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(value || "...................."), 80, y);
        y += 8;
    };

    drawField("Dénomination", formData.denomination);
    drawField("RCCM", formData.rccm);
    drawField("ID NAT", formData.idnat);
    drawField("Siège Social", formData.siege);
    drawField("Téléphone", formData.tel);
    drawField("Province", formData.province);

    // QR Code en bas
    const qrCanvas = document.createElement('canvas');
    new QRious({ element: qrCanvas, value: formData.numero_adhesion, size: 200 });
    pdf.addImage(qrCanvas.toDataURL(), 'PNG', 165, 250, 30, 30);

    [span_6](start_span)// Footer type officiel[span_6](end_span)
    pdf.setFontSize(8);
    pdf.text('Adresse : Av. Colonel Ebeya, n°195 Immeuble la référence 3ème étage. Gombe / Kinshasa', pageWidth / 2, 285, { align: 'center' });

    return pdf.output('blob');
}

// Gestionnaire de soumission
document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = "Traitement...";

    const form = document.getElementById('formAdhesion');
    const formData = Object.fromEntries(new FormData(form).entries());
    formData.numero_adhesion = "ADH-" + Date.now().toString().slice(-6);

    try {
        const pdfBlob = await generatePDFExact(formData);
        const upload = await Backendless.Files.upload(pdfBlob, `fiches/${formData.numero_adhesion}.pdf`, true);
        
        formData.lien_pdf = upload.fileURL;
        await Backendless.Data.of("adhesions").save(formData);

        alert("Enregistrement réussi !");
        window.open(upload.fileURL, '_blank'); // Ouvre le PDF avec l'en-tête officiel
    } catch (e) {
        console.error(e);
        alert("Erreur lors de l'envoi.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Soumettre et Générer PDF";
    }
});
