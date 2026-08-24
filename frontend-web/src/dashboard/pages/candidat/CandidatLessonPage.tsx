import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Loader from "../../../components/common/Loader";
import { AuthApiError, fetchCandidatLecon } from "../../../lib/pedagogyApi";

/** Redirige les anciennes URLs /cours/lecon/:id vers le parcours linéaire du module. */
export default function CandidatLessonPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) {
      navigate("/espace/candidat/cours", { replace: true });
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const lecon = await fetchCandidatLecon(id);
        if (cancelled) return;
        navigate(`/espace/candidat/cours/module/${lecon.theme_id}/etape/${lecon.id}`, { replace: true });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof AuthApiError && err.status === 403) {
          navigate("/tarifs", { replace: true });
          return;
        }
        navigate("/espace/candidat/cours", { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return <Loader />;
}
