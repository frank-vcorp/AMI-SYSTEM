// RD-AMI Demo JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initializeDemo();
    setupTabNavigation();
    setupFormHandlers();
    setupFileUpload();
    updateDateTime();
    
    // Update date/time every minute
    setInterval(updateDateTime, 60000);
});

function initializeDemo() {
    // Show dashboard by default
    showTab('dashboard');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const fechaCitaInput = document.getElementById('fechaCita');
    if (fechaCitaInput) {
        fechaCitaInput.value = today;
    }
    
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5);
    const horaCitaInput = document.getElementById('horaCita');
    if (horaCitaInput) {
        horaCitaInput.value = timeString;
    }
}

function updateDateTime() {
    const now = new Date();
    const dateString = now.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const fechaActualElement = document.getElementById('fechaActual');
    if (fechaActualElement) {
        fechaActualElement.textContent = dateString;
    }
}

function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
            
            // Update active tab styling
            tabButtons.forEach(btn => {
                btn.classList.remove('border-ami-blue', 'text-ami-blue');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            this.classList.remove('border-transparent', 'text-gray-500');
            this.classList.add('border-ami-blue', 'text-ami-blue');
        });
    });
}

function showTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
}

function setupFormHandlers() {
    // Recepción form
    const recepcionForm = document.getElementById('recepcionForm');
    if (recepcionForm) {
        recepcionForm.addEventListener('submit', handleRecepcionSubmit);
    }
    
    // Examen médico form
    const examenForm = document.getElementById('examenMedicoForm');
    if (examenForm) {
        examenForm.addEventListener('submit', handleExamenSubmit);
        
        // Auto-calculate IMC
        const pesoInput = document.getElementById('peso');
        const tallaInput = document.getElementById('talla');
        const imcInput = document.getElementById('imc');
        
        if (pesoInput && tallaInput && imcInput) {
            [pesoInput, tallaInput].forEach(input => {
                input.addEventListener('input', function() {
                    const peso = parseFloat(pesoInput.value);
                    const talla = parseFloat(tallaInput.value);
                    
                    if (peso && talla && talla > 0) {
                        const imc = peso / (talla * talla);
                        imcInput.value = imc.toFixed(2);
                    }
                });
            });
        }
    }
}

function handleRecepcionSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Get selected estudios
    const estudiosCheckboxes = document.querySelectorAll('input[name="estudios"]:checked');
    const estudios = Array.from(estudiosCheckboxes).map(cb => cb.value);
    data.estudios = estudios;
    
    // Show success message
    showNotification('Papeleta creada exitosamente. Folio: #RD-2025-001', 'success');
    
    // Auto-navigate to examen médico tab after 2 seconds
    setTimeout(() => {
        showTab('examen');
        updateActiveTab('examen');
    }, 2000);
}

function handleExamenSubmit(e) {
    e.preventDefault();
    
    showNotification('Examen médico guardado exitosamente', 'success');
    
    // Auto-navigate to estudios tab after 2 seconds
    setTimeout(() => {
        showTab('estudios');
        updateActiveTab('estudios');
    }, 2000);
}

function updateActiveTab(tabId) {
    const tabButtons = document.querySelectorAll('.nav-tab');
    
    tabButtons.forEach(btn => {
        btn.classList.remove('border-ami-blue', 'text-ami-blue');
        btn.classList.add('border-transparent', 'text-gray-500');
        
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.remove('border-transparent', 'text-gray-500');
            btn.classList.add('border-ami-blue', 'text-ami-blue');
        }
    });
}

function setupFileUpload() {
    // Setup SIM drop zone
    setupDropZone('dropZoneSIM', 'fileInputSIM', 'uploadedFilesSIM', 'SIM');
    
    // Setup NOVA drop zone
    setupDropZone('dropZoneNOVA', 'fileInputNOVA', 'uploadedFilesNOVA', 'NOVA');
}

function setupDropZone(dropZoneId, fileInputId, uploadedFilesId, type) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    const uploadedFiles = document.getElementById(uploadedFilesId);
    
    if (!dropZone || !fileInput || !uploadedFiles) return;
    
    // Click to select files
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Drag and drop events
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('border-ami-blue', 'bg-blue-50');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('border-ami-blue', 'bg-blue-50');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('border-ami-blue', 'bg-blue-50');
        
        const files = e.dataTransfer.files;
        handleFileUpload(files, uploadedFiles, type);
    });
    
    // File input change
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleFileUpload(files, uploadedFiles, type);
    });
}

function handleFileUpload(files, container, type) {
    if (files.length === 0) return;
    
    // Show AI processing
    showAIProcessing();
    
    // Simulate file processing
    Array.from(files).forEach((file, index) => {
        setTimeout(() => {
            addUploadedFile(file, container, type);
            
            // If last file, hide processing and show results
            if (index === files.length - 1) {
                setTimeout(() => {
                    hideAIProcessing();
                    showProcessedStudies();
                    
                    // Auto-navigate to validation after processing
                    setTimeout(() => {
                        showTab('validacion');
                        updateActiveTab('validacion');
                    }, 2000);
                }, 1000);
            }
        }, index * 500);
    });
}

