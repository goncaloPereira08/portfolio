-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_id_thread_fkey";

-- DropForeignKey
ALTER TABLE "ThreadMember" DROP CONSTRAINT "ThreadMember_id_thread_fkey";

-- AddForeignKey
ALTER TABLE "ThreadMember" ADD CONSTRAINT "ThreadMember_id_thread_fkey" FOREIGN KEY ("id_thread") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_id_thread_fkey" FOREIGN KEY ("id_thread") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
