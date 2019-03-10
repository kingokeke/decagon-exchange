/* eslint-disable no-unused-vars */

function cryptoNews() {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const API_KEY = 'f6968066194849a19cf97a517a1cd3b3';
  const SOURCE = 'crypto-coins-news';
  const url = `https://newsapi.org/v2/top-headlines?sources=${SOURCE}&apiKey=${API_KEY}`;
  const req = new Request(url);
  fetch(req)
    .then(response => response.json())
    .then(data => {
      data.articles.forEach(item => {
        let article = `
          <div class="ml-3">
            <h4><a href="${item.url}" target="_blank" class="m-b-0 font-medium p-0">${item.title}</a></h4>
            <p class="text-muted">${item.description.slice(0, 110)}. . .
                <a href="${item.url}" target="_blank">Read more</a>
            </p>
          </div>
          <div class="ml-4 mr-3">
            <div class="text-center">
              <h5 class="text-muted m-b-0">${new Date(item.publishedAt).getDate()}</h5>
              <span class="text-muted font-16">${MONTHS[new Date(item.publishedAt).getMonth()]}</span>
            </div>
          </div>
        `;
        const post = document.createElement('li');
        post.classList.add('d-flex', 'no-block', 'card-body', 'border-top', 'article');
        post.innerHTML = article;
        document.querySelector('.cryptocurrency-news ul').appendChild(post);
      });
    });
}

cryptoNews();
