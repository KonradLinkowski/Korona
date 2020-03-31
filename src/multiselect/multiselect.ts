import './multiselect.css';

enum Keys {
  Backspace = 'Backspace',
  Clear = 'Clear',
  Down = 'ArrowDown',
  End = 'End',
  Enter = 'Enter',
  Escape = 'Escape',
  Home = 'Home',
  Left = 'ArrowLeft',
  PageDown = 'PageDown',
  PageUp = 'PageUp',
  Right = 'ArrowRight',
  Space = ' ',
  Tab = 'Tab',
  Up = 'ArrowUp'
};

enum MenuActions {
  Close = 0,
  CloseSelect = 1,
  First = 2,
  Last = 3,
  Next = 4,
  Open = 5,
  Previous = 6,
  Select = 7,
  Space = 8,
  Type = 9
};

// filter an array of options against an input string
// returns an array of options that begin with the filter string, case-independent
function filterOptions(options: string[] = [], filter: string, exclude: string[] = []) {
  return options.filter(option => {
    const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option) < 0;
  });
}

// return combobox action from key press
function getActionFromKey(key: Keys, menuOpen: boolean) {
  // handle opening when closed
  if (!menuOpen && key === Keys.Down) {
    return MenuActions.Open;
  }

  // handle keys when open
  if (key === Keys.Down) {
    return MenuActions.Next;
  }
  else if (key === Keys.Up) {
    return MenuActions.Previous;
  }
  else if (key === Keys.Home) {
    return MenuActions.First;
  }
  else if (key === Keys.End) {
    return MenuActions.Last;
  }
  else if (key === Keys.Escape) {
    return MenuActions.Close;
  }
  else if (key === Keys.Enter) {
    return MenuActions.CloseSelect;
  }
  else if (key === Keys.Backspace || key === Keys.Clear || key.length === 1) {
    return MenuActions.Type;
  }
}

// get updated option index
function getUpdatedIndex(current: number, max: number, action: MenuActions) {
  switch(action) {
    case MenuActions.First:
      return 0;
    case MenuActions.Last:
      return max;
    case MenuActions.Previous:
      return Math.max(0, current - 1);
    case MenuActions.Next:
      return Math.min(max, current + 1);
    default:
      return current;
  }
}

// check if an element is currently scrollable
function isScrollable(element: HTMLElement) {
  return element && element.clientHeight < element.scrollHeight;
}

// ensure given child element is within the parent's visible scroll area
function maintainScrollVisibility(activeElement: HTMLElement, scrollParent: HTMLElement) {
  const { offsetHeight, offsetTop } = activeElement;
  const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

  const isAbove = offsetTop < scrollTop;
  const isBelow = (offsetTop + offsetHeight) > (scrollTop + parentOffsetHeight);

  if (isAbove) {
    scrollParent.scrollTo(0, offsetTop);
  }
  else if (isBelow) {
    scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
  }
}

export interface EventListener {
  event: string;
  callback: (data: any) => any
};

export class MultiselectButtons {
  comboEl: HTMLElement;
  inputEl: HTMLInputElement;
  listboxEl: HTMLElement;
  idBase: string;
  selectedEl: HTMLElement;
  activeIndex = 0;
  open = false;
  ignoreBlur: boolean;
  filteredOptions: any[];
  selectedOptions: string[] = [];
  eventListeners: EventListener[] = [];

  constructor(private el: HTMLElement, private options: any[]) {
    // element refs
    this.comboEl = el.querySelector('[role=combobox]');
    this.inputEl = el.querySelector('input');
    this.listboxEl = el.querySelector('[role=listbox]');

    this.idBase = this.inputEl.id;
    this.selectedEl = document.getElementById(`${this.idBase}-selected`);

    // data
    this.filteredOptions = this.options;

    this.init();
  }

  init() {
    this.inputEl.addEventListener('input', this.onInput.bind(this));
    this.inputEl.addEventListener('blur', this.onInputBlur.bind(this));
    this.inputEl.addEventListener('click', () => this.updateMenuState(true));
    this.inputEl.addEventListener('keydown', this.onInputKeyDown.bind(this));

    this.options.map((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.setAttribute('role', 'option');
      optionEl.id = `${this.idBase}-${index}`;
      optionEl.className = index === 0 ? 'combo-option option-current' : 'combo-option';
      optionEl.setAttribute('aria-selected', 'false');
      optionEl.innerText = option;

      optionEl.addEventListener('click', () => { this.onOptionClick(index); });
      optionEl.addEventListener('mousedown', this.onOptionMouseDown.bind(this));

      this.listboxEl.appendChild(optionEl);
    });
  }

  filterOptions(value: string) {
    this.filteredOptions = filterOptions(this.options, value);

    // hide/show options based on filtering
    const options = this.el.querySelectorAll('[role=option]') as NodeListOf<HTMLElement>;
    [...options].forEach(optionEl => {
      const val = optionEl.innerText;
      if (this.filteredOptions.indexOf(val) > -1) {
        optionEl.style.display = 'block';
      }
      else {
        optionEl.style.display = 'none';
      }
    });
  }

