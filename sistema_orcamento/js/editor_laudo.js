// ============================================
// DADOS EXTERNOS (JSON) - Pode ser carregado de um arquivo externo
// ============================================
const dadosRecomendacoes = {
  "problemas": [
    {
      "tipo": "Infiltração / Umidade",
      "solucoes": [
        {
          "id": "infiltracao-1",
          "titulo": "Impermeabilização da Laje",
          "descricao": "Aplicação de sistema de impermeabilização com manta asfáltica ou membrana líquida.",
          "materiais": [
            "Manta asfáltica 4mm",
            "Primer de aplicação",
            "Solvente",
            "Rolo de aplicação",
            "Espátula"
          ]
        },
        {
          "id": "infiltracao-2",
          "titulo": "Recuperação de Caixa de Gordura",
          "descricao": "Recuperação da caixa de gordura com vedação adequada e instalação de novo sumidouro.",
          "materiais": [
            "Cimento",
            "Areia média",
            "Pedra brita",
            "Tubo PVC 100mm",
            "Tinta asfáltica"
          ]
        },
        {
          "id": "infiltracao-3",
          "titulo": "Drenagem Periférica",
          "descricao": "Instalação de sistema de drenagem para desviar águas pluviais da fundação.",
          "materiais": [
            "Tubo corrugado perfurado",
            "Geotêxtil",
            "Brita n°1",
            "Manta drenante",
            "Caixa de inspeção"
          ]
        }
      ]
    },
    {
      "tipo": "Trincas e Fissuras",
      "solucoes": [
        {
          "id": "trinca-1",
          "titulo": "Recuperação Estrutural com Graute",
          "descricao": "Injeção de graute de alta resistência para recuperação da capacidade estrutural.",
          "materiais": [
            "Graute estrutural",
            "Injetor manual",
            "Brocas para injeção",
            "Espátula",
            "Fita vedação"
          ]
        },
        {
          "id": "trinca-2",
          "titulo": "Selagem com Polímero Flexível",
          "descricao": "Aplicação de selante flexível para fissuras não estruturais com movimento.",
          "materiais": [
            "Selante acrílico flexível",
            "Fita vedação",
            "Espátula dentada",
            "Limpeza com ar comprimido",
            "Primer aderente"
          ]
        },
        {
          "id": "trinca-3",
          "titulo": "Reforço com Malha de Polipropileno",
          "descricao": "Aplicação de malha de polipropileno para evitar propagação de fissuras.",
          "materiais": [
            "Malha de polipropileno",
            "Argamassa polimérica",
            "Espátula dentada",
            "Rolo de pintura",
            "Primer de fixação"
          ]
        }
      ]
    },
    {
      "tipo": "Descolamento de Reboco",
      "solucoes": [
        {
          "id": "reboco-1",
          "titulo": "Reexecução do Reboco",
          "descricao": "Remoção do reboco danificado e aplicação de nova camada de argamassa.",
          "materiais": [
            "Argamassa industrializada",
            "Cimento",
            "Cal",
            "Areia média",
            "Chapisco"
          ]
        },
        {
          "id": "reboco-2",
          "titulo": "Aplicação de Produto Acrílico",
          "descricao": "Aplicação de massa acrílica para áreas úmidas com melhor aderência.",
          "materiais": [
            "Massa acrílica",
            "Primer acrílico",
            "Espátula de aço",
            "Lixa nº 80",
            "Fundo selador"
          ]
        }
      ]
    },
    {
      "tipo": "Ferragem Exposta (Corrosão)",
      "solucoes": [
        {
          "id": "ferragem-1",
          "titulo": "Tratamento Anticorrosivo",
          "descricao": "Limpeza da ferragem e aplicação de produto anticorrosivo.",
          "materiais": [
            "Conversor de ferrugem",
            "Tinta epóxi",
            "Escova de aço",
            "Lixa de ferro",
            "Primer anticorrosivo"
          ]
        },
        {
          "id": "ferragem-2",
          "titulo": "Recobrimento com Argamassa Polimérica",
          "descricao": "Proteção da armadura com argamassa polimérica de alta aderência.",
          "materiais": [
            "Argamassa polimérica",
            "Primer estrutural",
            "Malha de fibra de vidro",
            "Espátula dentada",
            "Aditivo impermeabilizante"
          ]
        }
      ]
    },
    {
      "tipo": "Mofo / Bolor",
      "solucoes": [
        {
          "id": "mofo-1",
          "titulo": "Tratamento Antifúngico",
          "descricao": "Aplicação de produto fungicida e impermeabilização da área.",
          "materiais": [
            "Fungicida concentrado",
            "Tinta antimofo",
            "Rolo de lã",
            "Lixa para parede",
            "Selador poroso"
          ]
        },
        {
          "id": "mofo-2",
          "titulo": "Instalação de Exaustor",
          "descricao": "Instalação de sistema de exaustão para controle de umidade.",
          "materiais": [
            "Exaustor axial",
            "Duto de ventilação",
            "Interruptor timer",
            "Fios elétricos",
            "Caixa de junção"
          ]
        }
      ]
    }
  ]
};

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let recomendacoesAdicionadas = [];
let materiaisPersonalizados = [];

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Popular o seletor de problemas
  const selectProblema = document.getElementById('selecionarProblema');
  dadosRecomendacoes.problemas.forEach(problema => {
    const option = document.createElement('option');
    option.value = problema.tipo;
    option.textContent = problema.tipo;
    selectProblema.appendChild(option);
  });
  
  // Adicionar problemas do diagnóstico dinamicamente
  const problemasDiagnostico = new Set();
  document.querySelectorAll('.patologia option').forEach(option => {
    if (option.value && option.value !== "Qual o problema?") {
      problemasDiagnostico.add(option.value);
    }
  });
  
  // Adicionar ao select de problemas
  problemasDiagnostico.forEach(problema => {
    if (!dadosRecomendacoes.problemas.find(p => p.tipo === problema)) {
      const option = document.createElement('option');
      option.value = problema;
      option.textContent = problema;
      option.style.fontStyle = "italic";
      selectProblema.appendChild(option);
    }
  });
  
  // Configurar eventos
  selectProblema.addEventListener('change', carregarSolucoes);
  document.getElementById('btnAdicionarSolucao').addEventListener('click', adicionarSolucao);
  
  // Data padrão para hoje
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  document.getElementById('data').value = formattedDate;
  
  // Preencher responsável técnico com exemplo
  document.getElementById('responsavel').value = "Eng. João Silva - CREA 123456/SP";
  
  // Atualizar data e hora no cabeçalho
  atualizarDataHora();
  setInterval(atualizarDataHora, 60000); // Atualizar a cada minuto
  
  // Carregar laudo salvo se existir
  carregarLaudoSalvo();
});

