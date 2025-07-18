document.addEventListener('DOMContentLoaded', () => {



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
    //const homeBtn = document.querySelector(".navbar-item img"); 
    let showingMyPosts = false;
    let visibleMemes = 6; // Initial number of memes to show
    const memesPerLoad = 6; // Number of memes to load each time

    

    const memes = []; // This will hold the memes fetched from the backend


    // check if user is in storage
    fetch("api/auth/auth.php", {
        credentials: 'include'
    })
    .then(res=> res.json())
    .then(data =>{
        console.log(data);
        loggedInUser = data.user;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', loggedInUser);
        authModal.classList.remove("is-active");
        uploadNotice.style.display = "none";
        loginBtn.style.display = "none";
        profileBtn.style.display = "flex";
    })

    
    


    fetch("api/memes/list.php")
        .then(res => res.json())
        .then(memes => {
            if (memes.success) {
                renderMemes(false, memes.memes);
            }
        })
        .catch(err => {
            console.error("Could not fetch memes from backend:", err);
        });
    // Mobile navbar toggle
    if (navbarBurger) {
        navbarBurger.addEventListener('click', () => {
            navbarBurger.classList.toggle('is-active');
            navbarMenu.classList.toggle('is-active');
        });
    }

    const homeBtn = document.getElementById('homeBtn');
    
    homeBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        
        // Reset view state
        showingMyPosts = false;
        visibleMemes = 6; // Reset to initial load amount
        
        // Update section title
        document.querySelector(".section-title").textContent = "Trending Memes";
        
        // Close mobile menu if open
        if (navbarBurger && navbarMenu) {
            navbarBurger.classList.remove('is-active');
            navbarMenu.classList.remove('is-active');
        }
        
        // Close profile dropdown if open
        if (dropdown) {
            dropdown.classList.remove("active");
        }
        
        // Fetch and render all memes
        fetchAllMemes();
    });

    // Create a reusable function for fetching all memes
    function fetchAllMemes() {
        // Show loading state (optional)
        container.innerHTML = `
            <div class="column is-12 has-text-centered" style="padding: 3rem;">
                <div class="spinner"></div>
                <p>Loading memes...</p>
            </div>
        `;

        fetch("api/memes/list.php")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderMemes(false, data.memes);
                } else {
                    container.innerHTML = `
                        <div class="column is-12 has-text-centered" style="padding: 3rem;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
                            <h3 class="title is-3">Error Loading Memes</h3>
                            <p>${data.message || 'Something went wrong'}</p>
                        </div>
                    `;
                }
            })
            .catch(err => {
                console.error("Could not fetch memes from backend:", err);
                container.innerHTML = `
                    <div class="column is-12 has-text-centered" style="padding: 3rem;">
                        <i class="fas fa-wifi" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
                        <h3 class="title is-3">Connection Error</h3>
                        <p>Could not load memes. Please check your connection and try again.</p>
                        <button class="button is-primary" onclick="fetchAllMemes()">Retry</button>
                    </div>
                `;
            });
    }

    // Make fetchAllMemes available globally for the retry button
    window.fetchAllMemes = fetchAllMemes;

    // Render memes function

    function getFriendlyDate(timestamp) {
    const memeDate = new Date(timestamp.replace(' ', 'T')); // Force ISO
    const now = new Date();
    const diffMs = now - memeDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    // For older dates, show exact date
    return memeDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const deleteMeme = (meme_id) => {
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'delete-modal';

    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'delete-modal-content';

    // Create confirmation message
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to delete this meme?';

    // Create confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmDeleteBtn';
    confirmBtn.className = 'btn delete-btn-danger';
    confirmBtn.textContent = 'Yes, Delete';

    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelDeleteBtn';
    cancelBtn.className = 'btn delete-btn-cancel';
    cancelBtn.textContent = 'Cancel';

    // Assemble the modal
    modalContent.appendChild(message);
    modalContent.appendChild(confirmBtn);
    modalContent.appendChild(cancelBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Confirm button event listener
    confirmBtn.addEventListener("click", () => {
        fetch("api/memes/delete.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meme_id }),
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification("Meme deleted successfully");
                const memeCard = document.querySelector(`.meme-card[data-id="${meme_id}"]`);
                if (memeCard) {
                    memeCard.remove();
                }
                fetchAllMemes();
            } else {
                showNotification("Failed to delete meme");
            }
            closeModal();
        })
        .catch(error => {
            console.error("Delete error:", error);
            showNotification("Failed to delete meme", "danger");
            closeModal();
        });
    });

    // Cancel button event listener
    cancelBtn.addEventListener("click", closeModal);

    function closeModal() {
        const modal = document.getElementById("confirmModal");
        if (modal) {
            modal.remove();
        }
    }
}


