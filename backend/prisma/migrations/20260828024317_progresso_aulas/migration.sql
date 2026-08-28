-- CreateTable
CREATE TABLE "Progresso_Aulas" (
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Aula" INTEGER NOT NULL,
    "DataConclusao" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Progresso_Aulas_pkey" PRIMARY KEY ("ID_Usuario","ID_Aula")
);

-- AddForeignKey
ALTER TABLE "Progresso_Aulas" ADD CONSTRAINT "Progresso_Aulas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progresso_Aulas" ADD CONSTRAINT "Progresso_Aulas_ID_Aula_fkey" FOREIGN KEY ("ID_Aula") REFERENCES "Aulas"("ID_Aula") ON DELETE RESTRICT ON UPDATE CASCADE;
