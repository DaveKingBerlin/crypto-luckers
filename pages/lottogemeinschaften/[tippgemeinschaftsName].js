import React, { Component } from "react";
import { Card, Grid, Button, Form, Input } from "semantic-ui-react";
import Layout from "../../components/Layout";
import Lottogemeinschaft from "../../ethereum/lottogemeinschaft";
import factory from "../../ethereum/fabrik";
import web3 from "../../ethereum/web3";
import Web3 from 'web3';
import { Link } from "../../routes";

class LottogemeinschaftVerwalten extends Component {

  state = {
    userAddress: "",
    istMitspieler: false,
    istGewinnAusgezahlt: false,
    istErlaubterMitspieler: true,
    auszahlung: "0", // oder null, abhängig von deinem bevorzugten Anfangswert
    lottogemeinschaftAddress:null,
    lottogemeinschaft: null,
    gruender: null,
    maxTeilnehmerAnzahl: 0,
    preisLottoschein: 0,
    preisProMitspieler: 0,
    spielauftragsNummer: 0,
    anzahlTeilnehmerAktuell: 0,
    gewinnProMitspieler: 0,
    auszahlung: 0,
    gewinnKannAbgeholtWerden: false,
    euroInWei: process.env.REACT_APP_EURO || '500000000000000',
  };

  static async getInitialProps({ query }) {
    const euroInWei = process.env.REACT_APP_EURO || '500000000000000';
    const { tippgemeinschaftsName } = query;
    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(query.tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
    const gruender = await lottogemeinschaft.methods.gruender().call();
    const maxTeilnehmerAnzahl = (await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call()).toString();
    const preisLottoschein  = (await lottogemeinschaft.methods.preisLottoschein().call()).toString();
    const anzahlTeilnehmerAktuell = (await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call()).toString();
    const preisProMitspieler = (await lottogemeinschaft.methods.preisProMitspieler().call()).toString();

    return {
      tippgemeinschaftsName, gruender, maxTeilnehmerAnzahl, preisLottoschein, lottogemeinschaftAddress, anzahlTeilnehmerAktuell, preisProMitspieler
    };
  }

  async componentDidMount() {
    const euroInWei = process.env.REACT_APP_EURO || '500000000000000';

    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(this.props.tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);

    const gruender = await lottogemeinschaft.methods.gruender().call();
    const maxTeilnehmerAnzahl = (await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call()).toString();
    const preisLottoschein  = (await lottogemeinschaft.methods.preisLottoschein().call()).toString();
    const preisProMitspieler = (await lottogemeinschaft.methods.preisProMitspieler().call()).toString();
    const spielauftragsNummer = await lottogemeinschaft.methods.spielauftragsNummer().call();
    const anzahlTeilnehmerAktuell = (await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call()).toString();
    const gewinnProMitspieler = (await lottogemeinschaft.methods.gewinnProMitspieler().call()).toString();
    const gewinnKannAbgeholtWerden = await lottogemeinschaft.methods.gewinnKannAbgeholtWerden().call();
    const nurErlaubteMitspieler = await lottogemeinschaft.methods.nurErlaubteMitspieler().call();
    const auszahlung = (await lottogemeinschaft.methods.gewinnProMitspieler().call()).toString();

    this.setState({ lottogemeinschaftAddress : lottogemeinschaftAddress.toString(), lottogemeinschaft, gruender, maxTeilnehmerAnzahl, preisLottoschein, preisProMitspieler, spielauftragsNummer, anzahlTeilnehmerAktuell, gewinnProMitspieler, gewinnKannAbgeholtWerden, nurErlaubteMitspieler, auszahlung: auszahlung.toString()});

    const accounts = await web3.eth.getAccounts();
    if (accounts.length !== 0) { // Wenn es mindestens ein Konto gibt
        const userAddress = accounts[0]; // Benutze das erste Konto
        const istMitspieler = await lottogemeinschaft.methods.mitspieler(userAddress).call();
        const istGewinnAusgezahlt = await lottogemeinschaft.methods.gewinnAusgezahlt(userAddress).call();
        const istErlaubterMitspieler = await lottogemeinschaft.methods.erlaubterMitspieler(userAddress).call();
        this.setState({ userAddress, istMitspieler, istGewinnAusgezahlt, istErlaubterMitspieler, lottogemeinschaftAddress });
    } else {
        console.error("Keine Metamask-Adresse gefunden.");
        // Hier könntest du weiteren Code hinzufügen, um mit dem Fall umzugehen, dass keine Adressen gefunden wurden.
        // Zum Beispiel könntest du einen Zustand in deiner Komponente setzen, um dem Benutzer eine entsprechende Nachricht anzuzeigen.
    }
  }

  mitmachHandler = async (lottogemeinschaftAddress) => {
      const { preisProMitspieler, userAddress, euroInWei } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);

      // Berechne den Preis in Wei
      const preisInWei = Number(preisProMitspieler) * Number(euroInWei);

      // Stelle sicher, dass preisInWei eine gültige Nummer ist
      const isValidNumber = !isNaN(preisInWei) && isFinite(preisInWei);

      const valueToSend = isValidNumber ? preisInWei.toString() : '0';

      // Senden der Transaktion mit Metamask
      await lottogemeinschaft.methods.mitmachen().send({ from: userAddress, value: valueToSend });
    };


