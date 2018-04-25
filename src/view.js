const getCurrentPostIt = (target) => {
  const id = parseInt(target.offsetParent.dataset.id);
  const expand = target.offsetParent.classList.value.indexOf('expand') > 0;

  return {id, expand};
}

export default class View {
  constructor(template) {
    this.template = template;
    this.board = document.getElementById('board');

    this.postitContext = document.getElementById('postit-context');
    this.boardContext = document.getElementById('board-context');
    this.newPostit = document.querySelector('.new-postit');
    this.orderPostit = document.querySelector('.order-postit');
    this.clearAll = document.querySelector('.clear-all');

    this.bindContextEvent();
  }

  hideContextMenu() {
    this.postitContext.style.display = 'none';
    this.boardContext.style.display = 'none';
  }

  showContextMenu(el, pageX, pageY) {
    el.style.left = `${pageX}px`;
    el.style.top = `${pageY}px`;
    el.style.display = 'block';
  }

  showPostitList(items) {
    this.board.innerHTML = this.template.list(items);
  }

  showPostit(item) {
    let template = this.template.postit(item);
    let postit = document.createElement('div');
    postit.className = 'postit expand';
    postit.dataset.id = item.id;
    postit.draggable = true;
    postit.innerHTML = template;

    this.board.appendChild(postit);
  }

  bindMove(handler) {
    const board = this.board;
    let dragging = false, previousmouse, target, dragTarget;


    board.onmousedown = function (e) {
      dragging = true;
      previousmouse = {x: e.pageX, y: e.pageY};
    }

    board.onmouseup = function () {
      dragging = false;
      dragTarget = 0;
    }

    board.ondragstart = function (e) {
      e.preventDefault();
    }

    board.onmousemove = function (e) {
      target = e.target;

      if (dragging && target.offsetParent && target.offsetParent.matches('.postit')) {
        let currentPostit = getCurrentPostIt(target);
        let translate = '';

        if(dragTarget && (dragTarget !== target.offsetParent)) {
          return;
        }

        dragTarget = target.offsetParent;

        // console.log('dragTarget.x ', dragTarget.x )
        dragTarget.x = !dragTarget.x ? 0 : dragTarget.x;

        dragTarget.y = !dragTarget.y ? 0 : dragTarget.y;
        dragTarget.x += e.pageX - previousmouse.x;
        dragTarget.y += e.pageY - previousmouse.y;

        translate = 'translate(' + dragTarget.x + 'px, ' + dragTarget.y + 'px)';

        dragTarget.style.transform = translate;

        previousmouse = {x: e.pageX, y: e.pageY};

        handler(currentPostit.id, {translate: translate})
      }
    }
  }

  bindContextEvent() {
    this.board.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const {target} = e;

      if (target && target.id === 'board') {
        this.hideContextMenu();

        const pageX = e.pageX;
        const pageY = e.pageY;

        this.showContextMenu(this.boardContext, pageX, pageY);
      }
    });

    this.board.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target;

      this.hideContextMenu();
    })
  }

  bindPostitContextEvent(handler) {
    this.board.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      const {target} = e;

      if (target && target.id !== 'board') {
        this.hideContextMenu();

        const pageX = e.pageX;
        const pageY = e.pageY;

        let currentPostit = getCurrentPostIt(target);

        let show = (item) => {
          this.postitContext.innerHTML = this.template.contextMenu(item);
          this.showContextMenu(this.postitContext, pageX, pageY);

        }

        handler(currentPostit.id, show, 'expand');
      }
    });
  }

  bindAddPostit(handler) {
    this.newPostit.addEventListener('click', () => {
      this.hideContextMenu();
      handler();
    });
  }

  bindClearAll(handler) {
    this.clearAll.addEventListener('click', () => {
      this.hideContextMenu();
      handler();
    });
  }

  bindOrderPostit(handler) {
    this.orderPostit.addEventListener('click', () => {
      this.hideContextMenu();
      handler();
    });
  }

  bindRemovePostit(handler) {
    this.board.addEventListener('click', (e) => {
      e.preventDefault();

      const {target} = e;

      if (target && target.matches('.remove')) {
        handler(getCurrentPostIt(target).id);
      }
    });
  }

  bindEditPostit(handler) {
    this.board.addEventListener('focusout', (e) => {
      const {target} = e;

      if (target && target.matches('textarea')) {
        handler(getCurrentPostIt(target).id, {content: target.value}, true);
      }
    });
  }

  bindTogglePostit(handler) {
    this.board.addEventListener('click', ({target}) => {
      if (target && target.matches('.caret')) {
        const currentPostIt = getCurrentPostIt(target);

        handler(currentPostIt.id, !currentPostIt.expand);
      }
    });
  }

  bindContextMenu(handler) {
    const hide = () => {
      this.hideContextMenu();
    }

    this.postitContext.addEventListener('click', e => {
      const {target} = e;
      const currentPostIt = getCurrentPostIt(target);

      if (target.matches('.expand')) {
        handler(currentPostIt.id, hide, 'expand');
      } else if (target.matches('.remove')) {
        handler(currentPostIt.id, hide, 'remove');
      } else if (target.matches('order')) {
        handler(currentPostIt.id, hide, 'order');
      }

    })

    this.postitContext.addEventListener('change', e => {
      const {target} = e;
      const currentPostIt = getCurrentPostIt(target);

      if (target.matches('.background')) {
        let color = target.options[target.options.selectedIndex].value;

        handler(currentPostIt.id, '', 'edit-backgroud', color);
      } else if (target.matches('.fontsize')) {
        let size = target.options[target.options.selectedIndex].value;

        handler(currentPostIt.id, '', 'edit-fontsize', size);
      } else if (target.matches('.color')) {
        let color = target.options[target.options.selectedIndex].value;

        handler(currentPostIt.id, '', 'edit-color', color);
      }

    })
  }

}