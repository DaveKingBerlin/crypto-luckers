import React, { Component } from "react";
import { Card, Grid, Button } from "semantic-ui-react";
import Layout from "../../components/Layout";
import Lottogemeinschaft from "../../ethereum/lottogemeinschaft";
import factory from "../../ethereum/fabrik";
import web3 from "../../ethereum/web3";
import { Link } from "../../routes";

class LottogemeinschaftVerwalten extends Component {
  static async getInitialProps({ query }) {
    const { tippgemeinschaftsName } = query;
    const lottogemeinschaftAddress = await factory.methods.lottogemeinschaftsnamenmapping(tippgemeinschaftsName).call();
    const lottogemeinschaft = Lottogemeinschaft(lottogemeinschaftAddress);

    const gruender = await lottogemeinschaft.methods.grunder().call();
    const maxTeilnehmerAnzahl = await lottogemeinschaft.methods.maxTeilnehmerAnzahl().call();
    const preisLottoschein  = await lottogemeinschaft.methods.preisLottoschein().call();
    const preisProMitspieler = await lottogemeinschaft.methods.preisProMitspieler().call();
    const spielauftragsNummer = await lottogemeinschaft.methods.spielauftragsNummer().call();
    const auszahlung = await lottogemeinschaft.methods.auszahlung().call();
    const istMitspieler = await lottogemeinschaft.methods.mitspieler(query.address).call();
    const istGewinnAusgezahlt = await lottogemeinschaft.methods.gewinnAusgezahlt(query.address).call();
    const anzahlTeilnehmerAktuell = await lottogemeinschaft.methods.anzahlTeilnehmerAktuell().call();
    const gewinnProMitspieler = await lottogemeinschaft.methods.gewinnProMitspieler().call();
    const kannGewinnAbgeholtWerden = await lottogemeinschaft.methods.kannGewinnAbgeholtWerden().call();
    const nurErlaubteMitspieler = await lottogemeinschaft.methods.nurErlaubteMitspieler().call();
    const istErlaubterMitspieler = await lottogemeinschaft.methods.erlaubteMitspieler(query.address).call();

    return {
          address: query.address,
          tippgemeinschaftsName: tippgemeinschaftsName,
          gruender: gruender,
          maxTeilnehmerAnzahl: maxTeilnehmerAnzahl,
          preisLottoschein: preisLottoschein,
          spielauftragsNummer: spielauftragsNummer,
          auszahlung: auszahlung,
          istMitspieler: istMitspieler,
          istGewinnAusgezahlt: istGewinnAusgezahlt,
          anzahlTeilnehmerAktuell: anzahlTeilnehmerAktuell,
          kannGewinnAbgeholtWerden: kannGewinnAbgeholtWerden,
          nurErlaubteMitspieler: nurErlaubteMitspieler,
          istErlaubterMitspieler:istErlaubterMitspieler
    };
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
        header: tippgemeinschaftsName,
        meta: "tippgemeinschaftsName",
        description:
          "",
        style: { overflowWrap: "break-word" },
      },
      {
        header: gruender,
        meta: "gruender",
        description:
          "",
      },
      {
        header: maxTeilnehmerAnzahl,
        meta: "maxTeilnehmerAnzahl",
        description:
          "",
      },
      {
        header: preisLottoschein,
        meta: "preisLottoschein",
        description:
          "",
      },
      {
        header: web3.utils.fromWei(auszahlung, "ether"),
        meta: "auszahlung",
        description:
          "",
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
