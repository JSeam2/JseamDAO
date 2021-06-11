const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // Main Address that will be deploying stuff
  const mainAddr = "0xC22F22d096D578148FFDbe969E89b0fe5Cb9d5aB"

  // Deploy Token
  const Token = await hre.ethers.getContractFactory("JseamToken");
  const token = await Token.deploy(mainAddr); //token recipient
  await token.deployed();
  console.log("JseamToken deployed to:", token.address);

  // Predetermine GovernorAlpha address
  let nonce = await ethers.provider.getTransactionCount(mainAddr);
  nonce = nonce + 1; // increment by 1 to account for next contract;

  const rlp_encoded = ethers.utils.RLP.encode(
    [mainAddr, ethers.BigNumber.from(nonce.toString()).toHexString()]
  );
  const contract_address_long = ethers.utils.keccak256(rlp_encoded);
  const contract_address = '0x'.concat(contract_address_long.substring(26));
  let adminAddr = ethers.utils.getAddress(contract_address);
  console.log("Pre-determined GovernorAlpha Address: adminAddr");

  // Deploy Timelock
  const Timelock = await hre.ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(
    adminAddr,
    60
  );
  await timelock.deployed();
  console.log("Timelock deployed to:", timelock.address);

  // // Deploy GovernorAlpha
  const GovernorAlpha = await hre.ethers.getContractFactory("GovernorAlpha");
  const governorAlpha = await GovernorAlpha.deploy(
    timelock.address,
    token.address,
    mainAddr 
  );
  await governorAlpha.deployed();
  console.log("GovernorAlpha deployed to:", governorAlpha.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
