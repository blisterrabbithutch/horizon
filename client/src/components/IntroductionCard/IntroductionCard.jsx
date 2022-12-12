import React, { useContext } from "react";
import classes from "./IntroductionCard.module.scss";
import { Typography, Button } from "antd";
import { Context } from "../../App";
import { connectToWeb3 } from "../../utils";

const { Text } = Typography;

const IntroductionCard = () => {
  const {
    setWeb3,
    setAccounts,
    setLFJData,
    setEthSwapData,
    setCZHData,
    setIsLoading,
    isMetamaskError,
    setIsMetamaskError,
  } = useContext(Context);

  const handleConnect = async () => {
    await connectToWeb3({
      setIsLoading,
      setWeb3,
      setAccounts,
      setCZHData,
      setEthSwapData,
      setLFJData,
      setIsMetamaskError,
    });
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={classes.title}>horizon swap</div>
        <Text className={classes.description}>
          Ethereum blockchain&nbsp;platform for&nbsp;swap custom
          ERC20&nbsp;tokens via&nbsp;own Solidity&nbsp;smart&nbsp;contract.
          <br />
          <br />
          The&nbsp;contract&nbsp;calculates conversion&nbsp;rate
          between&nbsp;tokens.
          <br />
          <br />
          It&nbsp;works on&nbsp;Goerli&nbsp;network.
          <br />
          <br />
        </Text>
        <Button
          type="primary"
          size="large"
          className={classes.button}
          onClick={handleConnect}
        >
          Connect Wallet
        </Button>
        {isMetamaskError && (
          <>
            <br />
            <br />
            <br />
            <Text>
              It looks like that you haven't installed Metamask. <br />
              <br />
              <a href="https://metamask.io/download/" target="_blank">
                You can download it here
              </a>
            </Text>
          </>
        )}
      </div>
    </div>
  );
};

export default IntroductionCard;
