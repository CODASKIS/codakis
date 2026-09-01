import { useCallback, useEffect, useRef } from "react";

type Props = {
  id?: string;
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export default function AuthOtpInput({
  id = "auth-otp",
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = false,
}: Props) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  const focusAt = useCallback((index: number) => {
    const target = inputsRef.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  }, []);

  useEffect(() => {
    if (autoFocus) focusAt(0);
  }, [autoFocus, focusAt]);

  function updateDigit(index: number, digit: string) {
    const cleaned = digit.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[index] = cleaned;
    onChange(next.join("").slice(0, length));
    if (cleaned && index < length - 1) {
      focusAt(index + 1);
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      focusAt(index - 1);
    }
    if (key === "ArrowLeft" && index > 0) focusAt(index - 1);
    if (key === "ArrowRight" && index < length - 1) focusAt(index + 1);
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, length - 1));
  }

  return (
    <div className="codakis-auth-otp" role="group" aria-label="Code OTP">
      {digits.map((digit, index) => (
        <input
          key={`${id}-${index}`}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          className="codakis-auth-otp__cell"
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Chiffre ${index + 1}`}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event.key)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
