// DOM Elements
const uploadBtn = document.getElementById("uploadBtn")
const fileInput = document.getElementById("fileInput")
const uploadArea = document.getElementById("uploadArea")
const uploadPreview = document.getElementById("uploadPreview")
const previewImage = document.getElementById("previewImage")
const fileName = document.getElementById("fileName")
const removeBtn = document.getElementById("removeBtn")
const progressContainer = document.getElementById("progressContainer")
const progressBar = document.getElementById("progressBar")
const progressText = document.getElementById("progressText")
const analyzeBtn = document.getElementById("analyzeBtn")
const resultsSection = document.getElementById("resultsSection")
const extractedText = document.getElementById("extractedText")
const metricsContainer = document.getElementById("metricsContainer")
const adviceContent = document.getElementById("adviceContent")
const tabBtns = document.querySelectorAll(".tab-btn")
const tabPanes = document.querySelectorAll(".tab-pane")
const errorModal = document.getElementById("errorModal")
const errorMessage = document.getElementById("errorMessage")
const closeModal = document.getElementById("closeModal")

// Global variables
let selectedFile = null
let uploadedFileURL = null

// Firebase Storage (Placeholder - Replace with your actual Firebase setup)
const firebaseStorage = {
  uploadFile: async (file, progressCallback, errorCallback) => {
    return new Promise((resolve, reject) => {
      const totalSize = file.size
      let uploaded = 0

      const interval = setInterval(() => {
        uploaded += Math.min(1024 * 100, totalSize - uploaded) // Simulate uploading chunks

        const progress = (uploaded / totalSize) * 100
        progressCallback(progress)

        if (uploaded >= totalSize) {
          clearInterval(interval)
          setTimeout(() => {
            resolve("https://example.com/uploaded-file.jpg") // Simulate successful upload
          }, 500)
        }
      }, 50) // Simulate upload speed

      // Simulate error after some time
      // setTimeout(() => {
      //     clearInterval(interval);
      //     errorCallback(new Error('Simulated upload error'));
      //     reject(new Error('Simulated upload error'));
      // }, 5000);
    })
  },
}

// Health metrics reference ranges
const healthMetricsRanges = {
  bloodPressure: {
    systolic: { min: 90, max: 120, unit: "mmHg" },
    diastolic: { min: 60, max: 80, unit: "mmHg" },
  },
  bloodSugar: {
    fasting: { min: 70, max: 100, unit: "mg/dL" },
    postprandial: { min: 70, max: 140, unit: "mg/dL" },
    hba1c: { min: 4, max: 5.7, unit: "%" },
  },
  cholesterol: {
    total: { min: 0, max: 200, unit: "mg/dL" },
    hdl: { min: 40, max: 60, unit: "mg/dL" },
    ldl: { min: 0, max: 100, unit: "mg/dL" },
    triglycerides: { min: 0, max: 150, unit: "mg/dL" },
  },
  hemoglobin: { min: 13.5, max: 17.5, unit: "g/dL" },
  wbc: { min: 4500, max: 11000, unit: "cells/µL" },
  platelets: { min: 150000, max: 450000, unit: "cells/µL" },
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initApp)

// Initialize the application
function initApp() {
  // File upload event listeners
  uploadBtn.addEventListener("click", triggerFileInput)
  fileInput.addEventListener("change", handleFileSelection)
  removeBtn.addEventListener("click", removeSelectedFile)
  analyzeBtn.addEventListener("click", analyzeHealthReport)

  // Drag and drop event listeners
  uploadArea.addEventListener("dragover", handleDragOver)
  uploadArea.addEventListener("dragleave", handleDragLeave)
  uploadArea.addEventListener("drop", handleFileDrop)

  // Tab navigation event listeners
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  })

  // Modal event listener
  closeModal.addEventListener("click", () => (errorModal.style.display = "none"))
}

// Trigger file input click
function triggerFileInput() {
  fileInput.click()
}

// Handle file selection from input
function handleFileSelection(event) {
  const file = event.target.files[0]
  if (file) {
    processSelectedFile(file)
  }
}

// Handle drag over event
function handleDragOver(event) {
  event.preventDefault()
  event.stopPropagation()
  uploadArea.classList.add("dragover")
}

