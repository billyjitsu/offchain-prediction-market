import dynamic from "next/dynamic";
import Image from "next/image";
import { ConnectButton, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getAccount, fetchBalance, readContract } from "@wagmi/core";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from "wagmi";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import LoadingScreen from "./Loading";
import type {
  UseContractReadConfig,
  UsePrepareContractWriteConfig,
  UseContractWriteConfig,
  UseContractEventConfig,
} from "wagmi";
import YoutubeContract from "../contract/contract.json";

const Intro = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [eventHappened, setEventHappened] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);
  const [fullHater, setHater] = useState<boolean>(false);


  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const contractConfig = {
    address: contractAddress,
    abi: YoutubeContract.abi,
  };

  const handleDepositEth = async () => {
    const parsedEth = ethers.utils.parseEther() || 0;
    console.log(parsedEth.toString());
    if (addressIsConnected) {
      try {
        const { hash } = await writeContract({
          address: contractAddress,
          abi,
          functionName: "depositCollateral",
          value: parsedEth,
          account: connectedAddress,
        });
        setLoading(true);
        const data = await waitForTransaction({
          hash,
        });
      
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Connect wallet to update blockchain data");
    }
  };

  useEffect(() => {}, []);

  return (
    <div className="bg-black h-screen w-full ">
      <>
        {!loading && (
          <div className="flex flex-col md:flex-row px-5 justify-center lg:mr-16 h-screen w-full">
            <div className="relative flex w-full h-screen content-center items-center justify-center md:h-screen z-10 bg-gradient-to-b from-black  to-slate-300">
              <div className="container relative mx-auto p-16 md:p-0">
                <div className="flex flex-col  items-center justify-center -mt-6 md:mt-0 sm:-ml-0 md:-ml-12">
                  <div className="text-center md:text-left md:ml-16 space-x-2 space-y-5">
                    {!loading && !minted && (
                      <>
                        <h1 className="text-3xl md:text-5xl font-bold text-center text-white ">
                          Place Your Bets
                        </h1>
                        <p className="text-white text-xl">
                          Choose your range of how many views this Youtube video
                          will get in month
                        </p>
                      </>
                    )}

                    <div className="flex justify-center items-center">
                      <div className="flex space-x-4">
                        <button className="bg-blue-500 px-4 py-2 text-white">
                          1-100
                        </button>
                        <button className="bg-blue-500 px-4 py-2 text-white">
                          101-1000
                        </button>
                      </div>

                      <div className="mx-4">
                        <button className="bg-blue-500 px-4 py-2 text-white">
                          1001-5000
                        </button>
                      </div>

                      <div className="flex space-x-4">
                        <button className="bg-blue-500 px-4 py-2 text-white">
                          5001-10000
                        </button>
                        <button className="bg-blue-500 px-4 py-2 text-white">
                          10001-∞
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Screen */}
        {loading && isConnected && <LoadingScreen />}
      </>
    </div>
  );
};

// export default Intro;
export default dynamic(() => Promise.resolve(Intro), { ssr: false });
