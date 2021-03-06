"use strict"

var o = require("../ospec/ospec")
var browserMock = require("../test-utils/browserMock")
var components = require("../test-utils/components")

o.spec("api", function() {
	var m
	var FRAME_BUDGET = Math.floor(1000 / 60)
	o.beforeEach(function() {
		var mock = browserMock()
		if (typeof global !== "undefined") global.window = mock
		m = require("../mithril") // eslint-disable-line global-require
	})

	o.spec("m", function() {
		o("works", function() {
			var vnode = m("div")

			o(vnode.tag).equals("div")
		})
	})
	o.spec("m.version", function() {
		o("works", function() {
			o(typeof m.version).equals("string")
			o(m.version.indexOf(".") > -1).equals(true)
			o(/\d/.test(m.version)).equals(true)
		})
	})
	o.spec("m.trust", function() {
		o("works", function() {
			var vnode = m.trust("<br>")

			o(vnode.tag).equals("<")
			o(vnode.children).equals("<br>")
		})
	})
	o.spec("m.fragment", function() {
		o("works", function() {
			var vnode = m.fragment({key: 123}, [m("div")])

			o(vnode.tag).equals("[")
			o(vnode.key).equals(123)
			o(vnode.children.length).equals(1)
			o(vnode.children[0].tag).equals("div")
		})
	})
	o.spec("m.withAttr", function() {
		o("works", function() {
			var spy = o.spy()
			var handler = m.withAttr("value", spy)

			handler({currentTarget: {value: 10}})

			o(spy.args[0]).equals(10)
		})
	})
	o.spec("m.parseQueryString", function() {
		o("works", function() {
			var query = m.parseQueryString("?a=1&b=2")

			o(query).deepEquals({a: "1", b: "2"})
		})
	})
	o.spec("m.buildQueryString", function() {
		o("works", function() {
			var query = m.buildQueryString({a: 1, b: 2})

			o(query).equals("a=1&b=2")
		})
	})
	o.spec("m.request", function() {
		o("works", function() {
			o(typeof m.request).equals("function") // TODO improve
		})
	})
	o.spec("m.jsonp", function() {
		o("works", function() {
			o(typeof m.jsonp).equals("function") // TODO improve
		})
	})
	o.spec("m.render", function() {
		o("works", function() {
			var root = window.document.createElement("div")
			m.render(root, m("div"))

			o(root.childNodes.length).equals(1)
			o(root.firstChild.nodeName).equals("DIV")
		})
	})
	components.forEach(function(cmp){
		o.spec(cmp.kind, function(){
			var createComponent = cmp.create

			o.spec("m.mount", function() {
				o("works", function() {
					var root = window.document.createElement("div")
					m.mount(root, createComponent({view: function() {return m("div")}}))

					o(root.childNodes.length).equals(1)
					o(root.firstChild.nodeName).equals("DIV")
				})
			})
			o.spec("m.route", function() {
				o("works", function(done) {
					var root = window.document.createElement("div")
					m.route(root, "/a", {
						"/a": createComponent({view: function() {return m("div")}})
					})

					setTimeout(function() {
						o(root.childNodes.length).equals(1)
						o(root.firstChild.nodeName).equals("DIV")

						done()
					}, FRAME_BUDGET)
				})
				o("m.route.prefix", function(done) {
					var root = window.document.createElement("div")
					m.route.prefix("#")
					m.route(root, "/a", {
						"/a": createComponent({view: function() {return m("div")}})
					})

					setTimeout(function() {
						o(root.childNodes.length).equals(1)
						o(root.firstChild.nodeName).equals("DIV")

						done()
					}, FRAME_BUDGET)
				})
				o("m.route.get", function(done) {
					var root = window.document.createElement("div")
					m.route(root, "/a", {
						"/a": createComponent({view: function() {return m("div")}})
					})

					setTimeout(function() {
						o(m.route.get()).equals("/a")

						done()
					}, FRAME_BUDGET)
				})
				o("m.route.set", function(done, timeout) {
					timeout(100)
					var root = window.document.createElement("div")
					m.route(root, "/a", {
						"/:id": createComponent({view: function() {return m("div")}})
					})

					setTimeout(function() {
						m.route.set("/b")
						setTimeout(function() {
							o(m.route.get()).equals("/b")

							done()
						}, FRAME_BUDGET)
					}, FRAME_BUDGET)
				})
			})
			o.spec("m.redraw", function() {
				o("works", function(done) {
					var count = 0
					var root = window.document.createElement("div")
					m.mount(root, createComponent({view: function() {count++}}))
					o(count).equals(1)
					m.redraw()
					o(count).equals(1)
					setTimeout(function() {

						o(count).equals(2)

						done()
					}, FRAME_BUDGET)
				})
				o("sync", function() {
					var root = window.document.createElement("div")
					var view = o.spy()
					m.mount(root, createComponent({view: view}))
					o(view.callCount).equals(1)
					m.redraw.sync()
					o(view.callCount).equals(2)
				})
			})
		})
	})
})
