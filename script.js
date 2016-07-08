(function(){
  var searchInput = document.getElementById("search"),
      listElement = document.getElementById("wordlist"),

      additionalWords = 8; // Number of additional wards to display in list

  searchInput.addEventListener("keyup", generateListFromSearchBox);
  searchInput.addEventListener("change", generateListFromSearchBox);

  function generateListFromSearchBox() {
    var searchterm = searchInput.value,
        list,
        id;

    if(!searchterm) return;

    try{
      id = bigInt(searchterm);
    }
    catch (e){
      searchterm = searchterm.replace(/ .*/, "");

      id = findWordID(searchterm);
    }

    list = generateList(id);

    renderList(list);
  }

  function generateList(id) {
    var startId = id.subtract(additionalWords / 2),
        i = 0,
        count = additionalWords + 1,
        output = [],
        word;
    for(;i<count;i++){
      word = getWord(startId.add(i));
      if(word.id.eq(id)){
        word.selected = true;
      }
      output.push(word);
    }
    return output;
  }

  function findWordID(text) {
    var byteArray = toUTF8Array(text),
        number = byteArrayToNumber(byteArray);
    return number;
  }

  function getWord(id) {
    var byteArray = bigIntToByteArray(id),
        text = Utf8ArrayToStr(byteArray);
    return {
      id: bigInt(id),
      text: text
    }
  }

  function renderList(list) {
    listElement.innerHTML = list.map(formatListItem).join("");
  }

  function formatListItem(word) {
    var selectedClass = word.selected ? ' class="selected"' : '';
    return "<li"+selectedClass+">Word "+String(word.id)+": "+word.text;
  }

  function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
      var charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6),
                  0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12),
                  0x80 | ((charcode>>6) & 0x3f),
                  0x80 | (charcode & 0x3f));
      }
      // surrogate pair
      else {
        i++;
        // UTF-16 encodes 0x10000-0x10FFFF by
        // subtracting 0x10000 and splitting the
        // 20 bits of 0x0-0xFFFFF into two halves
        charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                  | (str.charCodeAt(i) & 0x3ff));
        utf8.push(0xf0 | (charcode >>18),
                  0x80 | ((charcode>>12) & 0x3f),
                  0x80 | ((charcode>>6) & 0x3f),
                  0x80 | (charcode & 0x3f));
      }
    }
    return utf8;
  }

  function byteArrayToNumber(array) {
    var i = 0,
        length = array.length,
        result = bigInt();
    for(;i<length;i++){
      result = result.multiply(256).add(array[i]);
    }
    return result;
  }

  function bigIntToByteArray(id) {
    var out = [];
    while(id.gt(0)){
      out.push(+id.and(0xff));
      id = id.divide(256);
    }
    return out.reverse();
  }

  function Utf8ArrayToStr(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
      c = array[i++];
      switch(c >> 4)
      {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += String.fromCharCode(c);
          break;
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = array[i++];
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = array[i++];
          char3 = array[i++];
          out += String.fromCharCode(((c & 0x0F) << 12) |
                         ((char2 & 0x3F) << 6) |
                         ((char3 & 0x3F) << 0));
          break;
      }
    }

    return out;
  }
}());
