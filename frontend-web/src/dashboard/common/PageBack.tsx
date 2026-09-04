import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

type Props = {
  to: string;
  label?: string;
};

export default function PageBack({ to, label = "Retour" }: Props) {
  return (
    <Link to={to} className="ta-page-back">
      <ArrowLeft size={16} strokeWidth={2.5} />
      {label}
    </Link>
  );
}
