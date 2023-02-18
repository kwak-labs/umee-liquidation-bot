import Coingecko from "coingecko-api";
import coingeckoids from "../config/coingecko.json" assert { type: "json" };

// Returns usd value of some asset
export async function getUsdByAsset(denom, amount) {
  let coingeckoId = coingeckoids[denom];
  const CoinGeckoClient = new Coingecko();
  let data = await CoinGeckoClient.simple.price({
    ids: [coingeckoId],
    vs_currencies: ["usd"]
  });

  let price = data.data[coingeckoId].usd;

  return amount * price;
}
