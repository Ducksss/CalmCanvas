// @ts-ignore
import { getRandomId } from './utils.mjs'
// @ts-ignore
import { updateDaysList, renderMenuItemsToDOM } from './menu.mjs'
import { storageIds } from './index.js'

const TRANSITION_DURATION = 250

// Cache root <ul> element.
const root = document.querySelector('.checklist')

const state = {
  items: [],
  originalIndexOfCurrentDraggingElement: null,
  currentDraggingIndex: null,
  // When an element gets clicked and dragged, we'll cache its original position.
  // This will let us know how much to translate each element that it intersects.
  currentDraggedElementCachedPosition: null,
  // Each time an element is intersected, we'll cache its new position, so if the user
  // drops the target, it'll translate to the cached position.
  topOfOpenIndex: null,
  // Prevent double clicks.
  isMouseDown: false,
}

export default function setupChecklist() {
  // 1. Setup
  // Get all list items from localStorage.
  // Defaults to empty array if errored.
  let today
  try {
    const data = localStorage.getItem(storageIds.today)
    if (data === null) {
      today = []
      localStorage.setItem(storageIds.today, '[]')
    } else {
      today = JSON.parse(data)
    }
  } catch (err) {
    today = []
    localStorage.setItem(storageIds.today, '[]')
  }

  renderChecklistItemsToDOM(today, true)

  // Add an event listener to resize textareas on resize.
  window.addEventListener('resize', () => {
    // @ts-ignore
    const textareas = Array.from(root.querySelectorAll('textarea'))
    textareas.forEach((t) => handleResize(t))
  })

  // Poll for updates when user leaves window and comes back.
  setInterval(pollUpdate, 300)
}

export function renderChecklistItemsToDOM(items, initialMount) {
  root.innerHTML = ''
  const markup = items.reduce((acc, curr) => {
    acc.push(getListItemMarkup(curr.id, curr.content, initialMount))
    return acc
  }, [])

  // Shift new editor to end.
  markup.push(getListItemMarkup(null, null, initialMount))
  markup.forEach((m) => root.appendChild(m))

  // Map today values to have a property, isInOriginalPosition, which
  // will let us know how to translate the element.
  // @ts-ignore
  state.items = items.map((t) => ({
    item: t,
    isInOriginalPosition: true,
    el: root.querySelector(`[data-id="${t.id}"]`),
  }))

  // 3. Add event listeners to each textarea and button
  //   3a. calculate height
  //   3b. onblur or enter take value and update localStorage
  //   3c. toggle visibilty back on

  // @ts-ignore
  Array.from(root.querySelectorAll('li')).forEach((i) => {
    const [textarea, checkbox, dragger] = [
      i.querySelector('textarea'),
      i.querySelector('button.checklist-toggler'),
      i.querySelector('button.drag'),
    ]

    addEventListenersToTextarea(textarea)
    if (i.getAttribute('data-id')) {
      addEventListenersToDragger(dragger)
      addEventListenersToCheckbox(checkbox)
    }
  })
}

function handleResize(target) {
  target.style.height = '0'
  target.style.height =
    target.offsetHeight < target.scrollHeight
      ? target.scrollHeight + 'px'
      : 'calc(var(--font-ml) * 1.4)'
}

function getAllElementsAfter(element) {
  const elements = []

  while (element) {
    if (element.nextSibling) {
      elements.push(element.nextSibling)
    }
    element = element.nextSibling
  }

  return elements
}

function addEventListenersToCheckbox(checkbox) {
  function handleToggleCheckbox() {
    // 1. Toggle checkbox class.
    const parentNode = checkbox.parentNode
    parentNode.classList.add('bye-bye')
    // 2. Transform all li elements up after this checkbox.parentNode.
    const amountToTranslate = parentNode.getBoundingClientRect().height
    const elementsToMove = getAllElementsAfter(parentNode)
    elementsToMove.forEach((el) => {
      el.style.transform = `translate3d(0px, ${amountToTranslate * -1}px, 0px)`
      el.style.transition = `transform ${TRANSITION_DURATION}ms var(--ease)`
      el.style.transitionDelay = `${TRANSITION_DURATION}ms`
    })
    // 3. Remove item from state.items to reflect change.
    setTimeout(() => {
      // 3a. Delete from state.
      updateListItems(
        'DELETE',
        ListItem({
          id: parentNode.getAttribute('data-id'),
        })
      )
      // 3b. Remove from DOM.
      root.removeChild(parentNode)

      // Reset translated elements.
      elementsToMove.forEach((el) => el.removeAttribute('style'))
    }, TRANSITION_DURATION * 2)

    // 4. Update localStorage and menu.
    const value = checkbox.parentNode.querySelector('textarea').value
    updateDaysList('ADD', value)
  }

  checkbox.addEventListener('click', handleToggleCheckbox)
}