const editMeme = (meme_id) => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.className = 'edit-modal';


    // Modal inner content
    const modalContent = document.createElement('div');
    modalContent.className = 'edit-modal-content';

    // Title message
    const message = document.createElement('p');
    message.textContent = 'Edit meme title?';
    message.style.fontWeight = 'bold';
    message.style.fontSize = '18px';

    // Input field
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter new title';
    input.style.padding = '10px';
    input.style.marginTop = '10px';
    input.style.width = '250px';
    input.style.borderRadius = '5px';
    input.style.border = '1px solid #ccc';

    // Button container
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.justifyContent = 'space-between';
    btnContainer.style.marginTop = '20px';
    btnContainer.style.gap = '10px';

    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmEditBtn';
    confirmBtn.textContent = 'Save';
    confirmBtn.style.flex = '1';
    confirmBtn.style.padding = '10px';
    confirmBtn.style.backgroundColor = '#4CAF50';
    confirmBtn.style.color = 'white';
    confirmBtn.style.border = 'none';
    confirmBtn.style.borderRadius = '5px';
    confirmBtn.style.cursor = 'pointer';

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelEditBtn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.flex = '1';
    cancelBtn.style.padding = '10px';
    cancelBtn.style.backgroundColor = '#f44336';
    cancelBtn.style.color = 'white';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '5px';
    cancelBtn.style.cursor = 'pointer';

    // Assemble
    btnContainer.appendChild(confirmBtn);
    btnContainer.appendChild(cancelBtn);
    modalContent.appendChild(message);
    modalContent.appendChild(input);
    modalContent.appendChild(btnContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Event handlers
    confirmBtn.addEventListener("click", () => {
        fetch("api/memes/edit.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ meme_id, title: input.value }),
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification("Meme updated successfully");
                fetchAllMemes();
            } else {
                showNotification("Failed to update meme");
            }
            closeModal();
        })
        .catch(error => {
            console.error("Edit error:", error);
            showNotification("Failed to update meme", "danger");
            closeModal();
        });
    });

    cancelBtn.addEventListener("click", closeModal);

    function closeModal() {
        const modal = document.getElementById("editModal");
        if (modal) {
            modal.remove();
        }
    }
};




    
function renderMemes(filterByUser = false, memesList = []) {
    container.innerHTML = "";
    showingMyPosts = filterByUser;

    const filtered = filterByUser && loggedInUser
        ? memesList.filter((m) => m.postedBy === loggedInUser)
        : memesList;

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

    const memesToShow = filtered.slice(0, visibleMemes);

    memesToShow.forEach((meme) => {
        const card = document.createElement("div");
        card.className = "column is-4-desktop is-6-tablet is-12-mobile meme-column";
        const uploadDate = getFriendlyDate(meme.timestamp);
const uploader = ` ${meme.username}`;

card.innerHTML = `
    <div class="meme-card">
        <div class="card-image">
            <figure class="image">
                <img src="${meme.filename}" alt="${meme.title}" class="meme-img">
            </figure>
        </div>
        <div class="meme-content">
            <p class="meme-title">${meme.title}</p> <div> ${meme.username == loggedInUser ? '<div class="stat-item edit-btn"><i class="fas fa-edit"></i></div>' : ''}</div>
            <p class="meme-meta">Posted by ${uploader} - ${uploadDate}</p>
            <div class="meme-stats">
                <div class="stat-item like-btn ${meme.user_liked ? 'has-text-danger' : ''}">
                    <i class="fas fa-heart"></i>
                    <span>${meme.like_count}</span>
                </div>
                <div class="stat-item upvote-btn ${meme.user_upvoted ? 'has-text-warning' : ''}">
                    <i class="fas fa-arrow-up"></i>
                    <span>${meme.upvote_count}</span>
                </div>
                <div class="stat-item share-btn">
                    <i class="fas fa-retweet"></i>
                    <span>${meme.share_count}</span>
                </div>
                <div">
                    ${meme.username == loggedInUser ? '<div class="stat-item delete-btn"><i class="fas fa-trash"></i></div>' : ''}
                </div>
                <div class="stat-item download-btn">
                    <i class="fas fa-download"></i>
                    <span>${meme.download_count}</span>
                </div>
            </div>
        </div>
    </div>
`;


        // Track user's current reaction state for this meme
        let userLiked = meme.user_liked || false;
        let userUpvoted = meme.user_upvoted || false;

        card.addEventListener("click", () => {
            modalImage.src = meme.filename;
            modalTitle.textContent = meme.title;
            modalLikes.textContent = meme.like_count;
            modalUpvotes.textContent = meme.upvote_count;
            modalShares.textContent = meme.share_count;
            modalDownloads.textContent = meme.download_count;
            memeModal.classList.add("is-active");
        });

        // LIKE BUTTON
        const likeBtn = card.querySelector(".like-btn");
        const likeSpan = likeBtn.querySelector("span");

        // DELETE BUTTON
        const deleteBtn = card.querySelector(".delete-btn")
        if (deleteBtn) {
            deleteBtn.addEventListener("click", function(e) {
                e.stopPropagation();
                deleteMeme(meme.meme_id);
            });
        }

        // EDIT BUTTON
        const editBtn = card.querySelector(".edit-btn")
        if(editBtn){
            editBtn.addEventListener("click", function(e){
                e.stopPropagation();
                editMeme(meme.meme_id);
            })
        }

        likeBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            
            if (!loggedInUser) {
                showNotification("Please login to react", "warning");
                return;
            }

            // Prevent multiple clicks during API call
            if (likeBtn.classList.contains('processing')) return;
            likeBtn.classList.add('processing');

            try {
                let apiCalls = [];

                if (userLiked) {
                    // User is removing their like
                    apiCalls.push(
                        fetch("api/reactions/react.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ meme_id: meme.meme_id, type: "RemoveLike" })
                        })
                    );
                    
                    // Update UI immediately
                    userLiked = false;
                    meme.like_count--;
                    likeSpan.textContent = meme.like_count;
                    likeBtn.classList.remove("has-text-danger");
                    
                } else {
                    // User is adding a like
                    // First, if they had upvoted, remove the upvote
                    if (userUpvoted) {
                        apiCalls.push(
                            fetch("api/reactions/react.php", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ meme_id: meme.meme_id, type: "RemoveUpvote" })
                            })
                        );
                        
                        // Update upvote UI
                        userUpvoted = false;
                        meme.upvote_count--;
                        card.querySelector(".upvote-btn span").textContent = meme.upvote_count;
                        card.querySelector(".upvote-btn").classList.remove("has-text-warning");
                    }

                    // Add the like
                    apiCalls.push(
                        fetch("api/reactions/react.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ meme_id: meme.meme_id, type: "Like" })
                        })
                    );

                    // Update like UI
                    userLiked = true;
                    meme.like_count++;
                    likeSpan.textContent = meme.like_count;
                    likeBtn.classList.add("has-text-danger");

                    // Heart Animation
                    const heart = document.createElement("i");
                    heart.className = "fas fa-heart reaction";
                    heart.style.position = "absolute";
                    heart.style.color = "#e63946";
                    heart.style.fontSize = "2rem";
                    heart.style.pointerEvents = "none";
                    heart.style.left = `${e.clientX}px`;
                    heart.style.top = `${e.clientY}px`;
                    heart.style.zIndex = "9999";
                    document.body.appendChild(heart);
                    
                    const animation = heart.animate(
                        [{ transform: 'translateY(0) scale(1)', opacity: 1 }, 
                         { transform: 'translateY(-100px) scale(1.5)', opacity: 0 }],
                        { duration: 1000, easing: 'ease-out' }
                    );
                    animation.onfinish = () => heart.remove();
                }

                // Execute all API calls
                await Promise.all(apiCalls);

            } catch (error) {
                console.error("Error updating like:", error);
                showNotification("Failed to update reaction", "danger");
                
                // Revert UI changes on error
                if (userLiked) {
                    userLiked = false;
                    meme.like_count--;
                    likeSpan.textContent = meme.like_count;
                    likeBtn.classList.remove("has-text-danger");
                } else {
                    userLiked = true;
                    meme.like_count++;
                    likeSpan.textContent = meme.like_count;
                    likeBtn.classList.add("has-text-danger");
                }
            } finally {
                likeBtn.classList.remove('processing');
            }
        });

        // UPVOTE BUTTON
        const upvoteBtn = card.querySelector(".upvote-btn");
        const upvoteSpan = upvoteBtn.querySelector("span");

        upvoteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            
            if (!loggedInUser) {
                showNotification("Please login to react", "warning");
                return;
            }

            // Prevent multiple clicks during API call
            if (upvoteBtn.classList.contains('processing')) return;
            upvoteBtn.classList.add('processing');

            try {
                let apiCalls = [];

                if (userUpvoted) {
                    // User is removing their upvote
                    apiCalls.push(
                        fetch("api/reactions/react.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ meme_id: meme.meme_id, type: "RemoveUpvote" })
                        })
                    );
                    
                    // Update UI immediately
                    userUpvoted = false;
                    meme.upvote_count--;
                    upvoteSpan.textContent = meme.upvote_count;
                    upvoteBtn.classList.remove("has-text-warning");
                    
                } else {
                    // User is adding an upvote
                    // First, if they had liked, remove the like
                    if (userLiked) {
                        apiCalls.push(
                            fetch("api/reactions/react.php", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ meme_id: meme.meme_id, type: "RemoveLike" })
                            })
                        );
                        
                        // Update like UI
                        userLiked = false;
                        meme.like_count--;
                        likeSpan.textContent = meme.like_count;
                        likeBtn.classList.remove("has-text-danger");
                    }

                    // Add the upvote
                    apiCalls.push(
                        fetch("api/reactions/react.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ meme_id: meme.meme_id, type: "Upvote" })
                        })
                    );

                    // Update upvote UI
                    userUpvoted = true;
                    meme.upvote_count++;
                    upvoteSpan.textContent = meme.upvote_count;
                    upvoteBtn.classList.add("has-text-warning");
                }

                // Execute all API calls
                await Promise.all(apiCalls);

            } catch (error) {
                console.error("Error updating upvote:", error);
                showNotification("Failed to update reaction", "danger");
                
                // Revert UI changes on error
                if (userUpvoted) {
                    userUpvoted = false;
                    meme.upvote_count--;
                    upvoteSpan.textContent = meme.upvote_count;
                    upvoteBtn.classList.remove("has-text-warning");
                } else {
                    userUpvoted = true;
                    meme.upvote_count++;
                    upvoteSpan.textContent = meme.upvote_count;
                    upvoteBtn.classList.add("has-text-warning");
                }
            } finally {
                upvoteBtn.classList.remove('processing');
            }
        });

        // SHARE BUTTON (can be used multiple times)
        const shareBtn = card.querySelector(".share-btn");
        shareBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            
            // Prevent multiple rapid clicks
            if (shareBtn.classList.contains('processing')) return;
            shareBtn.classList.add('processing');

            try {
                // Update count immediately for better UX
                meme.share_count++;
                shareBtn.querySelector("span").textContent = meme.share_count;

                // Send to backend
                await fetch("api/reactions/share.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ meme_id: meme.meme_id, type: "Share" })
                });

                // Attempt to share
                if (navigator.share) {
                    await navigator.share({
                        title: meme.title,
                        text: "Check out this meme!",
                        url: window.location.origin + "/" + meme.filename
                    });
                } else {
                    await navigator.clipboard.writeText(window.location.origin + "/" + meme.filename);
                    showNotification("Link copied to clipboard!", "success");
                }

            } catch (error) {
                console.error("Share error:", error);
                // Revert count on error
                meme.share_count--;
                shareBtn.querySelector("span").textContent = meme.share_count;
                
                if (error.name !== 'AbortError') { // Don't show error if user cancelled share dialog
                    showNotification("Failed to share", "warning");
                }
            } finally {
                shareBtn.classList.remove('processing');
            }
        });

        // DOWNLOAD BUTTON (can be used multiple times)
        const downloadBtn = card.querySelector(".download-btn");
        downloadBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            
            // Prevent multiple rapid clicks
            if (downloadBtn.classList.contains('processing')) return;
            downloadBtn.classList.add('processing');

            try {
                // Update count immediately for better UX
                meme.download_count++;
                downloadBtn.querySelector("span").textContent = meme.download_count;

                // Send to backend
                await fetch("api/reactions/download.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ meme_id: meme.meme_id, type: "Download" })
                });

                // Download the file
                const response = await fetch(meme.filename);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = meme.title.replace(/\s+/g, "_") + ".jpg";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showNotification("Download started!", "success");

            } catch (error) {
                console.error("Download error:", error);
                // Revert count on error
                meme.download_count--;
                downloadBtn.querySelector("span").textContent = meme.download_count;
                showNotification("Download failed", "danger");
            } finally {
                downloadBtn.classList.remove('processing');
            }
        });

        container.appendChild(card);
    });

    loadMoreBtn.style.display = filtered.length > visibleMemes ? "block" : "none";
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

        fetch("api/auth/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    loggedInUser = data.username;
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('username', loggedInUser);
                    authModal.classList.remove("is-active");
                    uploadNotice.style.display = "none";
                    loginBtn.style.display = "none";
                    profileBtn.style.display = "flex";
                    showNotification("Successfully logged in", "success");
                } else {
                    showNotification(data.message || "Invalid credentials", "warning");
                }
            });
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

        fetch("api/auth/signup.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: name, email, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    loggedInUser = name;
                    authModal.classList.remove("is-active");
                    uploadNotice.style.display = "none";
                    loginBtn.style.display = "none";
                    profileBtn.style.display = "flex";
                    showNotification("Account created successfully!", "success");
                } else {
                    showNotification(data.message || "Signup failed", "warning");
                }
            });
    });

    // Logout functionality
    logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    fetch("api/auth/logout.php", {
        method: "POST",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loggedInUser = null;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            loginBtn.style.display = "flex";
            profileBtn.style.display = "none";
            dropdown.classList.remove("active");

            // Mimic the Home button behavior
            showingMyPosts = false;
            visibleMemes = 6;
            document.querySelector(".section-title").textContent = "Trending Memes";

            if (navbarBurger && navbarMenu) {
                navbarBurger.classList.remove('is-active');
                navbarMenu.classList.remove('is-active');
            }

            fetchAllMemes();

            showNotification("Successfully logged out", "info");
        } else {
            showNotification("Failed to logout", "warning");
        }
    })
    .catch(err => {
        console.error("Logout failed:", err);
        showNotification("Logout error occurred", "danger");
    });
});




    // My Posts functionality
    myPostsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!loggedInUser) {
            showNotification("Please login to view your posts", "warning");
            return;
        }

        fetch("api/memes/user_memes.php", {
            method: "POST",
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderMemes(false, data.memes);
                    dropdown.classList.remove("active");
                } else {
                    showNotification(data.message || "Could not fetch your memes.", "warning");
                }
            });
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
    memeFileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;

            // Show preview
            const reader = new FileReader();
            reader.onload = function (e) {
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
   submitMemeBtn.addEventListener('click', function () {
    const title = document.getElementById('memeTitle').value;
    // const category = document.getElementById('memeCategory').value; 
    const file = memeFileInput.files[0];

    if (!title) {
        showNotification("Please enter a title for your meme", "warning");
        return;
    }

    if (!file) {
        showNotification("Please select an image file", "warning");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    //formData.append('category', category);
    formData.append('meme', file);

    fetch("api/memes/upload.php", {
        method: "POST",
        body: formData,
        credentials: "include"  // Important! Keep session cookies for user_id.
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification("Meme uploaded successfully!", "success");
            fetchAllMemes();
            uploadModal.classList.remove("is-active");

            // Reset form
            //document.getElementById('memeCategory').value = 'Funny';
            memeFileInput.value = '';
            fileNameSpan.textContent = 'No file selected';
            imagePreview.style.display = 'none';
            document.getElementById('memeTitle').value = '';

            // Optionally refresh memes
            // fetchAndRenderMemes();
        } else {
            showNotification(data.message || "Upload failed", "warning");
        }
    })
    .catch(err => {
        console.error(err);
        showNotification("Upload error.", "danger");
    });
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
