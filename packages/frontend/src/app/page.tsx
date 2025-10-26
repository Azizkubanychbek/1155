import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Backpack Guilds
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              A gaming protocol on Xsolla ZK that enables temporary item usage rights, 
              party inventory sharing, and on-chain crafting for gaming guilds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/backpack">
                <Button size="lg">
                  Open App
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
            
            {/* Network Switcher */}
            <div className="mt-8">
              <NetworkSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Blockchain Gaming?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Traditional gaming limits item sharing and collaboration. 
              Backpack Guilds enables true ownership and flexible usage rights.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card title="Usage Rights" description="Temporary item sharing without transferring ownership">
              <div className="space-y-4">
                <div className="text-4xl">🔐</div>
                <p className="text-sm text-gray-600">
                  Grant temporary usage rights to guild members while maintaining ownership. 
                  Perfect for lending powerful items for specific quests or events.
                </p>
              </div>
            </Card>

            <Card title="Party Inventory" description="Shared inventory for guilds and parties">
              <div className="space-y-4">
                <div className="text-4xl">🎒</div>
                <p className="text-sm text-gray-600">
                  Pool resources with your guild members. Deposit items into a shared 
                  inventory that can be managed collectively for maximum efficiency.
                </p>
              </div>
            </Card>

            <Card title="On-Chain Crafting" description="Craft items using blockchain recipes">
              <div className="space-y-4">
                <div className="text-4xl">⚒️</div>
                <p className="text-sm text-gray-600">
                  Create powerful items by combining ingredients through verified recipes. 
                  All crafting is transparent and verifiable on-chain.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Architecture</h2>
            <p className="mt-4 text-lg text-gray-600">
              Modular protocol built on Xsolla ZK for gaming use cases
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Smart Contracts</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• UsageRights1155 - Temporary usage rights</li>
                    <li>• PartyBackpack - Shared inventory</li>
                    <li>• RecipeRegistry - On-chain crafting</li>
                    <li>• RentalEscrow - Secure rentals</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Frontend</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Next.js with TypeScript</li>
                    <li>• Wagmi for wallet integration</li>
                    <li>• TailwindCSS for styling</li>
                    <li>• Modular component system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start?</h2>
          <p className="mt-4 text-lg text-primary-100">
            Connect your wallet and start managing your guild's inventory today.
          </p>
          <div className="mt-8">
            <Link href="/backpack">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-gray-400">
              Built on Xsolla ZK • No gambling mechanics • Gaming use case
            </p>
            <p className="mt-2 text-sm text-gray-500">
              MIT License • Demo version
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
