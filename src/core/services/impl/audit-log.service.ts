import { BaseRepository } from '../../api/base.repository';
import { AuditLogPage, AuditLogQuery, GetAuditLogsApiResponse } from '../../../domain/dto/audit-log.dto';
import { IAuditLogService } from '../audit-log.service.interface';

export class AuditLogService extends BaseRepository implements IAuditLogService {
  constructor() {
    super('/Audit');
  }

  async query(query: AuditLogQuery): Promise<AuditLogPage> {
    const response = await this.get<GetAuditLogsApiResponse>('', { params: query });
    if (!response.success) {
      throw new Error(response.message || 'Failed to load audit logs');
    }
    return response.data;
  }
}
