import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json(
      { error: "Ticker symbol is required" },
      { status: 400 },
    );
  }

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

    const response = await fetch(yahooUrl);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Yahoo Finance API error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();

    // Check if the ticker exists and has data
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return NextResponse.json(
        { error: "Stock not found or invalid ticker symbol" },
        { status: 404 },
      );
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    if (meta.currency !== "USD" && meta.currency !== "USX") {
      return NextResponse.json(
        { error: "Please choose a USD denominated security" },
        { status: 400 },
      );
    }

    const currentPrice = meta.regularMarketPrice;

    // Get company name from meta
    const companyName = meta.shortName || meta.longName || ticker;

    if (!currentPrice || currentPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid data received" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      symbol: ticker.toUpperCase(),
      price: currentPrice,
      companyName: companyName,
    });
  } catch (error) {
    console.error("Error fetching ticker price:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker price. Please try again." },
      { status: 500 },
    );
  }
}
