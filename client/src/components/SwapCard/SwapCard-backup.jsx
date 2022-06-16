import React, {useState, useEffect} from "react";
import { Typography, Button } from 'antd';
import classes from "./SwapCard.module.scss";
import {
  Input,
  Select,
  Menu,
  Dropdown,
  Radio
} from 'antd';
import getWeb3 from "../../getWeb3";

// contracts JSON ABI
import LFJContractJson from "../../contracts/LFJ.json";
import CZHContractJson from "../../contracts/CZH.json";
import SwapContractJson from "../../contracts/SwapContract.json";

const { Option } = Select;
const { Text } = Typography;

const tokenAddresses = {
  'CZH': undefined,
  'LFJ': undefined,
  'ETH': undefined,
};

const SwapCard = () => {
  const [amountValueBuy, setAmountValueBuy] = useState();
  const [amountValueSell, setAmountValueSell] = useState();
  const [web3, setWeb3] = useState();
  const [accounts, setAcounts] = useState();
  const [LFJData, setLFJData] = useState();
  const [activeBalanceValue, setActiveBalanceValue] = useState(null);
  const [ethSwapData, setEthSwapData] = useState();
  const [CHZData, setCHZData] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBalanceToken, setSelectedBalanceToken] = useState('ETH');
  const [selectedTokenToBuy, setSelectedTokenToBuy] = useState('CZH');
  const [selectedTokenToSell, setSelectedTokenToSell] = useState('ETH');
  const [isSwapModeBuying, setIsSwapModeBuying] = useState(true);
  const [activeConversionRate, setActiveConversionRate] = useState();
  const [availableToBuyBalance, setAvailableToBuyBalance] = useState();
  const [availableToSellBalance, setAvailableToSellBalance] = useState();

  const onAmountChangeBuy = e => {
    const { value } = e.target;
    setAmountValueBuy(value);
    setIsSwapModeBuying(true);
    // здесь конвертируем цену продажи второго инпута
    // смотрим выбранную пару. берем ее курс и выставляем инпут второй
    console.log(selectedTokenToBuy, selectedTokenToSell);

    if (selectedTokenToSell === 'ETH') setAmountValueSell(value / activeConversionRate);    
  }

  const onAmountChangeSell = e => {
    const { value } = e.target;
    setAmountValueSell(value);
    setIsSwapModeBuying(false);
    // здесь конвертируем цену продажи второго инпута
    console.log(selectedTokenToBuy, selectedTokenToSell);

    if (selectedTokenToBuy === 'ETH') setAmountValueBuy(value * activeConversionRate);    
  }

  const handleSwap = async () => {
    if (!amountValueBuy || !amountValueSell) return;

    const amountToBuyWei = web3.utils.toWei(amountValueBuy.toString(), 'Ether');
    console.log('amountValueBuy', amountToBuyWei);
    setIsLoading(true);

    // TODO: написать разделение в зависимости от выбранного режима свапалки
    if (isSwapModeBuying) {
      // BUYING
      console.log('buying mode. buying');
      if (selectedTokenToBuy === 'ETH') {

        let exchangedTokenAddress;
        if (selectedTokenToSell === 'CZH') exchangedTokenAddress = CHZData._address;
        if (selectedTokenToSell === 'LFJ') exchangedTokenAddress = LFJData._address;
        console.log('exchangedTokenAddress', exchangedTokenAddress);

        const conversionRates = await ethSwapData.methods.tokenConversionRates(exchangedTokenAddress).call();
        console.log('conversionRates', conversionRates, exchangedTokenAddress);
        const sellFunc = await ethSwapData.methods.sellTokens(exchangedTokenAddress, amountToBuyWei);
        const tx = await sellFunc.send({from: accounts[0], value: amountToBuyWei});
        console.log('sellFunc', sellFunc, tx);

      } else if (selectedTokenToBuy === 'CZH') {
        
      } else if (selectedTokenToBuy === 'LFJ') {
        
      }
    } else {
      // SELLING
      console.log('selling mode');
      if (selectedTokenToSell === 'ETH') {

        let exchangedTokenAddress;
        if (selectedTokenToBuy === 'CZH') exchangedTokenAddress = CHZData._address;
        if (selectedTokenToBuy === 'LFJ') exchangedTokenAddress = LFJData._address;
        console.log('exchangedTokenAddress', exchangedTokenAddress);

        const conversionRates = await ethSwapData.methods.tokenConversionRates(exchangedTokenAddress).call();
        console.log('conversionRates', conversionRates, exchangedTokenAddress);
        const buyFunc = await ethSwapData.methods.buyTokens(exchangedTokenAddress);
        const tx = await buyFunc.send({from: accounts[0], value: amountToBuyWei});
        console.log('buyFunc', buyFunc, tx);

      } else if (selectedTokenToSell === 'CZH') {
        
      } else if (selectedTokenToSell === 'LFJ') {
        
      }
      // CHZData.methods.approve(ethSwapData._address, amountToBuyWei).send({ from: accounts[0] }).on('transactionHash', (hash) => {
      //   ethSwapData.methods.sellTokens(amountToBuyWei).send({ from: accounts[0] }).on('transactionHash', (hash) => {
      //     setIsLoading(false);
      //   })
      // })
    }
    setIsLoading(false);
  };

  const getEthBalance = async () => {
    if (!accounts) return;
    const ethBalance = await web3.eth.getBalance(accounts[0]);
    const ethFromWeiBalance = web3.utils.fromWei(ethBalance, 'ether');
    console.log('my account balance', accounts[0], ethFromWeiBalance);
    setActiveBalanceValue(ethFromWeiBalance);
  }

  useEffect(() => {
    getEthBalance();
  }, [accounts]);

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
          const contractBalance = await web3.eth.getBalance(SwapContract.address);
          console.log('SwapContract Balance', contractBalance);
          tokenAddresses['ETH'] = SwapContractInstance._address;
          setEthSwapData(SwapContractInstance);

          // Get the contract instance. LFJ Token
          const LFJData = LFJContractJson.networks[networkId];
          if (LFJData) {
            const LFJContractInstance = new web3.eth.Contract(LFJContractJson.abi, LFJData.address);
            setLFJData(LFJContractInstance);
            tokenAddresses['LFJ'] = LFJContractInstance._address;
            console.log('LFJContractInstance.address', LFJData.address);
            let tokenBalance = await LFJContractInstance.methods.balanceOf(SwapContract.address).call();
            console.log('LFJ balance on SwapContract', tokenBalance);
          } else {
            window.alert('Token contract not deployed to detected network.');
          }


          // Load CZH Token
          const CZHData = CZHContractJson.networks[networkId];
          if (CZHData) {
            const CHZContractInstance = new web3.eth.Contract(CZHContractJson.abi, CZHData.address);
            setCHZData(CHZContractInstance);
            tokenAddresses['ETH'] = CHZContractInstance._address;
            console.log('CHZContractInstance.address', CZHData.address);
            let tokenBalance = await CHZContractInstance.methods.balanceOf(SwapContract.address).call();
            console.log('CHZ balance on SwapContract', tokenBalance);
          } else {
            window.alert('Token contract not deployed to detected network.');
          }

        } else {
          window.alert('SwapContract not deployed to detected network.');
        }


        // // Set web3, accounts, and contract to the state, and then proceed with an
        // // example of interacting with the contract's methods.
        setWeb3(web3);
        setAcounts(accounts);
        // setContractInstance(instance);
      } catch (e) {
        // Catch any errors for any of the above operations.
        alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
        console.error(e);
      }
      setIsLoading(false);
    }

    connectToWeb3();
  }, [])

  const getCZHBalance = async () => {
    if (!accounts) return;
    const tokenBalance = await CHZData.methods.balanceOf(accounts[0]).call();
    const tokenFromWeiBalance = web3.utils.fromWei(tokenBalance, 'ether');
    console.log('tokenBalance', tokenFromWeiBalance);
    setActiveBalanceValue(tokenFromWeiBalance);
  }

  const getLFJBalance = async () => {
    if (!accounts) return;
    const tokenBalance = await LFJData.methods.balanceOf(accounts[0]).call();
    const tokenFromWeiBalance = web3.utils.fromWei(tokenBalance, 'ether');
    console.log('tokenBalance', tokenFromWeiBalance);
    setActiveBalanceValue(tokenFromWeiBalance);
  }

  useEffect(() => {
    if (selectedBalanceToken === 'ETH') {
      getEthBalance();
    } else if (selectedBalanceToken === 'LFJ') {
      getLFJBalance();
    } else if (selectedBalanceToken === 'CZH') {
      getCZHBalance();
    }
  }, [selectedBalanceToken]);

  const menu = (
    <Menu
      items={[
        {
          label: <span onClick={() => setSelectedBalanceToken('ETH')}>ETH</span>,
          // label: 'ETH',
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

  const handleSetAvailableBalance = async (value, mode) => {
    let availableAmount;
    if (value === 'CZH') {
      const tokenBalance = await CHZData.methods.balanceOf(ethSwapData._address).call();
      availableAmount = web3.utils.fromWei(tokenBalance, 'ether');
    } else if (value === 'LFJ') {
      const tokenBalance = await LFJData.methods.balanceOf(ethSwapData._address).call();
      availableAmount = web3.utils.fromWei(tokenBalance, 'ether');
    } else if (value === 'ETH') {
      const ethBalance = await web3.eth.getBalance(ethSwapData._address);
      availableAmount = web3.utils.fromWei(ethBalance, 'ether');
    };

    if (mode === 'buy') {
      setAvailableToBuyBalance(availableAmount);
    } else {
      setAvailableToSellBalance(availableAmount);
    }
  }

  const handleTokenToBuy = async (value) => {
    setSelectedTokenToBuy(value);
    handleSetAvailableBalance(value, 'buy');
    console.log(value);
    let exchangedTokenAddress;
    if (selectedTokenToSell === 'CZH') exchangedTokenAddress = CHZData._address;
    if (selectedTokenToSell === 'LFJ') exchangedTokenAddress = LFJData._address;
    if (selectedTokenToSell === 'ETH') {
      if (selectedTokenToBuy === 'CZH') exchangedTokenAddress = CHZData._address;
      if (selectedTokenToBuy === 'LFJ') exchangedTokenAddress = LFJData._address;
    };
    console.log('exchangedTokenAddress', exchangedTokenAddress, selectedTokenToSell);
    if (!exchangedTokenAddress) return;

    const conversionRates = await ethSwapData.methods.tokenConversionRates(exchangedTokenAddress).call();
    setActiveConversionRate(conversionRates);
  }
  const handleTokenToSell = async (value) => {
    setSelectedTokenToSell(value);
    handleSetAvailableBalance(value, 'sell');
    console.log(value);
    let exchangedTokenAddress;
    if (selectedTokenToBuy === 'CZH') exchangedTokenAddress = CHZData._address;
    if (selectedTokenToBuy === 'LFJ') exchangedTokenAddress = LFJData._address;
    if (selectedTokenToBuy === 'ETH') {
      if (selectedTokenToSell === 'CZH') exchangedTokenAddress = CHZData._address;
      if (selectedTokenToSell === 'LFJ') exchangedTokenAddress = LFJData._address;
    };
    if (!exchangedTokenAddress) return;

    console.log('exchangedTokenAddress', exchangedTokenAddress, selectedTokenToBuy);

    const conversionRates = await ethSwapData.methods.tokenConversionRates(exchangedTokenAddress).call();
    setActiveConversionRate(conversionRates);
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.card}>
        <div className={`${classes.row} ${classes.balanceRow}`}>
          <Dropdown overlay={menu} trigger={['click']}>
            <a onClick={e => e.preventDefault()} className={classes.amountCurrency}>
              {selectedBalanceToken}
            </a>
          </Dropdown>
          <Text className={classes.amountTitle}>Balance:</Text>
          <Text className={classes.amountValue}>{activeBalanceValue}</Text>
        </div>
        <div className={classes.row}>
          <Radio.Group onChange={(evt) => evt.preventDefault()} value={1} optionType="button" className={classes.radioButtons}>
            <Radio value={1} className={classes.radioButton}>Buy</Radio>
            <Radio value={2} className={classes.radioButton}>Sell</Radio>
            <Radio value={3} className={classes.radioButton}>Swap</Radio>
          </Radio.Group>
        </div>
        <div className={classes.row}>
          <div className={`${classes.row} ${classes.titleRow}`}>
            <Text className={classes.rowTitle}>You buy:</Text>
            {availableToBuyBalance && (
              <Text className={classes.rowTitle}>Available amount: {availableToBuyBalance}</Text>
            )}
          </div>
          <Input.Group compact className={classes.inputGroup}>
            {/* <Select onChange={(value) => handleTokenToBuy(value)} defaultValue={selectedTokenToBuy} style={{ width: 120 }}> */}
            <Select onChange={(value) => handleTokenToBuy(value)} style={{ width: 120 }}>
              <Option value="CZH">CZH</Option>
              <Option value="LFJ">LFJ</Option>
              <Option value="ETH">ETH</Option>
            </Select>
            <Input
              onChange={onAmountChangeBuy}
              value={amountValueBuy}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              style={{ flexGrow: 1 }}
              placeholder="Input the amount to buy"
            />
          </Input.Group>
        </div>
        <div className={classes.row}>
          <div className={`${classes.row} ${classes.titleRowSecondary}`}>
            <Text className={classes.rowTitle}>You sell: 521</Text>
            <Text className={classes.rowTitle}>Available amount on swap: 1000</Text>
            {availableToSellBalance && (
              <Text className={classes.rowTitle}>Available amount on swap: {availableToSellBalance}</Text>
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
              Swap
            </Button>
          )}
        </div>
      </div>
      {/*<Text className={classes.logo}>horizon</Text>*/}
    </div>
  )
}

export default SwapCard;
