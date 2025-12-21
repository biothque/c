(function() {
    // 1. CSS spécifique à la Section A (Design Étagère et Lecteur)
    const style = document.createElement('style');
    style.innerHTML = `
        .section-a-container {
            padding: 60px 20px;
            background-color: #f1f5f9;
        }
        .etagere-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .pdf-box {
            background: #fff;
            border-bottom: 8px solid #3b82f6; /* Socle bleu */
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            text-align: center;
        }
        .pdf-box:hover {
            transform: translateY(-10px);
        }
        .pdf-preview {
            width: 100%;
            height: 300px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            margin-bottom: 12px;
            background: #f8fafc;
        }
        .pdf-title {
            font-weight: 700;
            color: #1e293b;
            font-size: 0.95rem;
            margin-top: 10px;
            display: block;
            text-transform: uppercase;
        }
        .section-title-a {
            text-align: center;
            font-size: 2rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 40px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    `;
    document.head.appendChild(style);

    // 2. Données des documents (Liens Google Drive)
    // Note : Remplace les '#' par tes liens "Embed" de Google Drive
    const documents = [
        { id: 1, nom: "Rapport Annuel COPEMECO", lien: "1.pdf" },
        { id: 2, nom: "Statuts de la Coordination", lien: "2.pdf" },
        { id: 3, nom: "Guide de l'Entrepreneur", lien: "3.pdf" },
        { id: 4, nom: "Décret PME RDC", lien: "4.pdf" }
    ];

    // 3. Construction du HTML
    const container = document.getElementById('sectionA-container');
    
    let htmlContent = `
        <div class="section-a-container">
            <h2 class="section-title-a">Documents disponibles</h2>
            <div class="etagere-grid">
    `;

    documents.forEach(doc => {
        htmlContent += `
            <div class="pdf-box">
                <iframe 
                    src="${doc.lien}" 
                    class="pdf-preview" 
                    allow="autoplay">
                </iframe>
                <span class="pdf-title">${doc.nom}</span>
            </div>
        `;
    });

    htmlContent += `
            </div>
        </div>
    `;

    container.innerHTML = htmlContent;
})();
