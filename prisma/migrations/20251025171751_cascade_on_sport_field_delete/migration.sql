-- DropForeignKey
ALTER TABLE "FieldSport" DROP CONSTRAINT "FieldSport_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldSport" DROP CONSTRAINT "FieldSport_sportId_fkey";

-- AddForeignKey
ALTER TABLE "FieldSport" ADD CONSTRAINT "FieldSport_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldSport" ADD CONSTRAINT "FieldSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
