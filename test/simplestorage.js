const SwapContract = artifacts.require("./SwapContract.sol");
const LFJContract = artifacts.require("./LFJ.sol");
const CZHContract = artifacts.require("./CZH.sol");

contract("SwapContract", accounts => {
  const one_eth = web3.utils.toWei('1', "ether");
  const initialSupplyAmount = '1000000000000000000000000';
  let swapContract;
  let tokenCZH;
  let tokenLFJ;

  before(async () => {
    swapContract = await SwapContract.deployed();
    tokenCZH = await CZHContract.deployed(initialSupplyAmount);
    tokenLFJ = await LFJContract.deployed(initialSupplyAmount);
  })

  it("should receive direct transaction 1ETH and change swapContract balance", async () => {
    await web3.eth.sendTransaction({from: accounts[0], to: swapContract.address, value: one_eth});
    let balance_wei = await web3.eth.getBalance(swapContract.address);
    let balance_ether = web3.utils.fromWei(balance_wei, "ether");
    assert.equal(balance_ether, 1);
    await swapContract.withdraw(one_eth, accounts[0]);
  });

  it("should read & update token conversion rate", async () => {
    const initialTokenConversionRate = '100';
    const lastTokenConversionRate = '200';
    let conversionRate = await swapContract.getTokenConversionRate(tokenCZH.address);
    assert.equal(conversionRate.toString(), initialTokenConversionRate);
    await swapContract.updateTokenConversionRate(tokenCZH.address, lastTokenConversionRate);
    conversionRate = await swapContract.getTokenConversionRate(tokenCZH.address);
    assert.equal(conversionRate.toString(), lastTokenConversionRate);
    await swapContract.updateTokenConversionRate(tokenCZH.address, initialTokenConversionRate);
  });

  it("should transferErc20 to account from swapContract and improve account token amount and reduce token amount on swap", async () => {
    let tokenTransferAmount = web3.utils.toWei('1', "ether");
    await swapContract.transferERC20(tokenCZH.address, accounts[0], tokenTransferAmount);
    const accountBalanceCZH = await tokenCZH.balanceOf(accounts[0]);
    const swapContractBalanceCZH = await tokenCZH.balanceOf(swapContract.address);

    assert.equal(accountBalanceCZH.toString(), tokenTransferAmount);
    assert.equal(web3.utils.fromWei(swapContractBalanceCZH, 'ether'), web3.utils.fromWei(initialSupplyAmount, 'ether') - web3.utils.fromWei(tokenTransferAmount, 'ether'));

    await web3.eth.sendTransaction({from: accounts[0], to: swapContract.address, value: tokenTransferAmount});

    // отправим токены назад
    tokenCZH.transfer(swapContract.address, tokenTransferAmount);
  });

  it("should withdraw", async () => {
    let initialEthBalanceOnSwap = web3.utils.fromWei(await web3.eth.getBalance(swapContract.address), 'ether');
    await web3.eth.sendTransaction({from: accounts[0], to: swapContract.address, value: one_eth});
    // let balance_wei = await web3.eth.getBalance(swapContract.address);
    // let balance_ether = web3.utils.fromWei(balance_wei, "ether");
    let ethSwapBalance = web3.utils.fromWei(await web3.eth.getBalance(swapContract.address), 'ether');
    // const initialAccountBalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
    await swapContract.withdraw(one_eth, accounts[0]);
    ethSwapBalance = web3.utils.fromWei(await web3.eth.getBalance(swapContract.address), 'ether');

    assert.equal(ethSwapBalance, initialEthBalanceOnSwap);
  });

  it("should buyTokens - 100 CZH for 1 ETH of Account", async () => {
    const tokenCZH = await CZHContract.deployed();
    const swapContract = await SwapContract.deployed();
    let czhConversionRateForOneEth = await swapContract.getTokenConversionRate(tokenCZH.address);
    let one_eth = web3.utils.toWei('1', "ether");

    let accountBalanceCZH = web3.utils.fromWei(await tokenCZH.balanceOf(accounts[0]), "ether");

    await swapContract.buyTokens(tokenCZH.address, {from: accounts[0], value: one_eth});
    accountBalanceCZH = web3.utils.fromWei(await tokenCZH.balanceOf(accounts[0]), "ether");

    assert.equal(accountBalanceCZH, czhConversionRateForOneEth.toString());
  });

  it("should sellTokens", async () => {
    let accountBalanceCZH = await tokenCZH.balanceOf(accounts[0]);
    await tokenCZH.approve(swapContract.address, accountBalanceCZH.toString());
    await swapContract.sellTokens(tokenCZH.address, accountBalanceCZH.toString());
    const newBalance = await tokenCZH.balanceOf(accounts[0]);
    assert.equal(newBalance.toString(), 0);
  });

  it("should swapTokens", async () => {
    let accountBalanceCZH = await tokenCZH.balanceOf(accounts[0]);

    // купили токен
    assert.equal(accountBalanceCZH, 0);
    let czhConversionRateForOneEth = await swapContract.getTokenConversionRate(tokenCZH.address);
    let lfjConversionRate = await swapContract.getTokenConversionRate(tokenLFJ.address);

    await swapContract.buyTokens(tokenCZH.address, {from: accounts[0], value: one_eth});
    accountBalanceCZH = web3.utils.fromWei(await tokenCZH.balanceOf(accounts[0]), "ether");
    assert.equal(accountBalanceCZH, czhConversionRateForOneEth.toString());

    // свапаем токен
    await tokenCZH.approve(swapContract.address, await tokenCZH.balanceOf(accounts[0]));
    await swapContract.swapTokens(tokenLFJ.address, tokenCZH.address, await tokenCZH.balanceOf(accounts[0]));
    const newCzhBalance = web3.utils.fromWei(await tokenCZH.balanceOf(accounts[0]), "ether");
    const newLfjBalance = web3.utils.fromWei(await tokenLFJ.balanceOf(accounts[0]), "ether");
    
    assert.equal(newCzhBalance.toString(), 0);
    assert.equal(newLfjBalance.toString(), lfjConversionRate);
  });
});
