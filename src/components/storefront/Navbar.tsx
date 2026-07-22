"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import SearchOverlay from "./SearchOverlay";

type Category = {
  name: string;
  slug: string;
};

export default function Navbar({ categories }: { categories: Category[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { itemCount, openDrawer } = useCart();

  const closeMega = useCallback(() => setOpenMega(null), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!openMega) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMega();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openMega, closeMega]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200/50">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="font-heading text-xl tracking-tight text-neutral-900"
            >
              Fashion Apparel
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="relative"
                  onMouseEnter={() => setOpenMega(cat.slug)}
                  onMouseLeave={closeMega}
                >
                  <button
                    ref={openMega === cat.slug ? triggerRef : undefined}
                    className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors rounded-md"
                    onPointerDown={(e) => {
                      if (openMega === cat.slug) {
                        closeMega();
                      } else {
                        setOpenMega(cat.slug);
                      }
                    }}
                    aria-expanded={openMega === cat.slug}
                    aria-haspopup="true"
                  >
                    {cat.name}
                  </button>
                  {openMega === cat.slug && (
                    <div
                      ref={menuRef}
                      role="menu"
                      className="absolute top-full left-0 mt-1 min-w-[200px] bg-white border border-neutral-200 rounded-lg shadow-lg p-3"
                      onMouseEnter={() => setOpenMega(cat.slug)}
                      onMouseLeave={closeMega}
                    >
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        role="menuitem"
                        className="block px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
                        onClick={closeMega}
                      >
                        All {cat.name}
                      </Link>
                      <Link
                        href={`/shop?category=${cat.slug}&sort=newest`}
                        role="menuitem"
                        className="block px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md"
                        onClick={closeMega}
                      >
                        New in {cat.name}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            <button
              onClick={openDrawer}
              className="relative w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label={`Cart (${itemCount} items)`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center rounded-full">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="h-16" />

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-200">
            <span className="font-heading text-lg text-neutral-900">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-neutral-500"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="px-6 py-8 space-y-1">
            <button
              onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
              className="flex items-center gap-3 w-full py-3 text-lg text-neutral-700 border-b border-neutral-100 text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Search
            </button>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="block py-3 text-lg text-neutral-700 hover:text-neutral-900 border-b border-neutral-100"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/blog"
              className="block py-3 text-lg text-neutral-700 hover:text-neutral-900 border-b border-neutral-100"
              onClick={() => setMobileOpen(false)}
            >
              Journal
            </Link>
            <button
              onClick={() => { setMobileOpen(false); openDrawer(); }}
              className="block w-full text-left py-3 text-lg text-neutral-700 hover:text-neutral-900 border-b border-neutral-100"
            >
              Cart {itemCount > 0 && `(${itemCount})`}
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
