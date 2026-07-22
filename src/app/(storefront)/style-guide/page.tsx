"use client";

import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <h2 className="font-heading text-2xl tracking-tight text-foreground">
        {title}
      </h2>
      <div className="border-t border-border" />
      {children}
    </section>
  );
}

function Swatch({ label, colorClass, textClass }: { label: string; colorClass: string; textClass?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("h-16 w-full rounded-md shadow-sm border border-border", colorClass)} />
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
    </div>
  );
}

function SpacingBox({ size, label }: { size: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("bg-accent shrink-0 rounded-sm", size)} />
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
    </div>
  );
}

function RadiusBox({ radiusClass, label }: { radiusClass: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-12 w-24 bg-muted border border-border", radiusClass)} />
      <span className="text-sm text-muted-foreground font-mono">{label}</span>
    </div>
  );
}

function ShadowBox({ shadowClass, label }: { shadowClass: string; label: string }) {
  return (
    <div className={cn("h-16 w-full rounded-md bg-card border border-border/50", shadowClass)}>
      <span className="flex h-full items-center justify-center text-sm text-muted-foreground font-mono">
        {label}
      </span>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 space-y-16">
      <div className="space-y-2">
        <h1 className="font-heading text-5xl tracking-tight text-foreground">
          Design System
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          Fashion Apparel — editorial premium visual identity
        </p>
      </div>

      {/* Typography */}
      <Section title="Typography">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground font-mono">
            Headings: Playfair Display · Body: Inter
          </p>
          <div className="space-y-3">
            <p className="font-heading text-5xl tracking-tight">Heading 5xl</p>
            <p className="font-heading text-4xl tracking-tight">Heading 4xl</p>
            <p className="font-heading text-3xl tracking-tight">Heading 3xl</p>
            <p className="font-heading text-2xl tracking-tight">Heading 2xl</p>
            <p className="font-heading text-xl tracking-tight">Heading xl</p>
            <p className="font-heading text-lg">Heading lg</p>
            <p className="font-heading text-base">Heading base</p>
          </div>
          <div className="border-t border-border pt-6 space-y-2">
            <p className="text-base text-foreground">
              Body base — The quick brown fox jumps over the lazy dog. A luxury fashion house must speak with clarity and conviction.
            </p>
            <p className="text-sm text-muted-foreground">
              Body sm (muted) — The quick brown fox jumps over the lazy dog. Secondary information presented with discretion.
            </p>
            <p className="text-xs text-muted-foreground">
              Body xs (muted) — The quick brown fox jumps over the lazy dog. Fine print and metadata.
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-mono text-muted-foreground">font-light </span>
              <span className="font-light">Light</span>
            </div>
            <div>
              <span className="font-mono text-muted-foreground">font-normal </span>
              <span className="font-normal">Normal</span>
            </div>
            <div>
              <span className="font-mono text-muted-foreground">font-medium </span>
              <span className="font-medium">Medium</span>
            </div>
            <div>
              <span className="font-mono text-muted-foreground">font-semibold </span>
              <span className="font-semibold">Semibold</span>
            </div>
            <div>
              <span className="font-mono text-muted-foreground">font-bold </span>
              <span className="font-bold">Bold</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Colors">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Swatch label="bg-background" colorClass="bg-background" />
          <Swatch label="bg-foreground" colorClass="bg-foreground" />
          <Swatch label="bg-card" colorClass="bg-card" />
          <Swatch label="bg-card-foreground" colorClass="bg-card-foreground" />
          <Swatch label="bg-primary" colorClass="bg-primary" />
          <Swatch label="bg-primary-foreground" colorClass="bg-primary-foreground" />
          <Swatch label="bg-secondary" colorClass="bg-secondary" />
          <Swatch label="bg-secondary-foreground" colorClass="bg-secondary-foreground" />
          <Swatch label="bg-accent" colorClass="bg-accent" />
          <Swatch label="bg-accent-foreground" colorClass="bg-accent-foreground" />
          <Swatch label="bg-muted" colorClass="bg-muted" />
          <Swatch label="bg-muted-foreground" colorClass="bg-muted-foreground" />
          <Swatch label="bg-destructive" colorClass="bg-destructive" />
          <Swatch label="bg-destructive-foreground" colorClass="bg-destructive-foreground" />
          <Swatch label="border" colorClass="bg-border" />
          <Swatch label="ring" colorClass="bg-ring" />
        </div>
      </Section>

      {/* Border Radius */}
      <Section title="Border Radius">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <RadiusBox radiusClass="rounded-sm" label="rounded-sm" />
          <RadiusBox radiusClass="rounded" label="rounded" />
          <RadiusBox radiusClass="rounded-md" label="rounded-md" />
          <RadiusBox radiusClass="rounded-lg" label="rounded-lg" />
          <RadiusBox radiusClass="rounded-xl" label="rounded-xl" />
        </div>
      </Section>

      {/* Shadows */}
      <Section title="Shadows">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ShadowBox shadowClass="shadow-sm" label="shadow-sm" />
          <ShadowBox shadowClass="shadow" label="shadow" />
          <ShadowBox shadowClass="shadow-md" label="shadow-md" />
          <ShadowBox shadowClass="shadow-lg" label="shadow-lg" />
          <ShadowBox shadowClass="shadow-xl" label="shadow-xl" />
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <div className="space-y-3">
          <SpacingBox size="w-1" label="spacing-1 (0.25rem)" />
          <SpacingBox size="w-2" label="spacing-2 (0.5rem)" />
          <SpacingBox size="w-3" label="spacing-3 (0.75rem)" />
          <SpacingBox size="w-4" label="spacing-4 (1rem)" />
          <SpacingBox size="w-6" label="spacing-6 (1.5rem)" />
          <SpacingBox size="w-8" label="spacing-8 (2rem)" />
          <SpacingBox size="w-12" label="spacing-12 (3rem)" />
          <SpacingBox size="w-16" label="spacing-16 (4rem)" />
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="flex flex-wrap gap-4 items-center">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Primary
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Secondary
          </button>
          <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Outline
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Accent
          </button>
          <button
            disabled
            className="inline-flex items-center justify-center rounded-md bg-muted px-6 py-2.5 text-sm font-medium text-muted-foreground shadow-sm opacity-50 cursor-not-allowed"
          >
            Disabled
          </button>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Small
          </button>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Large
          </button>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Pill
          </button>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="h-32 w-full rounded-md bg-muted" />
            <h3 className="font-heading text-lg tracking-tight">Product Card</h3>
            <p className="text-sm text-muted-foreground">$240.00</p>
            <button className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
              Add to Cart
            </button>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="h-32 w-full rounded-md bg-muted" />
            <h3 className="font-heading text-lg tracking-tight">Editorial Card</h3>
            <p className="text-sm text-muted-foreground">A premium editorial layout for fashion storytelling.</p>
            <button className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              View Details
            </button>
          </div>

          <div className="rounded-lg border border-border bg-accent p-6 shadow-sm space-y-3">
            <h3 className="font-heading text-lg tracking-tight text-accent-foreground">
              Featured
            </h3>
            <p className="text-sm text-accent-foreground/80">
              Accent card background for promotional content and highlighted collections.
            </p>
            <button className="w-full inline-flex items-center justify-center rounded-md bg-accent-foreground px-4 py-2 text-sm font-medium text-accent shadow-sm transition-colors hover:bg-accent-foreground/90">
              Shop Now
            </button>
          </div>
        </div>
      </Section>

      {/* Interactive States */}
      <Section title="Interactive States">
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-base font-semibold mb-3">Focus Ring</h3>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Focus me (tab to this)"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                readOnly
              />
              <a
                href="#"
                className="text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                onClick={(e) => e.preventDefault()}
              >
                Focusable link
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-heading text-base font-semibold mb-3">Link States</h3>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" onClick={(e) => e.preventDefault()}>Default link</a>
              <a href="#" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors" onClick={(e) => e.preventDefault()}>Muted link</a>
              <a href="#" className="text-accent underline-offset-4 hover:text-accent/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors" onClick={(e) => e.preventDefault()}>Accent link</a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
