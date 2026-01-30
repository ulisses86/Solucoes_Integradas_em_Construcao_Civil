function verificarValidadeDosDados() {
    const tempoLimite = 30 * 60 * 1000; // 30 minutos em milissegundos
    const agora = new Date().getTime();
    const ultimaGravacao = localStorage.getItem('ultima_gravacao');

    if (ultimaGravacao) {
        const diff = agora - parseInt(ultimaGravacao);
        
        if (diff > tempoLimite) {
            console.log("Dados expirados. Limpando rascunhos...");
            localStorage.removeItem('projeto_atual');
            localStorage.removeItem('etapas_orcamento');
            // Mantenha o orcamento_numero se quiser que a contagem continue
            return true; // Dados foram limpos
        }
    }
    return false; // Dados ainda são válidos
}

const { jsPDF } = window.jspdf;
let etapas = JSON.parse(localStorage.getItem('etapas_orcamento')) || [];
let currentEtapaId = null;
let orcamentoNumero = localStorage.getItem('orcamento_numero') || '001-2026';
let etapasRecolhidas = JSON.parse(localStorage.getItem('etapas_recolhidas')) || {};

// Templates pré-definidos com estrutura do nosso sistema (ZERADOS)
const templates = {
    demolicao: {
        nome: "DEMOLIÇÃO",
        descricao: "Serviços de demolição e remoção de elementos",
        itens: []
    },
    alvenaria: {
        nome: "ALVENARIA E ESTRUTURA",
        descricao: "Serviços de alvenaria e estruturação",
        itens: []
    },
    eletrica: {
        nome: "INSTALAÇÃO ELÉTRICA",
        descricao: "Instalações elétricas e pontos de energia",
        itens: []
    },
    hidraulica: {
        nome: "INSTALAÇÃO HIDRÁULICA",
        descricao: "Instalações hidráulicas e sanitárias",
        itens: []
    },
    revestimento: {
        nome: "REVESTIMENTOS",
        descricao: "Aplicação de revestimentos e acabamentos",
        itens: []
    },
    esquadria: {
        nome: "ESQUADRIAS",
        descricao: "Instalação de portas, janelas e esquadrias",
        itens: []
    },
    pintura: {
        nome: "PINTURA E ACABAMENTO",
        descricao: "Serviços de pintura e acabamento final",
        itens: []
    },
    forro: {
        nome: "FORRO DE GESSO",
        descricao: "Instalação de forro em gesso e drywall",
        itens: []
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Definir data atual
    const hoje = new Date();
    document.getElementById('dataOrcamento').valueAsDate = hoje;
    
    // Atualizar data e hora no cabeçalho
    atualizarDataHora();
    setInterval(atualizarDataHora, 60000); // Atualizar a cada minuto
    
    // Atualizar número do orçamento
    document.getElementById('budget-number').textContent = orcamentoNumero;
    
    // Carregar etapas salvas
    renderizarEtapas();
    
    // Adicionar mensagem inicial se não houver etapas
    if (etapas.length === 0) {
        mostrarMensagemInicial();
    }
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

// Mostrar mensagem inicial
function mostrarMensagemInicial() {
    const container = document.getElementById('etapas-container');
    container.innerHTML = `
        <div class="bg-white rounded-xl shadow-md p-8 text-center">
            <i class="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
            <h3 class="text-xl font-medium text-gray-500 mb-2">Comece seu orçamento integrado</h3>
            <p class="text-gray-400 mb-6">Escolha um modelo acima ou crie uma etapa personalizada</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <button onclick="adicionarEtapaPronta('demolicao')" class="bg-accent text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition">
                    <i class="fas fa-hammer mr-2"></i> Usar Modelo
                </button>
                <button onclick="adicionarEtapaCustomizada()" class="bg-white border border-accent text-accent px-4 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
                    <i class="fas fa-plus mr-2"></i> Criar Personalizada
                </button>
            </div>
        </div>
    `;
}

// Formatar moeda brasileira
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    });
}

