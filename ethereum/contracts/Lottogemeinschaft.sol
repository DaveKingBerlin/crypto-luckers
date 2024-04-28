// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottogemeinschaft {
    address public gruender;
    string public name;
    uint public balance;
    uint public maxTeilnehmer;
    uint public aktuelleTeilnehmer;
    bool public gewinnEingezahlt;

    event BeitrittErfolgreich(address teilnehmer);
    event GewinnEingezahlt(uint betrag);
    event EinsatzAbgeholt(uint betrag);

    constructor(address _gruender, string memory _name, uint _maxTeilnehmer) {
        gruender = _gruender;
        name = _name;
        maxTeilnehmer = _maxTeilnehmer;
        balance = 0;
        aktuelleTeilnehmer = 0;
        gewinnEingezahlt = false;
    }

    function beitreten() public payable {
        require(aktuelleTeilnehmer < maxTeilnehmer, "Maximale Teilnehmerzahl erreicht");
        require(msg.value > 0, "Ein Beitrag ist erforderlich");
        balance += msg.value;
        aktuelleTeilnehmer++;
        emit BeitrittErfolgreich(msg.sender);
    }

    function gewinnEinzahlen(uint betrag) public {
        require(msg.sender == gruender, "Nur der Gruender kann Gewinne einzahlen");
        require(!gewinnEingezahlt, "Gewinn wurde bereits eingezahlt");
        balance += betrag;
        gewinnEingezahlt = true;
        emit GewinnEingezahlt(betrag);
    }

    function einsatzAbholen() public {
        require(msg.sender == gruender, "Nur der Gruender kann den Einsatz abholen");
        require(!gewinnEingezahlt, "Gewinn wurde schon eingezahlt");
        payable(gruender).transfer(balance);
        emit EinsatzAbgeholt(balance);
        balance = 0;
    }
}

contract LottogemeinschaftFabrik {
    mapping(string => address) private lottogemeinschaftAdressen;
    event LottogemeinschaftGegruendet(address lottogemeinschaftAdresse, string name);

    function gruendeLottogemeinschaft(string memory name, uint maxTeilnehmer) public {
        require(lottogemeinschaftAdressen[name] == address(0), "Name ist bereits vergeben");
        Lottogemeinschaft neueLottogemeinschaft = new Lottogemeinschaft(msg.sender, name, maxTeilnehmer);
        lottogemeinschaftAdressen[name] = address(neueLottogemeinschaft);
        emit LottogemeinschaftGegruendet(address(neueLottogemeinschaft), name);
    }

    function getLottogemeinschaftAdresse(string memory name) public view returns (address) {
        return lottogemeinschaftAdressen[name];
    }
}
