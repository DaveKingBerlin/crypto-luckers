require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0x4ED5b0CbbF954ce3FC958C03aCadffabAF46BdB2'
);

export default instance;
