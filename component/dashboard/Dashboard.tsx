useClient;
import React, { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "./Dashboard.module.css";
import { useAccount, useBalance, useClient, useReadContract } from "wagmi";
import { rebaseABI, tokenAddr } from "../constant/rebaseABI";
import { useIsMounted } from "../useIsMounted";
import {
  calcSell,
  calcBNBPrice,
} from "../priceFeed/isTokenPrice";

function rebaseCalc(cp: any, pt: any, rl: any) {
  return (((cp - pt) / pt) * 100) / rl;
}

const Dashboard = () => {
  const [getPrice, setGetPrice] = useState(0);
  const [getAmount, setGetAmount] = useState(0);
  const mounted = useIsMounted();
  const { address } = useAccount();

  const rebaseLag = 10;
  const rebaseCap = 20;
  const priceTarget = 0.0005;

  const balance = useBalance({
    address: address,
    token: tokenAddr,
  });

  const { data: rebaseCount } = useReadContract({
    abi: rebaseABI,
    address: tokenAddr,
    functionName: "rebaseCount",
  });
  const { data: nextRebaseTimeStamp } = useReadContract({
    abi: rebaseABI,
    address: tokenAddr,
    functionName: "nextRebaseTimeStamp",
  });
  const { data: balance0f } = useReadContract({
    abi: rebaseABI,
    address: tokenAddr,
    functionName: 'balanceOf',
    args: [address]
  })

  useEffect(() => {
    const price = async () => {
      try {
        const bnbPrice = await calcBNBPrice(); // query swap to get the price of BNB in USDT
        const tokens_to_sell = 1;
        const priceInBnb = await calcSell(tokens_to_sell); // calculate TOKEN price in BNB
        const priceInUSD = priceInBnb * bnbPrice;
        setGetPrice(priceInUSD);
      } catch (err) {}
    };

    const holdings = async () => {
      try {
        const bnbPrice = await calcBNBPrice(); // query swap to get the price of BNB in USDT
        const priceInBnb = await calcSell(balance0f?.toString()); // calculate TOKEN price in BNB
        const priceInUSD = priceInBnb * bnbPrice;
        setGetAmount(priceInUSD);
      } catch (err) {}
    };
    price();
    holdings();
  }, [balance0f]);

  return (
    <div>
      <ConnectButton />
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.description}>
            Welcome user {mounted ? address && <p>{address}</p> : null}
          </p>
          <p className={styles.title}>
            Your token balance is{" "}
            <span>
              {mounted
                ? balance && (
                    <p>
                      {balance.data?.formatted} {balance.data?.symbol}
                      {" "}{"($"}{getAmount.toFixed(4) || "0"}{")"}
                    </p>
                  )
                : null}
            </span>
          </p>
        </div>

        <div className={styles.grid}>
          <span className={styles.card}>
            <h2>Rebase Counts</h2>
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
          </span>

          <span className={styles.card}>
            <h2>Rebase Stats</h2>
            <h5>
              Oracle Price:{" "}
              {mounted
                ? balance && (
                    <p>
                      {"$"}{getPrice.toFixed(11) || "0"}
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
                      {rebaseCalc.apply(undefined, [
                        getPrice,
                        priceTarget,
                        rebaseLag,
                      ]).toFixed(2) || '0'}{"%"}
                    </p>
                  )
                : null}{" "}
            </h5>
          </span>

          <span className={styles.card}>
            <h2>Rebase History</h2>
            <p>Discover boilerplate example RainbowKit projects.</p>
          </span>
        </div>
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
