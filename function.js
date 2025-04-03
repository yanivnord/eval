document.addEventListener('DOMContentLoaded', () => {
    const descriptions = document.querySelectorAll('.description');
    const proficiencyInputs = document.querySelectorAll('input[type="range"]');
    const totalProficiencySpan = document.getElementById('total-proficiency');
    const proficiencyValues = document.querySelectorAll('.proficiency-value');
    const gradientOverlay = document.getElementById('gradientOverlay');
    const totalNumber = document.getElementById('totalNumber');

    // Fetch descriptions from JSON file
    fetch("domains.json")
        .then(response => response.json())
        .then(data => {
            data.forEach((item, index) => {
                const descElement = document.getElementById(`description-${index + 1}`);
                if (descElement) {
                    // Convert fullDescription array to HTML with bullets
                    const fullDescriptionHTML = item.fullDescription.map(line => `<li>${line}</li>`).join('');
                    descElement.innerHTML = `<strong>${item.shortDescription}</strong><ul>${fullDescriptionHTML}</ul>`;
                }
            });
        });

    //***** SCORE POSITIONING *****//

    if (!gradientOverlay) {
        console.error("The element with ID 'gradientOverlay' could not be found.");
        return; // Prevent further execution if the element is not found
    }

    // Load saved values from localStorage
    proficiencyInputs.forEach((input, index) => {
        const savedValue = localStorage.getItem(input.id);
        if (savedValue !== null) {
            input.value = savedValue;
            proficiencyValues[index].textContent = savedValue;
        } else {
            proficiencyValues[index].textContent = input.value;
        }
    });

    // * Function to update total proficiency and visualization * //
    function updateTotalProficiency() {
        let total = 0;
        proficiencyInputs.forEach((input, index) => {
            total += parseInt(input.value);
            proficiencyValues[index].textContent = input.value;
        });
        totalProficiencySpan.textContent = total;
        updateVisualization(total);
    }

    // * Recalculate and reposition the score overlay * //
    function updateVisualization(totalProficiency) {
        const minProficiency = 1;
        const maxProficiency = 35;
        const range = maxProficiency - minProficiency;
        let percentage = ((totalProficiency - minProficiency) / range) * 100;
        percentage = Math.min(100, Math.max(0, percentage));

        gradientOverlay.style.top = `${100 - percentage}%`;
        gradientOverlay.style.height = '20%';
        totalNumber.innerHTML = `${totalProficiency}`;
    }

    // Event listener to update proficiency and store value in localStorage
    proficiencyInputs.forEach(input => {
        input.addEventListener('input', () => {
            localStorage.setItem(input.id, input.value);
            updateTotalProficiency();
        });
    });

    // Initial update to set total proficiency and visualization based on loaded values
    updateTotalProficiency();
});
