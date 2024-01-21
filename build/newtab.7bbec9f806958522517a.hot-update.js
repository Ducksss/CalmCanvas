"use strict";
self["webpackHotUpdatechrome_extension_boilerplate_react"]("newtab",{

/***/ "./src/pages/Newtab/Newtab.jsx":
/*!*************************************!*\
  !*** ./src/pages/Newtab/Newtab.jsx ***!
  \*************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Newtab_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Newtab.css */ "./src/pages/Newtab/Newtab.css");
/* harmony import */ var _Newtab_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Newtab.scss */ "./src/pages/Newtab/Newtab.scss");
/* provided dependency */ var __react_refresh_utils__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/lib/runtime/RefreshUtils.js");
/* provided dependency */ var __react_refresh_error_overlay__ = __webpack_require__(/*! ./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js */ "./node_modules/@pmmmwh/react-refresh-webpack-plugin/overlay/index.js");
__webpack_require__.$Refresh$.runtime = __webpack_require__(/*! ./node_modules/react-refresh/runtime.js */ "./node_modules/react-refresh/runtime.js");

var _s = __webpack_require__.$Refresh$.signature();



function TodoList() {
  _s();
  const [tasks, setTasks] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([{
    id: 1,
    text: 'Doctor Appointment',
    completed: true
  }, {
    id: 2,
    text: 'Meeting at School',
    completed: false
  }]);
  const [text, setText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  function addTask(text) {
    const newTask = {
      id: Date.now(),
      text,
      completed: false
    };
    setTasks([...tasks, newTask]);
    setText('');
  }
  function deleteTask(id) {
    setTasks(tasks.filter(task => task.id !== id));
  }
  function toggleCompleted(id) {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed
        };
      } else {
        return task;
      }
    }));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "todo-list"
  }, tasks.map(task => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(TodoItem, {
    key: task.id,
    task: task,
    deleteTask: deleteTask,
    toggleCompleted: toggleCompleted
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    value: text,
    onChange: e => setText(e.target.value)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: () => addTask(text)
  }, "Add"));
}
_s(TodoList, "s3OsnxOROWKOXeweTmvnShiYCRM=");
_c = TodoList;
function TodoItem({
  task,
  deleteTask,
  toggleCompleted
}) {
  function handleChange() {
    toggleCompleted(task.id);
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "todo-item"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("input", {
    type: "checkbox",
    checked: task.completed,
    onChange: handleChange
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, task.text), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    onClick: () => deleteTask(task.id)
  }, "X"));
}
_c2 = TodoItem;
const Newtab = () => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "App"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("header", {
    className: "App-header"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(TodoList, null)));
};
_c3 = Newtab;
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Newtab);
var _c, _c2, _c3;
__webpack_require__.$Refresh$.register(_c, "TodoList");
__webpack_require__.$Refresh$.register(_c2, "TodoItem");
__webpack_require__.$Refresh$.register(_c3, "Newtab");

const $ReactRefreshModuleId$ = __webpack_require__.$Refresh$.moduleId;
const $ReactRefreshCurrentExports$ = __react_refresh_utils__.getModuleExports(
	$ReactRefreshModuleId$
);

function $ReactRefreshModuleRuntime$(exports) {
	if (true) {
		let errorOverlay;
		if (typeof __react_refresh_error_overlay__ !== 'undefined') {
			errorOverlay = __react_refresh_error_overlay__;
		}
		let testMode;
		if (typeof __react_refresh_test__ !== 'undefined') {
			testMode = __react_refresh_test__;
		}
		return __react_refresh_utils__.executeRuntime(
			exports,
			$ReactRefreshModuleId$,
			module.hot,
			errorOverlay,
			testMode
		);
	}
}

if (typeof Promise !== 'undefined' && $ReactRefreshCurrentExports$ instanceof Promise) {
	$ReactRefreshCurrentExports$.then($ReactRefreshModuleRuntime$);
} else {
	$ReactRefreshModuleRuntime$($ReactRefreshCurrentExports$);
}

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("121474d9fac97cff42fc")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=newtab.7bbec9f806958522517a.hot-update.js.map