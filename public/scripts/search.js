document.addEventListener('DOMContentLoaded', () => {
  const searchContainer = document.getElementById('addMovie');
  const resultList = document.getElementById('result').querySelector('ul');
  const searchButton = searchContainer.querySelector('button[name=search]');
  const searchInput = searchContainer.querySelector('input[name=movieTitle]');

  function search() {
    resultList.innerHTML = '';
    const data = {
      mode: 'search',
      title: searchInput.value
    }

    fetch(window.location.href + '/movies', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
      response.forEach(movie => {
        let listElement = document.createElement('li');
        let listElementDiv = document.createElement('div');
        let title = document.createElement('h3');
        let image = document.createElement('img');
        image.setAttribute('src', movie.Poster);
        title.appendChild(document.createTextNode(movie.Title + ' (' + movie.Year + ')'));
        listElementDiv.appendChild(title);
        listElementDiv.appendChild(image);
        listElement.appendChild(listElementDiv);
        resultList.appendChild(listElement);
      });
    });
  }

  searchButton.addEventListener('click', search);
  searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      search();
    }
  };
});