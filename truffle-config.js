const path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");
const MNEMONIC = process.env.MNEMONIC;
const API_KEY = process.env.PROJECT_ID;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "127.0.0.1",
      // port: 7545,
      port: 8545,
      defaultEtherBalance: 500,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/v3/${API_KEY}`);
      },
      network_id: 3,
      gas: 4000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.7"
    }
  }
};
