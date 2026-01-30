// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let budgetData = {
    services: [],
    categories: {},
    totals: {
        labor: 0,
        profit: 0,
        discount: 0,
        final: 0,
        days: 0,
        manualDays: 0
    },
    settings: {
        profitMargin: 30,
        discountAmount: 0
    },
    description: '',
    createdAt: new Date().toISOString(),
    lastSaved: null,
    clientData: {
        name: '',
        address: '',
        document: ''
    },
    technicalData: {
        name: '',
        register: '',
        contact: ''
    },
    scheduleData: {
        etapas: [],
        includeInPrint: false
    }
};

let equipmentList = [];
let draggedItem = null;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getCategoryName(category) {
    const names = {
        'alvenaria': 'ALVENARIA',
        'pintura': 'PINTURA',
        'pisos': 'PISOS',
        'reboco': 'REBOCO',
        'telhado': 'TELHADO',
        'aluguel': 'ALUGUEL DE EQUIPAMENTOS',
        'personalizado': 'SERVIÇOS PERSONALIZADOS',
        'mão de obra': 'MÃO DE OBRA',
        'material': 'MATERIAL'
    };
    
    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(names)) {
        if (lowerCategory.includes(key)) {
            return value;
        }
    }
    
    return category.toUpperCase();
}

function formatarNumero(valor) {
    if (isNaN(valor)) valor = 0;
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatarData(data) {
    if (!data) return '--/--/----';
    if (typeof data === 'string') {
        data = new Date(data);
    }
    return data.toLocaleDateString('pt-BR');
}

function formatarDataParaInput(data) {
    if (!data) return '';
    if (typeof data === 'string') {
        data = new Date(data);
    }
    return data.toISOString().split('T')[0];
}

// Função para converter string brasileira para número
function parseBrazilianNumber(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    
    // Remove pontos de milhar e substitui vírgula decimal por ponto
    const cleaned = str.toString()
        .replace(/\./g, '')  // Remove pontos de milhar
        .replace(',', '.');   // Substitui vírgula decimal por ponto
    
    return parseFloat(cleaned) || 0;
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de orçamentos...');
    
    // Configurar data atual
    const now = new Date();
    document.getElementById('current-date').textContent = 
        now.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    
    // Carregar dados salvos
    loadSavedDraft();
    
    // Carregar lista de equipamentos
    loadEquipmentList();
    
    // Configurar arrastar e soltar
    setupDragAndDrop();
    
    // Atualizar interface inicial
    updateProgress();
    updateBudgetTable();
    
    // Configurar placeholders
    setupPlaceholders();
    
    // Configurar listeners para campos de cliente/responsável
    setupClientFields();
    
    // Verificar serviços importados
    setTimeout(() => {
        checkForImportedService();
        checkForPersonalizedBudget();
    }, 500);
});

function setupPlaceholders() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    editableElements.forEach(element => {
        const placeholder = element.getAttribute('data-placeholder');
        if (placeholder && element.textContent.trim() === '') {
            element.textContent = placeholder;
            element.classList.add('text-gray-400');
        }
        
        element.addEventListener('focus', function() {
            if (this.textContent === placeholder || this.textContent.trim() === '') {
                this.textContent = '';
                this.classList.remove('text-gray-400');
            }
        });
        
        element.addEventListener('blur', function() {
            if (this.textContent.trim() === '') {
                this.textContent = placeholder;
                this.classList.add('text-gray-400');
            }
        });
    });
}

function setupClientFields() {
    // Atualizar dados quando os campos forem preenchidos
    document.getElementById('client-name').addEventListener('input', function() {
        budgetData.clientData.name = this.value;
        saveDraft();
    });
    
    document.getElementById('client-address').addEventListener('input', function() {
        budgetData.clientData.address = this.value;
        saveDraft();
    });
    
    document.getElementById('client-document').addEventListener('input', function() {
        budgetData.clientData.document = this.value;
        saveDraft();
    });
    
    document.getElementById('technical-responsible').addEventListener('input', function() {
        budgetData.technicalData.name = this.value;
        saveDraft();
    });
    
    document.getElementById('technical-register').addEventListener('input', function() {
        budgetData.technicalData.register = this.value;
        saveDraft();
    });
    
    document.getElementById('technical-contact').addEventListener('input', function() {
        budgetData.technicalData.contact = this.value;
        saveDraft();
    });
}

// ============================================
// FUNÇÕES DE SERVIÇOS
// ============================================
function openServiceCalculator(type) {
    localStorage.setItem('selectedService', type);
    
    let url = '';
    switch(type) {
        case 'alvenaria':
            url = 'alvenaria-orcamento.html';
            break;
        case 'pintura':
            url = 'pintura.html';
            break;
        case 'revestimentos':
            url = 'revestimento.html';
            break;
        case 'reboco':
            url = 'reboco.html';
            break;
        case 'telhado':
            url = 'telhado.html';
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
        showToast(`Abrindo calculadora de ${type}...`, 'info');
    }
}

function openLaudoTecnico() {
    window.open('editor_laudo.html', '_blank');
    showToast('Abrindo editor de laudo técnico...', 'info');
}

function checkForImportedService() {
    const importedData = localStorage.getItem('importedServiceData');
    if (importedData) {
        try {
            const serviceData = JSON.parse(importedData);
            
            const alreadyImported = budgetData.services.some(s => 
                s.importTimestamp === serviceData.timestamp
            );
            
            if (!alreadyImported) {
                addServiceFromImport(serviceData);
                localStorage.removeItem('importedServiceData');
                
                if (serviceData.timestamp) {
                    const lastService = budgetData.services[budgetData.services.length - 1];
                    if (lastService) {
                        lastService.importTimestamp = serviceData.timestamp;
                    }
                }
            } else {
                localStorage.removeItem('importedServiceData');
            }
        } catch (error) {
            console.error('Erro ao importar serviço:', error);
            localStorage.removeItem('importedServiceData');
            showToast('Erro ao importar serviço. Formato inválido.', 'error');
        }
    }
}

