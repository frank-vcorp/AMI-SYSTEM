// API service for MOD-SERVICIOS
import { PrismaClient } from '@prisma/client';
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceResponse,
  ServiceListResponse,
  ServiceListFilters,
  CreateBatteryRequest,
  UpdateBatteryRequest,
  BatteryResponse,
  BatteryListResponse,
  BatteryListFilters,
  BatteryServiceDetail
} from '../types/service';
import {
  ServiceNotFoundError,
  ServiceAlreadyExistsError,
  BatteryNotFoundError,
  BatteryAlreadyExistsError,
  InvalidBatteryError
} from '../types/service';

export class ServiceService {
  constructor(private prisma: PrismaClient) {}

  // ========================================================================
  // SERVICE OPERATIONS
  // ========================================================================

  /**
   * Create a new service
   */
  async createService(tenantId: string, data: CreateServiceRequest, createdBy: string): Promise<ServiceResponse> {
    // Check if service code already exists in tenant
    const existing = await this.prisma.service.findFirst({
      where: {
        tenantId,
        code: data.code
      }
    });

    if (existing) {
      throw new ServiceAlreadyExistsError(data.code, tenantId);
    }

    const service = await this.prisma.service.create({
      data: {
        tenantId,
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        estimatedMinutes: data.estimatedMinutes || 30,
        requiresEquipment: data.requiresEquipment || false,
        equipmentName: data.equipmentName,
        costAmount: data.costAmount || 0,
        sellingPrice: data.sellingPrice,
        createdBy
      }
    });

    return service as ServiceResponse;
  }

