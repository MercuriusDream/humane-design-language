import type { ComponentType } from 'react';

// Every file in this folder named after a rule's slug is that rule's example.
const modules = import.meta.glob<{ default: ComponentType }>('./*.tsx', { eager: true });

export const EXAMPLES: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(modules).map(([path, module]) => [path.replace(/^\.\/|\.tsx$/g, ''), module.default]),
);
