import { useState } from 'react';
import { GridPattern } from '@/components/GridPattern';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Heading } from '@/components/Heading';
import { addRequest } from '@/components/APICalls';
import { QuestionMarkIcon } from '@/components/icons/QuestionMarkIcon';
import { UpdateIcon } from '@/components/icons/UpdateIcon';
import { TokenIcon } from '@/components/icons/TokenIcon';
import { CrosschainIcon } from '@/components/icons/CrosschainIcon';
import { ZKPFaucetModal } from '@/components/ZKPFaucetModal';
import { NewUpdateRequestModal } from '@/components/NewUpdateRequestModal';
import { NewDataRequestModal } from '@/components/NewDataRequestModal';
import { NewCrossChainSyncModal } from '@/components/NewCrossChainSyncModal';
import { useGlobal } from '@/components/GlobalStorage';
import { OnboardToNewChainModal } from './OnboardToNewChainModal';
const services = [
  {
    href: '/dashboard',
    name: 'Request Data',
    description:
      'Learn about the contact model and how to create, retrieve, update, delete, and list contacts.',
    icon: QuestionMarkIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3],
      ],
    },
  },
  {
    href: '/dashboard',
    name: 'Request Update',
    description:
      'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
    icon: UpdateIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
  {
    href: '/dashboard',
    name: 'Cross-Chain Backups',
    description:
      'Learn about the group model and how to create, retrieve, update, delete, and list groups.',
    icon: CrosschainIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4],
      ],
    },
  },
  {
    href: '/dashboard',
    name: 'ZKP Tokens Faucet',
    description:
      'Get some test tokens for our ERC20 contract',
    icon: TokenIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]],
    },
  },
  {
    href: '/dashboard',
    name: 'Onboard To New Chain',
    description:
      'Learn about the conversation model and how to create, retrieve, update, delete, and list conversations.',
    icon: UpdateIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
];

function ServiceIcon({ icon: Icon }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-emerald-300/10 dark:group-hover:ring-emerald-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-emerald-300/10 dark:group-hover:stroke-emerald-400" />
    </div>
  );
}

function ServicePattern({ mouseX, mouseY, ...gridProps }) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`;
  let style = { maskImage, WebkitMaskImage: maskImage };

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
  );
}

function ServiceCard({ service, onCardClick, openModal, isSelected }) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      key={service.name}
      onMouseMove={onMouseMove}
      onClick={() => {
        onCardClick(service.name);
        openModal(service.name); // Pass the service name to openModal
      }}
      className={`group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5 ${isSelected ? 'bg-zinc-900' : ''}`}
    >
      <ServicePattern {...service.pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pt-16 pb-4">
        <ServiceIcon icon={service.icon} />
        <h3 className={`mt-4 text-sm font-semibold leading-7 text-${isSelected ? 'white' : 'zinc-900'} dark:text-white`}>
          <span className="absolute inset-0 rounded-2xl" />
          {service.name}
        </h3>
        <p className={`mt-1 text-sm text-${isSelected ? 'white' : 'zinc-600'} dark:text-zinc-400`}>
          {service.description}
        </p>
      </div>
    </div>
  );
}

export function Services() {
  const [selectedService, setSelectedService] = useState(null);

  const openModal = (serviceName) => {
    setSelectedService(serviceName);
  };

  let {userAddress, userPassword, chainId} = useGlobal();

  async function addNewRequest(requestData) {
    //
    const compiledRequestData = {
      ...requestData,
      address_sender: userAddress,
      chainID: chainId,
    }
    const finalRequestData = {
      request: compiledRequestData
    }
    const addRequestResult = await addRequest(userAddress, userPassword, finalRequestData, chainId)
  }

  return (
    <div className="xl:max-w-none mt-16">
      <div className="my-16 xl:max-w-none">
        <Heading level={2} id="services">
          Services
        </Heading>
        <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              onCardClick={openModal}
              openModal={openModal} // Just pass openModal function
              isSelected={selectedService === service.name}
            />
          ))}
        </div>
      </div>
      {selectedService === 'Request Data' && <NewDataRequestModal open={true} onClose={() => setSelectedService(null)} onSubmit={addNewRequest} />}
      {selectedService === 'Request Update' && <NewUpdateRequestModal open={true} onClose={() => setSelectedService(null)} onSubmit={addNewRequest}/>}
      {selectedService === 'Cross-Chain Backups' && <NewCrossChainSyncModal open={true} onClose={() => setSelectedService(null)} />}
      {selectedService === 'ZKP Tokens Faucet' && <ZKPFaucetModal open={true} onClose={() => setSelectedService(null)} />}
      {selectedService === 'Onboard To New Chain' && <OnboardToNewChainModal open={true} onClose={() => setSelectedService(null)} />}
    </div>
  );
}
