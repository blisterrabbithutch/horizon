import React, { useEffect, useState, createContext } from "react";
import classes from "./App.module.scss";
import SwapCard from "./components/SwapCard/SwapCard";
import Header from "./components/Header/Header";

import getWeb3 from "./getWeb3";
import { tokenAddresses } from "./utils";

// contracts JSON ABI
import LFJContractJson from "./contracts/LFJ.json";
import CZHContractJson from "./contracts/CZH.json";
import SwapContractJson from "./contracts/SwapContract.json";

export const Context = createContext();

const App = () => {
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [LFJData, setLFJData] = useState();
  const [ethSwapData, setEthSwapData] = useState();
  const [CZHData, setCZHData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  // connect to web3
  useEffect(() => {
    const connectToWeb3 = async () => {
      setIsLoading(true);
      try {
        const web3 = await getWeb3();
  
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();

        // Load EthSwap - receive balance of account
        const SwapContract = SwapContractJson.networks[networkId];
        if (SwapContract) {
          const SwapContractInstance = new web3.eth.Contract(SwapContractJson.abi, SwapContract.address);
          tokenAddresses['ETH'] = SwapContractInstance._address;
          setEthSwapData(SwapContractInstance);
          
          // Get the contract instance. LFJ Token
          const LFJData = LFJContractJson.networks[networkId];
          if (LFJData) {
            const LFJContractInstance = new web3.eth.Contract(LFJContractJson.abi, LFJData.address);
            setLFJData(LFJContractInstance);
            tokenAddresses['LFJ'] = LFJContractInstance._address;
          } else {
            window.alert('Token contract not deployed to detected network.');
          }

          // Load CZH Token
          const CZHData = CZHContractJson.networks[networkId];
          if (CZHData) {
            const CZHContractInstance = new web3.eth.Contract(CZHContractJson.abi, CZHData.address);
            setCZHData(CZHContractInstance);
            tokenAddresses['CZH'] = CZHContractInstance._address;
          } else {
            window.alert('Token contract not deployed to detected network.');
          }

        } else {
          window.alert('SwapContract not deployed to detected network.');
        }


        // // Set web3, accounts, and contract to the state
        setWeb3(web3);
        setAccounts(accounts);
      } catch (e) {
        // Catch any errors for any of the above operations.
        alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
        console.error(e);
      }

      setIsLoading(false);
    }

    connectToWeb3();
  }, []);

  return (
    <Context.Provider
      value={{
        web3,
        accounts,
        LFJData,
        ethSwapData,
        CZHData,
        isLoading,
        setIsLoading
      }}
    >
      <div className={classes.wrapper}>
        <Header />
        <div className={classes.content}>
          <SwapCard />
        </div>
      </div>
    </Context.Provider>
  )
}

export default App;





// как при выборе монеты создавать инстанс с ее контрактом в ганаш? в меиннете-тестнете же не так будет? не будет джейсона

// как написать конструктор контракта етхСвап который принимает на вход много токенов? или вообще с реальными токенами (но тут контракт по идее не нужен?)
// т.е. есть на бирже эфир, CZH, DOGE. как свапнуть CZH на DOGE? условно на тестнет - чтобы все операции проходили через контракт ethSwap

// понять как вытянуть все данные о свапКонтракт через траффл девелоп CLI

// как все таки по простому дебажить ганаш (мб лучше хардхет тогда) или пох? - дебаг ток через CLI?

// ИЛЬЯ - почему велью в саму функцию продажи не кидаются? sellTokens(token, _value) а кидаются через транзакцию? и почему тогда эта функция отваливается
// как добавлять много контрактов и избежать кучи if

// ИЛЬЯ -  как избавить в свап функции (и подобных местах) от IF с указанием контрактов?

// делаем доверительное управление

// вместо IF в свап функции сделать итерации по контрактам которые при создании - создаем в УТИЛС импорт json контрактов и подставляем в массив. по ним итерируемся
// мы вместо отдельного инстанса кидаем в стейт МАССИВ общие контракты и по ключу вытаскиваем инстансы (добавить метод в контракт - getИнициалы getTokenName)

// TODO:

// перенести на паблик тестнет