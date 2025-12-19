// menuActions.js
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("logoutBtn");

    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Empêche le comportement par défaut du lien
            
            if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
                // On utilise la fonction de auth.js
                logout("contact.html"); 
            }
        });
    }
});
