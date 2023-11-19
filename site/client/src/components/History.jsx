import { Tab } from '@headlessui/react';
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion';


const people = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  { name: 'John Doe', title: 'Back-end Developer', email: 'john.doe@example.com', role: 'Admin' },
  { name: 'Jane Smith', title: 'Full-stack Developer', email: 'jane.smith@example.com', role: 'Member' },
  { name: 'Emily Johnson', title: 'Designer', email: 'emily.johnson@example.com', role: 'Member' },
  { name: 'Michael Scott', title: 'Regional Manager', email: 'michael.scott@example.com', role: 'Admin' },
  { name: 'Michael Scott', title: 'Regional Manager', email: 'michael.scott@example.com', role: 'Admin' },
  { name: 'Jim Halpert', title: 'Salesman', email: 'jim.halpert@example.com', role: 'Member' },
  { name: 'Michael Scott', title: 'Regional Manager', email: 'michael.scott@example.com', role: 'Admin' },
  { name: 'Jim Halpert', title: 'Salesman', email: 'jim.halpert@example.com', role: 'Member' },
  { name: 'Michael Scott', title: 'Regional Manager', email: 'michael.scott@example.com', role: 'Admin' },
  { name: 'Jim Halpert', title: 'Salesman', email: 'jim.halpert@example.com', role: 'Member' },
  { name: 'Michael Scott', title: 'Regional Manager', email: 'michael.scott@example.com', role: 'Admin' },
  { name: 'Jim Halpert', title: 'Salesman', email: 'jim.halpert@example.com', role: 'Member' },
  { name: 'Jim Halpert', title: 'Salesman', email: 'jim.halpert@example.com', role: 'Member' }
];

const tabs = [
  { name: 'First Two People' },
  { name: 'Next Two People' },
  { name: 'Last Two People' }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function History() {
  return (
    <div className="xl:max-w-none mt-12 pb-8">
      <Tab.Group>
        <div className="mb-8 space-x-1">
          <Tab.List className="flex">
            {tabs.map((tab) => (
              <Tab key={tab.name} as="button" className={({ selected }) =>
                  classNames(
                    selected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500 hover:bg-gray-300',
                    'rounded-md px-3 py-2 text-sm font-medium mx-1'
                  )
                }>
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
        </div>
        <div className="mt-4">
          <Tab.Panels className="w-full">
            <Tab.Panel>
              <Table people={people.slice(0, 2)} />
            </Tab.Panel>
            <Tab.Panel>
              <Table people={people.slice(2, 4)} />
            </Tab.Panel>
            <Tab.Panel>
              <Table people={people.slice(4)} />
            </Tab.Panel>
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}

const Table = ({ people }) => (
  <div className="-m-1.5 overflow-x-auto">
    <div className="p-1.5 min-w-full inline-block align-middle">
      <div className={people.length > 5 ? "group border dark:border-gray-700 rounded-xl overflow-hidden max-h-[calc(2.5rem*6)] overflow-y-auto hover:border-emerald-500 dark:hover:border-emerald-500" : "group border dark:border-gray-700 rounded-xl overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500"}>
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 w-full">
          <thead className="text-gray-900 dark:text-white">
            <tr>
              <th scope="col" className="min-w-[25%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                Name
              </th>
              <th scope="col" className="min-w-[30%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                Title
              </th>
              <th scope="col" className="min-w-[30%] px-3 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                Email
              </th>
              <th scope="col" className="min-w-[15%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                Edit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-900 dark:text-gray-300">
            {people.map((person, index) => (
              <tr key={person.email}>
                <td className="px-3 py-4 text-sm font-medium">
                  {person.name}
                </td>
                <td className="px-3 py-4 text-sm">
                  {person.title}
                </td>
                <td className="px-3 py-4 text-sm">
                  {person.email}
                </td>
                <td className="px-3 py-4 text-left text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400">
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const IlluminatedTable = ({ people }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div className="-m-1.5 overflow-x-auto" onMouseMove={onMouseMove}>
      <div className="p-1.5 min-w-full inline-block align-middle">
        <div className={people.length > 5 ? "group border dark:border-gray-700 rounded-xl overflow-hidden max-h-[calc(2.5rem*6)] overflow-y-auto hover:border-emerald-500 dark:hover:border-emerald-500" : "group border dark:border-gray-700 rounded-xl overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500"}>

          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D7EDEA] to-[#F4FBDF] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#303428]"
            style={style}
          />

            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 w-full">
              <thead className="text-gray-900 dark:text-white">
                <tr>
                  <th scope="col" className="min-w-[25%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                    Name
                  </th>
                  <th scope="col" className="min-w-[30%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                    Title
                  </th>
                  <th scope="col" className="min-w-[30%] px-3 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                    Email
                  </th>
                  <th scope="col" className="min-w-[15%] px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase font-bold">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-900 dark:text-gray-300">
                {people.map((person, index) => (
                  <tr key={person.email}>
                    <td className="px-3 py-4 text-sm font-medium">
                      {person.name}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {person.title}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {person.email}
                    </td>
                    <td className="px-3 py-4 text-left text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400">
                        Edit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          
        </div>
      </div>
    </div>
  );
};
