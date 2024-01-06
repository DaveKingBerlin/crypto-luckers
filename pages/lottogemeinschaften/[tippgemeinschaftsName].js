import React, { Component } from "react";
import { Card, Grid, Button, Form, Input } from "semantic-ui-react";
import Layout from "../../components/Layout";
import Lottogemeinschaft from "../../ethereum/lottogemeinschaft";
import factory from "../../ethereum/fabrik";
import web3 from "../../ethereum/web3";
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

  };

  static async getInitialProps({ query }) {
    const { tippgemeinschaftsName } = query;
    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(query.tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
    const gruender = await lottogemeinschaft.methods.gruender().call();
    const maxTeilnehmerAnzahl = (await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call()).toString();
    const preisLottoschein  = (await lottogemeinschaft.methods.preisLottoschein().call()).toString();
    const anzahlTeilnehmerAktuell = (await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call()).toString();

    return {
      tippgemeinschaftsName, gruender, maxTeilnehmerAnzahl, preisLottoschein, lottogemeinschaftAddress, anzahlTeilnehmerAktuell
    };
  }

  async componentDidMount() {

    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(this.props.tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);

    const gruender = await lottogemeinschaft.methods.gruender().call();
    const maxTeilnehmerAnzahl = (await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call()).toString();
    const preisLottoschein  = (await lottogemeinschaft.methods.preisLottoschein().call()).toString();
    const preisProMitspieler = (await lottogemeinschaft.methods.preisProMitspieler().call()).toString();
    const spielauftragsNummer = await lottogemeinschaft.methods.spielauftragsNummer().call();
    const anzahlTeilnehmerAktuell = (await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call()).toString();
    const gewinnProMitspieler = (await lottogemeinschaft.methods.gewinnProMitspieler().call()).toString();
    const kannGewinnAbgeholtWerden = await lottogemeinschaft.methods.kannGewinnAbgeholtWerden().call();
    const nurErlaubteMitspieler = await lottogemeinschaft.methods.nurErlaubteMitspieler().call();
    const auszahlung = (web3.utils.fromWei(await lottogemeinschaft.methods.auszahlung().call(), "ether")).toString();

    this.setState({ lottogemeinschaftAddress : lottogemeinschaftAddress.toString(), lottogemeinschaft, gruender, maxTeilnehmerAnzahl, preisLottoschein, preisProMitspieler, spielauftragsNummer, anzahlTeilnehmerAktuell, gewinnProMitspieler, kannGewinnAbgeholtWerden, nurErlaubteMitspieler, auszahlung: auszahlung.toString()});

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
      const { preisProMitspieler, userAddress  } = this.state;
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.mitmachen().send({ from: userAddress, value: preisProMitspieler });
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
      const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);
      await lottogemeinschaft.methods.gemeinschaftAufloesen().send({ from: userAddress });
  };

  renderCards() {
    const {
      tippgemeinschaftsName,
      gruender,
      maxTeilnehmerAnzahl,
      anzahlTeilnehmerAktuell,
      preisLottoschein,
      auszahlung,
      // ... andere Zustände
    } = this.props;

    const items = [
      {
        header: tippgemeinschaftsName || "",
        meta: "tippgemeinschaftsName",
        description: "",
        style: { overflowWrap: "break-word" },
      },
      {
        header: gruender || "",
        meta: "gruender",
        description: "",
      },
      {
      "header": ["Aktuelle Teilnehmerzahl: " + anzahlTeilnehmerAktuell + "----" || "", "Maximale Teilnehmeranzahl: " + maxTeilnehmerAnzahl + "----" || "", "Preis für Lottoschein: " + preisLottoschein || ""],
      "meta": "Lottogemeinschaftdetails",
          "description": {
            "maxteilnehmeranzahl": "Gibt die maximale Anzahl von Teilnehmern an, die für das Ereignis zugelassen sind.",
            "preislottoschein": "Gibt den Preis für einen einzelnen Lottoschein an.",
            "anzahlteilnehmeraktuell": "Zeigt die Anzahl der Personen an, die sich bereits für das Ereignis angemeldet haben."
          }
      },
      {
        header: auszahlung ? web3.utils.fromWei(auszahlung, "ether") : "Keine",
        meta: "auszahlung",
        description: ""
      },
      // ... füge weitere Karten hinzu wie benötigt
    ];

    return <Card.Group items={items} itemsPerRow={1} />;
  }

  renderButtons() {
      const { userAddress, gruender, nurErlaubteMitspieler, preisProMitspieler, lottogemeinschaftAddress, anzahlTeilnehmerAktuell, maxTeilnehmerAnzahl } = this.state;

      if (userAddress === gruender) {
        return (
          <Grid.Row>
            <Grid.Column width={16}>
              <Form>
                <Form.Field>
                <label>Mitmachen</label>
                <Input
                    placeholder={`Preis pro Mitspieler: ${this.state.preisProMitspieler} ETH`}
                    onChange={event => this.setState({ deinAnteil: event.target.value })}
                />
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
      } else if (anzahlTeilnehmerAktuell < maxTeilnehmerAnzahl){
            return (<Form>
                <Form.Field>
                <label>Mitmachen</label>
                <Input
                    placeholder={`Preis pro Mitspieler: ${this.state.preisProMitspieler} ETH`}
                    onChange={event => this.setState({ deinAnteil: event.target.value })}
                />
                <Button onClick={() => this.mitmachHandler(this.state.lottogemeinschaftAddress, this.state.deinAnteil)}>Mitmachen</Button>
                </Form.Field>
            </Form>)
      } else {
        return null; // Keine Buttons rendern, wenn anzahlTeilnehmerAktuell == maxTeilnehmerAnzahl
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