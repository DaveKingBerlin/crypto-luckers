import React, { Component } from "react";
import { Segment, Card, Button, Label, Sticky, Grid, Container, Message } from "semantic-ui-react";
import factory from "../ethereum/fabrik";
import Layout from "../components/Layout";
import Lottogemeinschaft from '../ethereum/lottogemeinschaft';
import Link from 'next/link';

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
          <Grid>
          <h1>Willkommen bei Crypto-Luckers!</h1>
          <h3>Crypto-Luckers ist eine  Plattform, auf der Lottospieler Lottogemeinschaften finden, erstellen und verwalten können.
          <ul className="list">
          <li>
          Haben Sie Ethereum in Ihrer Wallet?
          </li>
          </ul>
          Nutzen Sie es jetzt, um sich unserer exklusiven Lottogemeinschaft anzuschließen! Bei uns können Sie ganz einfach Ihren anteiligen Preis am Lottoschein mit Ethereum bezahlen. Oder gehen sie in die vollen und gründen sie ihre eigene Lottogemeinschaft. Sammeln sie das Geld für den Lottoschein via Crypto ein und zahlen sie den Gewinn des Lottoscheins bequem wieder mit Crypto aus. </h3>
          </Grid>
          </Segment>
          <Segment>
            <Label ribbon color="blue" size="large">Verfügbare Aktionen</Label>
            <Grid>
              <Grid.Column textAlign="center">
              <Link href="/lottogemeinschaften/neu">
                  <a>
                    <Button
                      content="Gründe neue Lottogemeinschaft"
                      icon="add circle"
                      primary
                    />
                  </a>
              </Link>
              </Grid.Column>
            </Grid>
          </Segment>
          <Grid>
          <div className="ui info message">
              <div className="header">
                Gründen Sie Ihre Eigene Ethereum-basierte Lottogemeinschaft.
              </div>
              <p> Entdecken Sie den Komfort und die Sicherheit des Sammelns und Verteilens von Lottoeinsätzen mit Ethereum. Schaffen Sie eine nahtlose, transparente Erfahrung für alle Mitglieder Ihrer Gemeinschaft.</p>
              <ul className="list">
                <li>Einfaches Sammeln und schnelle Auszahlungen mit Ethereum.</li>
                <li>Vollständige Transparenz und Sicherheit bei jeder Transaktion.</li>
                <li>Starten Sie in wenigen Schritten: Planen, Einladen, Sammeln und Gewinne teilen.</li>
              </ul>
              <p>Verwandeln Sie Ihre Leidenschaft für Lotto in eine sichere und effiziente Gemeinschaftserfahrung. Gründen Sie jetzt und führen Sie Ihre Gruppe zum Erfolg!</p>
          </div>
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
          <div className="ui info message">
              <div className="header">
                Spielen sie mit einer starken Gemeinschaft.
              </div>
              <p> Treten Sie unserer Ethereum-basierten Lottogemeinschaft bei und erleben Sie das Lotto spielen auf eine neue, innovative Weise. Nutzen Sie die Kraft der Gemeinschaft, um Ihre Chancen zu erhöhen und Gewinne zu teilen.</p>
              <ul className="list">
                <li>Bequeme Teilnahme und anteilige Gewinne, direkt in Ihre Ethereum-Wallet.</li>
                <li>Transparente und schnelle Transaktionen, keine versteckten Gebühren.</li>
                <li>Werden Sie Teil einer Gemeinschaft, die Sicherheit und Fairness großschreibt.</li>
              </ul>
              <p>Nutzen Sie die Vorteile der Blockchain für Ihr Lottospiel. Schließen Sie sich jetzt an und werden Sie Teil einer Gruppe, die zusammen gewinnt!</p>
          </div>
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
           <div className="ui info message">
              <div className="header">
                Neugierig wer was gewonnen hat?
              </div>
              <p>Möchten Sie mehr darüber erfahren, wie unsere Ethereum-basierte Lottogemeinschaft funktioniert und wie Gewinne verteilt werden?</p>
          <ul className="list">
          <li>Hier finden Sie transparente Einblicke und aktuelle Informationen.</li>
          <li>Erfahren Sie, wie Gewinne fair und transparent unter den Mitgliedern aufgeteilt werden.</li>
          <li>Sehen Sie echte Beispiele von Gewinnen und deren Verteilung in der Gemeinschaft.</li>
           </ul>
          <p>Verstehen Sie die Vorteile der Blockchain-Technologie im Lotto. Bleiben Sie informiert und entdecken Sie, wie unsere Gemeinschaft durch Transparenz und Zusammenarbeit stärker wird. Ihre Neugier könnte der erste Schritt zu einer neuen Art des Lottospiels sein!</p>
          </div>
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
          <Grid>
          <Message info header='Verwalten Sie Ihre Lottogemeinschaft effizient und transparent.' content='Als Gründer einer Ethereum-basierten Lottogemeinschaft haben Sie die Kontrolle und die Verantwortung, alles reibungslos laufen zu lassen. Hier sind die Werkzeuge und Informationen, die Sie benötigen, um Ihre Gemeinschaft effektiv zu verwalten. Überwachen Sie Einzahlungen und Auszahlungen in Echtzeit über die Blockchain. Passen Sie die Regeln an, setzen Sie Mindest- und Höchstbeträge fest und laden Sie neue Mitglieder ein. Kommunizieren Sie transparent mit Mitgliedern über Änderungen und Gewinnverteilungen. Mit den richtigen Werkzeugen und einem klaren Überblick über Ihre Gemeinschaft können Sie eine faire, unterhaltsame und gewinnbringende Lottogemeinschaft führen. Nutzen Sie die Macht der Ethereum-Blockchain, um alles effizient zu verwalten!' style={{ width: '100%' }} />
          </Grid>
        </div>
      </Layout>
    );
  }
}

export default LottogemeinschaftIndex;
