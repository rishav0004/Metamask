import { convertEthToWei } from "../../utils";

const provider = window.ethereum;

export const MetaMaskService = {
  disconnectAccount: () => {
    // return provider.close();
    return provider.on("disconnect", (error) =>
      console.log("disconnect error", error)
    );
  },

  connectAccount: () => {
    return provider.enable();
  },

  isConnected: () => {
    return provider.isConnected();
  },

  connectAllAccounts: () => {
    return provider.request({ method: "eth_requestAccounts" });
  },

  getAccountBalance: (accountId) => {
    return provider.request({
      method: "eth_getBalance",
      params: [String(accountId), "latest"],
    });
  },

  sendTransaction: ({fromAccountId, toAccountId, amount}) => {
    let params = [
      {
        from: fromAccountId,
        to: toAccountId,
        value: convertEthToWei(amount),
      },
    ];
    console.log('params-->',params);
    return provider.request({ method: "eth_sendTransaction", params });
  },
};
