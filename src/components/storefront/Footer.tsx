"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Category = { name: string; slug: string };

function AccordionSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border-b border-white/10 md:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 md:py-0 md:mb-4 text-sm font-medium text-white/80 md:cursor-default"
      >
        {title}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`md:hidden transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="pb-4 md:pb-0 space-y-3">{children}</div>}
      <div className="hidden md:block space-y-3">{children}</div>
    </div>
  );
}

export default function Footer({ categories }: { categories: Category[] }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const form = new FormData();
      form.append("email", email);
      const res = await fetch("/api/newsletter", { method: "POST", body: form });
      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list. Welcome to the edit.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <footer className="bg-neutral-950">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
          <p className="font-heading text-xs tracking-[0.25em] uppercase text-white/40 mb-4">
            The Edit
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-white font-semibold tracking-tight leading-[1.1]">
            Never miss a drop
          </h2>
          <p className="mt-3 text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Early access to new collections, exclusive style notes, and members-only pricing.
          </p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={status === "loading"}
              className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-3 bg-white text-neutral-900 text-sm font-medium tracking-wider uppercase hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Sending…" : "Subscribe"}
            </button>
          </form>
          {status === "success" && (
            <p className="mt-4 text-sm text-green-400">{message}</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-sm text-red-400">{message}</p>
          )}
          {status === "idle" && (
            <p className="mt-4 text-xs text-white/30">No spam. Unsubscribe anytime.</p>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-0 md:gap-12">
          {/* Shop */}
          <AccordionSection title="Shop">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="block text-sm text-white/40 hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/blog"
              className="block text-sm text-white/40 hover:text-white transition-colors"
            >
              Journal
            </Link>
          </AccordionSection>

          {/* Customer Service */}
          <AccordionSection title="Customer Service">
            {[
              { label: "Shipping", href: "#" },
              { label: "Returns & Exchanges", href: "#" },
              { label: "FAQ", href: "#" },
              { label: "Size Guide", href: "#" },
              { label: "Contact Us", href: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm text-white/40 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </AccordionSection>

          {/* Connect */}
          <AccordionSection title="Connect">
            <Link
              href="#"
              className="block text-sm text-white/40 hover:text-white transition-colors"
            >
              About Us
            </Link>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" aria-label="Instagram" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="X / Twitter" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.087-.79-.166-2.006.034-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.853 0 1.265.641 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.996.499 1.808 1.48 1.808 1.776 0 3.142-1.872 3.142-4.575 0-2.392-1.718-4.064-4.172-4.064-2.84 0-4.507 2.13-4.507 4.332 0 .858.33 1.78.743 2.282a.3.3 0 0 1 .069.286l-.277 1.133c-.044.183-.145.222-.334.134-1.247-.581-2.027-2.405-2.027-3.871 0-3.152 2.29-6.048 6.604-6.048 3.466 0 6.161 2.469 6.161 5.77 0 3.444-2.172 6.216-5.183 6.216-1.012 0-1.963-.525-2.29-1.147l-.623 2.374c-.226.87-.835 1.958-1.244 2.622.937.29 1.93.447 2.958.447 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-white/40 hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
              </a>
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="block shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="/logo.svg"
              alt="Fashion Apparel"
              width="28"
              height="28"
              className="block brightness-150 opacity-60"
            />
          </Link>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-white/30" title="Visa">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="currentColor"><rect width="32" height="20" rx="3" opacity="0.15" /><text x="6" y="14" fontSize="10" fontWeight="bold" fill="currentColor">VISA</text></svg>
            </span>
            <span className="inline-flex items-center gap-1 text-white/30" title="Mastercard">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="currentColor"><rect width="32" height="20" rx="3" opacity="0.15" /><circle cx="11" cy="10" r="5" /><circle cx="21" cy="10" r="5" opacity="0.6" /></svg>
            </span>
            <span className="inline-flex items-center gap-1 text-white/30" title="UPI">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="currentColor"><rect width="32" height="20" rx="3" opacity="0.15" /><text x="6" y="14" fontSize="9" fontWeight="bold" fill="currentColor">UPI</text></svg>
            </span>
            <span className="inline-flex items-center gap-1 text-white/30" title="RuPay">
              <svg width="36" height="20" viewBox="0 0 36 20" fill="currentColor"><rect width="36" height="20" rx="3" opacity="0.15" /><text x="5" y="14" fontSize="9" fontWeight="bold" fill="currentColor">RuPay</text></svg>
            </span>
            <span className="inline-flex items-center gap-1 text-white/30" title="Razorpay">
              <svg width="44" height="20" viewBox="0 0 44 20" fill="currentColor"><rect width="44" height="20" rx="3" opacity="0.15" /><text x="3" y="14" fontSize="8" fontWeight="bold" fill="currentColor">RAZORPAY</text></svg>
            </span>
          </div>

          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Fashion Apparel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
