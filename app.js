/**
 * PlantitasApp PRO - Business Logic & UI Controller
 * Strictly Vanilla JS - No Modules - Local Storage Persistence
 */

// --- 1. STORE MANAGER (STATE) ---
const store = {
    data: {
        inventory: { substrates: [], fertilizers: [], powders: [], liquids: [], others: [] },
        plants: [],
        globalNotes: [],
        propagations: [],
        wishlist: [],
        seasonalTasks: { Primavera: [], Verano: [], Otoño: [], Invierno: [] }
    },

    init() {
        const saved = localStorage.getItem('plantitas_db');
        if (saved) {
            try {
                this.update(JSON.parse(saved), false);
            } catch (e) {
                console.error("Error loading data:", e);
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

    update(newData, shouldSave = true) {
        console.log("Normalizing and updating data...");
        this.data = this.normalize(newData);
        if (shouldSave) this.save();
        ui.renderAll();
    },

    normalize(d) {
        const inv = d.inventory || {};
        return {
            inventory: {
                substrates: inv.substrates || [],
                fertilizers: inv.fertilizers || [],
                powders: inv.powders || [],
                liquids: inv.liquids || [],
                others: inv.others || []
            },
            plants: (d.plants || []).map(p => ({
                ...p,
                icon: p.icon || '🌿',
                type: p.type || 'Planta',
                location: p.location || 'No especificada',
                light: p.light || 'Media',
                potType: p.potType || 'Plástico',
                dormancy: p.dormancy || 'Ninguna',
                logs: (p.logs || [])
            })),
            globalNotes: d.globalNotes || [],
            propagations: (d.propagations || []).map(pr => ({
                ...pr,
                status: pr.status || 'Activo',
                notes: pr.notes || ''
            })),
            wishlist: d.wishlist || [],
            seasonalTasks: d.seasonalTasks || { Primavera: [], Verano: [], Otoño: [], Invierno: [] }
        };
    },

    merge(incomingData) {
        console.log("Merging data structures...");
        const incoming = this.normalize(incomingData);
        
        // Helper para unificar por ID (Map asegura unicidad)
        const mergeById = (local, imported) => {
            const map = new Map();
            local.forEach(item => map.set(item.id, item));
            imported.forEach(item => map.set(item.id, item)); // El importado pisa si hay mismo ID (más reciente)
            return Array.from(map.values());
        };

        // Unificar Inventario por nombre y sumar cantidades
        const mergeInventory = (local, imported) => {
            const result = JSON.parse(JSON.stringify(local)); // Clon profundo
            for (const cat in imported) {
                if (!result[cat]) result[cat] = [];
                imported[cat].forEach(impItem => {
                    const localItem = result[cat].find(l => l.name === impItem.name);
                    if (localItem) {
                        localItem.qty = Math.max(localItem.qty, impItem.qty); // Nos quedamos con el stock más alto para seguridad
                    } else {
                        result[cat].push(impItem);
                    }
                });
            }
            return result;
        };

        this.data = {
            plants: mergeById(this.data.plants, incoming.plants),
            propagations: mergeById(this.data.propagations, incoming.propagations),
            globalNotes: mergeById(this.data.globalNotes, incoming.globalNotes),
            wishlist: mergeById(this.data.wishlist, incoming.wishlist),
            inventory: mergeInventory(this.data.inventory, incoming.inventory),
            seasonalTasks: incoming.seasonalTasks // Para tareas estacionales preferimos las del backup o las mezclamos? Append por ahora.
        };

        this.save();
        ui.renderAll();
    }
};

// --- 2. UI CONTROLLER (DOM) ---
const ui = {
    flashExportButton() {
        const btn = document.getElementById('btn-export');
        if (btn) {
            btn.classList.add('flash-active');
            setTimeout(() => btn.classList.remove('flash-active'), 4000);
        }
    },

    initTabs() {
        document.querySelectorAll('.tab-link').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                const hash = tabId.replace('tab-', '').charAt(0).toUpperCase() + tabId.replace('tab-', '').slice(1);
                window.location.hash = hash;
            });
        });
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
    },

    handleRouting() {
        const hash = window.location.hash.replace('#', '');
        const map = { 'Plants': 'tab-plants', 'Nursery': 'tab-nursery', 'Season': 'tab-season', 'Wishlist': 'tab-wishlist', 'Inventory': 'tab-inventory', 'Notes': 'tab-notes' };
        const tabId = map[hash] || 'tab-plants';
        this.switchTab(tabId, false);
    },

    switchTab(tabId, updateHash = true) {
        document.querySelectorAll('.tab-link').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId));
        document.querySelectorAll('.tab-content').forEach(view => view.classList.toggle('active', view.id === tabId));
        if (updateHash) {
            const hash = tabId.replace('tab-', '').charAt(0).toUpperCase() + tabId.replace('tab-', '').slice(1);
            window.location.hash = hash;
        }
        this.renderAll();
    },

    showModal(id) { document.getElementById(id)?.showModal(); },
    closeModal(id) { document.getElementById(id)?.close(); },

    showInfo(title, message) {
        const titleEl = document.getElementById('info-title');
        const msgEl = document.getElementById('info-msg');
        if (titleEl && msgEl) { titleEl.innerText = title; msgEl.innerText = message; this.showModal('modal-info'); }
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
            newBtn.onclick = () => { onConfirm(); this.closeModal('modal-confirm'); };
            this.showModal('modal-confirm');
        }
    },

    askImportChoice(message, onMerge, onOverwrite) {
        const msgEl = document.getElementById('import-choice-msg');
        const btnMerge = document.getElementById('import-btn-merge');
        const btnOverwrite = document.getElementById('import-btn-overwrite');
        if (msgEl && btnMerge && btnOverwrite) {
            msgEl.innerText = message;
            btnMerge.onclick = () => { onMerge(); this.closeModal('modal-import-choice'); };
            btnOverwrite.onclick = () => { onOverwrite(); this.closeModal('modal-import-choice'); };
            this.showModal('modal-import-choice');
        }
    },

    renderAll() {
        const activeTab = document.querySelector('.tab-link.active')?.getAttribute('data-tab');
        if (!activeTab) return;
        if (activeTab === 'tab-plants') this.renderPlants();
        if (activeTab === 'tab-nursery') this.renderNursery();
        if (activeTab === 'tab-season') this.renderSeason();
        if (activeTab === 'tab-wishlist') this.renderWishlist();
        if (activeTab === 'tab-inventory') this.renderInventory();
        if (activeTab === 'tab-notes') this.renderNotes();
    },

    renderPlants() {
        const container = document.getElementById('plants-list');
        if (!container) return;
        container.innerHTML = '';
        const sortedPlants = [...store.data.plants].sort((a, b) => a.name.localeCompare(b.name));
        sortedPlants.forEach(plant => {
            const card = document.createElement('div');
            card.className = `card plant-card ${app.selectedPlantId === plant.id ? 'selected' : ''}`;
            card.onclick = () => app.viewPlantDetail(plant.id);
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <h3 style="margin:0">${plant.icon} ${plant.name}</h3>
                    <small class="badge badge-success">${plant.type}</small>
                </div>
                <div class="microclima-info"><span class="microclima-tag">📍 ${plant.location}</span></div>
                <p><strong>Riego:</strong> ${app.formatDate(plant.lastWateredDate)}</p>
            `;
            container.appendChild(card);
        });
    },

    renderNursery(filter = 'TODOS') {
        const container = document.getElementById('nursery-list');
        if (!container) return;
        container.innerHTML = '';
        const list = store.data.propagations.filter(p => filter === 'TODOS' || p.status === filter);
        list.forEach(prop => {
            const card = document.createElement('div');
            card.className = `prop-card prop-status-${prop.status.toLowerCase().replace(' ', '-')}`;
            let badgeClass = 'badge-warning';
            let icon = '⌛';
            if (prop.status === 'Éxito') { badgeClass = 'badge-success'; icon = '✅'; }
            if (prop.status === 'Fracaso') { badgeClass = 'badge-danger'; icon = '❌'; }
            if (prop.status === 'Trasplantada') { badgeClass = 'badge-info'; icon = '🌳'; }
            const methodIcon = app.getMethodIcon(prop.method);
            card.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr auto; gap: 0.5rem; align-items: start; margin-bottom: 0.8rem">
                    <div>
                        <h4 style="margin:0">🧪 ${prop.name}</h4>
                        <small style="color:var(--text-light)">${methodIcon} ${prop.method}</small>
                    </div>
                    <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem">
                        <span class="badge ${badgeClass}">${icon} ${prop.status}</span>
                        <small style="color:var(--text-light); white-space:nowrap">📅 ${app.formatDate(prop.startDate)}</small>
                    </div>
                </div>
                <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem; border-top: 1px solid #eee; padding-top:0.5rem">📝 ${prop.notes || 'Sin notas'}</p>
                <div style="margin-top:auto; display:flex; gap:0.5rem; align-items:center; justify-content: space-between">
                    <div style="display:flex; gap:0.5rem">
                        ${prop.status === 'Activo' ? `
                            <button class="btn-primary" style="padding:4px 8px; font-size:0.8rem" onclick="app.updatePropStatus(${prop.id}, 'Éxito')">✅ Éxito</button>
                            <button class="btn-text" style="color:var(--danger); padding:4px" onclick="app.updatePropStatus(${prop.id}, 'Fracaso')">❌ Fallo</button>
                        ` : prop.status === 'Éxito' ? `
                            <button class="btn-primary" style="padding:4px 8px; font-size:0.8rem; background:var(--secondary)" onclick="app.graduatePlant(${prop.id})">🪴 Convertir</button>
                        ` : ''}
                    </div>
                    <div style="display:flex; gap:0.5rem">
                        <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('Chequear: ${prop.name}', 'Método: ${prop.method}. Notas: ${prop.notes}')">📅</button>
                        <button class="btn-text" style="padding:0" onclick="app.editProp(${prop.id})">✏️</button>
                        <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeProp(${prop.id})">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderSeason() {
        const container = document.getElementById('season-grid');
        if (!container) return;
        container.innerHTML = '';
        const seasons = [{ name: 'Primavera', icon: '🌸' }, { name: 'Verano', icon: '☀️' }, { name: 'Otoño', icon: '🍂' }, { name: 'Invierno', icon: '❄️' }];
        seasons.forEach(s => {
            const section = document.createElement('div');
            section.className = 'inventory-card';
            const tasks = store.data.seasonalTasks[s.name] || [];
            section.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--background); padding-bottom:0.5rem; margin-bottom:1rem">
                    <h3 style="margin:0">${s.icon} ${s.name}</h3>
                    <button class="btn-backup" onclick="app.openSeasonTaskModal('${s.name}')">+ Añadir Acción</button>
                </div>
                <ul class="season-task-list">
                    ${tasks.length === 0 ? '<p style="font-size:0.85rem; color:var(--text-light); text-align:center">Sin planes.</p>' : ''}
                    ${tasks.map((t, idx) => `
                        <li class="season-task-item">
                            <div style="flex:1"><strong>${app.getTaskIcon(t.type)} ${t.type}</strong><p style="margin:2px 0 0 0">📝 ${t.desc}</p></div>
                            <div style="display:flex; gap:0.5rem">
                                <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('${t.type}: Plan de ${s.name}', '${t.desc}')">📅</button>
                                <button class="btn-text" style="padding:0" onclick="app.editSeasonTask('${s.name}', ${idx})">✏️</button>
                                <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeSeasonTask('${s.name}', ${idx})">🗑️</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
            container.appendChild(section);
        });
    },

    renderWishlist() {
        const container = document.getElementById('wishlist-container');
        if (!container) return;
        container.innerHTML = '';
        store.data.wishlist.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card wish-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between">
                    <h3 style="margin:0">✨ ${item.name}</h3>
                    <span class="badge ${item.priority === 'Alta' ? 'badge-danger' : 'badge-warning'}">${item.priority === 'Alta' ? '🔥 Alta' : item.priority}</span>
                </div>
                <p style="margin:0.5rem 0">📝 ${item.notes || 'Sin notas'}</p>
                <div style="display:flex; gap:0.5rem; margin-top:1rem; align-items:center; justify-content: space-between">
                    <button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="app.buyWish(${item.id})">💸 ¡Listo!</button>
                    <div style="display:flex; gap:0.5rem">
                        <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('Comprar: ${item.name}', 'Prioridad: ${item.priority}. Notas: ${item.notes}')">📅</button>
                        <button class="btn-text" style="padding:0" onclick="app.editWish(${item.id})">✏️</button>
                        <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeWish(${item.id})">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    renderInventory() {
        const categories = ['substrates', 'fertilizers', 'powders', 'liquids', 'others'];
        categories.forEach(cat => {
            const list = document.getElementById(`list-${cat}`);
            if (list) {
                list.innerHTML = '';
                store.data.inventory[cat].forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'inventory-item';
                    li.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <div style="display:flex; align-items:center; gap:0.5rem">
                                <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('Reponer: ${item.name}', 'Cantidad actual: ${item.qty} ${item.unit}')">📅</button>
                                <strong>📦 ${item.name}</strong>
                            </div>
                            <div style="display:flex; gap:0.5rem">
                                <button class="btn-text" style="padding:0" onclick="app.editItem('${cat}', ${index})">✏️</button>
                                <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeItem('${cat}', ${index})">🗑️</button>
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.3rem">
                            <span>🧪 ${item.qty} ${item.unit}</span>
                            <div>
                                <button class="btn-backup" onclick="app.updateItemQty('${cat}', ${index}, -1)">-</button>
                                <button class="btn-backup" onclick="app.updateItemQty('${cat}', ${index}, 1)">+</button>
                            </div>
                        </div>
                    `;
                    list.appendChild(li);
                });
            }
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
                <div style="display:flex; justify-content:space-between; align-items:flex-start">
                    <small class="note-date">📅 ${new Date(note.id).toLocaleString()}</small>
                    <div style="display:flex; gap:0.5rem">
                        <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('Nota: ${note.content.substring(0,15)}', '${note.content}')">📅</button>
                        <button class="btn-text" style="padding:0" onclick="app.editNote(${note.id})">✏️</button>
                        <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removeNote(${note.id})">🗑️</button>
                    </div>
                </div>
                <p style="margin-top:0.5rem">📝 ${note.content}</p>
            `;
            container.appendChild(div);
        });
    }
};

