// auth.js

// Vérifie si l'utilisateur est connecté
function checkAuth(redirectTo = "login.html") {
  const session = localStorage.getItem("userSession");
  if (!session) {
    // Pas connecté → redirection vers login
    window.location.href = redirectTo;
  } else {
    // Retourne les infos utilisateur
    const user = JSON.parse(session);
    return user;
  }
}

// Déconnexion
function logout(redirectTo = "login.html") {
  localStorage.removeItem("userSession");
  window.location.href = redirectTo;
}
