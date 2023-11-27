import { Tab } from '@headlessui/react';
import { Heading } from '@/components/Heading'
import { ReceivedDataResponseModal } from '@/components/ReceivedDataResponseModal';
import { SendDataModal } from '@/components/SendDataModal';
import { useState } from 'react';
import { getFieldData, addResponse, updateFieldData } from '@/components/APICalls';
import { useGlobal } from '@/components/GlobalStorage';
import { CompleteUpdateModal } from './CompleteUpdateModal';
import { CompletedDataUpdateModal } from './CompletedDataUpdateModal';

const tabs = [
  { name: 'Incoming' },
  { name: 'Outgoing' },
  { name: 'Cross-Chain Sync' },
];

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export function History({ tableData = {}, showRefresh = true , handleRefresh}) {
  const [showReceivedDataResponseModal, setShowReceivedDataResponseModal] = useState(false);
  const [showSendDataModal, setShowSendDataModal] = useState(false);
  const [showCompleteUpdateModal, setShowCompleteUpdateModal] = useState(false);
  const [showCompletedUpdateModal, setShowCompletedUpdateModal] = useState(false);
  const [showReceivedUpdateResponseModal, setShowReceivedUpdateResponseModal] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState({});
  let {userAddress, userPassword, chainId} = useGlobal();
  const handleRefreshAll = () => {
    // Call the loadAllHistory function from DashboardContext
    handleRefresh();
  };

  const openModal = (rowData) => {
    console.log(`openModal rowData: ${rowData}`)
    if(rowData.type === "incoming_request_get") {
      openSendDataModal(rowData)
    } else if (rowData.type === "incoming_request_update") {
      if(rowData.status[0] === "Response Sent") {
        openCompletedUpdateModal(rowData)
      } else {
        openCompleteUpdateModal(rowData)
      }
    } else if (rowData.type === "incoming_response_get") {
      openReceivedDataResponseModal(rowData)
    } else if (rowData.type === "incoming_response_update") {
      openReceiv
    } else if (rowData.type === "outgoing_request_get") {
      if(rowData.status[0] === "Response Sent") {
        //receivedDataResponseModal
      } else {
        //awaitingUpdateCompletionModal
      }
    } else if (rowData.type === "outgoing_request_update") {
      if(rowData.status[0] === "Response Sent") {
        //receivedDataUpdateModal
      } else {
        //awaitingDataModal
      }
    } else if (rowData.type === "outgoing_response_get") {
      //sendDataModal
    } else if (rowData.type === "outgoing_response_update") {
      //completedDataUpdateModal
    }

  }

  const closeReceivedResponseModal = () => {
    setShowReceivedDataResponseModal(false);
  }

  const openShowReceivedDataResponseModal = (rowData) => {
    console.log(rowData)
    setSelectedRowData(rowData)
    setShowReceivedDataResponseModal(true)
  }
  
  const closeSendDataModal = () => {
    setShowSendDataModal(false);
  }

  const openSendDataModal = async (rowData) => {
    const fieldData = await getFieldData(userAddress, userPassword, rowData.field[0], chainId)
    const newRowData = {
      ...rowData,
      data: fieldData['data']
    }
    console.log(newRowData)
    setSelectedRowData(newRowData)
    setShowSendDataModal(true)
  }

  const addResponseToRequest = async () => {
    const responseData = {
      response: {
        responseID: selectedRowData.requestID,
        address_sender: userAddress,
        address_receiver: selectedRowData.addressSender,
        chainID: chainId,
        operation: "get",
        data: selectedRowData.data,
        field: selectedRowData.field[0],
        key: selectedRowData.key,
        require2FA: selectedRowData.require2FA,
        salt: selectedRowData.salt,
        limit: selectedRowData.limit,
        timestamp: Date.now().toString(),
        response_fee: selectedRowData.response_fee,
        twoFA_provider: selectedRowData.twoFAProvider,
        twoFA_requestID: selectedRowData.twoFARequestID,
        twoFA_one_time_token: selectedRowData.twoFAOneTimeToken
      }
    }
    const result = await addResponse(userAddress, userPassword, responseData, chainId)
    handleRefresh()
  }

  const completeUpdate = async () => {

    const updateData = {
      key: selectedRowData.field[0],
      data: selectedRowData.data
    }

    const responseData = {
      response: {
        responseID: selectedRowData.requestID,
        address_sender: userAddress,
        address_receiver: selectedRowData.addressSender,
        chainID: chainId,
        operation: "update",
        data: selectedRowData.data,
        field: selectedRowData.field[0],
        key: selectedRowData.key,
        require2FA: selectedRowData.require2FA,
        salt: selectedRowData.salt,
        limit: selectedRowData.limit,
        timestamp: Date.now().toString(),
        response_fee: selectedRowData.response_fee,
        twoFA_provider: selectedRowData.twoFAProvider,
        twoFA_requestID: selectedRowData.twoFARequestID,
        twoFA_one_time_token: selectedRowData.twoFAOneTimeToken
      }
    }
    const updateResult = await updateFieldData(userAddress, userPassword, updateData, chainId)
    const responseResult = await addResponse(userAddress, userPassword, responseData, chainId)
    closeCompleteUpdateModal()
    handleRefresh()
  }

  const openCompleteUpdateModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowCompleteUpdateModal(true);
  }

  const closeCompleteUpdateModal = () => {
    setShowCompleteUpdateModal(false);
    handleRefresh();
  }

  const openCompletedUpdateModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowCompletedUpdateModal(true);
  }

  const closeCompletedUpdateModal = () => {
    setShowCompletedUpdateModal(false);
    // handleRefresh();
  }

  const openReceivedDataResponseModal = (rowData) => {
    setSelectedRowData(rowData)
    setShowReceivedDataResponseModal(true)
  }

  const closeReceivedDataResponseModal = (rowData) => {
    setShowReceivedDataResponseModal(false)
  }


  return (
    <div className="xl:max-w-none">
      {showReceivedDataResponseModal && <ReceivedDataResponseModal 
      open={true} 
      onClose={closeReceivedResponseModal}
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
      />}
      {showSendDataModal && <SendDataModal 
      open={true} 
      onClose={closeSendDataModal}
      onSubmit={addResponseToRequest}
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
      />}
      {showCompleteUpdateModal && <CompleteUpdateModal 
      open={true} 
      onClose={closeCompleteUpdateModal}
      onSubmit={completeUpdate}
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
      />}
      {showCompletedUpdateModal && <CompletedDataUpdateModal 
      open={true} 
      onClose={closeCompletedUpdateModal}
      onSubmit={completeUpdate}
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
      />}
      <Heading level={2} id="history" className="mt-0">
        Recent Activity
      </Heading>
      <div className="mt-4 border-t border-zinc-900/5 dark:border-white/5">
        <div className="xl:max-w-none mt-12 pb-8">
          <Tab.Group>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <Tab.List className="flex">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      as="button"
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900 dark:text-emerald-400'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                          'rounded-md px-3 py-2 text-sm font-medium mx-1'
                        )
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>
                <button
                  className="px-3 py-2 text-sm mr-1.5 font-medium bg-emerald-100 text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800 rounded-md"
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
                      <div className="p-1.5 min-w-full inline-block align-middle overflow-y-auto h-[400px]">
                        <div className={`border-2 transition ease-in-out duration-500 hover:border-emerald-400 hover:shadow-lg hover:ring-1 hover:ring-emerald-300 dark:hover:border-emerald-700 dark:hover:shadow-lg dark:hover:ring-1 dark:hover:ring-emerald-600 rounded-lg overflow-hidden dark:border-gray-700`}>
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase dark:text-gray-300">
                                  Operation
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase dark:text-gray-300">
                                  Field
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase dark:text-gray-300">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase dark:text-gray-300">
                                  Details
                                </th>
                                {showRefresh ? (
                                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase dark:text-gray-300" onClick={handleRefreshAll}>
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
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    {rowData.operation.map((op, i) => (
                                      <div key={i} className={i === 1 ? 'text-gray-400' : ''}>{op}</div>
                                    ))}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                    {rowData.field.map((fld, i) => (
                                      <div key={i} className={i === 1 ? 'text-gray-400' : ''}>{fld}</div>
                                    ))}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 flex items-center">
                                    {rowData.status[1] === 'grey' ? (
                                      <button
                                        className="px-2 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-400">
                                        {rowData.status[0]}
                                      </button>
                                    ) : rowData.status[1] === 'button' ? (
                                      <button onClick={() => {
                                        openModal(rowData)}}
                                       className="px-2 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800">
                                        {rowData.status[0]}
                                      </button>
                                    ) : (
                                      <span>{rowData.status[0]}</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                                    <div>
                                      <button className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-500" onClick={() => {
                                        openModal(rowData)}}>
                                        {rowData.details[0]}
                                      </button>
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-300">
                                      {rowData.details[1]}
                                    </div>
                                  </td>
                                  {showRefresh ? (
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                                      {/* Conditionally render the Refresh button */}
                                        <button className="px-2 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-500 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-800" onClick={handleRefreshAll}>
                                          Refresh
                                        </button>
                                    </td>
                                  ) : null}
                                </tr>
                              ))
                              }
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
  );
}
