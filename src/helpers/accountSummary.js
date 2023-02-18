// Learn about someones position

export function accountSummary(RpcQueryClient, Address) {
  return RpcQueryClient.umee.leverage.v1.accountSummary({
    address: Address
  });
}
