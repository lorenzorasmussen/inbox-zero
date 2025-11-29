import { AddRuleDialog } from '@/app/(app)/[emailAccountId]/assistant/AddRuleDialog';
import { Rules } from '@/app/(app)/[emailAccountId]/assistant/Rules';

export function RulesTab() {
  return (
    <div>
      <div className="flex items-center mb-2">
        <h3 className="font-title text-xl flex-1">Your inbox rules</h3>

        <AddRuleDialog />
      </div>
      <Rules showAddRuleButton={false} />
    </div>
  );
}
