-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('LABORATORIO', 'RAYOS_X', 'CONSULTA', 'ESPECIALIDAD', 'OTROS');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('BAJO', 'MEDIO', 'ALTO');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "roles" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" VARCHAR(500) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "zipCode" VARCHAR(20) NOT NULL,
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "totalBeds" INTEGER NOT NULL DEFAULT 1,
    "availableBeds" INTEGER NOT NULL DEFAULT 1,
    "status" "ClinicStatus" NOT NULL DEFAULT 'ACTIVE',
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicSchedule" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openingTime" VARCHAR(5) NOT NULL,
    "closingTime" VARCHAR(5) NOT NULL,
    "lunchStartTime" VARCHAR(5),
    "lunchEndTime" VARCHAR(5),
    "maxAppointmentsDay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClinicSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicService" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClinicService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ServiceType" NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "durationMin" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBattery" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "costTotal" DECIMAL(10,2),
    "durationMin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBattery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatteryItem" (
    "id" TEXT NOT NULL,
    "batteryId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BatteryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "rfc" VARCHAR(13),
    "description" TEXT,
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "zipCode" VARCHAR(10),
    "phoneNumber" VARCHAR(20),
    "email" VARCHAR(255),
    "contactPerson" VARCHAR(255),
    "contactPhone" VARCHAR(20),
    "isHeadquarters" BOOLEAN NOT NULL DEFAULT false,
    "maxEmployees" INTEGER NOT NULL DEFAULT 100,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyBattery" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "batteryId" TEXT NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBattery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobProfile" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIO',
    "requiredBatteryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" UUID,
    "updatedBy" UUID,

    CONSTRAINT "JobProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "tenantId" UUID NOT NULL,
    "clinicId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" VARCHAR(5) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentService" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "AppointmentService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- CreateIndex
CREATE INDEX "Clinic_tenantId_idx" ON "Clinic"("tenantId");

-- CreateIndex
CREATE INDEX "Clinic_status_idx" ON "Clinic"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_tenantId_name_key" ON "Clinic"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ClinicSchedule_clinicId_idx" ON "ClinicSchedule"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicSchedule_clinicId_dayOfWeek_key" ON "ClinicSchedule"("clinicId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicService_clinicId_serviceId_key" ON "ClinicService"("clinicId", "serviceId");

-- CreateIndex
CREATE INDEX "Service_tenantId_idx" ON "Service"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_tenantId_code_key" ON "Service"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ServiceBattery_tenantId_idx" ON "ServiceBattery"("tenantId");

-- CreateIndex
CREATE INDEX "BatteryItem_batteryId_idx" ON "BatteryItem"("batteryId");

-- CreateIndex
CREATE INDEX "Company_tenantId_idx" ON "Company"("tenantId");

-- CreateIndex
CREATE INDEX "Company_status_idx" ON "Company"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_rfc_key" ON "Company"("tenantId", "rfc");

-- CreateIndex
CREATE UNIQUE INDEX "Company_tenantId_name_key" ON "Company"("tenantId", "name");

-- CreateIndex
CREATE INDEX "CompanyBattery_companyId_idx" ON "CompanyBattery"("companyId");

-- CreateIndex
CREATE INDEX "CompanyBattery_batteryId_idx" ON "CompanyBattery"("batteryId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBattery_companyId_batteryId_key" ON "CompanyBattery"("companyId", "batteryId");

-- CreateIndex
CREATE INDEX "JobProfile_companyId_idx" ON "JobProfile"("companyId");

-- CreateIndex
CREATE INDEX "JobProfile_tenantId_idx" ON "JobProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "JobProfile_companyId_name_key" ON "JobProfile"("companyId", "name");

-- CreateIndex
CREATE INDEX "Appointment_tenantId_idx" ON "Appointment"("tenantId");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_idx" ON "Appointment"("clinicId");

-- CreateIndex
CREATE INDEX "Appointment_companyId_idx" ON "Appointment"("companyId");

-- CreateIndex
CREATE INDEX "Appointment_employeeId_idx" ON "Appointment"("employeeId");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentService_appointmentId_serviceId_key" ON "AppointmentService"("appointmentId", "serviceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicSchedule" ADD CONSTRAINT "ClinicSchedule_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicService" ADD CONSTRAINT "ClinicService_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicService" ADD CONSTRAINT "ClinicService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatteryItem" ADD CONSTRAINT "BatteryItem_batteryId_fkey" FOREIGN KEY ("batteryId") REFERENCES "ServiceBattery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatteryItem" ADD CONSTRAINT "BatteryItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyBattery" ADD CONSTRAINT "CompanyBattery_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProfile" ADD CONSTRAINT "JobProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
