import json from '../contracts.json'

export const IPFS_CONFIG = {
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
}

export const NETWORK_DATA = {
  1: {
    WEB3_HTTP_PROVIDER: 'https://mainnet.infura.io',
    STANDARD_BOUNTIES_ADDRESS: json.mainNet.standardBountiesAddress.v1,
    STANDARD_BOUNTIES_ADDRESS_V0: json.mainNet.standardBountiesAddress.v0,
    USER_COMMENTS_ADDRESS: json.mainNet.userCommentsAddress,
    NAME: 'Main Network'
  },
  4: {
    WEB3_HTTP_PROVIDER: 'https://rinkeby.infura.io',
    STANDARD_BOUNTIES_ADDRESS: json.rinkeby.standardBountiesAddress.v1,
    STANDARD_BOUNTIES_ADDRESS_V0: json.rinkeby.standardBountiesAddress.v0,
    USER_COMMENTS_ADDRESS: json.rinkeby.userCommentsAddress,
    NAME: 'Rinkeby Network'
  }
}

export const LOCAL_STORAGE_KEYS = {
  NETWORK: 'ethereumNetwork',
  LIGHT_MODE: 'lightMode',
}

export const LOCAL_STORAGE_VALUES = {
  NETWORK: {
    MAINNET: 'MainNet',
    RINKEBY: 'Rinkeby'
  }
}

export const CATEGORIES = [
  { label: 'Code', value: 'Code' },
  { label: 'Bugs', value: 'Bugs' },
  { label: 'Questions', value: 'Questions' },
  { label: 'Graphic Design', value: 'Graphic Design' },
  { label: 'Social Media', value: 'Social Media' },
  { label: 'Content Creation', value: 'Content Creation' },
  { label: 'Translations', value: 'Translations' },
  { label: 'Surveys', value: 'Surveys' }
]
