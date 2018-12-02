const FIELD_WRAPPER = document.getElementById('wrapper');
const CONTAINER = document.getElementById('container');

options = {
  addBtnMessage: 'Added',
  errorAddBtnMessage: 'Cannot add button: value is not a number'
}


class ButtonsBlock {
  /* parametrs:
      --wrapper: DOM element, in wich this block will be added
      --field: DOM element, in wich this class will add buttons
  */
  constructor(wrapper, field) {
    //create block element
    this._element = document.createElement('div');
    this._element.classList.add('buttons_block');
    //end of creating block element

    //add to wrapper
    wrapper.appendChild(this._element);
    //end of addong to wrapper

    //buutons array, in this case added have optional items
    this._btnsArr = [
      new Section(this._element, this, field, 5),
      new Section(this._element, this, field, 5),
      new Section(this._element, this, field, 10),
      new Section(this._element, this, field, 11),
      new Section(this._element, this, field, 15),
      new Section(this._element, this, field, 3),
      new Section(this._element, this, field, 7)
    ];
  };

  getBtnsArr() {
    return this._btnsArr;
  }

  getElement() {
    return this._element;
  }
};


class Button {
  /* parametrs:
      --parentElement: DOM element, in wich this block will be added
      --parentElementClass: class of DOM element, in wich this class will add buttons
      --length: length of section
      --insertBefore: bool, if true add button before DOM, element, wich will be added to nextElement prop
      --nextElement: DOM element, before wich button will be added
  */
  constructor(parentElement, parentElementClass, length, insertBefore, nextElement) {
    this._parentBlock = parentElement;
    //create button
    this._element = document.createElement('button');
    this._element.innerHTML = length;
    //end create button

    //add buutton to DOM
    if (!insertBefore || insertBefore && !nextElement) {
      this._parentBlock.appendChild(this._element);
    } else {
      this._parentBlock.insertBefore(this._element, nextElement);
    }
    //end add button to DOM

    this._length = length;
    this._parentElementClass = parentElementClass;
  }
}


class Section extends Button {
  constructor(parentElement,  parentElementClass, fieldClass, length) {
    super(parentElement,  parentElementClass, length);
    this._field = fieldClass;

    //remove from parent method
    this.removeFromParent = () => {
      //remove from DOM
      this._parentBlock.removeChild(this._element);
      //end remove from DOM

      //if free places is not exist add to the end of line
      if (!this._field.getfreePlaceArr().length) {
        this._field.getlinesArr().push(new AppendSection( this._field.getField(), this._field, this._length ));
      } else {
        //get array of free places
        let arr = this._field.getfreePlaceArr();
        //first element of array
        let first = 0;
        //last element of array
        let last = arr.length - 1;

        //find element by binary algorithm
        while (first < last) {
          let mid = first + Math.floor((last - first) / 2);
          if (arr[mid][1] >= this._length) last = mid;
          else first = mid + 1;
       }

       let currElement;
       let nextElement;
       let closestElement = arr[last];

       if (closestElement[1] >= this._length) {
          currElement = this._field.getlinesArr()[closestElement[0]].getElement();
          nextElement = currElement.nextElementSibling;
          this._field.getField().removeChild(currElement);
       }

       //if closest element length = finding element length: replace closest element
       if (closestElement[1] == this._length) {
         this._field.getlinesArr()[closestElement[0]] = new AppendSection( this._field.getField(), this._field, this._length, true, nextElement);
      //if closest element length > finding element length: replace closest element on buttton and free place equal to closest element length - finding element lengt
       } else if (closestElement[1] > this._length) {
         //create button and free place
         let section = new AppendSection( this._field.getField(),this._field, this._length, true, nextElement);
         let freePlace = new FreePlace( this._field, closestElement[0] + 1, closestElement[1] - this._length );
         //end creating button and free place

         //replace free place on button and remaining free place
         this._field.getlinesArr().splice( closestElement[0], 1, section, freePlace );
         freePlace.insertAfter(section.getElement());
         let index = this._field.getfreePlaceArr().indexOf(closestElement);
         this._field.getfreePlaceArr().splice(index, 1, freePlace.getData());
         //else add to end of line
       } else {
         this._field.getlinesArr().push(new AppendSection( this._field.getField(), this._field, this._length ));
       }
      }
      let btnsArr = this._parentElementClass.getBtnsArr();
      btnsArr.splice(btnsArr.indexOf(this), 1);
    }
    //end remove from parent method

    //add click event
    this._element.addEventListener('click', this.removeFromParent);
  };
};


class AppendSection extends Button {
  constructor(parentElement, parentElementClass, length, insertBefore, nextElement) {
    super(parentElement, parentElementClass, length, insertBefore, nextElement);

    //remove from field function
    this.removeFromField = () => {
      let children = this._parentElementClass.getField().children;
      let index = Array.prototype.indexOf.call(children, this._element);

      //create free place
      let freePlace = new FreePlace(this._parentElementClass, index, length);
      freePlace.insertInstead(this._element).addTofreePlaceArr();
      index = this._parentElementClass.getlinesArr().indexOf(this);
      this._parentElementClass.getlinesArr()[index] = freePlace;
      //end create free place

      let arr = [];

      //connect free places to one in lines array
      for (let i = 0; i < this._parentElementClass.getlinesArr().length; i++) {
        let currElement = this._parentElementClass.getlinesArr()[i];
        if (currElement instanceof FreePlace ) {
          while (this._parentElementClass.getlinesArr()[i + 1] instanceof FreePlace) {
            i++;
            let nextElement = this._parentElementClass.getlinesArr()[i];
            currElement.getData()[1] += nextElement.getData()[1];
            this._parentBlock.removeChild(nextElement.getElement());
          }
        }
        arr.push(currElement);
      }
    this._parentElementClass.setLinesArr(arr);
    //end connect free places to one in lines array
    }
    //remove from field function
    this._element.addEventListener('click', this.removeFromField);
  }

