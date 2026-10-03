import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../generated/prisma/enums';

export const PERFIS_EXIGIDOS = 'perfisExigidos';

/**
 * Restringe uma rota a determinados perfis.
 *
 *   @Perfis(Perfil.ADMIN)
 *   @Delete(':id')
 *   remove(...) { ... }
 *
 * Sem este decorator a rota vale para qualquer pessoa autenticada. Quem lê a
 * marcação é o PerfisGuard.
 */
export const Perfis = (...perfis: Perfil[]) =>
  SetMetadata(PERFIS_EXIGIDOS, perfis);
