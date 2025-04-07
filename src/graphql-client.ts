import { GraphQLClient } from 'graphql-request';

/**
 * BlockStatusFilter - Enum for filtering blocks by consensus status
 */
export enum BlockStatusFilter {
  ALL = 'ALL',
  PENDING = 'PENDING',
  CANONICAL = 'CANONICAL'
}

/**
 * EventFilterOptions - Options for filtering events
 */
export interface EventFilterOptions {
  address: string;
  tokenId?: string;
  status?: BlockStatusFilter;
  to?: number;
  from?: number;
}

/**
 * ActionFilterOptions - Options for filtering actions
 */
export interface ActionFilterOptions {
  address: string;
  tokenId?: string;
  status?: BlockStatusFilter;
  to?: number;
  from?: number;
  fromActionState?: string;
  endActionState?: string;
}

/**
 * EventData - Structure of event data
 */
export interface EventData {
  accountUpdateId: string;
  transactionInfo?: TransactionInfo;
  data: string[];
}

/**
 * ActionData - Structure of action data
 */
export interface ActionData {
  accountUpdateId: string;
  transactionInfo?: TransactionInfo;
  data: string[];
}

/**
 * BlockInfo - Structure of block information
 */
export interface BlockInfo {
  height: number;
  stateHash: string;
  parentHash: string;
  ledgerHash: string;
  chainStatus: string;
  timestamp: string;
  globalSlotSinceHardfork: number;
  globalSlotSinceGenesis: number;
  distanceFromMaxBlockHeight: number;
}

/**
 * MaxBlockHeightInfo - Information about maximum block heights
 */
export interface MaxBlockHeightInfo {
  canonicalMaxBlockHeight: number;
  pendingMaxBlockHeight: number;
}

/**
 * TransactionInfo - Structure of transaction information
 */
export interface TransactionInfo {
  status: string;
  hash: string;
  memo: string;
  authorizationKind: string;
  sequenceNumber: number;
  zkappAccountUpdateIds: number[];
}

/**
 * ActionStates - Structure of action states
 */
export interface ActionStates {
  actionStateOne?: string;
  actionStateTwo?: string;
  actionStateThree?: string;
  actionStateFour?: string;
  actionStateFive?: string;
}

/**
 * EventOutput - Structure of event query output
 */
export interface EventOutput {
  blockInfo: BlockInfo;
  eventData: EventData[];
}

/**
 * ActionOutput - Structure of action query output
 */
export interface ActionOutput {
  blockInfo: BlockInfo;
  transactionInfo: TransactionInfo;
  actionData: ActionData[];
  actionState: ActionStates;
}

/**
 * NetworkStateOutput - Structure of network state query output
 */
export interface NetworkStateOutput {
  maxBlockHeight: MaxBlockHeightInfo;
}

/**
 * MinaGraphQLClient - A client for interacting with the Mina archive node GraphQL API
 */
export class MinaGraphQLClient {
  private client: GraphQLClient;
  
  /**
   * Constructor for MinaGraphQLClient
   * @param endpoint The GraphQL endpoint URL
   */
  constructor(endpoint: string) {
    this.client = new GraphQLClient(endpoint);
  }

  /**
   * Query network state
   * @returns Promise resolving to network state data
   */
  async queryNetworkState(): Promise<{ networkState: NetworkStateOutput }> {
    const query = `
      query {
        networkState {
          maxBlockHeight {
            canonicalMaxBlockHeight
            pendingMaxBlockHeight
          }
        }
      }
    `;

    return this.client.request(query);
  }

  /**
   * Query events with filter options
   * @param filterOptions Options to filter events
   * @returns Promise resolving to event data
   */
  async queryEvents(filterOptions: EventFilterOptions): Promise<{ events: EventOutput[] }> {
    // Convert filter options to GraphQL input format
    const inputParams = Object.entries(filterOptions)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join(', ');

    const query = `
      query {
        events(input: {${inputParams}}) {
          blockInfo {
            height
            stateHash
            parentHash
            ledgerHash
            chainStatus
            timestamp
            globalSlotSinceHardfork
            globalSlotSinceGenesis
            distanceFromMaxBlockHeight
          }
          eventData {
            accountUpdateId
            data
            transactionInfo {
              status
              hash
              memo
              authorizationKind
              sequenceNumber
              zkappAccountUpdateIds
            }
          }
        }
      }
    `;

    return this.client.request(query);
  }

  /**
   * Query actions with filter options
   * @param filterOptions Options to filter actions
   * @returns Promise resolving to action data
   */
  async queryActions(filterOptions: ActionFilterOptions): Promise<{ actions: ActionOutput[] }> {
    // Convert filter options to GraphQL input format
    const inputParams = Object.entries(filterOptions)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join(', ');

    const query = `
      query {
        actions(input: {${inputParams}}) {
          blockInfo {
            height
            stateHash
            parentHash
            ledgerHash
            chainStatus
            timestamp
            globalSlotSinceHardfork
            globalSlotSinceGenesis
            distanceFromMaxBlockHeight
          }
          transactionInfo {
            status
            hash
            memo
            authorizationKind
            sequenceNumber
            zkappAccountUpdateIds
          }
          actionData {
            accountUpdateId
            data
          }
          actionState {
            actionStateOne
            actionStateTwo
            actionStateThree
            actionStateFour
            actionStateFive
          }
        }
      }
    `;

    return this.client.request(query);
  }
}
