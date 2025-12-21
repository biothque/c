const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; 
Backendless.serverURL = "https://api.backendless.com";
Backendless.initApp(APP_ID, API_KEY);

document.getElementById('submitBtn').addEventListener('click', async () => {
    const btn = document.getElementById('submitBtn');
    const resultArea = document.getElementById('resultArea');
    
    btn.disabled = true;
    btn.textContent = "Génération du fichier en cours...";

    const form = document.getElementById('ongForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Numéro d'enregistrement unique pour le QR Code
    const ref_id = "ONG-" + Date.now().toString().slice(-6);
    data.numero_enregistrement = ref_id;

    try {
        // 1. Génération du PDF avec QR Code en mémoire
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text("FICHE D'IDENTIFICATION ONG", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Réf: ${ref_id}`, 20, 35);
        doc.text(`Organisation: ${data.nom}`, 20, 45);
        doc.text(`Dirigeant: ${data.nom_dirigeant}`, 20, 55);
        doc.text(`Province: ${data.province}`, 20, 65);

        // QR Code
        const qrCanvas = document.createElement('canvas');
        new QRious({ element: qrCanvas, value: ref_id, size: 150 });
        doc.addImage(qrCanvas.toDataURL(), 'PNG', 150, 30, 40, 40);

        // 2. Upload vers Backendless
        const pdfBlob = doc.output('blob');
        const upload = await Backendless.Files.upload(pdfBlob, `fiches_og/${ref_id}.pdf`, true);
        
        data.lien_pdf = upload.fileURL;

        // 3. Sauvegarde dans la table 'og'
        await Backendless.Data.of("og").save(data);

        // 4. AFFICHAGE DU LIEN DE TELECHARGEMENT AU BAS
        resultArea.innerHTML = `
            <div class="download-box">
                <p>✅ Enregistrement réussi !</p>
                <a href="${upload.fileURL}" target="_blank" class="download-link">
                   📥 CLIQUEZ ICI POUR TÉLÉCHARGER VOTRE PDF (AVEC QR CODE)
                </a>
                <button onclick="location.reload()" class="btn-new">Faire un nouvel envoi</button>
            </div>
        `;
        
        btn.style.display = "none"; // On cache le bouton d'envoi initial
        
        // Scroll automatique vers le lien
        resultArea.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
        btn.disabled = false;
        btn.textContent = "Réessayer l'envoi";
    }
});
