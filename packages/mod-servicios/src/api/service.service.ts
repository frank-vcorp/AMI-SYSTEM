// API service for MOD-SERVICIOS
import { PrismaClient } from '@ami/core';
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
  BatteryService
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
  async createService(tenantId: string, data: CreateServiceRequest, _createdBy: string): Promise<ServiceResponse> {
    // Check if service code already exists in tenant
    const existing = await this.prisma.service.findFirst({
      where: {
        tenantId,
        code: data.code
      }
    });

    if (existing) {
      throw new ServiceAlreadyExistsError(data.code);
    }

    const service = await this.prisma.service.create({
      data: {
        tenantId,
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        durationMin: data.durationMin || 30,
        // requiresEquipment: data.requiresEquipment || false, // Not in Schema V2
        // equipmentName: data.equipmentName,
        costPrice: data.costPrice || 0,
        basePrice: data.basePrice
        // createdBy // Not in Schema V2
      }
    });

    return service as unknown as ServiceResponse;
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

    // Check usage in batteries
    const batteryCount = await this.prisma.batteryItem.count({
      where: { serviceId }
    });

    return { ...service, batteryCount } as unknown as ServiceResponse;
  }

  /**
   * List services with filtering, search, and pagination
   */
  async listServices(filters: ServiceListFilters): Promise<ServiceListResponse> {
    const {
      tenantId,
      status,
      type,
      search,
      page = 1,
      pageSize = 10
    } = filters;

    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }
    if (type) where.type = type;
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
      data: services as unknown as ServiceResponse[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Update service
   */
  async updateService(
    tenantId: string,
    serviceId: string,
    data: UpdateServiceRequest,
    _updatedBy: string
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
        ...data
        // updatedBy 
      }
    });

    return updated as unknown as ServiceResponse;
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
    _createdBy: string
  ): Promise<BatteryResponse> {
    // Check if battery name already exists in tenant
    const existing = await this.prisma.serviceBattery.findFirst({
      where: {
        tenantId,
        name: data.name
      }
    });

    if (existing) {
      throw new BatteryAlreadyExistsError(data.name);
    }

    // Validate services exist and belong to tenant
    if (data.services.length === 0) {
      throw new InvalidBatteryError('Battery must include at least one service');
    }

    const serviceIds = data.services.map(s => s.serviceId);
    const dbServices = await this.prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        tenantId
      }
    });

    if (dbServices.length !== serviceIds.length) {
      throw new InvalidBatteryError('Some services not found or do not belong to this tenant');
    }

    // Calculate total cost and time
    let costTotal = 0;
    let durationMin = 0;

    data.services.forEach(item => {
      const service = dbServices.find(s => s.id === item.serviceId);
      if (service) {
        const qty = item.quantity || 1;
        const cost = service.costPrice ? Number(service.costPrice) : 0;
        costTotal += cost * qty;
        durationMin += service.durationMin * qty;
      }
    });

    // Create battery with services
    const battery = await this.prisma.serviceBattery.create({
      data: {
        tenantId,
        name: data.name,
        description: data.description,
        totalPrice: data.totalPrice,
        costTotal,
        durationMin,
        services: {
          createMany: {
            data: data.services.map(item => ({
              serviceId: item.serviceId,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice
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
    const battery = await this.prisma.serviceBattery.findFirst({
      where: {
        id: batteryId,
        tenantId
      },
      include: {
        services: {
          include: { service: true }
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
    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'ARCHIVED' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [batteries, total] = await Promise.all([
      this.prisma.serviceBattery.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          services: {
            include: { service: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.serviceBattery.count({ where })
    ]);

    return {
      data: batteries.map(b => this.mapBatteryResponse(b)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * Update battery (name, description, services, price)
   */
  async updateBattery(
    tenantId: string,
    batteryId: string,
    data: UpdateBatteryRequest,
    _updatedBy: string
  ): Promise<BatteryResponse> {
    const battery = await this.prisma.serviceBattery.findFirst({
      where: { id: batteryId, tenantId }
    });

    if (!battery) {
      throw new BatteryNotFoundError(batteryId);
    }

    // If updating services, recalculate cost and time
    if (data.services) {
      if (data.services.length === 0) {
        throw new InvalidBatteryError('Battery must include at least one service');
      }

      const serviceIds = data.services.map(s => s.serviceId);
      const services = await this.prisma.service.findMany({
        where: {
          id: { in: serviceIds },
          tenantId
        }
      });

      if (services.length !== serviceIds.length) {
        throw new InvalidBatteryError('Some services not found or do not belong to this tenant');
      }

      // Delete old relationships
      await this.prisma.batteryItem.deleteMany({
        where: { batteryId }
      });

      // Recalculate costs
      let costTotal = 0;
      let durationMin = 0;
      data.services.forEach(item => {
        const service = services.find(s => s.id === item.serviceId);
        if (service) {
           const qty = item.quantity || 1;
           const cost = service.costPrice ? Number(service.costPrice) : 0;
           costTotal += cost * qty;
           durationMin += service.durationMin * qty;
        }
      });

      // Create new relationships
      await this.prisma.batteryItem.createMany({
        data: data.services.map(item => ({
          batteryId,
          serviceId: item.serviceId,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice
        }))
      });

      // Update battery with new costs
      const updated = await this.prisma.serviceBattery.update({
        where: { id: batteryId },
        data: {
          name: data.name,
          description: data.description,
          status: data.status,
          totalPrice: data.totalPrice,
          costTotal,
          durationMin
        },
        include: {
          services: { include: { service: true } }
        }
      });
      return this.mapBatteryResponse(updated);
    }
    
    // Just update Basic Info
    const updated = await this.prisma.serviceBattery.update({
      where: { id: batteryId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        totalPrice: data.totalPrice,
      },
      include: {
        services: { include: { service: true } }
      }
    });

    return this.mapBatteryResponse(updated);
  }

  /**
   * Delete battery (soft delete via status)
   */
  async deleteBattery(tenantId: string, batteryId: string): Promise<void> {
    const battery = await this.prisma.serviceBattery.findFirst({
      where: { id: batteryId, tenantId }
    });

    if (!battery) {
      throw new BatteryNotFoundError(batteryId);
    }

    await this.prisma.serviceBattery.update({
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
        batteryId: bs.batteryId,
        serviceId: bs.serviceId,
        quantity: bs.quantity,
        unitPrice: bs.unitPrice,
        service: bs.service
      })) as unknown as BatteryService[],
      serviceCount: battery.services.length
    } as unknown as BatteryResponse;
  }
}
