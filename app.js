document.addEventListener("DOMContentLoaded", () => {
    // General Configuration
    const allVideos = typeof videoData !== 'undefined' ? [...videoData].reverse() : [];
    
    // Identify page elements
    const isHomePage = document.getElementById("videoGrid") !== null && document.getElementById("categoryFilters") !== null;
    const isVideoPage = document.getElementById("playerArea") !== null && document.getElementById("relatedGrid") !== null;

    // URL Slug Utility
    function createSlug(title) {
        if (!title) return "video";
        return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-');
    }

    // Render Video Card HTML
    function createVideoCardHTML(video) {
        const slug = createSlug(video.title);
        const embedSrc = video.embedUrl || "";
        return `
            <a href="video.html?v=${slug}&id=${video.id}" class="video-card" data-embed="${embedSrc}">
                <div class="thumbnail-wrapper">
                    <img src="${video.thumbnail || 'https://via.placeholder.com/640x360?text=No+Image'}" alt="${video.title}" class="thumbnail" loading="lazy">
                    <div class="play-overlay">
                        <div class="play-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span class="tag-badge">${video.category || 'Lainnya'}</span>
                        <span>${video.uploadDate || ''}</span>
                    </div>
                </div>
            </a>
        `;
    }

    /* =========================================
       >>> HOME PAGE LOGIC <<<
       ========================================= */
    if (isHomePage) {
        const gridEl = document.getElementById("videoGrid");
        const searchInput = document.getElementById("searchInput");
        const paginationEl = document.getElementById("pagination");
        const categoryFiltersEl = document.getElementById("categoryFilters");

        const ITEMS_PER_PAGE = 24;
        const homeParams = new URLSearchParams(window.location.search);
        let currentPage = parseInt(homeParams.get('page')) || 1;
        let activeCategory = homeParams.get('category') || "All";
        let searchQuery = homeParams.get('q') || "";

        function updateHomeURL() {
            const newUrl = new URL(window.location);
            if (activeCategory !== "All") {
                newUrl.searchParams.set("category", activeCategory);
            } else {
                newUrl.searchParams.delete("category");
            }
            if (searchQuery) {
                newUrl.searchParams.set("q", searchQuery);
            } else {
                newUrl.searchParams.delete("q");
            }
            if (currentPage > 1) {
                newUrl.searchParams.set("page", currentPage);
            } else {
                newUrl.searchParams.delete("page");
            }
            window.history.pushState({}, '', newUrl);
        }
        
        let filteredVideos = [...allVideos];

        const uniqueCategories = ["All", ...new Set(allVideos.map(v => v.category).filter(c => c))];

        function renderCategories() {
            categoryFiltersEl.innerHTML = "";
            uniqueCategories.forEach(cat => {
                const btn = document.createElement("button");
                btn.className = `chip ${activeCategory === cat ? 'active' : ''}`;
                btn.innerText = cat;
                btn.onclick = () => {
                    activeCategory = cat;
                    currentPage = 1;
                    updateHomeURL();
                    applyFilters();
                    renderCategories();
                };
                categoryFiltersEl.appendChild(btn);
            });
        }

        function applyFilters() {
            filteredVideos = allVideos.filter(v => {
                const matchCategory = activeCategory === "All" ? true : v.category === activeCategory;
                const matchSearch = v.title.toLowerCase().includes(searchQuery) || 
                                    (v.category && v.category.toLowerCase().includes(searchQuery));
                return matchCategory && matchSearch;
            });
            renderVideos(filteredVideos, currentPage);
        }

        function renderVideos(videoArray, page) {
            gridEl.innerHTML = "";
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const paginatedItems = videoArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            if (paginatedItems.length === 0) {
                gridEl.innerHTML = `
                    <div class="no-results">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <h2>No videos found</h2>
                        <p>Try different keywords or change the category filter.</p>
                    </div>`;
                paginationEl.innerHTML = "";
                return;
            }

            const html = paginatedItems.map(video => createVideoCardHTML(video)).join("");
            gridEl.innerHTML = html;
            renderPagination(videoArray.length, page);
        }

        function renderPagination(totalItems, page) {
            paginationEl.innerHTML = "";
            const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            
            if (totalPages <= 1) return;

            for (let i = 1; i <= totalPages; i++) {
                if(i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                    const btn = document.createElement("button");
                    btn.innerText = i;
                    btn.className = `page-btn ${i === page ? 'active' : ''}`;
                    btn.addEventListener("click", () => {
                        currentPage = i;
                        updateHomeURL();
                        renderVideos(filteredVideos, currentPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    });
                    paginationEl.appendChild(btn);
                } else if(i === page - 3 || i === page + 3) {
                    const dots = document.createElement("span");
                    dots.innerText = "...";
                    dots.style.color = "var(--text-muted)";
                    paginationEl.appendChild(dots);
                }
            }
        }

        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase();
            currentPage = 1;
            updateHomeURL();
            applyFilters();
        });

        renderCategories();
        renderVideos(filteredVideos, currentPage);
    }

    /* =========================================
       >>> VIDEO PAGE LOGIC <<<
       ========================================= */
    if (isVideoPage) {
        const params = new URLSearchParams(window.location.search);
        const videoId = parseInt(params.get('id'));
        const video = allVideos.find(v => v.id === videoId);

        if (video) {
            document.title = `${video.title} - misbar21`;
            
            document.getElementById("videoTitle").textContent = video.title;
            const metaHtml = `
                <span class="tag-badge" style="background:var(--primary-color);color:#000;">${video.category || 'General'}</span>
                <span>📅 Uploaded: ${video.uploadDate || 'No info'}</span>
            `;
            document.getElementById("videoMeta").innerHTML = metaHtml;
            
            if (video.downloadUrl) {
                const downloadHtml = `
                    <a href="${video.downloadUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:0.5rem; margin-top:1.5rem; margin-bottom:1rem; padding:0.75rem 1.5rem; background:var(--accent-color); color:white; font-weight:600; font-size: 0.9rem; text-decoration:none; border-radius:8px; transition:all 0.3s; box-shadow: 0 4px 15px rgba(255, 42, 95, 0.4);" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        DOWNLOAD VIDEO
                    </a>
                `;
                document.getElementById("videoMeta").insertAdjacentHTML("afterend", downloadHtml);
            }

            if (video.tags && video.tags.length > 0) {
                const tagsHtml = video.tags.map(tag => `<span class="tag-pill">#${tag}</span>`).join("");
                document.getElementById("videoTags").innerHTML = tagsHtml;
            }

            document.getElementById("playerArea").innerHTML = `
                <iframe src="${video.embedUrl}" allowfullscreen scrolling="no" loading="lazy"></iframe>
            `;

            const relatedGrid = document.getElementById("relatedGrid");
            let relatedVideos = allVideos.filter(v => v.category === video.category && v.id !== videoId);
            
            if(relatedVideos.length < 8) {
                const randomVideos = allVideos.filter(v => v.id !== videoId && !relatedVideos.includes(v));
                relatedVideos = [...relatedVideos, ...randomVideos].slice(0, 8);
            } else {
                relatedVideos = relatedVideos.slice(0, 8);
            }

            if(relatedVideos.length > 0) {
                relatedGrid.innerHTML = relatedVideos.map(v => createVideoCardHTML(v)).join("");
            } else {
                relatedGrid.innerHTML = `<p style="color:var(--text-muted);">No related videos found.</p>`;
            }

        } else {
            document.getElementById("videoTitle").textContent = "Video not found.";
            document.getElementById("playerArea").innerHTML = `
                <div style="display:flex; height:100%; align-items:center; justify-content:center; color:white;">
                    <h2>This video has been removed or the ID is invalid.</h2>
                </div>`;
            document.getElementById("relatedGrid").innerHTML = "";
            document.querySelector(".section-title").style.display = "none";
        }
    }
});
