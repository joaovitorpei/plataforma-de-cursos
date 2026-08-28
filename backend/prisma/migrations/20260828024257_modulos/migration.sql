-- CreateTable
CREATE TABLE "Modulos" (
    "ID_Modulo" SERIAL NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Modulos_pkey" PRIMARY KEY ("ID_Modulo")
);

-- AddForeignKey
ALTER TABLE "Modulos" ADD CONSTRAINT "Modulos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;
