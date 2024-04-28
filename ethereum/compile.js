const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Lottogemeinschaft.sol');
const source = fs.readFileSync(campaignPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Lottogemeinschaft.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 50000 // Standard ist 200, aber du kannst diesen Wert an deine Anforderungen anpassen
    },
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const compiledOutput = solc.compile(JSON.stringify(input));
console.log(JSON.parse(compiledOutput));

const output = JSON.parse(compiledOutput);
for (let contractName in output.contracts['Lottogemeinschaft.sol']) {
  const contract = output.contracts['Lottogemeinschaft.sol'][contractName];
  fs.outputJsonSync(
    path.resolve(buildPath, contractName + '.json'),
    contract
  );
}

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract + '.json'),
    output[contract]
  );
}
