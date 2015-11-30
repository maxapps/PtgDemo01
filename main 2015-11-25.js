var page = tabris.create("Page", {
  title: "Hello, Jeff!",
  topLevel: true
});

var button = tabris.create("Button", {
  text: "Try This",
  layoutData: {centerX: 0, top: 100}
}).appendTo(page);

var label = tabris.create("TextView", {
  font: "24px",
  layoutData: {centerX: 0, top: [button, 50]}
}).appendTo(page);

button.on("select", function() {
  label.set("text", "Totally Rock!");
});

page.open();
