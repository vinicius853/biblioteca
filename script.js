const livrosIniciais = [
  {
    id: 7,
    titulo: "O Agir Invisível de Deus",
    autor: "Autor não identificado",
    categoria: "Cristão",
    resumo: "Ensina sobre como Deus age de forma invisível e conduz ao amadurecimento espiritual.",
    disponivel: true,
    capa: "agir.jpeg"
  },
  {
    id: 8,
    titulo: "Educação: Libertação ou Submissão?",
    autor: "Leontino Farias dos Santos",
    categoria: "Educação Cristã",
    resumo: "Reflexão sobre o papel da educação na formação cristã e sua influência ideológica.",
    disponivel: true,
    capa: "educa.jpeg"
  },
  {
    id: 9,
    titulo: "Derrubando Golias",
    autor: "Max Lucado",
    categoria: "Cristão",
    resumo: "Como enfrentar desafios da vida com fé, coragem e confiança em Deus.",
    disponivel: true,
    capa: "golias.jpeg"
  },
  {
    id: 10,
    titulo: "Jesus, o Maior Psicólogo que Já Existiu",
    autor: "Mark W. Baker",
    categoria: "Psicologia Cristã",
    resumo: "Aplicação dos ensinamentos de Jesus para saúde emocional e resolução de problemas.",
    disponivel: true,
    capa: "jesus.jpeg"
  },
  {
    id: 11,
    titulo: "Milagre no Rio Kwai",
    autor: "Ernest Gordon",
    categoria: "Testemunho",
    resumo: "História real de transformação espiritual em meio ao sofrimento da guerra.",
    disponivel: true,
    capa: "milagre.jpeg"
  },
  {
    id: 12,
    titulo: "Perguntas Frequentes Sobre as Profecias",
    autor: "Arno Froese",
    categoria: "Profecias",
    resumo: "Explica de forma simples dúvidas sobre profecias bíblicas.",
    disponivel: true,
    capa: "perguntas.jpeg"
  }
];

const buscaEl = document.getElementById("busca");
const categoriaEl = document.getElementById("categoria");
const listaLivrosEl = document.getElementById("listaLivros");
const listaCarrinhoEl = document.getElementById("listaCarrinho");
const totalCarrinhoEl = document.getElementById("totalCarrinho");
const totalCatalogoEl = document.getElementById("totalCatalogo");
const totalCarrinhoTopoEl = document.getElementById("totalCarrinhoTopo");
const totalLocacoesTopoEl = document.getElementById("totalLocacoesTopo");
const nomeLeitorEl = document.getElementById("nomeLeitor");
const emailLeitorEl = document.getElementById("emailLeitor");
const telefoneLeitorEl = document.getElementById("telefoneLeitor");
const btnFinalizarEl = document.getElementById("btnFinalizar");
const alertSuccessEl = document.getElementById("alertSuccess");
const areaComprovantesEl = document.getElementById("areaComprovantes");
const comprovanteLeitorEl = document.getElementById("comprovanteLeitor");
const comprovanteSistemaEl = document.getElementById("comprovanteSistema");
const btnImprimirEl = document.getElementById("btnImprimir");
const btnLimparComprovanteEl = document.getElementById("btnLimparComprovante");
const listaHistoricoEl = document.getElementById("listaHistorico");

let carrinho = JSON.parse(localStorage.getItem("leituraagape-html-carrinho")) || [];
let comprovante = JSON.parse(localStorage.getItem("leituraagape-html-comprovante")) || null;
let locacoes = JSON.parse(localStorage.getItem("leituraagape-html-locacoes")) || [];

function salvarDados() {
  localStorage.setItem("leituraagape-html-carrinho", JSON.stringify(carrinho));
  localStorage.setItem("leituraagape-html-comprovante", JSON.stringify(comprovante));
  localStorage.setItem("leituraagape-html-locacoes", JSON.stringify(locacoes));
}

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function adicionarDias(data, dias) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + Number(dias || 0));
  return novaData;
}

function gerarProtocolo() {
  return "AGP-" + Date.now().toString().slice(-6);
}

function mostrarMensagem(texto) {
  alertSuccessEl.textContent = texto;
  alertSuccessEl.style.display = "block";

  setTimeout(() => {
    alertSuccessEl.style.display = "none";
  }, 4000);
}

function preencherCategorias() {
  const categorias = ["Todas", ...new Set(livrosIniciais.map((livro) => livro.categoria))];

  categoriaEl.innerHTML = categorias
    .map((categoria) => `<option value="${categoria}">${categoria}</option>`)
    .join("");
}

