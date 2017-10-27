class RemarkSearch {
  constructor(options) {
    this.matches = [];
    this.currentMatch = -1;

    this.div = document.createElement('div');
    this.div.classList.add('search');
    this.div.style.zIndex = '9999';
    this.div.innerHTML = '<form><input></form><a id="search-open"><i class="fa fa-search"></i></a>'

    let area = document.querySelector('.remark-slides-area');
    area.insertBefore(this.div, area.firstchild);

    this.setUpKeyListener();
    this.setUpPosition();
    this.setUpForm();
    this.setUpIcons();
  }

  static create(options) {
    return new RemarkSearch(options);
  }

  setUpPosition() {
    let self = this;
    $(window).resize(function() {
      self.updatePosition();
    });
    this.updatePosition();
  }

  setUpIcons() {
    let self = this;

    this.div.querySelector('#search-open').addEventListener('click', function(event){
      self.toggleSearch();
    });
  }

  setUpKeyListener() {
    let self = this;
    document.addEventListener('keydown', function(event) {
      if (event.ctrlKey && event.key == 'f') {
        event.preventDefault();
        self.openSearch();
        return false;
      }

      if (event.keyCode == 27) {
        self.closeSearch();
      }

      if (event.key == "F3") {
        if (self.matches.length == 0) {
          return self.doSearch(event);
        } else {
          if (event.shiftKey)
            return self.showMatch(event, -1);
          else
            return self.showMatch(event, 1);
        }
      }
    });
  }

  setUpForm() {
    var self = this;

    let form = this.div.querySelector('form');
    form.addEventListener('submit', function(event) {
      if (self.matches.length == 0) {
        return self.doSearch(event);
      } else {
        return self.showMatch(event, 1);
      }
    });
    this.setUpInput();
  }

  setUpInput() {
    let self = this;
    let input = this.div.querySelector('form input');
    input.addEventListener('focus', function(event) {
      slideshow.pause();
    });
    input.addEventListener('blur', function(event) {
      slideshow.resume();
    });
    input.addEventListener('input', function(event) {
      self.cleanSearch();
    });
  }

  updatePosition() {
    let scaler = document.querySelector('.remark-visible .remark-slide-scaler');
    let top = (document.body.clientHeight - scaler.getBoundingClientRect().height) / 2 + 20;
    let right = (document.body.clientWidth - scaler.getBoundingClientRect().width) / 2 + 20;

    this.div.style.top = top + "px";
    this.div.style.right = right + "px";
  }

  openSearch() {
    let input = this.div.querySelector('form input');

    input.value = '';
    this.cleanSearch();

    input.style.opacity = '1';
    input.focus();
  }

  toggleSearch() {
    let input = this.div.querySelector('form input');
    if (input.style.opacity == '' || parseInt(input.style.opacity) == '0') {
      this.openSearch();
    } else {
      this.closeSearch();
    }
  }

  closeSearch() {
    let input = this.div.querySelector('form input');

    input.value = '';
    input.style.opacity = '0';
    input.blur();

    this.cleanSearch();
  }

  cleanSearch() {
    this.currentMatch = -1;
    this.matches = [];

    var context = document.querySelectorAll(".remark-slide");
    var instance = new Mark(context);
    instance.unmark();
  }

  doSearch(event) {
    event.preventDefault();
    let self = this;

    let term = this.div.querySelector('form input').value;

    this.cleanSearch();

    var context = document.querySelectorAll(".remark-slide");
    var instance = new Mark(context);

    instance.mark(term, {
      "separateWordSearch": false,
      "each": function(match){
        self.matches.push(match);
      },
      "done": function(){
        if (self.matches.length != 0)
          self.showMatch(event, 1);
      }
    });

    return false;
  }

  showMatch(event, delta) {
    event.preventDefault();

    if (this.matches.length == 0)
      return this.doSearch(event);

    let oldMatches = document.querySelectorAll('.current-match');
    for (let i = 0; i < oldMatches.length; i++)
        oldMatches[i].classList.remove("current-match");

    this.currentMatch += delta;

    let match = this.matches[this.currentMatch];
    console.log("match = " + this.currentMatch);
    if (match == null) {
      if (delta == -1)
        this.currentMatch = this.matches.length;
      else
        this.currentMatch = -1;
      return this.showMatch(event, delta);
    }
    match.classList.add('current-match');

    while (!match.classList.contains('remark-slide-container')) {
      match = match.parentElement;
    };

    let index = 1;
    while (match.previousSibling != null) {
      match = match.previousSibling;
      index++;
    };
    console.log("slide = " + index + " - " + slideshow.getCurrentSlideIndex());

    if (slideshow.getCurrentSlideIndex() + 1 != index)
      slideshow.gotoSlide(index);

    return false;
  }

}
