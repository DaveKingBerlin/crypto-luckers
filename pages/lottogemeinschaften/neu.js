import React, { Component } from "react";
import { Form, Button, Input, Message } from "semantic-ui-react";
import Layout from "../../components/Layout";
import fabrik from "../../ethereum/fabrik";
import web3 from "../../ethereum/web3";
import Router from 'next/router';


class LottogemeinschaftNeu extends Component {
  state = {
    tippgemeinschaftsName: "Lottogemeinschaftsname",
    spielauftragsNummer: "1234567890123456",
    preisLottoschein: 4,
    maxTeilnehmerAnzahl: 2,
    nurErlaubteMitspieler:false,
    errorMessage: "",
    loading: false,
  };

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await fabrik.methods
        .gruendeLottogemeinschaft(this.state.tippgemeinschaftsName, this.state.maxTeilnehmerAnzahl, this.state.preisLottoschein, this.state.spielauftragsNummer, this.state.nurErlaubteMitspieler )
        .send({
          from: accounts[0],
        });

      Router.push(`/lottogemeinschaften/${this.state.tippgemeinschaftsName}`);

    } catch (err) {
      this.setState({ errorMessage: err.message });
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h1>Lottogemeinschaft gründen</h1>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <label>TippgemeinschaftsName</label>
            <Input
              label=""
              labelPosition="right"
              value={this.state.tippgemeinschaftsName}
              onChange={(event) =>
                this.setState({ tippgemeinschaftsName: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field>
            <label>SpielauftragsNummer</label>
            <Input
              label=""
              labelPosition="right"
              value={this.state.spielauftragsNummer}
              onChange={(event) =>
                this.setState({ spielauftragsNummer: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field>
            <label>Preis des Lottoschein</label>
            <Input
              label="€"
              labelPosition="right"
              value={this.state.preisLottoschein}
              onChange={(event) =>
                this.setState({ preisLottoschein: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field>
            <label>Maximale Anzahl an Teilnehmern</label>
            <Input
              label=""
              labelPosition="right"
              value={this.state.maxTeilnehmerAnzahl}
              onChange={(event) =>
                this.setState({ maxTeilnehmerAnzahl: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field>
            <label>Möchten Sie nur bestimmte Mitspieler zulassen</label>
            <Input
              label=""
              labelPosition="right"
              value={this.state.nurErlaubteMitspieler}
              onChange={(event) =>
                this.setState({ nurErlaubteMitspieler: event.target.value })
              }
            />
          </Form.Field>
          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button loading={this.state.loading} primary>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default LottogemeinschaftNeu;
