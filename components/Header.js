import React from "react";
import { Menu } from "semantic-ui-react";

const Header = () => {
  return (
    <Menu style={{ marginTop: "10px" }}>
        <a className="item">Crypto-Luckers</a>
      <Menu.Menu position="right">
          <a className="item">Lottogemeinschaften</a>
          <a className="item">+</a>
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
