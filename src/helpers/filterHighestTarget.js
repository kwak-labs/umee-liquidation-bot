import { accountBalances } from "./accountBalances.js";
import { baseToAsset } from "./baseToAsset.js";

import denom from "../config/ibc.json" assert { type: "json" };
import assetData from "../config/assetData.json" assert { type: "json" };

// This function will filter for the target with the largest bag to claim
export async function filterTargets(QueryClient, targets) {
  let highestValue;

  for (const address of targets) {
    if (global.badAddresss.includes(address)) {
      continue;
    }

    let summary = await accountBalances(QueryClient, address);

    if (highestValue == undefined || highestValue.collateral.base < summary.collateral[0].amount) {
      highestValue = {
        address,
        collateral: {
          name: denom[summary.collateral[0].denom],
          base: summary.collateral[0].amount,
          asset: baseToAsset(summary.collateral[0].amount, assetData[denom[summary.collateral[0].denom]].exponent),
          denom: summary.collateral[0].denom
        },
        supplied: {
          name: denom[summary.supplied[0].denom],
          base: summary.supplied[0].amount,
          asset: baseToAsset(summary.supplied[0].amount, assetData[denom[summary.supplied[0].denom]].exponent),
          denom: summary.supplied[0].denom
        }
      };
    }
  }

  return highestValue;
}
