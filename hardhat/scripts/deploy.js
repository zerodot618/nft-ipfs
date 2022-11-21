const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  // 我们可以从那里提取LW3Punks的元数据的URL
  const metadataURL = "ipfs://QmPDFGH5tvm3E1rVdX8ErPbytV35ewYnWQLXAYaCPE1B86/";
  /**
   * 在ethers.js中，ContractFactory是一个用于部署新的智能合约的抽象概念。
   * 所以这里的lw3PunksContract是我们LW3Punks合约实例的工厂。
  */
  const lw3PunksContract = await ethers.getContractFactory("LW3Punks");

  // 部署合约
  const deployedLW3PunksContract = await lw3PunksContract.deploy(metadataURL);

  await deployedLW3PunksContract.deployed();

  // 打印合约地址
  console.log("LW3Punks Contract Address:", deployedLW3PunksContract.address);
}

// 调用 main 函数并捕捉异常
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });