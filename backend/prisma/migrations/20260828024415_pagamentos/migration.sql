-- CreateTable
CREATE TABLE "Pagamentos" (
    "ID_Pagamento" SERIAL NOT NULL,
    "ID_Assinatura" INTEGER NOT NULL,
    "ValorPago" DECIMAL(65,30) NOT NULL,
    "DataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "MetodoPagamento" TEXT NOT NULL,
    "Id_Transacao_Gateway" TEXT NOT NULL,

    CONSTRAINT "Pagamentos_pkey" PRIMARY KEY ("ID_Pagamento")
);

-- AddForeignKey
ALTER TABLE "Pagamentos" ADD CONSTRAINT "Pagamentos_ID_Assinatura_fkey" FOREIGN KEY ("ID_Assinatura") REFERENCES "Assinaturas"("ID_Assinatura") ON DELETE RESTRICT ON UPDATE CASCADE;
