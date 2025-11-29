import type { GroupItem, Prisma } from '@/generated/prisma/client';
import type { ParsedMessage } from '@/utils/types';

export type RuleWithGroup = Prisma.RuleGetPayload<{
  include: { group: { include: { items: true } } };
}>;

export type MessageWithGroupItem = ParsedMessage & {
  matchingGroupItem?: GroupItem | null;
};
