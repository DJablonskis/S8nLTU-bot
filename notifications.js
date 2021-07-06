function notifyMe(title, con, village) {
  var notification = new Notification(
    `${BDB.data(con.gid).name} lvl${con.lvl} completed`,
    {
      body: `${BDB.data(con.gid).name} was upgraded to level ${
        con.lvl
      } in village ${village.name}`,
      icon: "https://emoji.gg/assets/emoji/5163-95-crythumbsup.png",
    }
  );
  notification.onclick = function () {
    if (parent) parent.focus();
  };
}
