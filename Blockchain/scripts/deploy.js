const main = async () => {
  //getContractFactory takes three arguments 
  //1.name of the contract type string
  //2. Abi  (Application Binary Interface) - it is optional - type array
  //3. bytecode -byte code of the contract - optional - type string
  const contractFactory = await ethers.getContractFactory("Certify");//returns a promise that resolves to a ContractFactory object
  //deploying new instance of COntractFactory object
  const contract = await contractFactory.deploy();//returns a promise which resolves to a new instance of contract object
  await contract.deployed();
  console.log(contract)

  console.log("Contract deployed to:", contract.address);//0x394c6E6BF7CaE7D4Ace2fB1063B2279857CeFA40
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();