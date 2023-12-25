const routes = require("next-routes")();

routes
  .add("/lottogemeinschaften/neu", "/lottogemeinschaften/neu")
  .add("/lottogemeinschaften/:tippgemeinschaftsName/verwalten", "/lottogemeinschaften/verwalten")

module.exports = routes;
