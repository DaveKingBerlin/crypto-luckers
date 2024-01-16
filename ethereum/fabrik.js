require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0xBF5850A3A3464e5347c934673603B87c4008ECe7'
);

export default instance;