// Atualizar data e hora no cabeçalho
function atualizarDataHora() {
  const agora = new Date();
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const dataFormatada = agora.toLocaleDateString('pt-BR', options);
  document.getElementById('current-date').textContent = dataFormatada;
}

// ============================================
// FUNÇÕES DO SISTEMA DE RECOMENDAÇÕES
// ============================================
function carregarSolucoes() {
  const problemaSelecionado = document.getElementById('selecionarProblema').value;
  const selectSolucao = document.getElementById('selecionarSolucao');
  const btnAdicionar = document.getElementById('btnAdicionarSolucao');
  
  // Limpar opções anteriores
  selectSolucao.innerHTML = '';
  selectSolucao.disabled = true;
  btnAdicionar.disabled = true;
  
  if (!problemaSelecionado) {
    selectSolucao.innerHTML = '<option value="">Primeiro selecione um problema</option>';
    return;
  }
  
  // Buscar soluções para o problema selecionado
  const problemaData = dadosRecomendacoes.problemas.find(p => p.tipo === problemaSelecionado);
  
  if (problemaData && problemaData.solucoes) {
    // Adicionar opção padrão
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = `Selecione uma solução para ${problemaSelecionado}`;
    selectSolucao.appendChild(defaultOption);
    
    // Adicionar soluções disponíveis
    problemaData.solucoes.forEach(solucao => {
      const option = document.createElement('option');
      option.value = solucao.id;
      option.textContent = solucao.titulo;
      option.dataset.descricao = solucao.descricao;
      option.dataset.materiais = JSON.stringify(solucao.materiais);
      selectSolucao.appendChild(option);
    });
    
    // Adicionar opção para solução personalizada
    const customOption = document.createElement('option');
    customOption.value = "personalizado";
    customOption.textContent = "➕ Criar solução personalizada";
    selectSolucao.appendChild(customOption);
    
    selectSolucao.disabled = false;
  } else {
    // Para problemas sem soluções pré-definidas
    selectSolucao.innerHTML = '<option value="">Nenhuma solução pré-definida disponível</option>';
    
    const customOption = document.createElement('option');
    customOption.value = "personalizado";
    customOption.textContent = "➕ Criar solução personalizada para este problema";
    selectSolucao.appendChild(customOption);
    
    selectSolucao.disabled = false;
  }
  
  // Habilitar seleção de solução
  selectSolucao.addEventListener('change', function() {
    btnAdicionar.disabled = !this.value;
  });
}