  getElement() {
    return this._element;
  }

}


class Field {
  /* parametrs:
      --wrapper: DOM element in wich field will be added
  */
  constructor(wrapper) {
    this._linesArr = [];
    this._freePlaceArr = [];
    this._element = document.createElement('div');
    this._element.classList.add('line_block');
    wrapper.appendChild(this._element);
  }

  removeLine(index) {
    this._linesArr[index] = undefined;
  }

  getfreePlaceArr() {
    return this._freePlaceArr;
  }

  setfreePlaceArr(newArr) {
    this._freePlaceArr = newArr;
    return this;
  }

  getlinesArr() {
    return this._linesArr;
  }

  setLinesArr(newArr) {
    this._linesArr = newArr;
    return this;
  }

  getField() {
    return this._element;
  }
}


class FreePlace {
  /* parametrs:
      --field: field in wich will be added free place
      --index: index of free place
      --length: length of free place
  */
  constructor(field, index, length) {
    this._field = field;
    this._data = [index, length];
    this._element = document.createElement('div');
    this._element.classList.add('free_place');
  }

  removeFromField(field) {
    this._field.getField().removeChild(this._element);
  }

  //method, wich insert free place instead DOM element
  insertInstead(insteadElement) {
    let nextEl = insteadElement.nextElementSibling;
    if (nextEl) {
      this._field.getField().insertBefore(this._element, nextEl);
    } else {
      this._field.getField().insertBefore(this._element, insteadElement);
    }
    this._field.getField().removeChild(insteadElement);
    return this;
  }

  //method, wich insert free place after DOM element
  insertAfter(afterElement) {
    let nextEl = afterElement.nextElementSibling;
    if (nextEl) {
      this._field.getField().insertBefore(this._element, nextEl);
    } else {
      this._field.getField().appendChild(this._element);
    }
    return this;
  }

  getElement() {
    return this._element;
  }

  getData() {
    return this._data;
  }

  setData(data) {
    this._data = data;
  }

  //add to array of free places
  addTofreePlaceArr() {
    //add element to array of free places
    this._field.getfreePlaceArr().push(this._data);
    //sort array by index of free place
    this._field.getfreePlaceArr().sort( (prEl, nextEl) => prEl[0] - nextEl[0] );

    let arr = [];

    //connect free places
    for (let i = 0; i < this._field.getfreePlaceArr().length; i++) {
      let currElement = this._field.getfreePlaceArr()[i];
      let nextElement = this._field.getfreePlaceArr()[i + 1];
      if (nextElement && currElement[0] + 1 == nextElement[0]) {
        let currIndex = currElement[0];
        while (nextElement && nextElement[0] - currIndex == 1) {
          i++;
          currIndex = nextElement[0];
          nextElement = this._field.getfreePlaceArr()[i + 1];
          if (nextElement) {
            currElement[1] += nextElement[1];
          }
        }
      }
      arr.push(currElement);
    }
    //end connect free places

    this._field.setfreePlaceArr(arr);

    //sort array by length value
    this._field.getfreePlaceArr().sort( (prEl, nextEl) => prEl[1] - nextEl[1] );
    return this;
  }
}


class Interface {
  /* parametrs:
      --wrapper: DOM element in wich will be added inteface
      --buttonsBlock: DOM element in wich interface will add buttons
      --filed: DOM element buttons will be added
  */
  constructor(wrapper, buttonsBlock, field) {
    this._parentBlock = wrapper;
    this._field = field;
    this._buttonsBlockCLass = buttonsBlock;

    //create interface div in wich will be added text field, label and button
    this._element = document.createElement('div');
    this._element.classList.add('Interface_block');
    //end create interface div in wich will be added text field, label and button

    //create label
    this._label = document.createElement('label');
    this._label.classList.add('Interface_labeL');
    //end create label

    //create button
    this._button = document.createElement('button');
    this._button.classList.add('Interface_button');
    this._button.innerHTML = 'Add Line';
    //end create button

    //add click event
    this._button.addEventListener('click', () => {

      //if text in field is only numbers button will be created
      if (/^\d+$/g.test(this._textField.value)) {
        this._textField.value;
        this._buttonsBlockCLass.getBtnsArr().push(new Section(
          this._buttonsBlockCLass.getElement(),
          this._buttonsBlockCLass,
          field,
          +this._textField.value
        ));
        this._label.innerHTML = options.addBtnMessage;
        this._textField.classList.remove('not-available');
        this._textField.classList.add('available');
      //else show error
      } else {
        this._label.innerHTML = options.errorAddBtnMessage;
        this._textField.classList.add('not-available');
        this._textField.classList.remove('available');
      }
    });
    //end add click event

    //create text field
    this._textField = document.createElement('input');
    this._textField.setAttribute('type', 'text');
    this._textField.setAttribute('placeholder', 'input number');
    //end create text field

    this._element.appendChild(this._button);
    this._element.appendChild(this._textField);
    this._element.appendChild(this._label);
    this._parentBlock.appendChild(this._element);
  }
}


const FIELD = new Field(FIELD_WRAPPER);
const BUTTONS_BLOCK = new ButtonsBlock(FIELD_WRAPPER, FIELD);
const INTERFACE = new Interface(CONTAINER, BUTTONS_BLOCK, FIELD);
