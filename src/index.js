import movieApiService from "./js/tmdb-api";
import loaderSpinner from "./js/loader-spinner";
import { initializeApp } from "firebase/app";
import { getDatabase, get, ref, set } from "firebase/database";
import Notiflix from 'notiflix';
import debounce from "lodash.debounce";
import { toggleModal } from "./js/modal"
import { createMarkupAuth, createMarkupUser } from "./js/auth";
import { currentUser } from "./js/auth";
import { async } from "@firebase/util";

const firebaseConfig = {
  apiKey: "AIzaSyCGGSS5RcH1R8c9uSz4y6TFdFwEQBj3q5I",
  authDomain: "filmoteka-a977f.firebaseapp.com",
  databaseURL: "https://filmoteka-a977f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "filmoteka-a977f",
  storageBucket: "filmoteka-a977f.appspot.com",
  messagingSenderId: "148634816624",
  appId: "1:148634816624:web:4bac3205d617feb925e4b5"
};
const app = initializeApp(firebaseConfig);
const movieApi = new movieApiService();
const loader = new loaderSpinner();
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const moviesGallery = document.querySelector('.movies-gallery');
const paginationList = document.querySelector('.num-page');
const homeEl = document.querySelector('.home-link');
const logoEl = document.querySelector('.logo');
const libraryEl = document.querySelector('.library-link');
const headerChange = document.querySelector('.header-change');
const headerBack = document.querySelector('.background');
const modalCardMovie = document.querySelector('.modal-card-movie');
const previousBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const authorEl = document.querySelector('.author');
const modal = document.querySelector('.modal');

makeMarkupHome();
movieApi.writeQuery('pop');
movieApi.displayPagination();
if (currentUser === null) {
  createMarkupAuth();
} else {
  createMarkupUser();
}

function movieClick(e) {
  if (!e.target.classList.contains('movie-card')) {
    return
  }
  toggleModal();
  modalCardMovie.innerHTML = '';
  const movieId = e.target.lastElementChild.lastElementChild.textContent;
  movieApi.fetchDetails(movieId).then(result => {
    makeMarkupModal(result);
  });
}

function makeMarkupModal(movie) {
  const genreList = [];
  movie.genres.forEach(genre => genreList.push(genre.name))
  modalCardMovie.insertAdjacentHTML('beforeend', `<img class="modal-poster-movie" src="${IMG_URL}${movie.poster_path}" alt="Poster of movie">
          <div class="modal-movie-info">
            <h1>${movie.title}</h1>
            <table class="modal-movie-details">
              <tbody>
                <tr>
                  <td class="category">Vote / Votes</td>
                  <td class="category-value"><span class="movie-rating">${movie.vote_average.toFixed(1)}
</span><span class="grey-slash">/</span>${movie.vote_count}</td>
                </tr>
                <tr>
                  <td class="category">Popularity</td>
                  <td class="category-value">${movie.popularity.toFixed(1)}</td>
                </tr>
                <tr>
                  <td class="category">Original Title</td>
                  <td class="category-value">${movie.original_title}</td>
                </tr>
                <tr>
                  <td class="category">Genre</td>
                  <td class="category-value">${genreList.join(', ')}</td>
                </tr>
              </tbody>
            </table>
            <h2>About</h2>
            <p class="modal-movie-overview">${movie.overview}</p>
            <div class="modal-buttons">
              <button type="button" class="modal-button">Add to watched</button>
              <button type="button" class="modal-button">Add to queue</button>
            </div>
          </div>`);
  if (currentUser !== null) {
    checkBase('watched', movie);
    checkBase('queue', movie);
  } else {
    const modalBtns = document.querySelector('.modal-buttons');
    modalBtns.firstElementChild.setAttribute("disabled", "true");
    modalBtns.lastElementChild.setAttribute("disabled", "true");
  }
}

