import type { ComponentType } from 'react';

// Every PascalCase file in this folder documents the system component of the same name.
const modules = import.meta.glob<{ default: ComponentType }>('./*.tsx', { eager: true });

export const SYSTEM_DOCS: { name: string; Doc: ComponentType }[] = Object.entries(modules)
  .map(([path, module]) => ({ name: path.replace(/^\.\/|\.tsx$/g, ''), Doc: module.default }))
  .sort((a, b) => a.name.localeCompare(b.name));
