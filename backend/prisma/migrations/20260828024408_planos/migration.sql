-- CreateTable
CREATE TABLE "Planos" (
    "ID_Plano" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,
    "Preco" DECIMAL(65,30) NOT NULL,
    "DuracaoMeses" INTEGER NOT NULL,

    CONSTRAINT "Planos_pkey" PRIMARY KEY ("ID_Plano")
);
