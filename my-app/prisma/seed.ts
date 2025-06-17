import { PrismaClient, Prisma } from "../app/generated/prisma";
const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        name: "kenneth kimachia",
        email: "kimachiakenneth@gmail.com",
    }
];