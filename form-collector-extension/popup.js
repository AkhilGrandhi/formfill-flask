document.getElementById("submitBtn").addEventListener("click", () => {
    console.log("🚀 Submit button clicked");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("📌 Current tab:", tabs);

        chrome.tabs.sendMessage(tabs[0].id, { action: "collectFormData" }, (response) => {
            console.log("📥 Response from content.js:", response);

            if (response) {
                document.getElementById("output").textContent = JSON.stringify(response, null, 2);

                console.log("📡 Sending data to Flask backend:", response);

                fetch("http://127.0.0.1:5000/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(response)
                })
                .then(res => {
                    console.log("✅ Flask responded with status:", res.status);
                    return res.json();
                })
                .then(data => console.log("📥 Flask JSON response:", data))
                .catch(err => console.error("❌ Fetch error:", err));
            } else {
                console.warn("⚠️ No response received from content.js");
            }
        });
    });
});


document.getElementById("fillBtn").addEventListener("click", () => {
    console.log("🚀 Fill Form button clicked");

    // Fetch sample data from Flask backend
    fetch("http://127.0.0.1:5000/sample-data")
        .then(res => res.json())
        .then(sampleData => {
            console.log("📥 Received sample data from Flask:", sampleData);

            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "autofillForm", data: sampleData },
                    response => {
                        console.log("📤 Autofill response:", response);
                    }
                );
            });
        })
        .catch(err => console.error("❌ Error fetching sample data:", err));
});

// document.getElementById("fillBtn").addEventListener("click", () => {
//     const sampleData = {
//     fullName: "John Doe",
//     email: "johndoe@example.com",
//     phone: "+1234567890",
//     address: "123 Main St, Springfield, IL 62701",
//     website: "https://johndoeportfolio.com",
//     birthdate: "1985-07-15",
//     meetingTime: "14:30",
//     country: "US",
//     experience: "6-10",
//     employmentType: "full-time",
//     remoteWork: "hybrid",
//     skills: ["javascript", "react"],
//     notifications: ["email", "sms"]
//     };


//     chrome.tabs.query({active: true, currentWindow: true}, tabs => {
//         chrome.tabs.sendMessage(tabs[0].id, {action: "autofillForm", data: sampleData}, response => {
//             console.log("📤 Autofill response:", response);
//         });
//     });
// });
