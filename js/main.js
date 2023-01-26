let data

const resultsEl = document.querySelector(".results");
const filterMenu = document.querySelector("#filter-menu");

const toggleTopics = (resultId) => {
    const resultEl = document.querySelector("#" + resultId);
    const topicEl = resultEl.querySelector(".topics");
    const showAllTopics = !(topicEl.getAttribute("data-showalltopics") === "true");
    topicEl.setAttribute("data-showalltopics", showAllTopics);

    resultsEl.innerHTML = resultsList();
}

const sortFilter = (a, b) => {
    const countA = a.doc_count;
    const countB = b.doc_count;
    let comparison = 0;

    if (countA > countB) {
        comparison = -1;
    } else if (countA < countB) {
        comparison = 1;
    }
    return comparison;
}

const filterList = () => {
    const required = ["authors", "published_year", "topics"]
    return Object.entries(data.facets)
        .filter(([key]) => required.some(r => key === r))
        .map(([key, value]) => {
            const title = key.split('_').join(' ')
            const filters = value.sort(sortFilter).slice(0, 5)
            return `<div class="filter-list-container">
                        <h3>${title}</h3>
                        <ul class="filter-list">` +
                filters.map(v => `<li class="filter-item" key={v.key}>${v.key}</li>`).join("") + `</ul>
                    </div>`
        }).join("")
}


const resultsList = () => data.results.map(result => {
        const resultEl = document.querySelector("#" + result.policy_document_id);
        const topicEl = resultEl && resultEl.querySelector(".topics");
        const showAllTopics = (topicEl && topicEl.getAttribute("data-showalltopics") === "true");
        const topics = showAllTopics ? result.topics : result.topics.slice(0, 3);
        const authors = result.authors
        return `
                <li id='${result.policy_document_id}' class="result">
                <div class="text-info">
                    <h1 class="title">${result.title}</h1>
                    <p class="snippet">${result.snippet}</p>
                    <p>${result.published_on}</p>
                    <ul class="topics" data-showalltopics="${showAllTopics}">` +
            topics.map(t => `<li class="topic">${t}</li>`).join("") +
            `</ul>
                    <button 
                        onclick="toggleTopics('${result.policy_document_id}')" 
                        class="more-button">
                        ${showAllTopics ? 'Show less' : 'Show more'}
                    </button>
                    <ul class="authors">` +
            authors.map(a => `<li class="author">${a}</li>`).join("") +
            `</ul>
                </div>
                <img src=${result.thumbnail} class="thumbnail" alt=''/>
            </li>`;
    }
).join("");

const buttonEl = document.querySelector('#filter-button')
buttonEl.addEventListener('click', () => filterMenu.classList.toggle('hide'))

const URL = "https://app.overton.io/documents.php?query=title%3A%22air+quality%22+or+%22pollution%22&source=govuk&sort=citations&format=json&api_key=2e73d1-689eadef86e9ce113bc904eb09d4d52c"
fetch(URL).then(r => r.json())
    .then(r => {
        data = r
        filterMenu.insertAdjacentHTML("afterbegin", filterList());
        resultsEl.insertAdjacentHTML("afterbegin", resultsList());
    })
