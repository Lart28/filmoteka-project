import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { toggleModal } from "./modal";
import { readMovieData, makeMarkupLibrary } from "..";
import Notiflix from 'notiflix';
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
const auth = getAuth();
const profile = document.querySelector('.nav-list');
const modal = document.querySelector('.modal');
const modalCardMovie = document.querySelector('.modal-card-movie');
export let currentUser = null;

export function createMarkupAuth() {
  profile.insertAdjacentHTML('beforeend', '<li class="nav-list-item"><a class="nav-link sign-link"><svg width="20" height="20" viewBox="0 0 32 32" fill=white><path d="M18 22.082v-1.649c2.203-1.241 4-4.337 4-7.432 0-4.971 0-9-6-9s-6 4.029-6 9c0 3.096 1.797 6.191 4 7.432v1.649c-6.784 0.555-12 3.888-12 7.918h28c0-4.030-5.216-7.364-12-7.918z"></path></svg></a></li>');
  profile.lastElementChild.addEventListener('click', openAuthModal);
}

export function createMarkupUser() {
  profile.lastElementChild.remove();
  profile.insertAdjacentHTML('beforeend', `<li class="nav-list-item"><a class="nav-link sign-link"><p>${currentUser.email.split('@')[0]}</p></a></li>`);
  profile.insertAdjacentHTML('beforeend', '<div class="profile-menu-select" style="opacity: 0;"><ul><li>My Watched</li><li>My Queue</li><li>Log Out</li></ul></div>');
  profile.lastElementChild.previousElementSibling.addEventListener('click', openProfileMenuSelect, { once: true });
  const button = document.querySelector('.header-change');
  if (button.firstElementChild.classList.contains('library-button-current')) {
    readMovieData('watched');
  } else if (button.lastElementChild.classList.contains('library-button-current')) {
    readMovieData('queue');
  }
}

function openProfileMenuSelect() {
  profile.lastElementChild.previousElementSibling.classList.add('nav-link-current');
  const profileMenuSelect = document.querySelector('.profile-menu-select');
  profileMenuSelect.style.opacity = "1";
  profileMenuSelect.style.pointerEvents = "auto";
  profileMenuSelect.firstElementChild.firstElementChild.addEventListener('click', () => makeMarkupLibrary('watched'));
  profileMenuSelect.firstElementChild.firstElementChild.nextElementSibling.addEventListener('click', () => makeMarkupLibrary('queue'));
  profileMenuSelect.firstElementChild.lastElementChild.addEventListener('click', LogOut);
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('.profile-menu-select')) {
        profileMenuSelect.style.opacity = "0";
        profile.lastElementChild.previousElementSibling.addEventListener('click', openProfileMenuSelect, { once: true });
        profile.lastElementChild.previousElementSibling.classList.remove('nav-link-current');
        profileMenuSelect.style.pointerEvents = "none";
      }
    }, { once: true });
  }, 100);
  setTimeout(() => {
    profile.lastElementChild.previousElementSibling.addEventListener('click', (e) => {
      if (!e.target.classList.contains('.profile-menu-select')) {
        profileMenuSelect.style.opacity = "0";
        profile.lastElementChild.previousElementSibling.addEventListener('click', openProfileMenuSelect, { once: true });
        profile.lastElementChild.previousElementSibling.classList.remove('nav-link-current');
        profileMenuSelect.style.pointerEvents = "none";
      }
    }, { once: true });
  }, 100);
}

function LogOut() {
  profile.lastElementChild.previousElementSibling.remove();
  createMarkupAuth();
  currentUser = null;
  const library = document.querySelector('.library-link');
  if (library.classList.contains('nav-link-current')) {
    const moviesGallery = document.querySelector('.movies-gallery');
    moviesGallery.innerHTML = "";
  }
  const profileMenuSelect = document.querySelector('.profile-menu-select');
  profileMenuSelect.remove();
}

