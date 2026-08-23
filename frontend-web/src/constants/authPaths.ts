/** Chemins auth — source unique pour les liens du site vitrine. */
export const AUTH_PATHS = {
  login: "/connexion",
  register: {
    /** Inscription candidat (page auth) */
    candidat: "/inscription",
    /** Inscription auto-école (page vitrine publique) */
    autoEcole: "/inscription-auto-ecole",
  },
} as const;
