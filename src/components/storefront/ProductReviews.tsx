"use client";

import { useEffect, useState, useCallback, useRef } from "react";

type ApprovedReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
};

type ReviewsData = {
  reviews: ApprovedReview[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  averageRating: number | null;
  totalReviews: number;
};

function StarsDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={s <= rating ? "text-neutral-900" : "text-neutral-300"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, value + 1));
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, value - 1));
            }
          }}
          className="p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= s ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={hovered >= s ? "text-neutral-800" : value >= s ? "text-neutral-900" : "text-neutral-300"}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({
  productId,
  initialAverage,
  initialCount,
  initialReviews,
}: {
  productId: string;
  initialAverage: number | null;
  initialCount: number;
  initialReviews: ApprovedReview[];
}) {
  const [reviews, setReviews] = useState<ApprovedReview[]>(initialReviews);
  const [avgRating, setAvgRating] = useState(initialAverage);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function fetchReviews(p: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?product_id=${productId}&page=${p}&pageSize=5`);
      if (res.ok) {
        const data: ReviewsData = await res.json();
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
        setTotalCount(data.totalReviews);
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews(1);
  }, [productId]);

  const starBreakdown = useCallback(() => {
    if (totalCount === 0) return [];
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: 0,
    }));
  }, [totalCount]);

  return (
    <div className="max-w-2xl">
      <h2 className="font-heading text-xl text-neutral-900 mb-6">
        Reviews{totalCount > 0 ? ` (${totalCount})` : ""}
      </h2>

      {/* Average rating + star breakdown */}
      {totalCount > 0 && (
        <div className="flex items-start gap-8 mb-8 p-6 bg-neutral-50 rounded-xl">
          <div className="text-center shrink-0">
            <span className="block text-3xl font-heading text-neutral-900">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </span>
            <StarsDisplay rating={Math.round(avgRating || 0)} size={16} />
            <span className="block text-xs text-neutral-400 mt-1">{totalCount} review{totalCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-neutral-500">{star}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-neutral-400 shrink-0">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-900 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-neutral-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews list */}
      {totalCount > 0 ? (
        <div className="space-y-6">
          {reviews.map((r) => (
            <div key={r.id} className="pb-6 border-b border-neutral-100">
              <div className="flex items-center gap-2 mb-1">
                <StarsDisplay rating={r.rating} />
                <span className="text-xs text-neutral-400">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
              {r.title && <p className="text-sm font-medium text-neutral-900">{r.title}</p>}
              <p className="text-sm text-neutral-600 mt-1">{r.body}</p>
              <p className="text-xs text-neutral-400 mt-1">– {r.reviewer_name}</p>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <p className="text-sm text-neutral-400 mb-6">No reviews yet.</p>
      ) : null}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-5 w-5 text-neutral-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => fetchReviews(page - 1)}
            disabled={page <= 1}
            className="text-xs text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-200 disabled:border-neutral-100"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchReviews(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                p === page
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => fetchReviews(page + 1)}
            disabled={page >= totalPages}
            className="text-xs text-neutral-600 hover:text-neutral-900 disabled:text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-200 disabled:border-neutral-100"
          >
            Next
          </button>
        </div>
      )}

      {/* Write a Review */}
      {!formVisible && !submitted && (
        <button
          onClick={() => setFormVisible(true)}
          className="mt-8 text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800"
        >
          Write a Review
        </button>
      )}

      {submitted && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <p className="font-medium">Thank you for your review!</p>
          <p className="text-green-700 mt-1">Your review has been submitted and will appear after approval.</p>
        </div>
      )}

      {formVisible && !submitted && (
        <ReviewForm
          productId={productId}
          onSubmitted={() => {
            setSubmitted(true);
            setFormVisible(false);
            fetchReviews(1);
          }}
        />
      )}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({ reviewer_name: "", reviewer_email: "", rating: 0, title: "", body: "" });
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const errors: Record<string, string> = {};
  if (!form.reviewer_name.trim()) errors.reviewer_name = "Name is required";
  if (!form.reviewer_email.trim()) errors.reviewer_email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.reviewer_email)) errors.reviewer_email = "Please enter a valid email";
  if (form.rating < 1) errors.rating = "Please select a rating";
  if (!form.body.trim()) errors.body = "Review body is required";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(new Set(["reviewer_name", "reviewer_email", "rating", "body"]));
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setServerError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, product_id: productId }),
    });

    setSubmitting(false);

    if (res.ok) {
      onSubmitted();
    } else {
      const data = await res.json();
      if (data.fields) {
        const fieldErrors = data.fields as Record<string, string>;
        setServerError(Object.values(fieldErrors).join(". "));
      } else {
        setServerError(data.error || "Failed to submit review.");
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-8 p-6 bg-neutral-50 rounded-xl space-y-4">
      <h3 className="text-sm font-medium text-neutral-900">Write a Review</h3>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Rating</label>
        <StarInput
          value={form.rating}
          onChange={(v) => { setForm({ ...form, rating: v }); setTouched(new Set([...touched, "rating"])); }}
        />
        {touched.has("rating") && errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={form.reviewer_name}
            onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
            onBlur={() => setTouched(new Set([...touched, "reviewer_name"]))}
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none ${
              touched.has("reviewer_name") && errors.reviewer_name ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {touched.has("reviewer_name") && errors.reviewer_name && (
            <p className="text-xs text-red-500 mt-1">{errors.reviewer_name}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            placeholder="Your email"
            value={form.reviewer_email}
            onChange={(e) => setForm({ ...form, reviewer_email: e.target.value })}
            onBlur={() => setTouched(new Set([...touched, "reviewer_email"]))}
            className={`w-full text-sm border rounded-lg px-3 py-2 outline-none ${
              touched.has("reviewer_email") && errors.reviewer_email ? "border-red-400" : "border-neutral-300"
            }`}
          />
          {touched.has("reviewer_email") && errors.reviewer_email && (
            <p className="text-xs text-red-500 mt-1">{errors.reviewer_email}</p>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Review title (optional)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none"
      />

      <div>
        <textarea
          placeholder="Your review"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          onBlur={() => setTouched(new Set([...touched, "body"]))}
          rows={3}
          className={`w-full text-sm border rounded-lg px-3 py-2 outline-none resize-none ${
            touched.has("body") && errors.body ? "border-red-400" : "border-neutral-300"
          }`}
        />
        {touched.has("body") && errors.body && (
          <p className="text-xs text-red-500 mt-1">{errors.body}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-500">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="text-sm bg-neutral-900 text-white rounded-lg px-6 py-2 hover:bg-neutral-800 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