// Formatar número brasileiro
function formatarNumero(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Adicionar etapa customizada
function adicionarEtapaCustomizada() {
    const novaEtapa = {
        id: Date.now().toString(),
        nome: "NOVA ETAPA",
        descricao: "Descreva o escopo desta etapa...",
        itens: []
    };
    
    etapas.push(novaEtapa);
    salvarNoLocalStorage();
    renderizarEtapas();
    
    // Adicionar um item inicial
    setTimeout(() => {
        adicionarLinhaItem(novaEtapa.id);
    }, 100);
}

// Adicionar etapa pronta
function adicionarEtapaPronta(templateName) {
    const template = templates[templateName];
    if (template) {
        const novaEtapa = {
            id: Date.now().toString(),
            nome: template.nome,
            descricao: template.descricao,
            itens: []
        };
        
        etapas.push(novaEtapa);
        salvarNoLocalStorage();
        renderizarEtapas();
        
        // Mostrar mensagem para preencher
        setTimeout(() => {
            alert(`Etapa "${template.nome}" adicionada! Clique em "Adicionar Item" para começar a preencher.`);
        }, 300);
    }
}

// Alternar recolhimento da etapa
function alternarRecolhimento(etapaId) {
    if (etapasRecolhidas[etapaId]) {
        delete etapasRecolhidas[etapaId];
    } else {
        etapasRecolhidas[etapaId] = true;
    }
    localStorage.setItem('etapas_recolhidas', JSON.stringify(etapasRecolhidas));
    renderizarEtapas();
}

// Renderizar todas as etapas
function renderizarEtapas() {
    const container = document.getElementById('etapas-container');
    container.innerHTML = '';
    
    if (etapas.length === 0) {
        mostrarMensagemInicial();
        return;
    }
    
    etapas.forEach((etapa, index) => {
        const etapaElement = criarElementoEtapa(etapa, index);
        container.appendChild(etapaElement);
    });
    
    // Reatribuir eventos
    reatribuirEventos();
    calcularTotalGeral();
}

// Criar elemento HTML para uma etapa
function criarElementoEtapa(etapa, index) {
    const etapaElement = document.createElement('div');
    etapaElement.className = 'etapa-card bg-white rounded-xl shadow-md overflow-hidden print:shadow-none print:border print:border-gray-300 print:mb-4';
    etapaElement.id = `etapa-${etapa.id}`;
    
    const totalEtapa = calcularTotalEtapa(etapa);
    const estaRecolhida = etapasRecolhidas[etapa.id] || false;
    
    etapaElement.innerHTML = `
        <div class="etapa-header bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-gray-200 print:bg-gray-100 print:border-b print:border-gray-300" onclick="alternarRecolhimento('${etapa.id}')">
            <div class="flex justify-between items-center">
                <div class="flex-1 flex items-center">
                    <i class="fas fa-chevron-down mr-3 transition-transform ${estaRecolhida ? '' : 'rotate-180'}" style="transition: transform 0.3s ease;"></i>
                    <div class="flex-1">
                        <input type="text" value="${etapa.nome}" data-etapa-id="${etapa.id}" 
                               class="etapa-nome bg-transparent text-lg font-bold text-gray-800 w-full border-none focus:outline-none focus:ring-0 print:text-black" 
                               onclick="event.stopPropagation();" oninput="atualizarEtapaNome('${etapa.id}', this.value)">
                        ${etapa.descricao ? `
                            <textarea data-etapa-id="${etapa.id}" 
                                class="etapa-descricao bg-transparent text-sm text-gray-600 mt-1 w-full border-none focus:outline-none focus:ring-0 resize-none print:text-gray-700"
                                rows="1" onclick="event.stopPropagation();" oninput="atualizarEtapaDescricao('${etapa.id}', this.value)">${etapa.descricao}</textarea>
                        ` : ''}
                    </div>
                </div>
                <div class="flex items-center space-x-3" onclick="event.stopPropagation();">
                    <span class="text-lg font-bold text-primary print:text-black">${formatarMoeda(totalEtapa)}</span>
                    <button onclick="event.stopPropagation(); removerEtapa('${etapa.id}')" class="text-red-500 hover:text-red-700 no-print" title="Remover etapa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="etapa-body p-6 print:p-4 ${estaRecolhida ? 'recolhido' : ''}">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 print:table-fixed">
                    <thead class="bg-gray-50 print:bg-gray-100">
                        <tr>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700">Item / Descrição</th>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700 print:w-16">Unid.</th>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700 print:w-20">Quant.</th>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700 print:w-24">Mão de Obra (R$)</th>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700 print:w-24">Material (R$)</th>
                            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:py-2 print:text-xs print:font-bold print:text-gray-700 print:w-28">Subtotal (R$)</th>
                            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden"></th>
                        </tr>
                    </thead>
                    <tbody id="itens-${etapa.id}" class="bg-white divide-y divide-gray-200 print:divide-gray-300">
                        ${etapa.itens.length > 0 ? etapa.itens.map((item, itemIndex) => criarLinhaItem(etapa.id, item, itemIndex)).join('') : `
                        <tr>
                            <td colspan="7" class="px-4 py-8 text-center text-gray-400 italic">
                                Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                            </td>
                        </tr>
                        `}
                    </tbody>
                    <tfoot class="print:border-t print:border-gray-400">
                        <tr class="bg-gray-50 print:bg-gray-100">
                            <td colspan="5" class="px-4 py-3 text-right text-sm font-medium text-gray-500 print:px-2 print:py-2 print:text-right print:font-bold">Total da Etapa</td>
                            <td class="px-4 py-3 text-left text-sm font-bold text-gray-900 print:px-2 print:py-2 print:text-left">${formatarMoeda(totalEtapa)}</td>
                            <td class="px-4 py-3 text-right print:hidden">
                                <button onclick="event.stopPropagation(); adicionarLinhaItem('${etapa.id}')" class="text-sm text-accent hover:text-purple-700 font-medium no-print">
                                    <i class="fas fa-plus mr-1"></i> Adicionar Item
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    return etapaElement;
}

// Criar linha de item
function criarLinhaItem(etapaId, item, itemIndex) {
    const subtotal = (parseFloat(item.quantidade) || 0) * ((parseFloat(item.maoObra) || 0) + (parseFloat(item.material) || 0));
    
    return `
        <tr class="table-row print:border-b print:border-gray-200">
            <td class="px-4 py-3 print:px-2 print:py-2">
                <input type="text" value="${item.descricao || ''}" 
                    data-etapa-id="${etapaId}" data-item-index="${itemIndex}" data-field="descricao"
                    class="item-input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary print:border-none print:bg-transparent print:p-0 print:text-sm"
                    oninput="atualizarItem('${etapaId}', ${itemIndex}, 'descricao', this.value)">
            </td>
            <td class="px-4 py-3 print:px-2 print:py-2">
                <input type="text" value="${item.unidade || 'un'}" 
                    data-etapa-id="${etapaId}" data-item-index="${itemIndex}" data-field="unidade"
                    class="item-input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary print:border-none print:bg-transparent print:p-0 print:text-sm print:text-center"
                    oninput="atualizarItem('${etapaId}', ${itemIndex}, 'unidade', this.value)">
            </td>
            <td class="px-4 py-3 print:px-2 print:py-2">
                <input type="number" step="0.01" value="${item.quantidade || ''}" 
                    data-etapa-id="${etapaId}" data-item-index="${itemIndex}" data-field="quantidade"
                    class="item-input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary print:border-none print:bg-transparent print:p-0 print:text-sm print:text-right"
                    placeholder="0"
                    oninput="atualizarItem('${etapaId}', ${itemIndex}, 'quantidade', this.value); calcularTotalGeral();">
            </td>
            <td class="px-4 py-3 print:px-2 print:py-2">
                <input type="number" step="0.01" value="${item.maoObra || ''}" 
                    data-etapa-id="${etapaId}" data-item-index="${itemIndex}" data-field="maoObra"
                    class="item-input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary print:border-none print:bg-transparent print:p-0 print:text-sm print:text-right"
                    placeholder="0,00"
                    oninput="atualizarItem('${etapaId}', ${itemIndex}, 'maoObra', this.value); calcularTotalGeral();">
            </td>
            <td class="px-4 py-3 print:px-2 print:py-2">
                <input type="number" step="0.01" value="${item.material || ''}" 
                    data-etapa-id="${etapaId}" data-item-index="${itemIndex}" data-field="material"
                    class="item-input w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary print:border-none print:bg-transparent print:p-0 print:text-sm print:text-right"
                    placeholder="0,00"
                    oninput="atualizarItem('${etapaId}', ${itemIndex}, 'material', this.value); calcularTotalGeral();">
            </td>
            <td class="px-4 py-3 font-medium text-gray-900 print:px-2 print:py-2 print:text-sm print:text-right">
                ${formatarMoeda(subtotal)}
            </td>
            <td class="px-4 py-3 text-right print:hidden">
                <button onclick="removerLinhaItem('${etapaId}', ${itemIndex})" class="text-red-500 hover:text-red-700 no-print">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// Funções de atualização e remoção
function atualizarEtapaNome(etapaId, valor) {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa) {
        etapa.nome = valor;
        salvarNoLocalStorage();
    }
}

function atualizarEtapaDescricao(etapaId, valor) {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa) {
        etapa.descricao = valor;
        salvarNoLocalStorage();
    }
}

