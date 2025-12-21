// On force l'application de notre nouvelle logique
function applyMediaLogic() {
    window.createNewsCard = (newsItem) => {
        const dateObj = new Date(newsItem.date);
        const formattedDate = dateObj.toLocaleDateString('fr-FR');
        const tagClass = `tag-${newsItem.category.replace(/ /g, '-')}`;
        const characterLimit = 150;
        const isExpandable = newsItem.snippet.length > characterLimit;
        const displayContent = isExpandable ? newsItem.snippet.substring(0, characterLimit) + '...' : newsItem.snippet;

        let mediaHtml = '';
        // Correction ici : on gère la vidéo
        if (newsItem.type === 'video') {
            mediaHtml = `
                <video class="news-media-container" controls muted poster="COP.png">
                    <source src="${newsItem.image}" type="video/mp4">
                    Votre navigateur ne supporte pas la vidéo.
                </video>`;
        } else {
            mediaHtml = `<img class="news-media-container" src="${newsItem.image}" alt="${newsItem.title}">`;
        }

        return `
            <div id="actu-${newsItem.id}" class="news-card">
                ${mediaHtml}
                <div class="p-6">
                    <span class="category-tag ${tagClass}">${newsItem.category}</span>
                    <h3 class="text-xl font-bold text-gray-900 mt-2 mb-2">${newsItem.title}</h3>
                    <p class="text-sm text-gray-500 mb-4 flex items-center">Publié le ${formattedDate}</p>
                    <p class="text-gray-700 mb-4 news-content" data-full-text="${newsItem.snippet.replace(/"/g, '&quot;')}" style="max-height: 4.5rem; overflow: hidden;">
                        ${displayContent}
                    </p>
                    ${isExpandable ? `<button class="mt-2 text-blue-600 font-semibold read-more-btn" data-target="actu-${newsItem.id}">Lire la suite</button>` : ''}
                </div>
            </div>`;
    };
}

// On l'exécute immédiatement
applyMediaLogic();