  preisAendernHandler = async (lottogemeinschaftAddress) => {
      const { neuerPreis, userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.preisLottoscheinAendern(neuerPreis).send({ from: userAddress });
    };

  anzahlMitspielerAendernHandler = async (lottogemeinschaftAddress) => {
      const { neueAnzahlMitspieler, userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.anzahlMitspielerAendern(neueAnzahlMitspieler).send({ from: userAddress });
  };

  erlaubteMitspielerHinzufuegenHandler = async (lottogemeinschaftAddress) => {
      const { erlaubterMitspieler, userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.erlaubteMitspielerAdresseHinzufuegen(erlaubterMitspieler).send({ from: userAddress });
  };

  gemeinschaftAufloesenHandler = async (lottogemeinschaftAddress) => {
      const { userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.gemeinschaftAufloesen().send({ from: userAddress });
  };

  einsatzZurueckholenHandler = async (lottogemeinschaftAddress) => {
      const { userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.einsatzZurueckholen().send({ from: userAddress });
  };

  gewinnEinzahlenHandler = async (lottogemeinschaftAddress, gewinnInEuro) => {
      const gewinnInWei = gewinnInEuro * this.state.euroInWei
      const { userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.gewinnEinzahlen(gewinnInWei).send({ from: userAddress, value: gewinnInWei });
  };

  gewinnAbholenHandler = async (lottogemeinschaftAddress) => {
      const { userAddress } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.gewinnAbholen().send({ from: userAddress });
  };


  renderCards() {
    const {
      tippgemeinschaftsName,
      gruender,
      maxTeilnehmerAnzahl,
      anzahlTeilnehmerAktuell,
      preisLottoschein,
      preisProMitspieler,
      auszahlung,
      // ... andere Zustände
    } = this.props;

    const items = [
      {
        header: tippgemeinschaftsName || "",
        meta: "Tippgemeinschaftsname",
        description: "Name der Tippgemeinschaft",
        style: { overflowWrap: "break-word" },
      },
      {
        header: gruender || "",
        meta: "Gründer-Adresse",
        description: "Wallet-Adresse des Lottogemeinschaftsgründer",
      },
      {
      "header": ["Aktuelle Teilnehmerzahl: " + anzahlTeilnehmerAktuell + " | " || "", "Max. Teilnehmeranzahl: " + maxTeilnehmerAnzahl + " | " || "", "Preis pro Mitspieler: " + preisProMitspieler + " | " || "", "Lottoscheinpreispreis: " + preisLottoschein],
      "meta": "Lottogemeinschaftdetails",
          "description": "Aktuelle Teilnehmeranzahl, Maximale Anzahl an Teilnehmern, Preis um bei der Lottogemeinschaft mitzumachen, Gesamtpreis des Lottoscheins"
      },
      {
        header: this.state.gewinnProMitspieler ? web3.utils.fromWei(this.state.gewinnProMitspieler, "ether") : "Keine",
        meta: "Auszahlungbetrag",
        description: "Auszahlungbetrag in Ether"
      },
      // ... füge weitere Karten hinzu wie benötigt
    ];

    return <Card.Group items={items} itemsPerRow={1} />;
  }

  renderButtons() {
      const { userAddress, gruender, nurErlaubteMitspieler, preisProMitspieler, lottogemeinschaftAddress, anzahlTeilnehmerAktuell, maxTeilnehmerAnzahl, gewinnInEuro } = this.state;
      const isGruender = userAddress === gruender;
      const nochKeineMitspieler = Number(anzahlTeilnehmerAktuell) === 0;
      const bereitsMitspieler = 0 < Number(anzahlTeilnehmerAktuell) && Number(anzahlTeilnehmerAktuell) < Number(maxTeilnehmerAnzahl);
      const istVoll = Number(anzahlTeilnehmerAktuell) === Number(maxTeilnehmerAnzahl);
      const gewinnIstEingezahlt = Number(gewinnInEuro) > 0;

      if (isGruender && nochKeineMitspieler) {
            return (
              <Grid.Row>
                <Grid.Column width={16}>
                  <Form>
                    <Form.Field>
                        <label>Mitmachen</label>
                        <div>
                            Preis pro Mitspieler: {this.state.preisProMitspieler} Euro
                        </div>
                        <Button onClick={() => this.mitmachHandler(this.state.lottogemeinschaftAddress, this.state.deinAnteil)}>Mitmachen</Button>
                    </Form.Field>
                    <Form.Field>
                      <label>Neuer Preis</label>
                      <Input
                        placeholder='Preis in Euro'
                        onChange={event => this.setState({ neuerPreis: event.target.value })}
                      />
                      <Button onClick={() => this.preisAendernHandler(lottogemeinschaftAddress)}>Aktualisieren</Button>
                    </Form.Field>

                    <Form.Field>
                      <label>Neue Anzahl der Mitspieler</label>
                      <Input
                        placeholder='Anzahl der Mitspieler'
                        onChange={event => this.setState({ neueAnzahlMitspieler: event.target.value })}
                      />
                      <Button onClick={() => this.anzahlMitspielerAendernHandler(lottogemeinschaftAddress)}>Aktualisieren</Button>
                    </Form.Field>

                    {nurErlaubteMitspieler && (
                      <Form.Field>
                        <label>Erlaubte Adresse hinzufügen</label>
                        <Input
                          placeholder='Adresse'
                          onChange={event => this.setState({ erlaubteAdresse: event.target.value })}
                        />
                        <Button onClick={() => this.erlaubteMitspielerHinzufuegenHandler(lottogemeinschaftAddress)}>Hinzufügen</Button>
                      </Form.Field>
                    )}
                  </Form>

                  <Button onClick={() => this.gemeinschaftAufloesenHandler(lottogemeinschaftAddress)} color="red">Gemeinschaft auflösen</Button>
                </Grid.Column>
              </Grid.Row>
            );
      } else if (isGruender && bereitsMitspieler) {
            return (
              <Grid.Row>
                <Grid.Column width={16}>
                  <Form>
                    <Form.Field>
                        <label>Mitmachen</label>
                        <div>
                            Preis pro Mitspieler: {this.state.preisProMitspieler} Euro
                        </div>
                        <Button onClick={() => this.mitmachHandler(this.state.lottogemeinschaftAddress, this.state.deinAnteil)}>Mitmachen</Button>
                    </Form.Field>
                    {nurErlaubteMitspieler && (
                      <Form.Field>
                        <label>Erlaubte Adresse hinzufügen</label>
                        <Input
                          placeholder='Adresse'
                          onChange={event => this.setState({ erlaubteAdresse: event.target.value })}
                        />
                        <Button onClick={() => this.erlaubteMitspielerHinzufuegenHandler(lottogemeinschaftAddress)}>Hinzufügen</Button>
                      </Form.Field>
                    )}
                  </Form>

                  <Button onClick={() => this.gemeinschaftAufloesenHandler(lottogemeinschaftAddress)} color="red">Gemeinschaft auflösen</Button>
                </Grid.Column>
              </Grid.Row>
            );
      } else if (isGruender && istVoll){
       return (
              <Grid.Row>
                <Grid.Column width={16}>
                  <Form>

                    <Form.Field>
                      <label>Gewinn einzahlen</label>
                      <Input
                        placeholder='Gewinn in Euro'
                        onChange={event => this.setState({ gewinnInEuro: event.target.value })}
                      />
                      <Button onClick={() => this.gewinnEinzahlenHandler(lottogemeinschaftAddress, this.state.gewinnInEuro)}>Gewinn einzahlen</Button>
                    </Form.Field>
                    <Form.Field>
                        <div>
                            Gewinn pro Mitspieler: {this.state.gewinnInEuro} Euro
                        </div>
                        <Button onClick={() => this.gewinnAbholenHandler(this.state.lottogemeinschaftAddress)} color="green">Gewinn abholen</Button>
                    </Form.Field>
                  </Form>
                </Grid.Column>
              </Grid.Row>
            );
       } else if (!isGruender && !istVoll){
            return (<Form.Field>
                <div>
                    Preis pro Mitspieler: {this.state.preisProMitspieler} Euro
                </div>
                <Button onClick={() => this.mitmachHandler(this.state.lottogemeinschaftAddress, this.state.deinAnteil)}>Mitmachen für {this.state.preisProMitspieler} Euro</Button>
            </Form.Field>)
      } else if (!isGruender && istVoll){
            const gewinnInEuro = web3.utils.fromWei(this.state.gewinnProMitspieler, "ether") * this.state.euroInWei / 100000000000;
            return (<Form.Field>
                <div>
                    Gewinn pro Mitspieler: {gewinnInEuro} Euro
                </div>
                <Button onClick={() => this.gewinnAbholenHandler(this.state.lottogemeinschaftAddress)} color="green">Gewinn abholen</Button>
            </Form.Field>)
      }

    }


  render() {
    const { userAddress, gruender } = this.state;
    if (userAddress === gruender) {
        return (
          <Layout>
            <h3>Lottogemeinschaftsverwaltung</h3>
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>{this.renderCards()}</Grid.Column>
              </Grid.Row>
              {this.renderButtons()}
            </Grid>
          </Layout>
        );
      } else {
        return (
          <Layout>
            <h3>Lottogemeinschaftsansicht</h3>
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>{this.renderCards()}</Grid.Column>
              </Grid.Row>
              {this.renderButtons()}
            </Grid>
          </Layout>
        );
      }
    }
}

export default LottogemeinschaftVerwalten;