import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Flag, Globe, MapPin } from "lucide-react";

type HeaderSearchProps = {
  defaultKeyword?: string;
  defaultLocation?: string;
  variant?: "desktop" | "mobile";
};

export default function HeaderSearch({
  defaultKeyword = "",
  defaultLocation = "",
  variant = "desktop",
}: HeaderSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const locationWrapRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [location, setLocation] = useState(defaultLocation);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const locationSuggestions = [
    {
      id: "current",
      label: t("search.locationCurrent"),
      value: t("search.locationCurrentValue"),
      icon: MapPin,
    },
    {
      id: "cameroon",
      label: t("search.locationCountry"),
      value: "",
      icon: Flag,
    },
    {
      id: "anywhere",
      label: t("search.locationAnywhere"),
      value: "",
      icon: Globe,
    },
  ] as const;

  useEffect(() => {
    setKeyword(defaultKeyword);
    setLocation(defaultLocation);
  }, [defaultKeyword, defaultLocation]);

  useEffect(() => {
    if (!locationOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!locationWrapRef.current?.contains(event.target as Node)) {
        setLocationOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [locationOpen]);

  function goSearch(nextKeyword: string, nextLocation: string) {
    const params = new URLSearchParams();
    if (nextKeyword.trim()) params.set("q", nextKeyword.trim());
    if (nextLocation.trim()) params.set("ville", nextLocation.trim());
    navigate(`/auto-ecoles${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLocationOpen(false);
    goSearch(keyword, location);
  };

  function handleLocationSuggestion(option: (typeof locationSuggestions)[number]) {
    if (option.id === "current") {
      if (!navigator.geolocation) {
        setLocation(option.value);
        setLocationOpen(false);
        return;
      }

      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation(option.value);
          setLocating(false);
          setLocationOpen(false);
        },
        () => {
          setLocating(false);
          setLocationOpen(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
      return;
    }

    setLocation(option.value);
    setLocationOpen(false);
  }

  return (
    <form
      className={`fj-search-form${variant === "mobile" ? " fj-search-form--mobile" : ""}`}
      onSubmit={submit}
      autoComplete="off"
    >
      <div className="fj-search-box">
        <input
          type="search"
          placeholder={t("nav.searchPlaceholder")}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          aria-label={t("nav.searchSchool")}
        />

        <div
          ref={locationWrapRef}
          className={`fj-search-box__location${locationOpen ? " is-open" : ""}`}
        >
          <input
            type="search"
            placeholder={t("nav.locationPlaceholder")}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onFocus={() => setLocationOpen(true)}
            aria-label={t("search.locationAria")}
            aria-expanded={locationOpen}
            aria-haspopup="listbox"
            aria-controls="header-search-location-menu"
          />

          {locationOpen ? (
            <ul
              id="header-search-location-menu"
              className="fj-search-box__location-menu"
              role="listbox"
              aria-label={t("search.locationMenuAria")}
            >
              {locationSuggestions.map((option) => {
                const Icon = option.icon;
                return (
                  <li key={option.id} role="option">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleLocationSuggestion(option)}
                      disabled={option.id === "current" && locating}
                    >
                      <Icon size={18} strokeWidth={2} aria-hidden="true" />
                      <span>
                        {option.id === "current" && locating
                          ? t("search.locating")
                          : option.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <button type="submit" aria-label={t("nav.search")}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden>
            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
