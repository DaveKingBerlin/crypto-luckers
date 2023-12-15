require('dotenv').config();

const path = require('path');
const fs = require('fs-extra');

const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const compiledFactory = require(path.resolve(__dirname, './build/LottogemeinschaftFabrik.json'));

const provider = new HDWalletProvider(process.env.KEY, process.env.URL);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);
  console.log(typeof compiledFactory.abi)
  console.log(compiledFactory.abi)

  const contract = fs.readFileSync(path.resolve(__dirname, './build/LottogemeinschaftFabrik.json'), 'utf8');
  const abi = JSON.parse(contract).abi; // Stellen Sie sicher, dass Sie auf das richtige Feld im JSON zugreifen
  const bytecode = JSON.parse(contract).evm.bytecode.object

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode })
    .send({ gas: '5000000', from: accounts[0] });

  // Schreiben der Adresse in eine Datei
  const filePath = path.resolve(__dirname, 'deployedAddress.txt');
  fs.writeFileSync(filePath, result.options.address);

  provider.engine.stop();
};
deploy();

