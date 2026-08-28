-- CreateTable
CREATE TABLE "Cursos" (
    "ID_Curso" SERIAL NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Descricao" TEXT,
    "ID_Instrutor" INTEGER NOT NULL,
    "ID_Categoria" INTEGER NOT NULL,
    "Nivel" TEXT,
    "DataPublicacao" TIMESTAMP(3),
    "TotalAulas" INTEGER,
    "TotalHoras" INTEGER,

    CONSTRAINT "Cursos_pkey" PRIMARY KEY ("ID_Curso")
);

-- AddForeignKey
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_ID_Instrutor_fkey" FOREIGN KEY ("ID_Instrutor") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursos" ADD CONSTRAINT "Cursos_ID_Categoria_fkey" FOREIGN KEY ("ID_Categoria") REFERENCES "Categorias"("ID_Categoria") ON DELETE RESTRICT ON UPDATE CASCADE;
