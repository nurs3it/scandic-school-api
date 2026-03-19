-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "parentName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
