const assert = require("assert");
const ganache = require("ganache");
const { Web3 } = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/LottogemeinschaftFabrik.json");
const compiledCampaign = require("../ethereum/build/Lottogemeinschaft.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({ data: compiledFactory.evm.bytecode.object })
    .send({ from: accounts[0], gas: "10000000" });

  await factory.methods.gruendeLottogemeinschaft("Test", 2, 4).send({
    from: accounts[0],
    gas: "10000000"
  });

  [campaignAddress] = await factory.methods.getGegruendeteLottogemeinschaften().call();
  campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe("Lottogemeinschaft", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const gruender = await campaign.methods.gruender().call();
    assert.equal(accounts[0], gruender);
  });

});
