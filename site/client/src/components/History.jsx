import { Tab } from '@headlessui/react'
import { Heading } from '@/components/Heading'
import { ReceivedDataResponseModal } from '@/components/ReceivedDataResponseModal'
import { SendDataModal } from '@/components/SendDataModal'
import { useState } from 'react'
import {
  getFieldData,
  addResponse,
  updateFieldData,
} from '@/components/APICalls'
import { stringToBigInt } from './HelperCalls'
import { useGlobal } from '@/components/GlobalStorage'
import { CompleteUpdateModal } from './CompleteUpdateModal'
import { CompletedDataUpdateModal } from './CompletedDataUpdateModal'
import { RequestedDataSentModal } from './RequestedDataSentModal'
import { AwaitingDataModal } from './AwaitingDataModal'
import { AwaitingUpdateCompletionModal } from './AwaitingUpdateCompletionModal'
import { ReceivedUpdateResponseModal } from './ReceivedUpdateResponseModal'
import { CrossChainSyncStatusModal } from './CrossChainSyncStatusModal'
import { Notification } from './Notification'
import { poseidon } from './PoseidonHash'

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export function History({ tableData = {}, showRefresh = true, handleRefresh }) {
  const [showReceivedDataResponseModal, setShowReceivedDataResponseModal] =
    useState(false)
  const [showSendDataModal, setShowSendDataModal] = useState(false)
  const [showCompleteUpdateModal, setShowCompleteUpdateModal] = useState(false)
  const [showCompletedUpdateModal, setShowCompletedUpdateModal] =
    useState(false)
  const [showReceivedUpdateResponseModal, setShowReceivedUpdateResponseModal] =
    useState(false)
  const [showAwaitingDataModal, setShowAwaitingDataModal] = useState(false)
  const [showAwaitingUpdateModal, setShowAwaitingUpdateModal] = useState(false)
  const [showRequestedDataSentModal, setShowRequestedDataSentModal] =
    useState(false)
  const [showCrossChainSyncModal, setShowCrossChainSyncModal] = useState(false)
  const [showNotif, setShowNotif] = useState(false);
  const [errorNotif, setErrorNotif] = useState(false);
  const [notifTopText, setNotifTopText] = useState("");
  const [notifBottomText, setNotifBottomText] = useState("");
  const [selectedRowData, setSelectedRowData] = useState({
    operation: ['', ''],
    field: ['', ''],
    status: ['', 'grey'],
    details: ['', ''],
    type: '',
    requestID: '',
    addressSender: '',
    data: {},
    addressSender: '',
    salt: '',
    limit: '',
    key: '',
    response_fee: '',
    require2FA: '',
    twoFAProvider: '',
    twoFARequestID: '',
    twoFAOneTimeToken: '',
  })
  let { userAddress, userPassword, chainId, setApiErrorNotif, setApiErrorTopText, setApiErrorBottomText, fujiCoreContract, mumbaiCoreContract, contractPassword } = useGlobal()
  const handleRefreshAll = () => {
    // Call the loadAllHistory function from DashboardContext
    handleRefresh()
  }

  const tabs = [
    { name: 'Incoming' },
    { name: 'Outgoing' },
    { name: 'Cross-Chain Sync' },
  ]

  const openModal = (rowData) => {
    console.log(`openModal rowData: ${JSON.stringify(rowData, null, 2)}`)
    if (rowData.type === 'incoming_request_get') {
      if (rowData.status[0] === 'Response Sent') {
        openRequestedDataSentModal(rowData)
      } else {
        openSendDataModal(rowData)
      }
    } else if (rowData.type === 'incoming_request_update') {
      if (rowData.status[0] === 'Response Sent') {
        openCompletedUpdateModal(rowData)
      } else {
        openCompleteUpdateModal(rowData)
      }
    } else if (rowData.type === 'incoming_response_get') {
      openReceivedDataResponseModal(rowData)
    } else if (rowData.type === 'incoming_response_update') {
      openReceivedUpdateResponseModal(rowData)
    } else if (rowData.type === 'outgoing_request_get') {
      if (rowData.status[0] === 'Response Sent') {
        openReceivedDataResponseModal(rowData)
      } else {
        openAwaitingDataModal(rowData)
      }
    } else if (rowData.type === 'outgoing_request_update') {
      if (rowData.status[0] === 'Response Sent') {
        openReceivedUpdateResponseModal(rowData)
      } else {
        openAwaitingUpdateModal(rowData)
      }
    } else if (rowData.type === 'outgoing_response_get') {
      openRequestedDataSentModal(rowData)
    } else if (rowData.type === 'outgoing_response_update') {
      openCompletedUpdateModal(rowData)
    } else if (rowData.type === 'cctx') {

      openCrossChainSyncModal(rowData)
    }
  }

  const closeReceivedResponseModal = () => {
    setShowReceivedDataResponseModal(false)
  }

  const openShowReceivedDataResponseModal = (rowData) => {
    console.log(rowData)
    setSelectedRowData(rowData)
    setShowReceivedDataResponseModal(true)
  }

  const closeSendDataModal = () => {
    setShowSendDataModal(false)
  }

  const openSendDataModal = async (rowData) => {
    try {
      const fieldData = await getFieldData(
        userAddress,
        userPassword,
        rowData.field[0],
        chainId,
      )
      const newRowData = {
        ...rowData,
        data: fieldData['data'],
        salt: fieldData['data'][rowData.field[0]]['_metadata']['salt'],
      }
      console.log(newRowData)
      setSelectedRowData(newRowData)
      setShowSendDataModal(true)
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error fetching field data")
      setApiErrorBottomText(error.toString())
    }
  }

  const openCrossChainSyncModal = async (rowData) => {
    let fetchedValue;
    const contract =
    chainId == 43113
      ? fujiCoreContract
      : chainId == 80001
        ? mumbaiCoreContract
        : chainId == 1440002
          ? rippleCoreContract
          : null

  if (!contract) {
    console.error('No contract instance available for the current chain')
    return
  }
    switch (rowData.paramType) {
      case 'Data':
        try {
        const fieldDataRequest = await getFieldData(
          userAddress,
          userPassword,
          rowData.paramKey,
          chainId,
        )
        console.log(fieldDataRequest)
        const fieldData = fieldDataRequest['data']
        const paramKeyRawEnd = stringToBigInt(rowData.paramKey.substring(24, 48))
          ? stringToBigInt(rowData.paramKey.substring(24, 48))
          : stringToBigInt('')
        const contractPasswordEnd = stringToBigInt(
          contractPassword.substring(24, 48),
        )
          ? stringToBigInt(contractPassword.substring(24, 48))
          : stringToBigInt('')
        let paramKey = await poseidon([
          stringToBigInt(rowData.paramKey),
          paramKeyRawEnd,
          stringToBigInt(fieldData[rowData.paramKey]['_metadata']['salt']),
          stringToBigInt(contractPassword),
          contractPasswordEnd,
        ])
        const encryptedData = await contract.methods
          .obfuscatedData(paramKey)
          .call()
        fetchedValue = JSON.stringify(
          encryptedData,
          (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, // return everything else unchanged
          2,
        )
      } catch (error) {
        setApiErrorNotif(true)
        setApiErrorTopText("Error fetching field data")
        setApiErrorBottomText(error.toString())
      }
        break
      case 'Data Request':
        const encryptedDataRequest = await contract.methods
          .dataRequests(rowData.paramKey)
          .call()
          fetchedValue = JSON.stringify(
            encryptedDataRequest,
            (key, value) =>
              typeof value === 'bigint' ? value.toString() : value, // return everything else unchanged
            2,
          )
        break
      case 'Update Request':
        const encryptedUpdateRequest = await contract.methods
          .updateRequests(rowData.paramKey)
          .call()
        fetchedValue = JSON.stringify(
          encryptedUpdateRequest,
          (key, value) => {
            if (typeof value === 'bigint') {
              return value.toString()
            }
            return value
          },
          2,
        )
        break
      case 'Response':
        fetchedValue = await contract.methods.responses(rowData.paramKey).call()
        break
      case 'Public User Information':
        fetchedValue = await contract.methods
          .publicUserInformation(rowData.paramKey)
          .call()
        break
      case 'RSA Encryption Keys':
        fetchedValue = await contract.methods
          .rsaEncryptionKeys(rowData.paramKey)
          .call()
        break
      case 'RSA Signing Keys':
        fetchedValue = await contract.methods.rsaSigningKeys(rowData.paramKey).call()
        break
      default:
        console.error('Invalid parameter selected')
        return
    }

    const newRowData = {
      ...rowData,
      data: fetchedValue,
    }
    setSelectedRowData(newRowData)
    setShowCrossChainSyncModal(true)
  }

  const closeCrossChainSyncModal = () => {
    setShowCrossChainSyncModal(false)
  }

  const addResponseToRequest = async () => {
    const responseData = {
      response: {
        responseID: selectedRowData.requestID,
        address_sender: userAddress,
        address_receiver: selectedRowData.addressSender,
        chainID: chainId,
        operation: 'get',
        data: selectedRowData.data,
        field: selectedRowData.field[0],
        key: selectedRowData.key,
        require2FA: selectedRowData.require2FA,
        salt: selectedRowData.salt,
        limit: selectedRowData.limit,
        timestamp: Date.now().toString(),
        response_fee: selectedRowData.response_fee,
        twoFAProvider: selectedRowData.twoFAProvider,
        twoFARequestID: selectedRowData.twoFARequestID,
        twoFAOneTimeToken: selectedRowData.twoFAOneTimeToken,
      },
    }
    try {
      const result = await addResponse(
        userAddress,
        userPassword,
        responseData,
        chainId,
      )
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error adding response")
      setApiErrorBottomText(error.toString())
    }
    handleRefresh()
  }

  const completeUpdate = async () => {
    const fieldComplete = {
      [selectedRowData.field[0]]: {
        ...selectedRowData.data[selectedRowData.field[0]],
        _metadata: {
          twoFAProvider: selectedRowData.twoFAProvider,
          twoFARequestID: selectedRowData.twoFARequestID,
          twoFAOneTimeToken: selectedRowData.twoFAOneTimeToken,
          key: selectedRowData.key,
          require2FA: selectedRowData.require2FA,
          salt: selectedRowData.salt,
          limit: selectedRowData.limit,
        },
      },
    }

    const updateData = {
      key: selectedRowData.field[0],
      data: fieldComplete,
    }

    const responseData = {
      response: {
        responseID: selectedRowData.requestID,
        address_sender: userAddress,
        address_receiver: selectedRowData.addressSender,
        chainID: chainId,
        operation: 'update',
        updated_data: selectedRowData.data,
        field: selectedRowData.field[0],
        key: selectedRowData.key,
        require2FA: selectedRowData.require2FA,
        salt: selectedRowData.salt,
        limit: selectedRowData.limit,
        timestamp: Date.now().toString(),
        response_fee: selectedRowData.response_fee,
        twoFAProvider: selectedRowData.twoFAProvider,
        twoFARequestID: selectedRowData.twoFARequestID,
        twoFAOneTimeToken: selectedRowData.twoFAOneTimeToken,
      },
    }
    try {
    const updateResult = await updateFieldData(
      userAddress,
      userPassword,
      updateData,
      chainId,
    )
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error updating field")
      setApiErrorBottomText(error.toString())
    }
    try {
    const responseResult = await addResponse(
      userAddress,
      userPassword,
      responseData,
      chainId,
    )
    } catch (error) {
    setApiErrorNotif(true)
    setApiErrorTopText("Error adding response to update request")
    setApiErrorBottomText(error.toString())
    }
    closeCompleteUpdateModal()
    handleRefresh()
  }

  const openCompleteUpdateModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowCompleteUpdateModal(true)
  }

  const closeCompleteUpdateModal = () => {
    setShowCompleteUpdateModal(false)
    handleRefresh()
  }

  const openCompletedUpdateModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowCompletedUpdateModal(true)
  }

  const closeCompletedUpdateModal = () => {
    setShowCompletedUpdateModal(false)
    // handleRefresh();
  }

  const openReceivedDataResponseModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowReceivedDataResponseModal(true)
  }

  const closeReceivedDataResponseModal = (rowData) => {
    setShowReceivedDataResponseModal(false)
  }

  const openReceivedUpdateResponseModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowReceivedUpdateResponseModal(true)
  }

  const closeReceivedUpdateResponseModal = (rowData) => {
    setShowReceivedUpdateResponseModal(false)
  }

  const openAwaitingDataModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowAwaitingDataModal(true)
  }

  const closeAwaitingDataModal = (rowData) => {
    setShowAwaitingDataModal(false)
  }

  const openAwaitingUpdateModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowAwaitingUpdateModal(true)
  }

  const closeAwaitingUpdateModal = (rowData) => {
    setShowAwaitingUpdateModal(false)
  }

  const openRequestedDataSentModal = async (rowData) => {
    try {
      const fieldData = await getFieldData(
        userAddress,
        userPassword,
        rowData.field[0],
        chainId,
      )
      const newRowData = {
        ...rowData,
        data: fieldData['data'],
        salt: fieldData['data'][rowData.field[0]]['_metadata']['salt'],
      }
      setSelectedRowData(newRowData)
      setShowRequestedDataSentModal(true)
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error fetching field data")
      setApiErrorBottomText(error.toString())
    }
  }

  const closeRequestedDataSentModal = (rowData) => {
    setShowRequestedDataSentModal(false)
  }

  return (
    <div className="xl:max-w-none">
      <ReceivedDataResponseModal
        open={showReceivedDataResponseModal}
        onClose={closeReceivedDataResponseModal}
        requestID={selectedRowData.requestID}
        addressOfSendingParty={selectedRowData.addressSender}
        fieldRequested={selectedRowData.field[0]}
        dataSnapshot={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <SendDataModal
        open={showSendDataModal}
        onClose={closeSendDataModal}
        onSubmit={addResponseToRequest}
        showNotif={(error, topText, bottomText) =>  {
          setErrorNotif(error)
          setNotifTopText(topText)
          setNotifBottomText(bottomText)
          setShowNotif(true)
        }}
        addressOfRequestingParty={selectedRowData.addressSender}
        fieldRequested={selectedRowData.field[0]}
        requestID={selectedRowData.requestID}
        data={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <CompleteUpdateModal
        open={showCompleteUpdateModal}
        onClose={closeCompleteUpdateModal}
        onSubmit={completeUpdate}
        showNotif={(error, topText, bottomText) =>  {
          setErrorNotif(error)
          setNotifTopText(topText)
          setNotifBottomText(bottomText)
          setShowNotif(true)
        }}
        addressOfRequestingParty={selectedRowData.addressSender}
        fieldToUpdate={selectedRowData.field[0]}
        requestID={selectedRowData.requestID}
        newDataAfterUpdate={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <CompletedDataUpdateModal
        open={showCompletedUpdateModal}
        onClose={closeCompletedUpdateModal}
        addressOfRequestingParty={selectedRowData.addressSender}
        fieldToUpdate={selectedRowData.field[0]}
        requestID={selectedRowData.requestID}
        snapshotDataAfterUpdate={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <ReceivedUpdateResponseModal
        open={showReceivedUpdateResponseModal}
        onClose={closeReceivedUpdateResponseModal}
        requestID={selectedRowData.requestID}
        addressOfSendingParty={selectedRowData.addressSender}
        fieldUpdate={selectedRowData.field[0]}
        newDataSnapshot={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <AwaitingDataModal
        open={showAwaitingDataModal}
        onClose={closeAwaitingDataModal}
        requestID={selectedRowData.requestID}
        addressOfSendingParty={selectedRowData.addressSender}
        fieldRequested={selectedRowData.field[0]}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <AwaitingUpdateCompletionModal
        open={showAwaitingUpdateModal}
        onClose={closeAwaitingUpdateModal}
        requestID={selectedRowData.requestID}
        addressOfSendingParty={selectedRowData.addressSender}
        fieldToUpdate={selectedRowData.field[0]}
        snapshotAfterUpdate={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <RequestedDataSentModal
        open={showRequestedDataSentModal}
        onClose={closeRequestedDataSentModal}
        requestID={selectedRowData.requestID}
        addressOfRequestingParty={selectedRowData.addressSender}
        fieldRequested={selectedRowData.field[0]}
        snapshotData={JSON.stringify(selectedRowData.data, null, 2)}
        oneTimeKey={selectedRowData.key}
        oneTimeSalt={selectedRowData.salt}
        timeLimit={selectedRowData.limit}
        responseFee={selectedRowData.response_fee}
        require2FA={selectedRowData.require2FA}
        twoFAProvider={selectedRowData.twoFAProvider}
        twoFARequestID={selectedRowData.twoFARequestID}
        twoFAOneTimeToken={selectedRowData.twoFAOneTimeToken}
      />
      <CrossChainSyncStatusModal
        open={showCrossChainSyncModal}
        onClose={closeCrossChainSyncModal}
        parameterValue={selectedRowData.data}
        ccipRequestID={selectedRowData.ccid}
        parameterSynced={selectedRowData.paramType}
        parameterKey={selectedRowData.paramKey}
        sourceChain={selectedRowData.sourceChain}
        destinationChain={selectedRowData.destinationChain}
      />
      <Heading level={2} id="history" className="mt-0">
        Recent Activity
      </Heading>
      <div className="mt-4 border-t border-zinc-900/5 dark:border-white/5">
        <div className="mt-12 pb-8 xl:max-w-none">
          <Notification
            open={showNotif}
            error={false}
            showTopText={notifTopText}
            showBottomText={notifBottomText}
            onClose={() => setShowNotif(false)}
          />
          <Tab.Group>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <Tab.List className="flex">
                  {tabs
                    .filter(
                      (tab) =>
                        !(tab.name == 'Cross-Chain Sync' && chainId == 1440002),
                    )
                    .map((tab) => (
                      <Tab
                        key={tab.name}
                        as="button"
                        className={({ selected }) =>
                          classNames(
                            selected
                              ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900 dark:text-emerald-400'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                            'mx-1 rounded-md px-3 py-2 text-sm font-medium',
                          )
                        }
                      >
                        {tab.name}
                      </Tab>
                    ))}
                </Tab.List>
                <button
                  className="mr-1.5 rounded-md bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800"
                  onClick={handleRefreshAll}
                >
                  Refresh All
                </button>
              </div>
            </div>
            <div className="mt-4">
              <Tab.Panels className="w-full overflow-x-auto">
                {tabs.map((tab, index) => (
                  <Tab.Panel key={index}>
                    {tableData[tab.name] && tableData[tab.name].length > 0 ? (
                      <div className="inline-block h-[400px] min-w-full overflow-y-auto p-1.5 align-middle">
                        <div
                          className={`overflow-hidden rounded-lg border-2 transition duration-500 ease-in-out hover:border-emerald-400 hover:shadow-lg hover:ring-1 hover:ring-emerald-300 dark:border-gray-700 dark:hover:border-emerald-700 dark:hover:shadow-lg dark:hover:ring-1 dark:hover:ring-emerald-600`}
                        >
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                                  Operation
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                                  Field
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300">
                                  Details
                                </th>
                                {showRefresh ? (
                                  <th
                                    className="px-6 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300"
                                    onClick={handleRefreshAll}
                                  >
                                    Refresh
                                  </th>
                                ) : null}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {tableData[tab.name].map((rowData, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className="hover:bg-emerald-50 dark:hover:bg-emerald-800"
                                >
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                    {rowData.operation.map((op, i) => (
                                      <div
                                        key={i}
                                        className={
                                          i === 1 ? 'text-gray-400' : ''
                                        }
                                      >
                                        {op}
                                      </div>
                                    ))}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                    {rowData.field.map((fld, i) => (
                                      <div
                                        key={i}
                                        className={
                                          i === 1 ? 'text-gray-400' : ''
                                        }
                                      >
                                        {fld}
                                      </div>
                                    ))}
                                  </td>
                                  <td className="flex items-center whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                                    {rowData.status[1] === 'grey' ? (
                                      <button className="rounded-md bg-gray-200 px-2 py-1 text-sm font-medium text-gray-400 dark:bg-gray-700 dark:text-gray-400">
                                        {rowData.status[0]}
                                      </button>
                                    ) : rowData.status[1] === 'button' ? (
                                      <button
                                        onClick={() => {
                                          openModal(rowData)
                                        }}
                                        className="rounded-md bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800"
                                      >
                                        {rowData.status[0]}
                                      </button>
                                    ) : (
                                      <span>{rowData.status[0]}</span>
                                    )}
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                                    <div>
                                      <button
                                        className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500"
                                        onClick={() => {
                                          openModal(rowData)
                                        }}
                                      >
                                        {rowData.details[0]}
                                      </button>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-300">
                                      {rowData.details[1]}
                                    </div>
                                  </td>
                                  {showRefresh ? (
                                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                                      {/* Conditionally render the Refresh button */}
                                      <button
                                        className="rounded-md bg-emerald-100 px-2 py-1 text-sm font-medium text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800"
                                        onClick={handleRefreshAll}
                                      >
                                        Refresh
                                      </button>
                                    </td>
                                  ) : null}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </div>
          </Tab.Group>
        </div>
      </div>
    </div>
  )
}
