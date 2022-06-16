pragma solidity ^0.8.7;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapContract {
    address public owner;
    uint256 public balance;

    mapping (address => uint) public tokenConversionRates;
    mapping (address => uint) public tokenAvailableBalances;
    
    event TransferReceived(address _from, uint _amount);
    event TransferSent(address _from, address _destAddr, uint _amount);

    event TokensPurchased(address account, address token, uint amount);
    event TokensSold(address account, address token, uint amount);

    event TokensSwapped(
        address account, 
        address tokenToBuy, 
        address tokenToSell, 
        uint tokenToBuyAmount, 
        uint tokenToSellAmount
    );

    constructor(address _token1, address _token2) {
        owner = msg.sender;
        uint token1Balance = IERC20(_token1).balanceOf(address(this));
        uint token2Balance = IERC20(_token2).balanceOf(address(this));
        tokenAvailableBalances[_token1] = token1Balance;
        tokenAvailableBalances[_token2] = token2Balance;
        tokenConversionRates[_token1] = 100;
        tokenConversionRates[_token2] = 10;
    }
    
    receive() payable external {
        balance += msg.value;
        emit TransferReceived(msg.sender, msg.value);
    }

    function getTokenConversionRate(address token) public view returns(uint) {
        return tokenConversionRates[token];
    }

    function updateTokenConversionRate(address token, uint tokenValueComparedToEth) public {
        require(msg.sender == owner, "Only owner can set conversion rate"); 
        tokenConversionRates[token] = tokenValueComparedToEth;
    }
    
    function withdraw(uint amount, address payable destAddr) public {
        require(msg.sender == owner, "Only owner can withdraw funds"); 
        require(amount <= balance, "Insufficient funds");
        
        destAddr.transfer(amount);
        balance -= amount;
        emit TransferSent(msg.sender, destAddr, amount);
    }
    
    function transferERC20(IERC20 token, address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can withdraw funds"); 
        uint256 erc20balance = token.balanceOf(address(this));
        require(amount <= erc20balance, "balance is low");
        token.transfer(to, amount);
        emit TransferSent(msg.sender, to, amount);
    }    

    function buyTokens(IERC20 token) public payable {
        // IERC20 token arg = address of token type of IERC20

        // Calculate the number of tokens to buy
        require(tokenConversionRates[address(token)] != 0, "Token conversion rate is not defined yet");
        uint tokenConversionRate = tokenConversionRates[address(token)];
        uint tokenAmount = msg.value * tokenConversionRate;
        // Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount, "Not enough tokens on swap contract available to buy");
        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, address(token), tokenAmount);
    }

    function sellTokens(IERC20 token, uint _amount) public payable {
        require(token.balanceOf(msg.sender) >= _amount, "You can not sell more tokens than you currently hold");

        require(tokenConversionRates[address(token)] != 0, "Token conversion rate is not defined yet");
        uint tokenConversionRate = tokenConversionRates[address(token)];
        uint etherAmount = _amount / tokenConversionRate;

        require(address(this).balance >= etherAmount, "Swap contract does not have enough available ETH amount");

        token.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(etherAmount);
        emit TokensSold(msg.sender, address(token), _amount);
    }

    function swapTokens(IERC20 tokenToBuy, IERC20 tokenToSell, uint _amountToSell) public payable {
        // проверяю балансОф у msg.sender токена который он продает чтобы он был равен _tokenToSell * conversionRate
        require(tokenToSell.balanceOf(address(msg.sender)) >= _amountToSell, "Not enough funds to swap on user wallet");
        // проверить баланс контракта который он покупает - есть ли он на свапалке
        // считаем сколько токенов мы покупаем и проверяем это число на бирже
        require(tokenConversionRates[address(tokenToBuy)] != 0, "Token which you buy conversion rate is not defined yet");
        require(tokenConversionRates[address(tokenToSell)] != 0, "Token which you sell conversion rate is not defined yet");
        uint tokenToBuyAmount = _amountToSell / tokenConversionRates[address(tokenToSell)] * tokenConversionRates[address(tokenToBuy)];
        require(tokenToBuy.balanceOf(address(this)) >= tokenToBuyAmount, "Not enough funds on EthSwap");
        // делаем transferFrom где addressFrom контракт свапалки
        // tokenToBuy.transferFrom(address(this), msg.sender, tokenToBuyAmount);
        tokenToSell.transferFrom(msg.sender, address(this), _amountToSell);
        tokenToBuy.transfer(msg.sender, tokenToBuyAmount);
        
        emit TokensSwapped(msg.sender, address(tokenToBuy), address(tokenToSell), tokenToBuyAmount, _amountToSell);
    }
}