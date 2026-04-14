// e2e/helpers/cleanup.ts
import * as mcClient from './mcClient';
import { getConfig } from './config';

const RESOURCES = [
  'prospects', 'contacts', 'leads', 'deals', 'organizations',
  'tasks', 'staffs', 'tickets', 'treatments', 'meetings',
  'pipelines', 'treatments/workspaces', 'customfields',
  'customfields/blocks', 'meetings/types', 'meetings/rooms',
  'treatments/types',
];

export async function deleteByIds(resource: string, ids: string[]): Promise<number> {
  let deleted = 0;
  for (const id of ids) {
    try {
      await mcClient.del(`/${resource}/${id}`);
      deleted++;
    } catch { /* record may already be deleted */ }
  }
  return deleted;
}

export async function sweepAll(): Promise<{ resource: string; deleted: number }[]> {
  const config = getConfig();
  const prefix = config.options.cleanupPrefix;
  const results: { resource: string; deleted: number }[] = [];

  for (const resource of RESOURCES) {
    try {
      const data = await mcClient.get(`/${resource}`, { search: prefix, limit: 100 });
      const docs = data?.docs || data?.data || (Array.isArray(data) ? data : []);
      const ids = docs
        .filter((d: any) => {
          const name = d.fullname || d.title || d.name || d.subject || '';
          return name.startsWith(prefix);
        })
        .map((d: any) => d._id);

      if (ids.length > 0) {
        const deleted = await deleteByIds(resource, ids);
        results.push({ resource, deleted });
      }
    } catch { /* resource may not support search */ }
  }

  return results;
}
