const modal = document.querySelector('[data-modal]');
const closeBtn = document.querySelector('[data-modal-close');

function onBackdrop(e) {
  if (e.target.classList.contains('backdrop')) {
    toggleModal();
    modal.firstElementChild.classList.remove('auth-modal');
    modal.firstElementChild.classList.remove('author-modal');
  }
}

function onCloseBtn(e) {
  toggleModal();
  modal.firstElementChild.classList.remove('auth-modal');
  modal.firstElementChild.classList.remove('author-modal');
}

function onEsc(e) {
    if (e.key === 'Escape') {
      toggleModal();
      modal.firstElementChild.classList.remove('auth-modal');
      modal.firstElementChild.classList.remove('author-modal');
    }
}
  
export function toggleModal() {
  document.body.classList.toggle("modal-open");
  modal.classList.toggle("is-hidden");
  if (document.body.classList.contains("modal-open")) {
    document.addEventListener('keyup', onEsc);
    modal.addEventListener('click', onBackdrop);
    closeBtn.addEventListener('click', onCloseBtn);
  } else {
    document.removeEventListener('keyup', onEsc);
    modal.removeEventListener('click', onBackdrop);
    closeBtn.removeEventListener('click', onCloseBtn);
  }
}
