// --- Configuration Backendless (Version Corrigée) ---
const APP_ID = "3D3629AB-2B0E-49DE-AA35-4A0EFAB84AE7";
const API_KEY = "B3C84FA1-67E6-40A2-8CA4-2E77E52E2EB4";
const TABLE  = "matricules"; // Table mise à jour

// Initialisation Backendless
Backendless.initApp(APP_ID, API_KEY);

/**
 * Redirige vers le login en nettoyant la session
 */
function redirectToLogin(message) {
  localStorage.removeItem("userSession");
  if (message) alert(message);
  window.location.href = "login.html";
}

/**
 * Vérifie si le matricule en session existe toujours dans la base de données
 */
async function verifyMatricule() {
  const sessionStr = localStorage.getItem("userSession");
  
  // 1. Vérifie si une session existe localement
  if (!sessionStr) return redirectToLogin();

  const session = JSON.parse(sessionStr);
  if (!session.matricule) return redirectToLogin();

  try {
    // 2. Vérifie la validité du matricule dans la table 'matricules'
    const whereClause = `matricule = '${session.matricule}'`;
    const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
    const result = await Backendless.Data.of(TABLE).find(queryBuilder);

    // 3. Si le matricule a été supprimé de la base de données
    if (!result || result.length === 0) {
      redirectToLogin("Votre accès n'est plus valide ou votre matricule a été révoqué.");
    }
    
    console.log("Session vérifiée avec succès pour :", session.matricule);
    
  } catch (err) {
    console.error("Erreur vérification session :", err);
    // En cas d'erreur réseau critique, on peut choisir de bloquer ou laisser passer
    // Ici on redirige par sécurité
    redirectToLogin("Erreur de connexion lors de la vérification de sécurité.");
  }
}

// Lancement de la vérification au chargement de la page
window.addEventListener("load", verifyMatricule);
