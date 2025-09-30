function fillForm(data) {
    Object.keys(data).forEach(key => {
        const value = data[key];

        // Find all matching inputs/selects/checkboxes/radios by name or id
        const elements = document.querySelectorAll(`[name='${key}'], #${key}`);
        elements.forEach(el => {
            if (!el) return;

            if (el.tagName.toLowerCase() === "textarea" || el.tagName.toLowerCase() === "input" && el.type !== "checkbox" && el.type !== "radio" && el.type !== "file") {
                el.value = value;

            } else if (el.tagName.toLowerCase() === "select") {
                el.value = value;

            } else if (el.type === "radio") {
                const radios = document.querySelectorAll(`input[type="radio"][name='${key}']`);
                radios.forEach(r => r.checked = (r.value === value));

            } else if (el.type === "checkbox") {
                // value can be array or single
                if (Array.isArray(value)) {
                    el.checked = value.includes(el.value);
                } else {
                    el.checked = (el.value === value || value === true);
                }
            }
        });
    });

    // console.log("✅ Form autofilled with data:", data);
}


function getFormData() {
    let data = {};

    // Handle inputs, textareas, and selects
    document.querySelectorAll("input, textarea, select").forEach(el => {
        let key = el.name || el.id || el.type || `field_${Math.random().toString(36).substring(7)}`;
        let fieldType = "text";
        let fieldValue = null;
        let options = null;
        // Get the label text for this element
        let labelText = getLabelText(el);

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

                    // Add accessibility info for group
                    let sample = group[0];
                    let hasLabel = checkHasLabel(sample);
                    let hasAutocomplete = sample.hasAttribute("autocomplete");
                    let labelTextGroup = getLabelText(sample);

                    data[el.name] = {
                        type: "checkbox-group",
                        value: selected,
                        options: options,
                        hasLabel: hasLabel,
                        hasAutocomplete: hasAutocomplete,
                        isRequired: sample.required || false,
                        label: labelTextGroup
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

                // Add accessibility info for group
                let sample = group[0];
                let hasLabel = checkHasLabel(sample);
                let hasAutocomplete = sample.hasAttribute("autocomplete");
                let labelTextGroup = getLabelText(sample);

                data[el.name] = {
                    type: "radio-group",
                    value: fieldValue,
                    options: options,
                    hasLabel: hasLabel,
                    hasAutocomplete: hasAutocomplete,
                    label: labelTextGroup
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

        // ----------------------------
        // Accessibility checks
        // ----------------------------
        let hasLabel = checkHasLabel(el);
        let hasAutocomplete = el.hasAttribute("autocomplete");

        // Store result
        data[key] = {
            type: fieldType,
            value: fieldValue,
            ...(options ? { options: options } : {}),
            hasLabel: hasLabel,
            hasAutocomplete: hasAutocomplete,
            isRequired: el.required || false,
            label: labelText
        };
    });

    // console.log("📝 Collected form data with types + options:", data);
    return data;
}


// Helper: check if input has label
function checkHasLabel(el) {
    let hasLabel = false;
    if (el.id) {
        const label = document.querySelector(`label[for='${el.id}']`);
        if (label) hasLabel = true;
    }
    if (!hasLabel && el.closest("label")) {
        hasLabel = true;
    }
    return hasLabel;
}

// Helper: get the label text for an input element
function getLabelText(el) {
    let label = null;
    if (el.id) {
        label = document.querySelector(`label[for='${el.id}']`);
        if (label) return label.innerText.trim();
    }
    // If wrapped in a <label>
    let parentLabel = el.closest("label");
    if (parentLabel) return parentLabel.innerText.trim();
    // Try aria-labelledby
    if (el.hasAttribute("aria-labelledby")) {
        let ids = el.getAttribute("aria-labelledby").split(" ");
        let texts = ids.map(id => {
            let node = document.getElementById(id);
            return node ? node.innerText.trim() : "";
        });
        return texts.join(" ").trim();
    }
    return null;
}

// Listen for messages from popup.js

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // console.log("📩 Message received in content.js:", msg);

    if (msg.action === "collectFormData") {
        let formData = getFormData();
        // console.log("📤 Sending collected data back:", formData);
        sendResponse(formData);

    } else if (msg.action === "autofillForm") {
        fillForm(msg.data);  // your autofill function
        // console.log("✅ Form autofilled with data:", msg.data);
        sendResponse({status: "success"});
    }
});