function makeMarkupModalAuth(action) {
  const formHeader = document.querySelector('.form-header');
  if (action === 'signup') {
    formHeader.classList.add('form-header-signup');
    modalCardMovie.firstElementChild.insertAdjacentHTML('beforeend', `<div class="signup-form"><p>Please fill in this form to create an account.</p>
      <hr>
      <div class="auth-form-field">
        <input class="auth-form-input" type="text" placeholder=" " name="email" id="email">
        <label class="auth-form-label" name="email" for="email"><b>Email</b></label>
      </div>
      <div class="auth-form-field">
        <input class="auth-form-input" type="password" placeholder=" " name="psw" id="psw">
        <label class="auth-form-label" name="psw" for="psw"><b>Password</b></label>
      </div>
      <div class="auth-form-field">
        <input class="auth-form-input" type="password" placeholder=" " name="psw-repeat" id="psw-repeat">
        <label class="auth-form-label" name="psw-repeat" for="psw-repeat"><b>Repeat Password</b></label>
      </div>
        <button type="submit" class="submitbtn">Sign Up</button>
    </div>`);
  }
  if (action === 'login') {
    formHeader.classList.add('form-header-login');
    modalCardMovie.firstElementChild.insertAdjacentHTML('beforeend', `<div class="login-form"><p>Please fill in this form to log in an account.</p>
      <hr>
      <div class="auth-form-field">
        <input class="auth-form-input" type="text" placeholder=" " name="email" id="email">
        <label class="auth-form-label" name="email" for="email"><b>Email</b></label>
      </div>
      <div class="auth-form-field">
        <input class="auth-form-input" type="password" placeholder=" " name="psw" id="psw">
        <label class="auth-form-label" name="psw" for="psw"><b>Password</b></label>
      </div>
        <button type="submit" class="submitbtn">Log In</button>
    </div>`);
  }
  const authForm = document.querySelector('.auth-form');
  if (formHeader.classList.contains('form-header-login')) {
    authForm.addEventListener('submit', handleLoginSubmit);
  } else if (formHeader.classList.contains('form-header-signup')) {
    authForm.addEventListener('submit', handleSignupSubmit);
  }
}
function openAuthModal() {
  toggleModal();
  modal.classList.add('auth-modal');
  modalCardMovie.innerHTML = "";
  modalCardMovie.insertAdjacentHTML('beforeend', `<form class="auth-form">
      <div class="form-header">
        <h1 class="signup">Sign Up</h1>
        <h1 class="login">Log In</h1>
      </div>
  </form>`);
  const signup = document.querySelector('.signup');
  const login = document.querySelector('.login');
  const formHeader = document.querySelector('.form-header');
  const authForm = document.querySelector('.auth-form');
  signup.addEventListener('click', () => {
    formHeader.nextElementSibling.remove();
    formHeader.classList.remove('form-header-login');
    authForm.removeEventListener('submit', handleLoginSubmit);
    makeMarkupModalAuth('signup');
  });
  login.addEventListener('click', () => {
    formHeader.nextElementSibling.remove();
    formHeader.classList.remove('form-header-signup');
    authForm.removeEventListener('submit', handleSignupSubmit);
    makeMarkupModalAuth('login');
  });
  makeMarkupModalAuth('login');
}

function handleSignupSubmit(e) {
    e.preventDefault();
    const {
    elements: { email, psw }
    } = e.currentTarget;
    createUserWithEmailAndPassword(auth, email.value, psw.value)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    currentUser = user;
    writeUser();
    setTimeout(() => {
      toggleModal();
      modal.classList.remove('auth-modal');
      createMarkupUser();
    },250)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
    Notiflix.Notify.failure(`${errorCode}`);
  });
  }

async function handleLoginSubmit(e) {
  e.preventDefault();
    const {
    elements: { email, psw }
  } = e.currentTarget;
  await signInWithEmailAndPassword(auth, email.value, psw.value)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    currentUser = user;
    setTimeout(() => {
      toggleModal();
      modal.classList.remove('auth-modal');
      createMarkupUser();
    },250)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    Notiflix.Notify.failure(`${errorCode}`);
  });
}

  
