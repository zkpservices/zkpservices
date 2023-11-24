import { useEffect, useRef, useState, useContext } from 'react';
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { History } from '@/components/History'
import { useGlobal } from '@/components/GlobalStorage';
import { getCCTX } from '@/components/APICalls';
import { ZKPFaucetModal } from '@/components/ZKPFaucetModal'
import { ViewFieldModal } from '@/components/ViewFieldModal'
import { NewDashboardDataModal } from '@/components/NewDashboardDataModal'
import { NewUpdateRequestModal } from '@/components/NewUpdateRequestModal'
import { NewDataRequestModal } from '@/components/NewDataRequestModal'
import { NewCrossChainSyncModal } from '@/components/NewCrossChainSyncModal'
import { CrossChainSyncStatusModal } from '@/components/CrossChainSyncStatusModal'
import { CompleteUpdateModal } from '@/components/CompleteUpdateModal'
import { CompletedDataUpdateModal } from '@/components/CompletedDataUpdateModal'
import { RequestedDataSentModal } from '@/components/RequestedDataSentModal'
import { ReceivedUpdateResponseModal } from '@/components/ReceivedUpdateResponseModal'
import { ReceivedDataResponseModal } from '@/components/ReceivedDataResponseModal'
import { AwaitingUpdateCompletionModal} from '@/components/AwaitingUpdateCompletionModal'
import { AwaitingDataModal } from '@/components/AwaitingDataModal'
import { SendDataModal } from '@/components/SendDataModal'

export function DashboardContext() {

  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  });
  const [userDataFields, setUserDataFields] = useState([])

  let { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername} = useGlobal();

  useEffect(() => {
    async function fetchCCTXData() {
      try {
        const cctxData = await getCCTX(userAddress, userPassword);
        const transformedData = cctxData['data'].map((item) => ({
          operation: ['Sync Data'],
          field: [item.field, `From ${item.source_chain} to ${item.destination_chain}`],
          status: ['Sync Completed', 'button'],
          details: ['View Details', `Request ID ${item.ccid_id}`]
        }));
        setTableData((prevTableData) => ({
          ...prevTableData,
          'Cross-Chain Sync': transformedData,
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    async function fetchUserDataFields() {
      try {
        // Replace this with the actual fetch method when available
        // For now, use a placeholder value
        const placeholderData = ["Medical Records", "Public Transport Information", "Insurance Card"];
        setUserDataFields(placeholderData);
      } catch (error) {
        console.error('Error fetching user data fields:', error);
      }
    }

    fetchCCTXData();
    fetchUserDataFields();
  }, [])
  return (
    <div>
      {/* <ZKPFaucetModal /> */}
      {/* <ViewFieldModal title="medical records"/>  */}
      {/* <NewDashboardDataModal /> */}
      {/* <NewUpdateRequestModal /> */}
      {/* <NewDataRequestModal /> */}
      <UserData fieldNames={userDataFields}/> 
      <Services />
      <History tableData={tableData} showRefresh={true} />
    </div>
  )
}