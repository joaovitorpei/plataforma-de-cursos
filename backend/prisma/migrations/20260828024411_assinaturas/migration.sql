-- CreateTable
CREATE TABLE "Assinaturas" (
    "ID_Assinatura" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Plano" INTEGER NOT NULL,
    "DataInicio" TIMESTAMP(3) NOT NULL,
    "DataFim" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assinaturas_pkey" PRIMARY KEY ("ID_Assinatura")
);

-- AddForeignKey
ALTER TABLE "Assinaturas" ADD CONSTRAINT "Assinaturas_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinaturas" ADD CONSTRAINT "Assinaturas_ID_Plano_fkey" FOREIGN KEY ("ID_Plano") REFERENCES "Planos"("ID_Plano") ON DELETE RESTRICT ON UPDATE CASCADE;
