'use client';
import Image from 'next/image';
import info_png from '../../../../public/resources/images/info1.png'

import styles from '@/app/styles/Exchange.module.css';
import {
  openDialog,
  AgentDialog,
  RecipientDialog,
  SellTokenDialog,
  BuyTokenDialog,
  ErrorDialog
} from '@/app/components/Dialogs/Dialogs';
import useSWR from "swr";
import { useState, useEffect } from "react";
import { formatUnits, parseUnits } from "ethers";
import { useBalance, useChainId, type Address } from "wagmi";
import { watchAccount, watchNetwork } from "@wagmi/core";
import { getDefaultNetworkSettings } from '@/app/lib/network/initialize/defaultNetworkSettings';
import { WalletElement, TokenElement } from '@/app/lib/structure/types';
import { getNetworkName } from '@/app/lib/network/utils';
import { fetcher, processError } from '@/app/lib/0X/fetcher';
import { setValidPriceInput, updateBalance } from '@/app/lib/spCoin/utils';
import type { PriceResponse } from "@/app/api/types";
import {
  hideElement,
  showElement,
  hideSponsorRecipientConfig,
} from '@/app/lib/spCoin/guiControl';
import { ExchangeTokens, EXCHANGE_STATE } from '..';
import TradeContainerHeader from '@/app/components/Popover/TradeContainerHeader';
import BuySellSwapButton from '@/app/components/Buttons/BuySellSwapButton';
import SellContainer from '@/app/components/containers/SellContainer';
import BuyContainer from '@/app/components/containers/BuyContainer';
import RecipientContainer from '@/app/components/containers/RecipientContainer';
import SponsorRateConfig from '@/app/components/containers/SponsorRateConfig';
import AffiliateFee from '@/app/components/containers/AffiliateFee';
import PriceButton from '@/app/components/Buttons/PriceButton';
import FeeDisclosure from '@/app/components/containers/FeeDisclosure';
import IsLoading from '@/app/components/containers/IsLoading';

