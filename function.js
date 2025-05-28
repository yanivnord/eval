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

        // Domain name
        const label = document.createElement('div');
        label.className = 'domain-lab';
        label.textContent = domain.name;
        rowDiv.appendChild(label);

        // Description
        const descP = document.createElement('p');
        descP.className = 'description';
        descP.textContent = domain.description;
        rowDiv.appendChild(descP);

        // Slider content
        const sliderDiv = document.createElement('div');
        sliderDiv.className = 'domain-slider';
        const sliderRow = document.createElement('div');
        sliderRow.className = 'slider-row';
        
        // Novice label with tooltip
        const noviceLabelWrap = document.createElement('span');
        noviceLabelWrap.className = 'slider-label-with-tooltip';
        const noviceLabel = document.createElement('span');
        noviceLabel.className = 'slider-label slider-label-novice';
        noviceLabel.textContent = 'Novice';
        const noviceTooltip = document.createElement('div');
        noviceTooltip.className = 'slider-label-tooltip';
        noviceTooltip.innerHTML = '<h4 class="margin-block-zero">A novice...</h4><ul class="slider-tooltip-list margin-block-zero"><li class="slider-tooltip-list-item">Rarely operates with autonomy</li><li class="slider-tooltip-list-item">Is still learning our user experience standards</li><li class="slider-tooltip-list-item">Seeks much guidance</li></ul>';
        noviceLabelWrap.appendChild(noviceLabel);
        noviceLabelWrap.appendChild(noviceTooltip);

        // Master label with tooltip
        const masterLabelWrap = document.createElement('span');
        masterLabelWrap.className = 'slider-label-with-tooltip';
        const masterLabel = document.createElement('span');
        masterLabel.className = 'slider-label slider-label-master';
        masterLabel.textContent = 'Master';
        const masterTooltip = document.createElement('div');
        masterTooltip.className = 'slider-label-tooltip';
        masterTooltip.innerHTML = '<h4 class="margin-block-zero">A master...</h4><ul class="slider-tooltip-list margin-block-zero"><li class="slider-tooltip-list-item">Operates with much autonomy</li><li class="slider-tooltip-list-item">Helps define our user experience standards</li><li class="slider-tooltip-list-item">Mentors and inspires others</li></ul>';
        masterLabelWrap.appendChild(masterLabel);
        masterLabelWrap.appendChild(masterTooltip);

        // Slider and value
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-input-wrapper';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 1;
        slider.max = 5;
        slider.value = localStorage.getItem(`domain-input-${idx}`) || 3;
        slider.id = `domain-input-${idx}`;
        slider.setAttribute('aria-label', domain.name + ' proficiency');
        slider.style.width = '100%';
        sliderWrapper.appendChild(slider);
        // Restore value span
        const valueSpan = document.createElement('span');
        valueSpan.className = 'slider-value';
        valueSpan.textContent = slider.value;
        valueSpan.style.position = 'absolute';
        valueSpan.style.pointerEvents = 'none';
        sliderWrapper.appendChild(valueSpan);

        sliderRow.appendChild(noviceLabelWrap);
        sliderRow.appendChild(sliderWrapper);
        sliderRow.appendChild(masterLabelWrap);
        sliderDiv.appendChild(sliderRow);
        rowDiv.appendChild(sliderDiv);

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
        criteriaHeader.appendChild(chevron);
        criteriaHeader.appendChild(criteriaLabel);
        const criteriaList = document.createElement('ul');
        criteriaList.className = 'criteria-list';
        criteriaList.style.display = 'none';
        domain.criteria.forEach(crit => {
            const li = document.createElement('li');
            li.className = 'criterion';
            // Split at the first colon
            const colonIdx = crit.indexOf(':');
            if (colonIdx !== -1) {
                const shortName = crit.slice(0, colonIdx + 1);
                const desc = crit.slice(colonIdx + 1);
                const strong = document.createElement('span');
                strong.className = 'criterion-short';
                strong.textContent = shortName + ' ';
                li.appendChild(strong);
                li.appendChild(document.createTextNode(desc.trim()));
            } else {
                li.textContent = crit;
            }
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
        rowDiv.appendChild(criteriaHeader);
        rowDiv.appendChild(criteriaList);

        // Save slider ref for later
        sliderRefs.push({slider, valueSpan, sliderWrapper});
        setTimeout(() => positionSliderValue(slider, valueSpan, sliderWrapper), 0);
        return rowDiv;
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
        let percentage = ((totalProficiency - minProficiency) / range);
        percentage = Math.min(1, Math.max(0, percentage));
        const minTop =86; // percent (overlay at bottom for min proficiency)
        const maxTop = 3;  // percent (overlay near top for max proficiency)
        const top = minTop + (maxTop - minTop) * percentage;
        gradientOverlay.style.top = `${top}%`;
        totalNumber.innerHTML = `${totalProficiency}`;
    }

    function positionSliderValue(slider, valueSpan, sliderWrapper) {
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const val = parseInt(slider.value);
        const percent = (val - min) / (max - min);
        const sliderWidth = slider.offsetWidth;
        const thumbSize = 25; // px, matches CSS width of thumb
        const valueWidth = valueSpan.offsetWidth;
        const LEFT_EDGE_OFFSET = 2.1;   // tweak as needed
        const RIGHT_EDGE_OFFSET = 2.15;  // tweak as needed
        const SLIDER_VALUE_MANUAL_OFFSET = LEFT_EDGE_OFFSET + (RIGHT_EDGE_OFFSET - LEFT_EDGE_OFFSET) * percent;
        const left = percent * (sliderWidth - thumbSize) + (thumbSize / 2) - (valueWidth / 2) + SLIDER_VALUE_MANUAL_OFFSET;
        valueSpan.style.left = `${left}px`;
        valueSpan.style.top = '-6px';
    }
});
