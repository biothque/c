const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; 
Backendless.serverURL = "https://api.backendless.com";
Backendless.initApp(APP_ID, API_KEY);

document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = "Envoi en cours...";

    const form = document.getElementById('ongForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Génération d'un ID unique
    data.ref_id = "OG-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    try {
        // 1. Sauvegarde dans Backendless (Table 'og')
        const savedObject = await Backendless.Data.of("og").save(data);
        
        // 2. Génération du PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("FICHE D'IDENTIFICATION OG", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Référence: ${data.ref_id}`, 20, 40);
        doc.text(`Organisation: ${data.nom}`, 20, 50);
        doc.text(`Dirigeant: ${data.nom_dirigeant}`, 20, 60);
        
        // QR Code
        const qrCanvas = document.createElement('canvas');
        new QRious({ element: qrCanvas, value: data.ref_id, size: 100 });
        doc.addImage(qrCanvas.toDataURL(), 'PNG', 150, 30, 40, 40);

        // 3. Upload du PDF
        const pdfBlob = doc.output('blob');
        const upload = await Backendless.Files.upload(pdfBlob, `fiches_og/${data.ref_id}.pdf`, true);
        
        // Mise à jour avec le lien PDF
        savedObject.lien_pdf = upload.fileURL;
        await Backendless.Data.of("og").save(savedObject);

        alert("Succès ! Formulaire enregistré.");
        window.open(upload.fileURL, '_blank');
        location.reload();

    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'enregistrement.");
        btn.disabled = false;
        btn.textContent = "Réessayer";
    }
});
