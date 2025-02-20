let recognition;
let isListening = false;
let capturedText = '';
let recognitionActive = false;

async function translateText(text, sourceLanguage) {
    const url = "/translate/";
    try {
        const response = await fetch(url, {
            method: "POST",  // 🔥 Ensure it's a POST request
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                source_language: sourceLanguage
            })
        });

        const data = await response.json();
        if (data.translatedText) {
            return data.translatedText;
        } else {
            console.error("Translation failed:", data);
            return null;
        }
    } catch (error) {
        console.error("Error in translation:", error);
        return null;
    }
}

document.getElementById("start-btn").addEventListener("click", () => {
    const language = document.getElementById("language-select").value;
    const micIndicator = document.getElementById("mic-indicator");
    const outputElement = document.getElementById("output");
    const stopButton = document.getElementById("stop-btn");

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.continuous = true;  // 🔥 Keeps it listening longer
    recognition.maxAlternatives = 1;

    micIndicator.classList.remove("hidden");
    stopButton.classList.remove("hidden");
    capturedText = '';
    outputElement.textContent = '';
    recognitionActive = true;

    recognition.onstart = () => {
        micIndicator.classList.remove("hidden");
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
        capturedText += transcript;
        outputElement.textContent = `You said: ${capturedText}`;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        outputElement.textContent = `Speech recognition error: ${event.error}`;
        stopListening();
    };

    recognition.onspeechend = () => {
        console.warn("Speech stopped, restarting...");
        recognition.start();  // 🔥 Restart recognition to avoid timeout
    };

    recognition.onend = () => {
        if (recognitionActive) {
            try {
                recognition.start(); // Restart if still active
            } catch (error) {
                console.error("Error restarting recognition:", error);
                outputElement.textContent = `Error restarting recognition: ${error.message}`;
            }
        } else {
            stopListening();
        }
    };

    recognition.start();
});

document.getElementById("stop-btn").addEventListener("click", async () => {
    stopListening();

    const language = document.getElementById("language-select").value;
    const outputElement = document.getElementById("output");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (capturedText.trim() !== '') {
        const languageCode = language.split("-")[0];
        try {
            const translatedText = await translateText(capturedText, languageCode);

            if (translatedText) {
                outputElement.textContent = `You said: ${capturedText}\nTranslation to English: ${translatedText}`;
            } else {
                outputElement.textContent = `You said: ${capturedText}\nTranslation failed. Please try again.`;
            }
        } catch (error) {
            console.error("Translation error:", error);
            outputElement.textContent = `Error in translation: ${error.message}`;
        }
    } else {
        outputElement.textContent = "No speech detected for translation.";
    }
});

function stopListening() {
    if (recognition) {
        recognition.stop();
    }
    recognitionActive = false;

    setTimeout(() => {
        document.getElementById("mic-indicator").classList.add("hidden");
        document.getElementById("stop-btn").classList.add("hidden");
    }, 2000);
}
