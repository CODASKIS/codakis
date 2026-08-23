/** Chemins auth — source unique pour les liens du site vitrine. */
export const AUTH_PATHS = {
  login: "/connexion",
  register: {
    candidat: "/inscription/candidat",
    gerant: "/inscription/gerant",
  },
} as const;