homeEl.addEventListener('click', (e) => {
  e.preventDefault();
  movieApi.writeQuery('pop');
  movieApi.resetPage();
  makeMarkupHome();
  movieApi.displayPagination();
})
logoEl.addEventListener('click', (e) => {
  e.preventDefault();
  movieApi.writeQuery('pop');
  movieApi.resetPage();
  makeMarkupHome();
  movieApi.displayPagination();
})
libraryEl.addEventListener('click', (e) => {
  e.preventDefault();
  movieApi.writeQuery('');
  makeMarkupLibrary('watched');
})

export function makeMarkupHome() {
  loader.show();
  moviesGallery.removeEventListener('click', movieClick);
  moviesGallery.innerHTML = '';
  libraryEl.classList.remove('nav-link-current');
  headerBack.classList.remove('background-library');
  homeEl.classList.add('nav-link-current');
  headerBack.classList.add('background-home');
  headerChange.innerHTML = '';
  headerChange.insertAdjacentHTML('beforeend',
    `<form>
      <label class="search-line"> 
        <input class="search-input" placeholder="Пошук фільмів" type="text">
        <span class="search-icon"></span>
        </img>
      </label>
    </form >`)
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('input', debounce(onSearch, 1000))
  searchInput.parentElement.parentElement.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  movieApi.fetchPop().then(result => {
    movieApi.fetchGenre().then(genreList => {
      result.results.forEach(movie => {
        movie.genre = [];
        movie.genre_ids.forEach(genre_id => {
          genreList.genres.forEach(genre => {
            if (Object.values(genre).includes(genre_id)) {
              movie.genre.push(genre.name);
            }
          })
        })
        moviesGallery.insertAdjacentHTML('beforeend',
          `<div class="movie-card">
          <img class="movie-card-poster" src="${IMG_URL}${movie.poster_path}" alt="Poster of movie">
          <div class="movie-card-info">
            <h1 class="movie-card-name">${movie.title}</h1>
            <p class="movie-card-genre-year">${movie.genre.join(', ')} | ${movie.release_date.slice(0, 4)}</p>
            <span class="movie-card-id">${movie.id}</span>
          </div>
        </div>`)
        loader.hide();
      })
    })
  })
  moviesGallery.addEventListener('click', movieClick);
}

function onSearch(e) {
  const InputValue = e.target.value;
  if (InputValue === '' || InputValue === null) {
    makeMarkupHome();
  }
  makeMarkupSearch(InputValue);
  movieApi.resetPage();
  movieApi.writeQuery(InputValue);
  movieApi.displayPagination();
}

function makeMarkupSearch(query) {
  loader.show();
  moviesGallery.innerHTML = '';
  movieApi.fetchSearch(query).then(result => {
    movieApi.fetchGenre().then(genreList => {
      result.results.forEach(movie => {
        movie.genre = [];
        movie.genre_ids.forEach(genre_id => {
          genreList.genres.forEach(genre => {
            if (Object.values(genre).includes(genre_id)) {
              movie.genre.push(genre.name);
            }
          })
        })
        moviesGallery.insertAdjacentHTML('beforeend',
          `<div class="movie-card">
          <img class="movie-card-poster" src="${IMG_URL}${movie.poster_path}" alt="Poster of movie">
          <div class="movie-card-info">
            <h1 class="movie-card-name">${movie.title}</h1>
            <p class="movie-card-genre-year">${movie.genre.join(', ')} | ${movie.release_date.slice(0, 4)}</p>
            <span class="movie-card-id">${movie.id}</span>
          </div>
        </div>`)
        loader.hide();
      })
    })
  })
  moviesGallery.addEventListener('click', movieClick);
}

