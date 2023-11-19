import { Tab } from '@headlessui/react';

const tabs = [
  { name: 'New York' },
  { name: 'London' },
  { name: 'Sydney' },
];

const tableData = [
  {
    name: 'John Brown',
    age: 45,
    address: 'New York No. 1 Lake Park',
    tab: 'New York'
  },
  {
    name: 'Jim Green',
    age: 27,
    address: 'London No. 1 Lake Park',
    tab: 'London'
  },
  {
    name: 'Joe Black',
    age: 31,
    address: 'Sydney No. 1 Lake Park',
    tab: 'Sydney'
  },
  {
    name: 'Joe Black',
    age: 31,
    address: 'Sydney No. 1 Lake Park',
    tab: 'Sydney'
  },
  {
    name: 'Joe Black',
    age: 31,
    address: 'Sydney No. 1 Lake Park',
    tab: 'Sydney'
  },
  {
    name: 'Joe Black',
    age: 31,
    address: 'Sydney No. 1 Lake Park',
    tab: 'Sydney'
  },
];

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};


export function History() {
  return (
    <div className="xl:max-w-none mt-12 pb-8">
      <Tab.Group>
        <div className="mb-8 space-x-1">
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
        </div>
        <div className="mt-4">
          <Tab.Panels className="w-full overflow-x-auto">
            {tabs.map((tab, index) => (
              <Tab.Panel key={index}>
                <div className="p-1.5 min-w-full inline-block align-middle overflow-y-auto h-[200px]"> {/* Added vertical overflow styles here */}
                  <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                            Age
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs text-gray-500 uppercase">
                            Address
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {tableData.filter(data => data.tab === tab.name).map((filteredData, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                              {filteredData.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                              {filteredData.age}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                              {filteredData.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <a className="text-blue-500 hover:text-blue-700" href="#">
                                Delete
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </div>
      </Tab.Group>
    </div>
  );
}