function addEventListenersToTextarea(textarea) {
  function handleInput(e) {
    handleResize(e.target)
  }

  function handleKeyDown(e) {
    if (e.shiftKey && e.key === 'Enter') return
    // If key is enter, trim the value.
    // If value length is > 0, check if textarea has 'data-id'
    // If data-id exists, update localStorage value for 'today' by updating item of that id.
    // If data-id doesn't exist, update localStorage value for 'today' by pushing to array.
    if (e.key === 'Enter') {
      e.preventDefault()
      const [target, value, dataId] = [
        e.target,
        e.target.value.trim(),
        e.target.parentNode.getAttribute('data-id'),
      ]

      // Add event listeners to checkbox and drag button.
      const checkbox = target.parentNode.querySelector(
        'button.checklist-toggler'
      )
      const dragButton = target.parentNode.querySelector('button.drag')
      addEventListenersToCheckbox(checkbox)
      addEventListenersToDragger(dragButton)

      // Update current textarea value to trimmed value.
      target.value = value
      handleResize(target)

      if (value.length > 0) {
        if (dataId) {
          // If there's a dataId, we need to update the value in localStorage.
          updateListItems(
            'UPDATE',
            ListItem({
              id: dataId,
              content: value,
            })
          )
        } else {
          // If there's no dataId, we need to add the value to localStorage.
          const item = ListItem({
            content: value,
          })

          target.parentElement.setAttribute('data-id', item.id)
          // @ts-ignore

          updateListItems('ADD', item)

          // Add new editor to root.
          addNewEditor()
        }

        // Set focus to last list item's editor.
        root.querySelector('li:last-of-type textarea').focus()
      } else {
        if (dataId) {
          // If there's a dataId, that means it's saved in localStorage.
          // Delete this item from localStorage since it's empty now.
          updateListItems(
            'DELETE',
            ListItem({
              id: dataId,
            })
          )

          removeListItemFromDOM(target.parentElement)
        }
      }
    }
  }

  function removeListItemFromDOM(element) {
    setTimeout(() => {
      if (root.contains(element)) {
        root.removeChild(element)
      }
    }, 0)
  }

  function handleBlur(e) {
    const [value, parentElement, dataId] = [
      e.target.value.trim(),
      e.target.parentElement,
      e.target.parentElement.getAttribute('data-id'),
    ]

    if (value.length === 0 && dataId) {
      updateListItems(
        'DELETE',
        ListItem({
          id: dataId,
        })
      )

      removeListItemFromDOM(parentElement)
    } else {
      updateListItems(
        'UPDATE',
        ListItem({
          id: dataId,
          content: value,
        })
      )
    }
  }

  textarea.addEventListener('input', handleInput)
  textarea.addEventListener('keydown', handleKeyDown)
  textarea.addEventListener('blur', handleBlur)
  // Resize on first call.
  handleResize(textarea)
}