export function makeMarkupLibrary(category) {
  moviesGallery.innerHTML = '';
  homeEl.classList.remove('nav-link-current');
  headerBack.classList.remove('background-home');
  headerBack.classList.add('background-library');
  libraryEl.classList.add('nav-link-current');
  paginationList.childNodes[3].innerHTML = '';
  nextBtn.setAttribute('disabled', 'true');
  previousBtn.setAttribute('disabled','true');
  headerChange.innerHTML = '';
  headerChange.insertAdjacentHTML('beforeend', `<button class="library-button library-button-current" type="button">Watched</button>
  <button class="library-button" type="button">Queue</button>`);
  if (currentUser !== null) {
    if (category === 'watched') {
      readMovieData('watched');
      } else if (category === 'queue') {
        readMovieData('queue');
    }
    
  } else {
    Notiflix.Notify.info(`Please log in to view your lists`);
  }
    headerChange.firstElementChild.addEventListener('click', onWatched);
    headerChange.lastElementChild.addEventListener('click', onQueue);
}

function onWatched() {
  if (currentUser !== null) {
    readMovieData('watched');
  } else {
    Notiflix.Notify.info(`Please log in to view your lists`);
    makeMarkupWatched(null);
  }
}

function onQueue() {
  if (currentUser !== null) {
    readMovieData('queue');
  } else {
    Notiflix.Notify.info(`Please log in to view your lists`);
    makeMarkupQueue(null);
  }
}

function makeMarkupWatched(movies) {
  moviesGallery.removeEventListener('click', movieClick);
  headerChange.firstElementChild.classList.add('library-button-current');
  headerChange.lastElementChild.classList.remove('library-button-current');
  headerChange.firstElementChild.removeEventListener('click', onWatched);
  headerChange.lastElementChild.addEventListener('click', onQueue);
  moviesGallery.innerHTML = "";
  if (movies === null || movies === undefined) {
    return
  }
  Object.values(movies).forEach(movie => {
    const genreList = [];
    movie.genres.forEach(genre => genreList.push(genre.name));
    moviesGallery.insertAdjacentHTML('beforeend', 
    `<div class="movie-card">
      <img class="movie-card-poster" src="${IMG_URL}${movie.poster_path}" alt="Poster of movie">
      <div class="movie-card-info">
        <h1 class="movie-card-name">${movie.title}</h1>
        <p class="movie-card-genre-year">${genreList.join(', ')} | ${movie.release_date.slice(0, 4)}</p>
        <span class="movie-card-id">${movie.id}</span>
      </div>
    </div>`)
  })
  moviesGallery.addEventListener('click', movieClick);
}

export function makeMarkupQueue(movies) {
  moviesGallery.removeEventListener('click', movieClick);
  headerChange.firstElementChild.classList.remove('library-button-current');
  headerChange.lastElementChild.classList.add('library-button-current');
  headerChange.lastElementChild.removeEventListener('click', onQueue);
  headerChange.firstElementChild.addEventListener('click', onWatched);
  moviesGallery.innerHTML = "";
  if (movies === null || movies === undefined) {
    return
  }
  Object.values(movies).forEach(movie => {
    const genreList = [];
    movie.genres.forEach(genre => genreList.push(genre.name));
    moviesGallery.insertAdjacentHTML('beforeend', 
    `<div class="movie-card">
      <img class="movie-card-poster" src="${IMG_URL}${movie.poster_path}" alt="Poster of movie">
      <div class="movie-card-info">
        <h1 class="movie-card-name">${movie.title}</h1>
        <p class="movie-card-genre-year">${genreList.join(', ')} | ${movie.release_date.slice(0, 4)}</p>
        <span class="movie-card-id">${movie.id}</span>
      </div>
    </div>`)
  })
  moviesGallery.addEventListener('click', movieClick);
}

function writeMovieData(movie, category) {
  if (currentUser === null || currentUser === undefined) {
    Notiflix.Notify.info(`Please log in for this action`);
  } else {
  const db = getDatabase();
  const reference = ref(db, `${currentUser.uid}/${category}/` + movie.id);
    set(reference, movie)
  }
}

