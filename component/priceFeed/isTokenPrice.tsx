// import rebaseABI from "../constant/abi/TOKEN.json";
import { rebaseABI, swapABI, BASE_MAINNET_RPC, usdt, rebaseAIToken, router, weth } from "../constant/rebaseABI";
import { ethers } from "ethers";

const pancakeSwapContractMainnet = router.toLowerCase();
const MainHepperToken = rebaseAIToken;
const baseNode = BASE_MAINNET_RPC;
const BNBMainnetTokenAddress = weth; //BNB
const USDMainnetTokenAddress = usdt; //USDC
const bnbToSell = ethers.parseEther("1");

export async function calcSell(tokensToSell: any) {
    const provider = new ethers.JsonRpcProvider(baseNode)

  const tokenRouter = new ethers.Contract(MainHepperToken, rebaseABI, provider);

  let tokenDecimals = await tokenRouter.decimals();

  tokensToSell = setDecimals(tokensToSell, tokenDecimals);
  let amountOut;
  try {
    let router = new ethers.Contract(
      pancakeSwapContractMainnet,
      swapABI,
      provider
    );
    amountOut = await router.getAmountsOut(tokensToSell, [
      MainHepperToken,
      BNBMainnetTokenAddress,
    ]);
    amountOut = ethers.formatEther(amountOut[1]);
  } catch (error) {}

  if (!amountOut) return 0;
  return amountOut;
}

export async function calcBNBPrice() {
  let amountOut;
  try {
    const provider = new ethers.JsonRpcProvider(baseNode)

    const router = new ethers.Contract(
      pancakeSwapContractMainnet,
      swapABI,
      provider
    );
    const usdc = new ethers.Contract(
      USDMainnetTokenAddress,
      rebaseABI,
      provider
    );
    amountOut = await router.getAmountsOut(bnbToSell, [
      BNBMainnetTokenAddress,
      USDMainnetTokenAddress,
    ]);
    const USDCdecimals = await usdc.decimals();
    amountOut = ethers.formatUnits(amountOut[1], USDCdecimals);
  } catch (error) {}
  if (!amountOut) return 0;
  return amountOut;
}

export async function holderBalance(address: any) {
  const provider = new ethers.JsonRpcProvider(baseNode);
  const tokenRouter = new ethers.Contract(MainHepperToken, rebaseABI, provider);

  const tokenBalance = await tokenRouter.balanceOf(address);
  const tknBal = tokenBalance?.toString();

  return tknBal;
}

export function setDecimals(number: string, decimals: number) {
  number = number.toString();
  let numberAbs = number.split(".")[0];
  let numberDecimals = number.split(".")[1] ? number.split(".")[1] : "";
  while (numberDecimals.length < decimals) {
    numberDecimals += "0";
  }
  return numberAbs + numberDecimals;
}
