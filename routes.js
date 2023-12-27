const routes = require("next-routes")();

routes
  .add("/lottogemeinschaften/neu", "/lottogemeinschaften/neu")
  .add("/lottogemeinschaften/:tippgemeinschaftsName", "/lottogemeinschaften/anzeigen")

module.exports = routes;
