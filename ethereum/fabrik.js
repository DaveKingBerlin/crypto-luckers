require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0x64A919f58625ba8C7834D56E66b0c7Bf1F1D0a6C'
);

export default instance;
