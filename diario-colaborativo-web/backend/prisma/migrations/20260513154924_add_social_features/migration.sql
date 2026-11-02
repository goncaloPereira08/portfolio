/*
  Warnings:

  - You are about to drop the column `media_url` on the `Memory` table. All the data in the column will be lost.
  - The primary key for the `ThreadMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `data_adesao` on the `ThreadMember` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MemoryToTag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_thread,id_utilizador]` on the table `ThreadMember` will be added. If there are existing duplicate values, this will fail.
  - Made the column `texto` on table `Memory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_id_thread_fkey";

-- DropForeignKey
ALTER TABLE "ThreadMember" DROP CONSTRAINT "ThreadMember_id_thread_fkey";

-- DropForeignKey
ALTER TABLE "_MemoryToTag" DROP CONSTRAINT "_MemoryToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_MemoryToTag" DROP CONSTRAINT "_MemoryToTag_B_fkey";

-- AlterTable
ALTER TABLE "Memory" DROP COLUMN "media_url",
ADD COLUMN     "anexo_url" TEXT,
ADD COLUMN     "tipo_anexo" TEXT,
ALTER COLUMN "texto" SET NOT NULL;

-- AlterTable
ALTER TABLE "ThreadMember" DROP CONSTRAINT "ThreadMember_pkey",
DROP COLUMN "data_adesao",
ADD COLUMN     "adicionado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "cargo" SET DEFAULT 'MEMBER',
ADD CONSTRAINT "ThreadMember_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "foto_perfil" TEXT;

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "_MemoryToTag";

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_memory" INTEGER NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER NOT NULL,
    "id_memory" INTEGER NOT NULL,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_id_user_id_memory_key" ON "Like"("id_user", "id_memory");

-- CreateIndex
CREATE UNIQUE INDEX "ThreadMember_id_thread_id_utilizador_key" ON "ThreadMember"("id_thread", "id_utilizador");

-- AddForeignKey
ALTER TABLE "ThreadMember" ADD CONSTRAINT "ThreadMember_id_thread_fkey" FOREIGN KEY ("id_thread") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_id_thread_fkey" FOREIGN KEY ("id_thread") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_id_memory_fkey" FOREIGN KEY ("id_memory") REFERENCES "Memory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_id_memory_fkey" FOREIGN KEY ("id_memory") REFERENCES "Memory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
