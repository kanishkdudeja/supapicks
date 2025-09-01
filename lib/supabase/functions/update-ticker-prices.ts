import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const jsonResponse = (body, status) =>
  new Response(JSON.stringify(body), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });

const createSupabaseClient = (req) =>
  createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization"),
        },
      },
    },
  );

async function updateTickerPrice(supabaseClient, ticker) {
  try {
    const price = await fetchStockPriceFromYahoo(ticker);
    if (!price) {
      return {
        ticker,
        success: false,
        error: "Failed to fetch price from Yahoo Finance.",
      };
    }
    const { error: updateError } = await supabaseClient.from("tickers").upsert(
      {
        ticker,
        price,
        updated_at: "now()",
      },
      {
        onConflict: "ticker",
      },
    );
    if (updateError) {
      return {
        ticker,
        success: false,
        error: updateError.message,
      };
    }
    return {
      ticker,
      success: true,
      price,
    };
  } catch (error) {
    return {
      ticker,
      success: false,
      error: error.message,
    };
  }
}

async function fetchStockPriceFromYahoo(ticker) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
  try {
    const response = await fetch(yahooUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch stock price for ${ticker}: ${response.statusText}`,
      );
    }
    const data = await response.json();
    const currentPrice = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!currentPrice || currentPrice <= 0) {
      throw new Error(`Invalid or no price found for ${ticker}.`);
    }
    return currentPrice;
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error.message);
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const supabaseClient = createSupabaseClient(req);
    const { data: tickers, error: tickersError } = await supabaseClient
      .from("tickers")
      .select("ticker");
    if (tickersError) {
      throw new Error(`Error fetching tickers: ${tickersError.message}`);
    }
    if (!tickers || tickers.length === 0) {
      return jsonResponse(
        {
          message: "No tickers found to update.",
        },
        200,
      );
    }

    const uniqueTickers = tickers.map((t) => t.ticker);
    const results = await Promise.all(
      uniqueTickers.map((ticker) => updateTickerPrice(supabaseClient, ticker)),
    );
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    return jsonResponse(
      {
        message: "Ticker prices update completed.",
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        results,
      },
      200,
    );
  } catch (err) {
    console.error("An unhandled error occurred:", err);
    return jsonResponse(
      {
        message: err.message,
      },
      500,
    );
  }
});
