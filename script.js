// script.js

// Function to fetch and parse CSV
async function fetchJobs() {
    try {
        console.log("Fetching jobs.csv...");
        const response = await fetch('jobs.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        console.log("CSV data fetched successfully.");
        return parseCSV(data);
    } catch (error) {
        console.error('Error fetching the CSV file:', error);
        return [];
    }
}

// Optimized parseCSV with preprocessing
function parseCSV(data) {
    console.log("Parsing CSV data...");
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const jobs = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const job = {};
        headers.forEach((header, index) => {
            job[header] = values[index] || '';
            // Preprocess searchable fields
            if (['Title', 'Azienda', 'Luogo', 'Regione', 'link_posizione'].includes(header)) {
                job[`_${header.toLowerCase()}`] = (values[index] || '').toLowerCase();
            }
        });
        return job;
    });
    console.log(`Parsed ${jobs.length} job entries.`);
    return jobs;
}

// Function to display jobs using innerHTML
function displayJobs(jobs) {
    console.log("Displaying jobs...");
    const jobListings = document.getElementById('job-listings');
    let html = ''; // Initialize HTML string

    jobs.forEach(job => {
        html += `
            <div class="job">
                <img src="${job['Featured Image'] || 'default-logo.png'}" alt="${job['Azienda']} Logo" loading="lazy" onerror="this.src='default-logo.png'">
                <div class="job-details">
                    <h2>${job['Title']}</h2>
                    <p>Company: ${job['Azienda']}</p>
                    <p>Location: ${job['Luogo']}</p>
                    <p>Region: ${job['Regione']}</p>
                    <a href="${job['link_posizione']}" target="_blank" rel="noopener noreferrer">Apply Here</a>
                </div>
            </div>
        `;
    });

    jobListings.innerHTML = html; // Set all jobs at once
    console.log("Jobs displayed successfully.");
}

// Function to populate filter options
function populateFilters(jobs) {
    console.log("Populating filter options...");
    const filterLuogo = document.getElementById('filter-luogo');
    const filterAzienda = document.getElementById('filter-azienda');
    const filterRegione = document.getElementById('filter-regione');

    const uniqueLuogo = [...new Set(jobs.map(job => job['Luogo']))].sort();
    const uniqueAzienda = [...new Set(jobs.map(job => job['Azienda']))].sort();
    const uniqueRegione = [...new Set(jobs.map(job => job['Regione']))].sort();

    uniqueLuogo.forEach(luogo => {
        const option = document.createElement('option');
        option.value = luogo;
        option.textContent = luogo;
        filterLuogo.appendChild(option);
    });

    uniqueAzienda.forEach(azienda => {
        const option = document.createElement('option');
        option.value = azienda;
        option.textContent = azienda;
        filterAzienda.appendChild(option);
    });

    uniqueRegione.forEach(regione => {
        const option = document.createElement('option');
        option.value = regione;
        option.textContent = regione;
        filterRegione.appendChild(option);
    });

    console.log("Filter options populated.");
}

// Debounce function with 200ms delay
function debounce(func, delay = 200) {
    let debounceTimer;
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to handle search and filter
function handleSearchAndFilter(jobs) {
    console.log("Setting up search and filter handlers...");
    const searchInput = document.getElementById('search-input');
    const filterLuogo = document.getElementById('filter-luogo');
    const filterAzienda = document.getElementById('filter-azienda');
    const filterRegione = document.getElementById('filter-regione');

    function filterJobs() {
        const query = searchInput.value.toLowerCase();
        const luogo = filterLuogo.value;
        const azienda = filterAzienda.value;
        const regione = filterRegione.value;

        const filtered = jobs.filter(job => {
            const matchesSearch = Object.values(job).some(value =>
                value.toLowerCase().includes(query)
            );
            const matchesLuogo = luogo === '' || job['Luogo'] === luogo;
            const matchesAzienda = azienda === '' || job['Azienda'] === azienda;
            const matchesRegione = regione === '' || job['Regione'] === regione;
            return matchesSearch && matchesLuogo && matchesAzienda && matchesRegione;
        });

        displayJobs(filtered);
    }

    searchInput.addEventListener('input', debounce(filterJobs, 200));
    filterLuogo.addEventListener('change', filterJobs);
    filterAzienda.addEventListener('change', filterJobs);
    filterRegione.addEventListener('change', filterJobs);

    console.log("Search and filter handlers set up.");
}

// Initialize the page
async function init() {
    console.log("Initializing job search page...");
    const jobs = await fetchJobs();
    if (jobs.length === 0) {
        const jobListings = document.getElementById('job-listings');
        jobListings.innerHTML = '<p>No job listings available.</p>';
        console.log("No jobs to display.");
        return;
    }
    populateFilters(jobs);
    displayJobs(jobs);
    handleSearchAndFilter(jobs);
    console.log("Job search page initialized successfully.");
}

// Run the init function when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);