function adicionarSolucao() {
  const problema = document.getElementById('selecionarProblema').value;
  const solucaoId = document.getElementById('selecionarSolucao').value;
  const selectSolucao = document.getElementById('selecionarSolucao');
  const selectedOption = selectSolucao.options[selectSolucao.selectedIndex];
  
  if (!problema || !solucaoId) return;
  
  // Ocultar mensagem de "nenhuma solução"
  document.getElementById('nenhuma-solucao').style.display = 'none';
  
  let solucaoData;
  
  if (solucaoId === "personalizado") {
    // Criar solução personalizada
    solucaoData = {
      id: 'personalizado-' + Date.now(),
      titulo: `Solução Personalizada para ${problema}`,
      descricao: 'Descrição da solução personalizada. Edite este texto conforme necessário.',
      materiais: ["Material 1", "Material 2"],
      personalizado: true
    };
  } else {
    // Buscar solução pré-definida
    const problemaData = dadosRecomendacoes.problemas.find(p => p.tipo === problema);
    solucaoData = problemaData.solucoes.find(s => s.id === solucaoId);
  }
  
  // Adicionar à lista
  recomendacoesAdicionadas.push({
    problema: problema,
    ...solucaoData
  });
  
  // Atualizar a interface
  renderizarRecomendacoes();
  
  // Limpar seleção
  document.getElementById('selecionarProblema').value = '';
  document.getElementById('selecionarSolucao').innerHTML = '<option value="">Primeiro selecione um problema</option>';
  document.getElementById('selecionarSolucao').disabled = true;
  document.getElementById('btnAdicionarSolucao').disabled = true;
  
  // Salvar no localStorage
  salvarLaudoLocal();
}

