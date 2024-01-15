require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0x4Dc7d3F4fbE283b9557F800CC1439D14C38962FC'
);

export default instance;
