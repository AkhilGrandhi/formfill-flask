function getFormData() {
    let data = {};

    // Handle inputs, textareas, and selects
    document.querySelectorAll("input, textarea, select").forEach(el => {
        let key = el.name || el.id || el.type || `field_${Math.random().toString(36).substring(7)}`;
        let fieldType = "text";
        let fieldValue = null;
        let options = null;

        // ----------------------------
        // Handle <textarea>
        // ----------------------------
        if (el.tagName.toLowerCase() === "textarea") {
            fieldType = "paragraph";
            fieldValue = el.value;

        // ----------------------------
        // Handle <select> dropdown
        // ----------------------------
        } else if (el.tagName.toLowerCase() === "select") {
            fieldType = "dropdown";
            fieldValue = el.value;
            options = Array.from(el.options).map(opt => opt.value);

        // ----------------------------
        // Handle checkboxes
        // ----------------------------
        } else if (el.type === "checkbox") {
            fieldType = "checkbox";

            // If multiple checkboxes share the same name, treat as group
            if (el.name) {
                if (!data[el.name]) {
                    let group = document.querySelectorAll(`input[type="checkbox"][name="${el.name}"]`);
                    let selected = Array.from(group).filter(c => c.checked).map(c => c.value);
                    options = Array.from(group).map(c => c.value);

                    data[el.name] = {
                        type: "checkbox-group",
                        value: selected,
                        options: options
                    };
                }
                return; // Skip duplicate entries
            } else {
                fieldValue = el.checked;
            }

        // ----------------------------
        // Handle radio buttons
        // ----------------------------
        } else if (el.type === "radio") {
            fieldType = "radio";

            if (el.name && !data[el.name]) {
                let group = document.querySelectorAll(`input[type="radio"][name="${el.name}"]`);
                options = Array.from(group).map(r => r.value);
                let selected = Array.from(group).find(r => r.checked);
                fieldValue = selected ? selected.value : null;

                data[el.name] = {
                    type: "radio-group",
                    value: fieldValue,
                    options: options
                };
            }
            return; // Skip duplicate radios

        // ----------------------------
        // Handle numbers, dates, times, emails, urls, files
        // ----------------------------
        } else if (el.type === "number") {
            fieldType = "number";
            fieldValue = el.value;

        } else if (el.type === "date") {
            fieldType = "date";
            fieldValue = el.value;

        } else if (el.type === "datetime-local" || el.type === "time") {
            fieldType = "time";
            fieldValue = el.value;

        } else if (el.type === "email") {
            fieldType = "email";
            fieldValue = el.value;

        } else if (el.type === "url") {
            fieldType = "url";
            fieldValue = el.value;

        } else if (el.type === "file") {
            fieldType = "file";
            fieldValue = el.value;

        // ----------------------------
        // Default text input
        // ----------------------------
        } else {
            fieldType = "text";
            fieldValue = el.value;
        }

        // Store result
        data[key] = {
            type: fieldType,
            value: fieldValue,
            ...(options ? { options: options } : {})
        };
    });

    console.log("📝 Collected form data with types + options:", data);
    return data;
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📩 Message received in content.js:", msg);

    if (msg.action === "collectFormData") {
        let formData = getFormData();
        console.log("📤 Sending collected data back:", formData);
        sendResponse(formData);
    }
});

//Working*********************************************************************************8

// function getFormData() {
//     let data = {};
//     document.querySelectorAll("input, textarea, select").forEach(el => {
//         let key = el.name || el.id || el.type || `field_${Math.random().toString(36).substring(7)}`;
//         if (el.type === "checkbox" || el.type === "radio") {
//             data[key] = el.checked;
//         } else {
//             data[key] = el.value;
//         }
//     });
//     console.log("📝 Collected form data:", data);
//     return data;
// }

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//     console.log("📩 Message received in content.js:", msg);

//     if (msg.action === "collectFormData") {
//         let formData = getFormData();
//         console.log("📤 Sending collected data back:", formData);
//         sendResponse(formData);
//     }
// });
