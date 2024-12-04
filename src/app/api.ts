import wretch from 'wretch';

export interface Blockchain {
  name: string;
  height: number;
}

export interface Address {
  address: string;
  txrefs?: {
    block_height: number;
    value: number;
  }[];
}

export const blockchainApi = wretch('https://api.blockcypher.com/v1/btc/test3')
  .errorType('json')
  .resolve((r) => r.json());
