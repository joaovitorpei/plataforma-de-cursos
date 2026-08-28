-- CreateTable
CREATE TABLE "Usuarios" (
    "ID_Usuario" SERIAL NOT NULL,
    "NomeCompleto" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "SenhaHash" TEXT NOT NULL,
    "DataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("ID_Usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_Email_key" ON "Usuarios"("Email");