function addEventListenersToDragger(dragger) {
  let currentItem = dragger.parentElement
  let restOfItems = null

  // On mouse down, we'll cache the pointerOffset, so when
  // dragging, we can calculate the dragging from where the
  // mouse was initially clicked.
  const pointerOffset = {
    x: 0,
    y: 0,
  }

  function handleMouseDown(e) {
    if (!state.isMouseDown) {
      state.isMouseDown = true
      // @ts-ignore
      state.currentDraggingIndex = state.items.findIndex(
        (i) => i.item.id === currentItem.getAttribute('data-id')
      )

      state.originalIndexOfCurrentDraggingElement = state.currentDraggingIndex

      const cachedPosition = currentItem.getBoundingClientRect()
      state.currentDraggedElementCachedPosition = {
        height: cachedPosition.height,
        topRelativeToDocument: cachedPosition.top + window.pageYOffset,
        yRelativeToDocument: cachedPosition.y + window.pageYOffset,
      }

      currentItem.classList.add('dragging')
      currentItem.style.transition = `none`

      // @ts-ignore
      restOfItems = Array.from(
        root.querySelectorAll('li[data-id]:not(.dragging)')
      )

      restOfItems.forEach((el) => {
        el.style.opacity = '.25'
        el.style.transition = 'none'
        el.style.animation = ''
        el.style.pointerEvents = 'none'
        el.style.touchAction = 'none'
      })

      pointerOffset.x = e.clientX
      pointerOffset.y = e.clientY

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('click', endDrag)

      // requestAnimationFrame to cache new position and translate elements
      // to updated positions.
      calculateIntersection()
    }
  }

  let intersectionAnimationId = null
  // Flag to check if calculating intersection if rAF loops back before
  // our calculations are finished.
  let isTransitioningIntersection = false
  function calculateIntersection() {
    restOfItems.forEach((el) => {
      if (!isTransitioningIntersection) {
        // Check if current dragged item is intersecting the center of target.
        const {
          top: oTop,
          bottom: oBottom,
          left: oLeft,
          right: oRight,
          height: oHeight,
          width: oWidth,
        } = el.getBoundingClientRect()

        const { top, bottom, left, right } = currentItem.getBoundingClientRect()

        const halfHeight = oHeight / 2

        // Current dragged element is at least 50% overlapping with the target.
        if (
          top <= oBottom - halfHeight &&
          bottom >= oTop + halfHeight &&
          left <= oRight - oWidth / 2 &&
          right >= oLeft + oWidth / 2
        ) {
          // Toggle flag now that we are intersecting.
          isTransitioningIntersection = true

          const dataId = el.getAttribute('data-id')

          // 1. Get the index of the intersecting element.
          // @ts-ignore
          const indexIntersected = state.items.findIndex(
            (i) => i.item.id === dataId
          )
          // 2. Calculate which elements need to move.
          const itemsToShift =
            indexIntersected > state.currentDraggingIndex
              ? state.items.slice(
                  state.currentDraggingIndex + 1,
                  indexIntersected + 1
                )
              : state.items.slice(indexIntersected, state.currentDraggingIndex)

          // 3. Before moving, cache the position of the intersected element.
          const itemIntersectedPosition =
            state.items[indexIntersected].el.getBoundingClientRect()

          const currentOpenIndexCachedPosition = {
            height: itemIntersectedPosition.height,
            yRelativeToScreen: itemIntersectedPosition.y + window.pageYOffset,
            topRelativeToDocument:
              itemIntersectedPosition.top + window.pageYOffset,
          }
          // 3a. Then, calculate the updated top position, relative to the
          //     top of the screen, of the open index.
          const translateDirection =
            indexIntersected > state.currentDraggingIndex ? 'up' : 'down'

          const translateAmt =
            translateDirection === 'up'
              ? state.currentDraggedElementCachedPosition.height * -1
              : state.currentDraggedElementCachedPosition.height

          if (translateDirection === 'down') {
            state.topOfOpenIndex =
              currentOpenIndexCachedPosition.topRelativeToDocument
          } else {
            state.topOfOpenIndex =
              currentOpenIndexCachedPosition.topRelativeToDocument +
              translateAmt +
              currentOpenIndexCachedPosition.height
          }

          itemsToShift.forEach((item) => {
            if (item.isInOriginalPosition) {
              item.isInOriginalPosition = false
              item.el.style.transform = `translate3d(0px, ${translateAmt}px, 0px)`
              item.el.style.transition = `transform ${
                TRANSITION_DURATION / 2
              }ms var(--ease)`
            } else {
              item.isInOriginalPosition = true
              item.el.style.transform = `translate3d(0px, 0px, 0px)`
            }
          })

          // Update list to reflect change after transition is complete.
          setTimeout(() => {
            let copy = state.items.slice()
            copy.splice(state.currentDraggingIndex, 1)

            let start = copy.slice(0, indexIntersected)
            let end = copy.slice(indexIntersected)

            state.items = [
              ...start,
              state.items[state.currentDraggingIndex],
              ...end,
            ]

            state.currentDraggingIndex = indexIntersected

            isTransitioningIntersection = false
          }, TRANSITION_DURATION / 2)
        }
      }
    })
    intersectionAnimationId = requestAnimationFrame(calculateIntersection)
  }

  // 1. Moves the dragged item around
  // 2. Scrolls window up/down based on the position on the dragged item.
  let isScrolling = false
  let scrollAnimationId = null
  let translateOffsetAmount = 0
  function handleMouseMove(e) {
    const translate = {
      x: e.clientX - pointerOffset.x,
      y: e.clientY - pointerOffset.y,
    }

    if (!isScrolling) {
      currentItem.style.transform = `translate3d(${translate.x}px, ${
        translate.y + translateOffsetAmount
      }px, 0px)`
    }
    currentItem.style.transition = 'none'
    currentItem.style.zIndex = 2

    // Scroll window up/down based on position of dragged item.
    const shouldScrollUp = e.clientY < 100
    const shouldScrollDown = e.clientY > innerHeight - 100

    const isAtTopOfPage = () => window.pageYOffset <= 0
    const isAtBottomOfPage = () =>
      window.innerHeight + window.scrollY >= document.body.offsetHeight

    if (shouldScrollUp && !isAtTopOfPage()) {
      scroll(-1)
    }
    if (shouldScrollDown && !isAtBottomOfPage()) {
      scroll(1)
    }
    if (isScrolling && !shouldScrollUp && !shouldScrollDown) {
      stopScroll()
    }

    function scroll(direction) {
      isScrolling = true

      cancelAnimationFrame(scrollAnimationId)

      // If we hit the top or bottom of the page, stop scrolling.
      if (
        (window.pageYOffset <= 0 && direction === -1) ||
        (window.innerHeight + window.scrollY >= document.body.offsetHeight &&
          direction === 1)
      ) {
        stopScroll()
        return
      }

      translateOffsetAmount += direction * 10

      window.scrollTo({
        top: window.pageYOffset + direction * 10,
      })

      currentItem.style.transform = `translate3d(${translate.x}px, ${
        translate.y + translateOffsetAmount
      }px, 0px)`

      scrollAnimationId = requestAnimationFrame(() => scroll(direction))
    }

    function stopScroll() {
      isScrolling = false
      cancelAnimationFrame(scrollAnimationId)
    }
  }

  function endDrag() {
    // Translate dragged item to new cached position.
    // newTop = currentOpenIndex.top - heightOfDraggedElemnet + currentDraggedIndex.height

    let translateY = 0

    if (state.topOfOpenIndex !== null) {
      translateY =
        state.topOfOpenIndex -
        state.currentDraggedElementCachedPosition.topRelativeToDocument
    }

    currentItem.style.transform = `translate3d(0px, ${translateY}px, 0px)`
    currentItem.style.transition = `transform ${TRANSITION_DURATION}ms var(--ease)`

    restOfItems.forEach((el) => {
      el.style.opacity = '1'
      el.style.transition = 'none'
      el.style.animation = ''
      el.style.pointerEvents = 'initial'
      el.style.touchAction = 'initial'
    })

    window.removeEventListener('click', endDrag)
    window.removeEventListener('mousemove', handleMouseMove)
    // Cleanup - clear rAF animations
    // Set translateOffset back to 0 since scroll is over.
    cancelAnimationFrame(scrollAnimationId)
    translateOffsetAmount = 0
    cancelAnimationFrame(intersectionAnimationId)
    state.currentDraggedElementCachedPosition = null
    state.topOfOpenIndex = null

    setTimeout(() => {
      state.isMouseDown = false
      currentItem.removeAttribute('class')
      currentItem.style.zIndex = 'initial'
      currentItem.style.transition = `all ${TRANSITION_DURATION}ms var(--ease)`
      // Render updated list into DOM
      const allElements = root.querySelectorAll('li[data-id]')

      const elementToMove =
        allElements[state.originalIndexOfCurrentDraggingElement]

      const elementToInsertBefore =
        state.originalIndexOfCurrentDraggingElement < state.currentDraggingIndex
          ? allElements[state.currentDraggingIndex + 1]
          : allElements[state.currentDraggingIndex]

      elementToMove.parentNode.insertBefore(
        elementToMove,
        elementToInsertBefore === undefined
          ? allElements[state.currentDraggingIndex].nextSibling
          : elementToInsertBefore
      )

      // Reset state.items array so all items are now in their updated positions.
      state.items.forEach((i) => {
        i.isInOriginalPosition = true
        i.el.removeAttribute('style')
      })

      updateListItems('REORDER', state.items)
    }, TRANSITION_DURATION)
  }

  dragger.addEventListener('mousedown', handleMouseDown)
}

