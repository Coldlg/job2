// Imports removed
import { PrismaClient } from "../generated/prisma";

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  console.log("Initializing Prisma Client with Accelerate URL:", url ? "Found" : "Missing");
  return new PrismaClient({
    accelerateUrl: url,
  });
};

const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
