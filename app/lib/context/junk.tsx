'use client'
import { getDefaultNetworkSettings } from '@/app/lib/network/initialize/defaultNetworkSettings';
import { DISPLAY_STATE, EXCHANGE_STATE, ExchangeContext } from '@/app/lib/structure/types';
import { useContext } from 'react';
import { initializeContext, ExchangeProvider } from './context';
import { isSpCoin } from '../spCoin/utils';
import { getNetworkName } from '../network/utils';
import { useChainId } from 'wagmi';

let chainId:number = 1;
let context:any;
let exchangeContext:ExchangeContext;

const getInitialContext = (network:string|number) => {
    const defaultNetworkSettings = getDefaultNetworkSettings(network)
    let initialContext:ExchangeContext = {
        networkName: typeof network === "string" ? network.toLowerCase() : getNetworkName(network),
        state: EXCHANGE_STATE.PRICE,
        displayState: isSpCoin(defaultNetworkSettings.defaultBuyToken) ? DISPLAY_STATE.SPONSOR_SELL_ON : DISPLAY_STATE.OFF,
        slippage: "0.02",
        network: defaultNetworkSettings.networkHeader,
        sellToken: defaultNetworkSettings.defaultSellToken,
        buyToken: defaultNetworkSettings.defaultBuyToken,
        recipientWallet: defaultNetworkSettings.defaultRecipient,
        agentWallet: defaultNetworkSettings.defaultAgent
    }
    return initializeContext(initialContext);
}

const resetContextNetwork = (context:ExchangeContext, network:string|number) => {
    
    // alert(`getInitialContext:ExchangeWrapper chainId = ${network}`)
    const newNetworkName:string = typeof network === "string" ? network.toLowerCase() : getNetworkName(network)
    console.debug("resetContextNetwork: newNetworkName = " + newNetworkName);
    console.debug("resetContextNetwork: exchangeContext.networkName = " + exchangeContext.networkName);

    if (context.networkName !== newNetworkName) {
        console.debug(`UPDATING NETWORK to ${newNetworkName}`);

        const defaultNetworkSettings = getDefaultNetworkSettings(newNetworkName)
        console.debug(`Loaded defaultNetworkSettings for ${newNetworkName}: ${JSON.stringify(defaultNetworkSettings,null,2)}`);
        context.networkName = newNetworkName
        context.state = EXCHANGE_STATE.PRICE;
        context.displayState = isSpCoin(defaultNetworkSettings.defaultBuyToken) ? DISPLAY_STATE.SPONSOR_SELL_ON:DISPLAY_STATE.OFF,
        context.slippage = "0.02",
        context.sellToken = defaultNetworkSettings.defaultSellToken,
        context.buyToken = defaultNetworkSettings.defaultBuyToken,
        context.recipientWallet = defaultNetworkSettings.defaultRecipient,
        context.agentWallet = defaultNetworkSettings.defaultAgent
    }      
    return context;
}

type Props = {
    children: React.ReactNode,
    value:any
}

export function ExchangeProvider2({children, value} : Props) {
    chainId = useChainId();
    // alert(`chainId = ${chainId}`)
    context = getInitialContext(chainId)
    exchangeContext = useContext<ExchangeContext>(context);

    return (
        <div>
            {children}
        </div>
    )
}

export {
    exchangeContext,
    resetContextNetwork
}