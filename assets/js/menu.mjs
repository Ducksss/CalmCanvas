const menuRoot = document.querySelector('div.menu-container')
const menuToggler = document.querySelector('button.menu-toggle')
const main = document.querySelector('main')

const state = {
  days: [],
  isMenuOpen: false,
  howManyDaysToShow: 7,
}

/*
 * [
 *   {
 *     id: '05/29/2019',
 *     list: [
 *       'hi',
 *       'friends',
 *       'what am i doing w my life?'
 *     ]
 *    }
 * ]
 *
 */

export default function setupMenu() {
  // Add event listener to menuToggler.
  menuToggler.addEventListener('click', handleToggleMenu)

  renderMenuItemsToDOM(false)
}

function scrollMenuDown() {
  const menu = menuRoot.querySelector('ul.menu')
  menu.scrollTop = menu.scrollHeight
}

export function renderMenuItemsToDOM(shouldRerenderAllChildren) {
  try {
    const data = localStorage.getItem('all_days')
    if (data === null) {
      state.days = []
      localStorage.setItem('all_days', '[]')
    } else {
      state.days = JSON.parse(data).map(day => ({
        id: day.id,
        items: day.items,
      }))
    }
  } catch (err) {
    state.days = []
    localStorage.setItem('all_days', '[]')
  }

  // Render the latest 5 days into ul.menu
  const menu = menuRoot.querySelector('ul.menu')
  const items = state.days.slice(state.howManyDaysToShow * -1)

  if (shouldRerenderAllChildren) {
    menu.innerHTML = ''
  }

  const markup = items.map(i => getItemMarkup(i)).reverse()

  if (items.length) {
    markup.forEach(m => menu.prepend(m))
  } else {
    let li = document.createElement('li')
    li.innerHTML = `
      Check off completed tasks as you finish them. Your record will be shown here by each date.
    `
    menu.appendChild(li)
  }

  scrollMenuDown()
}

// Updates state.days to reflect checkbox clicks, and updates localStorage
// to reflect the change.
export function updateDaysList(actionType, payload) {
  const now = new Date().toLocaleDateString()

  // Update state.days.
  const currentDay = state.days[state.days.length - 1]
  switch (actionType) {
    case 'ADD': {
      if (currentDay === undefined || currentDay.id !== now) {
        state.days.push({
          id: now,
          items: [payload],
        })

        const menu = menuRoot.querySelector('.menu')
        if (currentDay === undefined) {
          // If currentDay === undefined, this means we have no days.
          // This will remove the placeholder text.
          menu.innerHTML = ''
        }
        // Append new date to DOM.
        menu.appendChild(
          getItemMarkup({
            id: now,
            items: [payload],
          })
        )
      } else if (currentDay.id === now) {
        state.days[state.days.length - 1].items.push(payload)
        // Append new value to latest date.
        const lastElement = menuRoot.querySelector('.menu-day:last-of-type ul')
        const li = document.createElement('li')
        li.innerText = payload
        lastElement.appendChild(li)
      }

      scrollMenuDown()
      break
    }
    default:
      throw new Error(`No actionType of ${actionType} found.`)
  }

  localStorage.setItem(
    'all_days',
    // Only save the previous (state.howManyDaysToShow) number of days.
    JSON.stringify(state.days.slice(state.howManyDaysToShow * -1))
  )
}
