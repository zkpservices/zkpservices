import { useEffect, useRef, useState } from 'react';
import { UserData }  from '@/components/UserData';
import { Services }  from '@/components/Services';
import { History } from '@/components/History'
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

const tableData = {
  'Incoming': [],
  'Outgoing': [],
  'Cross-Chain Sync': []
}

export function DashboardContext() {
  return (
    <div>
      {/* <ZKPFaucetModal /> */}
      {/* <ViewFieldModal title="medical records"/>  */}
      {/* <NewDashboardDataModal /> */}
      {/* <NewUpdateRequestModal /> */}
      <NewDataRequestModal />
      <UserData /> {/* to be fed a prop such as userdata eventually */}
      <Services useLink={false} />
      <History tableData={tableData} showRefresh={true} />
    </div>
  )
}