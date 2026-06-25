/* -- PROJECTS - GitHub API -- */

const GITHUB_USERNAME = 'Jarjarbin06';
const GITHUB_ORG_NAME = 'Jarjarbin-Studio';

const EXCLUDED_REPOS = [
    'Jarjarbin06',
    'portfolio',
    'Stumper04',
    'WS_GoodPractices',
    'sans-ta_bs103cypher',
    'sans-ta_bsmy-hunter',
    'BSCP',
    'CLI-Game-Engine',
    'map_tool',
    'epitech_console'
];

async function fetchJson(url) {
    console.log(`[GitHub] Fetching: ${url}`);

    try {
        const res = await fetch(url);

        console.log(`[GitHub] Response status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[GitHub] API error body for ${url}:`, errorText);
            throw new Error(`GitHub API error (${res.status}) on ${url}`);
        }

        const data = await res.json();

        console.log(`[GitHub] Success: ${url}`);
        console.log(`[GitHub] Items received:`, Array.isArray(data) ? data.length : 'not array');

        return data;

    } catch (err) {
        console.error(`[GitHub] Fetch failed for ${url}`, err);
        throw err;
    }
}

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');

    console.log('[Projects] Initializing fetchProjects()');

    try {
        const userUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
        const orgUrl = `https://api.github.com/orgs/${GITHUB_ORG_NAME}/repos?sort=updated&per_page=100`;

        console.log('[Projects] Fetching user + org repos...');
        console.log(`[Projects] User: ${userUrl}`);
        console.log(`[Projects] Org: ${orgUrl}`);

        const [userRepos, orgRepos] = await Promise.all([
            fetchJson(userUrl),
            fetchJson(orgUrl)
        ]);

        console.log('[Projects] Raw user repos:', userRepos);
        console.log('[Projects] Raw org repos:', orgRepos);

        const allReposMap = new Map();

        [...userRepos, ...orgRepos].forEach(repo => {
            const key = `${repo.owner.login}/${repo.name}`;

            if (allReposMap.has(key)) {
                console.warn(`[Projects] Duplicate repo detected: ${key}`);
            }

            allReposMap.set(key, repo);
        });

        const repos = Array.from(allReposMap.values());

        console.log(`[Projects] Total merged repos: ${repos.length}`);

        const filtered = repos.filter(repo => {
            const excluded = EXCLUDED_REPOS.includes(repo.name);

            if (excluded) {
                console.log(`[Projects] Excluded repo: ${repo.name}`);
            }

            return !repo.fork && !excluded;
        });

        console.log(`[Projects] After filtering: ${filtered.length}`);

        if (filtered.length === 0) {
            console.warn('[Projects] No repositories found after filtering');
            grid.innerHTML = '<p class="output">no repositories found.</p>';
            return;
        }

        console.log('[Projects] Rendering projects...');

        grid.innerHTML = filtered.map(repo => {
            console.log(`[Projects] Rendering repo: ${repo.name}`);

            return `
                <div class="project-card">
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'no description provided.'}</p>
                    <div class="meta">
                        <span class="lang">${repo.language || 'unknown'}</span>
                        <span>★ ${repo.stargazers_count}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank">view on github →</a>
                </div>
            `;
        }).join('');

        console.log('[Projects] Render complete ✔');

    } catch (error) {
        console.error('[Projects] Fatal error in fetchProjects():', error);

        grid.innerHTML = '<p class="output">could not fetch repositories.</p>';
    }
}
