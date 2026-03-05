-- CreateTable
CREATE TABLE "Dumpster" (
    "id" SERIAL NOT NULL,
    "serial" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dumpster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rental" (
    "id" SERIAL NOT NULL,
    "dumpsterId" INTEGER NOT NULL,
    "cep" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dumpster_serial_key" ON "Dumpster"("serial");

-- CreateIndex
CREATE INDEX "Dumpster_serial_idx" ON "Dumpster"("serial");

-- CreateIndex
CREATE INDEX "Rental_dumpsterId_idx" ON "Rental"("dumpsterId");

-- CreateIndex
CREATE INDEX "Rental_endDate_idx" ON "Rental"("endDate");

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_dumpsterId_fkey" FOREIGN KEY ("dumpsterId") REFERENCES "Dumpster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
