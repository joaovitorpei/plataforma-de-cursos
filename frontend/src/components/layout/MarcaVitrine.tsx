/**
 * O símbolo da plataforma em tamanho grande, para o painel das telas de
 * acesso. É o mesmo capelo do ícone da aba (`public/favicon.svg`), desenhado
 * aqui em SVG para herdar as cores e escalar sem borrar.
 */
export function MarcaVitrine() {
  return (
    <div className="vitrine-marca">
      <svg
        viewBox="0 0 32 32"
        width="96"
        height="96"
        role="img"
        aria-label="EduCursos"
      >
        {/* o capelo */}
        <path d="M16 7 4 12.5 16 18l9-4.1v5.8h2V12.5L16 7Z" fill="#fff" />
        {/* a borla, em verde-claro para destacar do fundo */}
        <path
          d="M9 16.2v4.3c0 1.9 3.1 3.5 7 3.5s7-1.6 7-3.5v-4.3l-7 3.2-7-3.2Z"
          fill="#7fc4bb"
        />
      </svg>

      <p className="marca vitrine-nome">
        Edu<span>Cursos</span>
      </p>
    </div>
  );
}
