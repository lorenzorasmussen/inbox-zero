import { AboutSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/AboutSetting';
import { DigestSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/DigestSetting';
import { DraftKnowledgeSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/DraftKnowledgeSetting';
import { DraftReplies } from '@/app/(app)/[emailAccountId]/assistant/settings/DraftReplies';
import { LearnedPatternsSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/LearnedPatternsSetting';
import { MultiRuleSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/MultiRuleSetting';
import { PersonalSignatureSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/PersonalSignatureSetting';
import { ReferralSignatureSetting } from '@/app/(app)/[emailAccountId]/assistant/settings/ReferralSignatureSetting';

export function SettingsTab() {
  return (
    <div className="space-y-2">
      <DraftReplies />
      <DraftKnowledgeSetting />
      <MultiRuleSetting />
      <AboutSetting />
      <DigestSetting />
      <PersonalSignatureSetting />
      <ReferralSignatureSetting />
      <LearnedPatternsSetting />
    </div>
  );
}
