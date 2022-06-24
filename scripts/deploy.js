const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const SimpleNft = await hre.ethers.getContractFactory("SimpleNft");
  const simpleNft = await SimpleNft.deploy(
    "Smart Orange",
    "SMORGE"
    // "ipfs://Qmaz1o4h7LAvL6gWufALneB5XXodayHN3MYTForUjPX2Vy"
  );

  await simpleNft.deployed();

  console.log("SimpleNft deployed to:", simpleNft.address);

  fs.writeFileSync(
    "./contractAddress.js",
    `
    export const SimpleNftAddress = "${simpleNft.address}"
    `
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
