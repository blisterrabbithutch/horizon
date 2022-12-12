import React, { useContext } from "react";
import classes from "./ChangeNetworkCard.module.scss";
import { Typography, Button } from "antd";
import { Context } from "../../App";
import { connectToWeb3 } from "../../utils";

const { Text } = Typography;

const ChangeNetworkCard = () => {
  const {
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
  } = useContext(Context);

  const handleConnect = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: web3.utils.toHex(process.env.REACT_APP_CHAIN_ID) }],
    });
    await connectToWeb3({
      setIsLoading,
      setWeb3,
      setAccounts,
      setCZHData,
      setEthSwapData,
      setLFJData,
    });
  };

  return (
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={classes.title}>wallet connected</div>
        <Text className={classes.description}>
          Selected&nbsp;network should&nbsp;be Goerli. Contract
          does&nbsp;not&nbsp;exist in&nbsp;current&nbsp;network.
          <br />
          <br />
          Change&nbsp;it to&nbsp;start&nbsp;using Horizon&nbsp;swap.
          <br />
          <br />
        </Text>
        <Button
          type="primary"
          size="large"
          className={classes.button}
          onClick={handleConnect}
        >
          Change Network
        </Button>
      </div>
    </div>
  );
};

export default ChangeNetworkCard;
