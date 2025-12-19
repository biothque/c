// --- Configuration Backendless ---
const APP_ID = "B4A3DE5F-5247-43FC-8831-C87303139B55";
const API_KEY = "FABCD36F-F37C-4010-A5B8-39EC38FADD4C";
const TABLE  = "utilisateurs";

// Initialisation Backendless
Backendless.initApp(APP_ID, API_KEY);

function redirectToLogin(message) {
  localStorage.removeItem("userSession");
  if (message) alert(message);
  window.location.href = "login.html";
}

async function verifyMatricule() {
  const sessionStr = localStorage.getItem("userSession");
  if (!sessionStr) return redirectToLogin();

  const session = JSON.parse(sessionStr);
  if (!session.matricule) return redirectToLogin();

  try {
    const whereClause = `matricule = '${session.matricule}'`;
    const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
    const result = await Backendless.Data.of(TABLE).find(queryBuilder);

    if (!result || result.length === 0) {
      redirectToLogin("Votre compte a été supprimé ou n'existe plus.");
    }
  } catch (err) {
    console.error("Erreur vérification session :", err);
    redirectToLogin("Erreur lors de la vérification de votre session.");
  }
}

window.addEventListener("load", verifyMatricule);
