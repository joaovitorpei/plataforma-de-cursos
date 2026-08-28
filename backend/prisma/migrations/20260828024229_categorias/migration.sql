-- CreateTable
CREATE TABLE "Categorias" (
    "ID_Categoria" SERIAL NOT NULL,
    "Nome" TEXT NOT NULL,
    "Descricao" TEXT,

    CONSTRAINT "Categorias_pkey" PRIMARY KEY ("ID_Categoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_Nome_key" ON "Categorias"("Nome");