function addNewEditor() {
  const node = getListItemMarkup(null, null, null)
  root.appendChild(node)

  const textarea = node.querySelector('textarea')

  addEventListenersToTextarea(textarea)
  textarea.focus()
}

// isInitialMount will add an animation delay.
function getListItemMarkup(id, value, isInitialMount) {
  const li = document.createElement('li')
  li.innerHTML = `
      <button class="checklist-toggler">
        <span>Toggle item</span>
      </button>
      <textarea
        class="checklist-item"
        placeholder="What to do today?"
        spellcheck="false"
      >${value ? value : ''}</textarea>
      <button class="drag">
        <span>Drag to reorder</span> 
      </button>
  `

  if (id) {
    li.setAttribute('data-id', id)
  }

  if (isInitialMount) {
    li.style.opacity = '0'
    li.style.animation = 'fadeIn 250ms var(--ease)'
    li.style.animationDelay = '1000ms'
    li.style.animationFillMode = 'forwards'
  }

  return li
}

function ListItem({ id = getRandomId(), content = '' }) {
  return {
    id,
    content,
  }
}

function updateListItems(action, value) {
  let items = JSON.parse(localStorage.getItem(storageIds.today))
  let shouldUpdate = true

  switch (action) {
    case 'DELETE':
      items = items.filter((i) => i.id !== value.id)
      updateStateItems(items)
      break
    case 'UPDATE':
      items = items.map((i) => {
        if (value.id === null) {
          shouldUpdate = false
        }
        if (i.id === value.id) {
          // If content is the same, no need to update.
          if (i.content === value.content || i.content.length === 0) {
            shouldUpdate = false
          }
          i = value
        }
        return i
      })
      updateStateItems(items)
      break
    case 'ADD':
      items.push(value)
      break
    case 'REORDER':
      items = value.map((i) => i.item)
      updateStateItems(items)
      break
  }

  function updateStateItems(items) {
    state.items = items.map((i) => ({
      item: i,
      isInOriginalPosition: true,
      el: root.querySelector(`[data-id="${i.id}"]`),
    }))
  }

  if (shouldUpdate) {
    saveToLocalStorage(storageIds.today, JSON.stringify(items))
  }
}

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, value)
}

let shouldPollForUpdate = false
function pollUpdate() {
  if (shouldPollForUpdate && document.hasFocus()) {
    const items = JSON.parse(localStorage.getItem(storageIds.today))

    if (
      JSON.stringify(items) !== JSON.stringify(state.items.map((i) => i.item))
    ) {
      renderChecklistItemsToDOM(items, false)
      renderMenuItemsToDOM(true)
    }
    shouldPollForUpdate = false
    state.isMouseDown = false
  } else if (!document.hasFocus()) {
    if (!shouldPollForUpdate) {
      shouldPollForUpdate = true
      // This will prevent any clicks from happening before the list is updated
      // in the DOM. For example:
      // 1. A visitor focuses the browser's search bar while in current tab.
      // 2. Then opens a new tab and edits the list.
      // 3. Then tabs back to the previous tab and tries to immediately drag an item.
      //    We prevent that from happening because the document isn't in focus, so the
      //    list still hasn't updated. So when they click on a list item, we'll rerender
      //    the new list, then enable dragging again.
      state.isMouseDown = true
    }
  }
}
