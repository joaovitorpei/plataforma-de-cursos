-- CreateTable
CREATE TABLE "Certificados" (
    "ID_Certificado" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "ID_Trilha" INTEGER,
    "CodigoVerificacao" TEXT NOT NULL,
    "DataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificados_pkey" PRIMARY KEY ("ID_Certificado")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificados_CodigoVerificacao_key" ON "Certificados"("CodigoVerificacao");

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificados" ADD CONSTRAINT "Certificados_ID_Trilha_fkey" FOREIGN KEY ("ID_Trilha") REFERENCES "Trilhas"("ID_Trilha") ON DELETE SET NULL ON UPDATE CASCADE;
