
        document.addEventListener('DOMContentLoaded', () => {
            
            const memes = []; // This will hold the memes fetched from the backend

            fetch("api/memes/list.php")
            .then(res => res.json())
            .then(memes => {
                renderMemes(memes); // use your existing function to render cards
            })
            .catch(err => {
                console.error("Could not fetch memes from backend:", err);
            });

            // DOM elements
            const container = document.getElementById("memeContainer");
            const memeModal = document.getElementById("memeModal");
            const modalImage = document.getElementById("modalImage");
            const modalTitle = document.getElementById("modalTitle");
            const modalLikes = document.getElementById("modalLikes");
            const modalUpvotes = document.getElementById("modalUpvotes");
            const modalShares = document.getElementById("modalShares");
            const modalDownloads = document.getElementById("modalDownloads");
            const authModal = document.getElementById("authModal");
            const uploadModal = document.getElementById("uploadModal");
            const loginBtn = document.querySelector(".loginBtn");
            const logoutBtn = document.querySelector(".logoutBtn");
            const uploadBtn = document.querySelectorAll(".uploadBtn");
            const myPostsBtn = document.querySelector(".myPostsBtn");
            const profileBtn = document.querySelector(".profile-btn");
            const dropdown = document.querySelector(".profile-dropdown");
            const loginForm = document.getElementById("loginForm");
            const signupForm = document.getElementById("signupForm");
            const authTabs = document.querySelectorAll(".auth-tab");
            const loginBtnForm = document.getElementById("loginBtn");
            const signupBtnForm = document.getElementById("signupBtn");
            const uploadNotice = document.getElementById("uploadNotice");
            const memeFileInput = document.getElementById("memeFile");
            const fileNameSpan = document.getElementById("fileName");
            const imagePreview = document.getElementById("imagePreview");
            const submitMemeBtn = document.getElementById("submitMemeBtn");
            const navbarBurger = document.querySelector('.navbar-burger');
            const navbarMenu = document.querySelector('.navbar-menu');
            const loadMoreBtn = document.getElementById("loadMoreBtn");
            let loggedInUser = null;
            let showingMyPosts = false;
            let visibleMemes = 6; // Initial number of memes to show
            const memesPerLoad = 6; // Number of memes to load each time

            // Mobile navbar toggle
            if (navbarBurger) {
                navbarBurger.addEventListener('click', () => {
                    navbarBurger.classList.toggle('is-active');
                    navbarMenu.classList.toggle('is-active');
                });
            }

            // Render memes function
            function renderMemes(filterByUser = false, memes = memes) {
                container.innerHTML = "";
                showingMyPosts = filterByUser;

                const filtered = filterByUser && loggedInUser
                    ? memes.filter((m) => m.postedBy === loggedInUser)
                    : memes;

                document.querySelector(".section-title").textContent = 
                    filterByUser ? "My Posts" : "Trending Memes";

                if (filtered.length === 0) {
                    container.innerHTML = `
                        <div class="column is-12 has-text-centered" style="padding: 3rem;">
                            <i class="fas fa-images" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                            <h3 class="title is-3" style="margin-bottom: 1rem;">No memes found</h3>
                            <p>${filterByUser ? "You haven't posted any memes yet" : "No memes available at the moment"}</p>
                        </div>
                    `;
                    loadMoreBtn.style.display = "none";
                    return;
                }

                // Only show the first 'visibleMemes' memes
                const memesToShow = filtered.slice(0, visibleMemes);
                
                memesToShow.forEach((meme) => {
                    const card = document.createElement("div");
                    card.className = "column is-4-desktop is-6-tablet is-12-mobile meme-column";
                    card.innerHTML = `
                        <div class="meme-card">
                            <div class="card-image">
                                <figure class="image">
                                    <img src="${meme.filename}" alt="${meme.title}" class="meme-img">
                                </figure>
                            </div>
                            <div class="meme-content">
                                <p class="meme-title">${meme.title}</p>
                                <div class="meme-stats">
                                    <div class="stat-item like-btn">
                                        <i class="fas fa-heart"></i>
                                        <span>${meme.like_count}</span>
                                    </div>
                                    <div class="stat-item upvote-btn">
                                        <i class="fas fa-arrow-up"></i>
                                        <span>${meme.upvote_count}</span>
                                    </div>
                                    <div class="stat-item share-btn">
                                        <i class="fas fa-retweet"></i>
                                        <span>${meme.share_count}</span>
                                    </div>
                                    <div class="stat-item download-btn">
                                        <i class="fas fa-download"></i>
                                        <span>${meme.download_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    // Add event listeners
                    card.addEventListener("click", () => {
                        modalImage.src = meme.filename;
                        modalTitle.textContent = meme.title;
                        modalLikes.textContent = meme.like_count;
                        modalUpvotes.textContent = meme.upvote_count;
                        modalShares.textContent = meme.share_count;
                        modalDownloads.textContent = meme.download_count;
                        memeModal.classList.add("is-active");
                    });

                    const likeBtn = card.querySelector(".like-btn");
                    likeBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        meme.like_count++;
                        likeBtn.querySelector("span").textContent = meme.like_count;

                        // Create reaction animation
                        const heart = document.createElement("i");
                        heart.className = "fas fa-heart reaction";
                        heart.style.position = "absolute";
                        heart.style.color = "#e63946";
                        heart.style.fontSize = "2rem";
                        heart.style.pointerEvents = "none";
                        heart.style.left = `${e.clientX}px`;
                        heart.style.top = `${e.clientY}px`;
                        document.body.appendChild(heart);

                        // Animate
                        const animation = heart.animate([
                            { transform: 'translateY(0)', opacity: 1 },
                            { transform: 'translateY(-100px)', opacity: 0 }
                        ], {
                            duration: 1000,
                            easing: 'ease-out'
                        });

                        animation.onfinish = () => heart.remove();
                    });

                    container.appendChild(card);
                });
                
                // Show/hide load more button
                if (filtered.length > visibleMemes) {
                    loadMoreBtn.style.display = "block";
                } else {
                    loadMoreBtn.style.display = "none";
                }
            }

            // Initial render
            renderMemes();

            // Load more memes
            loadMoreBtn.addEventListener("click", () => {
                visibleMemes += memesPerLoad;
                renderMemes(showingMyPosts);
                // Scroll to show new memes
                setTimeout(() => {
                    loadMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            });

            // Modal close functionality
            document.querySelectorAll(".modal-close, .modal-background").forEach(el => {
                el.addEventListener("click", () => {
                    document.querySelectorAll(".modal").forEach(modal => {
                        modal.classList.remove("is-active");
                    });
                });
            });

            // Auth modal tabs
            authTabs.forEach(tab => {
                tab.addEventListener("click", () => {
                    // Remove active class from all tabs
                    authTabs.forEach(t => t.classList.remove("active"));
                    
                    // Add active class to clicked tab
                    tab.classList.add("active");
                    
                    // Show the corresponding form
                    const tabId = tab.getAttribute("data-tab");
                    loginForm.classList.toggle("active", tabId === "login");
                    signupForm.classList.toggle("active", tabId === "signup");
                });
            });

            // Login button functionality
            loginBtn.addEventListener("click", () => {
                authModal.classList.add("is-active");
            });

            // Login functionality
            loginBtnForm.addEventListener("click", () => {
                const email = document.getElementById("loginEmail").value;
                const password = document.getElementById("loginPassword").value;
                
                if (!email || !password) {
                    showNotification("Please fill in all fields", "warning");
                    return;
                }
                
                loggedInUser = "userA";
                authModal.classList.remove("is-active");
                uploadNotice.style.display = "none";
                
                // Update UI
                loginBtn.style.display = "none";
                profileBtn.style.display = "flex";
                
                showNotification("Successfully logged in", "success");
            });

            // Signup functionality
            signupBtnForm.addEventListener("click", () => {
                const name = document.getElementById("signupName").value;
                const email = document.getElementById("signupEmail").value;
                const password = document.getElementById("signupPassword").value;
                const confirm = document.getElementById("signupConfirm").value;
                
                if (!name || !email || !password || !confirm) {
                    showNotification("Please fill in all fields", "warning");
                    return;
                }
                
                if (password !== confirm) {
                    showNotification("Passwords do not match", "warning");
                    return;
                }
                
                loggedInUser = "newUser";
                authModal.classList.remove("is-active");
                uploadNotice.style.display = "none";
                
                // Update UI
                loginBtn.style.display = "none";
                profileBtn.style.display = "flex";
                
                showNotification("Account created successfully! Welcome to ZedMemes", "success");
            });

            // Logout functionality
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                loggedInUser = null;
                
                // Update UI
                loginBtn.style.display = "flex";
                profileBtn.style.display = "none";
                dropdown.classList.remove("active");
                
                // If showing My Posts, switch back to all memes
                if(showingMyPosts) {
                    renderMemes(false);
                }
                
                showNotification("Successfully logged out", "info");
            });

            // My Posts functionality
            myPostsBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (!loggedInUser) {
                    showNotification("Please login to view your posts", "warning");
                    return;
                }
                renderMemes(true);
                dropdown.classList.remove("active");
            });

            // Profile dropdown toggle
            profileBtn.addEventListener("click", () => {
                dropdown.classList.toggle("active");
            });

            // Close dropdown when clicking outside
            document.addEventListener("click", (e) => {
                if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove("active");
                }
            });

            // Upload button functionality
            uploadBtn.forEach(btn => {
                btn.addEventListener("click", () => {
                    if (!loggedInUser) {
                        uploadNotice.style.display = "block";
                        showNotification("Please login to upload memes", "warning");
                        return;
                    }
                    uploadModal.classList.add("is-active");
                });
            });

            // File input change handler
            memeFileInput.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    fileNameSpan.textContent = file.name;
                    
                    // Show preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                } else {
                    fileNameSpan.textContent = 'No file selected';
                    imagePreview.style.display = 'none';
                }
            });

            // Submit meme functionality
            submitMemeBtn.addEventListener('click', function() {
                const title = document.getElementById('memeTitle').value;
                const category = document.getElementById('memeCategory').value;
                const file = memeFileInput.files[0];
                
                if (!title) {
                    showNotification("Please enter a title for your meme", "warning");
                    return;
                }
                
                if (!file) {
                    showNotification("Please select an image file", "warning");
                    return;
                }
                
                // Simulate upload process
                showNotification("Meme uploaded successfully!", "success");
                
                // Close modal after delay
                setTimeout(() => {
                    uploadModal.classList.remove("is-active");
                    
                    // Reset form
                    document.getElementById('memeTitle').value = '';
                    document.getElementById('memeCategory').value = 'Funny';
                    memeFileInput.value = '';
                    fileNameSpan.textContent = 'No file selected';
                    imagePreview.style.display = 'none';
                }, 1500);
            });

            // Notification function
            function showNotification(message, type) {
                const notification = document.createElement("div");
                notification.className = `notification ${type}`;
                notification.innerHTML = message;
                document.body.appendChild(notification);
                
                // Position notification
                notification.style.position = "fixed";
                notification.style.top = "80px";
                notification.style.right = "20px";
                notification.style.padding = "1rem 1.5rem";
                notification.style.zIndex = "1000";
                
                // Add show class to trigger animation
                setTimeout(() => {
                    notification.classList.add("show");
                }, 10);
                
                // Auto remove after 3 seconds
                setTimeout(() => {
                    notification.classList.remove("show");
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            }
        });
    