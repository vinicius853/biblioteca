import { useEffect, useMemo, useState } from "react";

const livrosIniciais = [
  {
    id: 1,
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    categoria: "Romance",
    resumo: "Clássico da literatura brasileira sobre memória, amor e ciúme.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    titulo: "O Pequeno Príncipe",
    autor: "Antoine de Saint-Exupéry",
    categoria: "Infantil",
    resumo: "Uma obra sobre amizade, afeto e o valor das coisas simples.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    titulo: "A Arte da Guerra",
    autor: "Sun Tzu",
    categoria: "Estratégia",
    resumo: "Princípios de estratégia, liderança e tomada de decisão.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    titulo: "Extraordinário",
    autor: "R. J. Palacio",
    categoria: "Drama",
    resumo: "Uma história emocionante sobre inclusão, empatia e respeito.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    titulo: "Sapiens",
    autor: "Yuval Noah Harari",
    categoria: "História",
    resumo: "Uma visão ampla sobre a história da humanidade.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    titulo: "Menina Bonita do Laço de Fita",
    autor: "Ana Maria Machado",
    categoria: "Infantil",
    resumo: "Uma obra sobre identidade, diversidade e carinho.",
    disponivel: true,
    capa: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80",
  },
];

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

function usarResponsivo() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    function aoRedimensionar() {
      setMobile(window.innerWidth <= 768);
    }

    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  return mobile;
}

