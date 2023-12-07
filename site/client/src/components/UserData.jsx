import { useState } from 'react'
import { GridPattern } from '@/components/GridPattern'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useGlobal } from '@/components/GlobalStorage'
import {
  getFieldData,
  getAvailableDashboard,
  addToDashboard,
  removeFromDashboard,
} from '@/components/APICalls'
import { Heading } from '@/components/Heading'
import { DataIcon } from '@/components/icons/DataIcon'
import { PlusIcon } from '@/components/icons/PlusIcon'
import { ViewFieldModal } from './ViewFieldModal'
import { poseidon } from './PoseidonHash'
import {
  stringToBigInt,
  splitTo24,
  flattenJsonAndComputeHash,
} from './HelperCalls'
import { NewDashboardDataModal } from './NewDashboardDataModal' // Import your NewDashboardDataModal component

const fieldDescriptions = 'Click to display data for this field.'
const fieldIcon = DataIcon // Assuming DataIcon is the desired icon
const fieldPatterns = [
  {
    y: 16,
    squares: [
      [0, 1],
      [1, 3],
    ],
  },
  {
    y: -6,
    squares: [
      [-1, 2],
      [1, 3],
    ],
  },
  {
    y: 32,
    squares: [
      [0, 2],
      [1, 4],
    ],
  },
  {
    y: 22,
    squares: [[0, 1]],
  },
]

function MyDataIcon({ icon: Icon }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-sky-300/10 dark:group-hover:ring-sky-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-sky-300/10 dark:group-hover:stroke-sky-400" />
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

export function MyData({ mydata, onCardClick }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      key={mydata.name}
      onMouseMove={onMouseMove}
      onClick={() => onCardClick(mydata.name)}
      className="group relative flex h-60 rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <MyDataPattern {...mydata.pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pb-4 pt-16">
        <MyDataIcon icon={mydata.icon} />
        <h3
          className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white"
        >
          <span className="absolute inset-0 rounded-2xl" />
          {mydata.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {mydata.description}
        </p>
      </div>
    </div>
  )
}

export function UserData({ fieldNames = [], handleRemove, handleAdd }) {
  const [selectedFieldName, setSelectedFieldName] = useState(null)
  const [selectedSalt, setSelectedSalt] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedHash, setSelectedHash] = useState(null)
  const [selectedSaltHash, setSelectedSaltHash] = useState(null)
  const [addDataModalOpen, setAddDataModalOpen] = useState(false)
  const [availableDashboard, setAvailableDashboard] = useState([])
  let {
    userAddress,
    userPassword,
    fieldData,
    setFieldData,
    dashboard,
    setDashboard,
    chainId,
    contractPassword,
    apiErrorNotif,
    setApiErrorNotif,
    setApiErrorTopText,
    setApiErrorBottomText
  } = useGlobal()

  async function addServiceToDashboard(service) {
    setAddDataModalOpen(false)
    handleAdd(service)
    try {
      const addToDashboardResult = await addToDashboard(
        userAddress,
        userPassword,
        service,
        chainId,
      )
    } catch (error) {
      console.error("Error adding to dashboard.")
      setApiErrorTopText("Error adding to dashboard.")
      setApiErrorBottomText(error.toString())
      setApiErrorNotif(true)
    }
  }

  async function removeServiceFromDashboard(service) {
    setSelectedFieldName(null)
    handleRemove(service)
    try {
    const removeServiceFromDashboardResult = await removeFromDashboard(
      userAddress,
      userPassword,
      service,
      chainId,
    )
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error removing field from dashboard")
      setApiErrorBottomText(error.toString())
    }
  }

  async function openFieldModal(fieldName) {
    try {
    let localFieldData = await getFieldData(
      userAddress,
      userPassword,
      fieldName.toLowerCase(),
      chainId,
    )
    setFieldData(localFieldData['data'])
    setSelectedFieldName(fieldName)
    const splitFieldName = splitTo24(fieldName)
    const splitUserSecret = splitTo24(contractPassword)
    const saltHash = await poseidon([
      stringToBigInt(localFieldData['data'][fieldName]['_metadata']['salt']),
    ])
    const dataLocation = await poseidon([
      stringToBigInt(splitFieldName[0]),
      stringToBigInt(splitFieldName[1]),
      stringToBigInt(localFieldData['data'][fieldName]['_metadata']['salt']),
      stringToBigInt(splitUserSecret[0]),
      stringToBigInt(splitUserSecret[1]),
    ])
    const dataHash = await flattenJsonAndComputeHash(
      JSON.stringify(localFieldData['data'], null, 2),
    )
    setSelectedLocation(dataLocation)
    setSelectedSaltHash(saltHash)
    setSelectedHash(dataHash['rootHash'])
    setSelectedSalt(localFieldData['data'][fieldName]['_metadata']['salt'])
  } catch (error) {
    console.error(error)
    setApiErrorNotif(true)
    setApiErrorTopText("Error fetching field data")
    setApiErrorBottomText(error.toString())
  }
  }

  const closeFieldModal = () => {
    setSelectedFieldName(null)
  }

  function findUniqueElements(list1, list2) {
    const uniqueInList1 = list1.filter((item) => !list2.includes(item))
    const uniqueInList2 = list2.filter((item) => !list1.includes(item))
    return [...uniqueInList1, ...uniqueInList2]
  }

  async function openAddDataModal() {
    try {
      const localAvailableDashboard = await getAvailableDashboard(
        userAddress,
        userPassword,
        chainId,
      )
      const differenceDashboard = findUniqueElements(
        localAvailableDashboard['data'],
        fieldNames,
      )

      setAvailableDashboard(differenceDashboard)
      setAddDataModalOpen(true)
    } catch (error) {
      setApiErrorNotif(true)
      setApiErrorTopText("Error getting available dashboard elements")
      setApiErrorBottomText(error.toString())
    }
  }

  const closeAddDataModal = () => {
    setAddDataModalOpen(false)
  }

  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="mydata">
        Access My Data
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
        {fieldNames.map((fieldName, index) => (
          <MyData
            key={fieldName}
            mydata={{
              name: fieldName,
              description: fieldDescriptions,
              icon: fieldIcon,
              pattern: fieldPatterns[index % fieldPatterns.length],
            }}
            onCardClick={openFieldModal}
          />
        ))}
        <MyData
          key="Add Data"
          mydata={{
            name: 'Add Data',
            description:
              'Enter a field to add to your dashboard for easy access.',
            icon: PlusIcon,
            pattern: {
              y: 16,
              squares: [
                [0, 1],
                [1, 3],
              ],
            },
          }}
          onCardClick={openAddDataModal}
        />
      </div>

      <ViewFieldModal
        title={selectedFieldName}
        open={selectedFieldName !== null}
        onDelete={removeServiceFromDashboard}
        onClose={closeFieldModal}
        fieldData={fieldData}
        fieldName={selectedFieldName}
        dataLocation={selectedLocation}
        dataHash={selectedHash}
        obfuscationSalt={selectedSalt}
        saltHash={selectedSaltHash}
      />
      <NewDashboardDataModal
        open={addDataModalOpen}
        onSubmit={addServiceToDashboard}
        onClose={closeAddDataModal}
        options={availableDashboard}
      />
    </div>
  )
}