function obterLivrosFiltrados() {
  const busca = buscaEl.value.toLowerCase();
  const categoria = categoriaEl.value;

  return livrosIniciais.filter((livro) => {
    const texto = `${livro.titulo} ${livro.autor} ${livro.categoria}`.toLowerCase();
    const atendeBusca = texto.includes(busca);
    const atendeCategoria = categoria === "Todas" || livro.categoria === categoria;
    return atendeBusca && atendeCategoria;
  });
}

function adicionarAoCarrinho(idLivro) {
  const livro = livrosIniciais.find((item) => item.id === idLivro);
  const existente = carrinho.find((item) => item.id === idLivro);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push({
      id: livro.id,
      titulo: livro.titulo,
      autor: livro.autor,
      capa: livro.capa,
      quantidade: 1,
      dias: 7,
    });
  }

  salvarDados();
  renderizarTudo();
}

function atualizarCarrinho(id, campo, valor) {
  carrinho = carrinho.map((item) =>
    item.id === id ? { ...item, [campo]: Number(valor) } : item
  );

  salvarDados();
  renderizarTudo();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter((item) => item.id !== id);

  salvarDados();
  renderizarTudo();
}

function finalizarLocacao() {
  const nome = nomeLeitorEl.value.trim();
  const email = emailLeitorEl.value.trim();
  const telefone = telefoneLeitorEl.value.trim();

  if (!nome || !telefone || carrinho.length === 0) {
    alert("Preencha nome, telefone e adicione pelo menos um livro.");
    return;
  }

  const hoje = new Date();

  const itens = carrinho.map((item) => ({
    ...item,
    retirada: formatarData(hoje),
    devolucao: formatarData(adicionarDias(hoje, item.dias)),
  }));

  comprovante = {
    protocolo: gerarProtocolo(),
    data: formatarData(hoje),
    leitor: { nome, email, telefone },
    itens,
    totalLivros: carrinho.reduce((acc, item) => acc + item.quantidade, 0),
    criadoEm: new Date().toLocaleString("pt-BR"),
    sistema: "Leitura Ágape",
    local: "Igreja Menonita Ágape",
  };

  locacoes.unshift(comprovante);
  carrinho = [];

  nomeLeitorEl.value = "";
  emailLeitorEl.value = "";
  telefoneLeitorEl.value = "";

  salvarDados();
  renderizarTudo();
  mostrarMensagem("Locação registrada com sucesso!");
}

function limparComprovante() {
  comprovante = null;
  salvarDados();
  renderizarTudo();
}

function renderizarLivros() {
  const livros = obterLivrosFiltrados();

  listaLivrosEl.innerHTML = livros
    .map(
      (livro) => `
        <div class="book-card">
          <img src="${livro.capa}" alt="${livro.titulo}">
          <div class="book-content">
            <div class="badge">${livro.categoria}</div>
            <h3 class="book-title">${livro.titulo}</h3>
            <p class="text">Autor: ${livro.autor}</p>
            <p class="text">${livro.resumo}</p>
            <p class="available">${livro.disponivel ? "Disponível" : "Indisponível"}</p>
            <button class="btn btn-primary" onclick="adicionarAoCarrinho(${livro.id})">
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderizarCarrinho() {
  const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  totalCarrinhoEl.textContent = total;
  totalCarrinhoTopoEl.textContent = total;

  if (carrinho.length === 0) {
    listaCarrinhoEl.innerHTML = `<p class="empty">Nenhum livro adicionado.</p>`;
    return;
  }

  listaCarrinhoEl.innerHTML = carrinho
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-top">
            <img src="${item.capa}" alt="${item.titulo}">
            <div>
              <h3 class="book-title">${item.titulo}</h3>
              <p class="text">Autor: ${item.autor}</p>
            </div>
          </div>

          <label class="label">
            Quantidade
            <input type="number" min="1" value="${item.quantidade}" onchange="atualizarCarrinho(${item.id}, 'quantidade', this.value)">
          </label>

          <label class="label">
            Dias de aluguel
            <input type="number" min="1" value="${item.dias}" onchange="atualizarCarrinho(${item.id}, 'dias', this.value)">
          </label>

          <p class="return-date">
            Data prevista de devolução: ${formatarData(adicionarDias(new Date(), item.dias))}
          </p>

          <button class="btn btn-danger" onclick="removerDoCarrinho(${item.id})">Remover</button>
        </div>
      `
    )
    .join("");
}

