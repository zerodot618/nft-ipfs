import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  // walletConnected 追踪用户的钱包是否已连接
  const [walletConnected, setWalletConnected] = useState(false);
  // loading 设置加载状态
  const [loading, setLoading] = useState(false);
  // tokenIdsMinted 跟踪已经被铸造的tokenIds的数量
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // 创建一个对Web3Modal的引用（用于连接到Metamask），只要页面打开就会持续存在
  const web3ModalRef = useRef();

  /**
   * publicMint: 铸造 NFT
   */
  const publicMint = async () => {
    try {
      console.log("Public mint");
      // 写操作 需要signer
      const signer = await getProviderOrSigner(true);
      // 创建合约
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // 调用合约方法
      const tx = await nftContract.mint({
        // 0.01 是 LW3Punks NFT 的价格
        // 我们正在使用ethers.js的utils库将`0.01`字符串解析为以太数量
        value: utils.parseEther("0.01"),
      });
      setLoading(true);
      // 等待铸造完成
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a LW3Punk!");
    } catch (err) {
      console.error(err);
    }
  };

  /*
        connectWallet: 连接钱包
      */
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      console.log("tokenIds", _tokenIds);
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Mumbai network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();

      getTokenIdsMinted();

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  /*
        renderButton: Returns a button based on the state of the dapp
      */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./LW3punks/1.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by LW3Punks</footer>
    </div>
  );
}