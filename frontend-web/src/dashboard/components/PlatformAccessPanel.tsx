import { useCallback, useState } from "react";
import { isPremiumUser, hydrateSessionFromApi } from "../../auth/authStore";
import PlatformPaywallBanner from "./PlatformPaywallBanner";
import PlatformSubscriptionCheckout from "./PlatformSubscriptionCheckout";

export function isPlatformAccessError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 403
  );
}

type PlatformAccessPanelProps = {
  showBanner?: boolean;
  onAccessGranted?: () => void;
};

export default function PlatformAccessPanel({ showBanner = true, onAccessGranted }: PlatformAccessPanelProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isPremium = isPremiumUser();

  const handleSuccess = useCallback(async () => {
    await hydrateSessionFromApi();
    onAccessGranted?.();
  }, [onAccessGranted]);

  if (isPremium) return null;

  return (
    <>
      {showBanner ? <PlatformPaywallBanner onSubscribe={() => setCheckoutOpen(true)} /> : null}
      <PlatformSubscriptionCheckout
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => void handleSuccess()}
      />
    </>
  );
}

export function usePlatformCheckout() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isPremium = isPremiumUser();

  const handleSuccess = useCallback(async () => {
    await hydrateSessionFromApi();
    window.location.reload();
  }, []);

  const checkoutModal = (
    <PlatformSubscriptionCheckout
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      onSuccess={() => void handleSuccess()}
    />
  );

  return {
    isPremium,
    checkoutOpen,
    openCheckout: () => setCheckoutOpen(true),
    closeCheckout: () => setCheckoutOpen(false),
    checkoutModal,
  };
}