export function readMovieData(category) {
  loader.show();
  const db = getDatabase();
  const distanceRef = ref(db, `${currentUser.uid}/${category}/`);
  get(distanceRef).then(snapshot => {
    const data = snapshot.val();
    if (category === 'watched') {
        makeMarkupWatched(data);
      }
      else if (category === 'queue') {
        makeMarkupQueue(data); 
    }
    loader.hide();
  })
}

async function checkBase(category, movie) {
  const db = getDatabase();
  const distanceRef = ref(db, `${currentUser.uid}/${category}/`);
  await get(distanceRef).then(snapshot => {
    const data = snapshot.val();
    if (movie !== undefined) {
      const modalBtns = document.querySelector('.modal-buttons');
      if (data === null && category === 'watched') {
        modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
      } else if (data === null && category === 'queue') {
        modalBtns.lastElementChild.addEventListener('click', onAddToQueue);
      } else {
        if (Object.keys(data).includes(String(movie.id)) && category === 'watched') {
          modalBtns.firstElementChild.classList.toggle('modal-button-activated-watched');
          modalBtns.firstElementChild.textContent = '';
          modalBtns.firstElementChild.addEventListener('click', onRemoveFromWatched);
        } else if (!Object.keys(data).includes(String(movie.id)) && category === 'watched') {
          modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
        } else if (Object.keys(data).includes(String(movie.id)) && category === 'queue') {
          modalBtns.lastElementChild.classList.toggle('modal-button-activated-queue');
          modalBtns.lastElementChild.textContent = '';
          modalBtns.lastElementChild.addEventListener('click', onRemoveFromQueue);
        } else if (!Object.keys(data).includes(String(movie.id)) && category === 'queue') {
          modalBtns.lastElementChild.addEventListener('click', onAddToQueue)
        }
      }
      
      async function onAddToWatched() {
        await get(ref(db, `${currentUser.uid}/queue/`)).then(snapshot => {
          const res = snapshot.val();
          if (res !== null) {
            if (Object.keys(res).includes(String(movie.id))) {
              modalBtns.innerHTML = "";
              modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
                <button type="button" class="modal-button">Add to queue</button>`);
              deleteMovieData(movie.id, 'queue');
              Notiflix.Notify.failure(`${movie.title} removed from queue`);
              if (headerChange.lastElementChild.classList.contains('library-button-current')) {
                readMovieData('queue');
              }
              modalBtns.lastElementChild.addEventListener('click', onAddToQueue);
            } else if (!Object.keys(res).includes(String(movie.id))) {
              modalBtns.innerHTML = "";
              modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
                <button type="button" class="modal-button">Add to queue</button>`);
            }
            writeMovieData(movie, 'watched');
            Notiflix.Notify.success(`${movie.title} added to watched`);
            modalBtns.firstElementChild.classList.toggle('modal-button-activated-watched');
            modalBtns.firstElementChild.textContent = '';
          }
        })
        if (headerChange.firstElementChild.classList.contains('library-button-current')) {
          readMovieData('watched');
        }
        if (headerChange.lastElementChild.classList.contains('library-button-current')) {
          readMovieData('queue');
        }
        modalBtns.firstElementChild.addEventListener('click', onRemoveFromWatched);
        modalBtns.lastElementChild.addEventListener('click', onAddToQueue);
      }

      function onRemoveFromWatched() {
        modalBtns.innerHTML = "";
        modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
          <button type="button" class="modal-button">Add to queue</button>`);
        deleteMovieData(movie.id, 'watched');
        Notiflix.Notify.failure(`${movie.title} removed from watched`);
        if (headerChange.firstElementChild.classList.contains('library-button-current')) {
          readMovieData('watched');
        }
        modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
        modalBtns.lastElementChild.addEventListener('click', onAddToQueue);
      }

      async function onAddToQueue() {
        await get(ref(db, `${currentUser.uid}/watched/`)).then(snapshot => {
          const res = snapshot.val();
          if (res !== null) {
            if (Object.keys(res).includes(String(movie.id))) {
              modalBtns.innerHTML = "";
              modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
            <button type="button" class="modal-button">Add to queue</button>`);
              deleteMovieData(movie.id, 'watched');
              Notiflix.Notify.failure(`${movie.title} removed from watched`);
              if (headerChange.firstElementChild.classList.contains('library-button-current')) {
                readMovieData('watched');
              }
              modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
            } else if (!Object.keys(res).includes(String(movie.id))) {
              modalBtns.innerHTML = "";
              modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
                <button type="button" class="modal-button">Add to queue</button>`);
            }
            writeMovieData(movie, 'queue');
            Notiflix.Notify.success(`${movie.title} added to queue`);
            modalBtns.lastElementChild.classList.toggle('modal-button-activated-queue');
            modalBtns.lastElementChild.textContent = '';
          }
        })
        if (headerChange.firstElementChild.classList.contains('library-button-current')) {
          readMovieData('watched');
        }
        if (headerChange.lastElementChild.classList.contains('library-button-current')) {
          readMovieData('queue');
        }
        modalBtns.lastElementChild.addEventListener('click', onRemoveFromQueue);
        modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
      }

      function onRemoveFromQueue() {
        modalBtns.innerHTML = "";
        modalBtns.insertAdjacentHTML('beforeend', `<button type="button" class="modal-button">Add to watched</button>
          <button type="button" class="modal-button">Add to queue</button>`);
        deleteMovieData(movie.id, 'queue');
        Notiflix.Notify.failure(`${movie.title} removed from queue`);
        if (headerChange.lastElementChild.classList.contains('library-button-current')) {
          readMovieData('queue');
        }
        modalBtns.lastElementChild.addEventListener('click', onAddToQueue);
        modalBtns.firstElementChild.addEventListener('click', onAddToWatched);
      }
    }
  })
}

function deleteMovieData(name, category) {
  const db = getDatabase();
  const movieRef = ref(db, `${currentUser.uid}/${category}/${name}`);
    set(movieRef, null);
}
export function onPagination(e) {
  if (!e.target.classList.contains('switch')) {
    return;
  } 
  if (movieApi.readQuery() === 'pop') {
    if (e.target.classList.contains('next-page')) {
    movieApi.incrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    } else if (e.target.classList.contains('next-btn')) {
    movieApi.incrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    } else if (e.target.classList.contains('next-next-page')) {
    movieApi.incrementPage();
    movieApi.incrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-page')) {
    movieApi.decrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-btn')) {
    movieApi.decrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-prev-page')) {
    movieApi.decrementPage();
    movieApi.decrementPage();
    makeMarkupHome();
    movieApi.displayPagination();
    }
  } else if (movieApi.readQuery() !== 'pop') {
      if (e.target.classList.contains('next-page')) {
    movieApi.incrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    } else if (e.target.classList.contains('next-btn')) {
    movieApi.incrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    } else if (e.target.classList.contains('next-next-page')) {
    movieApi.incrementPage();
    movieApi.incrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-page')) {
    movieApi.decrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-btn')) {
    movieApi.decrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    } else if (e.target.classList.contains('prev-prev-page')) {
    movieApi.decrementPage();
    movieApi.decrementPage();
    makeMarkupSearch(movieApi.readQuery());
    movieApi.displayPagination();
    }
  }
}

authorEl.addEventListener('click', (e) => {
  e.preventDefault();
  toggleModal();
  modalCardMovie.innerHTML = "";
  modal.classList.add('author-modal');
  const image = document.createElement("img");
  image.src = "/src/images/authorphoto.jpg";
  image.alt = "Author's photo";
  modalCardMovie.appendChild(image);
  modalCardMovie.insertAdjacentHTML('beforeend', `<div>
    <h1>Andrii Kyrylov</h1>
    <p>Budding web developer</p>
    <p>28 years old</p>
    <p>Hello, I am a beginner in web development and I want to present you my first project. In it, I used the knowledge and skills acquired during the course of JavaScript</p>
  </div>`)
});