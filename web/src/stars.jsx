import { createContext, useContext, useEffect, useState } from "react";

const StarsContext = createContext(null);

export function StarsProvider({ children }) {
  const [starred, setStarred] = useState(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stars")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setStarred(new Set(data.slugs));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(slug) {
    const next = !starred.has(slug);
    setStarred((current) => {
      const copy = new Set(current);
      if (next) copy.add(slug);
      else copy.delete(slug);
      return copy;
    });
    const response = await fetch(`/api/stars/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: next }),
    });
    if (!response.ok) return;
    const data = await response.json();
    setStarred(new Set(data.slugs));
  }

  return (
    <StarsContext.Provider value={{ starred, ready, toggle }}>
      {children}
    </StarsContext.Provider>
  );
}

export function useStars() {
  return useContext(StarsContext);
}

export function StarButton({ slug }) {
  const { starred, toggle } = useStars();
  const on = starred.has(slug);
  return (
    <button
      type="button"
      className={on ? "star on" : "star"}
      aria-pressed={on}
      aria-label={on ? "Remove from home" : "Add to home"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(slug);
      }}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
