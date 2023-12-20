import React, { Component } from "react";
import { Segment, Card, Button, Label, Sticky, Grid, Container, Advertisement } from "semantic-ui-react";
import factory from "../ethereum/fabrik";
import Layout from "../components/Layout";
import Lottogemeinschaft from '../ethereum/lottogemeinschaft';

class LottogemeinschaftIndex extends Component {
  state = {
    details: []
  };
  static async getInitialProps() {
    try {
      const lottogemeinschaften = await factory.methods.getGegruendeteLottogemeinschaften().call();
      const lottogemeinschaftsnamen = await factory.methods.getLottogemeinschaftsnamen().call();

      return { lottogemeinschaften, lottogemeinschaftsnamen };
    } catch (error) {
      console.error("Fehler beim Abrufen der Daten: ", error);
      return { lottogemeinschaften: [], lottogemeinschaftsnamen: []};
    }
  }

  renderOffeneLottogemeinschaften() {
      const items = this.state.details.map(({ preisProPerson, mitgliederzahl, maximaleMitglieder }, index) => {
        const metaContent = mitgliederzahl < maximaleMitglieder
            ? <span style={{ color: 'green' }}>kannst noch mitmachen</span>
            : <span style={{ color: 'red' }}>chance verpasst</span>;

        return {
            header: this.props.lottogemeinschaftsnamen[index],
            description: `${preisProPerson} €  ---  ${mitgliederzahl} / ${maximaleMitglieder} Mitläufer`,
            meta: metaContent,
            fluid: false,
        };
      });
      return <Card.Group items={items} />;
  }

  renderGeschlosseneLottogemeinschaften() {
      const items = this.state.details.map(({ preisProPerson, mitgliederzahl, maximaleMitglieder }, index) => {
        const metaContent = mitgliederzahl > maximaleMitglieder
            ? <span style={{ color: 'green' }}>kannst noch mitmachen</span>
            : <span style={{ color: 'red' }}>chance verpasst</span>;

        return {
            header: this.props.lottogemeinschaftsnamen[index]+"Voll!",
            description: `${maximaleMitglieder} / ${maximaleMitglieder} Mitläufer`,
            meta: metaContent,
            fluid: false,
        };
      });
      return <Card.Group items={items} />;
  }

  renderEigeneLottogemeinschaften() {
      const items = this.state.details.map(({ preisProPerson, mitgliederzahl, maximaleMitglieder }, index) => {
        const metaContent = mitgliederzahl < maximaleMitglieder
            ? <span style={{ color: 'green' }}>kannst noch mitmachen</span>
            : <span style={{ color: 'red' }}>chance verpasst</span>;

        return {
            header: this.props.lottogemeinschaftsnamen[index],
            description: `${mitgliederzahl} / ${maximaleMitglieder} Mitläufer`,
            meta: <a>bearbeiten</a>,
            fluid: false,
        };
      });
      return <Card.Group items={items} />;
  }


  async componentDidMount() {
      const details = await Promise.all(
        this.props.lottogemeinschaften.map(async (address) => {
          const lottogemeinschaft = Lottogemeinschaft(address);
          const preisProPerson = await lottogemeinschaft.methods.preisProMitspieler().call();
          const mitgliederzahl = await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call();
          const maximaleMitglieder = await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call();
          return { preisProPerson, mitgliederzahl, maximaleMitglieder };
        })
      );
      this.setState({ details });
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
          <Grid>
            <Advertisement unit='banner' test='Hier könnte ihre Werbung stehen' style={{ width: '100%' }} />
          </Grid>
          <Segment>
            <Label ribbon color="green" size="large">Übersicht offener Lottogemeinschaften</Label>
            <Grid>
              <Grid.Column textAlign="center">
                <a>
                  <Button
                    content={this.renderOffeneLottogemeinschaften()}
                    secondary
                  />
                </a>
              </Grid.Column>
            </Grid>
          </Segment>
          <Grid>
            <Advertisement unit='banner' test='Hier könnte ihre Werbung stehen' style={{ width: '100%' }} />
          </Grid>
          <Segment>
            <Label ribbon color="red" size="large">Übersicht geschlossener Lottogemeinschaften</Label>
            <Grid>
              <Grid.Column textAlign="center">
                <a>
                  <Button
                    content={this.renderGeschlosseneLottogemeinschaften()}
                    secondary
                  />
                </a>
              </Grid.Column>
            </Grid>
          </Segment>
          <Grid>
            <Advertisement unit='banner' test='Hier könnte ihre Werbung stehen' style={{ width: '100%' }} />
          </Grid>
          <Segment>
            <Label ribbon color="blue" size="large">Übersicht ihrer erstellter Lottogemeinschaften</Label>
            <Grid>
              <Grid.Column textAlign="center">
                <a>
                  <Button
                    content={this.renderEigeneLottogemeinschaften()}
                    primary
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