// --- 3. APP LOGIC (CONTROLLER) ---
const app = {
    selectedPlantId: null,
    graduatingPropId: null,
    currentLogFilter: 'Todos',

    init() {
        store.init();
        ui.initTabs();
        this.initParentSelect();
    },

    formatDate(dateStr) {
        if (!dateStr) return 'Nunca';
        return dateStr.split('-').reverse().join('/');
    },

    setLogFilter(filter) {
        this.currentLogFilter = filter;
        this.viewPlantDetail(this.selectedPlantId);
    },

    openCalendarModal(title, desc) {
        document.getElementById('cal-title').value = title;
        document.getElementById('cal-desc').value = desc;
        document.getElementById('cal-date').value = new Date().toISOString().split('T')[0];
        ui.showModal('modal-calendar');
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

    // --- Season ---
    openSeasonTaskModal(season) {
        document.getElementById('st-season').value = season;
        document.getElementById('st-desc').value = '';
        ui.showModal('modal-add-season-task');
    },

    handleAddSeasonTask(e) {
        e.preventDefault();
        const season = document.getElementById('st-season').value;
        const task = { type: document.getElementById('st-type').value, desc: document.getElementById('st-desc').value };
        store.data.seasonalTasks[season].push(task);
        store.save(); ui.closeModal('modal-add-season-task'); ui.renderSeason();
    },

    editSeasonTask(season, idx) {
        const task = store.data.seasonalTasks[season][idx];
        document.getElementById('edit-st-season').value = season;
        document.getElementById('edit-st-idx').value = idx;
        document.getElementById('edit-st-type').value = task.type;
        document.getElementById('edit-st-desc').value = task.desc;
        ui.showModal('modal-edit-season-task');
    },

    handleEditSeasonTask(e) {
        e.preventDefault();
        const season = document.getElementById('edit-st-season').value;
        const idx = parseInt(document.getElementById('edit-st-idx').value);
        store.data.seasonalTasks[season][idx] = {
            type: document.getElementById('edit-st-type').value,
            desc: document.getElementById('edit-st-desc').value
        };
        store.save(); ui.renderSeason(); ui.closeModal('modal-edit-season-task');
    },

    removeSeasonTask(season, idx) {
        ui.askConfirm("¿Eliminar plan?", "Esta acción no se puede deshacer.", () => {
            store.data.seasonalTasks[season].splice(idx, 1);
            store.save(); ui.renderSeason();
        });
    },

    getTaskIcon(type) {
        const icons = { Poda: '✂️', Siembra: '🌱', Transplante: '🪴', Abonado: '🧪', Limpieza: '🧹', Otro: '📝' };
        return icons[type] || '📝';
    },

    toggleCustomType(selectId, wrapId) {
        const select = document.getElementById(selectId);
        const wrap = document.getElementById(wrapId);
        if (select && wrap) wrap.style.display = select.value === 'CUSTOM' ? 'block' : 'none';
    },

    // --- Plants ---
    handleAddPlant(e) {
        e.preventDefault();
        const typeSelect = document.getElementById('p-type').value;
        let icon = '🌿', type = 'Planta';

        if (typeSelect === 'CUSTOM') {
            const custom = document.getElementById('p-custom-type').value || '🌿|Planta';
            const parts = custom.includes('|') ? custom.split('|') : ['🌿', custom];
            icon = parts[0]; type = parts[1];
        } else {
            const parts = typeSelect.split('|');
            icon = parts[0]; type = parts[1];
        }

        const newPlant = {
            id: Date.now(),
            icon, type,
            name: document.getElementById('p-name').value,
            location: document.getElementById('p-location').value || 'No especificada',
            light: document.getElementById('p-light').value,
            potType: document.getElementById('p-pot').value,
            dormancy: document.getElementById('p-dormancy').value,
            lastWateredDate: '',
            logs: [{ id: Date.now(), date: new Date().toISOString().split('T')[0], actionType: 'Initial', detail: 'Añadida' }]
        };
        store.data.plants.push(newPlant);
        if (this.graduatingPropId) {
            const prop = store.data.propagations.find(p => p.id === this.graduatingPropId);
            if (prop) prop.status = 'Trasplantada';
            this.graduatingPropId = null;
        }
        store.save(); ui.closeModal('modal-add-plant'); e.target.reset(); 
        document.getElementById('p-custom-type-wrap').style.display = 'none';
        ui.renderAll(); this.viewPlantDetail(newPlant.id); this.initParentSelect();
    },

    viewPlantDetail(id) {
        const plant = store.data.plants.find(p => p.id === id);
        if (!plant) return;
        app.selectedPlantId = id;
        ui.renderPlants();
        const panel = document.getElementById('plant-detail-panel');
        const today = new Date().toISOString().split('T')[0];

        const logIcons = {
            'Riego': '💧', 'Medición': '📏', 'Sustrato': '🟤', 'Fertilizante': '🧴', 'Polvos': '⚪',
            'Líquidos': '🧪', 'Trasplante': '🌳', 'Plaga/Enfermedad': '🐛', 'Nota': '📝', 'Initial': '🌱'
        };

        const filterOptions = ['Todos', ...Object.keys(logIcons).filter(k => k !== 'Initial')];

        const filteredLogs = plant.logs
            .filter(log => app.currentLogFilter === 'Todos' || log.actionType === app.currentLogFilter)
            .sort((a, b) => b.id - a.id);

        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <h2 style="margin:0">${plant.icon} ${plant.name}</h2>
                <div style="display:flex; gap:0.5rem">
                    <button class="btn-text" style="font-size:1.1rem; padding:0" onclick="app.openCalendarModal('Cuidar: ${plant.name}', 'Ubicación: ${plant.location}')">📅</button>
                    <button class="btn-text" style="padding:0" onclick="app.editPlant(${plant.id})">✏️</button>
                    <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removePlant(${plant.id})">🗑️</button>
                </div>
            </div>
            <div class="microclima-info">
                <span class="microclima-tag">📍 ${plant.location}</span>
                <span class="microclima-tag">☀️ ${plant.light}</span>
                <span class="microclima-tag">🪴 ${plant.potType}</span>
                <span class="microclima-tag">💤 ${plant.dormancy}</span>
            </div>
            <div class="log-section" style="background:#f5f5f5; padding:1rem; border-radius:8px; margin-top:1rem">
                <h3>🧪 Registro</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem">
                    <select id="log-action" onchange="app.updateLogInventorySelect()">
                        ${Object.keys(logIcons).filter(k => k !== 'Initial').map(type => `<option value="${type}">${logIcons[type]} ${type}</option>`).join('')}
                    </select>
                    <input type="date" id="log-date" value="${today}">
                </div>
                <div id="log-inventory-item-wrap" style="display:none; margin-top:0.5rem">
                    <select id="log-inventory-item" style="width:100%"></select>
                </div>
                <input type="text" id="log-detail" placeholder="Detalle..." style="margin-top:0.5rem">
                <button class="btn-primary" style="width:100%; margin-top:0.5rem" onclick="app.addPlantLog(${plant.id})">Guardar</button>
            </div>
            <div class="log-list" style="margin-top:1.5rem">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem">
                    <h3 style="margin:0">📜 Historial</h3>
                    <select id="log-filter" style="width:auto; font-size:0.8rem; padding:2px 5px" onchange="app.setLogFilter(this.value)">
                        ${filterOptions.map(opt => `<option value="${opt}" ${app.currentLogFilter === opt ? 'selected' : ''}>${opt === 'Todos' ? '🔍' : (logIcons[opt] || '')} ${opt}</option>`).join('')}
                    </select>
                </div>
                ${filteredLogs.length === 0 ? '<p style="text-align:center; color:var(--text-light); font-size:0.85rem">Sin registros para este filtro.</p>' : filteredLogs.map(log => {
                    const icon = logIcons[log.actionType] || '📝';
                    return `
                    <div class="log-item">
                        <div style="display:flex; justify-content:space-between; align-items:center">
                            <strong>${icon} ${log.actionType}</strong>
                            <div style="display:flex; gap:0.5rem; align-items:center">
                                <small>📅 ${app.formatDate(log.date)}</small>
                                <button class="btn-text" style="color:var(--danger); padding:0" onclick="app.removePlantLog(${plant.id}, ${log.id})">🗑️</button>
                            </div>
                        </div>
                        <p style="font-size:0.85rem">${log.detail}</p>
                    </div>`;
                }).join('')}
            </div>
        `;
    },

    updateLogInventorySelect() {
        const action = document.getElementById('log-action').value;
        const wrap = document.getElementById('log-inventory-item-wrap');
        const select = document.getElementById('log-inventory-item');
        
        const map = { 'Sustrato': 'substrates', 'Fertilizante': 'fertilizers', 'Polvos': 'powders', 'Líquidos': 'liquids' };
        const category = map[action];
        
        if (category && store.data.inventory[category].length > 0) {
            wrap.style.display = 'block';
            select.innerHTML = `<option value="">-- Elegir de Inventario --</option>` + 
                store.data.inventory[category].map(item => `<option value="${item.name}">${item.name} (${item.qty} ${item.unit})</option>`).join('');
        } else {
            wrap.style.display = 'none';
        }
    },

    addPlantLog(id) {
        const actionType = document.getElementById('log-action').value;
        const date = document.getElementById('log-date').value;
        const inventoryItem = document.getElementById('log-inventory-item').value;
        let detail = document.getElementById('log-detail').value;
        
        if (inventoryItem) {
            detail = detail ? `[${inventoryItem}] ${detail}` : `Usado: ${inventoryItem}`;
        }
        
        if (!detail) detail = `Acción: ${actionType}`;

        const plant = store.data.plants.find(p => p.id === id);
        if (plant) {
            plant.logs.push({ id: Date.now(), date, actionType, detail });
            if (actionType === 'Riego') plant.lastWateredDate = date;
            store.save();
            this.viewPlantDetail(id);
        }
    },

    editPlant(id) {
        const plant = store.data.plants.find(p => p.id === id);
        if (!plant) return;
        const setter = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        setter('edit-p-id', id); setter('edit-p-name', plant.name); setter('edit-p-location', plant.location); setter('edit-p-light', plant.light); setter('edit-p-pot', plant.potType); setter('edit-p-dormancy', plant.dormancy);
        
        const typeSelect = document.getElementById('edit-p-type');
        const typeVal = `${plant.icon}|${plant.type}`;
        const exists = Array.from(typeSelect.options).some(opt => opt.value === typeVal);
        
        if (exists) {
            typeSelect.value = typeVal;
            document.getElementById('edit-p-custom-type-wrap').style.display = 'none';
        } else {
            typeSelect.value = 'CUSTOM';
            document.getElementById('edit-p-custom-type-wrap').style.display = 'block';
            document.getElementById('edit-p-custom-type').value = typeVal;
        }
        
        ui.showModal('modal-edit-plant');
    },

    handleEditPlant(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-p-id').value);
        const plant = store.data.plants.find(p => p.id === id);
        if (plant) {
            const typeSelect = document.getElementById('edit-p-type').value;
            if (typeSelect === 'CUSTOM') {
                const custom = document.getElementById('edit-p-custom-type').value || '🌿|Planta';
                const parts = custom.includes('|') ? custom.split('|') : ['🌿', custom];
                plant.icon = parts[0]; plant.type = parts[1];
            } else {
                const parts = typeSelect.split('|');
                plant.icon = parts[0]; plant.type = parts[1];
            }

            plant.name = document.getElementById('edit-p-name').value;
            plant.location = document.getElementById('edit-p-location').value;
            plant.light = document.getElementById('edit-p-light').value;
            plant.potType = document.getElementById('edit-p-pot').value;
            plant.dormancy = document.getElementById('edit-p-dormancy').value;
            store.save(); this.viewPlantDetail(id); ui.closeModal('modal-edit-plant');
        }
    },

    handleSearch(query) {
        const resultsPanel = document.getElementById('search-results');
        if (!query.trim()) { resultsPanel.style.display = 'none'; return; }
        
        const q = query.toLowerCase();
        const matches = [];

        // Buscar en Plantas
        store.data.plants.forEach(p => {
            if (p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)) {
                matches.push({ type: 'Planta', name: p.name, icon: p.icon, id: p.id, action: () => { ui.switchTab('tab-plants'); app.viewPlantDetail(p.id); } });
            }
        });

        // Buscar en Propagaciones
        store.data.propagations.forEach(p => {
            if (p.name.toLowerCase().includes(q) || p.method.toLowerCase().includes(q)) {
                matches.push({ type: 'Propagación', name: p.name, icon: '🧪', id: p.id, action: () => ui.switchTab('tab-nursery') });
            }
        });

        // Buscar en Inventario
        ['substrates', 'powders', 'liquids', 'others'].forEach(cat => {
            store.data.inventory[cat].forEach(item => {
                if (item.name.toLowerCase().includes(q)) {
                    matches.push({ type: 'Inventario', name: item.name, icon: '📦', action: () => ui.switchTab('tab-inventory') });
                }
            });
        });

        // Renderizar resultados
        if (matches.length > 0) {
            resultsPanel.innerHTML = matches.map(m => `
                <div class="search-result-item" onclick="(${m.action.toString()})(); document.getElementById('search-results').style.display='none'; document.getElementById('global-search').value=''">
                    <span>${m.icon} <strong>${m.name}</strong> <small>(${m.type})</small></span>
                </div>
            `).join('');
            resultsPanel.style.display = 'block';
        } else {
            resultsPanel.innerHTML = '<div class="search-result-item"><span>No se encontraron resultados</span></div>';
            resultsPanel.style.display = 'block';
        }
    },

    removePlant(id) {
        ui.askConfirm("¿Eliminar planta?", "Se borrarán todos sus registros y datos de forma permanente.", () => {
            store.data.plants = store.data.plants.filter(p => p.id !== id);
            store.save(); app.selectedPlantId = null; ui.renderPlants();
            document.getElementById('plant-detail-panel').innerHTML = '<div class="empty-state"><p>Seleccioná una planta</p></div>';
        });
    },

    // --- Propagación ---
    getMethodIcon(method) { const icons = { Agua: '💧', Sustrato: '🟤', Acodo: '🌳', Semilla: '🌱' }; return icons[method] || '🧪'; },
    
    initParentSelect() {
        const select = document.getElementById('prop-parent');
        if (!select) return;
        select.innerHTML = '<option value="">-- Sin madre --</option>';
        store.data.plants.sort((a,b) => a.name.localeCompare(b.name)).forEach(p => {
            select.innerHTML += `<option value="${p.id}">${p.icon} ${p.name}</option>`;
        });
    },

    handleAddPropagation(e) {
        e.preventDefault();
        const newProp = {
            id: Date.now(),
            parentId: document.getElementById('prop-parent').value ? parseInt(document.getElementById('prop-parent').value) : null,
            name: document.getElementById('prop-name').value,
            method: document.getElementById('prop-method').value,
            startDate: document.getElementById('prop-start').value,
            status: 'Activo',
            notes: document.getElementById('prop-notes').value
        };
        store.data.propagations.push(newProp);
        store.save(); ui.closeModal('modal-add-prop'); e.target.reset(); ui.renderNursery();
    },

    updatePropStatus(id, status) {
        const prop = store.data.propagations.find(p => p.id === id);
        if (prop) { prop.status = status; store.save(); ui.renderNursery(); }
    },

    editProp(id) {
        const prop = store.data.propagations.find(p => p.id === id);
        if (!prop) return;
        document.getElementById('edit-prop-id').value = id;
        document.getElementById('edit-prop-name').value = prop.name;
        document.getElementById('edit-prop-method').value = prop.method;
        document.getElementById('edit-prop-start').value = prop.startDate;
        document.getElementById('edit-prop-notes').value = prop.notes || '';
        ui.showModal('modal-edit-prop');
    },

    handleEditProp(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-prop-id').value);
        const prop = store.data.propagations.find(p => p.id === id);
        if (prop) {
            prop.name = document.getElementById('edit-prop-name').value;
            prop.method = document.getElementById('edit-prop-method').value;
            prop.startDate = document.getElementById('edit-prop-start').value;
            prop.notes = document.getElementById('edit-prop-notes').value;
            store.save(); ui.renderNursery(); ui.closeModal('modal-edit-prop');
        }
    },

    removeProp(id) {
        ui.askConfirm("¿Eliminar propagación?", "Esta acción es definitiva.", () => {
            store.data.propagations = store.data.propagations.filter(p => p.id !== id);
            store.save(); ui.renderNursery();
        });
    },

    graduatePlant(id) {
        const prop = store.data.propagations.find(p => p.id === id);
        if (!prop) return;
        this.graduatingPropId = id;
        ui.showModal('modal-add-plant');
        const parent = store.data.plants.find(p => p.id === prop.parentId);
        document.getElementById('p-name').value = parent ? `Hija de ${parent.name}` : `Hija de ${prop.name}`;
    },

    filterNursery(status) {
        ui.renderNursery(status);
    },

    // --- Wishlist ---
    handleAddWish(e) {
        e.preventDefault();
        store.data.wishlist.push({ id: Date.now(), name: document.getElementById('w-name').value, priority: document.getElementById('w-priority').value, notes: document.getElementById('w-notes').value });
        store.save(); ui.closeModal('modal-add-wish'); e.target.reset(); ui.renderWishlist();
    },

    editWish(id) {
        const wish = store.data.wishlist.find(w => w.id === id);
        if (!wish) return;
        document.getElementById('edit-w-id').value = id;
        document.getElementById('edit-w-name').value = wish.name;
        document.getElementById('edit-w-priority').value = wish.priority;
        document.getElementById('edit-w-notes').value = wish.notes || '';
        ui.showModal('modal-edit-wish');
    },

    handleEditWish(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-w-id').value);
        const wish = store.data.wishlist.find(w => w.id === id);
        if (wish) {
            wish.name = document.getElementById('edit-w-name').value;
            wish.priority = document.getElementById('edit-w-priority').value;
            wish.notes = document.getElementById('edit-w-notes').value;
            store.save(); ui.renderWishlist(); ui.closeModal('modal-edit-wish');
        }
    },

    buyWish(id) {
        ui.askConfirm("¿Listo?", "Se eliminará de la lista.", () => {
            store.data.wishlist = store.data.wishlist.filter(w => w.id !== id);
            store.save(); ui.renderWishlist();
        });
    },

    removeWish(id) {
        ui.askConfirm("¿Eliminar deseo?", "Se quitará de la lista.", () => {
            store.data.wishlist = store.data.wishlist.filter(w => w.id !== id);
            store.save(); ui.renderWishlist();
        });
    },

    // --- Inventario ---
    handleAddItem(e) {
        e.preventDefault();
        const type = document.getElementById('i-type').value;
        store.data.inventory[type].push({ name: document.getElementById('i-name').value, qty: parseFloat(document.getElementById('i-qty').value), unit: document.getElementById('i-unit').value });
        store.save(); ui.closeModal('modal-add-item'); ui.renderInventory();
    },

    editItem(cat, idx) {
        const item = store.data.inventory[cat][idx];
        document.getElementById('edit-i-cat').value = cat;
        document.getElementById('edit-i-idx').value = idx;
        document.getElementById('edit-i-name').value = item.name;
        document.getElementById('edit-i-qty').value = item.qty;
        document.getElementById('edit-i-unit').value = item.unit;
        ui.showModal('modal-edit-item');
    },

    handleEditItem(e) {
        e.preventDefault();
        const cat = document.getElementById('edit-i-cat').value;
        const idx = parseInt(document.getElementById('edit-i-idx').value);
        store.data.inventory[cat][idx] = {
            name: document.getElementById('edit-i-name').value,
            qty: parseFloat(document.getElementById('edit-i-qty').value),
            unit: document.getElementById('edit-i-unit').value
        };
        store.save(); ui.renderInventory(); ui.closeModal('modal-edit-item');
    },

    updateItemQty(cat, idx, delta) { store.data.inventory[cat][idx].qty = Math.max(0, store.data.inventory[cat][idx].qty + delta); store.save(); ui.renderInventory(); },
    
    removeItem(cat, idx) {
        ui.askConfirm("¿Eliminar insumo?", "Se quitará del inventario.", () => {
            store.data.inventory[cat].splice(idx, 1);
            store.save(); ui.renderInventory();
        });
    },

    // --- Notas ---
    handleAddNote(e) {
        e.preventDefault();
        store.data.globalNotes.push({ id: Date.now(), content: document.getElementById('n-content').value });
        store.save(); ui.closeModal('modal-add-note'); ui.renderNotes();
    },

    editNote(id) {
        const note = store.data.globalNotes.find(n => n.id === id);
        if (!note) return;
        document.getElementById('edit-n-id').value = id;
        document.getElementById('edit-n-content').value = note.content;
        ui.showModal('modal-edit-note');
    },

    handleEditNote(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-n-id').value);
        const note = store.data.globalNotes.find(n => n.id === id);
        if (note) {
            note.content = document.getElementById('edit-n-content').value;
            store.save(); ui.renderNotes(); ui.closeModal('modal-edit-note');
        }
    },

    removeNote(id) {
        ui.askConfirm("¿Borrar nota?", "Esta acción es definitiva.", () => { store.data.globalNotes = store.data.globalNotes.filter(n => n.id !== id); store.save(); ui.renderNotes(); });
    },

    // --- Sincronización e Importación ---
    exportBackup() {
        const exportData = {
            ...store.data,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `plantitas_${new Date().toISOString().split('T')[0]}.json`; a.click();
    },

    importBackup(e) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const importedData = JSON.parse(ev.target.result);
                const exportedDate = importedData.exportedAt ? new Date(importedData.exportedAt).toLocaleString() : "fecha desconocida";
                
                // Cálculo de volumen de datos para comparar
                const currentTotal = store.data.plants.length + store.data.propagations.length + store.data.wishlist.length + store.data.globalNotes.length;
                const importedTotal = (importedData.plants?.length || 0) + (importedData.propagations?.length || 0) + (importedData.wishlist?.length || 0) + (importedData.globalNotes?.length || 0);

                const msg = `Resumen del archivo:\n- Exportado el: ${exportedDate}\n- Ítems en archivo: ${importedTotal}\n- Ítems en navegador: ${currentTotal}\n\n¿Cómo querés proceder?`;

                if (importedTotal < currentTotal) {
                    ui.askImportChoice(
                        `⚠️ ATENCIÓN: El archivo tiene MENOS datos que tu navegador. ${msg}`,
                        () => store.merge(importedData),
                        () => store.update(importedData)
                    );
                } else {
                    // Si el archivo tiene igual o más datos, también damos la opción por si quiere unificar
                    ui.askImportChoice(
                        `Información del backup: ${msg}`,
                        () => store.merge(importedData),
                        () => store.update(importedData)
                    );
                }
            } catch (err) { console.error(err); alert("Error al procesar el archivo JSON."); }
        };
        reader.readAsText(e.target.files[0]);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
