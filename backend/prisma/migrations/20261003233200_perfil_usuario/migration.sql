-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "Perfil" "Perfil" NOT NULL DEFAULT 'USER';
