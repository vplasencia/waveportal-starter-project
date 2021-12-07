import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import "./styles/output.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xEc92aB58f2685831cabCA9EA9358F30453fF102F";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="flex place-content-center px-2">
      <div className="mt-5">
        <div className="text-gray-800 text-3xl font-semibold text-center">
          <span role="img" aria-label="wave">
            👋
          </span>
          <span>Hey there!</span>
        </div>

        <div className="text-gray-600 text-center my-5">
          I am Vivian. Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount && (
          <button
            className="w-full text-white px-3 py-3 bg-blue-600 hover:bg-blue-700 rounded-md"
            onClick={wave}
          >
            Wave at Me
          </button>
        )}

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button
            className="w-full text-white px-3 py-3 bg-blue-600 hover:bg-blue-700 rounded-md"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
