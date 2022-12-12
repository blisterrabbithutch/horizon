import React, { useState, createContext } from "react";

import classes from "./App.module.scss";
import SwapCard from "./components/SwapCard/SwapCard";
import Header from "./components/Header/Header";
import IntroductionCard from "./components/IntroductionCard/IntroductionCard";
import ChangeNetworkCard from "./components/ChangeNetworkCard/ChangeNetworkCard";

export const Context = createContext();

const App = () => {
  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [LFJData, setLFJData] = useState();
  const [ethSwapData, setEthSwapData] = useState();
  const [CZHData, setCZHData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isMetamaskError, setIsMetamaskError] = useState(false);

  return (
    <Context.Provider
      value={{
        web3,
        setWeb3,
        accounts,
        setAccounts,
        LFJData,
        setLFJData,
        ethSwapData,
        setEthSwapData,
        CZHData,
        setCZHData,
        isLoading,
        setIsLoading,
        isMetamaskError,
        setIsMetamaskError,
      }}
    >
      <div className={classes.wrapper}>
        <Header />
        <div className={classes.content}>
          {!accounts && <IntroductionCard />}
          {accounts && !ethSwapData && <ChangeNetworkCard />}
          {accounts && ethSwapData && <SwapCard />}
        </div>
      </div>
    </Context.Provider>
  );
};

export default App;
