-- CreateTable
CREATE TABLE "Avaliacoes" (
    "ID_Avaliacao" SERIAL NOT NULL,
    "ID_Usuario" INTEGER NOT NULL,
    "ID_Curso" INTEGER NOT NULL,
    "Nota" INTEGER NOT NULL,
    "Comentario" TEXT,
    "DataAvaliacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacoes_pkey" PRIMARY KEY ("ID_Avaliacao")
);

-- AddForeignKey
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_ID_Usuario_fkey" FOREIGN KEY ("ID_Usuario") REFERENCES "Usuarios"("ID_Usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacoes" ADD CONSTRAINT "Avaliacoes_ID_Curso_fkey" FOREIGN KEY ("ID_Curso") REFERENCES "Cursos"("ID_Curso") ON DELETE RESTRICT ON UPDATE CASCADE;
