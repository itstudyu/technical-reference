/**
 * Personal Reference Hub - JavaScript
 * Handles all interactive functionality including search, topic management, and UI interactions
 */

class PersonalReferenceHub {
  constructor() {
    this.topics = [];
    this.filteredTopics = [];
    this.searchQuery = "";
    this.isLoading = false;

    // DOM elements
    this.elements = {
      searchInput: document.getElementById("search-input"),
      searchClear: document.querySelector(".search-clear"),
      searchInfo: document.getElementById("search-info"),
      topicsGrid: document.getElementById("topics-grid"),
      topicCount: document.getElementById("topic-count"),
      emptyState: document.getElementById("empty-state"),
      addTopicBtn: document.getElementById("add-topic-btn"),
      modal: document.getElementById("add-topic-modal"),
      modalClose: document.querySelector(".modal-close"),
      modalOverlay: document.querySelector(".modal-overlay"),
      cancelBtn: document.getElementById("cancel-topic"),
      addTopicForm: document.getElementById("add-topic-form"),
      loading: document.getElementById("loading"),
    };

    this.init();
  }

  init() {
    this.loadTopicsFromStorage();
    this.setupEventListeners();
    this.setupMermaid();
    this.renderTopics();
    this.updateUI();
  }

  setupMermaid() {
    if (typeof mermaid !== "undefined") {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#3b82f6",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#3b82f6",
          lineColor: "#64748b",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#f8fafc",
        },
      });
    }
  }

  setupEventListeners() {
    // Search functionality
    this.elements.searchInput.addEventListener("input", (e) => {
      this.handleSearch(e.target.value);
    });

    this.elements.searchClear.addEventListener("click", () => {
      this.clearSearch();
    });

    // Modal functionality
    this.elements.addTopicBtn.addEventListener("click", () => {
      this.openModal();
    });

    this.elements.modalClose.addEventListener("click", () => {
      this.closeModal();
    });

    this.elements.modalOverlay.addEventListener("click", () => {
      this.closeModal();
    });

    this.elements.cancelBtn.addEventListener("click", () => {
      this.closeModal();
    });

    // Form submission
    this.elements.addTopicForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.elements.searchInput.focus();
      }
    });

    // Auto-save form data as user types
    const formInputs =
      this.elements.addTopicForm.querySelectorAll("input, textarea");
    formInputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.saveFormData();
      });
    });
  }

  handleSearch(query) {
    this.searchQuery = query.toLowerCase().trim();

    // Show/hide clear button
    if (this.searchQuery) {
      this.elements.searchClear.style.display = "block";
    } else {
      this.elements.searchClear.style.display = "none";
    }

    this.filterTopics();
    this.renderTopics();
    this.updateSearchInfo();
  }

  clearSearch() {
    this.elements.searchInput.value = "";
    this.elements.searchClear.style.display = "none";
    this.searchQuery = "";
    this.filterTopics();
    this.renderTopics();
    this.updateSearchInfo();
    this.elements.searchInput.focus();
  }

  filterTopics() {
    if (!this.searchQuery) {
      this.filteredTopics = [...this.topics];
      return;
    }

    this.filteredTopics = this.topics.filter((topic) => {
      const searchableText = [topic.title, topic.description, ...topic.tags]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(this.searchQuery);
    });
  }

  updateSearchInfo() {
    if (!this.searchQuery) {
      this.elements.searchInfo.style.display = "none";
      return;
    }

    const count = this.filteredTopics.length;
    this.elements.searchInfo.style.display = "block";
    this.elements.searchInfo.textContent = `Found ${count} topic${
      count !== 1 ? "s" : ""
    } matching "${this.searchQuery}"`;
  }

  openModal() {
    this.elements.modal.classList.add("show");
    this.elements.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Focus first input
    const firstInput = this.elements.addTopicForm.querySelector("input");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }

    // Restore form data if available
    this.restoreFormData();
  }

  closeModal() {
    this.elements.modal.classList.remove("show");
    this.elements.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Clear form data from storage
    localStorage.removeItem("formData");
    this.elements.addTopicForm.reset();
  }

  saveFormData() {
    const formData = new FormData(this.elements.addTopicForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    localStorage.setItem("formData", JSON.stringify(data));
  }

  restoreFormData() {
    const savedData = localStorage.getItem("formData");
    if (savedData) {
      const data = JSON.parse(savedData);
      for (let [key, value] of Object.entries(data)) {
        const input = this.elements.addTopicForm.querySelector(
          `[name="${key}"]`
        );
        if (input) {
          input.value = value;
        }
      }
    }
  }

  async handleFormSubmit() {
    this.showLoading(true);

    try {
      const formData = new FormData(this.elements.addTopicForm);
      const topic = {
        id: Date.now().toString(),
        title: formData.get("topic-title").trim(),
        description: formData.get("topic-description").trim(),
        diagram: formData.get("topic-diagram").trim(),
        image: formData.get("topic-image").trim(),
        tags: formData
          .get("topic-tags")
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validate required fields
      if (!topic.title || !topic.description) {
        throw new Error("Title and description are required");
      }

      // Validate image URL if provided
      if (topic.image && !this.isValidUrl(topic.image)) {
        throw new Error("Please enter a valid image URL");
      }

      this.topics.push(topic);
      this.saveTopicsToStorage();
      this.filterTopics();
      this.renderTopics();
      this.updateUI();
      this.closeModal();

      // Show success message
      this.showNotification("Topic added successfully!", "success");
    } catch (error) {
      this.showNotification(error.message, "error");
    } finally {
      this.showLoading(false);
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  deleteTopic(id) {
    if (confirm("Are you sure you want to delete this topic?")) {
      this.topics = this.topics.filter((topic) => topic.id !== id);
      this.saveTopicsToStorage();
      this.filterTopics();
      this.renderTopics();
      this.updateUI();
      this.showNotification("Topic deleted successfully!", "success");
    }
  }

  editTopic(id) {
    const topic = this.topics.find((t) => t.id === id);
    if (topic) {
      // Pre-fill form with topic data
      document.getElementById("topic-title").value = topic.title;
      document.getElementById("topic-description").value = topic.description;
      document.getElementById("topic-diagram").value = topic.diagram || "";
      document.getElementById("topic-image").value = topic.image || "";
      document.getElementById("topic-tags").value = topic.tags.join(", ");

      // Store edit mode
      this.elements.addTopicForm.dataset.editId = id;
      document.getElementById("modal-title").textContent = "Edit Topic";

      this.openModal();
    }
  }

  renderTopics() {
    if (this.filteredTopics.length === 0) {
      this.elements.topicsGrid.innerHTML = "";
      this.elements.emptyState.classList.add("show");
      return;
    }

    this.elements.emptyState.classList.remove("show");

    this.elements.topicsGrid.innerHTML = this.filteredTopics
      .map((topic) => this.createTopicCard(topic))
      .join("");

    // Render Mermaid diagrams
    this.renderMermaidDiagrams();

    // Setup card event listeners
    this.setupCardEventListeners();
  }

  createTopicCard(topic) {
    const tagsHtml = topic.tags
      .map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`)
      .join("");

    const imageHtml = topic.image
      ? `<div class="topic-image">
                <img src="${this.escapeHtml(topic.image)}" 
                     alt="Visual representation of ${this.escapeHtml(
                       topic.title
                     )}"
                     loading="lazy"
                     onerror="this.style.display='none'">
            </div>`
      : "";

    const diagramHtml = topic.diagram
      ? `<div class="topic-diagram">
                <div class="mermaid-container" data-diagram="${this.escapeHtml(
                  topic.diagram
                )}"></div>
            </div>`
      : "";

    return `
            <article class="topic-card" data-topic-id="${topic.id}">
                <header class="topic-header" onclick="this.closest('.topic-card').querySelector('.topic-content').classList.toggle('expanded'); this.querySelector('.expand-icon').classList.toggle('expanded')">
                    <div>
                        <h3 class="topic-title">${this.escapeHtml(
                          topic.title
                        )}</h3>
                        <div class="topic-tags">${tagsHtml}</div>
                    </div>
                    <button type="button" class="expand-icon" aria-label="Expand topic details">
                        <span class="icon">▼</span>
                    </button>
                </header>
                
                <div class="topic-content">
                    <div class="topic-description">${this.escapeHtml(
                      topic.description
                    )}</div>
                    ${diagramHtml}
                    ${imageHtml}
                    
                    <div class="topic-actions">
                        <button type="button" class="btn btn-small btn-secondary" onclick="app.editTopic('${
                          topic.id
                        }')">
                            <span class="icon">✏️</span>
                            Edit
                        </button>
                        <button type="button" class="btn btn-small btn-danger" onclick="app.deleteTopic('${
                          topic.id
                        }')">
                            <span class="icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                </div>
            </article>
        `;
  }

  setupCardEventListeners() {
    // Handle keyboard navigation for card headers
    const cardHeaders = document.querySelectorAll(".topic-header");
    cardHeaders.forEach((header) => {
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          header.click();
        }
      });

      // Make headers focusable
      header.setAttribute("tabindex", "0");
    });
  }

  async renderMermaidDiagrams() {
    if (typeof mermaid === "undefined") return;

    const diagramContainers = document.querySelectorAll(".mermaid-container");

    for (let i = 0; i < diagramContainers.length; i++) {
      const container = diagramContainers[i];
      const diagramCode = container.dataset.diagram;

      if (diagramCode) {
        try {
          const id = `mermaid-${Date.now()}-${i}`;
          const { svg } = await mermaid.render(id, diagramCode);
          container.innerHTML = svg;
        } catch (error) {
          console.error("Error rendering Mermaid diagram:", error);
          container.innerHTML = `
                        <div style="padding: 1rem; background: #fee2e2; color: #991b1b; border-radius: 0.5rem; font-size: 0.875rem;">
                            <strong>Diagram Error:</strong> Unable to render diagram. Please check the Mermaid syntax.
                        </div>
                    `;
        }
      }
    }
  }

  updateUI() {
    this.elements.topicCount.textContent = this.topics.length;
  }

  showLoading(show) {
    this.isLoading = show;
    if (show) {
      this.elements.loading.classList.add("show");
      this.elements.loading.setAttribute("aria-hidden", "false");
    } else {
      this.elements.loading.classList.remove("show");
      this.elements.loading.setAttribute("aria-hidden", "true");
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${
              type === "success"
                ? "#10b981"
                : type === "error"
                ? "#ef4444"
                : "#3b82f6"
            };
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            font-weight: 500;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  loadTopicsFromStorage() {
    try {
      const stored = localStorage.getItem("personalReferenceTopics");
      if (stored) {
        this.topics = JSON.parse(stored);
      } else {
        // Load sample data on first visit
        this.loadSampleData();
      }
    } catch (error) {
      console.error("Error loading topics from storage:", error);
      this.topics = [];
    }
  }

  saveTopicsToStorage() {
    try {
      localStorage.setItem(
        "personalReferenceTopics",
        JSON.stringify(this.topics)
      );
    } catch (error) {
      console.error("Error saving topics to storage:", error);
      this.showNotification(
        "Error saving data. Storage might be full.",
        "error"
      );
    }
  }

  loadSampleData() {
    this.topics = [
      {
        id: "sample-proxy",
        title: "Proxy Servers",
        description:
          "A proxy server acts as an intermediary between your device and the internet. When you make a request to a website, it goes through the proxy server first, which then forwards the request to the destination server. The response comes back through the proxy to you. Proxies can provide anonymity, caching, content filtering, and security benefits.",
        diagram: `graph TD
    A[Your Device] -->|Request| B[Proxy Server]
    B -->|Forwarded Request| C[Target Website]
    C -->|Response| B
    B -->|Filtered Response| A
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5`,
        image: "",
        tags: ["networking", "security", "internet", "privacy"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "sample-llm",
        title: "Large Language Models (LLM)",
        description:
          "Large Language Models are AI systems trained on vast amounts of text data to understand and generate human-like language. They use transformer architecture with billions of parameters to process and generate text. Examples include GPT, BERT, and Claude. LLMs can perform tasks like text completion, translation, summarization, and question-answering by predicting the most likely next words based on context.",
        diagram: `graph TB
    A[Input Text] --> B[Tokenization]
    B --> C[Embedding Layer]
    C --> D[Transformer Layers]
    D --> E[Attention Mechanism]
    E --> F[Feed Forward Networks]
    F --> G[Output Layer]
    G --> H[Generated Text]
    
    subgraph "Training Data"
        I[Books]
        J[Web Pages]
        K[Articles]
    end
    
    I --> D
    J --> D
    K --> D
    
    style A fill:#e8f5e8
    style H fill:#e8f5e8
    style D fill:#fff3e0`,
        image: "",
        tags: [
          "AI",
          "machine learning",
          "NLP",
          "transformers",
          "deep learning",
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.saveTopicsToStorage();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Export/Import functionality
  exportTopics() {
    const dataStr = JSON.stringify(this.topics, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-reference-topics-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
    this.showNotification("Topics exported successfully!", "success");
  }

  importTopics(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTopics = JSON.parse(e.target.result);
        if (Array.isArray(importedTopics)) {
          this.topics = importedTopics;
          this.saveTopicsToStorage();
          this.filterTopics();
          this.renderTopics();
          this.updateUI();
          this.showNotification(
            `Imported ${importedTopics.length} topics successfully!`,
            "success"
          );
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        this.showNotification(
          "Error importing topics. Please check the file format.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PersonalReferenceHub();

  // Add export/import buttons to action bar
  const actionBar = document.querySelector(".action-bar");
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn btn-secondary btn-small";
  exportBtn.innerHTML = '<span class="icon">📤</span> Export';
  exportBtn.onclick = () => app.exportTopics();

  const importBtn = document.createElement("button");
  importBtn.className = "btn btn-secondary btn-small";
  importBtn.innerHTML = '<span class="icon">📥</span> Import';
  importBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      if (e.target.files[0]) {
        app.importTopics(e.target.files[0]);
      }
    };
    input.click();
  };

  // Insert buttons before the topic count
  const topicCount = document.querySelector(".topic-count");
  actionBar.insertBefore(importBtn, topicCount);
  actionBar.insertBefore(exportBtn, topicCount);
});
