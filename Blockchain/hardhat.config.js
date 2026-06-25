// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.24",
// };
/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { sepolia_url, private_key } = process.env;

module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: sepolia_url,
      accounts: [`0x${private_key}`],
      gas: 290000000,
      gasPrice: 800000000000,
    }
  },
}
