const initNotifications = () => {
  let on = false;
  const setting = localStorage.getItem(BOT_NOTIFICATIONS);
  if (setting) on = setting === ON;

  const save = () => localStorage.setItem(BOT_NOTIFICATIONS, on ? ON : OFF);

  const toggle = () => {
    if (Notification.permission === "denied") {
      alert(
        "Notification permission was previously denied. Please enable notifications manualy in your browser if you want to use it."
      );
      on = false;
    } else if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          on = !on;
        } else {
          alert(
            "Notification permission was denied. Please enable notifications manualy in your browser if you want to use it."
          );
          on = false;
        }
      });
    } else if (Notification.permission === "granted") {
      on = !on;
    }
    save();
    return on;
  };

  function send(con, village) {
    if (on) {
      new Notification(`${BDB.data(con.gid).name} lvl${con.lvl} completed`, {
        body: `${BDB.data(con.gid).name} was upgraded to level ${
          con.lvl
        } in village ${village.name}`,
        icon: "https://emoji.gg/assets/emoji/5163-95-crythumbsup.png",
      });
    }
  }

  return { toggle, send, on };
};
let Notifications;
if (ShouldRun) Notifications = initNotifications();

//Notifications.send({gid:4, lvl: 12}, {name: "hello world"})
