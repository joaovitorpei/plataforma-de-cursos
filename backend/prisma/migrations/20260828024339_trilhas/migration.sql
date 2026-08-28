-- CreateTable
CREATE TABLE "Trilhas" (
    "ID_Trilha" SERIAL NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT,
    "ID_Categoria" INTEGER NOT NULL,

    CONSTRAINT "Trilhas_pkey" PRIMARY KEY ("ID_Trilha")
);

-- AddForeignKey
ALTER TABLE "Trilhas" ADD CONSTRAINT "Trilhas_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias"("ID_Categoria") ON DELETE RESTRICT ON UPDATE CASCADE;
