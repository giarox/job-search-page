// script.js

// Function to fetch and parse CSV
async function fetchJobs() {
    try {
        const response = await fetch('jobs.csv');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        return parseCSV(data);
    } catch (error) {
        console.error('Error fetching the CSV file:', error);
        return [];
    }
}

// Function to parse CSV into JavaScript objects
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const jobs = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const job = {};
        headers.forEach((header, index) => {
            job[header] = values[index] || '';
        });
        return job;
    });
    return jobs;
}

// Function to display jobs
function displayJobs(jobs) {
    const jobListings = document.getElementById('job-listings');
    jobListings.innerHTML = ''; // Clear existing listings

    jobs.forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.classList.add('job');

        // Featured Image
        const img = document.createElement('img');
        img.src = job['Featured Image'] || 'default-logo.png';
        img.alt = `${job['Azienda']} Logo`;
        img.onerror = () => { img.src = 'default-logo.png'; }; // Fallback image

        // Job Details
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('job-details');

        const title = document.createElement('h2');
        title.textContent = job['Title'];

        const company = document.createElement('p');
        company.textContent = `Company: ${job['Azienda']}`;

        const location = document.createElement('p');
        location.textContent = `Location: ${job['Luogo']}`;

        const region = document.createElement('p');
        region.textContent = `Region: ${job['Regione']}`;

        const link = document.createElement('a');
        link.href = job['link_posizione'];
        link.textContent = 'Apply Here';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        // Assemble Job Entry
        detailsDiv.appendChild(title);
        detailsDiv.appendChild(company);
        detailsDiv.appendChild(location);
        detailsDiv.appendChild(region);
        detailsDiv.appendChild(link);

        jobDiv.appendChild(img);
        jobDiv.appendChild(detailsDiv);

        jobListings.appendChild(jobDiv);
    });
}

// Function to populate filter options
function populateFilters(jobs) {
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
}

// Function to handle search and filter
function handleSearchAndFilter(jobs) {
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

    // Debounce function to limit the rate of function calls
    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }

    searchInput.addEventListener('input', debounce(filterJobs, 300));
    filterLuogo.addEventListener('change', filterJobs);
    filterAzienda.addEventListener('change', filterJobs);
    filterRegione.addEventListener('change', filterJobs);
}

// Initialize the page
async function init() {
    const jobs = await fetchJobs();
    if (jobs.length === 0) {
        const jobListings = document.getElementById('job-listings');
        jobListings.innerHTML = '<p>No job listings available.</p>';
        return;
    }
    populateFilters(jobs);
    displayJobs(jobs);
    handleSearchAndFilter(jobs);
}

// Run the init function when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);