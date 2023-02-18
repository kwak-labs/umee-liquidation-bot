export async function registeredTokens(RpcQueryClient) {
  return await RpcQueryClient.umee.leverage.v1.registeredTokens();
}