function renderizarComprovante() {
  if (!comprovante) {
    areaComprovantesEl.style.display = "none";
    return;
  }

  areaComprovantesEl.style.display = "block";

  comprovanteLeitorEl.innerHTML = `
    <h2>Comprovante do leitor</h2>
    <p class="text"><strong>Sistema:</strong> ${comprovante.sistema}</p>
    <p class="text"><strong>Local:</strong> ${comprovante.local}</p>
    <p class="text"><strong>Protocolo:</strong> ${comprovante.protocolo}</p>
    <p class="text"><strong>Data:</strong> ${comprovante.data}</p>
    <p class="text"><strong>Nome:</strong> ${comprovante.leitor.nome}</p>
    <p class="text"><strong>E-mail:</strong> ${comprovante.leitor.email || "Não informado"}</p>
    <p class="text"><strong>Telefone:</strong> ${comprovante.leitor.telefone}</p>
    <h3>Livros alugados</h3>
    ${comprovante.itens
      .map(
        (item) => `
          <div class="receipt-item">
            <p class="text"><strong>Livro:</strong> ${item.titulo}</p>
            <p class="text"><strong>Quantidade:</strong> ${item.quantidade}</p>
            <p class="text"><strong>Dias:</strong> ${item.dias}</p>
            <p class="text"><strong>Retirada:</strong> ${item.retirada}</p>
            <p class="text"><strong>Devolução:</strong> ${item.devolucao}</p>
          </div>
        `
      )
      .join("")}
  `;

  comprovanteSistemaEl.innerHTML = `
    <h2>Comprovante do sistema</h2>
    <p class="text"><strong>Sistema:</strong> ${comprovante.sistema}</p>
    <p class="text"><strong>Local:</strong> ${comprovante.local}</p>
    <p class="text"><strong>Protocolo:</strong> ${comprovante.protocolo}</p>
    <p class="text"><strong>Data:</strong> ${comprovante.data}</p>
    <p class="text"><strong>Leitor:</strong> ${comprovante.leitor.nome}</p>
    <p class="text"><strong>Telefone:</strong> ${comprovante.leitor.telefone}</p>
    <p class="text"><strong>Total de livros:</strong> ${comprovante.totalLivros}</p>
    <p class="text"><strong>Registrado em:</strong> ${comprovante.criadoEm}</p>
    <h3>Registro interno</h3>
    ${comprovante.itens
      .map(
        (item) => `
          <div class="receipt-item">
            <p class="text"><strong>Livro:</strong> ${item.titulo}</p>
            <p class="text"><strong>Quantidade:</strong> ${item.quantidade}</p>
            <p class="text"><strong>Dias:</strong> ${item.dias}</p>
            <p class="text"><strong>Devolver em:</strong> ${item.devolucao}</p>
          </div>
        `
      )
      .join("")}
  `;
}

function renderizarHistorico() {
  totalLocacoesTopoEl.textContent = locacoes.length;

  if (locacoes.length === 0) {
    listaHistoricoEl.innerHTML = `<p class="empty">Nenhuma locação registrada ainda.</p>`;
    return;
  }

  listaHistoricoEl.innerHTML = locacoes
    .map(
      (locacao) => `
        <div class="history-item">
          <p class="text"><strong>Protocolo:</strong> ${locacao.protocolo}</p>
          <p class="text"><strong>Leitor:</strong> ${locacao.leitor.nome}</p>
          <p class="text"><strong>Telefone:</strong> ${locacao.leitor.telefone}</p>
          <p class="text"><strong>Data:</strong> ${locacao.data}</p>
          <p class="text"><strong>Total de livros:</strong> ${locacao.totalLivros}</p>
        </div>
      `
    )
    .join("");
}

function renderizarTopo() {
  totalCatalogoEl.textContent = livrosIniciais.length;
}

function renderizarTudo() {
  renderizarTopo();
  renderizarLivros();
  renderizarCarrinho();
  renderizarComprovante();
  renderizarHistorico();
}

buscaEl.addEventListener("input", renderizarLivros);
categoriaEl.addEventListener("change", renderizarLivros);
btnFinalizarEl.addEventListener("click", finalizarLocacao);
btnImprimirEl.addEventListener("click", () => window.print());
btnLimparComprovanteEl.addEventListener("click", limparComprovante);

preencherCategorias();
renderizarTudo();