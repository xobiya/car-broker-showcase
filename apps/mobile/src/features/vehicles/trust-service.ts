import { request } from '../../services/api-client';
export const trustService = {
  reportListing: (body: { reporter_name: string; target_type: 'listing'; target_id: string; reason: string; description?: string }) => request('/api/reports', { method: 'POST', json: body }),
};