// Handle drag leave event
function handleDragLeave(event) {
  event.preventDefault()
  event.stopPropagation()
  uploadArea.classList.remove("dragover")
}

// Handle file drop event
function handleFileDrop(event) {
  event.preventDefault()
  event.stopPropagation()
  uploadArea.classList.remove("dragover")

  const file = event.dataTransfer.files[0]
  if (file) {
    processSelectedFile(file)
  }
}

// Process the selected file
function processSelectedFile(file) {
  // Check file type
  const validTypes = ["image/jpeg", "image/png", "application/pdf"]
  if (!validTypes.includes(file.type)) {
    showError("Invalid file type. Please upload a JPG, PNG, or PDF file.")
    return
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showError("File is too large. Maximum size is 5MB.")
    return
  }

  selectedFile = file

  // Update UI
  uploadArea.style.display = "none"
  uploadPreview.hidden = false
  fileName.textContent = file.name

  // Create preview image
  if (file.type.startsWith("image/")) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.src = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    // For PDF, show a generic icon
    previewImage.src = "https://cdn-icons-png.flaticon.com/512/337/337946.png"
  }

  // Enable analyze button
  analyzeBtn.disabled = false
}

// Remove the selected file
function removeSelectedFile() {
  selectedFile = null
  uploadedFileURL = null

  // Reset UI
  uploadArea.style.display = "block"
  uploadPreview.hidden = true
  progressContainer.hidden = true
  analyzeBtn.disabled = true

  // Reset progress
  progressBar.style.width = "0%"
  progressText.textContent = "Uploading... 0%"

  // Hide results if visible
  resultsSection.hidden = true
}

// Analyze the health report
async function analyzeHealthReport() {
  try {
    if (!selectedFile) {
      showError("Please select a file to analyze.")
      return
    }

    // Show progress container
    progressContainer.hidden = false

    // Upload file to Firebase Storage
    uploadedFileURL = await firebaseStorage.uploadFile(selectedFile, updateProgressBar, (error) =>
      showError(`Upload error: ${error.message}`),
    )

    // Show results section
    resultsSection.hidden = false

    // Extract text from the uploaded file
    await extractTextFromImage(uploadedFileURL)
  } catch (error) {
    showError(`Analysis error: ${error.message}`)
  }
}

// Update progress bar
function updateProgressBar(progress) {
  progressBar.style.width = `${progress}%`
  progressText.textContent = `Uploading... ${Math.round(progress)}%`

  if (progress === 100) {
    setTimeout(() => {
      progressText.textContent = "Processing..."
    }, 500)
  }
}

