# Homemade ERC721

This project demonstrates a Simple NFT Contract with a lower gas fees. Changed the total supply, mint and transfer function. Add functionality of
- changing max supply
- pausing the contract from mint and transfer
- during withdraw you can give 5% to anyone of initial sale
- permits function (safeTransferWithPermit function)
  
<br/>

Try running some of the following tasks:
```shell
yarn hardhat test
yarn hardhat run scripts/deploy.js --network mumbai
```
