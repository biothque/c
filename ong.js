const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7"; 
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4"; 
Backendless.serverURL = "https://api.backendless.com";
Backendless.initApp(APP_ID, API_KEY);

const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('status-msg');

submitBtn.addEventListener('click', async () => {
    statusMsg.innerHTML = "Traitement en cours... Merci de patienter.";
    submitBtn.disabled = true;

    const refId = "OG-" + Math.random().toString(36).substr(2, 7).toUpperCase();
    
    // 1. Générer le QR Code sur le formulaire avant la capture
    new QRious({
        element: document.getElementById('canvas-qr'),
        value: refId,
        size: 200
    });

    try {
        // 2. Capture de l'intégralité de la div .a4
        const element = document.getElementById('fiche-complete');
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output('blob');

        // 3. Envoi vers Backendless Files
        const upload = await Backendless.Files.upload(pdfBlob, `fiches_og/${refId}.pdf`, true);

        // 4. Envoi des données vers la table 'og'
        const form = document.getElementById('form-og');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.numero_enregistrement = refId;
        data.lien_telechargement_pdf = upload.fileURL;

        await Backendless.Data.of("og").save(data);

        // 5. Affichage du lien final au bas de la page
        statusMsg.innerHTML = `
            <div style="background:white; color:black; padding:20px; border-radius:10px; margin-top:20px;">
                <h3 style="color:green;">✅ Enregistrement réussi !</h3>
                <p>Référence : ${refId}</p>
                <a href="${upload.fileURL}" target="_blank" style="display:inline-block; background:blue; color:white; padding:15px; text-decoration:none; border-radius:5px; font-weight:bold;">
                    📥 TÉLÉCHARGER LE PDF (Copie Conforme)
                </a>
                <br><br>
                <button onclick="location.reload()" style="background:#666; color:white; border:none; padding:10px; cursor:pointer;">Nouveau formulaire</button>
            </div>
        `;
        submitBtn.style.display = 'none';

    } catch (error) {
        console.error(error);
        statusMsg.innerHTML = "Erreur : " + error.message;
        submitBtn.disabled = false;
    }
});
