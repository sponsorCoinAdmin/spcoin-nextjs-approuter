'useClient'

import React from "react";
import styles from "../../styles/App.module.css";

import spCoin_png from '../../components/images/spCoin.png'
import eth_png from '../../components/images/eth.png'
import Image from 'next/image'

import Agents from "../../components/menuTabs/Agents";
import Recipients from "../../components/menuTabs/Recipients";
import Tokens from "../../components/menuTabs/Tokens";

function Swap(props: { address: any; isConnected: any; connect: any; }) {
  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className={styles.leftH}>
        <Image src={spCoin_png} width={25} height={25} alt="Sponsor Coin Logo" />
        <div className={styles.headerItem}><Recipients /></div>
        <div className={styles.headerItem}><Agents /></div>
        <div className={styles.headerItem}><Tokens /></div>
     </div>
      <div className={styles.rightH}>
        <div className={styles.headerItem}>
        <Image src={eth_png} width={25} height={25} alt="Sponsor Coin Logo" />
        &nbsp;&nbsp;Ethereum
        </div>
        <div className={styles.connectButton} onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Swap;
