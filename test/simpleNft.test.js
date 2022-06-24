const { expect } = require("chai");
const { ethers } = require("hardhat");

let SimpleNftContract,
  mintCount,
  name = "Smart Orange",
  symbol = "SMORGE",
  chainId,
  ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function sign(
  spender,
  tokenId,
  nonce,
  deadline,
  contractName,
  deployer,
  contractAddress
) {
  const typedData = {
    types: {
      Permit: [
        { name: "spender", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    domain: {
      name: contractName,
      version: "1",
      chainId: chainId,
      verifyingContract: contractAddress,
    },
    message: {
      spender,
      tokenId,
      nonce,
      deadline,
    },
  };
  // sign Permit
  const signature = await deployer._signTypedData(
    typedData.domain,
    { Permit: typedData.types.Permit },
    typedData.message
  );

  return signature;
}

describe("SimpleNft", async function () {
  it("Should deploy contract", async function () {
    const SimpleNft = await ethers.getContractFactory("SimpleNft");
    SimpleNftContract = await SimpleNft.deploy(name, symbol);
    await SimpleNftContract.deployed();
    chainId = await ethers.provider.getNetwork().then((n) => n.chainId);
  });

  describe("Should correct metadata", async function () {
    it("name", async function () {
      expect(await SimpleNftContract.name()).to.equal(name);
    });

    it("symbol", async function () {
      expect(await SimpleNftContract.symbol()).to.equal(symbol);
    });
  });

  it("Should return false when unpaused the contract", async function () {
    expect(await SimpleNftContract.paused()).to.equal(true);

    const setPausedTx = await SimpleNftContract.setPaused(false);
    await setPausedTx.wait();

    expect(await SimpleNftContract.paused()).to.equal(false);
  });

  it("should has 0 totalSupply", async function () {
    expect(await SimpleNftContract.totalSupply()).to.equal(0);
  });

  it("should minted and check balance", async function () {
    const [addr1] = await ethers.getSigners();

    mintCount = 4;

    const overrides = {
      value: "400000000000000",
    };
    const setMintTx = await SimpleNftContract.mint(mintCount, overrides);
    await setMintTx.wait();

    expect(await SimpleNftContract.balanceOf(addr1.address)).to.equal(
      mintCount
    );
  });

  it("reverts when tokenId does not exist", async function () {
    await expect(SimpleNftContract.tokenURI(mintCount + 3)).to.be.revertedWith(
      "ERC721Metadata: URI query for nonexistent token"
    );
  });

  it("returns correct amount with transferred tokens", async function () {
    const [addr1, addr2] = await ethers.getSigners();
    const tokenId = 2;
    const setTransferTx = await SimpleNftContract.transferFrom(
      addr1.address,
      addr2.address,
      tokenId
    );
    await setTransferTx.wait();

    expect(await SimpleNftContract.balanceOf(addr2.address)).to.equal(1);
    expect(await SimpleNftContract.ownerOf(tokenId)).to.equal(addr2.address);

    expect(await SimpleNftContract.balanceOf(addr1.address)).to.equal(
      mintCount - 1
    );
  });

  it("throws an exception for the 0 address", async function () {
    await expect(SimpleNftContract.balanceOf(ZERO_ADDRESS)).to.be.revertedWith(
      "BalanceQueryForZeroAddress"
    );
  });

  describe("permit", async function () {
    it("can use permit to get approved and transfer in the same tx (safeTransferwithPermit)", async function () {
      const [addr1, addr2] = await ethers.getSigners();
      // set deadline in 7 days
      const deadline = Math.round(Date.now() / 1000 + 7 * 24 * 60 * 60);

      const signature = await sign(
        addr2.address,
        1,
        await SimpleNftContract.nonces(1),
        deadline,
        await SimpleNftContract.name(),
        addr1,
        SimpleNftContract.address
      );

      expect(await SimpleNftContract.getApproved(1)).to.not.equal(
        addr2.address
      );

      const setTransferTx = await SimpleNftContract.connect(
        addr1
      ).safeTransferFromWithPermit(
        addr1.address,
        addr2.address,
        1,
        [],
        deadline,
        signature
      );
      await setTransferTx.wait();

      expect(await SimpleNftContract.ownerOf(1)).to.be.equal(addr2.address);
    });

    it("can not use permit to get approved and transfer in the same tx if wrong sender", async function () {
      const [addr1, addr2, addr3] = await ethers.getSigners();
      // set deadline in 7 days
      const deadline = Math.round(Date.now() / 1000 + 7 * 24 * 60 * 60);

      const signature = await sign(
        addr2.address,
        3,
        await SimpleNftContract.nonces(1),
        deadline,
        await SimpleNftContract.name(),
        addr1,
        SimpleNftContract.address
      );

      // try to use permit for addr2 with addr3 account, fails.
      await expect(
        SimpleNftContract.connect(addr3).safeTransferFromWithPermit(
          addr1.address,
          addr2.address,
          3,
          [],
          deadline,
          signature
        )
      ).to.be.revertedWith("ERC721Permit: invalid signature");
    });
  });
});
