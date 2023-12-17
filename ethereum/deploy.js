require('dotenv').config();

const path = require('path');
const fs = require('fs-extra');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3'); // geändert von { Web3 } zu Web3
const compiledFactory = require(path.resolve(__dirname, './build/LottogemeinschaftFabrik.json'));

const provider = new HDWalletProvider(process.env.KEY, process.env.SEPOLIA);
const web3 = new Web3(provider);

const deploy = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account', accounts[0]);

    const contract = fs.readFileSync(path.resolve(__dirname, './build/LottogemeinschaftFabrik.json'), 'utf8');
    const abi = JSON.parse(contract).abi;
    const bytecode = JSON.parse(contract).evm.bytecode.object;

    // Angenommene Gasgebühren - sollten dynamisch basierend auf dem Netzwerkzustand festgelegt werden
    const maxPriorityFeePerGas = Web3.utils.toWei('2', 'gwei'); // Beispielwert
    const maxFeePerGas = Web3.utils.toWei('100', 'gwei'); // Beispielwert

    const result = await new web3.eth.Contract(abi)
      .deploy({ data: bytecode })
      .send({
        from: accounts[0],
        maxPriorityFeePerGas,
        maxFeePerGas
      });

    const filePath = path.resolve(__dirname, 'deployedAddress.txt');
    fs.writeFileSync(filePath, result.options.address);
    console.log('Contract deployed to', result.options.address);
  } catch (error) {
    console.error('Deployment failed:', error);
  } finally {
    provider.engine.stop();
  }
};

deploy();
