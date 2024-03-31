import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useAccount, useChainId } from "wagmi";
import Dashboard from "../component/dashboard/Dashboard";

import logo from './logo.png'
import dynamic from 'next/dynamic';
import Image from "next/image";
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import burnAnimation from './burnAnimation.json'

const Home: NextPage = () => {
  const { address } = useAccount();
  const chainID = useChainId();

  if (!address) {
    return (
      <div className="min-h-screen relative w-full flex  text-center px-4 py-10 sm:px-32 grainy">

        <Lottie className="absolute top-[100px] right-0 w-[300px] opacity-50" animationData={burnAnimation}/>
        <Lottie className="absolute bottom-0 left-0 w-[300px] opacity-50" animationData={burnAnimation}/>
        <Lottie className="absolute inset-0 w-full h-full opacity-30" animationData={burnAnimation}/>

        <div className="pb-12 z-[4]">
          <a href="https://basegains.com/">
          <Image src={logo} width={50} height={50} className="w-24 rounded-full border-4 border-black" alt="" />
        </a>
        </div>

        <div className="flex flex-col justify-center items-center gap-10 z-[4]">
          <h1 className="sm:text-8xl text-4xl font-bold">
            Welcome to <a className="text-blue-600" href="https://basegains.com/">Base Gains <span className="text-orange-600">$BASEG</span> DApp</a>
          </h1>
          <ConnectButton />
          <h1 className="font-bold text-4xl sm:text-2xl">to View The Dashboard</h1>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <Head>
          <title>Base Gains Dapp</title>
          <meta
            content="Base Gains"
            name="description"
          />
          <link href="/favicon.ico" rel="icon" />
        </Head>
        <Dashboard />
    
        
      </div>
    );
  }
};

export default Home;
