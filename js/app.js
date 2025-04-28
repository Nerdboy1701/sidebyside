/**
 * SideBySide - A NerdVista Tool
 * Main application JavaScript
 */

// Main app object
const SideBySide = {
  // State
  images: {
    1: null,
    2: null
  },
  options: {
    orientation: 'horizontal',
    spacing: 10,
    backgroundColor: '#ffffff',
    resizeOption: 'original',
    outputWidth: 1200,
    outputHeight: 800,
    fileName: 'sidebyside',
    fileType: 'png'
  },
  elements: {},

  // Initialize the application
  init: function() {
    console.log('Initializing SideBySide app...');
    
    // Store element references
    this.cacheElements();
    
    // Set up event listeners
    this.bindEvents();
    
    // Add mobile support
    this.setupMobileSupport();
    
    console.log('SideBySide initialized!');
  },

  // Cache DOM elements
  cacheElements: function() {
    // Upload areas
    this.elements.uploadArea1 = document.getElementById('upload-area-1');
    this.elements.uploadArea2 = document.getElementById('upload-area-2');
    this.elements.fileInput1 = document.getElementById('file-input-1');
    this.elements.fileInput2 = document.getElementById('file-input-2');
    this.elements.preview1 = document.getElementById('preview-1');
    this.elements.preview2 = document.getElementById('preview-2');
    
    // Options elements
    this.elements.orientationSelect = document.getElementById('orientation');
    this.elements.spacingSlider = document.getElementById('spacing');
    this.elements.spacingValue = document.getElementById('spacing-value');
    this.elements.bgColorPicker = document.getElementById('background-color');
    this.elements.resizeOption = document.getElementById('resize-option');
    this.elements.outputWidth = document.getElementById('output-width');
    this.elements.outputHeight = document.getElementById('output-height');
    this.elements.customSizeOptions = document.getElementById('custom-size-options');
    
    // Result elements
    this.elements.previewCanvas = document.getElementById('preview-canvas');
    this.elements.previewPlaceholder = document.getElementById('preview-placeholder');
    this.elements.fileName = document.getElementById('file-name');
    this.elements.fileType = document.getElementById('file-type');
    this.elements.downloadButton = document.getElementById('download-button');
  },

  // Setup mobile support - add this new method
  setupMobileSupport: function() {
    // Detect if device is touch-enabled
    const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (navigator.msMaxTouchPoints > 0);
    
    if (isTouchDevice) {
      console.log('Touch device detected, setting up mobile support');
      
      // Update instructions for mobile devices
      const uploadPlaceholders = document.querySelectorAll('.upload-placeholder');
      uploadPlaceholders.forEach(placeholder => {
        const paragraphs = placeholder.querySelectorAll('p');
        if (paragraphs.length > 0) {
          paragraphs[0].textContent = 'Tap to select image';
        }
      });
      
      // Make entire upload area clickable to open file picker
      const uploadAreas = [this.elements.uploadArea1, this.elements.uploadArea2];
      const fileInputs = [this.elements.fileInput1, this.elements.fileInput2];
      
      uploadAreas.forEach((area, index) => {
        const fileInput = fileInputs[index];
        
        // Only add this listener if area doesn't already have an image
        area.addEventListener('click', function(e) {
          if (!this.classList.contains('has-image')) {
            // Don't trigger if clicking on the file label directly
            if (!e.target.matches('.file-label')) {
              fileInput.click();
            }
          }
        });
      });
    }
  },

  // Bind event listeners
  bindEvents: function() {
    // File inputs
    this.elements.fileInput1.addEventListener('change', (e) => this.handleFileSelect(e, 1));
    this.elements.fileInput2.addEventListener('change', (e) => this.handleFileSelect(e, 2));
    
    // Drag and drop for upload areas
    this.setupDragAndDrop(this.elements.uploadArea1, 1);
    this.setupDragAndDrop(this.elements.uploadArea2, 2);
    
    // Options changes
    this.elements.orientationSelect.addEventListener('change', () => {
      this.options.orientation = this.elements.orientationSelect.value;
      this.updatePreview();
    });
    
    this.elements.spacingSlider.addEventListener('input', () => {
      this.options.spacing = parseInt(this.elements.spacingSlider.value);
      this.elements.spacingValue.textContent = `${this.options.spacing}px`;
      this.updatePreview();
    });
    
    this.elements.bgColorPicker.addEventListener('input', () => {
      this.options.backgroundColor = this.elements.bgColorPicker.value;
      this.updatePreview();
    });
    
    this.elements.resizeOption.addEventListener('change', () => {
      this.options.resizeOption = this.elements.resizeOption.value;
      
      // Show/hide custom size options
      if (this.options.resizeOption === 'custom') {
        this.elements.customSizeOptions.style.display = 'block';
      } else {
        this.elements.customSizeOptions.style.display = 'none';
      }
      
      this.updatePreview();
    });
    
    this.elements.outputWidth.addEventListener('change', () => {
      this.options.outputWidth = parseInt(this.elements.outputWidth.value);
      this.updatePreview();
    });
    
    this.elements.outputHeight.addEventListener('change', () => {
      this.options.outputHeight = parseInt(this.elements.outputHeight.value);
      this.updatePreview();
    });
    
    // Download options
    this.elements.fileName.addEventListener('change', () => {
      this.options.fileName = this.elements.fileName.value;
    });
    
    this.elements.fileType.addEventListener('change', () => {
      this.options.fileType = this.elements.fileType.value;
    });
    
    // Download button
    this.elements.downloadButton.addEventListener('click', () => this.downloadImage());
    
    // Initial UI setup
    this.elements.customSizeOptions.style.display = 'none';
  },

  // The rest of your existing methods would follow here...
  // setupDragAndDrop, handleFileSelect, handleFile, etc.

  // For brevity, I'm not including all the other methods since you already have them
  // and we're focusing on the mobile support implementation
};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  SideBySide.init();
});