function addServiceFromImport(serviceData) {
    console.log('Importando serviço:', serviceData);
    
    // Adicionar serviços do módulo específico
    if (serviceData.labor && Array.isArray(serviceData.labor)) {
        serviceData.labor.forEach(item => {
            addServiceItem({
                id: generateId(),
                category: serviceData.type || 'alvenaria',
                description: item.description || item.item || 'Serviço de alvenaria',
                quantity: item.quantity || 1,
                unit: item.unit || 'serv',
                unitPrice: parseFloat(item.unitPrice || item.price || item.total || 0),
                subtotal: parseFloat(item.total || item.unitPrice || item.price || 0),
                isLabor: true,
                days: item.days || 0
            });
        });
    } else if (serviceData.services && Array.isArray(serviceData.services)) {
        serviceData.services.forEach(item => {
            addServiceItem({
                id: generateId(),
                category: serviceData.type || 'alvenaria',
                description: item.description || item.name || 'Serviço',
                quantity: item.quantity || 1,
                unit: item.unit || 'serv',
                unitPrice: parseFloat(item.price || item.unitPrice || 0),
                subtotal: parseFloat(item.total || item.price || 0),
                isLabor: true,
                days: item.days || 0
            });
        });
    }
    
    // Adicionar materiais (com preço zero)
    if (serviceData.materials && Array.isArray(serviceData.materials)) {
        serviceData.materials.forEach(item => {
            addServiceItem({
                id: generateId(),
                category: serviceData.type || 'alvenaria',
                description: `${item.description || item.item || 'Material'} (Por conta do cliente)`,
                details: item.specification || '',
                quantity: item.quantity || 1,
                unit: item.unit || 'un',
                unitPrice: 0,
                subtotal: 0,
                isLabor: false,
                isMaterial: true
            });
        });
    }
    
    // Atualizar badge do serviço
    const serviceType = serviceData.type || 'alvenaria';
    const badge = document.getElementById(`${serviceType}-badge`);
    if (badge) {
        badge.classList.remove('hidden');
        badge.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Adicionado`;
    }
    
    // Mostrar seções adicionais
    document.getElementById('description-section').classList.remove('hidden');
    document.getElementById('signatures-section').classList.remove('hidden');
    
    // Atualizar interface
    updateProgress();
    updateTotals();
    
    showToast(`Serviço de ${getCategoryName(serviceType)} importado com sucesso!`, 'success');
}

// ============================================
// FUNÇÕES DE ALUGUEL DE EQUIPAMENTOS
// ============================================
function loadEquipmentList() {
    equipmentList = [
        { id: 1, name: 'Betoneira 400L', category: 'concreto' },
        { id: 2, name: 'Andaime Fachadeiro', category: 'acesso' },
        { id: 3, name: 'Prancha de Andaime', category: 'acesso' },
        { id: 4, name: 'Escora Metálica', category: 'apoio' },
        { id: 5, name: 'Cortadora de Piso', category: 'corte' },
        { id: 6, name: 'Martelete Demolidor', category: 'demolicao' },
        { id: 7, name: 'Serra Mármore', category: 'corte' },
        { id: 8, name: 'Compactador de Solo', category: 'terraplanagem' },
        { id: 9, name: 'Gerador 5KVA', category: 'energia' },
        { id: 10, name: 'Carrinho de Mão', category: 'transporte' }
    ];
    
    updateEquipmentTable();
}

function updateEquipmentTable() {
    const tbody = document.getElementById('equipment-list');
    tbody.innerHTML = '';
    
    equipmentList.forEach(equipment => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        row.innerHTML = `
            <td class="p-2">
                <label class="flex items-center">
                    <input type="checkbox" class="equipment-checkbox mr-2" value="${equipment.id}">
                    ${equipment.name}
                </label>
            </td>
            <td class="p-2 text-center">
                <button onclick="addSingleEquipment(${equipment.id})" 
                        class="text-rental hover:text-amber-700">
                    <i class="fas fa-plus-circle"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openEquipmentRental() {
    document.getElementById('equipment-modal').classList.remove('hidden');
}

function closeEquipmentModal() {
    document.getElementById('equipment-modal').classList.add('hidden');
}

function addSingleEquipment(id) {
    const equipment = equipmentList.find(e => e.id === id);
    if (equipment) {
        const rentalDays = parseInt(document.getElementById('rental-days').value) || 8;
        
        // Verificar se já existe um item de aluguel igual
        const existingService = budgetData.services.find(s => 
            s.isRental && 
            s.equipmentId === equipment.id
        );
        
        if (existingService) {
            // Se já existe, apenas aumentar a quantidade
            existingService.quantity += 1;
            existingService.subtotal = existingService.quantity * existingService.unitPrice;
            updateBudgetTable();
            updateTotals();
        } else {
            // Caso contrário, criar novo item
            addServiceItem({
                id: generateId(),
                category: 'aluguel',
                description: `Aluguel: ${equipment.name}`,
                quantity: 1,
                unit: 'un',
                unitPrice: 0, // Inicialmente zero, para o usuário editar
                subtotal: 0,
                isLabor: false,
                isRental: true,
                equipmentId: equipment.id,
                rentalDays: rentalDays
            });
        }
        
        // Atualizar badge
        document.getElementById('aluguel-badge').classList.remove('hidden');
        
        showToast(`${equipment.name} adicionado ao orçamento`, 'success');
    }
}

function addSelectedEquipment() {
    const checkboxes = document.querySelectorAll('.equipment-checkbox:checked');
    const rentalDays = parseInt(document.getElementById('rental-days').value) || 8;
    
    if (checkboxes.length === 0) {
        showToast('Selecione pelo menos um equipamento', 'warning');
        return;
    }
    
    checkboxes.forEach(checkbox => {
        const id = parseInt(checkbox.value);
        const equipment = equipmentList.find(e => e.id === id);
        if (equipment) {
            // Verificar se já existe um item de aluguel igual
            const existingService = budgetData.services.find(s => 
                s.isRental && 
                s.equipmentId === equipment.id
            );
            
            if (existingService) {
                existingService.quantity += 1;
                existingService.subtotal = existingService.quantity * existingService.unitPrice;
            } else {
                addServiceItem({
                    id: generateId(),
                    category: 'aluguel',
                    description: `Aluguel: ${equipment.name}`,
                    quantity: 1,
                    unit: 'un',
                    unitPrice: 0,
                    subtotal: 0,
                    isLabor: false,
                    isRental: true,
                    equipmentId: equipment.id,
                    rentalDays: rentalDays
                });
            }
        }
    });
    
    // Atualizar badge
    document.getElementById('aluguel-badge').classList.remove('hidden');
    
    closeEquipmentModal();
    updateBudgetTable();
    updateTotals();
    showToast(`${checkboxes.length} equipamento(s) adicionado(s)`, 'success');
}

// ============================================
// FUNÇÕES DE SERVIÇO PERSONALIZADO
// ============================================
function addCustomService() {
    document.getElementById('custom-service-modal').classList.remove('hidden');
}

function closeCustomModal() {
    document.getElementById('custom-service-modal').classList.add('hidden');
}

function addCustomServiceItem() {
    const description = document.getElementById('custom-description').value.trim();
    const quantity = parseFloat(document.getElementById('custom-quantity').value) || 1;
    const unit = document.getElementById('custom-unit').value;
    const unitPrice = parseFloat(document.getElementById('custom-price').value) || 0;
    const category = document.getElementById('custom-category').value;
    const days = parseInt(document.getElementById('custom-days').value) || 0;
    
    if (!description) {
        showToast('Digite uma descrição para o serviço', 'warning');
        return;
    }
    
    addServiceItem({
        id: generateId(),
        category: category,
        description: description,
        quantity: quantity,
        unit: unit,
        unitPrice: unitPrice,
        subtotal: unitPrice * quantity,
        isLabor: category === 'mão de obra' || category === 'personalizado',
        isCustom: true,
        days: days
    });
    
    // Limpar e fechar modal
    document.getElementById('custom-description').value = '';
    document.getElementById('custom-price').value = '0';
    document.getElementById('custom-days').value = '0';
    closeCustomModal();
    
    showToast('Serviço personalizado adicionado', 'success');
}

// ============================================
// FUNÇÕES DA TABELA DE ORÇAMENTO
// ============================================
function addServiceItem(item) {
    // Aplicar formatação especial para itens de arquitetura personalizada
    if (item.importSource === 'personalizado_arquitetura') {
        if (item.isHeader) {
            item.description = `📋 ${item.description}`;
        } else if (item.isTotal) {
            item.description = `💰 ${item.description}`;
            item.description = item.description.toUpperCase();
        } else if (item.isGrandTotal) {
            item.description = `🏛️ ${item.description}`;
            item.description = item.description.toUpperCase();
            item.description += ` (PROJETO DE ARQUITETURA)`;
        } else if (item.isSeparator) {
            // Manter como está
        } else {
            item.description = `   ${item.description}`;
        }
    }
    
    budgetData.services.push(item);
    
    if (!budgetData.categories[item.category]) {
        budgetData.categories[item.category] = {
            total: 0,
            count: 0
        };
    }
    budgetData.categories[item.category].total += item.subtotal;
    budgetData.categories[item.category].count++;
    
    updateBudgetTable();
    updateTotals();
    
    const emptyMessage = document.getElementById('empty-table-message');
    if (emptyMessage) {
        emptyMessage.classList.add('hidden');
    }
    
    saveDraft();
}

function updateBudgetTable() {
    const tbody = document.getElementById('budget-table-body');
    
    if (budgetData.services.length > 0) {
        const emptyRow = document.getElementById('empty-table-message');
        if (emptyRow) {
            emptyRow.remove();
        }
    } else {
        if (!document.getElementById('empty-table-message')) {
            const emptyRow = document.createElement('tr');
            emptyRow.id = 'empty-table-message';
            emptyRow.innerHTML = `
                <td colspan="7" class="p-8 text-center text-gray-500">
                    <i class="fas fa-calculator text-4xl mb-3 opacity-50"></i>
                    <p class="text-lg font-medium">Nenhum serviço adicionado</p>
                    <p class="text-sm mt-1">Selecione um serviço acima para começar o orçamento</p>
                </td>
            `;
            tbody.appendChild(emptyRow);
        }
        return;
    }
    
    tbody.innerHTML = '';
    
    // Recalcular categorias para evitar duplicação
    budgetData.categories = {};
    
    budgetData.services.forEach((service, index) => {
        // Ignorar itens que são totais, totais gerais, separadores ou cabeçalhos no cálculo das categorias
        if (!service.isTotal && !service.isGrandTotal && !service.isSeparator && !service.isHeader) {
            const category = service.category || 'personalizado';
            if (!budgetData.categories[category]) {
                budgetData.categories[category] = {
                    total: 0,
                    count: 0
                };
            }
            budgetData.categories[category].total += service.subtotal;
            budgetData.categories[category].count++;
        }
        
        // Renderizar linha do serviço
        if (service.isHeader || service.description.includes('ETAPA')) {
            const row = document.createElement('tr');
            row.className = 'bg-blue-50 font-bold';
            row.innerHTML = `
                <td colspan="7" class="p-4 text-primary border-b-2 border-blue-200">
                    ${service.description}
                </td>
            `;
            tbody.appendChild(row);
        } else if (service.isSeparator) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="p-2">
                    <div class="border-b border-gray-200"></div>
                </td>
            `;
            tbody.appendChild(row);
        } else if (service.isTotal || service.isGrandTotal) {
            const row = createSpecialRow(service);
            tbody.appendChild(row);
        } else {
            const row = createServiceRow(service);
            tbody.appendChild(row);
        }
    });
    
    updateCategoryTotals();
}

function createServiceRow(service) {
    const row = document.createElement('tr');
    
    // Aplicar classes CSS baseadas no tipo de item
    let rowClass = '';
    if (service.isRental) {
        rowClass = 'rental-item rental-edit';
    } else if (service.isMaterial) {
        rowClass = 'bg-green-50';
    } else {
        rowClass = 'hover:bg-gray-50';
    }
    
    row.className = rowClass;
    row.draggable = true;
    row.dataset.id = service.id;
    
    const hasDetails = service.details || service.specification;
    const tooltipAttr = hasDetails ? `title="${service.details || service.specification}"` : '';
    
    // Classe especial para aluguel (campo de valor editável)
    const priceClass = service.isRental ? 'rental-edit bg-yellow-50' : '';
    
    // CORREÇÃO: Para campos type="number", usar valor numérico com ponto decimal
    const unitPriceValue = service.unitPrice; // Já é número
    const unitPriceDisplay = formatarNumero(service.unitPrice); // Para exibição
    
    row.innerHTML = `
        <td class="p-3 drag-handle text-center text-gray-400">
            <i class="fas fa-grip-vertical"></i>
        </td>
        <td class="p-3" ${tooltipAttr}>
            <div class="flex flex-col">
                <div class="font-medium">${service.description}</div>
                ${hasDetails ? `<div class="text-xs text-gray-500 mt-1">${service.details || service.specification}</div>` : ''}
            </div>
        </td>
        <td class="p-3">
            <input type="number" 
                value="${service.quantity}" 
                min="0" 
                step="${service.unit === 'dia' || service.unit === 'hora' ? '0.5' : '1'}"
                class="quantity-input w-full text-center border rounded px-2 py-1"
                onchange="updateServiceQuantity('${service.id}', this.value)">
        </td>
        <td class="p-3 text-center">
            <span class="unit-display">${getUnitDisplay(service.unit)}</span>
        </td>
        <td class="p-3">
            <div class="flex items-center">
                <span class="text-gray-500 mr-1">R$</span>
                <input type="number" 
                    value="${unitPriceValue}" 
                    min="0" 
                    step="0.01"
                    class="price-input w-full text-right border rounded px-2 py-1 ${priceClass}"
                    onchange="updateServicePrice('${service.id}', this.value)"
                    ${service.isMaterial ? 'disabled' : ''}>
            </div>
        </td>
        <td class="p-3 text-center font-bold">
            R$ ${formatarNumero(service.quantity * service.unitPrice)}
        </td>
        <td class="p-3 text-center actions-column">
            <button onclick="removeService('${service.id}')" 
                    class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    return row;
}

function createSpecialRow(service) {
    const row = document.createElement('tr');
    
    if (service.isSeparator) {
        row.innerHTML = `
            <td colspan="7" class="p-2">
                <div class="border-t border-gray-300"></div>
            </td>
        `;
    } else if (service.isTotal) {
        row.className = 'bg-green-50 font-bold';
        row.innerHTML = `
            <td colspan="5" class="p-3 text-right">
                ${service.description}
            </td>
            <td class="p-3 text-center font-bold">
                R$ ${formatarNumero(service.subtotal)}
            </td>
            <td class="p-3 text-center actions-column">
                <button onclick="removeService('${service.id}')" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
    } else if (service.isGrandTotal) {
        // CORREÇÃO: Para o TOTAL GERAL DO PROJETO, calcular o total REAL dos itens de arquitetura
        let displayTotal = service.subtotal;
        
        // Se o subtotal for 0 (porque definimos assim para não duplicar), calcular a soma real
        if (displayTotal === 0 && service.importSource === 'personalizado_arquitetura') {
            displayTotal = budgetData.services
                .filter(s => s.importSource === 'personalizado_arquitetura' && !s.isGrandTotal && !s.isSeparator && !s.isHeader)
                .reduce((sum, s) => sum + s.subtotal, 0);
        }
        
        row.className = 'bg-blue-100 font-bold text-lg';
        row.innerHTML = `
            <td colspan="5" class="p-4 text-right">
                ${service.description}
            </td>
            <td class="p-4 text-center font-bold">
                R$ ${formatarNumero(displayTotal)}
            </td>
            <td class="p-4 text-center actions-column">
                <button onclick="removeService('${service.id}')" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
    }
    
    return row;
}

function getUnitDisplay(unit) {
    const units = {
        'serv': 'Serviço',
        'dia': 'Dia',
        'hora': 'Hora',
        'm²': 'm²',
        'm': 'm',
        'un': 'Unidade',
        'etapa': 'Etapa',
        'total': 'Total',
        'projeto': 'Projeto',
        'separador': '─'
    };
    return units[unit] || unit;
}

function updateServiceQuantity(id, newQuantity) {
    const service = budgetData.services.find(s => s.id === id);
    if (service) {
        service.quantity = parseFloat(newQuantity);
        service.subtotal = service.quantity * service.unitPrice;
        updateBudgetTable();
        updateTotals();
        saveDraft();
    }
}

function updateServicePrice(id, newPrice) {
    const service = budgetData.services.find(s => s.id === id);
    if (service) {
        // Usar parser para aceitar tanto "1500.00" quanto "1.500,00"
        service.unitPrice = parseBrazilianNumber(newPrice);
        service.subtotal = service.quantity * service.unitPrice;
        updateBudgetTable();
        updateTotals();
        saveDraft();
    }
}

function removeService(id) {
    if (confirm('Remover este item do orçamento?')) {
        const service = budgetData.services.find(s => s.id === id);
        if (service) {
            const category = budgetData.categories[service.category];
            if (category) {
                category.total -= service.subtotal;
                category.count--;
                if (category.count === 0) {
                    delete budgetData.categories[service.category];
                }
            }
            
            budgetData.services = budgetData.services.filter(s => s.id !== id);
            
            const serviceType = service.category;
            const remainingServices = budgetData.services.filter(s => s.category === serviceType);
            if (remainingServices.length === 0) {
                const badge = document.getElementById(`${serviceType}-badge`);
                if (badge) {
                    badge.classList.add('hidden');
                }
            }
            
            updateBudgetTable();
            updateTotals();
            
            if (budgetData.services.length === 0) {
                document.getElementById('description-section').classList.add('hidden');
                document.getElementById('signatures-section').classList.add('hidden');
            }
            
            saveDraft();
            showToast('Item removido', 'info');
        }
    }
}

function updateCategoryTotals() {
    const tbody = document.getElementById('category-totals');
    tbody.innerHTML = '';
    
    // Filtrar apenas categorias que possuem serviços reais (não totais, não separadores, não cabeçalhos, não totais gerais, não display only)
    const realCategories = {};
    
    budgetData.services.forEach(service => {
        // Ignorar itens especiais que não devem ser somados
        if (!service.isTotal && !service.isGrandTotal && !service.isSeparator && !service.isHeader && !service.isDisplayOnly) {
            const category = service.category || 'personalizado';
            if (!realCategories[category]) {
                realCategories[category] = 0;
            }
            realCategories[category] += service.subtotal;
        }
    });
    
    Object.keys(realCategories).forEach(category => {
        const total = realCategories[category];
        if (total > 0) {
            const row = document.createElement('tr');
            row.className = 'bg-gray-100';
            row.innerHTML = `
                <td colspan="5" class="p-3 text-right font-bold">
                    Total ${getCategoryName(category)}:
                </td>
                <td class="p-3 text-center font-bold">
                    R$ ${formatarNumero(total)}
                </td>
                <td class="p-3 actions-column"></td>
            `;
            tbody.appendChild(row);
        }
    });
}

// ============================================
// FUNÇÕES DE CÁLCULO E TOTAIS
// ============================================
function updateTotals() {
    // Calcular total de mão de obra (excluindo totais gerais)
    const laborTotal = budgetData.services
        .filter(s => s.isLabor && !s.isGrandTotal && !s.isTotal && !s.isHeader)
        .reduce((sum, service) => sum + service.subtotal, 0);
    
    // Calcular total de aluguéis
    const rentalTotal = budgetData.services
        .filter(s => s.isRental && !s.isGrandTotal)
        .reduce((sum, service) => sum + service.subtotal, 0);
    
    // Aplicar margem de lucro (internamente, mas não mostrar)
    const profitMargin = budgetData.settings.profitMargin || 0;
    const profitAmount = laborTotal * (profitMargin / 100);
    
    // Aplicar desconto
    const discountAmount = budgetData.settings.discountAmount || 0;
    
    // Calcular total final (incluindo lucro, mas não mostrar)
    const finalTotal = laborTotal + rentalTotal + profitAmount - discountAmount;
    
    // Atualizar variáveis
    budgetData.totals.labor = laborTotal;
    budgetData.totals.profit = profitAmount;
    budgetData.totals.discount = discountAmount;
    budgetData.totals.final = finalTotal;
    
    // Atualizar interface - NÃO MOSTRAR LUCRO
    document.getElementById('total-labor').textContent = `R$ ${formatarNumero(laborTotal)}`;
    document.getElementById('total-final').textContent = `R$ ${formatarNumero(finalTotal)}`;
    
    // Mostrar/ocultar linha de DESCONTO APENAS (não mostrar lucro)
    const profitRow = document.getElementById('profit-discount-row');
    const profitAmountSpan = document.getElementById('profit-discount-amount');
    
    if (discountAmount !== 0) {
        profitRow.classList.remove('hidden');
        profitAmountSpan.innerHTML = `- Desconto: R$ ${formatarNumero(discountAmount)}`;
        profitRow.classList.add('has-discount');
    } else {
        profitRow.classList.add('hidden');
        profitRow.classList.remove('has-discount');
    }
    
    // Atualizar progresso
    updateProgress();
}

function updateSchedule() {
    // Se houver um prazo manual definido, usa ele
    const manualDays = budgetData.totals.manualDays || 0;
    
    // Calcular dias totais apenas dos serviços de mão de obra (não conta aluguel)
    const laborDays = budgetData.services
        .filter(s => s.isLabor && !s.isRental)
        .reduce((sum, service) => sum + (service.days || 0), 0);
    
    // Usar o maior valor entre manualDays e laborDays
    const totalDays = Math.max(manualDays, laborDays);
    budgetData.totals.days = totalDays;
    
    // Atualizar interface se houver serviços ou se houver um prazo manual definido
    if (budgetData.services.length > 0 || manualDays > 0) {
        const scheduleSection = document.getElementById('schedule-summary');
        scheduleSection.classList.remove('hidden');
        
        document.getElementById('total-days-display').textContent = `${totalDays} dias`;
        
        // Calcular datas
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + totalDays);
        
        document.getElementById('start-date').textContent = 
            startDate.toLocaleDateString('pt-BR');
        document.getElementById('end-date').textContent = 
            endDate.toLocaleDateString('pt-BR');
    }
}

function toggleProfitControls() {
    const controls = document.getElementById('profit-controls');
    controls.classList.toggle('hidden');
}

function applyProfitMargin() {
    const margin = parseFloat(document.getElementById('profit-margin').value);
    if (!isNaN(margin) && margin >= 0 && margin <= 100) {
        budgetData.settings.profitMargin = margin;
        updateTotals();
        saveDraft();
        showToast(`Margem de lucro definida em ${margin}% (não exibida no orçamento)`, 'success');
    }
}

function applyDiscount() {
    const discount = parseFloat(document.getElementById('discount').value);
    if (!isNaN(discount) && discount >= 0) {
        budgetData.settings.discountAmount = discount;
        updateTotals();
        saveDraft();
        showToast(`Desconto de R$ ${formatarNumero(discount)} aplicado`, 'success');
    }
}

function applySchedule() {
    const days = parseInt(document.getElementById('total-days').value);
    if (!isNaN(days) && days >= 0) {
        budgetData.totals.manualDays = days;
        updateSchedule();
        saveDraft();
        showToast(`Prazo definido em ${days} dias`, 'success');
        
        // Abrir modal de planejamento de cronograma
        setTimeout(() => {
            showScheduleModal();
        }, 500);
    }
}

// ============================================
// FUNÇÕES DE CRONOGRAMA
// ============================================
function showScheduleModal() {
    const totalDays = budgetData.totals.days || 0;
    if (totalDays <= 0) {
        showToast('Defina um prazo total primeiro', 'warning');
        return;
    }
    
    // Identificar etapas reais (sem os totais de etapa)
    const etapasReais = [];
    let etapaAtual = null;
    
    budgetData.services.forEach((service, index) => {
        // Detectar cabeçalhos de etapa (começam com ETAPA ou 📋)
        if (service.description.includes('ETAPA') || service.isHeader) {
            if (etapaAtual && etapaAtual.servicos.length > 0) {
                etapasReais.push({...etapaAtual});
            }
            
            const etapaNome = service.description.replace('📋 ', '').replace('ETAPA ', '').split(':')[1]?.trim() || 
                             service.description.replace('ETAPA ', '').split(':')[0]?.trim() || 
                             `ETAPA ${etapasReais.length + 1}`;
            
            etapaAtual = {
                id: `etapa-${Date.now()}-${index}`,
                nome: etapaNome,
                dias: 0,
                dataInicio: null,
                dataFim: null,
                servicos: []
            };
        } else if (etapaAtual && !service.isSeparator && !service.isTotal && !service.isGrandTotal) {
            etapaAtual.servicos.push(service.description);
        }
    });
    
    // Adicionar última etapa
    if (etapaAtual && etapaAtual.servicos.length > 0) {
        etapasReais.push(etapaAtual);
    }
    
    // Se não encontrou etapas, criar etapas baseadas nas categorias
    if (etapasReais.length === 0) {
        const categorias = {};
        
        budgetData.services.forEach(service => {
            if (!service.isSeparator && !service.isTotal && !service.isGrandTotal && !service.isHeader) {
                const categoria = service.category || 'GERAL';
                if (!categorias[categoria]) {
                    categorias[categoria] = [];
                }
                categorias[categoria].push(service.description);
            }
        });
        
        Object.keys(categorias).forEach((categoria, index) => {
            etapasReais.push({
                id: `etapa-${Date.now()}-${index}`,
                nome: categoria.toUpperCase(),
                dias: 0,
                dataInicio: null,
                dataFim: null,
                servicos: categorias[categoria]
            });
        });
    }
    
    // Calcular dias por etapa (distribuir igualmente se não tiver dias definidos)
    const diasPorEtapa = Math.ceil(totalDays / Math.max(etapasReais.length, 1));
    etapasReais.forEach((etapa, index) => {
        if (etapa.dias === 0) {
            etapa.dias = diasPorEtapa;
        }
    });
    
    // Salvar etapas
    budgetData.scheduleData.etapas = etapasReais;
    
    // Calcular datas iniciais
    const dataInicioProjeto = new Date();
    calcularDatasEtapas(etapasReais, dataInicioProjeto);
    
    // Criar modal de cronograma
    const modalHTML = `
        <div id="schedule-modal" class="modal-overlay" style="display: flex;">
            <div class="modal-content p-6" style="max-width: 900px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-primary">Planejamento de Cronograma - Calendário Real</h3>
                    <button onclick="closeScheduleModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="mb-4">
                    <p class="text-gray-600 mb-2">Prazo Total: <span class="font-bold">${totalDays} dias úteis</span></p>
                    <p class="text-gray-600 text-sm">Defina datas reais para cada etapa do projeto:</p>
                </div>
                
                <div id="schedule-etapas-container" class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    <!-- Etapas serão geradas aqui -->
                </div>
                
                <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 class="font-bold text-blue-800 mb-2">Resumo do Cronograma</h4>
                    <div id="schedule-summary-details" class="text-sm">
                        <!-- Resumo será atualizado aqui -->
                    </div>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <input type="checkbox" id="include-schedule-in-print" class="mr-2" ${budgetData.scheduleData.includeInPrint ? 'checked' : ''}>
                        <label for="include-schedule-in-print" class="text-sm">Incluir cronograma no orçamento impresso</label>
                    </div>
                    <div>
                        <button onclick="autoDistributeDates()" class="bg-blue-500 text-white px-4 py-2 rounded text-sm mr-2">
                            <i class="fas fa-calendar-alt mr-1"></i>Distribuir Automaticamente
                        </button>
                        <button onclick="saveSchedule()" class="bg-green-600 text-white px-4 py-2 rounded text-sm">
                            <i class="fas fa-save mr-1"></i>Salvar Cronograma
                        </button>
                    </div>
                </div>
                
                <div class="text-sm text-gray-500">
                    <p><i class="fas fa-info-circle mr-1"></i> As datas consideram apenas dias úteis. Ajuste conforme feriados e disponibilidade.</p>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    generateScheduleEtapasComDatas(etapasReais, totalDays);
    updateScheduleSummaryDetails(etapasReais);
}

function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) modal.remove();
}

function generateScheduleEtapasComDatas(etapas, totalDays) {
    const container = document.getElementById('schedule-etapas-container');
    container.innerHTML = '';
    
    etapas.forEach((etapa, index) => {
        const etapaElement = document.createElement('div');
        etapaElement.className = 'border border-gray-200 rounded p-4 bg-gray-50';
        etapaElement.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-gray-800">${index + 1}. ${etapa.nome}</h4>
                <div class="text-sm text-gray-600">
                    <span id="days-display-${etapa.id}">${etapa.dias} dia(s)</span>
                </div>
            </div>
            
            ${etapa.servicos.length > 0 ? `
            <div class="mb-3">
                <p class="text-sm text-gray-600 mb-1">Serviços incluídos:</p>
                <ul class="text-sm text-gray-500 pl-4">
                    ${etapa.servicos.slice(0, 3).map(serv => `<li class="mb-1">• ${serv.substring(0, 50)}${serv.length > 50 ? '...' : ''}</li>`).join('')}
                    ${etapa.servicos.length > 3 ? `<li class="text-gray-400">+ mais ${etapa.servicos.length - 3} serviço(s)</li>` : ''}
                </ul>
            </div>
            ` : ''}
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                    <input type="date" id="data-inicio-${etapa.id}" 
                           value="${etapa.dataInicio ? formatarDataParaInput(etapa.dataInicio) : ''}"
                           class="w-full px-3 py-2 border rounded data-inicio-input"
                           data-etapa-id="${etapa.id}"
                           onchange="updateEtapaDataInicio('${etapa.id}', this.value)">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duração (dias)</label>
                    <input type="number" id="dias-${etapa.id}" min="1" max="${totalDays}"
                           value="${etapa.dias}"
                           class="w-full px-3 py-2 border rounded dias-input"
                           data-etapa-id="${etapa.id}"
                           onchange="updateEtapaDias('${etapa.id}', this.value, ${totalDays})">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                    <input type="date" id="data-fim-${etapa.id}"
                           value="${etapa.dataFim ? formatarDataParaInput(etapa.dataFim) : ''}"
                           class="w-full px-3 py-2 border rounded data-fim-input"
                           data-etapa-id="${etapa.id}"
                           onchange="updateEtapaDataFim('${etapa.id}', this.value)">
                </div>
            </div>
            
            <div class="mt-3 text-xs text-gray-500">
                <i class="fas fa-calendar-day mr-1"></i>
                <span id="info-datas-${etapa.id}">
                    ${etapa.dataInicio && etapa.dataFim ? 
                      `${formatarData(etapa.dataInicio)} a ${formatarData(etapa.dataFim)}` : 
                      'Datas não definidas'}
                </span>
            </div>
        `;
        container.appendChild(etapaElement);
    });
}

function calcularDatasEtapas(etapas, dataInicioProjeto) {
    let dataAtual = new Date(dataInicioProjeto);
    
    etapas.forEach((etapa, index) => {
        if (index === 0) {
            etapa.dataInicio = dataAtual;
        } else {
            // Começa no dia seguinte ao término da etapa anterior
            const dataAnteriorFim = new Date(etapas[index-1].dataFim);
            dataAtual = new Date(dataAnteriorFim);
            dataAtual.setDate(dataAtual.getDate() + 1);
            etapa.dataInicio = dataAtual;
        }
        
        // Calcular data de término
        const dataFim = new Date(dataAtual);
        dataFim.setDate(dataFim.getDate() + etapa.dias - 1); // -1 porque conta o dia inicial
        etapa.dataFim = dataFim;
        
        // Atualizar dataAtual para próxima iteração
        dataAtual = new Date(dataFim);
    });
}

function updateEtapaDataInicio(etapaId, dataInicio) {
    const etapa = budgetData.scheduleData.etapas.find(e => e.id === etapaId);
    if (!etapa || !dataInicio) return;
    
    etapa.dataInicio = new Date(dataInicio);
    
    // Recalcular data de término baseada na duração
    if (etapa.dias > 0) {
        const dataFim = new Date(etapa.dataInicio);
        dataFim.setDate(dataFim.getDate() + etapa.dias - 1);
        etapa.dataFim = dataFim;
        
        // Atualizar campo de data de término
        const inputFim = document.getElementById(`data-fim-${etapaId}`);
        if (inputFim) {
            inputFim.value = formatarDataParaInput(etapa.dataFim);
        }
    }
    
    // Recalcular datas das etapas seguintes
    const index = budgetData.scheduleData.etapas.findIndex(e => e.id === etapaId);
    for (let i = index + 1; i < budgetData.scheduleData.etapas.length; i++) {
        const etapaSeguinte = budgetData.scheduleData.etapas[i];
        const etapaAnterior = budgetData.scheduleData.etapas[i-1];
        
        if (etapaAnterior.dataFim) {
            const dataInicioSeguinte = new Date(etapaAnterior.dataFim);
            dataInicioSeguinte.setDate(dataInicioSeguinte.getDate() + 1);
            etapaSeguinte.dataInicio = dataInicioSeguinte;
            
            // Atualizar campos na interface
            const inputInicioSeguinte = document.getElementById(`data-inicio-${etapaSeguinte.id}`);
            if (inputInicioSeguinte) {
                inputInicioSeguinte.value = formatarDataParaInput(etapaSeguinte.dataInicio);
            }
            
            // Recalcular data de término
            if (etapaSeguinte.dias > 0) {
                const dataFimSeguinte = new Date(etapaSeguinte.dataInicio);
                dataFimSeguinte.setDate(dataFimSeguinte.getDate() + etapaSeguinte.dias - 1);
                etapaSeguinte.dataFim = dataFimSeguinte;
                
                const inputFimSeguinte = document.getElementById(`data-fim-${etapaSeguinte.id}`);
                if (inputFimSeguinte) {
                    inputFimSeguinte.value = formatarDataParaInput(etapaSeguinte.dataFim);
                }
            }
        }
    }
    
    updateInfoDatas(etapaId);
    updateScheduleSummaryDetails(budgetData.scheduleData.etapas);
}

function updateEtapaDias(etapaId, dias, totalDays) {
    const etapa = budgetData.scheduleData.etapas.find(e => e.id === etapaId);
    if (!etapa) return;
    
    dias = parseInt(dias);
    if (isNaN(dias) || dias < 1) dias = 1;
    if (dias > totalDays) dias = totalDays;
    
    etapa.dias = dias;
    
    // Atualizar display de dias
    const daysDisplay = document.getElementById(`days-display-${etapaId}`);
    if (daysDisplay) {
        daysDisplay.textContent = `${dias} dia(s)`;
    }
    
    // Recalcular data de término
    if (etapa.dataInicio) {
        const dataFim = new Date(etapa.dataInicio);
        dataFim.setDate(dataFim.getDate() + dias - 1);
        etapa.dataFim = dataFim;
        
        // Atualizar campo de data de término
        const inputFim = document.getElementById(`data-fim-${etapaId}`);
        if (inputFim) {
            inputFim.value = formatarDataParaInput(etapa.dataFim);
        }
    }
    
    // Recalcular datas das etapas seguintes
    const index = budgetData.scheduleData.etapas.findIndex(e => e.id === etapaId);
    for (let i = index + 1; i < budgetData.scheduleData.etapas.length; i++) {
        const etapaSeguinte = budgetData.scheduleData.etapas[i];
        const etapaAnterior = budgetData.scheduleData.etapas[i-1];
        
        if (etapaAnterior.dataFim) {
            const dataInicioSeguinte = new Date(etapaAnterior.dataFim);
            dataInicioSeguinte.setDate(dataInicioSeguinte.getDate() + 1);
            etapaSeguinte.dataInicio = dataInicioSeguinte;
            
            // Atualizar campos na interface
            const inputInicioSeguinte = document.getElementById(`data-inicio-${etapaSeguinte.id}`);
            if (inputInicioSeguinte) {
                inputInicioSeguinte.value = formatarDataParaInput(etapaSeguinte.dataInicio);
            }
            
            // Recalcular data de término
            if (etapaSeguinte.dias > 0) {
                const dataFimSeguinte = new Date(etapaSeguinte.dataInicio);
                dataFimSeguinte.setDate(dataFimSeguinte.getDate() + etapaSeguinte.dias - 1);
                etapaSeguinte.dataFim = dataFimSeguinte;
                
                const inputFimSeguinte = document.getElementById(`data-fim-${etapaSeguinte.id}`);
                if (inputFimSeguinte) {
                    inputFimSeguinte.value = formatarDataParaInput(etapaSeguinte.dataFim);
                }
            }
        }
    }
    
    updateInfoDatas(etapaId);
    updateScheduleSummaryDetails(budgetData.scheduleData.etapas);
}

function updateEtapaDataFim(etapaId, dataFim) {
    const etapa = budgetData.scheduleData.etapas.find(e => e.id === etapaId);
    if (!etapa || !dataFim || !etapa.dataInicio) return;
    
    const dataFimDate = new Date(dataFim);
    const dataInicioDate = new Date(etapa.dataInicio);
    
    // Calcular diferença em dias
    const diffTime = Math.abs(dataFimDate - dataInicioDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia inicial
    
    if (diffDays > 0) {
        etapa.dias = diffDays;
        etapa.dataFim = dataFimDate;
        
        // Atualizar campos
        const daysInput = document.getElementById(`dias-${etapaId}`);
        if (daysInput) {
            daysInput.value = diffDays;
        }
        
        const daysDisplay = document.getElementById(`days-display-${etapaId}`);
        if (daysDisplay) {
            daysDisplay.textContent = `${diffDays} dia(s)`;
        }
        
        // Recalcular datas das etapas seguintes
        const index = budgetData.scheduleData.etapas.findIndex(e => e.id === etapaId);
        for (let i = index + 1; i < budgetData.scheduleData.etapas.length; i++) {
            const etapaSeguinte = budgetData.scheduleData.etapas[i];
            const etapaAnterior = budgetData.scheduleData.etapas[i-1];
            
            if (etapaAnterior.dataFim) {
                const dataInicioSeguinte = new Date(etapaAnterior.dataFim);
                dataInicioSeguinte.setDate(dataInicioSeguinte.getDate() + 1);
                etapaSeguinte.dataInicio = dataInicioSeguinte;
                
                // Atualizar campos na interface
                const inputInicioSeguinte = document.getElementById(`data-inicio-${etapaSeguinte.id}`);
                if (inputInicioSeguinte) {
                    inputInicioSeguinte.value = formatarDataParaInput(etapaSeguinte.dataInicio);
                }
                
                // Recalcular data de término
                if (etapaSeguinte.dias > 0) {
                    const dataFimSeguinte = new Date(etapaSeguinte.dataInicio);
                    dataFimSeguinte.setDate(dataFimSeguinte.getDate() + etapaSeguinte.dias - 1);
                    etapaSeguinte.dataFim = dataFimSeguinte;
                    
                    const inputFimSeguinte = document.getElementById(`data-fim-${etapaSeguinte.id}`);
                    if (inputFimSeguinte) {
                        inputFimSeguinte.value = formatarDataParaInput(etapaSeguinte.dataFim);
                    }
                }
            }
        }
        
        updateInfoDatas(etapaId);
        updateScheduleSummaryDetails(budgetData.scheduleData.etapas);
    }
}

function updateInfoDatas(etapaId) {
    const etapa = budgetData.scheduleData.etapas.find(e => e.id === etapaId);
    if (!etapa) return;
    
    const infoElement = document.getElementById(`info-datas-${etapaId}`);
    if (infoElement && etapa.dataInicio && etapa.dataFim) {
        infoElement.textContent = `${formatarData(etapa.dataInicio)} a ${formatarData(etapa.dataFim)}`;
    }
}

function updateScheduleSummaryDetails(etapas) {
    const summaryContainer = document.getElementById('schedule-summary-details');
    if (!summaryContainer) return;
    
    if (!etapas || etapas.length === 0) {
        summaryContainer.innerHTML = '<p class="text-gray-600">Nenhuma etapa definida.</p>';
        return;
    }
    
    // Calcular totais
    const totalDias = etapas.reduce((sum, etapa) => sum + etapa.dias, 0);
    const dataInicioProjeto = etapas[0]?.dataInicio;
    const dataFimProjeto = etapas[etapas.length - 1]?.dataFim;
    
    let summaryHTML = `
        <div class="grid grid-cols-3 gap-4 mb-3">
            <div class="text-center">
                <div class="text-xs text-gray-600">Início do Projeto</div>
                <div class="font-bold">${dataInicioProjeto ? formatarData(dataInicioProjeto) : '--/--/----'}</div>
            </div>
            <div class="text-center">
                <div class="text-xs text-gray-600">Término do Projeto</div>
                <div class="font-bold">${dataFimProjeto ? formatarData(dataFimProjeto) : '--/--/----'}</div>
            </div>
            <div class="text-center">
                <div class="text-xs text-gray-600">Duração Total</div>
                <div class="font-bold">${totalDias} dias</div>
            </div>
        </div>
        
        <div class="mt-3">
            <div class="text-xs font-medium text-gray-700 mb-2">Linha do Tempo:</div>
            <div class="space-y-2">
    `;
    
    etapas.forEach((etapa, index) => {
        const widthPercent = Math.min(100, Math.max(10, (etapa.dias / totalDias) * 100));
        summaryHTML += `
            <div>
                <div class="flex justify-between text-xs mb-1">
                    <span class="font-medium">${index + 1}. ${etapa.nome}</span>
                    <span class="text-gray-600">${etapa.dias} dia(s)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${widthPercent}%"></div>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    ${etapa.dataInicio && etapa.dataFim ? 
                      `${formatarData(etapa.dataInicio)} - ${formatarData(etapa.dataFim)}` : 
                      'Datas não definidas'}
                </div>
            </div>
        `;
    });
    
    summaryHTML += `
            </div>
        </div>
        
        <div class="mt-4 text-xs text-gray-600 italic">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            Considerar finais de semana, feriados e possíveis imprevistos no planejamento.
        </div>
    `;
    
    summaryContainer.innerHTML = summaryHTML;
}

function autoDistributeDates() {
    const totalDays = parseInt(document.getElementById('total-days').value) || 0;
    const etapas = budgetData.scheduleData.etapas;
    
    if (etapas.length === 0 || totalDays <= 0) return;
    
    // Distribuir dias igualmente
    const baseDays = Math.floor(totalDays / etapas.length);
    let remainingDays = totalDays - (baseDays * etapas.length);
    
    // Definir data de início do projeto como hoje
    const dataInicioProjeto = new Date();
    
    etapas.forEach((etapa, index) => {
        let etapaDays = baseDays;
        if (remainingDays > 0) {
            etapaDays++;
            remainingDays--;
        }
        
        etapa.dias = etapaDays;
        
        // Atualizar campos na interface
        const daysInput = document.getElementById(`dias-${etapa.id}`);
        if (daysInput) {
            daysInput.value = etapaDays;
        }
        
        const daysDisplay = document.getElementById(`days-display-${etapa.id}`);
        if (daysDisplay) {
            daysDisplay.textContent = `${etapaDays} dia(s)`;
        }
    });
    
    // Recalcular todas as datas
    calcularDatasEtapas(etapas, dataInicioProjeto);
    
    // Atualizar todos os campos de data
    etapas.forEach(etapa => {
        const inputInicio = document.getElementById(`data-inicio-${etapa.id}`);
        if (inputInicio && etapa.dataInicio) {
            inputInicio.value = formatarDataParaInput(etapa.dataInicio);
        }
        
        const inputFim = document.getElementById(`data-fim-${etapa.id}`);
        if (inputFim && etapa.dataFim) {
            inputFim.value = formatarDataParaInput(etapa.dataFim);
        }
        
        updateInfoDatas(etapa.id);
    });
    
    updateScheduleSummaryDetails(etapas);
    showToast('Datas distribuídas automaticamente', 'success');
}

function saveSchedule() {
    const etapas = budgetData.scheduleData.etapas;
    
    if (!etapas || etapas.length === 0) {
        showToast('Não há etapas definidas', 'warning');
        return;
    }
    
    // Verificar se todas as etapas têm datas válidas
    const etapasIncompletas = etapas.filter(e => !e.dataInicio || !e.dataFim);
    if (etapasIncompletas.length > 0) {
        showToast('Algumas etapas não têm datas definidas', 'warning');
        return;
    }
    
    // Salvar preferência de inclusão na impressão
    const includeInPrint = document.getElementById('include-schedule-in-print').checked;
    budgetData.scheduleData.includeInPrint = includeInPrint;
    
    // Calcular total de dias
    const totalDias = etapas.reduce((sum, etapa) => sum + etapa.dias, 0);
    budgetData.totals.days = totalDias;
    
    // Atualizar seção de resumo no HTML principal
    updateScheduleSection(etapas);
    
    closeScheduleModal();
    showToast('Cronograma salvo com sucesso!', 'success');
}

function updateScheduleSection(etapas) {
    const scheduleSection = document.getElementById('schedule-summary');
    const totalDias = etapas.reduce((sum, etapa) => sum + etapa.dias, 0);
    const dataInicioProjeto = etapas[0]?.dataInicio;
    const dataFimProjeto = etapas[etapas.length - 1]?.dataFim;
    
    scheduleSection.classList.remove('hidden');
    
    document.getElementById('total-days-display').textContent = `${totalDias} dias`;
    document.getElementById('start-date').textContent = dataInicioProjeto ? formatarData(dataInicioProjeto) : '--/--/----';
    document.getElementById('end-date').textContent = dataFimProjeto ? formatarData(dataFimProjeto) : '--/--/----';
    
    // Atualizar mini tabela arquitetônica
    let etapasHTML = `
        <div class="mt-4 pt-4 border-t border-gray-300">
            <h4 class="font-medium text-gray-700 mb-2">Cronograma Estimado:</h4>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-2 text-left">Etapa</th>
                            <th class="p-2 text-center">Dias</th>
                            <th class="p-2 text-left">Período</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    etapas.forEach((etapa, index) => {
        etapasHTML += `
            <tr class="border-b border-gray-200">
                <td class="p-2">${index + 1}. ${etapa.nome}</td>
                <td class="p-2 text-center">${etapa.dias}</td>
                <td class="p-2">${etapa.dataInicio && etapa.dataFim ? 
                    `${formatarData(etapa.dataInicio)} a ${formatarData(etapa.dataFim)}` : 
                    '--/--/---- a --/--/----'}</td>
            </tr>
        `;
    });
    
    etapasHTML += `
                    </tbody>
                </table>
            </div>
            <div class="mt-2 text-xs text-gray-500 italic">
                <i class="fas fa-info-circle mr-1"></i>
                Este cronograma é uma estimativa. Considerar finais de semana e feriados.
            </div>
        </div>
    `;
    
    const existingEtapasDiv = scheduleSection.querySelector('.etapas-details');
    if (existingEtapasDiv) {
        existingEtapasDiv.remove();
    }
    
    scheduleSection.insertAdjacentHTML('beforeend', etapasHTML);
}

// ============================================
// FUNÇÕES DE IMPRESSÃO
// ============================================
function printBudget() {
    if (budgetData.services.length === 0) {
        showToast('Adicione serviços antes de imprimir', 'warning');
        return;
    }
    
    // Criar um novo documento HTML para impressão
    const printWindow = window.open('', '_blank');
    
    // Obter a data atual formatada
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    
    // Gerar HTML para impressão
    const printHTML = generatePrintHTML(formattedDate);
    
    // Escrever no documento
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
    };
}

function generatePrintHTML(date) {
    // Obter informações de cliente e responsável DOS CAMPOS HTML
    const cliente = document.getElementById('client-name')?.value || '_________________________';
    const endereco = document.getElementById('client-address')?.value || '_________________________';
    const documento = document.getElementById('client-document')?.value || '_________________________';
    const responsavel = document.getElementById('technical-responsible')?.value || '_________________________';
    const registro = document.getElementById('technical-register')?.value || '_________________________';
    const contato = document.getElementById('technical-contact')?.value || '_________________________';
    
    // Obter descrição do projeto
    const descricaoProjeto = document.getElementById('project-description') ? 
        document.getElementById('project-description').textContent : '';
    
    // Obter informações de cronograma
    const totalDias = budgetData.totals.days || 0;
    const inicioPrevisto = document.getElementById('start-date')?.textContent || '--/--/----';
    const terminoPrevisto = document.getElementById('end-date')?.textContent || '--/--/----';
    
    // Organizar serviços por categoria/etapa
    let servicesByCategory = {};
    let currentEtapa = null;
    let etapaNumber = 1;
    
    budgetData.services.forEach(service => {
        if (service.isHeader || service.description.includes('ETAPA') || service.description.includes('📋')) {
            currentEtapa = service.description.replace('📋 ', '').replace('ETAPA ', '').split(':')[0] || 'ETAPA';
            if (!servicesByCategory[currentEtapa]) {
                servicesByCategory[currentEtapa] = [];
            }
        } else if (currentEtapa && !service.isSeparator && !service.isTotal && !service.isGrandTotal) {
            servicesByCategory[currentEtapa].push(service);
        } else if (!currentEtapa && !service.isSeparator && !service.isTotal && !service.isGrandTotal) {
            const category = service.category || 'OUTROS';
            if (!servicesByCategory[category]) {
                servicesByCategory[category] = [];
            }
            servicesByCategory[category].push(service);
        }
    });
    
    // Calcular totais - NÃO MOSTRAR LUCRO, APENAS DESCONTO
    const laborTotal = budgetData.totals.labor || 0;
    const discountTotal = budgetData.totals.discount || 0;
    const finalTotal = budgetData.totals.final || 0;
    
    // Gerar RESUMO FINANCEIRO SIMPLES (sem container flex duplicado)
    let resumeFinanceiroHTML = `
        <div style="width: 70mm; background: white; border: 1px solid #2c3e50; border-radius: 4px; padding: 8px; font-size: 9pt; margin-top: 15px; float: right;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 6px; background-color: #f0f0f0; padding: 4px; border-radius: 2px;">
                RESUMO FINANCEIRO
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 9pt;">
                <tr>
                    <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Mão de Obra:</td>
                    <td style="padding: 3px 0; border-bottom: 1px solid #eee; text-align: right;">R$ ${formatarNumero(laborTotal)}</td>
                </tr>
    `;
    
    if (discountTotal > 0) {
        resumeFinanceiroHTML += `
                <tr>
                    <td style="padding: 3px 0; border-bottom: 1px solid #eee;">Desconto:</td>
                    <td style="padding: 3px 0; border-bottom: 1px solid #eee; text-align: right; color: #e74c3c;">- R$ ${formatarNumero(discountTotal)}</td>
                </tr>
        `;
    }
    
    resumeFinanceiroHTML += `
                <tr style="font-weight: bold; background-color: #e8f4fd;">
                    <td style="padding: 6px 0;">TOTAL GERAL:</td>
                    <td style="padding: 6px 0; text-align: right; font-size: 10pt;">R$ ${formatarNumero(finalTotal)}</td>
                </tr>
            </table>
            <div style="margin-top: 8px; font-size: 7pt; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 6px;">
                <p style="margin: 2px 0;">Validade: 15 dias</p>
                <p style="margin: 2px 0;">Pagamento: 30% sinal</p>
                <p style="margin: 2px 0;">70% conforme execução</p>
            </div>
        </div>
    `;
    
    // Gerar tabelas por categoria como no PDF - LAYOUT ULTRA COMPACTO
    let tablesHTML = '';
    
    Object.keys(servicesByCategory).forEach((categoria, catIndex) => {
        const services = servicesByCategory[categoria];
        if (services.length === 0) return;
        
        let rows = '';
        let categoriaTotal = 0;
        
        services.forEach(service => {
            const total = service.quantity * service.unitPrice;
            categoriaTotal += total;
            
            rows += `
                <tr>
                    <td style="padding: 4px 3px; font-size: 8pt; border: 1px solid #ddd; line-height: 1.1;">${service.description}</td>
                    <td style="padding: 4px 3px; text-align: center; font-size: 8pt; border: 1px solid #ddd;">${getUnitDisplay(service.unit)}</td>
                    <td style="padding: 4px 3px; text-align: center; font-size: 8pt; border: 1px solid #ddd;">${service.quantity}</td>
                    <td style="padding: 4px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd;">R$ ${formatarNumero(service.unitPrice)}</td>
                    <td style="padding: 4px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd;">R$ ${formatarNumero(total)}</td>
                </tr>
            `;
        });
        
        tablesHTML += `
            <div style="margin-top: ${catIndex === 0 ? '0' : '8'}px; page-break-inside: avoid;">
                <h3 style="color: #2c3e50; background-color: #f0f0f0; padding: 6px; margin: 0; border: 1px solid #ddd; font-size: 9pt;">
                    ${etapaNumber++}. ${categoria.toUpperCase()}
                </h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 8pt; line-height: 1.1;">
                    <thead>
                        <tr style="background-color: #e8e8e8;">
                            <th style="padding: 5px 3px; text-align: left; font-size: 8pt; border: 1px solid #ddd; width: 45%;">Descrição</th>
                            <th style="padding: 5px 3px; text-align: center; font-size: 8pt; border: 1px solid #ddd; width: 12%;">Unid.</th>
                            <th style="padding: 5px 3px; text-align: center; font-size: 8pt; border: 1px solid #ddd; width: 8%;">Qtde</th>
                            <th style="padding: 5px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd; width: 15%;">Unitário</th>
                            <th style="padding: 5px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd; width: 15%;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr style="font-weight: bold; background-color: #f8f8f8;">
                            <td colspan="4" style="padding: 5px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd; border-right: none;">
                                TOTAL DA ETAPA
                            </td>
                            <td style="padding: 5px 3px; text-align: right; font-size: 8pt; border: 1px solid #ddd; border-left: none;">
                                R$ ${formatarNumero(categoriaTotal)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    });
    
    // Seção de cronograma (se habilitado e se houver etapas)
    let scheduleSection = '';
    if (budgetData.scheduleData.includeInPrint && totalDias > 0 && budgetData.scheduleData.etapas?.length > 0) {
        const etapas = budgetData.scheduleData.etapas;
        
        // Gerar calendário visual simples
        let calendarioHTML = '<div style="margin-top: 6px;">';
        etapas.forEach((etapa, index) => {
            calendarioHTML += `
                <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 7pt;">
                    <div style="width: 10px; height: 10px; background-color: #3498db; border-radius: 2px; margin-right: 5px;"></div>
                    <div style="flex: 1;">
                        <strong>${etapa.nome}</strong>: ${etapa.dataInicio ? formatarData(etapa.dataInicio) : '--/--/----'} 
                        à ${etapa.dataFim ? formatarData(etapa.dataFim) : '--/--/----'} 
                        (${etapa.dias} dia${etapa.dias !== 1 ? 's' : ''})
                    </div>
                </div>
            `;
        });
        calendarioHTML += '</div>';
        
        scheduleSection = `
            <div style="margin-top: 12px; padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa; border-radius: 4px; font-size: 8pt; page-break-inside: avoid; clear: both;">
                <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 6px; font-size: 9pt; border-bottom: 1px solid #3498db; padding-bottom: 2px;">
                    CRONOGRAMA ESTIMADO
                </h3>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; margin-bottom: 8px;">
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 7pt;">Início</div>
                        <div style="font-size: 9pt; font-weight: bold; color: #2c3e50;">${inicioPrevisto}</div>
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 7pt;">Término</div>
                        <div style="font-size: 9pt; font-weight: bold; color: #2c3e50;">${terminoPrevisto}</div>
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 7pt;">Duração</div>
                        <div style="font-size: 9pt; font-weight: bold; color: #2c3e50;">${totalDias} dias</div>
                    </div>
                </div>
                ${calendarioHTML}
                <div style="margin-top: 6px; font-size: 7pt; color: #666; font-style: italic;">
                    <i class="fas fa-info-circle" style="margin-right: 3px;"></i>
                    Este cronograma é uma estimativa.
                </div>
            </div>
        `;
    }
    
    // HTML completo (estilo profissional - LAYOUT ULTRA COMPACTO)
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Orçamento SL Construção Civil</title>
            <style>
                @page {
                    margin: 10mm 15mm 10mm 15mm;
                    size: A4;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    font-size: 9pt;
                    line-height: 1.1;
                    color: #000;
                    position: relative;
                }
                
                .header {
                    background-color: #2c3e50;
                    color: white;
                    padding: 8px;
                    text-align: center;
                    margin-bottom: 8px;
                }
                
                .header h1 {
                    margin: 0;
                    font-size: 14pt;
                    font-weight: bold;
                }
                
                .header p {
                    margin: 1px 0;
                    font-size: 7pt;
                }
                
                .info-box {
                    margin-bottom: 8px;
                    padding: 6px;
                    border: 1px solid #ddd;
                    background-color: #f8f9fa;
                    border-radius: 3px;
                    font-size: 7pt;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .info-column {
                    flex: 1;
                    min-width: 150px;
                }
                
                .info-column h3 {
                    color: #2c3e50;
                    border-bottom: 1px solid #3498db;
                    padding-bottom: 2px;
                    margin-top: 0;
                    margin-bottom: 4px;
                    font-size: 8pt;
                }
                
                .info-detail {
                    margin-bottom: 2px;
                    font-size: 7pt;
                }
                
                .info-label {
                    font-weight: bold;
                    color: #555;
                }
                
                .signatures {
                    margin-top: 20px;
                    page-break-inside: avoid;
                    clear: both;
                }
                
                .signature-box {
                    float: left;
                    width: 45%;
                    text-align: center;
                    margin-top: 15px;
                }
                
                .signature-line {
                    border-top: 1px solid #000;
                    width: 80%;
                    margin: 0 auto;
                    padding-top: 6px;
                    margin-top: 15px;
                    font-size: 7pt;
                }
                
                .clear {
                    clear: both;
                }
                
                .description-content {
                    white-space: pre-wrap;
                    font-size: 7pt;
                    line-height: 1.2;
                }
                
                .footer {
                    margin-top: 12px;
                    text-align: center;
                    font-size: 6pt;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 4px;
                }
                
                .content-wrapper {
                    position: relative;
                }
                
                .tables-container {
                    width: 100%;
                }
                
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    
                    table {
                        page-break-inside: avoid;
                    }
                    
                    .signatures {
                        page-break-inside: avoid;
                    }
                    
                    h3 {
                        page-break-after: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <!-- Cabeçalho (MANTIDO IGUAL AO HTML) -->
            <div class="header">
                <h1>SL CONSTRUÇÃO CIVIL</h1>
                <p>Sistema Integrado de Orçamentos</p>
                <p>Orçamento: ${document.getElementById('budget-number').textContent}</p>
                <p>Data: ${date}</p>
            </div>
            
            <!-- Informações do Cliente e Responsável -->
            <div class="info-box">
                <div class="info-column">
                    <h3>DADOS DO CLIENTE</h3>
                    <div class="info-detail"><span class="info-label">Cliente:</span> ${cliente}</div>
                    <div class="info-detail"><span class="info-label">Endereço:</span> ${endereco}</div>
                    <div class="info-detail"><span class="info-label">CPF/CNPJ:</span> ${documento}</div>
                </div>
                
                <div class="info-column">
                    <h3>RESPONSÁVEL TÉCNICO</h3>
                    <div class="info-detail"><span class="info-label">Nome:</span> ${responsavel}</div>
                    <div class="info-detail"><span class="info-label">Registro:</span> ${registro}</div>
                    <div class="info-detail"><span class="info-label">Contato:</span> ${contato}</div>
                </div>
            </div>
            
            <!-- Descrição do Projeto (se houver) -->
            ${descricaoProjeto.trim() !== '' ? `
            <div style="margin-bottom: 8px; padding: 6px; border: 1px solid #ddd; background-color: #f8f9fa; border-radius: 3px; font-size: 7pt;">
                <h3 style="color: #2c3e50; margin-top: 0; margin-bottom: 4px; font-size: 8pt;">DESCRIÇÃO DO PROJETO</h3>
                <div class="description-content">${descricaoProjeto}</div>
            </div>
            ` : ''}
            
            <div class="content-wrapper">
                <!-- Tabelas de Serviços por Categoria/Etapa (LAYOUT ULTRA COMPACTO) -->
                <div class="tables-container">
                    ${tablesHTML}
                </div>
                
                <!-- RESUMO FINANCEIRO (flutuando à direita) -->
                ${resumeFinanceiroHTML}
            </div>
            
            <!-- Cronograma (se habilitado) -->
            ${scheduleSection}
            
            <!-- Assinaturas (USANDO DADOS PREENCHIDOS PELO USUÁRIO) -->
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line">
                        <p>${cliente}</p>
                        <p><strong>CONTRATANTE</strong></p>
                    </div>
                </div>
                
                <div class="signature-box" style="float: right;">
                    <div class="signature-line">
                        <p>${responsavel}</p>
                        <p><strong>Responsável Técnico</strong></p>
                        ${registro !== '_________________________' ? `<p>CREA/Registro: ${registro}</p>` : ''}
                    </div>
                </div>
                
                <div class="clear"></div>
            </div>
            
            <!-- Rodapé -->
            <div class="footer">
                <p>Sistema Integrado de Orçamentos - SL Construção Civil</p>
                <p>Orçamento válido por 15 dias a partir da data de emissão</p>
                <p>Contato: slconstrucao@gmail.com | (81) 98989-5620</p>
            </div>
        </body>
        </html>
    `;
}

function generateTimeline() {
    if (budgetData.totals.days <= 0) {
        showToast('Não há prazos definidos para gerar cronograma', 'warning');
        return;
    }
    
    // Obter etapas do cronograma
    const etapas = budgetData.scheduleData.etapas;
    if (!etapas || etapas.length === 0) {
        showToast('Não há etapas definidas para o cronograma', 'warning');
        return;
    }
    
    // Abrir janela com cronograma
    const timelineWindow = window.open('', '_blank');
    const now = new Date();
    
    // Calcular a data de início mais antiga e a mais recente
    let dataInicioMaisAntiga = new Date(etapas[0].dataInicio);
    let dataFimMaisRecente = new Date(etapas[0].dataFim);
    etapas.forEach(etapa => {
        const inicio = new Date(etapa.dataInicio);
        const fim = new Date(etapa.dataFim);
        if (inicio < dataInicioMaisAntiga) dataInicioMaisAntiga = inicio;
        if (fim > dataFimMaisRecente) dataFimMaisRecente = fim;
    });
    
    // Calcular o número total de dias
    const diffTime = Math.abs(dataFimMaisRecente - dataInicioMaisAntiga);
    const totalDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Gerar o HTML do cronograma
    const timelineHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cronograma - SL Construção Civil</title>
            <style>
                @page {
                    margin: 15mm;
                    size: A4 landscape;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    font-size: 9pt;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                
                th, td {
                    border: 1px solid #000;
                    padding: 4px;
                    text-align: center;
                }
                
                th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                
                .activity-day {
                    background-color: #90ee90;
                }

                .etapa-nome {
                    text-align: left;
                    font-weight: bold;
                }

                .barra-cronograma {
                    height: 20px;
                    background-color: #4CAF50;
                    border-radius: 3px;
                    margin: 2px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SL CONSTRUÇÃO CIVIL</h1>
                <h2>Cronograma de Execução</h2>
                <p>Orçamento: ${document.getElementById('budget-number').textContent}</p>
                <p>Data: ${now.toLocaleDateString('pt-BR')}</p>
                <p>Período: ${formatarData(dataInicioMaisAntiga)} a ${formatarData(dataFimMaisRecente)}</p>
                <p>Total de Dias: ${totalDias}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 20%;">Etapa</th>
                        <th style="width: 10%;">Duração (dias)</th>
                        <th style="width: 15%;">Início</th>
                        <th style="width: 15%;">Término</th>
                        <th style="width: 40%;">Cronograma</th>
                    </tr>
                </thead>
                <tbody>
                    ${etapas.map(etapa => {
                        const inicio = new Date(etapa.dataInicio);
                        const fim = new Date(etapa.dataFim);
                        const diasEtapa = etapa.dias;
                        const offsetInicio = Math.ceil((inicio - dataInicioMaisAntiga) / (1000 * 60 * 60 * 24));
                        const larguraBarra = (diasEtapa / totalDias) * 100;
                        const margemEsquerda = (offsetInicio / totalDias) * 100;

                        return `
                            <tr>
                                <td class="etapa-nome">${etapa.nome}</td>
                                <td>${diasEtapa}</td>
                                <td>${formatarData(inicio)}</td>
                                <td>${formatarData(fim)}</td>
                                <td>
                                    <div style="position: relative; width: 100%; height: 25px; background-color: #f0f0f0; border-radius: 3px;">
                                        <div style="position: absolute; left: ${margemEsquerda}%; width: ${larguraBarra}%; height: 100%; background-color: #4CAF50; border-radius: 3px;"></div>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: center;">
                <p>Assinatura do Responsável Técnico: _________________________________</p>
                <p>Data: _________________________</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `;
    
    timelineWindow.document.write(timelineHTML);
    timelineWindow.document.close();
}

// ============================================
// FUNÇÕES DE PERSISTÊNCIA
// ============================================
function saveDraft() {
    // Salvar dados do cliente/responsável
    budgetData.clientData.name = document.getElementById('client-name').value;
    budgetData.clientData.address = document.getElementById('client-address').value;
    budgetData.clientData.document = document.getElementById('client-document').value;
    budgetData.technicalData.name = document.getElementById('technical-responsible').value;
    budgetData.technicalData.register = document.getElementById('technical-register').value;
    budgetData.technicalData.contact = document.getElementById('technical-contact').value;
    
    budgetData.lastSaved = new Date().toISOString();
    localStorage.setItem('budgetDraft', JSON.stringify(budgetData));
    
    const now = new Date();
    document.getElementById('current-date').textContent = 
        `Salvo: ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    setTimeout(() => {
        localStorage.setItem('budgetBackup', JSON.stringify(budgetData));
    }, 1000);
}

function loadSavedDraft() {
    const saved = localStorage.getItem('budgetDraft');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            budgetData = { ...budgetData, ...parsed };
            
            // Restaurar serviços
            if (budgetData.services && budgetData.services.length > 0) {
                updateBudgetTable();
                updateTotals();
                
                Object.keys(budgetData.categories).forEach(category => {
                    const badge = document.getElementById(`${category}-badge`);
                    if (badge) badge.classList.remove('hidden');
                });
                
                document.getElementById('description-section').classList.remove('hidden');
                document.getElementById('signatures-section').classList.remove('hidden');
            }
            
            // Restaurar dados do cliente/responsável
            document.getElementById('client-name').value = budgetData.clientData.name || '';
            document.getElementById('client-address').value = budgetData.clientData.address || '';
            document.getElementById('client-document').value = budgetData.clientData.document || '';
            document.getElementById('technical-responsible').value = budgetData.technicalData.name || '';
            document.getElementById('technical-register').value = budgetData.technicalData.register || '';
            document.getElementById('technical-contact').value = budgetData.technicalData.contact || '';
            
            // Restaurar prazo manual
            if (budgetData.totals.manualDays > 0) {
                document.getElementById('total-days').value = budgetData.totals.manualDays;
            }
            
            showToast('Rascunho carregado', 'info');
        } catch (error) {
            console.error('Erro ao carregar rascunho:', error);
        }
    }
}

function clearBudget() {
    if (confirm('Tem certeza que deseja limpar todo o orçamento? Esta ação não pode ser desfeita.')) {
        budgetData = {
            services: [],
            categories: {},
            totals: { labor: 0, profit: 0, discount: 0, final: 0, days: 0, manualDays: 0 },
            settings: { profitMargin: 30, discountAmount: 0 },
            description: '',
            createdAt: new Date().toISOString(),
            lastSaved: null,
            clientData: {
                name: '',
                address: '',
                document: ''
            },
            technicalData: {
                name: '',
                register: '',
                contact: ''
            },
            scheduleData: {
                etapas: [],
                includeInPrint: false
            }
        };
        
        const tbody = document.getElementById('budget-table-body');
        tbody.innerHTML = `
            <tr id="empty-table-message">
                <td colspan="7" class="p-8 text-center text-gray-500">
                    <i class="fas fa-calculator text-4xl mb-3 opacity-50"></i>
                    <p class="text-lg font-medium">Nenhum serviço adicionado</p>
                    <p class="text-sm mt-1">Selecione um serviço acima para começar o orçamento</p>
                </td>
            </tr>
        `;
        
        document.getElementById('category-totals').innerHTML = '';
        document.getElementById('schedule-summary').classList.add('hidden');
        document.getElementById('description-section').classList.add('hidden');
        document.getElementById('signatures-section').classList.add('hidden');
        
        document.querySelectorAll('[id$="-badge"]').forEach(badge => {
            badge.classList.add('hidden');
        });
        
        // Limpar campos do cliente
        document.getElementById('client-name').value = '';
        document.getElementById('client-address').value = '';
        document.getElementById('client-document').value = '';
        document.getElementById('technical-responsible').value = '';
        document.getElementById('technical-register').value = '';
        document.getElementById('technical-contact').value = '';
        
        // Limpar campo de prazo
        document.getElementById('total-days').value = '0';
        
        updateTotals();
        localStorage.removeItem('budgetDraft');
        
        showToast('Orçamento limpo', 'info');
    }
}

// ============================================
// FUNÇÕES AUXILIARES DE INTERFACE
// ============================================
function updateProgress() {
    const progressText = document.getElementById('progress-text');
    const serviceCount = budgetData.services.length;
    
    if (serviceCount === 0) {
        progressText.textContent = 'Selecione um serviço para começar';
    } else {
        const total = budgetData.totals.final.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        progressText.textContent = 
            `${serviceCount} serviço(s) adicionado(s) | Total: ${total}`;
    }
}

function setupDragAndDrop() {
    const tbody = document.getElementById('budget-table-body');
    
    tbody.addEventListener('dragstart', (e) => {
        if (e.target.closest('tr') && e.target.closest('tr').dataset.id) {
            draggedItem = e.target.closest('tr');
            draggedItem.classList.add('opacity-50');
        }
    });
    
    tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        if (targetRow && targetRow.dataset.id) {
            targetRow.classList.add('drag-over');
        }
    });
    
    tbody.addEventListener('dragleave', (e) => {
        const targetRow = e.target.closest('tr');
        if (targetRow) {
            targetRow.classList.remove('drag-over');
        }
    });
    
    tbody.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetRow = e.target.closest('tr');
        
        if (draggedItem && targetRow && targetRow.dataset.id && draggedItem !== targetRow) {
            const draggedId = draggedItem.dataset.id;
            const targetId = targetRow.dataset.id;
            
            const draggedIndex = budgetData.services.findIndex(s => s.id === draggedId);
            const targetIndex = budgetData.services.findIndex(s => s.id === targetId);
            
            if (draggedIndex !== -1 && targetIndex !== -1) {
                const [movedItem] = budgetData.services.splice(draggedIndex, 1);
                budgetData.services.splice(targetIndex, 0, movedItem);
                
                updateBudgetTable();
                saveDraft();
                showToast('Serviço reordenado', 'success');
            }
        }
        
        if (draggedItem) {
            draggedItem.classList.remove('opacity-50');
            draggedItem = null;
        }
        
        tbody.querySelectorAll('tr').forEach(row => {
            row.classList.remove('drag-over');
        });
    });
    
    tbody.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('opacity-50');
            draggedItem = null;
        }
        
        tbody.querySelectorAll('tr').forEach(row => {
            row.classList.remove('drag-over');
        });
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToastElement();
    
    const colors = {
        success: { bg: '#10b981', text: '#ffffff' },
        error: { bg: '#ef4444', text: '#ffffff' },
        info: { bg: '#3b82f6', text: '#ffffff' },
        warning: { bg: '#f59e0b', text: '#000000' }
    };
    
    toast.style.background = colors[type].bg;
    toast.style.color = colors[type].text;
    toast.innerHTML = message;
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(150%)';
    }, 4000);
}