function App() {
  const mobile = usarResponsivo();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const [carrinho, setCarrinho] = useState(() => {
    const salvo = localStorage.getItem("leituraagape-carrinho");
    return salvo ? JSON.parse(salvo) : [];
  });

  const [leitor, setLeitor] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [comprovante, setComprovante] = useState(() => {
    const salvo = localStorage.getItem("leituraagape-comprovante");
    return salvo ? JSON.parse(salvo) : null;
  });

  const [locacoes, setLocacoes] = useState(() => {
    const salvo = localStorage.getItem("leituraagape-locacoes");
    return salvo ? JSON.parse(salvo) : [];
  });

  useEffect(() => {
    localStorage.setItem("leituraagape-carrinho", JSON.stringify(carrinho));
  }, [carrinho]);

  useEffect(() => {
    localStorage.setItem("leituraagape-comprovante", JSON.stringify(comprovante));
  }, [comprovante]);

  useEffect(() => {
    localStorage.setItem("leituraagape-locacoes", JSON.stringify(locacoes));
  }, [locacoes]);

  useEffect(() => {
    if (mensagemSucesso) {
      const timer = setTimeout(() => {
        setMensagemSucesso("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [mensagemSucesso]);

  const categorias = ["Todas", ...new Set(livrosIniciais.map((livro) => livro.categoria))];

  const livrosFiltrados = useMemo(() => {
    return livrosIniciais.filter((livro) => {
      const texto = `${livro.titulo} ${livro.autor} ${livro.categoria}`.toLowerCase();
      const atendeBusca = texto.includes(busca.toLowerCase());
      const atendeCategoria = categoria === "Todas" || livro.categoria === categoria;
      return atendeBusca && atendeCategoria;
    });
  }, [busca, categoria]);

  function adicionarAoCarrinho(livro) {
    const existe = carrinho.find((item) => item.id === livro.id);

    if (existe) {
      const atualizado = carrinho.map((item) =>
        item.id === livro.id
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      );
      setCarrinho(atualizado);
      return;
    }

    setCarrinho([
      ...carrinho,
      {
        id: livro.id,
        titulo: livro.titulo,
        autor: livro.autor,
        capa: livro.capa,
        quantidade: 1,
        dias: 7,
      },
    ]);
  }

  function atualizarItem(id, campo, valor) {
    const atualizado = carrinho.map((item) =>
      item.id === id ? { ...item, [campo]: Number(valor) } : item
    );
    setCarrinho(atualizado);
  }

  function removerItem(id) {
    setCarrinho(carrinho.filter((item) => item.id !== id));
  }

  function finalizarLocacao() {
    if (!leitor.nome || !leitor.telefone || carrinho.length === 0) {
      alert("Preencha nome, telefone e adicione pelo menos um livro.");
      return;
    }

    const hoje = new Date();

    const itens = carrinho.map((item) => ({
      ...item,
      retirada: formatarData(hoje),
      devolucao: formatarData(adicionarDias(hoje, item.dias)),
    }));

    const novoComprovante = {
      protocolo: gerarProtocolo(),
      data: formatarData(hoje),
      leitor,
      itens,
      totalLivros: carrinho.reduce((acc, item) => acc + item.quantidade, 0),
      criadoEm: new Date().toLocaleString("pt-BR"),
      sistema: "Leitura Ágape",
      local: "Igreja Menonita Ágape",
    };

    setComprovante(novoComprovante);
    setLocacoes([novoComprovante, ...locacoes]);
    setCarrinho([]);
    setLeitor({
      nome: "",
      email: "",
      telefone: "",
    });
    setMensagemSucesso("Locação registrada com sucesso!");
  }

  function limparComprovante() {
    setComprovante(null);
    localStorage.removeItem("leituraagape-comprovante");
  }

  function imprimirComprovante() {
    window.print();
  }

  const totalLivrosCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const styles = criarEstilos(mobile);

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>Leitura Ágape</h1>
          <p style={styles.heroText}>
            Plataforma de empréstimo de livros da Igreja Menonita Ágape, com controle
            de locação, devolução e comprovantes para o leitor e para o sistema.
          </p>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.infoBar}>
          <div style={styles.infoCard}>
            <span style={styles.infoNumber}>{livrosIniciais.length}</span>
            <span style={styles.infoLabel}>Livros no catálogo</span>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoNumber}>{totalLivrosCarrinho}</span>
            <span style={styles.infoLabel}>Itens no carrinho</span>
          </div>
          <div style={styles.infoCard}>
            <span style={styles.infoNumber}>{locacoes.length}</span>
            <span style={styles.infoLabel}>Locações registradas</span>
          </div>
        </div>

        {mensagemSucesso && (
          <div style={styles.alertSuccess}>
            {mensagemSucesso}
          </div>
        )}

        <div style={styles.grid}>
          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Buscar livros</h2>

              <input
                type="text"
                placeholder="Buscar por título, autor ou categoria"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.input}
              />

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={styles.input}
              >
                {categorias.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.booksGrid}>
              {livrosFiltrados.map((livro) => (
                <div key={livro.id} style={styles.bookCard}>
                  <img src={livro.capa} alt={livro.titulo} style={styles.bookImage} />
                  <div style={styles.bookContent}>
                    <div style={styles.categoryBadge}>{livro.categoria}</div>
                    <h3 style={styles.bookTitle}>{livro.titulo}</h3>
                    <p style={styles.text}>Autor: {livro.autor}</p>
                    <p style={styles.text}>{livro.resumo}</p>
                    <p style={styles.available}>
                      {livro.disponivel ? "Disponível" : "Indisponível"}
                    </p>

                    <button
                      onClick={() => adicionarAoCarrinho(livro)}
                      style={styles.button}
                    >
                      Adicionar ao carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Carrinho de aluguel</h2>
              <p style={styles.text}>Total de livros: {totalLivrosCarrinho}</p>

              {carrinho.length === 0 && (
                <p style={styles.emptyText}>Nenhum livro adicionado.</p>
              )}

              {carrinho.map((item) => (
                <div key={item.id} style={styles.cartItem}>
                  <div style={styles.cartTop}>
                    <img src={item.capa} alt={item.titulo} style={styles.cartImage} />
                    <div>
                      <h3 style={styles.bookTitle}>{item.titulo}</h3>
                      <p style={styles.text}>Autor: {item.autor}</p>
                    </div>
                  </div>

                  <label style={styles.label}>
                    Quantidade
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(item.id, "quantidade", e.target.value)
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Dias de aluguel
                    <input
                      type="number"
                      min="1"
                      value={item.dias}
                      onChange={(e) => atualizarItem(item.id, "dias", e.target.value)}
                      style={styles.input}
                    />
                  </label>

                  <p style={styles.returnDate}>
                    Data prevista de devolução:{" "}
                    {formatarData(adicionarDias(new Date(), item.dias))}
                  </p>

                  <button
                    onClick={() => removerItem(item.id)}
                    style={styles.removeButton}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Dados do leitor</h2>

              <input
                type="text"
                placeholder="Nome completo"
                value={leitor.nome}
                onChange={(e) => setLeitor({ ...leitor, nome: e.target.value })}
                style={styles.input}
              />

              <input
                type="email"
                placeholder="E-mail"
                value={leitor.email}
                onChange={(e) => setLeitor({ ...leitor, email: e.target.value })}
                style={styles.input}
              />

              <input
                type="text"
                placeholder="Telefone"
                value={leitor.telefone}
                onChange={(e) => setLeitor({ ...leitor, telefone: e.target.value })}
                style={styles.input}
              />

              <button onClick={finalizarLocacao} style={styles.buttonSuccess}>
                Finalizar locação
              </button>
            </div>
          </div>
        </div>

        {comprovante && (
          <div style={styles.card}>
            <div style={styles.receiptHeader}>
              <h2 style={styles.cardTitle}>Comprovantes gerados</h2>
              <div style={styles.receiptButtons}>
                <button onClick={imprimirComprovante} style={styles.button}>
                  Imprimir
                </button>
                <button onClick={limparComprovante} style={styles.removeButton}>
                  Limpar comprovante
                </button>
              </div>
            </div>

            <div style={styles.receiptsArea}>
              <div style={styles.receipt}>
                <h2 style={styles.cardTitle}>Comprovante do leitor</h2>
                <p style={styles.text}><strong>Sistema:</strong> {comprovante.sistema}</p>
                <p style={styles.text}><strong>Local:</strong> {comprovante.local}</p>
                <p style={styles.text}><strong>Protocolo:</strong> {comprovante.protocolo}</p>
                <p style={styles.text}><strong>Data:</strong> {comprovante.data}</p>
                <p style={styles.text}><strong>Nome:</strong> {comprovante.leitor.nome}</p>
                <p style={styles.text}><strong>E-mail:</strong> {comprovante.leitor.email || "Não informado"}</p>
                <p style={styles.text}><strong>Telefone:</strong> {comprovante.leitor.telefone}</p>

                <h3 style={styles.sectionTitle}>Livros alugados</h3>
                {comprovante.itens.map((item) => (
                  <div key={item.id} style={styles.receiptItem}>
                    <p style={styles.text}><strong>Livro:</strong> {item.titulo}</p>
                    <p style={styles.text}><strong>Quantidade:</strong> {item.quantidade}</p>
                    <p style={styles.text}><strong>Dias:</strong> {item.dias}</p>
                    <p style={styles.text}><strong>Retirada:</strong> {item.retirada}</p>
                    <p style={styles.text}><strong>Devolução:</strong> {item.devolucao}</p>
                  </div>
                ))}
              </div>

              <div style={styles.receipt}>
                <h2 style={styles.cardTitle}>Comprovante do sistema</h2>
                <p style={styles.text}><strong>Sistema:</strong> {comprovante.sistema}</p>
                <p style={styles.text}><strong>Local:</strong> {comprovante.local}</p>
                <p style={styles.text}><strong>Protocolo:</strong> {comprovante.protocolo}</p>
                <p style={styles.text}><strong>Data:</strong> {comprovante.data}</p>
                <p style={styles.text}><strong>Leitor:</strong> {comprovante.leitor.nome}</p>
                <p style={styles.text}><strong>Telefone:</strong> {comprovante.leitor.telefone}</p>
                <p style={styles.text}><strong>Total de livros:</strong> {comprovante.totalLivros}</p>
                <p style={styles.text}><strong>Registrado em:</strong> {comprovante.criadoEm}</p>

                <h3 style={styles.sectionTitle}>Registro interno</h3>
                {comprovante.itens.map((item) => (
                  <div key={item.id} style={styles.receiptItem}>
                    <p style={styles.text}><strong>Livro:</strong> {item.titulo}</p>
                    <p style={styles.text}><strong>Quantidade:</strong> {item.quantidade}</p>
                    <p style={styles.text}><strong>Dias:</strong> {item.dias}</p>
                    <p style={styles.text}><strong>Devolver em:</strong> {item.devolucao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Histórico de locações</h2>

          {locacoes.length === 0 ? (
            <p style={styles.emptyText}>Nenhuma locação registrada ainda.</p>
          ) : (
            locacoes.map((locacao, index) => (
              <div key={index} style={styles.historyItem}>
                <p style={styles.text}><strong>Protocolo:</strong> {locacao.protocolo}</p>
                <p style={styles.text}><strong>Leitor:</strong> {locacao.leitor.nome}</p>
                <p style={styles.text}><strong>Telefone:</strong> {locacao.leitor.telefone}</p>
                <p style={styles.text}><strong>Data:</strong> {locacao.data}</p>
                <p style={styles.text}><strong>Total de livros:</strong> {locacao.totalLivros}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function criarEstilos(mobile) {
  return {
    page: {
      minHeight: "100vh",
      backgroundColor: "#eef2f7",
      fontFamily: "Arial, sans-serif",
      color: "#1f2937",
      paddingBottom: "40px",
    },
	hero: {
  background: "linear-gradient(135deg, #14532d, #166534, #1d4ed8)",
  color: "#fff",
  padding: mobile ? "32px 16px" : "48px 20px",
  marginBottom: "20px",
},

heroTitle: {
  fontSize: mobile ? "30px" : "40px",
  margin: "0 auto 12px auto",
  lineHeight: "1.2",
  textAlign: "center",
},

heroText: {
  fontSize: mobile ? "15px" : "18px",
  margin: "0 auto",
  maxWidth: "760px",
  lineHeight: "1.8",
  textAlign: "center",
},

container: {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: mobile ? "0 12px" : "0 20px",
},
    infoBar: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)",
      gap: "16px",
      marginBottom: "20px",
    },
    infoCard: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: mobile ? "16px" : "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      textAlign: "center",
    },
    infoNumber: {
      display: "block",
      fontSize: mobile ? "24px" : "28px",
      fontWeight: "bold",
      color: "#166534",
    },
    infoLabel: {
      display: "block",
      fontSize: "14px",
      color: "#4b5563",
      marginTop: "6px",
    },
    alertSuccess: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
      borderRadius: "12px",
      padding: "14px 16px",
      marginBottom: "20px",
      fontWeight: "bold",
      fontSize: "14px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1.3fr 0.9fr",
      gap: "20px",
      alignItems: "start",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      padding: mobile ? "16px" : "20px",
      marginBottom: "20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    },
    cardTitle: {
      fontSize: mobile ? "20px" : "24px",
      marginTop: 0,
      marginBottom: "16px",
      lineHeight: "1.3",
    },
    booksGrid: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "16px",
    },
    bookCard: {
      backgroundColor: "#ffffff",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
    },
    bookImage: {
      width: "100%",
      height: mobile ? "200px" : "220px",
      objectFit: "cover",
    },
    bookContent: {
      padding: "16px",
    },
    categoryBadge: {
      display: "inline-block",
      backgroundColor: "#dcfce7",
      color: "#166534",
      fontSize: "12px",
      fontWeight: "bold",
      padding: "6px 10px",
      borderRadius: "999px",
      marginBottom: "10px",
    },
    bookTitle: {
      fontSize: mobile ? "17px" : "18px",
      marginTop: 0,
      marginBottom: "8px",
      lineHeight: "1.3",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginTop: "6px",
      marginBottom: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
    },
    button: {
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "11px 16px",
      cursor: "pointer",
      fontSize: "14px",
      marginTop: "10px",
      width: mobile ? "100%" : "auto",
    },
    buttonSuccess: {
      backgroundColor: "#166534",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 16px",
      cursor: "pointer",
      fontSize: "14px",
      marginTop: "10px",
      width: "100%",
    },
    removeButton: {
      backgroundColor: "#dc2626",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "10px 14px",
      cursor: "pointer",
      fontSize: "14px",
      marginTop: "10px",
      width: mobile ? "100%" : "auto",
    },
    cartItem: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "14px",
      marginTop: "14px",
      backgroundColor: "#f9fafb",
    },
    cartTop: {
      display: "flex",
      flexDirection: mobile ? "column" : "row",
      gap: "12px",
      alignItems: mobile ? "flex-start" : "center",
      marginBottom: "10px",
    },
    cartImage: {
      width: mobile ? "100%" : "70px",
      maxWidth: mobile ? "140px" : "70px",
      height: mobile ? "180px" : "90px",
      objectFit: "cover",
      borderRadius: "10px",
    },
    label: {
      display: "block",
      marginTop: "10px",
      fontSize: "14px",
    },
    text: {
      fontSize: "14px",
      margin: "4px 0",
      lineHeight: "1.5",
      wordBreak: "break-word",
    },
    available: {
      fontSize: "14px",
      marginTop: "8px",
      color: "#15803d",
      fontWeight: "bold",
    },
    returnDate: {
      marginTop: "10px",
      fontWeight: "bold",
      color: "#1d4ed8",
      fontSize: "14px",
      lineHeight: "1.5",
    },
    emptyText: {
      color: "#6b7280",
      fontSize: "14px",
    },
    receiptHeader: {
      display: "flex",
      flexDirection: mobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: mobile ? "stretch" : "center",
      gap: "16px",
      flexWrap: "wrap",
    },
    receiptButtons: {
      display: "flex",
      flexDirection: mobile ? "column" : "row",
      gap: "10px",
      flexWrap: "wrap",
      width: mobile ? "100%" : "auto",
    },
    receiptsArea: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: "20px",
      marginTop: "20px",
    },
    receipt: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      padding: mobile ? "16px" : "20px",
      border: "1px solid #e5e7eb",
    },
    sectionTitle: {
      fontSize: mobile ? "17px" : "18px",
      marginTop: "18px",
      marginBottom: "10px",
    },
    receiptItem: {
      borderTop: "1px solid #dbe3ec",
      paddingTop: "10px",
      marginTop: "10px",
    },
    historyItem: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "14px",
      marginTop: "12px",
      backgroundColor: "#f9fafb",
    },
  };
}

export default App;