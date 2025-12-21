(function() {
    // 1. CSS Spécifique à la Section B
    const style = document.createElement('style');
    style.innerHTML = `
        .section-b-container { padding: 60px 20px; background: #fff; }
        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .video-card {
            background: #ffffff;
            border-radius: 15px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
        }
        /* Lecteur Vidéo Interactif (Pause/Play natif) */
        .video-player-box {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            background: #000;
        }
        .video-player-box iframe {
            position: absolute; width: 100%; height: 100%; border: 0;
        }
        .video-info { padding: 20px; flex-grow: 1; }
        .v-title { font-size: 1.3rem; font-weight: 800; color: #1e293b; margin-bottom: 5px; }
        .v-date { font-size: 0.85rem; color: #ef4444; font-weight: 600; display: block; margin-bottom: 15px; }
        
        /* Texte Justifié et Déploiement */
        .v-description { 
            font-size: 0.95rem; 
            color: #475569; 
            text-align: justify; /* TEXTE BIEN JUSTIFIÉ */
            line-height: 1.6;
        }
        .v-text-limit {
            display: -webkit-box;
            -webkit-line-clamp: 3; /* Limite à 3 lignes */
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .btn-toggle {
            display: inline-block;
            margin-top: 10px;
            color: #007FFF;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.85rem;
        }
        .btn-toggle:hover { text-decoration: underline; }

        /* Icones Réseaux Sociaux */
        .v-socials {
            display: flex;
            justify-content: space-around;
            padding: 15px;
            background: #f8fafc;
            border-top: 1px solid #f1f5f9;
        }
        .v-socials a img { width: 22px; height: 22px; transition: 0.3s; filter: grayscale(100%); }
        .v-socials a:hover img { filter: grayscale(0%); transform: scale(1.2); }
    `;
    document.head.appendChild(style);

    // 2. Données des 4 vidéos
    const mesVideos = [
        {
            id: 1,
            titre: "Forum Économique d'Investissement RDC-USA",
            date: "05 Septembre 2025",
            embedUrl: "histoire1.mp4", 
            texte: "Appel à tous les jeunes Enrepreneurs, Membres et non membres !Rejoignez-nous pour le prochain Forum Économique d'Investissement RDC-USA, qui se tiendra du 14 au 15 octobre 2025 à Washington Ne manquez pas cette opportunité unique de réseauter, d'échanger et de saisir de nouvelles perspectives d'investissement entre la RDC et les États-Unis. Nous vous attendons nombreux !"
        },
        {
            id: 2,
            titre: "Formation Entrepreneuriale d'un partenariat avec la République Populaire de la Chine et certifications",
            date: "16 Décembre 2025",
            embedUrl: "histoire2.mp4",
            texte: "Dans le cadre de partenariat de L'AMBASSADE DE CHINE et COPEMECO, les jeunes entrepreneurs agricoles pendant une durée d'une semaine du lundi 08 décembre au lundi 15 décembre ont bénéficié d'une formation en technique agricole à DAIPN/NSELE.."
        },
        {
            id: 3,
            titre: "Histoire et missions de la COPEMECO",
            date: "01 Septembre 2025",
            embedUrl: "histoire.mp4",
            texte: "Retrouvez l'intégralité des échanges lors du dernier forum national. Des panels riches en enseignements sur la digitalisation des services et la formalisation des entreprises informelles pour une meilleure intégration au marché national."
        },
        {
            id: 4,
            titre: "Succès Story : Lowa",
            date: "10 Décembre 2024",
            embedUrl: "https://www.youtube.com/embed/votre_id_4?enablejsapi=1",
            texte: "Découvrez le parcours inspirant d'une entreprise membre qui a réussi à exporter ses produits grâce au label COPEMECO. Une vidéo motivante qui détaille les étapes du succès, de la production locale jusqu'aux rayons des grands distributeurs."
        }
    ];

    // 3. Rendu HTML
    const container = document.getElementById('sectionB-container');
    let html = `<div class="section-b-container"><div class="video-grid">`;

    mesVideos.forEach((v, i) => {
        html += `
            <div class="video-card">
                <div class="video-player-box">
                    <iframe src="${v.embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="video-info">
                    <h3 class="v-title">${v.titre}</h3>
                    <span class="v-date">Publié le : ${v.date}</span>
                    <div id="desc-${i}" class="v-description v-text-limit">
                        ${v.texte}
                    </div>
                    <span class="btn-toggle" onclick="deplierTexte(${i})" id="btn-${i}">Lire la suite</span>
                </div>
                <div class="v-socials">
                    <a href="https://www.facebook.com/profile.php?id=61580111395454"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="FB"></a>
                    <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YT"></a>
                    <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TK"></a>
                    <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WA"></a>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // 4. Fonction pour déplier/replier le texte
    window.deplierTexte = function(idx) {
        const el = document.getElementById(`desc-${idx}`);
        const btn = document.getElementById(`btn-${idx}`);
        if (el.classList.contains('v-text-limit')) {
            el.classList.remove('v-text-limit');
            btn.innerText = "Réduire";
        } else {
            el.classList.add('v-text-limit');
            btn.innerText = "Lire la suite";
        }
    };
})();
