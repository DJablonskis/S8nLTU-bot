function notifyMe(title, action, village) {
  var notification = new Notification(title, {
    body: `${action.name} was upgraded to level ${action.stufe} in "${village.name}"`,
    icon: "https://gpack.travian.com/20b0b1f1/mainPage/img_ltr/g/upgradeView2019/buildingIllustrations/teuton/g15.png",
    image:
      "https://cdnb.artstation.com/p/assets/images/images/006/367/267/large/ahmed-hmaim-final-c2.jpg?1498055051",
  });
  notification.onclick = function () {
    if (parent) parent.focus();
  };
}
