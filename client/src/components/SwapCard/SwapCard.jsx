import React, {useState, useEffect, useContext, useCallback} from "react";
import { Typography, Button } from 'antd';
import classes from "./SwapCard.module.scss";
import {
  Input,
  Select,
  Menu,
  Dropdown,
  Radio
} from 'antd';
import { Context } from "../../App";
import { tokenAddresses } from "../../utils";

const { Option } = Select;
const { Text } = Typography;

const SwapCard = () => {
  const {web3, accounts, LFJData, ethSwapData, CZHData, isLoading, setIsLoading} = useContext(Context);

  const [inputValue, setInputValue] = useState();
  const [activeBalanceValue, setActiveBalanceValue] = useState(null);
  const [selectedBalanceToken, setSelectedBalanceToken] = useState('ETH');
  const [swapMode, setSwapMode] = useState('buy');
  const [activeConversionRate, setActiveConversionRate] = useState();
  const [exchangeConversionRate, setExchangeConversionRate] = useState();
  const [primaryTokenName, setPrimaryTokenName] = useState();
  const [exchangeTokenName, setExchangeTokenName] = useState('ETH');
  const [swapMenuList, setSwapMenuList] = useState([]);
  const [availableExchangeAmountOnSwap, setAvailableExchangeAmountOnSwap] = useState();
  const [lastTx, setLastTx] = useState('');
  const [exchangeTokenSummaryValue, setExchangeTokenSummaryValue] = useState(0);

  const handlePrimaryTokenName = async (value) => {
    setPrimaryTokenName(value);
    if (value === exchangeTokenName || exchangeTokenName === 'ETH') {
      for (let key in tokenAddresses) {
        if (key !== value && key !== 'ETH') {
          setExchangeTokenName(key);
        }
      }
    }
    const conversionRate = await ethSwapData.methods.tokenConversionRates(tokenAddresses[value]).call();
    setActiveConversionRate(conversionRate);
    getTokenBalanceOnSwap(tokenAddresses[exchangeTokenName]);
    setInputValue();
    setExchangeTokenSummaryValue(0);
  }

  const getExchangeTokenAmount = (value) => {
    if (swapMode === 'buy' || swapMode === 'sell') {
      const exchangedValue = Number(value) / Number(activeConversionRate);
      setExchangeTokenSummaryValue(exchangedValue);
    } else if (swapMode === 'swap') {
      const exchangeResult = value / Number(activeConversionRate) * Number(exchangeConversionRate);
      if (!exchangeResult) setExchangeTokenSummaryValue();
      setExchangeTokenSummaryValue(exchangeResult);
    }
  }

  const onAmountChangeBuy = e => {
    const { value } = e.target;
    setInputValue(value);
    getExchangeTokenAmount(value);
  }

  const menuBalance = (
    <Menu items={[
        {
          label: <span onClick={() => setSelectedBalanceToken('ETH')}>ETH</span>,
          key: '0',
        },
        {
          label: <span onClick={() => setSelectedBalanceToken('CZH')}>CZH</span>,
          key: '1',
        },
        {
          label: <span onClick={() => setSelectedBalanceToken('LFJ')}>LFJ</span>,
          key: '2',
        },
      ]}
    />
  );

  const getAccountTokenBalance = useCallback(async (tokenAddress) => {
    if (!web3 || !accounts || !tokenAddress) return;
    let balance = null;
    if (tokenAddress === tokenAddresses['ETH']) {
      balance = await web3.eth.getBalance(accounts[0]);
    } else if (tokenAddress === tokenAddresses['CZH']) {
      balance = await CZHData.methods.balanceOf(accounts[0]).call();
    } else if (tokenAddress === tokenAddresses['LFJ']) {
      balance = await LFJData.methods.balanceOf(accounts[0]).call();
    }
    balance = web3.utils.fromWei(balance, 'ether');
    setActiveBalanceValue(parseFloat(balance).toFixed(3));
  }, [accounts, web3, CZHData, LFJData]);

  const handleSwap = async () => {
    if (!primaryTokenName || !inputValue) {
      alert("You should specify token and it's amount");
      return;
    };

    const conversionRates = await ethSwapData.methods.tokenConversionRates(tokenAddresses[primaryTokenName]).call();
    setIsLoading(true);
    if (swapMode === 'buy') {     
      try {
        const tokenAmount = inputValue / conversionRates;
        const amountToBuyWei = web3.utils.toWei(tokenAmount.toString(), 'Ether'); 
        const buyFunc = ethSwapData.methods.buyTokens(tokenAddresses[primaryTokenName]);
        const tx = await buyFunc.send({from: accounts[0], value: amountToBuyWei});
        setLastTx(tx);
      } catch (e) {
        console.log('tx error msg:', e);
        setIsLoading(false);
      }
    } else if (swapMode === 'sell') {      
      try {
        const tokenAmountToWei = web3.utils.toWei(inputValue.toString(), 'Ether'); 
        let selectedTokenContract;
        if (primaryTokenName === 'CZH') {
          selectedTokenContract = CZHData;
        } else if (primaryTokenName === 'LFJ') {
          selectedTokenContract = LFJData;
        }
        await selectedTokenContract.methods.approve(ethSwapData._address, tokenAmountToWei).send({from: accounts[0]});
        const sellFunc = await ethSwapData.methods.sellTokens(tokenAddresses[primaryTokenName], tokenAmountToWei);
        const tx = await sellFunc.send({from: accounts[0]});
        setLastTx(tx);
      } catch (e) {
        console.log('tx error msg:', e);
        setIsLoading(false);
      }
    } else if (swapMode === 'swap') {
      try {
        let primaryTokenContract;
        if (primaryTokenName === 'CZH') {
          primaryTokenContract = CZHData;
        } else if (primaryTokenName === 'LFJ') {
          primaryTokenContract = LFJData;
        }
        const tokenAmountToWei = web3.utils.toWei(inputValue.toString(), 'Ether'); 
        await primaryTokenContract.methods.approve(ethSwapData._address, tokenAmountToWei).send({from: accounts[0]});
        const swapFunc = await ethSwapData.methods.swapTokens(tokenAddresses[exchangeTokenName], tokenAddresses[primaryTokenName], tokenAmountToWei);
        const tx = await swapFunc.send({from: accounts[0]});
        setLastTx(tx);
      } catch (e) {
        console.log('tx error msg:', e);
        setIsLoading(false);
      }
    }
    setInputValue();
    setIsLoading(false);
    setExchangeTokenSummaryValue(0);
  };

  const changeSwapMode = async (evt) => {
    setSwapMode(evt.target.value);
    setPrimaryTokenName();
    setInputValue();
    setExchangeTokenSummaryValue(0);
    if (exchangeTokenName === 'ETH') {
      for (let key in tokenAddresses) {
        if (key !== 'ETH') {
          setExchangeTokenName(key);
        }
      }
    }

    // сюда при смене подтягиваем вызов функции которая выцепит сколько
    // выбранного токена на бирже
    // и какой курс будет конвертации на свап
    getTokenBalanceOnSwap(tokenAddresses[exchangeTokenName]);
  }

  const returnMenuForExchange = useCallback(() => {
    let menuItems = [];
    for (let key in tokenAddresses) {
      if (key !== primaryTokenName && key !== 'ETH') {
        const obj = {
          label: <a onClick={() => setExchangeTokenName(key)}>{key}</a>,
        }
        menuItems.push(obj);
      }
    }
    setSwapMenuList(menuItems);
  }, [primaryTokenName]);

  const getTokenBalanceOnSwap = useCallback(async (tokenAddress) => {
    if (!accounts || !web3 || !tokenAddress) return;
    if (tokenAddress === tokenAddresses['ETH']) {
      const ethBalance = await web3.eth.getBalance(tokenAddresses['ETH']);
      const ethFromWeiBalance = web3.utils.fromWei(ethBalance, 'ether');
      setAvailableExchangeAmountOnSwap(ethFromWeiBalance);
    } else if (tokenAddress === tokenAddresses['LFJ']) {
      const balance = await LFJData.methods.balanceOf(ethSwapData._address).call();
      const balanceFromWei = web3.utils.fromWei(balance, 'ether');
      setAvailableExchangeAmountOnSwap(balanceFromWei);
    } else if (tokenAddress === tokenAddresses['CZH']) {
      const balance = await CZHData.methods.balanceOf(ethSwapData._address).call();
      const balanceFromWei = web3.utils.fromWei(balance, 'ether');
      setAvailableExchangeAmountOnSwap(balanceFromWei);
    }
  }, [CZHData, LFJData, accounts, ethSwapData, web3]);

  const updateActiveTokenBalanceOnSwap = useCallback(async () => {
    if (swapMode === 'buy' && primaryTokenName) {
      await getTokenBalanceOnSwap(tokenAddresses[primaryTokenName]);
      setExchangeTokenName(primaryTokenName);
    } else if (swapMode === 'sell') {
      await getTokenBalanceOnSwap(tokenAddresses['ETH']);
      setExchangeTokenName('ETH');
    } else if (swapMode === 'swap' && exchangeTokenName) {
      await getTokenBalanceOnSwap(tokenAddresses[exchangeTokenName]);
      setExchangeTokenName(exchangeTokenName);
    }
  }, [exchangeTokenName, getTokenBalanceOnSwap, primaryTokenName, swapMode]);

  useEffect(() => {
    const updateAppData = async () => {
      await getAccountTokenBalance(tokenAddresses[selectedBalanceToken]);
      await updateActiveTokenBalanceOnSwap();
    }

    updateAppData();
  }, [lastTx, web3, accounts, swapMode, selectedBalanceToken, primaryTokenName, getAccountTokenBalance, updateActiveTokenBalanceOnSwap]);

  useEffect(() => {
    returnMenuForExchange();
  }, [exchangeTokenName, primaryTokenName, returnMenuForExchange]);

  useEffect(() => {
    const updateExchangeConversionRate = async () => {
      if (swapMode === 'swap') {
        const exchangeConversionRateVal = await ethSwapData.methods.tokenConversionRates(tokenAddresses[exchangeTokenName]).call();
        setExchangeConversionRate(exchangeConversionRateVal);
      }
    }
    updateExchangeConversionRate();
  }, [exchangeTokenName, ethSwapData, swapMode]);

  const exchangeInput = () => (
    <Input
      style={{ flexGrow: 1 }}
      placeholder="Input the amount"
    />
  );

  return (
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={`${classes.row} ${classes.balanceRow}`}>
          <Dropdown overlay={menuBalance} trigger={['click']}>
            <a onClick={e => e.preventDefault()} className={classes.amountCurrency}>
              {selectedBalanceToken}
            </a>
          </Dropdown>
          <Text className={classes.amountTitle}>On wallet:</Text>
          <Text className={classes.amountValue}>{activeBalanceValue}</Text>
        </div>
        <div className={classes.row}>
          <Radio.Group onChange={(evt) => changeSwapMode(evt)} value={swapMode} optionType="button" className={classes.radioButtons}>
            <Radio value='buy' className={classes.radioButton}>Buy</Radio>
            <Radio value='sell' className={classes.radioButton}>Sell</Radio>
            <Radio value='swap' className={classes.radioButton}>Swap</Radio>
          </Radio.Group>
        </div>
        <div className={classes.row}>
          <div className={`${classes.row} ${classes.titleRow}`}>
            {swapMode === 'buy' ? (
              <Text className={classes.rowTitle}>You buy:</Text>
            ) : swapMode === 'sell' ? (
              <Text className={classes.rowTitle}>You sell:</Text>
            ) : swapMode === 'swap' ? (
              <Text className={classes.rowTitle}>You swap:</Text>
            ) : ''}
          </div>
          <Input.Group compact className={classes.inputGroup}>
            <Select onChange={(value) => handlePrimaryTokenName(value)} value={primaryTokenName} style={{ width: 120 }}>
              <Option value="CZH">CZH</Option>
              <Option value="LFJ">LFJ</Option>
            </Select>
            <Input
              onChange={onAmountChangeBuy}
              value={inputValue}
              type="number"
              disabled={primaryTokenName === undefined}
              style={{ flexGrow: 1 }}
              placeholder="Input the amount"
            />
          </Input.Group>
        </div>
        <div className={classes.row}>
          <div className={`${classes.row} ${classes.titleRowSecondary}`}>
            <Text className={`${classes.rowTitle} ${classes.rowTitleExchangeCurrency}`}>
              For 
              {
                swapMode === 'swap' ? (
                  <Dropdown overlay={<Menu items={swapMenuList} />} trigger={['click']}>
                    <a className={classes.exchangeCurrency}>
                      {exchangeTokenName}
                    </a>
                  </Dropdown>
                ) : (
                  ' ETH'
                )
              }
              : {exchangeTokenSummaryValue}
              </Text>
            
              {primaryTokenName && (
                <Text className={classes.rowTitle}>Available {exchangeTokenName} on swap: {availableExchangeAmountOnSwap}</Text>
              )}
          </div>
        </div>
        <div className={classes.row}>
          {isLoading ? (
            <Button disabled type="primary" size='large' className={classes.submit} onClick={handleSwap}>
              Loading...
            </Button>
          ): (
            <Button type="primary" size='large' className={classes.submit} onClick={handleSwap}>
              {swapMode === 'buy' ? (
                  'Buy'
                ) : swapMode === 'sell' ? (
                  'Sell'
                ) : swapMode === 'swap' ? (
                  'Swap'
                ) : ''}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SwapCard;
