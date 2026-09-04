import type { Gamification } from "../../lib/pedagogyApi";

type Props = {
  stats: Gamification | null;
};

export default function GamificationStats({ stats }: Props) {
  const niveau = stats?.niveau ?? 1;
  const points = stats?.points ?? 0;
  const read = stats?.chapters_read ?? 0;
  const total = stats?.chapters_total ?? 0;

  return (
    <div className="ck-learn__stats" aria-label="Progression">
      <div className="ck-learn__stat">
        <span>Niveau</span>
        <strong>{niveau}</strong>
      </div>
      <div className="ck-learn__stat">
        <span>Points</span>
        <strong>{points}</strong>
      </div>
      <div className="ck-learn__stat">
        <span>Chapitres lus</span>
        <strong>
          {read}/{total}
        </strong>
      </div>
    </div>
  );
}
