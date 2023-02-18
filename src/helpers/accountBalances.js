// Learn about someones position

export function accountBalances(RpcQueryClient, Address) {
  return RpcQueryClient.umee.leverage.v1.accountBalances({
    address: Address
  });
}
