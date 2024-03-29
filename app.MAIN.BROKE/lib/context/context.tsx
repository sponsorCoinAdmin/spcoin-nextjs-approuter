import { Consumer, Provider, createContext } from 'react';
interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string | undefined;
}

let InitialExchangeState;
let ExchangeProvider: Provider<any>;
let ExchangeConsumer: Consumer<any>;

const initializeContext = (value:any) => {
    InitialExchangeState = createContext(value);
    ExchangeProvider = InitialExchangeState.Provider
    ExchangeConsumer = InitialExchangeState.Consumer
    return InitialExchangeState
}

export { initializeContext, ExchangeProvider, ExchangeConsumer };