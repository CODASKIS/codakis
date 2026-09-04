import { useEffect } from "react";
import { useNavigate } from "react-router";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Redirects free users to the Super upgrade page. */
export default function PaywallModal({ open, onClose }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    onClose();
    navigate("/espace/candidat/super");
  }, [open, navigate, onClose]);

  return null;
}
