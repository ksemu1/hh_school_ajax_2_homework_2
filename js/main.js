const source = document.querySelector('.drag-source');
const gridContainer = document.getElementById('gridContainer');
const freeContainer = document.getElementById('freeContainer');

let draggedElement = null;
let clone = null;
let offsetX = 0, offsetY = 0;
let isDragging = false;

function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function createDraggableItem(x = null, y = null, inGrid = false) {
  const div = document.createElement('div');
  div.className = 'drag-item';
  div.style.backgroundColor = randomColor();
  div.style.width = '100px';
  div.style.height = '100px';
  div.setAttribute('data-x', x !== null ? x : 0);
  div.setAttribute('data-y', y !== null ? y : 0);
  
  if (!inGrid && x !== null && y !== null) {
    div.style.position = 'absolute';
    div.style.left = x + 'px';
    div.style.top = y + 'px';
  }

  makeDraggable(div);
  return div;
}

function makeDraggable(elem) {
  elem.addEventListener('mousedown', startDrag);
  elem.addEventListener('touchstart', startDrag, { passive: false });
}

function startDrag(e) {
  e.preventDefault();
  if (draggedElement) return;

  let target = e.target.closest('.drag-item');
  if (!target) return;
  
  draggedElement = target;
  isDragging = true;

  clone = draggedElement.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.width = '100px';
  clone.style.height = '100px';
  clone.style.opacity = '0.8';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = '9999';
  document.body.appendChild(clone);

  draggedElement.style.opacity = '0.4';

  const rect = draggedElement.getBoundingClientRect();
  const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  updateClonePosition(clientX, clientY);

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchmove', onMouseMove, { passive: false });
  window.addEventListener('touchend', onMouseUp);
}

function updateClonePosition(clientX, clientY) {
  if (!clone) return;
  clone.style.left = (clientX - offsetX) + 'px';
  clone.style.top = (clientY - offsetY) + 'px';
}

function onMouseMove(e) {
  if (!isDragging || !clone) return;
  e.preventDefault();
  const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);
  updateClonePosition(clientX, clientY);
}

function onMouseUp(e) {
  if (!isDragging || !draggedElement) {
    cleanDrag();
    return;
  }
  
  const clientX = e.clientX ?? (e.changedTouches ? e.changedTouches[0].clientX : 0);
  const clientY = e.clientY ?? (e.changedTouches ? e.changedTouches[0].clientY : 0);

  const elemUnderCursor = document.elementsFromPoint(clientX, clientY)[0];
  const gridZone = elemUnderCursor.closest('#gridContainer');
  const freeZone = elemUnderCursor.closest('#freeContainer');

  
  if (gridZone) {
    if (draggedElement.parentElement === gridContainer) {
    } else {
      draggedElement.remove();
      draggedElement.style.position = '';
      draggedElement.style.left = '';
      draggedElement.style.top = '';
      gridContainer.appendChild(draggedElement);
    }
    draggedElement.style.opacity = '1';
    
  } else if (freeZone) {
    const rectZone = freeContainer.getBoundingClientRect();
    let newLeft = clientX - offsetX - rectZone.left;
    let newTop = clientY - offsetY - rectZone.top;
    
    newLeft = Math.max(0, Math.min(newLeft, rectZone.width - 100));
    newTop = Math.max(0, Math.min(newTop, rectZone.height - 100));
    
    if (draggedElement.parentElement !== freeContainer) {
      draggedElement.remove();
      draggedElement.style.position = 'absolute';
      draggedElement.style.left = newLeft + 'px';
      draggedElement.style.top = newTop + 'px';
      freeContainer.appendChild(draggedElement);
    } else {
      draggedElement.style.left = newLeft + 'px';
      draggedElement.style.top = newTop + 'px';
    }
    draggedElement.style.opacity = '1';
    
  } else {
    draggedElement.remove();
  }
  cleanDrag();
}

function cleanDrag() {
  if (clone) {
    clone.remove();
    clone = null;
  }
  if (draggedElement) {
    if (draggedElement.parentElement) {
      draggedElement.style.opacity = '1';
    }
    draggedElement = null;
  }
  isDragging = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('touchmove', onMouseMove);
  window.removeEventListener('touchend', onMouseUp);
}

source.addEventListener('mousedown', (e) => {
  e.preventDefault();
  
  const newItem = createDraggableItem(0, 0, false);
  makeDraggable(newItem);
  draggedElement = newItem;
  isDragging = true;

  clone = newItem.cloneNode(true);
  clone.style.position = 'fixed';
  clone.style.width = '100px';
  clone.style.height = '100px';
  clone.style.opacity = '0.8';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = '9999';
  document.body.appendChild(clone);
  
  const rect = source.getBoundingClientRect();
  offsetX = 50; // центр квадрата
  offsetY = 50;
  updateClonePosition(rect.left + 50, rect.top + 50);
  
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('touchmove', onMouseMove, { passive: false });
  window.addEventListener('touchend', onMouseUp);
});

source.addEventListener('touchstart', (e) => {
  e.preventDefault();
  // аналогично mousedown, но создаём событие
  const fakeEvent = { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
  source.dispatchEvent(new MouseEvent('mousedown', fakeEvent));
});
