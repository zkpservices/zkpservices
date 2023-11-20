import Link from 'next/link'
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion, transform, useMotionTemplate, useMotionValue } from 'framer-motion'
import { Tab } from '@headlessui/react';
import { useWallet } from "@/components/Wallet.jsx";

// import { Modal } from '@/components/Modal'
// import { NewDataModal } from '@/components/NewDataModal'
// import { ZKPFaucetModal } from '@/components/ZKPFaucetModal'
// import { ViewFieldModal } from '@/components/ViewFieldModal'
// import { NewUpdateRequestModal } from '@/components/NewUpdateRequestModal'
import { NewDataRequestModal } from '@/components/NewDataRequestModal'
import { ThreeJSComponent } from '@/components/ThreeJSComponent'
import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
import { ChatBubbleIcon } from '@/components/icons/ChatBubbleIcon'
import { EnvelopeIcon } from '@/components/icons/EnvelopeIcon'
import { UserIcon } from '@/components/icons/UserIcon'
import { UsersIcon } from '@/components/icons/UsersIcon'
import { PlusIcon } from '@/components/icons/PlusIcon'
import { History } from '@/components/History'
import { Notification } from '@/components/Notification'

const mydata = [
  {
    href: '/requestdata',
    name: 'Request Data',
    description:
      'Learn about the contact model and how to create, retrieve, update, delete, and list contacts.',
    icon: UserIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3],
      ],
    },
  },
  {
    href: '/requestupdate',
    name: 'Request Update',
    description:
      'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
    icon: ChatBubbleIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
  {
    href: '/respond',
    name: 'Respond',
    description:
      'Learn about the message model and how to create, retrieve, update, delete, and list messages.',
    icon: EnvelopeIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4],
      ],
    },
  },
  // {
  //   href: '/crosschain',
  //   name: 'Cross-Chain Backups',
  //   description:
  //     'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
  //   icon: UsersIcon,
  //   pattern: {
  //     y: 22,
  //     squares: [[0, 1]],
  //   },
  // },
]

const services = [
  {
    href: '/requestdata',
    name: 'Request Data',
    description:
      'Learn about the contact model and how to create, retrieve, update, delete, and list contacts.',
    icon: UserIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3],
      ],
    },
  },
  {
    href: '/requestupdate',
    name: 'Request Update',
    description:
      'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
    icon: ChatBubbleIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
  {
    href: '/crosschain',
    name: 'Cross-Chain Backups',
    description:
      'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
    icon: UsersIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]],
    },
  },
  {
    href: '/2fa',
    name: 'Manage 2FA Verifier',
    description:
      'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
    icon: UsersIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]],
    },
  },
]

function MyDataIcon({ icon: Icon }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-emerald-300/10 dark:group-hover:ring-emerald-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-emerald-300/10 dark:group-hover:stroke-emerald-400" />
    </div>
  )
}

function MyDataPattern({ mouseX, mouseY, ...gridProps }) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D7EDEA] to-[#F4FBDF] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#303428]"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}


function ServiceIcon({ icon: Icon }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-sky-300/10 dark:group-hover:ring-sky-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-sky-300/10 dark:group-hover:stroke-sky-400" />
    </div>
  )
}

