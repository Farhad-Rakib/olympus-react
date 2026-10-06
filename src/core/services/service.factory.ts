import { IAuthService } from './auth.service.interface';
import { IUserService } from './user.service.interface';
import { IDashboardService } from './dashboard.service.interface';
import { IMenuService } from './menu.service.interface';
import { INotificationService } from './notification.service.interface';
import { IAuditLogService } from './audit-log.service.interface';
import { AuthService } from './impl/auth.service';
import { UserService } from './impl/user.service';
import { DashboardService } from './impl/dashboard.service';
import { MenuService } from './impl/menu.service';
import { NotificationService } from './impl/notification.service';
import { AuditLogService } from './impl/audit-log.service';

class ServiceFactory {
  private authService: IAuthService | null = null;
  private userService: IUserService | null = null;
  private dashboardService: IDashboardService | null = null;
  private menuService: IMenuService | null = null;
  private notificationService: INotificationService | null = null;
  private auditLogService: IAuditLogService | null = null;

  getAuthService(): IAuthService {
    if (!this.authService) {
      this.authService = new AuthService();
    }
    return this.authService;
  }

  getUserService(): IUserService {
    if (!this.userService) {
      this.userService = new UserService();
    }
    return this.userService;
  }

  getDashboardService(): IDashboardService {
    if (!this.dashboardService) {
      this.dashboardService = new DashboardService();
    }
    return this.dashboardService;
  }

  getMenuService(): IMenuService {
    if (!this.menuService) {
      this.menuService = new MenuService();
    }
    return this.menuService;
  }

  getNotificationService(): INotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationService();
    }
    return this.notificationService;
  }

  getAuditLogService(): IAuditLogService {
    if (!this.auditLogService) {
      this.auditLogService = new AuditLogService();
    }
    return this.auditLogService;
  }
}

export const serviceFactory = new ServiceFactory();
