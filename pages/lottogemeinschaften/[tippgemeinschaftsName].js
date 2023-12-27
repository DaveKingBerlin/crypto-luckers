import React, { Component } from "react";
import { Card, Grid, Button } from "semantic-ui-react";
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
    // ... andere Zustände
  };

  static async getInitialProps({ query }) {

    const { tippgemeinschaftsName } = query;

    return {
          tippgemeinschaftsName
    };
  }

  async componentDidMount() {

    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(this.props.tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);

    const gruender = await lottogemeinschaft.methods.gruender().call();
    const maxTeilnehmerAnzahl = await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call();
    const preisLottoschein  = await lottogemeinschaft.methods.preisLottoschein().call();
    const preisProMitspieler = await lottogemeinschaft.methods.preisProMitspieler().call();
    const spielauftragsNummer = await lottogemeinschaft.methods.spielauftragsNummer().call();

    const anzahlTeilnehmerAktuell = await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call();
    const gewinnProMitspieler = await lottogemeinschaft.methods.gewinnProMitspieler().call();
    const kannGewinnAbgeholtWerden = await lottogemeinschaft.methods.kannGewinnAbgeholtWerden().call();
    const nurErlaubteMitspieler = await lottogemeinschaft.methods.nurErlaubteMitspieler().call();
    const auszahlung = web3.utils.fromWei(await lottogemeinschaft.methods.auszahlung().call(), "ether");

    this.setState({ gruender, maxTeilnehmerAnzahl, preisLottoschein, spielauftragsNummer, anzahlTeilnehmerAktuell, gewinnProMitspieler, kannGewinnAbgeholtWerden, nurErlaubteMitspieler, auszahlung: auszahlung.toString()});

    const accounts = await web3.eth.getAccounts();
    if (accounts.length !== 0) { // Wenn es mindestens ein Konto gibt
        const userAddress = accounts[0]; // Benutze das erste Konto
        const istMitspieler = await lottogemeinschaft.methods.mitspieler(userAddress).call();
        const istGewinnAusgezahlt = await lottogemeinschaft.methods.gewinnAusgezahlt(userAddress).call();
        const istErlaubterMitspieler = await lottogemeinschaft.methods.erlaubterMitspieler(userAddress).call();
        this.setState({ userAddress, istMitspieler, istGewinnAusgezahlt, istErlaubterMitspieler });
    } else {
        console.error("Keine Metamask-Adresse gefunden.");
        // Hier könntest du weiteren Code hinzufügen, um mit dem Fall umzugehen, dass keine Adressen gefunden wurden.
        // Zum Beispiel könntest du einen Zustand in deiner Komponente setzen, um dem Benutzer eine entsprechende Nachricht anzuzeigen.
    }

    if (accounts.length !== 0) {
      console.error("Keine Metamask-Adresse gefunden.");
      return; // Frühzeitige Rückkehr, wenn keine Adresse gefunden wird
    }
  }

  renderCards() {
    const {
      tippgemeinschaftsName,
      gruender,
      maxTeilnehmerAnzahl,
      preisLottoschein,
      spielauftragsNummer,
      auszahlung,
      istMitspieler,
      istGewinnAusgezahlt,
      anzahlTeilnehmerAktuell,
      kannGewinnAbgeholtWerden,
      nurErlaubteMitspieler,
      istErlaubterMitspieler
    } = this.props;

    const items = [
      {
        header: this.props.tippgemeinschaftsName || "",
        meta: "tippgemeinschaftsName",
        description:
          "",
        style: { overflowWrap: "break-word" },
      },
      {
        header: this.props.gruender || "",
        meta: "gruender",
        description:
          "",
      },
      {
        header: this.props.maxTeilnehmerAnzahl || "",
        meta: "maxTeilnehmerAnzahl",
        description:
          "",
      },
      {
        header: this.props.preisLottoschein || "",
        meta: "preisLottoschein",
        description:
          "",
      },
      {
        header: this.props.auszahlung ? web3.utils.fromWei(this.props.auszahlung, "ether") : "Lädt...",
        meta: "auszahlung",
        description: ""
        // ...
      },
    ];

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <h3>Lottogemeinschaftsverwaltung</h3>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>{this.renderCards()}</Grid.Column>
            <Grid.Column width={6}>
              <h3>Address: {this.props.address}</h3>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Layout>
    );
  }
}

export default LottogemeinschaftVerwalten;