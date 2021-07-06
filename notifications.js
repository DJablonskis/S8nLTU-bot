function notifyMe(title, con, village) {
  var notification = new Notification(title, {
    body: `${BDB.data(con.gid).name} was upgraded to level ${con.lvl} in "${
      village.name
    }"`,
    icon: "http://tinygraphs.com/labs/isogrids/hexa16/S8nLtu?theme=heatwave&numcolors=4&size=220&fmt=svg",
    image:
      "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
  });
  notification.onclick = function () {
    if (parent) parent.focus();
  };
}