//////////// Price Code
export default function PriceView({
  connectedWalletAddr, price, setPrice, setExchangeTokens
}: {
    connectedWalletAddr: Address | undefined;
    price: PriceResponse | undefined;
    setPrice: (price: PriceResponse | undefined) => void;
    setExchangeTokens: (exchangeTokens: ExchangeTokens|undefined) => void;
}) {
  try {
    let chainId = useChainId();
    let networkName = getNetworkName(chainId);
// console.debug("########################### PRICE RERENDERED #####################################")
  // From New Not Working
    const [network, setNetwork] = useState("ethereum");
    const [sellAmount, setSellAmount] = useState<string>("0");
    const [buyAmount, setBuyAmount] = useState<string>("0");
    const [sellBalance, setSellBalance] = useState<string>("0");
    const [buyBalance, setBuyBalance] = useState<string>("0");
    const [tradeDirection, setTradeDirection] = useState("sell");

    const defaultNetworkSettings = getDefaultNetworkSettings('ethereum')
    const [sellTokenElement, setSellTokenElement] = useState<TokenElement>(defaultNetworkSettings?.defaultSellToken);
    const [buyTokenElement, setBuyTokenElement] = useState<TokenElement>(defaultNetworkSettings?.defaultBuyToken);
    const [recipientWallet, setRecipientElement] = useState<WalletElement>(defaultNetworkSettings?.defaultRecipient);
    const [agentWallet, setAgentElement] = useState(defaultNetworkSettings?.defaultAgent);
    const [errorMessage, setErrorMessage] = useState<Error>({ name: "", message: "" });
    const [slippage, setSlippage] = useState<string | null>("0.02");

    useEffect(() => {
      hideSponsorRecipientConfig();
    },[]);

    useEffect(() => {
      // alert('Price slippage changed to  ' + slippage);
    }, [slippage]);

    useEffect(() => {
      updateBuyBalance(buyTokenElement);
      updateSellBalance(sellTokenElement);
    }, [connectedWalletAddr]);

    useEffect(() => {
      console.debug("sellTokenElement.symbol changed to " + sellTokenElement.name);
      updateSellBalance(sellTokenElement);
    }, [sellTokenElement]);

    useEffect(() => {
      console.debug("buyTokenElement.symbol changed to " + buyTokenElement.name);
      updateBuyBalance(buyTokenElement);
    }, [buyTokenElement]);

    useEffect(() => {
      if (errorMessage.name !== "" && errorMessage.message !== "") {
        openDialog("#errorDialog");
      }
    }, [errorMessage]);

    useEffect(() => { {
      if (buyTokenElement.symbol === "SpCoin") {
        showElement("addSponsorshipDiv")
      }
      else {
        hideElement("addSponsorshipDiv")
        hideElement("recipientSelectDiv")
        hideElement("recipientConfigDiv")
        hideElement("agent");
        }
      }
    }, [buyTokenElement]);

    useEffect(() => { {
      if (sellTokenElement.symbol === "SpCoin") {
        showElement("sponsoredBalance")
      }
      else {
        hideElement("sponsoredBalance")
        }
      }
    }, [sellTokenElement]);

    useEffect(() => {
      updateNetwork(network)
    }, [network]);

    const updateNetwork = (network:string | number) => {
      // alert("Price:network set to " + network)
      try {
        console.debug("Price:network set to " + network);
        let networkSettings = getDefaultNetworkSettings(network);
        setSellTokenElement(networkSettings?.defaultSellToken);
        setBuyTokenElement(networkSettings?.defaultBuyToken);
        setRecipientElement(networkSettings?.defaultRecipient);
        setAgentElement(networkSettings?.defaultAgent);
        console.debug(`Price:EXECUTING updateNetwork.updateBuyBalance(${buyTokenElement});`)
        console.debug(`Price:EXECUTING updateNetwork.updateSellBalance(${sellTokenElement});`)
        updateBuyBalance(buyTokenElement);
        updateSellBalance(sellTokenElement);
      } catch (e) {
        setErrorMessage({ name: "XXXXX: ", message: JSON.stringify(e, null, 2) });
      }
    }

    const unwatch = watchNetwork((network) => processNetworkChange(network));
    const unwatchAccount = watchAccount((account) => processAccountChange(account));

    const processAccountChange = (account: any) => {
      // console.debug("APP ACCOUNT = " + JSON.stringify(account.address, null, 2))
    };

    const processNetworkChange = (network: any) => {
      console.debug("Price:NETWORK NAME      = " + JSON.stringify(network?.chain?.name, null, 2));
      setNetwork(network?.chain?.name.toLowerCase());
    };

    const updateSellBalance = async (sellTokenElement: TokenElement) => {

      let {success, errMsg, balance} = await updateBalance(connectedWalletAddr, sellTokenElement, setSellBalance)
      // alert(`updateSellBalance:{status=${success}, errMsg=${errMsg}, sellBalance=${balance}}`);

      try {
        setSellBalance(balance);

        if (!success) {  
          setErrorMessage({ name: "updateSellBalance: ", message: errMsg });
        }
      } catch (e: any) {
        setErrorMessage({ name: "updateSellBalance: ", message: JSON.stringify(e, null, 2) });
      }
      return { balance };
    };

    const updateBuyBalance = async (buyTokenElement: TokenElement) => {
      let {success, errMsg, balance} = await updateBalance(connectedWalletAddr, buyTokenElement, setBuyBalance)
      // alert(`updateBuyBalance:{status=${success}, errMsg=${errMsg}, buyBalance=${balance}}`);

      try {
        setBuyBalance(balance);

        if (!success) {  
          setErrorMessage({ name: "updateBuyBalance: ", message: errMsg });
        }
      } catch (e: any) {
        setErrorMessage({ name: "updateBuyBalance: ", message: JSON.stringify(e, null, 2) });
      }
      return { balance };
    };

  // This code currently only works for sell buy will default to undefined
    const parsedSellAmount = sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenElement.decimals).toString()
      : undefined;

    const parsedBuyAmount = buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenElement.decimals).toString()
      : undefined;

    const { isLoading: isLoadingPrice } = useSWR(
      [
        "/api/" + network + "/0X/price",
        {
          sellToken: sellTokenElement.address,
          buyToken: buyTokenElement.address,
          sellAmount: parsedSellAmount,
          buyAmount: parsedBuyAmount,
          // The Slippage does not seam to pass check the api parameters with a JMeter Test then implement here
          // slippagePercentage: slippage,
          // expectedSlippage: slippage,
          connectedWalletAddr
        },
      ],
      fetcher,
      {
        onSuccess: (data) => {
          setPrice(data);
          console.debug(formatUnits(data.buyAmount, buyTokenElement.decimals), data);
          setBuyAmount(formatUnits(data.buyAmount, buyTokenElement.decimals));
        },
        onError: (error) => {
          processError(
            error,
            setErrorMessage,
            buyTokenElement,
            sellTokenElement,
            setBuyAmount,
            setValidPriceInput
          );
        },
      }
    );

    const { data, isError, isLoading } = useBalance({
      address: connectedWalletAddr,
      token: sellTokenElement.address,
    });

    const disabled = data && sellAmount
      ? parseUnits(sellAmount, sellTokenElement.decimals) > data.value
      : true;

      const setExchangeTokensCallback = () => {
      setExchangeTokens({
        state: EXCHANGE_STATE.QUOTE,
        slippage:slippage,
        sellToken: sellTokenElement,
        buyToken: buyTokenElement,
        recipientWallet: recipientWallet,      
        agentWallet: agentWallet        
      })
    }
    // console.debug("Price:connectedWalletAddr = " + connectedWalletAddr)
    return (
      <form autoComplete="off">
        <SellTokenDialog connectedWalletAddr={connectedWalletAddr} buyTokenElement={buyTokenElement} callBackSetter={setSellTokenElement} />
        <BuyTokenDialog connectedWalletAddr={connectedWalletAddr} sellTokenElement={sellTokenElement} callBackSetter={setBuyTokenElement} />
        <RecipientDialog agentWallet={agentWallet} setRecipientElement={setRecipientElement} />
        <AgentDialog recipientWallet={recipientWallet} callBackSetter={setAgentElement} />
        <ErrorDialog errMsg={errorMessage} />
        <div className={styles.tradeContainer}>
          <TradeContainerHeader slippage={slippage} setSlippageCallback={setSlippage}/>
          <SellContainer sellAmount={sellAmount} sellBalance={sellBalance} sellTokenElement={sellTokenElement} setSellAmount={setSellAmount} disabled={false} />
          <BuyContainer buyAmount={buyAmount} buyBalance={buyBalance} buyTokenElement={buyTokenElement} setBuyAmount={setBuyAmount} disabled={false} />          
          <BuySellSwapButton  sellTokenElement={sellTokenElement} buyTokenElement={buyTokenElement} setSellTokenElement={setSellTokenElement} setBuyTokenElement={setBuyTokenElement} />
          <PriceButton connectedWalletAddr={connectedWalletAddr} sellTokenElement={sellTokenElement} buyTokenElement={buyTokenElement} sellBalance={sellBalance} disabled={disabled} slippage={slippage} setExchangeTokensCallback={setExchangeTokensCallback} />
          <RecipientContainer recipientWallet={recipientWallet} />
          <SponsorRateConfig />
          <AffiliateFee price={price} sellTokenElement={sellTokenElement} buyTokenElement= {buyTokenElement} />
        </div>
        <FeeDisclosure/>
        <IsLoading isLoadingPrice={isLoadingPrice} />
      </form>
    );
  } catch (err:any) {
    console.debug (`Price Error:\n ${err.message}`)
  }
}