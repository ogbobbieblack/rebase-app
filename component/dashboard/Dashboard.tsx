useClient;

import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useAccount, useBalance, useClient, useReadContract } from "wagmi";
import {
  pegAssetToken,
  rebaseABI,
  rebaseAIToken,
  DEADWALLET,
} from "../constant/rebaseABI";
import { useIsMounted } from "../useIsMounted";
import {
  calcSell,
  calcBNBPrice,
  calcPegAssetSell,
} from "../priceFeed/isTokenPrice";

//Animations
import dashboardAnimation from "./dashboardAnimation.json";
import burnAnimation from "./burnAnimation.json";
import dynamic from "next/dynamic";
import Image from "next/image";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import logo from "./logo.png";

function rebaseCalc(cp: any, pt: any, rl: any) {
  return (((cp - pt) / pt) * 100) / rl;
}

function mul(pg: any, pga: any) {
  return pg * pga;
}

function rebasePL(rp: any, p: any, cb: any) {
  return (rp * cb) / p;
}

const Dashboard = () => {
  const [getPrice, setGetPrice] = useState(0);
  const [getPegAssetPrice, setGetPegAssetPrice] = useState(0);
  const mounted = useIsMounted();
  const { address } = useAccount();

  const rebaseLag = 5;
  const rebaseCap = 10;
  const priceTarget = 0.0005;
  const baseg_baseline = 15;
  const rebase_percent = 100;

  const balance = useBalance({
    address: address,
    token: rebaseAIToken,
  });

  const amountBurnt = useBalance({
    address: DEADWALLET,
    token: rebaseAIToken,
  });

  const PegSymbol = useBalance({
    address: address,
    token: pegAssetToken,
  });

  const { data: rebaseCount } = useReadContract({
    abi: rebaseABI,
    address: rebaseAIToken,
    functionName: "rebaseCount",
  });
  const { data: nextRebaseTimeStamp } = useReadContract({
    abi: rebaseABI,
    address: rebaseAIToken,
    functionName: "nextRebaseTimeStamp",
  });

  // balance.data?.formatted
  // const rebaseAmount = (rebasePL.apply(undefined, [500, rebase_percent, rebaseCalc
  //   .apply(undefined, [getPrice, priceTarget, rebaseLag])
  //   .toFixed(2)]) || "0");

  const userBalance = mul.apply(undefined, [
    getPrice.toFixed(4),
    balance.data?.formatted,
  ]).toFixed(2) || "0";

  const pegPrice = mul.apply(undefined, [
    baseg_baseline,
    getPegAssetPrice.toFixed(11),
  ]).toFixed(4) || "0";

  const rebasePercent = rebaseCalc.apply(undefined, [getPrice, priceTarget, rebaseLag]).toFixed(2) || "0";

  const tokenBurnt = mul.apply(undefined, [
    getPrice.toFixed(11),
    amountBurnt.data?.formatted,
  ]).toFixed(2) || "0";

  const rebaseFixToCap = rebasePercent >= rebaseCap.toString() ? rebaseCap : rebasePercent;

  const rebaseProfitOrLoss = (rebasePL.apply(undefined, [balance.data?.formatted, rebase_percent, rebaseFixToCap]) || "0");

  useEffect(() => {
    const rebaseAIPrice = async () => {
      try {
        const bnbPrice = await calcBNBPrice(); // query swap to get the price of BNB in USDT
        const tokens_to_sell = 1;
        const priceInBnb = await calcSell(tokens_to_sell); // calculate TOKEN price in BNB
        const priceInUSD = priceInBnb * bnbPrice;
        setGetPrice(priceInUSD);
      } catch (err) { }
    };

    const pegAssetPrice = async () => {
      try {
        const bnbPrice = await calcBNBPrice(); // query swap to get the price of BNB in USDT
        const tokens_to_sell = 1;
        const priceInBnb = await calcPegAssetSell(tokens_to_sell); // calculate TOKEN price in BNB
        const priceInUSD = priceInBnb * bnbPrice;
        setGetPegAssetPrice(priceInUSD);
      } catch (err) { }
    };

    rebaseAIPrice();
    pegAssetPrice();

  }, []);

  return (
    <div className="grainy w-full min-h-screen px-4 sm:px-36 py-12 flex flex-col gap-12">
      <div className="flex justify-between w-full items-center gap-10">
        <a href="https://basegains.com/">
          <Image
            src={logo}
            width={30}
            height={30}
            className="w-16 rounded-full border-4 border-black"
            alt=""
          />
        </a>
        <ConnectButton />
      </div>
      <main className=" grid gap-4 items-center  justify-center grid-cols-1 sm:grid-cols-4">
        <div className="w-full sm:col-span-3 sm:text-2xl flex sm:flex-row flex-col-reverse items-center  justify-between border-4 px-10 py-8 sm:px-4 bg-blue-600 border-orange-600 text-white text-xl">
          <p className="text-4xl font-bold">
            Your current $BASEG balance is{" "}
            <span className="inline-block">
              {mounted
                ? balance && (
                  <p>
                    {balance.data?.formatted} {balance.data?.symbol} {" "} {"("} {"$"}{userBalance}{")"}
                  </p>
                )
                : null}
            </span>
          </p>
          <Lottie
            className="w-1/2 sm:h-[250px] inline-block "
            animationData={dashboardAnimation}
          />
        </div>

        {/* FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART  */}

        <div className="text-black text-lg sm:text-sm font-semibold gray border-blue-600 border-4 px-10 py-10 sm:py-20 sm:px-2 gap-4">
          <div className="flex flex-col gap-4 items-start">
            <h2 className="text-2xl font-bold">Peg Information</h2>
            <h5>
              PEG ASSET:
              {mounted ? PegSymbol && <p>{PegSymbol.data?.symbol}</p> : null}
            </h5>
            <h5>
              PEG ASSET PRICE:
              {mounted && (
                <p>
                  {"$"}
                  {getPegAssetPrice.toFixed(11) || "0"}
                </p>
              )}{" "}
            </h5>
            <h5>
              $BASEG PEG PRICE:
              {mounted
                ? PegSymbol && (
                  <p>
                    {baseg_baseline} * {PegSymbol.data?.symbol}
                  </p>
                )
                : null}{" "}
              {mounted
                ? balance && (
                  <p>
                    {"$"}
                    {pegPrice}
                  </p>
                )
                : null}{" "}
            </h5>
          </div>
        </div>

        {/* THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE */}

        <div className="bg-orange-600 text-lg sm:col-span-2 sm:text-2xl font-semibold text-white border-blue-600 border-4 px-10 py-8 sm:px-4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-4xl font-bold">Rebase Information</h2>
          <h5>
            Rebase Epoch:
            {mounted && <p>{rebaseCount?.toString()}</p>}
          </h5>
          <h5>
            Next Rebase Timestamp:{" "}
            {mounted && <p>{nextRebaseTimeStamp?.toString()}</p>}{" "}
          </h5>
          <h5>
            Rebase Lag: <p>{rebaseLag}</p>
          </h5>
          <h5>
            Rebase Cap:
            <p>
              {rebaseCap}
              {"%"}
            </p>
          </h5>
        </div>

        <div className="bg-black text-lg sm:col-span-2 sm:text-2xl text-white border-orange-600 border-4 px-10 py-10 sm:px-4 flex flex-col gap-4">
          <h2 className="text-2xl sm:text-4xl font-bold">Rebase Stats</h2>
          <h5>
            Oracle Price:{" "}
            {mounted
              ? balance && (
                <p>
                  {"$"}
                  {getPrice.toFixed(11) || "0"}
                </p>
              )
              : null}
          </h5>
          <h5>
            {" "}
            Price target:{""}
            {mounted
              ? balance && (
                <p>
                  {"$"}
                  {priceTarget.toFixed(11) || "0"}
                </p>
              )
              : null}
          </h5>
          <h5>
            Rebase %:
            {mounted
              ? balance && (
                <p>
                  {rebaseFixToCap}

                  {"%"}
                </p>
              )
              : null}{" "}
          </h5>
        </div>

        {/* FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART  */}

        {/* FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART 
        FIX THIS PART  */}

        <div className="text-white text-lg sm:text-sm font-semibold bg-blue-600 border-black border-4 px-10 py-10 sm:py-16 sm:px-2 gap-10">
          <div className="flex flex-col gap-4 items-start">
            <h2 className="text-2xl font-bold">Your Expected Base Gains For Today</h2>
            <h5>
              REBASE AMOUNT:
              {mounted ? balance && <p>{rebaseProfitOrLoss}{" "} {balance.data?.symbol}</p> : null}
            </h5>
            <h5>
              REBASE VALUE (USD)
              {mounted && <p>{mul.apply(undefined, [getPrice.toFixed(11), rebaseProfitOrLoss] || "0")}</p>}{" "}
            </h5>
            <h5>
              COMPOUNDED INTEREST:
              {mounted && <p>{nextRebaseTimeStamp?.toString()}</p>}{" "}
            </h5>
          </div>
        </div>

        {/* THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE */}

        <div className="text-black sm:col-span-3 text-lg font-semibold sm:text-2xl gray border-blue-600 border-4 px-10 py-10 sm:px-4 flex sm:flex-row-reverse justify-between flex-col gap-4">
          <Lottie
            className="w-1/2 sm:h-[200px] inline-block"
            animationData={burnAnimation}
          />
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl sm:text-4xl font-bold">
              Total Tokens Burnt
            </h2>
            <h5>
              $BASEG TOKENS BURNT:
              {mounted
                ? amountBurnt && (
                  <p>
                    {amountBurnt.data?.formatted} {""} {amountBurnt.data?.symbol}
                  </p>
                )
                : null}
            </h5>
            <h5>
              USD VALUE:
              {mounted
                ? amountBurnt
                && (
                  <p>
                    {"$"}
                    {tokenBurnt}
                  </p>
                )
                : null}{" "}
            </h5>
          </div>
        </div>

        {/* THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE
      THE PART ENDS HERE */}
      </main>
    </div>
  );
  //   //   const balance = getBalance(config, {
  //   //     address: address,
  //   //     token: process.env.REBASED_AI_CA,
  //   //   })
  //   return (
  //     <div>
  //       <div className={styles.container}>
  //         <main className={styles.main}>

  //         </main>
  //       </div>
  //     </div>
  //   );
};

export default Dashboard;
