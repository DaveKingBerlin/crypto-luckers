require('dotenv').config();
import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
 console.log("Web3 HTTP Provider: ", process.env.WEB3_HTTP_PROVIDER);
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider(
    process.env.WEB3_HTTP_PROVIDER
  );
  web3 = new Web3(provider);
}

export default web3;
