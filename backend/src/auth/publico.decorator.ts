import { SetMetadata } from '@nestjs/common';

export const E_PUBLICO = 'ehPublico';

/**
 * Libera uma rota da exigência de token.
 *
 * Como o JwtAuthGuard é global (ver app.module.ts), por padrão TODA rota exige
 * login. Só duas fogem disso, e por um motivo prático: o cadastro e o login.
 * Sem elas seria impossível criar a primeira conta — para ter token é preciso
 * logar, e para logar é preciso ter conta.
 */
export const Publico = () => SetMetadata(E_PUBLICO, true);
