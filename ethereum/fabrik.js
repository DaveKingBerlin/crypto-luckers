require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0xA0c000EDF286AaF85bbaD87EEbEcc781CDCe12A8'
);

export default instance;
