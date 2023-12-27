require('dotenv').config();
import web3 from "./web3";
import LottogemeinschaftFabrik from "./build/LottogemeinschaftFabrik.json";

const instance = new web3.eth.Contract(
  LottogemeinschaftFabrik.abi,
  '0x838056DaF561c65c3DE06F8437940cE95C1962Ea'
);

export default instance;