// Extract text from image using Google Cloud Vision API
async function extractTextFromImage(imageUrl) {
  try {
    // Show loading spinner
    extractedText.innerHTML = '<div class="loading-spinner"></div>'
    metricsContainer.innerHTML = '<div class="loading-spinner"></div>'
    adviceContent.innerHTML = ""

    // Prepare the request to Google Cloud Vision API
    const apiKey = "YOUR_GOOGLE_CLOUD_API_KEY" // TODO: Replace with your API key
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`

    const requestBody = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            {
              type: "TEXT_DETECTION",
            },
          ],
        },
      ],
    }

    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract the text from the response
    const detectedText = data.responses[0].fullTextAnnotation?.text || "No text detected in the image."

    // Display the extracted text
    extractedText.textContent = detectedText

    // Analyze the extracted text for health metrics
    analyzeHealthMetrics(detectedText)
  } catch (error) {
    extractedText.textContent = `Error extracting text: ${error.message}`
    showError(`Text extraction error: ${error.message}`)
  }
}

// Analyze health metrics from the extracted text
function analyzeHealthMetrics(text) {
  // Clear previous results
  metricsContainer.innerHTML = ""
  adviceContent.innerHTML = ""

  // Extract health metrics using regex patterns
  const metrics = {
    bloodPressure: extractBloodPressure(text),
    bloodSugar: {
      fasting: extractValue(text, /fasting(\s+blood)?\s+sugar\s*:?\s*(\d+)/i),
      postprandial: extractValue(text, /post(\s*prandial)?\s+blood\s+sugar\s*:?\s*(\d+)/i),
      hba1c: extractValue(text, /hba1c\s*:?\s*(\d+\.?\d*)/i),
    },
    cholesterol: {
      total: extractValue(text, /total\s+cholesterol\s*:?\s*(\d+)/i),
      hdl: extractValue(text, /hdl\s*:?\s*(\d+)/i),
      ldl: extractValue(text, /ldl\s*:?\s*(\d+)/i),
      triglycerides: extractValue(text, /triglycerides\s*:?\s*(\d+)/i),
    },
    hemoglobin: extractValue(text, /h(a|e)moglobin\s*:?\s*(\d+\.?\d*)/i),
    wbc: extractValue(text, /wbc\s*:?\s*(\d+,?\d*)/i),
    platelets: extractValue(text, /platelets\s*:?\s*(\d+,?\d*)/i),
  }

  // Display the extracted metrics
  displayMetrics(metrics)

  // Generate health advice based on the metrics
  generateHealthAdvice(metrics)
}

// Extract blood pressure values from text
function extractBloodPressure(text) {
  const bpRegex = /blood\s+pressure\s*:?\s*(\d+)\s*\/\s*(\d+)/i
  const match = text.match(bpRegex)

  if (match) {
    return {
      systolic: Number.parseInt(match[1]),
      diastolic: Number.parseInt(match[2]),
    }
  }

  return {
    systolic: null,
    diastolic: null,
  }
}

// Extract numeric value from text using regex
function extractValue(text, regex) {
  const match = text.match(regex)
  if (match) {
    // Get the last capturing group which should contain the numeric value
    const valueStr = match[match.length - 1].replace(",", "")
    return Number.parseFloat(valueStr)
  }
  return null
}

// Display the extracted metrics
function displayMetrics(metrics) {
  // Blood Pressure
  if (metrics.bloodPressure.systolic && metrics.bloodPressure.diastolic) {
    addMetricCard(
      "Blood Pressure",
      `${metrics.bloodPressure.systolic}/${metrics.bloodPressure.diastolic} mmHg`,
      getBloodPressureStatus(metrics.bloodPressure),
    )
  }

  // Blood Sugar - Fasting
  if (metrics.bloodSugar.fasting) {
    addMetricCard(
      "Fasting Blood Sugar",
      `${metrics.bloodSugar.fasting} mg/dL`,
      getMetricStatus(metrics.bloodSugar.fasting, healthMetricsRanges.bloodSugar.fasting),
    )
  }

  // Blood Sugar - Postprandial
  if (metrics.bloodSugar.postprandial) {
    addMetricCard(
      "Postprandial Blood Sugar",
      `${metrics.bloodSugar.postprandial} mg/dL`,
      getMetricStatus(metrics.bloodSugar.postprandial, healthMetricsRanges.bloodSugar.postprandial),
    )
  }

  // HbA1c
  if (metrics.bloodSugar.hba1c) {
    addMetricCard(
      "HbA1c",
      `${metrics.bloodSugar.hba1c}%`,
      getMetricStatus(metrics.bloodSugar.hba1c, healthMetricsRanges.bloodSugar.hba1c),
    )
  }

  // Cholesterol - Total
  if (metrics.cholesterol.total) {
    addMetricCard(
      "Total Cholesterol",
      `${metrics.cholesterol.total} mg/dL`,
      getMetricStatus(metrics.cholesterol.total, healthMetricsRanges.cholesterol.total),
    )
  }

  // Cholesterol - HDL
  if (metrics.cholesterol.hdl) {
    addMetricCard(
      "HDL Cholesterol",
      `${metrics.cholesterol.hdl} mg/dL`,
      getMetricStatus(metrics.cholesterol.hdl, healthMetricsRanges.cholesterol.hdl),
    )
  }

  // Cholesterol - LDL
  if (metrics.cholesterol.ldl) {
    addMetricCard(
      "LDL Cholesterol",
      `${metrics.cholesterol.ldl} mg/dL`,
      getMetricStatus(metrics.cholesterol.ldl, healthMetricsRanges.cholesterol.ldl),
    )
  }

  // Cholesterol - Triglycerides
  if (metrics.cholesterol.triglycerides) {
    addMetricCard(
      "Triglycerides",
      `${metrics.cholesterol.triglycerides} mg/dL`,
      getMetricStatus(metrics.cholesterol.triglycerides, healthMetricsRanges.cholesterol.triglycerides),
    )
  }

  // Hemoglobin
  if (metrics.hemoglobin) {
    addMetricCard(
      "Hemoglobin",
      `${metrics.hemoglobin} g/dL`,
      getMetricStatus(metrics.hemoglobin, healthMetricsRanges.hemoglobin),
    )
  }

  // WBC
  if (metrics.wbc) {
    addMetricCard(
      "White Blood Cell Count",
      `${metrics.wbc} cells/µL`,
      getMetricStatus(metrics.wbc, healthMetricsRanges.wbc),
    )
  }

  // Platelets
  if (metrics.platelets) {
    addMetricCard(
      "Platelets",
      `${metrics.platelets} cells/µL`,
      getMetricStatus(metrics.platelets, healthMetricsRanges.platelets),
    )
  }

  // If no metrics were found
  if (metricsContainer.innerHTML === "") {
    metricsContainer.innerHTML =
      "<p>No health metrics were detected in the report. The system may not have recognized the format of your report.</p>"
  }
}

// Add a metric card to the metrics container
function addMetricCard(name, value, status) {
  const card = document.createElement("div")
  card.className = "metric-card"

  const metricInfo = document.createElement("div")
  metricInfo.className = "metric-info"

  const title = document.createElement("h4")
  title.textContent = name

  const description = document.createElement("p")
  description.textContent = getMetricDescription(name)

  metricInfo.appendChild(title)
  metricInfo.appendChild(description)

  const metricValue = document.createElement("div")
  metricValue.className = `metric-value ${status}`
  metricValue.textContent = value

  card.appendChild(metricInfo)
  card.appendChild(metricValue)

  metricsContainer.appendChild(card)
}

// Get metric description
function getMetricDescription(metricName) {
  const descriptions = {
    "Blood Pressure": "The pressure of blood against the walls of your arteries.",
    "Fasting Blood Sugar": "Blood glucose level after not eating for at least 8 hours.",
    "Postprandial Blood Sugar": "Blood glucose level 2 hours after eating.",
    HbA1c: "Average blood glucose levels over the past 2-3 months.",
    "Total Cholesterol": "The total amount of cholesterol in your blood.",
    "HDL Cholesterol": "Good cholesterol that helps remove other forms of cholesterol from your bloodstream.",
    "LDL Cholesterol": "Bad cholesterol that can build up in your arteries.",
    Triglycerides: "A type of fat found in your blood that your body uses for energy.",
    Hemoglobin: "Protein in red blood cells that carries oxygen throughout the body.",
    "White Blood Cell Count": "Cells that help fight infections and other diseases.",
    Platelets: "Cell fragments that help your blood clot.",
  }

  return descriptions[metricName] || ""
}

// Get blood pressure status
function getBloodPressureStatus(bp) {
  if (bp.systolic < 90 || bp.diastolic < 60) {
    return "warning" // Low blood pressure
  } else if (bp.systolic > 140 || bp.diastolic > 90) {
    return "danger" // High blood pressure
  } else if ((bp.systolic >= 120 && bp.systolic <= 140) || (bp.diastolic >= 80 && bp.diastolic <= 90)) {
    return "warning" // Pre-hypertension
  } else {
    return "normal" // Normal blood pressure
  }
}

// Get metric status based on reference range
function getMetricStatus(value, range) {
  if (value < range.min) {
    return "warning"
  } else if (value > range.max) {
    return "danger"
  } else {
    return "normal"
  }
}

// Generate health advice based on the metrics
function generateHealthAdvice(metrics) {
  const adviceItems = []

  // Blood Pressure Advice
  if (metrics.bloodPressure.systolic && metrics.bloodPressure.diastolic) {
    const bpStatus = getBloodPressureStatus(metrics.bloodPressure)

    if (bpStatus === "danger") {
      adviceItems.push({
        title: "High Blood Pressure",
        advice:
          "Your blood pressure is elevated. Consider reducing sodium intake, maintaining a healthy weight, regular exercise, and stress management. Consult with a healthcare provider for proper evaluation and treatment.",
      })
    } else if (bpStatus === "warning" && metrics.bloodPressure.systolic < 90) {
      adviceItems.push({
        title: "Low Blood Pressure",
        advice:
          "Your blood pressure is lower than normal. Stay hydrated, avoid standing up too quickly, and consider adding more salt to your diet if recommended by your doctor. Consult with a healthcare provider if you experience dizziness or fainting.",
      })
    }
  }

  // Blood Sugar Advice
  if (metrics.bloodSugar.fasting && metrics.bloodSugar.fasting > healthMetricsRanges.bloodSugar.fasting.max) {
    adviceItems.push({
      title: "Elevated Fasting Blood Sugar",
      advice:
        "Your fasting blood sugar is higher than normal. Consider reducing carbohydrate intake, increasing physical activity, maintaining a healthy weight, and monitoring your blood sugar regularly. Consult with a healthcare provider for proper evaluation and management.",
    })
  }

  if (metrics.bloodSugar.hba1c && metrics.bloodSugar.hba1c > healthMetricsRanges.bloodSugar.hba1c.max) {
    adviceItems.push({
      title: "Elevated HbA1c",
      advice:
        "Your HbA1c level indicates that your average blood sugar has been higher than normal over the past 2-3 months. This may indicate prediabetes or diabetes. Consider lifestyle modifications and consult with a healthcare provider for proper evaluation and management.",
    })
  }

  // Cholesterol Advice
  if (metrics.cholesterol.total && metrics.cholesterol.total > healthMetricsRanges.cholesterol.total.max) {
    adviceItems.push({
      title: "High Total Cholesterol",
      advice:
        "Your total cholesterol is elevated. Consider reducing saturated and trans fat intake, increasing fiber consumption, regular exercise, and maintaining a healthy weight. Consult with a healthcare provider for proper evaluation and management.",
    })
  }

  if (metrics.cholesterol.ldl && metrics.cholesterol.ldl > healthMetricsRanges.cholesterol.ldl.max) {
    adviceItems.push({
      title: "High LDL Cholesterol",
      advice:
        "Your LDL (bad) cholesterol is elevated. Consider reducing saturated and trans fat intake, increasing soluble fiber consumption, regular exercise, and maintaining a healthy weight. Consult with a healthcare provider for proper evaluation and management.",
    })
  }

  if (metrics.cholesterol.hdl && metrics.cholesterol.hdl < healthMetricsRanges.cholesterol.hdl.min) {
    adviceItems.push({
      title: "Low HDL Cholesterol",
      advice:
        "Your HDL (good) cholesterol is lower than recommended. Consider regular physical activity, quitting smoking, maintaining a healthy weight, and consuming healthy fats like those found in olive oil, nuts, and fatty fish. Consult with a healthcare provider for proper evaluation and management.",
    })
  }

  // General Advice
  adviceItems.push({
    title: "General Health Recommendations",
    advice:
      "Maintain a balanced diet rich in fruits, vegetables, whole grains, and lean proteins. Stay physically active with at least 150 minutes of moderate-intensity exercise per week. Get adequate sleep (7-9 hours per night), manage stress, stay hydrated, and avoid tobacco and excessive alcohol consumption.",
  })

  // Display advice
  if (adviceItems.length > 0) {
    adviceItems.forEach((item) => {
      const adviceItem = document.createElement("div")
      adviceItem.className = "advice-item"

      const title = document.createElement("h4")
      title.textContent = item.title

      const advice = document.createElement("p")
      advice.textContent = item.advice

      adviceItem.appendChild(title)
      adviceItem.appendChild(advice)

      adviceContent.appendChild(adviceItem)
    })
  } else {
    adviceContent.innerHTML = "<p>No specific health advice available based on the detected metrics.</p>"
  }
}

// Switch between tabs
function switchTab(tabId) {
  // Update tab buttons
  tabBtns.forEach((btn) => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active")
    } else {
      btn.classList.remove("active")
    }
  })

  // Update tab panes
  tabPanes.forEach((pane) => {
    if (pane.id === `${tabId}Tab`) {
      pane.classList.add("active")
    } else {
      pane.classList.remove("active")
    }
  })
}

// Show error modal
function showError(message) {
  errorMessage.textContent = message
  errorModal.style.display = "block"
}

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

let isDarkTheme = false;

themeToggle.addEventListener("click", () => {
  isDarkTheme = !isDarkTheme;
  body.classList.toggle("dark-theme");
  themeToggle.textContent = isDarkTheme ? "☀️" : "🌙";
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});