// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.23 <0.9.0;

contract LottogemeinschaftFabrik{

    address payable[] public lottogemeinschaften;
    string[] public lottogemeinschaftsnamen;
    mapping(string => address) public lottogemeinschaftsnamenmapping;

    function gruendeLottogemeinschaft (string memory name, uint16 anzahl, uint32 preis, uint48 scheinNummer, bool mitspielerBestimmen) public {
        address neueLottogemeinschaft = address( new Lottogemeinschaft(name, msg.sender, anzahl, preis,scheinNummer, mitspielerBestimmen));
        lottogemeinschaften.push(payable(neueLottogemeinschaft));
        lottogemeinschaftsnamen.push(name);
        lottogemeinschaftsnamenmapping[name] = neueLottogemeinschaft;
    }

    function getGegruendeteLottogemeinschaften() public view returns (address payable[] memory) {
        return lottogemeinschaften;
    }

    function getLottogemeinschaftsnamen() public view returns (string[] memory) {
        return lottogemeinschaftsnamen;
    }
}

contract Lottogemeinschaft {

    address public gruender;
    string public tippgemeinschaftsName;
    uint16 public maxTeilnehmerAnzahl;
    uint48 public auszahlung;
    uint32 public preisLottoschein;
    uint48 public lottoscheinNummer;
    mapping(address => bool) public mitspieler;
    mapping(address => bool) public gewinnAusgezahlt;
    uint16 public anzahlTeilnehmerAktuell;
    uint48 public gewinnProMitspieler = 0;
    bool public kannGewinnAbgeholtWerden=false;
    bool public nurErlaubteMitspieler=false;
    mapping(address => bool) erlaubteMitspieler;
    bool private locked;

    constructor ( string memory name, address ersteller, uint16 anzahl, uint32 preis, uint48 scheinNummer, bool mitspielerBestimmen) {
        require(anzahl<65535, "Maximal 65534 Mitspieler erlaubt");
        require(preisLottoschein<4294967295, "Maximaler Preis 4294967295");
        gruender = ersteller;
        tippgemeinschaftsName = name;
        maxTeilnehmerAnzahl = anzahl;
        preisLottoschein = preis;
        nurErlaubteMitspieler=mitspielerBestimmen;
        lottoscheinNummer = scheinNummer;
    }

    modifier restictedToGruender(){
        require(msg.sender == gruender);
        _;
    }

    modifier restictedToMitspieler(){
        require(mitspieler[msg.sender]);
        _;
    }

    modifier nonReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    function mitmachen() public payable {
    // Checks
        uint32 erforderlicherBetrag = preisLottoschein / maxTeilnehmerAnzahl;
        require(msg.value >= erforderlicherBetrag, "Zu geringer Einzahlungsbetrag");
        require(!mitspieler[msg.sender], "Bereits als Mitspieler registriert");
        require(anzahlTeilnehmerAktuell < maxTeilnehmerAnzahl, "Maximale Teilnehmerzahl erreicht");
        require(gewinnProMitspieler==0, "Gewinn wurde bereits eingezahlt");
        if (nurErlaubteMitspieler){
            require(erlaubteMitspieler[msg.sender]);
        }

        // Effects
        uint ueberschuss = msg.value - erforderlicherBetrag;
        mitspieler[msg.sender] = true;
        anzahlTeilnehmerAktuell++;

        // Interactions
        if (ueberschuss > 0) {
            payable(msg.sender).transfer(ueberschuss);
        }
    }

    // Funktion zum Einzahlen des Gewinns
    function gewinnEinzahlen(uint48 gewinn) public payable restictedToGruender {
        // Überprüfen, ob der übergebene Betrag dem eingezahlten Betrag entspricht
        require(msg.value > 0, "Einzahlungsbetrag muss groesser als 0 sein");
        require(gewinnProMitspieler==0, "Gewinn wurde bereits eingezahlt.");

        // Der eingezahlte Betrag wird automatisch dem Contract-Guthaben hinzugefügt
        // Hier könnten Sie zusätzliche Logik hinzufügen, falls notwendig
        // Zum Beispiel: Speichern des Gewinnbetrags im Contract
        gewinnProMitspieler = gewinn / anzahlTeilnehmerAktuell;
        kannGewinnAbgeholtWerden = true;

    }


    // Funktion zur Auszahlung der Gewinne
    function gewinnAuszahlen() public restictedToMitspieler nonReentrant {
        // Checks
        require(gewinnProMitspieler > 0, "Kein Gewinn eingezahlt");
        require(mitspieler[msg.sender], "Du bist kein Mitspieler");
        require(!gewinnAusgezahlt[msg.sender], "Dein Gewinn wurde bereits ausgezahlt");

        // Effects
        gewinnAusgezahlt[msg.sender] = true;

        // Interactions
        uint auszahlungsbetrag = gewinnProMitspieler;
        (bool sent, ) = msg.sender.call{value: auszahlungsbetrag}("");
        require(sent, "Auszahlung des Gewinns fehlgeschlagen");
    }



    function preisLottoscheinAendern(uint32 neuerPreis) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Preisaenderung nicht mehr moeglich.");
        preisLottoschein = neuerPreis;
    }

    function anzahlMitspielerAendern(uint16 neueAnzahlMaxTeilnehmer) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Aenderung der Anzahl an Mitspielern nicht mehr moeglich.");
        maxTeilnehmerAnzahl = neueAnzahlMaxTeilnehmer;
    }

    function erlaubteMitspielerAdresseHinzufuegen(address erlaubterMitspieler) public restictedToGruender{
         require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Aenderung nicht mehr moeglich.");
         erlaubteMitspieler[erlaubterMitspieler] = true;
    }

}