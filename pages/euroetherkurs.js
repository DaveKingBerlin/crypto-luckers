// pages/euroetherkurs.js
import React from 'react';
import Web3 from 'web3';

const EuroEtherKurs = ({ euroString }) => {
    const euro = Number(euroString);
    const isValidNumber = !isNaN(euro) && isFinite(euro);
    const etherValue = isValidNumber ? Web3.utils.fromWei(euro.toString(), 'ether') : '0';

    console.log('EuroString:', euroString);
    console.log('EtherValue:', etherValue);

    return (
        <h3>
            1 Euro sind {euroString} Wei und das sind {etherValue} Ether.
        </h3>
    );
}

export const getStaticProps = async () => {
    return {
        props: {
            euroString: process.env.REACT_APP_EURO || 'defaultEuroValue',
        },
    };
};

export default EuroEtherKurs;
