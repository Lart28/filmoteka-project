import { onPagination } from "..";
const API_KEY = 'api_key=af02fe4d7c3feb4bd28b36239d2e4dd2';
const BASE_URL = 'https://api.themoviedb.org/3';
const paginationList = document.querySelector('.num-page');
const numPages = document.querySelector('.pages');
const previousBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');


export default class movieApiService {
  constructor() {
    this.page = 1;
    this.query = '';
  }
  async fetchPop() {
    try {
      const response = await fetch(`${BASE_URL}/trending/movie/day?${API_KEY}&page=${this.page}`)
      return response.json();
    } catch (error) {
      console.error(error);
    }
  }
  async fetchGenre() {
    try {
      const response = await fetch(`${BASE_URL}/genre/movie/list?${API_KEY}`)
      return response.json();
    } catch (error) {
      console.error(error);
    }
  }
  async fetchSearch(name) {
    try {
      const response = await fetch(`${BASE_URL}/search/movie?query=${name.replaceAll(' ', '+')}&${API_KEY}&page=${this.page}`);
      return response.json();
    } catch (error) {
      console.error(error);
    }
  }
  async fetchDetails(name) {
try {
      const response = await fetch(`${BASE_URL}/movie/${name}?${API_KEY}`);
      return response.json();
    } catch (error) {
      console.error(error);
    }
  }
  async displayPagination() {
    paginationList.childNodes[3].innerHTML = '';
    let result = null;
    if (this.query === 'pop') {
      result = await this.fetchPop();
    } else if (this.query !== 'pop') {
      result = await this.fetchSearch(this.query);
    }
    numPages.insertAdjacentHTML('beforeend', `<li class="current-page-block">${this.page}</li>`);
    if (result.page < result.total_pages) {
      nextBtn.removeAttribute('disabled');
      numPages.insertAdjacentHTML('beforeend', `<li class="page next-page switch">${this.page + 1}</li>`);
    }
    if ((result.total_pages - result.page) >= 2) {
      numPages.insertAdjacentHTML('beforeend', `<li class="page next-next-page switch">${this.page + 2}</li>`)
    }
    if (result.page > 1) {
      previousBtn.removeAttribute('disabled');
      numPages.insertAdjacentHTML('afterbegin', `<li class="page prev-page switch">${this.page - 1}</li>`)
    }
    if (result.page > 2) {
      numPages.insertAdjacentHTML('afterbegin', `<li class="page prev-prev-page switch">${this.page - 2}</li>`)
    }
    if (result.page === 1) {
      previousBtn.setAttribute('disabled','true');
    }
    if (result.page === result.total_pages) {
      nextBtn.setAttribute('disabled','true');
    }
    paginationList.addEventListener('click', onPagination, {once: true})
  }
  incrementPage(){
    this.page += 1;
  }
  decrementPage(){
    this.page -= 1;
  }
  resetPage() {
    this.page = 1;
  }
  readQuery() {
    return this.query;
  }
  writeQuery(newQuery) {
    this.query = newQuery;
  }
}