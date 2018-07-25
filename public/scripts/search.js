document.addEventListener('DOMContentLoaded', () => {
  const movies = document.getElementById('movies');
  const removeMovieButtons = movies.querySelectorAll('button[name=removeMovie]');
  const deleteButton = document.querySelector('button[name=delete]');
  const searchContainer = document.getElementById('addMovie');
  const resultList = document.getElementById('result').querySelector('ul');
  const searchButton = searchContainer.querySelector('button[name=search]');
  const searchInput = searchContainer.querySelector('input[name=movieTitle]');

  function search() {
    resultList.innerHTML = '';
    const data = {
      title: searchInput.value
    }

    fetch(window.location.href + '/movies', {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status === 401) window.location = window.location.origin + '/auth/login';
      else return res.json();
    })
    .catch(error => console.error('Error:', error))
    .then(response => {
      response.forEach(movie => {
        const listElement = document.createElement('li');
        const title = document.createElement('h3');
        const image = document.createElement('img');
        const button = document.createElement('button');

        title.appendChild(document.createTextNode(movie.Title + ' (' + movie.Year + ')'));
        image.setAttribute('src', movie.Poster);
        image.setAttribute('alt', movie.Title);
        button.appendChild(document.createTextNode('+'));
        button.addEventListener('click', () => {
          const noMovies = document.getElementById('noMovies');
          if (noMovies !== null) noMovies.parentNode.removeChild(noMovies);
          add(movie.imdbID);
        }, false );

        listElement.appendChild(title);
        listElement.appendChild(image);
        listElement.appendChild(button);
        resultList.appendChild(listElement);
      });
    });
  }

  function add(id) {
    fetch(window.location.href + '/movies/' + id, {
      method: 'POST'
    }).then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(movie => {
      const listElement = document.createElement('li');
      const title = document.createElement('h3');
      const director = document.createElement('p');
      const plot = document.createElement('p');
      const runtime = document.createElement('p');
      const rating = document.createElement('p');
      const image = document.createElement('img');
      const input = document.createElement('input');
      const button = document.createElement('button');

      title.appendChild(document.createTextNode(movie.title + ' (' + movie.year + ')'));
      director.appendChild(document.createTextNode(movie.director));
      plot.appendChild(document.createTextNode(movie.plot));
      runtime.appendChild(document.createTextNode(movie.runtime));
      rating.appendChild(document.createTextNode(movie.rating));
      image.setAttribute('src', movie.poster);
      image.setAttribute('alt', movie.title);
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', 'movieID');
      input.setAttribute('value', movie.id);
      button.appendChild(document.createTextNode('Remove'));
      button.addEventListener('click', (e) => {
        const movieElement = e.target.parentElement;
        const movieContainer = movieElement.parentNode;
        const id = movieElement.querySelector('input[name=movieID]').value;
        removeMovie(id);
        movieContainer.removeChild(movieElement);
        if (!movieContainer.hasChildNodes()) {
          const noMovies = document.createElement('li');
          noMovies.setAttribute('id', 'noMovies');
          noMovies.appendChild(document.createTextNode('No movies yet'));
          movieContainer.appendChild(noMovies);
        }
      })

      listElement.appendChild(title);
      listElement.appendChild(director);
      listElement.appendChild(plot);
      listElement.appendChild(runtime);
      listElement.appendChild(rating);
      listElement.appendChild(image);
      listElement.appendChild(input);
      listElement.appendChild(button);
      movies.appendChild(listElement);
    });
  }

  function deleteWatchlist() {
    fetch(window.location.href, {
      method: 'DELETE'
    }).then(res => {
      if (res.status === 401) window.location = window.location.origin + '/auth/login';
      else if (res.status === 202 )window.location = window.location.origin + '/watchlist';
      else console.log('res', res);
    })
    .catch(error => console.error('Error:', error))
  }

  function removeMovie(movieID) {
    fetch(window.location.href + '/movies/' + movieID, {
      method: 'DELETE'
    }).catch(error => console.error('Error:', error))
  }

  searchButton.addEventListener('click', search );
  deleteButton.addEventListener('click', deleteWatchlist );
  removeMovieButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const movieElement = e.target.parentElement;
      const movieContainer = movieElement.parentNode;
      const id = movieElement.querySelector('input[name=movieID]').value;
      removeMovie(id);
      movieContainer.removeChild(movieElement);
      if (!movieContainer.hasChildNodes()) {
        const noMovies = document.createElement('li');
        noMovies.setAttribute('id', 'noMovies');
        noMovies.appendChild(document.createTextNode('No movies yet'));
        movieContainer.appendChild(noMovies);
      }
    })
  });

  searchInput.onkeypress = (e) => {
    if (e.key === 'Enter') search();
  };
});