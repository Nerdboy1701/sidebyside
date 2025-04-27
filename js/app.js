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
  
    // Set up drag and drop functionality
    setupDragAndDrop: function(uploadArea, imageIndex) {
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
      });
      
      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Highlight drop area when dragging over it
      ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
      });
      
      function highlight() {
        uploadArea.classList.add('drag-over');
      }
      
      function unhighlight() {
        uploadArea.classList.remove('drag-over');
      }
      
      // Handle dropped files
      uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        this.handleFile(file, imageIndex);
      });
    },
  
    // Handle file selection from input or drop
    handleFileSelect: function(e, imageIndex) {
      const file = e.target.files[0];
      this.handleFile(file, imageIndex);
    },
  
    // Process the selected file
    handleFile: function(file, imageIndex) {
      if (!file || !file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Store image object
          this.images[imageIndex] = img;
          
          // Update preview
          this.updateImagePreview(imageIndex);
          this.updatePreview();
        };
        
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    },
  
    // Update individual image preview
    updateImagePreview: function(imageIndex) {
      const uploadArea = this.elements[`uploadArea${imageIndex}`];
      const previewArea = this.elements[`preview${imageIndex}`];
      
      if (this.images[imageIndex]) {
        // Create image element if it doesn't exist
        if (!previewArea.querySelector('img')) {
          const img = document.createElement('img');
          previewArea.appendChild(img);
          
          // Add remove button
          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'preview-actions';
          
          const removeBtn = document.createElement('button');
          removeBtn.className = 'preview-action-btn';
          removeBtn.innerHTML = '×';
          removeBtn.title = 'Remove Image';
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage(imageIndex);
          });
          
          actionsDiv.appendChild(removeBtn);
          previewArea.appendChild(actionsDiv);
        }
        
        // Update image source
        previewArea.querySelector('img').src = this.images[imageIndex].src;
        
        // Show preview
        uploadArea.classList.add('has-image');
      } else {
        // Hide preview
        uploadArea.classList.remove('has-image');
        
        // Remove image and actions
        previewArea.innerHTML = '';
      }
    },
  
    // Remove an image
    removeImage: function(imageIndex) {
      this.images[imageIndex] = null;
      this.updateImagePreview(imageIndex);
      this.updatePreview();
    },
  
    // Update the preview canvas
    updatePreview: function() {
      // Check if both images are loaded
      if (!this.images[1] || !this.images[2]) {
        this.elements.previewCanvas.style.display = 'none';
        this.elements.previewPlaceholder.style.display = 'flex';
        this.elements.downloadButton.disabled = true;
        return;
      }
      
      // Get canvas context
      const canvas = this.elements.previewCanvas;
      const ctx = canvas.getContext('2d');
      
      // Calculate dimensions based on resize option
      const dimensions = this.calculateDimensions();
      
      // Set canvas size
      canvas.width = dimensions.canvasWidth;
      canvas.height = dimensions.canvasHeight;
      
      // Clear canvas
      ctx.fillStyle = this.options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw images based on orientation
      if (this.options.orientation === 'horizontal') {
        // Side by side
        ctx.drawImage(this.images[1], dimensions.image1X, dimensions.image1Y, dimensions.image1Width, dimensions.image1Height);
        ctx.drawImage(this.images[2], dimensions.image2X, dimensions.image2Y, dimensions.image2Width, dimensions.image2Height);
      } else {
        // One above one below
        ctx.drawImage(this.images[1], dimensions.image1X, dimensions.image1Y, dimensions.image1Width, dimensions.image1Height);
        ctx.drawImage(this.images[2], dimensions.image2X, dimensions.image2Y, dimensions.image2Width, dimensions.image2Height);
      }
      
      // Show preview and enable download
      this.elements.previewCanvas.style.display = 'block';
      this.elements.previewPlaceholder.style.display = 'none';
      this.elements.downloadButton.disabled = false;
    },
  
    // Calculate dimensions for the combined image
    calculateDimensions: function() {
      const img1 = this.images[1];
      const img2 = this.images[2];
      const spacing = parseInt(this.options.spacing);
      const resizeOption = this.options.resizeOption;
      
      let image1Width, image1Height, image2Width, image2Height;
      let canvasWidth, canvasHeight;
      let image1X = 0, image1Y = 0, image2X = 0, image2Y = 0;
      
      // Set dimensions based on resize option
      if (resizeOption === 'original') {
        // Keep original sizes
        image1Width = img1.width;
        image1Height = img1.height;
        image2Width = img2.width;
        image2Height = img2.height;
        
      } else if (resizeOption === 'match-width') {
        // Match widths
        const maxWidth = Math.max(img1.width, img2.width);
        
        // Scale image 1
        if (img1.width !== maxWidth) {
          const scale = maxWidth / img1.width;
          image1Width = maxWidth;
          image1Height = img1.height * scale;
        } else {
          image1Width = img1.width;
          image1Height = img1.height;
        }
        
        // Scale image 2
        if (img2.width !== maxWidth) {
          const scale = maxWidth / img2.width;
          image2Width = maxWidth;
          image2Height = img2.height * scale;
        } else {
          image2Width = img2.width;
          image2Height = img2.height;
        }
        
      } else if (resizeOption === 'match-height') {
        // Match heights
        const maxHeight = Math.max(img1.height, img2.height);
        
        // Scale image 1
        if (img1.height !== maxHeight) {
          const scale = maxHeight / img1.height;
          image1Height = maxHeight;
          image1Width = img1.width * scale;
        } else {
          image1Width = img1.width;
          image1Height = img1.height;
        }
        
        // Scale image 2
        if (img2.height !== maxHeight) {
          const scale = maxHeight / img2.height;
          image2Height = maxHeight;
          image2Width = img2.width * scale;
        } else {
          image2Width = img2.width;
          image2Height = img2.height;
        }
        
      } else if (resizeOption === 'custom') {
        // Custom dimensions
        const outputWidth = parseInt(this.options.outputWidth);
        const outputHeight = parseInt(this.options.outputHeight);
        
        if (this.options.orientation === 'horizontal') {
          // Calculate width distribution (minus spacing)
          const totalWidth = outputWidth - spacing;
          const ratio = img1.width / (img1.width + img2.width);
          
          image1Width = Math.floor(totalWidth * ratio);
          image1Height = Math.floor((image1Width / img1.width) * img1.height);
          
          image2Width = totalWidth - image1Width;
          image2Height = Math.floor((image2Width / img2.width) * img2.height);
          
          // If height exceeds output height, scale down
          if (image1Height > outputHeight || image2Height > outputHeight) {
            const scale1 = outputHeight / image1Height;
            const scale2 = outputHeight / image2Height;
            const minScale = Math.min(scale1, scale2);
            
            image1Width = Math.floor(image1Width * minScale);
            image1Height = Math.floor(image1Height * minScale);
            
            image2Width = Math.floor(image2Width * minScale);
            image2Height = Math.floor(image2Height * minScale);
          }
        } else {
          // Calculate height distribution (minus spacing)
          const totalHeight = outputHeight - spacing;
          const ratio = img1.height / (img1.height + img2.height);
          
          image1Height = Math.floor(totalHeight * ratio);
          image1Width = Math.floor((image1Height / img1.height) * img1.width);
          
          image2Height = totalHeight - image1Height;
          image2Width = Math.floor((image2Height / img2.height) * img2.width);
          
          // If width exceeds output width, scale down
          if (image1Width > outputWidth || image2Width > outputWidth) {
            const scale1 = outputWidth / image1Width;
            const scale2 = outputWidth / image2Width;
            const minScale = Math.min(scale1, scale2);
            
            image1Width = Math.floor(image1Width * minScale);
            image1Height = Math.floor(image1Height * minScale);
            
            image2Width = Math.floor(image2Width * minScale);
            image2Height = Math.floor(image2Height * minScale);
          }
        }
      }
      
      // Calculate canvas dimensions and positions
      if (this.options.orientation === 'horizontal') {
        // Side by side
        canvasWidth = image1Width + spacing + image2Width;
        canvasHeight = Math.max(image1Height, image2Height);
        
        image1X = 0;
        image1Y = Math.floor((canvasHeight - image1Height) / 2);
        
        image2X = image1Width + spacing;
        image2Y = Math.floor((canvasHeight - image2Height) / 2);
      } else {
        // One above one below
        canvasWidth = Math.max(image1Width, image2Width);
        canvasHeight = image1Height + spacing + image2Height;
        
        image1X = Math.floor((canvasWidth - image1Width) / 2);
        image1Y = 0;
        
        image2X = Math.floor((canvasWidth - image2Width) / 2);
        image2Y = image1Height + spacing;
      }
      
      // For custom size, adjust the canvas and position
      if (resizeOption === 'custom') {
        const outputWidth = parseInt(this.options.outputWidth);
        const outputHeight = parseInt(this.options.outputHeight);
        
        // Center everything in the canvas
        const xOffset = Math.floor((outputWidth - canvasWidth) / 2);
        const yOffset = Math.floor((outputHeight - canvasHeight) / 2);
        
        image1X += xOffset;
        image1Y += yOffset;
        image2X += xOffset;
        image2Y += yOffset;
        
        canvasWidth = outputWidth;
        canvasHeight = outputHeight;
      }
      
      return {
        canvasWidth,
        canvasHeight,
        image1Width,
        image1Height,
        image2Width,
        image2Height,
        image1X,
        image1Y,
        image2X,
        image2Y
      };
    },
  
    // Download the combined image
    downloadImage: function() {
      const canvas = this.elements.previewCanvas;
      const fileName = this.options.fileName || 'sidebyside';
      const fileType = this.options.fileType;
      
      // Create download link
      const link = document.createElement('a');
      
      // Set file type and quality
      let mimeType = 'image/png';
      let quality = 1;
      
      if (fileType === 'jpeg') {
        mimeType = 'image/jpeg';
        quality = 0.92; // High quality JPEG
      }
      
      // Convert canvas to data URL
      link.href = canvas.toDataURL(mimeType, quality);
      
      // Set download filename
      link.download = `${fileName}.${fileType}`;
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Initialize the app when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    SideBySide.init();
  });