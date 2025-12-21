const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7";
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4";
Backendless.serverURL = "https://api.backendless.com";
Backendless.initApp(APP_ID, API_KEY);

const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');

submitBtn.addEventListener('click', async () => {
    submitBtn.style.display = 'none';
    loader.style.display = 'block';

    // 1. Générer la référence et le QR Code sur la page avant la capture
    const refId = "OG-" + Math.floor(100000 + Math.random() * 900000);
    const qrRef = document.getElementById('qr-ref');
    qrRef.innerText = refId;
    
    new QRious({
        element: document.getElementById('qr-code'),
        value: refId,
        size: 150
    });

    // 2. Capturer le formulaire (Identité visuelle totale)
    const element = document.getElementById('fiche-ong');
    
    try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const pdfBlob = pdf.output('blob');

        // 3. Envoyer le PDF vers Backendless
        const upload = await Backendless.Files.upload(pdfBlob, `fiches_og/${refId}.pdf`, true);

        // 4. Sauvegarder les données dans la table 'og'
        const fields = document.querySelectorAll('input, select, textarea');
        const data = { numero_enregistrement: refId, lien_pdf: upload.fileURL };
        fields.forEach(f => { if(f.name) data[f.name] = f.value; });

        await Backendless.Data.of("og").save(data);

        // 5. Afficher le lien de téléchargement au bas de la page
        document.querySelector('.form-actions').innerHTML = `
            <div style="background:white; padding:20px; border:2px solid green; margin-top:20px;">
                <p style="color:green; font-weight:bold;">✅ COPIE CONFORME GÉNÉRÉE AVEC SUCCÈS !</p>
                <a href="${upload.fileURL}" target="_blank" style="display:inline-block; padding:15px; background:blue; color:white; text-decoration:none; border-radius:5px;">
                    📥 TÉLÉCHARGER LE FORMULAIRE (PDF)
                </a>
                <br><br>
                <button onclick="location.reload()">Nouveau formulaire</button>
            </div>
        `;

    } catch (error) {
        console.error(error);
        alert("Erreur lors de la capture : " + error.message);
        submitBtn.style.display = 'block';
        loader.style.display = 'none';
    }
});
