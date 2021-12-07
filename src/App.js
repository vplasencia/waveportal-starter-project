import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import "./styles/output.css";
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  /*
   * All state property to store all waves
   */
  const [allWaves, setAllWaves] = useState([]);

  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0xb97ade93dF52E79D21FF7A7fC41D792C03aa92dC";
  const contractABI = abi.abi;

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
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

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        console.log("all waves", wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        getAllWaves();
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
        let message = document.getElementById("message").value;
        console.log("message", message);
        const waveTxn = await wavePortalContract.wave(message);
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

        <div className="text-gray-700 text-center my-5">
          I am Vivian. Connect your Ethereum wallet and wave at me!
        </div>

        {currentAccount && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="message" className="text-gray-700">
                Message:
              </label>
              <textarea
                name="message"
                id="message"
                cols="30"
                className="
            h-40
            p-3
            w-full
            border-blue-500 border-2
            rounded-md
            focus:outline-none
            focus:border-blue-600
            text-gray-700
          "
              ></textarea>
            </div>

            <button
              className="w-full text-white px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md"
              onClick={wave}
            >
              Wave at Me
            </button>
          </div>
        )}

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button
            className="w-full text-white px-3 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <div className="grid place-items-center gap-3 my-10">
            <div className="text-gray-700 font-medium text-xl">All waves ({allWaves.length}):</div>
            {allWaves.map((wave, index) => {
              return (
                <div
                  key={index}
                  className="bg-blue-100 text-gray-700 p-2 rounded-md"
                >
                  <div className="space-x-1">
                    <span className="font-medium">Address:</span>
                    <span>{wave.address}</span>{" "}
                  </div>
                  <div className="space-x-1">
                    <span className="font-medium">Time:</span>
                    <span>{wave.timestamp.toString()}</span>{" "}
                  </div>
                  <div className="space-x-1">
                    <span className="font-medium">Message:</span>{" "}
                    <span>{wave.message}</span>{" "}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