function ServicePattern({ mouseX, mouseY, ...gridProps }) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D7EDEA] to-[#dff5fb] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#282d34]"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

function MyData({ service }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      key={service.href}
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <MyDataPattern {...service.pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-16 pb-4">
        <MyDataIcon icon={service.icon} />
        <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
          <Link href={service.href}>
            <span className="absolute inset-0 rounded-2xl" />
            {service.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {service.description}
        </p>
      </div>
    </div>
  )
}

function Service({ service }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      key={service.href}
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <ServicePattern {...service.pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-16 pb-4">
        <ServiceIcon icon={service.icon} />
        <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
          <Link href={service.href}>
            <span className="absolute inset-0 rounded-2xl" />
            {service.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {service.description}
        </p>
      </div>
    </div>
  )
}

function HollowCard() {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  // Pattern for the HollowCard (can be adjusted)
  let pattern = {
    y: 16,
    squares: [
      [0, 1],
      [1, 3],
    ],
  }

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <MyDataPattern {...pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-16 pb-4">
        <MyDataIcon icon={PlusIcon} /> {/* Here's the addition */}
        <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
          Coming Soon
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Additional features will be added here.
        </p>
      </div>
    </div>
  )
}


// const tabs = [
//   { name: 'First Two People' },
//   { name: 'Next Two People' },
//   { name: 'Last Two People' }
// ];

// function classNames(...classes) {
//   return classes.filter(Boolean).join(' ');
// }

// function dHistory() {
//   return (
//     <div className="xl:max-w-none mt-12 pb-8">
//       <Tab.Group>
//         <div className="mb-8 space-x-1">
//           <Tab.List className="flex">
//             {tabs.map((tab) => (
//               <Tab key={tab.name} as="button" className={({ selected }) =>
//                   classNames(
//                     selected ? 'bg-emerald-100 text-emerald-500 dark:bg-emerald-900 dark:text-emerald-400' : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
//                     'rounded-md px-3 py-2 text-sm font-medium mx-1'
//                   )
//                 }>
//                 {tab.name}
//               </Tab>
//             ))}
//           </Tab.List>
//         </div>
//         <div className="mt-4">
//           <Tab.Panels className="w-full">
//             <Tab.Panel>
//               <IlluminatedTable people={people.slice(0, 2)} />
//             </Tab.Panel>
//             <Tab.Panel>
//               <IlluminatedTable people={people.slice(2, 4)} />
//             </Tab.Panel>
//             <Tab.Panel>
//               <IlluminatedTable people={people.slice(4)} />
//             </Tab.Panel>
//           </Tab.Panels>
//         </div>
//       </Tab.Group>
//     </div>
//   );
// }


export function Dashboard() {

  const [tableData, setTableData] = useState({
    'Incoming': [],
    'Outgoing': [],
    'Cross-Chain Sync': []
  })

  const { walletConnected, userAddress, showLoginNotification, 
    setShowLoginNotification, loggedIn, userPassword, username, setUsername } = useWallet();
  const get_item_payload = {
    "id": userAddress,
    "action": "get_item",
    "key": "id.name",
    "password": userPassword       
  }
  const get_ccip_payload = {
    "id": userAddress,
    "action": "get_crosschain_transaction",
    "password": userPassword       
  }
  useEffect(() => {
    // Make a POST request when the Dashboard page is shown
    axios
      .post('https://yrd4sydg5g.execute-api.us-east-1.amazonaws.com/test/userdata-api', get_item_payload)
      .then((response) => {
        console.log(response['data']['id.name'])
        setUsername(response['data']['id.name'])
        console.log('username')
        console.log(username)
      })
      .catch((error) => {
        // Handle errors
        console.error('Error making POST request:', error);
      });

      axios
      .post('https://yrd4sydg5g.execute-api.us-east-1.amazonaws.com/test/userdata-api', get_ccip_payload)
      .then((response) => {
        const responseData = response['data']
        
        const transformedData = Object.entries(responseData).map(([ccip_id, data]) => {
          const { source_chain, destination_chain, field } = data;
          return {
            operation: ['Sync Data'],
            field: [field, `From ${source_chain} to ${destination_chain}`],
            status: ['Sync Completed', 'button'],
            details: ['View Details'],
          };
        });
        setTableData((prevTableData) => ({
          ...prevTableData,
          'Cross-Chain Sync': transformedData, // Update with your transformed data
        }));
        console.log(tableData)
      })
      
      .catch((error) => {
        // Handle errors
        console.error('Error making POST request:', error);
      });

    // After 5000 milliseconds (5 seconds), hide the notification
    const notificationTimeout = setTimeout(() => {
      setShowLoginNotification(false);
    }, 5000);

    // Clear the notification timeout when the component unmounts
    return () => {
      clearTimeout(notificationTimeout);
    };
  }, []);
  const [dashboardData, setDashboardData] = useState(null);

  function handleRefreshButtonClick() {
    const get_ccip_payload = {
      "id": userAddress,
      "action": "get_crosschain_transaction",
      "password": userPassword       
    }
    axios
    .post('https://yrd4sydg5g.execute-api.us-east-1.amazonaws.com/test/userdata-api', get_item_payload)
    .then((response) => {
      console.log(response['data']['id.name'])
      setUsername(response['data']['id.name'])
      console.log('username')
      console.log(username)
    })
    .catch((error) => {
      // Handle errors
      console.error('Error making POST request:', error);
    });

    axios
    .post('https://yrd4sydg5g.execute-api.us-east-1.amazonaws.com/test/userdata-api', get_ccip_payload)
    .then((response) => {
      const responseData = response['data']
      
      const transformedData = Object.entries(responseData).map(([ccip_id, data]) => {
        const { source_chain, destination_chain, field } = data;
        return {
          operation: ['Sync Data'],
          field: [field, `From ${source_chain} to ${destination_chain}`],
          status: ['Sync Completed', 'button'],
          details: ['View Details'],
        };
      });
      console.log(transformedData)
      setTableData((prevTableData) => ({
        ...prevTableData,
        'Cross-Chain Sync': transformedData, // Update with your transformed data
      }));
      console.log(tableData)
    })
    
    .catch((error) => {
      // Handle errors
      console.error('Error making POST request:', error);
    });
  }
  return (
    <>
    {walletConnected && loggedIn ? (
    <>
    <div className="xl:max-w-none">
      <h2 className="mt-10 text-center text-3xl font-bold tracking-tight ">
              {(username != '') ? `Welcome back, ${username}.` : ''}
      </h2>
      <Heading level={2} id="mydata" className="mt-0">
        Access My Data 
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
        {mydata.map((service) => (
          <MyData key={service.href} service={service} />
        ))}
        <HollowCard />
      </div>
    </div>

    <div className="xl:max-w-none mt-16 pb-8">
      <Heading level={2} id="services" className="mt-0">
        Start Activity
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => (
          <Service key={service.href} service={service} />
        ))}
      </div>
    </div>

    <div className="xl:max-w-none mt-8">
      <Heading level={2} id="history" className="mt-0">
        Recent Activity
      </Heading>
      <div className="mt-4 border-t border-zinc-900/5 dark:border-white/5" >
        <History tableData={tableData} showRefresh={true} />
      </div>
    </div>

    <div>
    {showLoginNotification && (
      <Notification
        showTopText="Logged in successfully"
        showBottomText={`Logged in as ${userAddress}`}
      />
    )}
    </div>

    {/* <div>
      <ThreeJSComponent />
    </div> */}

    {/* <Modal /> */}
    {/* <NewDataModal /> */}
    {/* <ZKPFaucetModal /> */}
    {/* <ViewFieldModal title="Medical Records" /> */}
    {/* <NewUpdateRequestModal /> */}
    <NewDataRequestModal />

    </>
   ) : (
      <h2 className="mt-10 text-center text-3xl font-bold tracking-tight">
        Please connect your wallet and login to get started
      </h2>
   )}
  </>
  )}

export default Dashboard;