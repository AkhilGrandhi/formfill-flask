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

    // Step 1: Collect current form structure from the webpage
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "collectFormData" }, (formResponse) => {
            console.log("📥 Collected form structure:", formResponse);

            if (!formResponse) {
                console.warn("⚠️ No form data collected");
                return;
            }

            // Step 2: Send form structure to Flask GPT mapping endpoint
            fetch("http://127.0.0.1:5000/gpt-map", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ form: formResponse })
            })
            .then(res => res.json())
            .then(mappedData => {
                console.log("🤖 GPT mapped data:", mappedData);

                // Step 3: Send mapped data back to content.js for autofill
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "autofillForm", data: mappedData },
                    response => {
                        console.log("📤 Autofill response:", response);
                    }
                );
            })
            .catch(err => console.error("❌ Error in GPT mapping:", err));
        });
    });
});


