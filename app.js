/**
 * PlantitasApp - Business Logic & UI Controller
 * Strictly Vanilla JS - No Modules - Local Storage Persistence
 */

// --- 1. STORE MANAGER (STATE) ---
const store = {
    data: {
        inventory: { substrates: [], powders: [], liquids: [], others: [] },
        plants: [],
        globalNotes: []
    },

    init() {
        const saved = localStorage.getItem('plantitas_db');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
                // Migración: Asegurar que existan todas las llaves del inventario
                if (this.data.inventory && !this.data.inventory.others) {
                    this.data.inventory.others = [];
                }
                // Sanitización inicial de plantas para asegurar consistencia
                this.data.plants = this.data.plants.map(p => ({
                    ...p,
                    icon: p.icon || '🌿',
                    type: p.type || 'Planta'
                }));
            } catch (e) {
                console.error("Error loading data, initializing fresh.", e);
                this.save();
            }
        } else {
            this.save();
        }
    },

    save() {
        localStorage.setItem('plantitas_db', JSON.stringify(this.data));
        ui.flashExportButton();
    },

    update(newData) {
        this.data = newData;
        this.save();
        ui.renderAll();
    }
};

// --- 2. UI CONTROLLER (DOM) ---
const ui = {
    flashExportButton() {
        const btn = document.getElementById('btn-export');
        if (btn) {
            btn.classList.remove('flash-active');
            void btn.offsetWidth; // Trigger reflow
            btn.classList.add('flash-active');
            setTimeout(() => btn.classList.remove('flash-active'), 4000);
        }
    },

    // Tab Navigation
    initTabs() {
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    },

    switchTab(tabId) {
        // Toggle Buttons
        document.querySelectorAll('.tab-link').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // Toggle Views
        document.querySelectorAll('.tab-content').forEach(view => {
            view.classList.toggle('active', view.id === tabId);
        });
    },

    showModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.showModal();
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.close();
    },

    showInfo(title, message) {
        const titleEl = document.getElementById('info-title');
        const msgEl = document.getElementById('info-msg');
        if (titleEl && msgEl) {
            titleEl.innerText = title;
            msgEl.innerText = message;
            this.showModal('modal-info');
        }
    },

    askConfirm(title, message, onConfirm) {
        const titleEl = document.getElementById('confirm-title');
        const msgEl = document.getElementById('confirm-msg');
        const btn = document.getElementById('confirm-yes-btn');
        
        if (titleEl && msgEl && btn) {
            titleEl.innerText = title;
            msgEl.innerText = message;
            
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.onclick = () => {
                onConfirm();
                this.closeModal('modal-confirm');
            };
            
            this.showModal('modal-confirm');
        }
    },

    renderAll() {
        this.renderPlants();
        this.renderInventory();
        this.renderNotes();
    },

    renderPlants() {
        const container = document.getElementById('plants-list');
        if (!container) return;
        container.innerHTML = '';
        
        // Ordenar alfabéticamente A-Z
        const sortedPlants = [...store.data.plants].sort((a, b) => 
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );

        const formatDate = (dateStr) => {
            if (!dateStr) return 'Nunca';
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}/${y}`;
        };

        sortedPlants.forEach(plant => {
            const card = document.createElement('div');
            card.className = `card plant-card ${app.selectedPlantId === plant.id ? 'selected' : ''}`;
            card.onclick = () => app.viewPlantDetail(plant.id);
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <h3 style="margin:0">${plant.icon || '🌿'} ${plant.name}</h3>
                    <small style="background:#e8f5e9; color:var(--primary); padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold">${plant.type || 'Planta'}</small>
                </div>
                <p style="margin-top:0.5rem"><strong>Último riego:</strong> ${formatDate(plant.lastWateredDate)}</p>
                <p><strong>Logs:</strong> ${plant.logs.length} registros</p>
            `;
            container.appendChild(card);
        });
    },

    renderInventory() {
        const categories = ['substrates', 'powders', 'liquids', 'others'];
        categories.forEach(cat => {
            const list = document.getElementById(`list-${cat}`);
            if (!list) return;
            list.innerHTML = '';
            
            if (!store.data.inventory[cat]) store.data.inventory[cat] = [];

            store.data.inventory[cat].forEach((item, index) => {
                const name = typeof item === 'object' ? item.name : item;
                const qty = typeof item === 'object' ? item.qty : 0;
                const unit = typeof item === 'object' ? item.unit : '';

                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.flexDirection = 'column';
                li.style.gap = '0.3rem';
                li.style.padding = '0.8rem 0';
                
                li.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <strong style="color:var(--primary)">${name}</strong>
                        <div style="display:flex; gap:0.2rem">
                            <button class="btn-text" style="padding:2px" onclick="app.showCalendarModal('Comprar ${name}', 'Recordatorio de stock: Quedan ${qty} ${unit}')" title="Recordatorio compra">📅</button>
                            <button class="btn-text" style="color:var(--danger); padding:2px" onclick="app.removeItem('${cat}', ${index})">✕</button>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; padding:0.3rem 0.6rem; border-radius:4px">
                        <span style="font-size:0.9rem; font-weight:600">${qty} <small>${unit}</small></span>
                        <div style="display:flex; gap:0.3rem">
                            <button class="btn-primary" style="padding:0 8px; font-size:1.2rem; background:var(--secondary)" onclick="app.updateItemQty('${cat}', ${index}, -1)">-</button>
                            <button class="btn-primary" style="padding:0 8px; font-size:1.2rem" onclick="app.updateItemQty('${cat}', ${index}, 1)">+</button>
                        </div>
                    </div>
                `;
                list.appendChild(li);
            });
        });
    },

    renderNotes() {
        const container = document.getElementById('notes-list');
        if (!container) return;
        container.innerHTML = '';
        store.data.globalNotes.sort((a,b) => b.id - a.id).forEach(note => {
            const div = document.createElement('div');
            div.className = 'note-item';
            div.innerHTML = `
                <small class="note-date">${new Date(note.id).toLocaleString()}</small>
                <p>${note.content}</p>
                <div style="text-align:right; display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem">
                    <button class="btn-text" style="padding:0" onclick="app.showCalendarModal('Nota Global', '${note.content.replace(/'/g, "\\'")}')" title="Añadir recordatorio">📅</button>
                    <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeNote(${note.id})">Eliminar</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
};

// --- 3. APP LOGIC (CONTROLLER) ---
const app = {
    selectedPlantId: null,

    init() {
        store.init();
        ui.initTabs();
        ui.renderAll();

        // Listener para cerrar búsqueda al hacer clic fuera
        document.addEventListener('click', (e) => {
            const container = document.getElementById('global-search-container');
            if (container && !e.target.closest('#global-search-container')) {
                const panel = document.getElementById('search-results');
                if (panel) panel.classList.remove('active');
            }
        });
    },

    // --- Global Search ---
    handleSearch(query) {
        const resultsPanel = document.getElementById('search-results');
        if (!resultsPanel) return;
        
        if (!query || query.trim().length < 2) {
            resultsPanel.classList.remove('active');
            return;
        }

        const q = query.toLowerCase();
        const results = [];

        // 1. Buscar en Plantas (Nombre y Tipo)
        store.data.plants.forEach(p => {
            const nameMatch = p.name.toLowerCase().includes(q);
            const typeMatch = (p.type || 'Planta').toLowerCase().includes(q);
            
            if (nameMatch || typeMatch) {
                results.push({ 
                    type: 'Planta', 
                    title: `${p.icon || '🌿'} ${p.name}`, 
                    sub: `Tipo: ${p.type || 'Planta'}`, 
                    action: () => {
                        ui.switchTab('tab-plants');
                        app.viewPlantDetail(p.id);
                    }
                });
            }
        });

        // 2. Buscar en Inventario
        const categories = { substrates: 'Sustrato 🟤', powders: 'Polvo ⚪', liquids: 'Líquido 🧪', others: 'Otros 📦' };
        Object.keys(categories).forEach(cat => {
            if (store.data.inventory[cat]) {
                store.data.inventory[cat].forEach(item => {
                    const name = typeof item === 'object' ? item.name : item;
                    if (name.toLowerCase().includes(q)) {
                        results.push({ type: 'Inventario', title: name, sub: categories[cat], action: () => {
                            ui.switchTab('tab-inventory');
                        }});
                    }
                });
            }
        });

        // 3. Buscar en Notas
        store.data.globalNotes.forEach(n => {
            if (n.content.toLowerCase().includes(q)) {
                results.push({ type: 'Nota', title: n.content.substring(0, 30) + '...', sub: 'En Notas Globales', action: () => {
                    ui.switchTab('tab-notes');
                }});
            }
        });

        this.renderSearchResults(results);
    },

    renderSearchResults(results) {
        const resultsPanel = document.getElementById('search-results');
        if (!resultsPanel) return;
        resultsPanel.innerHTML = '';
        
        if (results.length === 0) {
            resultsPanel.innerHTML = '<div class="search-result-item"><p style="font-size:0.8rem; color:var(--text-light)">No se encontraron resultados</p></div>';
        } else {
            results.forEach(res => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                div.onclick = () => {
                    res.action();
                    resultsPanel.classList.remove('active');
                    const searchInput = document.getElementById('global-search');
                    if (searchInput) searchInput.value = '';
                };
                div.innerHTML = `
                    <span class="res-type">${res.type}</span>
                    <span class="res-title">${res.title}</span>
                    <span class="res-sub">${res.sub}</span>
                `;
                resultsPanel.appendChild(div);
            });
        }
        resultsPanel.classList.add('active');
    },

    // --- Plants Actions ---
    toggleCustomType(val) {
        const group = document.getElementById('custom-type-group');
        if (group) {
            group.style.display = (val === 'CUSTOM') ? 'block' : 'none';
            if (val === 'CUSTOM') document.getElementById('p-custom-type').focus();
        }
    },

    handleAddPlant(e) {
        e.preventDefault();
        const typeVal = document.getElementById('p-icon').value;
        let icon = '🌿';
        let type = 'Planta';

        if (typeVal === 'CUSTOM') {
            const custom = document.getElementById('p-custom-type').value || 'Otra 🌿';
            const emojiMatch = custom.match(/([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}])/u);
            icon = emojiMatch ? emojiMatch[0] : '🌿';
            type = custom.replace(icon, '').trim() || 'Otra';
        } else {
            [icon, type] = typeVal.split('|');
        }

        const name = document.getElementById('p-name').value;
        const date = document.getElementById('p-watered').value;

        const newPlant = {
            id: Date.now(),
            icon: icon,
            type: type,
            name: name,
            lastWateredDate: date,
            logs: [{ id: Date.now(), date: date, actionType: 'Initial', detail: 'Planta añadida al sistema' }]
        };

        store.data.plants.push(newPlant);
        store.save();
        ui.renderPlants();
        ui.closeModal('modal-add-plant');
        e.target.reset();
        const group = document.getElementById('custom-type-group');
        if (group) group.style.display = 'none';
        app.viewPlantDetail(newPlant.id);
    },

    viewPlantDetail(id) {
        const plant = store.data.plants.find(p => p.id === id);
        if (!plant) return;

        app.selectedPlantId = id;
        ui.renderPlants();

        const panel = document.getElementById('plant-detail-panel');
        if (!panel) return;
        const today = new Date().toISOString().split('T')[0];
        
        const emojiMap = {
            'Riego': '💧', 'Sustrato': '🟤', 'Polvos': '⚪', 'Líquidos': '🧪', 
            'Humus': '🪱', 'Nota': '📝', 'Transplante': '🪴', 'Plaga/Enfermedad': '🐛', 'Initial': '✨'
        };

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.3rem">
                <h2 style="margin:0; flex:1">${plant.icon || '🌿'} ${plant.name}</h2>
                <div style="display:flex; gap:0.5rem">
                    <button class="btn-text" onclick="app.showCalendarModal('Regar ${plant.name}', 'Recordatorio de cuidado')" title="Añadir recordatorio" style="font-size:1.2rem; padding:0">📅</button>
                    <button class="btn-text" onclick="app.editPlant(${plant.id})" title="Editar planta" style="font-size:1.2rem; padding:0 0.5rem">✏️</button>
                </div>
            </div>
            <div style="margin-bottom:1.5rem">
                <span style="background:var(--primary-light); color:white; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:bold; text-transform:uppercase">
                    ${plant.type || 'Planta'}
                </span>
            </div>
            
            <div class="log-section">
                <h3>Añadir Registro</h3>
                <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                    <div class="form-group">
                        <label>Acción:</label>
                        <select id="log-action">
                            <option value="Riego">Riego 💧</option>
                            <option value="Sustrato">Sustrato 🟤</option>
                            <option value="Polvos">Polvos ⚪</option>
                            <option value="Líquidos">Líquidos 🧪</option>
                            <option value="Humus">Humus 🪱</option>
                            <option value="Transplante">Transplante 🪴</option>
                            <option value="Plaga/Enfermedad">Plaga/Enfermedad 🐛</option>
                            <option value="Nota">Nota 📝</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha:</label>
                        <input type="date" id="log-date" value="${today}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Detalle:</label>
                    <input type="text" id="log-detail" placeholder="Comentario...">
                </div>
                <button class="btn-primary" style="width:100%; margin-top:0.5rem" onclick="app.addPlantLog(${plant.id})">Guardar Registro</button>
            </div>

            <div class="log-section" style="margin-top: 2rem;">
                <h3>Historial</h3>
                <div class="log-list">
                    ${plant.logs.sort((a,b) => {
                        if (b.date !== a.date) return b.date.localeCompare(a.date);
                        return b.id - a.id;
                    }).map(log => `
                        <div class="log-item">
                            <div style="display:flex; justify-content:space-between; align-items:center">
                                <strong>${emojiMap[log.actionType] || '📝'} ${log.actionType}</strong>
                                <div style="display:flex; align-items:center; gap:0.5rem">
                                    <small>${log.date.split('-').reverse().join('/')}</small>
                                    <button class="btn-text" style="color:var(--danger); padding:0; font-size:1.1rem" onclick="app.removePlantLog(${plant.id}, ${log.id})">✕</button>
                                </div>
                            </div>
                            <p style="margin-top:0.2rem; color:var(--text-light)">${log.detail}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <hr style="margin:1.5rem 0">
            <button class="btn-text" style="color:var(--danger); width:100%" onclick="app.removePlant(${plant.id})">Eliminar Planta</button>
        `;
    },

    addPlantLog(id) {
        const actionType = document.getElementById('log-action').value;
        const date = document.getElementById('log-date').value;
        const detail = document.getElementById('log-detail').value || `Aplicación de ${actionType}`;
        const plant = store.data.plants.find(p => p.id === id);
        if (plant) {
            plant.logs.push({ id: Date.now(), date, actionType, detail });
            if (actionType === 'Riego' && (!plant.lastWateredDate || date >= plant.lastWateredDate)) {
                plant.lastWateredDate = date;
            }
            store.save();
            ui.renderPlants();
            this.viewPlantDetail(id);
        }
    },

    removePlantLog(plantId, logId) {
        ui.askConfirm("¿Borrar registro?", "Se eliminará del historial.", () => {
            const plant = store.data.plants.find(p => p.id === plantId);
            if (plant) {
                plant.logs = plant.logs.filter(log => log.id !== logId);
                const lastWatering = plant.logs.filter(l => l.actionType === 'Riego').sort((a, b) => b.date.localeCompare(a.date))[0];
                plant.lastWateredDate = lastWatering ? lastWatering.date : '';
                store.save();
                ui.renderPlants();
                app.viewPlantDetail(plantId);
            }
        });
    },

    removePlant(id) {
        ui.askConfirm("¿Eliminar planta?", "Se borrarán todos los datos para siempre.", () => {
            store.data.plants = store.data.plants.filter(p => p.id !== id);
            store.save();
            app.selectedPlantId = null;
            const panel = document.getElementById('plant-detail-panel');
            if (panel) panel.innerHTML = `<div class="empty-state"><p>Seleccioná una planta para ver su detalle</p></div>`;
            ui.renderPlants();
        });
    },

    editPlant(id) {
        const plant = store.data.plants.find(p => p.id === id);
        if (!plant) return;
        
        document.getElementById('edit-p-id').value = id;
        document.getElementById('edit-p-name').value = plant.name;
        
        const typeSelect = document.getElementById('edit-p-icon');
        const comboValue = `${plant.icon}|${plant.type}`;
        
        // Intentar seleccionar el combo en el select
        let found = false;
        for (let opt of typeSelect.options) {
            if (opt.value === comboValue) {
                typeSelect.value = comboValue;
                found = true;
                break;
            }
        }
        
        if (!found) {
            typeSelect.value = 'CUSTOM';
            document.getElementById('edit-p-custom-type').value = `${plant.type} ${plant.icon}`;
        }
        
        this.toggleEditCustomType(typeSelect.value);
        ui.showModal('modal-edit-plant');
    },

    toggleEditCustomType(val) {
        const group = document.getElementById('edit-custom-type-group');
        if (group) {
            group.style.display = (val === 'CUSTOM') ? 'block' : 'none';
        }
    },

    handleEditPlant(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-p-id').value);
        const name = document.getElementById('edit-p-name').value;
        const typeVal = document.getElementById('edit-p-icon').value;
        
        const plant = store.data.plants.find(p => p.id === id);
        if (plant) {
            plant.name = name.trim();
            
            if (typeVal === 'CUSTOM') {
                const custom = document.getElementById('edit-p-custom-type').value || 'Otra 🌿';
                const emojiMatch = custom.match(/([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}])/u);
                plant.icon = emojiMatch ? emojiMatch[0] : '🌿';
                plant.type = custom.replace(plant.icon, '').trim() || 'Otra';
            } else {
                [plant.icon, plant.type] = typeVal.split('|');
            }
            
            store.save();
            ui.renderPlants();
            app.viewPlantDetail(id);
            ui.closeModal('modal-edit-plant');
        }
    },

    showCalendarModal(title, desc) {
        const tInput = document.getElementById('cal-title');
        const dInput = document.getElementById('cal-desc');
        const dtInput = document.getElementById('cal-date');
        if (tInput && dInput && dtInput) {
            tInput.value = title;
            dInput.value = desc;
            dtInput.value = new Date().toISOString().split('T')[0];
            ui.showModal('modal-calendar');
        }
    },

    handleCalendarSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('cal-title').value;
        const desc = document.getElementById('cal-desc').value;
        const date = document.getElementById('cal-date').value.replace(/-/g, '');
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(desc)}&dates=${date}/${date}`;
        window.open(url, '_blank');
        ui.closeModal('modal-calendar');
    },

    handleAddItem(e) {
        e.preventDefault();
        const type = document.getElementById('i-type').value;
        const name = document.getElementById('i-name').value;
        const qty = parseFloat(document.getElementById('i-qty').value);
        const unit = document.getElementById('i-unit').value;
        
        if (!store.data.inventory[type]) store.data.inventory[type] = [];
        store.data.inventory[type].push({ name, qty, unit });
        store.save();
        ui.renderInventory();
        ui.closeModal('modal-add-item');
        e.target.reset();
    },

    updateItemQty(type, index, delta) {
        const item = store.data.inventory[type][index];
        if (item) {
            item.qty = Math.max(0, parseFloat((item.qty + delta).toFixed(2)));
            store.save();
            ui.renderInventory();
        }
    },

    removeItem(type, index) {
        ui.askConfirm("¿Eliminar insumo?", "Se quitará de tu inventario.", () => {
            store.data.inventory[type].splice(index, 1);
            store.save();
            ui.renderInventory();
        });
    },

    handleAddNote(e) {
        e.preventDefault();
        const content = document.getElementById('n-content').value;
        store.data.globalNotes.push({ id: Date.now(), content });
        store.save();
        ui.renderNotes();
        ui.closeModal('modal-add-note');
        e.target.reset();
    },

    removeNote(id) {
        ui.askConfirm("¿Borrar nota?", "Se eliminará permanentemente.", () => {
            store.data.globalNotes = store.data.globalNotes.filter(n => n.id !== id);
            store.save();
            ui.renderNotes();
        });
    },

    exportBackup() {
        const exportData = JSON.parse(JSON.stringify(store.data));
        
        if (!exportData.inventory.others) exportData.inventory.others = [];
        
        exportData.plants = exportData.plants.map(plant => ({
            ...plant,
            icon: plant.icon || '🌿',
            type: plant.type || 'Planta'
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantitas_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importBackup(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.plants && importedData.inventory) {
                    // Migración y Sanitización profunda al importar
                    if (!importedData.inventory.others) importedData.inventory.others = [];
                    importedData.plants = importedData.plants.map(p => ({
                        ...p,
                        icon: p.icon || '🌿',
                        type: p.type || 'Planta'
                    }));

                    store.update(importedData);
                    ui.showInfo("¡Éxito!", "El respaldo ha sido importado correctamente.");
                } else {
                    ui.showInfo("Error", "El archivo no tiene el formato esperado.");
                }
            } catch (err) { 
                ui.showInfo("Error", "No se pudo leer el archivo o el JSON es inválido."); 
            }
        };
        reader.readAsText(file);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
