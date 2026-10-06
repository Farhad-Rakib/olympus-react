import { AuditLogPage, AuditLogQuery } from '../../domain/dto/audit-log.dto';

export interface IAuditLogService {
  query(query: AuditLogQuery): Promise<AuditLogPage>;
}
