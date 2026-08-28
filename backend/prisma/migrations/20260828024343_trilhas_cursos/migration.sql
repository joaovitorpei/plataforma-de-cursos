-- CreateTable
CREATE TABLE "Trilhas_Cursos" (
    "ID_Trilha" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Trilhas_Cursos_pkey" PRIMARY KEY ("ID_Trilha","ID_Curso")
);

-- AddForeignKey
ALTER TABLE "Trilhas_Cursos" ADD CONSTRAINT "Trilhas_Cursos_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas"("ID_Trilha") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trilhas_Cursos" ADD CONSTRAINT "Trilhas_Cursos_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;
