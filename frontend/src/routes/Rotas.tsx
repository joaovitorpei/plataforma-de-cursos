import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { RotaProtegida } from '../auth/RotaProtegida';
import { Layout } from '../components/layout';
import {
  Assinaturas, AssinaturaForm,
  AulaForm, Aulas,
  AvaliacaoForm, Avaliacoes,
  Cadastrar,
  Categorias, CategoriaForm,
  CertificadoDetalhe, CertificadoForm, Certificados,
  CursoDetalhe, CursoForm, Cursos,
  Entrar,
  Inicio,
  Matriculas, MatriculaForm,
  ModuloForm, Modulos,
  NaoEncontrado,
  PagamentoForm, Pagamentos,
  PlanoForm, Planos,
  Progresso, ProgressoForm,
  TrilhaDetalhe, TrilhaForm, Trilhas,
  UsuarioForm, Usuarios,
} from '../pages';

export function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas — as duas únicas rotas que não exigem token. */}
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/cadastrar" element={<Cadastrar />} />

        {/* Protegidas */}
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Inicio />} />

            {/* Núcleo */}
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/usuarios/novo" element={<UsuarioForm />} />
            <Route path="/usuarios/:id/editar" element={<UsuarioForm />} />

            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/nova" element={<CategoriaForm />} />
            <Route path="/categorias/:id/editar" element={<CategoriaForm />} />

            {/* Conteúdo */}
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/cursos/novo" element={<CursoForm />} />
            <Route path="/cursos/:id" element={<CursoDetalhe />} />
            <Route path="/cursos/:id/editar" element={<CursoForm />} />

            <Route path="/modulos" element={<Modulos />} />
            <Route path="/modulos/novo" element={<ModuloForm />} />
            <Route path="/modulos/:id/editar" element={<ModuloForm />} />

            <Route path="/aulas" element={<Aulas />} />
            <Route path="/aulas/nova" element={<AulaForm />} />
            <Route path="/aulas/:id/editar" element={<AulaForm />} />

            {/* Interação */}
            <Route path="/matriculas" element={<Matriculas />} />
            <Route path="/matriculas/nova" element={<MatriculaForm />} />
            <Route path="/matriculas/:id/editar" element={<MatriculaForm />} />

            <Route path="/avaliacoes" element={<Avaliacoes />} />
            <Route path="/avaliacoes/nova" element={<AvaliacaoForm />} />
            <Route path="/avaliacoes/:id/editar" element={<AvaliacaoForm />} />

            {/* Chave composta: os dois ids vão na URL */}
            <Route path="/progresso" element={<Progresso />} />
            <Route path="/progresso/novo" element={<ProgressoForm />} />
            <Route path="/progresso/:idUsuario/:idAula/editar" element={<ProgressoForm />} />

            {/* Curadoria */}
            <Route path="/trilhas" element={<Trilhas />} />
            <Route path="/trilhas/nova" element={<TrilhaForm />} />
            <Route path="/trilhas/:id" element={<TrilhaDetalhe />} />
            <Route path="/trilhas/:id/editar" element={<TrilhaForm />} />

            <Route path="/certificados" element={<Certificados />} />
            <Route path="/certificados/novo" element={<CertificadoForm />} />
            <Route path="/certificados/:id" element={<CertificadoDetalhe />} />
            <Route path="/certificados/:id/editar" element={<CertificadoForm />} />

            {/* Negócio */}
            <Route path="/planos" element={<Planos />} />
            <Route path="/planos/novo" element={<PlanoForm />} />
            <Route path="/planos/:id/editar" element={<PlanoForm />} />

            <Route path="/assinaturas" element={<Assinaturas />} />
            <Route path="/assinaturas/nova" element={<AssinaturaForm />} />
            <Route path="/assinaturas/:id/editar" element={<AssinaturaForm />} />

            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/pagamentos/novo" element={<PagamentoForm />} />
            <Route path="/pagamentos/:id/editar" element={<PagamentoForm />} />

            <Route path="*" element={<NaoEncontrado />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
