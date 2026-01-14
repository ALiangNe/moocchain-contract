import { expect } from "chai";
import hre from "hardhat";

describe("ResourceNFT", function () {
  let resourceNFT: any;
  let owner: any;
  let teacher: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, teacher, addr1, addr2] = await hre.ethers.getSigners();

    const ResourceNFTFactory = await hre.ethers.getContractFactory("ResourceNFT");
    resourceNFT = await ResourceNFTFactory.deploy();
    await resourceNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await resourceNFT.getAddress()).to.be.properAddress;
    });

    it("Should have initial token counter at 1", async function () {
      expect(await resourceNFT.getCurrentTokenId()).to.equal(1);
    });
  });

  describe("Minting", function () {
    const ipfsHash = "QmTest123456789";
    let contentHash: string;

    beforeEach(async function () {
      // 生成 contentHash（模拟：ipfsHash + owner + timestamp）
      const timestamp = Math.floor(Date.now() / 1000);
      const hashInput = hre.ethers.solidityPackedKeccak256(
        ["string", "address", "uint256"],
        [ipfsHash, teacher.address, timestamp]
      );
      contentHash = hashInput;
    });

    it("Should mint a new resource NFT", async function () {
      const tx = await resourceNFT.mint(teacher.address, contentHash, ipfsHash);
      const receipt = await tx.wait();

      expect(await resourceNFT.balanceOf(teacher.address)).to.equal(1);
      expect(await resourceNFT.ownerOf(1)).to.equal(teacher.address);
      expect(await resourceNFT.getIpfsHash(1)).to.equal(ipfsHash);
      expect(await resourceNFT.getContentHash(1)).to.equal(contentHash);
    });

    it("Should emit ResourceMinted event", async function () {
      await expect(resourceNFT.mint(teacher.address, contentHash, ipfsHash))
        .to.emit(resourceNFT, "ResourceMinted")
        .withArgs(1, teacher.address, contentHash, ipfsHash, (value: any) => value > 0);
    });

    it("Should increment token counter after minting", async function () {
      await resourceNFT.mint(teacher.address, contentHash, ipfsHash);
      expect(await resourceNFT.getCurrentTokenId()).to.equal(2);
    });

    it("Should reject minting with zero address", async function () {
      await expect(
        resourceNFT.mint(hre.ethers.ZeroAddress, contentHash, ipfsHash)
      ).to.be.revertedWith("ResourceNFT: owner cannot be zero address");
    });

    it("Should reject minting with zero contentHash", async function () {
      await expect(
        resourceNFT.mint(teacher.address, hre.ethers.ZeroHash, ipfsHash)
      ).to.be.revertedWith("ResourceNFT: contentHash cannot be zero");
    });

    it("Should reject minting with empty ipfsHash", async function () {
      await expect(
        resourceNFT.mint(teacher.address, contentHash, "")
      ).to.be.revertedWith("ResourceNFT: ipfsHash cannot be empty");
    });

    it("Should reject duplicate contentHash", async function () {
      await resourceNFT.mint(teacher.address, contentHash, ipfsHash);
      
      await expect(
        resourceNFT.mint(teacher.address, contentHash, ipfsHash)
      ).to.be.revertedWith("ResourceNFT: contentHash already exists");
    });
  });

  describe("Token Queries", function () {
    const ipfsHash = "QmTest123456789";
    let contentHash: string;
    let tokenId: bigint;

    beforeEach(async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const hashInput = hre.ethers.solidityPackedKeccak256(
        ["string", "address", "uint256"],
        [ipfsHash, teacher.address, timestamp]
      );
      contentHash = hashInput;

      const tx = await resourceNFT.mint(teacher.address, contentHash, ipfsHash);
      const receipt = await tx.wait();
      tokenId = 1n;
    });

    it("Should get token by contentHash", async function () {
      const tokenIdByHash = await resourceNFT.getTokenIdByContentHash(contentHash);
      expect(tokenIdByHash).to.equal(tokenId);
    });

    it("Should get token information", async function () {
      const token = await resourceNFT.getToken(tokenId);
      expect(token.tokenId).to.equal(tokenId);
      expect(token.owner).to.equal(teacher.address);
      expect(token.contentHash).to.equal(contentHash);
      expect(token.ipfsHash).to.equal(ipfsHash);
      expect(token.exists).to.be.true;
    });

    it("Should get IPFS hash", async function () {
      expect(await resourceNFT.getIpfsHash(tokenId)).to.equal(ipfsHash);
    });

    it("Should get content hash", async function () {
      expect(await resourceNFT.getContentHash(tokenId)).to.equal(contentHash);
    });

    it("Should get owner of token", async function () {
      expect(await resourceNFT.ownerOf(tokenId)).to.equal(teacher.address);
    });

    it("Should get balance of owner", async function () {
      expect(await resourceNFT.balanceOf(teacher.address)).to.equal(1);
    });
  });

  describe("Transfers", function () {
    const ipfsHash = "QmTest123456789";
    let contentHash: string;
    let tokenId: bigint;

    beforeEach(async function () {
      const timestamp = Math.floor(Date.now() / 1000);
      const hashInput = hre.ethers.solidityPackedKeccak256(
        ["string", "address", "uint256"],
        [ipfsHash, teacher.address, timestamp]
      );
      contentHash = hashInput;

      const tx = await resourceNFT.mint(teacher.address, contentHash, ipfsHash);
      const receipt = await tx.wait();
      tokenId = 1n;
    });

    it("Should transfer token from owner", async function () {
      await resourceNFT.connect(teacher).transferFrom(teacher.address, addr1.address, tokenId);
      expect(await resourceNFT.ownerOf(tokenId)).to.equal(addr1.address);
      expect(await resourceNFT.balanceOf(teacher.address)).to.equal(0);
      expect(await resourceNFT.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should transfer token with approval", async function () {
      await resourceNFT.connect(teacher).approve(addr1.address, tokenId);
      await resourceNFT.connect(addr1).transferFrom(teacher.address, addr2.address, tokenId);
      expect(await resourceNFT.ownerOf(tokenId)).to.equal(addr2.address);
    });

    it("Should reject transfer from non-owner", async function () {
      await expect(
        resourceNFT.connect(addr1).transferFrom(teacher.address, addr2.address, tokenId)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });
  });
});