function atualizarItem(etapaId, itemIndex, campo, valor) {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa && etapa.itens[itemIndex]) {
        if (['quantidade', 'maoObra', 'material'].includes(campo)) {
            etapa.itens[itemIndex][campo] = parseFloat(valor) || 0;
        } else {
            etapa.itens[itemIndex][campo] = valor;
        }
        
        salvarNoLocalStorage();
        
        // Atualizar subtotal da linha
        const linha = document.querySelector(`#itens-${etapaId} tr:nth-child(${parseInt(itemIndex) + 1})`);
        if (linha) {
            const subtotalCell = linha.querySelector('td:nth-child(6)');
            if (subtotalCell) {
                const item = etapa.itens[itemIndex];
                const subtotal = (item.quantidade || 0) * ((item.maoObra || 0) + (item.material || 0));
                subtotalCell.textContent = formatarMoeda(subtotal);
            }
        }
        
        // Atualizar total da etapa
        const totalEtapaCell = document.querySelector(`#etapa-${etapaId} tfoot td:nth-child(2)`);
        if (totalEtapaCell) {
            totalEtapaCell.textContent = formatarMoeda(calcularTotalEtapa(etapa));
        }
    }
}

function adicionarLinhaItem(etapaId) {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa) {
        etapa.itens.push({
            descricao: '',
            unidade: 'un',
            quantidade: 0,
            maoObra: 0,
            material: 0
        });
        salvarNoLocalStorage();
        renderizarEtapas();
    }
}

