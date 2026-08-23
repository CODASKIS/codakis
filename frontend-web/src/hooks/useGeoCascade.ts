import { useEffect, useState } from "react";
import {
  fetchCities,
  fetchNeighborhoods,
  fetchRegions,
  type CityItem,
  type NeighborhoodItem,
  type RegionItem,
} from "../lib/geo-api";

export function useGeoCascade(regionId: string, cityId: string) {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodItem[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingRegions(true);
    setError(null);

    fetchRegions()
      .then((data) => {
        if (!cancelled) setRegions(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les régions.");
          setRegions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingRegions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!regionId) {
      setCities([]);
      setNeighborhoods([]);
      return;
    }

    let cancelled = false;
    setLoadingCities(true);
    setError(null);

    fetchCities(regionId)
      .then((data) => {
        if (!cancelled) setCities(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les villes.");
          setCities([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [regionId]);

  useEffect(() => {
    if (!cityId) {
      setNeighborhoods([]);
      return;
    }

    let cancelled = false;
    setLoadingNeighborhoods(true);
    setError(null);

    fetchNeighborhoods(cityId)
      .then((data) => {
        if (!cancelled) setNeighborhoods(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Impossible de charger les quartiers.");
          setNeighborhoods([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingNeighborhoods(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityId]);

  return {
    regions,
    cities,
    neighborhoods,
    loadingRegions,
    loadingCities,
    loadingNeighborhoods,
    error,
  };
}
