/* eslint-disable no-unused-vars */

// ###################################
// FUNCTION DECLARATIONS
// ###################################

function cryptoNews(article_count, letter_count, query = '', type = '') {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const API_KEY = 'f6968066194849a19cf97a517a1cd3b3';
  const SOURCE = 'crypto-coins-news';
  const TYPE = type === 'top' ? 'top-headlines' : 'everything';
  const url = `https://newsapi.org/v2/${TYPE}?q=${query}&sources=${SOURCE}&sortBy=publishedAt&apiKey=${API_KEY}`;
  const req = new Request(url);
  fetch(req)
    .then(response => response.json())
    .then(data => {
      for (let i = 0; i < article_count; i++) {
        const item = data.articles[i];
        const post = `
          <div class="ml-3">
            <h4><a href="${item.url}" target="_blank" class="m-b-0 font-medium p-0">${item.title}</a></h4>
            <p class="text-muted">${item.description.slice(0, letter_count)}...<br /><a href="${
          item.url
        }" target="_blank">Read more</a>
            </p>
          </div>
          <div class="ml-4 mr-3">
            <div class="text-center">
              <h5 class="text-muted m-b-0">${new Date(item.publishedAt).getDate()}</h5>
              <span class="text-muted font-16">${MONTHS[new Date(item.publishedAt).getMonth()]}</span>
            </div>
          </div>
        `;
        const article = document.createElement('li');
        article.classList.add('d-flex', 'no-block', 'card-body', 'border-top', 'article');
        article.innerHTML = post;
        document.querySelector('.cryptocurrency-news ul').appendChild(article);
      }
      const attribution = document.createElement('li');
      attribution.classList.add('d-flex', 'no-block', 'card-body', 'border-top', 'article');
      attribution.innerHTML = `<div class="text-center w-100"><p>Powered by <a href="https://newsapi.org" target="_blank">News API</a></p></div>`;
      document.querySelector('.cryptocurrency-news ul').appendChild(attribution);
    });
}

// ###################################
// FUNCTION CALLS
// ###################################

cryptoNews(7, 160, 'bitcoin');
