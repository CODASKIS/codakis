import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type ConfirmModalProps = {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "warning" | "success";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={() => !busy && onCancel()} centered>
      <Modal.Header closeButton={!busy}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" disabled={busy} onClick={onCancel}>
          {cancelLabel ?? t("common.cancel")}
        </Button>
        <Button variant={variant} disabled={busy} onClick={onConfirm}>
          {confirmLabel ?? t("common.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