function removerLinhaItem(etapaId, itemIndex) {
    const etapa = etapas.find(e => e.id === etapaId);
    if (etapa && etapa.itens[itemIndex]) {
        if (confirm('Tem certeza que deseja remover este item?')) {
            etapa.itens.splice(itemIndex, 1);
            salvarNoLocalStorage();
            renderizarEtapas();
        }
    }
}

function removerEtapa(etapaId) {
    if (confirm('Tem certeza que deseja remover esta etapa e todos os seus itens?')) {
        etapas = etapas.filter(etapa => etapa.id !== etapaId);
        delete etapasRecolhidas[etapaId];
        salvarNoLocalStorage();
        localStorage.setItem('etapas_recolhidas', JSON.stringify(etapasRecolhidas));
        renderizarEtapas();
    }
}

function calcularTotalEtapa(etapa) {
    return etapa.itens.reduce((total, item) => {
        const quantidade = parseFloat(item.quantidade) || 0;
        const maoObra = parseFloat(item.maoObra) || 0;
        const material = parseFloat(item.material) || 0;
        return total + (quantidade * (maoObra + material));
    }, 0);
}

function calcularTotalGeral() {
    const total = etapas.reduce((total, etapa) => {
        return total + calcularTotalEtapa(etapa);
    }, 0);
    
    document.getElementById('valorTotalGeral').textContent = 
        total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    return total;
}

function salvarNoLocalStorage() {
    const projeto = {
        nome: document.getElementById('projetoNome').value,
        responsavel: document.getElementById('responsavelTecnico').value,
        data: document.getElementById('dataOrcamento').value,
        observacoes: document.getElementById('observacoes').value,
        etapas: etapas,
        totalGeral: calcularTotalGeral()
    };
    
    localStorage.setItem('etapas_orcamento', JSON.stringify(etapas));
    localStorage.setItem('projeto_atual', JSON.stringify(projeto));
}

// Função Salvar Rascunho
function saveDraft() {
    salvarNoLocalStorage();
    alert('Rascunho salvo com sucesso! Os dados foram armazenados localmente.');
}

