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
    
    // Add web share setup
    this.setupWebShare();
    
    // Detect mobile devices and add appropriate classes
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      document.body.classList.add('mobile-device');
      
      // Improve tap targets for mobile
      document.querySelectorAll('button, input, select, .file-label').forEach(el => {
        el.classList.add('mobile-friendly');
      });
    }
    
    console.log('SideBySide initialized!');

    // Add download optimization
    this.optimizeDownloadProcess();
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
    
    // Add previewContainer reference
    this.elements.previewContainer = document.querySelector('.preview-container');
    
    // Initialize as null (will be created when needed)
    this.elements.downloadProgress = null;
    this.elements.downloadProgressBar = null;
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

    // Add visual feedback for resize option
    this.elements.resizeOption.addEventListener('change', function() {
      // Add processing class temporarily
      this.classList.add('processing');
      
      // Remove after transition completes
      setTimeout(() => {
        this.classList.remove('processing');
      }, 300);
    });
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
    console.log('File selected for index:', imageIndex);
    const file = e.target.files[0];
    console.log('File object:', file);
    this.handleFile(file, imageIndex);
  },

  // Process the selected file
  handleFile: function(file, imageIndex) {
    if (!file || !file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }
    
    // Show processing indicator
    const uploadArea = this.elements[`uploadArea${imageIndex}`];
    this.showProcessingIndicator(uploadArea, 'Loading image...');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Store image object
        this.images[imageIndex] = img;
        
        // Update preview
        this.updateImagePreview(imageIndex);
        this.updatePreview();
        
        // Hide processing indicator
        this.hideProcessingIndicator(uploadArea);
      };
      
      img.onerror = () => {
        this.hideProcessingIndicator(uploadArea);
        alert('Failed to load image. Please try another file.');
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      this.hideProcessingIndicator(uploadArea);
      alert('Error reading file. Please try again.');
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
    
    // Show processing indicator during rendering
    this.showProcessingIndicator('.preview-container', 'Generating preview...');
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
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
      
      // Hide processing indicator after rendering
      this.hideProcessingIndicator('.preview-container');

      // Update share button state along with download button
      if (this.elements.shareButton) {
        this.elements.shareButton.disabled = this.elements.downloadButton.disabled;
      }
    });
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

    // Check if we're on mobile and using fast quality option
    if (
      document.body.classList.contains('mobile-device') && 
      this.elements.mobileQuality && 
      this.elements.mobileQuality.value === 'fast'
    ) {
      // For smaller images on mobile to improve performance
      const MAX_SIZE = 1200;
      
      if (img1.width > MAX_SIZE || img1.height > MAX_SIZE || 
          img2.width > MAX_SIZE || img2.height > MAX_SIZE) {
        
        console.log('Optimizing image size for mobile');
        
        // Scale down large images
        const scale1 = img1.width > MAX_SIZE || img1.height > MAX_SIZE ? 
          Math.min(MAX_SIZE / img1.width, MAX_SIZE / img1.height) : 1;
          
        const scale2 = img2.width > MAX_SIZE || img2.height > MAX_SIZE ?
          Math.min(MAX_SIZE / img2.width, MAX_SIZE / img2.height) : 1;
        
        // Apply scaling
        if (scale1 < 1) {
          img1.width = Math.floor(img1.width * scale1);
          img1.height = Math.floor(img1.height * scale1);
        }
        
        if (scale2 < 1) {
          img2.width = Math.floor(img2.width * scale2);
          img2.height = Math.floor(img2.height * scale2);
        }
      }
    }
    
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
    // Show download progress
    const progressInterval = this.showDownloadProgress();
    
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
    
    // Convert canvas to data URL (this can take time for large images)
    setTimeout(() => {
      link.href = canvas.toDataURL(mimeType, quality);
      
      // Set download filename
      link.download = `${fileName}.${fileType}`;
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100); // Small delay to allow UI update
  },

  // Show processing indicator
  showProcessingIndicator: function(parent, message = 'Processing...') {
    // Remove any existing indicators first
    this.hideProcessingIndicator(parent);
    
    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'processing-indicator';
    indicator.innerHTML = `<span class="spinner"></span> ${message}`;
    
    // Add to parent element
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    
    if (parent) {
      parent.appendChild(indicator);
      parent.classList.add('processing');
    } else {
      // Fallback to preview container
      this.elements.previewContainer.appendChild(indicator);
    }
    
    return indicator;
  },

  // Hide processing indicator
  hideProcessingIndicator: function(parent) {
    if (typeof parent === 'string') {
      parent = document.querySelector(parent);
    }
    
    if (parent) {
      const indicator = parent.querySelector('.processing-indicator');
      if (indicator) {
        parent.removeChild(indicator);
      }
      parent.classList.remove('processing');
    } else {
      // Fallback to remove all indicators
      document.querySelectorAll('.processing-indicator').forEach(el => {
        el.parentNode.removeChild(el);
      });
      document.querySelectorAll('.processing').forEach(el => {
        el.classList.remove('processing');
      });
    }
  },

  // Show download progress indicator
  showDownloadProgress: function() {
    // Create progress bar if it doesn't exist
    if (!this.elements.downloadProgress) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'download-progress';
      progressContainer.innerHTML = '<div class="download-progress-bar"></div>';
      
      // Insert after download button
      this.elements.downloadButton.parentNode.insertBefore(
        progressContainer, 
        this.elements.downloadButton.nextSibling
      );
      
      this.elements.downloadProgress = progressContainer;
      this.elements.downloadProgressBar = progressContainer.querySelector('.download-progress-bar');
    }
    
    // Show and reset progress
    this.elements.downloadProgress.style.display = 'block';
    this.elements.downloadProgressBar.style.width = '0%';
    
    // Simulate progress (since we can't get actual progress from canvas.toDataURL)
    this.elements.downloadButton.disabled = true;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Wait a moment at 100% then hide
        setTimeout(() => {
          this.hideDownloadProgress();
        }, 500);
      }
      this.elements.downloadProgressBar.style.width = `${progress}%`;
    }, 200);
    
    return interval;
  },

  // Hide download progress indicator
  hideDownloadProgress: function() {
    if (this.elements.downloadProgress) {
      this.elements.downloadProgress.style.display = 'none';
      this.elements.downloadButton.disabled = false;
    }
  },

  // Web Share API functionality
  setupWebShare: function() {
    // Check if Web Share API is supported
    if (navigator.share) {
      console.log('Web Share API is supported');
      
      // Create share button
      const shareButton = document.createElement('button');
      shareButton.className = 'cta-button share-button';
      shareButton.innerHTML = '<span class="share-icon">↗</span> Share Image';
      shareButton.style.marginLeft = '10px';
      
      // Initially disabled
      shareButton.disabled = true;
      
      // Insert next to download button
      this.elements.downloadButton.parentNode.insertBefore(
        shareButton,
        this.elements.downloadButton.nextSibling
      );
      
      // Store reference
      this.elements.shareButton = shareButton;
      
      // Add click handler
      shareButton.addEventListener('click', () => this.shareImage());
    }
  },

  // Share the combined image
  shareImage: function() {
    if (!navigator.share) {
      console.log('Web Share API not supported');
      alert('Sharing is not supported on this browser.');
      return;
    }
    
    // Show processing indicator
    this.showProcessingIndicator('.preview-container', 'Preparing image for sharing...');
    
    const canvas = this.elements.previewCanvas;
    const fileName = this.options.fileName || 'sidebyside';
    const fileType = this.options.fileType;
    
    // Set file type and quality
    let mimeType = 'image/png';
    let quality = 1;
    
    if (fileType === 'jpeg') {
      mimeType = 'image/jpeg';
      quality = 0.92; // High quality JPEG
    }
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      try {
        // Create file from blob
        const file = new File([blob], `${fileName}.${fileType}`, { type: mimeType });
        
        // Prepare share data
        const shareData = {
          title: 'SideBySide Image',
          text: 'Created with NerdVista SideBySide',
          files: [file]
        };
        
        // Check if files are supported
        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          console.log('Image shared successfully');
        } else {
          // Fallback to sharing without file
          await navigator.share({
            title: 'SideBySide Image',
            text: 'Check out my side-by-side image created with NerdVista SideBySide: https://sidebyside.nerdvista.com'
          });
          console.log('Shared link only (files not supported)');
        }
      } catch (error) {
        console.error('Error sharing: ', error);
        // Only show error message if it's not an abort
        if (error.name !== 'AbortError') {
          alert('Error sharing image: ' + error.message);
        }
      } finally {
        this.hideProcessingIndicator('.preview-container');
      }
    }, mimeType, quality);
  },

  // Image optimization
  optimizeDownloadProcess: function() {
    // Use a web worker for better performance, if supported
    if (window.Worker) {
      const originalDownloadImage = this.downloadImage;
      this.downloadImage = function() {
        // Show download progress
        const progressInterval = this.showDownloadProgress();
        this.showProcessingIndicator('.preview-container', 'Preparing download...');
        
        const canvas = this.elements.previewCanvas;
        const fileName = this.options.fileName || 'sidebyside';
        const fileType = this.options.fileType;
        
        // Set file type and quality
        let mimeType = 'image/png';
        let quality = 1;
        
        if (fileType === 'jpeg') {
          mimeType = 'image/jpeg';
          quality = 0.92; // High quality JPEG
        }
        
        // Create a temporary canvas in memory
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvas.width;
        offscreenCanvas.height = canvas.height;
        
        // Copy the content from the main canvas
        const offscreenCtx = offscreenCanvas.getContext('2d');
        offscreenCtx.drawImage(canvas, 0, 0);
        
        // Convert to blob first (more efficient than dataURL for large images)
        offscreenCanvas.toBlob((blob) => {
          // Create object URL from blob
          const objectURL = URL.createObjectURL(blob);
          
          // Create download link
          const link = document.createElement('a');
          link.href = objectURL;
          link.download = `${fileName}.${fileType}`;
          
          // Append to body, click and remove
          document.body.appendChild(link);
          
          // Small timeout to ensure UI updates with progress
          setTimeout(() => {
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            URL.revokeObjectURL(objectURL); // Free up memory
            
            this.hideProcessingIndicator('.preview-container');
          }, 300);
        }, mimeType, quality);
      };
    }
    
    // Add option for lowering quality on mobile for better performance
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Add quality option to the options panel
      const qualityOption = document.createElement('div');
      qualityOption.className = 'option-group';
      qualityOption.innerHTML = `
        <label for="mobile-quality">Optimize for Mobile:</label>
        <select id="mobile-quality" class="option-select">
          <option value="high">High Quality</option>
          <option value="fast" selected>Fast Download</option>
        </select>
      `;
      
      // Insert before file options
      const downloadSection = document.querySelector('.download-section');
      const fileOptions = document.querySelector('.file-options');
      if (downloadSection && fileOptions) {
        downloadSection.insertBefore(qualityOption, fileOptions);
        
        // Store reference
        this.elements.mobileQuality = document.getElementById('mobile-quality');
        
        // Update options based on selection
        this.elements.mobileQuality?.addEventListener('change', () => {
          this.updatePreview();
        });
      }
    }
  },

};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  SideBySide.init();
});