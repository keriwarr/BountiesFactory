import React, { Component } from 'react'
import Web3 from 'web3'
import Select from 'react-select'
import IPFS from 'ipfs-mini'
import BN from 'bn.js'
import classNames from 'classnames'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import SvgArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right'

import ContractList from 'components/ContractList/ContractList'

import json from '../../../contracts.json'
import {
  CATEGORIES,
  IPFS_CONFIG,
  NETWORK_DATA,
  LOCAL_STORAGE_KEYS,
  LOCAL_STORAGE_VALUES
} from '../../constants.js'
import { dateToString, getPrices } from '../../utils.js'

import './AppContainer.css'

const ipfs = new IPFS(IPFS_CONFIG)
const web3 = new Web3(new Web3.providers.HttpProvider(NETWORK_DATA[1].WEB3_HTTP_PROVIDER))

class AppContainer extends Component {
  constructor (props) {
    super(props)

    const storedNetwork = window.localStorage.getItem(LOCAL_STORAGE_KEYS.NETWORK)
    const networkId = (() => {
      switch (storedNetwork) {
        case LOCAL_STORAGE_VALUES.NETWORK.MAINNET:
          return 1
        case LOCAL_STORAGE_VALUES.NETWORK.RINKEBY:
          return 4
        default:
          return 1
      }
    })()
    const network = LOCAL_STORAGE_VALUES.NETWORK[networkId]

    window.localStorage.setItem(LOCAL_STORAGE_KEYS.NETWORK, network)

    const standardBountiesAddress = NETWORK_DATA[networkId].STANDARD_BOUNTIES_ADDRESS
    const standardBountiesAddressv0 = NETWORK_DATA[networkId].STANDARD_BOUNTIES_ADDRESS_V0
    const userCommentsAddress = NETWORK_DATA[networkId].USER_COMMENTS_ADDRESS
    const networkName = NETWORK_DATA[networkId].NAME
    const providerLink = NETWORK_DATA[networkId].WEB3_HTTP_PROVIDER
    const lightMode = window.localStorage.getItem(LOCAL_STORAGE_KEYS.LIGHT_MODE)

    web3.setProvider(new Web3.providers.HttpProvider(providerLink))

    this.state = {
      modalError: '',
      modalOpen: false,
      loadingInitial: true,
      accounts: [],
      contracts: [],
      bounties: [],
      bountiesv0: [],
      optionsList: [],
      total: 0,
      totalMe: 0,
      loading: true,
      myBountiesLoading: true,
      selectedStage: 'Active',
      selectedMine: 'ANY',
      requiredNetwork: network,
      networkName: networkName,
      prices: {},
      standardBountiesAddress: standardBountiesAddress,
      userCommentsAddress: userCommentsAddress,
      StandardBounties: web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddress),
      StandardBountiesv0: web3.eth.contract(json.interfaces.StandardBounties).at(standardBountiesAddressv0),
      UserComments: web3.eth.contract(json.interfaces.UserComments).at(userCommentsAddress),
      lightMode: lightMode || lightMode === null || lightMode === 'true'
    }

