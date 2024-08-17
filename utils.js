export const convertWeiToEth = (wei) => {
  const eth = wei / 10 ** 18;
  return eth.toFixed(4);
};

export const convertEthToWei = (eth) => {
    const ethAmount = parseFloat(eth);
    const wei = Math.floor(ethAmount * Math.pow(10, 18));
    return wei.toString()
}