  onInput() {
    const curValue = this.inputEl.value;
    this.filterOptions(curValue);

    // if active option is not in filtered options, set it to first filtered option
    if (this.filteredOptions.length && this.filteredOptions.indexOf(this.options[this.activeIndex]) === -1) {
      const firstFilteredIndex = this.options.indexOf(this.filteredOptions[0]);
      this.onOptionChange(firstFilteredIndex);
    }

    const menuState = this.filteredOptions.length > 0;
    if (this.open !== menuState) {
      this.updateMenuState(menuState, false);
    }
  }

  onInputKeyDown(event: KeyboardEvent) {
    const { key } = event;

    const max = this.filteredOptions.length - 1;
    const activeFilteredIndex = this.filteredOptions.indexOf(this.options[this.activeIndex]);

    const action = getActionFromKey(key as Keys, this.open);

    switch(action) {
      case MenuActions.Next:
      case MenuActions.Last:
      case MenuActions.First:
      case MenuActions.Previous:
        event.preventDefault();
        return this.onOptionChange(
          this.options.indexOf(
            this.filteredOptions[
              getUpdatedIndex(activeFilteredIndex, max, action)
            ]
          )
        );
      case MenuActions.CloseSelect:
        event.preventDefault();
        return this.updateOption(this.activeIndex);
      case MenuActions.Close:
        event.preventDefault();
        return this.updateMenuState(false);
      case MenuActions.Open:
        return this.updateMenuState(true);
    }
  }

  onInputBlur() {
    if (this.ignoreBlur) {
      this.ignoreBlur = false;
      return;
    }

    if (this.open) {
      this.updateMenuState(false, false);
    }
  }

  onOptionChange(index: number) {
    this.activeIndex = index;
    this.inputEl.setAttribute('aria-activedescendant', `${this.idBase}-${index}`);

    // update active style
    const options = this.el.querySelectorAll('[role=option]');
    [...options].forEach(optionEl => {
      optionEl.classList.remove('option-current');
    });
    options[index].classList.add('option-current');

    if (this.open && isScrollable(this.listboxEl)) {
      maintainScrollVisibility(options[index] as HTMLElement, this.listboxEl);
    }
  }

  onOptionClick(index: number) {
    this.onOptionChange(index);
    this.updateOption(index);
    this.inputEl.focus();
  }

  onOptionMouseDown() {
    this.ignoreBlur = true;
  }

  removeOption(index: number) {
    // update aria-selected
    const options = this.el.querySelectorAll('[role=option]');
    options[index].setAttribute('aria-selected', 'false');
    options[index].classList.remove('option-selected');

    // remove button
    const buttonEl = document.getElementById(`${this.idBase}-remove-${index}`);
    this.selectedEl.removeChild(buttonEl.parentElement);
    this.selectedOptions.splice(this.selectedOptions.indexOf(this.options[index]), 1);
    this.emitEvent('change');
  }

  selectOption(index: number) {
    const selected = this.options[index];
    this.activeIndex = index;

    // update aria-selected
    const options = this.el.querySelectorAll('[role=option]');
    options[index].setAttribute('aria-selected', 'true');
    options[index].classList.add('option-selected');

    // add remove option button
    const buttonEl = document.createElement('button');
    const listItem = document.createElement('li');
    buttonEl.className = 'remove-option';
    buttonEl.type = 'button';
    buttonEl.id = `${this.idBase}-remove-${index}`;
    buttonEl.setAttribute('aria-describedby', `${this.idBase}-remove`);
    buttonEl.addEventListener('click', () => { this.removeOption(index); });
    buttonEl.innerHTML = selected + ' ';

    listItem.appendChild(buttonEl);
    this.selectedEl.appendChild(listItem);
    this.selectedOptions.push(this.options[index]);
    this.emitEvent('change');
  }

  updateOption(index: number) {
    const optionEls = this.el.querySelectorAll('[role=option]');
    const optionEl = optionEls[index];
    const isSelected = optionEl.getAttribute('aria-selected') === 'true';

    if (isSelected) {
      this.removeOption(index);
    }

    else {
      this.selectOption(index);
    }

    this.inputEl.value = '';
    this.filterOptions('');
  }

  updateMenuState(open: boolean, callFocus = true) {
    this.open = open;

    this.comboEl.setAttribute('aria-expanded', `${open}`);
    open ? this.el.classList.add('open') : this.el.classList.remove('open');
    if (callFocus) {
      this.inputEl.focus();
    }
  }

  addEventListener(event: string, callback: (data: any) => any) {
    this.eventListeners.push({ event, callback });
  }

  emitEvent(event: string) {
    this.eventListeners.filter(e => e.event === event).forEach(e => e.callback([...this.selectedOptions]));
  }
}
