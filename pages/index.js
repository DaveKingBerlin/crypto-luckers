import React, { Component } from "react";
import { Card, Button } from "semantic-ui-react";
import factory from "../ethereum/fabrik";
import Layout from "../components/Layout";

class LottogemeinschaftIndex extends Component {
  static async getInitialProps() {
    try {
      const lottogemeinschaften = await factory.methods.getGegruendeteLottogemeinschaften().call();
      const lottogemeinschaftsnamen = await factory.methods.getLottogemeinschaftsnamen().call();

      return { lottogemeinschaften, lottogemeinschaftsnamen };
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten: ", error);
      return { lottogemeinschaften: [], lottogemeinschaftsnamen: [] };
    }
  }
  renderLottogemeinschaften() {
    const items = this.props.lottogemeinschaftsnamen.map((name) => {
      return {
        header: name,
        description: (
            <a>Springe zur Lottogemeinschaft</a>
        ),
        fluid: true,
      };
    });
    return <Card.Group items={items} />;
  }
  render() {
    return (
      <Layout>
        <div>
          <h3>Übersicht erstellter Lottogemeinschaften</h3>
            <a>
              <Button
                floated="right"
                content="Gründe Lottogemeinschaft"
                icon="add circle"
                primary
              />
            </a>
          {this.renderLottogemeinschaften()}
        </div>
      </Layout>
    );
  }
}

export default LottogemeinschaftIndex;
