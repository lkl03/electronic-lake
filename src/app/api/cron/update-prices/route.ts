import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { readCatalogFresh, writeCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * Daily price updater — called by Vercel Cron at 12:00 UTC (09:00 ART / UTC-3).
 * Fetches the current dólar blue, recalculates priceArs for all phones, and persists.
 * Secured with the CRON_SECRET environment variable.
 */
export async function POST(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : null;

  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch dólar blue
    const dollarRes = await fetch("https://dolarapi.com/v1/dolares/blue", {
      cache: "no-store",
    });
    if (!dollarRes.ok) {
      return NextResponse.json(
        { error: `Dollar API failed: HTTP ${dollarRes.status}` },
        { status: 502 }
      );
    }
    const dollarData = (await dollarRes.json()) as {
      venta?: number;
      compra?: number;
    };
    const venta = dollarData.venta;
    if (!venta || typeof venta !== "number") {
      return NextResponse.json(
        { error: "Unexpected dollar API response" },
        { status: 502 }
      );
    }
    // Same formula as the admin panel: venta + $20 buffer
    const dollarRate = Math.round(venta + 20);

    // 2. Read current catalog (always fresh — bypass ISR cache)
    const current = await readCatalogFresh();
    if (current.phones.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "Empty catalog — nothing to update",
        dollarRate,
      });
    }

    // 3. Recalculate priceArs with the fresh rate, keeping all other fields intact
    const phones = current.phones.map((p) => ({
      ...p,
      priceArs: Math.round((p.usd + (p.marginUsd ?? 0)) * dollarRate),
    }));

    const next = {
      ...current,
      dollarRate,
      phones,
      updatedAt: new Date().toISOString(),
    };

    // 4. Persist and invalidate caches
    await writeCatalog(next);
    revalidateTag("catalog", "max");
    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");

    return NextResponse.json({
      ok: true,
      dollarRate,
      prevDollarRate: current.dollarRate,
      updatedPhones: phones.length,
      updatedAt: next.updatedAt,
    });
  } catch (err) {
    console.error("[cron/update-prices]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

// Allow GET for manual health checks (no auth required, no side effects)
export async function GET() {
  return NextResponse.json({
    endpoint: "cron/update-prices",
    schedule: "0 12 * * * (UTC) = 09:00 ART",
    description: "Fetches dólar blue and recalculates all catalog priceArs",
  });
}
