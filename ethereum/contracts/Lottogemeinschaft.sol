// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.23 <0.9.0;

contract LottogemeinschaftFabrik{

    address[] public lottogemeinschaften;

    function gruendeLottogemeinschaft (string memory name, uint anzahl, uint preis) public {
        address neueLottogemeinschaft = address( new Lottogemeinschaft(name, msg.sender, anzahl, preis));
        lottogemeinschaften.push(neueLottogemeinschaft);
    }

    function getLottogemeinschaften() public view returns (address[] memory ){
        return lottogemeinschaften;
    }

}

contract Lottogemeinschaft {

    struct Lottotipp {
        uint8[5] hauptzahlen;
        uint8[2] zusatzzahlen;
    }

    address public gruender;
    string public tippgemeinschaftsName;
    uint public maxTeilnehmerAnzahl;
    uint public auszahlung;
    uint public preisLottoschein;
    Lottotipp[] internal lottoschein;
    uint public anzahlLottotipps;
    mapping(address => bool) public mitspieler;
    address[] public mitspielerAddressen;
    uint public anzahlTeilnehmerAktuell;

    uint public gewinnBetrag = 0;
    uint private auszahlungsIndex = 0;
    uint constant CHARGE_GROESSE = 5;

    // Getter-Funktion für den Auszahlungsindex
    function getAuszahlungsIndex() public view returns (uint) {
        return auszahlungsIndex;
    }


    mapping(address => bool) erlaubteMitspieler;
    constructor ( string memory name, address ersteller, uint anzahl, uint preis) {
        gruender = ersteller;
        tippgemeinschaftsName = name;
        maxTeilnehmerAnzahl = anzahl;
        preisLottoschein = preis;
    }

    modifier restictedToGruender(){
        require(msg.sender == gruender);
        _;
    }

    modifier restictedToMitspieler(){
        require(mitspieler[msg.sender]);
        _;
    }

    function mitmachen() public payable {
    // Checks
        uint erforderlicherBetrag = preisLottoschein / maxTeilnehmerAnzahl;
        require(msg.value >= erforderlicherBetrag, "Zu geringer Einzahlungsbetrag");
        require(!mitspieler[msg.sender], "Bereits als Mitspieler registriert");
        require(anzahlTeilnehmerAktuell < maxTeilnehmerAnzahl, "Maximale Teilnehmerzahl erreicht");

        // Effects
        uint ueberschuss = msg.value - erforderlicherBetrag;
        mitspieler[msg.sender] = true;
        mitspielerAddressen.push(msg.sender);
        anzahlTeilnehmerAktuell++;

        // Interactions
        if (ueberschuss > 0) {
            payable(msg.sender).transfer(ueberschuss);
        }
    }

    // Funktion zum Einzahlen des Gewinns
    function gewinnEinzahlen(uint gewinn) public payable restictedToGruender {
        // Überprüfen, ob der übergebene Betrag dem eingezahlten Betrag entspricht
        require(msg.value > 0, "Einzahlungsbetrag muss groesser als 0 sein");

        // Der eingezahlte Betrag wird automatisch dem Contract-Guthaben hinzugefügt
        // Hier könnten Sie zusätzliche Logik hinzufügen, falls notwendig
        // Zum Beispiel: Speichern des Gewinnbetrags im Contract
        gewinnBetrag = gewinn;
    }


    // Funktion zur Auszahlung der Gewinne
    function auszahlen() public payable restictedToGruender {
        // Checks
        uint anzahlDerMitspieler = anzahlTeilnehmerAktuell;
        require(anzahlDerMitspieler > 0, "Keine Mitspieler vorhanden");
        require(anzahlTeilnehmerAktuell == maxTeilnehmerAnzahl, "Nicht alle Mitspieler haben teilgenommen");
        uint gewinnProPerson = address(this).balance / anzahlDerMitspieler;
        require(gewinnProPerson > 0, "Nicht genuegend Guthaben fuer Auszahlung");

        // Effects
        // Auszahlung in Chargen von jeweils 5 Mitspielern
        uint endChargeIndex = auszahlungsIndex + CHARGE_GROESSE;
        for (uint i = auszahlungsIndex; i < endChargeIndex && i < anzahlDerMitspieler; i++) {
            address mitspielerAdresse = mitspielerAddressen[i];

            // Sicherere Methode der Ether-Überweisung
            (bool sent, ) = payable(mitspielerAdresse).call{value: gewinnProPerson}("");
            require(sent, "Auszahlung fehlgeschlagen");
        }

        // Aktualisieren des Auszahlungsindex
        auszahlungsIndex = endChargeIndex > anzahlDerMitspieler ? anzahlDerMitspieler : endChargeIndex;

        // Zurücksetzen nach der vollständigen Auszahlung
        if (auszahlungsIndex == anzahlDerMitspieler) {
            for (uint i = 0; i < anzahlDerMitspieler; i++) {
                address mitspielerAdresse = mitspielerAddressen[i];
                delete mitspieler[mitspielerAdresse];
            }

            delete mitspielerAddressen;
            anzahlTeilnehmerAktuell = 0;
            auszahlungsIndex = 0;
        }
    }

    function lottotippEintragen(uint8[5] memory _hauptzahlen, uint8[2] memory _zusatzzahlen) public restictedToGruender{
        // Validierung der Hauptzahlen
        for(uint i = 0; i < _hauptzahlen.length; i++) {
            require(_hauptzahlen[i] >= 1 && _hauptzahlen[i] <= 50, "Hauptzahl ausserhalb des Bereichs");
        }

        // Validierung der Zusatzzahlen
        for(uint i = 0; i < _zusatzzahlen.length; i++) {
            require(_zusatzzahlen[i] >= 1 && _zusatzzahlen[i] <= 12, "Zusatzzahl ausserhalb des Bereichs");
        }

        Lottotipp memory neuerTipp = Lottotipp({
            hauptzahlen: _hauptzahlen,
            zusatzzahlen: _zusatzzahlen
        });

        lottoschein.push(neuerTipp);
    }

    function preisLottoscheinAendern(uint neuerPreis) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Preisaenderung nicht mehr moeglich.");
        preisLottoschein = neuerPreis;
    }

    function anzahlMitspielerAendern(uint neueAnzahlMaxTeilnehmer) public restictedToGruender{
        require(anzahlTeilnehmerAktuell==0, "Es gibt bereits Mitspieler. Aenderung der Anzahl an Mitspielern nicht mehr moeglich.");
        maxTeilnehmerAnzahl = neueAnzahlMaxTeilnehmer;
    }


}