function createToastElement() {
    const toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
    return toast;
}

// ============================================
// FUNÇÃO PARA IMPORTAR ORÇAMENTO PERSONALIZADO
// ============================================
// Na função checkForPersonalizedBudget(), modifique a parte que adiciona o total geral:
function checkForPersonalizedBudget() {
    const personalizedData = localStorage.getItem('importedPersonalizedBudget');
    if (personalizedData) {
        try {
            const projeto = JSON.parse(personalizedData);
            
            // Verificar se já foi importado
            const alreadyImported = budgetData.services.some(s => 
                s.importSource === 'personalizado_arquitetura' && 
                s.projetoId === projeto.timestamp
            );
            
            if (!alreadyImported && projeto.etapas && projeto.etapas.length > 0) {
                // Limpar serviços existentes se necessário
                if (budgetData.services.length === 0) {
                    budgetData.services = [];
                    budgetData.categories = {};
                }
                
                // IMPORTANTE: Calcular o total geral ANTES de adicionar os itens
                const totalGeralProjeto = projeto.data?.totalGeral || calcularTotalGeralProjeto(projeto);
                
                // Importar as etapas
                projeto.etapas.forEach((etapa, etapaIndex) => {
                    // Adicionar cabeçalho da etapa
                    addServiceItem({
                        id: generateId(),
                        category: 'personalizado',
                        description: `ETAPA ${etapaIndex + 1}: ${etapa.nome}`,
                        quantity: 0,
                        unit: 'etapa',
                        unitPrice: 0,
                        subtotal: 0,
                        isLabor: false,
                        isCustom: true,
                        importSource: 'personalizado_arquitetura',
                        projetoId: projeto.timestamp,
                        isHeader: true,
                        isEtapa: true
                    });
                    
                    // Adicionar os itens da etapa
                    etapa.itens.forEach(item => {
                        if (item.descricao && (item.quantidade > 0 || item.maoObra > 0 || item.material > 0)) {
                            const quantidade = parseFloat(item.quantidade) || 0;
                            const maoObra = parseFloat(item.maoObra) || 0;
                            const material = parseFloat(item.material) || 0;
                            const unitPrice = maoObra + material;
                            const subtotal = quantidade * unitPrice;
                            
                            addServiceItem({
                                id: generateId(),
                                category: 'personalizado',
                                description: item.descricao,
                                details: etapa.descricao,
                                quantity: quantidade,
                                unit: item.unidade || 'un',
                                unitPrice: unitPrice,
                                subtotal: subtotal,
                                isLabor: maoObra > 0,
                                isCustom: true,
                                importSource: 'personalizado_arquitetura',
                                projetoId: projeto.timestamp
                            });
                        }
                    });
                });
                
                // Adicionar total geral do projeto personalizado como ITEM DE EXIBIÇÃO APENAS (subtotal: 0)
                // Este item não deve ser contabilizado, pois já está incluído nos itens anteriores
                if (totalGeralProjeto > 0) {
                    addServiceItem({
                        id: generateId(),
                        category: 'personalizado',
                        description: 'TOTAL GERAL DO PROJETO',
                        details: 'PROJETO DE ARQUITETURA',
                        quantity: 1,
                        unit: 'projeto',
                        unitPrice: 0, // Preço unitário ZERO para não duplicar
                        subtotal: 0,  // Subtotal ZERO para não duplicar
                        isLabor: false,
                        isCustom: true,
                        importSource: 'personalizado_arquitetura',
                        projetoId: projeto.timestamp,
                        isGrandTotal: true,
                        isDisplayOnly: true // Nova propriedade para indicar que é apenas para exibição
                    });
                    
                    // CORREÇÃO: Também adicionar uma linha de separador ANTES do total
                    addServiceItem({
                        id: generateId(),
                        category: 'personalizado',
                        description: '',
                        quantity: 0,
                        unit: 'separador',
                        unitPrice: 0,
                        subtotal: 0,
                        isSeparator: true,
                        importSource: 'personalizado_arquitetura',
                        projetoId: projeto.timestamp
                    });
                }
                
                // Atualizar badge
                const badge = document.getElementById('personalizado-badge');
                if (badge) {
                    badge.classList.remove('hidden');
                    badge.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Adicionado';
                }
                
                // Mostrar seções adicionais
                document.getElementById('description-section').classList.remove('hidden');
                document.getElementById('signatures-section').classList.remove('hidden');
                
                // Preencher campos com informações do projeto
                if (projeto.data?.nome) {
                    document.getElementById('client-name').value = projeto.data.nome;
                    budgetData.clientData.name = projeto.data.nome;
                }
                
                if (projeto.data?.arquiteta) {
                    document.getElementById('technical-responsible').value = projeto.data.arquiteta;
                    budgetData.technicalData.name = projeto.data.arquiteta;
                }
                
                // Preencher descrição do projeto
                const projectDescription = document.getElementById('project-description');
                if (projectDescription && projeto.data?.observacoes) {
                    projectDescription.textContent = `PROJETO DE ARQUITETURA PERSONALIZADO\n\n` +
                                                    `Cliente: ${projeto.data.nome || ''}\n` +
                                                    `Arquiteta: ${projeto.data.arquiteta || ''}\n` +
                                                    `Data: ${projeto.data.data || ''}\n\n` +
                                                    `OBSERVAÇÕES:\n${projeto.data.observacoes}`;
                    projectDescription.classList.remove('text-gray-400');
                }
                
                // Atualizar interface
                updateBudgetTable();
                updateTotals();
                updateSchedule();
                saveDraft();
                
                // Remover do localStorage para não importar novamente
                localStorage.removeItem('importedPersonalizedBudget');
                localStorage.removeItem('importedServiceData');
                
                showToast('Orçamento personalizado de arquitetura importado com sucesso!', 'success');
            } else if (alreadyImported) {
                // Já importado, limpar localStorage
                localStorage.removeItem('importedPersonalizedBudget');
                localStorage.removeItem('importedServiceData');
            }
        } catch (error) {
            console.error('Erro ao importar orçamento personalizado:', error);
            localStorage.removeItem('importedPersonalizedBudget');
            localStorage.removeItem('importedServiceData');
            showToast('Erro ao importar orçamento personalizado. Formato inválido.', 'error');
        }
    }
}

