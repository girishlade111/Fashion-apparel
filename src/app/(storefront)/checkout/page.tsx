"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

type FormData = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

declare global {
  interface Window {
    Razorpay: any;
  }
}

function useRazorpayScript() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || typeof window === "undefined") return;
    if ((window as any).Razorpay) { loaded.current = true; return; }
    loaded.current = true;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email address";
  if (data.phone && !/^[\d\s+\-()]{7,15}$/.test(data.phone.trim())) errors.phone = "Invalid phone number";
  if (!data.line1.trim()) errors.line1 = "Address is required";
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.state.trim()) errors.state = "State is required";
  if (!data.pincode.trim()) errors.pincode = "PIN code is required";
  else if (!/^\d{6}$/.test(data.pincode.trim())) errors.pincode = "Invalid PIN code (6 digits)";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, loading } = useCart();

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "error" | "retry">("idle");
  const [submitError, setSubmitError] = useState("");
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useRazorpayScript();

  const discountAmount = 0;
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  const handleBlur = useCallback((field: keyof FormData) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched.has(field)) {
      const newErrors = validateForm({ ...form, [field]: value });
      setErrors((prev) => {
        const next = { ...prev };
        if (newErrors[field]) next[field] = newErrors[field];
        else delete next[field];
        return next;
      });
    }
  }

  function fieldError(field: keyof FormData): string | undefined {
    return touched.has(field) ? errors[field] : undefined;
  }

  function inputClass(field: keyof FormData, hasError?: boolean): string {
    const err = hasError ?? fieldError(field);
    return `w-full text-sm border rounded-lg px-3 py-2.5 outline-none transition-colors ${
      err ? "border-red-400 focus:border-red-500" : "border-neutral-300 focus:border-neutral-900"
    }`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setTouched(new Set(["name", "email", "phone", "line1", "line2", "city", "state", "pincode"]));

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitState("loading");
    setSubmitError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name.trim(),
          customer_email: form.email.trim(),
          customer_phone: form.phone.trim() || null,
          shipping_address: {
            line1: form.line1.trim(),
            line2: form.line2.trim() || null,
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
          discount_code: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Checkout failed");
      }

      const data = await res.json();
      setCheckoutData(data);
      openRazorpay(data, form.email.trim(), router);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong");
      setSubmitState("retry");
    }
  }

  function handleRetry() {
    setSubmitState("idle");
    setSubmitError("");
    setCheckoutData(null);
  }

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-neutral-500 mb-6">Your cart is empty</p>
        <Link href="/shop" className="text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-neutral-200 rounded" />
          <div className="grid lg:grid-cols-[1fr_360px] gap-12">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-neutral-100 rounded-lg" />)}
            </div>
            <div className="h-64 bg-neutral-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-heading text-2xl text-neutral-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid lg:grid-cols-[1fr_360px] gap-12 items-start">
        {/* Form */}
        <div className="space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-sm font-medium text-neutral-900 mb-4">Contact</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  placeholder="Full name"
                  className={inputClass("name")}
                />
                {fieldError("name") && <p className="text-xs text-red-500 mt-1">{fieldError("name")}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                  {fieldError("email") && <p className="text-xs text-red-500 mt-1">{fieldError("email")}</p>}
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="+91 98765 43210"
                    className={inputClass("phone")}
                  />
                  {fieldError("phone") && <p className="text-xs text-red-500 mt-1">{fieldError("phone")}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-sm font-medium text-neutral-900 mb-4">Shipping Address</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => handleChange("line1", e.target.value)}
                  onBlur={() => handleBlur("line1")}
                  placeholder="Street address, house no."
                  className={inputClass("line1")}
                />
                {fieldError("line1") && <p className="text-xs text-red-500 mt-1">{fieldError("line1")}</p>}
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => handleChange("line2", e.target.value)}
                  placeholder="Apartment, landmark (optional)"
                  className={inputClass("line2")}
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    onBlur={() => handleBlur("city")}
                    placeholder="Mumbai"
                    className={inputClass("city")}
                  />
                  {fieldError("city") && <p className="text-xs text-red-500 mt-1">{fieldError("city")}</p>}
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">State *</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    onBlur={() => handleBlur("state")}
                    placeholder="Maharashtra"
                    className={inputClass("state")}
                  />
                  {fieldError("state") && <p className="text-xs text-red-500 mt-1">{fieldError("state")}</p>}
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    onBlur={() => handleBlur("pincode")}
                    placeholder="400001"
                    maxLength={6}
                    className={inputClass("pincode")}
                  />
                  {fieldError("pincode") && <p className="text-xs text-red-500 mt-1">{fieldError("pincode")}</p>}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Summary & Pay */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-medium text-neutral-900">Order Summary</h2>

            {/* Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-12 bg-neutral-200 rounded shrink-0 overflow-hidden">
                    {item.image && (
                      <img src={item.image.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-neutral-400 capitalize">
                      {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-neutral-900 shrink-0">₹{item.line_total.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-neutral-500">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-neutral-400">
                  Add ₹{(500 - subtotal).toLocaleString()} more for free shipping
                </p>
              )}
              <div className="flex justify-between text-base font-medium pt-2 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {submitState === "retry" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600 space-y-2">
                <p>{submitError}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="underline underline-offset-2 hover:text-red-700"
                >
                  Edit form and retry
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitState === "loading"}
              className="w-full text-sm bg-neutral-900 text-white rounded-lg py-3 hover:bg-neutral-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitState === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </span>
              ) : (
                `Pay ₹${total.toLocaleString()}`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function openRazorpay(data: any, email: string, router: ReturnType<typeof useRouter>) {
  const options = {
    key: data.razorpay_key_id,
    amount: data.amount,
    currency: data.currency,
    name: "Fashion Apparel",
    description: `Order ${data.order_number}`,
    order_id: data.razorpay_order_id,
    handler(response: any) {
      if (response.razorpay_payment_id) {
        sessionStorage.setItem("order_email", email);
        router.push(`/order-confirmation/${data.order_number}`);
      }
    },
    modal: {
      ondismiss() {
        // User closed the Razorpay modal — stay on checkout, form data intact
      },
    },
    prefill: {
      contact: "",
      email: "",
    },
    theme: {
      color: "#171717",
    },
  };

  const razorpay = new (window as any).Razorpay(options);
  razorpay.on("payment.failed", function () {
    // Payment failed — stay on checkout
  });
  razorpay.open();
}
