import { Fragment } from 'react'
import { ArrowDownCircleIcon, ArrowPathIcon, ArrowUpCircleIcon } from '@heroicons/react/20/solid'
import { Heading } from '@/components/Heading'

const statuses = {
  Paid: 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900 ring-green-600/20',
  Withdraw: 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 ring-gray-500/10',
  Overdue: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900 ring-red-600/10',
};

const days = [
  {
    date: 'Today',
    dateTime: '2023-03-22',
    transactions: [
      {
        id: 1,
        invoiceNumber: '00012',
        href: '#',
        amount: '$7,600.00 USD',
        tax: '$500.00',
        status: 'Paid',
        client: 'Reform',
        description: 'Website redesign',
        icon: ArrowUpCircleIcon,
      },
      {
        id: 2,
        invoiceNumber: '00011',
        href: '#',
        amount: '$10,000.00 USD',
        status: 'Withdraw',
        client: 'Tom Cook',
        description: 'Salary',
        icon: ArrowDownCircleIcon,
      },
      {
        id: 3,
        invoiceNumber: '00009',
        href: '#',
        amount: '$2,000.00 USD',
        tax: '$130.00',
        status: 'Overdue',
        client: 'Tuple',
        description: 'Logo design',
        icon: ArrowPathIcon,
      },
    ],
  },
  {
    date: 'Yesterday',
    dateTime: '2023-03-21',
    transactions: [
      {
        id: 4,
        invoiceNumber: '00010',
        href: '#',
        amount: '$14,000.00 USD',
        tax: '$900.00',
        status: 'Paid',
        client: 'SavvyCal',
        description: 'Website redesign',
        icon: ArrowUpCircleIcon,
      },
    ],
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export function History() {
  return (
    <>
      <div className="xl:max-w-none mt-4">
        <div className="mx-auto max-w-full">
          <h2 id="history" className="mt-0 text-gray-900 dark:text-gray-50">
            Recent Activity
          </h2>
        </div>
        <div className="mt-6 overflow-hidden border-t dark:border-gray-700 w-full">
          <div className="mx-auto max-w-full w-full">
            <div className="mx-auto max-w-full lg:mx-0 lg:max-w-none w-full">
              <table className="w-full min-w-full text-left text-gray-900 dark:text-gray-50">
                <thead className="sr-only">
                  <tr>
                    <th className="pl-1">Amount</th>
                    <th className="hidden sm:table-cell">Client</th>
                    <th className="pr-1">More details</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <Fragment key={day.dateTime}>
                      <tr className="text-sm leading-6 text-gray-900 dark:text-gray-50">
                        <th scope="colgroup" colSpan={3} className="relative isolate py-2 font-semibold bg-gray-50 dark:bg-gray-800 pl-1 pr-1">
                          <time dateTime={day.dateTime}>{day.date}</time>
                          <div className="absolute inset-y-0 right-full -z-10 w-screen border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                          <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                        </th>
                      </tr>
                      {day.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="relative py-5 pr-6 pl-1">
                            <div className="flex gap-x-6">
                              {/* Your icon code */}
                              <div className="flex-auto">
                                <div className="flex items-start gap-x-3">
                                  <div className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-50">{transaction.amount}</div>
                                  <div
                                    className={classNames(
                                      statuses[transaction.status],
                                      'rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset'
                                    )}
                                  >
                                    {transaction.status}
                                  </div>
                                </div>
                                {transaction.tax ? (
                                  <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-300">{transaction.tax} tax</div>
                                ) : null}
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100 dark:bg-gray-700" />
                            <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100 dark:bg-gray-700" />
                          </td>
                          <td className="hidden py-5 pr-1 sm:table-cell">
                            <div className="text-sm leading-6 text-gray-900 dark:text-gray-50">{transaction.client}</div>
                            <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-300">{transaction.description}</div>
                          </td>
                          <td className="py-5 text-right pr-1">
                            <div className="flex justify-end">
                              <a
                                href={transaction.href}
                                className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                View<span className="hidden sm:inline"> transaction</span>
                                <span className="sr-only">
                                  , invoice #{transaction.invoiceNumber}, {transaction.client}
                                </span>
                              </a>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-300">
                              Invoice <span className="text-gray-900 dark:text-gray-50">#{transaction.invoiceNumber}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
};