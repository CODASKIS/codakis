import { useEffect, useState } from "react";
import {
  fetchBlogPosts,
  fetchPublicDomains,
  fetchVitrinePlans,
  type BlogPostListItem,
  type PublicDomainItem,
  type VitrinePlanItem,
} from "../../lib/cms-api";

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

function useCmsResource<T>(loader: () => Promise<T>, fallback: T): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({
    data: fallback,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    void loader()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Chargement impossible";
          setState((prev) => ({ data: prev.data, loading: false, error: message }));
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

export function usePublicDomains(fallback: PublicDomainItem[] = []) {
  return useCmsResource(fetchPublicDomains, fallback);
}

export function useBlogPosts(fallback: BlogPostListItem[] = []) {
  return useCmsResource(fetchBlogPosts, fallback);
}

export function useVitrinePlans(fallback: VitrinePlanItem[] = []) {
  return useCmsResource(fetchVitrinePlans, fallback);
}