function renderizarRecomendacoes() {
  const container = document.getElementById('listaRecomendacoes');
  
  // Limpar container (exceto a mensagem de nenhuma solução)
  const mensagem = document.getElementById('nenhuma-solucao');
  container.innerHTML = '';
  container.appendChild(mensagem);
  
  if (recomendacoesAdicionadas.length === 0) {
    mensagem.style.display = 'block';
    return;
  }
  
  mensagem.style.display = 'none';
  
  // Renderizar cada recomendação
  recomendacoesAdicionadas.forEach((solucao, index) => {
    const solucaoCard = document.createElement('div');
    solucaoCard.className = 'solucao-card';
    solucaoCard.dataset.index = index;
    
    // Criar HTML para os materiais
    let materiaisHTML = '';
    if (solucao.materiais && solucao.materiais.length > 0) {
      materiaisHTML = `
        <div class="materiais-lista">
          <h4>Materiais Recomendados:</h4>
          <div class="materiais-grid">
            ${solucao.materiais.map(material => `
              <div class="material-item">
                <input type="checkbox" id="material-${index}-${material.replace(/\s+/g, '-')}" checked>
                <label for="material-${index}-${material.replace(/\s+/g, '-')}">${material}</label>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    // Botão para adicionar material personalizado
    const addMaterialHTML = `
      <div class="material-personalizado">
        <input type="text" id="novo-material-${index}" placeholder="Digite um material adicional">
        <button class="btn btn-sm" onclick="adicionarMaterialPersonalizado(${index})">
          <i class="fas fa-plus"></i> Adicionar
        </button>
      </div>
    `;
    
    solucaoCard.innerHTML = `
      <div class="solucao-header">
        <div style="flex-grow: 1;">
          <div class="solucao-titulo">${solucao.titulo}</div>
          <div class="solucao-descricao">${solucao.descricao}</div>
          <div>
            <span class="tag">${solucao.problema}</span>
            ${solucao.personalizado ? '<span class="tag" style="background:#fef3c7; color:#92400e;">Personalizada</span>' : ''}
          </div>
        </div>
        <button class="remove-btn" onclick="removerSolucao(${index})">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${materiaisHTML}
      ${addMaterialHTML}
      <div style="margin-top: 10px;">
        <textarea class="editar-descricao" data-index="${index}" 
          placeholder="Edite a descrição da solução se necessário..." 
          style="width:100%; padding:8px; font-size:0.9rem; border:1px solid #cbd5e1; border-radius:4px;"
          oninput="atualizarDescricao(${index}, this.value)">${solucao.descricao}</textarea>
      </div>
    `;
    
    container.appendChild(solucaoCard);
  });
}

function removerSolucao(index) {
  recomendacoesAdicionadas.splice(index, 1);
  renderizarRecomendacoes();
  salvarLaudoLocal();
}

function atualizarDescricao(index, novaDescricao) {
  if (recomendacoesAdicionadas[index]) {
    recomendacoesAdicionadas[index].descricao = novaDescricao;
    salvarLaudoLocal();
  }
}

function adicionarMaterialPersonalizado(index) {
  const input = document.getElementById(`novo-material-${index}`);
  const novoMaterial = input.value.trim();
  
  if (!novoMaterial) return;
  
  if (!recomendacoesAdicionadas[index].materiais) {
    recomendacoesAdicionadas[index].materiais = [];
  }
  
  // Adicionar o material personalizado
  recomendacoesAdicionadas[index].materiais.push(novoMaterial);
  
  // Registrar como material personalizado
  if (!materiaisPersonalizados.find(m => m === novoMaterial)) {
    materiaisPersonalizados.push(novoMaterial);
  }
  
  // Re-renderizar
  renderizarRecomendacoes();
  
  // Limpar input
  input.value = '';
  
  // Salvar no localStorage
  salvarLaudoLocal();
}

function gerarParecerAutomatico() {
  let parecer = "Diante do exposto, recomenda-se a intervenção técnica para correção das patologias identificadas, seguindo as normas técnicas vigentes (ABNT NBR). ";
  
  if (recomendacoesAdicionadas.length > 0) {
    parecer += "Especificamente, para os problemas identificados, sugere-se:\n\n";
    
    recomendacoesAdicionadas.forEach(solucao => {
      parecer += `• ${solucao.titulo}: ${solucao.descricao}\n`;
    });
    
    parecer += "\n";
  }
  
  parecer += "A execução dos serviços deve ser realizada por mão de obra qualificada, com utilização de materiais de qualidade compatível e seguindo as recomendações técnicas dos fabricantes. ";
  parecer += "Recomenda-se monitoramento periódico da estrutura após as intervenções para verificar a eficácia das soluções aplicadas.";
  
  document.getElementById('observacoesTecnicas').value = parecer;
  salvarLaudoLocal();
}

// ============================================
// FUNÇÕES ORIGINAIS (MANTIDAS)
// ============================================
function gerarObjetivo() {
  const entrada = document.getElementById('inputObjetivo').value;
  if(!entrada) return alert("Digite algo breve, ex: 'trinca na parede da sala'");

  const textoTecnico = `O presente Relatório Técnico tem por finalidade apresentar o diagnóstico da vistoria realizada na edificação, com foco específico em identificar e analisar ${entrada}. O documento visa classificar as anomalias encontradas e propor diretrizes para correção.`;
  
  document.getElementById('textoObjetivo').value = textoTecnico;
  salvarLaudoLocal();
}

function gerarInspecao() {
  let entrada = document.getElementById('inputInspecao').value;
  if(!entrada) return alert("Descreva o que você viu.");

  const dicionario = {
    "buraco": "orifício irregular",
    "rachadura": "fissura passante",
    "quebrado": "danificado",
    "ferrugem": "oxidação severa",
    "ferro": "armadura de aço",
    "chão": "pavimento/piso",
    "parede": "alvenaria",
    "teto": "laje de cobertura",
    "goteira": "infiltração ativa",
    "mofo": "proliferação de fungos/bolor",
    "torto": "desnivelado",
    "solto": "com desprendimento",
    "muito": "com alta severidade",
    "caindo": "apresentando risco de colapso"
  };

  let textoMelhorado = entrada.toLowerCase();
  for (const [popular, tecnico] of Object.entries(dicionario)) {
    textoMelhorado = textoMelhorado.replace(new RegExp(popular, "gi"), tecnico);
  }

  const textoFinal = `Durante a inspeção visual in loco, observou-se que a estrutura apresenta ${textoMelhorado}. As manifestações patológicas encontram-se visíveis e foram registradas para análise de gravidade.`;

  document.getElementById('textoInspecao').value = textoFinal;
  salvarLaudoLocal();
}

function adicionarLinha() {
  const div = document.createElement('div');
  div.className = 'checklist-item';
  div.innerHTML = `
    <select class="local">
        <option value="">Selecione o Local...</option>
        <option>Laje / Teto</option>
        <option>Parede Interna</option>
        <option>Fachada Externa</option>
        <option>Piso</option>
        <option>Viga / Pilar</option>
        <option>Telhado</option>
    </select>
    <select class="patologia">
        <option value="">Qual o problema?</option>
        <option>Infiltração / Umidade</option>
        <option>Trincas e Fissuras</option>
        <option>Descolamento de Reboco</option>
        <option>Ferragem Exposta (Corrosão)</option>
        <option>Mofo / Bolor</option>
        <option>Instalação Elétrica Irregular</option>
    </select>
    <select class="risco">
        <option>Risco Baixo</option>
        <option>Risco Médio</option>
        <option>Risco Alto</option>
    </select>
    <button onclick="removerLinha(this)" style="color:red; background:none; border:none; cursor:pointer">X</button>
  `;
  document.getElementById('listaProblemas').appendChild(div);
  
  // Configurar evento para salvar automaticamente
  const selects = div.querySelectorAll('select');
  selects.forEach(select => {
    select.addEventListener('change', salvarLaudoLocal);
  });
}

function removerLinha(btn) {
  btn.parentElement.remove();
  salvarLaudoLocal();
}

// ============================================
// SALVAR E CARREGAR LAUDO LOCAL
// ============================================
function salvarLaudoLocal() {
  const laudo = {
    cliente: document.getElementById('cliente').value,
    data: document.getElementById('data').value,
    endereco: document.getElementById('endereco').value,
    responsavel: document.getElementById('responsavel').value,
    inputObjetivo: document.getElementById('inputObjetivo').value,
    textoObjetivo: document.getElementById('textoObjetivo').value,
    inputInspecao: document.getElementById('inputInspecao').value,
    textoInspecao: document.getElementById('textoInspecao').value,
    observacoesTecnicas: document.getElementById('observacoesTecnicas').value,
    problemas: [],
    recomendacoes: recomendacoesAdicionadas,
    materiaisPersonalizados: materiaisPersonalizados,
    dataSalvamento: new Date().toISOString()
  };

  // Salvar problemas
  const itens = document.querySelectorAll('.checklist-item');
  itens.forEach(item => {
    const local = item.querySelector('.local').value;
    const patologia = item.querySelector('.patologia').value;
    const risco = item.querySelector('.risco').value;
    
    if(local || patologia) {
      laudo.problemas.push({
        local: local,
        patologia: patologia,
        risco: risco
      });
    }
  });

  localStorage.setItem('laudo_tecnico', JSON.stringify(laudo));
}

function carregarLaudoSalvo() {
  const laudoSalvo = localStorage.getItem('laudo_tecnico');
  
  if (laudoSalvo) {
    try {
      const laudo = JSON.parse(laudoSalvo);
      
      // Preencher campos básicos
      if (laudo.cliente) document.getElementById('cliente').value = laudo.cliente;
      if (laudo.data) document.getElementById('data').value = laudo.data;
      if (laudo.endereco) document.getElementById('endereco').value = laudo.endereco;
      if (laudo.responsavel) document.getElementById('responsavel').value = laudo.responsavel;
      if (laudo.inputObjetivo) document.getElementById('inputObjetivo').value = laudo.inputObjetivo;
      if (laudo.textoObjetivo) document.getElementById('textoObjetivo').value = laudo.textoObjetivo;
      if (laudo.inputInspecao) document.getElementById('inputInspecao').value = laudo.inputInspecao;
      if (laudo.textoInspecao) document.getElementById('textoInspecao').value = laudo.textoInspecao;
      if (laudo.observacoesTecnicas) document.getElementById('observacoesTecnicas').value = laudo.observacoesTecnicas;
      
      // Carregar problemas
      if (laudo.problemas && laudo.problemas.length > 0) {
        // Limpar lista atual (exceto o primeiro item)
        const listaProblemas = document.getElementById('listaProblemas');
        while (listaProblemas.children.length > 1) {
          listaProblemas.removeChild(listaProblemas.lastChild);
        }
        
        // Adicionar problemas salvos (começando do segundo, pois o primeiro já existe)
        for (let i = 0; i < laudo.problemas.length; i++) {
          if (i === 0) {
            // Preencher o primeiro item que já existe
            const primeiroItem = listaProblemas.children[0];
            primeiroItem.querySelector('.local').value = laudo.problemas[i].local || '';
            primeiroItem.querySelector('.patologia').value = laudo.problemas[i].patologia || '';
            primeiroItem.querySelector('.risco').value = laudo.problemas[i].risco || 'Risco Baixo';
          } else {
            // Adicionar novos itens
            adicionarLinha();
            const ultimoItem = listaProblemas.lastChild;
            ultimoItem.querySelector('.local').value = laudo.problemas[i].local || '';
            ultimoItem.querySelector('.patologia').value = laudo.problemas[i].patologia || '';
            ultimoItem.querySelector('.risco').value = laudo.problemas[i].risco || 'Risco Baixo';
          }
        }
      }
      
      // Carregar recomendações
      if (laudo.recomendacoes) {
        recomendacoesAdicionadas = laudo.recomendacoes;
        renderizarRecomendacoes();
      }
      
      if (laudo.materiaisPersonalizados) {
        materiaisPersonalizados = laudo.materiaisPersonalizados;
      }
      
      console.log('Laudo carregado com sucesso!');
    } catch (e) {
      console.error('Erro ao carregar laudo salvo:', e);
    }
  }
}

// ============================================
// FUNÇÃO PARA SALVAR NO SISTEMA PRINCIPAL
// ============================================
function salvarParaSistemaPrincipal() {
  // Coletar dados do laudo
  const laudo = {
    tipo: 'laudo_tecnico',
    cliente: document.getElementById('cliente').value || 'Não informado',
    data: document.getElementById('data').value || new Date().toISOString().split('T')[0],
    endereco: document.getElementById('endereco').value || 'Não informado',
    responsavel: document.getElementById('responsavel').value || 'Responsável Técnico',
    objetivo: document.getElementById('textoObjetivo').value,
    inspecao: document.getElementById('textoInspecao').value,
    observacoes: document.getElementById('observacoesTecnicas').value,
    problemas: [],
    recomendacoes: recomendacoesAdicionadas,
    materiaisPersonalizados: materiaisPersonalizados,
    dataCriacao: new Date().toISOString(),
    timestamp: Date.now()
  };

  // Coletar problemas
  const itens = document.querySelectorAll('.checklist-item');
  itens.forEach(item => {
    const local = item.querySelector('.local').value;
    const patologia = item.querySelector('.patologia').value;
    const risco = item.querySelector('.risco').value;
    
    if(local || patologia) {
      laudo.problemas.push({
        local: local,
        patologia: patologia,
        risco: risco
      });
    }
  });

  // Salvar no localStorage com chave específica
  localStorage.setItem('importedLaudoData', JSON.stringify({
    type: 'laudo_tecnico',
    data: laudo,
    timestamp: Date.now()
  }));

  // Salvar também na chave que o orçamento.html verifica
  localStorage.setItem('importedServiceData', JSON.stringify({
    type: 'laudo_tecnico',
    data: laudo,
    timestamp: Date.now()
  }));

  alert('Laudo técnico salvo no sistema principal! Você pode acessá-lo na página de orçamentos.');
  
  // Voltar para a página principal
  window.location.href = 'orcamento.html';
}

function voltarSemSalvar() {
    // Verifica se há histórico para voltar
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // Fallback: Redireciona para a página principal de orçamentos
        window.location.href = 'orcamento.html'; 
    }
}

