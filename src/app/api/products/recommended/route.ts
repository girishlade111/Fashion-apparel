import { NextRequest, NextResponse } from "next/server";
import { getRelated } from "@/lib/products/getRelated";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_ids, category_ids } = body;

    if (!product_ids && !category_ids) {
      return NextResponse.json(
        { error: "Provide product_ids or category_ids" },
        { status: 400 },
      );
    }

    let excludeIds: string[] = [];
    let categoryIds: string[] | undefined;

    if (product_ids && Array.isArray(product_ids) && product_ids.length > 0) {
      excludeIds = product_ids;
    }

    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      categoryIds = category_ids;
    }

    const products = await getRelated({ categoryIds, excludeIds, limit: 4 });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}
