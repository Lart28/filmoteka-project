const loaderSpinnerEl = document.querySelector('[data-loader-spinner]');

export default class loaderSpinner {
  constructor() {
    
  }
  show() {
    loaderSpinnerEl.classList.remove('is-hidden');
  };
  hide() {
    loaderSpinnerEl.classList.add('is-hidden');
  }
}