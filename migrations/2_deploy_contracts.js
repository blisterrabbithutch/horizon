// var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var LFJ = artifacts.require('./LFJ.sol');
var CZH = artifacts.require('./CZH.sol');
// var EthSwap = artifacts.require('./EthSwap.sol');
var SwapContract = artifacts.require('./SwapContract.sol');

module.exports = async function(deployer) {
  // Deploy LFJ
  await deployer.deploy(LFJ, '1000000000000000000000000');
  const tokenLFJ = await LFJ.deployed();

  // Deploy CZH
  await deployer.deploy(CZH, '1000000000000000000000000');
  const tokenCZH = await CZH.deployed();

  // Deploy EthSwap
  // await deployer.deploy(EthSwap, tokenCZH.address, tokenLFJ.address);
  // const tokenEthSwap = await EthSwap.deployed();

  // Deploy SwapContract
  await deployer.deploy(SwapContract, tokenCZH.address, tokenLFJ.address);
  const tokenSwapContract = await SwapContract.deployed();

  // Transfer all tokens to SwapContract (1 million)
  await tokenCZH.transfer(tokenSwapContract.address, '1000000000000000000000000');
  await tokenLFJ.transfer(tokenSwapContract.address, '1000000000000000000000000');

  // Transfer all tokens to EthSwap (1 million)
  // await tokenCZH.transfer(tokenEthSwap.address, '1000000000000000000000000');
  // await tokenLFJ.transfer(tokenEthSwap.address, '1000000000000000000000000');
};
