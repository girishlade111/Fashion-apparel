import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const productId = sp.get("product_id");

    if (!productId) {
      return NextResponse.json({ error: "product_id is required" }, { status: 400 });
    }

    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") || "10", 10) || 10));
    const offset = (page - 1) * pageSize;

    const supabase = createAdminClient();

    const countResult = await (supabase.from("reviews") as any)
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("status", "approved");
    const total = countResult.count ?? 0;

    const avgResult = await (supabase.from("reviews") as any)
      .select("rating")
      .eq("product_id", productId)
      .eq("status", "approved");
    const ratings: number[] = (avgResult.data || []).map((r: any) => r.rating);
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
        : null;

    const { data: reviews } = await (supabase.from("reviews") as any)
      .select("id, reviewer_name, rating, title, body, created_at")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      averageRating,
      totalReviews: ratings.length,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, reviewer_name, reviewer_email, rating, title, body: reviewBody } = body;

    const errors: Record<string, string> = {};
    if (!product_id) errors.product_id = "product_id is required";
    if (!reviewer_name || typeof reviewer_name !== "string" || reviewer_name.trim().length === 0)
      errors.reviewer_name = "Name is required";
    if (
      !reviewer_email ||
      typeof reviewer_email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer_email)
    )
      errors.reviewer_email = "Valid email is required";
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      errors.rating = "Rating must be an integer between 1 and 5";
    if (!reviewBody || typeof reviewBody !== "string" || reviewBody.trim().length === 0)
      errors.body = "Review body is required";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });
    }

    const supabase = createAdminClient();

    const productResult = await (supabase.from("products") as any)
      .select("id")
      .eq("id", product_id)
      .eq("status", "active")
      .single();
    if (!productResult.data) {
      return NextResponse.json({ error: "Product not found or not active" }, { status: 400 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentResult = await (supabase.from("reviews") as any)
      .select("id", { count: "exact", head: true })
      .eq("reviewer_email", reviewer_email)
      .gte("created_at", oneHourAgo);
    if ((recentResult.count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 },
      );
    }

    const { data: review, error } = await (supabase.from("reviews") as any).insert({
      product_id,
      reviewer_name: reviewer_name.trim(),
      reviewer_email,
      rating,
      title: title || null,
      body: reviewBody.trim(),
      status: "pending",
    }).select("id, status").single();

    if (error) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
