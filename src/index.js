import { AminoTypes, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";

import {
  cosmosAminoConverters,
  cosmosProtoRegistry,
  ibcProtoRegistry,
  ibcAminoConverters,
  umeeAminoConverters,
  umeeProtoRegistry,
  umee
} from "umeejs";

// Helper functions

import { findTargets } from "./helpers/findTargets.js";
import { filterTargets } from "./helpers/filterHighestTarget.js";
import { accountSummary } from "./helpers/accountSummary.js";
import { accountBalances } from "./helpers/accountBalances.js";
import { baseToAsset } from "./helpers/baseToAsset.js";
import { getUsdByAsset } from "./helpers/getUsd.js";
import { assetToBase } from "./helpers/assetToBase.js";
import { registeredTokens } from "./helpers/registeredTokens.js";

import config from "./config/config.json" assert { type: "json" };
import denom from "./config/ibc.json" assert { type: "json" };
import assetData from "./config/assetData.json" assert { type: "json" };

// ! For address's which occur in an error
global.badAddresss = [];

(async () => {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(config.seed_phrase, {
    prefix: "umee"
  });

  const [firstAccount] = await wallet.getAccounts();

  // Really only wanna load this one time for speed purposes
  // However maybe not for other reasons ion know yet
  let gasUsd = await getUsdByAsset("umee", baseToAsset(config.gas.fee, assetData["umee"].exponent));

  const QueryClient = await umee.ClientFactory.createRPCQueryClient({ rpcEndpoint: config.rpc_endpoint });

  const SigningClient = await SigningStargateClient.connectWithSigner(config.rpc_endpoint, wallet, {
    registry: new Registry([...cosmosProtoRegistry, ...ibcProtoRegistry, ...umeeProtoRegistry]),
    aminoTypes: new AminoTypes({
      ...cosmosAminoConverters,
      ...ibcAminoConverters,
      ...umeeAminoConverters
    })
  });

  setInterval(main, config.interval, QueryClient, SigningClient, gasUsd, firstAccount);
})();

async function main(QueryClient, SigningClient, gasUsd, firstAccount) {
  try {
    // All the address's which can be liquidated
    let { targets } = await findTargets(QueryClient);

    if (targets.length <= 0) {
      return console.log("No valid targets");
    }

    // The target with the highest reward rate
    let target = await filterTargets(QueryClient, targets);

    // Runs when all targets are badAddress's
    if (!target) {
      return;
    }

    // Get the real world value
    let usdCollateralValue = await getUsdByAsset(target.collateral.name, target.collateral.asset);

    // Collateral + the extra incentive
    let reward = (target.collateral.asset * (1 + assetData[target.collateral.name].liquidation_incentive)).toFixed(6);

    // reward in base units
    let rewardBase = assetToBase(reward, assetData[target.collateral.name].exponent);

    let rewardUsd = (await getUsdByAsset(target.collateral.name, parseFloat(reward))).toFixed(6);

    // If the value is less than what the minium accepeted is
    if (usdCollateralValue < config.minium_usd_value) {
      // So we dont have to check it again
      badAddresss.push(target.address);

      return console.log("Value less than wanted");
    }

    // If the collateral is less then the gas
    if (rewardUsd <= gasUsd) {
      // So we dont have to check it again
      badAddresss.push(target.address);

      return console.log("This trade is not economical to complete.");
    }

    try {
      await SigningClient.simulate(
        firstAccount.address,
        [
          {
            typeUrl: "/umee.leverage.v1.MsgLiquidate",
            value: umee.leverage.v1.MsgLiquidate.fromPartial({
              liquidator: firstAccount.address,
              borrower: target.address,
              repayment: {
                denom: target.supplied.denom,
                amount: target.supplied.base
              },
              rewardDenom: target.collateral.denom
            })
          }
        ],
        config.memo
      );
    } catch (e) {
      if (e.toString().includes("liquidation would repay zero tokens")) {
        global.badAddresss.push(target.address);
        return console.log("Liquidating this person would result with no reward");
      }
    }

    // So it doesnt send a "tx already in cache" error
    global.badAddresss.push(target.address);
    let result = await SigningClient.signAndBroadcast(
      firstAccount.address,
      [
        {
          typeUrl: "/umee.leverage.v1.MsgLiquidate",
          value: umee.leverage.v1.MsgLiquidate.fromPartial({
            liquidator: firstAccount.address,
            borrower: target.address,
            repayment: {
              denom: target.supplied.denom,
              amount: target.supplied.base
            },
            rewardDenom: target.collateral.denom
          })
        }
      ],
      {
        gas: config.gas.gas,
        amount: [
          {
            denom: config.gas.denom,
            amount: config.gas.fee
          }
        ]
      },
      config.memo
    );

    console.log(result);
  } catch (e) {
    console.log(e);
  }
}