  /**
   * Get single service with battery count
   */
  async getService(tenantId: string, serviceId: string): Promise<ServiceResponse> {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        tenantId
      }
    });

    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    const batterieCount = await this.prisma.batteryService.count({
      where: { serviceId }
    });

    return { ...service, batterieCount } as ServiceResponse;
  }

  /**
   * List services with filtering, search, and pagination
   */
  async listServices(filters: ServiceListFilters): Promise<ServiceListResponse> {
    const {
      tenantId,
      status,
      category,
      search,
      page = 1,
      pageSize = 10
    } = filters;

    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.service.count({ where })
    ]);

    return {
      data: services as ServiceResponse[],
      total,
      page,
      pageSize,
      hasMore: skip + services.length < total
    };
  }

  /**
   * Update service
   */
  async updateService(
    tenantId: string,
    serviceId: string,
    data: UpdateServiceRequest,
    updatedBy: string
  ): Promise<ServiceResponse> {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId }
    });

    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        ...data,
        updatedBy
      }
    });

    return updated as ServiceResponse;
  }

  /**
   * Delete service (soft delete via status)
   */
  async deleteService(tenantId: string, serviceId: string): Promise<void> {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, tenantId }
    });

    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    await this.prisma.service.update({
      where: { id: serviceId },
      data: { status: 'ARCHIVED' }
    });
  }

  // ========================================================================
  // BATTERY OPERATIONS
  // ========================================================================

  /**
   * Create a new battery (paquete de servicios)
   */
  async createBattery(
    tenantId: string,
    data: CreateBatteryRequest,
    createdBy: string
  ): Promise<BatteryResponse> {
    // Check if battery name already exists in tenant
    const existing = await this.prisma.battery.findFirst({
      where: {
        tenantId,
        name: data.name
      }
    });

    if (existing) {
      throw new BatteryAlreadyExistsError(data.name, tenantId);
    }

    // Validate services exist and belong to tenant
    if (data.serviceIds.length === 0) {
      throw new InvalidBatteryError('Battery must include at least one service');
    }

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: data.serviceIds },
        tenantId
      }
    });

    if (services.length !== data.serviceIds.length) {
      throw new InvalidBatteryError('Some services not found or do not belong to this tenant');
    }

    // Calculate total cost and time
    const costTotal = services.reduce((sum, s) => sum + s.costAmount, 0);
    const estimatedMinutes = services.reduce((sum, s) => sum + s.estimatedMinutes, 0);

    // Create battery with services
    const battery = await this.prisma.battery.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        costTotal,
        sellingPriceTotal: data.sellingPriceTotal || costTotal,
        estimatedMinutes,
        createdBy,
        services: {
          createMany: {
            data: data.serviceIds.map((serviceId, index) => ({
              serviceId,
              order: index
            }))
          }
        }
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    return this.mapBatteryResponse(battery);
  }

  /**
   * Get single battery with all services
   */
  async getBattery(tenantId: string, batteryId: string): Promise<BatteryResponse> {
    const battery = await this.prisma.battery.findFirst({
      where: {
        id: batteryId,
        tenantId
      },
      include: {
        services: {
          include: { service: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!battery) {
      throw new BatteryNotFoundError(batteryId);
    }

    return this.mapBatteryResponse(battery);
  }

  /**
   * List batteries with filtering and pagination
   */
  async listBatteries(filters: BatteryListFilters): Promise<BatteryListResponse> {
    const {
      tenantId,
      status,
      search,
      page = 1,
      pageSize = 10
    } = filters;

    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [batteries, total] = await Promise.all([
      this.prisma.battery.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          services: {
            include: { service: true },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.battery.count({ where })
    ]);

    return {
      data: batteries.map(b => this.mapBatteryResponse(b)),
      total,
      page,
      pageSize,
      hasMore: skip + batteries.length < total
    };
  }

  /**
   * Update battery (name, description, services, price)
   */
  async updateBattery(
    tenantId: string,
    batteryId: string,
    data: UpdateBatteryRequest,
    updatedBy: string
  ): Promise<BatteryResponse> {
    const battery = await this.prisma.battery.findFirst({
      where: { id: batteryId, tenantId }
    });

    if (!battery) {
      throw new BatteryNotFoundError(batteryId);
    }

    // If updating services, recalculate cost and time
    if (data.serviceIds) {
      if (data.serviceIds.length === 0) {
        throw new InvalidBatteryError('Battery must include at least one service');
      }

      const services = await this.prisma.service.findMany({
        where: {
          id: { in: data.serviceIds },
          tenantId
        }
      });

      if (services.length !== data.serviceIds.length) {
        throw new InvalidBatteryError('Some services not found or do not belong to this tenant');
      }

      // Delete old relationships and create new ones
      await this.prisma.batteryService.deleteMany({
        where: { batteryId }
      });

      // Recalculate costs
      const costTotal = services.reduce((sum, s) => sum + s.costAmount, 0);
      const estimatedMinutes = services.reduce((sum, s) => sum + s.estimatedMinutes, 0);

      // Create new relationships
      await this.prisma.batteryService.createMany({
        data: data.serviceIds.map((serviceId, index) => ({
          batteryId,
          serviceId,
          order: index
        }))
      });

      // Update battery with new costs
      const updated = await this.prisma.battery.update({
        where: { id: batteryId },
        data: {
          costTotal,
          estimatedMinutes,
          sellingPriceTotal: data.sellingPriceTotal || costTotal,
          updatedBy
        },
        include: {
          services: {
            include: { service: true },
            orderBy: { order: 'asc' }
          }
        }
      });

      return this.mapBatteryResponse(updated);
    }

    // Update only name, description, selling price
    const updated = await this.prisma.battery.update({
      where: { id: batteryId },
      data: {
        name: data.name || battery.name,
        description: data.description !== undefined ? data.description : battery.description,
        sellingPriceTotal: data.sellingPriceTotal || battery.sellingPriceTotal,
        status: data.status || battery.status,
        updatedBy
      },
      include: {
        services: {
          include: { service: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    return this.mapBatteryResponse(updated);
  }

  /**
   * Delete battery (soft delete via status)
   */
  async deleteBattery(tenantId: string, batteryId: string): Promise<void> {
    const battery = await this.prisma.battery.findFirst({
      where: { id: batteryId, tenantId }
    });

    if (!battery) {
      throw new BatteryNotFoundError(batteryId);
    }

    await this.prisma.battery.update({
      where: { id: batteryId },
      data: { status: 'ARCHIVED' }
    });
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private mapBatteryResponse(battery: any): BatteryResponse {
    return {
      ...battery,
      services: battery.services.map((bs: any) => ({
        id: bs.id,
        service: bs.service,
        order: bs.order,
        costOverride: bs.costOverride,
        estimatedMinutesOverride: bs.estimatedMinutesOverride
      })) as BatteryServiceDetail[],
      serviceCount: battery.services.length
    };
  }
}
