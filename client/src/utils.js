import Web3 from "web3";

// contracts JSON ABI
import LFJContractJson from "./contracts/LFJ.json";
import CZHContractJson from "./contracts/CZH.json";
import SwapContractJson from "./contracts/SwapContract.json";

export const tokenAddresses = {
  CZH: undefined,
  LFJ: undefined,
  ETH: undefined,
};

export const connectToWeb3 = async ({
  setIsLoading,
  setWeb3,
  setAccounts,
  setCZHData,
  setEthSwapData,
  setLFJData,
  setIsMetamaskError,
}) => {
  setIsLoading(true);
  try {
    const web3 = await getWeb3();
    const network = web3.utils.hexToNumber(window.ethereum.chainId);
    console.log("network", network);
    if (network !== 5) {
      // сеттаем на ГОЕРЛИ
      console.log("changing to Goerli");
    }

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();

    // Load EthSwap - receive balance of account
    const SwapContract = SwapContractJson.networks[networkId];
    if (SwapContract) {
      const SwapContractInstance = new web3.eth.Contract(
        SwapContractJson.abi,
        SwapContract.address
      );
      tokenAddresses["ETH"] = SwapContractInstance._address;
      setEthSwapData(SwapContractInstance);

      // Get the contract instance. LFJ Token
      const LFJData = LFJContractJson.networks[networkId];
      if (LFJData) {
        const LFJContractInstance = new web3.eth.Contract(
          LFJContractJson.abi,
          LFJData.address
        );
        setLFJData(LFJContractInstance);
        tokenAddresses["LFJ"] = LFJContractInstance._address;
      } else {
        console.log("Token contract not deployed to detected network.");
      }

      // Load CZH Token
      const CZHData = CZHContractJson.networks[networkId];
      if (CZHData) {
        const CZHContractInstance = new web3.eth.Contract(
          CZHContractJson.abi,
          CZHData.address
        );
        setCZHData(CZHContractInstance);
        tokenAddresses["CZH"] = CZHContractInstance._address;
      } else {
        console.log("Token contract not deployed to detected network.");
      }
    } else {
      console.log("SwapContract not deployed to detected network.");
    }

    // // Set web3, accounts, and contract to the state
    setWeb3(web3);
    setAccounts(accounts);
  } catch (e) {
    // Catch any errors for any of the above operations.
    setIsMetamaskError(true);
    console.log(
      `Failed to load web3, accounts, or contract. Check console for details.`
    );
    console.error(e);
  }

  setIsLoading(false);
};

export const switchNetworkRequest = async (selectedNetwork) => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: selectedNetwork }],
    });
    window.location.reload();
  } catch (e) {
    throw new Error("Current network not supported");
  }
};

export const getWeb3 = () =>
  new Promise(async (resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      console.log("window.ethereum found");
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Accounts now exposed
        resolve(web3);
      } catch (error) {
        reject(error);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      // Use Mist/MetaMask's provider.
      const web3 = window.web3;
      console.log("Injected web3 detected.");
      resolve(web3);
    }
    // Fallback to localhost; use dev console port by default...
    else {
      const provider = new Web3.providers.HttpProvider(
        `https://goerli.infura.io/v3/${process.env.PROJECT_ID}`
      );
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      resolve(web3);
    }
  });
