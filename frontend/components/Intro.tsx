import dynamic from "next/dynamic";
import Image from "next/image";
import { ConnectButton, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  getAccount,
  fetchBalance,
  readContract,
  writeContract,
  waitForTransaction,
} from "@wagmi/core";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
} from "wagmi";
import React, { useState, useEffect } from "react";
import LoadingScreen from "./Loading";
import { parseEther } from "viem";
import YoutubeContract from "../contract/contract.json";
import { send } from "process";

const Intro = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>("");
  const [youtubeId, setYoutubeId] = useState<string>("");

  const contractAddress = "0xFefDadb1c553a2d19ED43F6Aab0C7251470db1BA";

  const contractConfig = {
    address: contractAddress,
    abi: YoutubeContract.abi,
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setYoutubeId(event.target.value);
  };

  const handleSubmit = () => {
    // Handle the submission of the YouTube ID here
    sendRequest();
    console.log("YouTube ID:", inputValue);
  };

  const handleBet = async (position: number) => {
    //const parsedEth = ethers.utils.parseEther() || 0;
    console.log("Position: ", position);
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: YoutubeContract.abi,
        functionName: "placeBet",
        args: [position], //set positions
        value: parseEther((0.001).toString()),
      });
      setLoading(true);
      await waitForTransaction({
        hash,
      });

      setLoading(false);
      setMinted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const sendRequest = async () => {
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: YoutubeContract.abi,
        functionName: "request",
        args: [youtubeId], 
      });
      setLoading(true);
      await waitForTransaction({
        hash,
      });

      setLoading(false);
      setMinted(true);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   handleBet(position);
  // }, [position]);

  return (
    <div className="bg-black h-screen w-full ">
      <>
        {!loading && (
          <div className="flex flex-col md:flex-row px-5 justify-center lg:mr-16 h-screen w-full">
            <div className="relative flex w-full h-screen content-center items-center justify-center md:h-screen z-10 bg-gradient-to-b from-black  to-slate-300">
              <div className="container relative mx-auto p-16 md:p-0">
                <div className="flex flex-col  items-center justify-center -mt-6 md:mt-0 sm:-ml-0 md:-ml-12">
                  <div className="text-center md:text-left md:ml-16 space-x-2 space-y-2">
                    {!loading && !minted && (
                      <>
                        <h1 className="text-3xl md:text-5xl font-bold text-center text-white ">
                          Place Your Bets
                        </h1>
                        <p className="text-white text-center text-xl">
                          Choose your range of how many views this Youtube video
                          will get in month
                        </p>
                        <p className="text-white text-center">
                          Using an offchain oracle, we will determine the number
                          of views in a trustless manner
                        </p>

                        <div className="flex justify-center items-center">
                          <div className="flex space-x-4">
                            <button
                              className="bg-blue-500 px-4 py-2 text-white rounded-full"
                              onClick={() => {
                                setPosition(0);
                                handleBet(position);
                              }}
                            >
                              1-100
                            </button>
                            <button
                              className="bg-blue-500 px-4 py-2 text-white rounded-full"
                              onClick={() => {
                                setPosition(1);
                                handleBet(position);
                              }}
                            >
                              101-1000
                            </button>
                          </div>

                          <div className="mx-4">
                            <button
                              className="bg-blue-500 px-4 py-2 text-white rounded-full"
                              onClick={() => {
                                setPosition(2);
                                handleBet(position);
                              }}
                            >
                              1001-5000
                            </button>
                          </div>

                          <div className="flex space-x-4">
                            <button
                              className="bg-blue-500 px-4 py-2 text-white rounded-full"
                              onClick={() => {
                                setPosition(3);
                                handleBet(position);
                              }}
                            >
                              5001-10000
                            </button>
                            <button
                              className="bg-blue-500 px-4 py-2 text-white rounded-full"
                              onClick={() => {
                                setPosition(4);
                                handleBet(position);
                              }}
                            >
                              10001-∞
                            </button>
                          </div>
                        </div>
                        <div className="items-center text-center pt-20">
                        <p className="text-white "> admin only</p>
                          <input
                            type="text"
                            placeholder="Enter YouTube ID"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="border px-2 py-1"
                          />
                          <button
                            onClick={handleSubmit}
                            className="bg-blue-500 px-4 py-2 text-white ml-2"
                          >
                            Submit
                          </button>
                          
                        </div>
                      </>
                    )}

                    {minted && (
                      <div
                        className="max-w-xs m-auto bg-green-500 text-sm text-white rounded-md shadow-lg dark:bg-green-900"
                        role="alert"
                      >
                        <div className="flex p-4">
                          <span>Success. Click to close.</span>

                          <div className="ml-auto">
                            <button
                              type="button"
                              onClick={() => setMinted(false)}
                              className="inline-flex flex-shrink-0 justify-center items-center h-4 w-4 rounded-md text-white/[.5] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-600 transition-all text-sm dark:focus:ring-offset-gray-900 dark:focus:ring-gray-800"
                            >
                              <span className="sr-only">Close</span>
                              <svg
                                className="w-3.5 h-3.5"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0.92524 0.687069C1.126 0.486219 1.39823 0.373377 1.68209 0.373377C1.96597 0.373377 2.2382 0.486219 2.43894 0.687069L8.10514 6.35813L13.7714 0.687069C13.8701 0.584748 13.9882 0.503105 14.1188 0.446962C14.2494 0.39082 14.3899 0.361248 14.5321 0.360026C14.6742 0.358783 14.8151 0.38589 14.9468 0.439762C15.0782 0.493633 15.1977 0.573197 15.2983 0.673783C15.3987 0.774389 15.4784 0.894026 15.5321 1.02568C15.5859 1.15736 15.6131 1.29845 15.6118 1.44071C15.6105 1.58297 15.5809 1.72357 15.5248 1.85428C15.4688 1.98499 15.3872 2.10324 15.2851 2.20206L9.61883 7.87312L15.2851 13.5441C15.4801 13.7462 15.588 14.0168 15.5854 14.2977C15.5831 14.5787 15.4705 14.8474 15.272 15.046C15.0735 15.2449 14.805 15.3574 14.5244 15.3599C14.2437 15.3623 13.9733 15.2543 13.7714 15.0591L8.10514 9.38812L2.43894 15.0591C2.23704 15.2543 1.96663 15.3623 1.68594 15.3599C1.40526 15.3574 1.13677 15.2449 0.938279 15.046C0.739807 14.8474 0.627232 14.5787 0.624791 14.2977C0.62235 14.0168 0.730236 13.7462 0.92524 13.5441L6.59144 7.87312L0.92524 2.20206C0.724562 2.00115 0.611816 1.72867 0.611816 1.44457C0.611816 1.16047 0.724562 0.887983 0.92524 0.687069Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
