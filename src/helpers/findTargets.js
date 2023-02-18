// Finds all wallets which can be liqudated
export async function findTargets(RpcQueryClient) {
  let targets = await RpcQueryClient.umee.leverage.v1.liquidationTargets();
  return targets;
}
