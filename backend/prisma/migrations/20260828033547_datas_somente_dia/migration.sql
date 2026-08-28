-- AlterTable
ALTER TABLE "Assinaturas" ALTER COLUMN "DataInicio" SET DATA TYPE DATE,
ALTER COLUMN "DataFim" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Avaliacoes" ALTER COLUMN "DataAvaliacao" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Certificados" ALTER COLUMN "DataEmissao" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Cursos" ALTER COLUMN "DataPublicacao" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Matriculas" ALTER COLUMN "DataMatricula" SET DATA TYPE DATE,
ALTER COLUMN "DataConclusao" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Pagamentos" ALTER COLUMN "DataPagamento" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Progresso_Aulas" ALTER COLUMN "DataConclusao" SET DATA TYPE DATE;
