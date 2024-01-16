// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.23 <0.9.0;

contract LottogemeinschaftFabrik{

    // Deklarieren von Ereignissen
    event LottogemeinschaftGegruendet(address lottogemeinschaftAdresse, string name);
    event FehlerBeimGruenden(string message);

    address payable[] public lottogemeinschaften;
    string[] public lottogemeinschaftsnamen;
    mapping(string => address) public lottogemeinschaftsnamenmapping;

    function gruendeLottogemeinschaft (string memory name, uint16 anzahl, uint32 preis, string memory scheinNummer, bool mitspielerBestimmen) public {
    require(bytes(name).length > 0, "Name darf nicht leer sein");
    require(bytes(name).length < 30, "Maximal 30 Zeichen");
    require(anzahl > 0, "Anzahl muss groesser als 0 sein");
    require(anzahl < 65535, "Anzahl muss kleiner als 65535 sein");
    require(preis > 0, "Preis muss groesser als 0 sein");
    require(preis < 4294967295, "Preis muss kleiner als 4294967295 sein");
    require(bytes(scheinNummer).length == 16, "ScheinNummer muss 16 Ziffern haben");

    address neueLottogemeinschaft = address(new Lottogemeinschaft(name, msg.sender, anzahl, preis, scheinNummer, mitspielerBestimmen));
    lottogemeinschaften.push(payable(neueLottogemeinschaft));
    lottogemeinschaftsnamen.push(name);
    lottogemeinschaftsnamenmapping[name] = neueLottogemeinschaft;

    emit LottogemeinschaftGegruendet(neueLottogemeinschaft, name);
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
    uint256  public maxTeilnehmerAnzahl;
    uint256  public preisLottoschein;
    uint256  public preisProMitspieler;
    string public spielauftragsNummer;
    uint256  public auszahlung;
    mapping(address => bool) public mitspieler;
    mapping(address => bool) public gewinnAusgezahlt;
    mapping(address => bool) public einsatzZurueckGezahlt;
    uint256  public anzahlTeilnehmerAktuell;
    uint256 public gewinnProMitspieler = 0;
    bool public gewinnKannAbgeholtWerden=false;
    bool public nurErlaubteMitspieler=false;
    mapping(address => bool) public erlaubterMitspieler;
    bool private locked;
    bool public aufgeloest;

    constructor (string memory name, address ersteller, uint256  anzahl, uint256  preis, string memory scheinNummer, bool mitspielerBestimmen) {
        require(anzahl < 65535, "Maximal 65534 Mitspieler erlaubt");
        require(preis < 4294967295, "Maximaler Preis 4294967295");
        gruender = ersteller;
        tippgemeinschaftsName = name;
        maxTeilnehmerAnzahl = anzahl;
        preisLottoschein = preis;
        nurErlaubteMitspieler = mitspielerBestimmen;
        spielauftragsNummer = scheinNummer;
        preisProMitspieler = preisLottoschein * 1e18 / maxTeilnehmerAnzahl / 1e18; // Rückumwandlung in uint256
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
        require(preisProMitspieler>0, "Kein Preis pro Mitspieler");
        require(msg.value >= preisProMitspieler, "Zu geringer Einzahlungsbetrag");
        require(!mitspieler[msg.sender], "Bereits als Mitspieler registriert");
        require(anzahlTeilnehmerAktuell < maxTeilnehmerAnzahl, "Maximale Teilnehmerzahl erreicht");
        require(gewinnProMitspieler==0, "Gewinn wurde bereits eingezahlt");
        if (nurErlaubteMitspieler){
            require(erlaubterMitspieler[msg.sender]);
        }



        // Effects
        uint256  ueberschuss = msg.value - preisProMitspieler;
        mitspieler[msg.sender] = true;
        anzahlTeilnehmerAktuell++;

        // Interactions
        if (ueberschuss > 0) {
            payable(msg.sender).transfer(ueberschuss);
        }
    }

    // Funktion zum Einzahlen des Gewinns
    function gewinnEinzahlen(uint256  gewinn) public payable restictedToGruender {
        // Überprüfen, ob der übergebene Betrag dem eingezahlten Betrag entspricht
        require(msg.value > 0, "Einzahlungsbetrag muss groesser als 0 sein");
        require(gewinnProMitspieler==0, "Gewinn wurde bereits eingezahlt.");

        // Der eingezahlte Betrag wird automatisch dem Contract-Guthaben hinzugefügt
        // Hier könnten Sie zusätzliche Logik hinzufügen, falls notwendig
        // Zum Beispiel: Speichern des Gewinnbetrags im Contract
        gewinnProMitspieler = gewinn / anzahlTeilnehmerAktuell;
        gewinnKannAbgeholtWerden = true;

    }


    // Funktion, um den Gewinn abzuholen
    function gewinnAbholen() public restictedToMitspieler nonReentrant {
        require(gewinnKannAbgeholtWerden, "Gewinn kann noch nicht abgeholt werden.");
        require(gewinnProMitspieler > 0, "Kein Gewinn zur Auszahlung verfuegbar.");
        require(!gewinnAusgezahlt[msg.sender], "Gewinn wurde bereits abgeholt.");

        gewinnAusgezahlt[msg.sender] = true;

        uint256  auszahlungsbetrag = gewinnProMitspieler;
        payable(msg.sender).transfer(auszahlungsbetrag);
    }


    function preisLottoscheinAendern(uint256  neuerPreis) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Preisaenderung nicht mehr moeglich.");
        preisLottoschein = neuerPreis;
    }

    function anzahlMitspielerAendern(uint256  neueAnzahlMaxTeilnehmer) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Aenderung der Anzahl an Mitspielern nicht mehr moeglich.");
        maxTeilnehmerAnzahl = neueAnzahlMaxTeilnehmer;
    }

    function erlaubteMitspielerAdresseHinzufuegen(address _erlaubterMitspieler) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Aenderung nicht mehr moeglich.");
        erlaubterMitspieler[_erlaubterMitspieler] = true;
    }

    // Funktion zum Auflösen der Lottogemeinschaft und Auszahlung der Einzahlungen aktivieren
    function gemeinschaftAufloesen() public restictedToGruender {
        require(gewinnKannAbgeholtWerden == false, "Gewinn muss noch ausgezahlt werden");
        require(aufgeloest == false, "Gemeinschaft bereits aufgeloest");
        aufgeloest = true;
    }

    // Funktion, um den Einsatz zurückzuerhalten
    function einsatzZurueckholen() public restictedToMitspieler nonReentrant {
        require(aufgeloest, "Gemeinschaft muss aufgeloest sein.");
        require(!einsatzZurueckGezahlt[msg.sender], "Einsatz wurde bereits zurueckgezahlt.");

        einsatzZurueckGezahlt[msg.sender] = true;

        uint256 rueckzahlungsbetrag = preisProMitspieler;
        (bool sent, ) = msg.sender.call{value: rueckzahlungsbetrag}("");
        require(sent, "Rueckzahlung des Einsatzes fehlgeschlagen.");
    }


}