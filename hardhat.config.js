require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: {
    version: "0.8.15",
    setting: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  // defaultNetwork: "mumbai",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `${process.env.MUMBAI_ALCHEMY_KEY}`,
      accounts: [`0x${process.env.PK}`],
    },
    polygon: {
      url: `${process.env.POLYGON_ALCHEMY_KEY}`,
      accounts: [`0x${process.env.PK}`],
    },
    rinkeby: {
      url: `${process.env.RINKEBY_ALCHEMY_KEY}`,
      accounts: [`0x${process.env.PK}`],
    },
  },
};
