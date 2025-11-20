document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic info
        const title = document.createElement("h4");
        title.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const sched = document.createElement("p");
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const avail = document.createElement("p");
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants section (bulleted list)
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const participantsTitle = document.createElement("p");
        participantsTitle.innerHTML = "<strong>Participants</strong>";
        participantsDiv.appendChild(participantsTitle);

        const ul = document.createElement("ul");
        if (!Array.isArray(details.participants) || details.participants.length === 0) {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "No participants yet";
          ul.appendChild(li);
        } else {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            // Container for email and delete icon
            const span = document.createElement("span");
            span.textContent = email;
            span.className = "participant-email";

            // Delete icon (using Unicode for simplicity)
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = "Remove participant";
            deleteBtn.innerHTML = "\u2716"; // Unicode heavy multiplication X
            deleteBtn.onclick = async (e) => {
              e.stopPropagation();
              // Call API to unregister participant
              try {
                const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                  method: "POST",
                });
                if (response.ok) {
                  // Refresh activities list
                  fetchActivities();
                } else {
                  alert("Failed to remove participant.");
                }
              } catch (err) {
                alert("Error removing participant.");
              }
            };

            li.appendChild(span);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });
        }
        participantsDiv.appendChild(ul);

        // Append all parts to the card
        activityCard.appendChild(title);
        activityCard.appendChild(desc);
        activityCard.appendChild(sched);
        activityCard.appendChild(avail);
        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities list so new participant appears
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