// ============================================
// GERAR RELATÓRIO FINAL (ATUALIZADO)
// ============================================
function gerarRelatorioFinal() {
  // Pegar dados
  const cliente = document.getElementById('cliente').value || "Não informado";
  const endereco = document.getElementById('endereco').value || "Não informado";
  const data = document.getElementById('data').value ? new Date(document.getElementById('data').value).toLocaleDateString() : new Date().toLocaleDateString();
  const responsavel = document.getElementById('responsavel').value || "Responsável Técnico";
  
  // Extrair registro profissional se existir
  let registro = "";
  const registroMatch = responsavel.match(/CREA\s*[\/]?\s*([0-9]+\/?[A-Z]*)/i);
  if (registroMatch) {
    registro = registroMatch[0];
  }
  
  // Preencher Cabeçalho Print
  document.getElementById('print-header-info').innerHTML = `
    <div class="header-info">
      <p><strong>Contratante:</strong> ${cliente}</p>
      <p><strong>Local da Obra:</strong> ${endereco}</p>
      <p><strong>Data da Vistoria:</strong> ${data}</p>
    </div>
  `;
  
  document.getElementById('print-cliente-sign').innerText = cliente;
  document.getElementById('print-responsavel').innerText = responsavel;
  document.getElementById('print-registro').innerText = registro;
  document.getElementById('print-data-emissao').innerText = new Date().toLocaleDateString();

  // Preencher Textos
  document.getElementById('print-objetivo').innerText = document.getElementById('textoObjetivo').value;
  document.getElementById('print-inspecao').innerText = document.getElementById('textoInspecao').value || "Nenhuma observação adicional registrada.";

  // Gerar Tabela Diagnóstico
  const itens = document.querySelectorAll('.checklist-item');
  let htmlDiagnostico = `<table class="print-table">
    <tr>
      <th style="width:30%">Local</th>
      <th style="width:50%">Problema Identificado</th>
      <th style="width:20%; text-align:center">Classificação de Risco</th>
    </tr>`;
  
  let temItem = false;
  itens.forEach(item => {
    const local = item.querySelector('.local').value;
    const patologia = item.querySelector('.patologia').value;
    const risco = item.querySelector('.risco').value;
    
    if(local && patologia) {
      temItem = true;
      htmlDiagnostico += `
      <tr>
        <td>${local}</td>
        <td>${patologia}</td>
        <td style="text-align:center; font-weight:bold">${risco}</td>
      </tr>`;
    }
  });
  htmlDiagnostico += `</table>`;
  
  if(!temItem) htmlDiagnostico = "<p>Nenhuma anomalia específica cadastrada na lista.</p>";
  document.getElementById('print-diagnostico').innerHTML = htmlDiagnostico;

  // Gerar Seção de Recomendações
  let htmlRecomendacoes = "";
  let htmlMateriais = "";
  
  if (recomendacoesAdicionadas.length > 0) {
    htmlRecomendacoes = "<p><strong>Soluções Técnicas Recomendadas:</strong></p>";
    
    recomendacoesAdicionadas.forEach(solucao => {
      htmlRecomendacoes += `
        <div class="print-solucao">
          <p><strong>${solucao.titulo}</strong> <span style="font-size:10pt; color:#666;">(Para: ${solucao.problema})</span></p>
          <p style="margin-left:10px;">${solucao.descricao}</p>
        </div>`;
      
      // Coletar materiais selecionados
      const materiaisSelecionados = solucao.materiais || [];
      if (materiaisSelecionados.length > 0) {
        htmlMateriais += `<div style="margin: 10px 0;">
          <p style="font-size:10pt; margin-bottom:5px;"><strong>Materiais para ${solucao.titulo}:</strong></p>
          <p>${materiaisSelecionados.map(m => `<span class="tag-material">${m}</span>`).join(' ')}</p>
        </div>`;
      }
    });
  } else {
    htmlRecomendacoes = "<p>Diante do exposto, recomenda-se a intervenção imediata para correção das patologias citadas, seguindo as normas técnicas vigentes (ABNT NBR). Sugere-se a contratação de mão de obra qualificada para execução dos reparos.</p>";
  }
  
  // Adicionar observações técnicas
  const observacoes = document.getElementById('observacoesTecnicas').value;
  let htmlObservacoes = "";
  if (observacoes) {
    htmlObservacoes = `<div class="obs-box"><strong>Observações Técnicas Complementares:</strong><br>${observacoes}</div>`;
  }
  
  document.getElementById('print-recomendacoes').innerHTML = htmlRecomendacoes;
  document.getElementById('print-materiais').innerHTML = htmlMateriais;
  document.getElementById('print-observacoes').innerHTML = htmlObservacoes;

  // Salvar o laudo antes de imprimir
  salvarLaudoLocal();
  
  // Adicionar pequeno delay para garantir renderização completa
  setTimeout(() => {
    // Acionar Impressão
    window.print();
  }, 100);
}

// Auto-save a cada 10 segundos
setInterval(() => {
  salvarLaudoLocal();
}, 10000);