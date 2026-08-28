-- CreateTable
CREATE TABLE "Aulas" (
    "ID_Aula" SERIAL NOT NULL,
    "ID_Modulo" INTEGER NOT NULL,
    "Titulo" TEXT NOT NULL,
    "TipoConteudo" TEXT NOT NULL,
    "URL_Conteudo" TEXT,
    "DuracaoMinutos" INTEGER,
    "Ordem" INTEGER NOT NULL,

    CONSTRAINT "Aulas_pkey" PRIMARY KEY ("ID_Aula")
);

-- AddForeignKey
ALTER TABLE "Aulas" ADD CONSTRAINT "Aulas_ID_Modulo_fkey" FOREIGN KEY ("ID_Modulo") REFERENCES "Modulos"("ID_Modulo") ON DELETE RESTRICT ON UPDATE CASCADE;
