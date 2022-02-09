  let navButton = document.querySelector(".page-header__button");
  let navSiteList = document.querySelector(".site-list");
  let navUserList = document.querySelector(".user-list");
  console.log ("close login-esc");

  navSiteList.classList.remove("site-list--open");
  navSiteList.classList.add("site-list--closed");
  navUserList.classList.remove("user-list--open");
  navUserList.classList.add("user-list--closed");
  navButton.classList.remove("page-header__button--open");
  navButton.classList.add("page-header__button--closed");

  navButton.addEventListener('click', function() {
    if (navSiteList.classList.contains('site-list--closed')) {
      navSiteList.classList.remove("site-list--closed");
  navSiteList.classList.add("site-list--open");
  navUserList.classList.remove("user-list--closed");
  navUserList.classList.add("user-list--open");
  navButton.classList.remove("page-header__button--closed");
  navButton.classList.add("page-header__button--open");
    } else {
      navSiteList.classList.remove("site-list--open");
  navSiteList.classList.add("site-list--closed");
  navUserList.classList.remove("user-list--open");
  navUserList.classList.add("user-list--closed");
  navButton.classList.remove("page-header__button--open");
  navButton.classList.add("page-header__button--closed");
    }
  })