function calcularTotalGeralProjeto(projeto) {
    if (projeto.totalGeral) return projeto.totalGeral;
    
    if (projeto.etapas && Array.isArray(projeto.etapas)) {
        return projeto.etapas.reduce((total, etapa) => {
            const totalEtapa = etapa.itens ? etapa.itens.reduce((etapaTotal, item) => {
                const quantidade = parseFloat(item.quantidade) || 0;
                const maoObra = parseFloat(item.maoObra) || 0;
                const material = parseFloat(item.material) || 0;
                return etapaTotal + (quantidade * (maoObra + material));
            }, 0) : 0;
            return total + totalEtapa;
        }, 0);
    }
    
    return 0;
}

function openPersonalizadoForm() {
    // Abrir página de orçamento personalizado na MESMA ABA
    window.location.href = 'personalizado.html';
}

async function salvarClienteNoBanco(nome, email, telefone) {
    try {
        const { data, error } = await sbClient
            .from('clientes')
            .insert([
                { 
                    nome: nome, 
                    email: email, 
                    telefone: telefone 
                }
            ]);

        if (error) throw error;
        console.log("Cliente salvo com sucesso!");

    } catch (err) {
        console.error("Erro ao salvar cliente:", err.message);
    }
}

// ============================================
// LISTENER PARA ATUALIZAÇÕES EXTERNAS
// ============================================
window.addEventListener('storage', (e) => {
    if (e.key === 'importedServiceData') {
        checkForImportedService();
    }
    if (e.key === 'importedPersonalizedBudget') {
        checkForPersonalizedBudget();
    }
});

// Verificar periodicamente por novos serviços
setInterval(() => {
    checkForImportedService();
    checkForPersonalizedBudget();
}, 5000);
