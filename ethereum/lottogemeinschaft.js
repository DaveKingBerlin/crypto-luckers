import web3 from "./web3";
import Lottogemeinschaft from "./build/Lottogemeinschaft.json";

const lottogemeinschaft = (address) => {
  return new web3.eth.Contract(Lottogemeinschaft.abi, address);
};
export default lottogemeinschaft;
