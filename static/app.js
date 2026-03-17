document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inspect-form');
    const historyList = document.getElementById('history-list');
    const totalCheckedEl = document.getElementById('total-checked');
    const threatsDetectedEl = document.getElementById('threats-detected');
    const overlay = document.getElementById('result-overlay');
    const overlayResult = document.getElementById('overlay-result');
    const overlayConf = document.getElementById('overlay-conf');
    const randomizeBtn = document.getElementById('randomize-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Chart Setup
    const ctx = document.getElementById('ids-chart').getContext('2d');
    const idsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Prediction Confidence',
                data: [],
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const updateStats = async () => {
        const res = await fetch('/stats');
        const data = await res.json();

        totalCheckedEl.textContent = data.total_checked;
        threatsDetectedEl.textContent = data.attacks_detected;

        // Update History
        historyList.innerHTML = data.history.map(item => `
            <div class="history-item ${item.result.toLowerCase()}">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <strong style="color: var(--secondary);">${item.timestamp}</strong>
                        <span class="tag ${item.result.toLowerCase()}">${item.result}</span>
                        <span style="font-size: 0.75rem; opacity: 0.5;">${item.confidence}% Confidence</span>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">Dur: ${item.features[0]}</span>
                        <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">Src: ${item.features[1]}b</span>
                        <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">Dst: ${item.features[2]}b</span>
                        <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">Cnt: ${item.features[3]}</span>
                        <span style="font-size: 0.7rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">Err: ${item.features[4]}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Update Chart
        if (data.history.length > 0) {
            const history = [...data.history].reverse();
            idsChart.data.labels = history.map(h => h.timestamp);
            idsChart.data.datasets[0].data = history.map(h => h.confidence);
            idsChart.update();
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            duration: document.getElementById('duration').value,
            src_bytes: document.getElementById('src_bytes').value,
            dst_bytes: document.getElementById('dst_bytes').value,
            count: document.getElementById('count').value,
            serror_rate: document.getElementById('serror_rate').value,
        };

        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === 'success') {
            showResult(data.prediction, data.confidence);
            updateStats();
            getAIExplanation(data.prediction, data.confidence, payload);
        }
    });

    async function getAIExplanation(prediction, confidence, features) {
        const explanationEl = document.getElementById('ai-explanation');
        const cardEl = explanationEl.closest('.ai-intelligence-card');
        
        explanationEl.innerHTML = '<span class="loading-dots" style="opacity: 0.7;">🤖 Interrogating neural patterns</span>';
        explanationEl.style.borderLeftColor = 'var(--accent)';
        cardEl.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.3)';
        
        const payloadArgs = [
            features.duration,
            features.src_bytes,
            features.dst_bytes,
            features.count,
            features.serror_rate
        ];

        try {
            const res = await fetch('/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prediction: prediction,
                    confidence: confidence,
                    features: payloadArgs
                })
            });
            const data = await res.json();
            
            if (data.explanation.includes('❌ AI Service Error')) {
                explanationEl.innerHTML = `<span style="color: var(--warning); font-size: 0.85rem;">${data.explanation}</span>`;
                return;
            }

            // Typewriter effect
            typeWriter(data.explanation, explanationEl, prediction);
            
        } catch (e) {
            explanationEl.innerHTML = '<span style="color: var(--danger);">Quantum uplink failed. Manual review recommended.</span>';
        }
    }

    function typeWriter(text, element, prediction) {
        element.innerHTML = '';
        element.classList.add('typing-effect');
        let i = 0;
        
        // Final color determined by outcome
        const finalColor = prediction === 'Attack' ? 'var(--danger)' : 'var(--success)';
        element.style.borderLeftColor = finalColor;

        function type() {
            if (i < text.length) {
                // Handling bold markers **
                let currentText = text.substring(0, i + 1);
                element.innerHTML = currentText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                i++;
                setTimeout(type, 15);
            } else {
                element.classList.remove('typing-effect');
                element.closest('.ai-intelligence-card').style.boxShadow = '';
            }
        }
        type();
    }

    function showResult(prediction, confidence) {
        overlay.style.display = 'block';
        overlayResult.innerHTML = `<span style="font-size: 0.8rem; opacity: 0.7; display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px;">AI Verified Outcome</span>${prediction}`;
        overlayConf.textContent = `Confidence Matrix: ${confidence}%`;

        if (prediction === 'Attack') {
            overlay.style.background = 'rgba(255, 75, 43, 0.4)';
            overlay.style.border = '2px solid rgba(255, 75, 43, 0.6)';
        } else {
            overlay.style.background = 'rgba(0, 255, 135, 0.2)';
            overlay.style.border = '2px solid rgba(0, 255, 135, 0.4)';
        }

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 2000);
    }

    clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('duration').value = '';
        document.getElementById('src_bytes').value = '';
        document.getElementById('dst_bytes').value = '';
        document.getElementById('count').value = '';
        document.getElementById('serror_rate').value = '';
    });

    randomizeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const rand = Math.random();

        if (rand > 0.8) { // DoS Attack pattern
            document.getElementById('duration').value = (Math.random() * 0.05).toFixed(4);
            document.getElementById('src_bytes').value = Math.floor(40000 + Math.random() * 20000);
            document.getElementById('dst_bytes').value = Math.floor(Math.random() * 50);
            document.getElementById('count').value = Math.floor(450 + Math.random() * 50);
            document.getElementById('serror_rate').value = (0.95 + Math.random() * 0.05).toFixed(2);
        } else if (rand > 0.6) { // Probe/Scan pattern
            document.getElementById('duration').value = (2.0 + Math.random() * 5.0).toFixed(2);
            document.getElementById('src_bytes').value = Math.floor(10 + Math.random() * 100);
            document.getElementById('dst_bytes').value = Math.floor(10 + Math.random() * 100);
            document.getElementById('count').value = Math.floor(100 + Math.random() * 100);
            document.getElementById('serror_rate').value = (0.4 + Math.random() * 0.3).toFixed(2);
        } else { // Normal traffic
            document.getElementById('duration').value = (Math.random() * 2.0).toFixed(2);
            document.getElementById('src_bytes').value = Math.floor(200 + Math.random() * 1000);
            document.getElementById('dst_bytes').value = Math.floor(200 + Math.random() * 1000);
            document.getElementById('count').value = Math.floor(1 + Math.random() * 15);
            document.getElementById('serror_rate').value = (Math.random() * 0.02).toFixed(2);
        }
    });

    // Initial load
    updateStats();
});
