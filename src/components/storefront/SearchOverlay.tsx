"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Suggestion = {
  slug: string;
  name: string;
  base_price: number;
  primary_image: { url: string } | null;
};

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setSuggestions([]);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=5&sort=newest`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.products || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      router.push(`/products/${suggestions[activeIndex].slug}`);
      onClose();
    } else if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-neutral-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="w-full text-lg bg-transparent border-none outline-none text-neutral-900 placeholder:text-neutral-400"
            autoComplete="off"
          />
        </form>
        <button
          onClick={onClose}
          className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          Close
        </button>
      </div>

      {query.length >= 2 && (
        <div className="px-6 py-4 max-w-3xl mx-auto">
          {loading && (
            <p className="text-sm text-neutral-400">Searching…</p>
          )}

          {!loading && hasSuggestions && (
            <ul className="space-y-1" role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={s.slug}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <Link
                    href={`/products/${s.slug}`}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      i === activeIndex ? "bg-neutral-100" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="w-10 h-12 rounded bg-neutral-100 overflow-hidden shrink-0">
                      {s.primary_image ? (
                        <img
                          src={s.primary_image.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 truncate">{s.name}</p>
                      <p className="text-xs text-neutral-500">
                        ₹{s.base_price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && !hasSuggestions && query.length >= 2 && (
            <p className="text-sm text-neutral-400 py-4">
              No products found for &ldquo;{query}&rdquo;.
            </p>
          )}

          {query.trim().length >= 2 && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
              className="inline-block mt-3 text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
            >
              View all results for &ldquo;{query}&rdquo;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
