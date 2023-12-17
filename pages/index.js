import React, { Component } from "react";
import {Segment, Card, Button, Label, Sticky, Grid, Container, Advertisement } from "semantic-ui-react";
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
            <p> Zeige Details zur Lottogemeinschaft </p>
        ),
        fluid: false,
      };
    });
    return <Card.Group items={items} />;
  }
  render() {
    return (
      <Layout>
        <div>
        <Segment>
          <Label ribbon color="blue" size="large">Verfügbare Aktionen</Label>
          <Grid>
            <Grid.Column textAlign="center">
              <a>
                      <Button
                        content="Gründe neue Lottogemeinschaft"
                        icon="add circle"
                        primary
                      />
                    </a>
            </Grid.Column>
          </Grid>
        </Segment>

           <Advertisement unit='banner' test='Hier könnte ihre Werbung stehen' />

           <Segment>
          <Label ribbon color="green" size="large">Übersicht erstellter Lottogemeinschaften</Label>
          <Grid>
            <Grid.Column textAlign="center">
              <a>
              <Button
                        content={this.renderLottogemeinschaften()}
                        secondary
                      />
              </a>
            </Grid.Column>
          </Grid>
        </Segment>

        </div>
      </Layout>
    );
  }
}

export default LottogemeinschaftIndex;
