import { BackpackList } from '@/components/BackpackList';
import { ItemFaucet } from '@/components/ItemFaucet';
import { NetworkSwitcher } from '@/components/NetworkSwitcher';

export default function BackpackPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <NetworkSwitcher />
      </div>
      <div className="mb-8">
        <ItemFaucet />
      </div>
      <BackpackList />
    </div>
  );
}
