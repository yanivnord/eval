
document.addEventListener('DOMContentLoaded', () => {
    const domainsContainer = document.getElementById('domains');
    const totalProficiencySpan = document.getElementById('total-proficiency');
    const gradientOverlay = document.getElementById('gradientOverlay');
    const totalNumber = document.getElementById('totalNumber');

    let sliderRefs = [];

    // Helper: Create a domain block
    function createDomainBlock(domain, idx) {
        // Outer row container
        const rowDiv = document.createElement('div');
        rowDiv.className = 'domain-row';

        // Left: text content
        const textDiv = document.createElement('div');
        textDiv.className = 'domain-text';

        // Domain name
        const label = document.createElement('div');
        label.className = 'domain-lab';
        label.textContent = domain.name;
        textDiv.appendChild(label);

        // Description
        const descP = document.createElement('p');
        descP.className = 'description';
        descP.textContent = domain.description;
        textDiv.appendChild(descP);

        // Collapsible criteria
        const criteriaHeader = document.createElement('div');
        criteriaHeader.className = 'criteria-header';
        criteriaHeader.setAttribute('tabindex', '0');
        criteriaHeader.setAttribute('role', 'button');
        criteriaHeader.setAttribute('aria-expanded', 'false');
        criteriaHeader.style.display = 'flex';
        criteriaHeader.style.alignItems = 'center';
        criteriaHeader.style.cursor = 'pointer';

        const chevron = document.createElement('img');
        chevron.className = 'chevron';
        chevron.src = 'assets/chevron-right.svg';
        chevron.alt = '';
        chevron.style.fontSize = '1em';
        chevron.style.marginRight = '0.25rem';

        const criteriaLabel = document.createElement('span');
        criteriaLabel.className = 'criteria-label';
        criteriaLabel.textContent = 'Criteria for evaluation';
        criteriaLabel.style.fontWeight = '500';
        criteriaLabel.style.fontSize = '1.em';

        criteriaHeader.appendChild(chevron);
        criteriaHeader.appendChild(criteriaLabel);

        const criteriaList = document.createElement('ul');
        criteriaList.className = 'criteria-list';
        criteriaList.style.display = 'none';
        domain.criteria.forEach(crit => {
            const li = document.createElement('li');
            li.className = 'criterion';
            li.textContent = crit;
            criteriaList.appendChild(li);
        });
        function toggleCriteria() {
            const expanded = criteriaList.style.display === 'block';
            criteriaList.style.display = expanded ? 'none' : 'block';
            if (expanded) {
                chevron.classList.remove('expanded');
            } else {
                chevron.classList.add('expanded');
            }
            criteriaHeader.setAttribute('aria-expanded', String(!expanded));
        }
        criteriaHeader.addEventListener('click', toggleCriteria);
        criteriaHeader.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCriteria();
            }
        });
        textDiv.appendChild(criteriaHeader);
        textDiv.appendChild(criteriaList);

        // Right: slider content
        const sliderDiv = document.createElement('div');
        sliderDiv.className = 'domain-slider';

        // Slider row: labels and slider
        const sliderRow = document.createElement('div');
        sliderRow.className = 'slider-row';
        const noviceLabel = document.createElement('span');
        noviceLabel.className = 'slider-label slider-label-novice';
        noviceLabel.textContent = 'Novice';
        const masterLabel = document.createElement('span');
        masterLabel.className = 'slider-label slider-label-master';
        masterLabel.textContent = 'Master';

        // Slider wrapper for relative positioning
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-input-wrapper';
        sliderWrapper.style.position = 'relative';
        sliderWrapper.style.flex = '1 1 0';
        sliderWrapper.style.display = 'flex';
        sliderWrapper.style.alignItems = 'center';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 1;
        slider.max = 5;
        slider.value = localStorage.getItem(`domain-input-${idx}`) || 3;
        slider.id = `domain-input-${idx}`;
        slider.setAttribute('aria-label', domain.name + ' proficiency');
        slider.style.width = '100%';
        sliderWrapper.appendChild(slider);

        // Slider value: absolutely positioned below thumb, inside sliderWrapper
        const valueSpan = document.createElement('span');
        valueSpan.className = 'slider-value';
        valueSpan.textContent = slider.value;
        valueSpan.style.position = 'absolute';
        valueSpan.style.top = '1.1em';
        valueSpan.style.pointerEvents = 'none';
        sliderWrapper.appendChild(valueSpan);

        sliderRow.appendChild(noviceLabel);
        sliderRow.appendChild(sliderWrapper);
        sliderRow.appendChild(masterLabel);
        sliderDiv.appendChild(sliderRow);

        // Assemble row
        rowDiv.appendChild(textDiv);
        rowDiv.appendChild(sliderDiv);

        // Save slider ref for later
        sliderRefs.push({slider, valueSpan, sliderWrapper});

        // Initial value position
        setTimeout(() => positionSliderValue(slider, valueSpan, sliderWrapper), 0);

        return rowDiv;
    }

    // Position the slider value below the thumb, relative to the slider input
    function positionSliderValue(slider, valueSpan, sliderWrapper) {
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const val = parseInt(slider.value);
        const percent = (val - min) / (max - min);
        const sliderWidth = slider.offsetWidth;
        const thumbSize = 19; // px, matches CSS
        const valueWidth = valueSpan.offsetWidth;
        const manualOffset = 4; // <-- Adjust this value for perfect centering
        // Center the value under the thumb
        const left = percent * (sliderWidth - thumbSize) + (thumbSize / 2) - (valueWidth / 2) + manualOffset;
        valueSpan.style.left = `${left}px`;
    }

    // Render all domains from JSON
    fetch('domains.json')
        .then(res => res.json())
        .then(data => {
            const domains = data.domains;
            sliderRefs = [];
            domainsContainer.innerHTML = '';
            domains.forEach((domain, idx) => {
                const block = createDomainBlock(domain, idx);
                domainsContainer.appendChild(block);
            });
            attachSliderListeners();
            updateTotalProficiency();
        });

    // Attach slider listeners for live update
    function attachSliderListeners() {
        sliderRefs.forEach(({slider, valueSpan, sliderWrapper}, idx) => {
            slider.addEventListener('input', () => {
                valueSpan.textContent = slider.value;
                localStorage.setItem(slider.id, slider.value);
                positionSliderValue(slider, valueSpan, sliderWrapper);
                updateTotalProficiency();
            });
            // On resize, reposition value
            window.addEventListener('resize', () => positionSliderValue(slider, valueSpan, sliderWrapper));
        });
    }

    // Calculate and update total proficiency and visualization
    function updateTotalProficiency() {
        let total = 0;
        sliderRefs.forEach(({slider}) => {
            total += parseInt(slider.value);
        });
        totalProficiencySpan.textContent = total;
        updateVisualization(total);
    }

    // Update right panel visualization
    function updateVisualization(totalProficiency) {
        const minProficiency = 7;
        const maxProficiency = 35;
        const range = maxProficiency - minProficiency;
        let percentage = ((totalProficiency - minProficiency) / range) * 100;
        percentage = Math.min(100, Math.max(0, percentage));
        gradientOverlay.style.top = `${100 - percentage}%`;
        gradientOverlay.style.height = '20%';
        totalNumber.innerHTML = `${totalProficiency}`;
    }
});