    this.getInitialData = this.getInitialData.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.getBounty = this.getBounty.bind(this)
    this.handleChangeStage = this.handleChangeStage.bind(this)
    this.handleMineChange = this.handleMineChange.bind(this)
    this.handleChangeToMine = this.handleChangeToMine.bind(this)
    this.handleAddCategory = this.handleAddCategory.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.updatePrices = this.updatePrices.bind(this)
    this.handleToggleLightMode = this.handleToggleLightMode.bind(this)
  }

  componentDidMount () {
    this.updatePrices()

    if (window.loaded) {
      this.getInitialData()
    } else {
      window.addEventListener('load', this.getInitialData)
    }
  }

  handleClose () {
    this.setState({ modalOpen: false })
    this.getInitialData() // FIXME: why is this here
  }

  getInitialData () {
    window.loaded = true

    if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
      // Use Mist/MetaMask's provider
      web3.setProvider(window.web3.currentProvider)

      web3.version.getNetwork((err, netId) => {
        if (err) {
          console.error(err)
          // TODO: handle error
          return
        }
        if (parseInt(netId, 10) > 10000) {
          this.setState({StandardBounties: web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v1),
            StandardBountiesv0: web3.eth.contract(json.interfaces.StandardBounties).at(json.localhost.standardBountiesAddress.v0),
            UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.localhost.userCommentsAddress),
            selectedNetwork: netId})
        } else if (netId === '1') {
          this.setState({StandardBounties: web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v1),
            StandardBountiesv0: web3.eth.contract(json.interfaces.StandardBounties).at(json.mainNet.standardBountiesAddress.v0),
            UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.mainNet.userCommentsAddress),
            selectedNetwork: netId})
        } else if (netId === '4') {
          this.setState({StandardBounties: web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v1),
            StandardBountiesv0: web3.eth.contract(json.interfaces.StandardBounties).at(json.rinkeby.standardBountiesAddress.v0),
            UserCommentsContract: web3.eth.contract(json.interfaces.UserComments).at(json.rinkeby.userCommentsAddress),
            selectedNetwork: netId})
        } else {
          this.setState({modalError: ('Please change your Ethereum network to the Main Ethereum network or the Rinkeby network'), modalOpen: true})
        }

        setInterval(function () {
          web3.version.getNetwork(function (err, newNetId) {
            if (err) {
              console.error(err)
              // TODO: handle error
              return
            }
            if (netId !== newNetId) {
              window.location.reload()
            }
          })
        }, 2000)

        web3.eth.getAccounts(function (err, accs) {
          if (err) {
            console.log('error fetching accounts', err)
          } else {
            if (accs.length === 0) {
              this.setState({modalError: 'Please unlock your MetaMask Accounts', modalOpen: true})
            } else {
              var account = web3.eth.accounts[0]
              setInterval(function () {
                web3.eth.getAccounts(function (err, accs) {
                  if (err) {
                    console.error(err)
                    // TODO: handle error
                    return
                  }
                  if (accs[0] !== account) {
                    account = web3.eth.accounts[0]
                    window.location.reload()
                  }
                })
              }, 2000)
              this.setState({accounts: accs})

              var bounties = []
              this.state.StandardBounties.getNumBounties((err, succ) => {
                if (err) {
                  console.error(err)
                  // TODO: handle error
                  return
                }
                var total = parseInt(succ, 10)

                this.setState({total: total})
                for (var i = 0; i < total; i++) {
                  this.getBounty(i, bounties, total, 1)
                }
                if (total === 0) {
                  this.setState({loading: false})
                }
              })
              var bountiesv0 = []
              this.state.StandardBountiesv0.getNumBounties((err, succ) => {
                if (err) {
                  console.error(err)
                  // TODO: handle error
                  return
                }
                var total = parseInt(succ, 10)

                this.setState({total: this.state.total + total})
                for (var i = 0; i < total; i++) {
                  this.getBounty(i, bountiesv0, total, 0)
                }
                if (total === 0) {
                  this.setState({loading: false})
                }
              })
            }
          }
        }.bind(this))
      })
    } else {
      var bounties = []
      this.state.StandardBounties.getNumBounties((err, succ) => {
        if (err) {
          console.error(err)
          // TODO: handle error
          return
        }
        var total = parseInt(succ, 10)
        this.setState({total: total})
        for (var i = 0; i < total; i++) {
          this.getBounty(i, bounties, total, 1)
        }
        if (total === 0) {
          this.setState({loading: false})
        }
      })
      var bountiesv0 = []
      this.state.StandardBountiesv0.getNumBounties((err, succ) => {
        if (err) {
          console.error(err)
          // TODO: handle error
          return
        }
        var total = parseInt(succ, 10)
        this.setState({total: this.state.total + total})
        for (var i = 0; i < total; i++) {
          this.getBounty(i, bountiesv0, total, 0)
        }
        if (total === 0) {
          this.setState({loading: false})
        }
      })
    }
  }

  getBounty (bountyId, bounties, total, version) {
    if (version === 0) {
      this.state.StandardBountiesv0.getBounty(bountyId, (err, succ) => {
        if (err) {
          console.error(err)
          // TODO: handle error
          return
        }
        this.state.StandardBountiesv0.getNumFulfillments(bountyId, (err, numFul) => {
          if (err) {
            console.error(err)
            // TODO: handle error
            return
          }
          this.state.StandardBountiesv0.getBountyData(bountyId, (err, data) => {
            if (err) {
              console.error(err)
              // TODO: handle error
              return
            }
            if (data.length > 0) {
              ipfs.catJSON(data, (err, result) => {
                if (err) {
                  console.error(err)
                  // TODO: handle error
                  return
                }
                var bountyDataResult
                if (!result || !result.meta || result.meta === 'undefined') {
                  bountyDataResult = result
                } else {
                  console.log('meta', result)
                  if (result.meta.schemaVersion === '0.1') {
                    bountyDataResult = {
                      title: result.payload.title,
                      description: result.payload.description,
                      sourceFileName: result.payload.sourceFileName,
                      sourceFileHash: result.payload.sourceFileHash,
                      sourceDirectoryHash: result.payload.sourceDirectoryHash,
                      contact: result.payload.issuer.email,
                      categories: result.payload.categories,
                      githubLink: result.payload.webReferenceURL
                    }
                  }
                }

                var stage
                var max = new BN(8640000000000000)
                if (parseInt(succ[4], 10) === 0) {
                  stage = 'Draft'
                } else if (parseInt(succ[4], 10) === 1 && parseInt(succ[5], 10) < parseInt(succ[2], 10)) {
                  stage = 'Completed'
                } else if (parseInt(succ[4], 10) === 1 && (!(succ[1].times(1000)).greaterThan(max) && (parseInt(succ[1], 10) * 1000 - Date.now()) < 0)) {
                  stage = 'Expired'
                } else if (parseInt(succ[4], 10) === 1) {
                  stage = 'Active'
                } else {
                  stage = 'Dead'
                }
                var newDate
                var dateString
                if ((succ[1].times(1000)).greaterThan(max)) {
                  newDate = new Date(parseInt(max, 10))
                  dateString = dateToString(8640000000000000)
                } else {
                  newDate = new Date(parseInt(succ[1], 10) * 1000)
                  dateString = dateToString(parseInt(succ[1], 10) * 1000)
                }

                if (!succ[3]) {
                  var value = web3.fromWei(parseInt(succ[2], 10), 'ether')
                  var balance = web3.fromWei(parseInt(succ[5], 10), 'ether')
                  bounties.push({
                    bountyId: bountyId,
                    issuer: succ[0],
                    deadline: newDate.toUTCString(),
                    dateNum: newDate.getTime(),
                    value: value,
                    paysTokens: succ[3],
                    stage: stage,
                    balance: balance,
                    bountyData: bountyDataResult,
                    symbol: 'ETH',
                    dateString: dateString,
                    numFul: parseInt(numFul, 10),
                    version: 0
                  })
                  if (bounties.length === total) {
                    this.setState({bountiesv0: bounties, loading: false})
                  }
                } else {
                  this.state.StandardBountiesv0.getBountyToken(bountyId, (err, address) => {
                    if (err) {
                      console.error(err)
                      // TODO: handle error
                      return
                    }
                    var HumanStandardToken = web3.eth.contract(json.interfaces.HumanStandardToken).at(address)
                    HumanStandardToken.symbol((err, symbol) => {
                      if (err) {
                        console.error(err)
                        // TODO: handle error
                        return
                      }
                      HumanStandardToken.decimals((err, dec) => {
                        if (err) {
                          console.error(err)
                          // TODO: handle error
                          return
                        }
                        var decimals = parseInt(dec, 10)
                        var newAmount = succ[2]
                        var decimalToMult = new BN(10, 10)
                        var decimalUnits = new BN(decimals, 10)
                        decimalToMult = decimalToMult.pow(decimalUnits)
                        newAmount = newAmount.div(decimalToMult)

                        var balance = succ[5]
                        balance = balance.div(decimalToMult)

                        bounties.push({
                          bountyId: bountyId,
                          issuer: succ[0],
                          deadline: newDate.toUTCString(),
                          dateNum: newDate.getTime(),
                          value: parseInt(newAmount, 10),
                          paysTokens: succ[3],
                          stage: stage,
                          owedAmount: parseInt(succ[5], 10),
                          balance: parseInt(balance, 10),
                          bountyData: bountyDataResult,
                          dateString: dateString,
                          symbol: symbol,
                          numFul: parseInt(numFul, 10),
                          version: 0
                        })
                        if (bounties.length === total) {
                          this.setState({bountiesv0: bounties, loading: false})
                        }
                      })
                    })
                  })
                }
              })
            } else {
              bounties.push({
                bountyId: bountyId,
                issuer: succ[0],
                deadline: 0,
                dateNum: 0,
                value: 0,
                paysTokens: succ[3],
                stage: 'Draft',
                owedAmount: parseInt(succ[5], 10),
                balance: 0,
                bountyData: {categories: []},
                dateString: 'date',
                symbol: '',
                numFul: parseInt(numFul, 10),
                version: 0
              })
              if (bounties.length === total) {
                this.setState({bountiesv0: bounties, loading: false})
              }
            }
          })
        })
      })
    } else if (version === 1) {
      this.state.StandardBounties.getBounty(bountyId, (err, succ) => {
        if (err) {
          console.error(err)
          // TODO: handle error
          return
        }
        this.state.StandardBounties.getNumFulfillments(bountyId, (err, numFul) => {
          if (err) {
            console.error(err)
            // TODO: handle error
            return
          }
          this.state.StandardBounties.getBountyData(bountyId, (err, data) => {
            if (err) {
              console.error(err)
              // TODO: handle error
              return
            }
            if (data.length > 0) {
              ipfs.catJSON(data, (err, result) => {
                if (err) {
                  console.error(err)
                  // TODO: handle error
                  return
                }
                var bountyDataResult
                if (!result || !result.meta || result.meta === 'undefined') {
                  bountyDataResult = result
                } else {
                  if (result.meta.schemaVersion === '0.1') {
                    bountyDataResult = {
                      title: result.payload.title,
                      description: result.payload.description,
                      sourceFileName: result.payload.sourceFileName,
                      sourceFileHash: result.payload.sourceFileHash,
                      sourceDirectoryHash: result.payload.sourceDirectoryHash,
                      contact: result.payload.issuer.email,
                      categories: result.payload.categories,
                      githubLink: result.payload.webReferenceURL
                    }
                  }
                }

                var stage
                var max = new BN(8640000000000000)
                if (parseInt(succ[4], 10) === 0) {
                  stage = 'Draft'
                } else if (parseInt(succ[4], 10) === 1 && parseInt(succ[5], 10) < parseInt(succ[2], 10)) {
                  stage = 'Completed'
                } else if (parseInt(succ[4], 10) === 1 && (!(succ[1].times(1000)).greaterThan(max) && (parseInt(succ[1], 10) * 1000 - Date.now()) < 0)) {
                  stage = 'Expired'
                } else if (parseInt(succ[4], 10) === 1) {
                  stage = 'Active'
                } else {
                  stage = 'Dead'
                }
                var newDate
                var dateString
                if ((succ[1].times(1000)).greaterThan(max)) {
                  newDate = new Date(parseInt(max, 10))
                  dateString = dateToString(8640000000000000)
                } else {
                  newDate = new Date(parseInt(succ[1], 10) * 1000)
                  dateString = dateToString(parseInt(succ[1], 10) * 1000)
                }

                if (!succ[3]) {
                  var value = web3.fromWei(parseInt(succ[2], 10), 'ether')
                  var balance = web3.fromWei(parseInt(succ[5], 10), 'ether')
                  bounties.push({
                    bountyId: bountyId,
                    issuer: succ[0],
                    deadline: newDate.toUTCString(),
                    dateNum: newDate.getTime(),
                    value: value,
                    paysTokens: succ[3],
                    stage: stage,
                    balance: balance,
                    bountyData: bountyDataResult,
                    symbol: 'ETH',
                    dateString: dateString,
                    numFul: parseInt(numFul, 10),
                    version: 1
                  })
                  if (bounties.length === total) {
                    this.setState({bounties: bounties, loading: false})
                  }
                } else {
                  this.state.StandardBounties.getBountyToken(bountyId, (err, address) => {
                    if (err) {
                      console.error(err)
                      // TODO: handle error
                      return
                    }
                    var HumanStandardToken = web3.eth.contract(json.interfaces.HumanStandardToken).at(address)
                    HumanStandardToken.symbol((err, symbol) => {
                      if (err) {
                        console.error(err)
                        // TODO: handle error
                        return
                      }
                      HumanStandardToken.decimals((err, dec) => {
                        if (err) {
                          console.error(err)
                          // TODO: handle error
                          return
                        }
                        var decimals = parseInt(dec, 10)
                        var newAmount = succ[2]
                        var decimalToMult = new BN(10, 10)
                        var decimalUnits = new BN(decimals, 10)
                        decimalToMult = decimalToMult.pow(decimalUnits)
                        newAmount = newAmount.div(decimalToMult)

                        var balance = succ[5]
                        balance = balance.div(decimalToMult)

                        bounties.push({
                          bountyId: bountyId,
                          issuer: succ[0],
                          deadline: newDate.toUTCString(),
                          dateNum: newDate.getTime(),
                          value: parseInt(newAmount, 10),
                          paysTokens: succ[3],
                          stage: stage,
                          owedAmount: parseInt(succ[5], 10),
                          balance: parseInt(balance, 10),
                          bountyData: bountyDataResult,
                          dateString: dateString,
                          symbol: symbol,
                          numFul: parseInt(numFul, 10),
                          version: 1
                        })
                        if (bounties.length === total) {
                          this.setState({bounties: bounties, loading: false})
                        }
                      })
                    })
                  })
                }
              })
            } else {
              bounties.push({
                bountyId: bountyId,
                issuer: succ[0],
                deadline: 0,
                dateNum: 0,
                value: 0,
                paysTokens: succ[3],
                stage: 'Draft',
                owedAmount: parseInt(succ[5], 10),
                balance: 0,
                bountyData: {categories: []},
                dateString: 'date',
                symbol: '',
                numFul: parseInt(numFul, 10),
                version: 0
              })
              if (bounties.length === total) {
                this.setState({bounties: bounties, loading: false})
              }
            }
          })
        })
      })
    }
  }

  updatePrices () {
    getPrices(prices => {
      this.setState({ prices })
    })
  }

  handleChangeStage (evt) {
    evt.preventDefault()
    this.setState({ selectedStage: evt.target.value })
  }

  handleMineChange (evt) {
    evt.preventDefault()
    this.setState({ selectedMine: evt.target.value })
  }

  handleChangeToMine (evt) {
    evt.preventDefault()
    this.setState({ selectedMine: 'MINE' })
  }

  handleSelectChange (value) {
    var optionsList = value.split(',')
    var containsCode = optionsList.includes('Code') || optionsList.includes('Bugs')
    this.setState({ optionsList: optionsList, value: value, containsCode: containsCode })
    this.forceUpdate() // FIXME: what is this?
  }

  handleAddCategory (item) {
    this.setState({optionsList: [item], value: item})
  }

  handleToggleLightMode () {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.LIGHT_MODE, !this.state.lightMode)
    this.setState({ lightMode: !this.state.lightMode })
  }

  render () {
    var newList = []
    var totalMe = 0
    var activeList = []
    var activeMe = 0
    var draftMe = 0
    var completedMe = 0
    var deadMe = 0
    var expiredMe = 0
    var totalBounties = this.state.bounties.concat(this.state.bountiesv0)
    for (var i = 0; i < totalBounties.length; i++) {
      if (totalBounties[i].issuer === this.state.accounts[0]) {
        newList.push(totalBounties[i])
        totalMe++
        if (totalBounties[i].stage === 'Active') {
          activeMe++
        }
        if (totalBounties[i].stage === 'Draft') {
          draftMe++
        }
        if (totalBounties[i].stage === 'Dead') {
          deadMe++
        }
        if (totalBounties[i].stage === 'Expired') {
          expiredMe++
        }
        if (totalBounties[i].stage === 'Completed') {
          completedMe++
        }
      }
      var isInSelectedCategories = false
      var newCategories = totalBounties[i].bountyData.categories.filter((n) => { return this.state.optionsList.includes(n) })
      if (newCategories.length > 0 || this.state.optionsList[0] === '' || this.state.optionsList.length === 0) {
        isInSelectedCategories = true
      }
      if (isInSelectedCategories) {
        if (totalBounties[i].stage === this.state.selectedStage || this.state.selectedStage === 'ANY') {
          if (this.state.selectedMine === 'ANY') {
            activeList.push(totalBounties[i])
          } else if (this.state.selectedMine === 'MINE' && totalBounties[i].issuer === this.state.accounts[0]) {
            activeList.push(totalBounties[i])
          } else if (this.state.selectedMine === 'NOT MINE' && totalBounties[i].issuer !== this.state.accounts[0]) {
            activeList.push(totalBounties[i])
          }
        }
      }
    }
    const modalActions = [
      <FlatButton
        label='Retry'
        primary
        onClick={this.handleClose}
        style={{color: '#16e5cd'}}
      />
    ]
    document.title = 'Bounties Explorer | Dashboard' // TODO: find a better way to do this

    return (
      <div className='AppContainer'>
        <Dialog
          title=''
          actions={modalActions}
          modal={false}
          open={this.state.modalOpen}
          onRequestClose={this.handleClose}
        >
          {this.state.modalError}
        </Dialog>
        <div id={this.state.lightMode ? 'colourBodyLight' : 'colourBodyDark'} className='container'>
          <div className='CornerEmoji'>
            <div className='emoji' onClick={this.handleToggleLightMode} />
          </div>
          <div className='navBar'>
            <a className='home-button' href='/'>
              <div className='logo' />
            </a>
            <span className='background' />
            <FlatButton className='new-bounty-button' href='/newBounty/'>New Bounty</FlatButton>
          </div>
          <div className='main'>
            <div className='profile'>
              <h3>PROFILE</h3>
              <div className='profile-details'>
                {this.state.accounts.length > 0 && (
                  <div>
                    <h5 className='bounties-total'>You have posted <b>{totalMe}</b> bounties</h5>
                    <div className='category-totals'>
                      <div className='top-category'>
                        <h5 className='category-count blue-divider-right'><b>{draftMe}</b></h5>
                        <h5 className='category-name draft-color'>DRAFT</h5>
                      </div>
                      <div className='top-category'>
                        <h5 className='category-count blue-divider-right'><b>{activeMe}</b></h5>
                        <h5 className='category-name active-color'>ACTIVE</h5>
                      </div>
                      <div className='top-category'>
                        <h5 className='category-count'><b>{deadMe}</b></h5>
                        <h5 className='category-name dead-color'>DEAD</h5>
                      </div>
                      <div className='bottom-category'>
                        <h5 className='category-count blue-divider-right'><b>{expiredMe}</b></h5>
                        <h5 className='category-name expired-color'>EXPIRED</h5>
                      </div>
                      <div className='bottom-category'>
                        <h5 className='category-count'><b>{completedMe}</b></h5>
                        <h5 className='category-name completed-color'>COMPLETED</h5>
                      </div>
                    </div>
                    <FlatButton
                      className='profile-button'
                      label='My Profile'
                      primary
                      labelPosition='before'
                      href={'/user/' + this.state.accounts[0]}
                      icon={<SvgArrow style={{color: '#16e5cd', fontSize: '44px'}} />}
                    />
                    <FlatButton
                      className='profile-button'
                      label='My Bounties'
                      primary
                      labelPosition='before'
                      onClick={this.handleChangeToMine}
                      icon={<SvgArrow style={{color: '#16e5cd', fontSize: '44px'}} />}
                    />
                  </div>
                )}
                {this.state.accounts.length === 0 && (
                  <div className='no-account-warning'>
                    <h5 className='no-account-header'>You have no account!</h5>
                    <h5 className='no-account-explanation'>This is likely because you're not using a web3 enabled browser.</h5>
                    <h5 className='no-account-metamask'>
                      You can download the
                      {' '}
                      <a className='metamask-link' href='https://metamask.io' target='_blank'>Metamask</a>
                      {' '}
                      extension to begin posting bounties.
                    </h5>
                  </div>
                )}
              </div>
              <div id='mc_embed_signup'>
                <h5 className='signup-cta'>SIGN UP TO RECEIVE <br /> BOUNTIES NOTIFICATIONS</h5>
                <form action='//network.us16.list-manage.com/subscribe/post?u=03351ad14a86e9637146ada2a&amp;id=96ba00fd12' method='post' id='mc-embedded-subscribe-form' name='mc-embedded-subscribe-form' className='validate' target='_blank' >
                  <div id='mc_embed_signup_scroll'>
                    <div className='6u$ 12u$(xsmall)'>
                      <input type='email' name='EMAIL' id='mce-EMAIL' placeholder='email address' required style={{fontFamily: 'Open Sans', border: '0px', borderBottom: '1px solid rgb(22, 229, 205)', backgroundColor: 'rgba(0,0,0,0)', color: 'rgb(208, 208, 208)', width: '16.2em'}} />
                    </div>
                    <div style={{position: 'absolute', left: '-5000px'}} aria-hidden='true'>
                      <input type='text' name='b_03351ad14a86e9637146ada2a_96ba00fd12' tabIndex='-1' value='' />
                    </div>
                    <input type='submit' value='SIGN UP' name='subscribe' id='mc-embedded-subscribe' className='button' style={{boxShadow: 'none', fontFamily: 'Open Sans', backgroundColor: '#183653', width: '17.4em', color: 'rgb(208, 208, 208)', padding: '5px 15px', fontWeight: '600', border: '0px solid rgba(0,0,0,0)'}} />
                  </div>
                </form>
              </div>
            </div>
            <div className='bounties'>
              <ContractList list={activeList} acc={this.state.accounts[0]} loading={this.state.loading} title={'BOUNTIES'} handleAddCategory={this.handleAddCategory} prices={this.state.prices} lightMode={this.state.lightMode} />
            </div>
            <div className={classNames('filter', this.state.lightMode ? 'FilterBarLight' : 'FilterBar')}>
              <h3 style={{fontFamily: 'Open Sans', marginTop: '15px', marginBottom: '15px', textAlign: 'center', color: this.state.lightMode ? 'rgb(25, 55, 83)' : 'white', width: '100%', fontWeight: '600', fontSize: '16px'}}>FILTER</h3>
              <div style={{display: 'block', width: '100%', backgroundColor: this.state.lightMode ? 'rgba(1, 1, 1, 0.05)' : 'rgba(10, 22, 40, 0.5)', overflow: 'hidden'}}>
                <select onChange={this.handleChangeStage} value={this.state.selectedStage} style={{fontSize: '14px', backgroundColor: 'rgba(10, 22, 40, 0)', border: '0px', color: this.state.lightMode ? 'rgb(25, 55, 83)' : 'white', width: '195px', height: '40px', display: 'block', borderRadius: '0px', WebkitAppearance: 'none', background: 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxNzM3NTM7fS5jbHMtMntmaWxsOiMxNmU1Y2Q7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==) no-repeat 100% 50%', padding: '0px 10px'}}>
                  <option value='Draft'>Draft Bounties</option>
                  <option value='Active'>Active Bounties</option>
                  <option value='Completed'>Completed Bounties</option>
                  <option value='Expired'>Expired Bounties</option>
                  <option value='Dead'>Dead Bounties</option>
                  <option value='ANY'>Any Stage</option>
                </select>
              </div>
              <div style={{display: 'block', width: '100%', backgroundColor: this.state.lightMode ? 'rgba(1, 1, 1, 0.05)' : 'rgba(10, 22, 40, 0.5)', overflow: 'hidden', marginTop: '15px'}}>
                <select onChange={this.handleMineChange} value={this.state.selectedMine} style={{fontSize: '14px', backgroundColor: 'rgba(10, 22, 40, 0)', border: '0px', color: this.state.lightMode ? 'rgb(25, 55, 83)' : 'white', width: '195px', height: '40px', display: 'block', borderRadius: '0px', WebkitAppearance: 'none', background: 'url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgaWQ9IkxheWVyXzEiIGRhdGEtbmFtZT0iTGF5ZXIgMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNC45NSAxMCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiMxNzM3NTM7fS5jbHMtMntmaWxsOiMxNmU1Y2Q7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5hcnJvd3M8L3RpdGxlPjxyZWN0IGNsYXNzPSJjbHMtMSIgd2lkdGg9IjQuOTUiIGhlaWdodD0iMTAiLz48cG9seWdvbiBjbGFzcz0iY2xzLTIiIHBvaW50cz0iMS40MSA0LjY3IDIuNDggMy4xOCAzLjU0IDQuNjcgMS40MSA0LjY3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjMuNTQgNS4zMyAyLjQ4IDYuODIgMS40MSA1LjMzIDMuNTQgNS4zMyIvPjwvc3ZnPg==) no-repeat 100% 50%', padding: '0px 10px'}}>
                  <option value='ANY' selected='selected'>{"Anyone's Bounties"}</option>
                  <option value='MINE'>My Bounties</option>
                  <option value='NOT MINE'>Not My Bounties</option>
                </select>
              </div>
              <div style={{width: '100%', float: 'left', display: 'block', marginTop: '15px'}}>
                <Select multi simpleValue disabled={this.state.disabled} value={this.state.value} placeholder='Select Categories' options={CATEGORIES} onChange={this.handleSelectChange} />
              </div>
            </div>
          </div>
          <p className='footer'>
            &copy; Bounties Network, a
            {' '}
            <a className='consensys-link' href='https://ConsenSys.net' target='_blank'>ConsenSys</a>
            {' '}
            Formation
            <br />
            <a className='privacy-policy-link' href='/privacyPolicy/' target='_blank'>Privacy Policy</a>
            {' | '}
            <a className='terms-link' href='/terms/' target='_blank'>Terms of Service</a>
          </p>
        </div>
      </div>
    )
  }
}

export default AppContainer