function exportarJSON() {
    const projeto = {
        nome: document.getElementById('projetoNome').value,
        responsavel: document.getElementById('responsavelTecnico').value,
        data: document.getElementById('dataOrcamento').value,
        observacoes: document.getElementById('observacoes').value,
        etapas: etapas,
        totalGeral: calcularTotalGeral()
    };
    
    const dataStr = JSON.stringify(projeto, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Orcamento_SL_${projeto.nome.replace(/[^a-z0-9]/gi, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Projeto exportado como JSON!');
}

function salvarParaSistemaPrincipal() {
    if (etapas.length === 0) {
        alert('Nenhuma etapa para salvar. Adicione etapas primeiro.');
        return;
    }
    
    const projeto = {
        nome: document.getElementById('projetoNome').value,
        responsavel: document.getElementById('responsavelTecnico').value,
        data: document.getElementById('dataOrcamento').value,
        observacoes: document.getElementById('observacoes').value,
        etapas: etapas,
        totalGeral: calcularTotalGeral(),
        tipo: 'personalizado_arquitetura',
        dataCriacao: new Date().toISOString(),
        timestamp: Date.now() // Adiciona timestamp para identificação única
    };
    
    // Salva no localStorage com uma chave específica
    localStorage.setItem('importedPersonalizedBudget', JSON.stringify(projeto));
    
    // Salva também na chave que o orçamento.html verifica
    localStorage.setItem('importedServiceData', JSON.stringify({
        type: 'personalizado_arquitetura',
        data: projeto,
        timestamp: Date.now()
    }));
    
    alert('Orçamento personalizado salvo no sistema principal! Você pode acessá-lo na página de orçamentos.');
    
    // Voltar para a página principal
    window.location.href = 'orcamento.html';
}

// EXPORTAÇÃO PARA PDF COM AJUSTES DE ESPAÇAMENTO
function exportarParaPDF() {
    if (etapas.length === 0) {
        alert('Nenhuma etapa para exportar. Adicione etapas primeiro.');
        return;
    }
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // CONFIGURAÇÕES OTIMIZADAS PARA MAXIMIZAR ESPAÇO
    const marginLeft = 8;    // Reduzido de 10 para 8mm
    const marginRight = 8;   // Reduzido de 10 para 8mm
    const marginTop = 8;     // Reduzido de 15 para 8mm
    const marginBottom = 6;  // Reduzido de 10 para 6mm
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const maxY = 290; // Altura máxima da página A4 é 297mm
    
    let yPos = marginTop;
    
    // CABEÇALHO PROFISSIONAL COMPACTO
    doc.setFillColor(15, 23, 42); // primary (azul escuro)
    doc.rect(0, 0, pageWidth, 30, 'F'); // Reduzido para 20
    
    // Logo/Identificação à esquerda
    doc.setFontSize(20); // Reduzido de 20 para 18
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text("SL CONSTRUÇÃO CIVIL", marginLeft, 12); // Ajustado para 12
    
    doc.setFontSize(8); // Reduzido de 9 para 8
    doc.setTextColor(200, 200, 200);
    doc.setFont(undefined, 'normal');
    doc.text("Sistema Integrado de Orçamentos", marginLeft, 17); // Ajustado para 17
    
    // Número do orçamento
    const numeroOrc = orcamentoNumero;
    doc.setFontSize(9); // Reduzido de 10 para 9
    doc.setTextColor(255, 255, 255);
    doc.text(`ORÇAMENTO Nº: ${numeroOrc}`, marginLeft, 24); // Ajustado para 24
    
    // Título à direita
    doc.setFontSize(20); // Reduzido de 24 para 20
    doc.setTextColor(255, 255, 255);
    // CORREÇÃO: Substituir 'thin' por 'normal'
    doc.setFont(undefined, 'normal');
    doc.text("PROPOSTA", pageWidth - marginRight, 15, { align: 'right' }); // Ajustado para 15
    
    // Informações de data
    const dataEmissao = document.getElementById('dataOrcamento').value || new Date().toISOString().split('T')[0];
    const dataFormatada = dataEmissao.split('-').reverse().join('/');
    
    doc.setFontSize(8); // Reduzido de 9 para 8
    doc.setTextColor(200, 200, 200);
    doc.setFont(undefined, 'normal');
    doc.text(`EMISSÃO: ${dataFormatada}`, pageWidth - marginRight, 22, { align: 'right' }); // Ajustado para 22
    
    // VALIDADE (alinhada à direita, abaixo da emissão)
    doc.setFontSize(8);
    doc.setTextColor(173, 216, 230);
    doc.setFont(undefined, 'bold');

    doc.text(
    "VALIDADE: 15 DIAS",
    pageWidth - marginRight, // 👉 borda direita real
    28,                      // Y logo abaixo da emissão
    { align: "right" }       // 👉 ESSENCIAL
    );

    
    yPos = 35; // Começar abaixo do cabeçalho (era 45)
    
    // MINI-CABEÇALHO COM BORDAS SUAVES - COMPACTO
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(marginLeft, yPos, contentWidth, 16, 2, 2, 'FD'); // Reduzido de 20 para 16
    
    // Informações dentro do mini-cabeçalho
    doc.setFontSize(10); // Reduzido de 11 para 10
    
    const cliente = document.getElementById('projetoNome').value;
    const responsavel = document.getElementById('responsavelTecnico').value;
    
    // Cliente
    doc.setFont(undefined, 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text("Cliente:", marginLeft + 4, yPos + 6); // Ajustado
    doc.setFont(undefined, 'normal');
    const clienteLinha = cliente.length > 50 ? cliente.substring(0, 50) + "..." : cliente;
    doc.text(clienteLinha, marginLeft + 22, yPos + 6);
    
    // Responsável Técnico
    doc.setFont(undefined, 'bold');
    doc.text("Responsável:", marginLeft + 4, yPos + 12); // Ajustado
    doc.setFont(undefined, 'normal');
    const respLinha = responsavel.length > 40 ? responsavel.substring(0, 40) + "..." : responsavel;
    doc.text(respLinha, marginLeft + 32, yPos + 12);
    
    yPos += 20; // Reduzido de 25 para 20
    
    // OBSERVAÇÕES com formatação de texto (apenas se houver conteúdo)
    const observacoes = document.getElementById('observacoes').value;

    if (observacoes && observacoes.trim().length > 0) {

    // Título
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.setFont(undefined, 'bold');

    // 👉 desce um pouco mais o título
    doc.text("OBSERVAÇÕES:", marginLeft, yPos + 6);

    // 👉 espaço real entre título e texto
    yPos += 14;

    // Texto
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');

    // 👉 melhora legibilidade + cria respiro entre itens
    const observacoesFormatadas = observacoes
        .replace(/\r\n/g, '\n')
        .replace(/\n(\d+\.)/g, '\n\n$1'); // linha em branco antes de 01., 02...

    // CORREÇÃO: Usar a variável correta
    const linhasObs = doc.splitTextToSize(observacoesFormatadas, contentWidth);
    
    doc.text(
        observacoesFormatadas,
        marginLeft,
        yPos,
        {
        maxWidth: contentWidth,
        lineHeightFactor: 1.35   // 👈 ESSENCIAL
        }
    );

    // 👉 atualiza yPos com base na altura real do texto
    yPos += linhasObs.length * 4.5 + 4; // ajuste fino
    }
    
    // Para cada etapa - APENAS SE TIVER ITENS COM VALORES
    etapas.forEach((etapa, index) => {
        // Verificar se a etapa tem itens com valores
        const itensComValores = etapa.itens.filter(item => {
            const qtd = parseFloat(item.quantidade) || 0;
            const mao = parseFloat(item.maoObra) || 0;
            const mat = parseFloat(item.material) || 0;
            return qtd > 0 || mao > 0 || mat > 0;
        });
        
        if (itensComValores.length === 0) {
            return; // Pula etapas sem itens com valores
        }
        
        
        // Verificar se precisa de nova página
        if (yPos > maxY - 25) { // Ajustado para considerar menos espaço
            doc.addPage();
            yPos = marginTop;
            
            // Cabeçalho simples nas páginas subsequentes
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageWidth, 10, 'F');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.text(`SL CONSTRUÇÃO CIVIL - Orçamento: ${numeroOrc}`, marginLeft, 7);
            yPos = 12;
        }

        yPos += 4;
        
        // Título da etapa
        doc.setFontSize(11); // Reduzido de 12 para 11
        doc.setTextColor(15, 23, 42);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${etapa.nome}`, marginLeft, yPos);
        yPos += 5; // Reduzido de 6 para 5
        
        // Descrição da etapa (apenas se não for a descrição padrão)
        if (etapa.descricao && !etapa.descricao.includes("Clique para escolher")) {
            doc.setFontSize(8); // Reduzido de 9 para 8
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'italic');
            const descLines = doc.splitTextToSize(etapa.descricao, contentWidth);
            doc.text(descLines, marginLeft, yPos);
            yPos += (descLines.length * 3.5) + 3; // Reduzido de 4 para 3.5
        }
        
        // Tabela de itens (apenas itens com valores)
        const headers = [
            [
                { content: "Item / Descrição", styles: { halign: 'left', fontStyle: 'bold', fontSize: 7 } }, // Reduzido de 8 para 7
                { content: "Unid.", styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } },
                { content: "Quant.", styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } },
                { content: "Mão de Obra", styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } },
                { content: "Material", styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } },
                { content: "Subtotal", styles: { halign: 'center', fontStyle: 'bold', fontSize: 7 } }
            ]
        ];
        
        const data = itensComValores.map(item => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const maoObra = parseFloat(item.maoObra) || 0;
            const material = parseFloat(item.material) || 0;
            const subtotal = quantidade * (maoObra + material);
            
            return [
                { content: item.descricao || '', styles: { fontSize: 7, halign: 'left' } }, // Reduzido de 8 para 7
                { content: item.unidade || 'un', styles: { fontSize: 7, halign: 'center' } },
                { content: formatarNumero(quantidade), styles: { fontSize: 7, halign: 'right' } },
                { content: formatarNumero(maoObra), styles: { fontSize: 7, halign: 'right' } },
                { content: formatarNumero(material), styles: { fontSize: 7, halign: 'right' } },
                { content: formatarMoeda(subtotal).replace('R$ ', ''), styles: { fontSize: 7, halign: 'right', fontStyle: 'bold' } }
            ];
        });
        
        // Adiciona linha de total da etapa
        const totalEtapa = calcularTotalEtapa(etapa);
        data.push([
            { content: 'TOTAL DA ETAPA', colSpan: 5, styles: { fontSize: 8, fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } }, // Reduzido de 9 para 8
            { content: formatarMoeda(totalEtapa).replace('R$ ', ''), styles: { fontSize: 8, fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } }
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: headers,
            body: data,
            margin: { left: marginLeft, right: marginRight },
            tableWidth: contentWidth,
            styles: { 
                fontSize: 7, // Reduzido de 8 para 7
                cellPadding: 1.5, // Reduzido de 2 para 1.5
                lineColor: [200, 200, 200],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [240, 240, 240],
                textColor: [55, 65, 81],
                fontStyle: 'bold',
                lineWidth: 0.1
            },
            bodyStyles: {
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            columnStyles: {
                0: { cellWidth: contentWidth * 0.40, halign: 'left' },
                1: { cellWidth: contentWidth * 0.08, halign: 'center' },
                2: { cellWidth: contentWidth * 0.10, halign: 'right' },
                3: { cellWidth: contentWidth * 0.13, halign: 'right' },
                4: { cellWidth: contentWidth * 0.13, halign: 'right' },
                5: { cellWidth: contentWidth * 0.16, halign: 'right' }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 5; // Reduzido de 8 para 5
    });
    
    // Verificar se temos etapas com valores
    const etapasComValores = etapas.filter(etapa => {
        return etapa.itens.some(item => {
            const qtd = parseFloat(item.quantidade) || 0;
            const mao = parseFloat(item.maoObra) || 0;
            const mat = parseFloat(item.material) || 0;
            return qtd > 0 || mao > 0 || mat > 0;
        });
    });
    
    if (etapasComValores.length === 0) {
        doc.setFontSize(10); // Reduzido de 11 para 10
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'italic');
        doc.text("Nenhum item com valores definidos.", marginLeft, yPos);
        yPos += 8;
    }
    
    // TOTAL GERAL - CAIXA COMPACTO
    if (yPos > maxY - 40) { // Ajustado o limite
        doc.addPage();
        yPos = marginTop;
    }

    const totalGeral = calcularTotalGeral();
    const totalGeralText = formatarMoeda(totalGeral);

    const boxWidth  = 90;  // Reduzido de 100 para 90
    const boxHeight = 22;  // Reduzido de 25 para 22

    const boxX = pageWidth - marginRight - boxWidth;
    const boxY = yPos;

    // Caixa
    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(10, 15, 30);
    doc.setLineWidth(0.2);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');

    // Padding interno
    const padding = 5; // Reduzido de 6 para 5
    const textRightX = boxX + boxWidth - padding;

    // Título
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10); // Reduzido de 11 para 10
    doc.setTextColor(255, 255, 255);
    doc.text(
        "TOTAL GERAL",
        textRightX,
        boxY + 8, // Ajustado de 9 para 8
        { align: 'right' }
    );

    // Valor
    doc.setFontSize(14); // Reduzido de 16 para 14
    doc.text(
        totalGeralText,
        textRightX,
        boxY + 18, // Ajustado de 20 para 18
        { align: 'right' }
    );

    yPos += boxHeight + 6; // Reduzido de 8 para 6

    // RODAPÉ SIMPLIFICADO E COMPACTO
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        
        // Posicionar rodapé bem próximo do final
        const footerY = 292; // Aumentado de 285 para 292 (mais próximo do final)
        
        // Linha separadora sutil
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(marginLeft, footerY - 3, pageWidth - marginRight, footerY - 3); // Ajustado de 5 para 3
        
        // Texto do rodapé COMPACTO
        doc.setFontSize(7); // Reduzido de 8 para 7
        doc.setTextColor(100, 100, 100);
        
        // Primeira linha do rodapé
        doc.text("Sistema Integrado de Orçamentos", pageWidth / 2, footerY, { align: 'center' });
        
        // Segunda linha do rodapé - mais compacta
        doc.setFontSize(7);
        doc.text(`Responsável: ${responsavel || "---"} | Data: ${dataFormatada}`, pageWidth / 2, footerY + 3, { align: 'center' }); // Ajustado de 4 para 3
    }
    
    // Salva o PDF
    const clienteFormatado = cliente.substring(0, 30).replace(/[^a-z0-9]/gi, '_');
    const fileName = `Orcamento_SL_${clienteFormatado}_${numeroOrc}.pdf`;
    doc.save(fileName);
}

// Auto-save a cada 10 segundos
setInterval(() => {
    salvarNoLocalStorage();
}, 10000);

// Carregar projeto salvo ao iniciar
const projetoSalvo = localStorage.getItem('projeto_atual');
const ultimoAcesso = localStorage.getItem('ultimo_acesso');
const trintaMinutos = 30 * 60 * 1000; // Tempo em milissegundos
const agora = new Date().getTime();

// Verifica se os dados expiraram
let dadosExpirados = false;
if (ultimoAcesso && (agora - parseInt(ultimoAcesso) > trintaMinutos)) {
    dadosExpirados = true;
    localStorage.removeItem('projeto_atual');
    localStorage.removeItem('etapas_orcamento');
    localStorage.removeItem('ultimo_acesso');
    console.log("Rascunho antigo removido (mais de 30 min).");
}

if (projetoSalvo && !dadosExpirados) {
    try {
        const projeto = JSON.parse(projetoSalvo);
        if (projeto.nome) document.getElementById('projetoNome').value = projeto.nome;
        if (projeto.responsavel) document.getElementById('responsavelTecnico').value = projeto.responsavel;
        if (projeto.data) document.getElementById('dataOrcamento').value = projeto.data;
        if (projeto.observacoes) document.getElementById('observacoes').value = projeto.observacoes;
        
        if (projeto.etapas && projeto.etapas.length > 0) {
            etapas = projeto.etapas;
            renderizarEtapas();
        }
    } catch (e) {
        console.log('Não foi possível carregar projeto salvo');
    }
}

function zerarOrcamento() {
    // Pergunta antes de apagar para evitar acidentes
    if (confirm("⚠️ ATENÇÃO: Isso apagará todos os dados do orçamento atual. Deseja continuar?")) {
        
        // Limpa as chaves específicas que você usa
        localStorage.removeItem('projeto_atual');
        localStorage.removeItem('etapas_orcamento');
        localStorage.removeItem('ultimo_acesso'); // Se você usou o timer de 30min
        
        // Recarrega a página para limpar os campos da tela
        window.location.reload();
    }
}

// Função auxiliar para reatribuir eventos (se necessário)
function reatribuirEventos() {
    // Esta função pode ser usada para reatribuir eventos dinâmicos se necessário
}