function addUploadedFile(file, container, type) {
    const fileElement = document.createElement('div');
    fileElement.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border';
    
    // Simulate AI classification
    const studyTypes = {
        'SIM': ['Espirometría', 'Audiometría', 'Electrocardiograma', 'Campimetría'],
        'NOVA': ['Biometría Hemática', 'Examen General de Orina', 'Química Sanguínea 24']
    };
    
    const randomType = studyTypes[type][Math.floor(Math.random() * studyTypes[type].length)];
    const confidence = Math.floor(Math.random() * 10) + 90; // 90-99%
    
    fileElement.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-file-pdf text-red-500"></i>
            <div>
                <p class="text-sm font-medium text-gray-900">${file.name}</p>
                <p class="text-xs text-gray-500">Clasificado como: ${randomType}</p>
            </div>
        </div>
        <div class="flex items-center space-x-2">
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                ${confidence}% confianza
            </span>
            <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(fileElement);
    
    // Add remove functionality
    const removeBtn = fileElement.querySelector('.fa-times').parentElement;
    removeBtn.addEventListener('click', () => {
        fileElement.remove();
    });
}

function showAIProcessing() {
    const aiProcessing = document.getElementById('aiProcessing');
    const progressFill = document.getElementById('progressFill');
    
    if (aiProcessing && progressFill) {
        aiProcessing.classList.remove('hidden');
        
        // Animate progress bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressFill.style.width = progress + '%';
        }, 200);
    }
}

function hideAIProcessing() {
    const aiProcessing = document.getElementById('aiProcessing');
    if (aiProcessing) {
        aiProcessing.classList.add('hidden');
    }
}

function showProcessedStudies() {
    const container = document.getElementById('estudiosProcesados');
    if (!container) return;
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">Estudios Procesados por IA</h3>
                <span class="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    ✅ Procesamiento Completo
                </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">Laboratorio - Biometría Hemática</h4>
                        <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">🔴 Anemia detectada</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>• Hemoglobina: 9.1 g/dL (Bajo)</p>
                        <p>• VCM: 61.9 fL (Microcítica)</p>
                        <p>• MCH: 17.7 pg (Hipocrómica)</p>
                    </div>
                </div>
                
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">Espirometría</h4>
                        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🟡 Patrón restrictivo</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>• FVC: 70% (Reducida)</p>
                        <p>• Patrón: Restrictivo leve</p>
                        <p>• Recomendación: Ejercicios respiratorios</p>
                    </div>
                </div>
                
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">Radiografías - Columna</h4>
                        <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">🟡 Alteraciones posturales</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>• Ángulo de Cobb: 8° (Normal)</p>
                        <p>• Ángulo de Ferguson: 40° (Lordosis aumentada)</p>
                        <p>• Bostezo L5-S1: Presente</p>
                    </div>
                </div>
                
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">Audiometría</h4>
                        <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🟢 Normal</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>• Oído derecho: Normal</p>
                        <p>• Oído izquierdo: Normal</p>
                        <p>• Sin pérdida auditiva significativa</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-robot text-blue-600 text-xl mt-1"></i>
                    <div>
                        <h4 class="font-medium text-blue-900">Dictamen Sugerido por IA</h4>
                        <p class="text-blue-800 mt-1">
                            <strong>APTO CON RESTRICCIONES</strong> - Se recomienda manejo de anemia microcítica hipocrómica, 
                            ejercicios respiratorios para mejorar función pulmonar, higiene postural y uso obligatorio 
                            de correctivos visuales para laborar.
                        </p>
                        <p class="text-sm text-blue-700 mt-2">
                            <strong>Restricciones:</strong> Evitar levantamiento de cargas >10kg hasta mejoría de parámetros hematológicos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    showNotification('Estudios procesados exitosamente por IA. Listos para validación médica.', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
    
    // Set colors based on type
    const colors = {
        'success': 'bg-green-500 text-white',
        'error': 'bg-red-500 text-white',
        'warning': 'bg-yellow-500 text-white',
        'info': 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    
    // Set content
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span class="text-sm">${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// PDF tab switching in validation
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('pdf-tab')) {
        // Remove active class from all tabs
        document.querySelectorAll('.pdf-tab').forEach(tab => {
            tab.classList.remove('bg-ami-blue', 'text-white');
            tab.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        // Add active class to clicked tab
        e.target.classList.remove('bg-gray-200', 'text-gray-700');
        e.target.classList.add('bg-ami-blue', 'text-white');
        
        // Here you would load the corresponding PDF
        showNotification(`Cargando ${e.target.textContent}...`, 'info');
    }
    
    // Handle validation form submission
    if (e.target.id === 'validarExpediente') {
        e.preventDefault();
        
        // Show validation success
        showNotification('Expediente validado y firmado exitosamente', 'success');
        
        // Auto-navigate to reportes tab after 2 seconds
        setTimeout(() => {
            showTab('reportes');
            updateActiveTab('reportes');
        }, 2000);
    }
    
    // Handle report generation buttons
    if (e.target.classList.contains('generate-report')) {
        const reportType = e.target.getAttribute('data-report');
        showNotification(`Generando ${reportType}...`, 'info');
        
        // Simulate report generation
        setTimeout(() => {
            showNotification(`${reportType} generado exitosamente`, 'success');
        }, 2000);
    }
});

// Handle email sending simulation
document.addEventListener('click', function(e) {
    if (e.target.closest('.send-email-btn')) {
        e.preventDefault();
        showNotification('Expediente enviado por email exitosamente', 'success');
    }
    
    if (e.target.closest('.download-pdf-btn')) {
        e.preventDefault();
        showNotification('Descargando expediente en PDF...', 'info');
    }
    
    if (e.target.closest('.copy-link-btn')) {
        e.preventDefault();
        showNotification('Enlace copiado al portapapeles', 'success');
    }
});

// Initialize tooltips and other interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.hover\\:shadow-lg');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});
