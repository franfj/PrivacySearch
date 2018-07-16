function getSavedItem(key, callback) {
  chrome.storage.sync.get(key, (items) => {
    callback(chrome.runtime.lastError ? null : items[key]);
  });
}

function saveItem(key, level) {
  var items = {};
  items[key] = level;

  chrome.storage.sync.set(items);
}

document.addEventListener('DOMContentLoaded', () => {
    var dropdown = document.getElementById('dropdown');

    getSavedItem('level', (savedLevel) => {
      if (savedLevel) {
        dropdown.value = savedLevel;
      }

    dropdown.addEventListener('change', () => {
      saveItem('level', dropdown.value);
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
    var dropdown = document.getElementById('dropdown2');

    getSavedItem('engine', (savedEngine) => {
      if (savedEngine) {
        dropdown.value = savedEngine;
      }

    dropdown.addEventListener('change', () => {
      saveItem('engine', dropdown.value);
    });
  });
});