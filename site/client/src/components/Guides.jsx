import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
  {
    href: '/docs',
    name: 'Overview',
    description: 'Learn how zkp.services works',
  },
  {
    href: '/blueprint',
    name: 'Protocol Blueprint',
    description: 'Learn how zkp.services handles and transforms your data at each step with this in-depth\
                  explanation.',
  },
  {
    href: '/mfa',
    name: 'Multi-Factor Authentication',
    description: 'Read about how customizable multi-factor authentication can be enabled and discover\
                  zkp.services\' own trustless, entirely on-chain MFA provider.',
  },
  {
    href: '/api_docs',
    name: 'API Guide',
    description: 'Learn about our API for data providers of user data and how to select a custom\
                  data source.',
  },
  {
    href: '/dapp_guide',
    name: 'dApp Guide',
    description: 'Learn how to use our dApp with this easy to follow tutorial.',
  },
]

export function Guides() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="guides">
        Guides
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
