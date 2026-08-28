-- CreateTable
CREATE TABLE "Matriculas" (
    "ID_Matricula" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "DataMatricula" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DataConclusao" TIMESTAMP(3),

    CONSTRAINT "Matriculas_pkey" PRIMARY KEY ("ID_Matricula")
);

-- AddForeignKey
ALTER TABLE "Matriculas" ADD CONSTRAINT "Matriculas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matriculas" ADD CONSTRAINT "Matriculas_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;
